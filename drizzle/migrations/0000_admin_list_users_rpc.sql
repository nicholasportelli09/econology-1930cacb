-- Admin-only RPC: list auth users with derived activity stats.
-- SECURITY DEFINER because auth.users is not exposed via the Data API;
-- access is gated by has_role(auth.uid(), 'admin').
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  email text,
  provider text,
  email_confirmed boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  lessons_completed bigint,
  onboarded boolean,
  guest_mode boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT
    u.id AS user_id,
    u.email,
    COALESCE(
      u.raw_app_meta_data->>'provider',
      u.raw_user_meta_data->>'provider',
      'email'
    ) AS provider,
    (u.email_confirmed_at IS NOT NULL) AS email_confirmed,
    u.created_at,
    u.last_sign_in_at,
    (
      SELECT COUNT(*)
      FROM public.lesson_progress lp
      WHERE lp.user_id = u.id
    ) AS lessons_completed,
    EXISTS (
      SELECT 1 FROM public.literacy_profiles lprof
      WHERE lprof.user_id = u.id
    ) AS onboarded,
    COALESCE(
      (
        SELECT bool_or(pe.properties->>'guest' = 'true')
        FROM public.product_events pe
        WHERE pe.user_id = u.id
          AND pe.event_name = 'guest_mode_entered'
      ),
      false
    ) AS guest_mode
  FROM auth.users u
  WHERE p_search IS NULL
     OR u.email ILIKE '%' || p_search || '%'
  ORDER BY u.created_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 500)
  OFFSET GREATEST(p_offset, 0);
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users(integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users(integer, integer, text) TO authenticated;
