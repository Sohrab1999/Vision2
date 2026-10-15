// راند ۲۰۹ — «جزوه در دسترس»: نقشهٔ درس‌های برنامه به بخش‌های جزوه
//
// درس‌های ۱۰-۱۲ (متوسطهٔ اول) جزوهٔ کاملِ پایهٔ خودشان را دارند:
//   درس ۱۰ = جزوهٔ پایهٔ هفتم، درس ۱۱ = هشتم، درس ۱۲ = نهم
// کلیدِ درونِ هر پایه = شمارهٔ درسِ کتابِ درسی (Prospect).
// پایه‌های ۱۰-۱۲ (جامع) در راندهای بعدیِ کرون پولیش می‌شوند — لایه آماده است.

import type { BookletGradeData, BookletSection } from "@/lib/booklet-types";
import { grade7Booklet } from "./booklet/grade7";
import { grade8Booklet } from "./booklet/grade8";
import { grade9Booklet } from "./booklet/grade9";

const GRADE_OF_LESSON: Record<number, BookletGradeData> = {
  10: grade7Booklet,
  11: grade8Booklet,
  12: grade9Booklet,
};

/** آیا این درس جزوهٔ بارگذاری‌شده دارد؟ */
export function hasBooklet(lessonId: number): boolean {
  const data = GRADE_OF_LESSON[lessonId];
  return !!data && Object.keys(data).length > 0;
}

/** بخش‌های جزوهٔ یک درس؛ کلید = شمارهٔ درسِ کتاب درسی */
export function bookletSections(lessonId: number): BookletSection[] {
  const data = GRADE_OF_LESSON[lessonId];
  if (!data) return [];
  return Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((k) => data[k]);
}

/** شمارِ کل بخش‌های جزوهٔ یک درس (برای برچسبِ تب) */
export function bookletSectionCount(lessonId: number): number {
  return bookletSections(lessonId).length;
}

/** شمارِ ردیف‌های واژگان جزوهٔ یک درس */
export function bookletVocabCount(lessonId: number): number {
  return bookletSections(lessonId).reduce(
    (n, s) => (s.kind === "vocab" ? n + s.rows.length : n),
    0,
  );
}
