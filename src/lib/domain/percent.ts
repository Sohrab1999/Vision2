/**
 * Pure domain — percent helper (audit §10 R-4).
 *
 * «بخشی از کل» به‌صورت عدد صحیح ۰ تا ۱۰۰. تا گام ۶ این محاسبه در ۱۲ نقطهٔ
 * پراکنده تکرار شده بود با رفتار ناسازگار در حالت صفر (بعضی‌ها گارد داشتند،
 * بعضی‌ها نه) و بعضی جاها سقف ۱۰۰ دستی. اکنون یک قرارداد:
 * مخرج نامعتبر یا صفر → ۰؛ خروجی همیشه در بازهٔ ۰ تا ۱۰۰ محدود می‌شود.
 */
export function percent(part: number, whole: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}
