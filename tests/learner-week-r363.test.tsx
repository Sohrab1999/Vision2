// @vitest-environment jsdom
// ------------------------------------------------------------------
// r363 — «هفتهٔ فعال» در کارنامهٔ یادگیرنده — سطرِ همزادِ دفترِ r362؛
// دفتر و کارنامه حالا همزبانند. سه سطحِ نو:
//   · کارنامهٔ CSV: سطرهایِ «هفتهٔ فعال» (+ «پرکارترینِ روز») بعد از
//     سطرِ خلاصه — پنجره از خودِ byDayِ کارنامه (۱۴ روزِ تولیدی، طولِ
//     مشتق نه عددِ دستی) — موتورِ مشترکِ active-week
//   · دیالوگِ جزئیات: «مجموعِ دو هفته: N» کنارِ عنوانِ نوارِ
//     چهاردهروزه — همان reduce، همان تکحقیقتِ ستونها (آیدیومِ r362)
//   · دفترِ کامل: کارنامههایِ درونش خودبهخود سطرها را گرفتند —
//     دفتر برایش حتی یک خط عوض نشد (اثباتِ قرض نه رونویسی)
// قفلهایِ مهندسی:
//   • موتور به src/lib/active-week.ts رفت (آیدیومِ r360 — ایمپورتِ
//     معکوسِ کارنامه به دفتر سیکل میساخت) — re-exportِ دفتر APIِ
//     r362 را زنده نگه میدارد؛ هیچ نسخهٔ محلیِ رونویسیشده مجاز نیست
//   • صداقتها عینِ r362: هفتهٔ خالی = صفرِ واقعی با شاهد بیپرکارترین؛
//     ورودیِ زباله ⇒ غیبتِ صادق؛ ارقامِ ASCII در CSV / فارسی در پنل
//   • رجیستریِ ۵۲ دستنخورده — هفتهٔ فعال خواندنی است نه گزارششدنی
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import TeacherView from "@/components/study/teacher/teacher-view";

// آیدیومِ رندرِ زندهٔ r353/r354 — واقعیتِ تحلیلی/استور در jsdom جایز نیست
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/study-store", () => ({
  useStudy: (sel: (s: { setView: (v: unknown) => void }) => unknown) => sel({ setView: vi.fn() }),
}));
import { buildLearnerCardCsv, LEARNER_CARD_TITLE, LEARNER_SUMMARY_COLUMNS } from "@/lib/teacher-learner-csv";
import { buildClassLedgerCsv, LEDGER_TITLE } from "@/lib/teacher-class-ledger";
import { activeWeekMeta as ledgerMeta, activeWeekRows as ledgerRows } from "@/lib/teacher-class-ledger";
import { activeWeekMeta as libMeta, activeWeekRows as libRows } from "@/lib/active-week";
import type { LearnerDetail, RosterRow } from "@/lib/teacher-report";
import { faNum } from "@/lib/study-theme";
import { EVENT_NAMES, EVENT_CATEGORIES } from "@/lib/analytics-events";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const HOUR = 3600 * 1000;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString().slice(0, 10);

const rosterFixture: RosterRow[] = [
  { name: "آرش", color: "emerald", attempts: 6, avgPercent: 63, bestPercent: 80, lessons: 2, lastActive: iso(HOUR), weakest: null, handle: "a".repeat(16) },
];

// فیکسچرِ پنجرهٔ ۱۴روزه: ۶ تلاش در ۳ روزِ فعال — پرکارترینِ یکتا
const fortnightFixture = Array.from({ length: 14 }, (_, i) => ({
  day: day(13 - i),
  attempts: i === 10 ? 1 : i === 11 ? 2 : i === 12 ? 3 : 0,
}));

