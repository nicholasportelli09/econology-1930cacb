import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Briefcase, Activity, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getGamification, getLevel } from "@/lib/gamification";

export default function DashboardSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickerCount, setTickerCount] = useState<number | null>(null);
  const [pinCount, setPinCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [pf, pin] = await Promise.all([
        supabase.from("user_portfolio").select("ticker", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("pinned_articles").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      setTickerCount(pf.count ?? 0);
      setPinCount(pin.count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const gam = getGamification();
  const level = getLevel(gam.xp);

  const cards = [
    {
      to: "/news",
      icon: Briefcase,
      label: "Portfolio",
      value: tickerCount === null ? "…" : `${tickerCount} ${tickerCount === 1 ? "ticker" : "tickers"}`,
      hint: tickerCount === 0 ? "Add your first stock" : "View company news",
    },
    {
      to: "/news",
      icon: Newspaper,
      label: "Saved News",
      value: pinCount === null ? "…" : `${pinCount} pinned`,
      hint: pinCount === 0 ? "Pin articles to revisit" : "Open your reading list",
    },
    {
      to: "/progress",
      icon: Activity,
      label: "Progress",
      value: `Lv ${level.level} · ${gam.xp} XP`,
      hint: gam.streak > 1 ? `🔥 ${gam.streak}-day streak` : "Start your streak today",
    },
  ];

  return (
    <section className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/60 rounded-lg border border-border/60 bg-card/40">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.label}
            onClick={() => navigate(c.to)}
            className="group flex-1 text-left px-5 py-3.5 transition-colors hover:bg-muted/40 first:rounded-t-lg last:rounded-b-lg sm:first:rounded-l-lg sm:first:rounded-tr-none sm:last:rounded-r-lg sm:last:rounded-bl-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={12} className="text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-display font-semibold text-foreground truncate">{c.value}</p>
              <ArrowRight size={11} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{c.hint}</p>
          </button>
        );
      })}
    </section>
  );
}