export interface UserProfile {
  name: string;
  age: string;
  studentStatus: string;
  livingSituation: string;
  monthlyIncome: string;
  currentSavings: string;
  debtTypes: string[];
  financialGoals: string[];
  topicsOfInterest: string[];
  learningStyle: string;
  quizScore: number | null;
  quizScore2?: number | null;
}

export const defaultProfile: UserProfile = {
  name: "",
  age: "",
  studentStatus: "",
  livingSituation: "",
  monthlyIncome: "",
  currentSavings: "",
  debtTypes: [],
  financialGoals: [],
  topicsOfInterest: [],
  learningStyle: "",
  quizScore: null,
};

export const STUDENT_STATUSES = [
  "High School Student",
  "College Student",
  "Working Full-Time",
  "Working Part-Time",
  "Gap Year",
];

export const LIVING_SITUATIONS = [
  "With Parents/Family",
  "College Dorm",
  "Shared Apartment",
  "Own Apartment",
  "Other",
];

export const DEBT_TYPES = [
  "Student Loans",
  "Credit Card Debt",
  "Car Loan",
  "Personal Loans",
  "No Debt",
];

export const FINANCIAL_GOALS = [
  "Build emergency savings",
  "Pay off debt",
  "Save for college",
  "Buy a car",
  "Start investing",
  "Travel",
  "Move out",
  "Start a side hustle",
  "Build credit score",
];

export const TOPICS_OF_INTEREST = [
  "Budgeting & Saving",
  "Investing & Stocks",
  "Credit Cards & Credit Score",
  "Student Loans & Debt",
  "Side Hustles & Income",
  "Crypto & New Tech",
  "Real Estate",
  "Taxes",
  "Career & Salary",
];

export const LEARNING_STYLES = [
  "Quick daily tips",
  "Detailed articles",
  "Interactive Q&A",
  "Mix of everything",
];
