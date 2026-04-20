import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type UserProfile, defaultProfile } from "@/types/profile";

interface TopicCard {
  id: string;
  title: string;
  description: string;
  category: string;
}

const ALL_TOPICS: TopicCard[] = [
  // Budgeting
  { id: "budget", title: "The 50/30/20 Budget Rule", description: "Split income into needs, wants, and savings with this simple framework.", category: "Budgeting" },
  { id: "needs-wants", title: "Needs vs Wants", description: "Master the 24-hour rule and stop impulse spending derailing your goals.", category: "Budgeting" },
  { id: "subscriptions", title: "Subscription Audit", description: "The average person wastes $200/month on unused subscriptions. Find yours.", category: "Budgeting" },
  { id: "budgetapps", title: "Best Budgeting Apps", description: "YNAB, Mint, Copilot — pick the right tool and stick with it.", category: "Budgeting" },
  { id: "minimalism", title: "Financial Minimalism", description: "Spend intentionally on what matters and cut the noise.", category: "Budgeting" },

  // Saving
  { id: "emergency", title: "Emergency Fund", description: "Build a 3-6 month safety net before life surprises you.", category: "Savings" },
  { id: "highyield", title: "High-Yield Savings", description: "Earn 4-5% APY instead of 0.01% — same safety, 100x the interest.", category: "Savings" },
  { id: "automate", title: "Automate Your Savings", description: "Remove willpower from the equation with payday auto-transfers.", category: "Savings" },
  { id: "gratification", title: "Delayed Gratification", description: "The #1 predictor of financial success. Train the muscle.", category: "Savings" },

  // Investing
  { id: "inflation", title: "Beat Inflation", description: "Why your savings lose value and how investing fights back.", category: "Investing" },
  { id: "index", title: "Index Funds 101", description: "Own 500 companies at once with the lowest fees in finance.", category: "Investing" },
  { id: "compound", title: "Compound Interest", description: "Einstein's '8th wonder' — your money earning money on its money.", category: "Investing" },
  { id: "dca", title: "Dollar-Cost Averaging", description: "Beat market timing by investing the same amount every month.", category: "Investing" },
  { id: "diversify", title: "Diversification 101", description: "Spread risk across stocks, bonds, and geographies.", category: "Investing" },
  { id: "roth", title: "Roth IRA Advantage", description: "Pay taxes now, withdraw tax-free in retirement.", category: "Investing" },
  { id: "etf", title: "ETFs Explained", description: "Stock-like flexibility with mutual fund diversification.", category: "Investing" },
  { id: "bonds", title: "Bonds for Beginners", description: "The safer side of your portfolio — IOUs from governments and companies.", category: "Investing" },
  { id: "401k", title: "401(k) Match = Free Money", description: "Never leave your employer match on the table.", category: "Investing" },
  { id: "rule72", title: "The Rule of 72", description: "Quick mental math for how long it takes money to double.", category: "Investing" },
  { id: "inflation-hedge", title: "Inflation-Proof Assets", description: "TIPS, real estate, and stocks that protect purchasing power.", category: "Investing" },
  { id: "cryptobasics", title: "Crypto 101", description: "Blockchain, Bitcoin, Ethereum — what's real, what's hype.", category: "Investing" },
  { id: "cryptorisk", title: "Crypto Risk Management", description: "How to allocate without blowing up your portfolio.", category: "Investing" },

  // Credit & Debt
  { id: "credit", title: "Credit Score Matters", description: "The 5 factors and why a 700+ score saves you thousands.", category: "Credit" },
  { id: "creditcard", title: "Your First Credit Card", description: "Build credit safely without falling into the debt trap.", category: "Credit" },
  { id: "cashback", title: "Cashback Rewards", description: "Free money — but only if you pay in full every month.", category: "Credit" },
  { id: "debtavalanche", title: "Debt Avalanche Method", description: "Pay highest-interest debt first to save the most money.", category: "Debt" },
  { id: "debtsnowball", title: "Debt Snowball Method", description: "Quick wins keep you motivated to crush every debt.", category: "Debt" },
  { id: "studentloans", title: "Student Loan Strategy", description: "Federal vs private, IDR plans, PSLF — navigate it all.", category: "Debt" },
  { id: "paylater", title: "Buy Now Pay Later Trap", description: "Klarna and Afterpay make overspending feel painless.", category: "Debt" },

  // Earning
  { id: "hustle", title: "Side Hustle Power", description: "Turn extra hours into extra income — and invest the difference.", category: "Earning" },
  { id: "freelance", title: "Freelancing Income", description: "Turn skills into hourly rates of $30-100+.", category: "Earning" },
  { id: "negotiate", title: "Salary Negotiation", description: "First offers leave 10-20% on the table. Don't.", category: "Earning" },
  { id: "networking", title: "Networking = Net Worth", description: "70%+ of jobs come through relationships, not applications.", category: "Earning" },
  { id: "internships", title: "Paid Internship Strategy", description: "Convert summer work into a full-time offer.", category: "Earning" },
  { id: "passiveincome", title: "Passive Income Streams", description: "Build assets that pay you while you sleep.", category: "Earning" },

  // Taxes
  { id: "taxbasics", title: "Tax Basics", description: "Brackets, W-2s, and why a raise never costs you money.", category: "Taxes" },
  { id: "taxdeductions", title: "Tax Deductions & Credits", description: "Credits beat deductions — here's how to find both.", category: "Taxes" },
  { id: "sidehustletax", title: "Side Hustle Taxes", description: "Set aside 25-30%, track expenses, avoid penalties.", category: "Taxes" },

  // Life
  { id: "moveout", title: "Moving Out Checklist", description: "True costs of independence — and how to prepare.", category: "Life" },
  { id: "rentbudget", title: "The 30% Rent Rule", description: "Keep housing affordable so you can fund the rest of life.", category: "Life" },
  { id: "realestate", title: "Renting vs Buying", description: "Equity vs flexibility — the real math behind the decision.", category: "Life" },
  { id: "carbudget", title: "Buying Your First Car", description: "20/4/10 rule and the hidden costs of ownership.", category: "Life" },
  { id: "insurance", title: "Insurance Basics", description: "What you need, what to skip, and how to save on premiums.", category: "Life" },
  { id: "travelbudget", title: "Budget Travel", description: "See the world without going into debt.", category: "Life" },
  { id: "scholarships", title: "Scholarship Hunting", description: "Billions go unclaimed each year — claim your share.", category: "Life" },
  { id: "recession", title: "Recession-Proof Finances", description: "Prepare in good times so downturns don't break you.", category: "Life" },
  { id: "financialliteracy", title: "Financial Literacy Gap", description: "Why most adults are financially illiterate — and how to lead.", category: "Life" },
];

