import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getUSMarketStatus } from "@/lib/marketStatus";

/**
 * Compact S&P 500 leader / laggard strip — pulls SPY plus the 11 SPDR sector
 * ETFs and surfaces only the headline index print and the day's best / worst
 * sector. Replaces the full heatmap to keep the news page focused.
 */
const SECTORS: { ticker: string; name: string }[] = [
  { ticker: "SPX", name: "S&P 500" },
  { ticker: "XLK", name: "Technology" },
  { ticker: "XLF", name: "Financials" },
  { ticker: "XLV", name: "Health Care" },
  { ticker: "XLY", name: "Cons. Discretionary" },
  { ticker: "XLP", name: "Cons. Staples" },
  { ticker: "XLE", name: "Energy" },
  { ticker: "XLI", name: "Industrials" },
  { ticker: "XLC", name: "Comm. Services" },
  { ticker: "XLU", name: "Utilities" },
  { ticker: "XLRE", name: "Real Estate" },
  { ticker: "XLB", name: "Materials" },
];

type Quote = { price: number; change: number; changePercent: number };
type QuoteMap = Record<string, Quote>;

export function SectorHeatmap() {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tickers = SECTORS.map(s => s.ticker).join(",");
      const { data, error } = await supabase.functions.invoke("stock-quote", { body: { tickers } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuotes((data?.quotes || {}) as QuoteMap);
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load sector data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const spx = quotes["SPX"];
  const status = getUSMarketStatus();
  const showChange = status.isOpen; // only show today's % move during the live session
  const sectors = SECTORS.slice(1);
  const sorted = [...sectors].sort((a, b) => {
    const pa = quotes[a.ticker]?.changePercent ?? -999;
    const pb = quotes[b.ticker]?.changePercent ?? -999;
    return pb - pa;
  });
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const topQ = top ? quotes[top.ticker] : undefined;
  const bottomQ = bottom ? quotes[bottom.ticker] : undefined;
  const ready = !!topQ && !!bottomQ;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-foreground">S&P 500 — today's pulse</h2>
            <p className="text-[11px] text-muted-foreground">
              {status.isOpen
                ? "Index print plus the day's leader and laggard sector."
                : status.reason}
            </p>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
          status.isOpen
            ? "text-accent border-accent/30 bg-accent/10"
            : "text-muted-foreground border-border bg-muted/40"
        )}>
          <Clock size={10} /> {status.label}
        </div>
        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        </button>
      </header>

      {error && !loading && (
        <div className="text-center py-4">
          <p className="text-destructive text-xs mb-1.5">{error}</p>
          <button onClick={load} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      )}

      {loading && !ready && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!error && ready && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* S&P 500 index (points, not dollars) */}
          {spx && (
            <div className={cn(
              "rounded-lg border p-3",
              !showChange
                ? "bg-muted/40 border-border"
                : spx.changePercent >= 0
                ? "bg-accent/10 border-accent/30"
                : "bg-destructive/10 border-destructive/30"
            )}>
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">S&P 500 (SPX)</p>
              {showChange ? (
                <>
                  <p className={cn(
                    "text-lg font-mono font-bold mt-0.5",
                    spx.changePercent >= 0 ? "text-accent" : "text-destructive"
                  )}>
                    {spx.changePercent >= 0 ? "+" : ""}{spx.changePercent.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {spx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-mono font-bold mt-0.5 text-foreground">
                    {spx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-muted-foreground">pts</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Last close</p>
                </>
              )}
            </div>
          )}
          {/* Leader */}
          <div className={cn(
            "rounded-lg border p-3",
            showChange ? "bg-accent/10 border-accent/30" : "bg-muted/40 border-border"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider",
              showChange ? "text-accent" : "text-muted-foreground"
            )}>
              <TrendingUp size={11} /> Leader
            </div>
            <p className="text-sm font-semibold text-foreground mt-1 truncate">{top!.name}</p>
            {showChange ? (
              <p className="text-base font-mono font-bold text-accent mt-0.5">
                {topQ!.changePercent >= 0 ? "+" : ""}{topQ!.changePercent.toFixed(2)}%
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-0.5">No live move — markets closed</p>
            )}
          </div>
          {/* Laggard */}
          <div className={cn(
            "rounded-lg border p-3",
            showChange ? "bg-destructive/10 border-destructive/30" : "bg-muted/40 border-border"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider",
              showChange ? "text-destructive" : "text-muted-foreground"
            )}>
              <TrendingDown size={11} /> Laggard
            </div>
            <p className="text-sm font-semibold text-foreground mt-1 truncate">{bottom!.name}</p>
            {showChange ? (
              <p className="text-base font-mono font-bold text-destructive mt-0.5">
                {bottomQ!.changePercent.toFixed(2)}%
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-0.5">No live move — markets closed</p>
            )}
          </div>
        </div>
      )}

      {updatedAt && ready && (
        <p className="text-[10px] text-muted-foreground text-right mt-2">
          Updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </section>
  );
}