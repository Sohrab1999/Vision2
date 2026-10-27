// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۷ — دو خواهرِ کوچکِ خانواده‌هایِ سنجاق‌شده:
//   ① دامنهٔ درس برای دریل مثال‌های درسنامه (بندِ ③ پیشنهادِ ۲۶۵/۲۶۶):
//     چیپ‌هایِ «همه + ۱۲ درس» داخلِ نوارِ بنفش — همان قراردادِ scopeِ
//     دریل‌هایِ دیکشنری، اما با کنترلِ خودِ نوار (ضمیمه فیلترِ درس ندارد —
//     پیش‌فرضِ پیشنهاد کهنه بود و پیش‌سنجه گرفته شد).
//   ② سطحِ پرکاربردی در دیالوگِ «کاربرد در جزوه» (بندِ ② پیشنهادِ ۲۶۶):
//     همان usageTierLabelِ ستونِ CSVِ r266 — یک کامپوننت، هشت در.
//
// قراردادهایِ تحتِ قفل:
//   · سیمِ دامنه‌دارِ واحد: شمارنده‌هایِ آستانه و سازندهٔ سؤال از همان
//     grammarExampleCandidates(scope) می‌خوانند — دوقلو-عدد ممنوع.
//   · تک-فعالِ دامنه (کلیکِ دوباره = «همه»)؛ عنوانِ دریل دامنه را می‌گوید
//     («— درس N · واژه‌هایِ N+ کاربرد») تا فیدِ خانه بداند.
//   · پیش‌سنجهٔ r267: هیچ درسی نامزدِ صفر ندارد (کمینه L7=7) اما
//     ترکیبِ درس×آستانه صفرِ صادقانهٔ واقعی دارد (L2×۱۰+ = ۰) — توست.
//   · سطح در دیالوگ از خودِ sites.length مشتق می‌شود؛ شاخهٔ صفر-سایتِ
//     r259 بی‌سطح می‌ماند؛ رنگ‌ها از خانواده‌هایِ حاضر (emerald/amber/stone).
//   · لنگرهایِ پیش‌سنجهٔ r267: L1=۲۳ (۵+=۱۱، ۱۰+=۲، ۲۰+=۱)، L9=۲۸،
//     L10=۲۵۵ (۵+=۱۴۰)؛ لنگرهایِ سراسریِ r265 (۳۴۷/۱۵۹/۹۵/۴۱) دست‌نخورده.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import UsageDialog from "@/components/study/lesson/usage-dialog";
import {
  buildGrammarExampleQuiz,
  grammarExampleCandidates,
  GRAM_DRILL_THRESHOLDS,
} from "@/lib/live-words-quiz";
import { findWordUsages, wordFormRegex } from "@/lib/word-usage";
import { usageTierLabel } from "@/lib/lens-csv";
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

/** آینهٔ مستقلِ سیمِ نامزدها رویِ هر دامنه — ددوپ + عضویتِ مثال + آستانه */
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

