// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۹ — سه بندِ پیشنهادِ ۲۵۸: دوقلوها به سطحِ کلِ پیکره می‌رسند
//
//   ① سهمِ «بی‌کاربرد» در پانوشتِ نوارِ مقایسه‌ای — «جمعِ ۱۲ درس: ۱۹۱۵ از
//      ۴۰۳۲ واژه در جزوه · بی‌کاربردها: ۲۱۱۷ واژه» (مکملِ دقیق؛ دوقلویِ
//      هدرها در سطحِ کلِ پیکره هم می‌نشیند).
//   ② badgeِ «بیشترینِ نسبت» کنارِ «بیشترینِ شمارش» — دو قهرمانِ دو مقیاس:
//      درسِ ۱۰ (۴۹۰ کارت) و درسِ ۷ (۷۳/۱۰۵ = ۶۹٫۵٪) — هر دو یگانه در پیکره،
//      تساوی = همهٔ صدرنشین‌ها؛ هویتِ آسمانیِ خط‌دار در برابرِ پرِ شمارش.
//   ③ چیپِ کهرباییِ هدر در بسترِ لنزدار (ضمیمه) دکمهٔ چرخانندهٔ لنزِ
//      «فقط بی‌کاربردها» می‌شود (قرینهٔ کلیکِ سطرِ نوارِ r258) — الگویِ
//      relatedLesson/onOpenLesson: میزبان تصمیم می‌گیرد؛ در بسترِ بی‌لنز
//      (آکاردئونِ درس) همان spanِ اطلاعاتیِ r258 می‌ماند.
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r259 (scripts/precount-r259.ts):
//   Σ = ۱۹۱۵/۴۰۳۲ · بی‌کاربردها = ۲۱۱۷
//   بیشترینِ شمارش = درس ۱۰ (۴۹۰، یگانه) · بیشترینِ نسبت = درس ۷ (۶۹٫۵٪، یگانه)
//   برخوردِ دو badge = هیچ (دو قهرمانِ جدا)
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
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { lessonsVocabUsageRanking as RANKING } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ ترمینالِ r259
const RANK = RANKING();
expect(RANK.length).toBe(12);
expect(RANK.reduce((n, r) => n + r.usedWords, 0)).toBe(1915);
expect(RANK.reduce((n, r) => n + r.totalWords, 0)).toBe(4032);
const MAX_USED = Math.max(...RANK.map((r) => r.usedWords));
const MAX_RATIO = Math.max(...RANK.map((r) => r.usedWords / r.totalWords));
expect(RANK.filter((r) => r.usedWords === MAX_USED)).toHaveLength(1);
expect(RANK.filter((r) => r.usedWords / r.totalWords === MAX_RATIO)).toHaveLength(1);
expect(RANK.find((r) => r.usedWords === MAX_USED)!.lessonId).toBe(10);
expect(RANK.find((r) => r.usedWords / r.totalWords === MAX_RATIO)!.lessonId).toBe(7);

// جدولِ اولِ ضمیمه — ۳ بی‌کاربرد از ۳۱ (قفلِ r257)
const TABLE0 = WORD_FAMILY_TABLES[0];

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
describe("پانوشتِ دوم — سهمِ بی‌کاربردِ کلِ پیکره (r259 ①)", () => {
  it("«جمعِ ۱۲ درس: ۱۹۱۵ از ۴۰۳۲ واژه در جزوه · بی‌کاربردها: ۲۱۱۷ واژه» — مکملِ دقیق، داده‌محور", () => {
    openPanel();
    const sum = screen.getByTestId("usage-rank-sum");
    expect(sum.textContent).toContain(`جمعِ ${faNum(12)} درس`);
    expect(sum.textContent).toContain(`${faNum(1915)} از ${faNum(4032)} واژه در جزوه`);
    expect(sum.textContent).toContain(`بی‌کاربردها: ${faNum(2117)} واژه`);
    // مکملِ ریاضی — از لایهٔ داده، نه رشتهٔ ثابت
    expect(RANK.reduce((n, r) => n + r.totalWords, 0) - RANK.reduce((n, r) => n + r.usedWords, 0)).toBe(2117);
  });
});

