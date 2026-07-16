import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, pickMany, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "list_portfolio",
  title: "List my portfolio tickers",
  description: "Returns the tickers the signed-in user tracks — ticker symbol and when it was added.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("list_portfolio", async (_input, _ctx, { requestId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("user_portfolio")
      .select("ticker, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return dbError("list_portfolio", requestId, "read", error);
    const rows = pickMany(data as Record<string, unknown>[] | null, ["ticker", "created_at"]);
    const portfolio = rows.map((r) => ({ ticker: r.ticker, added_at: r.created_at }));
    return {
      content: [{ type: "text", text: JSON.stringify(portfolio, null, 2) }],
      structuredContent: { portfolio, request_id: requestId },
    };
  }),
});