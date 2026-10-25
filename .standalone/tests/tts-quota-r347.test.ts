// @vitest-environment jsdom
// ------------------------------------------------------------------
// r347 — «سقفِ ماهانهٔ روخوانی» (the TTS monthly budget family).
//
// Audit §7 debt: the paid TTS backend had a per-minute limiter but NO
// monthly budget. This round meters real syntheses per UTC day
// (TtsMeter), gates the route with an honest 429 (code 'tts_quota'),
// publishes usage (response headers + GET /api/tts/usage + the
// settings «بودجهٔ روخوانیِ ماه» row), and lets the client speak the
// SPECIFIC reason once a day (speak.ts window event → pwa-layer
// toast) while the r345 audio-failure family toast stays truthful.
//
// Contracts locked here:
//   • only cache misses meter; cached narration is free AND unmetered
//   • metering fails OPEN (broken meter ⇒ no gate, audio still flows)
//   • the gate only closes the route when the meter PROVES the month
//     is spent; meter failures never 429
//   • speak.ts's 4-arg contract (r345) stays frozen — the quota rides
//     a window event, zero signature churn
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------
// دروازههایِ آزمون: مترِ درونحافظهای + sdkِ جعلی — دیتابیسِ واقعی هرگز
// ---------------------------------------------------------------
const meterRows = new Map<string, number>();
const aggregateMock = vi.fn(async (args: { where: { day: { startsWith: string } } }) => {
  let sum = 0;
  for (const [day, chars] of meterRows) {
    if (day.startsWith(args.where.day.startsWith)) sum += chars;
  }
  return { _sum: { chars: sum } };
});
const upsertMock = vi.fn(async (args: {
  where: { day: string };
  update: { chars: { increment: number } };
  create: { day: string; chars: number };
}) => {
  const prev = meterRows.get(args.where.day) ?? 0;
  meterRows.set(args.where.day, prev + args.update.chars.increment);
});

vi.mock("@/lib/db", () => ({
  db: { ttsMeter: { aggregate: aggregateMock, upsert: upsertMock } },
}));

const ttsCreate = vi.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(16) }));
vi.mock("z-ai-web-dev-sdk", () => ({
  default: { create: vi.fn(async () => ({ audio: { tts: { create: ttsCreate } } })) },
}));

function postReq(body: unknown): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) =>
        n.toLowerCase() === "content-length" ? String(text.length) : null,
    },
    nextUrl: new URL("http://local/api/tts"),
    text: async () => text,
  } as unknown as NextRequest;
}

