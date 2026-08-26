REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.launch_metrics(date, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.launch_metrics(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.launch_metrics(date, date) TO authenticated;