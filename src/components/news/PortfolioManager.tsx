import { useState } from "react";
import { Plus, X, Briefcase, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioManagerProps {
  userId: string | undefined;
  tickers: string[];
  onUpdate: (tickers: string[]) => void;
  loading: boolean;
}

export function PortfolioManager({ userId, tickers, onUpdate, loading }: PortfolioManagerProps) {
  const [newTicker, setNewTicker] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

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
      toast({ title: "Removed", description: `${ticker} removed from portfolio.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to remove", variant: "destructive" });
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
      <div className="flex items-center gap-2">
        <Briefcase size={16} className="text-primary" />
        <span className="text-sm font-semibold text-foreground">My Portfolio</span>
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
        <div className="flex flex-wrap gap-2">
          {tickers.map(t => (
            <Badge key={t} variant="secondary" className="flex items-center gap-1 pr-1">
              {t}
              <button onClick={() => removeTicker(t)} className="ml-1 hover:text-destructive transition-colors">
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No tickers yet. Add your holdings to get personalized news.</p>
      )}
    </div>
  );
}
