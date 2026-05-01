import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  GraduationCap,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X,
  Check,
  Newspaper,
  Brain,
  Zap,
} from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CaseStudy {
  name: string;
  ticker: string;
  description: string;
  startingAmount: string; // kept for back-compat with edge function payload
  riskLevel: "Low" | "Medium" | "High";
  whyGood: string;
  personalizedNote: string;
}

interface MarketData {
  investments: CaseStudy[];
  marketContext: string;
  disclaimer: string;
}

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const lensColor = (level: string) => {
  switch (level) {
    case "Low": return "bg-accent/15 text-accent border-accent/30";
    case "Medium": return "bg-secondary/15 text-secondary border-secondary/30";
    case "High": return "bg-primary/15 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const MarketIdeas = () => {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketData | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    setDismissed(new Set());
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("market-insights", { body: { profile } });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result as MarketData);
    } catch (e: any) {
      const msg = e?.message || "Failed to fetch case studies";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const dismissCase = (index: number, reason: "not_interested" | "studied") => {
    setDismissed(prev => new Set(prev).add(index));
    toast({
      title: reason === "studied" ? "Marked as studied" : "Hidden",
      description: reason === "studied" ? "We'll prioritise different case studies next time." : "Hidden from this set.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-8 space-y-8">
        {/* Educational-only banner — prominent, unmissable */}
        <div className="flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={22} />
          <div className="text-sm text-destructive leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-xs mb-1">Education only — not financial advice</p>
            <p>
              Nothing on this page is a recommendation to buy, sell, or hold any security. These are
              <span className="font-semibold"> teaching case studies</span> showing how an analyst might
              think about a company or theme. Econology is not a registered investment adviser. Always do
              your own research and consult a licensed professional before making investment decisions.
            </p>
          </div>
        </div>

        {/* Economic News promo */}
        <Link
          to="/news"
          className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 p-5 hover:border-primary/50 hover:from-primary/20 transition-all card-shadow"
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Newspaper className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2 flex-wrap">
                Economic News
                <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Live</Badge>
                <Badge className="bg-accent/20 text-accent border border-accent/30 text-[10px] uppercase tracking-wider">AI insights</Badge>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Today's market-moving headlines, decoded for you.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Brain size={12} className="text-primary" /> Personalized to your portfolio</span>
                <span className="inline-flex items-center gap-1"><Zap size={12} className="text-primary" /> AI-summarized headlines</span>
                <span className="inline-flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Daily digest</span>
              </div>
            </div>
          </div>
          <ArrowRight className="text-primary shrink-0 group-hover:translate-x-1 transition-transform self-center" size={20} />
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="text-primary" size={32} />
              Analyst Lens
            </h1>
            <p className="text-muted-foreground mt-1">Teaching case studies — how an analyst might frame a company or theme.</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
              Each case study walks through the framework an analyst might apply (thesis, risks, what to watch). <span className="font-semibold text-foreground">No buy/sell verdicts.</span> For news-driven explainers, see <span className="font-medium text-foreground">Economic News</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 transition-colors shadow-sm"
            >
              <Newspaper size={16} /> Economic News
              <ArrowRight size={14} />
            </Link>
            <button onClick={fetchInsights} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analysing…</> : <><Sparkles size={18} /> Generate case studies</>}
            </button>
            {data && !loading && (
              <button onClick={fetchInsights} title="Refresh case studies" className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Building case studies relevant to your learning path…</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={fetchInsights} className="text-sm text-primary hover:underline">Try again</button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6 animate-fade-in">
            {data.marketContext && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Market Context</h2>
                <p className="text-foreground leading-relaxed">{data.marketContext}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.investments?.map((inv, i) => {
                if (dismissed.has(i)) return null;
                return (
                  <div key={i} className="relative group rounded-xl border border-border bg-card p-6 card-shadow flex flex-col transition-all hover:-translate-y-0.5 hover:border-primary/30">
                    {/* Dismiss actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => dismissCase(i, "studied")}
                        title="Mark as studied"
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/20 hover:text-accent transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => dismissCase(i, "not_interested")}
                        title="Hide"
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-3 pr-16">
                      <h3 className="text-lg font-display font-bold text-foreground">{inv.name}</h3>
                      <Badge className={`shrink-0 text-xs border ${lensColor(inv.riskLevel)}`}>{inv.riskLevel} complexity</Badge>
                    </div>
                    {inv.ticker && inv.ticker !== "N/A" && <span className="text-xs font-mono text-primary mb-3">{inv.ticker}</span>}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{inv.description}</p>
                    <div className="space-y-3 mb-5 flex-1">
                      <div><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">The Thesis</span><p className="text-sm text-foreground">{inv.whyGood}</p></div>
                      <div><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why study this</span><p className="text-sm text-primary/90 italic">{inv.personalizedNote}</p></div>
                      <div><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position-sizing example</span><p className="text-sm text-foreground font-medium">{inv.startingAmount} <span className="text-muted-foreground font-normal">— illustrative only</span></p></div>
                    </div>
                    <button onClick={() => navigate("/investment", { state: { investment: inv } })} className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 mt-auto">
                      Walk through the framework <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center italic">
              These are educational case studies, not recommendations. Econology is not a registered investment adviser.
            </p>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <GraduationCap size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground">Click <span className="font-semibold">"Generate case studies"</span> to see how an analyst might frame three current names — purely as a teaching exercise.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketIdeas;
