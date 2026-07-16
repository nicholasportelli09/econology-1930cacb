import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";

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
    // (the S&P 500 index, in points) to Financial Modeling Prep instead.
    const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
    const INDEX_MAP: Record<string, string> = {
      SPX: "^GSPC",
      GSPC: "^GSPC",
    };
    async function fetchIndexQuote(alias: string, fmpSymbol: string) {
      if (!FMP_API_KEY) return;
      try {
        const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(fmpSymbol)}?apikey=${FMP_API_KEY}`;
        const resp = await fetch(url);
        if (!resp.ok) return;
        const arr = await resp.json();
        const row = Array.isArray(arr) ? arr[0] : null;
        if (!row) return;
        quotes[alias] = {
          price: row.price ?? 0,
          change: row.change ?? 0,
          changePercent: row.changesPercentage ?? 0,
          high: row.dayHigh ?? 0,
          low: row.dayLow ?? 0,
          open: row.open ?? 0,
          prevClose: row.previousClose ?? 0,
          timestamp: row.timestamp ?? 0,
          isIndex: true,
        };
      } catch (e) {
        console.error(`Failed to fetch index quote for ${alias}:`, e);
      }
    }

    await Promise.all(
      tickerList.slice(0, 20).map(async (ticker) => {
        if (INDEX_MAP[ticker]) {
          await fetchIndexQuote(ticker, INDEX_MAP[ticker]);
          return;
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
