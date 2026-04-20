import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.econology.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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

    const { tickers, category = "general", limit = 15 } = await req.json();

    let url: string;
    if (tickers && tickers.trim()) {
      // Company news for a specific ticker
      const ticker = tickers.trim().toUpperCase().split(",")[0]; // Finnhub supports one ticker at a time
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().split("T")[0];
      const to = today.toISOString().split("T")[0];
      url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    } else {
      // General market news
      url = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${FINNHUB_API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error("Finnhub API error:", response.status, text);
      throw new Error(`Finnhub API returned ${response.status}`);
    }

    const data = await response.json();

    const articles = (Array.isArray(data) ? data : [])
      .slice(0, limit)
      .map((item: any) => ({
        title: item.headline || "",
        text: item.summary || "",
        url: item.url || "",
        image: item.image || "",
        site: item.source || "",
        publishedDate: item.datetime
          ? new Date(item.datetime * 1000).toISOString()
          : "",
        symbol: item.related || "",
      }));

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("finnhub-stock-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
