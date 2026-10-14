// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۱۹۷ — گواهیِ پایان‌ترمِ پایه‌محور (کارتِ DOM).
//
// قراردادهایی که قفل می‌شوند:
//   ① مُهرِ خانواده (cert-seal) روی کارتِ گواهی هست — و روی کارتِ
//     استاندارد هیچ‌گز (هرگز بی‌مُهرِ اشتباه)
//   ② نوارِ نام: «گواهیِ عملکردِ …» با نامِ ذخیره‌شده یا فرودِ
//     «یادگیرندهٔ کوشا»
//   ③ حاشیهٔ خط‌چین با خانوادهٔ پایه (نارنجیِ دهم / زمردیِ یازدهم /
//     بنفشِ دوازدهم) و فرودِ کهربایِ طلایی برای خانوادهٔ ناشناخته
//   ④ فوترِ پایه‌محور: «… دبیرستان · پایهٔ دهم» — دیگر هیچ گواهیِ
//     دهمی «یازدهم» نامیده نمی‌شود (کم‌گزارشیِ کپی)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import QuizResult from "@/components/study/quiz/quiz-result";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const questions = [1, 2, 3].map((n) => ({
  id: `l7-g${n}`,
  category: "grammar" as const,
  question: `Q${n}?`,
  options: ["a", "b", "c", "d"],
  answer: 1,
  translation: `ترجمهٔ ${n}`,
}));

const base = {
  title: "آزمون پایان‌ترم پایهٔ دهم",
  questions,
  answers: [1, 1, 0],
  correctCount: 2,
  onRestart: vi.fn(),
  onExit: vi.fn(),
};

beforeEach(() => {
  cleanup();
  useStudy.setState({ userName: "" });
});

describe("QuizResult certificate — گواهیِ پایه‌محور", () => {
  it("grade-10 final wears the orange family: seal + dashed border + grade footer", () => {
    const { container } = render(<QuizResult {...base} certificate accentFamily="orange" gradeLabel="پایهٔ دهم" />);
    expect(screen.getByTestId("cert-seal")).toBeInTheDocument();
    expect(screen.getByTestId("cert-name")).toHaveTextContent("گواهیِ عملکردِ یادگیرندهٔ کوشا");
    const dashed = container.querySelector(".border-dashed");
    expect(dashed?.className).toContain("border-orange-300");
    expect(screen.getByText(/وب‌کتاب تعاملی زبان انگلیسی دبیرستان · پایهٔ دهم/)).toBeInTheDocument();
    // the dishonest «یازدهم» footer is gone
    expect(container.textContent).not.toContain("زبان انگلیسی یازدهم");
  });

  it("grade-11 legacy key lands emerald, grade-12 lands violet", () => {
    const g11 = render(<QuizResult {...base} certificate accentFamily="emerald" gradeLabel="پایهٔ یازدهم" />);
    expect(g11.container.querySelector(".border-dashed")?.className).toContain("border-emerald-300");
    expect(screen.getByText(/· پایهٔ یازدهم/)).toBeInTheDocument();
    cleanup();

    const g12 = render(<QuizResult {...base} certificate accentFamily="violet" gradeLabel="پایهٔ دوازدهم" />);
    expect(g12.container.querySelector(".border-dashed")?.className).toContain("border-violet-300");
    expect(screen.getByText(/· پایهٔ دوازدهم/)).toBeInTheDocument();
  });

  it("unknown family falls back to the amber-gold certificate (never classless)", () => {
    const { container } = render(<QuizResult {...base} certificate accentFamily="platinum" gradeLabel="پایهٔ نامعلوم" />);
    expect(screen.getByTestId("cert-seal")).toBeInTheDocument();
    expect(container.querySelector(".border-dashed")?.className).toContain("border-amber-300");
  });

  it("renders the stored learner name on the certificate band", () => {
    useStudy.setState({ userName: "آرش" });
    render(<QuizResult {...base} certificate accentFamily="orange" gradeLabel="پایهٔ دهم" />);
    expect(screen.getByTestId("cert-name")).toHaveTextContent("گواهیِ عملکردِ آرش");
  });

  it("the standard result card never grows a seal", () => {
    render(<QuizResult {...base} />);
    expect(screen.queryByTestId("cert-seal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cert-name")).not.toBeInTheDocument();
  });
});
