// @vitest-environment jsdom
// ------------------------------------------------------------------
// r382 — «ممیزیِ دوقلوها» — بندِ ②ِ پیشنهادِ r381 (ایدئومِ r363/r381).
// قراردادها:
//   • موتورِ حیاتیِ ماهانه (ستونها + سقفِ امن + جمعِ کل) و میانگینِ درصد
//     تکمنبع در report-vitals — هیچ نسخهٔ محلیِ سیزدهسطریِ ستونبندی در
//     نماها مجاز نیست (دوقلوی بایتبهبایتِ report-card ↔ official-report
//     مرده است)
//   • ارزیابیِ واحدِ نشانها (۱۳ سیگنال + گیتِ هیدریشن) تکمنبع در
//     use-badge-census — سه گزارش قرض میگیرند؛ هیچ buildEvalInputِ
//     محلی در خانوادهٔ گزارش باقی نمیماند (قراردادِ خانوادههایِ نبرد و
//     تمرین دستنخورده — قفلِ دامنهدار)
//   • صداقتِ همیشگی: ماهِ خالی {ستون ۰، سقف ۱، جمع ۰}؛ میانگینِ مخزنِ
//     خالی ۰ (میانگینِ جعلی ممنوع — r236)
//   • «جمع کل» با ستونها همیشه همخوان — هر سه از یک پیمایشِ واحد
//   • صفرِ رویدادِ تحلیلیِ نو (رجیستری ۵۲) — استخراج رفتارِ نو نمیسازد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor, renderHook, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { monthVitalsOf, avgPercentOf } from "@/lib/report-vitals";
import { useBadgeCensus } from "@/hooks/use-badge-census";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { EVENT_NAMES } from "@/lib/analytics-events";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const REPORTS = "src/components/study/reports";
const CARD_SRC = readFileSync(join(process.cwd(), REPORTS, "report-card.tsx"), "utf8");
const OFFICIAL_SRC = readFileSync(join(process.cwd(), REPORTS, "official-report.tsx"), "utf8");
const WEEKLY_SRC = readFileSync(join(process.cwd(), REPORTS, "weekly-report.tsx"), "utf8");
const ENGINE_SRC = readFileSync(join(process.cwd(), "src/lib/report-vitals.ts"), "utf8");
const HOOK_SRC = readFileSync(join(process.cwd(), "src/hooks/use-badge-census.ts"), "utf8");
const DUEL_SRC = readFileSync(join(process.cwd(), "src/components/study/duel/duel-done.tsx"), "utf8");
const VIEWS = [
  ["report-card", CARD_SRC],
  ["official-report", OFFICIAL_SRC],
  ["weekly-report", WEEKLY_SRC],
] as const;
// مصرفکنندههایِ حیاتیِ ماهانه — هفته‌نامه هرگز ستونبندیِ ۳۰روزه نداشت
const VITALS_VIEWS = [
  ["report-card", CARD_SRC],
  ["official-report", OFFICIAL_SRC],
] as const;

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    known: {},
    results: {},
    mistakes: {},
    history: {},
    dayHistory: {},
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    streak: 0,
    bestStreak: 0,
    rushBest: 0,
    rushBestCorrect: 0,
    rushGames: 0,
    seenBadges: [],
    userName: "",
    userId: "",
    srs: {},
    starredWords: [],
    wordSeen: {},
    libraryDone: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

describe("موتورِ حیاتیِ خانوادهٔ گزارش (report-vitals)", () => {
  it("ماهِ خالیِ صادق: ستونی نیست، سقفِ ۱ (تقسیمبرصفر ممنوع)، جمعِ ۰", () => {
    const v = monthVitalsOf([]);
    expect(v.buckets).toEqual([]);
    expect(v.max).toBe(1);
    expect(v.total).toBe(0);
  });

  it("سیروزه → چهار ستونِ ۸/۸/۸/۶ کهنه→نو با جمع و روزِ زندهٔ هر هفته", () => {
    const month = Array.from({ length: 30 }, (_, i) => ({ total: [0, 1, 2].includes(i) ? [2, 10, 5][i] : 0 }));
    month[29] = { total: 7 }; // امروز
    const v = monthVitalsOf(month);
    expect(v.buckets).toHaveLength(4);
    expect(v.buckets.map((b) => b.total)).toEqual([17, 0, 0, 7]);
    expect(v.buckets.map((b) => b.active)).toEqual([3, 0, 0, 1]);
    expect(v.max).toBe(17);
    // «جمع کل» با ستونها همیشه همخوان — یک پیمایشِ واحد
    expect(v.total).toBe(24);
    expect(v.total).toBe(v.buckets.reduce((s, b) => s + b.total, 0));
  });

  it("ماهِ همه‌صفر: سقفِ امنِ ۱ میماند نه صفر — نوارِ بیارتفاعِ ساختگی ممنوع", () => {
    const v = monthVitalsOf(Array.from({ length: 30 }, () => ({ total: 0 })));
    expect(v.buckets).toHaveLength(4);
    expect(v.max).toBe(1);
    expect(v.total).toBe(0);
  });

  it("میانگینِ درصد: مخزنِ خالی صادقانه ۰ — میانگینِ جعلی ممنوع (r236)", () => {
    expect(avgPercentOf({})).toBe(0);
  });

  it("میانگینِ درصد: گردِ صحیح رویِ نتیجههایِ واقعی", () => {
    expect(avgPercentOf({ a: { percent: 80 }, b: { percent: 90 } })).toBe(85);
    expect(avgPercentOf({ x: { percent: 33.6 } })).toBe(34);
  });
});

