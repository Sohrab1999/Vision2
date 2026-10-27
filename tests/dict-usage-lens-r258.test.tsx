// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۸ — آمارِ کاربردِ لنزِ «کاربرددار»: آستانه‌هایِ «حداقل کاربرد»
// (بندِ ① پیشنهادِ ۲۵۷) + نوارِ «پرکاربردهای جزوه» (بندِ ③).
//
// قراردادهایِ تحتِ قفل:
//   · آستانه‌ها فقط داخلِ لنز رندر و اثر می‌شوند؛ شمارندهٔ هر چیپ =
//     شمارشِ مستقلِ کارت‌هایِ n>=t از همان سیمِ sites.length.
//   · فیلتر با «N واژه یافت شد» و شمارندهٔ چیپ‌هایِ درس یکی می‌خواند
//     (چیپِ درس هم از دامنهٔ باریک‌شده می‌شمارد).
//   · آستانه × مرتب‌سازی ترکیب‌پذیرند: نتیجه = فهرستِ مستقلِ باریک‌شده
//     به ترتیبِ نزولیِ پایدار.
//   · پرکاربردها: دقیقاً ۱۰ چیپِ ددوپ‌شده نزولی؛ کلیک → دیالوگِ مشترک
//     «کاربرد در جزوه» با همان شمارش.
//   · دریل از دامنهٔ باریک‌شده تغذیه می‌شود و توضیحش آستانه را می‌گوید.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages } from "@/lib/word-usage";
import { buildLiveWordsQuiz, LIVE_DRILL_CAP } from "@/lib/live-words-quiz";
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

/** شمارشِ مستقلِ کارت‌هایِ کاربرددارِ n>=t (آینهٔ مستقلِ سیم) */
function countAtLeast(t: number): number {
  let n = 0;
  for (const l of lessons) for (const w of l.vocabulary) if (findWordUsages(w.en).length >= t) n++;
  return n;
}

/** پرکاربردهای جزوه — ددوپِ هم‌نام، نزولیِ پایدار (آینهٔ مستقل) */
function topUsed(): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of lessons)
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count > 0) out.push({ en: w.en, count });
    }
  return out.sort((a, b) => b.count - a.count).slice(0, 10);
}

const cardKeys = () =>
  screen
    .getAllByTestId(/^usage-chip-.+$/)
    .map((c) => c.getAttribute("data-testid"))
    .join("|");

