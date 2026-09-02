// Shared response cache backed by public.api_cache.
// Lets one upstream API call (Finnhub / NewsAPI / Yahoo / AI) serve every user
// for the duration of the TTL, so traffic spikes don't multiply provider calls.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function headers() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function cacheKey(parts: unknown): Promise<string> {
  const raw = typeof parts === "string" ? parts : JSON.stringify(parts);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/api_cache?cache_key=eq.${encodeURIComponent(key)}&select=payload,expires_at`,
      { headers: headers() },
    );
    if (!resp.ok) return null;
    const rows = await resp.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    if (new Date(row.expires_at).getTime() <= Date.now()) return null;
    return row.payload as T;
  } catch (e) {
    console.error("cacheGet failed", e);
    return null;
  }
}

export async function cacheSet(key: string, payload: unknown, ttlSeconds: number): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/api_cache?on_conflict=cache_key`, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        cache_key: key,
        payload,
        expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      }),
    });
  } catch (e) {
    console.error("cacheSet failed", e);
  }
}

/** Fetch-through helper: returns cached value or computes, stores and returns a fresh one. */
export async function cached<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  const hitValue = await cacheGet<T>(key);
  if (hitValue !== null) return { value: hitValue, hit: true };
  const value = await compute();
  await cacheSet(key, value, ttlSeconds);
  return { value, hit: false };
}