const fullDetail: LearnerDetail = {
  name: "آرش",
  color: "emerald",
  joinedAt: iso(9 * 86_400_000),
  attempts: 6,
  avgPercent: 63,
  bestPercent: 80,
  lessons: 2,
  lastActive: iso(HOUR),
  byDay: fortnightFixture,
  byLesson: [
    { lesson: 1, attempts: 4, avgPercent: 70 },
    ...Array.from({ length: 11 }, (_, i) => ({ lesson: i + 2, attempts: 0, avgPercent: null })),
  ],
  bySkill: [{ category: "dictation", attempts: 6, avgPercent: 63, bestPercent: 80 }],
  recent: [{ category: "dictation", lesson: 1, percent: 80, createdAt: iso(HOUR) }],
};

const emptyDetail: LearnerDetail = {
  ...fullDetail,
  name: "نگار",
  color: "violet",
  attempts: 0,
  avgPercent: null,
  bestPercent: null,
  lessons: 0,
  lastActive: null,
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: 0 })),
  bySkill: [],
  recent: [],
};

const sectionOf = (csv: string[], title: string): number => csv.findIndex((l) => l === title);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------
// ① استخراجِ موتور — تکحقیقتِ active-week، قرضِ هر دو مصرفکننده
// ---------------------------------------------------------------
describe("موتورِ مشترکِ active-week — استخراجِ r363", () => {
  it("① re-exportِ دفتر همان تابعِ کتابخانه است — APIِ r362 دستنخورده", () => {
    expect(ledgerMeta).toBe(libMeta); // هویتِ تابع — عبوری نه کپی
    expect(ledgerRows).toBe(libRows);
  });

  it("② قفلِ رونویسیِ ممنوع: کارنامه هیچ کپیِ محلیِ سطرها ندارد — سطر از کتابخانه میآید", () => {
    const card = read("src/lib/teacher-learner-csv.ts");
    expect(card).toContain('from "./active-week"'); // قرض
    expect(card).not.toContain("`هفتهٔ فعال,"); // هیچ قالبِ سطرِ موازی
    expect(card).not.toContain("پرکارترینِ روز,${");
    const engine = read("src/lib/active-week.ts");
    expect(engine).toContain("`هفتهٔ فعال,"); // تکحقیقتِ قالبِ سطر اینجاست
    const ledger = read("src/lib/teacher-class-ledger.ts");
    expect(ledger).toContain('export { activeWeekMeta, activeWeekRows } from "./active-week"');
  });
});

