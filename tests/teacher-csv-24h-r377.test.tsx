// @vitest-environment jsdom
// ------------------------------------------------------------------
// r377 — «روزنامه هم میشمارد؛ دیالوگ هرگز نمیمیرد»
//
// سه رشته در یک راند:
//   ① [باگ] teacher-detail: byDayِ غایبِ learner رویِ `.map`/`.length`
//      کرشِ رندر میداد — خروجیِ `bun run test` سرخ میشد (۲۸۷۸ سبز،
//      exit 1!) چون سه سطرِ نوار سه گویشِ دفاعیِ ناهمگون داشتند.
//      قفل: تکحقیقتِ `const byDay = detail?.byDay ?? []` + دیالوگِ
//      زنده رویِ learnerِ بیbyDay (regression واقعیِ کرش).
//   ② [باگ] روزنامهٔ کلاس «rush (30)» خام چاپ میکرد — نشتِ r352 که
//      ر375 فقط نما را شست (سه دوقلو؛ CSVِ کلاس دوقلوی چهارم بود).
//      قفل: برچسبِ فارسیِ تکمنبع در سلولِ CSV.
//   ③ [ویژگی ④ِ r376] ستونِ «فعال در ۲۴ ساعت» — همزبانِ کارتِ آمارِ
//      پنل (last24h)؛ گویشِ ASCII: ۱/خالی — اکسل جمعِ ستون را میگیرد.
//      پنجرهٔ لغزان از لحظهٔ دانلود؛ boundaryِ ۲۴ ساعت inclusive.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { buildClassCsv, activeIn24h, CLASS_CSV_COLUMNS } from "@/lib/teacher-csv";
import type { RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const HOUR = 3600_000;
const DAY = 86_400_000;
const now = Date.now();
const day = (i: number) => new Date(now - i * DAY).toISOString().slice(0, 10);

const rowOf = (over: Partial<RosterRow>): RosterRow => ({
  name: "آرش",
  color: "emerald",
  attempts: 3,
  avgPercent: 73,
  bestPercent: 90,
  lessons: 2,
  lastActive: new Date(now - HOUR).toISOString(),
  weakest: { category: "dictation", avgPercent: 70 },
  handle: "h-arash",
  ...over,
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("r377 — قفلِ منبع", () => {
  it("① teacher-detail: تکحقیقتِ byDayِ نرمالشده — هیچ دسترسیِ نگاردِ byDayای باقی نمانده", () => {
    const src = read("src/components/study/teacher/teacher-detail.tsx");
    expect(src).toContain("const byDay = detail?.byDay ?? [];"); // تکحقیقت
    // سه گویشِ ناهمگونِ قدیم ممنوع — همه از متغیرِ نرمال میخوانند
    expect(src).not.toContain("detail?.byDay.map");
    expect(src).not.toContain("detail.byDay.length");
    expect(src).not.toContain("detail.byDay.find");
    expect(src).not.toContain("detail?.byDay ?? []).reduce");
    // نوار و مجموع از همین تکحقیقت
    expect(src).toContain("byDay.map((d) => d.attempts), 1)");
    expect(src).toContain("stripLabels(Date.now(), byDay.length)");
    expect(src).toContain("const fortnightTotal = byDay.reduce(");
  });

  it("② teacher-csv: برچسبِ مهارت تکمنبع؛ ستونِ «فعال در ۲۴ ساعت» سرِ جای خودش", () => {
    const src = read("src/lib/teacher-csv.ts");
    expect(src).toContain('import { teacherSkillLabel } from "./teacher-skill-label"');
    // نشتِ خامِ قدیم: سلولِ templateِ انگلیسی دیگر وجود ندارد
    expect(src).not.toContain("${r.weakest.category}");
    expect(src).toContain("teacherSkillLabel(r.weakest.category)");
    // ترتیبِ ستونها: فعال در ۲۴ ساعت میانِ «آخرین فعالیت» و «ضعیف‌ترین مهارت»
    const cols = CLASS_CSV_COLUMNS as readonly string[];
    expect(cols).toContain("فعال در ۲۴ ساعت");
    expect(cols.indexOf("فعال در ۲۴ ساعت")).toBe(cols.indexOf("آخرین فعالیت") + 1);
    expect(cols.indexOf("فعال در ۲۴ ساعت")).toBe(cols.indexOf("ضعیف‌ترین مهارت") - 1);
    // پنجرهٔ لغزان از لحظهٔ دانلود — build خالص با nowِ تزریقی
    expect(src).toContain("buildClassCsv(roster: RosterRow[], now: number = Date.now())");
    expect(src).toContain("t >= now - 86_400_000");
    // هیچ رویدادِ تحلیلیای در کتابخانه — CSV یک خواندنیِ صادراتی است
    expect(src).not.toContain("trackEvent");
  });
});

describe("r377 — activeIn24h: پنجرهٔ لغزانِ صادق", () => {
  const NOW = new Date("2026-10-24T12:00:00.000Z").getTime();

  it("③ مرزها: ۱ ساعت پیش فعال؛ دقیقاً ۲۴ ساعت (inclusive) فعال؛ ۲۴ساعت+۱ثانیه نه", () => {
    expect(activeIn24h(new Date(NOW - HOUR).toISOString(), NOW)).toBe(true);
    expect(activeIn24h(new Date(NOW - DAY).toISOString(), NOW)).toBe(true); // boundary inclusive — قطعی
    expect(activeIn24h(new Date(NOW - DAY - 1).toISOString(), NOW)).toBe(false);
    expect(activeIn24h(new Date(NOW - 25 * HOUR).toISOString(), NOW)).toBe(false);
    expect(activeIn24h(new Date(NOW - 3 * DAY).toISOString(), NOW)).toBe(false);
  });

  it("④ غایب/ناخوانا ⇒ خالیِ صادق — نه حدسِ فعال: null، undefined، رشتهٔ تهی، زباله", () => {
    expect(activeIn24h(null, NOW)).toBe(false);
    expect(activeIn24h(undefined, NOW)).toBe(false);
    expect(activeIn24h("", NOW)).toBe(false);
    expect(activeIn24h("not-a-date", NOW)).toBe(false);
    expect(activeIn24h("2026-13-99T99:99:99Z", NOW)).toBe(false); // Invalid Date
  });
});

describe("r377 — روزنامهٔ کلاس: ستونِ نو + برچسبِ فارسی", () => {
  const NOW = new Date("2026-10-24T12:00:00.000Z").getTime();
  const isoAgo = (ms: number) => new Date(NOW - ms).toISOString();

  const roster = [
    rowOf({ name: "آرش", lastActive: isoAgo(HOUR) }), // فعالِ همین حالا
    rowOf({ name: "مریم", lastActive: isoAgo(3 * DAY), weakest: { category: "rush", avgPercent: 30 } }),
    rowOf({ name: "نگار", lastActive: null, weakest: null, attempts: 0, avgPercent: null, bestPercent: null, lessons: 0 }),
    rowOf({ name: "کاوه", lastActive: "زباله-تاریخ", weakest: { category: "exam", avgPercent: 55 } }),
  ];

  it("⑤ سربرگِ ۹ستونی + ردیفِ فعال: ۱ در ستونِ ۲۴ساعت و «دیکته (70)» فارسی", () => {
    const csv = buildClassCsv(roster, NOW);
    const lines = csv.split("\r\n").filter((l) => l.length > 0);
    expect(lines[0]).toBe(CLASS_CSV_COLUMNS.join(","));
    // آرش: آخرین = ISO، ۲۴ساعت = 1، ضعیفترین = دیکته (70)
    expect(lines[1]).toBe(`آرش,emerald,3,73,90,2,${isoAgo(HOUR)},1,دیکته (70)`);
  });

  it("⑥ سه روزِ گذشته ⇒ خالی؛ هرگز ⇒ خالی؛ برچسبهایِ rush و exam فارسی میشوند", () => {
    const csv = buildClassCsv(roster, NOW);
    const lines = csv.split("\r\n").filter((l) => l.length > 0);
    // مریم: ۲۴ساعت خالی — اما «چالش برق‌آسا (30)» دیگر «rush (30)» خام نیست
    expect(lines[2]).toBe(`مریم,emerald,3,73,90,2,${isoAgo(3 * DAY)},,چالش برق‌آسا (30)`);
    // نگار بیتلاش: همهٔ خالیهایِ صادق — هیچ صفرِ ساختگی
    expect(lines[3]).toBe("نگار,emerald,0,,,0,,,");
    // کاوه: lastActiveِ ناخوانا ⇒ خالیِ صادق در ۲۴ساعت (نه حدسِ فعال)؛ exam ⇒ آزمون جامع
    expect(lines[4]).toBe("کاوه,emerald,3,73,90,2,زباله-تاریخ,,آزمون جامع (55)");
  });

  it("⑦ گویشِ خانواده دستنخورده: CRLF خالص، بدونِ LFِ لخت", () => {
    const csv = buildClassCsv(roster, NOW);
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
  });
});

// ------------------------------------------------------------------
// رگرسیونِ واقعیِ کرش: دیالوگ رویِ learnerِ بیbyDay زنده میماند
// ------------------------------------------------------------------
const teacherHarness = async (learner: Record<string, unknown>, roster: RosterRow[] = [rowOf({})]) => {
  sessionStorage.setItem("vision2-teacher-code", "edu-1404");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).includes("/api/teacher/report")) {
        return new Response(
          JSON.stringify({
            ok: true,
            generatedAt: new Date(now).toISOString(),
            summary: {
              learners: roster.length,
              attempts: roster.reduce((s, r) => s + r.attempts, 0),
              avgPercent: 73,
              last24h: 1,
              byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
              byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 1, avgPercent: 73 })),
            },
            roster,
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ ok: true, learner }), { status: 200 });
    })
  );
  const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
  const utils = render(<TeacherView />);
  await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
  return utils;
};