describe("دامنهٔ درسِ دریل مثال‌ها + سطحِ دیالوگ — r267", () => {
  it("① سیمِ دامنه‌دار: grammarExampleCandidates رویِ هر درس = آینه؛ لنگرهایِ پیش‌سنجه (L1=۲۳، L9=۲۸، L10=۲۵۵)؛ ترکیبِ درس×آستانه صفرِ واقعی دارد", () => {
    // لنگرهایِ تک-درس از پیش‌سنجهٔ r267
    expect(grammarExampleCandidates([lessonOf(1)]).length).toBe(23);
    expect(grammarExampleCandidates([lessonOf(9)]).length).toBe(28);
    expect(grammarExampleCandidates([lessonOf(10)]).length).toBe(255);
    // هر درس: هم‌مجموعه و هم‌ترتیب با آینه — نزولیِ پایدار
    for (const l of lessons) {
      const wire = grammarExampleCandidates([l]);
      const mirror = mirrorCandidates([l]);
      expect(wire).toEqual(mirror);
      for (let i = 1; i < wire.length; i++)
        expect(wire[i - 1].count).toBeGreaterThanOrEqual(wire[i].count);
    }
    // آستانه رویِ دامنهٔ تک-درس: L1 — ۵+=۱۱، ۱۰+=۲، ۲۰+=۱
    expect(grammarExampleCandidates([lessonOf(1)], 5).length).toBe(11);
    expect(grammarExampleCandidates([lessonOf(1)], 10).length).toBe(2);
    expect(grammarExampleCandidates([lessonOf(1)], 20).length).toBe(1);
    expect(grammarExampleCandidates([lessonOf(10)], 5).length).toBe(140);
    // و لنگرهایِ سراسریِ r265 دست‌نخورده — «همه» یعنی همان رفتارِ r261
    expect(grammarExampleCandidates(lessons).length).toBe(347);
    expect(grammarExampleCandidates(lessons, 10).length).toBe(95);
    // ترکیبِ درس×آستانه: صفرِ صادقانهٔ واقعی (L2×۱۰+، L4×۱۰+، L5×۱۰+)
    expect(grammarExampleCandidates([lessonOf(2)], 10).length).toBe(0);
    expect(grammarExampleCandidates([lessonOf(4)], 10).length).toBe(0);
  }, 30000);

  it("② چیپ‌هایِ دامنه: «همه» پیش‌فرضِ pressed؛ کلیکِ درس ۱ شمارنده‌هایِ آستانه را به آینهٔ L1 می‌بَرد؛ تک-فعال و برگشتِ exact", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    expect(within(scopeRow).getByText("دامنهٔ درس:")).toBeInTheDocument();
    const allChip = within(scopeRow).getByTestId("gram-drill-scope-all");
    expect(allChip.getAttribute("aria-pressed")).toBe("true");
    const lessonChips = within(scopeRow).getAllByTestId(/^gram-drill-scope-\d+$/);
    expect(lessonChips.length).toBe(lessons.length); // ۱۲ درس
    for (const c of lessonChips) expect(c.getAttribute("aria-pressed")).toBe("false");

    // کلیکِ درس ۱ → pressed + شمارنده‌ها = آینهٔ L1 (۱۱/۲/۱ نه ۱۵۹/۹۵/۴۱)
    const l1 = within(scopeRow).getByTestId("gram-drill-scope-1");
    expect(l1.textContent).toContain(`درس ${faNum(1)}`);
    act(() => {
      fireEvent.click(l1);
    });
    expect(l1.getAttribute("aria-pressed")).toBe("true");
    expect(allChip.getAttribute("aria-pressed")).toBe("false");
    const minRow = within(bar).getByTestId("gram-drill-min-row");
    const scoped = mirrorCandidates([lessonOf(1)]);
    for (const t of GRAM_DRILL_THRESHOLDS) {
      const chip = within(minRow).getByTestId(`gram-drill-min-${t}`);
      const mirrorN = scoped.filter((c) => c.count >= t).length;
      expect(chip.textContent).toContain(`· ${faNum(mirrorN)}`);
    }
    expect(within(minRow).getByTestId("gram-drill-min-5").textContent).toContain(`· ${faNum(11)}`);
    expect(within(minRow).getByTestId("gram-drill-min-20").textContent).toContain(`· ${faNum(1)}`);

    // تک-فعال: درس ۲ — درس ۱ خاموش می‌شود
    const l2 = within(scopeRow).getByTestId("gram-drill-scope-2");
    act(() => {
      fireEvent.click(l2);
    });
    expect(l2.getAttribute("aria-pressed")).toBe("true");
    expect(l1.getAttribute("aria-pressed")).toBe("false");
    // توگل: کلیکِ دوبارهِ درس ۲ = برگشت به همه و شمارنده‌هایِ سراسری
    act(() => {
      fireEvent.click(l2);
    });
    expect(l2.getAttribute("aria-pressed")).toBe("false");
    expect(allChip.getAttribute("aria-pressed")).toBe("true");
    expect(within(minRow).getByTestId("gram-drill-min-5").textContent).toContain(`· ${faNum(159)}`);
    expect(within(minRow).getByTestId("gram-drill-min-10").textContent).toContain(`· ${faNum(95)}`);
  });

  it("③ جریانِ درس‌محور: شروع با درس ۱ → عنوانِ «— درس ۱»؛ سؤال‌ها از واژگانِ همان درس؛ با آستانه، پسوندِ دوگانه", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    act(() => {
      fireEvent.click(screen.getByTestId("gram-drill-scope-1"));
    });
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("دریل مثال‌های درسنامه — درس ۱");
    // هر گزینهٔ درست در واژگانِ درس ۱ زندگی می‌کند
    const l1Words = new Set(lessonOf(1).vocabulary.map((w) => w.en.toLowerCase()));
    const mirror = mirrorCandidates([lessonOf(1)]);
    expect(mirror.length).toBe(23);
    const questions = buildGrammarExampleQuiz([lessonOf(1)], 8, 0);
    expect(questions.length).toBe(8); // L1 نامزدِ ≥سقف دارد
    for (const q of questions) {
      expect(l1Words.has(q.options[q.answer].toLowerCase())).toBe(true);
    }
    // سؤالِ اولِ دیالوگ = سرِ آینه (پرکاربردِ درس ۱ — language·۲۱)
    const firstBtn = within(dialog)
      .getAllByRole("button")
      .find((b) => b.querySelector("span.en-text")?.textContent === mirror[0].en);
    expect(firstBtn).toBeTruthy();
    act(() => {
      fireEvent.click(firstBtn!);
    });
    expect(dialog.textContent).toContain("پاسخ درست");
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // پسوندِ دوگانه: درس ۱ + آستانهٔ ۵+ → «— درس ۱ · واژه‌هایِ ۵+ کاربرد»
    act(() => {
      fireEvent.click(screen.getByTestId("gram-drill-min-5"));
    });
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    const dialog2 = screen.getByRole("dialog");
    expect(dialog2.textContent).toContain(`دریل مثال‌های درسنامه — درس ${faNum(1)} · واژه‌هایِ ${faNum(5)}+ کاربرد`);
    act(() => {
      fireEvent.click(within(dialog2).getByRole("button", { name: /Close/i }));
    });
  });

  it("④ ترکیبِ تهی: درس ۲ × آستانهٔ ۱۰+ → شمارندهٔ «· ۰»؛ شروع توستِ صادقانه می‌دهد و دیالوگی باز نمی‌شود", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    act(() => {
      fireEvent.click(screen.getByTestId("gram-drill-scope-2"));
    });
    const minRow = within(bar).getByTestId("gram-drill-min-row");
    expect(within(minRow).getByTestId("gram-drill-min-10").textContent).toContain("· ۰");
    // آستانهٔ ۱۰+ را هم فعال کن — دامنهٔ تنها ۲۱ نامزد دارد؛ تقاطعِ L2×۱۰+ تهی است
    act(() => {
      fireEvent.click(within(minRow).getByTestId("gram-drill-min-10"));
    });
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    expect(toastSpy).toHaveBeenCalledWith({ title: "سؤالِ قابلِ ساختی از مثال‌های درسنامه نبود" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("⑤ سطح در دیالوگ: از خودِ sites.length — چهار شاخه (پرکاربرد/میانه/کم‌کاربرد/بی‌سطحِ صادقانه) با خانوادهٔ رنگیِ خودش", () => {
    // لنگرها: of=۹۱ پرکاربرد، communication=۳ میانه، ability=۱ کم‌کاربرد، loaf=۰ بی‌سطح
    const cases: { en: string; tier: string; family: string }[] = [
      { en: "of", tier: "پرکاربرد", family: "emerald" },
      { en: "communication", tier: "میانه", family: "amber" },
      { en: "ability", tier: "کم‌کاربرد", family: "stone" },
    ];
    for (const c of cases) {
      const sites = findWordUsages(c.en);
      expect(sites.length).toBeGreaterThan(0);
      const { unmount } = render(<UsageDialog usage={{ en: c.en, sites }} onClose={() => {}} />);
      const tierChip = screen.getByTestId("usage-tier");
      expect(tierChip.textContent).toBe(`سطح: ${c.tier}`);
      expect(tierChip.textContent).toBe(`سطح: ${usageTierLabel(sites.length)}`); // همان سیمِ CSV
      expect(tierChip.className).toContain(c.family);
      // رتبه هم برایِ واژهٔ کاربرددار حاضر می‌ماند — قراردادِ r260 دست‌نخورده
      expect(screen.getByTestId("usage-rank")).toBeInTheDocument();
      unmount();
      cleanup();
    }
    // شاخهٔ صفر-سایت (کشفِ r259): بی‌سطحِ صادقانه — usage-empty هست، tier نیست
    expect(findWordUsages("loaf").length).toBe(0);
    render(<UsageDialog usage={{ en: "loaf", sites: [] }} onClose={() => {}} />);
    expect(screen.getByTestId("usage-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("usage-tier")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-rank")).not.toBeInTheDocument();
  });
});
