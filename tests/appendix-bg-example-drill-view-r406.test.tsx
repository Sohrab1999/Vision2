// @vitest-environment jsdom
// ------------------------------------------------------------------
// r406 — قفلهایِ نمایِ «دریل مثالهای درسنامهٔ جامع» — پنجمین بانک
// رویِ نمایِ مشترکِ r403، اینبار بیرون از زیرتابهایِ جدولیِ ضمیمه:
// داخلِ خودِ زیرتابِ «درسنامهٔ جامع» (booklet-grammar-view).
//
// قطعیتِ جلسه: Math.random با rngِ ثابت (۰٫۵) مسخر میشود — جلسهٔ نما
// با pre-computeِ همان rng برابر میماند و مصرفِ مزاحمِ دیگران هم
// (هر فراخوانی همان ۰٫۵ را میدهد) ترتیبِ موتور را نمی شکند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { buildBgExampleDrillSession } from "@/lib/appendix-bg-example-drill";
import { DRILL_SIZE } from "@/lib/appendix-drill";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";

const CONSTANT = 0.5;

/** جلسهٔ مورد انتظار — عینِ آنچه نما زیرِ rngِ ثابت میگیرد */
const expected = buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, () => CONSTANT);

const faSet = new Set(
  BOOKLET_GRAMMAR_TOPICS.flatMap((t) => (t.examples ?? []).map((e) => e.fa)),
);
const enSet = new Set(
  BOOKLET_GRAMMAR_TOPICS.flatMap((t) => (t.examples ?? []).map((e) => e.en)),
);
const titleSet = new Set(BOOKLET_GRAMMAR_TOPICS.map((t) => t.title));

const openDrill = () => {
  render(<BookletGrammarView />);
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین مثال‌های درسنامه" }));
};

const clickStart = () => {
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین مثال" }));
};

/** گزینهٔ درستِ پرسشِ idxِ جلسهٔ جاری — از جلسهٔ pre-compute شده */
const correctOf = (idx: number) => expected.questions[idx].answer;

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

describe("appendix-bg-example-drill-view r406 — ورود از سرصفحهٔ درسنامهٔ جامع", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("دکمهٔ «تمرین مثال‌ها» در سرصفحه؛ آکاردئونِ موضوعها پابرجاست", () => {
    render(<BookletGrammarView />);
    expect(screen.getByRole("button", { name: "شروع تمرین مثال‌های درسنامه" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "بازکردن همه" })).toBeTruthy(); // آکاردئون پابرجا
  });

  it("کلیک: سرصفحه و آکاردئون میروند؛ معرفیِ صادق (۲۰۵ مثال، ۳۲ درسنامه، سه گونه)", () => {
    openDrill();
    expect(screen.queryByRole("button", { name: "بازکردن همه" })).toBeNull(); // آکاردئون رفته
    expect(screen.getByText("تمرین مثال‌های درسنامهٔ جامع")).toBeTruthy();
    expect(screen.getByText(/از ۲۰۵ مثال/)).toBeTruthy();
    expect(screen.getByText(/۳۲ درسنامه/)).toBeTruthy();
    expect(screen.getByText(/ترجمه، یافتنِ جملهٔ انگلیسی و تشخیصِ موضوع/)).toBeTruthy();
  });

  it("لنگرِ عمیقِ topicId دریل را بالا نمیآورد — آکاردئون میآید (قراردادِ r234/r403/r404/r405)", () => {
    render(<BookletGrammarView focusTopicId="bg-passive" />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین مثال" })).toBeNull();
    expect(screen.getByRole("button", { name: "بازکردن همه" })).toBeTruthy();
  });
});

describe("appendix-bg-example-drill-view r406 — جریانِ یک جلسه", () => {
  beforeEach(() => {
    cleanup();
    vi.spyOn(Math, "random").mockImplementation(() => CONSTANT);
  });
  afterEach(() => vi.restoreAllMocks());

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهای kbd؛ پرسشِ اول گونهٔ fa با گزینههایِ فارسیِ بانک و چیپِ جمله", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    for (const o of opts) {
      const value = (o.getAttribute("aria-label") || "")
        .replace(/^گزینه [۱-۴]: /, "")
        .replace(/ — پاسخ درست$/, "");
      expect(faSet.has(value)).toBe(true); // گونهٔ fa — ترجمههایِ خودِ بانک
    }
    // چیپِ شنیدنی: جملهٔ انگلیسیِ پرسش (en-text) کنارِ دکمهٔ روخوانی
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
    for (let i = 0; i < 10; i++) {
      const q = expected.questions[i];
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      const values = opts.map((o) =>
        (o.getAttribute("aria-label") || "").replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, ""),
      );
      expect(values).toEqual(q.options); // جلسهٔ نما = جلسهٔ pre-compute
      if (q.kind === "fa") for (const v of values) expect(faSet.has(v)).toBe(true);
      if (q.kind === "ex") for (const v of values) expect(enSet.has(v)).toBe(true);
      if (q.kind === "topic") for (const v of values) expect(titleSet.has(v)).toBe(true);
      pickBank(i);
      next();
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
  });

  it("جلسهٔ کاملِ بانکمحور → ۱۰۰٪ صادق، بی دکمهٔ مرور؛ خروج از نتیجه به آکاردئون", () => {
    openDrill();
    clickStart();
    for (let i = 0; i < 10; i++) {
      pickBank(i);
      next();
    }
    expect(screen.getByText("۱۰۰٪")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "مرور اشتباههای تمرین" })).toBeNull(); // خطا نیست — مرور هم نیست
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به درسنامهٔ جامع از نتیجه" }));
    expect(screen.getByRole("button", { name: "بازکردن همه" })).toBeTruthy(); // آکاردئون برگشت
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

  it("انصراف از تمرین مثال در فازِ run → آکاردئون برمیگردد", () => {
    openDrill();
    clickStart();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین مثال" }));
    expect(screen.getByRole("button", { name: "بازکردن همه" })).toBeTruthy();
    expect(screen.queryByText(/از ۱۰/)).toBeNull();
  });

  it("کیبوردِ r402 در بانکِ پنجم هم زنده است — Digit2 گزینهٔ ۲ را برمیگزیند", () => {
    openDrill();
    clickStart();
    fireEvent.keyDown(window, { code: "Digit2", key: "2" });
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    // انتخابِ واقعی: گزینهٔ ۲ — پسِ پاسخ همه معلول و بعدی زنده؛
    // نشانِ «پاسخ درست» فقط اگر پاسخِ بانک همان گزینهٔ ۲ باشد
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
});
