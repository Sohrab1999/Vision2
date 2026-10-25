// @vitest-environment jsdom
// ------------------------------------------------------------------
// r410 — «T در فلش‌کارت» + رفعِ باگِ فلیپِ چیپِ روخوانی.
//
// کشفِ زندهٔ راند (پروب): کلیکِ چیپِ «روخوانی» رویِ کارت به flip-card
// میبُرد و کارت برمی‌گشت — FLIPPED-AFTER-SPEAK-CLICK=true. باگ، و سدِ
// میانبرِ T هم بود (کلیکِ امری همان bubble را دارد). قفلها:
//  · کلیکِ چیپِ روخوانی کارت را برنمی‌گرداند (قفلِ باگِ راند)
//  · T روخوانیِ واژهٔ کارت است: speak با همان متنِ چیپ و سرعتِ ۰٫۹۵
//    — و خودش هم کارت را برنمی‌گرداند
//  · کلیکِ دومِ T «توقفِ» خودِ چیپ است (استِ روخوانی نزدِ مالک —
//    speak دوبار صدا نمیشود)
//  · T رویِ پشتِ کارت هم کار میکند (چیپِ روی در DOM میماند)
//  · T هیچ پاسخی ثبت نمیکند — مرورِ srs دستنخورده
//  · راهنمای kbdِ زمردیِ «T» در ردیفِ میانبرها (ایدئومِ r409)
//  · پرچمِ سطحِ شنیدار: با mount روشن، با unmount خاموش
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import Flashcards from "@/components/study/lesson/flashcards";
import { useStudy } from "@/lib/study-store";
import { listenSurfaceSnapshot, setListenSurface } from "@/lib/listen-surface";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(async () => () => {}),
  speakFailToast: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

import { speak } from "@/lib/speak";
const speakMock = vi.mocked(speak);

const lesson = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  vocabulary: [{ en: "ability", fa: "توانایی" }],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

const card = () =>
  document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;

const flipped = () => card().className.includes("flipped");

const frontChip = () =>
  [...document.querySelectorAll("button")].find(
    (b) => b.getAttribute("aria-label") === "روخوانی متن انگلیسی",
  ) as HTMLButtonElement;

const pressKey = (key: string, code?: string) =>
  fireEvent.keyDown(window, { key, code: code ?? key });

const flushSpeak = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("flashcards r410 — T و رفعِ باگِ فلیپ", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    speakMock.mockClear();
    useStudy.setState({ known: {}, srs: {}, mistakes: {} } as never);
    render(<Flashcards lesson={lesson} onExit={() => {}} />);
  });
  afterEach(() => {
    cleanup();
    setListenSurface(false);
  });

  it("قفلِ باگِ راند: کلیکِ چیپِ روخوانی کارت را برنمی‌گرداند", () => {
    expect(flipped()).toBe(false);
    fireEvent.click(frontChip());
    expect(flipped()).toBe(false);
  });

  it("T روخوانیِ واژهٔ کارت است — همان متنِ چیپ، سرعتِ ۰٫۹۵، بی‌فلیپ", async () => {
    pressKey("t", "KeyT");
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledWith(
      "ability",
      0.95,
      expect.any(Function),
      expect.any(Function),
    );
    expect(flipped()).toBe(false);
  });

  it("Tِ دوم توقفِ خودِ چیپ است — speak دوبار صدا نمیشود", async () => {
    pressKey("t", "KeyT");
    await flushSpeak();
    expect(frontChip().className).toContain("bg-emerald-700"); // playing
    pressKey("t", "KeyT");
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // نه درخواستِ دوم
    expect(frontChip().className).not.toContain("bg-emerald-700"); // idle
  });

  it("T رویِ پشتِ کارت هم کار میکند — چیپِ روی در DOM میماند", async () => {
    fireEvent.keyDown(card(), { key: "Enter" });
    expect(flipped()).toBe(true);
    pressKey("t", "KeyT");
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toBe("ability");
  });

  it("T هیچ پاسخی ثبت نمیکند — srs دستنخورده، کارت جلو نمیرود", async () => {
    pressKey("t", "KeyT");
    await flushSpeak();
    expect(useStudy.getState().srs).toEqual({});
    expect(screen.getByText(/کارت ۱ از ۱/)).toBeTruthy();
  });

  it("ردیفِ میانبرها نشانگرِ زمردیِ T را دارد — ایدئومِ خانوادهٔ شنیدار", () => {
    const kbdT = [...document.querySelectorAll("kbd")].find(
      (k) => k.textContent === "T" && k.className.includes("bg-emerald-50"),
    );
    expect(kbdT).toBeTruthy();
    expect(kbdT!.parentElement?.textContent).toContain("روخوانی");
  });

  it("پرچمِ سطحِ شنیدار: با mount روشن — T مالِ فلش‌کارت است", () => {
    expect(listenSurfaceSnapshot()).toBe(true);
  });

  it("پرچم پسِ unmount خاموش میشود — T به پوسته برمی‌گردد", () => {
    expect(listenSurfaceSnapshot()).toBe(true);
    cleanup(); // unmountِ فلش‌کارتِ beforeEach — effectِ خروج پرچم را میبندد
    expect(listenSurfaceSnapshot()).toBe(false);
  });

  it("قراردادهایِ کهنه پابرجاست: Space فلیپ، K بلدم — T در مسیرشان نیست", () => {
    fireEvent.keyDown(window, { key: " ", code: "Space" });
    expect(flipped()).toBe(true);
    fireEvent.keyDown(window, { key: " ", code: "Space" });
    expect(flipped()).toBe(false);
    fireEvent.keyDown(window, { key: "k", code: "KeyK" });
    expect(Object.keys(useStudy.getState().srs ?? {}).length).toBe(1);
  });
});
