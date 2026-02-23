export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "$100/month for 30 years at 10% return equals approximately?",
    options: ["$36,000", "$75,000", "$200,000", "$500,000"],
    correctIndex: 2,
    explanation: "The power of compound interest! $100/month for 30 years at 10% = ~$200,000",
  },
  {
    question: "What's the primary benefit of starting to invest young?",
    options: ["Lower fees", "More time for compound interest", "Higher starting amounts", "Better stock picks"],
    correctIndex: 1,
    explanation: "Time is your biggest advantage. Compound interest needs years to work its magic!",
  },
  {
    question: "Which investment typically has the LOWEST risk?",
    options: ["Individual stocks", "Government bonds", "Cryptocurrency", "Startup investments"],
    correctIndex: 1,
    explanation: "Government bonds are backed by the government, making them the safest option",
  },
  {
    question: "What percentage of your income should go to savings according to the 50/30/20 rule?",
    options: ["10%", "20%", "30%", "50%"],
    correctIndex: 1,
    explanation: "20% should go to savings and debt repayment in the 50/30/20 budget rule",
  },
  {
    question: "A good credit score is generally considered to be:",
    options: ["Above 500", "Above 650", "Above 700", "Above 800"],
    correctIndex: 2,
    explanation: "700+ is considered good credit. 750+ is very good, and 800+ is excellent!",
  },
];
