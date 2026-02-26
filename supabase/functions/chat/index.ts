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
    const { messages, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const quizLevel =
      profile?.quizScore == null
        ? "Not yet assessed"
        : profile.quizScore <= 1
        ? "Beginner"
        : profile.quizScore <= 3
        ? "Intermediate"
        : "Advanced";

    const systemPrompt = `You are a friendly financial tutor for students and young adults. Keep explanations simple, relatable, and encouraging. Use examples relevant to students (coffee, subscriptions, part-time jobs, etc.). Never use jargon without explaining it. Be supportive and never judge their financial situation.

USER PROFILE (use this to personalize ALL advice):
- Name: ${profile?.name || "Friend"}
- Age: ${profile?.age || "Unknown"}
- Status: ${profile?.studentStatus || "Unknown"}
- Living: ${profile?.livingSituation || "Unknown"}
- Income: ${profile?.monthlyIncome || "Unknown"}
- Savings: ${profile?.currentSavings || "Unknown"}
- Debt: ${(profile?.debtTypes || []).join(", ") || "None listed"}
- Goals: ${(profile?.financialGoals || []).join(", ") || "None listed"}
- Interests: ${(profile?.topicsOfInterest || []).join(", ") || "None listed"}
- Quiz Score: ${profile?.quizScore ?? "N/A"}/5 (${quizLevel})

Always reference their specific situation when giving advice!`;

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
            ...messages,
          ],
          stream: true,
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
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
