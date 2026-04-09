import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import DailyLesson from "@/components/DailyLesson";
import {
  X,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Newspaper,
  Calculator,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { recordDailyLogin, getGamification, getLevel } from "@/lib/gamification";

interface Tip {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const ALL_TIPS: Tip[] = [
  { id: "budget", title: "50/30/20 Budget", description: "Split income: 50% needs, 30% wants, 20% savings.", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "inflation", title: "Beat Inflation", description: "Invest to protect your money from 3% yearly loss.", tags: ["Investing & Stocks", "Start investing"] },
  { id: "credit", title: "Credit Score Matters", description: "Good credit (700+) saves thousands in interest.", tags: ["Credit Cards & Credit Score", "Build credit score"] },
  { id: "emergency", title: "Emergency Fund", description: "Save 3-6 months expenses for unexpected events.", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "index", title: "Index Funds", description: "Buy 500 companies at once with low fees.", tags: ["Investing & Stocks", "Start investing"] },
  { id: "compound", title: "Compound Interest", description: "Your money earns money on its money.", tags: ["Investing & Stocks", "Start investing", "Build emergency savings"] },
  { id: "automate", title: "Automate Savings", description: "Auto-transfers on payday so saving happens before spending.", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "debtavalanche", title: "Debt Avalanche Method", description: "Pay highest-interest debt first to save the most.", tags: ["Student Loans & Debt", "Pay off debt"] },
  { id: "roth", title: "Roth IRA Advantage", description: "Invest after-tax now, withdraw tax-free in retirement.", tags: ["Investing & Stocks", "Start investing"] },
  { id: "dca", title: "Dollar-Cost Averaging", description: "Invest the same amount monthly — no need to time the market.", tags: ["Investing & Stocks", "Start investing"] },
  { id: "highyield", title: "High-Yield Savings", description: "Earn 4-5% APY instead of 0.01% — same safety, more interest.", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "diversify", title: "Diversification 101", description: "Spread across stocks, bonds, and more to reduce risk.", tags: ["Investing & Stocks", "Start investing"] },
];

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function scoreTip(tip: Tip, profile: UserProfile): number {
  let s = 0;
  for (const tag of tip.tags) {
    if (profile.topicsOfInterest.includes(tag)) s += 2;
    if (profile.financialGoals.includes(tag)) s += 2;
  }
  return s;
}

function pickTips(profile: UserProfile, dismissed: Set<string>, count = 3): Tip[] {
  const available = ALL_TIPS.filter((t) => !dismissed.has(t.id));
  const scored = available.map((t) => ({ tip: t, score: scoreTip(t, profile) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.tip);
}

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [tips, setTips] = useState(() => pickTips(profile, new Set()));

  const gam = useMemo(() => {
    const { state } = recordDailyLogin();
    return state;
  }, []);
  const level = useMemo(() => getLevel(gam.xp), [gam.xp]);

  const dismissTip = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        setTips(pickTips(profile, next));
        return next;
      });
    },
    [profile],
  );

  const refreshTips = useCallback(() => {
    const available = ALL_TIPS.filter((t) => !dismissed.has(t.id));
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, 3);
    setTips(shuffled);
  }, [dismissed]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Welcome */}
        <section>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
            Welcome back, {profile.name || "Explorer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Level {level.level} {level.title} · {gam.xp} XP
            {gam.streak > 1 && ` · ${gam.streak}-day streak`}
          </p>
        </section>

        {/* Daily Lesson */}
        <DailyLesson />

        {/* Tips */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Recommended Reading</h2>
            <button
              onClick={refreshTips}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="group relative rounded-xl border border-border bg-card p-5 flex flex-col transition-all gradient-border hover:-translate-y-0.5 hover:shadow-lg"
              >
                <button
                  onClick={() => dismissTip(tip.id)}
                  title="Dismiss"
                  className="absolute top-3 right-3 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                >
                  <X size={14} />
                </button>
                <h3 className="text-base font-display font-semibold text-foreground mb-2 pr-6">{tip.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{tip.description}</p>
                <button
                  onClick={() => navigate(`/tip/${tip.id}`)}
                  className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Read more <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Hub links */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/learn", icon: BookOpen, title: "Learn", desc: "Deep dives & lessons", color: "text-primary", bg: "bg-primary/10" },
            { to: "/market", icon: TrendingUp, title: "Markets", desc: "Trends & insights", color: "text-secondary", bg: "bg-secondary/10" },
            { to: "/news", icon: Newspaper, title: "News", desc: "Events simplified", color: "text-accent", bg: "bg-accent/10" },
            { to: "/budget", icon: Calculator, title: "Budget", desc: "Plan spending", color: "text-primary", bg: "bg-primary/10" },
          ].map((hub) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.to}
                onClick={() => navigate(hub.to)}
                className="rounded-xl p-5 text-left border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20 group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${hub.bg} mb-3`}>
                  <Icon size={18} className={hub.color} />
                </div>
                <h3 className="text-sm font-display font-semibold text-foreground mb-0.5">{hub.title}</h3>
                <p className="text-xs text-muted-foreground">{hub.desc}</p>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
