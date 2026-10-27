// @vitest-environment jsdom
// ------------------------------------------------------------------
// r362 — «هفتهٔ فعال» در سربرگِ دفترِ معلم — تجمیعِ هفتروزی که r357
// وعده داده بود (چهار راند باز — قدیمیترین بدهیِ پیشنهادی). دو سطح:
//   · دفترِ کاملِ CSV: سطرِ «هفتهٔ فعال» (+ «پرکارترینِ روز» فقط
//     وقتی واقعاً روزی برایِ پر بودن هست) بینِ صادره و جدولِ کلاس
//   · پنلِ زنده: مجموعِ هفته کنارِ عنوانِ نوارِ هفتروزی — همان
//     تجمیع، همان تکحقیقت (summary.byDay) — نه محاسبهٔ موازی
//
// قراردادهایی که این فایل قفل میکند:
//   • صداقتِ هفتهٔ خالی: سطرِ صفرِ واقعی چاپ میشود، اما «پرکارترین»
//     چاپ نمیشود — در هفتهٔ خالی پرکارترینِ روز وجود ندارد
//   • ردیفِ بدنام ⇒ صفرِ آن ردیف؛ روزِ بیبرچسب ⇒ فقط سطرِ
//     پرکارترین حذف میشود، نه تجمیع — aggregate صادق میماند
//   • تساویِ پرکارترین ⇒ روزِ تازهتر — قطعی
//   • طولِ پنجره از خودِ داده مشتق — نه عددِ دستیِ ۷
//   • ورودیِ زباله ⇒ غیبتِ صادق — هیچ سطری
//   • اعدادِ ASCII در CSV (گویشِ خانواده) / ارقامِ فارسی در پنل
//   • رجیستری دستنخورده — هفتهٔ فعال رویدادِ تحلیلی ندارد (۵۲)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildClassLedgerCsv, activeWeekMeta, activeWeekRows, LEDGER_TITLE } from "@/lib/teacher-class-ledger";
import { EVENT_NAMES, EVENT_CATEGORIES } from "@/lib/analytics-events";
import type { RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// ---------------- فیکسچرها ----------------
const weekFixture = [
  { day: "2026-10-18", attempts: 0 },
  { day: "2026-10-19", attempts: 2 },
  { day: "2026-10-20", attempts: 0 },
  { day: "2026-10-21", attempts: 3 },
  { day: "2026-10-22", attempts: 1 },
  { day: "2026-10-23", attempts: 0 },
  { day: "2026-10-24", attempts: 0 },
];

const emptyWeek = Array.from({ length: 7 }, (_, i) => ({ day: `2026-10-${18 + i}`, attempts: 0 }));

// r377 — ساعتِ تزریقیِ «فعال در ۲۴ ساعت»: ۳۰دقیقه بعدِ آخرین فعالیتِ آرش — قطعیِ همیشگی
const NOW_24H = new Date("2026-10-24T09:00:00.000Z").getTime();

const rosterFixture: RosterRow[] = [
  { name: "آرش", color: "emerald", attempts: 3, avgPercent: 73, bestPercent: 90, lessons: 2, lastActive: "2026-10-24T08:30:00.000Z", weakest: { category: "dictation", avgPercent: 55 }, handle: "aaaa1111bbbb2222" },
  { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
];

beforeEach(() => {
  localStorage.clear();
  cleanup();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------
// ① موتورِ خالص — activeWeekMeta / activeWeekRows
// ---------------------------------------------------------------
describe("activeWeekMeta — ریاضیِ صادقِ هفتهٔ فعال", () => {
  it("① هفتهٔ پُر: کل/روزهایِ فعال/طولِ پنجره/پرکارترین — دقیق و ASCII", () => {
    const meta = activeWeekMeta(weekFixture)!;
    expect(meta.total).toBe(6);
    expect(meta.activeDays).toBe(3);
    expect(meta.windowDays).toBe(7);
    expect(meta.busiest).toEqual({ day: "2026-10-21", attempts: 3 });
    const rows = activeWeekRows(meta);
    expect(rows).toEqual([
      "هفتهٔ فعال,6 تلاش در 7 روزِ اخیر · 3 روزِ فعال",
      "پرکارترینِ روز,2026-10-21 · 3 تلاش",
    ]);
  });

  it("② هفتهٔ خالی: صفرِ واقعی چاپ میشود، اما پرکارترینِ ساختگی چاپ نمیشود", () => {
    const meta = activeWeekMeta(emptyWeek)!;
    expect(meta.total).toBe(0);
    expect(meta.activeDays).toBe(0);
    expect(meta.busiest).toBeNull(); // در هفتهٔ خالی پرکارترین وجود ندارد
    const rows = activeWeekRows(meta);
    expect(rows).toEqual(["هفتهٔ فعال,0 تلاش در 7 روزِ اخیر · 0 روزِ فعال"]);
    expect(rows.some((r) => r.startsWith("پرکارترینِ روز"))).toBe(false);
  });

  it("③ ورودیِ زباله (تهی/ناموجود/آرایهٔ خالی) ⇒ غیبتِ صادق — هیچ سطری", () => {
    expect(activeWeekMeta(null)).toBeNull();
    expect(activeWeekMeta(undefined)).toBeNull();
    expect(activeWeekMeta([])).toBeNull();
  });

  it("④ ردیفِ بدنام: تلاشِ غیرعددی/منفی ⇒ صفرِ آن ردیف؛ روزِ بیبرچسب ⇒ فقط سطرِ پرکارترین حذف، تجمیع صادق میماند", () => {
    const mixed = [
      { day: "2026-10-18", attempts: Number.NaN },
      { day: "2026-10-19", attempts: -4 },
      { day: "2026-10-21", attempts: 2.9 }, // کفِ صادق — نیمتلاش نمیشماریم
      { day: "", attempts: 2 }, // تلاشِ واقعی، برچسبِ گمشده — مساوی ⇒ تازهتر (آخرین ردیف) میبرد
    ] as { day: string; attempts: number }[];
    const meta = activeWeekMeta(mixed)!;
    expect(meta.total).toBe(4); // ۰+۰+۲+۲ — شمارندهها هرگز دروغ نمیگویند
    expect(meta.activeDays).toBe(2);
    expect(meta.windowDays).toBe(4);
    // پرکارترین برنده دارد اما برچسبِ روزش گمشده است ⇒ سطرِ پرکارترین حذف — نه تجمیع
    expect(meta.busiest).toEqual({ day: "", attempts: 2 });
    const rows = activeWeekRows(meta);
    expect(rows).toEqual(["هفتهٔ فعال,4 تلاش در 4 روزِ اخیر · 2 روزِ فعال"]);
  });

  it("⑤ تساویِ پرکارترین ⇒ روزِ تازهتر میبرد — قطعی", () => {
    const tie = [
      { day: "2026-10-20", attempts: 3 },
      { day: "2026-10-21", attempts: 1 },
      { day: "2026-10-23", attempts: 3 }, // مساویِ روزِ کهنهتر — تازهتر میبرد
    ];
    expect(activeWeekMeta(tie)!.busiest).toEqual({ day: "2026-10-23", attempts: 3 });
  });

  it("⑥ طولِ پنجره از خودِ داده مشتق میشود — نه عددِ دستیِ ۷", () => {
    const fortnight = Array.from({ length: 14 }, (_, i) => ({
      day: `2026-10-${11 + i}`,
      attempts: i === 13 ? 5 : i === 5 ? 2 : 0,
    }));
    const meta = activeWeekMeta(fortnight)!;
    expect(meta.windowDays).toBe(14);
    expect(activeWeekRows(meta)[0]).toBe("هفتهٔ فعال,7 تلاش در 14 روزِ اخیر · 2 روزِ فعال");
  });
});

// ---------------------------------------------------------------
// ② دفترِ کامل — جایِ سطرها و گویشِ خانواده
// ---------------------------------------------------------------
describe("buildClassLedgerCsv — هفتهٔ فعال در سربرگِ دفتر", () => {
  it("⑦ ترتیبِ کامل: عنوان → صادره → هفتهٔ فعال → پرکارترین → جداکننده → جدولِ کلاس", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: weekFixture,
      roster: rosterFixture,
      details: [],
      now: NOW_24H,
    });
    const lines = out.split("\r\n");
    expect(lines[0]).toBe(LEDGER_TITLE);
    expect(lines[1]).toBe("صادره,2026-10-24");
    expect(lines[2]).toContain("هفتهٔ فعال,6 تلاش در 7 روزِ اخیر");
    expect(lines[3]).toBe("پرکارترینِ روز,2026-10-21 · 3 تلاش");
    expect(lines[4]).toBe("");
    expect(lines[5]).toBe("نام,رنگ,تلاش,میانگین,بهترین,درس‌ها,آخرین فعالیت,فعال در ۲۴ ساعت,ضعیف‌ترین مهارت");
  });

  it("⑧ هفتهٔ خالی در دفتر: سطرِ صفر حاضر، پرکارترین غایب — و جدولِ کلاس سالم", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: emptyWeek,
      roster: rosterFixture,
      details: [],
      now: NOW_24H,
    });
    const lines = out.split("\r\n");
    expect(lines[2]).toBe("هفتهٔ فعال,0 تلاش در 7 روزِ اخیر · 0 روزِ فعال");
    expect(lines[3]).toBe(""); // پرکارترین نیست — مستقیم به جداکننده میرسیم
    expect(lines[4]).toBe("نام,رنگ,تلاش,میانگین,بهترین,درس‌ها,آخرین فعالیت,فعال در ۲۴ ساعت,ضعیف‌ترین مهارت");
    expect(out).not.toContain("پرکارترینِ روز");
  });

  it("⑨ گویشِ خانواده با سطرهایِ نو دستنخورده: فقط CRLF — هیچ LFِ برهنهای", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: weekFixture,
      roster: rosterFixture,
      details: [],
    });
    expect(out).not.toMatch(/(?<!\r)\n/);
    expect(out.endsWith("\r\n")).toBe(true);
  });
});

