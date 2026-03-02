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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { article, profile, mode = "single" } = await req.json();
    // mode: "single" = summarize one article, "digest" = summarize multiple articles

    let userPrompt: string;
    let systemPrompt: string;

    const profileContext = profile
      ? `\nUser profile: Name: ${profile.name || "Student"}, Age: ${profile.age || "Unknown"}, Status: ${profile.studentStatus || "Unknown"}, Goals: ${(profile.financialGoals || []).join(", ") || "General learning"}, Income: ${profile.monthlyIncome || "Unknown"}`
      : "";

    if (mode === "digest") {
      // article is actually an array of articles
      const articleList = (Array.isArray(article) ? article : [])
        .map((a: any, i: number) => `${i + 1}. "${a.title}" - ${a.text?.slice(0, 200)}`)
        .join("\n");

      systemPrompt = `You are a financial news analyst for students and young adults. Summarize multiple news articles into a cohesive digest. Be clear, avoid jargon, and explain relevance to the reader's financial life.${profileContext}`;
      userPrompt = `Create a comprehensive news digest from these articles. Include:\n1. **Key Themes** - What are the major trends?\n2. **What It Means For You** - Personalized impact\n3. **Action Items** - 2-3 things the reader could do\n\nArticles:\n${articleList}`;
    } else {
      systemPrompt = `You are a friendly financial tutor for students. Explain news articles simply, avoid jargon, and relate them to the reader's financial life. Keep it concise (3-4 paragraphs max).${profileContext}`;
      userPrompt = `Explain this article in simple terms and how it might affect someone in my situation:\n\nTitle: ${article.title}\nContent: ${article.text}\nSource: ${article.site}\nTicker: ${article.symbol || "N/A"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("summarize-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
