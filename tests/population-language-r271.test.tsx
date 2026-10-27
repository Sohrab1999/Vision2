// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۱ — زبانِ جمعیت، بسته می‌شود: نوارِ دریلِ درسنامه «از N
// نامزد» می‌گوید (بندِ ② پیشنهادِ r270) و توست‌هایِ خروجیِ لنز دامنه
// را در همان لحظهٔ دانلود به زبانِ آدمی نام می‌برند (بندِ ③).
//
// قراردادهایِ تحتِ قفل:
//   · grPoolN = scopeChipCount(grScope) — همان سیمِ چیپ‌هایِ r265/r268،
//     نه گذرِ نو: با ۱۰+ فعال، نوار و چیپِ آستانه هر دو ۹۵ را می‌گویند
//     (دوقلو-سازگاری — یک جمعیت، دو نام‌گذاری) و با دامنهٔ درس، چیپِ درس.
//   · صفرِ صادقانه در خودِ نوار: L2×۱۰+ → «از ۰ نامزد» قبل از شروع؛
//     خاموش‌کردنِ آستانه همان نوار را «از ۲۱ نامزد» می‌کند — صفر مالِ
//     تقاطع بود، نه درس (پیش‌سنجهٔ r271: استخرِ L2=۲۱).
//   · lensDomainLabel = همتایِ خوانایِ lensScopeTag — درس اول، آستانهٔ
//     دوم (ایدئومِ suffixِ r267/r270)؛ دامنهٔ پیش‌فرض = رشتهٔ تهی
//     (نبودِ صادقانه — توستِ پیش‌فرض پسوندی نمی‌گیرد).
//   · هر دو توستِ CSV و Anki یک لهجه‌اند: شمارش + نامِ فایل + برچسبِ
//     دامنه + راهنما؛ پرانتزِ «هم‌نام‌ها» مالِ ددوپِ Anki می‌ماند.
//   · لنگرهایِ پیش‌سنجهٔ r271: استخرهایِ دریل ۳۴۷/۱۵۹/۹۵/۴۱ و
//     L1=۲۳/۱۱/۲/۱، L2=۲۱/۵/۰/۰؛ لنزِ used ۱۹۱۵ ردیف (لنگرِ r266) →
//     Anki ۱۱۱۳ کارت؛ لنزِ ۱۰+ ۲۶۳ ردیف → Anki ۱۳۹ کارت؛ L3×۱۰+ یک
//     ردیف — دامنهٔ مرکبِ کوچکِ صادقانه.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { lensDomainLabel, lensScopeTag } from "@/lib/lens-csv";
import { grammarExampleCandidates } from "@/lib/live-words-quiz";
import { findWordUsages } from "@/lib/word-usage";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";

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

const lastToast = () => toastSpy.mock.calls[toastSpy.mock.calls.length - 1][0] as {
  title: string;
  description: string;
};

/** آینهٔ مستقلِ ددوپِ Anki — کارت‌محورِ shown → واژه‌هایِ یکتا */
const ankiMirror = (rows: { en: string }[]): number =>
  new Set(rows.map((r) => r.en.trim().toLowerCase())).size;

const allRows = lessons.flatMap((l) => l.vocabulary);
const usedRows = allRows.filter((w) => findWordUsages(w.en).length > 0);
const min10Rows = allRows.filter((w) => findWordUsages(w.en).length >= 10);

