// @vitest-environment jsdom
// ------------------------------------------------------------------
// r349 — «سفرِ کشف» (discovery journey) — آنبوردینگِ هفتهٔ دوم؛ بدهیِ
// ممیزیِ r345 (بزرگترین گپِ UXِ باقیمانده بعد از teacher panel).
//
// آنبوردینگِ روزِ نخست (onboarding.tsx + home-starter) سه قدم را میآموزد؛
// این کارت از «اولین پیشرفت واقعی» به بعد همچنان میآموزد: ۹ دنیا، هر
// کدام با پیشگویِ «کشف شد» که از stateهایِ persistشدهٔ موجود مشتق
// میشود — بدونِ هیچ فیلدِ جدیدِ استور (بکآپ/سینک ابری رایگان میماند).
//
// قراردادهایی که این فایل قفل میکند:
//   • تازهواردِ مطلق (صفرِ پیشرفت) کارت را نمیبیند — home-starter
//     صاحبِ لحظهٔ روزِ نخست است
//   • هر ۹ پیشگو مستقل و درست است (از جمله ایزولاسیونِ دستهها:
//     نتیجهٔ writing/synant نمیتواند «آزمونک» را کشفشده کند)
//   • پرشِ واقعی: کلیکِ چیپِ کشفنشده ⇒ رویدادِ discovery_jump +
//     ناوبریِ واقعیِ استور (view عوض میشود) — چیپِ «کشف شد» دکمه نیست
//   • کاملشدنِ هر ۹ ⇒ حالتِ جشنِ «همه کشف شد!»
//   • قفلهایِ ساختاری: سیمکشیِ home-view، رویدادِ ثبتشده در
//     EVENT_NAMES + برچسبِ فارسی، بلوکِ تاریکِ globals.css، و
//     ممنوعیتِ transition-all
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { trackEvent } from "@/lib/analytics";
import { EVENT_NAMES, EVENT_LABELS_FA } from "@/lib/analytics-events";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const resetStore = () =>
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    srs: {},
    starredWords: [],
    libraryDone: {},
    konkurSeen: {},
    rushGames: 0,
  } as Partial<ReturnType<typeof useStudy.getState>>);

beforeEach(() => {
  localStorage.clear();
  resetStore();
  vi.mocked(trackEvent).mockClear();
  cleanup();
});

afterEach(() => {
  cleanup();
});

const chip = (key: string) => document.querySelector(`[data-journey-chip="${key}"]`);
const chipState = (key: string) => chip(key)?.getAttribute("data-journey-state");

