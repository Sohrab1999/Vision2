// @vitest-environment jsdom
// ------------------------------------------------------------------
// r350 — «نبضِ کامل» (the full pulse dashboard) — audit bottleneck ④:
// the F10 pipeline had NO human surface beyond the settings top-6 glimpse.
//
// Contracts locked here:
//   • GET /api/event WITHOUT ?days stays BYTE-IDENTICAL to the F10
//     contract (events + updatedAt, NO series field) — the frozen
//     settings-pulse consumer never re-parses
//   • GET /api/event?days=N adds series: real days only (archive
//     sentinel excluded), window math exact, garbage ⇒ 400 validation
//   • GET /api/client-error — the watchtower: {ok, count, last?} from
//     the live JSONL; missing file ⇒ count:0 (honest zero, not error);
//     a torn last line degrades last (not the count)
//   • the dashboard: six families from the EVENT_CATEGORIES single
//     truth, zeros are real zeros, watchtower zero/amber states,
//     pulse_open fires once per open, Persian digits
//   • the registry map is TOTAL (45 names) and the display order
//     covers every distinct family — registry drift cannot compile
//     AND cannot slip past these locks
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { NextRequest } from "next/server";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

// ---------------------------------------------------------------
// دروازههایِ آزمون: EventDay درونحافظهای — دیتابیسِ واقعی هرگز
// ---------------------------------------------------------------
const dayRows = new Map<string, number>(); // key: `${day}|${name}`

const groupByMock = vi.fn(async (args: { by: string[]; where?: Record<string, unknown> }) => {
  const sums = new Map<string, number>();
  for (const [key, count] of dayRows) {
    const [day, name] = key.split("|");
    if (args.where) {
      const w = args.where as { day?: { gte?: string; lt?: string; not?: string } };
      const wd = w.day;
      if (wd?.lt && day >= wd.lt) continue;
      if (wd?.gte && day < wd.gte) continue;
      if (wd?.not && day === wd.not) continue;
    }
    sums.set(name, (sums.get(name) ?? 0) + count);
  }
  return [...sums.entries()].map(([name, _sum]) => ({ name, _sum: { count: _sum } }));
});

const findManyMock = vi.fn(async (args: { where?: { day?: { gte?: string; lt?: string; not?: string } } }) => {
  const wd = args.where?.day;
  if (wd?.lt) return []; // rotation finds nothing old — archive stays quiet
  const out: { day: string; name: string; count: number }[] = [];
  for (const [key, count] of dayRows) {
    const [day, name] = key.split("|");
    if (wd?.gte && day < wd.gte) continue;
    if (wd?.not && day === wd.not) continue;
    out.push({ day, name, count });
  }
  out.sort((a, b) => (a.day === b.day ? (a.name < b.name ? -1 : 1) : a.day < b.day ? -1 : 1));
  return out;
});

vi.mock("@/lib/db", () => ({
  db: {
    eventDay: {
      groupBy: groupByMock,
      findMany: findManyMock,
      upsert: vi.fn(async () => undefined),
      deleteMany: vi.fn(async () => undefined),
    },
  },
}));

const getReq = (url: string) =>
  ({ method: "GET", headers: { get: () => null }, nextUrl: new URL(url) }) as unknown as NextRequest;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

