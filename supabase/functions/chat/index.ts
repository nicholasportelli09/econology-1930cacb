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

const DAILY_LIMIT = 10;
const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

type MarketSession = {
  name: string;
  tz: string;
  openMin: number;
  closeMin: number;
  hours: string;
  region: string;
};

const MARKETS: MarketSession[] = [
  { name: "US (NYSE/Nasdaq)", tz: "America/New_York", openMin: 9*60+30, closeMin: 16*60, hours: "9:30am–4:00pm ET", region: "US" },
  { name: "London (LSE)", tz: "Europe/London", openMin: 8*60, closeMin: 16*60+30, hours: "8:00am–4:30pm London", region: "Europe" },
  { name: "Euronext / Frankfurt (Xetra)", tz: "Europe/Paris", openMin: 9*60, closeMin: 17*60+30, hours: "9:00am–5:30pm CET", region: "Europe" },
  { name: "Tokyo (TSE)", tz: "Asia/Tokyo", openMin: 9*60, closeMin: 15*60, hours: "9:00am–3:00pm JST (lunch 11:30–12:30)", region: "Asia" },
  { name: "Hong Kong (HKEX)", tz: "Asia/Hong_Kong", openMin: 9*60+30, closeMin: 16*60, hours: "9:30am–4:00pm HKT (lunch 12:00–13:00)", region: "Asia" },
  { name: "Shanghai (SSE)", tz: "Asia/Shanghai", openMin: 9*60+30, closeMin: 15*60, hours: "9:30am–3:00pm CST (lunch 11:30–13:00)", region: "Asia" },
];

function getLocalParts(now: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find(p => p.type === "minute")?.value ?? "0");
  return { weekday, minutes: hour*60 + minute };
}

function getMarketStatus(m: MarketSession, now: Date = new Date()) {
  const { weekday, minutes } = getLocalParts(now, m.tz);
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const inSession = minutes >= m.openMin && minutes < m.closeMin;
  const isOpen = !isWeekend && inSession;
  return { name: m.name, region: m.region, hours: m.hours, isOpen, isWeekend, weekday };
}

function getAllMarketStatuses(now: Date = new Date()) {
  return MARKETS.map(m => getMarketStatus(m, now));
}

function getUSMarketStatus(now: Date = new Date()) {
  const us = getMarketStatus(MARKETS[0], now);
  let label = "Markets open (US regular session)";
  if (us.isWeekend) label = `US markets closed — ${us.weekday === "Sat" ? "Saturday" : "Sunday"}. US equities don't trade on weekends; the latest print is Friday's close.`;
  else if (!us.isOpen) label = "US markets closed — outside 9:30am–4:00pm ET. The latest print is the most recent close.";
  return { isOpen: us.isOpen, isWeekend: us.isWeekend, weekday: us.weekday, label };
}

