// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۹ — زبانِ پنجمِ سطح: پسوندِ «· سطح» در title هر پنج سایتِ
// چیپِ رتبه + «ترکیبِ سطحِ راند» روی کارتِ نتیجه.
//
// قراردادهایی که قفل می‌شوند:
//   ① پنج سایتِ title (دیکشنری / تب واژگان / WOTD / پشت فلش‌کارت /
//     دیالوگ) از یک عبارت واحد می‌خوانند — سطح از usedWordRank().count
//     مشتق می‌شود نه از ردیفِ قلابی؛ گاردِ سورس‌قرارداد + مونتِ واقعی
//   ② word رویِ خودِ سؤال زندگی می‌کند (مسیرِ مستقیم — ۵۰ واژهٔ
//     خط‌تیره‌دارِ واژگان بازگشتیِ id را مبهم می‌کردند) — دریل زندهٔ
//     همه‌درس و درسِ ۱ = آینهٔ مستقل + لنگرهایِ پرکاربرد=۸
//   ③ لنگرِ ترکیبِ مخلوط — دریل مثال‌هایِ درس ۴: usually/polite/party/
//     invite/found/cousin/dish/umbrella → ۱/۴/۱/۲ (بی‌سطحِ r259 زنده)
//   ④ کارتِ نتیجه: چیپِ «واژه‌های این راند» = آینه، absenceِ صادقانه
//     برایِ خانواده‌هایِ بی‌word (vocab)، و دریلِ درس ۷ (۷ سؤال —
//     سقفِ ۸ برخورد با کمبودِ سؤالِ سالم) با ترکیبِ ۳/۱/۱/۲
//   ⑤ مرزِ خانواده: گواهیِ پایان‌ترم چیپِ ترکیب نمی‌گیرد + titleِ
//     دیالوگ برایِ لنگرهایِ r266 (of/language/communication/ability)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import QuizResult from "@/components/study/quiz/quiz-result";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import UsageDialog from "@/components/study/lesson/usage-dialog";
import { buildLiveWordsQuiz, buildGrammarExampleQuiz } from "@/lib/live-words-quiz";
import { usedWordRank, findWordUsages } from "@/lib/word-usage";
import { usageTierLabel } from "@/lib/lens-csv";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

/** آینهٔ مستقلِ نگاشتِ سطح — بازنویسیِ تحت‌اللفظیِ قرارداد، نه فراخوانِ سیم */
const tierMirror = (count: number): string =>
  count >= 5 ? "پرکاربرد" : count >= 2 ? "میانه" : count === 1 ? "کم‌کاربرد" : "";

