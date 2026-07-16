
-- 1. Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 2. product_events
CREATE TABLE IF NOT EXISTS public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_name text NOT NULL,
  page_path text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  app_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.product_events TO anon, authenticated;
GRANT SELECT ON public.product_events TO authenticated;
GRANT ALL ON public.product_events TO service_role;

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert own product events" ON public.product_events;
CREATE POLICY "Anyone can insert own product events" ON public.product_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read product events" ON public.product_events;
CREATE POLICY "Admins can read product events" ON public.product_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS product_events_event_created_idx
  ON public.product_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_session_created_idx
  ON public.product_events (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_user_created_idx
  ON public.product_events (user_id, created_at DESC);

-- 3. app_errors
CREATE TABLE IF NOT EXISTS public.app_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  route text,
  message text NOT NULL,
  stack text,
  app_version text,
  request_id text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.app_errors TO anon, authenticated;
GRANT SELECT ON public.app_errors TO authenticated;
GRANT ALL ON public.app_errors TO service_role;

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert own app errors" ON public.app_errors;
CREATE POLICY "Anyone can insert own app errors" ON public.app_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read app errors" ON public.app_errors;
CREATE POLICY "Admins can read app errors" ON public.app_errors
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS app_errors_session_created_idx
  ON public.app_errors (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_errors_created_idx
  ON public.app_errors (created_at DESC);

-- 4. Admin-only aggregate metrics for /admin/launch-metrics
CREATE OR REPLACE FUNCTION public.launch_metrics(_start date, _end date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH bounds AS (
    SELECT _start::timestamptz AS s, (_end::timestamptz + interval '1 day') AS e
  ),
  ev AS (
    SELECT pe.*, DATE(pe.created_at) AS d
    FROM public.product_events pe, bounds b
    WHERE pe.created_at >= b.s AND pe.created_at < b.e
  ),
  signups AS (
    SELECT COUNT(DISTINCT user_id) AS n
    FROM ev WHERE event_name = 'signup_completed' AND user_id IS NOT NULL
  ),
  activated_users AS (
    SELECT DISTINCT a.user_id
    FROM ev a
    JOIN ev l ON l.user_id = a.user_id AND l.event_name = 'lesson_completed'
    WHERE a.event_name = 'onboarding_completed' AND a.user_id IS NOT NULL
  ),
  lessons_completed AS (
    SELECT user_id, COUNT(*) AS n
    FROM ev
    WHERE event_name = 'lesson_completed' AND user_id IS NOT NULL
    GROUP BY user_id
  ),
  news_opens AS (
    SELECT
      COUNT(*) FILTER (WHERE event_name = 'news_article_opened') AS opens,
      COUNT(*) FILTER (WHERE event_name = 'original_source_opened') AS sources
    FROM ev
  ),
  watchlist AS (
    SELECT COUNT(DISTINCT user_id) AS n
    FROM ev
    WHERE event_name = 'watchlist_ticker_added' AND user_id IS NOT NULL
  ),
  sessions AS (
    SELECT DISTINCT session_id FROM ev WHERE session_id IS NOT NULL
  ),
  err_sessions AS (
    SELECT DISTINCT ae.session_id
    FROM public.app_errors ae, bounds b
    WHERE ae.created_at >= b.s AND ae.created_at < b.e AND ae.session_id IS NOT NULL
  ),
  session_stats AS (
    SELECT
      (SELECT COUNT(*) FROM sessions) AS total,
      (SELECT COUNT(*) FROM sessions s WHERE s.session_id IN (SELECT session_id FROM err_sessions)) AS with_errors
  ),
  daily_signups AS (
    SELECT d, COUNT(DISTINCT user_id) AS n
    FROM ev WHERE event_name = 'signup_completed' AND user_id IS NOT NULL
    GROUP BY d ORDER BY d
  ),
  retention AS (
    SELECT
      COALESCE(SUM(d1_return),0) AS d1r,
      COALESCE(SUM(d7_return),0) AS d7r,
      COALESCE(SUM(cohort_size),0) AS total_cohort
    FROM public.retention_cohorts(_start, _end)
  )
  SELECT jsonb_build_object(
    'new_accounts', (SELECT n FROM signups),
    'activated_users', (SELECT COUNT(*) FROM activated_users),
    'activation_rate', CASE WHEN (SELECT n FROM signups) > 0
      THEN ROUND((SELECT COUNT(*) FROM activated_users)::numeric * 100 / (SELECT n FROM signups), 2)
      ELSE 0 END,
    'lessons_per_activated_user', CASE WHEN (SELECT COUNT(*) FROM activated_users) > 0
      THEN ROUND(
        (SELECT COALESCE(SUM(n),0) FROM lessons_completed WHERE user_id IN (SELECT user_id FROM activated_users))::numeric
        / (SELECT COUNT(*) FROM activated_users), 2)
      ELSE 0 END,
    'source_open_rate', CASE WHEN (SELECT opens FROM news_opens) > 0
      THEN ROUND((SELECT sources FROM news_opens)::numeric * 100 / (SELECT opens FROM news_opens), 2)
      ELSE 0 END,
    'watchlist_adopters', (SELECT n FROM watchlist),
    'watchlist_adoption_rate', CASE WHEN (SELECT n FROM signups) > 0
      THEN ROUND((SELECT n FROM watchlist)::numeric * 100 / (SELECT n FROM signups), 2)
      ELSE 0 END,
    'sessions_total', (SELECT total FROM session_stats),
    'sessions_with_errors', (SELECT with_errors FROM session_stats),
    'crash_free_rate', CASE WHEN (SELECT total FROM session_stats) > 0
      THEN ROUND(((SELECT total FROM session_stats) - (SELECT with_errors FROM session_stats))::numeric * 100 / (SELECT total FROM session_stats), 2)
      ELSE 100 END,
    'd1_retention_rate', CASE WHEN (SELECT total_cohort FROM retention) > 0
      THEN ROUND((SELECT d1r FROM retention)::numeric * 100 / (SELECT total_cohort FROM retention), 2)
      ELSE 0 END,
    'd7_retention_rate', CASE WHEN (SELECT total_cohort FROM retention) > 0
      THEN ROUND((SELECT d7r FROM retention)::numeric * 100 / (SELECT total_cohort FROM retention), 2)
      ELSE 0 END,
    'daily_signups', COALESCE((SELECT jsonb_agg(jsonb_build_object('date', d, 'count', n) ORDER BY d) FROM daily_signups), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.launch_metrics(date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.launch_metrics(date, date) TO authenticated;
