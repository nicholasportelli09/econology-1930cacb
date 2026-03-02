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
    const MARKETAUX_API_KEY = Deno.env.get("MARKETAUX_API_KEY");
    if (!MARKETAUX_API_KEY) throw new Error("MARKETAUX_API_KEY is not configured");

    const { type = "general", tickers, limit = 10 } = await req.json();

    const params = new URLSearchParams({
      api_token: MARKETAUX_API_KEY,
      language: "en",
      limit: String(limit),
      filter_entities: "true",
    });

    if (type === "ticker" && tickers) {
      const tickerStr = Array.isArray(tickers) ? tickers.join(",") : tickers;
      params.set("symbols", tickerStr);
    }

    const url = `https://api.marketaux.com/v1/news/all?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("Marketaux API error:", response.status, text);
      throw new Error(`Marketaux API returned ${response.status}`);
    }

    const data = await response.json();

    const articles = (Array.isArray(data.data) ? data.data : []).map((item: any) => ({
      title: item.title || "",
      text: item.description || item.snippet || "",
      url: item.url || "",
      image: item.image_url || "",
      site: item.source || "",
      publishedDate: item.published_at || "",
      symbol: item.entities?.[0]?.symbol || "",
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
