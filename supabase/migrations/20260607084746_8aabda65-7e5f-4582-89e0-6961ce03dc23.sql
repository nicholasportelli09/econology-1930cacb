REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.tg_set_updated_at() SET search_path = public, pg_temp;

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit log" ON public.audit_log;
CREATE POLICY "Users can view own audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages audit log" ON public.audit_log;
CREATE POLICY "Service role manages audit log"
  ON public.audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS audit_log_user_id_created_at_idx
  ON public.audit_log (user_id, created_at DESC);

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.encrypt_pii(plaintext text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE k text;
BEGIN
  IF plaintext IS NULL THEN RETURN NULL; END IF;
  BEGIN
    k := current_setting('app.encryption_key', true);
  EXCEPTION WHEN OTHERS THEN
    k := NULL;
  END;
  IF k IS NULL OR length(k) = 0 THEN
    RETURN plaintext;
  END IF;
  RETURN encode(pgp_sym_encrypt(plaintext, k), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_pii(ciphertext text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE k text;
BEGIN
  IF ciphertext IS NULL THEN RETURN NULL; END IF;
  BEGIN
    k := current_setting('app.encryption_key', true);
  EXCEPTION WHEN OTHERS THEN
    k := NULL;
  END;
  IF k IS NULL OR length(k) = 0 THEN
    RETURN ciphertext;
  END IF;
  BEGIN
    RETURN pgp_sym_decrypt(decode(ciphertext, 'base64'), k);
  EXCEPTION WHEN OTHERS THEN
    RETURN ciphertext;
  END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.encrypt_pii(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_pii(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_pii(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_pii(text) TO service_role;