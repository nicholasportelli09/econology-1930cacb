import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
    if (!FMP_API_KEY) {
      throw new Error("FMP_API_KEY is not configured");
    }

    const { type = "general", tickers, limit = 10 } = await req.json();

    let url: string;

    if (type === "ticker" && tickers) {
      // Ticker-specific news
      const tickerStr = Array.isArray(tickers) ? tickers.join(",") : tickers;
      url = `${FMP_BASE_URL}/stock_news?tickers=${encodeURIComponent(tickerStr)}&limit=${limit}&apikey=${FMP_API_KEY}`;
    } else {
      // General stock news
      url = `${FMP_BASE_URL}/stock_news?limit=${limit}&apikey=${FMP_API_KEY}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("FMP API error:", response.status, text);
      throw new Error(`FMP API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform to a cleaner shape for the frontend
    const articles = data.map((item: any) => ({
      title: item.title || "",
      text: item.text || "",
      url: item.url || "",
      image: item.image || "",
      site: item.site || "",
      publishedDate: item.publishedDate || "",
      symbol: item.symbol || "",
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