const categoryColor: Record<string, string> = {
  Budgeting: "bg-primary/20 text-primary",
  Investing: "bg-secondary/20 text-secondary",
  Credit: "bg-primary/20 text-primary",
  Debt: "bg-destructive/15 text-destructive",
  Savings: "bg-primary/20 text-primary",
  Earning: "bg-secondary/20 text-secondary",
  Taxes: "bg-primary/20 text-primary",
  Life: "bg-secondary/20 text-secondary",
};

const Learn = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("econology_profile");
  const profile: UserProfile = stored ? JSON.parse(stored) : defaultProfile;

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(0);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));

  // Stable shuffled order driven by seed; "Load new topics" advances the page or reshuffles.
  const shuffledOrder = useMemo(() => {
    const indices = ALL_TOPICS.map((_, i) => i);
    let s = seed;
    for (let i = indices.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [seed]);

  const totalPages = Math.ceil(ALL_TOPICS.length / PAGE_SIZE);

  const topics = useMemo(() => {
    const start = page * PAGE_SIZE;
    return shuffledOrder.slice(start, start + PAGE_SIZE).map((i) => ALL_TOPICS[i]);
  }, [shuffledOrder, page]);

  const shuffleTopics = () => {
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
    } else {
      setSeed(Math.floor(Math.random() * 1_000_000));
      setPage(0);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Learning Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore financial topics and level up your money skills.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={shuffleTopics}
            className="gap-2"
          >
            <RefreshCw size={16} /> New Topics
          </Button>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group rounded-xl border border-border bg-card p-6 card-shadow flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_40px_hsl(270_70%_55%/0.15)]"
            >
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className={`${categoryColor[topic.category] ?? ""} border-0 text-xs font-medium`}
                >
                  {topic.category}
                </Badge>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {topic.description}
                </p>
              </div>
              <Button
                variant="ghost"
                className="mt-5 justify-start px-0 text-primary hover:text-primary/80 gap-1 hover:bg-primary/10"
                onClick={() => navigate(`/tip/${topic.id}`)}
              >
                Learn More <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Learn;
