CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  session_id text,
  pathname text,
  user_agent text,
  severity text CHECK (severity IN ('info', 'warning', 'error', 'crash')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous pre-signup events" ON public.analytics_events;
CREATE POLICY "Anonymous pre-signup events"
  ON public.analytics_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Service role manages analytics events" ON public.analytics_events;
CREATE POLICY "Service role manages analytics events"
  ON public.analytics_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS analytics_events_user_event_created_idx
  ON public.analytics_events (user_id, event, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_event_created_idx
  ON public.analytics_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_session_created_idx
  ON public.analytics_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_severity_created_idx
  ON public.analytics_events (severity, created_at DESC)
  WHERE severity IN ('error', 'crash');

CREATE OR REPLACE FUNCTION public.retention_cohorts(
  start_date date,
  end_date date
)
RETURNS TABLE (
  cohort_date date,
  cohort_size bigint,
  d1_return bigint,
  d7_return bigint,
  d1_rate numeric,
  d7_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cohorts AS (
    SELECT
      DATE(created_at) AS cohort_date,
      user_id
    FROM public.analytics_events
    WHERE event = 'signup_completed'
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at), user_id
  ),
  returns AS (
    SELECT
      c.cohort_date,
      c.user_id,
      MAX(CASE WHEN DATE(e.created_at) = c.cohort_date + INTERVAL '1 day' THEN 1 ELSE 0 END) AS d1,
      MAX(CASE WHEN DATE(e.created_at) BETWEEN c.cohort_date + INTERVAL '1 day' AND c.cohort_date + INTERVAL '7 days' THEN 1 ELSE 0 END) AS d7
    FROM cohorts c
    JOIN public.analytics_events e ON e.user_id = c.user_id
      AND DATE(e.created_at) > c.cohort_date
      AND DATE(e.created_at) <= c.cohort_date + INTERVAL '7 days'
    GROUP BY c.cohort_date, c.user_id
  )
  SELECT
    c.cohort_date,
    COUNT(DISTINCT c.user_id) AS cohort_size,
    COALESCE(SUM(r.d1), 0) AS d1_return,
    COALESCE(SUM(r.d7), 0) AS d7_return,
    CASE WHEN COUNT(DISTINCT c.user_id) > 0
      THEN ROUND(COALESCE(SUM(r.d1), 0)::numeric * 100 / COUNT(DISTINCT c.user_id), 2)
      ELSE 0
    END AS d1_rate,
    CASE WHEN COUNT(DISTINCT c.user_id) > 0
      THEN ROUND(COALESCE(SUM(r.d7), 0)::numeric * 100 / COUNT(DISTINCT c.user_id), 2)
      ELSE 0
    END AS d7_rate
  FROM cohorts c
  LEFT JOIN returns r ON r.cohort_date = c.cohort_date AND r.user_id = c.user_id
  GROUP BY c.cohort_date
  ORDER BY c.cohort_date DESC;
$$;

GRANT EXECUTE ON FUNCTION public.retention_cohorts(date, date) TO service_role;
