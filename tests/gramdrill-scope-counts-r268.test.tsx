// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۸ — شمارندهٔ «· N» روی چیپ‌هایِ دامنهٔ درس (بندِ ③ پیشنهادِ ۲۶۷):
// ماتریسِ زندهٔ دامنه×آستانه — هر چیپِ درس جمعیتِ خودش را زیرِ آستانهٔ
// فعال نام می‌برد و «همه» شمارشِ سیمِ سراسری را.
//
// قراردادهایِ تحتِ قفل:
//   · اشتقاقِ بدونِ گذرِ نو: candidates(scope, t) ≡ candidates(scope, 0)
//     .filter(count>=t) — همان ایدئومِ زیرمجموعهٔ آستانه‌دارِ r265 که
//     گاردِ ① همان پیمان قفلش کرد؛ همهٔ شمارنده‌هایِ UI از دو گذرِ ثابت
//     (fullCandidates + perLessonCandidates) مشتق می‌شوند.
//   · «همه» عمداً جمعِ درس‌ها نیست: ددوپِ سراسریِ هم‌نام‌هایِ بین‌درسی —
//     لنگرهایِ پیش‌سنجهٔ r268: کل=۳۴۷ نه ۶۱۶، و در ۱۰+: ۹۵ نه ۱۷۹؛
//     مثالِ عینی: you در واژگانِ درس‌هایِ ۱۰ و ۱۱ و ۱۲ زندگی می‌کند.
//   · دوقلو-سازگاری نه دوقلو-عدد: با scope=L1 و آستانهٔ ۱۰+، چیپِ درسِ ۱
//     و چیپِ آستانه هر دو «· ۲» می‌گویند — دو نام‌گذاریِ یک جمعیت، از
//     یک سیم (درسِ r258/r265 در بعدِ دومِ ماتریس).
//   · صفرِ صادقانه end-to-end: چیپِ «درس ۲ · ۰» (زیرِ ۲۰+) کلیک‌پذیر
//     می‌ماند و شروعش توستِ r261 را می‌دهد بدونِ دیالوگ.
//   · لنگرهایِ per-lesson (پیش‌سنجهٔ r267/r268): L1=۲۳ (۱۰+=۲)، L10=۲۵۵
//     (۱۰+=۸۸)، L11=۱۱۸ (۱۰+=۵۰)، L12=۱۱۱ (۱۰+=۲۷)، L9=۲۸ (۱۰+=۷).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { grammarExampleCandidates, GRAM_DRILL_THRESHOLDS } from "@/lib/live-words-quiz";
import { findWordUsages, wordFormRegex } from "@/lib/word-usage";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";
import type { LessonData } from "@/lib/study-types";

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));
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
  toastSpy.mockClear();
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

/** آینهٔ مستقلِ سیم — ددوپ + عضویتِ مثال + آستانه + نزولیِ پایدار */
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

const lessonOf = (id: number): LessonData => {
  const l = lessons.find((x) => x.id === id);
  if (!l) throw new Error(`no lesson ${id}`);
  return l;
};

