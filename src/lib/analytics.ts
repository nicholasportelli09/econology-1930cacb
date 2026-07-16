import posthog from "posthog-js";

/**
 * Econology analytics: wraps PostHog for product events, retention (D1/D7), and
 * crash monitoring. Safe to import anywhere — every call is a no-op until
 * `initAnalytics` runs successfully. If `VITE_POSTHOG_KEY` is unset, the module
 * stays fully inert (dev-friendly, ships without a key).
 */

type EventProps = Record<string, unknown>;

let started = false;

export function initAnalytics(): void {
  if (started) return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;
  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
    "https://us.i.posthog.com";
  try {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      capture_exceptions: true, // PostHog crash monitoring
      autocapture: true,
      loaded: () => {
        started = true;
      },
    });
    started = true;

    // Global error handlers (belt & suspenders on top of capture_exceptions).
    window.addEventListener("error", (e) => {
      try {
        posthog.captureException(e.error ?? new Error(e.message), {
          source: "window.error",
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
        });
      } catch {
        /* noop */
      }
    });
    window.addEventListener("unhandledrejection", (e) => {
      try {
        const reason = (e as PromiseRejectionEvent).reason;
        const err = reason instanceof Error ? reason : new Error(String(reason));
        posthog.captureException(err, { source: "unhandledrejection" });
      } catch {
        /* noop */
      }
    });
  } catch (err) {
    console.warn("[analytics] init failed", err);
  }
}

export function identifyUser(userId: string, traits?: EventProps): void {
  if (!started) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    /* noop */
  }
}

export function resetAnalytics(): void {
  if (!started) return;
  try {
    posthog.reset();
  } catch {
    /* noop */
  }
}

export function track(event: EconologyEvent, props: EventProps = {}): void {
  if (!started) {
    // buffer to console in dev so instrumentation is visible without a key
    if (import.meta.env.DEV) console.debug("[analytics:noop]", event, props);
    return;
  }
  try {
    posthog.capture(event, props);
  } catch {
    /* noop */
  }
}

export function trackError(err: unknown, context: EventProps = {}): void {
  const error = err instanceof Error ? err : new Error(String(err));
  try {
    if (started) posthog.captureException(error, context);
  } catch {
    /* noop */
  }
  // Always mirror to console so devs see it locally.
  console.error("[analytics:error]", error, context);
}

// Canonical event names — keep in one place so dashboards stay stable.
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