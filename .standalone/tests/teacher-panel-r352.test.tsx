// @vitest-environment jsdom
// ------------------------------------------------------------------
// r352 — «پنلِ معلم» — فهرستِ کلاس، گامِ نخستِ teacher panel:
//   ① گیتِ مسیر: بی‌کدِ محیطی ⇒ 404 صادق («فعال نیست»)؛ کدِ غلط ⇒ 401؛
//     کدِ درست ⇒ گزارشِ کامل. مقایسه timing-safe روی هش (طول هم لو نمیرود).
//   ② موتورِ خالص: buildByDay (صفرهای واقعی)، pickWeakest (قطعی)،
//     sortRoster (تلاش نزولی/میانگین/نام)، assembleReport (بیتلاش =
//     null نه صفرِ ساختگی؛ پوششِ ۱..۱۲).
//   ③ حریم: هیچ userId و secretی در payload نیست — قفلِ ساختاری.
//   ④ CSV: روزنامهٔ کلاس — sanitationِ نام (ورودیِ کاربر!) + سلولِ خالی
//     برایِ بیتلاش + COU سبز/سرخ (idiomِ r344).
//   ⑤ سیمکشی: unionِ View + lazy + رندر + ردیفِ تنظیمات + فرمانیاب +
//     رجیستری (۴۸ رویداد) + گیتِ نما.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import TeacherView from "@/components/study/teacher/teacher-view";
import { assembleReport, buildByDay, pickWeakest, sortRoster, lastActiveFa, type RosterRow } from "@/lib/teacher-report";
import { buildClassCsv, downloadClassCsv, csvSafe, CLASS_CSV_COLUMNS } from "@/lib/teacher-csv";
import { EVENT_NAMES, EVENT_LABELS_FA, EVENT_CATEGORIES } from "@/lib/analytics-events";

const HOUR = 3600 * 1000;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString().slice(0, 10);

// ------------------------------------------------------------------
// ① مسیر — گیت و گزارش
// ------------------------------------------------------------------
const dayRows = new Map<string, unknown>();
vi.mock("@/lib/db", () => ({
  db: {
    learnerProfile: {
      findMany: vi.fn(async () => dayRows.get("profiles") ?? []),
    },
    quizAttempt: {
      groupBy: vi.fn(async (args: { by: string[] }) => {
        const key = args.by.join(",");
        if (key === "userId") return dayRows.get("byUser") ?? [];
        if (key === "lesson") return dayRows.get("byLesson") ?? [];
        if (key === "userId,lesson") return dayRows.get("userLesson") ?? [];
        if (key === "userId,category") return dayRows.get("userCategory") ?? [];
        return [];
      }),
      aggregate: vi.fn(async () => dayRows.get("total") ?? { _count: { _all: 0 }, _avg: { percent: null } }),
      findMany: vi.fn(async () => dayRows.get("rows") ?? []),
      count: vi.fn(async () => (dayRows.get("last24h") as number) ?? 0),
    },
  },
}));

const getReq = (headers: Record<string, string> = {}) =>
  ({ method: "GET", headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } }) as unknown as NextRequest;

const setEnv = (v: string | undefined) => {
  if (v === undefined) delete process.env.TEACHER_ACCESS_CODE;
  else process.env.TEACHER_ACCESS_CODE = v;
};

