// @vitest-environment jsdom
// ------------------------------------------------------------------
// r410 — «T در جدولِ افعالِ ضمیمه»: دوبارهشنیدنِ آخرین فعلِ شنیده.
//
// قفلهای کلاس:
//  · بی‌شنیده: T ساکت است (هیچ speak، هیچ preventDefaultِ معنادار) و
//    پرچمِ سطحِ شنیدار خاموش — T همان شب/روزِ پوسته میماند (صداقتِ r236)
//  · شنیدنِ یک شکل، «آخرین شنیده» را ثبت میکند و پرچم را روشن میکند
//  · T همان چیپِ آخرین شنیده را کلیک میکند: چیپِ playing توقف میشود
//    (speak دوبار صدا نمیشود — است نزدِ مالکِ چیپ)
//  · «آخرین شنیده» با شنیدنِ شکلِ جدید جابه‌جا میشود — T هدفِ تازه را
//    کلیک میکند (base سپس pp — دفترِ chipKey)
//  · خروجِ چیپِ آخرین شنیده از DOM (جست‌وجو) هدف را صادقانه تهی میکند:
//    راهنمای T میپرد، پرچم خاموش، T ساکت
//  · راهنمای صادق: چیپِ راهنمای T فقط با آخرین شنیدهٔ زنده رندر میشود
//  · خروجِ جدول پرچم را همیشه خاموش میکند
//  · recordVerbResume با هر شنیدن ثبت میشود (سوختِ «ادامهٔ مطالعه» — r234)
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import IrregularVerbsTable from "@/components/study/lesson/irregular-verbs-table";
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

// «go» و «eat» هر دو در بانکِ افعالِ بی‌قاعدهاند
const chipByWord = (word: string) =>
  [...document.querySelectorAll("button")].find(
    (b) =>
      b.getAttribute("aria-label") === "روخوانی متن انگلیسی" &&
      b.parentElement?.querySelector("span")?.textContent === word,
  ) as HTMLButtonElement | undefined;

const pressT = () => fireEvent.keyDown(window, { key: "t", code: "KeyT" });

const flushSpeak = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const tHint = () => document.querySelector('[data-testid="verbs-t-hint"]');

describe("irregular-verbs-table r410 — دوبارهشنیدنِ آخرین شنیده", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    speakMock.mockClear();
    vi.mocked(writeAppendixResume).mockClear();
    render(<IrregularVerbsTable />);
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

  it("شنیدنِ یک شکل، «آخرین شنیده» را ثبت میکند — پرچم روشن، رزومه ثبت", async () => {
    const chip = chipByWord("go");
    expect(chip).toBeTruthy();
    await act(async () => {
      fireEvent.click(chip!);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toBe("go");
    expect(vi.mocked(writeAppendixResume)).toHaveBeenCalledTimes(1);
    expect(listenSurfaceSnapshot()).toBe(true);
    expect(tHint()).not.toBeNull();
  });

  it("T همان چیپِ آخرین شنیده را کلیک میکند — playing یعنی توقف، بی speakِ دوم", async () => {
    await act(async () => {
      fireEvent.click(chipByWord("go")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(chipByWord("go")!.className).toContain("bg-emerald-700");
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // توقف از مسیرِ خودِ چیپ
    expect(chipByWord("go")!.className).not.toContain("bg-emerald-700");
  });

  it("«آخرین شنیده» جابه‌جا میشود — T هدفِ تازه را کلیک میکند (go سپس gone)", async () => {
    await act(async () => {
      fireEvent.click(chipByWord("go")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(chipByWord("gone")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(speakMock).toHaveBeenCalledTimes(2); // go، gone
    pressT(); // باید «gone» را دوباره کلیک کند — چیپِ playing توقف میشود
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(chipByWord("gone")!.className).not.toContain("bg-emerald-700");
    // هدف‌گیریِ دقیق: T فقط «آخرین شنیده» را میگیرد — چیپِ پیشین دستنخورده
    expect(chipByWord("go")!.className).toContain("bg-emerald-700");
  });

  it("T پسِ توقف، دوباره میخواند — همان چیپ، کلیکِ سوم = speakِ دوم", async () => {
    await act(async () => {
      fireEvent.click(chipByWord("go")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    pressT(); // توقف
    await flushSpeak();
    pressT(); // دوبارهشنیدن
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0]).toBe("go");
  });

  it("خروجِ چیپِ آخرین شنیده از DOM (جست‌وجو) هدف را صادقانه تهی میکند", async () => {
    await act(async () => {
      fireEvent.click(chipByWord("go")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(listenSurfaceSnapshot()).toBe(true);
    const search = screen.getByLabelText("جست‌وجو در افعال بی‌قاعده") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(search, { target: { value: "am" } });
      await Promise.resolve();
    });
    // چیپِ go از DOM رفت — «آخرین شنیده» تهی، پرچم خاموش، T ساکت
    expect(chipByWord("go")).toBeUndefined();
    expect(listenSurfaceSnapshot()).toBe(false);
    expect(tHint()).toBeNull();
    pressT();
    await flushSpeak();
    expect(speakMock).toHaveBeenCalledTimes(1); // همان شنیدنِ اول؛ T چیزی نفرستاد
  });

  it("خروجِ جدول پرچم را همیشه خاموش میکند — T به پوسته برمی‌گردد", async () => {
    await act(async () => {
      fireEvent.click(chipByWord("go")!);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(listenSurfaceSnapshot()).toBe(true);
    cleanup();
    expect(listenSurfaceSnapshot()).toBe(false);
  });

  it("شنیدنِ سه شکلِ یک فعل، سه رزومه ثبت میکند — سوختِ «ادامهٔ مطالعه» پابرجا", async () => {
    for (const w of ["go", "went", "gone"]) {
      await act(async () => {
        fireEvent.click(chipByWord(w)!);
        await Promise.resolve();
        await Promise.resolve();
      });
    }
    expect(vi.mocked(writeAppendixResume)).toHaveBeenCalledTimes(3);
    expect(vi.mocked(writeAppendixResume).mock.calls[2][0]).toMatchObject({
      scope: "verbs",
      id: "go",
    });
  });
});
