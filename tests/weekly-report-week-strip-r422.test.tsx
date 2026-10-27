// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r422 — «نوارِ هفتهٔ پیشِ رو» — قفلهایِ نمایِ کارنامه.
//
// روایتِ تقویمِ r421 در خودِ نما (پیشنهادِ ②ِ r421). قفلها:
//  · بیِ بانکِ خطا: نوار غایب — هیچ شکلی (r236)
//  · بانکِ مخلوط: هفت خانه — «امروز» با شمارِ زمردی، «فردا» و
//    روزِ هفته با شمارِ آسمانی، روزهایِ بیبازگشت ساکتِ صادق («—»)؛
//    دنبالهٔ «+N پس از هفته» برایِ دورترها؛ aria با جمعِ کل
//  · خانوادهٔ بصری: خانهٔ امروز bg-emerald-50 (دعوتِ کنش — r414)،
//    دورترها bg-sky-50 (خبرِ برنامهای — r417)، تهیها stone-300
//  · صداقتِ ارثی: فقطِ مسلط و تازهٔ امروزِ بیحق → نوار غایب
//    (تکمنبعِ weekAgenda — همین حکمِ r420/r421)
//  · هفتهٔ تماماً دور: سطرِ آرامِ صادق («این هفته آرام است —
//    نزدیکترین بازگشت: X روزِ دیگر») نه هفت خانهٔ تهی؛ گویشِ
//    «فردا» برایِ فاصلهٔ ۱ (عینِ r417)
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { consonantPhonemes, vowelPhonemes } from "@/data/appendix";
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
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});
/** درنفسِ دور — ok=4 نردبانِ ۸روزه؛ با lastOkDayِ امروز بیرونِ پنجره میماند */
const graceFar = (over: Record<string, unknown> = {}) => ({
  wrong: 5,
  ok: 4,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

/** نمادِ واقعیِ نخستین واک — برچسب از خودِ اطلس میآید (داده‌محور) */
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

const strip = () => screen.queryByLabelText(`هفتهٔ پیشِ رو — ${faNum(3)} موردِ بازگشت در ${faNum(3)} روز`);
const quiet = () => screen.queryByLabelText(/این هفته چیزی برنمیگردد/);

describe("weekly-report r422 — نوارِ هفتهٔ پیشِ رو", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  afterEach(() => {
    cleanup();
  });

  it("بیِ بانکِ خطا: هیچ شکلی از نوار رندر نمیشود (r236)", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.queryByLabelText(/هفتهٔ پیشِ رو/)).toBeNull();
  });

  it("بانکِ مخلوط: هفت خانه با زبانِ خودشان + دنبالهٔ پس از هفته + ariaِ جمع", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(), // امروز — سررسید
          come: graceEntry(), // فردا
          see: graceEntry({ ok: 2, wrong: 3 }), // grace2 — پسفردا
          run: graceFar(), // grace8 — پس از هفته
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = strip();
    expect(el).toBeTruthy();
    const cells = el!.querySelectorAll("[title]");
    // r423 — نُه عضوِ عنوان‌دار: هفت خانه + دنبالهٔ پس از هفته + دکمهٔ
    // کارتِ تصویریِ درونِ نوار (titleِ خودش را دارد — عضوِ نوِ خانواده)؛
    // r424 — دهمین عضو: دکمهٔ هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306 —
    // دو دروازهٔ یک ارزیابی، هر دو درونِ خودِ نوار).
    expect(cells).toHaveLength(10);
    const todayCell = el!.querySelector('[title^="امروز"]')!;
    expect(todayCell.textContent).toBe(`امروز${faNum(1)}`);
    expect(todayCell.className).toContain("bg-emerald-50"); // دعوتِ کنش — r414
    const tomorrowCell = el!.querySelector('[title^="فردا"]')!;
    expect(tomorrowCell.textContent).toBe(`فردا${faNum(1)}`);
    expect(tomorrowCell.className).toContain("bg-sky-50"); // خبرِ برنامهای — r417
    const day2 = el!.querySelector(`[title^="${faWeekday(daysAgoKey(-2))}"]`)!;
    expect(day2.textContent).toBe(`${faWeekday(daysAgoKey(-2))}${faNum(1)}`);
    expect(day2.className).toContain("bg-sky-50");
    const emptyCells = [...el!.querySelectorAll("[title]")].filter((c) =>
      (c.getAttribute("title") || "").endsWith("بیِ بازگشت"),
    );
    expect(emptyCells).toHaveLength(4); // چهار روزِ آرامِ هفته
    expect(emptyCells[0].className).toContain("text-stone-300"); // ساکتِ صادق
    expect(emptyCells[0].textContent!.endsWith("—")).toBe(true); // بیعدد — r236 (برچسبِ روز + خطِ تیره)
    const tail = [...el!.querySelectorAll("[title]")].find((c) =>
      (c.getAttribute("title") || "").includes("پس از این هفته"),
    );
    expect(tail!.textContent).toBe(`+${faNum(1)} پس از هفته`);
  });

  it("دو بازگشتِ یکروزه: خانهٔ همان روز «۲» میگوید — جمعِ صادقِ روزانه، نه شمارِ کل", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(),
          see: { wrong: 1, ok: 0, lastDay: YESTERDAY, lastOkDay: "" }, // دومین سررسیدِ امروز
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const el = screen.queryByLabelText(`هفتهٔ پیشِ رو — ${faNum(2)} موردِ بازگشت در ${faNum(1)} روز`);
    expect(el).toBeTruthy();
    const todayCell = el!.querySelector('[title^="امروز"]')!;
    expect(todayCell.textContent).toBe(`امروز${faNum(2)}`);
    // r425 — تکبانکِ امروز با مقصدِ یگانه، خانهٔ امروز دکمهٔ پرش میشود:
    // زبانِ خانه (شمار) + زبانِ پرش (میزبان) در همان titleِ سلطان
    expect(todayCell.getAttribute("title")).toBe(
      `امروز — ${faNum(2)} موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده`,
    );
    expect(todayCell.tagName).toBe("BUTTON"); // r425 — مقصدِ یگانه = دعوتِ کنشِ قابلِ کلیک
  });

  it("فقطِ مسلط و تازهٔ امروزِ بیحق: نوار غایب — صداقتِ ارثیِ تکمنبع (r420/r421)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          have: { wrong: 1, ok: 1, lastDay: YESTERDAY, lastOkDay: YESTERDAY }, // مسلط
          eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" }, // تازهٔ امروزِ بیحق
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.queryByLabelText(/هفتهٔ پیشِ رو/)).toBeNull();
  });

  it("هفتهٔ تماماً دور: سطرِ آرامِ صادق با گویشِ r417 — نه هفت خانهٔ تهی", () => {
    useStudy.setState({
      drillMistakes: {
        phonemes: { [SYM]: graceFar() }, // grace8 — بیرونِ پنجره
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const q = quiet();
    expect(q).toBeTruthy();
    // r434 — نوارِ آرام حالا «چه» را هم میگوید: نامِ نزدیکترین (تمرینِ
    // جدول تلفظ — بانکِ واک) کنارِ «کِی» (گویشِ r417: ۸ روزِ دیگر)
    expect(q!.textContent).toBe(
      `این هفته آرام است — نزدیکترین بازگشت: تمرینِ جدول تلفظ، ${faNum(8)} روزِ دیگر`,
    );
    expect(q!.getAttribute("aria-label")).toBe(
      `هفتهٔ پیشِ رو — این هفته چیزی برنمیگردد؛ نزدیکترین بازگشت تمرینِ جدول تلفظ، ${faNum(8)} روزِ دیگر`,
    );
    expect(strip()).toBeNull(); // شکلِ هفتخانهای رندر نشده
    // گویشِ «فردا» برایِ فاصلهٔ ۱ — ردیفِ grace8 را یک روز عقب میبریم؟ نه:
    // grace8 با lastOkDayِ دیروز = ۷ روزِ دیگر — همچنان بیرونِ پنجره؛
    // گویشِ فردا با فاصلهٔ ۷ به دست نمیآید — عینِ حکمِ r417 (۱=فردا)
  });
});
