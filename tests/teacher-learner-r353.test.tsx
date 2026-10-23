// @vitest-environment jsdom
// ------------------------------------------------------------------
// r353 — «عمقِ پنلِ معلم» — گامِ دوم: جزئیاتِ تک‌یادگیرنده + مرتبسازیِ
//   دستیِ فهرست:
//   ① handleِ ناموجودالاثر: HMAC(userId, کد) — قطعی، ۱۶hex، بیرابطه،
//     چرخان با کد؛ در payloadِ گزارش مینشیند و userId لو نمیدهد.
//   ② مرتبسازیِ دستی: چهار کلیدِ قطعی (فعال‌ترین/میانگین/نام/آخرین)
//     با nullِ آخر — هیچ ردیفی گم نمیشود.
//   ③ موتورِ جزئیات: بیتلاش = null نه صفر؛ نوارِ ۱۴روزه با صفرِ واقعی؛
//     پوششِ ۱..۱۲ + خارجیِ دفاعی؛ مهارتها ضعیفترینِ اول؛ recent سقفِ ۶.
//   ④ مسیرِ /api/teacher/learner: گیتِ دومرحلهای (404/403)، handleِ
//     زباله ⇒ 400، ناهمتا ⇒ 404ِ «یافت نشد»، حریمِ payload.
//   ⑤ دیالوگِ نما: بازشدنِ واقعی از ردیفِ دکمهای، teacher_detail،
//     حالتهایِ صادق (missing بدونِ retry / net با retry / auth ⇒ گیت).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import TeacherView from "@/components/study/teacher/teacher-view";
import { assembleLearnerDetail, sortRosterBy, LEARNER_DAYS_WINDOW, LEARNER_RECENT_CAP, type RosterRow } from "@/lib/teacher-report";
import { learnerHandle, LEARNER_HANDLE_RE } from "@/lib/teacher-handles";
import { EVENT_NAMES, EVENT_LABELS_FA, EVENT_CATEGORIES } from "@/lib/analytics-events";
import { trackEvent } from "@/lib/analytics";

const trackMock = trackEvent as unknown as ReturnType<typeof vi.fn>;

const HOUR = 3600 * 1000;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString().slice(0, 10);
// روزهایِ قطعی: ظهرِ UTC — درسِ r352 (now-26h لزوماً «دیروز» نیست)
const noon = (n: number) => new Date(`${day(n)}T12:00:00Z`);

// ------------------------------------------------------------------
// ① handleِ ناموجودالاثر
// ------------------------------------------------------------------
describe("learnerHandle — شناسهٔ ناموجودالاثر", () => {
  it("قطعی، ۱۶hexِ کوچک، بیرابطه میانِ کاربران، چرخان با کد", () => {
    const a1 = learnerHandle("u1", "edu-1404");
    expect(a1).toBe(learnerHandle("u1", "edu-1404")); // قطعی
    expect(a1).toMatch(LEARNER_HANDLE_RE);
    expect(a1).toHaveLength(16);
    expect(a1).not.toBe(learnerHandle("u2", "edu-1404")); // بیرابطه
    expect(a1).not.toBe(learnerHandle("u1", "edu-1405")); // چرخشِ کد ⇒ همهٔ handleها نو
    expect(LEARNER_HANDLE_RE.test("XYZ")).toBe(false);
    expect(LEARNER_HANDLE_RE.test("0123456789abcdef0")).toBe(false); // ۱۷ نویسه
  });
});

