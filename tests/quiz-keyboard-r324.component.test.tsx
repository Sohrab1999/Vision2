// @vitest-environment jsdom
// ------------------------------------------------------------------
// r324 — گاردِ محافظِ میانبرهای کیبوردِ QuizEngine:
//   سیم‌کشی از r285 در use-quiz-run سالم است (رقمِ 1-4 همه‌چیدمان + Enter/←).
//   کشفِ QAِ r324: درایورِ E2E با کلیدهای «حرفی» (a-d) اثری روی MCQ نداشت —
//   موتور فقط رقم می‌فهمد (readDigit) و Enterِ بدونِ پاسخ جلو نمی‌پرد؛
//   کلیدهای حرفیِ چاپ باید پیش از درایور به رقم تبدیل شوند. این گارد سیم‌کشیِ
//   موجود را قفل می‌کند تا ریفکتورهای بعدی آن را نشکنند:
//   ① رقم 1-4 (لاتین/فارسی) گزینه را انتخاب می‌کند — بازخوردِ فوری
//   ② Enter بعد از بازخورد → سؤال بعدی
//   ③ در سؤال تایپی، ارقام دزدیده نمی‌شوند (ورودی متن حاکم است)
//   ④ Enter بدون پاسخ جلو نمی‌پرد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastMock } = vi.hoisted(() => ({ toastMock: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

import QuizEngine from "@/components/study/quiz/quiz-engine";
import type { QuizQuestion } from "@/lib/study-types";

// jsdom — scrollIntoView ندارد؛ use-quiz-run بعد از هر پاسخ اسکرول می‌کند
Element.prototype.scrollIntoView = vi.fn();

const QUESTIONS: QuizQuestion[] = [
  {
    id: "kb-1",
    category: "vocab",
    question: "Q1 stem --------------- .",
    options: ["alpha", "beta", "gamma", "delta"],
    answer: 1,
  },
  {
    id: "kb-2",
    category: "vocab",
    question: "Q2 stem --------------- ?",
    options: ["one", "two", "three", "four"],
    answer: 2,
  },
];

const TYPED_Q: QuizQuestion[] = [
  {
    id: "kb-t1",
    category: "vocab",
    kind: "typed" as const,
    question: "write the word: ---------------",
    options: ["word"],
    answer: 0,
    accepted: ["word"],
  },
];

const fireKey = (key: string, code = "") =>
  fireEvent.keyDown(window, { key, code, bubbles: true } as KeyboardEvent);

describe("quiz-engine keyboard shortcuts (r324 — guard the r285 use-quiz-run wiring)", () => {
  beforeEach(() => {
    cleanup();
    toastMock.mockClear();
  });

  it("digit 1-4 picks the option (Latin digit) and shows instant feedback", () => {
    render(
      <QuizEngine
        title="تست"
        questions={QUESTIONS}
        resultKeyStr="1:vocab"
        lessonId="jozve"
        category="vocab"
        immediate
        trackMistakes={false}
        onExit={() => {}}
      />,
    );
    fireKey("2", "Digit2");
    // گزینهٔ 2 = «beta» = پاسخ درست → بازخورد
    expect(screen.getByText("✓ پاسخ درست!")).toBeInTheDocument();
  });

  it("Persian digit ۲ also picks option 2 (layout-proof readDigit)", () => {
    render(
      <QuizEngine
        title="تست"
        questions={QUESTIONS}
        resultKeyStr="1:vocab"
        lessonId="jozve"
        category="vocab"
        immediate
        trackMistakes={false}
        onExit={() => {}}
      />,
    );
    fireKey("۲");
    expect(screen.getByText("✓ پاسخ درست!")).toBeInTheDocument();
  });

  it("Enter after feedback advances to the next question", async () => {
    render(
      <QuizEngine
        title="تست"
        questions={QUESTIONS}
        resultKeyStr="1:vocab"
        lessonId="jozve"
        category="vocab"
        immediate
        trackMistakes={false}
        onExit={() => {}}
      />,
    );
    fireKey("3", "Digit3"); // Q1 پاسخ (gamma — نادرست)
    expect(screen.getByText(/✗ پاسخ درست:/)).toBeInTheDocument();
    fireKey("Enter");
    await waitFor(() => expect(screen.getByText("Q2 stem --------------- ?")).toBeInTheDocument());
  });

  it("Enter without an answer does NOT advance", () => {
    render(
      <QuizEngine
        title="تست"
        questions={QUESTIONS}
        resultKeyStr="1:vocab"
        lessonId="jozve"
        category="vocab"
        immediate
        trackMistakes={false}
        onExit={() => {}}
      />,
    );
    fireKey("Enter");
    expect(screen.getByText("Q1 stem --------------- .")).toBeInTheDocument();
  });

  it("typed questions are not hijacked by digits (typing stays typing)", () => {
    render(
      <QuizEngine
        title="تست تایپی"
        questions={TYPED_Q}
        resultKeyStr="1:vocab"
        lessonId="jozve"
        category="vocab"
        immediate
        trackMistakes={false}
        onExit={() => {}}
      />,
    );
    const input = screen.getByLabelText("پاسخ تایپی") as HTMLInputElement;
    fireEvent.focus(input);
    // رقم داخل ورودیِ تایپ — نباید گزینه‌ای انتخاب شود یا preventDefault شود
    fireEvent.keyDown(input, { key: "2", code: "Digit2", bubbles: true });
    expect(input.value).toBe(""); // ورودی دست‌نخورده (هیچ رفتاری تزریق نشده)
    expect(screen.queryByText("✓ پاسخ درست!")).not.toBeInTheDocument();
  });
});
