import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, sanitizeRows, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "list_pinned_articles",
  title: "List my pinned articles",
  description: "Returns economic-news articles the signed-in user has pinned in Econology.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("list_pinned_articles", async (_input, _ctx, { traceId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("pinned_articles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return dbError("list_pinned_articles", traceId, "select", error);
    const articles = sanitizeRows(data as Record<string, unknown>[] | null);
    return {
      content: [{ type: "text", text: JSON.stringify(articles, null, 2) }],
      structuredContent: { articles, traceId },
    };
  }),
});