// ------------------------------------------------------------------
// ② مرتبسازیِ دستیِ فهرست — چهار کلیدِ قطعی
// ------------------------------------------------------------------
const sortFixture: RosterRow[] = [
  { name: "آرش", color: "emerald", attempts: 3, avgPercent: 50, bestPercent: 60, lessons: 2, lastActive: iso(30 * HOUR), weakest: null },
  { name: "سارا", color: "sky", attempts: 1, avgPercent: 90, bestPercent: 90, lessons: 1, lastActive: iso(2 * HOUR), weakest: null },
  { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
];

describe("sortRosterBy — مرتبسازیِ دستیِ معلم", () => {
  it("فعال‌ترین = عینِ ترتیبِ سرور؛ میانگین = نزولی با nullِ آخر", () => {
    expect(sortRosterBy(sortFixture, "attempts").map((r) => r.name)).toEqual(["آرش", "سارا", "نگار"]);
    expect(sortRosterBy(sortFixture, "avg").map((r) => r.name)).toEqual(["سارا", "آرش", "نگار"]);
  });
  it("نام = صعودیِ فارسی؛ آخرین = ISO نزولی با «هرگز» آخر — همه قطعی", () => {
    expect(sortRosterBy(sortFixture, "name").map((r) => r.name)).toEqual(["آرش", "سارا", "نگار"]);
    expect(sortRosterBy(sortFixture, "recent").map((r) => r.name)).toEqual(["سارا", "آرش", "نگار"]);
    // قطعیت: دوبارِ پیاپی همان خروجی — هیچ نوسانی بینِ دو رندر
    expect(sortRosterBy(sortFixture, "recent")).toEqual(sortRosterBy(sortFixture, "recent"));
  });
});

// ------------------------------------------------------------------
// ③ موتورِ assembleLearnerDetail
// ------------------------------------------------------------------
describe("assembleLearnerDetail — موتورِ جزئیاتِ یادگیرنده", () => {
  it("یادگیرندهٔ بیتلاش = nullهایِ صادق + نوارِ ۱۴روزهٔ صفرِ واقعی + ۱۲ درسِ لمسنشده", () => {
    const d = assembleLearnerDetail({
      now,
      profile: { name: "نگار", color: "violet", createdAt: iso(5 * 86_400_000) },
      attempts: [],
    });
    expect(d.name).toBe("نگار");
    expect(d.attempts).toBe(0);
    expect(d.avgPercent).toBeNull();
    expect(d.bestPercent).toBeNull();
    expect(d.lastActive).toBeNull();
    expect(d.lessons).toBe(0);
    expect(d.byDay).toHaveLength(LEARNER_DAYS_WINDOW);
    expect(d.byDay[13].day).toBe(day(0));
    expect(d.byDay.every((x) => x.attempts === 0)).toBe(true);
    expect(d.byLesson).toHaveLength(12);
    expect(d.byLesson.every((l) => l.attempts === 0 && l.avgPercent === null)).toBe(true);
    expect(d.bySkill).toEqual([]);
    expect(d.recent).toEqual([]);
  });

  it("شکستها: مهارت ضعیفترینِ اول (تساوی ⇒ نام)، درس ۱..۱۲ + خارجی، recent سقفِ ۶ با ISOی کامل", () => {
    const attempts = [
      { category: "vocab", lesson: 1, percent: 80, createdAt: noon(3) },
      { category: "vocab", lesson: 2, percent: 90, createdAt: iso(1 * HOUR) },
      { category: "dictation", lesson: 2, percent: 50, createdAt: iso(2 * HOUR) },
      { category: "listening", lesson: 1, percent: 40, createdAt: noon(3) },
      // خارجیِ دفاعی (درسِ ۹۹) — عینِ idiomِ گزارشِ کلاس
      { category: "rush", lesson: 99, percent: 70, createdAt: iso(3 * HOUR) },
    ];
    const d = assembleLearnerDetail({ now, profile: { name: "آرش", color: "emerald", createdAt: iso(9 * 86_400_000) }, attempts });
    expect(d.attempts).toBe(5);
    expect(d.avgPercent).toBe(66); // (80+90+50+40+70)/5 = 66
    expect(d.bestPercent).toBe(90);
    expect(d.lessons).toBe(3); // 1، 2، 99
    expect(d.lastActive).toBe(iso(1 * HOUR));
    // ضعیفترینِ اول: listening 40 → dictation 50 → rush 70 → vocab 85
    expect(d.bySkill.map((s) => s.category)).toEqual(["listening", "dictation", "rush", "vocab"]);
    expect(d.bySkill[3]).toEqual({ category: "vocab", attempts: 2, avgPercent: 85, bestPercent: 90 });
    // پوشش: 1..12 + 99 — درسِ 2 دوتلاش با میانگین ۷۰
    expect(d.byLesson).toHaveLength(13);
    const l2 = d.byLesson.find((l) => l.lesson === 2)!;
    expect(l2.attempts).toBe(2);
    expect(l2.avgPercent).toBe(70);
    const l99 = d.byLesson[12];
    expect(l99.lesson).toBe(99);
    // نوار: ۱۴ روز — اندیسِ i = روزِ (13-i): دو تلاشِ ظهرِ ۳روزِ پیش = اندیسِ ۱۰
    expect(d.byDay[10].attempts).toBe(2);
    expect(d.byDay[13].attempts).toBe(3); // امروزیها (۱ساعت + ۲ساعت + ۳ساعتِ rushِ خارجی)
    expect(d.byDay[11].attempts).toBe(0); // دیروزِ واقعی
  });

  it("recent: بیش از سقف ⇒ ۶تایِ نو، و دو تلاشِ همروز با ISO مرتب میشوند", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      category: "vocab",
      lesson: 1,
      percent: 50 + i,
      createdAt: iso((i + 1) * HOUR),
    }));
    const d = assembleLearnerDetail({ now, profile: { name: "سارا", color: "sky", createdAt: iso(2 * 86_400_000) }, attempts: many });
    expect(d.recent).toHaveLength(LEARNER_RECENT_CAP);
    expect(d.recent[0].percent).toBe(50); // نوترین (۱ساعت پیش)
    expect(d.recent[5].percent).toBe(55); // ششمی (۶ساعت پیش)
    // همروز: ۱۰:۰۰ و ۰۸:۰۰ امروز — نوترین (۱۰) اول
    const sameDay = [
      { category: "vocab", lesson: 1, percent: 10, createdAt: `${day(0)}T08:00:00Z` },
      { category: "vocab", lesson: 1, percent: 20, createdAt: `${day(0)}T10:00:00Z` },
    ];
    const d2 = assembleLearnerDetail({ now, profile: { name: "س", color: "sky", createdAt: iso(HOUR) }, attempts: sameDay });
    expect(d2.recent.map((r) => r.percent)).toEqual([20, 10]);
  });
});

