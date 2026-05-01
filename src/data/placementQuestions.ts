import type { Dimension } from "./conceptGraph";

/**
 * Placement diagnostic — 10 questions, 2 per dimension.
 * Each question maps to a concept id. Correct answer = mastered.
 * Incorrect = weak. Skipped = unknown.
 */

export interface PlacementQuestion {
  id: string;
  dimension: Dimension;
  conceptId: string; // links to CONCEPTS
  question: string;
  options: string[];
  correct: number;
  explain: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // budgeting
  {
    id: "p-budget-1",
    dimension: "budgeting",
    conceptId: "needs-vs-wants",
    question: "Under the 50/30/20 budgeting rule, what percentage of take-home pay should go to needs?",
    options: ["20%", "30%", "50%", "70%"],
    correct: 2,
    explain: "50% needs, 30% wants, 20% savings.",
  },
  {
    id: "p-budget-2",
    dimension: "budgeting",
    conceptId: "high-yield-savings",
    question: "A high-yield savings account is best described as:",
    options: [
      "A risky stock investment",
      "A FDIC-insured savings account paying 4–5% APY",
      "A type of bond",
      "A retirement account",
    ],
    correct: 1,
    explain: "HYSAs are safe savings accounts at online banks paying much higher rates than traditional banks.",
  },
  // credit
  {
    id: "p-credit-1",
    dimension: "credit",
    conceptId: "credit-score-basics",
    question: "Which factor has the largest impact on your FICO credit score?",
    options: ["Income", "Payment history", "Credit mix", "Recent inquiries"],
    correct: 1,
    explain: "Payment history is roughly 35% of your score — by far the biggest factor.",
  },
  {
    id: "p-credit-2",
    dimension: "credit",
    conceptId: "credit-utilization",
    question: "If you have a $4,000 credit limit and a $1,200 balance, your credit utilization is:",
    options: ["12%", "30%", "40%", "75%"],
    correct: 1,
    explain: "$1,200 ÷ $4,000 = 30%. Aim to keep this under 30% (ideally under 10%).",
  },
  // investing
  {
    id: "p-invest-1",
    dimension: "investing",
    conceptId: "compound-interest",
    question: "Compound interest means:",
    options: [
      "Interest paid in a lump sum at the end",
      "Interest earning interest on top of itself",
      "A penalty for early withdrawal",
      "Bank fees",
    ],
    correct: 1,
    explain: "Each period's interest is added to the principal, so the next period earns on a bigger base.",
  },
  {
    id: "p-invest-2",
    dimension: "investing",
    conceptId: "index-funds",
    question: "An S&P 500 index fund gives you:",
    options: [
      "A loan to one company",
      "Ownership of the 500 largest US companies in one fund",
      "Only US Treasury bonds",
      "A guaranteed 7% return",
    ],
    correct: 1,
    explain: "Buying one share gets you a slice of all 500 companies — instant diversification.",
  },
  // macro
  {
    id: "p-macro-1",
    dimension: "macro",
    conceptId: "inflation",
    question: "If annual inflation is 3%, what happens to the purchasing power of cash sitting in a 0.5% savings account?",
    options: [
      "It grows by 3.5%",
      "It stays the same",
      "It loses about 2.5% of purchasing power per year",
      "It doubles every 10 years",
    ],
    correct: 2,
    explain: "Real return = nominal rate − inflation. 0.5% − 3% = -2.5% real return.",
  },
  {
    id: "p-macro-2",
    dimension: "macro",
    conceptId: "interest-rates",
    question: "When the Federal Reserve raises interest rates, the typical immediate effect on stock prices is:",
    options: [
      "Stocks rally strongly",
      "Stocks usually struggle, especially growth/tech",
      "No effect at all",
      "Stocks become tax-free",
    ],
    correct: 1,
    explain: "Higher rates make borrowing more expensive and reduce the present value of future earnings.",
  },
  // risk
  {
    id: "p-risk-1",
    dimension: "risk",
    conceptId: "risk-vs-reward",
    question: "If you'll need money in 6 months for a down payment, you should hold it in:",
    options: [
      "Aggressive growth stocks",
      "Cryptocurrency",
      "A high-yield savings account or money market",
      "A 30-year bond",
    ],
    correct: 2,
    explain: "Short horizons require stable, liquid assets — never investments that can drop 30% before you need them.",
  },
  {
    id: "p-risk-2",
    dimension: "risk",
    conceptId: "asset-allocation",
    question: "Using the '110 minus your age' rule, a 30-year-old should hold roughly what percentage in stocks?",
    options: ["30%", "50%", "80%", "110%"],
    correct: 2,
    explain: "110 − 30 = 80% stocks. Long horizons reward higher stock allocations.",
  },
];