
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('ai_news','market_idea','ai_summary','ai_digest','ai_tutor')),
  content_reference TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reports"
  ON public.content_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own reports"
  ON public.content_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER content_reports_set_updated_at
  BEFORE UPDATE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX content_reports_user_id_created_at_idx
  ON public.content_reports(user_id, created_at DESC);
