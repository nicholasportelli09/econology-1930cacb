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
  { level: 1, title: "Newbie", minXP: 0 },
  { level: 2, title: "Learner", minXP: 50 },
  { level: 3, title: "Explorer", minXP: 150 },
  { level: 4, title: "Saver", minXP: 300 },
  { level: 5, title: "Investor", minXP: 500 },
  { level: 6, title: "Strategist", minXP: 800 },
  { level: 7, title: "Expert", minXP: 1200 },
  { level: 8, title: "Master", minXP: 1800 },
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
  { id: "first_login", name: "Welcome!", emoji: "👋", description: "Log in for the first time", condition: (s) => s.xp > 0 },
  { id: "streak_3", name: "On Fire", emoji: "🔥", description: "3-day login streak", condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Dedicated", emoji: "⚡", description: "7-day login streak", condition: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Unstoppable", emoji: "🏆", description: "30-day login streak", condition: (s) => s.streak >= 30 },
  { id: "tips_5", name: "Curious Mind", emoji: "🔍", description: "Explore 5 tips", condition: (s) => s.totalTipsExplored >= 5 },
  { id: "tips_20", name: "Knowledge Seeker", emoji: "📚", description: "Explore 20 tips", condition: (s) => s.totalTipsExplored >= 20 },
  { id: "tips_50", name: "Tip Master", emoji: "🎓", description: "Explore 50 tips", condition: (s) => s.totalTipsExplored >= 50 },
  { id: "quiz_1", name: "Test Taker", emoji: "📝", description: "Complete your first quiz", condition: (s) => s.totalQuizzesTaken >= 1 },
  { id: "quiz_5", name: "Quiz Pro", emoji: "🧠", description: "Complete 5 quizzes", condition: (s) => s.totalQuizzesTaken >= 5 },
  { id: "budget_1", name: "Budget Planner", emoji: "💰", description: "Use the Budget Simulator", condition: (s) => s.budgetSimUses >= 1 },
  { id: "xp_500", name: "Rising Star", emoji: "⭐", description: "Earn 500 XP", condition: (s) => s.xp >= 500 },
  { id: "xp_1000", name: "Financial Guru", emoji: "🌟", description: "Earn 1,000 XP", condition: (s) => s.xp >= 1000 },
];

function computeBadges(state: GamificationState): string[] {
  return ALL_BADGES.filter((b) => b.condition(state)).map((b) => b.id);
}

// ── Financial Health Score ─────────────────────────────────
export function computeHealthScore(profile: UserProfile, gam: GamificationState): {
  score: number;
  breakdown: { label: string; value: number; max: number }[];
} {
  // Quiz knowledge (0-25)
  const quizMax = 25;
  const bestQuiz = Math.max(profile.quizScore ?? 0, profile.quizScore2 ?? 0);
  const quizPoints = Math.round((bestQuiz / 5) * quizMax);

  // Engagement (0-25) — tips explored, streak, budget sim
  const engageMax = 25;
  const tipScore = Math.min(10, gam.totalTipsExplored);
  const streakScore = Math.min(7, gam.streak);
  const simScore = Math.min(3, gam.budgetSimUses);
  const quizCount = Math.min(5, gam.totalQuizzesTaken);
  const engagePoints = Math.round(((tipScore + streakScore + simScore + quizCount) / 25) * engageMax);

  // Goals clarity (0-25) — financial goals set
  const goalsMax = 25;
  const goalsPoints = Math.round(Math.min(1, profile.financialGoals.length / 3) * goalsMax);

  // Diversification (0-25) — topics selected
  const divMax = 25;
  const divPoints = Math.round(Math.min(1, profile.topicsOfInterest.length / 4) * divMax);

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
