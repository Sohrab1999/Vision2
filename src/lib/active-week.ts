// ------------------------------------------------------------------
// r363 — «موتورِ هفتهٔ فعال» — تکحقیقتِ مشترکِ تجمیعِ پنجرهٔ اخیر.
// در r362 درونِ teacher-class-ledger زاده شد (سربرگِ دفترِ کلاس) و
// r363 برایِ سربرگِ کارنامهٔ تک‌یادگیرنده همزبانش شد — اما دفتر از
// کارنامه قرض میگیرد و کارنامه از دفتر نمیتواند بگیرد (سیکلِ
// ایمپورت). پس آیدیومِ r360 (once-per-day): موتور به کتابخانهٔ خودش
// میرود و هر دو مصرفکننده قرض میگیرند — هیچ نسخهٔ موازیِ محلیِ
// مجاز به بازگشت نیست (قفلِ تستیِ r363).
//
// صداقتها (عینِ r362، بیتغییر):
//   · هفتهٔ بی‌تلاش = صفرِ واقعی با شاهد (بنیادِ صفرِ r352) — سطرِ
//     «هفتهٔ فعال» چاپ میشود، اما سطرِ «پرکارترین» چاپ نمیشود؛
//     در هفتهٔ خالی پرکارترینِ روز وجود ندارد — ساختگی ممنوع.
//   · ردیفِ بدنام (تلاشِ غیرعددی/منفی) ⇒ صفرِ آن ردیف — شمارندهها
//     هرگز دروغ نمیگویند؛ روزِ بی‌برچسب ⇒ فقط سطرِ پرکارترین حذف
//     میشود، نه تجمیع — aggregate صادق میماند، جزئیاتِ قالبپذیرِ
//     ناقص حذف.
//   · تساویِ پرکارترین ⇒ روزِ تازهتر — قطعی و قفلِ تستی.
//   · طولِ پنجره از خودِ داده مشتق میشود (درسِ TREND_TITLE_OFِ
//     r354) — اگر گزارش پنجرهاش را عوض کند، سطر دنبالش میرود؛
//     دفترِ کلاس پنجرهاش ۷ روز است، کارنامهٔ یادگیرنده ۱۴ روز —
//     هر دو همین موتور را میخوانند.
//   · ورودیِ زباله (غیرآرایه/تهی) ⇒ هیچ سطری — غیبتِ صادق.
//   · اعدادِ ASCII (گویشِ خانوادهٔ CSV) — اکسل بتواند جمع بگیرد.
// ------------------------------------------------------------------

export interface ActiveWeekMeta {
  total: number; // کلِ تلاشهایِ پنجره
  activeDays: number; // روزهایِ دارایِ تلاش
  windowDays: number; // طولِ پنجره — از خودِ داده
  busiest: { day: string; attempts: number } | null; // هفتهٔ خالی = null
}

export function activeWeekMeta(
  byDay: { day: string; attempts: number }[] | null | undefined
): ActiveWeekMeta | null {
  if (!Array.isArray(byDay) || byDay.length === 0) return null;
  let total = 0;
  let activeDays = 0;
  let busiest: { day: string; attempts: number } | null = null;
  for (const row of byDay) {
    // پالایشِ هر ردیف: تلاشِ غیرعددی/منفی ⇒ صفرِ آن ردیف — شمارندهها هرگز دروغ نمیگویند
    const attempts =
      row && typeof row.attempts === "number" && Number.isFinite(row.attempts) && row.attempts > 0
        ? Math.floor(row.attempts)
        : 0;
    total += attempts;
    if (attempts > 0) activeDays += 1;
    // تساوی ⇒ روزِ تازهتر میبرد (>=) — قطعی
    if (attempts > 0 && (!busiest || attempts >= busiest.attempts)) {
      busiest = {
        day: row && typeof row.day === "string" ? row.day : "",
        attempts,
      };
    }
  }
  return { total, activeDays, windowDays: byDay.length, busiest };
}

/** سطرهایِ «هفتهٔ فعال» — پرکارترین فقط وقتی واقعاً روزی برایِ پر بودن هست */
export function activeWeekRows(meta: ActiveWeekMeta): string[] {
  const rows: string[] = [
    `هفتهٔ فعال,${meta.total} تلاش در ${meta.windowDays} روزِ اخیر · ${meta.activeDays} روزِ فعال`,
  ];
  if (meta.busiest && meta.busiest.day) {
    rows.push(`پرکارترینِ روز,${meta.busiest.day} · ${meta.busiest.attempts} تلاش`);
  }
  return rows;
}
