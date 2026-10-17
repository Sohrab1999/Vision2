import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r325 — گاردِ بانکِ ششمِ tests-g10: «تست واژگان درس اول — بخش دوم، سطح استاندارد»
// (ص۵۴-۵۵، کلید و ترجمهٔ چاپی ص۲۴۵-۲۴۷ — الگوی r324)
// قفلِ دوگانه: حرفِ چاپ + انعکاسِ گزینهٔ کلید در ترجمهٔ چاپی همان آیتم (لفظی در ۳۸، مترادف در Q1/Q10)

const doc = JSON.parse(fs.readFileSync("public/jozve/tests-g10.json", "utf-8"));
const bank = doc.lessons.find((l: { lesson: number }) => l.lesson === 6);

describe("tests-g10 exam3 — استاندارد (r325)", () => {
  it("receipt exam3 with header/keyPages/pattern/quirks", () => {
    const src = doc.source.exam3;
    expect(src).toBeTruthy();
    expect(src.keyPages).toBe("245-247");
    expect(src.extractedRound).toBe("r325");
    expect(src.header).toContain("استاندارد");
    expect(src.header).toContain("۲۴۵");
    expect(src.keyVerification).toContain("40/40");
    expect(Array.isArray(src.printQuirks)).toBe(true);
    expect(src.printQuirks.length).toBeGreaterThanOrEqual(15);
    expect(src.pattern).toContain("r324");
  });

  it("shape: 40 items with unique ids g10-l6-*", () => {
    expect(bank).toBeTruthy();
    expect(bank.count).toBe(40);
    expect(bank.questions).toHaveLength(40);
    const ids = bank.questions.map((q: { id: string }) => q.id);
    expect(new Set(ids).size).toBe(40);
    expect(doc.lessons).toHaveLength(24);
    expect(doc.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(398);
  });

  it("dual lock: printed letter + key word reflected in printed translation", () => {
    // حروفِ چاپ (گرید ص۲۴۵-۲۴۷)
    const printed = [
      "b","a","c","c","b","a","b","b","b","a","d","c","b","b","b","d","c","b","a","b",
      "c","a","d","c","a","b","c","a","c","a","c","a","c","c","b","d","a","d","b","a",
    ];
    // واژهٔ کلیدِ مورد انتظار در ترجمهٔ چاپی (لفظی یا مترادفِ مستند)
    const reflected: [number, string][] = [
      [1, "از بین برده"], [3, "گچ"], [4, "جدی"], [5, "داوطلبانه"], [6, "خیریه"],
      [7, "تقسیم"], [8, "برنامه"], [9, "مرتب"], [11, "منظم"], [12, "تشخیص"],
      [13, "مناسب"], [14, "انقراض"], [16, "فوق العاده"], [17, "افزایش"], [18, "شفاهی"],
      [19, "توصیف"], [20, "توصیه"], [21, "جالب"], [22, "جمعیت"], [24, "تصادفی"],
      [25, "عالی"], [26, "تصمیم"], [27, "جشن"], [28, "محیط زیست"], [29, "حضور"],
      [30, "مناسب"], [31, "سالگرد"], [32, "دوستانه"], [33, "فرهنگ"], [34, "در واقع"],
      [35, "انقراض"], [36, "کاهش"], [37, "مخصوصاً"], [38, "شگفت انگیز"], [39, "بزرگداشت"],
      [40, "طول عمر"],
    ];
    bank.questions.forEach((q: { n: number; answer: number }, i: number) => {
      expect(q.answer, `Q${q.n} printed letter`).toBe("abcd".indexOf(printed[i]));
    });
    for (const [n, word] of reflected) {
      const q = bank.questions.find((x: { n: number }) => x.n === n);
      expect(q.translation, `Q${n} reflects key`).toContain(word);
    }
    // مترادف‌های مستندِ چاپ: Q1 از بین برده، Q10 حفظ
    expect(bank.questions[0].translation).toContain("از بین برده");
    expect(bank.questions[9].translation).toContain("حفظ کنیم");
  });

  it("verbatim print quirks locked (Q23/Q24/Q27/Q32/Q34/Q26)", () => {
    const q = (n: number) => bank.questions.find((x: { n: number }) => x.n === n);
    expect(q(23).translation).toContain("بلا بیرم");
    expect(q(24).translation).toContain("از خود از خودش");
    expect(q(27).translation).toContain("میز پشتی");
    expect(q(27).translation).toContain("داشتند تولد یکی را");
    expect(q(32).translation).toContain("همسایه را بازگو کرد");
    expect(q(32).translation).toContain("کشورش را");
    expect(q(34).options[0]).toBe("carefully"); // گزینهٔ ۱ چاپ = به طور با دقت (ترجمه) — ساقه لاتین سالم
    expect(q(34).translation).toContain("میگویند");
    expect(q(26).translation.endsWith("محافظت کنند؟")).toBe(true);
    expect(q(4).translation).toContain("مرضی جدی");
    expect(q(4).translation).toContain("کرونایی");
    expect(q(37).translation).toContain("گرفته اند");
  });

  it("Persian purity: translations contain no Latin letters", () => {
    for (const q of bank.questions) {
      expect(/[A-Za-z]/.test(q.translation), `Q${q.n} latin leak`).toBe(false);
    }
  });

  it("stem integrity: options count 4, answer in range, no leakage of dashes style drift", () => {
    for (const q of bank.questions) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.question).toMatch(/-{3,}/);
    }
    // کلیدِ واژه‌ایِ نمونه: Q40 = lifespan، Q23 = raise
    expect(bank.questions[39].options[bank.questions[39].answer]).toBe("lifespan");
    expect(bank.questions[22].options[bank.questions[22].answer]).toBe("raise");
  });
});
