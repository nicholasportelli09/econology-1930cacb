import { useState, useMemo } from "react";
import { CheckCircle2, ChevronRight, Flame, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGamification, addXP, XP_REWARDS } from "@/lib/gamification";

interface Lesson {
  id: string;
  title: string;
  explanation: string;
  example: string;
  question: string;
  options: string[];
  correctIndex: number;
  insight: string;
}

const DAILY_LESSONS: Lesson[] = [
  {
    id: "compound-power",
    title: "The Power of Compound Interest",
    explanation: "Compound interest means you earn interest on your interest. Unlike simple interest, which only applies to your original deposit, compound interest accelerates your growth over time.",
    example: "If you invest $1,000 at 8% annually: after Year 1 you have $1,080, after Year 2 you have $1,166 (not $1,160), and after 30 years you have $10,063 — ten times your original investment.",
    question: "You invest $5,000 at 7% compound interest. After 10 years, approximately how much do you have?",
    options: ["$8,500", "$9,836", "$12,000", "$7,000"],
    correctIndex: 1,
    insight: "At 7% compound interest, $5,000 grows to ~$9,836 in 10 years. The Rule of 72 tells us money doubles roughly every 10.3 years at 7%."
  },
  {
    id: "inflation-erosion",
    title: "How Inflation Erodes Your Savings",
    explanation: "Inflation is the gradual increase in prices over time. When inflation runs at 3%, your money buys 3% less each year. A savings account paying 0.5% means you're actually losing 2.5% of purchasing power annually.",
    example: "A cup of coffee that costs $4 today will cost $5.38 in 10 years at 3% inflation. Your $50,000 savings would need to be $67,196 just to maintain the same buying power.",
    question: "If inflation is 3% and your savings account earns 1%, what is your real return?",
    options: ["4%", "1%", "-2%", "3%"],
    correctIndex: 2,
    insight: "Your real return is nominal rate minus inflation: 1% - 3% = -2%. You're losing purchasing power even though your balance grows."
  },
  {
    id: "index-fund-basics",
    title: "Why Index Funds Outperform Most Investors",
    explanation: "An index fund tracks a market index like the S&P 500, holding all 500 companies proportionally. Instead of picking individual stocks, you own a slice of the entire market at very low cost (0.03-0.20% fees).",
    example: "Over the last 20 years, roughly 90% of actively managed funds underperformed the S&P 500 index. An investor who put $10,000 into an S&P 500 index fund in 2004 would have approximately $60,000 today.",
    question: "What percentage of actively managed funds have underperformed the S&P 500 over 20 years?",
    options: ["50%", "70%", "90%", "30%"],
    correctIndex: 2,
    insight: "SPIVA data consistently shows ~90% of active funds lag the index over long periods. Lower fees and broad diversification give index funds a structural advantage."
  },
  {
    id: "emergency-fund-math",
    title: "Building Your Emergency Fund",
    explanation: "An emergency fund covers 3-6 months of essential expenses — rent, food, utilities, insurance, and minimum debt payments. This buffer prevents you from going into high-interest debt when unexpected costs arise.",
    example: "If your monthly essentials total $2,000, you need $6,000-$12,000 saved. At $200/month savings, you'd reach the minimum in 30 months. Keep it in a high-yield savings account earning 4-5% APY.",
    question: "Your monthly essentials are $1,800. What's the minimum recommended emergency fund?",
    options: ["$1,800", "$3,600", "$5,400", "$10,800"],
    correctIndex: 2,
    insight: "3 months × $1,800 = $5,400 is the minimum. Aim for 6 months ($10,800) if you have variable income or dependents."
  },
  {
    id: "debt-avalanche-vs-snowball",
    title: "Debt Avalanche vs. Debt Snowball",
    explanation: "The Avalanche method pays off highest-interest debt first, minimizing total interest paid. The Snowball method pays off smallest balances first, creating psychological momentum through quick wins.",
    example: "Suppose you have: Card A ($5,000 at 22%), Card B ($1,200 at 15%), Loan C ($8,000 at 6%). Avalanche targets Card A first (saves the most money). Snowball targets Card B first (fastest payoff win).",
    question: "Which method saves the most money in total interest paid?",
    options: ["Snowball", "Avalanche", "They're equal", "Minimum payments only"],
    correctIndex: 1,
    insight: "Avalanche always saves more on interest mathematically. But Snowball's quick wins help many people stay motivated. Choose based on your personality."
  },
  {
    id: "tax-brackets",
    title: "How Tax Brackets Actually Work",
    explanation: "Tax brackets are marginal, meaning only the income within each bracket is taxed at that rate. A raise that pushes you into a higher bracket does NOT tax all your income at the higher rate — only the portion above the threshold.",
    example: "2024 brackets: 10% on first $11,600, 12% on $11,601-$47,150. If you earn $50,000, you pay 10% on $11,600 ($1,160) + 12% on $35,550 ($4,266) + 22% on $2,850 ($627) = $6,053 total, an effective rate of ~12%.",
    question: "If you get a raise from $47,000 to $52,000, what happens to your taxes?",
    options: [
      "All $52,000 is taxed at 22%",
      "Only the $5,000 above $47,150 is taxed at 22%",
      "You lose money from the raise",
      "Your tax rate doesn't change"
    ],
    correctIndex: 1,
    insight: "Only the income above the bracket threshold ($47,150) gets taxed at the higher 22% rate. You always take home more money with a raise."
  },
  {
    id: "dollar-cost-averaging",
    title: "Dollar-Cost Averaging Removes Emotion",
    explanation: "Dollar-cost averaging (DCA) means investing a fixed amount on a regular schedule regardless of market conditions. When prices are high, you buy fewer shares. When prices drop, you buy more. This removes the impossible task of timing the market.",
    example: "Investing $500/month into an index fund: In January (price $50) you buy 10 shares. In February (price $40) you buy 12.5 shares. In March (price $55) you buy 9.1 shares. Your average cost: $47.37/share — lower than the average price of $48.33.",
    question: "What is the main advantage of dollar-cost averaging?",
    options: [
      "It guarantees profits",
      "It eliminates the need to time the market",
      "It only works in rising markets",
      "It's better than lump-sum investing always"
    ],
    correctIndex: 1,
    insight: "DCA's key benefit is behavioral: it removes emotion-driven decisions and creates a consistent investing habit. Historically, lump-sum slightly outperforms DCA, but DCA's consistency matters most for building wealth."
  },
];

