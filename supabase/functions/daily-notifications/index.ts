import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const fullDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are a financial notification writer for a student finance app called Econology. Today is ${fullDate}.
${isWeekend ? "US stock markets are CLOSED today (weekend). Do NOT reference live trading, market opens, or intraday moves." : "US stock markets are OPEN today."}

Return ONLY valid JSON with this exact structure, no markdown:
{
  "digest": { "title": "...", "body": "..." },
  "market": { "title": "...", "body": "..." }
}

Rules:
- "digest": A useful, accurate financial tip or insight relevant to today. Under 25 words for body.
- "market": A timely market observation relevant to today. Under 25 words for body.
- Titles should be 2-4 words.
- Be specific and accurate for today's date and day of week.
- If weekend, focus on weekly recaps, upcoming week previews, or evergreen financial wisdom.
- Never fabricate specific numbers or prices.`,
            },
            {
              role: "user",
              content: `Generate today's two notification items for ${fullDate}.`,
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI error:", aiResponse.status, t);
      throw new Error("Failed to generate notifications");
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-notifications error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
