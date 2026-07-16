import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, pick, pickMany, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "get_progress",
  title: "Get my learning progress",
  description:
    "Returns the signed-in user's current and longest streak, total core lessons, total XP, and recent lesson concept IDs with scores and completion dates.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("get_progress", async (_input, _ctx, { requestId, supabase, userId }) => {
    const [streakRes, lessonsRes] = await Promise.all([
      supabase
        .from("daily_streak")
        .select("current_streak, longest_streak, total_lessons, total_xp, last_lesson_date")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("lesson_progress")
        .select("concept_id, quiz_score, quiz_total, attempts, completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(20),
    ]);
    if (streakRes.error) return dbError("get_progress", requestId, "read", streakRes.error);
    if (lessonsRes.error) return dbError("get_progress", requestId, "read", lessonsRes.error);
    const streak = pick(streakRes.data as Record<string, unknown> | null, [
      "current_streak",
      "longest_streak",
      "total_lessons",
      "total_xp",
      "last_lesson_date",
    ]);
    const recent_lessons = pickMany(
      lessonsRes.data as Record<string, unknown>[] | null,
      ["concept_id", "quiz_score", "quiz_total", "attempts", "completed_at"],
    );
    const payload = {
      streak,
      recent_lessons,
      request_id: requestId,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  }),
});