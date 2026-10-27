// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r430 — «لنگرِ واژهٔ دیکشنری» — قفلهایِ هفتمین مسیرِ عمیقِ پرش.
//
// پرشِ dict-vocab تا دیروز فقط «فرودِ بی‌لنگر» بود — دیکشنری لنگر نداشت
// (اطلسِ r425: «View لنگر ندارد — صادق»). این راند الگویِ کارتِ واژهٔ
// r427 را به دیکشنری میبرد:
//  ① استور: openDictionaryWord = view {dictionary, focusWord}؛ setViewِ
//    بی‌لنگر، لنگرِ کهنه را پاک میکند (قراردادِ مصرف)
//  ② عدسیِ پرش: لنگرِ معتبر جست‌وجو را از نخستین قاب بذر میزند — کارتِ
//    واژه فارغ از سقفِ ۳۰۰تایی در DOM است (واژههایِ درسِ سوم از اندیسِ
//    ۴۳۸ میآیند؛ بیِ عدسی، لنگرِ «عمیق» برایِ بیشِ نیمِ بانک وعدهٔ
//    بیپشتوانه بود — r236). جعبهٔ جست‌وجو خودش روایت میکند.
//  ③ پالس: هستهٔ زمردیِ r234 رویِ همهٔ کارت‌هایِ همسان (رونوشتهایِ
//    چنددرسیِ یک واژه همه همان واژهاند) + مصرفِ لنگر از view
//    (پرشِ دوبارهٔ همان واژه پالسِ تازه میزند — ایدئومِ r427)
//  ④ واژهٔ بیگانه: سکوتِ صادق — هیچ عدسی، هیچ پالسی، view دستنخورده
//  ⑤ بیِ لنگر: رفتارِ کهنه دستنخورده — سقفِ ۳۰۰تایی سرِ پاست
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const PULSE_KERNEL = "shadow-emerald-300"; // هستهٔ مشترکِ پالس با خانوادهٔ r234/r427

// همهٔ واژگانِ تختشده — ترتیبِ خودِ دیکشنری (همان تختکنندهٔ نما)
const FLAT = lessons.flatMap((l) => l.vocabulary.map((w) => ({ lessonId: l.id, en: w.en })));

// واژهٔ فراسقف — نخستین واژهٔ درسِ سوم (داده‌محور؛ اندیسش در قفلِ زیر ثابت میشود)
const DEEP_EN = lessons[2].vocabulary.find((w) => w.en && w.fa)!.en;
const DEEP_IDX = FLAT.findIndex((w) => w.lessonId === lessons[2].id);

// واژهٔ چنددرسی — رونوشتهایِ یک en در درسهایِ مختلف (بانکِ دیکشنری با en کلید میخورد)
const DUP_EN = [...FLAT.reduce(
  (m, w) => m.set(w.en, (m.get(w.en) ?? 0) + 1),
  new Map<string, number>(),
)].find(([, n]) => n >= 2)![0];

beforeEach(() => {
  cleanup();
  localStorage.clear();
  useStudy.setState(useStudy.getInitialState(), true);
});

afterEach(() => {
  cleanup();
});

describe("r430 — لنگرِ واژهٔ دیکشنری", () => {
  it("استور: openDictionaryWord لنگر را در view میگذارد؛ setViewِ بی‌لنگر مصرفش میکند", () => {
    useStudy.getState().openDictionaryWord(DEEP_EN);
    expect(useStudy.getState().view).toEqual({ type: "dictionary", focusWord: DEEP_EN });
    // مصرفِ لنگر — عینِ کاری که خودِ نما پسِ اسکرول میکند
    useStudy.getState().setView({ type: "dictionary" });
    expect(useStudy.getState().view).toEqual({ type: "dictionary" });
  });

  it("عدسیِ پرش: واژهٔ فراسقف از نخستین قاب در DOM است و پالس میزند + لنگر مصرف میشود", async () => {
    // پیشِ هر چیز ثابت میشود که این واژه بیِ عدسی اصلاً رندر نمیشد —
    // عدسیِ پرش بارِ واقعی دارد، تزئین نیست (درسِ r236: وعدهٔ پشتوانه‌دار)
    expect(DEEP_IDX).toBeGreaterThanOrEqual(300);
    render(<DictionaryView focusWord={DEEP_EN} />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...") as HTMLInputElement;
    expect(input.value).toBe(DEEP_EN); // عدسی از نخستین قاب — جعبهٔ جست‌وجو خودش روایت میکند
    const card = await waitFor(() => {
      const el = document.querySelector(`[data-dict-word="${DEEP_EN}"]`);
      expect(el).toBeTruthy(); // فراسقف ولی حاضر — عدسی کار میکند
      expect(el!.className).toContain(PULSE_KERNEL);
      expect(el!.className).toContain("bg-emerald-50");
      return el!;
    });
    expect(card.className).toContain("shadow-[inset_0_0_0_2px]"); // هندسهٔ حلقهٔ خانواده
    // مصرفِ لنگر از view — پرشِ دوبارهٔ همان واژه پالسِ تازه میزند (r427)
    await waitFor(() => {
      expect(useStudy.getState().view).toEqual({ type: "dictionary" });
    });
  });

  it("رونوشتهایِ چنددرسی: همهٔ کارت‌هایِ همسان پالس میگیرند — بانک با en کلید میخورد", async () => {
    render(<DictionaryView focusWord={DUP_EN} />);
    await waitFor(() => {
      const cards = Array.from(document.querySelectorAll(`[data-dict-word="${DUP_EN}"]`));
      expect(cards.length).toBeGreaterThanOrEqual(2);
      cards.forEach((c) => {
        expect(c.className).toContain(PULSE_KERNEL);
        expect(c.className).toContain("bg-emerald-50");
      });
    });
  });

  it("واژهٔ بیگانه: سکوتِ صادق — هیچ عدسی، هیچ پالسی، view دستنخورده", async () => {
    useStudy.setState({ view: { type: "dictionary", focusWord: "zzz-ghost-dict-word" } });
    render(<DictionaryView focusWord="zzz-ghost-dict-word" />);
    await new Promise((r) => setTimeout(r, 120)); // فرصتِ هر rAFِ برساخته — هیچ نباید بود
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...") as HTMLInputElement;
    expect(input.value).toBe(""); // عدسی برساخته نمیشود
    const pulses = Array.from(document.querySelectorAll("[data-dict-word]"));
    expect(pulses.length).toBeGreaterThan(0);
    pulses.forEach((c) => expect(c.className).not.toContain(PULSE_KERNEL));
    // لنگرِ نامعتبر مصرف نمیشود — عینِ قفلِ r427 (پاکشدن فقط با مصرفِ واقعی)
    expect(useStudy.getState().view).toEqual({ type: "dictionary", focusWord: "zzz-ghost-dict-word" });
  });

  it("بیِ لنگر: رفتارِ کهنه دستنخورده — سقفِ ۳۰۰تایی سرِ پاست و هیچ پالسی نیست", () => {
    render(<DictionaryView />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...") as HTMLInputElement;
    expect(input.value).toBe("");
    const cards = document.querySelectorAll("[data-dict-word]");
    expect(cards.length).toBe(300); // سقفِ رندرِ کهنه — بیِ لنگر دست نخورده
    cards.forEach((c) => expect(c.className).not.toContain(PULSE_KERNEL));
  });
});
