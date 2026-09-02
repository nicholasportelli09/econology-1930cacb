CREATE TABLE public.api_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.api_cache TO service_role;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages api cache" ON public.api_cache FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_api_cache_expires ON public.api_cache (expires_at);