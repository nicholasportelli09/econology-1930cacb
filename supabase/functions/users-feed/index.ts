import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Token-protected, machine-readable feed of Econology accounts.
// Usage: GET /functions/v1/users-feed?token=<USERS_FEED_TOKEN>[&format=csv]
serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-feed-token",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const expected = Deno.env.get("USERS_FEED_TOKEN");
  const url = new URL(req.url);
  const provided =
    url.searchParams.get("token") ??
    req.headers.get("x-feed-token") ??
    "";

  if (!expected) {
    return new Response(JSON.stringify({ error: "feed_not_configured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (provided !== expected) {
    console.warn("users_feed_auth_failure", {
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const started = Date.now();
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    // Page through auth users (service role).
    type AuthUser = {
      id: string;
      email?: string | null;
      created_at: string;
      last_sign_in_at?: string | null;
      email_confirmed_at?: string | null;
      app_metadata?: Record<string, unknown>;
      user_metadata?: Record<string, unknown>;
    };
    const users: AuthUser[] = [];
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      users.push(...(data.users as unknown as AuthUser[]));
      if (!data.users.length || data.users.length < 200) break;
    }

    const [{ data: lessons }, { data: profiles }, { data: streaks }] = await Promise.all([
      admin.from("lesson_progress").select("user_id"),
      admin.from("literacy_profiles").select("user_id"),
      admin.from("daily_streak").select("user_id,current_streak,longest_streak,total_xp,last_lesson_date"),
    ]);

    const lessonCount = new Map<string, number>();
    for (const r of lessons ?? []) {
      lessonCount.set(r.user_id, (lessonCount.get(r.user_id) ?? 0) + 1);
    }
    const onboarded = new Set((profiles ?? []).map((r) => r.user_id));
    const streakBy = new Map((streaks ?? []).map((s) => [s.user_id, s]));

    const now = Date.now();
    const days = (iso?: string | null) =>
      iso ? Math.floor((now - new Date(iso).getTime()) / 86400000) : null;

    const rows = users
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .map((u) => {
        const s = streakBy.get(u.id);
        return {
          email: u.email ?? null,
          provider:
            (u.app_metadata?.provider as string) ??
            (u.user_metadata?.provider as string) ??
            "email",
          email_confirmed: !!u.email_confirmed_at,
          signed_up: u.created_at,
          last_sign_in: u.last_sign_in_at ?? null,
          days_since_last_sign_in: days(u.last_sign_in_at),
          lessons_completed: lessonCount.get(u.id) ?? 0,
          onboarded: onboarded.has(u.id),
          current_streak: s?.current_streak ?? 0,
          longest_streak: s?.longest_streak ?? 0,
          total_xp: s?.total_xp ?? 0,
          last_lesson_date: s?.last_lesson_date ?? null,
        };
      });

    const active7 = rows.filter((r) => r.days_since_last_sign_in !== null && r.days_since_last_sign_in! <= 7).length;
    const new7 = rows.filter((r) => (days(r.signed_up) ?? 999) <= 7).length;

    if (url.searchParams.get("format") === "csv") {
      const headers = Object.keys(rows[0] ?? { email: "" });
      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          headers
            .map((h) => {
              const v = (r as Record<string, unknown>)[h];
              const s = v === null || v === undefined ? "" : String(v);
              return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            })
            .join(","),
        ),
      ].join("\n");
      return new Response(csv, {
        headers: { ...cors, "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    return new Response(
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          summary: {
            total_accounts: rows.length,
            onboarded: rows.filter((r) => r.onboarded).length,
            active_last_7_days: active7,
            new_last_7_days: new7,
            total_lessons_completed: rows.reduce((a, r) => a + r.lessons_completed, 0),
          },
          users: rows,
        },
        null,
        2,
      ),
      {
        headers: {
          ...cors,
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (e) {
    console.error("users_feed_error", { message: String(e), ms: Date.now() - started });
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
