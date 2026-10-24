// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۸ — دوقلوهایِ خانوادهٔ «کاربرد در جزوه» (بندِ ①+③ پیشنهادِ ۲۵۷):
//
//   ① سرشماریِ کهرباییِ «بی‌کاربرد» رویِ هدرِ جدول‌ها — هم‌سنگِ سرشماریِ
//      آسمانیِ سلولیِ r256: «N خانوادهٔ این جدول هنوز در متن نیامده» —
//      spanِ اطلاعاتی (نه دکمه)، هم‌هویتِ کهرباییِ لنزِ معکوسِ r257؛
//      بی‌خانوادهٔ بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ هدر).
//   ③ نوارِ مقایسه‌ایِ ۱۲ درسی در دیکشنری — «کدام درس بیشترین واژهٔ
//      کاربرددار را دارد؟» از تک‌منبعِ lessonsVocabUsageRanking؛ کلیکِ
//      هر سطر = فیلترِ همان درس + لنزِ آسمانی (مطالعهٔ هدفمندِ دو-کلیکی).
//
// لنگرهایِ داده‌ایِ قفل‌شده با پیش‌شمارشِ ترمینالِ r258 (scripts/precount-r258.ts):
//   Σ = ۱۹۱۵/۴۰۳۲ (دقیقاً همان لنزِ دیکشنری — هم‌مقیاسیِ r253/r257)
//   درس ۱ = ۱۳۳/۲۰۴ · بیشترین = درس ۱۰ با ۴۹۰ (یگانه — بدونِ تساوی)
//   هیچ جدولِ تمام‌استفاده‌ای در پیکره نیست (۱۰/۱۰ جدول چیپِ کهربایی دارد)
//   جدولِ اول: ۳ خانوادهٔ بی‌کاربرد — division/identification/injury
//
// درسِ فضای نامِ a11y (r253→r258): گاردِ r253 لنزِ دیکشنری را با
// /کاربرددار/ می‌کلیکد و ردیفِ «وضعیت یادگیری:» را دقیقاً ۶ دکمه
// می‌خواهد — دکمهٔ مقایسه و سطرهایش بیرونِ آن ردیف‌اند و نامشان هرگز
// «کاربرددار» یا «جزوه»ی برهنه ندارد؛ پرسشِ کاملِ پیشنهاد، تیترِ
// غیرتعاملیِ داخلِ پنل است.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import AppendixView from "@/components/study/lesson/appendix-view";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { WORD_FAMILY_TABLES, type WordFamilyTable } from "@/data/word-families";
import { lessons } from "@/data";
import { findWordUsages, lessonsVocabUsageRanking, lessonVocabUsageCensus } from "@/lib/word-usage";
import { themeOf } from "@/lib/study-theme";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پایه — همان قفل‌هایِ r252/r253
expect(findWordUsages("ability").length).toBe(1);
expect(findWordUsages("broadcast").length).toBe(0);

// لنگرهایِ پیش‌شمارشِ ترمینالِ r258
const RANK = lessonsVocabUsageRanking();
expect(RANK.length).toBe(12);
expect(RANK.reduce((n, r) => n + r.usedWords, 0)).toBe(1915);
expect(RANK.reduce((n, r) => n + r.totalWords, 0)).toBe(4032);
const L1 = RANK.find((r) => r.lessonId === 1)!;
expect(L1.usedWords).toBe(133);
expect(L1.totalWords).toBe(204);
const MAX_USED = Math.max(...RANK.map((r) => r.usedWords));
const MAX_ROWS = RANK.filter((r) => r.usedWords === MAX_USED);
expect(MAX_ROWS.length).toBe(1);
expect(MAX_ROWS[0].lessonId).toBe(10);
expect(MAX_USED).toBe(490);

// جدولِ اولِ ضمیمه (دهم·درس اول) — ۳ بی‌کاربرد از ۳۱ (قفلِ r257)
const TABLE0 = WORD_FAMILY_TABLES[0];
expect(TABLE0.grade).toBe("دهم");
expect(TABLE0.lesson).toBe("درس اول");

