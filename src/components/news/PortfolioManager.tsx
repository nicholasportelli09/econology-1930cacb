import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X, Briefcase, Loader2, TrendingUp, TrendingDown, RefreshCw, Camera, ChevronDown, Activity, LineChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUSMarketStatus } from "@/lib/marketStatus";
import { Disclaimer } from "@/components/Disclaimer";

interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

interface PortfolioManagerProps {
  userId: string | undefined;
  tickers: string[];
  onUpdate: (tickers: string[]) => void;
  loading: boolean;
}

export function PortfolioManager({ userId, tickers, onUpdate, loading }: PortfolioManagerProps) {
  const [newTicker, setNewTicker] = useState("");
  const [adding, setAdding] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const marketStatus = getUSMarketStatus();
  // Always surface % change next to each holding — when the market is closed
  // it reflects the last close, and we label it as such via tooltip.

  const fetchQuotes = useCallback(async () => {
    if (tickers.length === 0) return;
    setQuotesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-quote", {
        body: { tickers: tickers.join(",") },
      });
      if (error) throw error;
      if (data?.quotes) setQuotes(data.quotes);
    } catch (e: any) {
      console.error("Failed to fetch quotes:", e);
    } finally {
      setQuotesLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    if (tickers.length > 0) fetchQuotes();
  }, [tickers, fetchQuotes]);

  const addTicker = async () => {
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker || !userId) return;
    if (tickers.includes(ticker)) {
      toast({ title: "Already in portfolio", description: `${ticker} is already tracked.` });
      setNewTicker("");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("user_portfolio").insert({ user_id: userId, ticker });
      if (error) throw error;
      onUpdate([...tickers, ticker]);
      setNewTicker("");
      toast({ title: "Added", description: `${ticker} added to your portfolio.` });
      import("@/lib/analytics").then(({ track }) => track("watchlist_ticker_added", { ticker, source: "manual" }));
      import("@/lib/productAnalytics").then(({ trackProduct }) => void trackProduct("watchlist_ticker_added"));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add ticker", variant: "destructive" });
      import("@/lib/analytics").then(({ trackError }) => trackError(e, { where: "addTicker", ticker }));
    } finally {
      setAdding(false);
    }
  };

  const removeTicker = async (ticker: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("user_portfolio").delete().eq("user_id", userId).eq("ticker", ticker);
      if (error) throw error;
      onUpdate(tickers.filter(t => t !== ticker));
      setQuotes(prev => {
        const next = { ...prev };
        delete next[ticker];
        return next;
      });
      toast({ title: "Removed", description: `${ticker} removed from portfolio.` });
      import("@/lib/analytics").then(({ track }) => track("watchlist_ticker_removed", { ticker }));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to remove", variant: "destructive" });
    }
  };

  const handleScreenshot = async (file: File) => {
    if (!userId) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please use an image under 8MB.", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("portfolio-from-image", {
        body: { imageBase64: base64, mimeType: file.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const found: string[] = data?.tickers || [];
      const newOnes = found.filter(t => !tickers.includes(t));
      if (newOnes.length === 0) {
        toast({
          title: found.length > 0 ? "Already tracking" : "No tickers found",
          description: found.length > 0
            ? `All ${found.length} detected tickers are already in your portfolio.`
            : "Couldn't detect any tickers in that screenshot. Try a clearer image.",
        });
        return;
      }
      const rows = newOnes.map(ticker => ({ user_id: userId, ticker }));
      const { error: insertErr } = await supabase.from("user_portfolio").insert(rows);
      if (insertErr) throw insertErr;
      onUpdate([...tickers, ...newOnes]);
      toast({
        title: `Added ${newOnes.length} ticker${newOnes.length > 1 ? "s" : ""}`,
        description: newOnes.join(", "),
      });
      import("@/lib/analytics").then(({ track }) =>
        newOnes.forEach((t) => track("watchlist_ticker_added", { ticker: t, source: "screenshot" })),
      );
      import("@/lib/productAnalytics").then(({ trackProduct }) => {
        newOnes.forEach(() => void trackProduct("watchlist_ticker_added"));
      });
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message || "Could not read screenshot", variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!userId) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        <Briefcase size={20} className="mx-auto mb-2 text-muted-foreground/50" />
        Sign in to connect your portfolio and get personalized news.
      </div>
    );
  }

  return (
    <div className="space-y-3">
    <Disclaimer />
    <div className="grid gap-4 lg:grid-cols-2">
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 min-w-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">My Portfolio</span>
          {marketStatus.isOpen ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent" title={marketStatus.reason}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Live prices
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border bg-muted/50 px-1.5 py-0.5 rounded"
              title={marketStatus.reason}
            >
              {marketStatus.isWeekend ? "Markets closed · weekend" : "Markets closed"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Import from screenshot"
          >
            {importing ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {importing ? "Reading..." : "Import screenshot"}
          </button>
          {tickers.length > 0 && (
            <button
              onClick={fetchQuotes}
              disabled={quotesLoading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              title="Refresh prices"
            >
              <RefreshCw size={12} className={quotesLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleScreenshot(f);
          }}
        />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); addTicker(); }} className="flex gap-2">
        <Input
          placeholder="Add ticker (e.g. AAPL)"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          className="flex-1 h-9 text-sm"
          maxLength={10}
        />
        <button
          type="submit"
          disabled={adding || !newTicker.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Loading portfolio...
        </div>
      ) : tickers.length > 0 ? (
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="text-xs font-medium text-foreground">
              {tickers.length} {tickers.length === 1 ? "holding" : "holdings"}
              <span className="ml-2 font-mono text-muted-foreground">
                {tickers.slice(0, 4).join(" · ")}{tickers.length > 4 ? ` +${tickers.length - 4}` : ""}
              </span>
            </span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {tickers.map(t => {
            const q = quotes[t];
            const isUp = q && q.change >= 0;
            const isActive = activeChart === t;
            return (
              <div
                key={t}
                className={`group flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                  isActive ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                }`}
                onClick={() => setActiveChart(isActive ? null : t)}
                title={isActive ? "Hide chart" : "Click to view live chart"}
              >
                <div className="flex items-center gap-2">
                  <LineChart size={14} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                  <span className="text-sm font-mono font-semibold text-foreground">{t}</span>
                  {q && q.price > 0 && (
                    <span className="text-sm font-semibold text-foreground">${q.price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`hidden sm:inline text-[10px] font-semibold uppercase tracking-wider transition-opacity ${isActive ? "text-primary opacity-100" : "text-primary opacity-0 group-hover:opacity-100"}`}>
                    {isActive ? "Viewing" : "View chart"}
                  </span>
                  {q && q.price > 0 && (
                    showChange ? (
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-accent" : "text-destructive"}`}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isUp ? "+" : ""}{q.changePercent.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Last close</span>
                    )
                  )}
                  {quotesLoading && !q && (
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTicker(t); }}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No tickers yet. Add your holdings to get personalized news.</p>
      )}
    </div>

    {activeChart ? (
      <div className="rounded-xl border-2 border-primary/30 bg-card p-4 space-y-3 min-w-0 shadow-lg shadow-primary/5 animate-fade-in">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
              <Activity size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Chart</span>
            </div>
            <span className="text-base font-mono font-bold text-foreground">{activeChart}</span>
            {quotes[activeChart]?.price > 0 && (
              <>
                <span className="text-base font-bold text-foreground">
                  ${quotes[activeChart].price.toFixed(2)}
                </span>
                {showChange ? (
                  <span className={`flex items-center gap-0.5 text-sm font-semibold ${quotes[activeChart].change >= 0 ? "text-accent" : "text-destructive"}`}>
                    {quotes[activeChart].change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {quotes[activeChart].change >= 0 ? "+" : ""}{quotes[activeChart].changePercent.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground border border-border bg-muted/50 px-2 py-0.5 rounded" title={marketStatus.reason}>
                    {marketStatus.isWeekend ? "Last close · weekend" : "Last close"}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => setActiveChart(null)}
            className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close chart"
          >
            <X size={16} />
          </button>
        </div>
        <iframe
          key={activeChart}
          title={`${activeChart} chart`}
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_${activeChart}&symbol=${encodeURIComponent(activeChart)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=light&style=1&timezone=Etc%2FUTC&withdateranges=1`}
          className="w-full h-[440px] rounded-lg border border-border bg-muted/20"
          loading="lazy"
        />
        <p className="text-[10px] text-muted-foreground text-center">Interactive chart by TradingView · Click any holding to switch</p>
      </div>
    ) : tickers.length > 0 ? (
      <button
        onClick={() => setActiveChart(tickers[0])}
        className="hidden lg:flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 text-center hover:border-primary/60 hover:from-primary/10 hover:to-secondary/10 transition-all group min-h-[300px]"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
          <LineChart size={28} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">View live charts</p>
        <p className="text-xs text-muted-foreground max-w-[240px]">
          Click any ticker on the left to open an interactive TradingView chart right here.
        </p>
        <span className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Tap to preview {tickers[0]} →
        </span>
      </button>
    ) : null}
    </div>
    </div>
  );
}
