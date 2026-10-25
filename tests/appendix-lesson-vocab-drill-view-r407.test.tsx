// @vitest-environment jsdom
// ------------------------------------------------------------------
// r407 — قفلهایِ نمایِ «دریل واژگان درس» — ششمین بانک روی نمایِ مشترکِ
// r403 و نخستین ساکن در خودِ درس: داخلِ تبِ واژگان (VocabTab)، کنارِ
// فلش‌کارت. ورود فقط با کلیک؛ خروجِ سالم به جست‌وجو و کارت‌ها؛ معرفیِ
// صادق از برنامهٔ قطعیِ موتور (درسِ کم-نقش وعدهٔ برساخته نمیدهد).
//
// قطعیتِ جلسه: Math.random با rngِ ثابت (۰٫۵) مسخر میشود — جلسهٔ نما
// با pre-computeِ همان rng برابر میماند (الگویِ r406).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import VocabTab from "@/components/study/lesson/vocab-tab";
import { buildLessonVocabDrillSession } from "@/lib/appendix-lesson-vocab-drill";
import { DRILL_SIZE } from "@/lib/appendix-drill";
import { lessons } from "@/data";
import { faNum, posLabel } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";

const CONSTANT = 0.5;

const LESSON1 = lessons[0]!;
const LESSON9 = lessons[8]!;

/** جلسهٔ مورد انتظار — عینِ آنچه نما زیرِ rngِ ثابت میگیرد */
const expected = buildLessonVocabDrillSession(LESSON1.vocabulary, DRILL_SIZE, () => CONSTANT);
const expected9 = buildLessonVocabDrillSession(LESSON9.vocabulary, DRILL_SIZE, () => CONSTANT);

const faSet1 = new Set(LESSON1.vocabulary.map((w) => w.fa));

const openDrill = (lesson = LESSON1) => {
  render(<VocabTab lesson={lesson} />);
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین واژگان درس" }));
};

const clickStart = () => {
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین واژگان درس" }));
};

/** گزینهٔ درستِ پرسشِ idxِ جلسهٔ جاری — از جلسهٔ pre-compute شده */
const pickBank = (session = expected, idx = 0) => {
  const q = session.questions[idx];
  const label = q.options[q.answer];
  const btn = screen
    .getAllByRole("button", { name: /^گزینه [۱-۴]: / })
    .find((b) => (b.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, "") === label);
  if (!btn) throw new Error("bank option missing: " + label);
  fireEvent.click(btn);
};