describe("سفرِ کشف — r349: نقشهٔ ۹ دنیایی", () => {
  it("① تازهواردِ مطلق = هیچ: با صفرِ پیشرفت کارت اصلاً سوار نمیشود", async () => {
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(document.querySelector(".discovery-journey")).toBeNull();
  });

  it("② نخستین پیشرفت کارت را زنده میکند: نشانِ «۱ از ۹» و فلشکارتِ کشفشده", async () => {
    useStudy.setState({ known: { "1:ability": true } });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(document.querySelector(".discovery-journey")).toBeTruthy();
    expect(screen.getByText("سفرِ کشف")).toBeTruthy();
    expect(screen.getByText("۱ از ۹")).toBeTruthy();
    expect(chipState("flashcards")).toBe("done");
    expect(chipState("quiz")).toBe("todo");
    expect(chipState("konkur")).toBe("todo");
  });

  it("③ پیشگویهای مستقل: هر دنیا فقط از stateِ خودش کشف میشود", async () => {
    useStudy.setState({
      results: {
        "3:dictation": { correct: 4, total: 5, percent: 80, at: new Date().toISOString() },
        "1:listening": { correct: 3, total: 5, percent: 60, at: new Date().toISOString() },
        duel: { correct: 7, total: 10, percent: 70, at: new Date().toISOString() },
      },
      rushGames: 1,
      starredWords: ["1:ability"],
      libraryDone: { story1: { at: new Date().toISOString() } } as never,
      konkurSeen: { "x-1": true },
    });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(chipState("dictation")).toBe("done");
    expect(chipState("listening")).toBe("done");
    expect(chipState("duel")).toBe("done");
    expect(chipState("rush")).toBe("done");
    expect(chipState("mywords")).toBe("done");
    expect(chipState("library")).toBe("done");
    expect(chipState("konkur")).toBe("done");
    // آزمونکِ درس هنوز کشف نشده — هیچ کلیدیِ quiz-مانند در results نیست
    expect(chipState("quiz")).toBe("todo");
    expect(screen.getByText("۷ از ۹")).toBeTruthy();
  });

  it("④ ایزولاسیونِ دستهها: نتیجهٔ writing/synant «آزمونک» را کشفشده نمیکند", async () => {
    useStudy.setState({
      results: {
        "1:writing": { correct: 4, total: 5, percent: 80, at: new Date().toISOString() },
        "2:synant": { correct: 4, total: 5, percent: 80, at: new Date().toISOString() },
      },
    });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(chipState("quiz")).toBe("todo");
    // (پرشِ واقعی در ⑥ پوشش داده میشود — این تست فقط ایزولاسیونِ دستههاست)
  });

  it("⑤ کلیدِ quiz-مانند واقعی (N:quiz) دنیای آزمونک را کشف میکند", async () => {
    useStudy.setState({
      results: { "1:quiz": { correct: 4, total: 5, percent: 80, at: new Date().toISOString() } },
    });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(chipState("quiz")).toBe("done");
    expect(chipState("flashcards")).toBe("todo");
  });

  it("⑥ پرشِ واقعی: کلیکِ چیپِ کشفنشده ⇒ discovery_jump + ناوبریِ استور", async () => {
    useStudy.setState({ known: { "1:ability": true } }); // یک کشف — کارت زنده
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    const duelChip = chip("duel") as HTMLButtonElement;
    expect(duelChip.tagName).toBe("BUTTON");
    fireEvent.click(duelChip);
    expect(trackEvent).toHaveBeenCalledWith("discovery_jump");
    expect(useStudy.getState().view).toEqual({ type: "duel" });
    // چیپِ کشفشده دکمه نیست — دعوت به اقدام ندارد و رویداد نمیفرستد
    const doneChip = chip("flashcards") as HTMLElement;
    expect(doneChip.tagName).not.toBe("BUTTON");
  });

  it("⑦ پرش به درس: آزمونکِ درس ⇒ lessonTab=tests و دیکته ⇒ lessonTab=dictation", async () => {
    useStudy.setState({ known: { "1:ability": true } });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    fireEvent.click(chip("quiz") as HTMLButtonElement);
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("tests");
    fireEvent.click(chip("dictation") as HTMLButtonElement);
    expect(useStudy.getState().lessonTab).toBe("dictation");
    fireEvent.click(chip("listening") as HTMLButtonElement);
    expect(useStudy.getState().view).toEqual({ type: "listen" });
  });

  it("⑧ کاملشدنِ هر ۹ ⇒ حالتِ جشنِ «همه کشف شد!»", async () => {
    const at = new Date().toISOString();
    useStudy.setState({
      known: { "1:ability": true },
      results: {
        "1:quiz": { correct: 4, total: 5, percent: 80, at },
        "1:listening": { correct: 4, total: 5, percent: 80, at },
        "1:dictation": { correct: 4, total: 5, percent: 80, at },
        duel: { correct: 4, total: 5, percent: 80, at },
      },
      rushGames: 1,
      starredWords: ["1:ability"],
      libraryDone: { story1: { at } } as never,
      konkurSeen: { "x-1": true },
    });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(screen.getByText("همه کشف شد!")).toBeTruthy();
    expect(screen.getByText("هر ۹ دنیای ویژن ۲ را دیدی — قهرمانِ کاوش!")).toBeTruthy();
    const todoChips = document.querySelectorAll('[data-journey-state="todo"]');
    expect(todoChips.length).toBe(0);
  });

  it("⑨ aria و ارقامِ فارسی: هر چیپ برچسبِ دارد و نشانِ درصد فارسی است", async () => {
    useStudy.setState({ known: { "1:ability": true } });
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    expect(screen.getByLabelText("نبرد واژه‌ها — پرش برای کشف")).toBeTruthy();
    expect(screen.getByLabelText("فلش‌کارت‌ها — کشف شده")).toBeTruthy();
    const pct = document.querySelector(".discovery-journey svg + span span");
    expect(pct?.textContent).toContain("۱۱"); // ۱ از ۹ ⇒ ۱۱٪
  });
});

