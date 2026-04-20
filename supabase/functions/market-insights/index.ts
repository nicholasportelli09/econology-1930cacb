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
    const { profile } = await req.json();
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
      ? `\n\nHere are REAL current market headlines for context:\n${marketHeadlines}\n\nUse these to inform your recommendations with up-to-date market awareness.`
      : "";

    // Add randomization seed to prevent identical responses
    const categories = ["ETFs", "individual stocks", "bonds", "REITs", "crypto", "mutual funds", "commodities", "savings products", "fractional shares", "dividend stocks", "growth stocks", "international markets", "sector ETFs", "treasury bills", "robo-advisors"];
    const shuffled = categories.sort(() => Math.random() - 0.5);
    const focusCategories = shuffled.slice(0, 5).join(", ");
    const randomSeed = Math.random().toString(36).slice(2, 8);

    const systemPrompt = `You are a creative financial advisor for students. Based on this user profile: ${userData}, provide 3 UNIQUE and SPECIFIC investment options suitable for their situation.${headlinesContext}

IMPORTANT: Be CREATIVE and VARIED. Focus on these categories this time: ${focusCategories}. Seed: ${randomSeed}.
- Do NOT always suggest the same generic options like "S&P 500 index fund" or "high-yield savings"
- Include SPECIFIC fund names, ETF tickers, or platform names
- Mix different asset classes and risk levels
- Consider trending sectors, thematic ETFs, or niche opportunities appropriate for beginners
- Each recommendation should feel fresh and different from typical generic advice

For EACH investment, include a detailed step-by-step execution guide with 5-7 specific, actionable steps that a complete beginner can follow. Steps should include exact platform names, what to click, what documents are needed, and how to place the first order.

Return ONLY valid JSON in this format:
{
  "investments": [
    {
      "name": "Specific Investment Name",
      "ticker": "TICKER or N/A",
      "description": "2-3 sentence description",
      "startingAmount": "$X",
      "riskLevel": "Low/Medium/High",
      "whyGood": "Why this is good for beginners",
      "personalizedNote": "How this specifically fits THIS user's situation",
      "steps": [
        "Step 1: Specific action with platform name",
        "Step 2: Next specific action",
        "Step 3: ...",
        "Step 4: ...",
        "Step 5: ..."
      ]
    }
  ],
  "marketContext": "1-2 sentence current market summary based on real headlines if available",
  "disclaimer": "Standard disclaimer"
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
                `Generate 3 FRESH and UNIQUE investment recommendations I haven't seen before. Be creative and specific — avoid the most obvious generic suggestions. Surprise me with interesting options that still suit a beginner. (variation key: ${randomSeed})`,
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

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse investment data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
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
