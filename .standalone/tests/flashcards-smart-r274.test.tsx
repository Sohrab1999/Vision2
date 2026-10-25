// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۴ — صداقتِ «مرور هوشمند» فلش‌کارت. سه عیبِ زنده (اندازه‌گیریِ
// agent-browser رویِ دِکِ ۲۰۴تایی و دِکِ ۳تاییِ seedشده):
// [۱] پرشِ مو — با پاسخِ هر کارت، go(1) هم index را جلو می‌برد هم کارتِ
//     پاسخ‌داده‌شده از آرایهٔ سررسید بیرون می‌رود؛ جانشین یک‌جا رد می‌شد
//     (ترتیبِ مشاهده‌شده: ۰←۲←۴←۶←۸). [۲] دروغِ شمارنده — «کارت N از M»
//     دو عدد از دو دِکِ متفاوت بود: N از ترتیبِ پاس، M از شمارِ باقی‌مانده.
//     اعداد لاتین هم بودند در حالی که کلِ برنامه faNum می‌گوید.
// [۳] انجمادِ پایانِ پاس — با خالی‌شدنِ سررسید، memo که روی index وابسته بود
//     بازمحاسبه نمی‌شد و کارتِ تازه-پاسخ‌داده‌شده برایِ همیشه می‌ماند؛
//     هر «بلدم» بعدی همان کارت را دوباره ثبت می‌کرد.
// قرارداد: جانشین در همان index می‌نشیند، شمارندهٔ هوشمند «N کارتِ
// باقی‌مانده» است (faNum)، پایانِ پاس پیامِ صادق + ادامهٔ دستی دارد،
// نوارِ پیشرفت در هوشمند کسرِ واقعیِ پاس است، و قفلِ کیبوردِ P2 دست‌نخورده.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import Flashcards from "@/components/study/lesson/flashcards";
import { useStudy } from "@/lib/study-store";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const W = (en: string, fa: string) => ({ en, fa, pos: "n" });

// four words — the live reproduction deck in miniature
const lesson = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  vocabulary: [W("ability", "توانایی"), W("absolutely", "قطعاً"), W("access", "دسترسی"), W("across", "از عرض")],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

const frontWord = () =>
  document.querySelector(".flip-face:not(.back) .en-text")?.textContent?.trim();

const chip = () =>
  document.querySelector("span.rounded-lg.bg-stone-100")?.textContent?.trim();

const knownBtn = () =>
  [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "بلدم")!;

const future = () => Date.now() + 15 * 60_000;

describe("flashcards smart review — honesty (r274)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ known: {}, srs: {}, mistakes: {} } as never);
  });

  it("پرشِ مو مرده — پس از هر پاس، جانشینِ واقعی می‌آید نه کارتِ دو-بعدِ جلوتر", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} startSmart />);
    expect(frontWord()).toBe("ability");
    fireEvent.click(knownBtn()); // بودنِ «absolutely» در پاسِ قدیم رد می‌شد
    expect(frontWord()).toBe("absolutely");
    fireEvent.click(knownBtn());
    expect(frontWord()).toBe("access");
    fireEvent.click(knownBtn());
    expect(frontWord()).toBe("across");
  });

  it("شمارندهٔ هوشمند «N کارتِ باقی‌مانده» می‌گوید با ارقامِ فارسی — نه دو عدد از دو دِک", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} startSmart />);
    expect(chip()).toBe("۴ کارتِ باقی‌مانده");
    fireEvent.click(knownBtn());
    expect(chip()).toBe("۳ کارتِ باقی‌مانده");
    fireEvent.click(knownBtn());
    expect(chip()).toBe("۲ کارتِ باقی‌مانده");
  });

  it("پایانِ پاس منجمد نمی‌شود — پیامِ صادق + دکمهٔ ادامهٔ دستی که دِک را برمی‌گرداند", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} startSmart />);
    fireEvent.click(knownBtn());
    fireEvent.click(knownBtn());
    fireEvent.click(knownBtn());
    fireEvent.click(knownBtn()); // آخرین کارت → پاس تمام
    expect(
      document.body.textContent?.includes("پاسِ مرورِ هوشمند تمام شد — همهٔ کارت‌هایِ سررسید مرور شدند")
    ).toBe(true);
    // همان کارتِ تازه-پاسخ‌داده‌شده نباید روی صفحه مانده باشد
    expect(frontWord()).toBeUndefined();
    // بلدمِ بی‌کارت دیگر srs را با کلیدِ تهی آلوده نمی‌کند
    const srsBefore = Object.keys(useStudy.getState().srs).length;
    if (knownBtn()) fireEvent.click(knownBtn());
    expect(Object.keys(useStudy.getState().srs).length).toBe(srsBefore);
    // ادامهٔ دستی: دِکِ کامل از سر می‌آید با شمارندهٔ دستیِ صادق
    const manual = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("ادامهٔ مرورِ دستی")
    );
    expect(manual).toBeInTheDocument();
    fireEvent.click(manual!);
    expect(frontWord()).toBe("ability");
    expect(chip()).toBe("کارت ۱ از ۴");
  });

  it("بلدمِ تازه srs را جلو می‌برد — قراردادِ SRS دست‌نخورده", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} startSmart />);
    fireEvent.click(knownBtn());
    const item = useStudy.getState().srs["1:ability"];
    expect(item).toBeDefined();
    expect(item!.dueAt).toBeGreaterThan(Date.now());
    fireEvent.click(knownBtn()); // «تکرار» هم dueAt را به آینده می‌برد — کارت از سررسید بیرون می‌رود
    expect(useStudy.getState().srs["1:absolutely"]).toBeDefined();
  });

  it("حالتِ دستی دست‌نخورده — شمارندهٔ «کارت N از M» با ارقامِ فارسی و پیشرویِ گام‌به‌گام", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} />);
    expect(chip()).toBe("کارت ۱ از ۴");
    fireEvent.click(knownBtn()); // دستی: بعد از پاس، کارتِ بعدیِ همان دِک
    expect(frontWord()).toBe("absolutely");
    expect(chip()).toBe("کارت ۲ از ۴");
  });

  it("دِکِ سررسیدِ ناقص — فقط کارت‌هایِ سررسید در هوشمند؛ غیرِ سررسید بیرون می‌ماند", () => {
    useStudy.setState({
      srs: { "1:ability": { level: 0, dueAt: future() }, "1:absolutely": { level: 0, dueAt: future() } },
    } as never);
    render(<Flashcards lesson={lesson} onExit={() => {}} startSmart />);
    expect(chip()).toBe("۲ کارتِ باقی‌مانده");
    expect(frontWord()).toBe("access");
    fireEvent.click(knownBtn());
    expect(frontWord()).toBe("across"); // جانشینِ واقعی — نه پرش به «across» از دِکِ کامل
  });
});

