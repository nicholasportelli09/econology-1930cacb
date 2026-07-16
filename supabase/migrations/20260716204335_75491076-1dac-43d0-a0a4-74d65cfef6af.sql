-- 1. Backup daily_streak for reversibility.
CREATE TABLE IF NOT EXISTS public.daily_streak_backup_20260716 AS
  TABLE public.daily_streak;
GRANT ALL ON public.daily_streak_backup_20260716 TO service_role;
ALTER TABLE public.daily_streak_backup_20260716 ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (and superuser) can read the backup.

-- 2. Add video-specific counters to daily_streak.
ALTER TABLE public.daily_streak
  ADD COLUMN IF NOT EXISTS total_videos integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_xp integer NOT NULL DEFAULT 0;

-- 3. Back-fill: split existing video rows out of total_lessons / total_xp.
WITH video_stats AS (
  SELECT
    user_id,
    COUNT(*)::int AS v_count,
    -- Approximate historical video XP: 25 XP for correct quick-check, 15 for watched.
    SUM(CASE WHEN quiz_score >= quiz_total THEN 25 ELSE 15 END)::int AS v_xp
  FROM public.lesson_progress
  WHERE concept_id LIKE 'video:%'
  GROUP BY user_id
)
UPDATE public.daily_streak ds
SET
  total_videos = vs.v_count,
  video_xp = vs.v_xp,
  total_lessons = GREATEST(0, ds.total_lessons - vs.v_count),
  total_xp = GREATEST(0, ds.total_xp - vs.v_xp)
FROM video_stats vs
WHERE ds.user_id = vs.user_id;