// ---------------------------------------------------------------
// ③ نما — همان تجمیع، همان تکحقیقت
// ---------------------------------------------------------------
describe("TeacherView — هفتهٔ فعال در نوار و دفتر", () => {
  it("⑩ قفلِ ساختاری: نما byDayِ گزارش را به دفتر میدهد و مجموع را از خودِ نوار میخواند — نه محاسبهٔ موازی", () => {
    const view = read("src/components/study/teacher/teacher-view.tsx");
    expect(view).toContain("byDay: report.summary.byDay"); // سیمکشیِ تکحقیقت
    expect(view).toContain("summary.byDay.reduce"); // مجموعِ هفته از خودِ نوار
    expect(view).toContain("teacher-week-total"); // نقطهٔ کاوشِ زنده
    // هیچ رویدادِ تحلیلیِ نو — هفتهٔ فعال خواندنی است نه گزارششدنی
    expect(view).not.toContain("trackEvent(\"active_week\")");
    expect(view).not.toContain("trackEvent('active_week')");
    // موتورِ دفتر هفته را از ورودی میخواند — هیچ محاسبهٔ موازیای روی DB ندارد
    const engine = read("src/lib/teacher-class-ledger.ts");
    expect(engine).toContain("activeWeekMeta(input.byDay)");
  });

  it("⑪ رندرِ زنده: مجموعِ هفته با ارقامِ فارسی کنارِ عنوانِ نوار — ۶ تلاش واقعی", async () => {
    const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    const HOUR = 3600 * 1000;
    const now = Date.now();
    const day = (back: number) => new Date(now - back * 86_400_000).toISOString().slice(0, 10);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          generatedAt: new Date(now).toISOString(),
          summary: {
            learners: 1, attempts: 6, avgPercent: 73, last24h: 1,
            byDay: [
              { day: day(6), attempts: 0 },
              { day: day(5), attempts: 2 },
              { day: day(4), attempts: 0 },
              { day: day(3), attempts: 3 },
              { day: day(2), attempts: 1 },
              { day: day(1), attempts: 0 },
              { day: day(0), attempts: 0 },
            ],
            byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 0, avgPercent: null })),
          },
          roster: rosterFixture,
        }),
      }))
    );
    const { getByTestId } = render(<TeacherView />);
    await waitFor(() => expect(getByTestId("teacher-ready")).toBeDefined());
    const total = getByTestId("teacher-week-total");
    expect(total.textContent).toBe("۶"); // faNum — ارقامِ فارسیِ پنل (CSV همزادِ ASCII دارد)
    // سطرِ نوار هم متنِ کاملِ برچسب را دارد
    const strip = getByTestId("teacher-strip");
    expect(strip.textContent).toContain("مجموعِ هفته:");
  });
});

// ---------------------------------------------------------------
// ④ رجیستری — هفتهٔ فعال رویداد ندارد
// ---------------------------------------------------------------
describe("رجیستریِ r362", () => {
  it("⑫ هفتهٔ فعال رویدادِ تحلیلی ندارد — رجیستریِ ۵۲ دستنخورده", () => {
    expect(EVENT_NAMES).toHaveLength(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    expect(EVENT_NAMES).not.toContain("active_week");
    expect(EVENT_NAMES).toContain("teacher_class_csv"); // تنها رویدادِ خانوادهٔ دفتر — همان ۵۱امِ r357
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("⑬ پاکسازی: allowlistِ r352/r357 همین رویدادها را میشناسد — عضوِ نو لازم ندارد", () => {
    const script = read("scripts/qa-db-cleanup-r101.cjs");
    expect(script).toContain('"teacher_open"');
    expect(script).toContain('"teacher_class_csv"');
  });
});