// جدولِ ساختگیِ تمام‌استفاده — برایِ صداقتِ صفرِ چیپِ کهربایی
// (در پیکره هیچ جدولِ تمام‌استفاده‌ای نیست — پیش‌شمارشِ r257/r258)
const FULL_TABLE: WordFamilyTable = {
  grade: "دهم",
  vision: "Vision Full",
  lesson: "درس آزمونِ پر",
  families: [
    { noun: "communication", verb: "communicate", adjective: "", adverb: "", fa: "ارتباط" },
    { noun: "culture", verb: "", adjective: "cultural", adverb: "", fa: "فرهنگ" },
  ],
};

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

// ------------------------------------------------------------------
describe("تک‌منبعِ رتبه‌بندی — lessonsVocabUsageRanking (r258 ③)", () => {
  it("۱۲ سطر صعودیِ ۱→۱۲ با هم‌مقیاسیِ کارت — جمع دقیقاً ۱۹۱۵/۴۰۳۲ لنزِ دیکشنری", () => {
    expect(RANK.map((r) => r.lessonId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const r of RANK) {
      expect(r.totalWords).toBe(lessons.find((l) => l.id === r.lessonId)!.vocabulary.length);
      expect(r.usedWords).toBeLessThanOrEqual(r.totalWords);
      expect(r.titleFa).toBe(lessons.find((l) => l.id === r.lessonId)!.titleFa);
      // هم‌مقیاسیِ سطر با تک‌منبعِ سرشماریِ درسِ r257
      const c = lessonVocabUsageCensus(lessons.find((l) => l.id === r.lessonId)!.vocabulary);
      expect(r.usedWords).toBe(c.usedWords);
    }
  });

  it("هیچ درسِ بی‌نواری در پیکره نیست — همهٔ ۱۲ درس دست‌کم یک واژهٔ کاربرددار دارند", () => {
    expect(RANK.filter((r) => r.usedWords === 0).length).toBe(0);
  });
});

// ------------------------------------------------------------------
describe("چیپِ کهرباییِ «بی‌کاربرد» رویِ هدرِ جدول (r258 ①)", () => {
  it("جدولِ اول: «۳ خانوادهٔ این جدول هنوز در متن نیامده» — spanِ اطلاعاتی، نه دکمه، هم‌نشینِ سرشماریِ آسمانی", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const amber = screen.getByTestId("wf-unused-census");
    expect(amber.textContent).toBe(`${faNum(3)} خانوادهٔ این جدول هنوز در متن نیامده`);
    // spanِ اطلاعاتی — فضای نامِ a11yِ دکمه‌ها دست‌نخورده (قراردادِ r253)
    expect(screen.queryByRole("button", { name: /هنوز در متن نیامده/ })).toBeNull();
    // هم‌هویتِ کهرباییِ لنزِ معکوسِ r257 — amber-50/60 · 200 · 800
    expect(amber.className).toContain("border-amber-200");
    expect(amber.className).toContain("bg-amber-50/60");
    expect(amber.className).toContain("text-amber-800");
    // آیکنِ EyeOff — svgِ داخلی
    expect(amber.querySelector("svg")).not.toBeNull();
    // هم‌نشینی با سرشماریِ آسمانیِ r256 — دو نیمهٔ یک جمله
    const sky = screen.getByTestId("wf-usage-census");
    expect(sky.textContent).toContain(`${faNum(59)} از ${faNum(118)} سلول در جزوه`);
  });

  it("جدولِ تمام‌استفاده (ساختگی): هیچ چیپِ کهربایی — صداقتِ صفرِ r252 در سطحِ هدر؛ آسمانی حاضر می‌ماند", () => {
    render(<WordFamilyTableCard table={FULL_TABLE} />);
    expect(screen.queryByTestId("wf-unused-census")).toBeNull();
    expect(screen.getByTestId("wf-usage-census")).toBeInTheDocument();
  });

  it("ضمیمه: هر ۱۰ جدول چیپِ کهربایی دارد — پیکره هیچ جدولِ تمام‌استفاده‌ای ندارد (پیش‌شمارشِ r258)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const ambers = screen.getAllByTestId("wf-unused-census");
    expect(ambers.length).toBe(WORD_FAMILY_TABLES.length);
    expect(ambers.length).toBeGreaterThan(0);
  });

  it("جمعِ اعدادِ چیپ‌هایِ کهرباییِ ضمیمه = ۹۲ — مکملِ دقیقِ لنزِ «فقط کاربرددارها» (۱۵۴ + ۹۲ = ۲۴۶)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const ambers = screen.getAllByTestId("wf-unused-census");
    let total = 0;
    for (const a of ambers) {
      const m = a.textContent?.match(/([۰-۹]+)/u);
      expect(m).not.toBeNull();
      total += Number(m![1].replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
    }
    expect(total).toBe(92);
  });
});

