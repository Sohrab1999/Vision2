// @vitest-environment jsdom
// ------------------------------------------------------------------
// r359 — «شمارندهٔ سفر رویِ کارتِ ادامهٔ خواندن» — سطحِ دومِ شمارندههایِ
// r356 (پیشنهادِ ③ِ r357/④ِ r358 — دو راند باز). چیپِ «N داستان این هفته»
// رویِ کارتِ «ادامهٔ خواندن» — از همان موتورِ تکحقیقتِ journey-counts.
//
// قراردادهایی که این فایل قفل میکند:
//   • قرض، نه رونویسی: کامپوننت از JOURNEY_WORLD_EVENTS.library میخواند و
//     هیچ نامِ رویدادی در فایلِ او زندگی نمیکند (idiomِ ④ِ r356)
//   • صادقیتِ کارت: خطایِ واکش یا واگراییِ محلی-سرور ⇒ چیپِ شمارنده پنهان
//     (قاعدهٔ نوارهایِ نبض: دیدبانی نه درستکاری) — اما کارت با استریکِ
//     محلی زنده میماند؛ شمارندهٔ جعلی و صفرِ جعلی هر دو ممنوع
//   • active = زمردیِ همهپوشِ تاریک (bg-emerald-50/70+emerald-700)؛
//     dormant = کهرباییِ همهپوشِ تاریک (bg-amber-50/60+amber-700) —
//     رشدِ صفرِ CSS (همهٔ خطوطِ تاریک از قبل در globals هستند)
//   • شاخهٔ «جشن» (هر ۵۱ تمام) شمارنده ندارد — دعوتِ بازخوانی است
//   • بدونِ transition-all (قفلِ scoped-transitions)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import {
  JOURNEY_WORLD_EVENTS,
  journeyCounterState,
  sumJourneyEvents,
  type JourneyWorldKey,
} from "@/lib/journey-counts";
import { HILL_STORIES } from "@/data/hill-stories";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const seedRead = (ids: string[]) => {
  const libraryDone: Record<string, { score: number; total: number; day: string }> = {};
  for (const id of ids) libraryDone[id] = { score: 4, total: 5, day: "2026-10-24" };
  return libraryDone;
};

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    srs: {},
    starredWords: [],
    libraryDone: seedRead(["s1-1"]),
    konkurSeen: {},
    rushGames: 0,
    dayHistory: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

const ledger = (overrides: Record<string, { total: number; week: number }> = {}) => ({
  events: [
    { name: "flashcard_done", label: "دور فلش‌کارت", total: 3, week: 3 },
    ...Object.entries(overrides).map(([name, v]) => ({ name, label: name, total: v.total, week: v.week })),
  ],
});

const wire = (body: unknown, status = 200) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(status === 200 ? JSON.stringify(body) : "nope", { status }))
  );
};

const renderCard = async () => {
  const { default: Card } = await import("@/components/study/home/home-continue-reading");
  render(<Card />);
  await waitFor(() =>
    expect(document.querySelector('[aria-label="ادامهٔ خواندن داستان‌ها"]')).toBeTruthy()
  );
};

const counterChip = () => document.querySelector("[data-reading-counter]") as HTMLElement | null;

// ---------------------------------------------------------------
// ① قرض، نه رونویسی + موتورِ دستنخورده
// ---------------------------------------------------------------
describe("قرض از تکحقیقتِ سفر — قفلهایِ ساختاری", () => {
  it("① کامپوننت از موتورِ journey-counts قرض میگیرد، نامِ رویداد رونویسی نمیکند", () => {
    const comp = read("src/components/study/home/home-continue-reading.tsx");
    expect(comp).toContain('from "@/lib/journey-counts"');
    expect(comp).toContain("JOURNEY_WORLD_EVENTS.library");
    // هیچ نامِ رویدادی در کامپوننت زندگی نمیکند — نگاشت فقط در موتور است
    expect(comp).not.toContain("library_story_done");
    expect(comp).not.toContain("trackEvent"); // چیپِ شمارنده تولیدکننده نیست
  });

  it("② موتورِ دستنخورده: library همان تکرویداد، ۹ دنیا، ۱۱ رویدادِ یکتا", () => {
    const keys = Object.keys(JOURNEY_WORLD_EVENTS);
    expect(keys).toHaveLength(9);
    expect(JOURNEY_WORLD_EVENTS.library).toEqual(["library_story_done"]);
    const uniq = new Set(Object.values(JOURNEY_WORLD_EVENTS).flat());
    expect(uniq.size).toBe(11);
  });

  it("③ بدونِ transition-all — قفلِ scoped-transitions", () => {
    const comp = read("src/components/study/home/home-continue-reading.tsx");
    expect(comp).not.toContain("transition-all");
    // پالتِ چیپ فقط از خطوطِ تاریکِ موجودِ globals میگذرد
    expect(comp).toContain("bg-emerald-50/70");
    expect(comp).toContain("bg-amber-50/60");
    expect(comp).toContain("text-emerald-700");
    expect(comp).toContain("text-amber-700");
  });
});

