import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import { NavLink } from "@/components/NavLink";
import {
  Newspaper,
  TrendingUp,
  BookOpen,
  MessageCircle,
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  Sparkles,
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

interface NewsItem {
  title: string;
  summary: string;
  impact: string;
  action: string;
  category: string;
}

interface NewsData {
  news: NewsItem[];
  lastUpdated: string;
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

const categoryColor = (cat: string) => {
  switch (cat) {
    case "Interest Rates":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "Inflation":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "Jobs":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Markets":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "Policy":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const EconomicNews = () => {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NewsData | null>(null);
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

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "economic-news",
        { body: { profile } }
      );
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result as NewsData);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch economic news";
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
        {/* Header section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <Newspaper className="text-primary" size={32} />
              Economic News
            </h1>
            <p className="text-muted-foreground mt-1">
              Current events personalized to your financial situation.
            </p>
            {data?.lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {data.lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Fetching News...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Get Latest Economic News
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Analyzing current events for your situation...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchNews}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6">
            {data.news?.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card card-shadow overflow-hidden"
              >
                {/* Title & Category */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-display font-bold text-foreground">
                      {item.title}
                    </h2>
                    <Badge
                      className={`shrink-0 text-xs border ${categoryColor(item.category)}`}
                    >
                      {item.category}
                    </Badge>
                  </div>

                  {/* What Happened */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      What Happened
                    </span>
                    <p className="text-sm text-foreground leading-relaxed mt-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* How This Affects You */}
                <div className="border-t border-amber-500/20 bg-amber-500/10 px-6 py-4">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    How This Affects You
                  </span>
                  <p className="text-sm text-foreground leading-relaxed mt-1">
                    {item.impact}
                  </p>
                </div>

                {/* Action You Can Take */}
                <div className="border-t border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Action You Can Take
                      </span>
                      <p className="text-sm text-foreground leading-relaxed mt-1">
                        {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Newspaper size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Click "Get Latest Economic News" to see current events
              personalized to your financial situation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EconomicNews;
