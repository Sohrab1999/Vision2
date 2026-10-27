// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۳ — درِ سومِ خروجی و ariaِ هم‌نفس:
//   ① «خروجی جدول جفت‌ها»: جدولِ SYN/ANTِ هر دامنه ردیف‌به‌ردیف به
//      CSVِ اکسلِ معلم — dialectِ خانواده (BOM/CRLF/بی‌نقل‌قول/عددِ
//      ASCII) با reuseِ سیمِ دامنه (lensScopeTag/lensDomainLabel با
//      آستانهٔ ۰ — جفت‌ها آستانه‌نشدنی‌اند، درسِ r264).
//   ② ariaِ سه دکمهٔ «شروع دریل» هم‌نفسِ نوار خودش (ایدئومِ r272-③):
//      جمعیت اول، دامنه دوم — جفت‌ها «۴۷۷ ردیفِ جدول»، زنده «از ۱۱۱۳
//      نامزد»، درسنامه «از ۳۴۷ نامزد».
//
// لنگرهایِ پیش‌سنجهٔ r273: جدول ۴۷۷ ردیف (۲۹۸ مترادف · ۱۷۹ متضاد)،
// L1=۴۰ (۴۰·۰)، L3=۱۲۳ (۵۵·۶۸)، کمینهٔ درس L10=۲۴ (دکمه هرگز در
// عمل نمی‌میرد)؛ dialect تمیز: صفر ویرگول/نقل‌قول/خطِ جدید و صفر
// فیلدِ تهی؛ واژه‌هایِ چند-جفت: remember×۸، happy×۵ — فایل آینهٔ
// صادقانهٔ جدول است (نه ددوپ) و شمارشش با نوار یکی می‌خواند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  buildPairsCsv,
  pairsKindLabel,
  PAIRS_CSV_COLUMNS,
  type PairsExportRow,
} from "@/lib/pairs-csv";
import { lensScopeTag, lensDomainLabel } from "@/lib/lens-csv";
import { liveWordsCandidates, LIVE_DRILL_CAP } from "@/lib/live-words-quiz";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";

const { toastSpy, trackSpy } = vi.hoisted(() => ({ toastSpy: vi.fn(), trackSpy: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: trackSpy }));
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
  trackSpy.mockClear();
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

const SRC = resolve(process.cwd(), "src");
const lastToast = () => toastSpy.mock.calls[toastSpy.mock.calls.length - 1][0] as {
  title: string;
  description: string;
};

/** آینهٔ مستقلِ جدول — همان ترتیبِ کامپوننت: هر درس، اول مترادف‌ها بعد متضادها */
function rowsMirror(scope: typeof lessons): PairsExportRow[] {
  return scope.flatMap((l) => [
    ...(l.synonyms ?? []).map((r) => ({
      en: r.en, pair: r.syn, kind: "syn" as const, fa: r.fa, lessonId: l.id, lessonTitle: l.titleFa,
    })),
    ...(l.antonyms ?? []).map((r) => ({
      en: r.en, pair: r.ant, kind: "ant" as const, fa: r.fa, lessonId: l.id, lessonTitle: l.titleFa,
    })),
  ]);
}
const L = (id: number) => lessons.find((l) => l.id === id)!;

