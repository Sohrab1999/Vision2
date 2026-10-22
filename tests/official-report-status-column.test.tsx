// @vitest-environment jsdom
// ------------------------------------------------------------------
// تسک ۱۸۴ — «ستونِ وضعیت» در جدولِ درس‌به‌درسِ کاغذِ رسمی — نردبانِ
// ۱۸۰/۱۸۱ (تلاش‌نشده/ضعیف/خوب/عالی) این‌بار رویِ میانگینِ هر درس و
// درونِ ستونِ اختصاصی. قراردادهایی که قفل می‌شوند:
//  ① سرستونِ «وضعیت» بلافاصله بعدِ «میانگین» (منبعِ خودش) هست
//  ② تازه‌وارد: خطِ تیرهٔ صادقانهٔ stone-500 — نه صفرِ ساختگی
//  ③ ۹۰=عالیِ زمردی، ۶۰=خوبِ بی‌رنگ‌بازیِ پررنگ، ۳۰=ضعیفِ or-bad
//     (متنِ جانشینِ رنگ — همان درسِ فتوکپیِ ۱۸۱)
//  ④ مرزِ ۸۵ عالی است (میانگینِ ۸۰+۹۰)، مرزِ ۵۰ هنوز خوب است
//  ⑤ آستانه‌ها از «یک» منبعِ کانونی می‌آیند: coverageStatus در
//     coverage-csv.ts — همان تابعی که CSVِ ۱۸۰ صادر می‌کند
// seed هم‌الگوی ۱۷۶/۱۸۱: setState مستقیم رویِ استور؛ جست‌وجو همیشه
// داخلِ sectionِ «عملکرد درس‌به‌درس» با within انجام می‌شود.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, within } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import OfficialReport from "@/components/study/reports/official-report";
import { coverageStatus } from "@/lib/coverage-csv";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const seedResults = (r: Record<string, { percent: number; at?: string }>) =>
  useStudy.setState({ results: r as never });

/** بخشِ «عملکرد درس‌به‌درس» — همان جدولی که ستونِ تازه دارد */
const perLessonSection = (): HTMLElement => {
  const section = [...document.querySelectorAll("section")].find((s) =>
    s.textContent?.includes("عملکرد درس‌به‌درس")
  );
  expect(section).not.toBeNull();
  return section! as HTMLElement;
};

/** سلولِ وضعیت = پنجمین tdِ هر سطر (درس/واژگان/آزمون‌ها/میانگین/وضعیت/…) */
const statusCellOf = (row: HTMLElement): HTMLElement =>
  row.querySelectorAll("td")[4] as HTMLElement;

describe("ستونِ وضعیت در جدولِ درس‌به‌درس — کامپوننت (Task 184)", () => {
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

  it("سرستونِ «وضعیت» بعدِ «میانگین» هست؛ تازه‌وارد: خطِ تیرهٔ صادقانه — نه صفرِ ساختگی", () => {
    render(<OfficialReport open onClose={() => {}} />);
    const section = perLessonSection();
    const headers = [...section.querySelectorAll("th")].map((th) => th.textContent);
    const avgIdx = headers.indexOf("میانگین");
    expect(headers[avgIdx + 1]).toBe("وضعیت");
    // هر سه درسِ بی‌نتیجه: «—» با توکنِ مجازِ stone-600 (قراردادِ ۱۷۲؛ r328: ۵۰۰→۶۰۰ برایِ زبرایِ ۴٫۴۰یِ مرزی)
    for (const id of [1, 2, 3]) {
      const row = within(section).getByText(`درس ${["۱", "۲", "۳"][id - 1]}`).closest("tr")!;
      const cell = statusCellOf(row);
      expect(cell).toHaveTextContent("—");
      expect(cell.querySelector("span.text-stone-600")).not.toBeNull();
      expect(cell.textContent).not.toContain("۰");
    }
  });

  it("سه باند در یک نگاه: ۹۰=عالیِ زمردی، ۶۰=خوبِ پررنگِ بی‌رنگ‌بازی، ۳۰=ضعیفِ or-bad", () => {
    seedResults({
      "1:vocab": { percent: 90, at: "2026-10-10" },
      "2:vocab": { percent: 60, at: "2026-10-11" },
      "3:vocab": { percent: 30, at: "2026-10-12" },
    });
    render(<OfficialReport open onClose={() => {}} />);
    const section = perLessonSection();
    const row1 = within(section).getByText("درس ۱").closest("tr")!;
    const ex = statusCellOf(row1);
    expect(ex).toHaveTextContent("عالی");
    expect(ex.querySelector("span.text-emerald-700")).not.toBeNull();
    // خوب: متنِ پررنگ — برچسبِ باندِ میانه در «ستون» لازم است (برخلافِ
    // زیرِ-عددیِ ۱۸۱ که آنجا میانه بی‌برچسب می‌ماند)
    const row2 = within(section).getByText("درس ۲").closest("tr")!;
    const mid = statusCellOf(row2);
    expect(mid).toHaveTextContent("خوب");
    expect(mid.querySelector("span.font-black")).not.toBeNull();
    expect(mid.querySelector(".or-bad")).toBeNull();
    // ضعیف: or-bad قرمزِ معلم‌دیده — متن هم هست تا در فتوکپی نمیرد
    const row3 = within(section).getByText("درس ۳").closest("tr")!;
    const weak = statusCellOf(row3);
    expect(weak).toHaveTextContent("ضعیف");
    expect(weak.querySelector("span.or-bad")).not.toBeNull();
  });

  it("مرزها: میانگینِ ۸۰+۹۰=۸۵ عالی است، ۵۰ هنوز خوب — و آستانه‌ها با libِ کانونیِ CSV یکی‌اند", () => {
    seedResults({
      "1:vocab": { percent: 80, at: "2026-10-10" },
      "1:dictation": { percent: 90, at: "2026-10-11" },
      "2:vocab": { percent: 50, at: "2026-10-12" },
    });
    render(<OfficialReport open onClose={() => {}} />);
    const section = perLessonSection();
    const row1 = within(section).getByText("درس ۱").closest("tr")!;
    expect(statusCellOf(row1)).toHaveTextContent("عالی");
    const row2 = within(section).getByText("درس ۲").closest("tr")!;
    expect(statusCellOf(row2)).toHaveTextContent("خوب");
    // پانویسِ تازه، نردبان را برایِ معلم رمزگشایی می‌کند
    expect(section).toHaveTextContent("زیرِ ۵۰ «ضعیف»");
    expect(section).toHaveTextContent("۸۵ به بالا «عالی»");
    // منبعِ یگانه: همین تابعی که ستون مصرف می‌کند — pinِ هم‌سویی
    expect(coverageStatus(85)).toBe("عالی");
    expect(coverageStatus(50)).toBe("خوب");
    expect(coverageStatus(49)).toBe("ضعیف");
    expect(coverageStatus(null)).toBe("تلاش‌نشده");
  });
});
