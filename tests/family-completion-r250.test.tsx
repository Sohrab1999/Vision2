// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۰ — بندِ ① پیشنهادِ ۲۴۹: تکمیلِ خانوادهٔ resumeDoor
//
// دو مصرف‌کنندهٔ آخر (گرامر، مرورِ واژه‌های من) هم opt-in شدند و
// خانوادهٔ «ادامهٔ مطالعه» کامل شد: جایی که یادگیرنده حکم می‌گیرد —
// از گواهیِ آزمون جامع تا آزمونکِ ایستگاهِ متروی گرامر و مرورِ
// نشان‌شده‌ها — راهِ برگشت به ضمیمه هم آن‌جاست.
//
// گاردهایِ این فایل:
//   ① اسکنِ پویا: هر فایلی در src/components/study که propِ مستقلِ
//      resumeDoor بگذرد باید دقیقاً یکی از ده عضوِ ثابت باشد —
//      عضوِ ناشناس (opt-inِ ناخواسته) و عضوِ غایب (opt-outِ ناخواسته)
//      هر دو بی‌درنگ دیده می‌شوند؛ قوی‌ترین شکلِ سرشماری.
//   ② قفلِ منبعِ گرامر: محلِ فراخوانیِ واحدِ QuizEngine در grammar-view
//      هر دو نوعِ سشن (آزمونک ایستگاه + آزمون شناختِ خط) را پوشش می‌دهد
//      و category="grammar" حفظ شده.
//   ③ قفلِ منبعِ مرورِ واژه‌ها: resultKeyStr="my-words" با resumeDoor
//      و trackMistakes={false} در همان فراخوانی.
//   ④ سطحِ کامپوننت: QuizResult با resumeDoor و رکوردِ واقعیِ درسنامه،
//      ردیفِ «ادامهٔ مطالعه» را بینِ کارتِ حکم و مرورِ سؤال‌ها رندر
//      می‌کند — و کلیکش با اکشنِ واقعیِ store به لنگرِ همان لایه
//      می‌رود (پرش ≠ نوشتن: رکورد و استورِ یادگیری دست‌نخورده).
//   ⑤ صداقتِ nav-resume: بی‌رکورد = حتی با resumeDoor هم هیچِ ردیفی.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import QuizResult from "@/components/study/quiz/quiz-result";
import { writeAppendixResume, readAppendixResume } from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import type { QuizQuestion } from "@/lib/study-types";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const ROOT = join(process.cwd(), "src/components/study");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

// ده عضوِ ثابتِ خانواده — مسیرهایِ نسبی از src/components/study
const FAMILY_TEN = [
  "exam/exam-view.tsx",
  "exam/konkur-view.tsx",
  "grammar/grammar-view.tsx",
  "lesson/dictionary-view.tsx",
  "lesson/lesson-tests-tab.tsx",
  "lesson/syn-ant-tab.tsx",
  "practice/danger-words.tsx",
  "practice/my-words-review.tsx",
  "practice/review-view.tsx",
  "practice/smart-practice-view.tsx",
].map((p) => join(ROOT, p).replace(/\\/g, "/"));

const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};

const q: QuizQuestion = {
  id: "q-r250-1",
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

describe("تکمیلِ خانوادهٔ «ادامهٔ مطالعه» — r250 ①", () => {
  it("① اسکنِ پویا: دقیقاً ده opt-in در کلِ درختِ study — نه عضوِ ناشناس، نه عضوِ غایب", () => {
    const found = walk(ROOT)
      .filter((p) => /^\s*resumeDoor\s*$/m.test(readFileSync(p, "utf8")))
      .map((p) => p.replace(/\\/g, "/"))
      .sort();
    expect(found).toEqual([...FAMILY_TEN].sort());
  });

  it("② قفلِ منبعِ گرامر: یک محلِ فراخوانی برای هر دو سشن + category قفل", () => {
    const src = readFileSync(join(ROOT, "grammar/grammar-view.tsx"), "utf8");
    expect(src).toContain('category="grammar"');
    // standalone JSX prop — نه در کامنت و نه در نامِ چیزِ دیگر
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
    // دو نوعِ سشن (آزمونک ایستگاه + آزمون شناختِ خط) از همین یک محل می‌گذرند
    expect(src).toContain("startStationQuiz");
    expect(src).toContain("startProbe");
  });

  it("③ قفلِ منبعِ مرورِ واژه‌ها: resultKey و قراردادِ بی‌اشتباه در همان فراخوانی", () => {
    const src = readFileSync(
      join(ROOT, "practice/my-words-review.tsx"),
      "utf8"
    );
    expect(src).toContain('resultKeyStr="my-words"');
    expect(src).toContain("trackMistakes={false}");
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });

  it("④ نتیجهٔ گرامر با resumeDoor: ردیف بینِ کارتِ حکم و مرور؛ کلیک = اکشنِ واقعیِ store، رکوردِ دست‌نخورده", () => {
    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(
      <QuizResult
        title="آزمونک ایستگاه: حال ساده"
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
    expect(rowIdx).toBe(1);
    expect(reviewIdx).toBeGreaterThan(-1);
    const before = JSON.stringify(readAppendixResume());
    const knownBefore = JSON.stringify(useStudy.getState().known);
    fireEvent.click(row);
    // پرش با اکشنِ واقعیِ store به لنگرِ همان لایه — پرش ≠ نوشتن
    const view = useStudy.getState().view;
    expect(view.type).toBe("appendix");
    expect(view).toMatchObject({ topicId: "t-present-simple" });
    expect(JSON.stringify(readAppendixResume())).toBe(before);
    expect(JSON.stringify(useStudy.getState().known)).toBe(knownBefore);
  });

  it("⑤ صداقتِ nav-resume: بی‌رکورد، حتی با resumeDoor هیچِ ردیفی — هیچِ ردیفِ بی‌کنش", () => {
    render(
      <QuizResult
        title="مرور واژه‌های نشان‌شده"
        questions={[q]}
        answers={[1]}
        correctCount={1}
        resumeDoor
        onRestart={() => {}}
        onExit={() => {}}
      />,
    );
    expect(screen.queryByTestId("results-resume-row")).toBeNull();
  });
});
