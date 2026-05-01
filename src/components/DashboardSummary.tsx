import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Activity, ArrowRight, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getGamification, getLevel } from "@/lib/gamification";
import { loadStreak } from "@/lib/lessons";

interface Mover {
  ticker: string;
  changePercent: number;
}

export default function DashboardSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickerCount, setTickerCount] = useState<number | null>(null);
  const [movers, setMovers] = useState<Mover[] | null>(null);
  const [topMover, setTopMover] = useState<Mover | null>(null);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [pf, streak] = await Promise.all([
        supabase.from("user_portfolio").select("ticker").eq("user_id", user.id).limit(20),
        loadStreak(user.id),
      ]);
      if (cancelled) return;
      setStreakDays(streak.current);
      setLongestStreak(streak.longest);
      const tickers = (pf.data ?? []).map((r) => r.ticker).filter(Boolean);
      setTickerCount(tickers.length);
      if (tickers.length === 0) {
        setMovers([]);
        return;
      }
      try {
        const { data } = await supabase.functions.invoke("stock-quote", {
          body: { tickers: tickers.join(",") },
        });
        if (cancelled) return;
        const quotes = (data?.quotes ?? {}) as Record<string, { changePercent?: number }>;
        const list: Mover[] = tickers
          .map((t) => ({ ticker: t, changePercent: Number(quotes[t]?.changePercent ?? 0) }))
          .filter((m) => Number.isFinite(m.changePercent));
        // Show top 3 by absolute move; pick biggest mover (positive or negative).
        const sorted = [...list].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        setMovers(sorted.slice(0, 3));
        setTopMover(sorted[0] ?? null);
      } catch {
        setMovers([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const gam = getGamification();
  const level = getLevel(gam.xp);

  // Streak goal ladder for the "X days to next tier" copy.
  const streakGoal = streakDays < 3 ? 3 : streakDays < 7 ? 7 : streakDays < 14 ? 14 : streakDays < 30 ? 30 : streakDays < 100 ? 100 : streakDays + 30;
  const streakTier =
    streakDays >= 100 ? "diamond" : streakDays >= 30 ? "gold" : streakDays >= 14 ? "silver" : streakDays >= 7 ? "bronze" : "starter";
  const daysToNext = Math.max(0, streakGoal - streakDays);

  const portfolioValue =
    tickerCount === null
      ? "…"
      : tickerCount === 0
      ? "No tickers yet"
      : movers && movers.length > 0
      ? movers
          .map((m) => `${m.ticker} ${m.changePercent >= 0 ? "+" : ""}${m.changePercent.toFixed(1)}%`)
          .join(" · ")
      : `${tickerCount} ${tickerCount === 1 ? "ticker" : "tickers"}`;

  const portfolioHint =
    tickerCount === 0
      ? "Add your first stock"
      : topMover
      ? `Today's mover: ${topMover.ticker} ${topMover.changePercent >= 0 ? "+" : ""}${topMover.changePercent.toFixed(1)}%`
      : "View company news";

  const cards = [
    {
      to: "/news",
      icon: Briefcase,
      label: "Portfolio",
      value: portfolioValue,
      hint: portfolioHint,
    },
    {
      to: "/learn",
      icon: Flame,
      label: "Streak",
      value: streakDays > 0 ? `🔥 ${streakDays}-day streak` : "Start your streak",
      hint:
        streakDays === 0
          ? "Finish today's lesson to begin"
          : daysToNext > 0
          ? `${daysToNext} day${daysToNext === 1 ? "" : "s"} to ${nextTierLabel(streakTier)}`
          : `Longest: ${longestStreak} days`,
    },
    {
      to: "/progress",
      icon: Activity,
      label: "Progress",
      value: `Lv ${level.level} · ${gam.xp} XP`,
      hint: `Next level at ${level.nextAt} XP`,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.label}
            onClick={() => navigate(c.to)}
            className="text-left rounded-xl border border-border bg-card p-4 card-shadow transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
              </div>
              <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-base font-display font-semibold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.hint}</p>
          </button>
        );
      })}
    </section>
  );
}