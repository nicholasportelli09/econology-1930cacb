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

  // --- Additional high-quality topics ---

  // Budgeting
  { id: "zerobudget", title: "Zero-Based Budgeting", description: "Give every dollar a job before the month begins.", category: "Budgeting" },
  { id: "envelope", title: "Cash Envelope System", description: "Old-school method that crushes overspending in problem categories.", category: "Budgeting" },
  { id: "irregular-income", title: "Budgeting Irregular Income", description: "Build a system that works when paychecks fluctuate.", category: "Budgeting" },
  { id: "sinking-funds", title: "Sinking Funds", description: "Save monthly for predictable yearly expenses — never get blindsided.", category: "Budgeting" },
  { id: "lifestyle-creep", title: "Beat Lifestyle Creep", description: "Why every raise quietly disappears — and how to keep yours.", category: "Budgeting" },
  { id: "no-spend", title: "The No-Spend Challenge", description: "Reset your spending habits with a 30-day reset.", category: "Budgeting" },

  // Savings
  { id: "savings-rate", title: "Your Savings Rate", description: "The single number that predicts when you'll be financially free.", category: "Savings" },
  { id: "cd-ladder", title: "Building a CD Ladder", description: "Lock in rates without losing access to all your cash.", category: "Savings" },
  { id: "money-market", title: "Money Market Accounts", description: "Higher yields than checking, more flexible than CDs.", category: "Savings" },
  { id: "buckets", title: "The Bucket Strategy", description: "Separate accounts for goals, bills, and fun money.", category: "Savings" },
  { id: "save-for-house", title: "Saving for a Down Payment", description: "How much, where to park it, and how long it really takes.", category: "Savings" },

  // Investing
  { id: "asset-allocation", title: "Asset Allocation 101", description: "The single biggest driver of long-term returns.", category: "Investing" },
  { id: "rebalancing", title: "Portfolio Rebalancing", description: "Sell high, buy low — automatically, once a year.", category: "Investing" },
  { id: "expense-ratios", title: "Why Fees Destroy Returns", description: "A 1% fee can cut your retirement balance by 28%.", category: "Investing" },
  { id: "target-date", title: "Target-Date Funds", description: "One fund that auto-adjusts as you approach retirement.", category: "Investing" },
  { id: "reits", title: "REITs Explained", description: "Own real estate income without becoming a landlord.", category: "Investing" },
  { id: "dividends", title: "Dividend Investing", description: "Build cash-flow from stocks that pay you to hold them.", category: "Investing" },
  { id: "growth-vs-value", title: "Growth vs Value Stocks", description: "Two philosophies, one portfolio — when each one wins.", category: "Investing" },
  { id: "small-cap", title: "Small-Cap Premium", description: "Why smaller companies historically outperform — and the catch.", category: "Investing" },
  { id: "international", title: "International Diversification", description: "The case for owning the rest of the world, not just the US.", category: "Investing" },
  { id: "robo-advisors", title: "Robo-Advisors", description: "Automated investing for less than 0.5% per year.", category: "Investing" },
  { id: "tax-loss-harvesting", title: "Tax-Loss Harvesting", description: "Turn losing positions into a tax bill reduction.", category: "Investing" },
  { id: "behavior-gap", title: "The Behavior Gap", description: "Why investors earn less than the funds they own.", category: "Investing" },
  { id: "bear-market", title: "Surviving Bear Markets", description: "What to do — and not do — when stocks drop 30%+.", category: "Investing" },
  { id: "hsa-investing", title: "HSA: The Triple Tax Advantage", description: "The most tax-efficient account most people ignore.", category: "Investing" },
  { id: "trad-vs-roth", title: "Traditional vs Roth", description: "Pay taxes now or later — how to actually decide.", category: "Investing" },
  { id: "options-basics", title: "Options Basics (Carefully)", description: "What calls and puts really are — and why most traders lose.", category: "Investing" },
  { id: "stablecoins", title: "Stablecoins Demystified", description: "Crypto that tries to stay at $1 — how, why, and the risks.", category: "Investing" },

  // Credit
  { id: "credit-utilization", title: "Credit Utilization", description: "Keep usage under 30% — and ideally under 10% — for top scores.", category: "Credit" },
  { id: "credit-mix", title: "Credit Mix & History", description: "Why account age and variety matter more than you think.", category: "Credit" },
  { id: "secured-card", title: "Secured Credit Cards", description: "The fastest way to build credit from zero.", category: "Credit" },
  { id: "authorized-user", title: "Authorized User Hack", description: "Inherit years of credit history from a trusted family member.", category: "Credit" },
  { id: "credit-freeze", title: "Freeze Your Credit", description: "The free, 5-minute fix that stops most identity theft.", category: "Credit" },

  // Debt
  { id: "consolidation", title: "Debt Consolidation", description: "When combining debts saves money — and when it backfires.", category: "Debt" },
  { id: "balance-transfer", title: "Balance Transfer Cards", description: "0% APR can erase interest — if you have a payoff plan.", category: "Debt" },
  { id: "minimum-payments", title: "Minimum Payment Trap", description: "Why paying the minimum keeps you in debt for decades.", category: "Debt" },
  { id: "medical-debt", title: "Negotiating Medical Bills", description: "Most hospital bills are negotiable — here's the script.", category: "Debt" },

  // Earning
  { id: "high-income-skills", title: "High-Income Skills", description: "The 5 skills that pay $100K+ without a fancy degree.", category: "Earning" },
  { id: "personal-brand", title: "Build a Personal Brand", description: "Why your online presence is your new resume.", category: "Earning" },
  { id: "remote-work", title: "Remote Work Economics", description: "Earn city wages while living somewhere cheaper.", category: "Earning" },
  { id: "raise-script", title: "Asking for a Raise", description: "The exact framework to get a yes — backed by data.", category: "Earning" },
  { id: "career-capital", title: "Build Career Capital", description: "Skills that compound — the rarer, the more valuable.", category: "Earning" },

  // Taxes
  { id: "w4-optimization", title: "Optimizing Your W-4", description: "Stop giving the government an interest-free loan.", category: "Taxes" },
  { id: "fsa-vs-hsa", title: "FSA vs HSA", description: "Two pretax accounts that cut your medical costs.", category: "Taxes" },
  { id: "529-plans", title: "529 College Savings", description: "Tax-free growth for education — flexible enough for most families.", category: "Taxes" },
  { id: "estimated-taxes", title: "Quarterly Estimated Taxes", description: "If you freelance, miss these and the IRS adds penalties.", category: "Taxes" },

  // Life
  { id: "renters-insurance", title: "Renters Insurance Is Cheap", description: "$15/month protects thousands in stuff plus liability.", category: "Life" },
  { id: "umbrella-policy", title: "Umbrella Insurance", description: "$1M of liability coverage for ~$200/year — usually worth it.", category: "Life" },
  { id: "estate-basics", title: "Estate Planning at 22", description: "A will, beneficiaries, and a power of attorney — start here.", category: "Life" },
  { id: "prenup", title: "Prenups & Money Talks", description: "How couples merge finances without losing the relationship.", category: "Life" },
  { id: "kids-cost", title: "True Cost of a Kid", description: "Beyond the $300K stat — what to actually plan for.", category: "Life" },
  { id: "fire-movement", title: "The FIRE Movement", description: "Financial Independence, Retire Early — what it really takes.", category: "Life" },
  { id: "barista-fire", title: "Coast & Barista FIRE", description: "Half-retirement strategies that don't require $2M.", category: "Life" },
  { id: "geo-arbitrage", title: "Geographic Arbitrage", description: "Move where your money buys more — domestically or abroad.", category: "Life" },
  { id: "scams", title: "Spot Financial Scams", description: "The 5 red flags every modern scam shares.", category: "Life" },
  { id: "money-mindset", title: "Money Mindset", description: "How beliefs about money shape every financial decision.", category: "Life" },
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

  // Persist seed + page so refreshes don't reshuffle and we keep advancing
  // through unseen topics (5+ refreshes without repeats).
  const [seed, setSeed] = useState<number>(() => {
    const stored = localStorage.getItem("econology_learn_seed");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    const fresh = Math.floor(Math.random() * 1_000_000);
    localStorage.setItem("econology_learn_seed", String(fresh));
    return fresh;
  });

  const [page, setPage] = useState<number>(() => {
    const stored = localStorage.getItem("econology_learn_page");
    const parsed = stored ? parseInt(stored, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  });

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
      const next = page + 1;
      setPage(next);
      localStorage.setItem("econology_learn_page", String(next));
    } else {
      const newSeed = Math.floor(Math.random() * 1_000_000);
      setSeed(newSeed);
      setPage(0);
      localStorage.setItem("econology_learn_seed", String(newSeed));
      localStorage.setItem("econology_learn_page", "0");
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      {/* Content */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-10 space-y-8">
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
