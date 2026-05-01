/**
 * Hand-curated YouTube videos, concept-tagged against the curriculum graph.
 *
 * Every video is tagged with one or more concept node IDs (see conceptGraph.ts)
 * and a level (beginner/intermediate/advanced). The Videos surface uses the
 * user's literacy profile to surface level-appropriate picks, and the same
 * concept taxonomy as lessons + news to suggest "watch next" inside our walls
 * (never YouTube's algorithm).
 *
 * Each video also has ONE optional quick-check question. Watching + answering
 * earns 25 XP via the same lesson loop (see videoLessons.ts).
 */

export type VideoLevel = "beginner" | "intermediate" | "advanced";

export interface QuickCheck {
  q: string;
  options: string[];
  correct: number; // index
  explain: string;
}

export interface CuratedVideo {
  /** YouTube video ID. */
  id: string;
  title: string;
  channel: string;
  /** Approximate duration in minutes — used for level matching and labels. */
  minutes: number;
  level: VideoLevel;
  /** Concept ids from conceptGraph.ts that this video teaches/touches. */
  concepts: string[];
  /** One quick-check the learner answers after watching. */
  quickCheck: QuickCheck;
}

export const CURATED_VIDEOS: CuratedVideo[] = [
  // ─── BUDGETING & SAVING ─────────────────────────────────────
  {
    id: "sVKQn2I4HDM",
    title: "How to Make a Budget (The 50/30/20 Rule)",
    channel: "The Plain Bagel",
    minutes: 7,
    level: "beginner",
    concepts: ["budget-basics", "needs-vs-wants"],
    quickCheck: {
      q: "Under the 50/30/20 rule, what gets 20%?",
      options: ["Needs", "Wants", "Savings & extra debt payoff", "Taxes"],
      correct: 2,
      explain: "20% targets savings and accelerated debt payoff.",
    },
  },
  {
    id: "1RtDS6RJDqI",
    title: "Why You Need an Emergency Fund",
    channel: "The Plain Bagel",
    minutes: 6,
    level: "beginner",
    concepts: ["emergency-fund", "high-yield-savings"],
    quickCheck: {
      q: "Where should an emergency fund live?",
      options: ["Stocks", "Crypto", "A high-yield savings account", "Under your mattress"],
      correct: 2,
      explain: "Liquid, FDIC-insured, separate from checking.",
    },
  },
  {
    id: "HQzoZfc3GwQ",
    title: "The Power of Automating Your Finances",
    channel: "Ben Felix",
    minutes: 9,
    level: "beginner",
    concepts: ["automation", "budget-basics"],
    quickCheck: {
      q: "Why does automation beat willpower?",
      options: [
        "Banks pay bonuses for autopay",
        "Defaults compound for years; willpower runs out",
        "It's required by law",
        "It changes interest rates",
      ],
      correct: 1,
      explain: "Make the right choice the default and the wrong choice require effort.",
    },
  },

  // ─── CREDIT & DEBT ──────────────────────────────────────────
  {
    id: "RtDS6Rk3rNE",
    title: "Credit Scores Explained",
    channel: "The Plain Bagel",
    minutes: 8,
    level: "beginner",
    concepts: ["credit-score-basics", "credit-utilization"],
    quickCheck: {
      q: "Which factor weighs most heavily in a FICO score?",
      options: ["Income", "Payment history", "Credit mix", "Age"],
      correct: 1,
      explain: "Payment history is ~35% of the score.",
    },
  },
  {
    id: "PHe0bXAIuk0",
    title: "How Credit Cards Work (And How to Use Them)",
    channel: "Khan Academy",
    minutes: 10,
    level: "beginner",
    concepts: ["credit-utilization", "good-debt-bad-debt"],
    quickCheck: {
      q: "Why pay your card BEFORE the statement closes?",
      options: [
        "Avoids late fees",
        "Lowers reported utilization",
        "Earns more rewards",
        "Required by law",
      ],
      correct: 1,
      explain: "Statement balance is what gets reported to the bureaus.",
    },
  },
  {
    id: "j5q3oxWho2U",
    title: "Avalanche vs. Snowball: Which Pays Off Debt Faster?",
    channel: "Khan Academy",
    minutes: 7,
    level: "intermediate",
    concepts: ["debt-payoff-strategies", "good-debt-bad-debt"],
    quickCheck: {
      q: "The avalanche method targets:",
      options: [
        "Smallest balance first",
        "Highest interest rate first",
        "Oldest debt first",
        "Newest debt first",
      ],
      correct: 1,
      explain: "Avalanche = highest rate; snowball = smallest balance.",
    },
  },

  // ─── INVESTING BASICS ───────────────────────────────────────
  {
    id: "kkeBpiNMaWM",
    title: "The Magic of Compound Interest",
    channel: "Khan Academy",
    minutes: 8,
    level: "beginner",
    concepts: ["compound-interest"],
    quickCheck: {
      q: "Why does starting early matter more than starting big?",
      options: [
        "Banks reward youth",
        "Time gives compounding more periods to work",
        "Stocks are cheaper for the young",
        "Tax laws favor youth",
      ],
      correct: 1,
      explain: "More periods = exponentially more growth.",
    },
  },
  {
    id: "iXXp7iAYrGE",
    title: "Stocks vs. Bonds: What's the Difference?",
    channel: "The Plain Bagel",
    minutes: 9,
    level: "beginner",
    concepts: ["stocks-vs-bonds"],
    quickCheck: {
      q: "Owning a stock means you:",
      options: [
        "Lend money to the company",
        "Own a piece of the company",
        "Get a fixed interest rate",
        "Have a guaranteed return",
      ],
      correct: 1,
      explain: "Stocks = ownership; bonds = lending.",
    },
  },
  {
    id: "Sh-eo8_XPzQ",
    title: "Why Index Funds Beat 90% of Active Managers",
    channel: "Ben Felix",
    minutes: 11,
    level: "intermediate",
    concepts: ["index-funds", "diversification"],
    quickCheck: {
      q: "Roughly what % of active fund managers BEAT the index over 15+ years?",
      options: ["80%", "50%", "10–20%", "100%"],
      correct: 2,
      explain: "The vast majority underperform, mostly due to fees.",
    },
  },
  {
    id: "X1qzuPRvsM0",
    title: "Diversification: Don't Put All Your Eggs in One Basket",
    channel: "The Plain Bagel",
    minutes: 8,
    level: "intermediate",
    concepts: ["diversification", "index-funds"],
    quickCheck: {
      q: "How many funds do you need to be well-diversified?",
      options: [
        "At least 20",
        "3 broad index funds is enough for most people",
        "Exactly 10",
        "100+",
      ],
      correct: 1,
      explain: "Three broad funds cover most of the global market.",
    },
  },
  {
    id: "X5pvnE6mFkU",
    title: "Dollar-Cost Averaging Explained",
    channel: "Ben Felix",
    minutes: 7,
    level: "intermediate",
    concepts: ["dollar-cost-averaging"],
    quickCheck: {
      q: "During a market crash, a DCA investor:",
      options: [
        "Sells everything",
        "Stops buying",
        "Keeps buying — and buys more shares per dollar",
        "Switches to bonds",
      ],
      correct: 2,
      explain: "Crashes are when DCA quietly does its best work.",
    },
  },
  {
    id: "qq_K-PZl5Vw",
    title: "401(k) vs Roth IRA: How to Choose",
    channel: "The Plain Bagel",
    minutes: 12,
    level: "intermediate",
    concepts: ["retirement-accounts"],
    quickCheck: {
      q: "If your employer matches 401(k) contributions, you should:",
      options: [
        "Skip the 401(k)",
        "Contribute at least enough to get the full match",
        "Only use a Roth",
        "Wait until you earn more",
      ],
      correct: 1,
      explain: "The match is a 100% return — free money.",
    },
  },

  // ─── MACRO & NEWS LITERACY ──────────────────────────────────
  {
    id: "T8Ph3Wmd5Lk",
    title: "Inflation, Explained Simply",
    channel: "The Plain Bagel",
    minutes: 9,
    level: "beginner",
    concepts: ["inflation", "interest-rates"],
    quickCheck: {
      q: "What inflation rate does the US Federal Reserve target?",
      options: ["0%", "2%", "5%", "10%"],
      correct: 1,
      explain: "2% is the Fed's healthy 'sweet spot.'",
    },
  },
  {
    id: "ELQX9vYwGfM",
    title: "How the Federal Reserve Sets Interest Rates",
    channel: "Money & Macro",
    minutes: 12,
    level: "intermediate",
    concepts: ["interest-rates", "inflation"],
    quickCheck: {
      q: "The Fed's 'dual mandate' is:",
      options: [
        "Profits and growth",
        "Maximum employment and stable prices",
        "Stocks and bonds",
        "Banks and consumers",
      ],
      correct: 1,
      explain: "Two goals: jobs and ~2% inflation.",
    },
  },
  {
    id: "GIQOhgz1y8c",
    title: "What Is a Recession, Really?",
    channel: "Money & Macro",
    minutes: 10,
    level: "intermediate",
    concepts: ["recession", "interest-rates"],
    quickCheck: {
      q: "A recession is officially declared by:",
      options: [
        "The President",
        "Congress",
        "The National Bureau of Economic Research",
        "Wall Street",
      ],
      correct: 2,
      explain: "NBER calls recessions, looking at multiple economic signals.",
    },
  },
  {
    id: "3KJjsB7Ssm0",
    title: "The Yield Curve: The Bond Market's Recession Signal",
    channel: "Patrick Boyle",
    minutes: 14,
    level: "advanced",
    concepts: ["yield-curve", "interest-rates", "recession"],
    quickCheck: {
      q: "An inverted yield curve has historically:",
      options: [
        "Predicted nothing",
        "Preceded most US recessions in the past 50+ years",
        "Caused recessions directly",
        "Only happened twice",
      ],
      correct: 1,
      explain: "Imperfect but reliable leading indicator.",
    },
  },

  // ─── RISK ───────────────────────────────────────────────────
  {
    id: "L3JqDNNJ6tk",
    title: "Risk and Reward: There's No Free Lunch",
    channel: "Ben Felix",
    minutes: 8,
    level: "beginner",
    concepts: ["risk-vs-reward"],
    quickCheck: {
      q: "The 'right' level of risk for you is:",
      options: [
        "The maximum possible",
        "The minimum possible",
        "What you can take and still stay invested through downturns",
        "Whatever your friends do",
      ],
      correct: 2,
      explain: "If risk makes you sell at lows, you've taken too much.",
    },
  },
  {
    id: "WzD3AYvDLUM",
    title: "Volatility Is Not the Same as Risk",
    channel: "Ben Felix",
    minutes: 10,
    level: "intermediate",
    concepts: ["volatility", "risk-vs-reward"],
    quickCheck: {
      q: "People who check their portfolio daily tend to:",
      options: [
        "Outperform",
        "Underperform — checks tempt harmful actions",
        "Earn the same",
        "Avoid taxes",
      ],
      correct: 1,
      explain: "Inaction beats action for most long-term investors.",
    },
  },
  {
    id: "kFQUDeu71sM",
    title: "Asset Allocation: The Most Important Decision",
    channel: "The Plain Bagel",
    minutes: 11,
    level: "intermediate",
    concepts: ["asset-allocation", "stocks-vs-bonds"],
    quickCheck: {
      q: "Using the '110 minus age' rule, a 30-year-old should hold roughly:",
      options: ["30% stocks", "50% stocks", "80% stocks", "100% bonds"],
      correct: 2,
      explain: "110 − 30 = 80% stocks.",
    },
  },

  // ─── ADVANCED MACRO (gated) ─────────────────────────────────
  {
    id: "qFc-YoyjOfk",
    title: "Inside the Swap Market (Advanced)",
    channel: "Patrick Boyle",
    minutes: 38,
    level: "advanced",
    concepts: ["yield-curve", "interest-rates"],
    quickCheck: {
      q: "Interest-rate swaps mainly let parties:",
      options: [
        "Avoid taxes",
        "Exchange fixed for floating rate exposure (or vice versa)",
        "Borrow without collateral",
        "Earn guaranteed returns",
      ],
      correct: 1,
      explain: "Swaps trade one interest-rate stream for another.",
    },
  },
];