describe("آمارِ کاربردِ لنز — r258", () => {
  it("① آستانه‌ها: فقط در لنز؛ شمارندهٔ هر چیپ = مستقل؛ کلیک، کارت‌ها و خطِ شمارش را هم‌خوان باریک می‌کند", () => {
    render(<DictionaryView />);
    // بیرونِ لنز: هیچ ردیفِ آماری نیست
    expect(screen.queryByTestId("dict-minused-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dict-top-usage")).not.toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // شمارنده‌ها = مستقل (۵۳۶ / ۲۶۳ / ۷۹ از پیش‌سنجه — داده‌محور بازخوانی می‌شود)
    for (const t of [5, 10, 20]) {
      const chip = screen.getByTestId(`dict-minused-${t}`);
      expect(chip.getAttribute("aria-pressed")).toBe("false");
      expect(chip.textContent).toContain(faNum(countAtLeast(t)));
    }
    // فعال‌سازیِ ۱۰+ → خطِ شمارش باریک می‌شود و همهٔ کارت‌هایِ رندرشده >=۱۰
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    expect(screen.getByTestId("dict-minused-10").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(new RegExp(`^${faNum(countAtLeast(10))} واژه یافت شد$`))).toBeInTheDocument();
    for (const chip of screen.getAllByTestId(/^usage-chip-.+$/).slice(0, 15)) {
      const word = chip.getAttribute("aria-label")!.match(/کاربرد (.+?) در جزوه/)![1];
      expect(findWordUsages(word).length).toBeGreaterThanOrEqual(10);
    }
    // خاموش‌کردنِ همان چیپ → بازگشت به کلِ لنز
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    expect(screen.getByTestId("dict-minused-10").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText(new RegExp(`^${faNum(countAtLeast(1))} واژه یافت شد$`))).toBeInTheDocument();
  });

  it("② ترکیبِ آستانه×مرتب‌سازی: نتیجه = فهرستِ مستقلِ باریک‌شده به ترتیبِ نزولیِ پایدار", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    // آینهٔ مستقل: کارت‌هایِ n>=10 به ترتیبِ نزولیِ پایدار
    const pool: { key: string; count: number }[] = [];
    const seen = new Set<string>();
    for (const l of lessons)
      for (const w of l.vocabulary) {
        const ck = `${l.id}-${w.en}`;
        if (seen.has(ck)) continue;
        seen.add(ck);
        const count = findWordUsages(w.en).length;
        if (count >= 10) pool.push({ key: `usage-chip-${w.en.replace(/\s+/g, "-")}`, count });
      }
    const expectedSorted = [...pool]
      .sort((a, b) => b.count - a.count)
      .slice(0, 300)
      .map((p) => p.key);
    const rendered = screen.getAllByTestId(/^usage-chip-.+$/).map((c) => c.getAttribute("data-testid"));
    expect(rendered.slice(0, 20)).toEqual(expectedSorted.slice(0, 20));
    // خطِ شمارش = باریک‌شده
    expect(screen.getByText(new RegExp(`^${faNum(pool.length)} واژه یافت شد$`))).toBeInTheDocument();
  });

  it("③ پرکاربردها: دقیقاً ۱۰ چیپِ ددوپ‌شده نزولی با شمارشِ مستقل؛ کلیک → دیالوگِ همان واژه", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const strip = screen.getByTestId("dict-top-usage");
    const chips = within(strip).getAllByTestId(/^dict-top-usage-.+$/);
    const expectedTop = topUsed();
    expect(chips.length).toBe(expectedTop.length);
    for (let i = 0; i < chips.length; i++) {
      const word = chips[i].getAttribute("aria-label")!.match(/کاربرد (.+?) در جزوه/)![1];
      expect(word).toBe(expectedTop[i].en);
      expect(chips[i].textContent).toContain(faNum(expectedTop[i].count));
    }
    // نزولیِ مستقل — چیپِ اول بیشترین (۹۱)
    expect(expectedTop[0].count).toBe(Math.max(...expectedTop.map((u) => u.count)));
    // کلیکِ چیپِ اول → دیالوگِ مشترک با همان واژه و شمارش
    act(() => {
      fireEvent.click(chips[0]);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(expectedTop[0].en);
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(expectedTop[0].count)}`);
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("④ دریل از دامنهٔ باریک‌شده تغذیه می‌شود و توضیحش آستانه را می‌گوید", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    // توضیحِ نوارِ دریل آستانه را اعلام می‌کند
    const bar = screen.getByTestId("live-drill-bar");
    expect(bar.textContent).toContain(`فقط واژه‌هایِ ${faNum(20)}+ کاربرد`);
    // سؤال‌هایِ سازنده با minCount=20 — همه >=۲۰ کاربرد و اولی همانِ UI
    const expected = buildLiveWordsQuiz(lessons, LIVE_DRILL_CAP, 20);
    expect(expected.length).toBeGreaterThan(0);
    for (const q of expected) {
      expect(findWordUsages(q.options[q.answer]).length).toBeGreaterThanOrEqual(20);
    }
    // باز کردنِ دریل از UI: اولین سؤال = مستقلِ همین دامنهٔ باریک
    act(() => {
      fireEvent.click(within(bar).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(expected[0].question)).toBeInTheDocument();
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("⑤ صداقتِ ساختاری: چیپِ درس از دامنهٔ باریک‌شده می‌شمارد؛ خروج از لنز ردیف‌ها را غیب می‌کند", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // شمارندهٔ درس ۱ با آستانهٔ ۲۰+ = مستقلِ n>=20 در واژگانِ درس ۱
    const lesson1AtLeast20 = lessons[0].vocabulary.filter((w) => findWordUsages(w.en).length >= 20).length;
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    const lessonChip = screen
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith(`درس ${faNum(1)}:`));
    expect(lessonChip!.textContent).toContain(`· ${faNum(lesson1AtLeast20)}`);
    // پیش‌شرطِ داده: آستانه واقعاً شمارشِ درس را باریک کرده (نه برابرِ بی‌آستانه)
    const lesson1All = lessons[0].vocabulary.filter((w) => findWordUsages(w.en).length > 0).length;
    expect(lesson1AtLeast20).toBeLessThan(lesson1All);
    // خروج از لنز: ردیف‌هایِ آماری غیب — و کلیدِ کارت‌ها به فیلترِ بی‌آستانه برمی‌گردد
    act(() => {
      fireEvent.click(
        screen
          .getAllByRole("button")
          .find((b) => (b.textContent ?? "").startsWith("همه") && !(b.textContent ?? "").includes("درس"))!
      );
    });
    expect(screen.queryByTestId("dict-minused-row")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dict-top-usage")).not.toBeInTheDocument();
  });
});
