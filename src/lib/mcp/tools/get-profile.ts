import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, pick, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "get_profile",
  title: "Get my Econology profile",
  description:
    "Returns the signed-in user's semantic Econology profile: literacy scores, mastered/weak/unknown concepts, diagnostic date and count, and (if stored) goals and learning preferences.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("get_profile", async (_input, _ctx, { requestId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("literacy_profiles")
      .select(
        "score_budgeting, score_credit, score_investing, score_macro, score_risk, mastered_concepts, weak_concepts, unknown_concepts, diagnostic_taken_at, diagnostic_count, onboarding",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return dbError("get_profile", requestId, "read", error);
    if (!data) {
      const empty = { profile: null, request_id: requestId };
      return {
        content: [{ type: "text", text: "No profile yet. Complete onboarding in the app." }],
        structuredContent: empty,
      };
    }
    const row = data as Record<string, unknown> & { onboarding?: Record<string, unknown> | null };
    const scores = pick(row, [
      "score_budgeting",
      "score_credit",
      "score_investing",
      "score_macro",
      "score_risk",
    ]);
    const onboarding = (row.onboarding ?? null) as Record<string, unknown> | null;
    // Only surface goals/preferences if actually stored — no demographics, no IDs.
    const goals = (onboarding?.financialGoals ?? onboarding?.goals) as unknown[] | undefined;
    const topics = (onboarding?.topicsOfInterest ?? onboarding?.topics) as unknown[] | undefined;
    const learning_style = onboarding?.learningStyle as string | undefined;
    const profile = {
      literacy_scores: scores,
      mastered_concepts: row.mastered_concepts ?? [],
      weak_concepts: row.weak_concepts ?? [],
      unknown_concepts: row.unknown_concepts ?? [],
      diagnostic_taken_at: row.diagnostic_taken_at ?? null,
      diagnostic_count: row.diagnostic_count ?? 0,
      goals: goals && goals.length > 0 ? goals : null,
      topics_of_interest: topics && topics.length > 0 ? topics : null,
      learning_style: learning_style ?? null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
      structuredContent: { profile, request_id: requestId },
    };
  }),
});
