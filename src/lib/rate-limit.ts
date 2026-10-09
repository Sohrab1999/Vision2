import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Phase-0 safety: tiny in-memory sliding-window rate limiter.
// Protects the paid TTS backend and the shared class database from
// runaway loops / abuse, without any external dependency.

interface Bucket {
  stamps: number[];
}

const buckets = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "local";
}

export interface RateVerdict {
  ok: boolean;
  response?: NextResponse;
}

/**
 * Sliding-window limiter keyed by route + client IP.
 * @param key    route bucket name (e.g. "tts", "stats-post")
 * @param max    max requests per window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(
  req: NextRequest,
  key: string,
  max: number,
  windowMs = 60_000
): RateVerdict {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(id) ?? { stamps: [] };
  bucket.stamps = bucket.stamps.filter((t) => now - t < windowMs);

  if (bucket.stamps.length >= max) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.stamps[0])) / 1000));
    buckets.set(id, bucket);
    return {
      ok: false,
      response: NextResponse.json(
        { error: `درخواست‌های خیلی زیاد — لطفاً ${retryAfter} ثانیه صبر کن` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      ),
    };
  }

  bucket.stamps.push(now);
  buckets.set(id, bucket);

  // opportunistic cleanup so the map never grows unbounded
  if (buckets.size > 4000) {
    for (const [k, v] of buckets) {
      if (v.stamps.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { ok: true };
}
