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

/**
 * Unified taxonomy.
 *
 * `CURRICULUM_INTERESTS` mirrors the 5 Learn dimensions one-to-one (same IDs,
 * same labels) so a topic the user picks here also tags lessons, news filters
 * and dashboard recommendations. `EXTRA_INTERESTS` covers areas users care
 * about that don't (yet) have a Learn dimension — they only drive news /
 * recommendations.
 */
export type DimensionId = "budgeting" | "credit" | "investing" | "macro" | "risk";

export interface InterestTag {
  id: string;
  label: string;
  /** True if this tag corresponds to a Learn curriculum dimension. */
  curriculum: boolean;
}

export const CURRICULUM_INTERESTS: InterestTag[] = [
  { id: "budgeting", label: "Budgeting & Saving",   curriculum: true },
  { id: "credit",    label: "Credit & Debt",        curriculum: true },
  { id: "investing", label: "Investing Basics",     curriculum: true },
  { id: "macro",     label: "Macro & News",         curriculum: true },
  { id: "risk",      label: "Risk Management",      curriculum: true },
];

export const EXTRA_INTERESTS: InterestTag[] = [
  { id: "crypto",      label: "Crypto",        curriculum: false },
  { id: "real_estate", label: "Real Estate",   curriculum: false },
  { id: "taxes",       label: "Taxes",         curriculum: false },
  { id: "career",      label: "Career & Pay",  curriculum: false },
];

export const ALL_INTERESTS: InterestTag[] = [...CURRICULUM_INTERESTS, ...EXTRA_INTERESTS];

export const INTEREST_BY_ID: Record<string, InterestTag> = Object.fromEntries(
  ALL_INTERESTS.map((i) => [i.id, i]),
);

export const INTEREST_BY_LABEL: Record<string, InterestTag> = Object.fromEntries(
  ALL_INTERESTS.map((i) => [i.label.toLowerCase(), i]),
);

/**
 * Back-compat shim: legacy code referenced TOPICS_OF_INTEREST as a string[].
 * Keep it exported but point at the unified labels so existing call sites
 * keep working until they migrate to ALL_INTERESTS.
 */
export const TOPICS_OF_INTEREST: string[] = ALL_INTERESTS.map((i) => i.label);

/** Migrate legacy stored topic strings to the canonical label list. */
const LEGACY_TOPIC_MAP: Record<string, string> = {
  "investing & stocks": "Investing Basics",
  "credit cards & credit score": "Credit & Debt",
  "student loans & debt": "Credit & Debt",
  "side hustles & income": "Career & Pay",
  "crypto & new tech": "Crypto",
  "career & salary": "Career & Pay",
};
export function normalizeTopicLabels(topics: string[] | undefined | null): string[] {
  if (!topics) return [];
  const out = new Set<string>();
  for (const raw of topics) {
    const trimmed = (raw || "").trim();
    if (!trimmed) continue;
    const direct = INTEREST_BY_LABEL[trimmed.toLowerCase()];
    if (direct) { out.add(direct.label); continue; }
    const mapped = LEGACY_TOPIC_MAP[trimmed.toLowerCase()];
    if (mapped) { out.add(mapped); continue; }
    // Unknown — drop silently.
  }
  return [...out];
}

export const LEARNING_STYLES = [
  "Quick daily tips",
  "Detailed articles",
  "Interactive Q&A",
  "Mix of everything",
];
