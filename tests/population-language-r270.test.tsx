// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۰ — زبانِ جمعیت: سه خواهرِ هم‌سیم که «جمعیت» را نام می‌برند
//   ① نوارِ دریلِ جفت‌ها جمعیتِ جدولِ دامنه را می‌گوید — «از N ردیفِ
//     جدول (M مترادف · K متضاد)» — همان سطرهایی که buildSynAntQuiz
//     می‌خواند؛ لنگرها: کلِ ۴۷۷ (۲۹۸/۱۷۹)، L1=۴۰ بی‌متضاد، L3=۱۲۳
//     (پیش‌سنجه لو داد که کامنتِ کهنهٔ ماژولِ ۳۰۹/۲۱۷ غلط است)
//   ② متنِ اشتراکِ نتیجه «ترکیبِ سطح» را می‌گوید (بندِ ① r269) —
//     لنگرِ همه‌پرکاربرد: «📘 واژه‌های این راند: ۸ پرکاربرد»
//   ③ لنگرِ مخلوطِ L4 در متنِ اشتراک (۱/۴/۱/۲) + absenceِ صادقانهٔ
//     خانوادهٔ بی‌word (دریلِ جفت‌ها word ندارد → خطِ tally نمی‌گیرد)
//   ④ عنوانِ دریلِ واژه‌های زنده پسوندِ آستانه می‌گیرد (ایدئومِ r267)
//     — «— واژه‌هایِ ۱۰+ کاربرد» / «— درس ۱ · واژه‌هایِ ۱۰+ کاربرد» /
//     رگرسیونِ آستانهٔ صفر: «— همهٔ درس‌ها»
//   ⑤ صفرِ صادقانهٔ دریلِ زنده: L1×۲۰+ توست می‌دهد، دیالوگ نمی‌شود،
//     پسوندِ عنوان جایی لو نمی‌رود
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import QuizResult from "@/components/study/quiz/quiz-result";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { buildLiveWordsQuiz, buildGrammarExampleQuiz } from "@/lib/live-words-quiz";
import { buildSynAntQuiz } from "@/lib/syn-ant-quiz";
import { usedWordRank } from "@/lib/word-usage";
import { usageTierLabel } from "@/lib/lens-csv";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

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
  toastSpy.mockClear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "reading",
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

/** آینهٔ مستقلِ جمعیتِ جدولِ دامنه — بازنویسیِ تحت‌اللفظیِ قرارداد */
const populationMirror = (lessonId: number | null) => {
  const scope = lessonId === null ? lessons : lessons.filter((l) => l.id === lessonId);
  return scope.reduce(
    (acc, l) => ({ syn: acc.syn + (l.synonyms?.length ?? 0), ant: acc.ant + (l.antonyms?.length ?? 0) }),
    { syn: 0, ant: 0 }
  );
};

/** آینهٔ ترکیبِ سطح — همان قراردادِ کارت و متنِ اشتراک */
const tallyMirror = (words: string[]): string => {
  const counts = new Map<string, number>();
  for (const w of words) {
    const t = usageTierLabel(usedWordRank(w)?.count ?? 0) || "بی‌سطح";
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const segs: string[] = [];
  for (const t of ["پرکاربرد", "میانه", "کم‌کاربرد", "بی‌سطح"]) {
    const n = counts.get(t);
    if (n) segs.push(`${faNum(n)} ${t}`);
  }
  return segs.join(" · ");
};

const baseResult = (questions: QuizQuestion[], answers: number[]) => ({
  title: "دریل واژه‌های زنده",
  questions,
  answers,
  correctCount: answers.filter((a, i) => a === questions[i].answer).length,
  onRestart: vi.fn(),
  onExit: vi.fn(),
});

/** کلیپ‌بوردِ جاسوس‌شده — آخرین متنِ کپی‌شده */
const clipboardSpy = vi.fn().mockResolvedValue(undefined);
const shareViaClipboard = async (questions: QuizQuestion[]) => {
  clipboardSpy.mockClear();
  render(<QuizResult {...baseResult(questions, questions.map((q) => q.answer))} />);
  Object.assign(navigator, { clipboard: { writeText: clipboardSpy } });
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "اشتراک‌گذاری نتیجه" }));
  });
  await act(async () => {
    await Promise.resolve();
  });
  const text = clipboardSpy.mock.calls[0]?.[0] as string;
  cleanup();
  return text;
};

const SRC = resolve(process.cwd(), "src");

