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
  {
    question: "In the 50/30/20 budget rule, what does the 30% cover?",
    options: [
      "Rent and utilities",
      "Savings and investments",
      "Wants like dining out and entertainment",
      "Debt repayment",
    ],
    correctIndex: 2,
    explanation: "The 30% is for 'wants' — dining, entertainment, subscriptions, and shopping. 50% is needs, 20% is savings.",
  },
  {
    question: "What credit utilization ratio should you ideally stay below?",
    options: [
      "50%",
      "75%",
      "30%",
      "100%",
    ],
    correctIndex: 2,
    explanation: "Keep credit utilization below 30%, and ideally below 10%, to maintain a healthy credit score.",
  },
  {
    question: "What is the 'debt avalanche' method?",
    options: [
      "Paying off all debts at once",
      "Paying minimum on everything",
      "Paying the highest-interest debt first",
      "Consolidating all debt into one loan",
    ],
    correctIndex: 2,
    explanation: "The debt avalanche targets the highest-interest debt first while paying minimums on the rest, saving the most money long-term.",
  },
  {
    question: "How much should you aim to save in an emergency fund?",
    options: [
      "1 month of expenses",
      "3-6 months of expenses",
      "$500 total",
      "1 year of salary",
    ],
    correctIndex: 1,
    explanation: "Financial experts recommend 3-6 months of living expenses. Start small with $500, then build up from there.",
  },
  {
    question: "What's a key advantage of a Roth IRA for young earners?",
    options: [
      "Contributions are tax-deductible now",
      "No contribution limits",
      "Withdrawals in retirement are tax-free",
      "Guaranteed 10% returns",
    ],
    correctIndex: 2,
    explanation: "With a Roth IRA, you invest after-tax dollars now, but all growth and withdrawals in retirement are completely tax-free!",
  },
  {
    question: "What percentage of your income should rent ideally be?",
    options: [
      "50% or less",
      "30% or less",
      "40% or less",
      "It doesn't matter",
    ],
    correctIndex: 1,
    explanation: "The 30% rule says keep rent under 30% of gross income to avoid being 'house-poor' with no room for savings.",
  },
  {
    question: "Why should you NOT close old credit cards?",
    options: [
      "You lose reward points",
      "It shortens your credit history length",
      "The bank charges a closing fee",
      "You can't open new ones",
    ],
    correctIndex: 1,
    explanation: "Length of credit history is 15% of your score. Closing old cards reduces your average account age and can lower your score.",
  },
  {
    question: "How much of side hustle income should you set aside for taxes?",
    options: [
      "5-10%",
      "25-30%",
      "50%",
      "None, it's not taxable",
    ],
    correctIndex: 1,
    explanation: "Self-employment income is taxable. Set aside 25-30% to cover income tax plus the ~15.3% self-employment tax.",
  },
  {
    question: "What is compound interest?",
    options: [
      "Interest charged on late payments",
      "A fixed interest rate that never changes",
      "Earning interest on both principal and accumulated interest",
      "Interest split between two accounts",
    ],
    correctIndex: 2,
    explanation: "Compound interest means your money earns interest on its interest — it's why starting early makes such a huge difference!",
  },
  {
    question: "What's the 20/4/10 rule for buying a car?",
    options: [
      "20% down, 4-year loan, costs under 10% of income",
      "Buy at 20, pay for 4 years, sell at 10 years",
      "Save $20K, $4K down, $10K loan",
      "20 MPG minimum, 4 doors, 10 years old max",
    ],
    correctIndex: 0,
    explanation: "Put 20% down, take a max 4-year loan, and keep total car costs under 10% of your gross income.",
  },
];