// ------------------------------------------------------------------
// ④ مسیرها — گزارش (handleها) + جزئیات (گیت و شکل)
// ------------------------------------------------------------------
const reportRows = new Map<string, unknown>();
vi.mock("@/lib/db", () => ({
  db: {
    learnerProfile: {
      findMany: vi.fn(async () => reportRows.get("profiles") ?? []),
    },
    quizAttempt: {
      groupBy: vi.fn(async () => []),
      aggregate: vi.fn(async () => ({ _count: { _all: 0 }, _avg: { percent: null } })),
      findMany: vi.fn(async (args: { where?: { userId?: string }; orderBy?: unknown }) =>
        reportRows.get(args?.where?.userId ? `attempts:${args.where.userId}` : "attempts") ?? []),
      count: vi.fn(async () => 0),
    },
  },
}));

const getReq = (headers: Record<string, string> = {}) =>
  ({ method: "GET", headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } }) as unknown as NextRequest;

const setEnv = (v: string | undefined) => {
  if (v === undefined) delete process.env.TEACHER_ACCESS_CODE;
  else process.env.TEACHER_ACCESS_CODE = v;
};

const learnerUrl = (handle: string): NextRequest => {
  const req = getReq({ "x-teacher-code": process.env.TEACHER_ACCESS_CODE ?? "" }) as NextRequest;
  (req as unknown as { nextUrl: URL }).nextUrl = new URL(`http://localhost/api/teacher/learner?handle=${handle}`);
  return req;
};

