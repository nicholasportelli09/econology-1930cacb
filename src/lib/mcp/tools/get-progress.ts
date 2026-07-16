import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, sanitizeRow, sanitizeRows, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "get_progress",
  title: "Get my learning progress",
  description: "Returns the signed-in user's current streak, XP, and recent lesson progress in Econology.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("get_progress", async (_input, _ctx, { traceId, supabase, userId }) => {
    const [streakRes, lessonsRes] = await Promise.all([
      supabase.from("daily_streak").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);
    if (streakRes.error) return dbError("get_progress", traceId, "select_streak", streakRes.error);
    if (lessonsRes.error) return dbError("get_progress", traceId, "select_lessons", lessonsRes.error);
    const payload = {
      streak: sanitizeRow(streakRes.data as Record<string, unknown> | null),
      recent_lessons: sanitizeRows(lessonsRes.data as Record<string, unknown>[] | null),
      traceId,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  }),
});