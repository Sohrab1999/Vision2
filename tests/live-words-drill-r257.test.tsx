// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۷ — «دریل واژه‌های زنده»: کلوزِ جمله‌های واقعیِ جزوه از دلِ
// لنزِ «کاربرددار» (بندِ ① پیشنهادِ ۲۵۴-۲۵۶).
//
// قراردادهایِ تحتِ قفل:
//   · هر سؤال جملهٔ واقعیِ جزوه است با جاخالیِ فقط-فرم‌هایِ تطبیق‌یافتهٔ
//     واژه (highlightParts) — بازچینیِ قطعه‌ها = خودِ جملهٔ سایت.
//   · حواس‌پرت‌ها از واژگانِ کاربرددارِ همان دامنه‌اند و هیچ‌کدام در
//     جمله زندگی نمی‌کنند (wordFormRegex) — سؤالِ مبهم ساخته نمی‌شود.
//   · ترتیبِ سؤال‌ها نزولیِ پایدارِ شمارشِ کاربرد است — پرکاربردترها
//     اول (همان سیمِ مرتب‌سازیِ r256)؛ هم‌نام‌ها یک سؤال؛ سقفِ ۸.
//   · گامِ سازنده خودسازگار است: راه‌رفتنِ مستقلِ تست (ترتیب + skipِ
//     کمبودِ حواس‌پرت) دقیقاً همان دنبالهٔ id را تولید می‌کند.
//   · در UI: نوارِ دریل فقط در لنزِ «کاربرددار»؛ شروع → QuizEngine با
//     جاخالی؛ پاسخ درست بازخوردِ فوری می‌گیرد؛ بستن، لنز را دست‌نخورده
//     می‌گذارد.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { buildLiveWordsQuiz, LIVE_DRILL_CAP, LIVE_BLANK } from "@/lib/live-words-quiz";
import { findWordUsages, wordFormRegex, highlightParts } from "@/lib/word-usage";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";

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

/** نامزدهایِ کاربرددارِ یک دامنه — ددوپِ هم‌نام + نزولیِ پایدار (آینهٔ سازنده) */
function candidatesOf(scope: LessonData[]): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count > 0) out.push({ en: w.en, count });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

