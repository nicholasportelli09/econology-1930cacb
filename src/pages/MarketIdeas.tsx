import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import { NavLink } from "@/components/NavLink";
import {
  TrendingUp,
  BookOpen,
  Newspaper,
  MessageCircle,
  LayoutDashboard,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  User,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  name: string;
  ticker: string;
  description: string;
  startingAmount: string;
  riskLevel: "Low" | "Medium" | "High";
  whyGood: string;
  personalizedNote: string;
}

interface MarketData {
  investments: Investment[];
  marketContext: string;
  disclaimer: string;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/market", label: "Market Ideas", icon: TrendingUp },
  { to: "/news", label: "Economic News", icon: Newspaper },
  { to: "/ask", label: "Ask Claude", icon: MessageCircle },
];

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const riskColor = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "High":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const MarketIdeas = () => {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "market-insights",
        { body: { profile } }
      );

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setData(result as MarketData);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch market insights";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-2.5 shrink-0">
            <EconologyLogo size={36} />
            <span className="font-display text-lg font-bold gradient-text hidden sm:inline">
              Econology
            </span>
          </div>
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
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/onboarding")}>
                Redo Onboarding
              </DropdownMenuItem>
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

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-300 leading-relaxed">
            <span className="font-semibold">Disclaimer:</span> This is
            educational information only, not financial advice. Always do your
            own research and consider your personal situation before investing.
          </p>
        </div>

        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="text-primary" size={32} />
              Market Ideas
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered investment recommendations personalized for you.
            </p>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Get Latest Investment Ideas
              </>
            )}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Analyzing your profile & market conditions...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchInsights}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Market Context */}
            {data.marketContext && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Market Context
                </h2>
                <p className="text-foreground leading-relaxed">
                  {data.marketContext}
                </p>
              </div>
            )}

            {/* Investment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.investments?.map((inv, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 card-shadow flex flex-col transition-all hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-display font-bold text-foreground pr-2">
                      {inv.name}
                    </h3>
                    <Badge
                      className={`shrink-0 text-xs border ${riskColor(inv.riskLevel)}`}
                    >
                      {inv.riskLevel}
                    </Badge>
                  </div>

                  {inv.ticker && inv.ticker !== "N/A" && (
                    <span className="text-xs font-mono text-primary mb-3">
                      {inv.ticker}
                    </span>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {inv.description}
                  </p>

                  <div className="space-y-3 mb-5 flex-1">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Starting Amount
                      </span>
                      <p className="text-sm text-foreground font-medium">
                        {inv.startingAmount}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Why It's Good
                      </span>
                      <p className="text-sm text-foreground">
                        {inv.whyGood}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        For You
                      </span>
                      <p className="text-sm text-primary/90 italic">
                        {inv.personalizedNote}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/investment", { state: { investment: inv } })}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 mt-auto"
                  >
                    Explore Further <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Disclaimer from AI */}
            {data.disclaimer && (
              <p className="text-xs text-muted-foreground text-center italic">
                {data.disclaimer}
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <TrendingUp size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Click "Get Latest Investment Ideas" to receive personalized
              recommendations based on your profile.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketIdeas;
