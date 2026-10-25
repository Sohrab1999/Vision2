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

// Task 109 — خطِ «فکرِ هفته» در بلوکِ نبردها: میانگینِ وزن‌دار + سریع‌ترین
// با ممیزِ فارسی؛ چیپِ «N از M» فقط با پوششِ ناقص؛ بی‌رکوردِ فکردار → خطِ
// غایب (زیرمجموعهٔ صادق — بلوکِ نبرد خودش حاضر می‌ماند).
import type { ThinkStats } from "@/lib/duel-think";

const wkThink = (over: Partial<ThinkStats>): ThinkStats => ({
  avgMs: 800,
  minMs: 200,
  maxMs: 1500,
  seen: 4,
  total: 10,
  ...over,
});

describe("خطِ فکرِ هفته در بلوکِ نبردها (Task 109)", () => {
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

  it("دو نبردِ فکردار: «فکرِ میانگین ۰٫۹ ثانیه · سریع‌ترین ۰٫۲ ثانیه» + «ثبت برای ۶ از ۲۰ سؤال»", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 800, minMs: 200, seen: 4, total: 10 }) }),
        duelRec({ id: "b", day: daysAgoKey(2), think: wkThink({ avgMs: 1200, minMs: 300, seen: 2, total: 10 }) }),
      ],
    });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toHaveTextContent("فکرِ میانگین ۰٫۹ ثانیه · سریع‌ترین ۰٫۲ ثانیه");
    expect(block).toHaveTextContent("ثبت برای ۶ از ۲۰ سؤال");
  });

  it("پوششِ کامل (seen==total) → بدونِ چیپِ «ثبت برای»", () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "a", day: daysAgoKey(1), think: wkThink({ seen: 10, total: 10 }) })],
    });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toHaveTextContent("فکرِ میانگین");
    expect(block.textContent).not.toContain("ثبت برای");
  });

  it("بی‌رکوردِ فکردار → خطِ فکر غایب ولی بلوکِ نبرد حاضر (زیرمجموعهٔ صادق)", () => {
    useStudy.setState({ duelHistory: [duelRec({ id: "a", day: daysAgoKey(0) })] });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toBeInTheDocument();
    expect(block.textContent).not.toContain("فکرِ میانگین");
  });

  it("فکردارِ هفتهٔ پیش → خطِ فکر غایب (فقطِ هفتهٔ جاری می‌شمارد)", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "old", day: daysAgoKey(9), think: wkThink({ avgMs: 100, minMs: 50, seen: 9, total: 9 }) }),
        duelRec({ id: "now", day: daysAgoKey(0) }),
      ],
    });
    render(<WeeklyReportSection />);
    expect(duelBlock()!.textContent).not.toContain("فکرِ میانگین");
  });

  it("گِردکردنِ مرزیِ secFa مشترک: ۶۴۹ms → «۰٫۶» (هم‌قراردادِ سه نما)", () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 649, minMs: 649, seen: 2, total: 5 }) })],
    });
    render(<WeeklyReportSection />);
    expect(duelBlock()!).toHaveTextContent("فکرِ میانگین ۰٫۶ ثانیه · سریع‌ترین ۰٫۶ ثانیه");
  });

  it("گِردکردنِ مرزیِ secFa مشترک: ۶۵۰ms → «۰٫۷» (هم‌قراردادِ سه نما)", () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 650, minMs: 650, seen: 2, total: 5 }) })],
    });
    render(<WeeklyReportSection />);
    expect(duelBlock()!).toHaveTextContent("فکرِ میانگین ۰٫۷ ثانیه · سریع‌ترین ۰٫۷ ثانیه");
  });
});