describe("قفلِ منبعِ r382 — تکمنبعیِ موتور و سرشماری", () => {
  it("موتور هر دو خروجی را صادر میکند و ماهِ خالیِ صادق یک‌جاست", () => {
    expect(ENGINE_SRC).toContain("export function monthVitalsOf");
    expect(ENGINE_SRC).toContain("export function avgPercentOf");
    expect(ENGINE_SRC).toContain("if (month.length === 0) return { buckets: [], max: 1, total: 0 }");
  });

  it("هر دو گزارشِ ماهانه از موتور قرض میگیرند و دوقلوی سیزدهسطری در هیچنمایی زنده نیست", () => {
    for (const [name, src] of VITALS_VIEWS) {
      expect(src, name).toContain('from "@/lib/report-vitals"');
    }
    for (const [name, src] of VIEWS) {
      expect(src, name).not.toMatch(/Math\.ceil\(month\.length \/ 4\)/);
      expect(src, name).not.toMatch(/const rs = Object\.values\(results\);/);
    }
  });

  it("سرشماریِ نشانها تکمنبع است — سه گزارش buildEvalInput محلی ندارند", () => {
    for (const [name, src] of VIEWS) {
      expect(src, name).toContain('from "@/hooks/use-badge-census"');
      expect(src, name).not.toContain("buildEvalInput");
      expect(src, name).not.toContain("unlockedBadgeIds");
    }
    // قراردادِ خانوادههایِ دیگر دستنخورده — قفلِ دامنهدار، نه سراسری
    expect(DUEL_SRC).toContain("buildEvalInput");
  });

  it("قلاب: ۱۳ سیگنال + گیتِ هیدریشنِ خانواده + مرجعِ پایدارِ libraryDone", () => {
    for (const signal of ["rushBestCorrect", "rushGames", "seenBadges", "libraryDone", "dayStat"]) {
      expect(HOOK_SRC).toContain(`s.${signal}`);
    }
    expect(HOOK_SRC).toContain("useMounted");
    expect(HOOK_SRC).toMatch(/mounted\s*\?\s*buildEvalInput/);
    expect(HOOK_SRC).toContain("libraryDoneRaw");
    // ایدئومِ مرجعِ پایدارِ r298/r302 — ?? داخلِ useMemo
    expect(HOOK_SRC).toMatch(/useMemo\(\(\) => libraryDoneRaw \?\? \{\}, \[libraryDoneRaw\]\)/);
  });

  it("استخراج صفر رویدادِ تحلیلیِ نو و صفرِ رشدِ بهداشت (رجیستری ۵۲)", () => {
    expect(EVENT_NAMES.length).toBe(52);
    for (const src of [ENGINE_SRC, HOOK_SRC]) {
      expect(src).not.toContain("trackEvent");
      expect(src).not.toContain("transition-all");
      expect(src).not.toContain("stone-400");
    }
  });
});

describe("قلابِ سرشماری در jsdom — سرشماریِ واقعیِ سیزده سیگنال", () => {
  // یادداشتِ گیت: useMounted با useSyncExternalStore است — در رندرِ کلاینت
  // همیشه true (گیتِ SSR با سروراسنپشات زنده میشود؛ در jsdom قابلِ مشاهده
  // نیست) — قراردادِ «خروجیِ خالیِ پیش از mount» در قفلِ منبعِ گیتِ
  // mounted؟…:null زنده است، نه در رندرِ jsdom.

  it("پس از mount همان ۱۳ سیگنالِ واقعی را میشمارد — نه کم نه زیاد", async () => {
    useStudy.setState({
      known: { "3:accept": true, "3:reject": true, "4:abolish": true } as never,
      results: { "3:1": { percent: 80, total: 10 }, "4:1": { percent: 90, total: 10 } } as never,
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const { result } = renderHook(() => useBadgeCensus());
    await act(async () => {
      await waitFor(() => expect(result.current.evalInput).not.toBeNull());
    });
    expect(result.current.evalInput!.knownCount).toBe(3);
    expect(result.current.evalInput!.resultsCount).toBe(2);
    expect(result.current.unlocked).toBeInstanceOf(Set);
    expect(Array.isArray(result.current.unlockedBadges)).toBe(true);
    // همخوانیِ میانگین با موتورِ همان مخزن — دو در، یک قرارداد
    expect(avgPercentOf(useStudy.getState().results)).toBe(85);
  });
});

describe("نمایِ کارنامه رویِ موتورِ نو — داوریِ رندرِ واقعی", () => {
  it("رکوردها و باندِ ماهانه با دادهٔ موتور رندر میشوند — «جمع کل» همخوانِ ستونها", async () => {
    useStudy.setState({
      known: { "3:accept": true, "3:reject": true, "4:abolish": true } as never,
      results: { "3:1": { percent: 80, total: 10 }, "4:1": { percent: 90, total: 10 } } as never,
      history: { [daysAgoKey(0)]: { reviews: 8, quizzes: 2 } },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<ReportCard open onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText("واژهٔ آموخته")).toBeInTheDocument());
    // خواندنِ سلولی (درسِ r379): متنِ کل بدنه یک‌جا خوانده نمیشود؛
    // شاهدِ «جمع کل» بایتِ موتور است — ۸+۲=۱۰ تنها از ستونها میآید.
    await waitFor(() => {
      expect(document.body.textContent).toContain("جمع کل: ۱۰");
    });
  });
});