// ---------------------------------------------------------------
// ② موتور — مسیرِ کتابخانه (صادقانه، بدونِ جعل)
// ---------------------------------------------------------------
describe("ریاضیِ شمارندهٔ کتابخانه — سقوطِ صادق", () => {
  it("④ plain هرگز از (۰،۰) جعل نمیشود — کارتِ بدونِ دفتر چیپ ندارد", () => {
    expect(journeyCounterState(0, 0).kind).toBe("plain");
    expect(journeyCounterState(2, 5).kind).toBe("active");
    expect(journeyCounterState(0, 5).kind).toBe("dormant");
    expect(sumJourneyEvents({ library_story_done: -3 }, JOURNEY_WORLD_EVENTS.library)).toBe(0);
    expect(sumJourneyEvents(undefined, JOURNEY_WORLD_EVENTS.library)).toBe(0);
  });
});

// ---------------------------------------------------------------
// ③ رندرِ زنده — سه حالت + سقوطِ صادق
// ---------------------------------------------------------------
describe("کارتِ ادامهٔ خواندن با شمارندهٔ زنده", () => {
  it("⑤ active — «۲ داستان این هفته» زمردی + ariaِ انسانی", async () => {
    wire(ledger({ library_story_done: { total: 5, week: 2 } }));
    await renderCard();
    const chip = counterChip();
    expect(chip).toBeTruthy();
    expect(chip!.getAttribute("data-counter-kind")).toBe("active");
    expect(chip!.textContent).toContain("۲ داستان این هفته");
    expect(chip!.className).toContain("text-emerald-700");
    expect(chip!.getAttribute("aria-label")).toBe("۲ داستان این هفته خواندی");
  });

  it("⑥ dormant — «۵ داستان تا امروز» کهربایی + دعوتِ برگشت", async () => {
    wire(ledger({ library_story_done: { total: 5, week: 0 } }));
    await renderCard();
    const chip = counterChip();
    expect(chip!.getAttribute("data-counter-kind")).toBe("dormant");
    expect(chip!.textContent).toContain("۵ داستان تا امروز");
    expect(chip!.className).toContain("text-amber-700");
    expect(chip!.getAttribute("aria-label")).toBe("۵ داستان تا امروز — برگرد و بخوان");
  });

  it("⑦ واکشِ ۵۰۰ ⇒ چیپ پنهان اما کارتِ زنده — استریکِ محلی دستنخورده", async () => {
    wire("server down", 500);
    await renderCard();
    expect(counterChip()).toBeNull();
    // کارت هنوز کامل است: عنوان، داستانِ بعدی، دعوتِ خواندن
    expect(document.querySelector('[aria-label="ادامهٔ خواندن داستان‌ها"]')).toBeTruthy();
    expect(document.body.textContent).toContain("بخوان و جواب بزن");
    expect(document.body.textContent).toContain("شروعِ زنجیرهٔ خواندن"); // چیپِ استریکِ محلی
  });

  it("⑧ واگراییِ محلی-سرور (کتابخوانِ واقعی، دفترِ خالی) ⇒ چیپ پنهان — صفرِ جعلی ممنوع", async () => {
    wire(ledger()); // هیچ library_story_doneای در دفتر نیست
    await renderCard();
    expect(counterChip()).toBeNull();
    expect(document.querySelector('[aria-label="ادامهٔ خواندن داستان‌ها"]')).toBeTruthy();
  });

  it("⑨ شاخهٔ جشن (هر ۵۱ تمام) شمارنده ندارد — دعوتِ بازخوانی است، نه آمار", async () => {
    useStudy.setState({ libraryDone: seedRead(HILL_STORIES.map((s) => s.id)) } as never);
    wire(ledger({ library_story_done: { total: 9, week: 9 } }));
    const { default: Card } = await import("@/components/study/home/home-continue-reading");
    render(<Card />);
    await waitFor(() => expect(document.body.textContent).toContain("هر سه کتاب را تمام کردی"));
    expect(counterChip()).toBeNull();
  });
});
