// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r433 — «برچسبِ بانک بر خانههایِ آیندهٔ نوار» — قفلهایِ کشفپذیری.
//
// پیشنهادِ ②ِ r432: خانههایِ آیندهٔ نوارِ هفته تا دیروز فقط «چند»
// میگفتند و «چه چیزی» نمیگفتند — یادگیرنده باید به تقویمِ CSV یا
// فهرستِ r432 (که فقط امروز است) مراجعه میکرد. r433: روزِ آیندهٔ
// تکبانکی در title/aria نامِ رسمیِ تمرینش را میگوید، روزِ چندبانکی
// گویشِ «در M بانک»ِ r425 را — و هیچ رنگ یا عنصرِ نوایند (شلوغیِ
// بصری صفر؛ کارتِ PNGِ r423 هم دستنخورده میماند).
//  · تکمنبع: ترکیبِ بانکی از همین memoِ weekAgenda (صفر شمارشِ موازی)؛
//    شمارِ خانه همچنان از dayTotalِ weekCells میآید
//  · بانکِ ناشناس = عنوانِ تهیِ اطلس → زبانِ عمومیِ شمار — نه کلیدِ
//    خام، نه نامِ برساخته (r236)
//  · خانهٔ امروز (تکبانک/چندبانکی/بی مقصد) و خانهٔ بیبازگشت:
//    دستنخورده — قفلهایِ r422/r425 سرِ جایشان
//  · aria-label فقط برایِ خانهٔ آیندهٔ دارایِ بازگشت (برچسبِ نادیدنیِ
//    بانک همانجاست؛ خانهٔ تهی برچسبِ تازهای وعده نمیکند)
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { faWeekday } from "@/lib/weekly-digest";

const TODAY = daysAgoKey(0);
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});
/** درنفسِ نردبانی: ok=1 → فردا، ok=2 → پسفردا، ok=3 → چهارروزِ دیگر */
const graceEntry = (ok: number) => ({
  wrong: ok + 1, // مسلط نباشد (ok ≥ wrong = تسلط)
  ok,
  lastDay: TODAY,
  lastOkDay: TODAY,
});

const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;
const WF_NOUN = WORD_FAMILY_TABLES[0].families.find((f) => f.noun)!.noun;

const strip = (items: number, days: number) =>
  screen.queryByLabelText(`هفتهٔ پیشِ رو — ${faNum(items)} موردِ بازگشت در ${faNum(days)} روز`);

const cellByTitlePrefix = (el: HTMLElement, prefix: string) =>
  el.querySelector(`[title^="${prefix}"]`) as HTMLElement | null;