describe("مسیرهایِ معلم در r353", () => {
  beforeEach(() => {
    reportRows.clear();
    setEnv("edu-1404");
  });
  afterEach(() => {
    setEnv(undefined);
    cleanup();
  });

  it("گزارشِ r352: هر ردیف handleی دارد که با HMAC(userId, کد) برابر است — بیآنکه userId در payload باشد", async () => {
    reportRows.set("profiles", [
      { userId: "u1", name: "آرش", color: "emerald" },
      { userId: "u2", name: "نگار", color: "violet" },
    ]);
    const { GET } = await import("@/app/api/teacher/report/route");
    const res = await GET(getReq({ "x-teacher-code": "edu-1404" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { roster: { name: string; handle?: string }[] };
    expect(body.roster[0].handle).toBe(learnerHandle("u1", "edu-1404"));
    expect(body.roster[1].handle).toBe(learnerHandle("u2", "edu-1404"));
    expect(JSON.stringify(body)).not.toContain("userId");
    expect(JSON.stringify(body)).not.toContain('"u1"');
  });

  it("learner: بی‌کدِ محیطی ⇒ 404 صادق؛ کدِ غلط ⇒ 403 (گیتِ دومرحلهای عینِ گزارش)", async () => {
    const { GET } = await import("@/app/api/teacher/learner/route");
    setEnv(undefined);
    const res404 = await GET(learnerUrl("0123456789abcdef"));
    expect(res404.status).toBe(404);
    expect(((await res404.json()) as { error?: string }).error).toContain("فعال نیست");
    setEnv("edu-1404");
    const bad = getReq({ "x-teacher-code": "wrong" }) as NextRequest;
    (bad as unknown as { nextUrl: URL }).nextUrl = new URL("http://localhost/api/teacher/learner?handle=0123456789abcdef");
    const res403 = await GET(bad);
    expect(res403.status).toBe(403);
  });

  it("learner: handleِ زباله ⇒ 400 (zod)؛ ناهمتا ⇒ 404ِ «یافت نشد» — هر دو پیشِ هر کوئریِ پرهزینه", async () => {
    const { GET } = await import("@/app/api/teacher/learner/route");
    const garbage = getReq({ "x-teacher-code": "edu-1404" }) as NextRequest;
    (garbage as unknown as { nextUrl: URL }).nextUrl = new URL("http://localhost/api/teacher/learner?handle=XYZ");
    expect((await GET(garbage)).status).toBe(400);
    const ghost = learnerUrl("ffffffffffffffff");
    const res = await GET(ghost);
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error?: string }).error).toContain("یافت نشد");
  });

  it("learner: handleِ درست ⇒ جزئیاتِ کامل — windowDays=14، بدونِ userId/secret/پاسخِ خام", async () => {
    reportRows.set("profiles", [
      { userId: "u1", name: "آرش", color: "emerald", createdAt: new Date(now - 9 * 86_400_000) },
    ]);
    reportRows.set("attempts:u1", [
      { category: "vocab", lesson: 1, percent: 80, createdAt: new Date(now - HOUR) },
      { category: "dictation", lesson: 2, percent: 45, createdAt: noon(1) },
    ]);
    const { GET } = await import("@/app/api/teacher/learner/route");
    const res = await GET(learnerUrl(learnerHandle("u1", "edu-1404")));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean; windowDays: number;
      learner: { name: string; attempts: number; avgPercent: number; bySkill: { category: string }[]; recent: unknown[] };
    };
    expect(body.ok).toBe(true);
    expect(body.windowDays).toBe(LEARNER_DAYS_WINDOW);
    expect(body.learner.name).toBe("آرش");
    expect(body.learner.attempts).toBe(2);
    expect(body.learner.avgPercent).toBe(63); // (80+45)/2
    expect(body.learner.bySkill[0].category).toBe("dictation"); // ضعیفترینِ اول
    expect(body.learner.recent).toHaveLength(2);
    const raw = JSON.stringify(body);
    expect(raw).not.toContain("userId");
    expect(raw).not.toContain("secret");
    expect(raw).not.toContain('"u1"');
    // هیچ پاسخِ خامی (total/correct/score/receipt) از DB بیرون نیامده
    expect(raw).not.toContain("correct");
    expect(raw).not.toContain("receipt");
  });

  it("learner: خرابیِ DB ⇒ 500 صادقِ فارسی", async () => {
    const dbmod = (await import("@/lib/db")) as unknown as { db: { learnerProfile: { findMany: ReturnType<typeof vi.fn> } } };
    dbmod.db.learnerProfile.findMany.mockRejectedValueOnce(new Error("db down"));
    const { GET } = await import("@/app/api/teacher/learner/route");
    const res = await GET(learnerUrl(learnerHandle("u1", "edu-1404")));
    expect(res.status).toBe(500);
  });
});

