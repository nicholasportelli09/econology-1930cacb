import { supabase } from "@/integrations/supabase/client";
import { loadStreak, type StreakState } from "@/lib/lessons";

/**
 * Watch-and-earn-XP for curated videos. We reuse the existing lesson_progress
 * + daily_streak tables — concept_id is stored as `video:<youtubeId>` so
 * videos and lessons share the same XP / streak rails without a new schema.
 *
 * Awards a flat 25 XP for a correct quick-check (15 XP for a wrong one — they
 * still watched). Counts toward `total_lessons` once per video.
 */

export const VIDEO_XP_CORRECT = 25;
export const VIDEO_XP_WATCHED = 15;

function videoConceptId(videoId: string): string {
  return `video:${videoId}`;
}

export async function loadWatchedVideoIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("lesson_progress")
    .select("concept_id")
    .eq("user_id", userId)
    .like("concept_id", "video:%");
  if (!data) return new Set();
  return new Set(data.map((r) => r.concept_id.slice("video:".length)));
}

export async function recordVideoWatch(
  userId: string,
  videoId: string,
  correct: boolean,
): Promise<{ streak: StreakState; xpAwarded: number; firstTime: boolean }> {
  const conceptId = videoConceptId(videoId);

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("attempts")
    .eq("user_id", userId)
    .eq("concept_id", conceptId)
    .maybeSingle();

  const firstTime = !existing;
  const attempts = (existing?.attempts ?? 0) + 1;
  const xpAwarded = firstTime
    ? correct
      ? VIDEO_XP_CORRECT
      : VIDEO_XP_WATCHED
    : 0; // no XP for re-watching the same video

  await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      concept_id: conceptId,
      quiz_score: correct ? 1 : 0,
      quiz_total: 1,
      attempts,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,concept_id" },
  );

  // Update XP + total_lessons on the streak row, but DON'T touch streak/date —
  // videos boost XP without single-handedly satisfying the daily lesson loop.
  const prev = await loadStreak(userId);
  const next: StreakState = {
    ...prev,
    totalLessons: prev.totalLessons + (firstTime ? 1 : 0),
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

  return { streak: next, xpAwarded, firstTime };
}