// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۶ — «کاربرد در جزوه» سطحِ ششم + مرتب‌سازیِ لنزِ کاربرددار
//
// سطحِ ششم — ریدینگ: هر پاراگرافِ ریدینگ، واژه‌های زندهٔ خودش را از
//   واژگانِ همان درس نشان می‌دهد (بندِ ③ پیشنهادِ ۲۵۵) — همان تشخیصِ
//   مکالمهٔ r255: مرزِ واژه + پسوندهایِ مجاز، ددوپِ هم‌نامی، سقفِ ۵
//   چیپ + شمارندهٔ صادقانهٔ مابقی؛ بی‌واژه، هیچ. کلیک → دیالوگِ مشترکِ
//   «کاربرد در جزوه» با کاربردِ سراسری (پرشِ میان‌درسیِ r252).
// مرتب‌سازی — لنزِ «کاربرددار» (بندِ ② پیشنهادِ ۲۵۵): سویچِ «بیشترین
//   کاربرد» کارت‌ها را با همان سیمِ چیپ‌ها (sites.length) از بیشترین
//   به کمترین ردیف می‌کند — مرتب‌سازیِ پایدار، بیرونِ لنز بی‌اثر.
//
// گاردهایِ این فایل — همه داده‌محور با تشخیصِ مستقل، نه پینِ دستی:
//   ① ریدینگ: چیپ‌هایِ هر پاراگراف دقیقاً از تشخیصِ مستقل؛ سقفِ ۵ +
//     «+N» صادقانه؛ پاراگرافِ بی‌واژه هیچ ردیفی ندارد.
//   ② قفلِ دامنه: چیپ‌ها فقط از واژگانِ همین درس — واژهٔ درسِ دیگر
//     حتی اگر در پاراگراف زندگی کند چیپ نمی‌گیرد (پیش‌شرطِ داده قفل).
//   ③ دیالوگ از ریدینگ: mark + نشانِ نوع + ترجمهٔ جزوه + شمارش =
//     مستقل؛ و بستنِ دیالوگ، ترجمهٔ فارسیِ پاراگراف را دست نمی‌زند.
//   ④ مرتب‌سازی: با سویچ، کارتِ اول بیشترین کاربرد (۹۱) و ترتیبِ
//     نزولیِ کامل = مرتب‌سازیِ مستقل؛ خطِ «واژه یافت شد» ثابت.
//   ⑤ صداقتِ مرتب‌سازی: چندمجموعهٔ کارت‌ها ثابت می‌ماند (همان کلیدها)
//     و بیرونِ لنز سویچ رندر نمی‌شود (قفلِ دامنهٔ سویچ).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import ReadingTab from "@/components/study/lesson/reading-tab";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages, wordFormRegex } from "@/lib/word-usage";
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

/** تشخیصِ مستقلِ تست — همان معناشناسیِ مرزِ واژه + پسوندهایِ مجاز؛
 *  ددوپِ هم‌نامیِ داخلِ یک فهرست هم اینجاست (آینهٔ کامپوننت). */
function expectedHitsFor(text: string, vocab: { en: string }[]): string[] {
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const w of vocab) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (wordFormRegex(w.en).test(text)) hits.push(w.en);
  }
  return hits;
}

const chipWordOf = (chip: HTMLElement): string =>
  chip.getAttribute("aria-label")?.match(/کاربرد (.+?) در جزوه/)?.[1] ?? "";

