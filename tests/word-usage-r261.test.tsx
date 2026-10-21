// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۱ — بندهای ①+② پیشنهادِ ۲۶۰: قرینهٔ کهرباییِ «بیشترین» و
// رتبهٔ سهم در tooltipِ سطرها
//
//   ① «بیرونی‌ترین» — badgeِ کهرباییِ قهرمانِ مسیرِ معکوس: درسی با بیشترین
//      واژهٔ بیرون-از-متن (قرینهٔ آسمانیِ «بیشترین» در مقیاسِ شمارش) —
//      هویتِ کهرباییِ خانواده (سرشماریِ r258 / نوارِ r260) با آیکونِ EyeOffِ
//      r257؛ badgeِ پیش‌نمایِ همان مقصدِ Shift+کلیک.
//   ② رتبهٔ سهمِ در-متن در tooltipِ هر سطر («رتبهٔ N از ۱۲») — رتبه‌بندیِ
//      رقابتیِ نسبتِ شناور (همان منطقِ تساویِ امنِ maxRatioِ r259).
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r261 (scripts/precount-r261.ts):
//   قهرمانِ بیرون-از-متن: درسِ ۱۰ با ۴۹۸ — یگانه · Σ بیرون-از-متن = ۲۱۱۷
//   (قفلِ r259) · رتبه‌ها بدونِ تساوی: درسِ ۷=۱ · درسِ ۱=۲ · درسِ ۱۰=۷ ·
//   درسِ ۴=۱۲ (کمترینِ سهمِ ۳۰٫۸٪)
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

