// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 78 — چهارمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// هفته‌نامهٔ پیشرفت (WeeklyReportSection) در کارنامه — ردیف «دفتر یخ».
// قراردادهایی که قفل می‌شوند:
//   ① ردیف دفتر یخ همیشه حاضر است (گزارش = تصویر کامل؛ صفرها هم دعوت‌اند)
//   ② مخزن/نجات/نجاتِ امروز از قرارداد freezeLedgerMeta می‌آیند
//   ③ مسیر یخِ بعدی: میله‌های ۳گانه فقط غیرِسقف؛ برچسب هم‌زبان خانه
//   ④ تساوی aria-label == title روی کل ردیف (هم‌قرارداد چیپ‌های هدر)
//   ⑤ ردیف نقطه‌های هدف دست‌نخورده مانده (هر دو ردیف کنار هم — رگرسیون)
// الگوی seed هم‌الگوی due-pill/goal-chip/freeze-badge: setState مستقیم.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy, todayStr, daysAgoKey } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

// analytics در این ردیف مصرف نمی‌شود — ولی استور با آلودگیِ ناوبری امن است
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("دفتر یخ در هفته‌نامه — کامپوننت (Task 78)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      dayHistory: {},
      history: {},
      goalMetDays: [],
      dailyGoal: 10,
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
    });
  });

  it("تازه‌وارد: ردیف حاضر است — «بی‌یخ» + «۰ از ۳ روزِ هدف‌دار» (گزارش تصویر کامل)", () => {
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("بی‌یخ");
    expect(ledger).toHaveTextContent("۰ از ۳ روزِ هدف‌دار");
    expect(ledger).toHaveTextContent("مسیر یخِ بعدی");
  });

  it("مخزن ۲ یخ: چیپ «۲ یخ در انبار» + aria==title روی ردیف", () => {
    useStudy.setState({ freezeCount: 2 });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("۲ یخ در انبار");
    expect(ledger.getAttribute("aria-label")).toBe(ledger.getAttribute("title"));
    expect(ledger.getAttribute("title")).toContain("دفتر یخ — ۲ یخ در انبار");
  });

  it("نجاتِ ۳ روز پیش: چیپ «۱ نجاتِ زنجیره در ۷ روزِ گذشته» با تیک", () => {
    useStudy.setState({ freezeCount: 1, freezeUsedDays: [daysAgoKey(3)] });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("۱ نجاتِ زنجیره در ۷ روزِ گذشته");
  });

  it("نجاتِ امروز: چیپ «نجات امروز» + عنوانِ نجات", () => {
    useStudy.setState({ freezeSavedDay: todayStr() });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("نجات امروز");
    expect(ledger.getAttribute("title")).toContain("امروز یخ، زنجیره را نجات داد");
  });

  it("سقفِ پُر (۲ یخ): میله‌های مسیر حذف — فقط برچسب «سقف یخ‌ها پر است»", () => {
    useStudy.setState({ freezeCount: 2 });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("سقف یخ‌ها پر است");
    // هیچ میلهٔ sky-500 در مسیر یخِ بعدی نیست (سقف فقط متن)
    const bars = ledger.querySelectorAll(".bg-sky-500");
    expect(bars.length).toBe(0);
  });

  it("زیرِ سقف: ۳ میلهٔ مسیر + ۲ پُر (bg-sky-500) برای ۲ روزِ هدف‌دار", () => {
    useStudy.setState({ freezeCount: 1, goalMetDays: [daysAgoKey(1), daysAgoKey(2)] });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    const bars = ledger.querySelectorAll(".bg-sky-500");
    expect(bars.length).toBe(2);
    expect(ledger).toHaveTextContent("۲ از ۳ روزِ هدف‌دار");
  });

  it("رگرسیون: ردیف نقطه‌های هدف سر جایش است — دوتا ردیف کنار هم", () => {
    useStudy.setState({ goalMetDays: [todayStr()] });
    render(<WeeklyReportSection />);
    // ردیف هدف: برچسب «هدف روزانه (۱۰)»
    expect(screen.getByText(/هدف روزانه/)).toBeInTheDocument();
    // و دفتر یخ جدا و بعدش
    expect(screen.getByLabelText(/دفتر یخ/)).toBeInTheDocument();
  });

  // ---- نشانِ روزهای یخ‌خورده (Task 79) — نوار ۱۴روزه + نقطه‌های هدف ----

  it("نوار نجات‌خورده: روزِ غیبتِ ثبت‌شده حلقهٔ آسمانی + عنوانِ نجات می‌گیرد", () => {
    useStudy.setState({ freezeCount: 1, freezeUsedDays: [daysAgoKey(3)] });
    const { container } = render(<WeeklyReportSection />);
    const bar = container.querySelector(".ring-sky-500\\/60");
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("title")).toContain("روزِ غیبت — با یخ نجات شد");
    // نجاتِ ۳ روز پیش = داخل هفتهٔ جاری → نوارِ خالیِ این هفته (emerald-200/60) با حلقهٔ آسمانی
    expect(bar?.className).not.toContain("ring-emerald");
  });

  it("امروز: حلقهٔ زمردی اولویت دارد — هیچ‌گاه حلقهٔ آسمانی نمی‌گیرد", () => {
    useStudy.setState({ freezeCount: 1, freezeUsedDays: [daysAgoKey(1)], freezeSavedDay: todayStr() });
    const { container } = render(<WeeklyReportSection />);
    const todayBar = container.querySelector(".ring-emerald-500\\/60");
    expect(todayBar).not.toBeNull();
    expect(todayBar?.className).not.toContain("ring-sky");
    // نجاتِ دیروز دیده می‌شود؛ «امروز» فقط زمردی
    expect(container.querySelector(".ring-sky-500\\/60")).not.toBeNull();
    expect(todayBar?.getAttribute("title")).toContain("فعالیت");
  });

  it("نقطهٔ نجات: dot با border-sky-500 + عنوانِ نجات — بین «هدف کامل» و «فعال»", () => {
    useStudy.setState({ freezeUsedDays: [daysAgoKey(4)] });
    const { container } = render(<WeeklyReportSection />);
    const dot = container.querySelector(".border-sky-500");
    expect(dot).not.toBeNull();
    expect(dot?.getAttribute("title")).toContain("روزِ غیبت — با یخ نجات شد");
  });

  it("اولویت: نقطهٔ هدفِ کامل زمردی می‌ماند حتی اگر روزِ دیگری نجات خورده باشد", () => {
    useStudy.setState({ goalMetDays: [todayStr()], freezeUsedDays: [daysAgoKey(2)] });
    const { container } = render(<WeeklyReportSection />);
    const metDot = container.querySelector(".border-emerald-600");
    expect(metDot).not.toBeNull();
    expect(metDot?.getAttribute("title")).toContain("هدف کامل شد");
    // legend dot samples live inside .report-legend — only DATA dots count
    expect([...container.querySelectorAll(".border-sky-500")].filter((el) => !el.closest(".report-legend")).length).toBe(1);
  });

  it("تازه‌وارد: هیچ نشانِ آسمانی در نوار و نقطه‌ها نیست (خموشیِ کامل)", () => {
    const { container } = render(<WeeklyReportSection />);
    expect(container.querySelector(".ring-sky-500")).toBeNull();
    // legend samples are allowed — no DATA dot carries the sky language
    expect([...container.querySelectorAll(".border-sky-500")].filter((el) => !el.closest(".report-legend"))).toEqual([]);
  });

  it("دستور رنگ‌ها (Task 80): افسانه با سه نمونهٔ هم‌کلاسِ نقطه‌ها حاضر است", () => {
    const { container } = render(<WeeklyReportSection />);
    const legend = container.querySelector(".report-legend");
    expect(legend).not.toBeNull();
    expect(legend?.getAttribute("aria-label")).toBe("دستور رنگ‌های گزارش");
    expect(legend?.getAttribute("title")).toBe("دستور رنگ‌های گزارش");
    expect(legend?.querySelector(".border-emerald-600")).not.toBeNull();
    expect(legend?.querySelector(".border-amber-400")).not.toBeNull();
    expect(legend?.querySelector(".border-sky-500")).not.toBeNull();
    expect(legend).toHaveTextContent("هدف کامل");
    expect(legend).toHaveTextContent("فعال ولی ناقص");
    expect(legend).toHaveTextContent("نجات با یخ");
  });

  it("دستور رنگ‌ها (Task 84): زبانِ نوار ۱۴روزه هم با نمونهٔ هم‌کلاس آموزش داده می‌شود", () => {
    const { container } = render(<WeeklyReportSection />);
    const legend = container.querySelector(".report-legend");
    expect(legend).not.toBeNull();
    // نمونهٔ فعالیت = عین گرادیانِ نوارِ فعالِ این هفته
    expect(legend?.querySelector(".from-teal-600.via-emerald-500.to-lime-400")).not.toBeNull();
    // نمونهٔ هفتهٔ پیش = عین نوارِ سنگیِ فعالِ هفتهٔ پیش
    expect(legend?.querySelector(".bg-stone-300")).not.toBeNull();
    // نمونهٔ امروز = حلقهٔ زمردیِ امروز (همان ring روی نوار)
    expect(legend?.querySelector(".ring-emerald-500\\/60")).not.toBeNull();
    expect(legend).toHaveTextContent("فعالیت");
    expect(legend).toHaveTextContent("هفتهٔ پیش");
    expect(legend).toHaveTextContent("امروز");
  });
});
// ------------------------------------------------------------------
// Task 103 — بلوکِ «نبردهای واژگانی» در هفته‌نامه:
//   ① بدونِ دفترچه بلوک نیست (صفرِ ساختگی ممنوع)
//   ② با دفترچه: چیپِ شمارش + سهِ چیپِ نتیجه با نقطهٔ رنگی + هفتهٔ پیش
//   ③ سقفِ ۱۵تاییِ هم‌هفته → «+» و پانوشتِ «حداقلی»
//   ④ نرخِ برد + بهترین امتیازِ هفته با ارقامِ فارسی
//   ⑤ بی‌نبردِ این هفته (دفترچهٔ قدیمی) → بلوکِ صفرِ صادق بدونِ «+» و بدونِ خطِ «بهترین»
// ------------------------------------------------------------------
import type { DuelRecord } from "@/lib/duel-history";

