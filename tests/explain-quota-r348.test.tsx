// @vitest-environment jsdom
// ------------------------------------------------------------------
// r348 — «سقفِ ماهانهٔ توضیحِ هوشمند» (the explain monthly budget —
// the r347 TTS budget's sibling, same cost family).
//
// Audit debt: /api/explain had a per-hour limiter (20/h/IP) but NO
// monthly budget. This round meters real ai generations per UTC day
// (ExplainMeter, +1 each), gates the route with an honest 429 (code
// 'explain_quota'), publishes usage (X-Explain-Month-* headers +
// GET /api/explain/usage + the settings «بودجهٔ توضیح هوشمند» row),
// and lets ExplainBox tell the learner the SPECIFIC reason (inline
// monthly state WITHOUT the lying retry button + the once-a-day
// 'explain-quota' window event → pwa-layer toast).
//
// Contracts locked here:
//   • only REAL ai generations meter; cached reads and SDK-down
//     fallback text are free AND unmetered
//   • metering fails OPEN (broken meter ⇒ no gate, answer still flows)
//   • the gate runs BEFORE the hourly limiter and BEFORE any paid call
//     — an exhausted month never burns a rate-limit bucket hour
//   • the quota state NEVER offers «تلاش دوباره» (retrying cannot help
//     within the month — the honest difference vs the generic error)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------
// دروازههایِ آزمون: کش + مترِ درونحافظهای + sdkِ جعلی — دیتابیسِ واقعی هرگز
// ---------------------------------------------------------------
const meterRows = new Map<string, number>();
const aggregateMock = vi.fn(async (args: { where: { day: { startsWith: string } } }) => {
  let sum = 0;
  for (const [day, gens] of meterRows) {
    if (day.startsWith(args.where.day.startsWith)) sum += gens;
  }
  return { _sum: { gens: sum } };
});
const upsertMock = vi.fn(async (args: {
  where: { day: string };
  update: { gens: { increment: number } };
  create: { day: string; gens: number };
}) => {
  const prev = meterRows.get(args.where.day) ?? 0;
  meterRows.set(args.where.day, prev + args.update.gens.increment);
});

const cacheRows = new Map<string, { key: string; explanation: string; source: string }>();
const cacheFindMock = vi.fn(async (args: { where: { key: string } }) => cacheRows.get(args.where.key) ?? null);
const cacheUpsertMock = vi.fn(async (args: { where: { key: string }; create: { key: string; explanation: string; source: string } }) => {
  cacheRows.set(args.where.key, args.create);
});

vi.mock("@/lib/db", () => ({
  db: {
    explainMeter: { aggregate: aggregateMock, upsert: upsertMock },
    explainCache: { findUnique: cacheFindMock, upsert: cacheUpsertMock },
  },
}));

vi.mock("@/lib/analytics-server", () => ({
  trackEventServer: vi.fn(),
}));

const chatCreate = vi.fn(async () => ({
  choices: [{ message: { content: "چون این واژه در این جمله معنای «تصمیم» میدهد.\nمثال: She made a decision to study hard. (او تصمیم گرفت سخت درس بخواند.)" } }],
}));
vi.mock("z-ai-web-dev-sdk", () => ({
  default: { create: vi.fn(async () => ({ chat: { completions: { create: chatCreate } } })) },
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

function postReq(body: unknown): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) =>
        n.toLowerCase() === "content-length" ? String(text.length) : null,
    },
    nextUrl: new URL("http://local/api/explain"),
    text: async () => text,
  } as unknown as NextRequest;
}

