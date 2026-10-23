import { withApi } from "@/lib/api/handler";
import { ttsMonthUsage } from "@/lib/tts-meter";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// r347 — the monthly TTS budget, readable. The settings popover's
// «بودجهٔ روخوانیِ ماه» row fetches this on open; ops can curl it.
// Failure shape: the withApi error envelope (the settings row simply
// stays hidden when this fails — visibility, not correctness).
// ------------------------------------------------------------------

export const GET = withApi({ key: "tts-usage", limit: { max: 60 } }, async ({ json }) => {
  const { used, cap } = await ttsMonthUsage();
  return json({ ok: true, used, cap });
});