// ------------------------------------------------------------------
// ⑤ رجیستری + قفلهایِ ساختاری
// ------------------------------------------------------------------
describe("رجیستری و سیمکشیِ r353", () => {
  it("teacher_detail در نشست و ناوبری — رجیستریِ ۴۹ بیرهبر نیست", () => {
    expect(EVENT_NAMES).toContain("teacher_detail");
    expect(EVENT_LABELS_FA.teacher_detail).toBe("مشاهدهٔ جزئیاتِ یادگیرنده");
    expect(EVENT_CATEGORIES.teacher_detail).toBe("نشست و ناوبری");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
    expect(EVENT_LABELS_FA.teacher_detail).not.toMatch(/[,"\n]/); // قراردادِ بیویرگولِ CSV
  });

  it("قفلهایِ ساختاری: مرتبسازی، ردیفِ دکمهای، دیالوگ، مسیرِ handle", () => {
    const view = readFileSync(join(process.cwd(), "src/components/study/teacher/teacher-view.tsx"), "utf8");
    expect(view).toContain("sortRosterBy");
    expect(view).toContain('data-testid="teacher-sort"');
    expect(view).toContain("aria-pressed");
    expect(view).toContain('data-teacher-open="true"');
    expect(view).toContain("<TeacherDetailDialog");
    expect(view).toContain("handleDetailAuthError");
    const detail = readFileSync(join(process.cwd(), "src/components/study/teacher/teacher-detail.tsx"), "utf8");
    expect(detail).toContain('trackEvent("teacher_detail")');
    expect(detail).toContain("x-teacher-code");
    expect(detail).toContain("c-track-80"); // صفرهایِ واقعیِ نوارِ ۱۴روزه
    expect(detail).toContain("c-stone-60"); // زیرایِ ردیفهایِ مهارت/تلاش
    expect(detail).toContain("/api/teacher/learner?handle=");
    expect(detail).not.toContain("transition-[width]"); // قفلِ scoped-transitions
    const route = readFileSync(join(process.cwd(), "src/app/api/teacher/learner/route.ts"), "utf8");
    expect(route).toContain("timingSafeEqual");
    expect(route).toContain("TEACHER_ACCESS_CODE");
    expect(route).toContain("پنل معلم روی این سرور فعال نیست");
    expect(route).toContain("learnerHandle");
    expect(route).toContain("runtime = \"nodejs\"");
    const validate = readFileSync(join(process.cwd(), "src/lib/api/validate.ts"), "utf8");
    expect(validate).toContain("teacherLearnerQuerySchema");
    const cleanupScript = readFileSync(join(process.cwd(), "scripts/qa-db-cleanup-r101.cjs"), "utf8");
    expect(cleanupScript).toContain('"teacher_detail"'); // allowlistِ پاکسازی
  });
});

// ------------------------------------------------------------------
// ⑥ رندرِ نما — مرتبسازیِ زنده و دیالوگِ جزئیات
// ------------------------------------------------------------------
const learnerDetailPayload = {
  ok: true,
  windowDays: 14,
  learner: {
    name: "آرش", color: "emerald", joinedAt: iso(9 * 86_400_000),
    attempts: 2, avgPercent: 63, bestPercent: 80, lessons: 2, lastActive: iso(HOUR),
    byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: i === 13 ? 1 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i < 2 ? 1 : 0, avgPercent: i === 0 ? 80 : i === 1 ? 45 : null })),
    bySkill: [
      { category: "dictation", attempts: 1, avgPercent: 45, bestPercent: 45 },
      { category: "vocab", attempts: 1, avgPercent: 80, bestPercent: 80 },
    ],
    recent: [
      { category: "vocab", lesson: 1, percent: 80, createdAt: iso(HOUR) },
      { category: "dictation", lesson: 2, percent: 45, createdAt: iso(2 * HOUR) },
    ],
  },
};

