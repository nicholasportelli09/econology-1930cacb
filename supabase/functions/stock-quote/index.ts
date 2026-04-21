import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const _authResp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
    { headers: { 'Authorization': `Bearer ${_token}`, 'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '' } }
  );
  if (!_authResp.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }


  try {
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    if (!FINNHUB_API_KEY) throw new Error("FINNHUB_API_KEY is not configured");

    const { tickers } = await req.json();
    if (!tickers || !String(tickers).trim()) {
      throw new Error("tickers parameter is required");
    }

    const tickerList = String(tickers).trim().toUpperCase().split(",").map(t => t.trim()).filter(Boolean);
    const quotes: Record<string, any> = {};

    await Promise.all(
      tickerList.slice(0, 20).map(async (ticker) => {
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