/** Lookup helpers. */
export const VIDEO_BY_ID: Record<string, CuratedVideo> = Object.fromEntries(
  CURATED_VIDEOS.map((v) => [v.id, v]),
);

export function videosForConcept(conceptId: string): CuratedVideo[] {
  return CURATED_VIDEOS.filter((v) => v.concepts.includes(conceptId));
}

/** Map a literacy-profile dimension score (0–100) to a max allowed level. */
export function maxLevelForScore(score: number): VideoLevel {
  if (score >= 70) return "advanced";
  if (score >= 40) return "intermediate";
  return "beginner";
}

/** Numeric rank so we can compare levels. */
const LEVEL_RANK: Record<VideoLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/** Is a video allowed given the user's max level for any of its concepts? */
export function isVideoAllowed(
  video: CuratedVideo,
  conceptMaxLevel: (conceptId: string) => VideoLevel,
): boolean {
  // Allow if the user is at-or-above the video's level on at least one of its
  // tagged concepts (no creator should be locked behind every concept).
  return video.concepts.some(
    (c) => LEVEL_RANK[conceptMaxLevel(c)] >= LEVEL_RANK[video.level],
  );
}

/** Pick a "watch next" — same concept first, then a sibling concept. */
export function pickNextVideo(
  current: CuratedVideo,
  watchedIds: Set<string>,
  allowed: (v: CuratedVideo) => boolean,
): CuratedVideo | null {
  // Same concept, unwatched, allowed.
  for (const v of CURATED_VIDEOS) {
    if (v.id === current.id) continue;
    if (watchedIds.has(v.id)) continue;
    if (!allowed(v)) continue;
    if (v.concepts.some((c) => current.concepts.includes(c))) return v;
  }
  // Any unwatched + allowed.
  for (const v of CURATED_VIDEOS) {
    if (v.id === current.id) continue;
    if (watchedIds.has(v.id)) continue;
    if (!allowed(v)) continue;
    return v;
  }
  return null;
}