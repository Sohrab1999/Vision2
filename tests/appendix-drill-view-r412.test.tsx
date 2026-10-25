// @vitest-environment jsdom
// ------------------------------------------------------------------
// r412 — «دریلها واردِ استور میشوند» — قفلهایِ نما + اسلایس.
//
// قراردادهایِ نما:
//  · پایانِ جلسهٔ کامل فقط یک‌بار trackDrillResult میزند (sessions=1،
//    total=10، correct = همانِ صفحهٔ نتیجه) و یک فعالیتِ آزمونگونه
//    به روز میدهد (dayStat.quizzes)
//  · مرورِ اشتباهها (r401) زیرِجلسهاست — شمارندهٔ جلسه لنگ میزند
//  · جلسهٔ دوم جمع میشود (sessions=2، total=20)
//  · معرفی: بی‌رکورد هیچ ادعایی؛ با رکورد «N جلسهٔ کامل · بهترین X٪»
//  · چیپِ میزبان: بی‌رکورد هیچ؛ با رکورد کنارِ دکمهٔ «تمرین»
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { faNum, percentFa } from "@/lib/study-theme";

const faToNum = (s: string): number =>
  Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));

const openVerbsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
};

const startDrill = () => {
  render(<AppendixView />);
  openVerbsTab();
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
};

const runFullSession = (pattern: (i: number) => number) => {
  for (let i = 0; i < 10; i++) {
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[pattern(i) % 4]);
    fireEvent.click(
      i === 9
        ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

/** نمرهٔ صادقِ صفحهٔ نتیجه — «N درست از ۱۰» */
const resultCorrect = (): number => {
  const el = screen.getByText(/درست از/);
  return faToNum((el.textContent || "").match(/([۰-۹]+) درست از/)![1]);
};

const runReplay = () => {
  const btn = screen.getByRole("button", { name: "مرور اشتباههای تمرین" });
  const n = faToNum(btn.textContent!.match(/\((([۰-۹]+))\)/)![1]);
  fireEvent.click(btn);
  for (let i = 0; i < n; i++) {
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[1]);
    fireEvent.click(
      i === n - 1
        ? screen.getByRole("button", { name: /دیدن نتیجه/ })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

describe("appendix-drill-view r412 — دریلها واردِ استور میشوند", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("پایانِ جلسهٔ کامل: یک‌بار ثبت — sessions=1، total=10، نمرهٔ صفحهٔ نتیجه + یک فعالیتِ روز", () => {
    startDrill();
    runFullSession((i) => i % 4); // قاطی — نمره از صفحهٔ نتیجه خوانده میشود
    const correct = resultCorrect();
    const stat = useStudy.getState().drillStats["verbs"]!;
    expect(stat.sessions).toBe(1);
    expect(stat.total).toBe(10);
    expect(stat.correct).toBe(correct);
    expect(stat.bestPercent).toBe(percent(correct, 10));
    expect(stat.lastDay).not.toBe("");
    // جلسهٔ کامل، یک فعالیتِ آزمونگونه است (زنجیره/هدف) — شمارندهٔ روزِ کوئیز
    expect(useStudy.getState().dayStat.quizzes).toBe(1);
  });

  it("مرورِ اشتباهها شمرده نمیشود — sessions بعدِ مرور لنگ میزند", () => {
    startDrill();
    runFullSession((i) => i % 4);
    const afterFull = useStudy.getState().drillStats["verbs"]!;
    expect(afterFull.sessions).toBe(1);
    // الگویِ قاطی نادرست دارد — دکمهٔ مرور بالاست (قفلِ r401)
    runReplay();
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    const afterReplay = useStudy.getState().drillStats["verbs"]!;
    expect(afterReplay.sessions).toBe(1);
    expect(afterReplay).toEqual(afterFull); // هیچ شمارندهای جابهجا نشد
  });

  it("جلسهٔ دوم جمع میشود — sessions=2، total=20؛ بهترینِ درصد هرگز نمیبُرد", () => {
    startDrill();
    runFullSession((i) => i % 4);
    const firstBest = useStudy.getState().drillStats["verbs"]!.bestPercent;
    fireEvent.click(screen.getByRole("button", { name: "تمرین دوباره" }));
    runFullSession((i) => (i + 1) % 4);
    const second = useStudy.getState().drillStats["verbs"]!;
    expect(second.sessions).toBe(2);
    expect(second.total).toBe(20);
    expect(second.bestPercent).toBeGreaterThanOrEqual(firstBest);
  });

  it("معرفی: بی‌رکورد هیچ ادعایی؛ با رکورد «N جلسهٔ کامل · بهترین X٪»", () => {
    startDrill();
    runFullSession((i) => i % 4);
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول افعال از نتیجه" }));
    // ورود دوباره: دکمهٔ «تمرین» → معرفی با پیشرفتِ ماندگار
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    const stat = useStudy.getState().drillStats["verbs"]!;
    expect(
      screen.getByLabelText(
        `پیشرفت این تمرین: ${faNum(stat.sessions)} جلسهٔ کامل، بهترین ${percentFa(stat.bestPercent)}`,
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
    // جلسهٔ تازه — پیشرفت کهنه دوباره در معرفیِ جلسه نیست (فاز run)
    expect(screen.queryByLabelText(/پیشرفت این تمرین/)).toBeNull();
  });

  it("بی‌رکورد: معرفی و چیپِ میزبان هیچ رندر نمیکنند — ادعایِ صفر صادق", () => {
    render(<AppendixView />);
    openVerbsTab();
    expect(screen.queryByLabelText(/پیشرفت این تمرین/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByLabelText(/پیشرفت این تمرین/)).toBeNull();
  });

  it("چیپِ میزبان: با رکورد، کنارِ دکمهٔ «تمرین» با شمارشِ فارسی بالامیآید", () => {
    // بذرِ مستقیمِ استور — واحدِ تحتِ آزمون چیپ است، نه مسیرِ ثبتِ جلسه
    useStudy.setState({
      drillStats: { verbs: { sessions: 3, correct: 24, total: 30, bestPercent: 80, lastDay: "2026-10-25" } },
    });
    render(<AppendixView />);
    openVerbsTab();
    expect(
      screen.getByLabelText("پیشرفت این تمرین: ۳ جلسهٔ کامل، بهترین ۸۰٪"),
    ).toBeTruthy();
    // دیگرِ بانکها بی رکورد — چیپِ ایشان نمیآید
    fireEvent.click(screen.getByRole("button", { name: "جدول تلفظ (IPA)" }));
    expect(screen.queryByLabelText(/پیشرفت این تمرین/)).toBeNull();
  });
});
