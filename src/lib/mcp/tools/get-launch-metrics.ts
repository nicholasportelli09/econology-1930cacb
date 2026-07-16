import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, withAuthAndTrace } from "./_shared";

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default defineTool({
  name: "get_launch_metrics",
  title: "Get launch metrics (admin)",
  description:
    "Returns aggregated Econology launch metrics between two dates (new accounts, activation, D1/D7 retention, lessons per activated user, source-open rate, watchlist adoption, crash-free session rate). Admin only. No per-user rows.",
  inputSchema: {
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Inclusive start date, YYYY-MM-DD. Defaults to 30 days ago."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Inclusive end date, YYYY-MM-DD. Defaults to today (UTC)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace<{ start_date?: string; end_date?: string }>(
    "get_launch_metrics",
    async ({ start_date, end_date }, _ctx, { requestId, supabase }) => {
      const start = start_date ?? isoDaysAgo(30);
      const end = end_date ?? isoDaysAgo(0);
      // The launch_metrics RPC self-checks has_role(auth.uid(), 'admin'); non-admins
      // receive a Postgres error and we translate to a safe forbidden message.
      const { data, error } = await supabase.rpc("launch_metrics", { _start: start, _end: end });
      if (error) {
        const isForbidden = /not authorized/i.test(error.message) || error.code === "42501";
        return errorResult(
          "get_launch_metrics",
          requestId,
          isForbidden ? "forbidden" : "db_read_failed",
          `rpc launch_metrics failed pg_code=${error.code ?? "?"}`,
        );
      }
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: {
          metrics: data as Record<string, unknown>,
          range: { start, end },
          request_id: requestId,
        },
      };
    },
  ),
});