describe("شمارندهٔ «· N» چیپ‌های دامنه — r268", () => {
  it("① ایدئومِ اشتقاق: candidates(scope,t) = فیلترِ candidates(scope,0) رویِ هر درس×آستانه؛ «همه» غیر-جمع‌پذیر (۳۴۷≠۶۱۶ و ۹۵≠۱۷۹ — you در سه درس)", () => {
    for (const l of lessons) {
      const full = grammarExampleCandidates([l]);
      for (const t of GRAM_DRILL_THRESHOLDS) {
        const direct = grammarExampleCandidates([l], t);
        const derived = full.filter((c) => c.count >= t);
        expect(direct).toEqual(derived); // اشتقاق = گذرِ مستقیم
      }
    }
    // و رویِ دامنهٔ سراسری هم — پایهٔ اشتقاقِ «همه»
    const fullAll = grammarExampleCandidates(lessons);
    for (const t of GRAM_DRILL_THRESHOLDS) {
      expect(grammarExampleCandidates(lessons, t)).toEqual(fullAll.filter((c) => c.count >= t));
    }
    // غیر-جمع‌پذیریِ «همه»: ددوپِ سراسریِ هم‌نام‌هایِ بین‌درسی
    const perSum = lessons.reduce((s, l) => s + grammarExampleCandidates([l]).length, 0);
    expect(fullAll.length).toBe(347);
    expect(perSum).toBe(616);
    expect(perSum).toBeGreaterThan(fullAll.length);
    const perSum10 = lessons.reduce((s, l) => s + grammarExampleCandidates([l], 10).length, 0);
    expect(grammarExampleCandidates(lessons, 10).length).toBe(95);
    expect(perSum10).toBe(179);
    // مثالِ عینیِ هم‌نامِ بین‌درسی
    const youLessons = lessons.filter((l) =>
      l.vocabulary.some((w) => w.en.trim().toLowerCase() === "you")
    ).map((l) => l.id);
    expect(youLessons).toEqual([10, 11, 12]);
  }, 30000);

  it("② UI در پیش‌فرض: هر چیپِ درس «· N» آینه‌ای دارد؛ «همه · ۳۴۷»؛ aria-label با «K نامزد»", () => {
    render(<BookletGrammarView />);
    const scopeRow = screen.getByTestId("gram-drill-scope-row");
    const allChip = within(scopeRow).getByTestId("gram-drill-scope-all");
    expect(allChip.textContent).toBe(`همه· ${faNum(347)}`);
    for (const l of lessons) {
      const chip = within(scopeRow).getByTestId(`gram-drill-scope-${l.id}`);
      const mirrorN = mirrorCandidates([l]).length;
      expect(chip.textContent).toBe(`درس ${faNum(l.id)}· ${faNum(mirrorN)}`);
      expect(chip.getAttribute("aria-label")).toBe(
        `دامنهٔ درس ${faNum(l.id)} — ${l.titleFa} — ${faNum(mirrorN)} نامزد`
      );
    }
    // چند لنگرِ روشن
    expect(within(scopeRow).getByTestId("gram-drill-scope-1").textContent).toContain(faNum(23));
    expect(within(scopeRow).getByTestId("gram-drill-scope-10").textContent).toContain(faNum(255));
  }, 30000);

  it("③ ماتریسِ زنده: با ۱۰+ فعال، شمارنده‌هایِ دامنه به تقاطع می‌روند (L1·۲، L2·۰، L10·۸۸، همه·۹۵) و دوقلو-سازگارند", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    // «همه» = سیمِ سراسری زیرِ آستانه
    expect(within(scopeRow).getByTestId("gram-drill-scope-all").textContent).toBe(`همه· ${faNum(95)}`);
    // هر درس = تقاطعِ خودش
    for (const l of lessons) {
      const chip = within(scopeRow).getByTestId(`gram-drill-scope-${l.id}`);
      const mirrorN = mirrorCandidates([l], 10).length;
      expect(chip.textContent).toBe(`درس ${faNum(l.id)}· ${faNum(mirrorN)}`);
    }
    expect(within(scopeRow).getByTestId("gram-drill-scope-1").textContent).toBe(`درس ${faNum(1)}· ${faNum(2)}`);
    expect(within(scopeRow).getByTestId("gram-drill-scope-2").textContent).toBe(`درس ${faNum(2)}· ۰`);
    expect(within(scopeRow).getByTestId("gram-drill-scope-10").textContent).toBe(`درس ${faNum(10)}· ${faNum(88)}`);
    // دوقلو-سازگاری: scope=L1 → چیپِ درس ۱ و چیپِ آستانه هر دو «· ۲»
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-1"));
    });
    const minRow = within(bar).getByTestId("gram-drill-min-row");
    const scopeCount = within(scopeRow).getByTestId("gram-drill-scope-1").textContent;
    const thrCount = within(minRow).getByTestId("gram-drill-min-10").textContent;
    expect(scopeCount).toBe(`درس ${faNum(1)}· ${faNum(2)}`);
    expect(thrCount).toBe(`${faNum(10)}+· ${faNum(2)}`);
    // هر دو «۲» — یک جمعیت، دو نام‌گذاری
    expect(scopeCount).toContain(faNum(2));
    expect(thrCount).toContain(faNum(2));
  }, 30000);

  it("④ صفرِ صادقانه end-to-end: با ۲۰+، چیپِ «درس ۲ · ۰» شروعش توست می‌دهد بدونِ دیالوگ؛ چیپِ کلیک‌پذیر می‌ماند", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-20"));
    });
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    expect(within(scopeRow).getByTestId("gram-drill-scope-2").textContent).toBe(`درس ${faNum(2)}· ۰`);
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-2"));
    });
    expect(within(scopeRow).getByTestId("gram-drill-scope-2").getAttribute("aria-pressed")).toBe("true");
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    expect(toastSpy).toHaveBeenCalledWith({ title: "سؤالِ قابلِ ساختی از مثال‌های درسنامه نبود" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  }, 30000);

  it("⑤ دریلِ زنده از چیپِ شمارنده‌دار: scope L1 (·۲۳) → عنوانِ «— درس ۱»؛ سؤال اول = language؛ شمارنده در طولِ جریان ثابت", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    const l1 = within(scopeRow).getByTestId("gram-drill-scope-1");
    expect(l1.textContent).toBe(`درس ${faNum(1)}· ${faNum(23)}`);
    act(() => {
      fireEvent.click(l1);
    });
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("دریل مثال‌های درسنامه — درس ۱");
    const mirror = mirrorCandidates([lessonOf(1)]);
    const firstBtn = within(dialog)
      .getAllByRole("button")
      .find((b) => b.querySelector("span.en-text")?.textContent === mirror[0].en);
    expect(firstBtn).toBeTruthy();
    expect(mirror[0].en.toLowerCase()).toBe("language"); // لنگرِ r267: L1 top = language·۲۱
    act(() => {
      fireEvent.click(firstBtn!);
    });
    expect(dialog.textContent).toContain("پاسخ درست");
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // شمارنده‌ها دست‌نخورده — سیم از نتیجه مستقل است
    expect(within(screen.getByTestId("gram-drill-scope-row")).getByTestId("gram-drill-scope-1").textContent).toBe(
      `درس ${faNum(1)}· ${faNum(23)}`
    );
  }, 30000);
});
