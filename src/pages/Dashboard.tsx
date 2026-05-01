import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import DailyLesson from "@/components/DailyLesson";
import DailyPlan from "@/components/DailyPlan";
import DashboardSummary from "@/components/DashboardSummary";
import NewsInsightHero from "@/components/NewsInsightHero";
import { hasSeenTour, startProductTour } from "@/lib/productTour";
import {
  X,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
  PlayCircle,
  Calculator,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { recordDailyLogin, getLevel } from "@/lib/gamification";
import { useAuth } from "@/contexts/AuthContext";
import { loadLiteracyProfile, type LiteracyProfile } from "@/lib/literacy";
import { type Dimension, DIMENSION_LABELS } from "@/data/conceptGraph";

interface Tip {
  id: string;
  title: string;
  description: string;
  /** Which dimension(s) this tip teaches against. Used for personalization. */
  dims: Dimension[];
}

const ALL_TIPS: Tip[] = [
  { id: "budget",        title: "50/30/20 Budget",         description: "Split income: 50% needs, 30% wants, 20% savings.",                dims: ["budgeting"] },
  { id: "emergency",     title: "Emergency Fund",          description: "Save 3-6 months expenses for unexpected events.",                  dims: ["budgeting"] },
  { id: "highyield",     title: "High-Yield Savings",      description: "Earn 4-5% APY instead of 0.01% — same safety, more interest.",     dims: ["budgeting"] },
  { id: "automate",      title: "Automate Savings",        description: "Auto-transfers on payday so saving happens before spending.",      dims: ["budgeting"] },
  { id: "credit",        title: "Credit Score Matters",    description: "Good credit (700+) saves thousands in interest.",                  dims: ["credit"] },
  { id: "creditcard",    title: "Your First Credit Card",  description: "Pay before the statement closes to lower reported utilization.",   dims: ["credit"] },
  { id: "debtavalanche", title: "Debt Avalanche Method",   description: "Pay highest-interest debt first to save the most.",                dims: ["credit"] },
  { id: "inflation",     title: "Beat Inflation",          description: "Invest to protect your money from 3% yearly loss.",                dims: ["macro", "investing"] },
  { id: "compound",      title: "Compound Interest",       description: "Your money earns money on its money.",                              dims: ["investing"] },
  { id: "index",         title: "Index Funds",             description: "Buy 500 companies at once with low fees.",                          dims: ["investing"] },
  { id: "dca",           title: "Dollar-Cost Averaging",   description: "Invest the same amount monthly — no need to time the market.",     dims: ["investing"] },
  { id: "roth",          title: "Roth IRA Advantage",      description: "Invest after-tax now, withdraw tax-free in retirement.",            dims: ["investing"] },
  { id: "diversify",     title: "Diversification 101",     description: "Spread across stocks, bonds, and more to reduce risk.",            dims: ["risk", "investing"] },
  { id: "recession",     title: "What Is a Recession?",    description: "Two negative GDP quarters isn't the official call — NBER decides.", dims: ["macro"] },
];

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

/**
 * Pick recommended-reading tips. Once the user has a literacy profile, we sort
 * by weakest dimension first and surface the *reason* in the UI. Without a
 * profile (rare — placement is gated), fall back to topic interests.
 */
function pickTips(
  profile: UserProfile,
  literacy: LiteracyProfile | null,
  dismissed: Set<string>,
  count = 3,
): { tip: Tip; reason: string }[] {
  const available = ALL_TIPS.filter((t) => !dismissed.has(t.id));

  if (literacy) {
    // Sort dimensions by score ascending — weakest first.
    const dims = (Object.entries(literacy.scores) as [Dimension, number][])
      .sort((a, b) => a[1] - b[1]);

    const picked: { tip: Tip; reason: string }[] = [];
    const usedIds = new Set<string>();

    for (const [dim, score] of dims) {
      if (picked.length >= count) break;
      const tip = available.find((t) => t.dims.includes(dim) && !usedIds.has(t.id));
      if (!tip) continue;
      usedIds.add(tip.id);
      const reason =
        score === 0
          ? `New area for you — ${DIMENSION_LABELS[dim].toLowerCase()}.`
          : score < 50
          ? `You scored ${score}% on ${DIMENSION_LABELS[dim].toLowerCase()} — start here.`
          : `Builds on your ${DIMENSION_LABELS[dim].toLowerCase()} foundation.`;
      picked.push({ tip, reason });
    }
    // Top up if we ran out of dim-matched tips.
    for (const tip of available) {
      if (picked.length >= count) break;
      if (usedIds.has(tip.id)) continue;
      picked.push({ tip, reason: "Pairs well with your other lessons." });
    }
    return picked;
  }

  // Fallback (no placement yet): topic-interest scoring.
  const scored = available.map((t) => {
    let s = 0;
    for (const dim of t.dims) {
      if (profile.topicsOfInterest.some((x) => x.toLowerCase().includes(dim))) s += 2;
    }
    return { tip: t, score: s };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => ({ tip: s.tip, reason: "Recommended for you." }));
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useMemo(getProfile, []);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [literacy, setLiteracy] = useState<LiteracyProfile | null>(null);
  const [tips, setTips] = useState(() => pickTips(profile, null, new Set()));

  const gam = useMemo(() => {
    const { state } = recordDailyLogin();
    return state;
  }, []);
  const level = useMemo(() => getLevel(gam.xp), [gam.xp]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const lp = await loadLiteracyProfile(user.id);
      if (cancelled) return;
      setLiteracy(lp);
      setTips(pickTips(profile, lp, dismissed));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Trigger product tour once for new users (after onboarding/quiz lands them here)
  useEffect(() => {
    if (hasSeenTour()) return;
    const t = setTimeout(() => startProductTour(), 600);
    return () => clearTimeout(t);
  }, []);

  const dismissTip = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        setTips(pickTips(profile, literacy, next));
        return next;
      });
    },
    [profile, literacy],
  );

  const refreshTips = useCallback(() => {
    const available = ALL_TIPS.filter((t) => !dismissed.has(t.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 3);
    setTips(shuffled.map((tip) => ({ tip, reason: "Recommended for you." })));
  }, [dismissed]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-10 md:py-14 space-y-12 md:space-y-14">
        {/* Welcome + Daily Plan */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Welcome back, <span className="gradient-text">{profile.name || "Explorer"}</span>
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Level {level.level} {level.title} · {gam.xp} XP</span>
              {gam.streak > 1 && <span>· 🔥 {gam.streak}-day streak</span>}
              {literacy && (
                <button
                  onClick={() => navigate("/placement")}
                  className="text-primary hover:underline text-xs ml-1"
                  title="Re-take the placement diagnostic"
                >
                  Re-take placement
                </button>
              )}
            </div>
            <div data-tour="daily-lesson">
              <DailyLesson />
            </div>
            <NewsInsightHero />
          </div>
          <div className="lg:col-span-1" data-tour="daily-plan">
            <DailyPlan />
          </div>
        </section>

        {/* At-a-glance summary */}
        <DashboardSummary />

        {/* Tips */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Recommended Reading</h2>
            <button
              onClick={refreshTips}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tips.map(({ tip, reason }) => (
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
                <p className="text-xs text-primary/80 italic mb-3 leading-relaxed">{reason}</p>
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
        <section className="grid grid-cols-2 md:grid-cols-4 gap-5" data-tour="hub-grid">
          {[
            { to: "/learn",  icon: BookOpen,    title: "Learn",   desc: "Lessons & deep dives",  color: "text-primary",   bg: "bg-primary/10"   },
            { to: "/market", icon: TrendingUp,  title: "Markets", desc: "Analyst lens + economic news", color: "text-secondary", bg: "bg-secondary/10" },
            { to: "/videos", icon: PlayCircle,  title: "Videos",  desc: "Curated, watch-and-earn-XP", color: "text-accent", bg: "bg-accent/10" },
            { to: "/budget", icon: Calculator,  title: "Budget",  desc: "Plan & simulate",       color: "text-primary",   bg: "bg-primary/10"   },
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
