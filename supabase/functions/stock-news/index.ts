import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";
import { cacheGet, cacheKey, cacheSet } from "../_shared/cache.ts";

const BodySchema = z.object({
  tickers: z.string().max(500).optional().default(""),
  category: z.string().max(50).optional().default("general"),
  limit: z.number().int().min(1).max(50).optional().default(15),
});

const ALLOWED_ORIGINS = [
  "https://www.econology.app",
  "https://econology.app",
  "https://econology.lovable.app",
];
function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const host = (() => { try { return new URL(origin).hostname; } catch { return ""; } })();
  const allow = ALLOWED_ORIGINS.includes(origin)
    || /\.lovable(project)?\.(app|dev)$/.test(host)
    || /\.lovableproject\.com$/.test(host)
    || /\.vercel\.app$/.test(host)
    ? origin
    : "https://www.econology.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: verify authenticated user
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!_token) {
    console.warn("auth_failure", { fn: "stock-news", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "missing_token" });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const _authResp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
    { headers: { 'Authorization': `Bearer ${_token}`, 'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '' } }
  );
  if (!_authResp.ok) {
    console.warn("auth_failure", { fn: "stock-news", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "invalid_token", status: _authResp.status });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  try {
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    if (!FINNHUB_API_KEY) throw new Error("FINNHUB_API_KEY is not configured");

    const rawBody = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { tickers, category, limit } = parsed.data;

    // Same headlines for everyone -> cache the whole response for 10 minutes.
    const NEWS_TTL_SECONDS = 600;
    const newsKey = await cacheKey(`stock-news:v1:${String(tickers).toUpperCase()}|${category}|${limit}`);
    const cachedNews = await cacheGet<{ articles: unknown[] }>(newsKey);
    if (cachedNews) {
      return new Response(JSON.stringify(cachedNews), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    let url: string;
    if (tickers && String(tickers).trim()) {
      // If multiple tickers, fetch for each and merge
      const tickerList = String(tickers).trim().toUpperCase().split(",").map(t => t.trim()).filter(Boolean);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().split("T")[0];
      const to = today.toISOString().split("T")[0];

      const allArticles: any[] = [];
      for (const ticker of tickerList.slice(0, 10)) {
        const tickerUrl = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
        const resp = await fetch(tickerUrl);
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) {
            allArticles.push(...data.map((item: any) => ({ ...item, _ticker: ticker })));
          }
        }
      }

      // Sort by date desc then limit
      allArticles.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
      const articles = allArticles.slice(0, limit).map((item: any) => ({
        title: item.headline || "",
        text: item.summary || "",
        url: item.url || "",
        image: item.image || "",
        site: item.source || "",
        publishedDate: item.datetime ? new Date(item.datetime * 1000).toISOString() : "",
        symbol: item._ticker || item.related || "",
      }));

      await cacheSet(newsKey, { articles }, NEWS_TTL_SECONDS);
      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    } else {
      // General market news
      url = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${FINNHUB_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        console.error("Finnhub API error:", response.status, text);
        throw new Error(`Finnhub API returned ${response.status}`);
      }
      const data = await response.json();
      const articles = (Array.isArray(data) ? data : []).slice(0, limit).map((item: any) => ({
        title: item.headline || "",
        text: item.summary || "",
        url: item.url || "",
        image: item.image || "",
        site: item.source || "",
        publishedDate: item.datetime ? new Date(item.datetime * 1000).toISOString() : "",
        symbol: item.related || "",
      }));

      await cacheSet(newsKey, { articles }, NEWS_TTL_SECONDS);
      return new Response(JSON.stringify({ articles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    }
  } catch (e) {
    console.error("stock-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
