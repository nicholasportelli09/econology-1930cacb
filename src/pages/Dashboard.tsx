import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  ArrowRight,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Newspaper,
  MessageCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Tip {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const ALL_TIPS: Tip[] = [
  {
    id: "budget",
    title: "50/30/20 Budget",
    description: "Split income: 50% needs, 30% wants, 20% savings!",
    tags: ["Budgeting & Saving", "Build emergency savings"],
  },
  {
    id: "inflation",
    title: "Beat Inflation",
    description: "Invest to protect your money from 3% yearly loss!",
    tags: ["Investing & Stocks", "Start investing"],
  },
  {
    id: "credit",
    title: "Credit Score Matters",
    description: "Good credit (700+) saves thousands in interest!",
    tags: ["Credit Cards & Credit Score", "Build credit score"],
  },
  {
    id: "emergency",
    title: "Emergency Fund",
    description: "Save 3-6 months expenses for unexpected events!",
    tags: ["Budgeting & Saving", "Build emergency savings"],
  },
  {
    id: "index",
    title: "Index Funds",
    description: "Buy 500 companies at once with low fees!",
    tags: ["Investing & Stocks", "Start investing"],
  },
  {
    id: "hustle",
    title: "Side Hustle Power",
    description: "$200/month extra = $2,400/year!",
    tags: ["Side Hustles & Income", "Start a side hustle"],
  },
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

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/market", label: "Market Ideas", icon: TrendingUp },
  { to: "/news", label: "Economic News", icon: Newspaper },
  { to: "/ask", label: "Ask Claude", icon: MessageCircle },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, isGuest } = useAuth();
  const profile = useMemo(getProfile, []);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [tips, setTips] = useState(() => pickTips(profile, new Set()));

  const dismissTip = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.add(id);
        const newTips = pickTips(profile, next);
        setTips(newTips);
        return next;
      });
    },
    [profile],
  );

  const refreshTips = useCallback(() => {
    // Shuffle available tips by adding randomness
    const available = ALL_TIPS.filter((t) => !dismissed.has(t.id));
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, 3);
    setTips(shuffled);
  }, [dismissed]);

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const firstGoal = profile.financialGoals[0] || "Getting started";

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <EconologyLogo size={36} />
            <span className="font-display text-lg font-bold gradient-text hidden sm:inline">
              Econology
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                activeClassName="text-foreground bg-muted"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/")}>
                Landing Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/onboarding")}>
                Redo Onboarding
              </DropdownMenuItem>
              {isGuest ? (
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  Sign In
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => signOut().then(() => navigate("/"))}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground whitespace-nowrap transition-colors hover:text-foreground hover:bg-muted"
                activeClassName="text-foreground bg-muted"
              >
                <Icon size={14} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Welcome */}
        <section>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Welcome back, {profile.name || "Explorer"}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.studentStatus || "Student"} •{" "}
            {firstGoal} •{" "}
            Quiz Score: {profile.quizScore !== null ? `${profile.quizScore}/5` : "N/A"}
          </p>
        </section>

        {/* Tips */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Personalized Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="relative group rounded-xl border border-border bg-card p-5 card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30"
              >
                {/* Dismiss */}
                <button
                  onClick={() => dismissTip(tip.id)}
                  title="This doesn't interest me"
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted hover:text-foreground"
                >
                  <X size={16} />
                </button>

                <h3 className="text-lg font-display font-semibold text-foreground mb-2 pr-8">
                  {tip.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {tip.description}
                </p>
                <button
                  onClick={() => navigate(`/tip/${tip.id}`)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
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

        {/* Hub links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            onClick={() => navigate("/learn")}
            className="rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(220 70% 50%), hsl(220 70% 35%))",
            }}
          >
            <BookOpen size={28} className="text-primary-foreground mb-3" />
            <h3 className="text-xl font-display font-bold text-primary-foreground mb-1">
              Learning Hub
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Deep dives & interactive lessons
            </p>
          </button>

          <button
            onClick={() => navigate("/market")}
            className="rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(155 60% 45%), hsl(155 60% 30%))",
            }}
          >
            <TrendingUp size={28} className="text-primary-foreground mb-3" />
            <h3 className="text-xl font-display font-bold text-primary-foreground mb-1">
              Market Ideas
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Trends & investment insights
            </p>
          </button>

          <button
            onClick={() => navigate("/news")}
            className="rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(30 80% 55%), hsl(30 80% 40%))",
            }}
          >
            <Newspaper size={28} className="text-primary-foreground mb-3" />
            <h3 className="text-xl font-display font-bold text-primary-foreground mb-1">
              Economic News
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Current events, simplified
            </p>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
