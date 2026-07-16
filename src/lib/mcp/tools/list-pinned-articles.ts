import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, pickMany, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "list_pinned_articles",
  title: "List my pinned articles",
  description:
    "Returns the signed-in user's pinned economic-news articles with safe display fields only (title, url, site, symbol, published_date, snippet, image, pinned_at).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("list_pinned_articles", async (_input, _ctx, { requestId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("pinned_articles")
      .select("title, url, image, site, symbol, published_date, snippet, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return dbError("list_pinned_articles", requestId, "read", error);
    const rows = pickMany(data as Record<string, unknown>[] | null, [
      "title", "url", "image", "site", "symbol", "published_date", "snippet", "created_at",
    ]);
    const articles = rows.map((r) => ({
      title: r.title,
      url: r.url,
      image: r.image,
      site: r.site,
      symbol: r.symbol,
      published_date: r.published_date,
      snippet: r.snippet,
      pinned_at: r.created_at,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(articles, null, 2) }],
      structuredContent: { articles, request_id: requestId },
    };
  }),
});