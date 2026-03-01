import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Investment {
  name: string;
  ticker: string;
  description: string;
  startingAmount: string;
  riskLevel: "Low" | "Medium" | "High";
  whyGood: string;
  personalizedNote: string;
  steps?: string[];
}

const riskColor = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-accent/15 text-accent border-accent/30";
    case "Medium":
      return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    case "High":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const InvestmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const investment = location.state?.investment as Investment | undefined;

  if (!investment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Investment data not found.</p>
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
        `Open an account with Fidelity, Vanguard, or Robinhood (free to open)`,
        `Complete identity verification (driver's license, SSN, bank account)`,
        `Transfer money from your bank (can start with just ${investment.startingAmount})`,
        `Search for ${tickerLabel} and place your order`,
        `Set up automatic monthly investments to build wealth consistently`,
      ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/market")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to Market Ideas
        </button>

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
          <Badge className={`shrink-0 text-sm border ${riskColor(investment.riskLevel)}`}>
            {investment.riskLevel} Risk
          </Badge>
        </div>

        <p className="text-muted-foreground leading-relaxed">{investment.description}</p>

        {/* Starting Amount */}
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Suggested Starting Amount
          </span>
          <p className="text-2xl font-bold text-accent mt-1">
            {investment.startingAmount}
          </p>
        </div>

        {/* Why It's Good */}
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Why It's Good for Beginners
          </span>
          <p className="text-foreground mt-1 leading-relaxed">{investment.whyGood}</p>
        </div>

        {/* Personalized Note */}
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Personalized For You
          </span>
          <p className="text-foreground mt-1 leading-relaxed italic">
            {investment.personalizedNote}
          </p>
        </div>

        {/* Step-by-Step Walkthrough */}
        <section className="rounded-xl border border-primary/20 bg-card p-6 space-y-5">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Step-by-Step: How to Execute This Investment
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

        {/* Important Considerations */}
        <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Important Considerations
          </h2>
          <ul className="space-y-2 text-sm text-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              Only invest money you won't need for at least 5 years
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              Keep an emergency fund before investing (3-6 months expenses)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              Markets fluctuate — focus on long-term growth, not daily changes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              This is educational information, not personalized financial advice
            </li>
          </ul>
        </section>

        {/* Ask Ekon */}
        <Button
          onClick={() => navigate("/ask")}
          className="w-full gap-2"
          size="lg"
        >
          <MessageCircle size={18} /> Ask Ekon About This Investment
        </Button>
      </div>
    </div>
  );
};

export default InvestmentDetail;
