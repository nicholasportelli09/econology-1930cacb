import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { trackProduct } from "@/lib/productAnalytics";

export interface LessonProgressRow {
  conceptId: string;
  completedAt: string;
  quizScore: number;
  quizTotal: number;
  attempts: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastLessonDate: string | null; // YYYY-MM-DD
  freezeTokens: number;
  totalLessons: number;
  totalXp: number;
}

export const FREEZE_TOKEN_MAX = 2;
/** Earn one freeze token every N lessons (capped at FREEZE_TOKEN_MAX). */
export const FREEZE_TOKEN_EVERY = 5;
/** XP awarded per completed lesson, plus bonus for perfect quiz. */
export const LESSON_XP = 20;
export const PERFECT_LESSON_XP = 10;

export async function loadLessonProgress(
  userId: string,
): Promise<LessonProgressRow[]> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((r) => ({
    conceptId: r.concept_id,
    completedAt: r.completed_at,
    quizScore: r.quiz_score,
    quizTotal: r.quiz_total,
    attempts: r.attempts,
  }));
}

export async function loadStreak(userId: string): Promise<StreakState> {
  const { data } = await supabase
    .from("daily_streak")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return {
      current: 0,
      longest: 0,
      lastLessonDate: null,
      freezeTokens: 0,
      totalLessons: 0,
      totalXp: 0,
    };
  }
  return {
    current: data.current_streak,
    longest: data.longest_streak,
    lastLessonDate: data.last_lesson_date,
    freezeTokens: data.freeze_tokens,
    totalLessons: data.total_lessons,
    totalXp: data.total_xp,
  };
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayUTC(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

/**
 * Record a completed lesson. Updates streak, awards XP, awards freeze tokens
 * every FREEZE_TOKEN_EVERY lessons (capped at FREEZE_TOKEN_MAX), and applies
 * a freeze token automatically if the user missed exactly one day and has one.
 */
export async function completeLesson(
  userId: string,
  conceptId: string,
  quizScore: number,
  quizTotal: number,
): Promise<{ streak: StreakState; usedFreeze: boolean; xpAwarded: number }> {
  // Upsert progress row (preserve attempts on retake).
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("attempts")
    .eq("user_id", userId)
    .eq("concept_id", conceptId)
    .maybeSingle();

  const attempts = (existing?.attempts ?? 0) + 1;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      concept_id: conceptId,
      quiz_score: quizScore,
      quiz_total: quizTotal,
      attempts,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,concept_id" },
  );

  // Count total lessons completed to fire first_lesson_completed exactly once.
  const { count: totalCompleted } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  const isFirst = attempts === 1 && (totalCompleted ?? 0) <= 1;
  if (isFirst) {
    track("first_lesson_completed", { conceptId, quizScore, quizTotal });
  }
  track("lesson_completed", {
    conceptId,
    quizScore,
    quizTotal,
    attempts,
    accuracy: quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0,
  });
  void trackProduct("lesson_completed", { concept_id: conceptId });

  // Streak update.
  const prev = await loadStreak(userId);
  const today = todayUTC();
  const yest = yesterdayUTC();

  let nextCurrent = prev.current;
  let nextFreeze = prev.freezeTokens;
  let usedFreeze = false;

  if (prev.lastLessonDate === today) {
    // Already counted today; streak unchanged.
  } else if (prev.lastLessonDate === yest || prev.current === 0) {
    nextCurrent = (prev.current || 0) + 1;
  } else if (
    prev.lastLessonDate &&
    daysBetween(prev.lastLessonDate, today) === 2 &&
    nextFreeze > 0
  ) {
    // Missed exactly one day — burn a freeze token to keep streak alive.
    nextFreeze -= 1;
    nextCurrent = prev.current + 1;
    usedFreeze = true;
  } else {
    // Streak broken.
    nextCurrent = 1;
  }

  const totalLessons = prev.totalLessons + (existing ? 0 : 1);

  // Earn freeze token at every Nth lesson (capped).
  if (
    !existing &&
    totalLessons > 0 &&
    totalLessons % FREEZE_TOKEN_EVERY === 0 &&
    nextFreeze < FREEZE_TOKEN_MAX
  ) {
    nextFreeze += 1;
  }

  const xpAwarded =
    LESSON_XP + (quizScore === quizTotal ? PERFECT_LESSON_XP : 0);

  const next: StreakState = {
    current: nextCurrent,
    longest: Math.max(prev.longest, nextCurrent),
    lastLessonDate: today,
    freezeTokens: nextFreeze,
    totalLessons,
    totalXp: prev.totalXp + xpAwarded,
  };

  await supabase.from("daily_streak").upsert(
    {
      user_id: userId,
      current_streak: next.current,
      longest_streak: next.longest,
      last_lesson_date: next.lastLessonDate,
      freeze_tokens: next.freezeTokens,
      total_lessons: next.totalLessons,
      total_xp: next.totalXp,
    },
    { onConflict: "user_id" },
  );

  return { streak: next, usedFreeze, xpAwarded };
}

/** Has the user completed today's required lesson? */
export function hasDoneTodaysLesson(streak: StreakState): boolean {
  return streak.lastLessonDate === todayUTC();
}