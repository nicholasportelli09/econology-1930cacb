import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Newspaper, Loader2, CheckCircle2, Sparkles, TrendingUp, Search, RefreshCw,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArticleCard, type Article } from "@/components/news/ArticleCard";
import { NewsDigest } from "@/components/news/NewsDigest";
import { PortfolioManager } from "@/components/news/PortfolioManager";
import { PinnedArticles } from "@/components/news/PinnedArticles";
import { useAuth } from "@/contexts/AuthContext";

/* ── Types ── */
interface AiNewsItem { title: string; summary: string; impact: string; action: string; category: string; }
interface AiNewsData { news: AiNewsItem[]; lastUpdated: string; }
interface PinnedArticleRow {
  id: string; title: string; url: string; image: string; site: string;
  symbol: string; published_date: string; snippet: string;
}

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch { return defaultProfile; }
}

/** Pick up to `limit` articles, prioritizing source diversity (max 2 per outlet). */
function diversifyBySource(articles: Article[], limit = 10): Article[] {
  const counts = new Map<string, number>();
  const picked: Article[] = [];
  const overflow: Article[] = [];
  for (const a of articles) {
    const src = (a.site || "unknown").toLowerCase();
    const c = counts.get(src) || 0;
    if (c < 2 && picked.length < limit) {
      picked.push(a);
      counts.set(src, c + 1);
    } else {
      overflow.push(a);
    }
  }
  for (const a of overflow) {
    if (picked.length >= limit) break;
    picked.push(a);
  }
  return picked;
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
  const { user } = useAuth();

  /* Market news (Finnhub) */
  /* Unified headlines (general market + ticker/company news) */
  const [headlinesLoading, setHeadlinesLoading] = useState(false);
  const [headlinesArticles, setHeadlinesArticles] = useState<Article[]>([]);
  const [headlinesError, setHeadlinesError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modeLabel, setModeLabel] = useState<string>("General market headlines");

  /* AI news */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<AiNewsData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  /* Portfolio */
  const [portfolioTickers, setPortfolioTickers] = useState<string[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  /* Pinned articles */
  const [pinnedArticles, setPinnedArticles] = useState<PinnedArticleRow[]>([]);
  const [pinnedLoading, setPinnedLoading] = useState(true);
  const pinnedUrls = useMemo(() => new Set(pinnedArticles.map(a => a.url)), [pinnedArticles]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return dateStr; }
  };

  /* ── Load portfolio & pins ── */
  useEffect(() => {
    if (!user) { setPortfolioLoading(false); setPinnedLoading(false); return; }
    const loadData = async () => {
      const [portfolioRes, pinnedRes] = await Promise.all([
        supabase.from("user_portfolio").select("ticker").eq("user_id", user.id),
        supabase.from("pinned_articles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setPortfolioTickers((portfolioRes.data || []).map((r: any) => r.ticker));
      setPinnedArticles((pinnedRes.data || []) as PinnedArticleRow[]);
      setPortfolioLoading(false);
      setPinnedLoading(false);
    };
    loadData();
  }, [user]);

  /* ── Unified Headlines fetcher ── */
  const KNOWN_CATEGORIES = ["general", "forex", "crypto", "merger"];
  const TICKER_RE = /^[A-Za-z]{1,5}$/;

  const fetchHeadlines = useCallback(async (rawQuery: string, opts?: { usePortfolio?: boolean }) => {
    setHeadlinesLoading(true);
    setHeadlinesError(null);
    const q = rawQuery.trim();
    try {
      let articles: Article[] = [];
      let label = "General market headlines";

      if (opts?.usePortfolio) {
        if (portfolioTickers.length === 0) {
          toast({ title: "No portfolio tickers", description: "Add tickers to your portfolio to see personalized news.", variant: "destructive" });
          setHeadlinesLoading(false);
          return;
        }
        const { data, error } = await supabase.functions.invoke("fmp-stock-news", {
          body: { limit: 20, tickers: portfolioTickers.join(",") },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        // Dedupe by URL, sort by publishedDate desc
        const seen = new Set<string>();
        articles = (data.articles || [])
          .filter((a: Article) => {
            if (!a.url || seen.has(a.url)) return false;
            seen.add(a.url);
            return true;
          })
          .sort((a: Article, b: Article) =>
            new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime()
          );
        label = `Your portfolio (${portfolioTickers.join(", ")})`;
      } else if (TICKER_RE.test(q) && !KNOWN_CATEGORIES.includes(q.toLowerCase())) {
        const ticker = q.toUpperCase();
        const { data, error } = await supabase.functions.invoke("fmp-stock-news", {
          body: { limit: 15, tickers: ticker },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        articles = data.articles || [];
        label = `${ticker} company news`;
      } else if (q) {
        const category = q.toLowerCase();
        const { data, error } = await supabase.functions.invoke("stock-news", {
          body: { limit: 20, category },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        articles = data.articles || [];
        label = `${category.charAt(0).toUpperCase() + category.slice(1)} headlines`;
      } else {
        const { data, error } = await supabase.functions.invoke("stock-news", {
          body: { limit: 20 },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        articles = data.articles || [];
        label = "General market headlines";
      }

      setHeadlinesArticles(diversifyBySource(articles, 10));
      setModeLabel(label);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch headlines";
      setHeadlinesError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setHeadlinesLoading(false);
    }
  }, [portfolioTickers, toast]);

  /* ── Fetch AI Insights ── */
  const fetchAiNews = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke("economic-news", {
        body: { profile, portfolioTickers },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiData(data as AiNewsData);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch economic news";
      setAiError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setAiLoading(false); }
  };

  /* ── Pin / Unpin ── */
  const pinArticle = async (article: Article) => {
    if (!user) { toast({ title: "Sign in required", description: "Log in to pin articles." }); return; }
    try {
      const { data, error } = await supabase.from("pinned_articles").insert({
        user_id: user.id,
        title: article.title,
        url: article.url,
        image: article.image || "",
        site: article.site || "",
        symbol: article.symbol || "",
        published_date: article.publishedDate || "",
        snippet: article.text?.slice(0, 300) || "",
      }).select().single();
      if (error) throw error;
      setPinnedArticles(prev => [data as PinnedArticleRow, ...prev]);
      toast({ title: "Pinned!", description: "Article saved to your pins." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to pin", variant: "destructive" });
    }
  };

  const unpinByUrl = async (url: string) => {
    if (!user) return;
    const pin = pinnedArticles.find(a => a.url === url);
    if (!pin) return;
    await unpinById(pin.id);
  };

  const unpinById = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("pinned_articles").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      setPinnedArticles(prev => prev.filter(a => a.id !== id));
      toast({ title: "Unpinned", description: "Article removed from pins." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to unpin", variant: "destructive" });
    }
  };

  /* ── Shared article list renderer ── */
  const renderArticleList = (
    articles: Article[], loading: boolean, error: string | null, onRetry: () => void, emptyText: string
  ) => (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Fetching latest headlines...</p>
        </div>
      )}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-destructive mb-3">{error}</p>
          <button onClick={onRetry} className="text-sm text-primary hover:underline">Try again</button>
        </div>
      )}
      {articles.length > 0 && !loading && (
        <>
          <NewsDigest articles={articles} profile={profile} />
          <div className="grid gap-4 animate-fade-in">
            {articles.map((article, i) => (
              <ArticleCard
                key={i}
                article={article}
                profile={profile}
                formatDate={formatDate}
                isPinned={pinnedUrls.has(article.url)}
                onPin={user ? pinArticle : undefined}
                onUnpin={user ? unpinByUrl : undefined}
              />
            ))}
          </div>
        </>
      )}
      {articles.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Newspaper size={48} className="text-muted-foreground/30" />
          <p className="text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
            <Newspaper className="text-primary" size={32} />
            Economic News
          </h1>
          <p className="text-muted-foreground mt-1">Real-time market headlines, stock news & AI-personalized insights.</p>
        </div>

        {/* Portfolio & Pins row */}
        <div className="grid md:grid-cols-2 gap-4">
          <PortfolioManager
            userId={user?.id}
            tickers={portfolioTickers}
            onUpdate={setPortfolioTickers}
            loading={portfolioLoading}
          />
          <PinnedArticles
            articles={pinnedArticles}
            loading={pinnedLoading}
            onUnpin={unpinById}
            formatDate={formatDate}
          />
        </div>

        <Tabs defaultValue="headlines" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="headlines" className="flex items-center gap-2">
              <Newspaper size={16} /> Headlines
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles size={16} /> AI Insights
            </TabsTrigger>
          </TabsList>

          {/* ═══════ Headlines Tab (unified market + company) ═══════ */}
          <TabsContent value="headlines" className="space-y-4 mt-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchHeadlines(query); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search ticker (AAPL) or topic (forex, crypto, merger)…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <button
                type="submit"
                disabled={headlinesLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {headlinesLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                {headlinesLoading ? "Loading..." : "Fetch News"}
              </button>
            </form>

            {/* Quick filter chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setQuery(""); fetchHeadlines(""); }}
                disabled={headlinesLoading}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                All
              </button>
              <button
                onClick={() => { setQuery(""); fetchHeadlines("", { usePortfolio: true }); }}
                disabled={headlinesLoading || portfolioTickers.length === 0}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                My Portfolio{portfolioTickers.length > 0 ? ` (${portfolioTickers.length})` : ""}
              </button>
              {["Crypto", "Forex", "Merger"].map((c) => (
                <button
                  key={c}
                  onClick={() => { setQuery(c.toLowerCase()); fetchHeadlines(c.toLowerCase()); }}
                  disabled={headlinesLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>

            {headlinesArticles.length > 0 && !headlinesLoading && (
              <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
                Showing: <span className="font-medium text-foreground">{modeLabel}</span>
              </p>
            )}

            {renderArticleList(
              headlinesArticles,
              headlinesLoading,
              headlinesError,
              () => fetchHeadlines(query),
              'Click "Fetch News" or pick a filter to see the latest headlines.'
            )}
          </TabsContent>

          {/* ═══════ AI Insights Tab ═══════ */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">AI Insights = short-term, news-driven moves</span> tailored to {portfolioTickers.length > 0
                ? <>your portfolio (<span className="font-mono text-primary">{portfolioTickers.join(", ")}</span>)</>
                : "your profile"}: hedges, rebalances and ways to take advantage of what's happening this week. For long-term buy-and-hold ideas, see <span className="font-medium text-foreground">Market Ideas</span>.
            </div>
            <div className="flex justify-between items-center gap-2">
              {aiData?.lastUpdated && <p className="text-xs text-muted-foreground">Last updated: {aiData.lastUpdated}</p>}
              <div className="flex items-center gap-2 ml-auto">
                {aiData && !aiLoading && (
                  <button onClick={fetchAiNews} title="Refresh insights" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
                <button
                  onClick={fetchAiNews}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Get AI Insights</>}
                </button>
              </div>
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
