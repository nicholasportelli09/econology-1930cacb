import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  profile: z.record(z.any()).optional(),
  portfolioTickers: z.array(z.string().max(10)).max(50).optional(),
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
    console.warn("auth_failure", { fn: "economic-news", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "missing_token" });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const _authResp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
    { headers: { 'Authorization': `Bearer ${_token}`, 'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '' } }
  );
  if (!_authResp.ok) {
    console.warn("auth_failure", { fn: "economic-news", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "invalid_token", status: _authResp.status });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }


  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { profile, portfolioTickers } = parsed.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Fetch real headlines from NewsAPI.org for grounding
    let realHeadlines = "";
    const NEWSAPI_API_KEY = Deno.env.get("NEWSAPI_API_KEY");
    if (NEWSAPI_API_KEY) {
      try {
        const newsResp = await fetch(
          `https://newsapi.org/v2/everything?q=economy OR inflation OR "interest rates" OR jobs OR markets&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_API_KEY}`
        );
        if (newsResp.ok) {
          const newsData = await newsResp.json();
          const articles = newsData.articles || [];
          if (articles.length > 0) {
            realHeadlines = articles
              .map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source?.name || "unknown"}, ${a.publishedAt || "recent"})${a.description ? ": " + a.description.slice(0, 150) : ""}`)
              .join("\n");
          }
        } else {
          const t = await newsResp.text();
          console.error("NewsAPI fetch failed:", newsResp.status, t);
        }
      } catch (err) {
        console.error("NewsAPI fetch error:", err);
      }
    }

    const userData = JSON.stringify({
      studentStatus: profile?.studentStatus || "Student",
      monthlyIncome: profile?.monthlyIncome || "Unknown",
      currentSavings: profile?.currentSavings || "Unknown",
      financialGoals: profile?.financialGoals || [],
      topicsOfInterest: profile?.topicsOfInterest || [],
      debtTypes: profile?.debtTypes || [],
      livingSituation: profile?.livingSituation || "Unknown",
    });

    const headlinesContext = realHeadlines
      ? `\n\nHere are REAL current headlines to base your analysis on:\n${realHeadlines}\n\nUse these real headlines to identify the 3 most impactful economic events. Do NOT fabricate events.`
      : "";

    const tickers = Array.isArray(portfolioTickers) ? portfolioTickers.filter(Boolean) : [];
    const portfolioContext = tickers.length > 0
      ? `\n\nThe user CURRENTLY HOLDS these tickers in their portfolio: ${tickers.join(", ")}.\nFor at least 2 of the 3 events, the "impact" and "action" MUST directly reference how the news affects one or more of these specific holdings (name the ticker), and suggest a SHORT-TERM tactical move: a hedge, a rebalance, a stop, a sector rotation, or a way to take advantage of the news. Do not give long-term passive advice — that is covered elsewhere.`
      : `\n\nThe user has NOT added any portfolio holdings yet. Focus the "action" on a tactical, short-term reaction to each news event (e.g., a defensive hedge, a sector to watch this week, an instrument to buy/sell into the news), NOT on long-term passive investing advice.`;

    const systemPrompt = `You are a tactical markets analyst for young investors. Identify the 3 most important CURRENT economic / market events from the headlines below. For each event, explain the SHORT-TERM, news-driven implication for this specific user — focused on hedging, taking advantage of the move, or repositioning their existing holdings.

User profile: ${userData}${portfolioContext}${headlinesContext}

Rules:
- Each "action" must be a tactical, news-reactive move (hedge, rotate, trim, add, options-style protection, cash buffer) — NOT generic "invest in an index fund" or "build an emergency fund" advice.
- If the user holds tickers, explicitly name the ticker(s) affected in the "impact" field.
- Keep it grounded in the real headlines — do not invent events.

Return ONLY valid JSON in this format:
{
  "news": [
    {
      "title": "Event title",
      "summary": "What happened (2-3 sentences)",
      "impact": "Short-term effect on the user — reference held tickers by name when relevant",
      "action": "Specific tactical / hedging move the user can make THIS WEEK based on the news",
      "category": "Interest Rates/Inflation/Jobs/Markets/Policy"
    }
  ],
  "lastUpdated": "Current date in format: Month Day, Year"
}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Provide 3 current major economic events personalized to my profile. Use the real headlines provided.",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to get economic news" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse news data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("economic-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
