import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "add_portfolio_ticker",
  title: "Add a ticker to my portfolio",
  description: "Adds a stock ticker symbol to the signed-in user's Econology portfolio watchlist.",
  inputSchema: {
    ticker: z.string().trim().min(1).max(12).describe("Stock ticker symbol, e.g. AAPL."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ ticker }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const symbol = ticker.toUpperCase();
    const { data, error } = await supabaseForUser(ctx)
      .from("user_portfolio")
      .upsert({ user_id: ctx.getUserId(), ticker: symbol }, { onConflict: "user_id,ticker" })
      .select();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Added ${symbol} to your portfolio.` }],
      structuredContent: { added: data?.[0] ?? { ticker: symbol } },
    };
  },
});