// ---------------------------------------------------------------
// ② کارنامه — جایِ سطرها و صداقتها
// ---------------------------------------------------------------
describe("buildLearnerCardCsv — هفتهٔ فعال در سربرگِ کارنامه", () => {
  it("③ ترتیب: عنوان → خلاصه → هفتهٔ فعال → پرکارترین → ضعیفترینِ مهارت (r365) → جداکننده → روند — پنجرهٔ ۱۴روزه از خودِ داده", () => {
    const csv = buildLearnerCardCsv(fullDetail);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(LEARNER_CARD_TITLE);
    expect(lines[1]).toBe(LEARNER_SUMMARY_COLUMNS.join(","));
    expect(lines[2]).toBe(
      `آرش,emerald,${fullDetail.joinedAt.slice(0, 10)},6,63,80,2,${fullDetail.lastActive}`
    );
    expect(lines[3]).toBe("هفتهٔ فعال,6 تلاش در 14 روزِ اخیر · 3 روزِ فعال"); // طولِ پنجره = طولِ خودِ byDay
    expect(lines[4]).toBe(`پرکارترینِ روز,${day(1)} · 3 تلاش`);
    expect(lines[5]).toBe("ضعیفترینِ مهارت,دیکته · میانگین 63٪ در 6 تلاش"); // r365 — کنارِ پرکارترین در ناحیهٔ متا
    expect(lines[6]).toBe(""); // جداکنندهٔ بخش — همان idiomِ r354
    expect(lines[7]).toBe("روندِ 14 روز");
    expect(lines[8]).toBe("روز,تلاشها");
    const t = sectionOf(lines, "روندِ 14 روز");
    expect(lines[t + 2]).toBe(`${day(13)},0`); // نوارِ روند سالم — سطرهایِ هفته جای بخشی را نگرفتند
    expect(lines[t + 14]).toBe(`${day(1)},3`); // پرکارترینِ روزِ فیکسچر
    expect(lines[t + 15]).toBe(`${day(0)},0`); // امروزِ فیکسچر — صفرِ واقعی
  });

  it("④ یادگیرندهٔ بیتلاش: صفرِ واقعی با شاهد چاپ میشود، پرکارترینِ ساختگی هرگز", () => {
    const csv = buildLearnerCardCsv(emptyDetail);
    const lines = csv.split("\r\n");
    expect(lines[3]).toBe("هفتهٔ فعال,0 تلاش در 14 روزِ اخیر · 0 روزِ فعال");
    expect(lines[4]).toBe(""); // بیپرکارترین — مستقیم به جداکننده
    expect(csv).not.toContain("پرکارترینِ روز");
    // بخشهایِ بعدی سالم
    const s = sectionOf(lines, "مهارتها — ضعیفترینِ اول");
    expect(lines[s + 1]).toBe("مهارت,تلاشها,میانگین,بهترین");
  });

  it("⑤ byDayِ تهی ⇒ غیبتِ صادقِ سطرهایِ هفته — کارنامه نمیترکد", () => {
    const csv = buildLearnerCardCsv({ ...fullDetail, byDay: [] });
    expect(csv).not.toContain("هفتهٔ فعال");
    expect(csv).toContain("روندِ 0 روز"); // عنوان از طولِ خودِ داده — صادق
  });

  it("⑥ پنجره از خودِ داده مشتق میشود — ۷روزهٔ دفاعی ⇒ «7 روزِ اخیر»", () => {
    const week = Array.from({ length: 7 }, (_, i) => ({
      day: day(6 - i),
      attempts: i === 2 ? 4 : i === 4 ? 1 : 0,
    }));
    const csv = buildLearnerCardCsv({ ...fullDetail, byDay: week });
    expect(csv).toContain("هفتهٔ فعال,5 تلاش در 7 روزِ اخیر · 2 روزِ فعال");
  });

  it("⑦ گویشِ خانواده با سطرهایِ نو: CRLFِ خالص، ارقامِ داده ASCII، بی‌نقل‌قول", () => {
    const csv = buildLearnerCardCsv(fullDetail);
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
    expect(csv.endsWith("\r\n")).toBe(true);
    for (const line of csv.split("\r\n")) {
      for (const cell of line.split(",")) {
        if (/^[\d\u06F0-\u06F9]+$/.test(cell)) expect(cell).toMatch(/^\d+$/);
      }
    }
  });
});

// ---------------------------------------------------------------
// ③ دفتر دنبال میآید — قرض نه رونویسی، اثباتِ زنده
// ---------------------------------------------------------------
describe("buildClassLedgerCsv — کارنامههایِ درونِ دفتر همزبان شدند", () => {
  it("⑧ سربرگِ دفتر پنجرهٔ ۷روزهٔ کلاس، کارنامهٔ درونش پنجرهٔ ۱۴روزهٔ فردی — هر دو از یک موتور، هر یک خودْ опис", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: [
        { day: day(6), attempts: 0 },
        { day: day(5), attempts: 2 },
        { day: day(4), attempts: 0 },
        { day: day(3), attempts: 3 },
        { day: day(2), attempts: 1 },
        { day: day(1), attempts: 0 },
        { day: day(0), attempts: 0 },
      ],
      roster: rosterFixture,
      details: [fullDetail],
    });
    const lines = out.split("\r\n");
    expect(lines[0]).toBe(LEDGER_TITLE);
    expect(lines[2]).toContain("هفتهٔ فعال,6 تلاش در 7 روزِ اخیر"); // هفتهٔ کلاس — سربرگ
    const cardWeek = lines.findIndex((l) => l === "هفتهٔ فعال,6 تلاش در 14 روزِ اخیر · 3 روزِ فعال");
    expect(cardWeek).toBeGreaterThan(lines.findIndex((l) => l.startsWith("نام,رنگ"))); // درونِ کارنامهٔ آرش — بعد از جدولِ کلاس
    expect(out).toContain(`پرکارترینِ روز,${day(1)} · 3 تلاش`);
  });
});

