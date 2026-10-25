// @vitest-environment jsdom
// ------------------------------------------------------------------
// r411 — «T رویِ کارتِ واژهٔ روز»: دوبارهشنیدنِ واژهٔ روز — چهارمین
// سطحِ شنیدار با ایدئومِ «آخرین شنیده» رویِ تک‌هدف.
//
// تاریخِ قطعیِ تست: ۲۰۲۶-۱۰-۰۲ → واژهٔ روز = «ability» (با جفتِ مترادف)
// — انتخابِ روزانه قطعی است؛ با تاریخِ ثابت، همهٔ قفلها بازتولیدپذیرند.
//
// قفلهای کلاس:
//  · بی‌شنیده: T ساکت است و پرچم خاموش — T همان شب/روزِ پوسته میماند
//    (صداقتِ r236 + جراحیِ r410: کارتِ خانه ناوبر نیست و T را پیش از
//    نخستین شنیده نمیرباید)
//  · شنیدنِ واژهٔ روز با چیپِ اصلی، پرچم را روشن میکند و راهنمای T را
//    صادقانه ظاهر میکند؛ متنِ شنیده عینِ واژهٔ کارت است
//  · T همان چیپِ اصلی را کلیک میکند: playing توقف (بی speakِ دوم)،
//    پسِ توقف دوبارهخوانی (speakِ دوم از همان متن)
//  · چیپهایِ جفت (PairSpeakChips — مالکِ یکتایِ r390) هدفِ T نمیشوند:
//    شنیدنِ جفت، «شنیدهٔ روز» را ثبت نمیکند و پرچم را روشن نمیکند
//  · T هیچ چیزی ثبت نمیکند: «بلدم» نمیزند، ناوبری نمیکند
//  · خروجِ کارت (cleanup) پرچم را همیشه خاموش میکند — حافظه، stateِ
//    خودِ کارت است (عینِ چرخهٔ عمرِ جدولها)
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import WordOfDay from "@/components/study/lesson/word-of-day";
import { useStudy } from "@/lib/study-store";
import { listenSurfaceSnapshot, setListenSurface } from "@/lib/listen-surface";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(async () => () => {}),
  speakFailToast: vi.fn(),
}));

import { speak } from "@/lib/speak";
const speakMock = vi.mocked(speak);

// چیپِ اصلیِ کارت: دکمهٔ روخوانی داخلِ بازوی «actions» (کنارِ راهنمای T)
const mainChip = () =>
  [...document.querySelectorAll("button")].find(
    (b) =>
      b.getAttribute("aria-label") === "روخوانی متن انگلیسی" &&
      b.closest("section")?.getAttribute("aria-label") === "واژهٔ امروز",
  ) as HTMLButtonElement | undefined;

// واژهٔ بزرگِ کارت — اولین en-text داخلِ سکشن (متنِ همان چیپِ اصلی)
const cardWord = () =>
  document
    .querySelector('section[aria-label="واژهٔ امروز"] .en-text')
    ?.textContent?.trim() ?? "";

// چیپهایِ جفت (مالکِ r390): دکمههایِ «مترادفِ/متضادِ X — روخوانی» —
// برچسبِ aria خودشان را دارند و چیپِ اصلی («روخوانی متن انگلیسی») نیستند
const pairChips = () =>
  [...document.querySelectorAll("button")].filter((b) =>
    /—\s*روخوانی$/.test(b.getAttribute("aria-label") || ""),
  );

const pressT = () => fireEvent.keyDown(window, { key: "t", code: "KeyT" });

const flushSpeak = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const hearMain = async () => {
  await act(async () => {
    fireEvent.click(mainChip()!);
    await Promise.resolve();
    await Promise.resolve();
  });
};

const tHint = () => document.querySelector('[data-testid="wotd-t-hint"]');

describe("word-of-day r411 — دوبارهشنیدنِ واژهٔ روز (تاریخِ قطعی: ۲۰۲۶-۱۰-۰۲)", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    speakMock.mockClear();
    useStudy.setState({ view: { type: "home" }, known: {} });
    // تاریخِ قطعی — انتخابِ واژهٔ روز بازتولیدپذیر میشود (ability + جفت)
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 9, 2, 12, 0, 0));
    render(<WordOfDay />);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    setListenSurface(false);
    useStudy.setState({ view: { type: "home" }, known: {} });
  });

  it("واژهٔ روزِ تاریخِ قطعی همان ability است — پیشِشرِ بازتولیدپذیری", () => {
    expect(cardWord()).toBe("ability");
  });

  it("بی‌شنیده: T ساکت است و پرچم خاموش — T همان شب/روزِ پوسته میماند", async () => {
    expect(listenSurfaceSnapshot()).toBe(false);
    expect(tHint()).toBeNull();
    pressT();
    await flushSpeak();
    expect(speakMock).not.toHaveBeenCalled();
    expect(listenSurfaceSnapshot()).toBe(false);
  });

  it("شنیدنِ واژهٔ روز با چیپِ اصلی، پرچم را روشن و راهنمای T را صادقانه ظاهر میکند — متنِ شنیده عینِ واژهٔ کارت", async () => {
    const word = cardWord();
    expect(word).toBeTruthy();
    await hearMain();
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toBe(word);
    expect(listenSurfaceSnapshot()).toBe(true);
    expect(tHint()).not.toBeNull();
  });

  it("T همان چیپِ اصلی را کلیک میکند — playing یعنی توقف، بی speakِ دوم", async () => {
    await hearMain();
    expect(mainChip()!.className).toContain("bg-emerald-700");
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // توقف از مسیرِ خودِ چیپ
    expect(mainChip()!.className).not.toContain("bg-emerald-700");
  });

  it("T پسِ توقف دوباره میخواند — همان متنِ واژهٔ روز", async () => {
    await hearMain();
    const firstText = speakMock.mock.calls[0][0];
    pressT(); // توقف
    await flushSpeak();
    pressT(); // دوبارهشنیدن
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0]).toBe(firstText);
  });

  it("چیپهایِ جفت هدفِ T نمیشوند — شنیدنِ جفت، پرچم را روشن نمیکند", async () => {
    const pairs = pairChips();
    expect(pairs.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(pairs[0]);
      await Promise.resolve();
      await Promise.resolve();
    });
    // جفت شنیده شد ولی «شنیدهٔ روزِ» کارت ثبت نشد — T هنوز مالِ پوسته است
    expect(listenSurfaceSnapshot()).toBe(false);
    expect(tHint()).toBeNull();
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // فقط خودِ جفت؛ T چیزی نفرستاد
  });

  it("T «بلدم» نمیزند و ناوبری نمیکند — فقط شنیدار", async () => {
    await hearMain();
    const knownBefore = Object.keys(useStudy.getState().known ?? {}).length;
    pressT();
    await flushSpeak();
    expect(Object.keys(useStudy.getState().known ?? {}).length).toBe(knownBefore);
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("خروجِ کارت پرچم را همیشه خاموش میکند — T به پوسته برمی‌گردد", async () => {
    await hearMain();
    expect(listenSurfaceSnapshot()).toBe(true);
    cleanup();
    expect(listenSurfaceSnapshot()).toBe(false);
  });
});
