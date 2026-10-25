// @vitest-environment jsdom
// ------------------------------------------------------------------
// r409 — «میانبرِ T و خاموشیِ حروفِ سراسری» — قفلهایِ نما.
//
// قفلهای کلاس:
//  · T روخوانیِ هدفِ پرسش است: همان دکمهٔ چیپ کلیک میشود — speak با
//    همان متنی صدا میخورد که چیپ نشان میدهد، با همان سرعتِ ۰٫۹۵
//  · کلیکِ دومِ T «توقفِ» خودِ چیپ است (استِ روخوانی نزدِ مالک میماند —
//    دکمه به حالتِ playing (زمرد) میرود و برگشت)
//  · گونهٔ بیچیپ (baseِ فعل — speak ندارد) T را نادیده میگیرد: هیچ
//    صدایی و هیچ کرشی
//  · T هیچ پاسخی ثبت نمیکند — «بعدی» معلول میماند
//  · نشانگرِ kbdِ «T» کنارِ چیپ، ایدئومِ نشانگرِ رقمِ r402 (aria-hidden)
//  · سیمکشیِ drill-active: معرفی خاموش، run روشن، نتیجه خاموش،
//    انصرافِ والد (unmount واقعی) خاموش
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { useState } from "react";
import AppendixDrillView from "@/components/study/lesson/appendix-drill-view";
import { irregularVerbs } from "@/data/appendix";
import { buildDrillSession, DRILL_SIZE } from "@/lib/appendix-drill";
import { setDrillActive, drillActiveSnapshot } from "@/lib/drill-active";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(async () => () => {}),
  speakFailToast: vi.fn(),
}));

import { speak } from "@/lib/speak";
const speakMock = vi.mocked(speak);

const noop = () => {};

// specِ فعل — عینِ VERB_DRILL_SPECِ appendix-view (رشتههایِ قفل)
const VERB_SPEC = {
  id: "verbs" as const,
  title: "تمرین افعال بی‌قاعده",
  intro: null,
  startAria: "شروع جلسهٔ تمرین فعل",
  exitLabel: "جدول افعال",
  exitAria: "بازگشت به جدول افعال",
  exitResultAria: "بازگشت به جدول افعال از نتیجه",
  cancelAria: "انصراف از تمرین",
};

const startDrill = () => {
  render(
    <AppendixDrillView
      spec={VERB_SPEC}
      buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
      onExit={noop}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
};

const typeKey = (init: { key: string; code?: string }) => {
  fireEvent.keyDown(window, { key: init.key, code: init.code ?? init.key });
};

const headerChipText = () =>
  document.querySelector("h3 span span.en-text")?.textContent ?? null;

const headerKbdHint = () =>
  [...document.querySelectorAll("h3 span[aria-hidden]")].find(
    (el) => el.textContent === "T",
  ) ?? null;

const flushSpeak = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("appendix-drill r409 — میانبرِ T: روخوانیِ هدف از مسیرِ چیپ", () => {
  beforeEach(() => {
    cleanup();
    setDrillActive(false);
    speakMock.mockClear();
  });
  afterEach(() => cleanup());

  it("T با پرسشِ شنیدنی: speak با همان متنِ چیپ و سرعتِ ۰٫۹۵ صدا میخورد", async () => {
    startDrill();
    const chip = headerChipText();
    expect(chip).toBeTruthy(); // سؤال ۱ = گذشتهٔ ساده — شنیدنی است
    typeKey({ key: "t", code: "KeyT" });
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toBe(chip); // همان که چیپ نشان میدهد
    expect(speakMock.mock.calls[0][1]).toBe(0.95);
  });

  it("کلیکِ دومِ T توقفِ خودِ چیپ است — دکمه به زمردِ playing میرود و برمیگردد", async () => {
    startDrill();
    typeKey({ key: "t", code: "KeyT" });
    await flushSpeak(); // speak async resolved → state playing
    const btn = document.querySelector(
      "button[aria-label='روخوانی متن انگلیسی']",
    ) as HTMLButtonElement | null;
    expect(btn).toBeTruthy();
    expect(btn!.className).toContain("bg-emerald-700"); // حالتِ playingِ مالک
    typeKey({ key: "t", code: "KeyT" }); // همان T: توقف
    expect(btn!.className).not.toContain("bg-emerald-700"); // برگشت به idle
    expect(speakMock).toHaveBeenCalledTimes(1); // دوباره درخواستِ شبکه نشد
  });

  it("گونهٔ بیچیپ (سؤال ۳ = شکلِ ساده): T هیچ صدایی نمیکرد و چیپ نیست", () => {
    startDrill();
    // تا سؤال ۳ (index 2 = گونهٔ base — speak ندارد) پیش برو
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / })[0]);
      fireEvent.click(screen.getByRole("button", { name: "سؤال بعدی" }));
    }
    expect(counter()).toContain("سؤال ۳");
    expect(headerChipText()).toBeNull(); // چیپِ شنیدنی ندارد — قراردادِ r230
    expect(headerKbdHint()).toBeNull();
    typeKey({ key: "t", code: "KeyT" });
    expect(speakMock).not.toHaveBeenCalled(); // T ساکت گذشت
  });

  it("T پاسخ ثبت نمیکند — «بعدی» معلول میماند", () => {
    startDrill();
    typeKey({ key: "t", code: "KeyT" });
    expect(
      (screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(counter()).toContain("سؤال ۱");
  });

  it("نشانگرِ kbdِ «T» کنارِ چیپ است — aria-hidden، ایدئومِ r402", () => {
    startDrill();
    const hint = headerKbdHint();
    expect(hint).toBeTruthy(); // خودِ سلکتور span[aria-hidden] صفت را قفل میکند
    expect(hint!.className).toContain("font-mono"); // قراردادِ بصریِ Kbdِ راهنما
    expect(hint!.className).toContain("emerald-200"); // رنگِ خانوادهٔ شنیدار
  });
});

const counter = () => screen.getByText(/سؤال .* از/).textContent;

describe("appendix-drill r409 — سیمکشیِ پرچمِ drill-active", () => {
  beforeEach(() => {
    cleanup();
    setDrillActive(false);
    speakMock.mockClear();
  });
  afterEach(() => cleanup());

  it("معرفی خاموش است — جلسهای در جریان نیست", () => {
    render(
      <AppendixDrillView
        spec={VERB_SPEC}
        buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
        onExit={noop}
      />,
    );
    expect(drillActiveSnapshot()).toBe(false);
  });

  it("run روشن است و نتیجه دوباره خاموش میکند (فازهایِ شکننده فقط run)", () => {
    startDrill();
    expect(drillActiveSnapshot()).toBe(true);
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / })[0]);
      fireEvent.click(
        i === 9
          ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    expect(screen.getByText(/نتیجهٔ (تمرین|مرور)/)).toBeTruthy();
    expect(drillActiveSnapshot()).toBe(false); // نتیجه فقطخواندنی — حروف آزاد
  });

  it("انصرافِ والد (unmount واقعی) پرچم را جا نمیگذارد", () => {
    const Host = () => {
      const [open, setOpen] = useState(true);
      if (!open) return null;
      return (
        <AppendixDrillView
          spec={VERB_SPEC}
          buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
          onExit={() => setOpen(false)}
        />
      );
    };
    render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
    expect(drillActiveSnapshot()).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین" }));
    expect(drillActiveSnapshot()).toBe(false); // پاکسازیِ unmount — بی نشت
  });
});
