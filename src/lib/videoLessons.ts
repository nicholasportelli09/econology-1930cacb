import { supabase } from "@/integrations/supabase/client";
import { loadStreak, type StreakState } from "@/lib/lessons";

/**
 * Watch-and-earn-XP for curated videos.
 *
 * Video watches are a "learning activity", NOT a lesson:
 *   - They do NOT advance the daily streak.
 *   - They do NOT increment `total_lessons` or `total_xp`.
 *   - They do NOT update `last_lesson_date`.
 *   - They only bump `total_videos` and `video_xp` on the streak row.
 *
 * Video watch history still lives in `lesson_progress` with a `video:<id>`
 * concept id purely as a "have I watched this?" store.
 *
 * Awards a flat 25 XP for a correct quick-check (15 XP for a wrong one — they
 * still watched). No XP for re-watching.
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

  const prev = await loadStreak(userId);
  const next: StreakState = {
    ...prev,
    totalVideos: prev.totalVideos + (firstTime ? 1 : 0),
    videoXp: prev.videoXp + xpAwarded,
  };

  // Only touch the video counters — do NOT overwrite streak/date/lesson totals.
  // Cast to loose record because generated types may not include the new
  // columns until the Supabase types file regenerates.
  await supabase.from("daily_streak").upsert(
    {
      user_id: userId,
      total_videos: next.totalVideos,
      video_xp: next.videoXp,
      // Preserve required fields on first-ever row (upsert needs full row).
      current_streak: prev.current,
      longest_streak: prev.longest,
      last_lesson_date: prev.lastLessonDate,
      freeze_tokens: prev.freezeTokens,
      total_lessons: prev.totalLessons,
      total_xp: prev.totalXp,
    } as never,
    { onConflict: "user_id" },
  );

  return { streak: next, xpAwarded, firstTime };
}