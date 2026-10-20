// ------------------------------------------------------------------
// r416 — «تمرینِ همین‌جا» — مقصدِ تمرینِ هر کارتِ سؤالِ جست‌وجو.
// خواستهٔ مسیرِ بعدیِ r415 (۳): کارتِ سؤال نباید بن‌بست باشد؛ هر
// نتیجهٔ سؤالی که از بانکی آمده، یک کلیک تا خودِ همان بانک فاصله دارد.
// این ماژول عمداً خالص است (فقط تایپ‌ها را می‌شناسد) تا vitest و نما
// از یک قرارداد بخوانند:
//   • بانک‌هایِ جزوه (tests-*/grammar-*) → book-view با deep-linkِ
//     بانک (r415: book-view از عنوانِ بانک به درسِ میزبان یا بخشِ
//     بی‌درس‌ها می‌رسد)؛ bankLesson = اندیسِ بانک (۱..N — نه شمارهٔ درس)
//   • بانک‌هایِ باندل: درس ۱-۳ ویژن ۲ → نمایِ درس (id هم‌شمارهٔ doc)؛
//     آزمونِ جامع → نمایِ آزمون؛ بانکِ کنکورِ دهم → نمایِ کنکور
//   • نتیجهٔ متنی / بانکِ بی‌اندیس → null (بدونِ دکمه — صداقتِ UI)
// ------------------------------------------------------------------

import type { JozveSearchResult } from "@/lib/jozve-search";
import type { View } from "@/state/types";

const JOZVE_BANK_RE = /^(tests-g\d+|grammar-g\d+.*)$/;

/** برچسبِ فارسیِ دکمهٔ تمرین — هم‌خانوادهٔ زبانِ کارت‌های جست‌وجو */
export function practiceLabelOf(r: JozveSearchResult): string | null {
  if (JOZVE_BANK_RE.test(r.doc)) return "تمرینِ همین بانک";
  if (r.doc === "exam-360") return "تمرین در آزمونِ جامع";
  if (r.doc === "konkur-g10") return "تمرین در بانکِ کنکور";
  if (/^lesson-[1-3]$/.test(r.doc)) return "تمرینِ همین درس";
  return null;
}

/** مقصدِ تمرینِ نتیجهٔ سؤال — null یعنی این کارت دکمهٔ تمرین نمی‌گیرد */
export function practiceTargetOf(r: JozveSearchResult): View | null {
  if (r.kind !== "question") return null;
  if (JOZVE_BANK_RE.test(r.doc)) {
    if (
      r.grade >= 7 &&
      r.grade <= 12 &&
      typeof r.bankLesson === "number" &&
      r.bankLesson > 0
    ) {
      return { type: "book", grade: r.grade, bank: r.bankLesson };
    }
    return null;
  }
  if (r.doc === "exam-360") return { type: "exam" };
  if (r.doc === "konkur-g10") return { type: "konkur" };
  if (/^lesson-[1-3]$/.test(r.doc)) {
    const id = Number(r.doc.slice("lesson-".length));
    return id >= 1 && id <= 3 ? { type: "lesson", id } : null;
  }
  return null;
}
