import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";

interface CaseStudy {
  name: string;
  ticker: string;
  description: string;
  startingAmount: string;
  riskLevel: "Low" | "Medium" | "High";
  whyGood: string;
  personalizedNote: string;
  steps?: string[];
}

const lensColor = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-accent/15 text-accent border-accent/30";
    case "Medium":
      return "bg-secondary/15 text-secondary border-secondary/30";
    case "High":
      return "bg-primary/15 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const InvestmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const investment = location.state?.investment as CaseStudy | undefined;

  if (!investment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Case study not found.</p>
          <Button variant="outline" onClick={() => navigate("/market")}>
            Back to Market Ideas
          </Button>
        </div>
      </div>
    );
  }

  const tickerLabel =
    investment.ticker && investment.ticker !== "N/A"
      ? investment.ticker
      : investment.name;

  const steps = investment.steps && investment.steps.length > 0
    ? investment.steps
    : [
        `Define the thesis in one sentence — what would have to be true for this idea to work?`,
        `Identify the key drivers an analyst would track (revenue growth, margins, market share, regulation).`,
        `List the top 3 risks that would invalidate the thesis.`,
        `Find the relevant data — recent earnings, sector trends, comparable companies.`,
        `Stress-test: imagine the bull, base, and bear case. Which assumptions matter most?`,
      ];

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Investment detail — Econology" description="Step-by-step execution walkthrough and risk assessment for an Econology market idea." path="/investment" type="article" />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/market")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to Market Ideas
        </button>

        {/* Education-only banner */}
        <div className="flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4">
          <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-destructive leading-relaxed">
            <span className="font-bold">Idea only — not financial advice.</span> This walkthrough teaches a research framework. It is not a recommendation to buy, sell, or hold {tickerLabel}.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {investment.name}
            </h1>
            {investment.ticker && investment.ticker !== "N/A" && (
              <span className="text-sm font-mono text-primary mt-1 inline-block">
                {investment.ticker}
              </span>
            )}
          </div>
          <Badge className={`shrink-0 text-sm border ${lensColor(investment.riskLevel)}`}>
            {investment.riskLevel} complexity
          </Badge>
        </div>

        <p className="text-muted-foreground leading-relaxed">{investment.description}</p>

        {/* Position-sizing example (illustrative) */}
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Position-sizing example (illustrative)
          </span>
          <p className="text-2xl font-bold text-accent mt-1">
            {investment.startingAmount}
          </p>
          <p className="text-xs text-accent/80 mt-1">
            Used here only to make the framework concrete — not a recommendation.
          </p>
        </div>

        {/* The Thesis */}
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            The Thesis (how an analyst would frame it)
          </span>
          <p className="text-foreground mt-1 leading-relaxed">{investment.whyGood}</p>
        </div>

        {/* Why study this */}
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Why this idea is useful for you
          </span>
          <p className="text-foreground mt-1 leading-relaxed italic">
            {investment.personalizedNote}
          </p>
        </div>

        {/* Framework Walkthrough */}
        <section className="rounded-xl border border-primary/20 bg-card p-6 space-y-5">
          <h2 className="text-xl font-display font-semibold text-foreground">
            How an analyst would think about this — step by step
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => {
              // Remove leading "Step X:" prefix if present
              const cleanStep = step.replace(/^Step\s*\d+\s*:\s*/i, "");
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{cleanStep}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Things every analyst checks */}
        <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Things every analyst sanity-checks
          </h2>
          <ul className="space-y-2 text-sm text-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              What's the time horizon? Frameworks vary for 1-month vs 10-year views.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              What's already priced in? A great company at a bad price is still a bad idea.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              What would change my mind? Pre-defining "thesis broken" prevents anchoring.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              Educational only — a framework walkthrough, not a recommendation to act.
            </li>
          </ul>
        </section>

        {/* Ask Ekon */}
        <Button
          onClick={() => navigate(`/ask?topic=${encodeURIComponent(investment.name + (investment.ticker && investment.ticker !== "N/A" ? ` (${investment.ticker})` : ""))}`)}
          className="w-full gap-2"
          size="lg"
        >
          <MessageCircle size={18} /> Ask Ekon to explain a concept here
        </Button>
      </div>
    </div>
  );
};

export default InvestmentDetail;
