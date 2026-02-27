import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Newspaper,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
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
    case "Interest Rates": return "bg-secondary/15 text-secondary border-secondary/30";
    case "Inflation": return "bg-destructive/15 text-destructive border-destructive/30";
    case "Jobs": return "bg-accent/15 text-accent border-accent/30";
    case "Markets": return "bg-primary/15 text-primary border-primary/30";
    case "Policy": return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const EconomicNews = () => {
  const profile = useMemo(getProfile, []);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NewsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("economic-news", { body: { profile } });
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
      <DashboardHeader initials={initials} />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <Newspaper className="text-primary" size={32} />
              Economic News
            </h1>
            <p className="text-muted-foreground mt-1">Current events personalized to your financial situation.</p>
            {data?.lastUpdated && <p className="text-xs text-muted-foreground mt-1">Last updated: {data.lastUpdated}</p>}
          </div>
          <button onClick={fetchNews} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Fetching News...</> : <><Sparkles size={18} /> Get Latest Economic News</>}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Analyzing current events for your situation...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={fetchNews} className="text-sm text-primary hover:underline">Try again</button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6 animate-fade-in">
            {data.news?.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-display font-bold text-foreground">{item.title}</h2>
                    <Badge className={`shrink-0 text-xs border ${categoryColor(item.category)}`}>{item.category}</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What Happened</span>
                    <p className="text-sm text-foreground leading-relaxed mt-1">{item.summary}</p>
                  </div>
                </div>
                <div className="border-t border-orange-500/20 bg-orange-500/10 px-6 py-4">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">How This Affects You</span>
                  <p className="text-sm text-foreground leading-relaxed mt-1">{item.impact}</p>
                </div>
                <div className="border-t border-accent/20 bg-accent/10 px-6 py-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">Action You Can Take</span>
                      <p className="text-sm text-foreground leading-relaxed mt-1">{item.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Newspaper size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">Click "Get Latest Economic News" to see current events personalized to your financial situation.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EconomicNews;
