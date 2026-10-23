import { withApi } from "@/lib/api/handler";
import { explainMonthUsage } from "@/lib/explain-meter";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// r348 — the monthly AI-explain budget, readable. The settings
// popover's «بودجهٔ توضیح هوشمند» row fetches this on open; ops can
// curl it. Sibling of /api/tts/usage (r347). Failure shape: the withApi
// error envelope (the settings row simply stays hidden when this fails
// — visibility, not correctness).
// ------------------------------------------------------------------

export const GET = withApi({ key: "explain-usage", limit: { max: 60 } }, async ({ json }) => {
  const { used, cap } = await explainMonthUsage();
  return json({ ok: true, used, cap });
});
