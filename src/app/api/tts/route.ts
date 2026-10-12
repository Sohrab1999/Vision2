import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, ttsSchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Roadmap Step 5: withApi handles validation + error shape; the rate
// limit stays INSIDE the handler on purpose — repeated narration is
// served from the module cache for free and only cache misses (real
// paid TTS calls) consume the bucket.
// Audit §7: the paid TTS call now has a hard timeout so a hanging
// upstream can never pin the route (parity with /api/explain).

const TIMEOUT_MS = 20_000;

// module-level cache so repeated narration is instant
const CACHE = new Map<string, Buffer>();
const MAX_CACHE = 120;

function audioResponse(buffer: Buffer) {
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=86400",
    },
  });
}

export const POST = withApi(
  { key: "tts", bodyCap: BODY_CAPS.tts, schema: ttsSchema },
  async ({ parsed, req }) => {
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

    return audioResponse(buffer);
  }
);
