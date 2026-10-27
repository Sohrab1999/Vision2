// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۴ — سویچِ «جفت‌دار» برایِ مقایسهٔ درس‌ها (بندِ ① پیشنهادِ ۲۶۳).
//
// قراردادهایِ تحتِ قفل:
//   · جعبهٔ مقایسهٔ درس‌ها دو حالت دارد: «کاربرد در جزوه» (r262 —
//     آستانه‌آگاه، از سیمِ usedByLesson) و «جفت‌های مترادف/متضاد»
//     (r264 — از سیمِ synAntPairsFor رویِ کلِ واژگانِ هر درس).
//   · حالتِ جفت‌دار پروفایلِ پایدارِ درس است: عمداً از آستانهٔ کاربرد
//     نمی‌خواند (جمعیتِ «دریل جفت‌ها» — درس‌محور) و سرصفحه این استقلال
//     را با «(مستقل از آستانهٔ کاربرد)» اعلام می‌کند.
//   · مرزِ r258 سالم می‌ماند: چیپ‌هایِ درس و «N واژه یافت شد» همیشه
//     آستانه‌آگاه‌اند — سویچ فقط جعبهٔ مقایسه را عوض می‌کند.
//   · همان ۱۲ ردیف و همان قواعد: عرضِ میله = سهم از بیشترینِ همان
//     لحظه؛ نرخِ نفوذ = n/واژگانِ درس؛ درسِ صفر میلهٔ خالیِ صادقانه.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages } from "@/lib/word-usage";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

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

/** نمایهٔ مستقل برایِ آینه — همان سازنده، ورودیِ همان داده */
const mirrorIndex = buildSynAntIndex(lessons);

/** شمارشِ مستقلِ واژه‌هایِ جفت‌دارِ هر درس (کلِ واژگان — آینهٔ سیمِ r264) */
function pairCount(lessonId: number): number {
  const l = lessons.find((x) => x.id === lessonId)!;
  return l.vocabulary.filter((w) => synAntPairsFor(mirrorIndex, w.en).length > 0).length;
}

/** شمارشِ مستقلِ کارت‌هایِ کاربرددارِ n>=t هر درس (آینهٔ سیمِ r258) */
function countAtLeast(lessonId: number, t: number): number {
  const l = lessons.find((x) => x.id === lessonId)!;
  return l.vocabulary.filter((w) => findWordUsages(w.en).length >= t).length;
}

/** ورود به لنزِ «کاربرددار» */
const enterUsedLens = () =>
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
  });

const rowOf = (id: number) => screen.getByTestId(`dict-lesson-cmp-${id}`);
const barOf = (row: HTMLElement) => row.querySelector("span[aria-hidden] > span") as HTMLElement;
const chipOfLesson = (id: number) =>
  screen.getAllByRole("button").find((b) => (b.textContent ?? "").startsWith(`درس ${faNum(id)}:`))!;

// لنگرهایِ دادهٔ پیش‌سنجهٔ r264 — هر انحراف یعنی سیم یا داده عوض شده
const ANCHORS: Record<number, number> = { 1: 77, 2: 99, 3: 79, 10: 151 };

