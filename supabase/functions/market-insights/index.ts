import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  profile: z.record(z.any()).optional(),
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
    console.warn("auth_failure", { fn: "market-insights", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "missing_token" });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const _authResp = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
    { headers: { 'Authorization': `Bearer ${_token}`, 'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '' } }
  );
  if (!_authResp.ok) {
    console.warn("auth_failure", { fn: "market-insights", ip: req.headers.get("x-forwarded-for") || "unknown", reason: "invalid_token", status: _authResp.status });
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }


  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { profile } = parsed.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch real market data from NewsAPI.org for grounding
    let marketHeadlines = "";
    const NEWSAPI_API_KEY = Deno.env.get("NEWSAPI_API_KEY");
    if (NEWSAPI_API_KEY) {
      try {
        const newsResp = await fetch(
          `https://newsapi.org/v2/everything?q=stocks OR investing OR "stock market" OR S%26P500&language=en&sortBy=publishedAt&pageSize=8&apiKey=${NEWSAPI_API_KEY}`
        );
        if (newsResp.ok) {
          const newsData = await newsResp.json();
          const articles = newsData.articles || [];
          if (articles.length > 0) {
            marketHeadlines = articles
              .map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source?.name || "unknown"}, ${a.publishedAt || "recent"})`)
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

    const headlinesContext = marketHeadlines
      ? `\n\nHere are REAL current market headlines for context:\n${marketHeadlines}\n\nUse these to anchor your case studies in what's actually happening — but treat them as teaching context, not as triggers to recommend action.`
      : "";

    // Add randomization seed to prevent identical responses
    const categories = ["ETFs", "individual stocks", "bonds", "REITs", "crypto", "mutual funds", "commodities", "savings products", "fractional shares", "dividend stocks", "growth stocks", "international markets", "sector ETFs", "treasury bills", "robo-advisors"];
    const shuffled = categories.sort(() => Math.random() - 0.5);
    const focusCategories = shuffled.slice(0, 5).join(", ");
    const randomSeed = Math.random().toString(36).slice(2, 8);

    const systemPrompt = `You are an EDUCATIONAL finance writer producing TEACHING CASE STUDIES for young learners. Based on this user profile: ${userData}, write 3 case studies showing HOW AN ANALYST WOULD THINK about a specific company, fund, or theme.${headlinesContext}

CRITICAL — LEGAL / TONE CONSTRAINTS (non-negotiable):
- Econology is NOT a registered investment adviser. You are NOT recommending anything.
- Do NOT use the words "recommend", "buy", "sell", "should invest", "you should", "great pick", "best stock", "I suggest", or anything that sounds like a directional call.
- Frame every case study as: "Here is a name an analyst might *study* — this is how they'd frame the question."
- It is OK to lay out the bull thesis, the bear thesis, what to track, and what would invalidate the thesis. It is NOT OK to conclude with a verdict.
- The optional position-sizing number is purely an ILLUSTRATIVE example to make the framework concrete. Always describe it as "illustrative" or "for the example".

VARIETY: Focus on these categories this time: ${focusCategories}. Seed: ${randomSeed}. Vary the names — don't always default to "S&P 500 index fund". Mix asset classes and structural themes (AI, energy, demographics, EM, etc.).

For EACH case study, the "steps" field should be a 5-7 step ANALYST FRAMEWORK WALKTHROUGH (define the thesis, identify drivers, list risks, find data, stress-test bull/bear, decide what would invalidate). Steps must NOT be brokerage instructions ("open a Fidelity account", "place a buy order") — that is what we are explicitly avoiding.

Return ONLY valid JSON in this format. The legacy field names are kept for back-compat — interpret their meaning per the comments:
{
  "investments": [
    {
      "name": "Specific company / fund / theme",
      "ticker": "TICKER or N/A",
      "description": "2-3 sentence neutral description of the business or theme",
      "startingAmount": "$X — illustrative only, used only to make the framework concrete",
      "riskLevel": "Low/Medium/High",  // interpret as analytical complexity, NOT investment risk grade
      "whyGood": "The thesis as an analyst would frame it — bull case in 2 sentences, then the main risks",
      "personalizedNote": "Why studying this case is useful for THIS user's learning path (link to a curriculum concept they're working on)",
      "steps": [
        "Step 1: Define the thesis in one sentence — what would have to be true?",
        "Step 2: Identify the 2-3 drivers an analyst would track",
        "Step 3: List the top 3 risks that would invalidate the thesis",
        "Step 4: Where to find the data (10-K, earnings call, sector reports)",
        "Step 5: Stress-test — bull case, base case, bear case"
      ]
    }
  ],
  "marketContext": "1-2 sentence neutral summary of the macro backdrop based on real headlines if available — describe, don't prescribe",
  "disclaimer": "Educational case studies only. Not investment advice. Econology is not a registered investment adviser."
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
          temperature: 1.0,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                `Generate 3 fresh and varied teaching case studies — different names, sectors, and complexities than typical examples. Frame each as "how an analyst would think about this", with no buy/sell verdict. (variation key: ${randomSeed})`,
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
        JSON.stringify({ error: "Failed to get market insights" }),
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

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse investment data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