describe("flashcards smart review — source locks (r274)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ known: {}, srs: {}, mistakes: {} } as never);
  });

  it("قفلِ منبع: memo رویِ srs وابسته است نه index؛ شاخهٔ هوشمند go نمی‌خواهد", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/components/study/lesson/flashcards.tsx", "utf8");
    expect(src).toContain("[smartMode, mounted, srs]");
    expect(src).not.toContain("[smartMode, mounted, index]");
    expect(src).toContain("if (smartMode) {");
    // go(1) فقط در شاخهٔ elseِ answer، دکمهٔ «بعدی» و میان‌برِ ArrowLeft
    expect(src.match(/go\(1\)/g)?.length).toBe(3);
    expect(src).toContain("if (index >= cards.length - 1) setIndex(0);");
    expect(src).toContain("if (!key) return;");
    expect(src).toContain("if (cards.length === 0) return;");
  });

  it("قفلِ منبع: ثبتِ passTotal در خودِ دکمه + اثرِ startSmart + نوارِ پیشرفتِ پاس", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/components/study/lesson/flashcards.tsx", "utf8");
    expect(src).toContain("if (!smartMode) setPassTotal(dueCount);");
    expect(src).toContain("passTotal === 0 && dueCount > 0");
    expect(src).toContain("(passTotal - cards.length) / passTotal");
    expect(src).toContain("passTotal, setPassTotal");
  });

  it("قفلِ منبع: ارقامِ فارسی همه‌جا — بی‌عددِ خامِ لاتین در چیپ‌ها و نشان‌ها", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/components/study/lesson/flashcards.tsx", "utf8");
    expect(src).toContain("faNum(Math.min(index + 1, cards.length))");
    expect(src).toContain("faNum(cards.length)} کارتِ باقی‌مانده");
    expect(src).toContain("{faNum(knownCount)} بلدم");
    expect(src).toContain("{faNum(dueCount)}");
    // r392 — قالبِ «سطح N از ۶» به مالکِ srsLevelFa (state/srs-engine.ts) مهاجرت کرد؛
    // ارقامِ فارسی حالا در مالک تضمین میشود (tests/srs-level-fa-r392.test.ts) و
    // نردبانِ نقطهها طولش از SRS_INTERVALS.length میآید.
    expect(src).toContain("({srsLevelFa(srsItem.level)})");
    // رشته‌های خامِ قدیمی نباید برگردند
    expect(src).not.toContain("{knownCount} بلدم");
    expect(src).not.toContain("(سطح {srsItem.level + 1} از ۶)");
    expect(src).not.toContain("(سطح {faNum(srsItem.level + 1)} از ۶)");
    expect(src).not.toContain("کارت {Math.min(index + 1, cards.length)} از {cards.length}");
  });

  it("قفلِ منبع: حالتِ تاریکِ سطوحِ لمس‌شده — چیپ، دکمهٔ تکرار، کلیدِ هوشمند، نوار", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/components/study/lesson/flashcards.tsx", "utf8");
    expect(src).toContain("bg-stone-100 px-2.5 py-1 font-bold text-stone-700 dark:bg-stone-800");
    expect(src).toContain("dark:bg-rose-500/10 dark:text-rose-300");
    expect(src).toContain("dark:border-violet-500/40 dark:bg-violet-500/15");
    expect(src).toContain("dark:bg-stone-800 dark:text-stone-300");
    expect(src).toContain("bg-stone-200 dark:bg-stone-700");
    expect(src).toContain("dark:border-stone-700 dark:bg-stone-800\">\n        <Layers");
  });

  it("قفلِ منبع: پیام‌هایِ دو حالتِ خالی و ادامهٔ دستی — و بی-«جزوه»یِ فضای نامِ a11y", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync("src/components/study/lesson/flashcards.tsx", "utf8");
    expect(src).toContain("پاسِ مرورِ هوشمند تمام شد — همهٔ کارت‌هایِ سررسید مرور شدند");
    expect(src).toContain("ادامهٔ مرورِ دستی — همهٔ کارت‌ها");
    expect(src).toContain("کارتی برای مرور نیست");
    // فضای نامِ a11y (r253): «جزوه» فقط در متنِ مرئی، هرگز در aria
    const ariaLines = src.split("\n").filter((l) => l.includes("aria-") || l.includes("aria-"));
    expect(ariaLines.join("\n")).not.toContain("جزوه");
  });
});