// ------------------------------------------------------------------
describe("نوارِ مقایسه‌ایِ ۱۲ درسی در دیکشنری (r258 ③)", () => {
  it("پیش‌فرض جمع است — دکمه با aria-expanded=false و نامِ بدونِ «کاربرددار» (فضای نامِ لنزِ r253)", () => {
    render(<DictionaryView />);
    const toggle = screen.getByTestId("usage-rank-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "usage-rank-panel");
    const name = toggle.getAttribute("aria-label") ?? toggle.textContent ?? "";
    expect(name).not.toContain("کاربرددار");
    expect(name).not.toContain("جزوه");
    expect(screen.queryByTestId("usage-rank-panel")).toBeNull();
  });

  it("بازِ پنل: ۱۲ سطرِ داده‌محور، تیترِ پرسشِ کامل، badgeِ «بیشترین» یگانه رویِ درسِ ۱۰ (۴۹۰)", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    expect(screen.getByTestId("usage-rank-toggle")).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByTestId("usage-rank-panel");
    expect(panel.textContent).toContain("کدام درس بیشترین واژهٔ کاربرددار را دارد؟");
    const rows = screen.getAllByTestId(/^usage-rank-row-\d+$/);
    expect(rows.length).toBe(12);
    // هر سطر با لایهٔ داده می‌خواند — «used از total» با faNum
    for (const r of RANK) {
      const row = screen.getByTestId(`usage-rank-row-${r.lessonId}`);
      expect(row.textContent).toContain(`${faNum(r.usedWords)} از ${faNum(r.totalWords)}`);
      expect(row.textContent).toContain(r.titleFa);
      // aria-labelِ سطر: هرگز «کاربرددار» یا «جزوه»ی برهنه — کنشِ تمیز
      const lbl = row.getAttribute("aria-label") ?? "";
      expect(lbl).not.toContain("کاربرددار");
      expect(lbl).not.toContain("جزوه");
    }
    // سطرِ ۱ لنگرِ پیش‌شمارش: ۱۳۳ از ۲۰۴
    expect(screen.getByTestId("usage-rank-row-1").textContent).toContain(`${faNum(133)} از ${faNum(204)}`);
    // badgeِ یگانه — دقیقاً داخلِ سطرِ درسِ ۱۰
    const maxes = screen.getAllByTestId("usage-rank-max");
    expect(maxes.length).toBe(1);
    expect(screen.getByTestId("usage-rank-row-10").contains(maxes[0])).toBe(true);
    expect(maxes[0].textContent).toContain("بیشترین");
  });

  it("پانوشتِ جمع: «جمعِ ۱۲ درس: ۱۹۱۵ از ۴۰۳۲ واژه در جزوه» — همان لنزِ دیکشنری، هم‌مقیاسیِ قفل", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    const sum = screen.getByTestId("usage-rank-sum");
    expect(sum.textContent).toContain(`جمعِ ${faNum(12)} درس`);
    expect(sum.textContent).toContain(`${faNum(1915)} از ${faNum(4032)} واژه در جزوه`);
  });

  it("ردیفِ «وضعیت یادگیری:» حتی با پنلِ باز دقیقاً ۶ دکمه می‌ماند — بخشِ مقایسه هرگز داخلِ آن ردیف نیست", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    expect(within(row).getAllByRole("button").length).toBe(6);
  });

  it("کلیکِ سطرِ درس ۱: پنل جمع می‌شود، لنزِ آسمانی و فیلترِ درس روشن — «۱۳۳ واژه یافت شد» (هم‌مقیاسیِ کلیک)", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    fireEvent.click(screen.getByTestId("usage-rank-row-1"));
    // پنل بسته شد تا «N واژه یافت شد» بلافاصله دیده شود
    expect(screen.queryByTestId("usage-rank-panel")).toBeNull();
    expect(screen.getByTestId("usage-rank-toggle")).toHaveAttribute("aria-expanded", "false");
    // شمارندهٔ یافت‌شده = دقیقاً سرشماریِ درسِ ۱ (۱۳۳)
    expect(screen.getByText(/واژه یافت شد/)).toHaveTextContent(`${faNum(133)} واژه یافت شد`);
    // لنزِ کاربرددار فعال — scoped در ردیفِ وضعیت (پنل بسته است؛ نام یکتا)
    const stateRow = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    const lens = within(stateRow).getByRole("button", { name: /کاربرددار/ });
    expect(lens.className).toContain("bg-sky-600");
    // چیپِ فیلترِ درسِ ۱ فعال — رنگِ تمِ همان درس
    const l1 = lessons.find((l) => l.id === 1)!;
    const lessonChip = screen.getByRole("button", { name: `درس ${faNum(1)}: ${l1.titleFa}` });
    expect(lessonChip.className).toContain(themeOf(l1.color).bg);
    // هر کارتِ نمایان چیپِ «در جزوه» دارد — خانواده با خودش می‌آید
    const grid = document.querySelector(".nice-scroll") as HTMLElement;
    const cards = grid.querySelectorAll(":scope > div");
    expect(cards.length).toBe(133);
    for (const card of cards) {
      expect(card.querySelector('[data-testid^="usage-chip-"]')).not.toBeNull();
    }
  });

  it("بازگشتِ کامل: «همهٔ درس‌ها» + «همه» کلِ دیکشنری را برمی‌گرداند — ۴۰۳۲", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    fireEvent.click(screen.getByTestId("usage-rank-row-1"));
    fireEvent.click(screen.getByRole("button", { name: "همهٔ درس‌ها" }));
    const stateRow = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    fireEvent.click(within(stateRow).getByRole("button", { name: new RegExp(`^همه\\s*${faNum(4032)}$`) }));
    expect(screen.getByText(/واژه یافت شد/)).toHaveTextContent(`${faNum(4032)} واژه یافت شد`);
  });
});

