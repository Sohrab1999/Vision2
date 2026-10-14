// @vitest-environment jsdom
// ------------------------------------------------------------------
// تسک ۱۷۶ — «پوشش مهارت‌ها» رویِ کاغذِ گزارشِ رسمی — نخستین مصرفِ
// دوبارهٔ libِ ۱۷۴/۱۷۵ در بسترِ چاپی. قراردادهایی که قفل می‌شوند:
//  ① بخشِ or-coverage همیشه رویِ کاغذ حاضر است (تازه‌وارد = حالتِ خالیِ
//     صادقانه — گزارشِ رسمی هیچ‌وقت لنگِ بخش نمی‌ماند)
//  ② تازه‌وارد: «هنوز هیچ مهارتی تلاش نشده» + چیپِ «۰ از ۱۸»
//  ③ seed: سلولِ «۸۵٪» در جدول، چیپِ شمارش، ستونِ «گام بعدی» = نخستینِ
//     خالیِ ترتیبِ کانونی (vocab→dictation→…)، میانگینِ پانویسِ ۹۰٪
//  ④ سلولِ زیرِ ۵۰٪ با or-bad قرمزِ معلم‌دیده — هشدارِ چاپیِ بی‌رنگ‌بازی
//  ⑤ هر شش ستونِ یک درس پوشیده → «کامل» زمردی
//  ⑥ متنِ کم‌رنگ رویِ کاغذ stone-500 است — توکنِ منسوخِ ۴۰۰ ممنوع (۱۷۲)
// seed هم‌الگوی weekly-report/coverage-map: setState مستقیم رویِ استور.
// درسِ راند: «درس ۱..۳» هم در جدولِ درس‌به‌درس هست هم اینجا — جست‌وجوی
// سطرِ ما همیشه داخلِ section.or-coverage با within انجام می‌شود.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, within } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import OfficialReport from "@/components/study/reports/official-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const seedResults = (r: Record<string, { percent: number; at?: string }>) =>
  useStudy.setState({ results: r as never });

describe("پوشش مهارت‌ها رویِ کاغذِ رسمی — کامپوننت (Task 176)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      known: {},
      results: {},
      srs: {},
      mistakes: {},
      history: {},
      dayHistory: {},
      streak: 0,
      bestStreak: 0,
    });
  });

  it("تازه‌وارد: بخش حاضر است — حالتِ خالیِ صادقانه + چیپِ «۰ از ۱۸»", () => {
    render(<OfficialReport open onClose={() => {}} />);
    const section = document.querySelector("section.or-coverage");
    expect(section).not.toBeNull();
    expect(section).toHaveTextContent("پوشش مهارت‌ها");
    expect(section).toHaveTextContent("۰ از ۱۸ تلاش‌شده");
    expect(section).toHaveTextContent("هنوز هیچ مهارتی تلاش نشده — با اولین تست، این جدول پر می‌شود.");
    // جدول در حالتِ خالی رندر نمی‌شود — دروغِ ساختگی ممنوع
    expect(section!.querySelector("table")).toBeNull();
  });

  it("seed ۱:vocab=۸۵ + ۱:dictation=۹۵: سلول‌ها، چیپِ «۲ از ۱۸»، گامِ بعدیِ درس ۱ = شنیداری، پانویسِ ۹۰٪", () => {
    seedResults({
      "1:vocab": { percent: 85, at: "2026-10-10" },
      "1:dictation": { percent: 95, at: "2026-10-11" },
    });
    render(<OfficialReport open onClose={() => {}} />);
    const section = document.querySelector("section.or-coverage")! as HTMLElement;
    expect(section).toHaveTextContent("۲ از ۱۸ تلاش‌شده");
    // سلول‌هایِ تلاش‌شده با بهترینِ واقعی
    expect(within(section).getAllByText("۸۵٪").length).toBeGreaterThanOrEqual(1);
    expect(within(section).getAllByText("۹۵٪").length).toBeGreaterThanOrEqual(1);
    // سرستون‌هایِ کوتاه از قراردادِ دوطرفه
    expect(within(section).getByText("واژگان")).toBeInTheDocument();
    expect(within(section).getByText("کنکوری")).toBeInTheDocument();
    // گامِ بعدیِ درس ۱: نخستینِ خالی پسِ واژگان/دیکته = شنیداری
    const row1 = within(section).getByText("درس ۱").closest("tr")!;
    expect(row1).toHaveTextContent("شنیداری");
    // میانگینِ بهترین‌ها: (85+95)/2 = 90
    expect(section).toHaveTextContent("میانگینِ بهترینِ نمراتِ تلاش‌شده: ۹۰٪");
    // سلول‌هایِ خالیِ درس ۲: خطِ تیره — نه صفرِ ساختگی
    const row2 = within(section).getByText("درس ۲").closest("tr")!;
    expect(row2).toHaveTextContent("—");
  });

  it("نمرهٔ زیرِ ۵۰٪: سلول or-bad — هشدارِ قرمزِ معلم‌دیده رویِ کاغذ؛ ۸۸٪ سالم or-bad نمی‌گیرد", () => {
    seedResults({
      "2:vocab": { percent: 30, at: "2026-10-12" },
      "3:vocab": { percent: 88, at: "2026-10-12" },
    });
    render(<OfficialReport open onClose={() => {}} />);
    const section = document.querySelector("section.or-coverage")! as HTMLElement;
    const row2 = within(section).getByText("درس ۲").closest("tr")!;
    const badCell = row2.querySelector("td.or-bad");
    expect(badCell).not.toBeNull();
    expect(badCell).toHaveTextContent("۳۰٪");
    const row3 = within(section).getByText("درس ۳").closest("tr")!;
    expect(row3.querySelector("td.or-bad")).toBeNull();
    expect(row3).toHaveTextContent("۸۸٪");
  });

  it("هر شش ستونِ یک درس پوشیده → «کامل» زمردی", () => {
    seedResults({
      "1:vocab": { percent: 80, at: "2026-10-10" },
      "1:dictation": { percent: 80, at: "2026-10-10" },
      "1:listening": { percent: 80, at: "2026-10-10" },
      "1:writing": { percent: 80, at: "2026-10-10" },
      "1:vocab-konkuri": { percent: 80, at: "2026-10-10" },
      "1:grammar": { percent: 80, at: "2026-10-10" },
    });
    render(<OfficialReport open onClose={() => {}} />);
    const section = document.querySelector("section.or-coverage")! as HTMLElement;
    const row1 = within(section).getByText("درس ۱").closest("tr")!;
    expect(row1).toHaveTextContent("کامل");
    expect(row1.querySelector("td.text-emerald-700")).not.toBeNull();
  });

  it("متنِ کم‌رنگِ بخش stone-500 است — توکنِ منسوخِ stone-400 در هیچ سلولی نمی‌آید (قراردادِ ۱۷۲)", () => {
    seedResults({ "1:vocab": { percent: 85, at: "2026-10-10" } });
    render(<OfficialReport open onClose={() => {}} />);
    const section = document.querySelector("section.or-coverage")! as HTMLElement;
    expect(section.innerHTML).not.toContain("text-stone-400");
    expect(section.innerHTML).toContain("text-stone-500");
  });
});
