import { supabase } from "@/integrations/supabase/client";

/**
 * First-party launch analytics for Econology.
 *
 * Writes to `public.product_events` with a strict, allow-listed event vocabulary
 * and sanitized properties. NEVER include lesson answers, AI messages, financial
 * amounts, email addresses, or free-text user content in properties.
 *
 * Unhandled errors + rejected promises are captured to `public.app_errors` with
 * a redacted message + stack.
 */

export type ProductEvent =
  | "session_started"
  | "signup_completed"
  | "onboarding_started"
  | "onboarding_completed"
  | "placement_completed"
  | "lesson_started"
  | "lesson_completed"
  | "news_article_opened"
  | "original_source_opened"
  | "watchlist_ticker_added"
  | "feedback_submitted"
  | "content_reported"
  | "app_error";

export const APP_VERSION =
  (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "beta";

type SafeProps = Record<string, string | number | boolean | null>;

let sessionId: string | null = null;
let userId: string | null = null;
let started = false;

function genSession(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  if (sessionId) return sessionId;
  try {
    sessionId = localStorage.getItem("econology_product_session") ?? genSession();
    localStorage.setItem("econology_product_session", sessionId);
  } catch {
    sessionId = genSession();
  }
  return sessionId;
}

/** Allow-listed keys per event. Anything else is dropped. */
const ALLOWED_KEYS: Record<ProductEvent, readonly string[]> = {
  session_started: ["referrer_host"],
  signup_completed: ["provider"],
  onboarding_started: [],
  onboarding_completed: ["goals_count", "topics_count"],
  placement_completed: ["score_bucket"],
  lesson_started: ["concept_id"],
  lesson_completed: ["concept_id", "duration_bucket"],
  news_article_opened: ["source_bucket"],
  original_source_opened: ["source_bucket"],
  watchlist_ticker_added: [],
  feedback_submitted: ["surface"],
  content_reported: ["surface", "reason_bucket"],
  app_error: ["source"],
};

const REDACT_RX = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\b\d{6,}\b)|(sk-[A-Za-z0-9-_]+)|(eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/g;

function redact(str: string | undefined | null, maxLen = 500): string {
  if (!str) return "";
  return str.replace(REDACT_RX, "[redacted]").slice(0, maxLen);
}

function sanitize(event: ProductEvent, props: SafeProps): SafeProps {
  const allowed = ALLOWED_KEYS[event] ?? [];
  const out: SafeProps = {};
  for (const key of allowed) {
    const v = props[key];
    if (v === undefined) continue;
    if (typeof v === "string") out[key] = redact(v, 80);
    else out[key] = v;
  }
  return out;
}

function pagePath(): string | null {
  if (typeof window === "undefined") return null;
  // Avoid capturing tokens/emails in query strings.
  return window.location.pathname;
}

function newRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function setAnalyticsUser(id: string | null): void {
  userId = id;
}

export function newSession(): void {
  sessionId = genSession();
  try {
    localStorage.setItem("econology_product_session", sessionId);
  } catch {
    /* noop */
  }
}

export async function trackProduct(
  event: ProductEvent,
  props: SafeProps = {}
): Promise<void> {
  const payload = {
    user_id: userId,
    session_id: getSessionId(),
    event_name: event,
    page_path: pagePath(),
    properties: sanitize(event, props),
    app_version: APP_VERSION,
  };
  if (import.meta.env.DEV) {
    console.debug("[product]", event, payload);
  }
  try {
    // Cast: generated types may lag. Table exists in DB.
    await (
      supabase as unknown as {
        from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
      }
    )
      .from("product_events")
      .insert(payload);
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[product] insert failed", err);
  }
}

export async function reportAppError(
  err: unknown,
  context: { source?: string; route?: string } = {}
): Promise<void> {
  const e = err instanceof Error ? err : new Error(String(err));
  const requestId = newRequestId();
  const payload = {
    user_id: userId,
    session_id: getSessionId(),
    route: context.route ?? pagePath(),
    message: redact(e.message, 500),
    stack: redact(e.stack, 2000),
    app_version: APP_VERSION,
    request_id: requestId,
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
  };
  if (import.meta.env.DEV) console.error("[app_error]", e, context);
  try {
    await (
      supabase as unknown as {
        from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
      }
    )
      .from("app_errors")
      .insert(payload);
  } catch {
    /* noop */
  }
  // Also emit a product-stream signal (no PII).
  void trackProduct("app_error", { source: context.source ?? "unknown" });
}

export function initProductAnalytics(): void {
  if (started) return;
  started = true;
  getSessionId();

  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      return "";
    }
  })();
  void trackProduct("session_started", { referrer_host: referrerHost });

  if (typeof window !== "undefined") {
    window.addEventListener("error", (e) => {
      const err = e.error instanceof Error ? e.error : new Error(e.message ?? "window.error");
      void reportAppError(err, { source: "window.error" });
    });
    window.addEventListener("unhandledrejection", (e) => {
      const reason = (e as PromiseRejectionEvent).reason;
      const err = reason instanceof Error ? reason : new Error(String(reason));
      void reportAppError(err, { source: "unhandledrejection" });
    });
  }
}