// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۲ — بندهای ①+② پیشنهادِ ۲۶۱: قهرمانِ چهارمِ ماتریسِ ۲×۲ و
// پراکندگیِ درس‌ها در دیالوگِ کاربردِ مشترک
//
//   ① «بیرونی‌ترینِ نسبت» — badgeِ کهرباییِ قرینهٔ «بیشترینِ نسبت» رویِ
//      درسی با بیشترین نسبتِ بیرون-از-متن از واژگانِ خودش؛ ماتریسِ کاملِ
//      چهار قهرمان: {شمارش، نسبت} × {در-متن، بیرون-از-متن}.
//   ② نوارِ «پراکندگیِ درس‌ها» زیرِ تیترِ دیالوگِ مشترک — وقتی واژه در
//      ≥۲ درس زندگی می‌کند؛ صدرنشینِ پر، بقیهٔ روشن؛ واژهٔ تک-درسه بدونِ
//      نوار (صداقتِ r252).
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r262 (scripts/precount-r262.ts):
//   قهرمانِ «بیرونی‌ترینِ نسبت»: درسِ ۴ با ۲۳۶/۳۴۱ = ٪۶۹٫۲ — یگانه
//   ماتریسِ ۲×۲: شمارشِ در-متن→۱۰ · نسبتِ در-متن→۷ · شمارشِ بیرون→۱۰ ·
//   نسبتِ بیرون→۴
//   change: ۱۳ کاربرد · ۶ درس → ۵=۵ · ۶=۳ · ۹=۲ · ۲=۱ · ۷=۱ · ۱۱=۱
//   communication: ۳ کاربرد · ۲ درس → ۱=۲ · ۲=۱ · ability: ۱ کاربرد · ۱ درس
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { lessonsVocabUsageRanking as RANKING, findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ ترمینالِ r262 — رانشِ داده را همان‌جا می‌گیرد
const RANK = RANKING();
expect(RANK.length).toBe(12);
const unusedRatioOf = (r: { usedWords: number; totalWords: number }) => (r.totalWords - r.usedWords) / r.totalWords;
const maxUnusedRatio = Math.max(...RANK.map(unusedRatioOf));
const champs = RANK.filter((r) => unusedRatioOf(r) === maxUnusedRatio);
expect(maxUnusedRatio).toBeCloseTo(236 / 341, 12);
expect(champs.map((c) => c.lessonId)).toEqual([4]);
// ماتریسِ کاملِ چهار قهرمان — هر چهار تاج رویِ سه سطر
expect(RANK.filter((r) => r.usedWords === Math.max(...RANK.map((x) => x.usedWords))).map((r) => r.lessonId)).toEqual([10]);
expect(RANK.filter((r) => r.usedWords / r.totalWords === Math.max(...RANK.map((x) => x.usedWords / x.totalWords))).map((r) => r.lessonId)).toEqual([7]);
expect(RANK.filter((r) => r.totalWords - r.usedWords === Math.max(...RANK.map((x) => x.totalWords - x.usedWords))).map((r) => r.lessonId)).toEqual([10]);
// پراکندگیِ واژه‌هایِ لنگر
const CHANGE_SITES = findWordUsages("change");
expect(CHANGE_SITES.length).toBe(13);
const changeByLesson = new Map<number, number>();
CHANGE_SITES.forEach((s) => changeByLesson.set(s.lessonId, (changeByLesson.get(s.lessonId) ?? 0) + 1));
expect(changeByLesson.size).toBe(6);
expect(changeByLesson.get(5)).toBe(5);
expect(changeByLesson.get(6)).toBe(3);
expect(findWordUsages("communication").length).toBe(3);
expect(findWordUsages("ability").length).toBe(1);

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
describe("badgeِ کهرباییِ «بیرونی‌ترینِ نسبت» (r262 ①)", () => {
  it("badge فقط رویِ قهرمانِ یگانهٔ نسبتِ بیرون-از-متن (درسِ ۴ با ٪۶۹٫۲) — داده‌محور برای هر ۱۲ سطر", () => {
    openPanel();
    for (const r of RANK) {
      const row = screen.getByTestId(`usage-rank-row-${r.lessonId}`);
      expect(!!within(row).queryByTestId("usage-rank-max-unused-ratio")).toBe(
        unusedRatioOf(r) === maxUnusedRatio
      );
    }
    const badge = within(screen.getByTestId("usage-rank-row-4")).getByTestId("usage-rank-max-unused-ratio");
    expect(badge.textContent).toContain("بیرونی‌ترینِ نسبت");
    // spanِ اطلاعاتی نه دکمه + آیکونِ Percentِ مقیاسِ نسبت + tooltipِ مسیر
    expect(badge.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /بیرونی‌ترینِ نسبت/ })).toBeNull();
    expect(badge.querySelector("svg")).not.toBeNull();
    expect(badge.getAttribute("title")).toContain("Shift+کلیک");
    // هویتِ کهرباییِ خانواده — همان ایدئومِ r258/261 (تاریک‌امنِ kernel)
    expect(badge.className).toContain("border-amber-200");
    expect(badge.className).toContain("bg-amber-50/60");
    expect(badge.className).toContain("text-amber-800");
  });

  it("ماتریسِ ۲×۲ کامل — درسِ ۴ دقیقاً یک badge، درسِ ۱۰ دقیقاً دو، درسِ ۷ دقیقاً یک؛ چهار تاجِ سه سطر", () => {
    openPanel();
    const badgeIdsOf = (row: HTMLElement) =>
      ["usage-rank-max", "usage-rank-max-ratio", "usage-rank-max-unused", "usage-rank-max-unused-ratio"].filter(
        (t) => !!within(row).queryByTestId(t)
      );
    expect(badgeIdsOf(screen.getByTestId("usage-rank-row-4"))).toEqual(["usage-rank-max-unused-ratio"]);
    expect(badgeIdsOf(screen.getByTestId("usage-rank-row-10"))).toEqual(["usage-rank-max", "usage-rank-max-unused"]);
    expect(badgeIdsOf(screen.getByTestId("usage-rank-row-7"))).toEqual(["usage-rank-max-ratio"]);
  });
});

