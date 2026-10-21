// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۰ — هر سه بندِ پیشنهادِ ۲۵۹: دو مقیاسِ یک پیکره در تیترِ پنل،
// پرشِ معکوس با Shift+کلیک، و نیمهٔ پنهانِ سهم در tooltipِ سطرها
//
//   ① «میانگینِ سهمِ درس‌ها: ٪۴۹٫۷ · سهمِ کلِ پیکره: ٪۴۷٫۵» — میانگینِ سادهٔ
//      ۱۲ نسبت (درس‌ها هم‌وزن) در برابرِ سهمِ وزن‌دار (Σ/Σ) — ادامهٔ مضمونِ
//      «دو قهرمانِ دو مقیاس» در سطحِ آمار.
//   ② Shift+کلیکِ سطرِ نوار → لنزِ کهرباییِ «بیرون-از-متن» همان درس —
//      مطالعهٔ هدفمندِ معکوس (قرینهٔ کلیکِ آسمانیِ r258)؛ فیلترِ «unused»
//      هرگز در ردیفِ وضعیت نیست (گاردِ ۶ دکمهٔ r253) و نوارِ کهرباییِ
//      شناسه با دکمهٔ بازگشت هویتش را اعلام می‌کند.
//   ③ tooltipِ سطرها حالا هر دو نیمه را می‌گوید: «٪۳۰ در متن · ٪۷۰ بیرون
//      از متن» + مسیرِ Shift در aria-label.
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r260 (scripts/precount-r260.ts):
//   میانگینِ سادهٔ ۱۲ نسبت = ۴۹٫۷٪ · سهمِ کلِ پیکره = ۴۷٫۵٪
//   درسِ ۷: ۷۳/۱۰۵ → بیرون-از-متن = ۳۲ واژه · درسِ ۱: ۲۰۴−۱۳۳ = ۷۱
//   سهمِ بیرونِ درس ۱ = ٪۳۵ · درس ۷ = ٪۳۰ · Σ بیرون-از-متن = ۲۱۱۷ (قفلِ r259)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { lessonsVocabUsageRanking as RANKING } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ ترمینالِ r260
const RANK = RANKING();
expect(RANK.length).toBe(12);
expect(RANK.reduce((n, r) => n + r.usedWords, 0)).toBe(1915);
expect(RANK.reduce((n, r) => n + r.totalWords, 0)).toBe(4032);
const AVG = RANK.reduce((n, r) => n + r.usedWords / r.totalWords, 0) / RANK.length;
const POOLED = 1915 / 4032;
// همان ایدئومِ یک‌رقمِ اعشارِ فارسی (pctFa در dictionary-view)
const pctFa = (ratio: number) => faNum((Math.round(ratio * 1000) / 10).toFixed(1)).replace(".", "٫");
// لنگرهایِ سختِ پیش‌شمارش — رانشِ داده را همان‌جا می‌گیرد
expect(pctFa(AVG)).toBe("۴۹٫۷");
expect(pctFa(POOLED)).toBe("۴۷٫۵");
const L7 = RANK.find((r) => r.lessonId === 7)!;
expect(L7.totalWords - L7.usedWords).toBe(32);
const L1 = RANK.find((r) => r.lessonId === 1)!;
expect(L1.totalWords - L1.usedWords).toBe(71);
// سهمِ بیرونِ گردشده — مستقل محاسبه می‌شود نه ۱۰۰−pct
const unusedPctOf = (r: { usedWords: number; totalWords: number }) =>
  Math.round(((r.totalWords - r.usedWords) / r.totalWords) * 100);
expect(unusedPctOf(L1)).toBe(35);
expect(unusedPctOf(L7)).toBe(30);

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    wordMistakes: {},
    wordSeen: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
});

const openPanel = () => {
  render(<DictionaryView />);
  fireEvent.click(screen.getByTestId("usage-rank-toggle"));
};

