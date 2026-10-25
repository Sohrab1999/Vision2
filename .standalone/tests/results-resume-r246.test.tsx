// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۶ — بندِ ② پیشنهادِ ۲۴۵: درِ ششمِ حلقه — خطِ «ادامهٔ مطالعه»
// در تبِ تست‌ها و صفحهٔ نتیجه. قراردادهایی که قفل می‌شوند:
//   ① بی‌رکورد = هیچ (صداقتِ nav-resume — خودِ ردیف تصمیم می‌گیرد)
//   ② با رکورد: ردیف حاضر؛ کلیک = ناوبریِ view به لنگرِ همان لایه از
//     قلابِ مشترک — صفرِ نوشتنِ استور و رکوردِ دست‌نخورده (پرش ≠ نوشتن)
//   ③ صفحهٔ نتیجه: پیش‌فرض (بی‌resumeDoor) حتی با رکورد هیچ ردیفی ندارد —
//     آزمون جامع/کنکور/… دست‌نخورده‌اند؛ فقط مصرف‌کنندهٔ درس opt-in می‌کند
//   ④ صفحهٔ نتیجه با resumeDoor + رکورد: ردیف بینِ کارتِ نتیجه و مرور
//   ⑤ درِ «نتایج» در راهنما: از خانه → تبِ تست‌های درسِ اول؛ از درسِ
//     حاضر → تبِ تست‌های همان درس (اکشن = باز کردنِ خودِ محل)
//   ⑥ تبِ تست‌های idle: ردیف زیرِ کارت‌ها حاضر است و همان پرش را می‌کند
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import AppendixResumeRow from "@/components/study/shared/appendix-resume-row";
import QuizResult from "@/components/study/quiz/quiz-result";
import LessonTestsTab from "@/components/study/lesson/lesson-tests-tab";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { writeAppendixResume, readAppendixResume } from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { lesson1 } from "@/data/lesson1";
import type { QuizQuestion } from "@/lib/study-types";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};

const q: QuizQuestion = {
  id: "q-r246-1",
  category: "vocab",
  question: "She ___ to school every day.",
  options: ["go", "goes", "going", "gone"],
  answer: 1,
  translation: "او هر روز به مدرسه می‌رود.",
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("خطِ «ادامهٔ مطالعه» — ردیفِ مشترکِ درِ ششم — r246 ②", () => {
  it("① بی‌رکورد = هیچ (صداقتِ nav-resume)", () => {
    render(<AppendixResumeRow />);
    expect(screen.queryByTestId("results-resume-row")).toBeNull();
  });

  it("② با رکورد: ردیف حاضر؛ کلیک = ناوبریِ لنگر + صفرِ نوشتن + رکوردِ دست‌نخورده", () => {
    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(<AppendixResumeRow />);
    const row = screen.getByTestId("results-resume-row");
    expect(row).toHaveTextContent("ادامهٔ مطالعه از «حال ساده»");
    expect(row).toHaveTextContent("در درسنامهٔ جامع");
    const before = JSON.stringify(readAppendixResume());
    const knownBefore = JSON.stringify(useStudy.getState().known);
    fireEvent.click(row);
    // پرش = viewِ لایهٔ همان رکورد (grammar → موضوعِ «حال ساده»)
    const view = useStudy.getState().view;
    expect(view.type).toBe("appendix");
    expect(view).toMatchObject({ topicId: "t-present-simple" });
    // پرش ≠ نوشتن: رکورد و استورِ یادگیری دست‌نخورده
    expect(JSON.stringify(readAppendixResume())).toBe(before);
    expect(JSON.stringify(useStudy.getState().known)).toBe(knownBefore);
  });

  it("③ صفحهٔ نتیجه بدونِ opt-in: حتی با رکورد هیچ ردیفی ندارد (آزمون جامع/کنکور دست‌نخورده)", () => {
    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(
      <QuizResult
        title="تست واژگان — سطح استاندارد"
        questions={[q]}
        answers={[1]}
        correctCount={1}
        onRestart={() => {}}
        onExit={() => {}}
      />,
    );
    expect(screen.queryByTestId("results-resume-row")).toBeNull();
  });

  it("④ صفحهٔ نتیجه با resumeDoor + رکورد: ردیف بینِ کارتِ نتیجه و مرورِ سؤال‌ها", () => {
    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(
      <QuizResult
        title="تست واژگان — سطح استاندارد"
        questions={[q]}
        answers={[1]}
        correctCount={1}
        resumeDoor
        onRestart={() => {}}
        onExit={() => {}}
      />,
    );
    const row = screen.getByTestId("results-resume-row");
    expect(row).toHaveTextContent("ادامهٔ مطالعه از «حال ساده»");
    // جایِ درست: بعد از کارتِ نتیجه، قبل از مرورِ سؤال‌به‌سؤال
    const container = row.parentElement!;
    const rowIdx = Array.from(container.children).indexOf(row);
    const reviewIdx = container.textContent!.indexOf("پاسخ شما");
    expect(rowIdx).toBe(1); // کارتِ نتیجه اول، ردیف دوم
    expect(reviewIdx).toBeGreaterThan(-1);
    fireEvent.click(row);
    expect(useStudy.getState().view).toMatchObject({ type: "appendix", topicId: "t-present-simple" });
  });
});

describe("درِ «نتایج» در راهنما — اکشن = باز کردنِ خودِ محل — r246 ②", () => {
  it("⑤ از خانه → تبِ تست‌های درسِ اول؛ از درسِ حاضر → تبِ تست‌های همان درس", () => {
    const { unmount } = render(<ShortcutGuide />);
    // راهنما را با رویدادِ سراسری باز می‌کنیم
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    fireEvent.click(screen.getByTestId("resume-door-results"));
    expect(useStudy.getState().view).toMatchObject({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("tests");
    unmount();

    useStudy.setState({
      view: { type: "lesson", id: 3 },
      lessonTab: "vocab",
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<ShortcutGuide />);
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    fireEvent.click(screen.getByTestId("resume-door-results"));
    expect(useStudy.getState().view).toMatchObject({ type: "lesson", id: 3 });
    expect(useStudy.getState().lessonTab).toBe("tests");
  });
});

describe("ردیف در تبِ تست‌های idle — زیرِ کارت‌ها — r246 ②", () => {
  it("⑥ با رکورد: ردیف زیرِ کارت‌های تست حاضر است و همان پرش را می‌کند؛ بی‌رکورد = هیچ", () => {
    const { unmount } = render(<LessonTestsTab lesson={lesson1} />);
    expect(screen.queryByTestId("results-resume-row")).toBeNull(); // بی‌رکورد
    unmount();

    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(<LessonTestsTab lesson={lesson1} />);
    const row = screen.getByTestId("results-resume-row");
    expect(row).toHaveTextContent("ادامهٔ مطالعه از «حال ساده»");
    fireEvent.click(row);
    expect(useStudy.getState().view).toMatchObject({ type: "appendix", topicId: "t-present-simple" });
  });
});