beforeEach(() => {
  meterRows.clear();
  aggregateMock.mockClear();
  upsertMock.mockClear();
  ttsCreate.mockClear();
  vi.stubEnv("TTS_MONTHLY_CHAR_CAP", "100000");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------
// ① کتابخانهٔ متر — ریاضیِ ماه و قراردادِ upsert
// ---------------------------------------------------------------
describe("tts-meter — the month math", () => {
  it("cap: default 150k, env-tunable, garbage env falls back", async () => {
    vi.unstubAllEnvs(); // the beforeEach stub must not mask the true default
    const mod = await import("@/lib/tts-meter");
    expect(mod.ttsMonthCap()).toBe(150_000);
    vi.stubEnv("TTS_MONTHLY_CHAR_CAP", "777");
    expect(mod.ttsMonthCap()).toBe(777);
    vi.stubEnv("TTS_MONTHLY_CHAR_CAP", "not-a-number");
    expect(mod.ttsMonthCap()).toBe(150_000);
    vi.stubEnv("TTS_MONTHLY_CHAR_CAP", "-5");
    expect(mod.ttsMonthCap()).toBe(150_000);
  });

  it("UTC month prefix + day key shapes", async () => {
    const mod = await import("@/lib/tts-meter");
    const t = new Date("2026-10-15T23:30:00Z");
    expect(mod.monthDayPrefix(t)).toBe("2026-10");
    expect(mod.monthDayKey(t)).toBe("2026-10-15");
  });

  it("usage sums ONLY the current month's rows and tolerates an empty meter", async () => {
    const mod = await import("@/lib/tts-meter");
    meterRows.set("2026-10-01", 30);
    meterRows.set("2026-10-20", 70);
    meterRows.set("2026-09-28", 9999); // last month — must not leak in
    const t = new Date("2026-10-22T10:00:00Z");
    await expect(mod.ttsMonthUsage(t)).resolves.toEqual({ used: 100, cap: 100000 });
    meterRows.clear();
    await expect(mod.ttsMonthUsage(t)).resolves.toEqual({ used: 0, cap: 100000 });
  });

  it("bump upserts today's row with an increment — two bumps accumulate", async () => {
    const mod = await import("@/lib/tts-meter");
    const t = new Date("2026-10-22T10:00:00Z");
    await mod.bumpTtsMeter(12, t);
    await mod.bumpTtsMeter(18, t);
    expect(meterRows.get("2026-10-22")).toBe(30);
    expect(upsertMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------
// ② مسیرِ POST /api/tts — گشتِ ماهانه رویِ پرهزینه فقط
// ---------------------------------------------------------------
describe("POST /api/tts — the monthly gate", () => {
  it("under cap: real synthesis meters clean.length and carries the month headers", async () => {
    const { POST } = await import("@/app/api/tts/route");
    const res = await POST(postReq({ text: "Hello Vision", speed: 1 }));
    expect(res.status).toBe(200);
    expect(ttsCreate).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock.mock.calls[0][0].update.chars.increment).toBe("Hello Vision".length);
    expect(res.headers.get("X-TTS-Month-Cap")).toBe("100000");
    expect(Number(res.headers.get("X-TTS-Month-Chars"))).toBeGreaterThanOrEqual("Hello Vision".length);
  });

  it("cache hit: instant, free AND unmetered (no second sdk call, no second upsert)", async () => {
    const { POST } = await import("@/app/api/tts/route");
    await POST(postReq({ text: "Cached Line", speed: 1 }));
    const ups = upsertMock.mock.calls.length;
    const sdk = ttsCreate.mock.calls.length;
    const res2 = await POST(postReq({ text: "Cached Line", speed: 1 }));
    expect(res2.status).toBe(200);
    expect(ttsCreate).toHaveBeenCalledTimes(sdk);
    expect(upsertMock).toHaveBeenCalledTimes(ups);
  });

  it("at/over cap: 429 with code tts_quota, NO paid call, NO metering", async () => {
    const { POST } = await import("@/app/api/tts/route");
    meterRows.set("2026-10-22", 100000); // the meter PROVES the month is spent
    const res = await POST(postReq({ text: "Blocked Line", speed: 1 }));
    expect(res.status).toBe(429);
    const body = (await res.json()) as { code?: string; ok?: boolean };
    expect(body.code).toBe("tts_quota");
    expect(body.ok).toBe(false);
    expect(ttsCreate).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("meter broken ⇒ fails OPEN — audio still flows, no 429 from a dead meter", async () => {
    const { POST } = await import("@/app/api/tts/route");
    aggregateMock.mockRejectedValueOnce(new Error("db down"));
    const res = await POST(postReq({ text: "Resilient Line", speed: 1 }));
    expect(res.status).toBe(200);
    expect(ttsCreate).toHaveBeenCalledTimes(1);
    // usage=null ⇒ no metering attempt, no month headers
    expect(upsertMock).not.toHaveBeenCalled();
    expect(res.headers.get("X-TTS-Month-Cap")).toBeNull();
  });

  it("meter write broken AFTER synthesis ⇒ the learner keeps the audio", async () => {
    const { POST } = await import("@/app/api/tts/route");
    upsertMock.mockRejectedValueOnce(new Error("db write down"));
    const res = await POST(postReq({ text: "Held Audio", speed: 1 }));
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------
// ③ مسیرِ GET /api/tts/usage — بودجهٔ خوانا
// ---------------------------------------------------------------
describe("GET /api/tts/usage — the readable budget", () => {
  it("returns {ok, used, cap} from the meter", async () => {
    const { GET } = await import("@/app/api/tts/usage/route");
    meterRows.set("2026-10-05", 250);
    const req = {
      method: "GET",
      headers: { get: () => null },
      nextUrl: new URL("http://local/api/tts/usage"),
    } as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; used: number; cap: number };
    expect(body.ok).toBe(true);
    expect(body.used).toBe(250);
    expect(body.cap).toBe(100000);
  });
});

// ---------------------------------------------------------------
// ④ speak.ts — رویدادِ tts-quota بدونِ دست‌زدن به قراردادِ ۴آرگومانی
// ---------------------------------------------------------------
describe("speak.ts — the quota speaks its own language (r345 contract frozen)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const listen = () => {
    const events: unknown[] = [];
    const h = (e: Event) => events.push(e);
    window.addEventListener("tts-quota", h);
    return { events, off: () => window.removeEventListener("tts-quota", h) };
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", (fetchMock = vi.fn()));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("429 with code tts_quota ⇒ window event + onError (once — no retry storm)", async () => {
    const { speak } = await import("@/lib/speak");
    const w = listen();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, code: "tts_quota" }), { status: 429 })
    );
    const onError = vi.fn();
    await speak("quota text", 1, undefined, onError);
    expect(w.events.length).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    w.off();
  });

  it("plain 429 (rate limit) ⇒ family onError but NO quota event", async () => {
    const { speak } = await import("@/lib/speak");
    const w = listen();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, code: "rate_limited" }), { status: 429 })
    );
    const onError = vi.fn();
    await speak("limited text", 1, undefined, onError);
    expect(w.events.length).toBe(0);
    expect(onError).toHaveBeenCalledTimes(1);
    w.off();
  });

  it("429 with an unreadable body ⇒ still just the family leg, never a crash", async () => {
    const { speak } = await import("@/lib/speak");
    const w = listen();
    fetchMock.mockResolvedValue(new Response("<html>proxy noise</html>", { status: 429 }));
    const onError = vi.fn();
    await expect(speak("noise text", 1, undefined, onError)).resolves.toBeInstanceOf(Function);
    expect(w.events.length).toBe(0);
    expect(onError).toHaveBeenCalledTimes(1);
    w.off();
  });
});