describe("سفرِ کشف — قفلهایِ ساختاریِ r349", () => {
  it("⑩ home-view کارت را بینِ ادامهٔ خواندن و اهدافِ روزانه سوار میکند", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/home/home-view.tsx"), "utf8");
    const importIdx = src.indexOf('import HomeDiscoveryJourney from "./home-discovery-journey"');
    const readIdx = src.indexOf("<HomeContinueReading />");
    const journeyIdx = src.indexOf("<HomeDiscoveryJourney />");
    const questsIdx = src.indexOf("<DailyQuests />");
    expect(importIdx).toBeGreaterThan(0);
    expect(readIdx).toBeGreaterThan(0);
    expect(journeyIdx).toBeGreaterThan(readIdx);
    expect(questsIdx).toBeGreaterThan(journeyIdx);
  });

  it("⑪ رویدادِ discovery_jump در EVENT_NAMES + برچسبِ فارسی", () => {
    expect(EVENT_NAMES).toContain("discovery_jump");
    expect(EVENT_LABELS_FA.discovery_jump).toBe("پرش از سفرِ کشف");
  });

  it("⑫ تثبیتِ تاریک: کانتینر فقط حاشیه + همهٔ مقادیر در خطوطِ مرکبِ کرنل", () => {
    const comp = readFileSync(
      join(process.cwd(), "src/components/study/home/home-discovery-journey.tsx"),
      "utf8"
    );
    expect(comp).not.toContain("transition-all");
    expect(comp).toContain("transition-[background-color,color,border-color,box-shadow]");
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    // کانتینر — فقط حاشیهٔ آسمانی؛ پس‌زمینه با کرنلِ سراسریِ .dark .bg-white
    expect(css).toContain(".dark .discovery-journey { border-color: rgb(7 89 133 / 0.45); }");
    // ردیفها و کاشیها در خطوطِ مرکبِ کرنلِ موجود ادغام شدهاند
    expect(css).toContain(".dark .daily-quests .quest-row,.dark .discovery-journey .jrow { background-color: rgb(28 25 23 / 0.55); border-color: #37312b; }");
    expect(css).toContain(".dark .daily-quests .text-amber-700,.dark .discovery-journey .text-amber-700 { color: #fcd34d; }");
    expect(css).toContain(".dark .skill-panel .bg-rose-100,.dark .discovery-journey .bg-rose-100 { background-color: rgba(80, 10, 25, 0.5); }");
    expect(css).toContain(".dark .discovery-journey .bg-sky-100 { background-color: rgba(8, 47, 60, 0.7); }");
    expect(css).toContain(".dark .discovery-journey .text-indigo-700 { color: #a5b4fc; }");
  });

  it("⑬ حلقهٔ پیشرفت SVG است نه نوارِ width (قفلِ scoped-transitions)", () => {
    const comp = readFileSync(
      join(process.cwd(), "src/components/study/home/home-discovery-journey.tsx"),
      "utf8"
    );
    expect(comp).toContain("stroke-dashoffset");
    expect(comp).not.toContain("w-full c-track-80");
    expect(comp).not.toContain("transition-[width]");
  });
});
