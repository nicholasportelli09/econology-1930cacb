-- ── literacy_profiles ─────────────────────────────────────────
CREATE TABLE public.literacy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  score_budgeting smallint NOT NULL DEFAULT 0,
  score_credit smallint NOT NULL DEFAULT 0,
  score_investing smallint NOT NULL DEFAULT 0,
  score_macro smallint NOT NULL DEFAULT 0,
  score_risk smallint NOT NULL DEFAULT 0,
  mastered_concepts text[] NOT NULL DEFAULT '{}',
  weak_concepts text[] NOT NULL DEFAULT '{}',
  unknown_concepts text[] NOT NULL DEFAULT '{}',
  diagnostic_taken_at timestamptz NOT NULL DEFAULT now(),
  diagnostic_count smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.literacy_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own literacy profile"
  ON public.literacy_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own literacy profile"
  ON public.literacy_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own literacy profile"
  ON public.literacy_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── lesson_progress ───────────────────────────────────────────
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  concept_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  quiz_score smallint NOT NULL DEFAULT 0,
  quiz_total smallint NOT NULL DEFAULT 3,
  attempts smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, concept_id)
);

CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
  ON public.lesson_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON public.lesson_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON public.lesson_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── daily_streak ──────────────────────────────────────────────
CREATE TABLE public.daily_streak (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak smallint NOT NULL DEFAULT 0,
  longest_streak smallint NOT NULL DEFAULT 0,
  last_lesson_date date,
  freeze_tokens smallint NOT NULL DEFAULT 0,
  total_lessons smallint NOT NULL DEFAULT 0,
  total_xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_streak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.daily_streak FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.daily_streak FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.daily_streak FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── updated_at trigger function (idempotent) ──────────────────
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_literacy_profiles_updated
  BEFORE UPDATE ON public.literacy_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER trg_lesson_progress_updated
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER trg_daily_streak_updated
  BEFORE UPDATE ON public.daily_streak
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();