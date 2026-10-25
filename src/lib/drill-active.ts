// ---------------------------------------------------------------------
// r409 — «دریل در جریان است» — پرچمِ گذرایِ UI رویِ استورِ خارجیِ ماژول-سطح
// (همان ایدئومِ r231: subscribe + snapshotِ cacheشده برایِ useSyncExternalStore).
//
// چرا؟ دو کشفِ راند:
//  · راهنمای سراسری حینِ دریل زنده بود: کلیدِ حرفی (H/D/E/A/C/V/G/M/T)
//    وسطِ جلسهٔ دریل ناوبری میکرد و جلسهٔ در حالِ پاسخ را میبُرید —
//    درسِ quizContext (آزمون/رش/دوئل) به دریلهایِ خانوادهٔ نما تعمیم یافت:
//    جلسهٔ در حالِ اجرا به همان شکنندگیِ جلسهٔ آزمون است.
//  · کلیدِ T سراسری «شب/روز» است؛ دریلِ r409 همان T را روخوانیِ هدفِ
//    پرسش میکند — راهنما باید بداند کِی T مالِ دریل است، نه پوسته.
//
// قرارداد: پرچم فقط حافظهٔ همین تب است — هیچ نوشتنی به استورِ یادگیری
// و هیچ persistای (گذرا به اندازهٔ خودِ جلسهٔ دریل). مالکِ نوشتن فقط
// AppendixDrillView است (فازِ run روشن، خروج/نتیجه/انصراف خاموش)؛
// مالکِ خواندن راهنمای سراسری است.
// ---------------------------------------------------------------------

let active = false;
const subs = new Set<() => void>();

/** نوشتنِ پرچم — همگام، و خبردادنِ مشترکین فقط در تغییرِ واقعی (idempotent). */
export function setDrillActive(on: boolean): void {
  if (on === active) return;
  active = on;
  for (const cb of subs) cb();
}

/** اشتراکِ useSyncExternalStore — خروجیِ تابع، تابعِ لغوِ اشتراک است. */
export function subscribeDrillActive(cb: () => void): () => void {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

/** snapshotِ کلاینت — همیشه boolean (هویتِ پایدار برای useSyncExternalStore). */
export function drillActiveSnapshot(): boolean {
  return active;
}

/** snapshotِ سرور — دریل رویِ سرور معنا ندارد؛ همیشه خاموش. */
export function drillActiveServerSnapshot(): boolean {
  return false;
}
