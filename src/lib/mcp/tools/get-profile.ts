import { defineTool } from "@lovable.dev/mcp-js";
import { dbError, withAuthAndTrace } from "./_shared";

export default defineTool({
  name: "get_profile",
  title: "Get my Econology profile",
  description: "Returns the signed-in user's Econology literacy profile: level, goals, learning preferences, and streak metadata.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: withAuthAndTrace("get_profile", async (_input, _ctx, { traceId, supabase, userId }) => {
    const { data, error } = await supabase
      .from("literacy_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return dbError("get_profile", traceId, "select", error);
    if (!data) {
      return {
        content: [{ type: "text", text: "No profile yet. Complete onboarding in the app." }],
        structuredContent: { profile: null, traceId },
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { profile: data, traceId },
    };
  }),
});