// ------------------------------------------------------------------
describe("نوارِ «پراکندگیِ درس‌ها» در دیالوگِ مشترک (r262 ②)", () => {
  const renderDialog = (en: string) =>
    render(<WordUsageDialog target={{ en, sites: findWordUsages(en) }} onClose={vi.fn()} />);

  it("change: نوار با ۶ چیپِ مرتب — صدرنشینِ درسِ ۵ پر، بقیهٔ روشن — همه از لایهٔ داده", () => {
    renderDialog("change");
    const bar = screen.getByTestId("usage-lessons-bar");
    expect(bar.textContent).toContain("پراکندگیِ درس‌ها:");
    const chips = [...bar.querySelectorAll('[data-testid^="usage-lesson-chip-"]')];
    expect(chips.length).toBe(6);
    // مرتب‌سازی: شمارشِ نزولی سپس شناسهٔ صعودی — اولین چیپ = صدرنشینِ درسِ ۵
    expect(chips[0].getAttribute("data-testid")).toBe("usage-lesson-chip-5");
    expect(chips[0].textContent).toContain(`درس ${faNum(5)}`);
    expect(chips[0].textContent).toContain(faNum(5));
    // صدرنشین: پر + توضیح؛ بقیه: روشنِ خانوادهٔ بنفش
    expect(chips[0].className).toContain("bg-violet-600");
    expect(chips[0].className).toContain("text-white");
    expect(chips[0].getAttribute("title")).toContain(`بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(5)}`);
    const rest = chips.slice(1);
    expect(rest.length).toBe(5);
    rest.forEach((c) => {
      expect(c.className).toContain("bg-violet-100");
      expect(c.className).toContain("text-violet-700");
      expect(c.getAttribute("title")).toBeNull();
    });
    // شمارش‌هایِ لنگرِ پیش‌شمارش: درسِ ۶ = ۳ · درسِ ۹ = ۲
    expect(screen.getByTestId("usage-lesson-chip-6").textContent).toContain(faNum(3));
    expect(screen.getByTestId("usage-lesson-chip-9").textContent).toContain(faNum(2));
  });

  it("چیپ‌ها spanِ اطلاعاتی‌اند نه دکمه — فضای نامِ a11yِ r253 دست‌نخورده", () => {
    renderDialog("change");
    expect(screen.getByTestId("usage-lesson-chip-5").tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /پراکندگی/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /درس/ })).toBeNull();
  });

  it("communication: ۲ چیپ با صدرنشینِ درسِ ۱ — و ability (تک-درسه) بدونِ نوار — صداقتِ r252", () => {
    renderDialog("communication");
    expect(screen.getByTestId("usage-lessons-bar")).toBeInTheDocument();
    expect(screen.getByTestId("usage-lesson-chip-1").className).toContain("bg-violet-600");
    expect(screen.getByTestId("usage-lesson-chip-2").className).toContain("bg-violet-100");
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-bar")).toBeNull();
    // ولی خودِ دیالوگ با سایتِ یگانه سالم است
    expect(screen.getByTestId("usage-dialog")).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("قراردادهایِ سطحِ منبع (r262 ③)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("maxUnusedRatio در همان memoِ تک‌منبع + badgeِ کهرباییِ جدید در ردیف‌ها", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain("maxUnusedRatio: rows.reduce");
    expect(dict).toContain('data-testid="usage-rank-max-unused-ratio"');
    expect(dict).toContain("بیرونی‌ترینِ نسبت");
  });

  it("نوارِ پراکندگی فقط در دیالوگِ مشترک زندگی می‌کند — شرطِ ≥۲ درس + ایدئومِ صدرنشینِ پر", () => {
    const dlg = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(dlg).toContain('data-testid="usage-lessons-bar"');
    expect(dlg).toContain("lessonCounts.length >= 2");
    expect(dlg).toContain("bg-violet-600");
    expect(dlg).toContain("bg-violet-100");
    expect(dlg).toContain("count === maxLessonCount");
    // هیچ نسخهٔ خصوصی دیگری از نوار در مصرف‌کننده‌هایِ شش‌گانه نیست
    for (const f of [
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/flashcards.tsx",
      "src/components/study/lesson/word-of-day.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/practice/danger-words.tsx",
    ]) {
      expect(read(f)).not.toContain("usage-lessons-bar");
    }
  });

  it("تک‌منبعِ دیالوگِ مشترک دست‌نخورده — مصرف‌کننده‌هایِ خانواده همان فایل را می‌خوانند", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain('from "./word-usage-dialog"');
    expect(read("src/components/study/lesson/vocab-tab.tsx")).toContain("word-usage-dialog");
    expect(read("src/components/study/lesson/flashcards.tsx")).toContain("word-usage-dialog");
    expect(read("src/components/study/lesson/word-of-day.tsx")).toContain("word-usage-dialog");
    expect(read("src/components/study/practice/danger-words.tsx")).toContain("word-usage-dialog");
  });
});
