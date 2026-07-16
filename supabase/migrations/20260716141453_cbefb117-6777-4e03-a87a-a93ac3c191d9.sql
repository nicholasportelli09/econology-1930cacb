REVOKE EXECUTE ON FUNCTION public.retention_cohorts(date, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.retention_cohorts(date, date) TO service_role;
