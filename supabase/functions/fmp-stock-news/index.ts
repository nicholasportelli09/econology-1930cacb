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
    const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
    if (!FMP_API_KEY) throw new Error("FMP_API_KEY is not configured");

    const { tickers, limit = 15 } = await req.json();

    let url: string;
    if (tickers && tickers.trim()) {
      url = `https://financialmodelingprep.com/stable/news/stock-latest?tickers=${encodeURIComponent(tickers.trim().toUpperCase())}&limit=${limit}&apikey=${FMP_API_KEY}`;
    } else {
      url = `https://financialmodelingprep.com/stable/news/stock-latest?limit=${limit}&apikey=${FMP_API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error("FMP API error:", response.status, text);
      throw new Error(`FMP API returned ${response.status}`);
    }

    const data = await response.json();

    const articles = (Array.isArray(data) ? data : []).map((item: any) => ({
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
    console.error("fmp-stock-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