describe("زبانِ جمعیت — r271", () => {
  it("① lensDomainLabel: لنگرهایِ واحد + جفتِ آینه با lensScopeTag رویِ کلِ ماتریس + سورس‌قراردادِ سه سایت", () => {
    // لنگرهایِ واحد — درس اول، آستانهٔ دوم؛ تهی = نبودِ صادقانه
    expect(lensDomainLabel(null, 0)).toBe("");
    expect(lensDomainLabel(3, 0)).toBe(`درس ${faNum(3)}`);
    expect(lensDomainLabel(null, 10)).toBe(`واژه‌هایِ ${faNum(10)}+ کاربرد`);
    expect(lensDomainLabel(3, 10)).toBe(`درس ${faNum(3)} · واژه‌هایِ ${faNum(10)}+ کاربرد`);
    expect(lensDomainLabel(12, 20)).toBe(`درس ${faNum(12)} · واژه‌هایِ ${faNum(20)}+ کاربرد`);
    // جفتِ آینه با نامِ فایل: تهیِ برچسب ⟺ «all»ِ بی‌پسوندِ تگ
    for (const lf of [null, 1, 3, 12] as (number | null)[])
      for (const mu of [0, 5, 10, 20]) {
        const tag = lensScopeTag(lf, mu);
        const label = lensDomainLabel(lf, mu);
        expect(label === "").toBe(tag === "all");
        if (lf) expect(label).toContain(`درس ${faNum(lf)}`);
        if (mu > 0) expect(label).toContain(`${faNum(mu)}+ کاربرد`);
      }
    // سورس‌قرارداد: هر دو توستِ دیکشنری از یک فراخوان می‌خوانند و
    // نوارِ درسنامه از سیمِ چیپ‌ها (scopeChipCount(grScope))
    const dictSrc = readFileSync(join(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"), "utf8");
    expect(dictSrc.split("lensDomainLabel(lessonFilter, minUsedActive)").length - 1).toBe(2);
    const gramSrc = readFileSync(join(process.cwd(), "src/components/study/lesson/booklet-grammar-view.tsx"), "utf8");
    expect(gramSrc).toContain("const grPoolN = scopeChipCount(grScope);");
    expect(gramSrc).toContain('data-testid="gram-drill-population"');
    expect(gramSrc).toContain("از {faNum(grPoolN)} نامزد");
  });

  it("② جمعیتِ نوار = آینهٔ مستقلِ استخر در هر گام: ۳۴۷ → درس ۱ (۲۳) → ×۱۰+ (۲) → همه (۹۵) → خاموشِ آستانه (۳۴۷)", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const pop = within(bar).getByTestId("gram-drill-population");
    const poolText = (n: number) => `از ${faNum(n)} نامزد، تا ${faNum(8)} سؤال`;
    // پیش‌فرض: استخرِ سراسریِ ددوپ‌شده — لنگرِ r268
    expect(pop.textContent).toContain(poolText(347));
    expect(grammarExampleCandidates(lessons).length).toBe(347);
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-1"));
    });
    expect(pop.textContent).toContain(poolText(23));
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    expect(pop.textContent).toContain(poolText(2));
    expect(pop.textContent).toContain(`فقط واژه‌هایِ ${faNum(10)}+ کاربرد`);
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-all"));
    });
    expect(pop.textContent).toContain(poolText(95));
    expect(grammarExampleCandidates(lessons, 10).length).toBe(95);
    // خاموش‌کردنِ آستانه = بازگشت به استخرِ کاملِ «همه» — همان توگلِ r265
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    expect(pop.textContent).toContain(poolText(347));
    expect(pop.textContent).not.toContain("فقط واژه‌هایِ");
  }, 30000);

  it("③ دوقلو-سازگاری و صفرِ صادقانهٔ نوار: ۹۵ِ نوار = ۹۵ِ چیپِ ۱۰+؛ L2×۱۰+ نوارِ «از ۰» + توستِ بدونِ دیالوگ؛ خاموشیِ آستانه ۲۱ِ واقعیِ درس را لو می‌دهد", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const pop = within(bar).getByTestId("gram-drill-population");
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    // دوقلو-سازگاری: نوار و چیپِ آستانه — یک جمعیت، دو نام‌گذاری
    expect(pop.textContent).toContain(`از ${faNum(95)} نامزد`);
    expect(within(bar).getByTestId("gram-drill-min-10").textContent).toBe(`${faNum(10)}+· ${faNum(95)}`);
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-2"));
    });
    // صفرِ صادقانه — قبل از شروع، در خودِ نوار (نه فقط در توست)
    expect(pop.textContent).toContain(`از ۰ نامزد`);
    expect(within(scopeRow).getByTestId("gram-drill-scope-2").textContent).toBe(`درس ${faNum(2)}· ۰`);
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ }));
    });
    expect(toastSpy).toHaveBeenCalledWith({ title: "سؤالِ قابلِ ساختی از مثال‌های درسنامه نبود" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // صفر مالِ تقاطع بود، نه درس: خاموشیِ آستانه استخرِ واقعیِ L2 را نشان می‌دهد
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    expect(pop.textContent).toContain(`از ${faNum(21)} نامزد`);
    expect(grammarExampleCandidates([lessons.find((l) => l.id === 2)!]).length).toBe(21);
  }, 30000);

  it("④ توستِ CSV دامنه را نام می‌برد: لنزِ used بی‌پسوندِ صادقانه (۱۹۱۵)؛ ۱۰+ → «واژه‌هایِ ۱۰+ کاربرد» (۲۶۳)؛ درسِ ۳ → «درس ۳ · …» (۱)", () => {
    render(<DictionaryView />);
    // دکمه‌هایِ خروجی فقط در لنزِ «کاربرددار» زندگی می‌کنند (r257) —
    // پیش‌فرضِ پیمان = همان لنز بی‌آستانه
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const csvBtn = screen.getByTestId("dict-export-csv");
    expect(usedRows.length).toBe(1915);
    expect(csvBtn.textContent).toContain(faNum(1915));
    act(() => {
      fireEvent.click(csvBtn);
    });
    expect(lastToast().title).toBe("خروجی CSV آماده شد");
    expect(lastToast().description).toBe(
      `${faNum(1915)} ردیف در فایل vision2-used-all.csv — در Excel/Sheets بازش کن.`
    );
    // لنزِ ۱۰+ — لنگرِ ۲۶۳ِ r266 + پسوندِ آستانه
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    const csv10 = screen.getByTestId("dict-export-csv");
    expect(csv10.textContent).toContain(faNum(263));
    toastSpy.mockClear();
    act(() => {
      fireEvent.click(csv10);
    });
    expect(lastToast().description).toBe(
      `${faNum(263)} ردیف در فایل vision2-used-all-min10.csv — واژه‌هایِ ${faNum(10)}+ کاربرد — در Excel/Sheets بازش کن.`
    );
    // دامنهٔ مرکب — درسِ ۳ زیرِ ۱۰+: یک ردیفِ صادقانه؛ عدد از خودِ
    // دکمه خوانده می‌شود (لنگرِ نام‌آزاد — درسِ regexِ /^درس ۱:/ِ r270)
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۳:/ }));
    });
    const csvL3 = screen.getByTestId("dict-export-csv");
    const l3Rows = Number(csvL3.textContent!.match(/CSV · ([۰-۹]+)/)![1].replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
    expect(l3Rows).toBe(1); // پیش‌سنجهٔ r271: L3×۱۰+ = یک واژه
    toastSpy.mockClear();
    act(() => {
      fireEvent.click(csvL3);
    });
    expect(lastToast().description).toBe(
      `${faNum(l3Rows)} ردیف در فایل vision2-used-l3-min10.csv — درس ${faNum(3)} · واژه‌هایِ ${faNum(10)}+ کاربرد — در Excel/Sheets بازش کن.`
    );
  }, 30000);

  it("⑤ توستِ Anki همان لهجه را دارد: لنزِ used ۱۱۱۳ کارتِ بی‌پسوند + پرانتزِ ددوپ؛ ۱۰+ → ۱۳۹ کارت با پسوندِ آستانه و پرانتز", () => {
    // آینهٔ مستقلِ ددوپ — لنگرهایِ پیش‌سنجهٔ r271
    expect(ankiMirror(usedRows)).toBe(1113);
    expect(ankiMirror(min10Rows)).toBe(139);
    expect(min10Rows.length).toBe(263); // CSVِ همان دامنه — لنگرِ r266
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    try {
      render(<DictionaryView />);
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
      });
      // لنزِ used بی‌آستانه — برچسبِ تهی، پرانتزِ ددوپ حاضر
      act(() => {
        fireEvent.click(screen.getByTestId("dict-export-anki"));
      });
      expect(lastToast().title).toBe("خروجی Anki آماده شد");
      expect(lastToast().description).toBe(
        `${faNum(1113)} کارت در فایل vision2-used-all-anki.txt (هم‌نام‌ها یکی شدند) — در Anki از File ▸ Import واردش کن.`
      );
      // لنزِ ۱۰+ — پسوند + پرانتز، یک خط
      act(() => {
        fireEvent.click(screen.getByTestId("dict-minused-10"));
      });
      toastSpy.mockClear();
      act(() => {
        fireEvent.click(screen.getByTestId("dict-export-anki"));
      });
      expect(lastToast().description).toBe(
        `${faNum(139)} کارت در فایل vision2-used-all-min10-anki.txt — واژه‌هایِ ${faNum(10)}+ کاربرد (هم‌نام‌ها یکی شدند) — در Anki از File ▸ Import واردش کن.`
      );
    } finally {
      coSpy.mockRestore();
    }
  }, 30000);
});
