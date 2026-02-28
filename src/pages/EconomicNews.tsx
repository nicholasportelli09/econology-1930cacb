import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Newspaper,
  Loader2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Search,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ── AI-powered news types ── */
interface AiNewsItem {
  title: string;
  summary: string;
  impact: string;
  action: string;
  category: string;
}

interface AiNewsData {
  news: AiNewsItem[];
  lastUpdated: string;
}

/* ── FMP stock news types ── */
interface StockArticle {
  title: string;
  text: string;
  url: string;
  image: string;
  site: string;
  publishedDate: string;
  symbol: string;
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
  const { toast } = useToast();

  /* AI news state */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<AiNewsData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  /* Stock news state */
  const [stockLoading, setStockLoading] = useState(false);
  const [stockArticles, setStockArticles] = useState<StockArticle[]>([]);
  const [stockError, setStockError] = useState<string | null>(null);
  const [tickerSearch, setTickerSearch] = useState("");

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ── Fetch AI-personalized news ── */
  const fetchAiNews = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("economic-news", { body: { profile } });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setAiData(result as AiNewsData);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch economic news";
      setAiError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Fetch FMP stock news ── */
  const fetchStockNews = async (tickers?: string) => {
    setStockLoading(true);
    setStockError(null);
    try {
      const body: any = { limit: 15 };
      if (tickers && tickers.trim()) {
        body.type = "ticker";
        body.tickers = tickers.trim().toUpperCase();
      }
      const { data: result, error: fnError } = await supabase.functions.invoke("stock-news", { body });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setStockArticles(result.articles || []);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch stock news";
      setStockError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setStockLoading(false);
    }
  };

  const handleTickerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStockNews(tickerSearch);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
            <Newspaper className="text-primary" size={32} />
            Economic News
          </h1>
          <p className="text-muted-foreground mt-1">Real-time market headlines & AI-personalized insights.</p>
        </div>

        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <TrendingUp size={16} /> Stock News
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles size={16} /> AI Insights
            </TabsTrigger>
          </TabsList>

          {/* ═══════ Stock News Tab ═══════ */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            <form onSubmit={handleTickerSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ticker (e.g. AAPL, TSLA, MSFT)"
                  value={tickerSearch}
                  onChange={(e) => setTickerSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <button
                type="submit"
                disabled={stockLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stockLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                {stockLoading ? "Loading..." : "Fetch News"}
              </button>
            </form>

            {stockLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Fetching latest market headlines...</p>
              </div>
            )}

            {stockError && !stockLoading && (
              <div className="text-center py-12">
                <p className="text-destructive mb-3">{stockError}</p>
                <button onClick={() => fetchStockNews(tickerSearch)} className="text-sm text-primary hover:underline">Try again</button>
              </div>
            )}

            {stockArticles.length > 0 && !stockLoading && (
              <div className="grid gap-4 animate-fade-in">
                {stockArticles.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 rounded-xl border border-border bg-card p-4 card-shadow hover:border-primary/40 transition-colors"
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt=""
                        className="w-24 h-24 md:w-32 md:h-24 rounded-lg object-cover shrink-0 bg-muted"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                        <ExternalLink size={14} className="shrink-0 text-muted-foreground mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.text}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.symbol && <Badge variant="outline" className="text-xs">{article.symbol}</Badge>}
                        <span className="text-xs text-muted-foreground">{article.site}</span>
                        <span className="text-xs text-muted-foreground">· {formatDate(article.publishedDate)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {stockArticles.length === 0 && !stockLoading && !stockError && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <TrendingUp size={48} className="text-muted-foreground/30" />
                <p className="text-muted-foreground">Click "Fetch News" for the latest market headlines, or search by ticker symbol.</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════ AI Insights Tab ═══════ */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              {aiData?.lastUpdated && <p className="text-xs text-muted-foreground">Last updated: {aiData.lastUpdated}</p>}
              <button
                onClick={fetchAiNews}
                disabled={aiLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Get AI Insights</>}
              </button>
            </div>

            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Analyzing current events for your situation...</p>
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="text-center py-12">
                <p className="text-destructive mb-3">{aiError}</p>
                <button onClick={fetchAiNews} className="text-sm text-primary hover:underline">Try again</button>
              </div>
            )}

            {aiData && !aiLoading && (
              <div className="space-y-6 animate-fade-in">
                {aiData.news?.map((item, i) => (
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

            {!aiData && !aiLoading && !aiError && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <Sparkles size={48} className="text-muted-foreground/30" />
                <p className="text-muted-foreground">Click "Get AI Insights" to see current events personalized to your financial situation.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EconomicNews;