const pickWrong = (session = expected, idx = 0) => {
  const q = session.questions[idx];
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

describe("appendix-lesson-vocab-drill-view r407 — ورود از تبِ واژگان", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("دکمهٔ «تمرین واژه‌ها» کنارِ فلش‌کارت؛ جست‌وجو و فیلترها پابرجایند", () => {
    render(<VocabTab lesson={LESSON1} />);
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان درس" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /حالت فلش‌کارت/ })).toBeTruthy();
    expect(screen.getByPlaceholderText(/جستجو در واژگان/)).toBeTruthy(); // درسِ placeholder≠innerText
  });

  it("ورود فقط با کلیک — mountِ خالص هرگز دریل را بالا نمیآورد (قراردادِ r234/r403..r406)", () => {
    render(<VocabTab lesson={LESSON1} />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین واژگان درس" })).toBeNull();
    expect(screen.getByPlaceholderText(/جستجو در واژگان/)).toBeTruthy();
  });

  it("کلیک: کنترلها میروند؛ معرفیِ صادق از برنامهٔ قطعی (۱۰ پرسش از ۲۰۴ واژه، سه گونه)", () => {
    openDrill();
    expect(screen.queryByPlaceholderText(/جستجو در واژگان/)).toBeNull(); // جست‌وجو رفته
    expect(screen.getByText("تمرین واژگانِ «فهمیدن مردم»")).toBeTruthy();
    expect(screen.getByText(new RegExp(`از ${faNum(204)} واژهٔ «فهمیدن مردم»`))).toBeTruthy();
    expect(screen.getByText(/معنی، واژه، نقش کلامی/)).toBeTruthy();
    expect(screen.getByText(/از واژه‌های خودِ درس میآیند/)).toBeTruthy();
  });

  it("درسِ کم-نقش (ارزش دانش) معرفیِ صادقِ خودش را دارد: ۷ پرسش دگونه — بی وعدهٔ pos", () => {
    openDrill(LESSON9);
    expect(screen.getByText(new RegExp(`${faNum(7)} پرسش از ${faNum(232)} واژهٔ «ارزش دانش»`))).toBeTruthy();
    expect(screen.getByText(/: معنی، واژه\./)).toBeTruthy(); // نقشِ کلامی وعده نمیشود
  });

  it("خروج از معرفی → جست‌وجو و دکمهٔ ورود برمیگردند", () => {
    openDrill();
    // فازِ معرفی دکمهٔ بازگشت دارد (cancelAria مالِ فازِ run است — ایدئومِ r406)
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به واژگان درس" }));
    expect(screen.getByPlaceholderText(/جستجو در واژگان/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان درس" })).toBeTruthy();
  });
});

describe("appendix-lesson-vocab-drill-view r407 — جریانِ یک جلسه", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهای kbd؛ پرسشِ اول گونهٔ fa با گزینههایِ فارسیِ درس و چیپِ واژه", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    for (const o of opts) {
      const value = (o.getAttribute("aria-label") || "")
        .replace(/^گزینه [۱-۴]: /, "")
        .replace(/ — پاسخ درست$/, "");
      expect(faSet1.has(value)).toBe(true); // گونهٔ fa — معنیهایِ خودِ درس
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
    const enSet1 = new Set(LESSON1.vocabulary.map((w) => w.en));
    const posSet = new Set(
      LESSON1.vocabulary.filter((w) => w.pos).map((w) => posLabel[w.pos as string]),
    );
    for (let i = 0; i < 10; i++) {
      const q = expected.questions[i];
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      const values = opts.map((o) =>
        (o.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, ""),
      );
      expect(values).toEqual(q.options); // جلسهٔ نما = جلسهٔ pre-compute
      if (q.kind === "fa") for (const v of values) expect(faSet1.has(v)).toBe(true);
      if (q.kind === "en") for (const v of values) expect(enSet1.has(v)).toBe(true);
      if (q.kind === "pos") for (const v of values) expect(posSet.has(v)).toBe(true);
      pickBank(expected, i);
      next();
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
  });

  it("جلسهٔ کاملِ بانکمحور → ۱۰۰٪ صادق، بی دکمهٔ مرور؛ خروج از نتیجه به جست‌وجو", () => {
    openDrill();
    clickStart();
    for (let i = 0; i < 10; i++) {
      pickBank(expected, i);
      next();
    }
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "مرور اشتباههای تمرین" })).toBeNull(); // خطا نیست — مرور هم نیست
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به واژگان درس از نتیجه" }));
    expect(screen.getByPlaceholderText(/جستجو در واژگان/)).toBeTruthy(); // کارت‌ها برگشتند
    expect(screen.getByRole("button", { name: "شروع تمرین واژگان درس" })).toBeTruthy();
  });

  it("جلسهٔ نادرست → «مرور اشتباهها (۱۰)» → مرورِ بانکمحور → «نتیجهٔ مرور» با ۱۰۰٪ (سرصفحهٔ صادقِ r401)", () => {
    openDrill();
    clickStart();
    for (let i = 0; i < 10; i++) {
      pickWrong(expected, i);
      next();
    }
    expect(screen.getByText("مرور اشتباهها (۱۰)")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "مرور اشتباههای تمرین" }));
    expect(screen.getByText(/از ۱۰/)).toBeTruthy(); // مرور همان ۱۰ را دوباره میپرسد
    for (let i = 0; i < 10; i++) {
      pickBank(expected, i); // همان گزینهها، اینبار درست
      next();
    }
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
  });

  it("درسِ کم-نقش: جلسهٔ ۷تاییِ صادق تا «نتیجهٔ تمرین» میرسد (کوتاهترِ r404، نه سقوط)", () => {
    openDrill(LESSON9);
    clickStart();
    expect(screen.getByText(/از ۷/)).toBeTruthy();
    for (let i = 0; i < 7; i++) {
      pickBank(expected9, i);
      next();
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
  });

  it("انصراف از تمرین واژگان در فازِ run → جست‌وجو برمیگردد", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین واژگان" }));
    expect(screen.getByPlaceholderText(/جستجو در واژگان/)).toBeTruthy();
    expect(screen.queryByText(/از ۱۰/)).toBeNull();
  });

  it("کیبوردِ r402 در بانکِ ششم هم زنده است — Digit2 گزینهٔ ۲ را برمیگزیند", () => {
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

  it("دریل هیچ چیز به استورِ یادگیری نمینویسد — بلدمِ کارت‌ها دستنخورده (حکمِ r400..r406)", () => {
    const knownBefore = JSON.stringify(useStudy.getState().known);
    openDrill();
    clickStart();
    pickBank(expected, 0);
    next();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین واژگان" }));
    const knownAfter = JSON.stringify(useStudy.getState().known);
    expect(knownAfter).toBe(knownBefore);
  });
});
