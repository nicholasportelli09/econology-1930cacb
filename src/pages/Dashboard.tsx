import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  X,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Newspaper,
  Trophy,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";

interface Tip {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const ALL_TIPS: Tip[] = [
  { id: "budget", title: "50/30/20 Budget", description: "Split income: 50% needs, 30% wants, 20% savings!", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "inflation", title: "Beat Inflation", description: "Invest to protect your money from 3% yearly loss!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "credit", title: "Credit Score Matters", description: "Good credit (700+) saves thousands in interest!", tags: ["Credit Cards & Credit Score", "Build credit score"] },
  { id: "emergency", title: "Emergency Fund", description: "Save 3-6 months expenses for unexpected events!", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "index", title: "Index Funds", description: "Buy 500 companies at once with low fees!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "hustle", title: "Side Hustle Power", description: "$200/month extra = $2,400/year!", tags: ["Side Hustles & Income", "Start a side hustle"] },
  { id: "compound", title: "Compound Interest", description: "Einstein called it the 8th wonder — your money earns money on its money!", tags: ["Investing & Stocks", "Start investing", "Build emergency savings"] },
  { id: "automate", title: "Automate Savings", description: "Set up auto-transfers on payday so saving happens before spending!", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "debtavalanche", title: "Debt Avalanche Method", description: "Pay highest-interest debt first to save the most money long-term!", tags: ["Student Loans & Debt", "Pay off debt"] },
  { id: "debtsnowball", title: "Debt Snowball Method", description: "Pay smallest debts first for quick wins and momentum!", tags: ["Student Loans & Debt", "Pay off debt"] },
  { id: "roth", title: "Roth IRA Advantage", description: "Invest after-tax now, withdraw tax-free in retirement — ideal for young earners!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "etf", title: "ETFs Explained", description: "Like index funds but trade like stocks — flexible & low-cost diversification!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "cryptobasics", title: "Crypto 101", description: "Blockchain, Bitcoin, Ethereum — understand the basics before you invest!", tags: ["Crypto & New Tech", "Start investing"] },
  { id: "cryptorisk", title: "Crypto Risk Management", description: "Never invest more than you can afford to lose. Start with 5% of portfolio max!", tags: ["Crypto & New Tech", "Start investing"] },
  { id: "studentloans", title: "Student Loan Strategy", description: "Federal vs. private, income-driven plans, and forgiveness programs explained!", tags: ["Student Loans & Debt", "Pay off debt", "Save for college"] },
  { id: "creditcard", title: "First Credit Card", description: "Start with a secured card, use <10% of limit, pay in full every month!", tags: ["Credit Cards & Credit Score", "Build credit score"] },
  { id: "cashback", title: "Cashback Rewards", description: "Earn 1-5% back on purchases you already make — free money if you pay in full!", tags: ["Credit Cards & Credit Score", "Build credit score", "Budgeting & Saving"] },
  { id: "negotiate", title: "Negotiate Your Salary", description: "Research market rates — most first offers have 10-20% room to negotiate!", tags: ["Career & Salary", "Side Hustles & Income"] },
  { id: "taxbasics", title: "Tax Basics for Beginners", description: "Understand W-2s, tax brackets, and why a raise won't lose you money!", tags: ["Taxes", "Career & Salary"] },
  { id: "taxdeductions", title: "Tax Deductions & Credits", description: "Student loan interest, education credits — don't leave free money on the table!", tags: ["Taxes", "Student Loans & Debt", "Save for college"] },
  { id: "moveout", title: "Moving Out Checklist", description: "Budget for rent, deposits, utilities, furniture — plan 3 months ahead!", tags: ["Budgeting & Saving", "Move out"] },
  { id: "rentbudget", title: "The 30% Rent Rule", description: "Keep rent under 30% of gross income to avoid being house-poor!", tags: ["Budgeting & Saving", "Move out", "Real Estate"] },
  { id: "realestate", title: "Real Estate Basics", description: "Renting vs. buying — understand when homeownership actually makes sense!", tags: ["Real Estate", "Move out"] },
  { id: "travelbudget", title: "Travel on a Budget", description: "Use points, travel off-peak, and set a trip fund to explore without going broke!", tags: ["Budgeting & Saving", "Travel"] },
  { id: "subscriptions", title: "Subscription Audit", description: "The average person wastes $200/month on unused subscriptions — audit yours!", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "highyield", title: "High-Yield Savings", description: "Earn 4-5% APY instead of 0.01% — same safety, way more interest!", tags: ["Budgeting & Saving", "Build emergency savings"] },
  { id: "rule72", title: "The Rule of 72", description: "Divide 72 by your return rate to see how fast your money doubles!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "dca", title: "Dollar-Cost Averaging", description: "Invest the same amount monthly — no need to time the market!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "diversify", title: "Diversification 101", description: "Don't put all eggs in one basket — spread across stocks, bonds, and more!", tags: ["Investing & Stocks", "Start investing"] },
  { id: "freelance", title: "Freelancing Income", description: "Turn skills like writing, design, or coding into paid gigs on platforms like Upwork!", tags: ["Side Hustles & Income", "Start a side hustle"] },
  { id: "networking", title: "Network = Net Worth", description: "80% of jobs come through connections — start building your network now!", tags: ["Career & Salary", "Side Hustles & Income"] },
  { id: "carbudget", title: "Buying Your First Car", description: "The 20/4/10 rule: 20% down, 4-year loan max, 10% of income for costs!", tags: ["Budgeting & Saving", "Buy a car"] },
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

  const firstGoal = profile.financialGoals[0] || "Getting started";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Welcome */}
        <section className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Welcome back, {profile.name || "Explorer"}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.studentStatus || "Student"} • {firstGoal} • Quiz Score: {profile.quizScore !== null ? `${profile.quizScore}/5` : "N/A"}
          </p>
        </section>

        {/* Tips */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">Personalized Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <div
                key={tip.id}
                className="relative group rounded-xl border border-border bg-card p-5 card-shadow flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <button
                  onClick={() => dismissTip(tip.id)}
                  title="This doesn't interest me"
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted hover:text-foreground"
                >
                  <X size={16} />
                </button>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 pr-8">{tip.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tip.description}</p>
                <button
                  onClick={() => navigate(`/tip/${tip.id}`)}
                  className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Explore Further <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={refreshTips}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:bg-muted"
            >
              <RefreshCw size={15} /> Refresh Tips
            </button>
          </div>
        </section>

        {/* Retest Knowledge */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <button
            onClick={() => navigate("/quiz?set=2")}
            className="w-full rounded-xl border border-border bg-card p-6 card-shadow text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <Trophy size={28} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-semibold text-foreground">Retest Your Knowledge</h3>
              <p className="text-sm text-muted-foreground">Take a new quiz with advanced questions to see how much you've learned!</p>
            </div>
            <ArrowRight size={20} className="text-muted-foreground shrink-0" />
          </button>
        </section>

        {/* Hub links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { to: "/learn", icon: BookOpen, title: "Learning Hub", desc: "Deep dives & interactive lessons", accent: "hsl(var(--secondary))", accentBg: "bg-secondary/10", accentBorder: "hover:border-secondary/40", accentShadow: "hover:shadow-[0_12px_40px_hsl(220_70%_50%/0.1)]", accentText: "group-hover:text-secondary" },
            { to: "/market", icon: TrendingUp, title: "Market Ideas", desc: "Trends & investment insights", accent: "hsl(var(--accent))", accentBg: "bg-accent/10", accentBorder: "hover:border-accent/40", accentShadow: "hover:shadow-[0_12px_40px_hsl(155_60%_45%/0.1)]", accentText: "group-hover:text-accent" },
            { to: "/news", icon: Newspaper, title: "Economic News", desc: "Current events, simplified", accent: "hsl(var(--primary))", accentBg: "bg-primary/10", accentBorder: "hover:border-primary/40", accentShadow: "hover:shadow-[0_12px_40px_hsl(270_70%_55%/0.1)]", accentText: "group-hover:text-primary" },
          ].map((hub, i) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.to}
                onClick={() => navigate(hub.to)}
                className={`rounded-xl p-6 text-left border border-border bg-card card-shadow transition-all duration-300 hover:-translate-y-1 ${hub.accentBorder} ${hub.accentShadow} animate-fade-in group`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg ${hub.accentBg} flex items-center justify-center mb-3`}>
                  <Icon size={20} style={{ color: hub.accent }} />
                </div>
                <h3 className={`text-lg font-display font-bold text-foreground mb-1 ${hub.accentText} transition-colors`}>{hub.title}</h3>
                <p className="text-sm text-muted-foreground">{hub.desc}</p>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