describe("GET /api/teacher/report — گیت و گزارش", () => {
  beforeEach(() => {
    dayRows.clear();
    setEnv("edu-1404");
  });
  afterEach(() => {
    setEnv(undefined);
  });

  it("بی‌کدِ محیطی ⇒ 404 صادق «پنل معلم فعال نیست» — حتی با هر هدری", async () => {
    setEnv(undefined);
    const { GET } = await import("@/app/api/teacher/report/route");
    const res = await GET(getReq({ "x-teacher-code": "anything" }));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code?: string; error?: string };
    expect(body.code).toBe("not_found");
    expect(body.error).toContain("فعال نیست");
  });

  it("کدِ غلط و هدرِ غایب ⇒ 403 «کد دسترسی نادرست است» (قراردادِ خانه: unauthorized=403)", async () => {
    const { GET } = await import("@/app/api/teacher/report/route");
    for (const headers of [{ "x-teacher-code": "wrong" }, {} as Record<string, string>, { "x-teacher-code": "  " }]) {
      const res = await GET(getReq(headers));
      expect(res.status).toBe(403);
      const body = (await res.json()) as { error?: string };
      expect(body.error).toContain("نادرست");
    }
  });

  it("کدِ درست ⇒ شکلِ کامل — فهرستِ مرتب، بیتلاش = null، پوششِ ۱..۱۲، حریمِ payload", async () => {
    dayRows.set("profiles", [
      { userId: "u1", name: "آرش", color: "emerald" },
      { userId: "u2", name: "سارا", color: "sky" },
      { userId: "u3", name: "نگار", color: "violet" },
    ]);
    dayRows.set("byUser", [
      { userId: "u1", _count: { _all: 3 }, _avg: { percent: 83.4 }, _max: { percent: 95 } },
      { userId: "u2", _count: { _all: 1 }, _avg: { percent: 40 }, _max: { percent: 40 } },
    ]);
    dayRows.set("total", { _count: { _all: 4 }, _avg: { percent: 72.5 } });
    dayRows.set("byLesson", [{ lesson: 2, _count: { _all: 4 }, _avg: { percent: 72.5 } }]);
    dayRows.set("userLesson", [
      { userId: "u1", lesson: 1, _count: { _all: 1 } },
      { userId: "u1", lesson: 2, _count: { _all: 2 } },
      { userId: "u2", lesson: 2, _count: { _all: 1 } },
    ]);
    dayRows.set("userCategory", [
      { userId: "u1", category: "vocab", _avg: { percent: 90 } },
      { userId: "u1", category: "dictation", _avg: { percent: 70 } },
      { userId: "u2", category: "listening", _avg: { percent: 40 } },
    ]);
    // روزهایِ قطعی: دو تلاشِ «امروز» (now خودش امروز است) + روزِ ۳ و ۴ با ظهرِ UTC
    dayRows.set("rows", [
      { userId: "u1", category: "vocab", createdAt: new Date(now) },
      { userId: "u1", category: "dictation", createdAt: new Date(now) },
      { userId: "u1", category: "vocab", createdAt: new Date(`${day(3)}T12:00:00Z`) },
      { userId: "u2", category: "listening", createdAt: new Date(`${day(4)}T12:00:00Z`) },
    ]);
    dayRows.set("last24h", 2);

    const { GET } = await import("@/app/api/teacher/report/route");
    const res = await GET(getReq({ "x-teacher-code": "edu-1404" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean; generatedAt: string;
      summary: { learners: number; attempts: number; avgPercent: number; last24h: number; byDay: { day: string; attempts: number }[]; byLesson: { lesson: number; attempts: number; avgPercent: number | null }[] };
      roster: RosterRow[];
    };
    expect(body.ok).toBe(true);
    expect(body.summary.learners).toBe(3);
    expect(body.summary.attempts).toBe(4);
    expect(body.summary.avgPercent).toBe(73);
    expect(body.summary.last24h).toBe(2);
    // نوار: ۷ روز با صفرهای واقعی — امروز ۲، دیروز ۰، ۳روزِ پیش ۱
    const byDay = Object.fromEntries(body.summary.byDay.map((d) => [d.day, d.attempts]));
    expect(body.summary.byDay).toHaveLength(7);
    expect(byDay[day(0)]).toBe(2);
    expect(byDay[day(1)]).toBe(0);
    expect(byDay[day(3)]).toBe(1);
    // پوشش: درسِ ۲ لمسشده، درسِ ۱ هم، بقیهٔ ۱..۱۲ صفرِ واقعی
    expect(body.summary.byLesson).toHaveLength(12);
    const l2 = body.summary.byLesson.find((l) => l.lesson === 2)!;
    expect(l2.attempts).toBe(4);
    expect(l2.avgPercent).toBe(73);
    const l5 = body.summary.byLesson.find((l) => l.lesson === 5)!;
    expect(l5.attempts).toBe(0);
    expect(l5.avgPercent).toBeNull();
    // فهرست: تلاش نزولی ⇒ آرش، سارا، نگار؛ بیتلاش «—» دارد نه صفر
    expect(body.roster.map((r) => r.name)).toEqual(["آرش", "سارا", "نگار"]);
    const arash = body.roster[0];
    expect(arash.attempts).toBe(3);
    expect(arash.avgPercent).toBe(83);
    expect(arash.bestPercent).toBe(95);
    expect(arash.lessons).toBe(2);
    expect(arash.weakest).toEqual({ category: "dictation", avgPercent: 70 });
    expect(arash.lastActive).toBe(new Date(now).toISOString());
    const negar = body.roster[2];
    expect(negar.attempts).toBe(0);
    expect(negar.avgPercent).toBeNull();
    expect(negar.bestPercent).toBeNull();
    expect(negar.lastActive).toBeNull();
    expect(negar.weakest).toBeNull();
    // حریم: هیچ userId و secretی در payload نیست
    expect(JSON.stringify(body)).not.toContain("userId");
    expect(JSON.stringify(body)).not.toContain('"u1"');
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("خرابیِ DB ⇒ 500 صادقِ فارسی", async () => {
    const dbmod = (await import("@/lib/db")) as unknown as { db: { learnerProfile: { findMany: ReturnType<typeof vi.fn> } } };
    dbmod.db.learnerProfile.findMany.mockRejectedValueOnce(new Error("db down"));
    const { GET } = await import("@/app/api/teacher/report/route");
    const res = await GET(getReq({ "x-teacher-code": "edu-1404" }));
    expect(res.status).toBe(500);
  });
});

// ------------------------------------------------------------------
// ② موتورِ خالص
// ------------------------------------------------------------------
describe("موتورِ teacher-report", () => {
  it("buildByDay: صفرهای واقعی، پنجرهٔ دقیق، مرتبِ کهنه→امروز", () => {
    // r363 — فیکسچرِ «امروز» قطعی: ظهرِ UTCِ خودِ now — iso(2h) در سوتِ
    // ۰۰:۰۰–۰۲:۰۰ UTC از نیمه‌شب میگذشت و به دیروز میافتاد (باگِ قطعیت)
    const rows = [new Date(`${day(0)}T12:00:00Z`), iso(3 * 86_400_000), iso(40 * 86_400_000)];
    const out = buildByDay(rows, now);
    expect(out).toHaveLength(7);
    expect(out[6].day).toBe(day(0));
    expect(out[6].attempts).toBe(1);
    expect(out[3].attempts).toBe(1); // ۳روزِ پیش = اندیسِ ۳ (کهنه→امروز)
    expect(out[5].attempts).toBe(0);
    expect(out[0].attempts).toBe(0); // ۴۰ روزِ پیش بیرونِ پنجره — صفرِ واقعی
  });

  it("pickWeakest: کمترینِ میانگین، تساوی ⇒ نامِ صعودی (قطعی)", () => {
    expect(pickWeakest([])).toBeNull();
    expect(pickWeakest([
      { userId: "u", category: "vocab", avgPercent: 80 },
      { userId: "u", category: "dictation", avgPercent: 55 },
      { userId: "u", category: "grammar", avgPercent: 55 },
    ])).toEqual({ category: "dictation", avgPercent: 55 });
  });

  it("sortRoster: تلاش نزولی، میانگین نزولی، نام — قطعی", () => {
    const rows: RosterRow[] = [
      { name: "ب", color: "emerald", attempts: 2, avgPercent: 50, bestPercent: 50, lessons: 1, lastActive: null, weakest: null },
      { name: "آ", color: "emerald", attempts: 2, avgPercent: 70, bestPercent: 70, lessons: 1, lastActive: null, weakest: null },
      { name: "پ", color: "emerald", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
      { name: "ت", color: "emerald", attempts: 5, avgPercent: 10, bestPercent: 10, lessons: 2, lastActive: null, weakest: null },
    ];
    expect(sortRoster(rows).map((r) => r.name)).toEqual(["ت", "آ", "ب", "پ"]);
  });

  it("lastActiveFa: همین حالا / ساعت / روز / هرگز + زباله = هرگز", () => {
    expect(lastActiveFa(iso(5 * 60_000), now)).toBe("همین حالا");
    expect(lastActiveFa(iso(5 * HOUR), now)).toBe("۵ ساعت پیش");
    expect(lastActiveFa(iso(3 * 86_400_000), now)).toBe("۳ روز پیش");
    expect(lastActiveFa(null, now)).toBe("هرگز");
    expect(lastActiveFa("garbage", now)).toBe("هرگز");
  });
});

// ------------------------------------------------------------------
// ③ CSV — روزنامهٔ کلاس
// ------------------------------------------------------------------
const rosterFixture: RosterRow[] = [
  {
    name: 'آرش, "طلا",\nدو', // بدترینِ نامِ ممکن — sanitation اجباری
    color: "emerald",
    attempts: 3,
    avgPercent: 83,
    bestPercent: 95,
    lessons: 2,
    lastActive: iso(1 * HOUR),
    weakest: { category: "dictation", avgPercent: 70 },
  },
  { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
];

describe("teacher-csv — روزنامهٔ کلاس", () => {
  it("سرستون + sanitationِ نام + سلولِ خالی برایِ بیتلاش + ISOِ پایدار", () => {
    const csv = buildClassCsv(rosterFixture);
    const lines = csv.split("\r\n").filter((l) => l.length > 0);
    expect(lines[0]).toBe(CLASS_CSV_COLUMNS.join(","));
    expect(lines[1].startsWith("آرش طلادو,")).toBe(true); // ویرگول/نقل/شکستِ خط بیرونکشی‌شده
    expect(lines[1]).toContain(",83,95,2,");
    expect(lines[1]).toContain(`,${iso(1 * HOUR)},`); // ISOِ پایدار — نه «۳ ساعت پیش»یِ کهنهشونده
    // r377 — ستونِ «فعال در ۲۴ ساعت» رسید: نگار بیتلاش ⇒ خالیِ صادق (۴ خالی)
    expect(lines[2]).toBe("نگار,violet,0,,,0,,,"); // تلاش/درسها صفرِ واقعی؛ میانگین/بهترین/آخرین/۲۴ساعت/ضعیفترین خالیِ صادق
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n"); // هیچ LFِ لخت
  });

  it("csvSafe: ویرگول/نقل‌قول/CR/LF را بیرون میکشد", () => {
    expect(csvSafe('a,b"c\nd\r\ne')).toBe("abcde");
    expect(csvSafe("  سارا  ")).toBe("سارا");
  });

  const originalCOU = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;
  afterEach(() => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
  });

  it("COU سبز: لنگرِ vision2-class-<روز>.csv", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r352", writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return el; }) as typeof document.body.appendChild;
    try {
      expect(downloadClassCsv(rosterFixture, "2026-10-23")).toBe(true);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === "vision2-class-2026-10-23.csv");
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = orig;
    }
  });

  it("COU سرخ: false و بدونِ هیچ لنگری", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => { throw new TypeError("r352-cou"); },
      writable: true, configurable: true,
    });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return el; }) as typeof document.body.appendChild;
    try {
      expect(downloadClassCsv(rosterFixture, "2026-10-23")).toBe(false);
      expect(appended).toHaveLength(0);
    } finally {
      document.body.appendChild = orig;
    }
  });
});