const rosterPayload = (handles: boolean) => ({
  ok: true,
  generatedAt: new Date(now).toISOString(),
  summary: {
    learners: 3, attempts: 4, avgPercent: 73, last24h: 1,
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i === 0 ? 4 : 0, avgPercent: i === 0 ? 73 : null })),
  },
  roster: [
    { name: "آرش", color: "emerald", attempts: 3, avgPercent: 50, bestPercent: 60, lessons: 2, lastActive: iso(30 * HOUR), weakest: { category: "dictation", avgPercent: 45 }, ...(handles ? { handle: learnerHandle("u1", "edu-1404") } : {}) },
    { name: "سارا", color: "sky", attempts: 1, avgPercent: 90, bestPercent: 90, lessons: 1, lastActive: iso(2 * HOUR), weakest: null, ...(handles ? { handle: learnerHandle("u2", "edu-1404") } : {}) },
    { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null, ...(handles ? { handle: learnerHandle("u3", "edu-1404") } : {}) },
  ],
});

vi.mock("@/lib/study-store", () => ({
  useStudy: (sel: (s: { setView: (v: unknown) => void }) => unknown) => sel({ setView: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const stubFetchRouted = (learnerRes: (() => unknown) | null) => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (typeof url === "string" && url.includes("/api/teacher/learner")) {
      if (!learnerRes) return { ok: false, status: 500, statusText: "boom", json: async () => ({}) };
      return learnerRes();
    }
    return { ok: true, status: 200, json: async () => rosterPayload(true) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
};

describe("TeacherView — مرتبسازی و دیالوگِ جزئیات (r353)", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
    delete process.env.TEACHER_ACCESS_CODE;
  });

  const openReady = async () => {
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    const utils = render(<TeacherView />);
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
    return utils;
  };

  it("چهار چیپِ مرتبسازی؛ کلیکِ «میانگین» ترتیبِ DOM را قطعی عوض میکند", async () => {
    stubFetchRouted(null);
    const { getByTestId, getAllByTestId } = await openReady();
    const chips = getByTestId("teacher-sort");
    expect(chips.querySelectorAll("button")).toHaveLength(4);
    expect(getAllByTestId("teacher-row")[0].textContent).toContain("آرش"); // پیشفرض = فعالترین
    fireEvent.click(getByTestId("teacher-sort-avg"));
    await waitFor(() => expect(getAllByTestId("teacher-row")[0].textContent).toContain("سارا")); // ۹۰٪ اول
    expect(getByTestId("teacher-sort-avg").getAttribute("aria-pressed")).toBe("true");
  });

  it("ردیفِ دارایِ تلاش دکمهٔ جزئیات است؛ بیتلاش دکمه نیست — کلیک ⇒ دیالوگ + teacher_detail + واکشِ handle دار", async () => {
    const calls = stubFetchRouted(() => ({ ok: true, status: 200, json: async () => learnerDetailPayload }));
    const { getByTestId, getAllByTestId, getByText } = await openReady();
    const rows = getAllByTestId("teacher-row");
    expect(rows[0].getAttribute("data-teacher-open")).toBe("true"); // آرش
    expect(rows[2].getAttribute("data-teacher-open")).toBeNull(); // نگارِ بیتلاش
    const before = trackMock.mock.calls.length;
    fireEvent.click(rows[0]);
    await waitFor(() => expect(getByTestId("teacher-detail-dialog")).toBeDefined());
    await waitFor(() => expect(getByText("درسِ ۲")).toBeDefined()); // پوششِ درس‌ها رندر شد
    // رویدادِ تازه: teacher_detail (و فقط یکی)
    const detailCalls = trackMock.mock.calls.slice(before).filter((c: unknown[]) => c[0] === "teacher_detail");
    expect(detailCalls).toHaveLength(1);
    // واکش: handleِ آرش + کد در هدر
    const learnerCall = calls.find((c) => c.url.includes("/api/teacher/learner"));
    expect(learnerCall).toBeDefined();
    expect(learnerCall!.url).toContain(`handle=${learnerHandle("u1", "edu-1404")}`);
    expect((learnerCall!.init as { headers: Record<string, string> }).headers["x-teacher-code"]).toBe("edu-1404");
    // محتوا: ارقامِ فارسیِ میانگین + مهارتِ ضعیف اول + نوار
    expect(getAllByTestId("teacher-row")[0].textContent).not.toContain(learnerHandle("u1", "edu-1404")); // handle هرگز متنِ ردیف نیست
    expect(getByTestId("teacher-detail-skills").textContent).toContain("دیکته");
  });

  it("404ِ جزئیات ⇒ «یافت نشد» بدونِ دکمهٔ تلاشِ دوباره (تکرارِ همان handle کمکی نمیکند)", async () => {
    stubFetchRouted(() => ({ ok: false, status: 404, json: async () => ({ ok: false, error: "یادگیرندهٔ موردنظر یافت نشد — شاید کدِ دسترسی عوض شده باشد؛ فهرست را تازه کن." }) }));
    const { getByTestId, getAllByTestId } = await openReady();
    fireEvent.click(getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(getByTestId("teacher-detail-missing")).toBeDefined());
    expect(getByTestId("teacher-detail-missing").textContent).toContain("یافت نشد");
    expect(getByTestId("teacher-detail-dialog").querySelector("button")).toBeDefined(); // فقط دکمهٔ بستنِ Radix
  });

  it("شکستِ شبکه ⇒ retry دارد و واکشِ دوم میزند", async () => {
    const calls = stubFetchRouted(() => { throw new TypeError("r353-net"); });
    const { getByTestId, getAllByTestId, getByText } = await openReady();
    fireEvent.click(getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(getByTestId("teacher-detail-net")).toBeDefined());
    const afterFail = calls.length;
    fireEvent.click(getByText("تلاش دوباره"));
    await waitFor(() => expect(calls.length).toBeGreaterThan(afterFail));
  });

  it("403 در دیالوگ ⇒ کدِ کهنه بیاعتبار و نما به گیت برمیگردد (سیمکشیِ onAuthError)", async () => {
    stubFetchRouted(() => ({ ok: false, status: 403, json: async () => ({ ok: false, error: "کد دسترسی نادرست است." }) }));
    const { getByTestId, getAllByTestId } = await openReady();
    expect(sessionStorage.getItem("vision2-teacher-code")).toBe("edu-1404");
    fireEvent.click(getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(getByTestId("teacher-gate")).toBeDefined());
    expect(sessionStorage.getItem("vision2-teacher-code")).toBeNull(); // کدِ منقضی بیرون کشیده شد
  });
});
