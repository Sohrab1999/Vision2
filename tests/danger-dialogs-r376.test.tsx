// @vitest-environment jsdom
// ------------------------------------------------------------------
// r376 — «سه دیالوگِ هدفمندِ کارتِ خطرناکها» — بندِ ③ِ معطلِ سه‌راندیِ
// r372؛ داوریِ زنده (scripts/qa-r376-danger-dialogs.sh) هر سه را با
// کنشِ واقعی سبز کرد؛ این فایل قراردادهایِ ساختاری را در jsdom قفل
// میکند تا رگرسیونِ آینده زودتر از کلاسِ درس گرفته شود:
//   • سه دیالوگ با عنوانهایِ قراردادیِ خودشان (فلش‌کارت/تمرین/دیکته)
//   • گیتِ دیکته: فهرستِ زیرِ DICTATION_MIN_DANGER دکمه را میبندد با
//     titleِ صادق؛ بالایِ حد، setupِ «آزمون دیکته» داخلِ دیالوگ باز میشود
//   • فلش‌کارت: دِکِ زیرمجموعه («کارت ۱ از N» با faNum) + برگرداندن +
//     «بلدم» که SRS را رویِ همان کلیدِ خطر مینویسد (live: SRS ۰→۱)
//   • تمرین: QuizEngine با پرسشهایِ buildDangerQuiz داخلِ دیالوگ
//   • رویدادهایِ سه CTA از رجیستری (۵۲ دستنخورده) — دکمهها فقط صدای
//     خودشان را دارند
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DangerWords from "@/components/study/practice/danger-words";
import { DICTATION_MIN_DANGER } from "@/lib/danger-dictation";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.stubGlobal(
  "fetch",
  vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
);

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    wordMistakes: {},
    wordSeen: {},
    starredWords: [],
    srs: {},
    results: {},
  } as never);
  cleanup();
});

const seed = (mistakes: Record<string, number>, seen: Record<string, number>) =>
  useStudy.setState({ wordMistakes: mistakes, wordSeen: seen } as never);

const DANGER_SEED = {
  // هر چهار واژه واقعاً از واژگانِ درسِ ۱اند — word-risk واژههایِ
  // ناشناخته را به درسِ واقعیِ خودشان باز-خانه میکند (درسِ accident = ۱۰!)
  wordMistakes: { "1:ability": 2, "1:absolutely": 1, "1:access": 2, "1:across": 1 },
  wordSeen: { "1:ability": 3, "1:absolutely": 3, "1:access": 3, "1:across": 2 },
};

const openCard = async () => {
  const utils = render(<DangerWords />);
  await waitFor(() => {
    const card = utils.container.querySelector('[aria-label="واژه‌های خطرناک من"]');
    expect(card?.textContent).not.toContain("ثبت نشده");
  });
  return utils;
};

const dialogTitle = (_utils: ReturnType<typeof render>) =>
  document.body.querySelector('[data-slot="dialog-title"]')?.textContent ?? "";

/** دیالوگ در portal بدن رندر میشود — نه در containerِ کامپوننت */
const dlg = () => document.body.querySelector('[data-slot="dialog-content"]');

