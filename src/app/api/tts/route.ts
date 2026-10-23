import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, ttsSchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";
import { bumpTtsMeter, ttsMonthUsage } from "@/lib/tts-meter";

export const runtime = "nodejs";

// Roadmap Step 5: withApi handles validation + error shape; the rate
// limit stays INSIDE the handler on purpose — repeated narration is
// served from the module cache for free and only cache misses (real
// paid TTS calls) consume the bucket.
// Audit §7: the paid TTS call now has a hard timeout so a hanging
// upstream can never pin the route (parity with /api/explain).
// r347: the paid path also has a MONTHLY character budget (TtsMeter,
// env-tunable). Metering fails OPEN — a broken meter never takes
// narration away; the gate only closes the route when the meter
// itself proves the month is spent. The 429 speaks its own code
// ('tts_quota') so the client can tell the learner the SPECIFIC
// reason (family toast + once-a-day quota toast via the 'tts-quota'
// window event from speak.ts).

const TIMEOUT_MS = 20_000;

// module-level cache so repeated narration is instant
const CACHE = new Map<string, Buffer>();
const MAX_CACHE = 120;

function audioResponse(buffer: Buffer, meter?: { used: number; cap: number }) {
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=86400",
      // r347 — every synthesis carries the month's metering, so the
      // client (and curl-based ops) can see the budget without a probe
      ...(meter
        ? {
            "X-TTS-Month-Chars": String(meter.used),
            "X-TTS-Month-Cap": String(meter.cap),
          }
        : {}),
    },
  });
}

export const POST = withApi(
  { key: "tts", bodyCap: BODY_CAPS.tts, schema: ttsSchema },
  async ({ parsed, req, json }) => {
    const clean = parsed.text.replace(/\s+/g, " ").trim().slice(0, 950);
    if (!clean) {
      throw ApiError.bad("متن برای روخوانی الزامی است");
    }

    const key = `${parsed.speed}|${clean}`;
    const cached = CACHE.get(key);
    if (cached) return audioResponse(cached);

    // rate-limit only the expensive path (cache misses cost a real TTS call)
    const limit = rateLimit(req, "tts", 30, 60_000);
    if (!limit.ok) return limit.response!;

    // r347 — the monthly gate, on the expensive path only, BEFORE the
    // paid call. Metering failure fails OPEN (usage=null ⇒ no gate).
    let usage: { used: number; cap: number } | null = null;
    try {
      usage = await ttsMonthUsage();
    } catch {
      /* meter unavailable — availability beats accounting */
    }
    if (usage && usage.used >= usage.cap) {
      return json(
        { ok: false, code: "tts_quota", error: "سقفِ روخوانیِ این ماه پر شده است — ماهِ بعد دوباره در دسترس است" },
        { status: 429 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const buffer = await Promise.race([
      (async () => {
        const response = await zai.audio.tts.create({
          input: clean,
          voice: "jam", // British gentleman voice — ideal for English narration
          speed: parsed.speed,
          response_format: "wav",
          stream: false,
        });
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(new Uint8Array(arrayBuffer));
      })(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("tts timeout")), TIMEOUT_MS)),
    ]);

    if (CACHE.size >= MAX_CACHE) {
      const firstKey = CACHE.keys().next().value;
      if (firstKey) CACHE.delete(firstKey);
    }
    CACHE.set(key, buffer);

    // r347 — meter AFTER a real synthesis; a broken meter never fails
    // the audio the learner is already holding.
    if (usage) {
      try {
        await bumpTtsMeter(clean.length);
      } catch {
        /* metering is a cost guard, not correctness */
      }
    }

    return audioResponse(buffer, usage ? { used: usage.used + clean.length, cap: usage.cap } : undefined);
  }
);
