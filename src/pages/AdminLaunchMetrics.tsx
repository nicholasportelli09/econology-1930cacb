import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";

interface Metrics {
  new_accounts: number;
  activated_users: number;
  activation_rate: number;
  lessons_per_activated_user: number;
  source_open_rate: number;
  watchlist_adopters: number;
  watchlist_adoption_rate: number;
  sessions_total: number;
  sessions_with_errors: number;
  crash_free_rate: number;
  d1_retention_rate: number;
  d7_retention_rate: number;
  daily_signups: Array<{ date: string; count: number }>;
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AdminLaunchMetrics() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [startDate, setStartDate] = useState(isoDaysAgo(30));
  const [endDate, setEndDate] = useState(isoDaysAgo(0));
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server-side role check (never trust a client flag).
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      const { data, error } = await (
        supabase as unknown as {
          from: (t: string) => {
            select: (s: string) => {
              eq: (
                col: string,
                val: string
              ) => {
                eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
              };
            };
          };
        }
      )
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) setIsAdmin(false);
      else setIsAdmin(!!data);
    })();
  }, [user]);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await (
        supabase as unknown as {
          rpc: (
            fn: string,
            args: Record<string, unknown>
          ) => Promise<{ data: unknown; error: { message: string } | null }>;
        }
      ).rpc("launch_metrics", { _start: startDate, _end: endDate });
      if (error) setError(error.message);
      else setMetrics(data as Metrics);
      setLoading(false);
    },
    [startDate, endDate]
  );

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const exportCsv = () => {
    if (!metrics) return;
    const rows: Array<[string, string | number]> = [
      ["metric", "value"],
      ["date_range", `${startDate} to ${endDate}`],
      ["new_accounts", metrics.new_accounts],
      ["activated_users", metrics.activated_users],
      ["activation_rate_pct", metrics.activation_rate],
      ["d1_retention_rate_pct", metrics.d1_retention_rate],
      ["d7_retention_rate_pct", metrics.d7_retention_rate],
      ["lessons_per_activated_user", metrics.lessons_per_activated_user],
      ["source_open_rate_pct", metrics.source_open_rate],
      ["watchlist_adopters", metrics.watchlist_adopters],
      ["watchlist_adoption_rate_pct", metrics.watchlist_adoption_rate],
      ["sessions_total", metrics.sessions_total],
      ["sessions_with_errors", metrics.sessions_with_errors],
      ["crash_free_rate_pct", metrics.crash_free_rate],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-metrics_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Card = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold">Launch Metrics</h1>
            <p className="text-sm text-muted-foreground">
              Aggregated only. Individual users are never listed here.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="block text-xs text-muted-foreground mb-1">Start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-muted-foreground mb-1">End</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background"
              />
            </label>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 rounded-md gradient-bg text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
            <button
              onClick={exportCsv}
              disabled={!metrics}
              className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold disabled:opacity-50"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive p-4 text-sm">{error}</div>}

        {metrics && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card label="New accounts" value={metrics.new_accounts} />
              <Card label="Activation rate" value={`${metrics.activation_rate}%`} sub="onboarding + first lesson" />
              <Card label="D1 retention" value={`${metrics.d1_retention_rate}%`} />
              <Card label="D7 retention" value={`${metrics.d7_retention_rate}%`} />
              <Card label="Lessons / activated user" value={metrics.lessons_per_activated_user} />
              <Card label="Source open rate" value={`${metrics.source_open_rate}%`} sub="original source / article opens" />
              <Card label="Watchlist adoption" value={`${metrics.watchlist_adoption_rate}%`} sub={`${metrics.watchlist_adopters} adopters`} />
              <Card label="Crash-free sessions" value={`${metrics.crash_free_rate}%`} sub={`${metrics.sessions_with_errors} / ${metrics.sessions_total} with errors`} />
            </section>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold mb-3">Daily signups</h2>
              {metrics.daily_signups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No signups in this range.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {metrics.daily_signups.map((d) => (
                    <li key={d.date} className="flex justify-between border-b py-1 last:border-0">
                      <span>{d.date}</span>
                      <span className="font-mono">{d.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}