import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

function readEnv(name: string): string | undefined {
  const denoEnv = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env;
  const fromDeno = denoEnv?.get(name);
  if (fromDeno) return fromDeno;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

export function newRequestId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now().toString(36)}_${rand}`;
}

/**
 * Map an internal error code to a safe, user-visible message + retryable flag.
 * Never leak SQL details, stack traces, tokens, or user identifiers.
 */
const ERROR_META: Record<string, { message: string; retryable: boolean }> = {
  unauthenticated: { message: "Sign in required.", retryable: false },
  forbidden: { message: "You are not allowed to perform this action.", retryable: false },
  no_user_id: { message: "Sign in required.", retryable: false },
  config_missing: { message: "Service is temporarily unavailable.", retryable: true },
  auth_missing_token: { message: "Sign in required.", retryable: false },
  invalid_input: { message: "The input was invalid.", retryable: false },
  not_found: { message: "That item was not found.", retryable: false },
  db_read_failed: { message: "Could not read your data right now.", retryable: true },
  db_write_failed: { message: "Could not save your change right now.", retryable: true },
  rls_denied: { message: "You do not have access to this data.", retryable: false },
  rate_limited: { message: "You are doing that too often. Try again shortly.", retryable: true },
  handler_exception: { message: "Something went wrong. Please try again.", retryable: true },
};

export function errorResult(
  tool: string,
  requestId: string,
  code: string,
  logMessage: string,
  detail?: unknown,
) {
  const meta = ERROR_META[code] ?? { message: "Something went wrong.", retryable: true };
  const payload = {
    error: {
      code,
      message: meta.message,
      retryable: meta.retryable,
      request_id: requestId,
    },
  };
  // Server-side log — safe fields only. `logMessage`/`detail` may contain
  // technical text but never tokens or PII (the callers below only pass
  // Postgres error metadata + operation names).
  console.error(
    `[mcp:${tool}] code=${code} request_id=${requestId} msg=${logMessage}`,
    detail ?? "",
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError: true,
  };
}

export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  const url = readEnv("SUPABASE_URL");
  const key = readEnv("SUPABASE_PUBLISHABLE_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("mcp_config_missing");
  }
  const token = ctx.getToken();
  if (!token) {
    throw new Error("mcp_auth_missing_token");
  }
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Handler<I> = (input: I, ctx: ToolContext, meta: { requestId: string; supabase: SupabaseClient; userId: string }) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}>;

export function withAuthAndTrace<I>(tool: string, run: Handler<I>) {
  return async (input: I, ctx: ToolContext) => {
    const requestId = newRequestId();
    const started = Date.now();
    const authed = ctx.isAuthenticated();
    const userId = authed ? ctx.getUserId() : null;
    // Log auth + user resolution (no token, no email).
    console.log(
      `[mcp:${tool}] start request_id=${requestId} authed=${authed} user_resolved=${userId ? "yes" : "no"}`,
    );
    try {
      if (!authed) {
        return errorResult(tool, requestId, "unauthenticated", "no verified oauth token");
      }
      if (!userId) {
        return errorResult(tool, requestId, "no_user_id", "sub claim missing");
      }
      const supabase = supabaseForUser(ctx);
      const result = await run(input, ctx, { requestId, supabase, userId });
      console.log(
        `[mcp:${tool}] end request_id=${requestId} ok=${!result.isError} duration_ms=${Date.now() - started}`,
      );
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const code =
        message === "mcp_config_missing"
          ? "config_missing"
          : message === "mcp_auth_missing_token"
            ? "auth_missing_token"
            : "handler_exception";
      console.error(
        `[mcp:${tool}] exception request_id=${requestId} duration_ms=${Date.now() - started} code=${code}`,
      );
      return errorResult(tool, requestId, code, message);
    }
  };
}

export function dbError(
  tool: string,
  requestId: string,
  op: "read" | "write",
  error: { message: string; code?: string; details?: string | null; hint?: string | null },
) {
  // Detect Postgres RLS denials — 42501 = insufficient_privilege.
  const isRls = error.code === "42501";
  const code = isRls ? "rls_denied" : op === "write" ? "db_write_failed" : "db_read_failed";
  return errorResult(tool, requestId, code, `pg_code=${error.code ?? "?"} op=${op}`, {
    pg_code: error.code ?? null,
  });
}

/** Explicit whitelist — pick only the fields you want to expose. */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  row: T | null | undefined,
  keys: readonly K[],
): Pick<T, K> | null {
  if (!row) return null;
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = row[k];
  return out;
}

export function pickMany<T extends Record<string, unknown>, K extends keyof T>(
  rows: T[] | null | undefined,
  keys: readonly K[],
): Pick<T, K>[] {
  if (!rows) return [];
  return rows.map((r) => pick(r, keys) as Pick<T, K>);
}