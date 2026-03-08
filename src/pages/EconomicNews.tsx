import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  Newspaper, Loader2, CheckCircle2, Sparkles, TrendingUp, Search, BarChart3,
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
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketArticles, setMarketArticles] = useState<Article[]>([]);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketSearch, setMarketSearch] = useState("");

  /* Stock/company news (Finnhub via fmp-stock-news) */
  const [stockLoading, setStockLoading] = useState(false);
  const [stockArticles, setStockArticles] = useState<Article[]>([]);
  const [stockError, setStockError] = useState<string | null>(null);
  const [tickerSearch, setTickerSearch] = useState("");

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

  /* ── Fetch Market News (Finnhub general news) ── */
  const fetchMarketNews = useCallback(async (search?: string) => {
    setMarketLoading(true);
    setMarketError(null);
    try {
      const body: any = { limit: 20 };
      if (search?.trim()) {
        body.category = search.trim().toLowerCase();
      }
      // Always use general market news endpoint (no tickers)
      const { data, error } = await supabase.functions.invoke("stock-news", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMarketArticles(data.articles || []);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch market news";
      setMarketError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setMarketLoading(false); }
  }, [toast]);

  /* ── Fetch Company News (Finnhub company-specific, requires ticker) ── */
  const fetchStockNews = async (tickers?: string) => {
    const query = tickers?.trim() || portfolioTickers.join(",");
    if (!query) {
      toast({ title: "Enter a ticker", description: "Search for a company ticker like AAPL, TSLA, or MSFT to see company-specific news.", variant: "destructive" });
      return;
    }
    setStockLoading(true);
    setStockError(null);
    try {
      const body: any = { limit: 15, tickers: query.toUpperCase() };
      const { data, error } = await supabase.functions.invoke("fmp-stock-news", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStockArticles(data.articles || []);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch company news";
      setStockError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setStockLoading(false); }
  };

  /* ── Fetch AI Insights ── */
  const fetchAiNews = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke("economic-news", { body: { profile } });
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
          <NewsDigest articles={articles} profile={profile} />
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

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
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

        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Newspaper size={16} /> Market News
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <BarChart3 size={16} /> Company News
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles size={16} /> AI Insights
            </TabsTrigger>
          </TabsList>

          {/* ═══════ Market News Tab (Finnhub) ═══════ */}
          <TabsContent value="market" className="space-y-4 mt-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchMarketNews(marketSearch); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter by category (e.g. general, forex, crypto, merger)"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <button
                type="submit"
                disabled={marketLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {marketLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                {marketLoading ? "Loading..." : "Fetch News"}
              </button>
            </form>
            {renderArticleList(marketArticles, marketLoading, marketError, () => fetchMarketNews(marketSearch), 'Click "Fetch News" for the latest general market headlines.')}
          </TabsContent>

          {/* ═══════ Stock News Tab ═══════ */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            <form onSubmit={(e) => { e.preventDefault(); fetchStockNews(tickerSearch); }} className="flex gap-2">
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
                {stockLoading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                {stockLoading ? "Loading..." : "Fetch Stock News"}
              </button>
            </form>
            {renderArticleList(stockArticles, stockLoading, stockError, () => fetchStockNews(tickerSearch), 'Click "Fetch Stock News" for the latest stock-specific headlines.')}
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
