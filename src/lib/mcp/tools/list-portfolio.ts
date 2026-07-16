import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "list_portfolio",
  title: "List my portfolio tickers",
  description: "Returns the tickers the signed-in user is tracking in their Econology portfolio.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("list_portfolio", async (_input, _ctx, { traceId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("user_portfolio")
      .select("*")
      .eq("user_id", userId);
    if (error) return dbError("list_portfolio", traceId, "select", error);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { portfolio: data ?? [], traceId },
    };
  }),
});