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