// ------------------------------------------------------------------
describe("دو قهرمانِ دو مقیاس (r259 ②)", () => {
  it("badgeِ «بیشترین» یگانه رویِ درسِ ۱۰ و «بیشترینِ نسبت» یگانه رویِ درسِ ۷ — بدونِ برخورد", () => {
    openPanel();
    const maxCount = screen.getAllByTestId("usage-rank-max");
    expect(maxCount).toHaveLength(1);
    expect(screen.getByTestId("usage-rank-row-10").contains(maxCount[0])).toBe(true);
    const maxRatio = screen.getAllByTestId("usage-rank-max-ratio");
    expect(maxRatio).toHaveLength(1);
    expect(screen.getByTestId("usage-rank-row-7").contains(maxRatio[0])).toBe(true);
    // تفکیکِ دو مقیاس
    expect(maxCount[0].textContent).toContain("بیشترین");
    expect(maxRatio[0].textContent).toContain("بیشترینِ نسبت");
  });

  it("هویتِ بصری: شمارش = پرِ آسمانی (bg-sky-600) · نسبت = خطِ دورِ ملایم (border-sky-200/bg-sky-50)", () => {
    openPanel();
    const count = screen.getByTestId("usage-rank-max");
    expect(count.className).toContain("bg-sky-600");
    expect(count.className).not.toContain("border");
    const ratio = screen.getByTestId("usage-rank-max-ratio");
    expect(ratio.className).toContain("border-sky-200");
    expect(ratio.className).toContain("bg-sky-50");
    expect(ratio.className).toContain("text-sky-700");
  });

  it("نامِ badgeِ نسبت هرگز «کاربرددار» یا «جزوه»ی برهنه ندارد — فضای نامِ a11y (درسِ r253)", () => {
    openPanel();
    const ratio = screen.getByTestId("usage-rank-max-ratio");
    expect(ratio.textContent).not.toContain("کاربرددار");
    expect(ratio.textContent).not.toContain("جزوه");
  });
});