// ------------------------------------------------------------------
// Task 113 — خطِ «هفتهٔ چابک» در بلوکِ نبردها: وقتی همین پنجرهٔ ۷روزه از
// گیت‌های خانوادهٔ دهم (۱۱۰) بگذرد، هفته‌نامه روایتش می‌کند — نقره
// «هفتهٔ چابک» با CalendarClock زمردی، طلا «هفتهٔ برق» با Gauge کهربایی
// (هم‌آیکنِ کاشیِ نشان). گیتِ نگذرانده یا بی‌نبردِ این هفته → خطِ غایب.
// ------------------------------------------------------------------
describe("خطِ هفتهٔ چابک در بلوکِ نبردها (Task 113)", () => {
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

  // هفتهٔ واجدِ نقره: Σ avgMs·seen = ۹۰۰·۵+۱۲۰۰·۳+۱۴۰۰·۲ = ۱۰۹۰۰ بر ۱۰ → ۱۰۹۰ms
  // (زیرِ ۱۵۰۰ نقره، بالای ۱۰۰۰ طلا — آگاهانه بینِ دو آستانه) · نرخ ۲۷/۳۰ = ۹۰٪
  const silverWeek = () => [
    duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 900, minMs: 200, maxMs: 1500, seen: 5, total: 10 }) }),
    duelRec({ id: "b", day: daysAgoKey(1), think: wkThink({ avgMs: 1200, minMs: 400, maxMs: 2000, seen: 3, total: 10 }) }),
    duelRec({ id: "c", day: daysAgoKey(2), think: wkThink({ avgMs: 1400, minMs: 500, maxMs: 2500, seen: 2, total: 10 }) }),
  ];

  it("هفتهٔ واجدِ نقره: «هفتهٔ چابک!» + آیکنِ CalendarClock زمردی — نه Gauge کهربایی", () => {
    useStudy.setState({ duelHistory: silverWeek() });
    const { container } = render(<WeeklyReportSection />);
    const line = screen.getByText(/هفتهٔ چابک!/);
    expect(line).toHaveTextContent("میانگینِ فکر ۱٫۱ ثانیه با نرخِ درستی ۹۰٪");
    const wrap = line.closest("div")!;
    expect(wrap.querySelector("svg.text-emerald-700")).not.toBeNull();
    expect(wrap.querySelector("svg.text-amber-600")).toBeNull();
    expect(container).toBeTruthy();
  });

  it("هفتهٔ برق (میانگینِ ۷۰۰ms زیرِ یک ثانیه): «هفتهٔ برق!» + آیکنِ Gauge کهربایی", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 5, total: 10 }) }),
        duelRec({ id: "b", day: daysAgoKey(1), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 3, total: 10 }) }),
        duelRec({ id: "c", day: daysAgoKey(2), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 2, total: 10 }) }),
      ],
    });
    render(<WeeklyReportSection />);
    const line = screen.getByText(/هفتهٔ برق!/);
    expect(line).toHaveTextContent("میانگینِ فکر ۰٫۷ ثانیه با نرخِ درستی ۹۰٪");
    const wrap = line.closest("div")!;
    // r329 — the quick-week gold ink deepened to the tone band (amber-600 on
    // the paper measured 3.2); dark rides the kernel --color-amber-800 token
    expect(wrap.querySelector("svg.text-amber-800")).not.toBeNull();
    expect(wrap.querySelector("svg.text-emerald-700")).toBeNull();
  });

  it("گیتِ نگذرانده (کندِ ۱۶۰۰ms): خطِ هفتهٔ چابک غایب ولی خطِ فکر و بلوک حاضر", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "a", day: daysAgoKey(0), think: wkThink({ avgMs: 1600, minMs: 600, maxMs: 2000, seen: 5, total: 10 }) }),
        duelRec({ id: "b", day: daysAgoKey(1), think: wkThink({ avgMs: 1600, minMs: 600, maxMs: 2000, seen: 3, total: 10 }) }),
        duelRec({ id: "c", day: daysAgoKey(2), think: wkThink({ avgMs: 1600, minMs: 600, maxMs: 2000, seen: 2, total: 10 }) }),
      ],
    });
    render(<WeeklyReportSection />);
    const block = duelBlock()!;
    expect(block).toBeInTheDocument();
    expect(block).toHaveTextContent("فکرِ میانگین ۱٫۶ ثانیه");
    expect(block.textContent).not.toContain("هفتهٔ چابک!");
    expect(block.textContent).not.toContain("هفتهٔ برق!");
  });

  it("هفتهٔ واجدِ گذشته + امروزِ بی‌فکر → خطِ غایب (پنجره‌سازیِ سخت‌گیر)", () => {
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "o1", day: daysAgoKey(7), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
        duelRec({ id: "o2", day: daysAgoKey(8), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
        duelRec({ id: "o3", day: daysAgoKey(9), think: wkThink({ avgMs: 700, minMs: 200, maxMs: 1500, seen: 9, total: 10 }) }),
        duelRec({ id: "now", day: daysAgoKey(0) }),
      ],
    });
    render(<WeeklyReportSection />);
    expect(screen.queryByText(/هفتهٔ چابک!/)).not.toBeInTheDocument();
    expect(screen.queryByText(/هفتهٔ برق!/)).not.toBeInTheDocument();
  });

  it("titleِ خط: گیت + شمارشِ «۳ نبردِ فکردار، ۳۰ پاسخ» — هم‌زبانِ خانه", () => {
    useStudy.setState({ duelHistory: silverWeek() });
    render(<WeeklyReportSection />);
    const wrap = screen.getByText(/هفتهٔ چابک!/).closest("div")!;
    const title = wrap.getAttribute("title") ?? "";
    expect(title).toContain("گیتِ هفته");
    expect(title).toContain("۳ نبردِ فکردار");
    expect(title).toContain("۳۰ پاسخ");
    expect(title).toContain("۱٫۵ ثانیه");
    expect(title).toContain("۸۰٪");
  });

  it("بی‌دفترچه: نه بلوک، نه خط — صفرِ ساختگی ممنوع", () => {
    render(<WeeklyReportSection />);
    expect(duelBlock()).not.toBeInTheDocument();
    expect(screen.queryByText(/هفتهٔ چابک!/)).not.toBeInTheDocument();
    expect(screen.queryByText(/هفتهٔ برق!/)).not.toBeInTheDocument();
  });
});
