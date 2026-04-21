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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { headline, summary, category, source } = await req.json();

    if (!headline) {
      return new Response(JSON.stringify({ error: "headline is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscribers who want market news alerts
    const { data: subscribers, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("market_news_alerts", true);

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers for alerts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
            subject: `🚨 Market Alert: ${headline}`,
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
                <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                  <h1 style="color: #ffffff; font-size: 20px; margin: 0;">⚡ Market News Alert</h1>
                  <span style="color: rgba(255,255,255,0.8); font-size: 12px;">${category || "Markets"} • ${new Date().toLocaleDateString()}</span>
                </div>
                <h2 style="color: #1F2937; font-size: 18px;">${headline}</h2>
                <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">${summary || "A significant market event has occurred. Open Econology for full analysis."}</p>
                ${source ? `<p style="color: #9CA3AF; font-size: 13px;">Source: ${source}</p>` : ""}
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
                <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                  You're receiving this because you enabled market news alerts.<br/>
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
    console.error("news-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