// ------------------------------------------------------------------
// ④ رجیستری و سیمکشیِ ساختاری
// ------------------------------------------------------------------
describe("رجیستری و سیمکشیِ r352", () => {
  it("teacher_open در نشست و ناوبری، teacher_csv در خروجی و هم‌رسانی — رجیستریِ ۴۸ بیرهبر نیست", () => {
    expect(EVENT_NAMES).toContain("teacher_open");
    expect(EVENT_NAMES).toContain("teacher_csv");
    expect(EVENT_LABELS_FA.teacher_open).toBe("بازکردنِ پنلِ معلم");
    expect(EVENT_LABELS_FA.teacher_csv).toBe("خروجی CSV روزنامهٔ کلاس");
    expect(EVENT_CATEGORIES.teacher_open).toBe("نشست و ناوبری");
    expect(EVENT_CATEGORIES.teacher_csv).toBe("خروجی و هم‌رسانی");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("unionِ View + lazy + رندرِ study-app", () => {
    const types = readFileSync(join(process.cwd(), "src/state/types.ts"), "utf8");
    expect(types).toContain('| { type: "teacher" }');
    const app = readFileSync(join(process.cwd(), "src/components/study/study-app.tsx"), "utf8");
    expect(app).toContain('lazyView(() => import("./teacher/teacher-view"))');
    expect(app).toContain('{view.type === "teacher" && <TeacherView />}');
  });

  it("ردیفِ تنظیمات + فرمانیابِ سه‌نقطه + گیتِ نما", () => {
    const settings = readFileSync(join(process.cwd(), "src/components/study/shared/settings-popover.tsx"), "utf8");
    expect(settings).toContain("پنلِ معلم");
    expect(settings).toContain('setView({ type: "teacher" })');
    const palette = readFileSync(join(process.cwd(), "src/components/study/shell/command-palette.tsx"), "utf8");
    expect(palette).toContain('id: "nav-teacher"');
    expect(palette.match(/case "nav-teacher"/g)?.length).toBe(2); // اجرا + آیکون
    const view = readFileSync(join(process.cwd(), "src/components/study/teacher/teacher-view.tsx"), "utf8");
    expect(view).toContain('sessionStorage'); // کد فقط در تبِ معلم — نه حافظهٔ دائم
    expect(view).toContain('type="password"');
    expect(view).toContain('"vision2-teacher-code"');
    expect(view).toContain("trackEvent(\"teacher_open\")");
    expect(view).toContain("c-stone-60"); // زیرایِ فهرست — از قفلهایِ خانه
    expect(view).toContain("c-track-80"); // صفرهایِ واقعیِ نوار
    // مسیر: مقایسهٔ timing-safe روی هش + گیتِ محیطی
    const route = readFileSync(join(process.cwd(), "src/app/api/teacher/report/route.ts"), "utf8");
    expect(route).toContain("timingSafeEqual");
    expect(route).toContain("TEACHER_ACCESS_CODE");
    expect(route).toContain("پنل معلم روی این سرور فعال نیست");
  });
});

// ------------------------------------------------------------------
// ⑤ رندرِ نما — گیت و حالتهایِ صادق
// ------------------------------------------------------------------
vi.mock("@/lib/study-store", () => ({
  useStudy: (sel: (s: { setView: (v: unknown) => void }) => unknown) =>
    sel({ setView: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("TeacherView — گیت، ۴۰۴، فهرستِ زنده", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
    delete process.env.TEACHER_ACCESS_CODE;
  });

  it("بدونِ کد ⇒ گیت با inputِ password و دکمهٔ غیرفعال", () => {
    const { getByTestId } = render(<TeacherView />);
    expect(getByTestId("teacher-gate")).toBeDefined();
    expect(getByTestId("teacher-code-input").getAttribute("type")).toBe("password");
  });

  it("404 ⇒ صفحهٔ صادقِ «فعال نیست» — بدونِ تلاشِ دوباره", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ status: 404, ok: false })));
    const { getByTestId } = render(<TeacherView />);
    fireEvent.change(getByTestId("teacher-code-input"), { target: { value: "some-code" } });
    fireEvent.submit(getByTestId("teacher-code-input").closest("form")!);
    await waitFor(() => expect(getByTestId("teacher-disabled")).toBeDefined());
  });

  it("کدِ ذخیرهشده ⇒ واکشِ خودکار ⇒ فهرستِ زنده با «—» و ارقامِ فارسی", async () => {
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        generatedAt: new Date(now).toISOString(),
        summary: {
          learners: 2, attempts: 1, avgPercent: 73, last24h: 1,
          byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
          byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i === 0 ? 1 : 0, avgPercent: i === 0 ? 73 : null })),
        },
        roster: [
          { name: "آرش", color: "emerald", attempts: 1, avgPercent: 73, bestPercent: 73, lessons: 1, lastActive: iso(2 * HOUR), weakest: { category: "dictation", avgPercent: 73 } },
          { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
        ],
      }),
    })));
    const { getByTestId, getAllByTestId } = render(<TeacherView />);
    await waitFor(() => expect(getByTestId("teacher-ready")).toBeDefined());
    const rows = getAllByTestId("teacher-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain("آرش");
    expect(rows[0].textContent).toContain("۷۳٪");
    expect(rows[1].textContent).toContain("—"); // بیتلاش
    // کد در هدر رفته باشد
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers["x-teacher-code"]).toBe("edu-1404");
  });
});
