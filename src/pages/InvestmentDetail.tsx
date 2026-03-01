import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
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
}

const riskColor = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "High":
      return "bg-red-500/15 text-red-400 border-red-500/30";
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
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Suggested Starting Amount
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {investment.startingAmount}
          </p>
        </div>

        {/* Personalized Note */}
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            For You
          </span>
          <p className="text-foreground mt-1 leading-relaxed italic">
            {investment.personalizedNote}
          </p>
        </div>

        {/* How to Get Started */}
        <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            How to Get Started
          </h2>
          <ol className="space-y-3 list-decimal list-inside text-sm text-foreground leading-relaxed marker:text-blue-400 marker:font-bold">
            <li>Open an account with Fidelity/Vanguard/Robinhood (free to open)</li>
            <li>Complete verification (driver's license, SSN, bank account)</li>
            <li>
              Transfer money from your bank (can start with just{" "}
              <span className="font-semibold text-blue-400">{investment.startingAmount}</span>)
            </li>
            <li>
              Search for{" "}
              <span className="font-semibold text-blue-400">{tickerLabel}</span> and
              place your order
            </li>
            <li>Set up automatic monthly investments to build wealth consistently</li>
          </ol>
        </section>

        {/* Important Considerations */}
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Important Considerations
          </h2>
          <ul className="space-y-2 text-sm text-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Only invest money you won't need for at least 5 years
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Keep an emergency fund before investing (3-6 months expenses)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Markets fluctuate — focus on long-term growth, not daily changes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
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
