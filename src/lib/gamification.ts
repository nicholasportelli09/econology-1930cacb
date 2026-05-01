import { type UserProfile, TOPICS_OF_INTEREST } from "@/types/profile";

// ── XP System ──────────────────────────────────────────────
export const XP_REWARDS = {
  COMPLETE_ONBOARDING: 50,
  TAKE_QUIZ: 30,
  PERFECT_QUIZ: 50,
  EXPLORE_TIP: 10,
  DAILY_LOGIN: 15,
  PIN_ARTICLE: 5,
  USE_BUDGET_SIM: 20,
  ASK_EKON: 10,
} as const;

export interface GamificationState {
  xp: number;
  streak: number;
  lastLoginDate: string; // ISO date string (date only)
  badges: string[];
  totalTipsExplored: number;
  totalQuizzesTaken: number;
  budgetSimUses: number;
}

const STORAGE_KEY = "econology_gamification";

const defaultState: GamificationState = {
  xp: 0,
  streak: 0,
  lastLoginDate: "",
  badges: [],
  totalTipsExplored: 0,
  totalQuizzesTaken: 0,
  budgetSimUses: 0,
};

export function getGamification(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function saveGamification(state: GamificationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addXP(amount: number, reason?: string): GamificationState {
  const state = getGamification();
  state.xp += amount;
  // Check for new badges after XP change
  const newBadges = computeBadges(state);
  state.badges = newBadges;
  saveGamification(state);
  return state;
}

export function recordDailyLogin(): { state: GamificationState; isNewDay: boolean } {
  const state = getGamification();
  const today = new Date().toISOString().slice(0, 10);

  if (state.lastLoginDate === today) {
    return { state, isNewDay: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.lastLoginDate === yesterday) {
    state.streak += 1;
  } else if (state.lastLoginDate !== today) {
    state.streak = 1;
  }

  state.lastLoginDate = today;
  state.xp += XP_REWARDS.DAILY_LOGIN;
  state.badges = computeBadges(state);
  saveGamification(state);
  return { state, isNewDay: true };
}

export function recordTipExplored(): GamificationState {
  const state = getGamification();
  state.totalTipsExplored += 1;
  state.xp += XP_REWARDS.EXPLORE_TIP;
  state.badges = computeBadges(state);
  saveGamification(state);
  return state;
}

export function recordQuiz(score: number, total: number): GamificationState {
  const state = getGamification();
  state.totalQuizzesTaken += 1;
  state.xp += XP_REWARDS.TAKE_QUIZ;
  if (score === total) state.xp += XP_REWARDS.PERFECT_QUIZ;
  state.badges = computeBadges(state);
  saveGamification(state);
  return state;
}

export function recordBudgetSim(): GamificationState {
  const state = getGamification();
  state.budgetSimUses += 1;
  state.xp += XP_REWARDS.USE_BUDGET_SIM;
  state.badges = computeBadges(state);
  saveGamification(state);
  return state;
}

// ── Levels ─────────────────────────────────────────────────
export interface Level {
  level: number;
  title: string;
  minXP: number;
}

export const LEVELS: Level[] = [
  { level: 1, title: "Foundation", minXP: 0 },
  { level: 2, title: "Informed", minXP: 50 },
  { level: 3, title: "Practitioner", minXP: 150 },
  { level: 4, title: "Disciplined", minXP: 300 },
  { level: 5, title: "Proficient", minXP: 500 },
  { level: 6, title: "Strategist", minXP: 800 },
  { level: 7, title: "Advanced", minXP: 1200 },
  { level: 8, title: "Authority", minXP: 1800 },
];

export function getLevel(xp: number): Level & { progress: number; nextLevel: Level | null } {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
  }
  const idx = LEVELS.indexOf(current);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const progress = next
    ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
    : 100;
  return { ...current, progress: Math.min(100, progress), nextLevel: next };
}

// ── Badges ─────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: GamificationState) => boolean;
}

export const ALL_BADGES: Badge[] = [
  { id: "first_login", name: "First Step", emoji: "✓", description: "Complete your first session", condition: (s) => s.xp > 0 },
  { id: "streak_3", name: "Consistent", emoji: "📈", description: "Maintain a 3-day engagement streak", condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Committed", emoji: "⚡", description: "Maintain a 7-day engagement streak", condition: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Disciplined", emoji: "🏆", description: "Maintain a 30-day engagement streak", condition: (s) => s.streak >= 30 },
  { id: "tips_5", name: "Researcher", emoji: "🔍", description: "Study 5 financial insights", condition: (s) => s.totalTipsExplored >= 5 },
  { id: "tips_20", name: "Analyst", emoji: "📊", description: "Study 20 financial insights", condition: (s) => s.totalTipsExplored >= 20 },
  { id: "tips_50", name: "Scholar", emoji: "🎓", description: "Study 50 financial insights", condition: (s) => s.totalTipsExplored >= 50 },
  { id: "quiz_1", name: "Assessed", emoji: "📝", description: "Complete your first assessment", condition: (s) => s.totalQuizzesTaken >= 1 },
  { id: "quiz_5", name: "Well-Tested", emoji: "🧠", description: "Complete 5 assessments", condition: (s) => s.totalQuizzesTaken >= 5 },
  { id: "budget_1", name: "Planner", emoji: "💼", description: "Use the Budget Simulator", condition: (s) => s.budgetSimUses >= 1 },
  { id: "xp_500", name: "Progressing", emoji: "⭐", description: "Accumulate 500 XP", condition: (s) => s.xp >= 500 },
  { id: "xp_1000", name: "Distinguished", emoji: "🌟", description: "Accumulate 1,000 XP", condition: (s) => s.xp >= 1000 },
];

function computeBadges(state: GamificationState): string[] {
  return ALL_BADGES.filter((b) => b.condition(state)).map((b) => b.id);
}

// ── Learning Progress Score ─────────────────────────────────
export function computeHealthScore(profile: UserProfile, gam: GamificationState): {
  score: number;
  breakdown: { label: string; value: number; max: number }[];
} {
  // Quiz knowledge (0-25) — requires strong quiz performance across multiple attempts
  const quizMax = 25;
  const bestQuiz = Math.max(profile.quizScore ?? 0, profile.quizScore2 ?? 0);
  const quizBase = Math.round((bestQuiz / 5) * 15); // best score worth up to 15
  const quizRepeat = Math.round(Math.min(1, gam.totalQuizzesTaken / 3) * 10); // repeat assessments worth up to 10
  const quizPoints = Math.min(quizMax, quizBase + quizRepeat);

  // Engagement (0-25) — tips explored, streak, budget sim, quizzes
  const engageMax = 25;
  const tipScore = Math.min(15, gam.totalTipsExplored); // need 15 tips
  const streakScore = Math.min(10, gam.streak); // need 10-day streak
  const simScore = Math.min(5, gam.budgetSimUses); // need 5 sim uses
  const quizCount = Math.min(5, gam.totalQuizzesTaken);
  const engagePoints = Math.round(((tipScore + streakScore + simScore + quizCount) / 35) * engageMax);

  // Goals clarity (0-25) — need more goals for full marks
  const goalsMax = 25;
  const goalsPoints = Math.round(Math.min(1, profile.financialGoals.length / 5) * goalsMax);

  // Diversification (0-25) — need broader topic coverage
  const divMax = 25;
  const divPoints = Math.round(Math.min(1, profile.topicsOfInterest.length / 7) * divMax);

  const score = quizPoints + engagePoints + goalsPoints + divPoints;

  return {
    score,
    breakdown: [
      { label: "Knowledge", value: quizPoints, max: quizMax },
      { label: "Engagement", value: engagePoints, max: engageMax },
      { label: "Goals", value: goalsPoints, max: goalsMax },
      { label: "Diversification", value: divPoints, max: divMax },
    ],
  };
}