const duelRec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: daysAgoKey(0),
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

const duelBlock = () => screen.queryByLabelText(/نبردهای واژگانی —/);

describe("بلوکِ نبردهای واژگانی در هفته‌نامه (Task 103)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      dayHistory: {},
      history: {},
      goalMetDays: [],
      dailyGoal: 10,
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
      duelHistory: [],
    });
  });

  it("بدونِ دفترچه → بلوک رندر نمی‌شود", () => {
    render(<WeeklyReportSection />);
    expect(duelBlock()).not.toBeInTheDocument();
  });

  it("با دفترچهٔ ۲ برد/۱ باخت: چیپ «۳ نبرد این هفته» + نقطه‌های رنگی + «هفتهٔ پیش: ۱»", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "a", day: daysAgoKey(0), outcome: "win", myScore: 1100 }),
        duelRec({ id: "b", day: daysAgoKey(1), outcome: "win", myScore: 900 }),
        duelRec({ id: "c", day: daysAgoKey(2), outcome: "loss", myScore: 500 }),
        duelRec({ id: "e", day: daysAgoKey(9), outcome: "tie" }),
      ],
    });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toBeInTheDocument();
    expect(block).toHaveTextContent("۳ نبرد این هفته");
    expect(block).toHaveTextContent("۲ برد");
    expect(block).toHaveTextContent("۱ باخت");
    expect(block).toHaveTextContent("۰ مساوی");
    expect(block).toHaveTextContent("هفتهٔ پیش: ۱");
    // بهترین امتیازِ هفته + نرخِ برد با ارقامِ فارسی
    expect(block).toHaveTextContent("بهترین امتیازِ همین هفته: ۱۱۰۰");
    expect(block).toHaveTextContent("نرخِ برد ۶۷٪");
    // نقطه‌های رنگی نتیجه‌ها داخلِ چیپ‌ها (aria-hidden)
    expect(block.querySelectorAll("span[aria-hidden]").length).toBeGreaterThanOrEqual(3);
    // بدونِ «+» و بدونِ پانوشتِ حداقلی
    expect(block.textContent).not.toContain("+");
    expect(block.textContent).not.toContain("حداقلی");
  });

  it("سقفِ ۱۵تاییِ هم‌هفته → «۱۵+ نبرد» + پانوشتِ «حداقلی»", () => {
    useStudy.setState({
      duelHistory: Array.from({ length: 15 }, (_, i) =>
        duelRec({ id: "x" + i, day: daysAgoKey(i % 7), outcome: i % 3 === 0 ? "loss" : "win" })
      ),
    });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toHaveTextContent("۱۵+ نبرد این هفته");
    expect(block).toHaveTextContent("این شمارش حداقلی است");
  });

  it("دفترچهٔ فقطِ قدیمی (۱۰ روز پیش) → بلوکِ صفرِ صادق: «۰ نبرد»، بدونِ خطِ بهترین", () => {
    useStudy.setState({ duelHistory: [duelRec({ id: "old", day: daysAgoKey(10) })] });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toHaveTextContent("۰ نبرد این هفته");
    expect(block).toHaveTextContent("هفتهٔ پیش: ۱");
    expect(block.textContent).not.toContain("بهترین امتیازِ همین هفته");
  });

  it("ارهم: aria-label روی خودِ بلوک هم‌قرارداد چیپ هدر خوانده می‌شود", () => {
    useStudy.setState({ duelHistory: [duelRec({ id: "a" })] });
    render(<WeeklyReportSection />);
    expect(screen.getByLabelText("نبردهای واژگانی — ۱ نبرد این هفته")).toBeInTheDocument();
  });
});