describe("«کاربرد در جزوه» سطحِ ششم + مرتب‌سازیِ لنز — r256", () => {
  it("① ریدینگ: چیپ‌هایِ پاراگراف دقیقاً از تشخیصِ مستقل؛ سقفِ ۵ و «+N» صادقانه؛ بی‌واژه هیچ", () => {
    const lesson = lessons[0];
    // تشخیصِ مستقل رویِ کلِ ریدینگ‌هایِ درس ۱
    const expected = lesson.readings.map((r) => r.paragraphs.map((p) => expectedHitsFor(p.en, lesson.vocabulary)));
    const hitsCount = expected.flat().filter((h) => h.length > 0).length;
    const totalParas = expected.flat().length;
    expect(hitsCount).toBeGreaterThan(0); // پیش‌شرطِ داده: دست‌کم یک پاراگرافِ واژه‌دار
    expect(hitsCount).toBeLessThan(totalParas); // پیش‌شرطِ داده: پاراگرافِ بی‌واژه هم هست

    render(<ReadingTab lesson={lesson} />);
    // ردیف‌ها = دقیقاً پاراگراف‌هایِ واژه‌دارِ تشخیصِ مستقل
    const rows = screen.getAllByTestId(/^read-usage-row-\d+-\d+$/);
    expect(rows.length).toBe(hitsCount);
    // پیمایشِ همهٔ ردیف‌ها: چیپ‌هایِ دیده‌شده = ۵تاییِ اول؛ «+N» درست
    let cappedRows = 0;
    for (let ri = 0; ri < lesson.readings.length; ri++) {
      for (let pi = 0; pi < lesson.readings[ri].paragraphs.length; pi++) {
        const hits = expected[ri][pi];
        if (hits.length === 0) {
          expect(screen.queryByTestId(`read-usage-row-${ri}-${pi}`)).not.toBeInTheDocument();
          continue;
        }
        const row = screen.getByTestId(`read-usage-row-${ri}-${pi}`);
        if (hits.length > 5) {
          cappedRows++;
          expect(row.textContent).toContain(`+${faNum(hits.length - 5)}`);
        }
        for (const en of hits.slice(0, 5)) {
          expect(
            screen.getByTestId(`read-usage-chip-${ri}-${pi}-${en.replace(/\s+/g, "-")}`)
          ).toBeInTheDocument();
        }
        // شمارشِ سرِ چیپ = sitesِ مستقلِ همان واژه
        for (const en of hits.slice(0, 5)) {
          const chip = screen.getByTestId(`read-usage-chip-${ri}-${pi}-${en.replace(/\s+/g, "-")}`);
          expect(chip.textContent).toContain(faNum(findWordUsages(en).length));
        }
      }
    }
    // پیش‌شرطِ داده: سقفِ ۵ واقعاً آزموده می‌شود
    expect(cappedRows).toBeGreaterThan(0);
  });

  it("② قفلِ دامنه: چیپ‌هایِ ریدینگ فقط از واژگانِ همین درس — واژهٔ درسِ دیگر چیپ نمی‌گیرد", () => {
    const lesson = lessons[0];
    const lessonWords = new Set(lesson.vocabulary.map((w) => w.en.toLowerCase()));
    render(<ReadingTab lesson={lesson} />);
    const chips = screen.getAllByTestId(/^read-usage-chip-\d+-\d+-.+$/);
    expect(chips.length).toBeGreaterThan(0);
    for (const c of chips) {
      const en = chipWordOf(c).toLowerCase();
      expect(en.length).toBeGreaterThan(0);
      expect(lessonWords.has(en)).toBe(true);
    }
    // پیش‌شرطِ داده: واژهٔ خارج از درس ۱ در پاراگراف‌هایِ همین درس زندگی می‌کند
    const cross = lessons
      .slice(1)
      .flatMap((l) => l.vocabulary)
      .filter(
        (w) =>
          !lessonWords.has(w.en.toLowerCase()) &&
          lesson.readings.some((r) => r.paragraphs.some((p) => wordFormRegex(w.en).test(p.en)))
      );
    expect(cross.length).toBeGreaterThan(0);
    // هیچ چیپی با نامِ واژهٔ بیرونیِ خالص رندر نشده (idها اندیس‌دارند —
    // پس جستجویِ پسوندِ نامِ واژه هم هیچ‌چیز نمی‌یابد)
    for (const w of cross.slice(0, 40)) {
      const suffix = `-${w.en.replace(/\s+/g, "-")}`;
      expect(
        screen.queryByTestId((id: string) => id.startsWith("read-usage-chip-") && id.endsWith(suffix))
      ).not.toBeInTheDocument();
    }
  });

  it("③ دیالوگ از ریدینگ: mark + نوع + ترجمهٔ جزوه + شمارشِ مستقل؛ ترجمهٔ پاراگراف دست‌نخورده", () => {
    const lesson = lessons[0];
    // اولین پاراگرافِ واژه‌دار
    const ri = lesson.readings.findIndex((r) => r.paragraphs.some((p) => expectedHitsFor(p.en, lesson.vocabulary).length > 0));
    const pi = lesson.readings[ri].paragraphs.findIndex((p) => expectedHitsFor(p.en, lesson.vocabulary).length > 0);
    const hits = expectedHitsFor(lesson.readings[ri].paragraphs[pi].en, lesson.vocabulary);
    const pick = hits[0];
    const sites = findWordUsages(pick);
    expect(sites.length).toBeGreaterThan(0);

    render(<ReadingTab lesson={lesson} />);
    // grab قبل از بازکردنِ مودال (aria-hiddenِ پس‌زمینه — درسِ r255)
    const row = screen.getByTestId(`read-usage-row-${ri}-${pi}`);
    const faBefore = row.parentElement!.querySelector("p.border-t");
    expect(faBefore).not.toBeNull();
    const chip = screen.getByTestId(`read-usage-chip-${ri}-${pi}-${pick.replace(/\s+/g, "-")}`);
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(pick);
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(sites.length)}`);
    // نشانِ نوع (مکالمه یا ریدینگ) در کارت‌هایِ سایت + ترجمهٔ خودِ جزوه
    const siteCards = dialog.querySelectorAll("[data-testid=usage-site]");
    expect(siteCards.length).toBeGreaterThanOrEqual(1);
    for (const card of siteCards) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
    }
    const someSite = sites.find((s) => s.fa.length > 0);
    expect(someSite).toBeTruthy();
    expect(dialog.textContent).toContain(someSite!.fa.slice(0, 15));
    // هایلایتِ mark با کلاسِ amberِ ریمپ‌شدهٔ kernel
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    // بستن: دیالوگ می‌رود؛ ترجمهٔ فارسیِ همان پاراگراف سرِ جایش است
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
    expect(row.parentElement!.querySelector("p.border-t")).toBe(faBefore);
  });

  it("④ مرتب‌سازی: سویچِ «بیشترین کاربرد» کارت‌ها را نزولیِ شمارشِ مستقل می‌کند؛ خطِ شمارش ثابت", () => {
    render(<DictionaryView />);
    // لنزِ «کاربرددار» را روشن کن
    const lens = screen.getByRole("button", { name: /کاربرددار/ });
    act(() => {
      fireEvent.click(lens);
    });
    const countLine = screen.getByText(/واژه یافت شد/);
    const before = countLine.textContent;
    const toggle = screen.getByTestId("dict-sort-usage");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    // روشن کردنِ سویچ
    act(() => {
      fireEvent.click(toggle);
    });
    expect(screen.getByTestId("dict-sort-usage").getAttribute("aria-pressed")).toBe("true");
    // ترتیبِ دیده‌شده = مرتب‌سازیِ مستقلِ نزولی — رویِ ۲۰ کارتِ اولِ رندرشده
    const chips = screen.getAllByTestId(/^usage-chip-.+$/).slice(0, 20);
    expect(chips.length).toBe(20);
    const rendered = chips.map((c) => chipWordOf(c));
    // شمارشِ مستقل هر کارت باید نزولی باشد
    for (let i = 1; i < rendered.length; i++) {
      expect(findWordUsages(rendered[i]).length).toBeLessThanOrEqual(findWordUsages(rendered[i - 1]).length);
    }
    // و کارتِ اول دقیقاً بیشترینِ مستقل (۹۱ — «of»)
    const maxCount = Math.max(...findWordUsagesAllCounts());
    expect(findWordUsages(rendered[0]).length).toBe(maxCount);
    // خطِ شمارش با مرتب‌سازی دست نخورده
    expect(screen.getByText(/واژه یافت شد/).textContent).toBe(before);
    // خاموش کردن: برمی‌گردد به aria-pressed=false
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    expect(screen.getByTestId("dict-sort-usage").getAttribute("aria-pressed")).toBe("false");
  });

  it("⑤ صداقتِ مرتب‌سازی: چندمجموعهٔ کاملِ کارت‌ها ثابت (درس ۱ زیرِ سقفِ رندر)؛ سویچ فقط در لنز", () => {
    render(<DictionaryView />);
    // بیرونِ لنز: سویچ نیست
    expect(screen.queryByTestId("dict-sort-usage")).not.toBeInTheDocument();
    // لنزِ «کاربرددار» + فیلترِ درس ۱ — ۱۳۳ کارت زیرِ سقفِ ۳۰۰تاییِ رندر
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱[:]/ }));
    });
    const keys = () =>
      screen
        .getAllByTestId(/^usage-chip-.+$/)
        .map((c) => c.getAttribute("data-testid"))
        .join("|");
    const before = keys();
    // پیش‌شرطِ داده: کلِ کارت‌هایِ کاربرددارِ درس ۱ رندر شده‌اند — پنجره‌ای نیست
    expect(before.split("|").length).toBeGreaterThan(50);
    expect(before.split("|").length).toBeLessThanOrEqual(300);
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    const after = keys();
    // چندمجموعهٔ کامل یکسان: نه کارتی گم، نه کارتی افزوده — فقط ترتیب
    const setOf = (s: string) => s.split("|").sort().join("|");
    expect(setOf(after)).toBe(setOf(before));
    // و ترتیب عوض شده (پیش‌شرطِ داده: ترتیبِ اصلیِ درس ۱ نزولی نیست)
    expect(after).not.toBe(before);
    // ترتیبِ کاملِ دیده‌شده = نزولیِ کاملِ شمارشِ مستقل (نه فقط ۲۰تایِ اول)
    const words = screen.getAllByTestId(/^usage-chip-.+$/).map((c) => chipWordOf(c));
    for (let i = 1; i < words.length; i++) {
      expect(findWordUsages(words[i]).length).toBeLessThanOrEqual(findWordUsages(words[i - 1]).length);
    }
    // خروج از لنز: سویچ غیب می‌شود (قفلِ دامنهٔ سویچ) — چیپِ «همه» با
    // متن‌محور یافته می‌شود (نامِ در دسترس‌پذیریِ چیپ‌ها فاصله‌ها را
    // نرمال می‌کند؛ ایدئومِ پیش‌گامانِ r222)
    const allChip = screen
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith("همه") && !(b.textContent ?? "").includes("درس"));
    expect(allChip).toBeTruthy();
    act(() => {
      fireEvent.click(allChip!);
    });
    expect(screen.queryByTestId("dict-sort-usage")).not.toBeInTheDocument();
  });
});

/** بیشترین شمارشِ کاربرد در کلِ دیکشنری — آینهٔ مستقلِ سیمِ مرتب‌سازی */
function findWordUsagesAllCounts(): number[] {
  return lessons.flatMap((l) => l.vocabulary.map((w) => findWordUsages(w.en).length));
}
