import { defineTool } from "@lovable.dev/mcp-js";
import { newRequestId } from "./_shared";

export default defineTool({
  name: "health_check",
  title: "Server health check",
  description:
    "Returns basic server health: ok status, server time, and a request id. Does not require authentication.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const requestId = newRequestId();
    const startedAt = Date.now();
    const payload = {
      status: "ok" as const,
      server_time: new Date().toISOString(),
      uptime_hint_ms: startedAt,
      request_id: requestId,
    };
    console.log(`[mcp:health_check] ok request_id=${requestId}`);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});