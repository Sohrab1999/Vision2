// @vitest-environment jsdom
// ------------------------------------------------------------------
// r408 — قفلهایِ نمایِ «دریل دیکشنری» — مقیاسِ سراسریِ بانکِ واژگانِ
// r407: داخلِ خودِ دیکشنری (DictionaryView)، کنارِ «واژه‌های من» و Anki.
// ورود فقط با کلیک؛ خروجِ سالم به جست‌وجو؛ معرفیِ صادق از برنامهٔ
// قطعیِ موتور (۴۰۳۲ واژه، سه گونه).
//
// قطعیتِ جلسه: Math.random با rngِ ثابت (۰٫۵) مسخر میشود — جلسهٔ نما
// با pre-computeِ همان rng برابر میماند (الگویِ r406/r407).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import {
  buildLessonVocabDrillSession,
  flattenLessonVocab,
} from "@/lib/appendix-lesson-vocab-drill";
import { DRILL_SIZE } from "@/lib/appendix-drill";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";

const CONSTANT = 0.5;

const BANK = flattenLessonVocab(lessons);

/** جلسهٔ مورد انتظار — عینِ آنچه نما زیرِ rngِ ثابت میگیرد */
const expected = buildLessonVocabDrillSession(BANK, DRILL_SIZE, () => CONSTANT);

const faSet = new Set(BANK.map((w) => w.fa));

const openDrill = () => {
  render(<DictionaryView />);
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین واژگان دیکشنری" }));
};

const clickStart = () => {
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین دیکشنری" }));
};

/** گزینهٔ درستِ پرسشِ idxِ جلسهٔ جاری — از جلسهٔ pre-compute شده */
const pickBank = (idx: number) => {
  const q = expected.questions[idx];
  const label = q.options[q.answer];
  const btn = screen
    .getAllByRole("button", { name: /^گزینه [۱-۴]: / })
    .find((b) => (b.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, "") === label);
  if (!btn) throw new Error("bank option missing: " + label);
  fireEvent.click(btn);
};

const pickWrong = (idx: number) => {
  const q = expected.questions[idx];
  const wrong = (q.answer + 1) % q.options.length;
  const label = q.options[wrong];
  const btn = screen
    .getAllByRole("button", { name: /^گزینه [۱-۴]: / })
    .find((b) => (b.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, "") === label);
  if (!btn) throw new Error("wrong option missing: " + label);
  fireEvent.click(btn);
};

const next = () => {
  const b = screen
    .getAllByRole("button")
    .find((x) => ["سؤال بعدی", "دیدن نتیجهٔ تمرین"].includes(x.getAttribute("aria-label") || ""));
  fireEvent.click(b!);
};

