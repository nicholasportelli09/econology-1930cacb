import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * S&P 500 sector heatmap — uses SPDR sector ETFs as proxies for the
 * 11 GICS sectors plus SPY itself for the headline index print.
 */
const SECTORS: { ticker: string; name: string }[] = [
  { ticker: "SPY", name: "S&P 500" },
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

/** Tailwind background tint based on % move. Uses semantic accent/destructive tokens. */
function tintFor(pct: number): string {
  const v = Math.abs(pct);
  if (!isFinite(pct) || v < 0.1) return "bg-muted/40 border-border";
  if (pct > 0) {
    if (v >= 2) return "bg-accent/40 border-accent/50";
    if (v >= 1) return "bg-accent/25 border-accent/40";
    if (v >= 0.5) return "bg-accent/15 border-accent/30";
    return "bg-accent/10 border-accent/20";
  }
  if (v >= 2) return "bg-destructive/40 border-destructive/50";
  if (v >= 1) return "bg-destructive/25 border-destructive/40";
  if (v >= 0.5) return "bg-destructive/15 border-destructive/30";
  return "bg-destructive/10 border-destructive/20";
}

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

  const spy = quotes["SPY"];
  const sectors = SECTORS.slice(1);
  const sorted = [...sectors].sort((a, b) => {
    const pa = quotes[a.ticker]?.changePercent ?? -999;
    const pb = quotes[b.ticker]?.changePercent ?? -999;
    return pb - pa;
  });
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Flame size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">S&P 500 Sector Heatmap</h2>
            <p className="text-xs text-muted-foreground">
              Daily % move across the 11 GICS sectors (via SPDR sector ETFs).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {spy && (
            <span className={cn(
              "px-2.5 py-1 rounded-md text-xs font-mono font-semibold border",
              spy.changePercent >= 0
                ? "bg-accent/15 text-accent border-accent/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            )}>
              SPY {spy.changePercent >= 0 ? "+" : ""}{spy.changePercent.toFixed(2)}%
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </header>

      {error && !loading && (
        <div className="text-center py-6">
          <p className="text-destructive text-sm mb-2">{error}</p>
          <button onClick={load} className="text-xs text-primary hover:underline">Try again</button>
        </div>
      )}

      {loading && Object.keys(quotes).length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {sectors.map(s => (
            <div key={s.ticker} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {!error && Object.keys(quotes).length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {sectors.map(s => {
              const q = quotes[s.ticker];
              const pct = q?.changePercent ?? 0;
              return (
                <div
                  key={s.ticker}
                  className={cn(
                    "rounded-lg border p-3 flex flex-col justify-between transition-transform hover:scale-[1.03] cursor-default",
                    tintFor(pct)
                  )}
                  title={q ? `${s.name} (${s.ticker}) — $${q.price.toFixed(2)}` : s.name}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-foreground/80">{s.ticker}</span>
                    {q && (pct >= 0
                      ? <TrendingUp size={12} className="text-accent" />
                      : <TrendingDown size={12} className="text-destructive" />)}
                  </div>
                  <div className="mt-1">
                    <p className="text-[11px] leading-tight text-foreground/80 font-medium truncate">{s.name}</p>
                    <p className={cn(
                      "text-sm font-mono font-bold mt-0.5",
                      pct >= 0 ? "text-accent" : "text-destructive"
                    )}>
                      {q ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {top && bottom && quotes[top.ticker] && quotes[bottom.ticker] && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  Leader: <span className="font-semibold text-accent">{top.name} {quotes[top.ticker].changePercent >= 0 ? "+" : ""}{quotes[top.ticker].changePercent.toFixed(2)}%</span>
                </span>
                <span>
                  Laggard: <span className="font-semibold text-destructive">{bottom.name} {quotes[bottom.ticker].changePercent.toFixed(2)}%</span>
                </span>
              </div>
              {updatedAt && (
                <span>Updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}