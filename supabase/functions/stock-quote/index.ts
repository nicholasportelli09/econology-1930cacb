import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";
import { cached, cacheKey } from "../_shared/cache.ts";

const BodySchema = z.object({
  tickers: z.string().min(1).max(500),
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

  // SECURITY: verify authenticated Econology user via Supabase JWT
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!_token) {
    console.warn("auth_failure", { fn: "stock-quote", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "missing_token" });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const _authResp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
    { headers: { 'Authorization': `Bearer ${_token}`, 'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '' } }
  );
  if (!_authResp.ok) {
    console.warn("auth_failure", { fn: "stock-quote", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "invalid_token", status: _authResp.status });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }


  try {
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    if (!FINNHUB_API_KEY) throw new Error("FINNHUB_API_KEY is not configured");

    const rawBody = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { tickers } = parsed.data;

    const tickerList = tickers.trim().toUpperCase().split(",").map(t => t.trim())
      .filter(t => /^[A-Z0-9.\-]{1,10}$/.test(t));
    const quotes: Record<string, any> = {};

    // Finnhub's free tier doesn't cover cash indices. Route SPX / GSPC
    // (the S&P 500 index, in points) to Yahoo Finance's public chart API,
    // which returns the real index level (e.g. 7533.77) without an API key.
    const INDEX_MAP: Record<string, string> = {
      SPX: "^GSPC",
      GSPC: "^GSPC",
      DJI: "^DJI",
      IXIC: "^IXIC",
    };
    async function fetchIndexQuote(alias: string, yahooSymbol: string) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
        const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!resp.ok) {
          console.error(`Yahoo chart ${alias} status ${resp.status}`);
          return;
        }
        const json = await resp.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (!meta) return;
        const price = Number(meta.regularMarketPrice ?? 0);
        const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? 0);
        const change = price - prev;
        const changePercent = prev ? (change / prev) * 100 : 0;
        quotes[alias] = {
          price,
          change,
          changePercent,
          high: Number(meta.regularMarketDayHigh ?? 0),
          low: Number(meta.regularMarketDayLow ?? 0),
          open: Number(meta.regularMarketOpen ?? 0),
          prevClose: prev,
          timestamp: Number(meta.regularMarketTime ?? 0),
          isIndex: true,
        };
      } catch (e) {
        console.error(`Failed to fetch index quote for ${alias}:`, e);
      }
    }

    // Quotes are identical for every user, so cache each symbol briefly.
    // A traffic spike then costs one upstream call per symbol per minute.
    const QUOTE_TTL_SECONDS = 60;

    await Promise.all(
      tickerList.slice(0, 20).map(async (ticker) => {
        const key = await cacheKey(`quote:v1:${ticker}`);
        const { value } = await cached<any>(key, QUOTE_TTL_SECONDS, async () => {
        if (INDEX_MAP[ticker]) {
          await fetchIndexQuote(ticker, INDEX_MAP[ticker]);
          return quotes[ticker] ?? null;
        }
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_API_KEY}`;
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            quotes[ticker] = {
              price: data.c,        // current price
              change: data.d,       // change
              changePercent: data.dp, // change percent
              high: data.h,         // high of day
              low: data.l,          // low of day
              open: data.o,         // open
              prevClose: data.pc,   // previous close
              timestamp: data.t,    // timestamp
            };
          }
        } catch (e) {
          console.error(`Failed to fetch quote for ${ticker}:`, e);
        }
        return quotes[ticker] ?? null;
        });
        if (value) quotes[ticker] = value;
      })
    );

    return new Response(JSON.stringify({ quotes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-quote error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