describe("r376 — سه دیالوگِ هدفمندِ کارتِ خطرناکها", () => {
  it("① قفلِ منبع: سه دیالوگ با عنوانهایِ قراردادی؛ گیتِ دیکته با DICTATION_MIN_DANGER؛ رویدادهایِ CTA از رجیستری", () => {
    const src = read("src/components/study/practice/danger-words.tsx");
    expect(src).toContain("فلش‌کارت واژه‌های خطرناک");
    expect(src).toContain("تمرین هدفمند واژه‌های خطرناک");
    expect(src).toContain("دیکتهٔ واژه‌های خطرناک");
    expect(src).toContain("list.length < DICTATION_MIN_DANGER");
    expect(src).toContain('trackEvent("danger_flashcards")');
    expect(src).toContain('trackEvent("danger_practice")');
    expect(src).toContain('trackEvent("danger_dictation_start")');
    // هر دو سازنده فقط وقتیِ دیالوگِ خودشان باز است ساخته میشوند — نه همیشه
    expect(src).toContain("practiceOpen ? buildDangerQuiz(list, 10) : null");
    expect(src).toContain("dictOpen && list.length > 0 ? buildDangerDictation(list) : null");
    // رویدادها ثبتشدهٔ رجیستری‌اند — رجیستریِ ۵۲ رشد نمیکند
    expect(EVENT_NAMES).toContain("danger_flashcards");
    expect(EVENT_NAMES).toContain("danger_practice");
    expect(EVENT_NAMES).toContain("danger_dictation_start");
  });

  it("② فلش‌کارت: دِکِ زیرمجموعه با شمارندهٔ faNum؛ برگرداندنِ واقعی؛ «بلدم» همان کلیدِ خطر را در SRS مینویسد", async () => {
    seed(DANGER_SEED.wordMistakes, DANGER_SEED.wordSeen);
    const utils = await openCard();
    fireEvent.click(utils.getByText("فلش‌کارت همین‌ها"));
    await waitFor(() => expect(dialogTitle(utils)).toBe("فلش‌کارت واژه‌های خطرناک"));
    // دِک = زیرمجموعهٔ خطر (۴ واژهٔ واجد) — نه دِکِ کاملِ درس (۳۰تایی)
    await waitFor(() => {
      const counter = [...dlg()!.querySelectorAll("span")].find((s) =>
        /کارت [۰-۹]+ از [۰-۹]+/.test(s.textContent ?? "")
      );
      expect(counter?.textContent).toBe("کارت ۱ از ۴");
    });
    // برگرداندنِ واقعی — رویِ پشت، معنیِ فارسی دیده میشود
    const flip = dlg()!.querySelector('[aria-label="برگرداندن کارت"]');
    expect(flip).not.toBeNull();
    fireEvent.click(flip as Element);
    // «بلدم» — نوشتنِ SRS رویِ همان کلیدِ رتبهٔ اول (ability)
    // [دکمهٔ پاسخ، داخلِ دیالوگ و با تطبیقِ دقیق — چیپِ «N بلدم» هم در صفحه است]
    const knownBtn = [...dlg()!.querySelectorAll("button")].find(
      (b) => (b.textContent ?? "").trim() === "بلدم"
    );
    expect(knownBtn).toBeDefined();
    fireEvent.click(knownBtn as Element);
    await waitFor(() => {
      expect(useStudy.getState().srs["1:ability"]).toBeDefined();
    });
  });

  it("③ تمرین: QuizEngine با پرسشهایِ danger داخلِ دیالوگ — engineTitle و گزینههایِ واقعی", async () => {
    seed(DANGER_SEED.wordMistakes, DANGER_SEED.wordSeen);
    const utils = await openCard();
    fireEvent.click(utils.getByText("تمرین همین‌ها"));
    await waitFor(() => expect(dialogTitle(utils)).toBe("تمرین هدفمند واژه‌های خطرناک"));
    await waitFor(() => {
      expect(dlg()?.querySelector("[data-quiz-option]")).not.toBeNull();
    });
  });

  it("④ گیتِ دیکته: زیرِ حداقل، دکمهٔ بسته با titleِ صادق؛ بالایِ حداقل، setupِ دیکته در دیالوگ", async () => {
    // زیرِ حد (۲ واژهٔ واجد) — فلش‌کارت و تمرین زنده‌اند، دیکته بسته
    seed({ "1:ability": 2, "1:absolutely": 2 }, { "1:ability": 3, "1:absolutely": 3 });
    const below = await openCard();
    const dictBelow = [...below.container.querySelectorAll("button")].find((b) =>
      (b.textContent ?? "").includes("دیکتهٔ همین‌ها")
    );
    expect(dictBelow?.disabled).toBe(true);
    expect(dictBelow?.getAttribute("title")).toBe(
      `حداقل ${DICTATION_MIN_DANGER.toLocaleString("fa-IR")} واژهٔ خطرناک لازم است`
    );
    fireEvent.click(below.getByText("تمرین همین‌ها"));
    expect(dialogTitle(below)).toBe("تمرین هدفمند واژه‌های خطرناک");
    cleanup();

    // بالایِ حد (۴ واژهٔ واجد) — دیکته باز میشود و setupِ واقعی مینشیند
    seed(DANGER_SEED.wordMistakes, DANGER_SEED.wordSeen);
    const above = await openCard();
    const dictAbove = [...above.container.querySelectorAll("button")].find((b) =>
      (b.textContent ?? "").includes("دیکتهٔ همین‌ها")
    );
    expect(dictAbove?.disabled).toBe(false);
    fireEvent.click(dictAbove as Element);
    await waitFor(() => expect(dialogTitle(above)).toBe("دیکتهٔ واژه‌های خطرناک"));
    await waitFor(() => {
      const d = dlg();
      expect(d?.textContent).toContain("آزمون دیکته — املای شنیداری");
      expect(d?.textContent).toContain("شروع دیکته");
    });
  });

  it("⑤ چیپهایِ درس در فلش‌کارت — فقط با بیش از یک درسِ حاضر (داده‌محور)", async () => {
    // فهرستِ تک‌درسی (سه واژهٔ واقعیِ درسِ ۱): هیچ چیپی — همان رفتارِ زندهٔ r376 (chips=[])
    seed(
      { "1:ability": 2, "1:absolutely": 1, "1:access": 2 },
      { "1:ability": 3, "1:absolutely": 3, "1:access": 3 }
    );
    const single = await openCard();
    fireEvent.click(single.getByText("فلش‌کارت همین‌ها"));
    await waitFor(() => expect(dialogTitle(single)).toBe("فلش‌کارت واژه‌های خطرناک"));
    const chipsSingle = [...dlg()!.querySelectorAll("button")].filter(
      (b) => /^درس/.test(b.textContent ?? "")
    );
    expect(chipsSingle).toHaveLength(0);
    cleanup();

    // فهرستِ دودرسی (واژههایِ واقعیِ درسِ ۲): چیپها + سوییچِ واقعیِ دِک
    seed(
      { "1:ability": 2, "1:absolutely": 2, "2:addict": 2, "2:addiction": 2 },
      { "1:ability": 3, "1:absolutely": 3, "2:addict": 3, "2:addiction": 3 }
    );
    const multi = render(<DangerWords />);
    await waitFor(() => {
      const card = multi.container.querySelector('[aria-label="واژه‌های خطرناک من"]');
      expect(card?.textContent).not.toContain("ثبت نشده");
    });
    fireEvent.click(multi.getByText("فلش‌کارت همین‌ها"));
    await waitFor(() => expect(dialogTitle(multi)).toBe("فلش‌کارت واژه‌های خطرناک"));
    await waitFor(() => {
      const chips = [...dlg()!.querySelectorAll("button")].filter(
        (b) => /^درس/.test(b.textContent ?? "")
      );
      expect(chips.length).toBeGreaterThanOrEqual(2);
    });
    const before = [...dlg()!.querySelectorAll("span")].find((s) =>
      /کارت ۱ از [۰-۹]+/.test(s.textContent ?? "")
    );
    expect(before).toBeDefined();
  });
});