describe("درِ سومِ خروجی و ariaِ هم‌نفس — r273", () => {
  it("① buildPairsCsv: سرستون + آینهٔ ردیف‌به‌ردیف + dialectِ خانواده (CRLF/بی‌نقل‌قول/شش‌ستونه) + نوعِ فراخوان‌ناساز", () => {
    // سرستون دقیق
    expect(PAIRS_CSV_COLUMNS.join(",")).toBe("واژه,جفت,نوع,معنی,درس,عنوان درس");
    // برچسبِ نوع از خودِ جهت — فراخوان نمی‌تواند ناساز بفرستد
    expect(pairsKindLabel("syn")).toBe("مترادف");
    expect(pairsKindLabel("ant")).toBe("متضاد");
    // جمعیت — لنگرهایِ پیش‌سنجهٔ r273
    const all = rowsMirror(lessons);
    expect(all.length).toBe(477);
    expect(all.filter((r) => r.kind === "syn").length).toBe(298);
    expect(all.filter((r) => r.kind === "ant").length).toBe(179);
    expect(rowsMirror([L(1)]).length).toBe(40);
    expect(rowsMirror([L(1)]).every((r) => r.kind === "syn")).toBe(true); // بی‌متضادِ صادقانه
    expect(rowsMirror([L(3)]).length).toBe(123);
    expect(rowsMirror([L(3)]).filter((r) => r.kind === "ant").length).toBe(68);
    // dialect: CRLF خالص (هر \n جلوی \r دارد)، بدونِ نقل‌قول، هر خط شش‌ستونه
    const csv = buildPairsCsv(all);
    expect(csv).not.toMatch(/(?<!\r)\n/);
    expect(csv).not.toContain('"');
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines.length).toBe(477 + 1);
    for (const line of lines) expect(line.split(",").length).toBe(6);
    // آینهٔ per-scope — ترتیبِ آرایهٔ lessons با id یکی نیست؛ با شمارشِ خط
    // و لنگرِ ردیفِ اولِ هر درس قفل می‌شود (sliceِ پیوسته فرضِ غلطِ نسخهٔ اول)
    const l1Csv = buildPairsCsv(rowsMirror([L(1)]));
    const l1Lines = l1Csv.split("\r\n").filter(Boolean);
    expect(l1Lines.length).toBe(41);
    for (const line of l1Lines.slice(1)) expect(line.endsWith(",1," + L(1).titleFa)).toBe(true);
    const l3Csv = buildPairsCsv(rowsMirror([L(3)]));
    const l3Lines = l3Csv.split("\r\n").filter(Boolean);
    expect(l3Lines.length).toBe(124);
    expect(l3Lines.slice(1, 1 + 55).every((line) => line.includes(",مترادف,"))).toBe(true);
    expect(l3Lines.slice(56).every((line) => line.includes(",متضاد,"))).toBe(true);
    // ردیفِ نخستِ فایلِ کامل — نخستین مترادفِ نخستین درسِ آرایه (ترتیبِ آرایه با id یکی نیست)
    const firstLesson = lessons[0];
    const firstRow = (firstLesson.synonyms ?? [])[0];
    expect(lines[1]).toBe(
      `${firstRow.en},${firstRow.syn},مترادف,${firstRow.fa},${firstLesson.id},${firstLesson.titleFa}`
    );
    // سورس‌قرارداد: کامپوننت از سیمِ reuse می‌خواند
    const src = readFileSync(resolve(SRC, "components/study/lesson/dictionary-view.tsx"), "utf8");
    expect(src).toContain("lensScopeTag(lessonFilter, 0)");
    expect(src).toContain("lensDomainLabel(lessonFilter, 0)");
    expect(src).toContain('data-testid="pairs-export-csv"');
  });

  it("② توستِ خروجی همان لهجهٔ لنز: ۴۷۷ بی‌پسوندِ صادقانه؛ درس ۱ با برچسبِ دامنه؛ trackEventِ نو", () => {
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    try {
      render(<DictionaryView />);
      const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
      act(() => {
        fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
      });
      const btn = screen.getByTestId("pairs-export-csv");
      // پیش‌فرض — همهٔ درس‌ها، برچسبِ تهی
      expect(lensDomainLabel(null, 0)).toBe("");
      act(() => {
        fireEvent.click(btn);
      });
      expect(lastToast().title).toBe("خروجی CSV آماده شد");
      expect(lastToast().description).toBe(
        `${faNum(477)} ردیف در فایل vision2-pairs-all.csv — در Excel/Sheets بازش کن.`
      );
      expect(trackSpy).toHaveBeenCalledWith("pairs_csv");
      // درس ۱ — ۴۰ ردیفِ بی‌متضاد با برچسبِ دامنه
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
      });
      toastSpy.mockClear();
      trackSpy.mockClear();
      act(() => {
        fireEvent.click(screen.getByTestId("pairs-export-csv"));
      });
      expect(lastToast().description).toBe(
        `${faNum(40)} ردیف در فایل vision2-pairs-l1.csv — درس ${faNum(1)} — در Excel/Sheets بازش کن.`
      );
      expect(trackSpy).toHaveBeenCalledWith("pairs_csv");
    } finally {
      coSpy.mockRestore();
    }
  }, 30000);

  it("③ aria/titleِ دکمهٔ خروجی هم‌نفسِ نوار: ۴۷۷ بی‌دامنه؛ درس ۱ «· درس ۱» و «— دامنه:» در title؛ شمارنده با نوار یکی", () => {
    render(<DictionaryView />);
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    act(() => {
      fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
    });
    let btn = screen.getByTestId("pairs-export-csv");
    expect(btn.textContent).toContain(`جدول · ${faNum(477)}`);
    expect(btn).toHaveAttribute("aria-label", `خروجی CSV ${faNum(477)} ردیفِ جدول`);
    expect(btn.getAttribute("title")!).not.toContain("دامنه:");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    btn = screen.getByTestId("pairs-export-csv");
    expect(btn.textContent).toContain(`جدول · ${faNum(40)}`);
    expect(btn).toHaveAttribute(
      "aria-label",
      `خروجی CSV ${faNum(40)} ردیفِ جدول · درس ${faNum(1)}`
    );
    expect(btn.getAttribute("title")!).toContain(`— دامنه: درس ${faNum(1)}`);
    // نوار و دکمه یک جمعیت را نام می‌برند (دوقلو-سازگاری)
    const bar = screen.getByTestId("pairs-drill-bar");
    expect(bar.textContent).toContain(`${faNum(40)} ردیفِ جدول`);
  }, 30000);

  it("④ ariaِ دکمه‌هایِ شروع دیکشنری هم‌نفسِ نوار: جفت‌ها ۴۷۷/۴۰؛ زنده ۱۱۱۳/۵ — regexهایِ خانواده سالم", () => {
    render(<DictionaryView />);
    // جفت‌ها — پیش‌فرض و درس ۱
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    act(() => {
      fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
    });
    let start = screen.getByRole("button", { name: /شروع دریل جفت‌ها/ });
    expect(start).toHaveAttribute(
      "aria-label",
      `شروع دریل جفت‌ها — ${faNum(477)} ردیفِ جدول`
    );
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    start = screen.getByRole("button", { name: /شروع دریل جفت‌ها/ });
    expect(start).toHaveAttribute(
      "aria-label",
      `شروع دریل جفت‌ها — ${faNum(40)} ردیفِ جدول · درس ${faNum(1)}`
    );
    // زنده — لنزِ used، پیش‌فرض و L1×۱۰+ — فیلترِ درس بینِ لنزها می‌ماند:
    // ابتدا به «همهٔ درس‌ها» برگرد
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /همهٔ درس‌ها/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    let liveStart = screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ });
    expect(liveStart).toHaveAttribute(
      "aria-label",
      `شروع دریل واژه‌های زنده — از ${faNum(1113)} نامزد`
    );
    expect(liveWordsCandidates(lessons).length).toBe(1113);
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    liveStart = screen.getByRole("button", { name: /شروع دریل واژه‌های زنده/ });
    expect(liveStart).toHaveAttribute(
      "aria-label",
      `شروع دریل واژه‌های زنده — از ${faNum(5)} نامزد · درس ${faNum(1)} · واژه‌هایِ ${faNum(10)}+ کاربرد`
    );
    expect(liveWordsCandidates([L(1)], 10).length).toBe(5);
    // سقفِ خانواده — cap دست‌نخورده
    expect(LIVE_DRILL_CAP).toBe(8);
  }, 30000);

  it("⑤ ariaِ دکمهٔ درسنامه هم‌نفسِ ماتریسِ r265/r268: ۳۴۷ → ۹۵ → درس ۱ (۲) — و چیپ‌ها دست‌نخورده", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    let start = within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ });
    expect(start).toHaveAttribute(
      "aria-label",
      `شروع دریل مثال‌های درسنامه — از ${faNum(347)} نامزد`
    );
    act(() => {
      fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
    });
    start = within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ });
    expect(start).toHaveAttribute(
      "aria-label",
      `شروع دریل مثال‌های درسنامه — از ${faNum(95)} نامزد · واژه‌هایِ ${faNum(10)}+ کاربرد`
    );
    const scopeRow = within(bar).getByTestId("gram-drill-scope-row");
    act(() => {
      fireEvent.click(within(scopeRow).getByTestId("gram-drill-scope-1"));
    });
    start = within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ });
    expect(start).toHaveAttribute(
      "aria-label",
      `شروع دریل مثال‌های درسنامه — از ${faNum(2)} نامزد · درس ${faNum(1)} · واژه‌هایِ ${faNum(10)}+ کاربرد`
    );
    // دوقلو-سازگاری — یک جمعیت، دو نام‌گذاری (پیمانِ r268)
    expect(within(bar).getByTestId("gram-drill-scope-1").textContent).toBe(`درس ${faNum(1)}· ${faNum(2)}`);
    // و پیمانِ r271 — قفلِ سیمِ grPoolN سرِ جایش
    const src = readFileSync(resolve(SRC, "components/study/lesson/booklet-grammar-view.tsx"), "utf8");
    expect(src).toContain("const grPoolN = scopeChipCount(grScope);");
    expect(src.split("aria-label=\"شروع").length - 1).toBe(0); // ariaِ لخت دیگر در کار نیست
  }, 30000);
});
