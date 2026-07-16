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
  name: "list_pinned_articles",
  title: "List my pinned articles",
  description: "Returns economic-news articles the signed-in user has pinned in Econology.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("pinned_articles")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { articles: data ?? [] },
    };
  },
});