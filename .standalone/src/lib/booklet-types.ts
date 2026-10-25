// راند ۲۰۹ — «جزوه در دسترس»: تایپ‌های محتوای استخراج‌شدهٔ جزوه‌ها
//
// محتوای جزوه‌ها با scripts/extract-booklets.py از PDFهای upload/ استخراج و با
// scripts/build-booklet-data.cjs به src/data/booklet/ تبدیل می‌شود. قراردادِ
// بدونِ-ساختگی: هر چیزی که این‌جاست دقیقاً از جزوه آمده — نامِ مؤلف/ناشر و
// نشانه‌های تماس طبق درخواستِ مالک حذف شده‌اند و گاردهای تست این را پین می‌کنند.

/** یک ردیف واژه/معنی از جدول واژگان جزوه */
export interface BookletWordPair {
  en: string;
  fa: string;
}

/** یک خط مکالمه/تمرین با گویندهٔ اختیاری */
export interface BookletDialogueLine {
  speaker?: string | null;
  en: string;
  fa: string;
}

/** ردیف فعل بی‌قاعده: شکل‌ها + معنی */
export interface BookletVerbRow {
  forms: string[];
  fa: string;
}

/** بخش‌های محتوای جزوه — هر بخش یک بلوکِ نمایش‌پذیر */
export type BookletSection =
  | { kind: "vocab"; title: string; rows: BookletWordPair[] }
  | { kind: "dialogue"; title: string; lines: BookletDialogueLine[] }
  | { kind: "practice"; title: string; lines: BookletDialogueLine[] }
  | { kind: "notes"; title: string; paras: string[] }
  | { kind: "exam"; title: string; items: string[] }
  | { kind: "verbs"; title: string; rows: BookletVerbRow[] };

/** نقشهٔ درسِ کتابِ درسی → بخش‌های جزوهٔ همان درس */
export type BookletGradeData = Record<number, BookletSection[]>;

/** برچسبِ فارسیِ هر نوع بخش — قراردادِ مشترک UI/تست */
export const BOOKLET_KIND_LABEL: Record<BookletSection["kind"], string> = {
  vocab: "واژگان",
  dialogue: "مکالمهٔ کتاب",
  practice: "تمرین‌ها",
  notes: "درسنامه",
  exam: "نمونه سؤال",
  verbs: "افعال بی‌قاعده",
};
