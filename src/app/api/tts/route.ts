import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// module-level cache so repeated narration is instant
const CACHE = new Map<string, Buffer>();
const MAX_CACHE = 120;

function audioResponse(buffer: Buffer) {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=86400",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text: string = typeof body?.text === "string" ? body.text : "";
    const speed: number =
      typeof body?.speed === "number" ? Math.min(1.6, Math.max(0.5, body.speed)) : 0.95;

    const clean = text.replace(/\s+/g, " ").trim().slice(0, 950);
    if (!clean) {
      return NextResponse.json({ error: "متن برای روخوانی الزامی است" }, { status: 400 });
    }

    const key = `${speed}|${clean}`;
    const cached = CACHE.get(key);
    if (cached) return audioResponse(cached);

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      input: clean,
      voice: "jam", // British gentleman voice — ideal for English narration
      speed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    if (CACHE.size >= MAX_CACHE) {
      const firstKey = CACHE.keys().next().value;
      if (firstKey) CACHE.delete(firstKey);
    }
    CACHE.set(key, buffer);

    return audioResponse(buffer);
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: "تولید صدا با خطا مواجه شد، لطفاً دوباره تلاش کنید" },
      { status: 500 }
    );
  }
}