/** آینهٔ ترکیب — «N برچسب» به ترتیبِ قراردادِ کارت */
const tallyMirror = (words: string[]): string => {
  const counts = new Map<string, number>();
  for (const w of words) {
    const t = tierMirror(usedWordRank(w)?.count ?? 0) || "بی‌سطح";
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const segments: string[] = [];
  for (const t of ["پرکاربرد", "میانه", "کم‌کاربرد", "بی‌سطح"]) {
    const n = counts.get(t);
    if (n) segments.push(`${faNum(n)} ${t}`);
  }
  return segments.join(" · ");
};

const SRC = resolve(process.cwd(), "src");
const FIVE_SITES = [
  "components/study/lesson/dictionary-view.tsx",
  "components/study/lesson/vocab-tab.tsx",
  "components/study/lesson/word-of-day.tsx",
  "components/study/lesson/flashcards.tsx",
  "components/study/lesson/usage-dialog.tsx",
];
const TITLE_NEEDLE =
  "۱ یعنی پرکاربردترین · سطح: ${usageTierLabel(rank.count)}";

const baseResult = (questions: QuizQuestion[], answers: number[]) => ({
  title: "دریل واژه‌های زنده",
  questions,
  answers,
  correctCount: answers.filter((a, i) => a === questions[i].answer).length,
  onRestart: vi.fn(),
  onExit: vi.fn(),
});

describe("r269 — زبانِ پنجمِ سطح: title چیپ رتبه + ترکیبِ سطحِ کارتِ نتیجه", () => {
  it("① پنج سایتِ title از یک عبارت می‌خوانند — سورس‌قرارداد + مونتِ دیالوگ و دیکشنری", () => {
    // سورس‌قرارداد: دقیقاً همین پنج فایل، هر یک با عبارتِ واحد و importِ سیم
    const hits: string[] = [];
    for (const rel of FIVE_SITES) {
      const src = readFileSync(resolve(SRC, rel), "utf8");
      expect(src, `${rel} باید titleِ سطح‌دار داشته باشد`).toContain(TITLE_NEEDLE);
      expect(src, `${rel} باید usageTierLabel را import کند`).toContain("usageTierLabel");
      hits.push(rel);
    }
    expect(hits).toHaveLength(5);

    // مونتِ واقعیِ دیالوگ — لنگرهایِ r266: of=۹۱ پرکاربرد / communication=۳ میانه
    const { unmount } = render(
      <UsageDialog usage={{ en: "of", sites: findWordUsages("of") }} onClose={() => {}} />
    );
    expect(screen.getByTestId("usage-rank").getAttribute("title")).toContain("· سطح: پرکاربرد");
    unmount();
    render(
      <UsageDialog usage={{ en: "communication", sites: findWordUsages("communication") }} onClose={() => {}} />
    );
    expect(screen.getByTestId("usage-rank").getAttribute("title")).toContain("· سطح: میانه");
    unmount();
  });

  it("② word رویِ خودِ سؤال است — دریل زنده = آینهٔ مستقل + لنگرِ پرکاربرد=۸", () => {
    const all = buildLiveWordsQuiz(lessons);
    expect(all).toHaveLength(8);
    expect(all.map((q) => q.word)).toEqual(["of", "you", "it", "are", "that", "for", "our", "we"]); // پیش‌سنجهٔ r269
    for (const q of all) {
      expect(q.word, "هر سؤالِ کلوزِ پیکره‌ای word دارد").toBeTruthy();
      // آینه: سطحِ سؤال = سطحِ شمارشِ مستقلِ همان واژه
      const r = usedWordRank(q.word!)!;
      expect(tierMirror(r.count)).toBe(usageTierLabel(r.count));
      expect(tierMirror(r.count)).toBe("پرکاربرد"); // top-8 همهٔ پرکاربرد
    }
    // درسِ ۱ — همان ایدئوم با دامنهٔ باریک؛ لنگرِ واژه‌هایِ پیش‌سنجه
    const l1 = buildLiveWordsQuiz(lessons.filter((l) => l.id === 1));
    expect(l1.map((q) => q.word)).toEqual([
      "language", "never", "culture", "way", "take", "call", "knowledge", "protect",
    ]);
    expect(tallyMirror(l1.map((q) => q.word!))).toBe("۸ پرکاربرد");
  });

  it("③ لنگرِ ترکیبِ مخلوط — دریل مثال‌هایِ درس ۴: ۱ پرکاربرد · ۴ میانه · ۱ کم‌کاربرد · ۲ بی‌سطح", () => {
    const l4 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 4));
    expect(l4).toHaveLength(8);
    expect(l4.map((q) => q.word)).toEqual([
      "usually", "polite", "party", "invite", "found", "cousin", "dish", "umbrella",
    ]); // پیش‌سنجهٔ r269 — ترتیبِ نزولیِ پایدار
    // بی‌سطحِ صادقانه (count=۰) واقعاً در راند حاضر است — شاخهٔ r259
    const zeroWords = l4.map((q) => q.word!).filter((w) => (usedWordRank(w)?.count ?? 0) === 0);
    expect(zeroWords).toHaveLength(2);
    expect(tallyMirror(l4.map((q) => q.word!))).toBe("۱ پرکاربرد · ۴ میانه · ۱ کم‌کاربرد · ۲ بی‌سطح");
  });

  it("④ کارتِ نتیجه: چیپِ «واژه‌های این راند» = آینه؛ absenceِ صادقانه برایِ بی‌word؛ درسِ ۷ = ۳/۱/۱/۲", () => {
    // دریل زندهٔ همه‌درس — همه‌پرکاربرد
    const live = buildLiveWordsQuiz(lessons);
    render(<QuizResult {...baseResult(live, live.map((q) => q.answer))} />);
    expect(screen.getByTestId("quiz-tier-tally").textContent).toBe("واژه‌های این راند: ۸ پرکاربرد");
    cleanup();

    // دریل مثال‌هایِ درس ۴ — ترکیبِ مخلوطِ لنگری
    const l4 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 4));
    render(<QuizResult {...baseResult(l4, l4.map((q) => q.answer))} />);
    expect(screen.getByTestId("quiz-tier-tally").textContent).toBe(
      `واژه‌های این راند: ${tallyMirror(l4.map((q) => q.word!))}`
    );
    expect(screen.getByTestId("quiz-tier-tally").textContent).toContain("۲ بی‌سطح");
    cleanup();

    // درسِ ۷ — هفت سؤال (سقفِ ۸ با کمبودِ سؤالِ سالم برخورد کرد — صداقتِ r261)
    const l7 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 7));
    expect(l7).toHaveLength(7);
    render(<QuizResult {...baseResult(l7, l7.map((q) => q.answer))} />);
    expect(screen.getByTestId("quiz-tier-tally").textContent).toBe(
      `واژه‌های این راند: ${tallyMirror(l7.map((q) => q.word!))}`
    );
    cleanup();

    // خانوادهٔ بی‌word (vocab) — هیچ چیپِ ترکیبی، صفرِ ساختگی ممنوع
    const wordless: QuizQuestion[] = [1, 2].map((n) => ({
      id: `l7-v${n}`,
      category: "vocab",
      question: `Q${n}`,
      options: ["a", "b", "c", "d"],
      answer: 1,
    }));
    render(<QuizResult {...baseResult(wordless, [1, 2])} />);
    expect(screen.queryByTestId("quiz-tier-tally")).not.toBeInTheDocument();
  });

  it("⑤ مرزِ خانواده: گواهی چیپِ ترکیب نمی‌گیرد + DictionaryView هم titleِ سطح‌دار دارد", () => {
    // گواهیِ پایان‌ترم با سؤال‌هایِ wordدار هم چیپ نمی‌گیرد — ترکیب مالِ کارتِ استاندارد است
    const live = buildLiveWordsQuiz(lessons);
    const { container } = render(
      <QuizResult {...baseResult(live, live.map((q) => q.answer))} certificate accentFamily="emerald" />
    );
    expect(screen.queryByTestId("quiz-tier-tally")).not.toBeInTheDocument();
    expect(container.querySelector(".border-dashed")).toBeTruthy(); // خودِ گواهی سالم
    cleanup();

    // مونتِ دیکشنری در لنزِ کاربرددارِ مرتب‌شده — اولین کارت = of (رتبهٔ ۱؛ ایدئومِ r262)
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    const firstChip = screen.getAllByTestId(/^usage-chip-.+$/)[0];
    expect(firstChip.getAttribute("data-testid")).toBe("usage-chip-of");
    const rankChip = document.querySelector<HTMLElement>('[data-testid="usage-rank-of"]');
    expect(rankChip).toBeTruthy();
    expect(rankChip!.getAttribute("title")).toContain("· سطح: پرکاربرد"); // of=۹۱
    // و دیالوگِ همین کارت هم همان لهجه را می‌گوید (کلیک روی چیپ «در جزوه»)
    act(() => {
      fireEvent.click(firstChip);
    });
    expect(screen.getByTestId("usage-rank").getAttribute("title")).toContain("· سطح: پرکاربرد");
  });
});
