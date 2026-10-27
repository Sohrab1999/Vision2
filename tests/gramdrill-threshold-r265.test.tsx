// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۵ — آستانه‌هایِ «حداقل کاربرد» برایِ دریلِ مثال‌هایِ درسنامه
// (بندِ ① پیشنهادِ ۲۶۴): چیپ‌هایِ ۵+/۱۰+/۲۰+ در نوارِ بنفشِ r261 —
// همان ایدئومِ آستانه‌هایِ لنزِ دیکشنری (r258) با رنگِ میزبانِ خودش.
//
// قراردادهایِ تحتِ قفل:
//   · سیمِ واحدِ r265: grammarExampleCandidates هم سازندهٔ سؤال و هم
//     شمارندهٔ چیپ‌ها را تغذیه می‌کند — چیپِ «N+ · M» هیچ‌وقت با دریلِ
//     همان آستانه دوقلو-عدد نمی‌شود (درسِ راندِ ۲۵۸ در مقیاسِ دریل).
//   · مرزِ شمولِ دقیق: count >= t؛ آستانهٔ ۰ = دامنهٔ کامل (رفتارِ
//     r261 دست‌نخورده)؛ ترتیبِ نزولیِ پایدار زیرِ آستانه هم برقرار.
//   · چیپ‌ها توگل‌پذیرند (کلیکِ دوباره = پاک‌کردن) و توضیحِ نوار
//     آستانهٔ فعال را اعلام می‌کند؛ عنوانِ دریل همsuffix می‌گیرد.
//   · لنگرهایِ دادهٔ پیش‌سنجهٔ r265: کل=۳۴۷، ۵+=۱۵۹، ۱۰+=۹۵، ۲۰+=۴۱.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  buildGrammarExampleQuiz,
  grammarExampleCandidates,
  GRAM_DRILL_THRESHOLDS,
  GRAMMAR_DRILL_CAP,
} from "@/lib/live-words-quiz";
import { findWordUsages, wordFormRegex } from "@/lib/word-usage";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";
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

/** فهرستِ تختِ مثال‌ها — بازسازیِ مستقل از داده */
const BG_EXAMPLES: { en: string }[] = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((ex) => ({ en: ex.en }))
);

/** آینهٔ مستقلِ سیمِ نامزدها — ددوپ + عضویتِ مثال + نزولیِ پایدار؛
 *  آستانهٔ ۰ = دامنهٔ کامل شاملِ واژه‌هایِ بی‌سایت (حقِ سؤالِ r259) */
function mirrorCandidates(scope: LessonData[], minCount = 0): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (!BG_EXAMPLES.some((ex) => wordFormRegex(w.en).test(ex.en))) continue;
      const count = findWordUsages(w.en).length;
      if (minCount > 0 && count < minCount) continue;
      out.push({ en: w.en, count });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

// لنگرهایِ پیش‌سنجهٔ r265 — هر انحراف یعنی سیم یا داده عوض شده
const ANCHORS = { total: 347, t5: 159, t10: 95, t20: 41 };

