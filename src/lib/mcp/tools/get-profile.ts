import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, sanitizeRow, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "get_profile",
  title: "Get my Econology profile",
  description:
    "Returns the signed-in user's Econology profile: onboarding goals, learning preferences, diagnostic scores, and streak metadata.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("get_profile", async (_input, _ctx, { traceId, supabase, userId }) => {
    const [profileRes, streakRes] = await Promise.all([
      supabase.from("literacy_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("daily_streak").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (profileRes.error) return dbError("get_profile", traceId, "select_profile", profileRes.error);
    if (streakRes.error) return dbError("get_profile", traceId, "select_streak", streakRes.error);
    const raw = profileRes.data as
      | (Record<string, unknown> & { onboarding?: Record<string, unknown> | null })
      | null;
    if (!raw && !streakRes.data) {
      return {
        content: [{ type: "text", text: "No profile yet. Complete onboarding in the app." }],
        structuredContent: { profile: null, traceId },
      };
    }
    const sanitized = (sanitizeRow(raw ?? {}) ?? {}) as Record<string, unknown>;
    const onboarding = (raw?.onboarding ?? null) as Record<string, unknown> | null;
    delete sanitized.onboarding;
    const profile = {
      goals: onboarding?.financialGoals ?? onboarding?.goals ?? null,
      topics_of_interest: onboarding?.topicsOfInterest ?? onboarding?.topics ?? null,
      learning_style: onboarding?.learningStyle ?? null,
      demographics: onboarding
        ? {
            name: onboarding.name ?? null,
            age: onboarding.age ?? null,
            student_status: onboarding.studentStatus ?? null,
            living_situation: onboarding.livingSituation ?? null,
          }
        : null,
      diagnostic: raw ? sanitized : null,
      streak: sanitizeRow(streakRes.data as Record<string, unknown> | null),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
      structuredContent: { profile, traceId },
    };
  }),
});
