import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import DailyLesson from "@/components/DailyLesson";
import DailyPlan from "@/components/DailyPlan";
import DashboardSummary from "@/components/DashboardSummary";
import { X, ArrowRight, RefreshCw } from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { recordDailyLogin, getLevel } from "@/lib/gamification";

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

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-12 md:space-y-16">
        {/* 1. HOMEBASE HEADER — slim status bar */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight">
              Welcome back, <span className="gradient-text">{profile.name || "Explorer"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Level {level.level} {level.title}
              <span className="mx-1.5 text-muted-foreground/50">·</span>
              {gam.xp} XP
              {gam.streak > 1 && (
                <>
                  <span className="mx-1.5 text-muted-foreground/50">·</span>
                  🔥 {gam.streak}-day streak
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start sm:self-end"
          >
            Edit topics
          </button>
        </header>

        {/* 2 + 3. PRIMARY (Daily Lesson) + SECONDARY (Today's Plan) */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <DailyLesson />
          </div>
          <aside className="lg:col-span-2">
            <DailyPlan />
          </aside>
        </section>

        {/* 5. CONSOLIDATED REFERENCE STRIP */}
        <DashboardSummary />

        {/* 6. EXPLORATION — lighter, optional */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Recommended Reading
              </h2>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Optional deep dives picked for you</p>
            </div>
            <button
              onClick={refreshTips}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="group relative rounded-lg bg-muted/30 hover:bg-muted/60 p-4 flex flex-col transition-colors"
              >
                <button
                  onClick={() => dismissTip(tip.id)}
                  title="Dismiss"
                  className="absolute top-2.5 right-2.5 p-1 rounded text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                >
                  <X size={13} />
                </button>
                <h3 className="text-sm font-display font-semibold text-foreground mb-1.5 pr-5">{tip.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed flex-1">{tip.description}</p>
                <button
                  onClick={() => navigate(`/tip/${tip.id}`)}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 self-start"
                >
                  Read more <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