// ------------------------------------------------------------------
describe("تک‌منبعی و قراردادهایِ سطحِ منبع (r258 ⑤)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("lessonsVocabUsageRanking فقط در lib تعریف می‌شود؛ دیکشنری از همان import می‌کند — هیچ رتبه‌بندیِ خصوصی", () => {
    const lib = read("src/lib/word-usage.ts");
    expect(lib).toContain("export function lessonsVocabUsageRanking");
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain("lessonsVocabUsageRanking");
    expect(dict).not.toContain("function lessonsVocabUsageRanking");
    for (const f of [
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/lesson/appendix-view.tsx",
    ]) {
      expect(read(f), `${f} must not redefine the usage ranking`).not.toContain("function lessonsVocabUsageRanking");
    }
  });

  it("چیپِ کهربایی و پنلِ مقایسه در سطحِ منبع حاضرند — با testid و متنِ قفل‌شده", () => {
    const card = read("src/components/study/lesson/word-family-table-card.tsx");
    expect(card).toContain('data-testid="wf-unused-census"');
    expect(card).toContain("خانوادهٔ این جدول هنوز در متن نیامده");
    expect(card).toContain("EyeOff");
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain('data-testid="usage-rank-toggle"');
    expect(dict).toContain('data-testid="usage-rank-panel"');
    expect(dict).toContain('data-testid="usage-rank-max"');
    expect(dict).toContain('data-testid="usage-rank-sum"');
    expect(dict).toContain("کدام درس بیشترین واژهٔ کاربرددار را دارد؟");
  });
});
