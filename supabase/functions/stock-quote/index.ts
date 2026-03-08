import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