describe("سویچِ جفت‌دارِ مقایسهٔ درس‌ها — r264", () => {
  it("① سیمِ جفت‌دار: شمارشِ هر ردیف در حالتِ جفت‌دار = آینهٔ مستقلِ synAntPairsFor رویِ کلِ واژگان؛ لنگرهایِ داده محفوظ", () => {
    render(<DictionaryView />);
    enterUsedLens();
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-pairs"));
    });
    const box = screen.getByTestId("dict-lesson-cmp");
    expect(box.getAttribute("data-mode")).toBe("pairs");
    expect(within(box).getAllByTestId(/^dict-lesson-cmp-\d+$/).length).toBe(lessons.length);
    const counts = lessons.map((l) => pairCount(l.id));
    const max = Math.max(...counts);
    expect(max).toBe(counts[9]); // پیش‌سنجه: L10=151 بیشترین است
    for (let i = 0; i < lessons.length; i++) {
      const row = rowOf(lessons[i].id);
      const penetration = Math.round((counts[i] / lessons[i].vocabulary.length) * 100);
      expect(row.textContent).toContain(`${faNum(counts[i])} واژه · ${faNum(penetration)}٪`);
      expect(barOf(row).style.width).toBe(`${Math.round((counts[i] / max) * 100)}%`);
    }
    // لنگرهایِ پیش‌سنجه: L1=77، L2=99، L3=79، L10=151 (آمارِ «آماده»یِ پیشنهادِ ۲۶۳)
    for (const [id, n] of Object.entries(ANCHORS)) {
      expect(pairCount(Number(id))).toBe(n);
      expect(rowOf(Number(id)).textContent).toContain(`${faNum(n)} واژه`);
    }
    // دوسویگیِ نمایه: lend همتایِ borrow را از سویِ متضاد می‌بیند (r203)
    expect(synAntPairsFor(mirrorIndex, "lend").some((p) => p.kind === "ant" && p.other === "borrow")).toBe(true);
  });

  it("② سویچ: پیش‌فرض = کاربرد (متنِ r262 دست‌نخورده)؛ کلیکِ جفت‌دار سرصفحه و اعداد را عوض می‌کند؛ aria-pressed درست", () => {
    render(<DictionaryView />);
    enterUsedLens();
    const box = screen.getByTestId("dict-lesson-cmp");
    // حالتِ پیش‌فرض: کاربرد — سرصفحه و اعدادِ r262
    expect(box.getAttribute("data-mode")).toBe("usage");
    expect(box.textContent).toContain("چند واژهٔ هر درس در متنِ جزوه آمده‌اند");
    expect(box.textContent).not.toContain("جفتِ مترادف/متضاد دارند");
    const usageBtn = screen.getByTestId("dict-cmp-mode-usage");
    const pairsBtn = screen.getByTestId("dict-cmp-mode-pairs");
    expect(usageBtn.getAttribute("aria-pressed")).toBe("true");
    expect(pairsBtn.getAttribute("aria-pressed")).toBe("false");
    const usageRow1 = rowOf(1).textContent;
    expect(usageRow1).toContain(`${faNum(countAtLeast(1, 1))} واژه`);
    act(() => {
      fireEvent.click(pairsBtn);
    });
    // حالتِ جفت‌دار: سرصفحهٔ نو + اعدادِ نو — و aria-pointerها جابه‌جا
    expect(box.getAttribute("data-mode")).toBe("pairs");
    expect(box.textContent).toContain("چند واژهٔ هر درس جفتِ مترادف/متضاد دارند");
    expect(usageBtn.getAttribute("aria-pressed")).toBe("false");
    expect(pairsBtn.getAttribute("aria-pressed")).toBe("true");
    const pc1 = pairCount(1);
    const pen1 = Math.round((pc1 / lessons[0].vocabulary.length) * 100);
    expect(rowOf(1).textContent).toContain(`${faNum(pc1)} واژه · ${faNum(pen1)}٪`);
    // عددِ جفت‌دارِ درس ۱ با عددِ کاربردیِ همان ردیف یکی نیست (دو سیمِ مستقل — پیش‌سنجهٔ ④)
    expect(pc1).not.toBe(countAtLeast(1, 1));
    // برگشت: سویچِ usage همه‌چیز را دقیقاً برمی‌گرداند (رفت‌وبرگشت)
    act(() => {
      fireEvent.click(usageBtn);
    });
    expect(box.getAttribute("data-mode")).toBe("usage");
    expect(rowOf(1).textContent).toBe(usageRow1);
  });

  it("③ استقلال از آستانه: با ۲۰+ فعال، اعدادِ جفت‌دار تمام می‌مانند و سرصفحه اعلام می‌کند؛ اما چیپِ درس همچنان آستانه‌آگاه است (مرزِ r258)", () => {
    render(<DictionaryView />);
    enterUsedLens();
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    // در حالتِ کاربرد: باریک‌شدنِ r262 — سرصفحه آستانه را می‌گوید
    let box = screen.getByTestId("dict-lesson-cmp");
    expect(box.textContent).toContain(`(فقط واژه‌هایِ ${faNum(20)}+ کاربرد)`);
    expect(rowOf(2).textContent).toContain(`${faNum(0)} واژه · ${faNum(0)}٪`);
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-pairs"));
    });
    // در حالتِ جفت‌دار: همان اعدادِ بی‌آستانه + اعلامِ استقلال
    box = screen.getByTestId("dict-lesson-cmp");
    expect(box.textContent).toContain("(مستقل از آستانهٔ کاربرد)");
    expect(box.textContent).not.toContain(`(فقط واژه‌هایِ ${faNum(20)}+ کاربرد)`);
    expect(rowOf(2).textContent).toContain(`${faNum(pairCount(2))} واژه`);
    expect(rowOf(2).textContent).not.toContain(`${faNum(0)} واژه`);
    // عرضِ میله هم رویِ بیشترینِ جفت‌هاست نه بیشترینِ کاربردِ آستانه‌دار
    const counts = lessons.map((l) => pairCount(l.id));
    const max = Math.max(...counts);
    for (let i = 0; i < lessons.length; i++) {
      expect(barOf(rowOf(lessons[i].id)).style.width).toBe(`${Math.round((counts[i] / max) * 100)}%`);
    }
    // مرزِ r258: چیپِ درس ۲ و شمارندهٔ یافته‌ها آستانه‌آگاه می‌مانند
    expect(chipOfLesson(2).textContent).toContain(`· ${faNum(0)}`);
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-usage"));
    });
    expect(rowOf(2).textContent).toContain(`${faNum(0)} واژه · ${faNum(0)}٪`);
  });

  it("④ دامنه و هم‌نفسی: سویچ و جعبه فقط داخلِ لنز؛ درسِ فیلترشده در هر دو حالت data-active؛ چیپ‌ها با سویچ جابه‌جا نمی‌شوند", () => {
    render(<DictionaryView />);
    // بیرونِ لنز هیچ است
    expect(screen.queryByTestId("dict-lesson-cmp")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dict-cmp-mode")).not.toBeInTheDocument();
    enterUsedLens();
    act(() => {
      fireEvent.click(chipOfLesson(1));
    });
    // فیلترِ درس ۱ → data-active در حالتِ کاربرد
    expect(rowOf(1).getAttribute("data-active")).toBe("true");
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-pairs"));
    });
    // و در حالتِ جفت‌دار هم می‌ماند + اعدادش مستقل از فیلترِ درس می‌ماند
    expect(rowOf(1).getAttribute("data-active")).toBe("true");
    expect(rowOf(1).textContent).toContain(`${faNum(pairCount(1))} واژه`);
    expect(rowOf(10).textContent).toContain(`${faNum(pairCount(10))} واژه`);
    // چیپ‌هایِ درس (آستانه‌آگاهِ r258) با سویچ عددشان عوض نمی‌شود
    const chip1Before = chipOfLesson(1).textContent;
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-usage"));
    });
    expect(chipOfLesson(1).textContent).toBe(chip1Before);
    // خروج از لنز: جعبه و سویچ با هم غیب
    act(() => {
      fireEvent.click(
        screen
          .getAllByRole("button")
          .find((b) => (b.textContent ?? "").startsWith("همه") && !(b.textContent ?? "").includes("درس"))!
      );
    });
    expect(screen.queryByTestId("dict-lesson-cmp")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dict-cmp-mode")).not.toBeInTheDocument();
  });

  it("⑤ عرضِ میله در حالتِ جفت‌دار = سهم از بیشترینِ جفت‌ها؛ بیشترین (L10) دقیقاً ۱۰۰٪؛ درسِ کم-جفت میلهٔ باریکِ صادقانه", () => {
    render(<DictionaryView />);
    enterUsedLens();
    act(() => {
      fireEvent.click(screen.getByTestId("dict-cmp-mode-pairs"));
    });
    const counts = lessons.map((l) => pairCount(l.id));
    const max = Math.max(...counts);
    const topId = lessons[counts.indexOf(max)].id;
    expect(max).toBeGreaterThan(0);
    expect(barOf(rowOf(topId)).style.width).toBe("100%");
    // L4 کم-جفت‌ترینِ درس‌هایِ بزرگ است (پیش‌سنجه: ۶۷ از ۳۴۱ = ۲۰٪) — میله‌اش با عدد می‌خواند
    const w4 = Math.round((counts[3] / max) * 100);
    expect(barOf(rowOf(4)).style.width).toBe(`${w4}%`);
    expect(w4).toBeLessThan(50);
    // هیچ ردیفی عرضِ بزرگ‌تر از ۱۰۰٪ ندارد
    for (const l of lessons) {
      const w = parseInt(barOf(rowOf(l.id)).style.width, 10);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(100);
    }
  });
});
