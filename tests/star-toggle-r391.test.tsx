// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۹۱ — قراردادِ a11y خانوادهٔ ستاره: «افزودن/حذف {en} به/از واژه‌های من»
// سرشماریِ ۸ دکمهٔ ستاره در ۶ نما (srs ×2 · danger · my-words · quiz-result ·
// flashcards · vocab-tab · dictionary) این حکم را داد:
//   ① زیرگروهِ همقرارداد: قالبِ ariaِ بی‌گیومِ نامدار — مالکش
//     state/slices/starred.ts است (همان فایلی که toggleStarred را می‌مالد)
//     و با قراردادِ ثباتِ مسیرِ r384 از study-store بازنشر میشود.
//   ② ترمیمِ واقعیِ راند: my-words aria-pressed نداشت (۷ سایتِ دیگر داشتند) —
//     شاهدِ زندهٔ agent-browser: snapshot دکمهٔ my-words هیچ حالتِ pressed
//     نداشت درحالیکه دیکشنری aria-pressed="true" میداد.
//   ③ حکمهای «نخیر»: فلش‌کارت ariaِ ایستایِ بافتاری (کارت خودِ بافت است)؛
//     دو titleِ گیومه‌دار (danger/quiz-result) گویشِ آزادِ tooltip؛
//     گویشِ Set/includes در مشتقِ وضعیت — همه مستند، نه خطا.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyWordsView from "@/components/study/practice/my-words";
import { useStudy, starToggleAria } from "@/lib/study-store";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [], wordMistakes: {}, wordSeen: {} });
});

describe("مالکِ قرارداد — starToggleAria (state/slices/starred.ts)", () => {
  it("قالبِ دقیقِ هر دو حالت با ارقامِ فارسیِ ناموجود — رشتهها بایتی قفلاند", () => {
    expect(starToggleAria("ability", false)).toBe("افزودن ability به واژه‌های من");
    expect(starToggleAria("ability", true)).toBe("حذف ability از واژه‌های من");
  });

  it("هیچ گیومهٔ «» در خروجیِ aria نمیگذارد — قراردادِ ۶سایتیِ بی‌گیوم", () => {
    for (const en of ["experience", "absolutely", "way"]) {
      expect(starToggleAria(en, false)).not.toContain("«");
      expect(starToggleAria(en, true)).not.toContain("»");
      expect(starToggleAria(en, true)).not.toContain("«");
      expect(starToggleAria(en, false)).not.toContain("»");
    }
  });

  it("نامِ واژه همیشه در aria است — ستونِ فقراتِ قراردادِ خانواده", () => {
    expect(starToggleAria("broadcast", false)).toContain("broadcast");
    expect(starToggleAria("broadcast", true)).toContain("broadcast");
  });

  it("بازنشرِ study-store = همان تابعِ مالک — دو نام برای یک تابع نیست (درسِ r385)", async () => {
    const slice = await import("@/state/slices/starred");
    expect(starToggleAria).toBe(slice.starToggleAria);
  });
});

describe("ترمیمِ زندهٔ راند — my-words ستارهٔ aria-pressedدار", () => {
  const l1 = lessons[0].vocabulary[0];

  it("دکمهٔ ستارهٔ my-words: aria از مالک (حذفِ نامدار) + aria-pressed=true — قفلِ رفتاریِ ترمیم", () => {
    const key = `1:${l1.en.toLowerCase()}`;
    useStudy.setState({ starredWords: [key] });
    render(<MyWordsView />);
    const star = screen.getByRole("button", { name: `حذف ${l1.en} از واژه‌های من` });
    expect(star).toHaveAttribute("aria-pressed", "true");
  });

  it("کلیکِ ستاره واژه را از کتابِ شخصی حذف میکند — رفتارِ toggleStarred دستنخورده", async () => {
    const key = `1:${l1.en.toLowerCase()}`;
    useStudy.setState({ starredWords: [key] });
    render(<MyWordsView />);
    const star = screen.getByRole("button", { name: `حذف ${l1.en} از واژه‌های من` });
    fireEvent.click(star);
    await waitFor(() => {
      expect(useStudy.getState().starredWords).not.toContain(key);
    });
  });
});

describe("قفلهایِ منبعِ سرشماری (r391)", () => {
  const borrowers: Array<[string, number]> = [
    ["src/components/study/practice/srs-panel.tsx", 4], // دو دکمه × (title+aria)
    ["src/components/study/practice/danger-words.tsx", 1],
    ["src/components/study/practice/my-words.tsx", 1],
    ["src/components/study/quiz/quiz-result.tsx", 1],
    ["src/components/study/lesson/vocab-tab.tsx", 1],
    ["src/components/study/lesson/dictionary-view.tsx", 1],
  ];

  it("شش نما از مالک وام میگیرند — با شمارشِ دقیقِ فراخوانها", () => {
    for (const [file, calls] of borrowers) {
      const src = read(file);
      expect(src, file).toContain("starToggleAria");
      const n = src.split("starToggleAria(").length - 1;
      expect(`${file}: ${n} calls`).toBe(`${file}: ${calls} calls`);
    }
  });

  it("قالبِ دستیِ aria در کلِ src/components منقرض است", () => {
    const offenders = borrowers
      .map(([f]) => f)
      .concat(["src/components/study/lesson/flashcards.tsx"])
      .filter((f) => /aria-label=\{\s*(isStarred|starred)\s*\?\s*`حذف/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("دو titleِ گیومه‌دار گویشِ مستند میمانند — بیشتر از آن خطاست، کمترش فراموشی", () => {
    expect(read("src/components/study/practice/danger-words.tsx")).toContain(
      'title={isStarred ? `حذف «${d.en}» از واژه‌های من` : `افزودن «${d.en}» به واژه‌های من`}'
    );
    expect(read("src/components/study/quiz/quiz-result.tsx")).toContain(
      'title={isStarred ? `حذف «${sw.en}» از واژه‌های من` : `افزودن «${sw.en}» به واژه‌های من`}'
    );
    const guilTitles = borrowers
      .map(([f]) => read(f))
      .join("\n")
      .match(/title=\{(?:isStarred|starred) \? `حذف «/g)!.length;
    expect(guilTitles).toBe(2);
  });

  it("my-words: aria-pressed={true} در سورس است — دکمهٔ همیشه‌ستاره وضعیتش را اعلام میکند", () => {
    expect(read("src/components/study/practice/my-words.tsx")).toContain("aria-pressed={true}");
  });

  it("فلش‌کارت ariaِ ایستایِ بافتاری میماند و مالک را وارد نمیکند — حکمِ «نخیر»ِ ①", () => {
    const src = read("src/components/study/lesson/flashcards.tsx");
    expect(src).toContain('aria-label={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}');
    expect(src).not.toContain("starToggleAria");
  });

  it("مالک در اسلایسِ ستاره زندگی میکند و از study-store بازنشر میشود — ثباتِ مسیرِ r384", async () => {
    const src = read("src/lib/study-store.ts");
    expect(src).toContain('export { starToggleAria } from "@/state/slices/starred"');
    const slice = await import("@/state/slices/starred");
    expect(typeof slice.starToggleAria).toBe("function");
  });
});
