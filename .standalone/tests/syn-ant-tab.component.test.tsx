// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 202 — رندرِ هشتمین تبِ درس «مترادف و متضاد»:
//   ① جدولِ مترادفِ درس ۱ (۴۰ ردیف) با جفت‌های واقعیِ جزوه + روخوانی
//   ② درسِ بی‌متضاد (۱) بخشِ متضاد ندارد — نه صفرِ ساختگی
//   ③ درسِ سه (۵۵ مترادف + ۶۸ متضاد) هر دو بخش را دارد
//   ④ سوییچ به تمرین + شروع → موتورِ تستِ خانه با سؤالِ هم‌معنی رندر می‌شود
//   ⑤ بهترین نتیجهٔ قبلی از استور خوانده می‌شود (زیرمجموعهٔ صادق)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import SynAntTab from "@/components/study/lesson/syn-ant-tab";
import { useStudy } from "@/lib/study-store";
import { findLesson } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ results: {} });
});

describe("SynAntTab — جدول", () => {
  it("درس ۱: چیپِ شمارنده با ارقام فارسی، ۴۰ ردیفِ مترادف، بدونِ بخشِ متضاد", () => {
    render(<SynAntTab lesson={findLesson(1)!} />);
    expect(screen.getByText(/مترادف: ۴۰ · متضاد: ۰/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "جدول مترادف‌ها" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "جدول متضادها" })).toBeNull();
    // جفتِ واقعیِ جزوه روی صفحه است
    expect(screen.getByText("absolutely", { selector: "[dir='ltr']" })).toBeInTheDocument();
    expect(screen.getByText("surely", { selector: "[dir='ltr']" })).toBeInTheDocument();
    // ۴۰ ردیف = ۴۰ دکمهٔ روخوانیِ جفت + ستونِ سمتِ چپ (SpeakButton هر ردیف)
    const rows = screen.getByRole("region", { name: "جدول مترادف‌ها" }).querySelectorAll("li");
    expect(rows).toHaveLength(40);
  });

  it("درس ۳: بخشِ متضاد با جفتِ واقعی «borrow ↔ lend» رندر می‌شود", () => {
    render(<SynAntTab lesson={findLesson(3)!} />);
    expect(screen.getByRole("region", { name: "جدول متضادها" })).toBeInTheDocument();
    expect(screen.getByText("borrow", { selector: "[dir='ltr']" })).toBeInTheDocument();
    expect(screen.getByText("lend", { selector: "[dir='ltr']" })).toBeInTheDocument();
  });

  it("بهترین نتیجهٔ ثبت‌شدهٔ همین درس زیر کلیدِ 3:synant دیده می‌شود", () => {
    useStudy.setState({
      results: { "3:synant": { correct: 6, total: 8, percent: 75, at: new Date().toISOString() } },
    });
    render(<SynAntTab lesson={findLesson(3)!} />);
    expect(screen.getByText(/بهترین نتیجه: ۷۵٪/)).toBeInTheDocument();
  });
});

describe("SynAntTab — تمرین", () => {
  it("سوییچ تمرین → پنلِ شروع → QuizEngine با سؤالِ هم‌معنی رندر می‌شود", () => {
    render(<SynAntTab lesson={findLesson(1)!} />);
    fireEvent.click(screen.getByRole("button", { name: /تمرین/ }));
    expect(screen.getByText("تمرینِ چهارگزینه‌ای")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /شروع تمرین مترادف و متضاد/ }));
    // QuizEngine: عنوانِ سشن + حداقل یک ساقه‌سؤالِ هم‌معنی از جدولِ درس ۱
    expect(screen.getByText(/مترادف و متضاد درس — فهمیدن مردم/)).toBeInTheDocument();
    const stems = screen.getAllByText(/کدام واژه هم‌معنیِ «.+» است؟/);
    expect(stems.length).toBeGreaterThan(0);
  });

  it("درس ۱ هیچ سؤالِ متضادی تولید نمی‌کند (جدولِ متضاد ندارد)", () => {
    render(<SynAntTab lesson={findLesson(1)!} />);
    fireEvent.click(screen.getByRole("button", { name: /تمرین/ }));
    fireEvent.click(screen.getByRole("button", { name: /شروع تمرین مترادف و متضاد/ }));
    expect(screen.queryAllByText(/کدام واژه متضادِ/)).toHaveLength(0);
  });
});
