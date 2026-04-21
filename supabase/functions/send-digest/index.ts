import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  // SECURITY: internal-only — verify shared secret (INTERNAL_FUNCTION_SECRET)
  const _authHeader = req.headers.get('Authorization');
  const _internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
  if (!_internalSecret || _authHeader !== `Bearer ${_internalSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who want daily digest
    const { data: subscribers, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("daily_digest", true);

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate digest content using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a financial news writer for students. Write a brief, engaging daily digest email covering 3-4 key economic events from today. Use simple language. Format in HTML with inline styles. Use a clean, modern style with purple (#8B5CF6) accents. Keep it under 500 words.",
          },
          {
            role: "user",
            content: `Write today's financial digest email for ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Include current market trends, any notable economic news, and one actionable tip for students.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI error:", aiResponse.status, t);
      throw new Error("Failed to generate digest");
    }

    const aiData = await aiResponse.json();
    const digestHtml = aiData.choices?.[0]?.message?.content || "<p>No digest available today.</p>";

    // Send to each subscriber
    const results = await Promise.allSettled(
      subscribers.map(async (sub: any) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Econology <onboarding@resend.dev>",
            to: sub.email,
            subject: `📊 Your Daily Financial Digest — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #8B5CF6; font-size: 24px; margin: 0;">Econology Daily Digest</h1>
                  <p style="color: #6B7280; font-size: 14px;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div style="color: #1F2937; font-size: 15px; line-height: 1.6;">
                  ${digestHtml}
                </div>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
                <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                  You're receiving this because you subscribed to Econology daily digests.<br/>
                  Update your preferences in the Econology app settings.
                </p>
              </div>
            `,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          console.error(`Failed to send to ${sub.email}:`, t);
          throw new Error(`Send failed: ${sub.email}`);
        }
        return res.json();
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ sent, failed, total: subscribers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-digest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
