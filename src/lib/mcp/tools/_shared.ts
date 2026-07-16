import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

function readEnv(name: string): string | undefined {
  const denoEnv = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env;
  const fromDeno = denoEnv?.get(name);
  if (fromDeno) return fromDeno;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

export function newTraceId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `trace_${Date.now().toString(36)}_${rand}`;
}

export function errorResult(tool: string, traceId: string, code: string, message: string, detail?: unknown) {
  const payload = { error: { tool, traceId, code, message, detail: detail ?? null } };
  console.error(`[mcp:${tool}] ${code} traceId=${traceId} message=${message}`, detail ?? "");
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
    throw new Error(
      `mcp_config_missing: SUPABASE_URL=${url ? "ok" : "missing"} SUPABASE_PUBLISHABLE_KEY=${key ? "ok" : "missing"}`,
    );
  }
  const token = ctx.getToken();
  if (!token) {
    throw new Error("mcp_auth_missing_token: OAuth verified but no bearer token was forwarded");
  }
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Handler<I> = (input: I, ctx: ToolContext, meta: { traceId: string; supabase: SupabaseClient; userId: string }) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
}>;

export function withAuthAndTrace<I>(tool: string, run: Handler<I>) {
  return async (input: I, ctx: ToolContext) => {
    const traceId = newTraceId();
    try {
      if (!ctx.isAuthenticated()) {
        return errorResult(tool, traceId, "unauthenticated", "OAuth token was not accepted or missing");
      }
      const userId = ctx.getUserId();
      if (!userId) {
        return errorResult(tool, traceId, "no_user_id", "OAuth token verified but sub claim is empty");
      }
      const supabase = supabaseForUser(ctx);
      return await run(input, ctx, { traceId, supabase, userId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      const code = message.startsWith("mcp_config_missing")
        ? "config_missing"
        : message.startsWith("mcp_auth_missing_token")
          ? "auth_missing_token"
          : "handler_exception";
      return errorResult(tool, traceId, code, message, { stack });
    }
  };
}

export function dbError(tool: string, traceId: string, op: string, error: { message: string; code?: string; details?: string | null; hint?: string | null }) {
  return errorResult(tool, traceId, `db_${op}_failed`, error.message, {
    pg_code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}