// ---------------------------------------------------------------
// ① GET /api/event — قراردادِ منجمدِ F10 + سریِ اختیاریِ r350
// ---------------------------------------------------------------
describe("GET /api/event — the frozen F10 shape and the opt-in series", () => {
  beforeEach(() => {
    dayRows.clear();
    groupByMock.mockClear();
    findManyMock.mockClear();
  });

  it("بدونِ ?days شکلِ پاسخ دستنخورده میماند — events + updatedAt و هیچ series", async () => {
    dayRows.set(`${today()}|app_open`, 3);
    const { GET } = await import("@/app/api/event/route");
    const res = await GET(getReq("http://local/api/event"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { events: unknown[]; updatedAt: string; series?: unknown };
    expect(body.events.length).toBe(1);
    expect(typeof body.updatedAt).toBe("string");
    expect(body.series).toBeUndefined(); // the frozen consumer's contract
  });

  it("?days=7 سریِ میدهد — فقط روزهایِ واقعی، archive بیرون، پنجرهٔ دقیق", async () => {
    dayRows.set(`${today()}|quiz_done`, 5);
    dayRows.set(`${daysAgo(2)}|lesson_open`, 2);
    dayRows.set(`${daysAgo(9)}|app_open`, 1); // outside the 7-day window
    dayRows.set("archive|app_open", 99); // sentinel must NEVER appear
    const { GET } = await import("@/app/api/event/route");
    const res = await GET(getReq("http://local/api/event?days=7"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      events: { name: string; total: number }[];
      series: { day: string; name: string; count: number }[];
    };
    expect(body.series).toBeDefined();
    // پنجرهٔ ۷روزه — ردیفِ ۹روزِ پیش نیست
    expect(body.series.some((r) => r.day === daysAgo(9))).toBe(false);
    // بایگانی هرگز داخلِ سری نمیآید
    expect(body.series.every((r) => r.day !== "archive")).toBe(true);
    // روزها صعودی
    const days = body.series.map((r) => r.day);
    expect([...days].sort()).toEqual(days);
    // کلِ همهزمانی (شاملِ بایگانی) در events میماند — دقیق برایِ همیشه
    const appOpen = body.events.find((e) => e.name === "app_open");
    expect(appOpen?.total).toBe(100); // 1 (real) + 99 (archive)
  });

  it("پارامترِ زباله ⇒ ۴۰۰ اعتبارسنجی (زودوپساندِ ۳۱ و صفر هم)", async () => {
    const { GET } = await import("@/app/api/event/route");
    for (const bad of ["days=garbage", "days=31", "days=0", "days=2.5"]) {
      const res = await GET(getReq(`http://local/api/event?${bad}`));
      expect(res.status, bad).toBe(400);
    }
  });
});

// ---------------------------------------------------------------
// ② GET /api/client-error — برجِ مراقبت
// ---------------------------------------------------------------
describe("GET /api/client-error — the watchtower read", () => {
  const tmpLog = join(process.cwd(), ".tmp-client-errors-r350.log");

  beforeEach(() => {
    vi.stubEnv("CLIENT_ERROR_LOG", tmpLog);
    try {
      unlinkSync(tmpLog);
    } catch {
      /* first run */
    }
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    try {
      unlinkSync(tmpLog);
    } catch {
      /* already gone */
    }
  });

  it("فایلِ غایب ⇒ شمارشِ صفرِ صادق (نه خطا)", async () => {
    const { GET } = await import("@/app/api/client-error/route");
    const res = await GET(getReq("http://local/api/client-error"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; count: number; last?: unknown };
    expect(body.ok).toBe(true);
    expect(body.count).toBe(0);
    expect(body.last).toBeUndefined();
  });

  it("ردیفها ⇒ count + آخرین نان (kind/message/view) از JSONLِ زنده", async () => {
    writeFileSync(
      tmpLog,
      JSON.stringify({ at: "2026-10-23T10:00:00Z", kind: "error", message: "ChunkLoadError old", view: "home" }) +
        "\n" +
        JSON.stringify({ at: "2026-10-23T11:30:00Z", kind: "rejection", message: "Failed to load chunk 964893", view: "home" }) +
        "\n",
      "utf8"
    );
    const { GET } = await import("@/app/api/client-error/route");
    const res = await GET(getReq("http://local/api/client-error"));
    const body = (await res.json()) as {
      ok: boolean;
      count: number;
      last?: { kind: string; message: string; view: string };
    };
    expect(body.ok).toBe(true);
    expect(body.count).toBe(2);
    expect(body.last?.kind).toBe("rejection");
    expect(body.last?.message).toContain("964893");
    expect(body.last?.view).toBe("home");
  });

  it("آخرین خطِ پاره (برشِ وسطِ نوشتن) count را صادق نگه میدارد و last را نمیسازد", async () => {
    writeFileSync(
      tmpLog,
      JSON.stringify({ at: "2026-10-23T10:00:00Z", kind: "error", message: "whole line" }) +
        "\n" +
        '{"at":"2026-10-23T11:00:0', // torn
      "utf8"
    );
    const { GET } = await import("@/app/api/client-error/route");
    const res = await GET(getReq("http://local/api/client-error"));
    const body = (await res.json()) as { ok: boolean; count: number; last?: unknown };
    expect(body.ok).toBe(true);
    expect(body.count).toBe(2);
    expect(body.last).toBeUndefined();
  });
});

// ---------------------------------------------------------------
// ③ رجیستریِ دستهها — تکحقیقتِ کامل و بیرهبر
// ---------------------------------------------------------------
describe("EVENT_CATEGORIES — the single truth is total and orphan-free", () => {
  it("هر ۴۵ رویداد دسته دارند و ترتیبِ نمایش همهٔ خانوادهها را میپوشاند", async () => {
    const { EVENT_NAMES, EVENT_CATEGORIES, EVENT_CATEGORY_ORDER } = await import("@/lib/analytics-events");
    expect(EVENT_NAMES).toContain("pulse_open");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
    for (const name of EVENT_NAMES) {
      expect(typeof EVENT_CATEGORIES[name], name).toBe("string");
    }
    const distinct = [...new Set(Object.values(EVENT_CATEGORIES))];
    expect(distinct.length).toBe(EVENT_CATEGORY_ORDER.length);
    for (const cat of distinct) {
      expect(EVENT_CATEGORY_ORDER, cat).toContain(cat);
    }
  });
});

// ---------------------------------------------------------------
// ④ داشبورد — شش خانواده، برجِ مراقبت، نوارِ هفتروزه، صادقینگاری
// ---------------------------------------------------------------
describe("PulseDashboard — the human surface", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const eventsPayload = {
    events: [
      { name: "app_open", label: "بازکردن وب‌کتاب", total: 30, week: 9 },
      { name: "lesson_open", label: "بازکردن درس", total: 22, week: 7 },
      { name: "duel_done", label: "پایانِ نبرد", total: 12, week: 4 },
      { name: "rush_done", label: "پایانِ مسابقهٔ برق‌آسا", total: 8, week: 3 },
      { name: "quiz_done", label: "آزمون کوتاه", total: 41, week: 11 },
      { name: "explain_generated", label: "تولیدِ توضیحِ هوشمند", total: 6, week: 2 },
      { name: "anki_export", label: "خروجی Anki", total: 3, week: 1 },
    ],
    series: [
      { day: daysAgo(1), name: "app_open", count: 4 },
      { day: today(), name: "app_open", count: 2 },
      { day: today(), name: "quiz_done", count: 7 },
    ],
    updatedAt: `${today()}T12:34:00.000Z`,
  };

  const wire = (eventsBody: unknown = eventsPayload, wtBody: unknown = { ok: true, count: 0 }, xBody: unknown = { ok: true, used: 0, cap: 3000 }) => {
    // r355 — قراردادِ نبض بزرگتر شد: load حالا بودجهٔ توضیحِ هوشمند را هم
    // میخواند (سه واکش بهازایِ هر بازشدن) — پینِ «دو واکش» با اعلان به ۳ نقل شد
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes("/api/client-error")) {
          return new Response(JSON.stringify(wtBody), { status: 200 });
        }
        if (u.includes("/api/explain/usage")) {
          return new Response(JSON.stringify(xBody), { status: 200 });
        }
        return new Response(JSON.stringify(eventsBody), { status: 200 });
      }))
    );
  };

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("① بازشدن ⇒ pulse_open یکبار + شش خانوادهٔ دارایِ ردیف + ارقامِ فارسی", async () => {
    wire();
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { trackEvent } = await import("@/lib/analytics");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(7));
    expect(trackEvent).toHaveBeenCalledWith("pulse_open");
    // خانوادههایِ بدونِ ردیف حذف میشوند (خانوادههایِ خالی جعل نمیشوند)
    expect(screen.getByText("یادگیری و تمرین")).toBeTruthy();
    expect(screen.getByText("نبرد و مسابقه")).toBeTruthy();
    expect(screen.getByText("هوش مصنوعی")).toBeTruthy();
    expect(screen.getByText("خروجی و هم‌رسانی")).toBeTruthy();
    expect(screen.getByText("نشست و ناوبری")).toBeTruthy();
    expect(screen.queryByText("همگام‌سازی و نصب")).toBeNull();
    // ارقامِ فارسی — کلِ ۴۱ آزمونک
    expect(screen.getByText("۴۱")).toBeTruthy();
  });

  it("② برجِ مراقبت — صفرِ صادق: کارتِ زمردیِ «بدونِ خطا»", async () => {
    wire(eventsPayload, { ok: true, count: 0 });
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("بدونِ خطایِ ثبت‌شده")).toBeTruthy());
    expect(screen.getByText(/هیچ کرشی از هیچ دستگاهی گزارش نشده است/)).toBeTruthy();
  });

  it("③ برجِ مراقبت — نان‌ها ⇒ کارتِ کهربایی + آخرین نان با kind و view", async () => {
    wire(
      eventsPayload,
      { ok: true, count: 2, last: { at: "2026-10-23T11:30:00Z", kind: "rejection", message: "Failed to load chunk", view: "home" } }
    );
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("۲ نانِ خطا رویِ این سرور")).toBeTruthy());
    expect(screen.getByText(/وعدهٔ ناکام · home — Failed to load chunk/)).toBeTruthy();
  });

  it("④ نوارِ هفتروزه — روزِ بیرونِ سری صفرِ واقعی است و امروز برجسته", async () => {
    wire();
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("هفت روزِ گذشته — همهٔ رویدادها")).toBeTruthy());
    // سری فقط دیروز(۴) و امروز(۲+۷=۹) دارد — بقیهٔ ستونها صفرند
    expect(screen.getByText("۹")).toBeTruthy();
    expect(screen.getByText("امروز")).toBeTruthy();
    expect(screen.getByText("دیروز")).toBeTruthy();
  });

  it("⑤ شکستِ شبکه ⇒ پیامِ صادقِ در دسترس نیست (بدونِ عددِ جعلی)", async () => {
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async () => new Response("{}", { status: 500 })))
    );
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("نبضِ زنده در دسترس نیست — بعداً تلاش کن.")).toBeTruthy());
    expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(0);
  });

  it("⑥ سرورِ بیفعالیت ⇒ حالتِ خالیِ صادق", async () => {
    wire({ events: [], updatedAt: `${today()}T12:00:00.000Z` }, { ok: true, count: 0 });
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render, screen, waitFor } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("هنوز فعالیتی ثبت نشده — اولین نفر باش!")).toBeTruthy());
  });
});