describe("dictionary-vocab-drill-view r408 — ورود از دیکشنری", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("دکمهٔ «تمرین واژه‌ها» کنارِ واژههایِ من و Anki؛ جست‌وجو پابرجاست", () => {
    render(<DictionaryView />);
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان دیکشنری" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "رفتن به واژه‌های من" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /صادرات/ })).toBeTruthy();
    expect(screen.getByPlaceholderText(/مثلاً: language یا زبان/)).toBeTruthy();
  });

  it("ورود فقط با کلیک — mountِ خالص هرگز دریل را بالا نمیآورد (قراردادِ r234/r403..r407)", () => {
    render(<DictionaryView />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین دیکشنری" })).toBeNull();
    expect(screen.getByPlaceholderText(/مثلاً: language یا زبان/)).toBeTruthy();
  });

  it("کلیک: سرصفحه و کارت‌ها میروند؛ معرفیِ صادق از برنامهٔ قطعی (۱۰ پرسش از ۴۰۳۲ واژه، سه گونه)", () => {
    openDrill();
    expect(screen.queryByPlaceholderText(/مثلاً: language یا زبان/)).toBeNull(); // جست‌وجو رفته
    expect(screen.queryByRole("button", { name: "رفتن به واژه‌های من" })).toBeNull();
    expect(screen.getByText("تمرین واژگانِ دیکشنری")).toBeTruthy();
    expect(screen.getByText(new RegExp(`از ${faNum(4032)} واژهٔ همهٔ درس‌ها`))).toBeTruthy();
    expect(screen.getByText(/معنی، واژه، نقش کلامی/)).toBeTruthy();
    expect(screen.getByText(/از واژه‌های خودِ کتاب میآیند/)).toBeTruthy();
  });

  it("خروج از معرفی → جست‌وجو و دکمهٔ ورود برمیگردند", () => {
    openDrill();
    // فازِ معرفی دکمهٔ بازگشت دارد (cancelAria مالِ فازِ run است — ایدئومِ r406)
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به دیکشنری" }));
    expect(screen.getByPlaceholderText(/مثلاً: language یا زبان/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان دیکشنری" })).toBeTruthy();
  });
});

describe("dictionary-vocab-drill-view r408 — جریانِ یک جلسه", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهای kbd؛ پرسشِ اول گونهٔ fa با گزینههایِ فارسیِ کتاب و چیپِ واژه", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    for (const o of opts) {
      const value = (o.getAttribute("aria-label") || "")
        .replace(/^گزینه [۱-۴]: /, "")
        .replace(/ — پاسخ درست$/, "");
      expect(faSet.has(value)).toBe(true); // گونهٔ fa — معنیهایِ خودِ کتاب
    }
    // چیپِ شنیدنی: واژهٔ انگلیسیِ پرسش (en-text) کنارِ دکمهٔ روخوانی
    expect(document.querySelector("h3 .en-text")?.textContent).toBe(expected.questions[0].speak);
    const group = screen.getByRole("group", { name: "گزینه‌های پرسش" });
    const chips = [...group.querySelectorAll("span[aria-hidden]")].filter((el) =>
      el.className.includes("font-mono"),
    );
    expect(chips.map((c) => c.textContent)).toEqual(["۱", "۲", "۳", "۴"]);
  });

  it("چرخشِ سهگونه در کلِ جلسه witnessed — گزینهها همیشه از ستونِ خودشان", () => {
    openDrill();
    clickStart();
    const enSet = new Set(BANK.map((w) => w.en));
    for (let i = 0; i < 10; i++) {
      const q = expected.questions[i];
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      const values = opts.map((o) =>
        (o.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, ""),
      );
      expect(values).toEqual(q.options); // جلسهٔ نما = جلسهٔ pre-compute
      if (q.kind === "fa") for (const v of values) expect(faSet.has(v)).toBe(true);
      if (q.kind === "en") for (const v of values) expect(enSet.has(v)).toBe(true);
      if (q.kind === "pos") for (const v of values) expect(v.length).toBeGreaterThan(1);
      pickBank(i);
      next();
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
  });

  it("جلسهٔ کاملِ بانکمحور → ۱۰۰٪ صادق، بی دکمهٔ مرور؛ خروج از نتیجه به جست‌وجو", () => {
    openDrill();
    clickStart();
    for (let i = 0; i < 10; i++) {
      pickBank(i);
      next();
    }
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "مرور اشتباههای تمرین" })).toBeNull(); // خطا نیست — مرور هم نیست
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به دیکشنری از نتیجه" }));
    expect(screen.getByPlaceholderText(/مثلاً: language یا زبان/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان دیکشنری" })).toBeTruthy();
  });

  it("جلسهٔ نادرست → «مرور اشتباهها (۱۰)» → مرورِ بانکمحور → «نتیجهٔ مرور» با ۱۰۰٪ (سرصفحهٔ صادقِ r401)", () => {
    openDrill();
    clickStart();
    for (let i = 0; i < 10; i++) {
      pickWrong(i);
      next();
    }
    expect(screen.getByText("مرور اشتباهها (۱۰)")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "مرور اشتباههای تمرین" }));
    expect(screen.getByText(/از ۱۰/)).toBeTruthy(); // مرور همان ۱۰ را دوباره میپرسد
    for (let i = 0; i < 10; i++) {
      pickBank(i); // همان گزینهها، اینبار درست
      next();
    }
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
  });

  it("انصراف از تمرین دیکشنری در فازِ run → جست‌وجو برمیگردد", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین دیکشنری" }));
    expect(screen.getByPlaceholderText(/مثلاً: language یا زبان/)).toBeTruthy();
    expect(screen.queryByText(/از ۱۰/)).toBeNull();
  });

  it("کیبوردِ r402 در مقیاسِ سراسری هم زنده است — Digit2 گزینهٔ ۲ را برمیگزیند", () => {
    openDrill();
    clickStart();
    fireEvent.keyDown(window, { code: "Digit2", key: "2" });
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    if (expected.questions[0].answer === 1) {
      expect(opts[1].getAttribute("aria-label")).toContain("— پاسخ درست");
    } else {
      expect(opts[1].getAttribute("aria-label")).not.toContain("— پاسخ درست");
    }
    expect(opts.every((o) => (o as HTMLButtonElement).disabled)).toBe(true);
    expect(
      screen
        .getAllByRole("button")
        .some((x) => ["سؤال بعدی", "دیدن نتیجهٔ تمرین"].includes(x.getAttribute("aria-label") || "") && !(x as HTMLButtonElement).disabled),
    ).toBe(true);
  });

  it("دریل هیچ چیز به استورِ یادگیری نمینویسد — بلدمِ کارت‌ها دستنخورده (حکمِ r400..r407)", () => {
    const knownBefore = JSON.stringify(useStudy.getState().known);
    openDrill();
    clickStart();
    pickBank(0);
    next();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین دیکشنری" }));
    const knownAfter = JSON.stringify(useStudy.getState().known);
    expect(knownAfter).toBe(knownBefore);
  });
});
