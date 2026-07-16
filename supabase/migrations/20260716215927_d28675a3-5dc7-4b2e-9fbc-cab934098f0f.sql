-- 1) content_reports: allow admins to update/delete reports for moderation
CREATE POLICY "Admins can update content reports"
ON public.content_reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content reports"
ON public.content_reports
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Drop the leftover backup table (no longer needed; safer than leaving unpoliced)
DROP TABLE IF EXISTS public.daily_streak_backup_20260716;

-- 3) Lock down SECURITY DEFINER functions that are not meant to be called from the API.
--    Edge functions using these run as service_role, which retains access.
--    has_role stays callable by authenticated because RLS policies invoke it.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.encrypt_pii(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_pii(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.retention_cohorts(date, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.launch_metrics(date, date) FROM PUBLIC, anon;
-- launch_metrics performs its own admin check via has_role, so authenticated may call it.