describe("آستانه‌های دریل مثال‌های درسنامه — r265", () => {
  it("① سیمِ واحد: grammarExampleCandidates = آینهٔ مستقل در هر آستانه؛ مرزِ شمولِ دقیق؛ لنگرهایِ داده محفوظ", () => {
    // دامنهٔ کامل = رفتارِ r261 (آستانهٔ ۰ — شاملِ واژه‌هایِ بی‌سایت)
    const full = grammarExampleCandidates(lessons);
    const fullMirror = mirrorCandidates(lessons);
    expect(full.length).toBe(ANCHORS.total);
    expect(full).toEqual(fullMirror);
    // هر آستانه: هم‌مجموعه و هم‌ترتیب با فیلترِ همان دامنهٔ کامل
    // (ثباتِ مرتب‌سازیِ پایدار = زیرمجموعهٔ آستانه‌دار فیلترِ دامنه است)
    for (const t of GRAM_DRILL_THRESHOLDS) {
      const sub = grammarExampleCandidates(lessons, t);
      const mirror = fullMirror.filter((c) => c.count >= t);
      expect(sub).toEqual(mirror);
      // مرزِ شمولِ دقیق — هیچ نامزدی زیرِ t نیست
      for (const c of sub) expect(c.count).toBeGreaterThanOrEqual(t);
      // نزولیِ پایدار
      for (let i = 1; i < sub.length; i++) expect(sub[i - 1].count).toBeGreaterThanOrEqual(sub[i].count);
    }
    // لنگرهایِ پیش‌سنجه
    expect(grammarExampleCandidates(lessons, 5).length).toBe(ANCHORS.t5);
    expect(grammarExampleCandidates(lessons, 10).length).toBe(ANCHORS.t10);
    expect(grammarExampleCandidates(lessons, 20).length).toBe(ANCHORS.t20);
    // واژهٔ بی‌سایتِ پیکره (کشفِ r259 — count=۰) در دامنهٔ کامل حاضر و
    // در هیچ آستانه‌ای غایب است
    expect(fullMirror.filter((c) => c.count === 0).length).toBeGreaterThan(0);
    for (const t of GRAM_DRILL_THRESHOLDS) {
      expect(grammarExampleCandidates(lessons, t).some((c) => c.count < t)).toBe(false);
    }
  }, 30000);

  it("② چیپ‌ها = سیم: سه چیپِ ۵+/۱۰+/۲۰+ با شمارندهٔ «· M» = آینه؛ داخلِ نوارِ بنفش؛ aria-label عددی", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const row = within(bar).getByTestId("gram-drill-min-row");
    expect(within(row).getByText("حداقل کاربرد:")).toBeInTheDocument();
    for (const t of GRAM_DRILL_THRESHOLDS) {
      const chip = within(row).getByTestId(`gram-drill-min-${t}`);
      const mirrorN = mirrorCandidates(lessons, t).length;
      expect(chip.textContent).toContain(`${faNum(t)}+`);
      expect(chip.textContent).toContain(`· ${faNum(mirrorN)}`);
      expect(chip.getAttribute("aria-label")).toBe(`حداقل ${faNum(t)} کاربرد — ${faNum(mirrorN)} نامزد`);
      expect(chip.getAttribute("aria-pressed")).toBe("false");
    }
    // هر سه لنگر مثبت‌اند (پیش‌سنجه) — پس هر سه چیپ رندر می‌شوند
    expect(within(row).getAllByTestId(/^gram-drill-min-\d+$/).length).toBe(GRAM_DRILL_THRESHOLDS.length);
  });

  it("③ دریلِ آستانه‌دار: کلیکِ ۱۰+ فعال می‌کند و توضیح اعلام می‌کند؛ شروع → عنوانِ suffixدار؛ سؤالِ اول = پرکاربردِ ≥۱۰", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const chip10 = screen.getByTestId("gram-drill-min-10");
    act(() => {
      fireEvent.click(chip10);
    });
    expect(chip10.getAttribute("aria-pressed")).toBe("true");
    expect(bar.textContent).toContain(`فقط واژه‌هایِ ${faNum(10)}+ کاربرد`);
    // شروعِ دریل از دلِ نوارِ آستانه‌دار
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("دریل مثال‌های درسنامه");
    expect(dialog.textContent).toContain(`واژه‌هایِ ${faNum(10)}+ کاربرد`);
    // سؤالِ اول = نخستینِ نامزدهایِ ≥۱۰ (آینه) — واژه‌ای با کاربردِ ≥۱۰
    const mirror = mirrorCandidates(lessons, 10);
    const firstWord = mirror[0].en;
    expect(mirror[0].count).toBeGreaterThanOrEqual(10);
    const correctBtn = within(dialog)
      .getAllByRole("button")
      .find((b) => b.querySelector("span.en-text")?.textContent === firstWord);
    expect(correctBtn).toBeTruthy();
    act(() => {
      fireEvent.click(correctBtn!);
    });
    expect(dialog.textContent).toContain("پاسخ درست");
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // نوار سرِ جایش — با چیپِ همچنان فعال (stateِ نوار از دیالوگ مستقل است)
    expect(screen.getByTestId("gram-drill-min-10").getAttribute("aria-pressed")).toBe("true");
  });

  it("④ توگل و تک-فعال: کلیکِ دوباره پاک می‌کند و توضیح برمی‌گردد؛ جابه‌جاییِ ۵+→۲۰+ فقط یکی را فعال می‌گذارد", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const chip5 = screen.getByTestId("gram-drill-min-5");
    const chip20 = screen.getByTestId("gram-drill-min-20");
    act(() => {
      fireEvent.click(chip5);
    });
    expect(bar.textContent).toContain(`فقط واژه‌هایِ ${faNum(5)}+ کاربرد`);
    // توگل: کلیکِ دوباره = پاک‌کردن
    act(() => {
      fireEvent.click(chip5);
    });
    expect(chip5.getAttribute("aria-pressed")).toBe("false");
    expect(bar.textContent).not.toContain("فقط واژه‌هایِ");
    // جابه‌جایی: ۲۰+ فعال — ۵+ همچنان خاموش
    act(() => {
      fireEvent.click(chip20);
    });
    expect(chip20.getAttribute("aria-pressed")).toBe("true");
    expect(chip5.getAttribute("aria-pressed")).toBe("false");
    expect(bar.textContent).toContain(`فقط واژه‌هایِ ${faNum(20)}+ کاربرد`);
    // آستانهٔ ۲۰+ هم دریل زنده دارد (پیش‌سنجه: ۴۱ نامزد ≥ سقفِ ۸)
    const qs20 = buildGrammarExampleQuiz(lessons, GRAMMAR_DRILL_CAP, 20);
    expect(qs20.length).toBe(GRAMMAR_DRILL_CAP);
  });

  it("⑤ ترتیبِ آستانه‌دار: سؤال‌ها دنبالهٔ نزولیِ آینهٔ ≥t را می‌روند؛ پاسخِ هر سؤال خودش ≥t؛ سقفِ ۸", () => {
    const qs = buildGrammarExampleQuiz(lessons, GRAMMAR_DRILL_CAP, 10);
    expect(qs.length).toBe(GRAMMAR_DRILL_CAP);
    const mirror = mirrorCandidates(lessons, 10);
    for (let i = 0; i < qs.length; i++) {
      const word = qs[i].options[qs[i].answer];
      expect(word.toLowerCase()).toBe(mirror[i].en.toLowerCase());
      expect(findWordUsages(word).length).toBeGreaterThanOrEqual(10);
      expect(qs[i].id).toBe(`lg-${mirror[i].en.toLowerCase().replace(/\s+/g, "-")}`);
      expect(qs[i].category).toBe("gramdrill");
    }
    // با آستانه، هیچ سؤالی از واژهٔ زیرِ آستانه نمی‌آید — پاسخ‌ها یکتا
    const answers = qs.map((q) => q.options[q.answer].toLowerCase());
    expect(new Set(answers).size).toBe(qs.length);
  });
});