// ------------------------------------------------------------------
describe("چیپِ کهرباییِ هدر → لنزِ «فقط بی‌کاربردها» (r259 ③)", () => {
  it("در بسترِ بی‌callback (الگویِ r258) همان spanِ اطلاعاتی است — هیچ دکمه‌ای با نامش نیست", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const amber = screen.getByTestId("wf-unused-census");
    expect(amber.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /هنوز در متن نیامده/ })).toBeNull();
  });

  it("در بسترِ callback: دکمه با aria-pressed=false؛ کلیک → لنزِ r257 روشن (toggleِ ضمیمه pressed، جدولِ اول ۳ ردیفِ بی‌کاربرد)", () => {
    let toggles = 0;
    const onToggle = () => {
      toggles++;
    };
    render(<WordFamilyTableCard table={TABLE0} onToggleUnusedLens={onToggle} unusedLensOn={false} />);
    const amber = screen.getByTestId("wf-unused-census");
    expect(amber.tagName).toBe("BUTTON");
    expect(amber).toHaveAttribute("aria-pressed", "false");
    expect(amber.textContent).toBe(`${faNum(3)} خانوادهٔ این جدول هنوز در متن نیامده`);
    fireEvent.click(amber);
    expect(toggles).toBe(1);
  });

  it("حالتِ فعالِ لنز: aria-pressed=true و پس‌زمینهٔ پرشدهٔ bg-amber-100 — بازگشتِ متنِ aria به «بازگشت»", () => {
    render(<WordFamilyTableCard table={TABLE0} onToggleUnusedLens={() => {}} unusedLensOn />);
    const amber = screen.getByTestId("wf-unused-census");
    expect(amber).toHaveAttribute("aria-pressed", "true");
    expect(amber.className).toContain("bg-amber-100");
    expect(amber.getAttribute("aria-label")).toContain("بازگشت به همهٔ خانواده‌ها");
  });

  it("پیوندِ واقعی در ضمیمه: کلیکِ چیپِ کهربایی = همان لنزِ r257 — toggleِ pressed و جدولِ اول دقیقاً division/identification/injury", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    // پیش از کلیک: toggleِ لنز خاموش، چیپ‌های کهربایی spanِ بی‌فشار
    const lensToggle = screen.getByTestId("pos-unused-only-toggle");
    expect(lensToggle).toHaveAttribute("aria-pressed", "false");
    const ambers = screen.getAllByTestId("wf-unused-census");
    expect(ambers[0].tagName).toBe("BUTTON");
    expect(ambers[0]).toHaveAttribute("aria-pressed", "false");
    // کلیکِ چیپِ کهرباییِ جدولِ اول
    fireEvent.click(ambers[0]);
    // همان stateِ لنزِ r257 روشن شده
    expect(screen.getByTestId("pos-unused-only-toggle")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("pos-used-only-toggle")).toHaveAttribute("aria-pressed", "false");
    // جدولِ اول به ۳ خانوادهٔ بی‌کاربرد فیلتر شده (لنگرِ r257) — هر ۱۰ جدول pressed
    const pressed = screen.getAllByTestId("wf-unused-census");
    expect(pressed.length).toBe(WORD_FAMILY_TABLES.length);
    for (const p of pressed) expect(p).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(`${faNum(3)} از ${faNum(31)} خانوادهٔ بی‌کاربرد`)).toBeInTheDocument();
    expect(screen.getByText(/division/)).toBeInTheDocument();
    expect(screen.getByText(/identification/)).toBeInTheDocument();
    expect(screen.getByText(/injury/)).toBeInTheDocument();
    // و سرشماریِ آسمانی هم‌نشین می‌ماند (دو نیمهٔ یک جمله) — در هر ۱۰ جدول
    expect(screen.getAllByTestId("wf-usage-census").length).toBe(WORD_FAMILY_TABLES.length);
  });

  it("چیپِ آسمانیِ سلولی هرگز دکمه نمی‌شود — کنشِ هر سلول، چیپِ خودِ سلول است (قراردادِ r256)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const sky = screen.getAllByTestId("wf-usage-census")[0];
    expect(sky.tagName).toBe("SPAN");
  });
});

// ------------------------------------------------------------------
describe("قراردادهایِ سطحِ منبع (r259 ④)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("propِ دوتایی در کارت + تغذیه از ضمیمه — الگویِ میزبانِ تصمیم‌گیر", () => {
    const card = read("src/components/study/lesson/word-family-table-card.tsx");
    expect(card).toContain("onToggleUnusedLens?: () => void;");
    expect(card).toContain("unusedLensOn?: boolean;");
    expect(card).toContain("aria-pressed={!!unusedLensOn}");
    expect(card).toContain("bg-amber-100");
    const appendix = read("src/components/study/lesson/appendix-view.tsx");
    expect(appendix).toContain("onToggleUnusedLens={() => setPosLens((v) => (v === \"unused\" ? \"all\" : \"unused\"))}");
    expect(appendix).toContain("unusedLensOn={posLens === \"unused\"}");
  });

  it("badgeِ نسبت و پانوشتِ دوم در دیکشنری حاضرند — با testid و متنِ قفل‌شده", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain('data-testid="usage-rank-max-ratio"');
    expect(dict).toContain("بیشترینِ نسبت");
    expect(dict).toContain("بی‌کاربردها: {faNum(usageRank.sumTotal - usageRank.sumUsed)}");
    expect(dict).toContain("Percent");
  });

  it("تک‌منبعِ رتبه‌بندی دست‌نخورده — lessonsVocabUsageRanking فقط در lib (قفلِ r258 ادامه دارد)", () => {
    expect(read("src/lib/word-usage.ts")).toContain("export function lessonsVocabUsageRanking");
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).not.toContain("function lessonsVocabUsageRanking");
  });
});