describe("r270 — زبانِ جمعیت: نوارِ جفت‌ها، متنِ اشتراک، عنوانِ دریلِ زنده", () => {
  it("① نوارِ دریلِ جفت‌ها جمعیتِ دامنه را می‌گوید — سورس‌قرارداد + مونتِ دو دامنه", () => {
    // سورس‌قرارداد: جمعیت از pairsPopulation می‌آید — نه عددِ دستی
    const src = readFileSync(resolve(SRC, "components/study/lesson/dictionary-view.tsx"), "utf8");
    expect(src).toContain("pairsPopulation.syn + pairsPopulation.ant");
    expect(src).toContain("ردیفِ جدول");

    // لنگرهایِ پیش‌سنجه — آینه = سازندهٔ واقعی
    const all = populationMirror(null);
    expect(all).toEqual({ syn: 298, ant: 179 });
    expect(all.syn + all.ant).toBe(477);
    expect(populationMirror(1)).toEqual({ syn: 40, ant: 0 });
    expect(populationMirror(3)).toEqual({ syn: 55, ant: 68 });

    // مونتِ واقعی — لنزِ جفت‌دار، همهٔ درس‌ها
    render(<DictionaryView />);
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    act(() => {
      fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
    });
    const bar = screen.getByTestId("pairs-drill-bar");
    expect(bar.textContent).toContain(
      `همهٔ ${faNum(12)} درس — ${faNum(477)} ردیفِ جدول (${faNum(298)} مترادف · ${faNum(179)} متضاد)`
    );
    // فیلترِ درس ۱ — جمعیتِ باریکِ بی‌متضادِ صادقانه (نامِ کامل — /درس ۱/ با ۱۰/۱۱/۱۲ هم‌پیشوند است)
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    expect(bar.textContent).toContain(
      `درس ${faNum(1)} — ${faNum(40)} ردیفِ جدول (${faNum(40)} مترادف · ${faNum(0)} متضاد)`
    );
    // درس ۳ — تنها درسی که هر دو جهتش سنگین است (۵۵/۶۸)
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /درس ۳/ }));
    });
    expect(bar.textContent).toContain(`(${faNum(55)} مترادف · ${faNum(68)} متضاد)`);
  });

  it("② متنِ اشتراک ترکیبِ سطح را می‌گوید — لنگرِ همه‌پرکاربرد", async () => {
    const live = buildLiveWordsQuiz(lessons);
    const text = await shareViaClipboard(live);
    expect(text).toContain("📘 واژه‌های این راند: ۸ پرکاربرد");
    expect(text).toBe(
      `🏆 نتیجهٔ من در وب‌کتاب «Vision Two»\nدریل واژه‌های زنده\n⭐ ${faNum(100)}٪ (${faNum(8)} از ${faNum(8)})\n📘 واژه‌های این راند: ${tallyMirror(live.map((q) => q.word!))}`
    );
  });

  it("③ لنگرِ مخلوطِ L4 در متنِ اشتراک + absenceِ صادقانهٔ خانوادهٔ بی‌word", async () => {
    const l4 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 4));
    const text = await shareViaClipboard(l4);
    expect(text).toContain(`📘 واژه‌های این راند: ${tallyMirror(l4.map((q) => q.word!))}`);
    expect(text).toContain("۱ پرکاربرد · ۴ میانه · ۱ کم‌کاربرد · ۲ بی‌سطح");

    // دریلِ جفت‌ها — سؤال‌هایش word ندارند؛ نه چیپِ tally، نه خطِ 📘
    const pairs = buildSynAntQuiz(lessons[0]);
    expect(pairs.every((q) => !q.word)).toBe(true);
    render(<QuizResult {...baseResult(pairs, pairs.map((q) => q.answer))} />);
    expect(screen.queryByTestId("quiz-tier-tally")).not.toBeInTheDocument();
    Object.assign(navigator, { clipboard: { writeText: clipboardSpy } });
    clipboardSpy.mockClear();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "اشتراک‌گذاری نتیجه" }));
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(clipboardSpy.mock.calls[0][0]).not.toContain("واژه‌های این راند");
    cleanup();
  });

  it("④ عنوانِ دریلِ واژه‌های زنده پسوندِ آستانه می‌گیرد — ایدئومِ r267", { timeout: 30000 }, () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // آستانهٔ ۱۰+ — همهٔ درس‌ها: «دریل واژه‌های زنده — واژه‌هایِ ۱۰+ کاربرد»
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    expect(screen.getAllByText("دریل واژه‌های زنده — واژه‌هایِ ۱۰+ کاربرد").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // درسِ ۱ + آستانهٔ ۱۰+ — پسوندِ مرکبِ r267؛ لنگرِ ۵ سؤالِ پیش‌سنجه
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    expect(screen.getAllByText("دریل واژه‌های زنده — درس ۱ · واژه‌هایِ ۱۰+ کاربرد").length).toBeGreaterThan(0);
    expect(buildLiveWordsQuiz(lessons.filter((l) => l.id === 1), 8, 10)).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));

    // رگرسیونِ r257 — آستانهٔ صفر: عنوانِ قدیمیِ «همهٔ درس‌ها» دست‌نخورده
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10")); // توگل = پاک‌کردن
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    expect(screen.getAllByText("دریل واژه‌های زنده — درس ۱").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
  });

  it("⑤ صفرِ صادقانهٔ دریلِ زنده: L1×۲۰+ توست می‌دهد و دیالوگ نمی‌شود", () => {
    // لنگرِ پیش‌سنجه: تقاطعِ تهی — ۰ سؤال
    expect(buildLiveWordsQuiz(lessons.filter((l) => l.id === 1), 8, 20)).toHaveLength(0);

    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    expect(toastSpy).toHaveBeenCalledWith({ title: "سؤالِ قابلِ ساختی از این دامنه نبود" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // نوار هنوز آستانه را اعلام می‌کند — همان قراردادِ r258
    const bar = screen.getByTestId("live-drill-bar");
    expect(bar.textContent).toContain(`فقط واژه‌هایِ ${faNum(20)}+ کاربرد`);
  });
});