// ---------------------------------------------------------------
// ⑤ قفلهایِ ساختاری — سیمکشیِ توستِ روزانه و ردیفِ بودجه
// ---------------------------------------------------------------
describe("quota family — structural locks", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("pwa-layer listens once-per-day with the family title", () => {
    const src = read("src/components/study/shell/pwa-layer.tsx");
    const wiring = src.slice(src.indexOf("tts-quota", src.indexOf("useSwUpdateToast")));
    expect(wiring).toContain('addEventListener("tts-quota"');
    expect(wiring).toContain("QUOTA_TOAST_KEY");
    expect(wiring).toContain("oncePerDay(QUOTA_TOAST_KEY)");
    expect(wiring).toContain("سقفِ روخوانیِ این ماه پر شد");
  });

  it("settings row: usage fetch + threshold colors + Persian budget line", () => {
    const src = read("src/components/study/shared/settings-popover.tsx");
    expect(src).toContain('fetch("/api/tts/usage"');
    expect(src).toContain("بودجهٔ روخوانیِ ماه");
    expect(src).toContain("from-rose-400 to-rose-600");
    expect(src).toContain("from-amber-400 to-amber-600");
    expect(src).toContain("حرفِ سقفِ ماه");
  });

  it("the route speaks the machine code the client matches on", () => {
    const src = read("src/app/api/tts/route.ts");
    expect(src).toContain('code: "tts_quota"');
    expect(src).toContain("ttsMonthUsage");
    expect(src).toContain("bumpTtsMeter");
    expect(src).toContain("X-TTS-Month-Cap");
  });
});
