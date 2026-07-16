import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  const url = (globalThis as any).Deno?.env.get("SUPABASE_URL") ?? process.env.SUPABASE_URL!;
  const key =
    (globalThis as any).Deno?.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    (globalThis as any).Deno?.env.get("SUPABASE_ANON_KEY") ??
    process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_progress",
  title: "Get my learning progress",
  description: "Returns the signed-in user's current streak, XP, and recent lesson progress in Econology.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const [streakRes, lessonsRes] = await Promise.all([
      supabase.from("daily_streak").select("*").eq("user_id", ctx.getUserId()).maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", ctx.getUserId())
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);
    if (streakRes.error) return { content: [{ type: "text", text: streakRes.error.message }], isError: true };
    if (lessonsRes.error) return { content: [{ type: "text", text: lessonsRes.error.message }], isError: true };
    const payload = { streak: streakRes.data ?? null, recent_lessons: lessonsRes.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});