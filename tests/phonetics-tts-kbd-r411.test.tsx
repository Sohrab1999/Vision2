// @vitest-environment jsdom
// ------------------------------------------------------------------
// r411 — «T در جدولِ تلفظ (IPA)»: دوبارهشنیدنِ آخرین واکِ شنیده —
// سومین سطحِ شنیدار با ایدئومِ «آخرین شنیده» (جدولِ افعالِ r410).
//
// قفلهای کلاس:
//  · بی‌شنیده: T ساکت است (هیچ speak) و پرچمِ سطحِ شنیدار خاموش —
//    T همان شب/روزِ پوسته میماند (صداقتِ r236)
//  · شنیدنِ واژهٔ نمونهٔ یک واک، «آخرین شنیده» را ثبت میکند (onSpeak
//    پیش از هر تلاشِ شبکه) و پرچم را روشن میکند؛ رزومه هم ثبت است (r235)
//  · T همان چیپِ آخرین واک را کلیک میکند: playing توقف میشود (speak
//    دوبار صدا نمیشود — است نزدِ مالکِ چیپ) و دوبارهخوانی = speakِ دوم
//  · جابه‌جاییِ هدف: شنیدنِ واکِ دوم، T را به همان واک میبرد — چیپِ
//    پیشین دستنخورده (دفترِ chipKey با نشانهٔ واک)
//  · خروجِ چیپِ آخرین شنیده از DOM (جست‌وجو) هدف را صادقانه تهی میکند:
//    راهنمای T میپرد، پرچم خاموش، T ساکت
//  · راهنمای صادق: چیپِ راهنمای T فقط با آخرین شنیدهٔ زنده رندر میشود
//  · خروجِ جدول پرچم را همیشه خاموش میکند
//  · T هیچ ناوبریای نمیکند و خودش رزومه نمینویسد — فقط کلیکِ امریِ چیپ
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import PhoneticsTable from "@/components/study/lesson/phonetics-table";
import { listenSurfaceSnapshot, setListenSurface } from "@/lib/listen-surface";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(async () => () => {}),
  speakFailToast: vi.fn(),
}));

vi.mock("@/lib/bg-reading", () => ({
  writeAppendixResume: vi.fn(),
}));

import { speak } from "@/lib/speak";
import { writeAppendixResume } from "@/lib/bg-reading";
const speakMock = vi.mocked(speak);

// چیپِ هر واک: دکمهٔ روخوانی که spanِ پیشینِ خودش «واژهٔ نمونهٔ» همان واک است
const chipByExample = (example: string) =>
  [...document.querySelectorAll("button")].find(
    (b) =>
      b.getAttribute("aria-label") === "روخوانی متن انگلیسی" &&
      b.parentElement?.querySelector("span")?.textContent === example,
  ) as HTMLButtonElement | undefined;

const pressT = () => fireEvent.keyDown(window, { key: "t", code: "KeyT" });

const flushSpeak = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const hear = async (example: string) => {
  await act(async () => {
    fireEvent.click(chipByExample(example)!);
    await Promise.resolve();
    await Promise.resolve();
  });
};

const tHint = () => document.querySelector('[data-testid="phonetics-t-hint"]');

