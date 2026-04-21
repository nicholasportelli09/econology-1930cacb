import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X, Briefcase, Loader2, TrendingUp, TrendingDown, RefreshCw, Camera, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add ticker", variant: "destructive" });
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
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">My Portfolio</span>
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
          {tickers.map(t => {
            const q = quotes[t];
            const isUp = q && q.change >= 0;
            return (
              <div key={t} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-foreground">{t}</span>
                  {q && q.price > 0 && (
                    <span className="text-sm font-semibold text-foreground">${q.price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {q && q.price > 0 && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-accent" : "text-destructive"}`}>
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isUp ? "+" : ""}{q.changePercent.toFixed(2)}%
                    </span>
                  )}
                  {quotesLoading && !q && (
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  )}
                  <button onClick={() => removeTicker(t)} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No tickers yet. Add your holdings to get personalized news.</p>
      )}
    </div>
  );
}
