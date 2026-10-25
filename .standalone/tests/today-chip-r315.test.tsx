// @vitest-environment jsdom
// ------------------------------------------------------------------
// r315 — چیپِ «فعالیتِ امروز» زیرِ نوارِ ۱۴روزه (پیشنهادِ ③ِ r314):
//   · جایِ درست: همان‌جای برچسبِ «امروز» در ردیفِ برچسبهایِ نوار — دقیقاً
//     زیرِ خانهٔ آخر (امروز راست‌ترین خانهٔ جریانِ LTR است)؛ عدد زیرِ
//     میلهای که میسنجدش می‌نشیند — درسِ r309 («عددهای چیپها با نوار
//     سنجیده میشوند») حالا جغرافیایی هم هست.
//   · منبعِ یگانه: digest.perDay — همان آرایهای که نوار میکشد؛ هیچ
//     شمارشِ موازیای. قفلِ منبع: دقیقاً یک find رویِ perDay.
//   · صفرِ صادق: امروزِ بیفعالیت هم دیده میشود (خنثیِ سنگ)، نه زمردیِ
//     تشویقِ ساختگی — و فقط «امروز» را میخواند نه پنجرهٔ هفته را
//     (آزمونِ دیروزِ فعال/امروزِ خالی).
//   + اصلاحِ wrapِ هدر (یافتهٔ سنجشِ ۳۹۰px قبل از تغییر: ۱۱px سرریزِ
//     پنهان — دکمهٔ آخر داخلِ پدینگ میرفت)؛ flex-wrap قفل میشود.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

// هفته‌نامه analytics مصرف میکند — استور با آلودگیِ ناوبری امن است (الگویِ weekly-report.component)
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const reportSrc = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/weekly-report.tsx"), "utf8");

/** DayStatِ امروز — فقط شمارندههایِ پنج‌گانه مهماند (داستان واحدِ جدا دارد) */
const todayStat = (reviews: number, quizzes = 0, words = 0, dictation = 0, rush = 0) => ({
  day: daysAgoKey(0),
  reviews,
  quizzes,
  words,
  dictation,
  rush,
  stories: 0,
});

const yesterdayStat = (reviews: number) => ({
  day: daysAgoKey(1),
  reviews,
  quizzes: 0,
  words: 0,
  dictation: 0,
  rush: 0,
  stories: 0,
});

describe("چیپِ «فعالیتِ امروز» زیرِ نوار — r315", () => {
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

  it("امروزِ فعال: «۱۰ فعالیت امروز» با زمردیِ خانوادهٔ حلقهٔ امروز — و عددش با خانهٔ امروزِ نوار سنجیده میشود", () => {
    useStudy.setState({ dayHistory: { [daysAgoKey(0)]: todayStat(3, 2, 1, 0, 4) } });
    const { container } = render(<WeeklyReportSection />);
    const chip = screen.getByText(`${faNum(10)} فعالیت امروز`);
    expect(chip.className).toContain("bg-emerald-50");
    expect(chip.className).toContain("text-emerald-700");
    expect(chip.getAttribute("title")).toContain("حلقهٔ زمردی");
    // سنجشِ چیپ با نوار: خانهٔ امروز (حلقهٔ زمردی) همان ۱۰ را در title میگوید
    const bar = container.querySelector(".ring-emerald-500\\/60");
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("title")).toContain(`— ${faNum(10)} فعالیت`);
  });

  it("امروزِ خالی: چیپِ «۰ فعالیت امروز» خنثی است (صفرِ صادق دیده میشود، نه زمردیِ ساختگی)", () => {
    const { container } = render(<WeeklyReportSection />);
    const chip = screen.getByText(`${faNum(0)} فعالیت امروز`);
    expect(chip.className).toContain("bg-stone-100");
    expect(chip.className).toContain("text-stone-500");
    expect(chip.className).not.toContain("emerald");
    // نوار هم همان صفرِ صادق را میگوید — دو سطح، یک عدد
    const bar = container.querySelector(".ring-emerald-500\\/60");
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("title")).toContain(`— ${faNum(0)} فعالیت`);
  });

  it("فقط «امروز» را میخواند نه پنجرهٔ هفته را: دیروزِ ۵تایی، امروزِ خالی → چیپِ صفر", () => {
    useStudy.setState({ dayHistory: { [daysAgoKey(1)]: yesterdayStat(5) } });
    render(<WeeklyReportSection />);
    const chip = screen.getByText(`${faNum(0)} فعالیت امروز`);
    expect(chip.className).toContain("bg-stone-100");
    // و چیپِ هفته همان ۵ را دارد (درونِ هدر — نه هایلایتهایِ دایجست) — دو چیپ دو پنجره‌اند، یکی نیستند
    const title = screen.getByText("هفته‌نامهٔ پیشرفت");
    const header = title.closest("div")!.parentElement!;
    expect(within(header).getByText(/فعالیت این هفته/)).toHaveTextContent(faNum(5));
  });

  it("قفلِ منبع: دقیقاً یک find رویِ perDay و یک متنِ «فعالیت امروز» — هیچ شمارشِ موازیای", () => {
    const src = reportSrc();
    expect((src.match(/digest\.perDay\.find\(\(p\) => p\.day === today\)/g) ?? []).length).toBe(1);
    expect((src.match(/فعالیت امروز/g) ?? []).length).toBe(1);
  });

  it("اصلاحِ wrapِ هدر (سرریزِ ۱۱pxِ سنجشِ ۳۹۰): ردیفِ هدر flex-wrap دارد و چیپ آخرین فرزندِ ردیفِ برچسبهاست", () => {
    render(<WeeklyReportSection />);
    const title = screen.getByText("هفته‌نامهٔ پیشرفت");
    const header = title.closest("div")!.parentElement!;
    expect(header.className).toContain("flex-wrap");
    // ردیفِ برچسبهایِ نوار: روزِ نخست | هفتهٔ پیش|این هفته | چیپِ امروز — سه فرزند، چیپ آخر (زیرِ خانهٔ راست)
    const chip = screen.getByText(`${faNum(0)} فعالیت امروز`);
    const row = chip.parentElement!;
    expect(row.getAttribute("dir")).toBe("ltr");
    expect(row.children.length).toBe(3);
    expect(row.lastElementChild).toBe(chip);
  });
});