function getDailyLessonIndex(): number {
  const startDate = new Date("2024-01-01").getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today - startDate) / 86400000);
  return daysSinceStart % DAILY_LESSONS.length;
}

function getDailyCompletionKey(): string {
  return `econology_daily_${new Date().toISOString().slice(0, 10)}`;
}

export default function DailyLesson() {
  const lesson = useMemo(() => DAILY_LESSONS[getDailyLessonIndex()], []);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(() => {
    const saved = localStorage.getItem(getDailyCompletionKey());
    return saved !== null ? parseInt(saved) : null;
  });
  const [showInsight, setShowInsight] = useState(() => localStorage.getItem(getDailyCompletionKey()) !== null);
  const gam = useMemo(() => getGamification(), []);

  const isCorrect = selectedAnswer === lesson.correctIndex;
  const isCompleted = showInsight;

  const handleAnswer = (index: number) => {
    if (showInsight) return;
    setSelectedAnswer(index);
    setShowInsight(true);
    localStorage.setItem(getDailyCompletionKey(), String(index));
    addXP(XP_REWARDS.EXPLORE_TIP);
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8 space-y-6 shadow-lg shadow-primary/5 ring-1 ring-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Flame size={14} />
            <span>Today's Lesson</span>
          </div>
          {gam.streak > 1 && (
            <span className="text-xs text-muted-foreground">{gam.streak}-day streak</span>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <CheckCircle2 size={14} />
            <span className="font-medium">Completed</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3 tracking-tight">{lesson.title}</h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{lesson.explanation}</p>
      </div>

      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Real Example</p>
        <p className="text-sm text-foreground leading-relaxed">{lesson.example}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{lesson.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lesson.options.map((opt, i) => {
            let extraClass = "justify-start text-left h-auto py-3 px-4";
            
            if (showInsight) {
              if (i === lesson.correctIndex) {
                extraClass += " border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
              } else if (i === selectedAnswer && !isCorrect) {
                extraClass += " border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
              } else {
                extraClass += " opacity-40";
              }
            } else {
              extraClass += " hover:border-primary/40 hover:bg-muted";
            }

            return (
              <Button
                key={i}
                variant="outline"
                className={extraClass}
                onClick={() => handleAnswer(i)}
                disabled={showInsight}
              >
                {opt}
              </Button>
            );
          })}
        </div>
      </div>

      {showInsight && (
        <div className={`rounded-lg p-4 border ${isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isCorrect ? "✓ Correct" : "✗ Not quite"} — Here's why
          </p>
          <p className="text-sm text-foreground leading-relaxed">{lesson.insight}</p>
        </div>
      )}
    </section>
  );
}