describe("weekly-report r433 — برچسبِ بانک بر خانههایِ آیندهٔ نوار", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });
  afterEach(() => cleanup());

  it("فردایِ چندبانکی: «در ۲ بانک» — هیچ نامِ تمرینی وعده نمیشود، نه کلیدِ خام", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), come: graceEntry(1) }, // امروز + فردا
        phonemes: { [SYM]: graceEntry(1) }, // فردا — بانکِ دوم
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(3, 2)!;
    expect(el).toBeTruthy();
    const tomorrow = cellByTitlePrefix(el, "فردا")!;
    expect(tomorrow).toBeTruthy();
    expect(tomorrow.getAttribute("title")).toBe(
      `فردا — ${faNum(2)} موردِ بازگشت در ${faNum(2)} بانک`,
    );
    expect(tomorrow.getAttribute("aria-label")).toBe(
      `فردا — ${faNum(2)} موردِ بازگشت در ${faNum(2)} بانک`,
    );
    expect(tomorrow.textContent).toBe(`فردا${faNum(2)}`); // متنِ دیدنیِ r422 دستنخورده
    expect(tomorrow.className).toContain("bg-sky-50"); // خانوادهٔ بصریِ r422
  }, 20000);

  it("روزِ آیندهٔ تکبانکی: نامِ رسمیِ تمرین در title و aria — داده از خودِ بانک", () => {
    useStudy.setState({
      drillMistakes: {
        words: { [WF_NOUN]: graceEntry(2) }, // پسفردا — تکبانک
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(1, 1)!;
    expect(el).toBeTruthy();
    const day2 = cellByTitlePrefix(el, faWeekday(daysAgoKey(-2)))!;
    expect(day2).toBeTruthy();
    expect(day2.getAttribute("title")).toBe(
      `${faWeekday(daysAgoKey(-2))} — ${faNum(1)} موردِ بازگشت — تمرینِ خانوادهٔ واژه‌ها`,
    );
    expect(day2.getAttribute("aria-label")).toBe(day2.getAttribute("title"));
    expect(day2.className).toContain("bg-sky-50");
  }, 20000);

  it("هفتهٔ مخلوط: هر روزِ آینده نامِ تمرینِ خودش را میگوید — تکبانکِ فردا و پسفردا و چهارروزه", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), come: graceEntry(1) }, // امروزِ سررسید + فردا
        phonemes: { [SYM]: graceEntry(2) }, // پسفردا
        abbrev: { "zzz-not-a-sym": graceEntry(3) }, // چهارروزِ دیگر (نردبانِ ۴)
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(4, 4)!;
    expect(el).toBeTruthy();
    const tomorrow = cellByTitlePrefix(el, "فردا")!;
    expect(tomorrow.getAttribute("title")).toBe(
      `فردا — ${faNum(1)} موردِ بازگشت — تمرینِ افعال بی‌قاعده`,
    );
    const day2 = cellByTitlePrefix(el, faWeekday(daysAgoKey(-2)))!;
    expect(day2.getAttribute("title")).toBe(
      `${faWeekday(daysAgoKey(-2))} — ${faNum(1)} موردِ بازگشت — تمرینِ جدول تلفظ`,
    );
    const day4 = cellByTitlePrefix(el, faWeekday(daysAgoKey(-4)))!;
    expect(day4.getAttribute("title")).toBe(
      `${faWeekday(daysAgoKey(-4))} — ${faNum(1)} موردِ بازگشت — تمرینِ نشانه‌های اختصاری`,
    );
  }, 20000);

  it("دو بازگشتِ همروزِ یک بانک: نامِ تمرین یکبار — شمار از dayTotal (صفر شمارشِ موازی)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { come: graceEntry(1), run: graceEntry(1) }, // فردا — ۲ پایهٔ یک بانک
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(2, 1)!;
    expect(el).toBeTruthy();
    const tomorrow = cellByTitlePrefix(el, "فردا")!;
    expect(tomorrow.getAttribute("title")).toBe(
      `فردا — ${faNum(2)} موردِ بازگشت — تمرینِ افعال بی‌قاعده`,
    );
    expect(tomorrow.textContent).toBe(`فردا${faNum(2)}`);
    // نامِ بانک در متنِ دیدنی نیامده — فقط نشانگر (بیِ شلوغیِ بصری)
    expect(tomorrow.textContent).not.toContain("افعال");
  }, 20000);

  it("بانکِ ناشناس (کلیدِ کهنه): زبانِ عمومیِ شمار — نه کلیدِ خام نه نامِ برساخته (r236)", () => {
    useStudy.setState({
      drillMistakes: {
        "ghost-bank": { go: graceEntry(1) }, // بانکِ بیرونِ اطلس
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(1, 1)!;
    expect(el).toBeTruthy();
    const tomorrow = cellByTitlePrefix(el, "فردا")!;
    expect(tomorrow.getAttribute("title")).toBe(`فردا — ${faNum(1)} موردِ بازگشت`);
    expect(tomorrow.getAttribute("title")).not.toContain("ghost-bank");
    expect(tomorrow.getAttribute("aria-label")).toBe(`فردا — ${faNum(1)} موردِ بازگشت`);
  }, 20000);

  it("خانهٔ بیبازگشت: titleِ ساکتِ r422 و بیِ ariaِ تازه — هیچ برچسبی وعده نمیشود", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() }, // فقط امروز
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(1, 1)!;
    expect(el).toBeTruthy();
    const emptyCells = [...el.querySelectorAll("[title]")].filter((c) =>
      (c.getAttribute("title") || "").endsWith("بیِ بازگشت"),
    );
    expect(emptyCells.length).toBeGreaterThanOrEqual(5); // شش روزِ آیندهٔ آرام + امروز
    for (const c of emptyCells) {
      expect(c.getAttribute("title")).toMatch(/ — بیِ بازگشت$/);
      expect(c.getAttribute("aria-label")).toBeNull(); // r433 برچسبِ تازهای نمیگذارد
    }
    expect(emptyCells.some((c) => c.getAttribute("title")!.startsWith("فردا"))).toBe(true);
  }, 20000);

  it("خانهٔ امروز دستنخورده: دکمهٔ پرشِ r425 و گویشِ چندبانکیِ آن — r433 فقط k≥۱", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() },
        phonemes: { [SYM]: graceEntry(1) }, // فردا — تکبانکِ آینده
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip(2, 2)!;
    expect(el).toBeTruthy();
    const today = el.querySelector('button[aria-label^="امروز"]')!;
    expect(today.getAttribute("title")).toBe(
      `امروز — ${faNum(1)} موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده`,
    );
    // قفلِ عنوانِ ظرفِ r425 (زیررشتهٔ محافظتشده) + سندِ گویشِ نو
    expect(el.getAttribute("title")).toContain("خانهٔ امروز با سررسیدِ تکبانک پرش به تمرین دارد");
    expect(el.getAttribute("title")).toContain("خانهٔ آیندهٔ تکبانک نامِ تمرینش را در نشانگر میگوید");
    const tomorrow = cellByTitlePrefix(el, "فردا")!;
    expect(tomorrow.getAttribute("title")).toBe(
      `فردا — ${faNum(1)} موردِ بازگشت — تمرینِ جدول تلفظ`,
    );
  }, 20000);
});