// ------------------------------------------------------------------
describe("دو مقیاسِ یک پیکره در تیترِ پنل (r260 ①)", () => {
  it("«میانگینِ سهمِ درس‌ها: ٪۴۹٫۷ · سهمِ کلِ پیکره: ٪۴۷٫۵» — هر دو از لایهٔ داده، هرگز رشتهٔ ثابت", () => {
    openPanel();
    const avg = screen.getByTestId("usage-rank-avg");
    expect(avg.textContent).toContain(`میانگینِ سهمِ درس‌ها: ٪${pctFa(AVG)}`);
    expect(avg.textContent).toContain(`سهمِ کلِ پیکره: ٪${pctFa(POOLED)}`);
    // دو مقیاس واقعاً دو عددند — تفاوتی که فقط با هم‌نشینی دیده می‌شود
    expect(pctFa(AVG)).not.toBe(pctFa(POOLED));
  });

  it("spanِ اطلاعاتی نه دکمه — فضای نامِ a11y (هیچ دکمه‌ای با نامِ میانگین/پیکره)", () => {
    openPanel();
    expect(screen.getByTestId("usage-rank-avg").tagName).toBe("P");
    expect(screen.queryByRole("button", { name: /میانگینِ سهم/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /سهمِ کلِ پیکره/ })).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("tooltipِ دو-نیمه و ariaِ مسیرِ Shift (r260 ③)", () => {
  it("هر سطر هر دو نیمهٔ سهم را می‌گوید + مسیرِ Shift — داده‌محور برای هر ۱۲ درس", () => {
    openPanel();
    for (const r of RANK) {
      const row = screen.getByTestId(`usage-rank-row-${r.lessonId}`);
      const title = row.getAttribute("title") ?? "";
      const usedPct = Math.round((r.usedWords / r.totalWords) * 100);
      expect(title).toContain(`٪${faNum(usedPct)} در متن`);
      expect(title).toContain(`٪${faNum(unusedPctOf(r))} بیرون از متن`);
      expect(title).toContain("کلیک: واژه‌های در-متن");
      expect(title).toContain("Shift+کلیک: بیرون-از-متن");
      // aria-label: مسیرِ Shift اعلام می‌شود؛ فضای نامِ a11یِ r253 برقرار می‌ماند
      const lbl = row.getAttribute("aria-label") ?? "";
      expect(lbl).toContain("با Shift: واژه‌هایی که نیامده‌اند");
      expect(lbl).not.toContain("کاربرددار");
      expect(lbl).not.toContain("جزوه");
    }
    // لنگرِ سختِ پیش‌شمارش: درسِ ۷ = ٪۳۰ بیرون · درسِ ۱ = ٪۳۵ بیرون
    expect(screen.getByTestId("usage-rank-row-7").getAttribute("title")).toContain(`٪${faNum(30)} بیرون از متن`);
    expect(screen.getByTestId("usage-rank-row-1").getAttribute("title")).toContain(`٪${faNum(35)} بیرون از متن`);
  });

  it("زیرنویسِ پنل هر دو مسیر را آموزش می‌دهد", () => {
    openPanel();
    expect(screen.getByTestId("usage-rank-panel").textContent).toContain("با کلید Shift: واژه‌های بیرون-از-متن با لنزِ کهربایی");
  });
});

// ------------------------------------------------------------------
describe("پرشِ معکوس — Shift+کلیکِ سطر → لنزِ کهربایی (r260 ②)", () => {
  it("Shift+کلیکِ درس ۷: پنل جمع، «۳۲ واژه یافت شد»، نوارِ کهرباییِ شناسه با بازگشت", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-7"), { shiftKey: true });
    // پنل جمع شده و نتیجهٔ معکوس بلافاصله دیده می‌شود (لنگرِ پیش‌شمارش: ۱۰۵−۷۳=۳۲)
    expect(screen.queryByTestId("usage-rank-panel")).toBeNull();
    expect(screen.getByText(`${faNum(32)} واژه یافت شد`)).toBeInTheDocument();
    // نوارِ شناسهٔ کهربایی — هویتِ r257/259
    const bar = screen.getByTestId("usage-reverse-bar");
    expect(bar.className).toContain("border-amber-200");
    expect(bar.className).toContain("bg-amber-50");
    expect(bar.className).toContain("dark:bg-amber-900/30");
    expect(within(bar).getByText(/لنزِ کهربایی: فقط واژه‌های بیرون-از-متن/)).toBeInTheDocument();
    expect(within(bar).getByText(/درسِ ۷/)).toBeInTheDocument();
    // دکمهٔ بازگشت — نامِ تمیز (بدونِ کاربرددار/جزوه)
    const clear = screen.getByTestId("usage-reverse-clear");
    expect(clear.getAttribute("aria-label")).toBe("بازگشت از لنزِ کهربایی به همهٔ واژه‌ها");
    expect(clear.getAttribute("aria-label")).not.toContain("کاربرددار");
  });

  it("ردیفِ «وضعیت یادگیری:» حتی با لنزِ کهربایی فعال دقیقاً ۶ دکمه می‌ماند — فیلترِ «unused» هرگز چیپِ ردیف نیست", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-7"), { shiftKey: true });
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    expect(within(row).getAllByRole("button").length).toBe(6);
  });

  it("کلیکِ بازگشت در نوارِ کهربایی: بازگشت به همهٔ ۴۰۳۲ و حذفِ نوار", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-7"), { shiftKey: true });
    expect(screen.getByTestId("usage-reverse-bar")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("usage-reverse-clear"));
    expect(screen.queryByTestId("usage-reverse-bar")).toBeNull();
    expect(screen.getByText(`${faNum(4032)} واژه یافت شد`)).toBeInTheDocument();
  });

  it("کلیکِ ساده (بدونِ Shift) همچنان مسیرِ آسمانیِ r258 است — «۱۳۳ واژه یافت شد» بدونِ نوارِ کهربایی", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-1"));
    expect(screen.getByText(`${faNum(133)} واژه یافت شد`)).toBeInTheDocument();
    expect(screen.queryByTestId("usage-reverse-bar")).toBeNull();
  });

  it("Shift+کلیکِ درس ۱: ۷۱ واژهٔ بیرون-از-متن (لنگرِ دومِ پیش‌شمارش)", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-1"), { shiftKey: true });
    expect(screen.getByText(`${faNum(71)} واژه یافت شد`)).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("قراردادهایِ سطحِ منبع (r260 ④)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("«unused» در unionِ فیلتر و منطقِ فیلتر هست، اما هرگز در stateChips نیست (گاردِ ۶ دکمه)", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain('type StateFilter = "all" | "known" | "unknown" | "due" | "paired" | "usage" | "unused"');
    expect(dict).toContain('stateFilter === "unused" && usageSet.has');
    const chips = dict.slice(dict.indexOf("const stateChips"), dict.indexOf("];", dict.indexOf("const stateChips")));
    expect(chips).not.toContain('"unused"');
  });

  it("پرشِ معکوس در openRankLesson با پارامترِ reverse — نه رشتهٔ جادوییِ پراکنده", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain("const openRankLesson = (lessonId: number, reverse = false) => {");
    expect(dict).toContain('setStateFilter(reverse ? "unused" : "usage")');
    expect(dict).toContain("onClick={(e) => openRankLesson(r.lessonId, e.shiftKey)}");
  });

  it("آمارِ میانگین در memo از سطرهایِ تک‌منبع می‌آید + pctFaِ فارسی — و تک‌منبعِ r258 دست‌نخورده", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain("avgRatio:");
    expect(dict).toContain('data-testid="usage-rank-avg"');
    expect(dict).toContain('data-testid="usage-reverse-bar"');
    expect(dict).toContain('data-testid="usage-reverse-clear"');
    expect(dict).toContain('const pctFa = (ratio: number) =>');
    expect(read("src/lib/word-usage.ts")).toContain("export function lessonsVocabUsageRanking");
    expect(dict).not.toContain("function lessonsVocabUsageRanking");
  });
});