describe("دریل واژه‌های زنده — r257", () => {
  const booklet = lessons;
  const lesson1 = lessons.filter((l) => l.id === 1);

  it("① صداقتِ داده: هر سؤال کلوزِ واقعیِ جزوه است — بازچینی = جملهٔ سایت؛ ترجمه و نشانِ منبع از خودِ جزوه", () => {
    const qs = buildLiveWordsQuiz(booklet);
    expect(qs.length).toBe(LIVE_DRILL_CAP);
    for (const q of qs) {
      // گزینه‌ها: چهارِ یکتا؛ پاسخ در محدوده و واژه‌ای واقعاً کاربرددار
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      const word = q.options[q.answer];
      expect(findWordUsages(word).length).toBeGreaterThan(0);
      // سؤال = بازچینیِ مستقلِ highlightParts رویِ جملهٔ واقعیِ سایت
      const site = findWordUsages(word)[0];
      const expectedCloze = highlightParts(site.en, word)
        .map((p) => (p.hit ? LIVE_BLANK : p.text))
        .join("");
      expect(q.question).toBe(expectedCloze);
      expect(q.question).toContain(LIVE_BLANK);
      // ترجمه = فارسیِ خودِ جزوه؛ note = نشانِ منبع (مکالمه/ریدینگ + عنوان)
      expect(q.translation).toBe(site.fa);
      expect(q.translation!.length).toBeGreaterThan(0);
      expect(q.note).toMatch(/مکالمه|ریدینگ/);
      // جاخالی فقط فرم‌هایِ تطبیق‌یافتهٔ همان واژه‌اند — بازگرداندنِ گزینهٔ
      // درستِ دیگر (حواس‌پرت) نباید جمله را کامل کند
    }
  });

  it("② ضدِ-ابهام: هیچ حواس‌پرتی در جملهٔ خودش زندگی نمی‌کند؛ همه از استخرِ کاربرددارِ دامنه", () => {
    for (const scope of [booklet, lesson1]) {
      const qs = buildLiveWordsQuiz(scope);
      const scopeWords = new Set(candidatesOf(scope).map((c) => c.en.toLowerCase()));
      for (const q of qs) {
        const word = q.options[q.answer];
        const site = findWordUsages(word)[0];
        for (const opt of q.options) {
          expect(scopeWords.has(opt.toLowerCase())).toBe(true); // از دامنه
          if (opt === word) continue;
          // هیچ حواس‌پرتی فرمِ مجازش در جملهٔ نمایش‌داده‌شده ندارد
          expect(wordFormRegex(opt).test(site.en)).toBe(false);
        }
      }
    }
  });

  it("③ ترتیبِ نزولیِ پایدار + ددوپ + سقف؛ اولین سؤال پرکاربردترین واژهٔ دامنه است", () => {
    for (const scope of [booklet, lesson1]) {
      const qs = buildLiveWordsQuiz(scope);
      expect(qs.length).toBeLessThanOrEqual(LIVE_DRILL_CAP);
      const ids = qs.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length); // هم‌نام‌ها یک سؤال
      for (let i = 1; i < qs.length; i++) {
        const prev = findWordUsages(qs[i - 1].options[qs[i - 1].answer]).length;
        const cur = findWordUsages(qs[i].options[qs[i].answer]).length;
        expect(cur).toBeLessThanOrEqual(prev); // نزولی
      }
      const cands = candidatesOf(scope);
      const maxCount = cands[0].count;
      expect(findWordUsages(qs[0].options[qs[0].answer]).length).toBe(maxCount);
      // پیش‌شرطِ داده: سقف واقعاً آزموده می‌شود (نامزدها بیش از cap)
      expect(cands.length).toBeGreaterThan(LIVE_DRILL_CAP);
    }
  });

  it("④ خودسازگاریِ گام: راه‌رفتنِ مستقل (ترتیب + skipِ کمبودِ حواس‌پرت) همان دنبالهٔ id را می‌دهد", () => {
    for (const scope of [booklet, lesson1]) {
      const cands = candidatesOf(scope);
      const pool = cands.map((c) => c.en);
      const expectedIds: string[] = [];
      for (const c of cands) {
        if (expectedIds.length >= LIVE_DRILL_CAP) break;
        const site = findWordUsages(c.en)[0];
        if (!site || !highlightParts(site.en, c.en).some((p) => p.hit)) continue;
        const valid = pool.filter(
          (d) => d.toLowerCase() !== c.en.toLowerCase() && !wordFormRegex(d).test(site.en)
        );
        if (valid.length < 3) continue; // skipِ صادقانه
        expectedIds.push(`lw-${c.en.toLowerCase().replace(/\s+/g, "-")}`);
      }
      const built = buildLiveWordsQuiz(scope).map((q) => q.id);
      expect(built).toEqual(expectedIds);
    }
  });

  it("⑤ UI: نوار فقط در لنزِ «کاربرددار»؛ شروع → QuizEngine با جاخالی؛ پاسخِ درست بازخورد؛ بستن سالم", () => {
    render(<DictionaryView />);
    // بیرونِ لنز: نوار نیست
    expect(screen.queryByTestId("live-drill-bar")).not.toBeInTheDocument();
    // لنزِ «کاربرددار» → نوار می‌آید (و سویچِ مرتب‌سازیِ r256 هم)
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const bar = screen.getByTestId("live-drill-bar");
    expect(bar.textContent).toContain("دریل واژه‌های زنده");
    expect(bar.textContent).toContain("پرکاربردترها اول");
    // پیش از باز کردن، پاسخِ درستِ سؤالِ اول را از سازنده می‌گیریم
    const expected = buildLiveWordsQuiz(booklet);
    const firstWord = expected[0].options[expected[0].answer];
    const firstQuestion = expected[0].question;
    // باز کردنِ دریل
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("دریل واژه‌های زنده");
    // سؤالِ اول با جاخالی رندر شده
    const qEl = within(dialog).getByText(firstQuestion);
    expect(qEl).toBeInTheDocument();
    // گزینهٔ درست را می‌زنیم → بازخوردِ فوری — دکمهٔ گزینه = نشانِ حرف +
    // spanِ en-textِ واژه؛ با ساختارِ span می‌یابیم (نامِ در دسترس‌پذیری
    // حرف را هم دارد — ایدئومِ راندهایِ پیشین با متنِ ساختاری)
    const correctBtn = within(dialog)
      .getAllByRole("button")
      .find((b) => b.querySelector("span.en-text")?.textContent === firstWord);
    expect(correctBtn).toBeTruthy();
    act(() => {
      fireEvent.click(correctBtn!);
    });
    expect(dialog.textContent).toContain("پاسخ درست");
    expect(dialog.textContent).toContain(expected[0].translation!.slice(0, 15)); // ترجمهٔ خودِ جزوه پس از پاسخ
    // بستنِ دیالوگ: دریل می‌رود، لنز و سویچِ مرتب‌سازی سرِ جایشان
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("live-drill-bar")).toBeInTheDocument();
    expect(screen.getByTestId("dict-sort-usage")).toBeInTheDocument();
  });
});