const completeLearner = {
  name: "آرش",
  color: "emerald",
  joinedAt: new Date(now - 30 * DAY).toISOString(),
  attempts: 3,
  avgPercent: 73,
  bestPercent: 90,
  lessons: 2,
  lastActive: new Date(now - HOUR).toISOString(),
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: i === 13 ? 2 : 0 })),
  byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i < 2 ? 2 : 0, avgPercent: i < 2 ? 73 : null })),
  bySkill: [{ category: "dictation", attempts: 2, avgPercent: 55, bestPercent: 70 }],
  recent: [{ category: "quiz", lesson: 2, percent: 80, createdAt: new Date(now - HOUR).toISOString() }],
};

const openDialog = async (learner: Record<string, unknown>) => {
  const utils = await teacherHarness(learner);
  const openBtn = utils
    .getAllByTestId("teacher-row")
    .find((el) => el.getAttribute("data-teacher-open") === "true");
  expect(openBtn).toBeDefined();
  fireEvent.click(openBtn as HTMLElement);
  await waitFor(() => expect(utils.getByTestId("teacher-detail-dialog")).toBeDefined());
  await waitFor(() => expect(utils.queryByTestId("teacher-detail-loading")).toBeNull());
  return utils;
};

describe("r377 — دیالوگِ هرگزنمیمیرد", () => {
  it("⑧ learnerِ کامل: نوارِ ۱۴ستونی با زیرنویسها + «مجموعِ دو هفته: ۲» از خودِ byDay", async () => {
    const utils = await openDialog(completeLearner);
    const strip = utils.getByTestId("teacher-detail-strip");
    // ۱۴ ستونِ نوار — طول از خودِ داده (قراردادِ buildByDayِ سرور)
    expect(strip.querySelectorAll("div.flex.h-14 > div")).toHaveLength(14);
    expect(strip.querySelectorAll("div.mt-1 > span")).toHaveLength(14);
    expect(utils.getByTestId("teacher-detail-week-total").textContent).toBe("۲");
  });

  it("⑨ learnerِ بیbyDay (انحرافِ قرارداد): رندرِ ready بدونِ کرش — نوارِ خالیِ صادق و مجموعِ ۰", async () => {
    // پیشِ r377 همین ورودی render را میکشت (exitِ سرخِ suite با رانهای سبز)
    const { byDay: _omitted, ...contractDrift } = completeLearner;
    const utils = await openDialog(contractDrift as Record<string, unknown>);
    // دیالوگ زنده است — کارتهایِ خلاصه میخوانند
    expect(utils.getByTestId("teacher-detail-cards").textContent).toContain("تلاش");
    // نوار: صفرِ ستون (هیچ روزی برایِ نشان‌دادن نیست) و مجموعِ صادقِ صفر
    const strip = utils.getByTestId("teacher-detail-strip");
    expect(strip.querySelectorAll("div.flex.h-14 > div")).toHaveLength(0);
    expect(utils.getByTestId("teacher-detail-week-total").textContent).toBe("۰");
    // دیالوگ بسته میشود — cleanupِ رادیکس سالم
    fireEvent.keyDown(utils.getByTestId("teacher-detail-dialog"), { key: "Escape" });
    await waitFor(() => expect(utils.queryByTestId("teacher-detail-dialog")).toBeNull());
  });
});
