import { supabase } from "@/integrations/supabase/client";

/**
 * Econology analytics: self-hosted product measurement + crash monitoring using
 * Lovable Cloud. No external API keys required. Events are written to the
 * public.analytics_events table with RLS. Safe to import anywhere — the module
 * is inert until initAnalytics() is called and gracefully degrades if Supabase
 * is unavailable.
 */

export type EventProps = Record<string, unknown>;

export type EconologyEvent =
  | "signup_started"
  | "signup_completed"
  | "login_completed"
  | "oauth_started"
  | "email_verified"
  | "onboarding_started"
  | "onboarding_completed"
  | "placement_quiz_completed"
  | "lesson_started"
  | "lesson_completed"
  | "first_lesson_completed"
  | "news_article_read"
  | "news_source_opened"
  | "article_pinned"
  | "article_unpinned"
  | "watchlist_ticker_added"
  | "watchlist_ticker_removed"
  | "ask_ekon_query_sent"
  | "app_error";

let started = false;
let identifiedUserId: string | null = null;
let sessionId: string | null = null;
type BufferedEvent = {
  event: EconologyEvent;
  props: EventProps;
  severity: "info" | "warning" | "error" | "crash";
  userId: string | null;
};
let buffer: BufferedEvent[] = [];
const flushIntervalMs = 5_000;
let flushTimer: ReturnType<typeof setInterval> | null = null;

function generateSessionId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getUserAgent(): string | undefined {
  return typeof navigator !== "undefined" ? navigator.userAgent : undefined;
}

function getPathname(): string | undefined {
  return typeof window !== "undefined" ? window.location.pathname : undefined;
}

function safeStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

async function insertEvent(
  event: EconologyEvent,
  props: EventProps,
  severity: "info" | "warning" | "error" | "crash" = "info"
): Promise<void> {
  const payload = {
    user_id: identifiedUserId,
    event,
    properties: props,
    session_id: sessionId,
    pathname: getPathname(),
    user_agent: getUserAgent(),
    severity,
  };

  if (import.meta.env.DEV) {
    console.debug("[analytics]", event, payload);
  }

  try {
    // Cast because the typed Supabase client is auto-generated and may not yet
    // include the new analytics_events table. The table exists in the database.
    const { error } = await (supabase as unknown as { from: (table: string) => { insert: (values: unknown) => Promise<{ error: Error | null }> } }).from("analytics_events").insert(payload);
    if (error) {
      console.warn("[analytics] insert failed", error.message);
    }
  } catch (err) {
    console.warn("[analytics] insert exception", err);
  }
}

async function flushBuffer(): Promise<void> {
  if (buffer.length === 0) return;
  const batch = buffer;
  buffer = [];
  await Promise.all(
    batch.map((item) => insertEvent(item.event, item.props, item.severity))
  );
}

export function initAnalytics(): void {
  if (started) return;
  started = true;

  sessionId = localStorage.getItem("econology_session_id") ?? generateSessionId();
  localStorage.setItem("econology_session_id", sessionId);

  // Restore identified user from a previous session if present.
  identifiedUserId = localStorage.getItem("econology_analytics_user_id");

  // Flush buffered events on a timer.
  flushTimer = setInterval(() => {
    flushBuffer().catch(() => {
      /* noop */
    });
  }, flushIntervalMs);

  // Flush before the page unloads so we don't lose events.
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      flushBuffer().catch(() => {
        /* noop */
      });
    });
  }

  // Global crash monitoring.
  if (typeof window !== "undefined") {
    window.addEventListener("error", (e) => {
      const err = e.error instanceof Error ? e.error : new Error(e.message);
      trackError(err, {
        source: "window.error",
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    });

    window.addEventListener("unhandledrejection", (e) => {
      const reason = (e as PromiseRejectionEvent).reason;
      const err = reason instanceof Error ? reason : new Error(String(reason));
      trackError(err, { source: "unhandledrejection" });
    });
  }
}

export function identifyUser(userId: string, traits?: EventProps): void {
  identifiedUserId = userId;
  try {
    localStorage.setItem("econology_analytics_user_id", userId);
  } catch {
    /* noop */
  }
  track("login_completed", { ...traits, userId });
}

export function resetAnalytics(): void {
  identifiedUserId = null;
  try {
    localStorage.removeItem("econology_analytics_user_id");
    localStorage.removeItem("econology_session_id");
  } catch {
    /* noop */
  }
  sessionId = generateSessionId();
  try {
    localStorage.setItem("econology_session_id", sessionId);
  } catch {
    /* noop */
  }
}

export function track(event: EconologyEvent, props: EventProps = {}): void {
  if (!started) {
    if (import.meta.env.DEV) {
      console.debug("[analytics:noop]", event, props);
    }
    return;
  }

  // Buffer events to reduce network chatter and gracefully handle offline.
  buffer.push({ event, props, severity: "info" });

  // Flush immediately if the buffer is getting large.
  if (buffer.length >= 10) {
    flushBuffer().catch(() => {
      /* noop */
    });
  }
}

export function trackError(err: unknown, context: EventProps = {}): void {
  const error = err instanceof Error ? err : new Error(String(err));
  const safeContext = { ...context };

  // Attach a safe stack summary if available; avoid leaking source maps.
  if (error.stack) {
    safeContext.stack = safeStringify(error.stack);
  }
  safeContext.message = error.message;

  console.error("[analytics:error]", error, context);

  if (!started) {
    if (import.meta.env.DEV) {
      console.debug("[analytics:noop] app_error", safeContext);
    }
    return;
  }

  buffer.push({ event: "app_error", props: safeContext, severity: "error" });
}

export function trackCrash(err: unknown, context: EventProps = {}): void {
  const error = err instanceof Error ? err : new Error(String(err));
  const safeContext = { ...context };
  if (error.stack) {
    safeContext.stack = safeStringify(error.stack);
  }
  safeContext.message = error.message;

  console.error("[analytics:crash]", error, context);

  if (!started) {
    if (import.meta.env.DEV) {
      console.debug("[analytics:noop] app_error (crash)", safeContext);
    }
    return;
  }

  buffer.push({
    event: "app_error",
    props: safeContext,
    severity: "crash",
  });

  // Crashes are flushed immediately so we don't lose them.
  flushBuffer().catch(() => {
    /* noop */
  });
}
