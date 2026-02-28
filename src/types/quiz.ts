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

export const QUIZ_QUESTIONS_2: QuizQuestion[] = [
  {
    question: "What is dollar-cost averaging?",
    options: [
      "Buying stocks only when they dip",
      "Investing a fixed amount at regular intervals",
      "Converting currencies for profit",
      "Averaging your portfolio returns",
    ],
    correctIndex: 1,
    explanation: "Dollar-cost averaging means investing a fixed amount regularly, reducing the impact of market volatility over time.",
  },
  {
    question: "What does 'diversification' mean in investing?",
    options: [
      "Putting all money in one high-growth stock",
      "Spreading investments across different asset types",
      "Only investing in foreign markets",
      "Switching investments frequently",
    ],
    correctIndex: 1,
    explanation: "Diversification means spreading your money across different investments to reduce risk. Don't put all your eggs in one basket!",
  },
  {
    question: "What is an ETF?",
    options: [
      "A type of savings account",
      "A basket of securities traded like a stock",
      "A government-issued bond",
      "An insurance product",
    ],
    correctIndex: 1,
    explanation: "An ETF (Exchange-Traded Fund) holds a collection of stocks, bonds, or other assets and trades on an exchange like a single stock.",
  },
  {
    question: "If inflation is 3% and your savings earn 1%, what happens to your purchasing power?",
    options: [
      "It grows by 1%",
      "It stays the same",
      "It shrinks by about 2%",
      "It grows by 4%",
    ],
    correctIndex: 2,
    explanation: "When inflation (3%) exceeds your returns (1%), your real purchasing power decreases by the difference (~2%).",
  },
  {
    question: "What is the 'Rule of 72' used to estimate?",
    options: [
      "How much to save for retirement",
      "How long it takes to double your money",
      "The ideal portfolio allocation by age",
      "Maximum credit card utilization",
    ],
    correctIndex: 1,
    explanation: "Divide 72 by your annual return rate to estimate how many years it takes to double your investment. At 8% return: 72 ÷ 8 = 9 years!",
  },
];