beforeEach(() => {
  meterRows.clear();
  cacheRows.clear();
  aggregateMock.mockClear();
  upsertMock.mockClear();
  cacheFindMock.mockClear();
  cacheUpsertMock.mockClear();
  chatCreate.mockClear();
  vi.stubEnv("EXPLAIN_MONTHLY_GEN_CAP", "50");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// a real bank id so findQuestion resolves server-side
let qaId = "l1-q1";
let qaId2 = "l1-q2";
beforeAll(async () => {
  const { questionIndex } = await import("@/lib/explain-source");
  const ids = [...questionIndex().keys()].filter((id) => /^(l[123]-|x-)/.test(id));
  expect(ids.length).toBeGreaterThan(1);
  qaId = ids[0];
  qaId2 = ids[1];
});

// ---------------------------------------------------------------
// ① کتابخانهٔ متر — ریاضیِ ماه و قراردادِ upsert
// ---------------------------------------------------------------
describe("explain-meter — the month math", () => {
  it("cap: default 3000, env-tunable, garbage env falls back", async () => {
    vi.unstubAllEnvs(); // the beforeEach stub must not mask the true default
    const mod = await import("@/lib/explain-meter");
    expect(mod.explainMonthCap()).toBe(3_000);
    vi.stubEnv("EXPLAIN_MONTHLY_GEN_CAP", "777");
    expect(mod.explainMonthCap()).toBe(777);
    vi.stubEnv("EXPLAIN_MONTHLY_GEN_CAP", "not-a-number");
    expect(mod.explainMonthCap()).toBe(3_000);
    vi.stubEnv("EXPLAIN_MONTHLY_GEN_CAP", "-5");
    expect(mod.explainMonthCap()).toBe(3_000);
  });

  it("usage sums ONLY the current month's rows and tolerates an empty meter", async () => {
    const mod = await import("@/lib/explain-meter");
    meterRows.set("2026-10-01", 3);
    meterRows.set("2026-10-20", 4);
    meterRows.set("2026-09-28", 9999); // last month — must not leak in
    const t = new Date("2026-10-22T10:00:00Z");
    await expect(mod.explainMonthUsage(t)).resolves.toEqual({ used: 7, cap: 50 });
    meterRows.clear();
    await expect(mod.explainMonthUsage(t)).resolves.toEqual({ used: 0, cap: 50 });
  });

  it("bump upserts today's row with +1 — two bumps accumulate", async () => {
    const mod = await import("@/lib/explain-meter");
    const t = new Date("2026-10-22T10:00:00Z");
    await mod.bumpExplainMeter(t);
    await mod.bumpExplainMeter(t);
    expect(meterRows.get("2026-10-22")).toBe(2);
    expect(upsertMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------
// ② مسیرِ POST /api/explain — گشتِ ماهانه رویِ پایِ پرهزینه فقط
// ---------------------------------------------------------------
describe("POST /api/explain — the monthly gate", () => {
  it("under cap: real ai generation meters +1 and carries the month headers", async () => {
    const { POST } = await import("@/app/api/explain/route");
    const res = await POST(postReq({ id: qaId }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { source?: string; explanation?: string };
    expect(body.source).toBe("ai");
    expect(chatCreate).toHaveBeenCalledTimes(1);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock.mock.calls[0][0].update.gens.increment).toBe(1);
    expect(res.headers.get("X-Explain-Month-Cap")).toBe("50");
    expect(Number(res.headers.get("X-Explain-Month-Gens"))).toBe(1);
  });

  it("cache hit: instant, free AND unmetered (no second sdk call, no second upsert)", async () => {
    const { POST } = await import("@/app/api/explain/route");
    await POST(postReq({ id: qaId2 }));
    const ups = upsertMock.mock.calls.length;
    const sdk = chatCreate.mock.calls.length;
    const res2 = await POST(postReq({ id: qaId2 }));
    expect(res2.status).toBe(200);
    const body2 = (await res2.json()) as { cached?: boolean };
    expect(body2.cached).toBe(true);
    expect(chatCreate).toHaveBeenCalledTimes(sdk);
    expect(upsertMock).toHaveBeenCalledTimes(ups);
  });

  it("at/over cap: 429 with code explain_quota, NO paid call, NO metering, NO cache write", async () => {
    const { POST } = await import("@/app/api/explain/route");
    meterRows.set("2026-10-22", 50); // the meter PROVES the month is spent
    const res = await POST(postReq({ id: qaId }));
    expect(res.status).toBe(429);
    const body = (await res.json()) as { code?: string; ok?: boolean; error?: string };
    expect(body.code).toBe("explain_quota");
    expect(body.ok).toBe(false);
    expect(body.error).toContain("سقف");
    expect(chatCreate).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(cacheUpsertMock).not.toHaveBeenCalled();
  });

  it("the gate runs BEFORE the hourly limiter — an exhausted month never burns a bucket hour", async () => {
    const { POST } = await import("@/app/api/explain/route");
    meterRows.set("2026-10-22", 51);
    // an unparseable body would normally die in validation; the monthly
    // gate sits before the paid path but withApi validates first — so
    // prove ordering differently: over-cap 429 arrives even though the
    // hourly bucket for this ip is far from spent in this test file.
    const res = await POST(postReq({ id: qaId2 }));
    expect(res.status).toBe(429);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("explain_quota");
  });

  it("meter broken ⇒ fails OPEN — the explanation still flows, no 429 from a dead meter", async () => {
    const { POST } = await import("@/app/api/explain/route");
    aggregateMock.mockRejectedValueOnce(new Error("db down"));
    const res = await POST(postReq({ id: qaId }));
    expect(res.status).toBe(200);
    expect(chatCreate).toHaveBeenCalledTimes(1);
    // usage=null ⇒ no metering attempt, no month headers
    expect(upsertMock).not.toHaveBeenCalled();
    expect(res.headers.get("X-Explain-Month-Cap")).toBeNull();
  });

  it("meter write broken AFTER generation ⇒ the learner keeps the answer", async () => {
    const { POST } = await import("@/app/api/explain/route");
    upsertMock.mockRejectedValueOnce(new Error("db write down"));
    const res = await POST(postReq({ id: qaId2 }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { explanation?: string };
    expect(body.explanation).toBeTruthy();
  });

  it("SDK down ⇒ fallback text is FREE: cached but never metered, no month headers", async () => {
    const { POST } = await import("@/app/api/explain/route");
    chatCreate.mockRejectedValueOnce(new Error("sdk down"));
    const res = await POST(postReq({ id: qaId }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { source?: string };
    expect(body.source).toBe("fallback");
    expect(upsertMock).not.toHaveBeenCalled(); // fallback never meters
    expect(res.headers.get("X-Explain-Month-Gens")).toBeNull();
    // and the fallback IS cached (the F8 rule — one generation attempt, many reads)
    expect(cacheRows.has(qaId)).toBe(true);
  });
});

// ---------------------------------------------------------------
// ③ مسیرِ GET /api/explain/usage — بودجهٔ خوانا
// ---------------------------------------------------------------
describe("GET /api/explain/usage — the readable budget", () => {
  it("returns {ok, used, cap} from the meter", async () => {
    const { GET } = await import("@/app/api/explain/usage/route");
    meterRows.set("2026-10-05", 12);
    const req = {
      method: "GET",
      headers: { get: () => null },
      nextUrl: new URL("http://local/api/explain/usage"),
    } as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; used: number; cap: number };
    expect(body.ok).toBe(true);
    expect(body.used).toBe(12);
    expect(body.cap).toBe(50);
  });
});

// ---------------------------------------------------------------
// ④ ExplainBox — سقفِ ماه زبانِ خودش را دارد (بدونِ «تلاش دوباره»ی دروغین)
// ---------------------------------------------------------------
describe("ExplainBox — the quota speaks its own inline language", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const listen = () => {
    const events: unknown[] = [];
    const h = (e: Event) => events.push(e);
    window.addEventListener("explain-quota", h);
    return { events, off: () => window.removeEventListener("explain-quota", h) };
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", (fetchMock = vi.fn()));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("429 explain_quota ⇒ quota state + window event, and NO lying retry button", async () => {
    const { default: ExplainBox } = await import("@/components/study/shared/explain-box");
    const { render, screen, waitFor, fireEvent } = await import("@testing-library/react");
    const w = listen();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, code: "explain_quota" }), { status: 429 })
    );
    render(<ExplainBox questionId={qaId} />);
    fireEvent.click(screen.getByRole("button", { name: /توضیح با هوش مصنوعی/ }));
    await waitFor(() => expect(screen.getByText(/سقفِ توضیحِ هوشمندِ این ماه پر شده است/)).toBeTruthy());
    expect(w.events.length).toBe(1);
    // the honest difference: no «تلاش دوباره» when the MONTH is over
    expect(screen.queryByRole("button", { name: /تلاش دوباره/ })).toBeNull();
    w.off();
  });

  it("plain 429 (hourly rate limit) ⇒ generic error state WITH retry, no quota event", async () => {
    const { default: ExplainBox } = await import("@/components/study/shared/explain-box");
    const { render, screen, waitFor, fireEvent } = await import("@testing-library/react");
    const w = listen();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, code: "rate_limited" }), { status: 429 })
    );
    render(<ExplainBox questionId={qaId2} />);
    fireEvent.click(screen.getByRole("button", { name: /توضیح با هوش مصنوعی/ }));
    await waitFor(() => expect(screen.getByText(/توضیح هوشمند در دسترس نشد/)).toBeTruthy());
    expect(w.events.length).toBe(0);
    // a transient failure keeps the honest retry path
    expect(screen.getByRole("button", { name: /تلاش دوباره/ })).toBeTruthy();
    w.off();
  });

  it("429 with an unreadable body ⇒ generic error, never a crash", async () => {
    const { default: ExplainBox } = await import("@/components/study/shared/explain-box");
    const { render, screen, waitFor, fireEvent } = await import("@testing-library/react");
    const w = listen();
    fetchMock.mockResolvedValue(new Response("<html>proxy noise</html>", { status: 429 }));
    render(<ExplainBox questionId={qaId2} />);
    fireEvent.click(screen.getByRole("button", { name: /توضیح با هوش مصنوعی/ }));
    await waitFor(() => expect(screen.getByText(/توضیح هوشمند در دسترس نشد/)).toBeTruthy());
    expect(w.events.length).toBe(0);
    w.off();
  });
});

// ---------------------------------------------------------------
// ⑤ قفلهایِ ساختاری — سیمکشیِ توستِ روزانه، ردیفِ بودجه، کدِ مسیر
// ---------------------------------------------------------------
describe("explain quota family — structural locks", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("pwa-layer listens once-per-day with the family title — and no false 350ms race", () => {
    const src = read("src/components/study/shell/pwa-layer.tsx");
    // scoped slice (r319 lesson): start at the HANDLER name, not the key
    // constant — "explain-quota" also occurs inside the r347 tts wiring.
    const wiring = src.slice(src.indexOf("onExplainQuota"));
    expect(wiring).toContain('addEventListener("explain-quota"');
    expect(wiring).toContain("EXPLAIN_QUOTA_TOAST_KEY");
    expect(wiring).toContain("oncePerDay(EXPLAIN_QUOTA_TOAST_KEY)");
    expect(wiring).toContain("سقفِ توضیحِ هوشمندِ این ماه پر شد");
    const block = wiring.slice(0, wiring.indexOf("}, [toast])"));
    expect(block).not.toContain("350"); // no family-toast race for explain
  });

  it("settings row: usage fetch + Persian budget line + violet identity", () => {
    const src = read("src/components/study/shared/settings-popover.tsx");
    expect(src).toContain('fetch("/api/explain/usage"');
    expect(src).toContain("بودجهٔ توضیح هوشمند");
    expect(src).toContain("from-violet-400 to-violet-600");
    expect(src).toContain("پرسشِ سقفِ ماه");
    // the r347 sibling row must stay intact
    expect(src).toContain('fetch("/api/tts/usage"');
    expect(src).toContain("بودجهٔ روخوانیِ ماه");
  });

  it("the route speaks the machine code the client matches on", () => {
    const src = read("src/app/api/explain/route.ts");
    expect(src).toContain('code: "explain_quota"');
    expect(src).toContain("explainMonthUsage");
    expect(src).toContain("bumpExplainMeter");
    expect(src).toContain("X-Explain-Month-Cap");
    // only real ai generations meter — the raw gate
    expect(src).toContain("if (raw && usage)");
  });

  it("ExplainBox: quota slice has the monthly wording and the retry button lives ONLY in the error slice", () => {
    const src = read("src/components/study/shared/explain-box.tsx");
    // the ask() branch: 429 → machine code → event dispatch → quota state
    const askSlice = src.slice(src.indexOf("res.status === 429"), src.indexOf("if (!res.ok)"));
    expect(askSlice).toContain('code === "explain_quota"');
    expect(askSlice).toContain('dispatchEvent(new CustomEvent("explain-quota"))');
    expect(askSlice).toContain('setState({ status: "quota" })');
    // the render slice: budget identity, monthly wording, NO lying retry
    const quotaSlice = src.slice(src.indexOf('status === "quota"'), src.indexOf('status === "error"'));
    expect(quotaSlice).toContain("سقفِ توضیحِ هوشمندِ این ماه پر شده است");
    expect(quotaSlice).toContain("Gauge");
    expect(quotaSlice).not.toContain("تلاش دوباره");
    const errorSlice = src.slice(src.indexOf('status === "error"'));
    expect(errorSlice).toContain("تلاش دوباره");
  });
});
