import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { dbError, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "add_portfolio_ticker",
  title: "Add a ticker to my portfolio",
  description: "Adds a stock ticker symbol to the signed-in user's Econology portfolio watchlist.",
  inputSchema: {
    ticker: z.string().trim().min(1).max(12).describe("Stock ticker symbol, e.g. AAPL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace<{ ticker: string }>("add_portfolio_ticker", async ({ ticker }, _ctx, { traceId, supabase, userId }) => {
    const symbol = ticker.toUpperCase();
    const { data, error } = await supabase
      .from("user_portfolio")
      .upsert({ user_id: userId, ticker: symbol }, { onConflict: "user_id,ticker" })
      .select();
    if (error) return dbError("add_portfolio_ticker", traceId, "upsert", error);
    return {
      content: [{ type: "text", text: `Added ${symbol} to your portfolio.` }],
      structuredContent: { added: data?.[0] ?? { ticker: symbol }, traceId },
    };
  }),
});