async function getStockPrice(symbol: string): Promise<string> {
  if (!FINNHUB_API_KEY) return JSON.stringify({ error: "Stock data unavailable" });
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}&token=${FINNHUB_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return JSON.stringify({ error: `Finnhub returned ${resp.status}` });
    const d = await resp.json();
    if (!d || d.c === 0 || d.c == null) return JSON.stringify({ error: `No data for ${symbol}` });
    const status = getUSMarketStatus();
    const allRegions = getAllMarketStatuses().map(s => ({
      name: s.name, region: s.region, isOpen: s.isOpen, isWeekend: s.isWeekend, hours: s.hours,
    }));
    return JSON.stringify({
      symbol: symbol.toUpperCase(),
      price: d.c,
      change: d.d,
      changePercent: d.dp,
      high: d.h,
      low: d.l,
      open: d.o,
      previousClose: d.pc,
      marketStatus: {
        isOpen: status.isOpen,
        isWeekend: status.isWeekend,
        note: status.label,
        allRegions,
      },
      priceAsOf: "Interpret against the listing exchange's session — see marketStatus.allRegions to know which exchange is open right now.",
      changeNote: "If the listing exchange is currently closed (weekend, holiday, or outside its local hours), change/changePercent reflect the LAST trading session's move vs. the prior close — NOT a move 'today'. Only describe it as a 'today' move when that specific exchange is open.",
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Failed" });
  }
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_stock_price",
      description: "Get the current real-time stock price and intraday quote for a single stock symbol (e.g. AAPL, TSLA, MSFT). Use whenever the user asks about a specific stock's price, change, or recent movement.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "Stock ticker symbol like AAPL, MSFT, TSLA" },
        },
        required: ["symbol"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // SECURITY: hard-fail for unauthenticated requests — prevents rate-limit bypass
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
    const { messages, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Rate limit per signed-in user
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PUBLISHABLE = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    let userId: string | null = null;
    if (jwt && jwt !== PUBLISHABLE && jwt !== SUPABASE_ANON_KEY) {
      try {
        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: `Bearer ${jwt}` } },
        });
        const { data: u } = await userClient.auth.getUser();
        userId = u?.user?.id ?? null;
      } catch (_) { /* ignore */ }
    }

    if (userId) {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await admin
        .from("ekon_usage")
        .select("id, message_count")
        .eq("user_id", userId)
        .eq("usage_date", today)
        .maybeSingle();

      const currentCount = existing?.message_count ?? 0;
      if (currentCount >= DAILY_LIMIT) {
        return new Response(
          JSON.stringify({
            error: `You've reached today's limit of ${DAILY_LIMIT} messages with Ekon. Come back tomorrow!`,
            limitReached: true,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existing) {
        await admin.from("ekon_usage")
          .update({ message_count: currentCount + 1, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await admin.from("ekon_usage").insert({
          user_id: userId,
          usage_date: today,
          message_count: 1,
        });
      }
    }

    const quizLevel =
      profile?.quizScore == null ? "Not yet assessed"
      : profile.quizScore <= 1 ? "Beginner"
      : profile.quizScore <= 3 ? "Intermediate"
      : "Advanced";

    const allStatuses = getAllMarketStatuses();
    const statusLines = allStatuses.map(s =>
      `- ${s.name} [${s.region}]: ${s.isOpen ? "OPEN" : (s.isWeekend ? `CLOSED (weekend — ${s.weekday})` : "CLOSED (outside regular session)")} — regular hours ${s.hours}`
    ).join("\n");
    const systemPrompt = `You are Ekon — a friendly, personalized AI financial tutor inside the Econology app. Help students and young adults learn money skills with simple explanations, real-world examples, and encouragement. You can fetch live stock prices when asked (call the get_stock_price tool). Never use jargon without explaining it. Never judge.

GLOBAL MARKET STATUS (right now):
${statusLines}

IMPORTANT — closed-market reasoning (applies to ALL exchanges, US/Europe/Asia):
- When a market is closed (weekend, holiday, or outside its local regular session), do NOT describe price changes as happening "today" or "yesterday". The change/changePercent from get_stock_price reflect the LAST trading session's move vs. the prior close.
- Match the ticker to its listing exchange: AAPL/MSFT/TSLA → US; VOD.L/HSBA.L → London; MC.PA/AIR.PA → Euronext Paris; SAP.DE/BMW.DE → Xetra Frankfurt; 7203.T (Toyota) → Tokyo; 0700.HK (Tencent) → Hong Kong; 600519.SS → Shanghai. Judge open/closed against THAT exchange.
- If that exchange is closed, phrase moves as "as of the last close" / "Friday's close" / "the most recent session ended +X%". Mention the closed-market caveat once, briefly.
- If the user asks "is the market open?", answer for the specific exchange they mean (default to the one matching the ticker, or US if ambiguous), and feel free to note other regions if helpful.
- Be aware of overlap: when US is open, European markets are usually in their last hour or already closed; Asian markets are closed. When Asian markets are open, Europe and the US are typically closed.

USER PROFILE:
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

    const conversationMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // First call: detect tool use (non-streaming)
    const firstResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: conversationMessages,
        tools: TOOLS,
      }),
    });

    if (!firstResp.ok) {
      if (firstResp.status === 429) {
        return new Response(JSON.stringify({ error: "AI is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (firstResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await firstResp.text();
      console.error("AI gateway error:", firstResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const firstData = await firstResp.json();
    const firstChoice = firstData.choices?.[0];
    const toolCalls = firstChoice?.message?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      conversationMessages.push(firstChoice.message);
      for (const tc of toolCalls) {
        let result = "{}";
        if (tc.function?.name === "get_stock_price") {
          try {
            const args = JSON.parse(tc.function.arguments || "{}");
            result = await getStockPrice(args.symbol || "");
          } catch (_) {
            result = JSON.stringify({ error: "Bad arguments" });
          }
        }
        conversationMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
    } else if (firstChoice?.message?.content) {
      const content = firstChoice.message.content as string;
      const sse = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(sse, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // Final streaming call with tool results
    const finalResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: conversationMessages,
        stream: true,
      }),
    });

    if (!finalResp.ok) {
      const t = await finalResp.text();
      console.error("AI final-call error:", finalResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(finalResp.body, {
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
