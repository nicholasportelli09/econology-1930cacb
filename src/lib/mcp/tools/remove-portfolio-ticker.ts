import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { dbError, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "remove_portfolio_ticker",
  title: "Remove a ticker from my portfolio",
  description: "Removes a stock ticker symbol from the signed-in user's Econology portfolio watchlist.",
  inputSchema: {
    ticker: z.string().trim().min(1).max(12).describe("Stock ticker symbol to remove, e.g. AAPL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace<{ ticker: string }>(
    "remove_portfolio_ticker",
    async ({ ticker }, _ctx, { requestId, supabase, userId }) => {
      const symbol = ticker.toUpperCase();
      const { data, error } = await supabase
        .from("user_portfolio")
        .delete()
        .eq("user_id", userId)
        .eq("ticker", symbol)
        .select("ticker");
      if (error) return dbError("remove_portfolio_ticker", requestId, "write", error);
      const removed = (data?.length ?? 0) > 0;
      return {
        content: [
          {
            type: "text",
            text: removed ? `Removed ${symbol} from your portfolio.` : `${symbol} was not in your portfolio.`,
          },
        ],
        structuredContent: { removed, ticker: symbol, request_id: requestId },
      };
    },
  ),
});