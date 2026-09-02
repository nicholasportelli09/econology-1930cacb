import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { cached, cacheKey } from "../_shared/cache.ts";

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

interface VideoEntry {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  published: string;
  thumbnail: string;
  description: string;
}

function parseRSSFeed(xml: string, channelId: string): VideoEntry[] {
  const entries: VideoEntry[] = [];
  const channelNameMatch = xml.match(/<name>([^<]+)<\/name>/);
  const channelName = channelNameMatch ? channelNameMatch[1] : "Unknown";

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
    const description =
      entry.match(/<media:description>([^<]*)<\/media:description>/)?.[1] ?? "";

    if (videoId) {
      entries.push({
        id: videoId,
        title,
        channelName,
        channelId,
        published,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        description: description.slice(0, 300),
      });
    }
  }
  return entries;
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
    const { channelIds, userProfile } = await req.json();

    if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "channelIds array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch RSS feeds in parallel
    const feedPromises = channelIds.map(async (channelId: string) => {
      try {
        // Channel feeds are identical for all users: cache parsed entries 30 min.
        const key = await cacheKey(`yt-rss:v1:${channelId}`);
        const { value } = await cached<VideoEntry[]>(key, 1800, async () => {
          const res = await fetch(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (!res.ok) return [];
          const xml = await res.text();
          return parseRSSFeed(xml, channelId);
        });
        return value ?? [];
      } catch (e) {
        console.error(`Failed to fetch RSS for ${channelId}:`, e);
        return [];
      }
    });

    const allFeeds = await Promise.all(feedPromises);
    let allVideos = allFeeds.flat();

    // Sort by date, take recent
    allVideos.sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
    );

    // Interleave videos from different channels with shuffle for variety on refresh
    function interleaveAndShuffle(videos: VideoEntry[]): VideoEntry[] {
      const byChannel = new Map<string, VideoEntry[]>();
      for (const v of videos) {
        const list = byChannel.get(v.channelId) || [];
        list.push(v);
        byChannel.set(v.channelId, list);
      }
      // Shuffle channel order so different creators lead each time
      const channels = Array.from(byChannel.values());
      for (let i = channels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [channels[i], channels[j]] = [channels[j], channels[i]];
      }
      // Also shuffle within each channel's videos (keeping some recency bias)
      for (const ch of channels) {
        // Light shuffle: swap adjacent pairs randomly
        for (let i = 0; i < ch.length - 1; i++) {
          if (Math.random() > 0.5) {
            [ch[i], ch[i + 1]] = [ch[i + 1], ch[i]];
          }
        }
      }
      const result: VideoEntry[] = [];
      let idx = 0;
      let added = true;
      while (added) {
        added = false;
        for (const ch of channels) {
          if (idx < ch.length) {
            result.push(ch[idx]);
            added = true;
          }
        }
        idx++;
      }
      return result;
    }

    const recentVideos = interleaveAndShuffle(allVideos).slice(0, 30);

    // Use AI to rank if profile available and API key exists
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && userProfile && recentVideos.length > 0) {
      try {
        const videoSummaries = recentVideos.map((v, i) => ({
          index: i,
          title: v.title,
          channel: v.channelName,
          description: v.description.slice(0, 100),
        }));

        const prompt = `You are a financial education curator for young adults (16-25). Given a user's profile and a list of recent YouTube videos from credible financial educators, rank the top 12 most relevant videos for this user.

User Profile:
- Goals: ${userProfile.financialGoals?.join(", ") || "general learning"}
- Topics of interest: ${userProfile.topicsOfInterest?.join(", ") || "general finance"}
- Status: ${userProfile.studentStatus || "student"}
- Learning style: ${userProfile.learningStyle || "mix of everything"}

Videos:
${JSON.stringify(videoSummaries)}

Return ONLY a JSON array of the video indices in order of relevance, like [2,5,0,8,...]. No other text.`;

        const aiRes = await fetch(
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
                { role: "system", content: "You are a JSON-only response bot. Return only valid JSON arrays." },
                { role: "user", content: prompt },
              ],
            }),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content?.trim() ?? "";
          // Extract JSON array from response
          const jsonMatch = content.match(/\[[\d,\s]+\]/);
          if (jsonMatch) {
            const indices: number[] = JSON.parse(jsonMatch[0]);
            const ranked = indices
              .filter((i) => i >= 0 && i < recentVideos.length)
              .map((i) => recentVideos[i]);
            // Add any remaining videos not in the ranking
            const rankedIds = new Set(ranked.map((v) => v.id));
            const remaining = recentVideos.filter((v) => !rankedIds.has(v.id));
            return new Response(
              JSON.stringify({ videos: [...ranked, ...remaining].slice(0, 15) }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          const errStatus = aiRes.status;
          console.error("AI ranking failed with status:", errStatus);
          if (errStatus === 429 || errStatus === 402) {
            // Fall through to unranked
          }
        }
      } catch (aiErr) {
        console.error("AI ranking error:", aiErr);
      }
    }

    // Fallback: return chronologically
    return new Response(
      JSON.stringify({ videos: recentVideos.slice(0, 15) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("youtube-videos error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
