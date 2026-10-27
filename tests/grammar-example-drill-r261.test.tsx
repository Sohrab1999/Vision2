// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۱ — «دریل مثال‌های درسنامه»: منبعِ سومِ سؤال — کلوزِ
// مثال‌هایِ ساختاریافتهٔ خودِ جزوه‌های جامع (BgExample — بندِ ①
// پیشنهادِ ۲۶۰). پیکرهٔ مکالمه/ریدینگ منبعِ متنِ نمایه‌شده است و
// درسنامه نیست (کشفِ r259)؛ ولی درسنامهٔ جامع مثال‌های en/fa خودش
// را ساختاریافته دارد — همان قراردادِ کلوزِ r257 رویِ این منبع.
//
// قراردادهایِ تحتِ قفل:
//   · هر سؤال جملهٔ مثالِ خودِ جزوه است با جاخالیِ فقط-فرم‌هایِ
//     تطبیق‌یافتهٔ واژه (highlightParts) — بازچینیِ قطعه‌ها = خودِ مثال.
//   · ترجمه = فارسیِ خودِ مثال؛ note = موضوعِ مبدأ («درسنامهٔ جامع — …»).
//   · حواس‌پرت‌ها از نامزدهایِ همان دامنه‌اند (واژه‌هایی که در حداقل
//     یک مثال زندگی می‌کنند) و هیچ‌کدام در جمله زندگی نمی‌کنند.
//   · ترتیبِ سؤال‌ها نزولیِ پایدارِ شمارشِ کاربردِ پیکره است —
//     پرکاربردترها اول (همان سیمِ r256)؛ هم‌نام‌ها یک سؤال؛ سقفِ ۸؛
//     id با پیشوندِ lg- تا با سؤال‌هایِ lw- پیکره برخورد نکند.
//   · گامِ سازنده خودسازگار است: راه‌رفتنِ مستقلِ تست (ترتیب + skipِ
//     کمبودِ حواس‌پرت) دقیقاً همان دنبالهٔ id را تولید می‌کند.
//   · در UI: نوارِ بنفش سرِ جای خودش در درسنامهٔ جامع؛ شروع →
//     QuizEngine با جاخالی؛ پاسخ درست بازخوردِ فوری می‌گیرد؛ بستن،
//     نوار را دست‌نخورده می‌گذارد.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { buildGrammarExampleQuiz, GRAMMAR_DRILL_CAP, LIVE_BLANK } from "@/lib/live-words-quiz";
import { findWordUsages, wordFormRegex, highlightParts } from "@/lib/word-usage";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

/** فهرستِ تختِ مثال‌ها — بازسازیِ مستقل از داده (آینهٔ سطحِ ماژولِ سازنده) */
const BG_EXAMPLES: { en: string; fa: string; title: string }[] = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((ex) => ({ en: ex.en, fa: ex.fa, title: t.title }))
);

/** نامزدهایِ مثال‌دارِ یک دامنه — ددوپِ هم‌نام + نزولیِ پایدار (آینهٔ سازنده) */
function candidatesOf(scope: LessonData[]): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (!BG_EXAMPLES.some((ex) => wordFormRegex(w.en).test(ex.en))) continue;
      out.push({ en: w.en, count: findWordUsages(w.en).length });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

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
    view: { type: "appendix" },
    lessonTab: "grammar",
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