// ---------------------------------------------------------------
// ⑤ قفلهایِ ساختاریِ سیمکشی
// ---------------------------------------------------------------
describe("PulseDashboard — structural locks", () => {
  it("⑦ تنظیمات دکمهٔ «نبضِ کامل» دارد و دیالوگ را سیمکشی کرده", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/shared/settings-popover.tsx"), "utf8");
    expect(src).toContain('import PulseDashboard from "./pulse-dashboard"');
    expect(src).toContain("نبضِ کامل");
    expect(src).toContain("setPulseOpen(true)");
    expect(src).toContain("<PulseDashboard open={pulseOpen} onOpenChange={setPulseOpen} />");
  });

  it("⑧ مسیرِ رویداد queryِ eventQuerySchema را پذیرفته و سریِ اختیاری میسازد", () => {
    const src = readFileSync(join(process.cwd(), "src/app/api/event/route.ts"), "utf8");
    expect(src).toContain("query: eventQuerySchema");
    expect(src).toContain("parsed.days");
    expect(src).toContain("not: ARCHIVE_DAY");
  });

  it("⑨ برجِ مراقبت، JSONLِ زندهٔ خودِ سرور را میخواند (درسِ دو-مسیرهٔ r346)", () => {
    const src = readFileSync(join(process.cwd(), "src/app/api/client-error/route.ts"), "utf8");
    expect(src).toContain("client-error-get");
    expect(src).toContain("readFileSync");
    expect(src).toContain("logPath()");
  });
});