// ---------------------------------------------------------------
// ④ نیمهٔ دیدنی — «مجموعِ دو هفته» در دیالوگِ جزئیات
// ---------------------------------------------------------------
describe("TeacherDetailDialog — مجموعِ دو هفته کنارِ عنوانِ نوار", () => {
  it("⑨ قفلِ ساختاری: reduce از خودِ byDayِ نوار + faNum + بی‌رویدادِ نو + بی‌transition-all", () => {
    const detail = read("src/components/study/teacher/teacher-detail.tsx");
    expect(detail).toContain('data-testid="teacher-detail-week-total"');
    expect(detail).toContain("byDay ?? []).reduce"); // همان تکحقیقتِ ستونها — نه محاسبهٔ موازی
    expect(detail).toContain("مجموعِ دو هفته:");
    expect(detail).toContain("faNum(fortnightTotal)");
    expect(detail).not.toContain("transition-all"); // قفلِ scoped-transitions
    expect(detail).not.toContain('trackEvent("active_week")'); // هفتهٔ فعال رویداد ندارد
    const card = read("src/lib/teacher-learner-csv.ts");
    expect(card).not.toContain("trackEvent"); // کتابنامهٔ CSV هم گزارشگر نیست
  });

  it("⑩ رندرِ زنده: بازشدنِ دیالوگ ⇒ مجموعِ دو هفته با ارقامِ فارسی — ۶ تلاشِ فیکسچر", async () => {
    const learnerPayload = {
      ok: true,
      windowDays: 14,
      learner: fullDetail,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (typeof url === "string" && url.includes("/api/teacher/learner")) {
          return { ok: true, status: 200, json: async () => learnerPayload };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            generatedAt: new Date(now).toISOString(),
            summary: {
              learners: 1, attempts: 6, avgPercent: 63, last24h: 2,
              byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 2 : 0 })),
              byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 0, avgPercent: null })),
            },
            roster: rosterFixture,
          }),
        };
      })
    );
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    const { default: TeacherViewLazy } = await import("@/components/study/teacher/teacher-view");
    const utils = render(<TeacherViewLazy />);
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
    fireEvent.click(utils.getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(utils.getByTestId("teacher-detail-cards")).toBeDefined());
    await waitFor(() => expect(utils.getByTestId("teacher-detail-strip").textContent).toContain("مجموعِ دو هفته:"));
    const total = utils.getByTestId("teacher-detail-week-total");
    expect(total.textContent).toBe(faNum(6)); // ۶ — ارقامِ فارسیِ پنل (CSV همزادِ ASCII دارد)
  });
});

// ---------------------------------------------------------------
// ⑤ رجیستری — هفتهٔ فعال در کارنامه هم رویداد ندارد
// ---------------------------------------------------------------
describe("رجیستریِ r363", () => {
  it("⑪ رجیستریِ ۵۲ دستنخورده — سطرِ کارنامه خواندنی است نه گزارششدنی", () => {
    expect(EVENT_NAMES).toHaveLength(52);
    expect(EVENT_NAMES).not.toContain("active_week");
    expect(EVENT_NAMES).toContain("teacher_learner_csv"); // رویدادِ دانلودِ r354 — تنها رویدادِ این سطح
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("⑫ allowlistِ پاکسازی دستنخورده — عضوِ نو برایِ cleanup لازم نیست", () => {
    const script = read("scripts/qa-db-cleanup-r101.cjs");
    expect(script).toContain('"teacher_open"');
    expect(script).toContain('"teacher_learner_csv"');
    expect(script).toContain('"teacher_class_csv"');
  });
});