describe("دریل مثال‌های درسنامه — r261", () => {
  const booklet = lessons;
  const lesson1 = lessons.filter((l) => l.id === 1);

  it("① صداقتِ داده: هر سؤال کلوزِ مثالِ واقعیِ جزوه است — بازچینی = خودِ مثال؛ ترجمه و منبع از خودِ جزوه؛ دستهٔ gramdrill", () => {
    const qs = buildGrammarExampleQuiz(booklet);
    expect(qs.length).toBe(GRAMMAR_DRILL_CAP);
    for (const q of qs) {
      expect(q.category).toBe("gramdrill");
      expect(q.id.startsWith("lg-")).toBe(true);
      // گزینه‌ها: چهارِ یکتا؛ پاسخ در محدوده و واژه‌ای که واقعاً در مثال‌ها زندگی می‌کند
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      const word = q.options[q.answer];
      expect(BG_EXAMPLES.some((ex) => wordFormRegex(word).test(ex.en))).toBe(true);
      // سؤال = بازچینیِ مستقلِ highlightParts رویِ نخستین مثالِ ترتیبِ جزوه
      const ex = BG_EXAMPLES.find((e) => wordFormRegex(word).test(e.en))!;
      const expectedCloze = highlightParts(ex.en, word)
        .map((p) => (p.hit ? LIVE_BLANK : p.text))
        .join("");
      expect(q.question).toBe(expectedCloze);
      expect(q.question).toContain(LIVE_BLANK);
      // ترجمه = فارسیِ خودِ مثال؛ note = موضوعِ مبدأِ واقعیِ درسنامه
      expect(q.translation).toBe(ex.fa);
      expect(q.translation!.length).toBeGreaterThan(0);
      expect(q.note).toBe(`درسنامهٔ جامع — ${ex.title}`);
      expect(BOOKLET_GRAMMAR_TOPICS.some((t) => t.title === ex.title)).toBe(true);
    }
  });

  it("② ضدِ-ابهام: هیچ حواس‌پرتی در جملهٔ مثالِ خودش زندگی نمی‌کند؛ همه از استخرِ مثال‌دارِ دامنه", () => {
    for (const scope of [booklet, lesson1]) {
      const qs = buildGrammarExampleQuiz(scope);
      const scopeWords = new Set(candidatesOf(scope).map((c) => c.en.toLowerCase()));
      for (const q of qs) {
        const word = q.options[q.answer];
        const ex = BG_EXAMPLES.find((e) => wordFormRegex(word).test(e.en))!;
        for (const opt of q.options) {
          expect(scopeWords.has(opt.toLowerCase())).toBe(true); // از دامنهٔ مثال‌دار
          if (opt === word) continue;
          // هیچ حواس‌پرتی فرمِ مجازش در جملهٔ نمایش‌داده‌شده ندارد
          expect(wordFormRegex(opt).test(ex.en)).toBe(false);
        }
      }
    }
  });

  it("③ ترتیبِ نزولیِ پایدارِ شمارشِ پیکره + ددوپ + سقف؛ اولین سؤال پرکاربردترین مثال‌دارِ دامنه است", () => {
    for (const scope of [booklet, lesson1]) {
      const qs = buildGrammarExampleQuiz(scope);
      expect(qs.length).toBeLessThanOrEqual(GRAMMAR_DRILL_CAP);
      const ids = qs.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length); // هم‌نام‌ها یک سؤال
      for (let i = 1; i < qs.length; i++) {
        const prev = findWordUsages(qs[i - 1].options[qs[i - 1].answer]).length;
        const cur = findWordUsages(qs[i].options[qs[i].answer]).length;
        expect(cur).toBeLessThanOrEqual(prev); // نزولی
      }
      const cands = candidatesOf(scope);
      expect(cands.length).toBeGreaterThan(GRAMMAR_DRILL_CAP); // پیش‌شرطِ سقف
      const maxCount = cands[0].count;
      expect(findWordUsages(qs[0].options[qs[0].answer]).length).toBe(maxCount);
    }
  });

  it("④ خودسازگاریِ گام: راه‌رفتنِ مستقل (ترتیب + skipِ کمبودِ حواس‌پرت) همان دنبالهٔ id را می‌دهد", () => {
    for (const scope of [booklet, lesson1]) {
      const cands = candidatesOf(scope);
      const pool = cands.map((c) => c.en);
      const expectedIds: string[] = [];
      for (const c of cands) {
        if (expectedIds.length >= GRAMMAR_DRILL_CAP) break;
        const ex = BG_EXAMPLES.find((e) => wordFormRegex(c.en).test(e.en));
        if (!ex || !highlightParts(ex.en, c.en).some((p) => p.hit)) continue;
        const valid = pool.filter(
          (d) => d.toLowerCase() !== c.en.toLowerCase() && !wordFormRegex(d).test(ex.en)
        );
        if (valid.length < 3) continue; // skipِ صادقانه
        expectedIds.push(`lg-${c.en.toLowerCase().replace(/\s+/g, "-")}`);
      }
      const built = buildGrammarExampleQuiz(scope).map((q) => q.id);
      expect(built).toEqual(expectedIds);
    }
  });

  it("⑤ UI: نوارِ بنفش در درسنامهٔ جامع؛ شروع → QuizEngine با جاخالی؛ پاسخِ درست بازخورد؛ بستن سالم", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    expect(bar.textContent).toContain("دریل مثال‌های درسنامه");
    expect(bar.textContent).toContain("پرکاربردترها اول");
    // پیش از باز کردن، پاسخِ درستِ سؤالِ اول را از سازنده می‌گیریم
    const expected = buildGrammarExampleQuiz(booklet);
    const firstWord = expected[0].options[expected[0].answer];
    const firstQuestion = expected[0].question;
    // باز کردنِ دریل
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("دریل مثال‌های درسنامه");
    // سؤالِ اول با جاخالی رندر شده
    const qEl = within(dialog).getByText(firstQuestion);
    expect(qEl).toBeInTheDocument();
    // گزینهٔ درست را می‌زنیم → بازخوردِ فوری — دکمهٔ گزینه = نشانِ حرف +
    // spanِ en-textِ واژه؛ با ساختارِ span می‌یابیم (ایدئومِ r257 —
    // نامِ در دسترس‌پذیریِ دکمهٔ گزینه «حرف+واژه» است)
    const correctBtn = within(dialog)
      .getAllByRole("button")
      .find((b) => b.querySelector("span.en-text")?.textContent === firstWord);
    expect(correctBtn).toBeTruthy();
    act(() => {
      fireEvent.click(correctBtn!);
    });
    expect(dialog.textContent).toContain("پاسخ درست");
    expect(dialog.textContent).toContain(expected[0].translation!.slice(0, 15)); // ترجمهٔ خودِ مثال پس از پاسخ
    // بستنِ دیالوگ: دریل می‌رود، نوار سرِ جایش می‌ماند
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("gram-drill-bar")).toBeInTheDocument();
  });
});