// لنگرهایِ پیش‌شمارشِ ترمینالِ r261 — رانشِ داده را همان‌جا می‌گیرد
const RANK = RANKING();
expect(RANK.length).toBe(12);
const maxUnused = Math.max(...RANK.map((r) => r.totalWords - r.usedWords));
const unusedChampions = RANK.filter((r) => r.totalWords - r.usedWords === maxUnused);
expect(maxUnused).toBe(498);
expect(unusedChampions.map((c) => c.lessonId)).toEqual([10]);
expect(RANK.reduce((n, r) => n + (r.totalWords - r.usedWords), 0)).toBe(2117);
// رتبهٔ رقابتیِ نسبتِ در-متن — همان منطقِ memo
const fracs = RANK.map((r) => ({ id: r.lessonId, frac: r.usedWords / r.totalWords }));
const sortedFracs = [...fracs].sort((a, b) => b.frac - a.frac);
const fracRank = new Map<number, number>();
sortedFracs.forEach((f, i) => {
  if (!fracRank.has(f.frac)) fracRank.set(f.frac, i + 1);
});
const rankOfId = new Map<number, number>(fracs.map((f) => [f.id, fracRank.get(f.frac)!]));
// بدونِ تساوی در داده — و لنگرهایِ سختِ پیش‌شمارش
expect(fracRank.size).toBe(12);
expect(rankOfId.get(7)).toBe(1);
expect(rankOfId.get(1)).toBe(2);
expect(rankOfId.get(10)).toBe(7);
expect(rankOfId.get(4)).toBe(12);

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
describe("badgeِ کهرباییِ «بیرونی‌ترین» (r261 ①)", () => {
  it("badge فقط رویِ قهرمانِ یگانهٔ بیرون-از-متن (درسِ ۱۰ با ۴۹۸) — داده‌محور برای هر ۱۲ سطر", () => {
    openPanel();
    // حضورِ badge رویِ هر سطر دقیقاً با قهرمان‌بودنِ بیرون-از-متن هم‌ارز است
    for (const r of RANK) {
      const row = screen.getByTestId(`usage-rank-row-${r.lessonId}`);
      const has = !!within(row).queryByTestId("usage-rank-max-unused");
      expect(has).toBe(r.totalWords - r.usedWords === maxUnused);
    }
    const badge = within(screen.getByTestId("usage-rank-row-10")).getByTestId("usage-rank-max-unused");
    expect(badge.textContent).toContain("بیرونی‌ترین");
    // spanِ اطلاعاتی نه دکمه — فضای نامِ a11y (هیچ دکمه‌ای با نامِ «بیرونی‌ترین»)
    expect(badge.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /بیرونی‌ترین/ })).toBeNull();
    // EyeOff — هویتِ بیرون-از-متنِ r257
    expect(badge.querySelector("svg")).not.toBeNull();
    // مقصدِ مسیر در tooltip آموزش داده می‌شود
    expect(badge.getAttribute("title")).toContain("Shift+کلیک");
    // هویتِ کهرباییِ خانواده — همان ایدئومِ سرشماریِ r258 (تاریک‌امنِ kernel)
    expect(badge.className).toContain("border-amber-200");
    expect(badge.className).toContain("bg-amber-50/60");
    expect(badge.className).toContain("text-amber-800");
  });

  it("درسِ ۱۰ هر دو قهرمانی را هم‌زمان دارد — آسمانیِ «بیشترین» و کهرباییِ «بیرونی‌ترین» — و درسِ ۷ فقط «بیشترینِ نسبت»", () => {
    openPanel();
    const row10 = screen.getByTestId("usage-rank-row-10");
    expect(within(row10).getByTestId("usage-rank-max")).toBeInTheDocument(); // ۴۹۰ در-متن
    expect(within(row10).getByTestId("usage-rank-max-unused")).toBeInTheDocument(); // ۴۹۸ بیرون
    expect(within(row10).queryByTestId("usage-rank-max-ratio")).toBeNull(); // رتبهٔ ۷
    const row7 = screen.getByTestId("usage-rank-row-7");
    expect(within(row7).getByTestId("usage-rank-max-ratio")).toBeInTheDocument();
    expect(within(row7).queryByTestId("usage-rank-max-unused")).toBeNull(); // ۳۲ — کمترینِ بیرون
  });

  it("badgeِ پیش‌نمایِ مقصد است — Shift+کلیکِ همان سطر → «۴۹۸ واژه یافت شد»", () => {
    openPanel();
    fireEvent.click(screen.getByTestId("usage-rank-row-10"), { shiftKey: true });
    expect(screen.getByText(`${faNum(498)} واژه یافت شد`)).toBeInTheDocument();
    expect(screen.getByTestId("usage-reverse-bar")).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("رتبهٔ سهمِ در-متن در tooltipِ سطرها (r261 ②)", () => {
  it("هر ۱۲ سطر «رتبهٔ N از ۱۲ در سهمِ در-متن» دارد — داده‌محور با رتبه‌بندیِ رقابتیِ تست", () => {
    openPanel();
    for (const r of RANK) {
      const title = screen.getByTestId(`usage-rank-row-${r.lessonId}`).getAttribute("title") ?? "";
      expect(title).toContain(`رتبهٔ ${faNum(rankOfId.get(r.lessonId)!)} از ${faNum(RANK.length)} در سهمِ در-متن`);
      // نیمه‌های r260 دست‌نخورده — رتبه در ادامهٔ همان سطر نشسته
      expect(title).toContain("در متن · ");
      expect(title).toContain("کلیک: واژه‌های در-متن");
    }
  });

  it("لنگرهایِ سختِ پیش‌شمارش: درسِ ۷ = رتبهٔ ۱ · درسِ ۱ = رتبهٔ ۲ · درسِ ۱۰ = رتبهٔ ۷ · درسِ ۴ = رتبهٔ ۱۲", () => {
    openPanel();
    expect(screen.getByTestId("usage-rank-row-7").getAttribute("title")).toContain(
      `رتبهٔ ${faNum(1)} از ${faNum(12)}`
    );
    expect(screen.getByTestId("usage-rank-row-1").getAttribute("title")).toContain(
      `رتبهٔ ${faNum(2)} از ${faNum(12)}`
    );
    expect(screen.getByTestId("usage-rank-row-10").getAttribute("title")).toContain(
      `رتبهٔ ${faNum(7)} از ${faNum(12)}`
    );
    expect(screen.getByTestId("usage-rank-row-4").getAttribute("title")).toContain(
      `رتبهٔ ${faNum(12)} از ${faNum(12)}`
    );
  });
});

// ------------------------------------------------------------------
describe("قراردادهایِ سطحِ منبع (r261 ③)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("maxUnused و rankOf در همان memoِ تک‌منبع‌اند — badge با هویتِ کهرباییِ خانواده و رتبه در title", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain("maxUnused: rows.reduce");
    expect(dict).toContain("rankOf:");
    expect(dict).toContain('data-testid="usage-rank-max-unused"');
    expect(dict).toContain("بیرونی‌ترین");
    expect(dict).toContain("border-amber-200 bg-amber-50/60");
    expect(dict).toContain("در سهمِ در-متن");
    expect(dict).toContain("usageRank.rankOf.get(r.lessonId)");
  });

  it("تک‌منبعِ r258 دست‌نخورده + نامِ badge هرگز «کاربرددار/جزوه»ی برهنه را تصاحب نمی‌کند", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(read("src/lib/word-usage.ts")).toContain("export function lessonsVocabUsageRanking");
    expect(dict).not.toContain("function lessonsVocabUsageRanking");
    // فضای نامِ a11یِ r253: badgeِ نو هم از آن دو نام دوری می‌کند
    const badgeBlock = dict.slice(dict.indexOf("usage-rank-max-unused"));
    badgeBlock.slice(0, badgeBlock.indexOf("</span>"));
    expect(badgeBlock.slice(0, 800)).not.toMatch(/کاربرددار/);
    expect(badgeBlock.slice(0, 800)).not.toMatch(/جزوه/);
  });
});