describe("phonetics-table r411 — دوبارهشنیدنِ آخرین واکِ شنیده", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    speakMock.mockClear();
    vi.mocked(writeAppendixResume).mockClear();
    render(<PhoneticsTable />);
  });
  afterEach(() => {
    cleanup();
    setListenSurface(false);
  });

  it("بی‌شنیده: T ساکت است و پرچم خاموش — T همان شب/روزِ پوسته میماند", async () => {
    expect(listenSurfaceSnapshot()).toBe(false);
    expect(tHint()).toBeNull();
    pressT();
    await flushSpeak();
    expect(speakMock).not.toHaveBeenCalled();
    expect(listenSurfaceSnapshot()).toBe(false);
  });

  it("شنیدنِ واژهٔ نمونه، «آخرین واکِ شنیده» را ثبت میکند — پرچم روشن، رزومه ثبت", async () => {
    await hear("cat, black");
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toBe("cat, black");
    expect(vi.mocked(writeAppendixResume)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(writeAppendixResume).mock.calls[0][0]).toMatchObject({
      scope: "phonetics",
      id: "æ",
    });
    expect(listenSurfaceSnapshot()).toBe(true);
    expect(tHint()).not.toBeNull();
  });

  it("T همان چیپِ آخرین واک را کلیک میکند — playing یعنی توقف، بی speakِ دوم", async () => {
    await hear("cat, black");
    expect(chipByExample("cat, black")!.className).toContain("bg-emerald-700");
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // توقف از مسیرِ خودِ چیپ
    expect(chipByExample("cat, black")!.className).not.toContain("bg-emerald-700");
  });

  it("T پسِ توقف دوباره میخواند — کلیکِ سوم = speakِ دوم؛ دوبارهشنیدن خودش یک شنیدنِ واقعی است (رزومهٔ دوم از مسیرِ چیپ)", async () => {
    await hear("arm, father");
    pressT(); // توقف
    await flushSpeak();
    pressT(); // دوبارهشنیدن
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0]).toBe("arm, father");
    // T مستقیم رزومه نمینویسد — ولی کلیکِ امری‌اش رویِ چیپ، onSpeakِ خودِ
    // چیپ را میگیرد و آن یک شنیدنِ واقعی است (رزومهٔ دومِ همان واک)
    expect(vi.mocked(writeAppendixResume)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(writeAppendixResume).mock.calls[1][0]).toMatchObject({
      scope: "phonetics",
      id: "ɑː",
    });
  });

  it("«آخرین شنیده» جابه‌جا میشود — T هدفِ تازه را میگیرد، چیپِ پیشین دستنخورده", async () => {
    await hear("cat, black");
    await hear("arm, father");
    expect(speakMock).toHaveBeenCalledTimes(2);
    pressT(); // باید «arm, father» (playing) را متوقف کند
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(chipByExample("arm, father")!.className).not.toContain("bg-emerald-700");
    expect(chipByExample("cat, black")!.className).toContain("bg-emerald-700");
  });

  it("خروجِ چیپِ آخرین شنیده از DOM (جست‌وجو) هدف را صادقانه تهی میکند", async () => {
    await hear("cat, black");
    expect(listenSurfaceSnapshot()).toBe(true);
    const search = screen.getByLabelText("جست‌وجو در جدول تلفظ") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(search, { target: { value: "arm" } });
      await Promise.resolve();
    });
    // چیپِ «cat, black» (واکِ æ) از DOM رفت — «آخرین شنیده» تهی، پرچم خاموش
    expect(chipByExample("cat, black")).toBeUndefined();
    expect(listenSurfaceSnapshot()).toBe(false);
    expect(tHint()).toBeNull();
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // همان شنیدنِ اول؛ T چیزی نفرستاد
  });

  it("خروجِ جدول پرچم را همیشه خاموش میکند — T به پوسته برمی‌گردد", async () => {
    await hear("cat, black");
    expect(listenSurfaceSnapshot()).toBe(true);
    cleanup();
    expect(listenSurfaceSnapshot()).toBe(false);
  });

  it("T هیچ ناوبریای نمیکند — کلیدهای ناوبریِ این لایه از T بیخبرند", async () => {
    await hear("cat, black");
    // T یک keydown است؛ هیچ رفتارِ ناوبریای در جدولِ تلفظ از آن برنمی‌خیزد —
    // شاهد: بعد از T هیچ دکمه/ورودیِ تغییرحالتِ ناوبریای فعال نشده
    const pressed = document.querySelectorAll("button[aria-pressed='true']").length;
    pressT();
    await flushSpeak();
    expect(document.querySelectorAll("button[aria-pressed='true']").length).toBe(pressed);
  });
});
