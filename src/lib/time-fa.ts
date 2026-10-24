/**
 * r385 — مالکِ دامنهٔ «قالبِ فارسیِ زمان»: ارقام + پله‌سِ زمانِ نسبی + برچسبِ کلیدِ روز.
 *
 * سرشماریِ ممیزیِ دوقلو (الگویِ r382/r384) که این فایل را متولد کرد:
 *  • تبدیلِ ارقام چهار نسخه داشت — faNumِ همین‌جا (کانonical) + faNumِ محلیِ
 *    join-throttle + faDigitsِ محلیِ duel-pace + faDigitsِ محلیِ teacher-report.
 *    حکمِ r385: فقط دوقلوی سوم مرد (teacher-report — سمتِ اپ)؛ دوتایِ دیگر
 *    «استثنایِ مستند»اند — داورِ ۳۰۰۳ آن دو فایل را بیواسطه مصرف میکند و
 *    قراردادِ «خالص و بیوارداتِ» سیمِ سه‌سرویسی از مالکِ دامنه مهمتر است.
 *    دو «نام» برای یک ایدئوم گریپِ هم‌نام را فریب میداد — حاشیههایِ آن دو
 *    فایل حالا این حکم را حمل میکنند.
 *  • پله‌سِ زمانِ نسبی سه گویش داشت: timeAgoFa (یادگیرنده)، lastActiveFa
 *    (معلم)، autoBackupAgeFa (پشتیبان) — همان محاسبهٔ ms→پله→برچسب با سه
 *    رفتارِ «تصادفی» برای کِلاکِ عقب‌افتاده (تفاضلِ منفی): «لحظاتی پیش» /
 *    گیرهٔ صفر / دقیقهٔ منفی. قراردادِ r385: کِلاک هرگز به عقب نمیرود —
 *    گیرهٔ صفر در یکجا.
 *  • چیپهایِ نبرد (home-duel-resume، duel-setup) کلیدِ روزِ تقویمی
 *    (YYYY-MM-DD) را به timeAgoFa میدادند که آن را نیمهشبِ UTC میخواند —
 *    مصافِ امشب «۱۷ ساعت پیش» خوانده میشد (دروغِ نیمهشبِ UTC). کلیدِ روز
 *    فقط «روز» را شاهد است؛ برچسبش هم فقط روز ادعا میکند: dayKeyAgoFa.
 *
 * گویشها عمدیاند و میمانند (قراردادِ مخاطب، نه رت): یادگیرنده «لحظاتی پیش»،
 * معلم «همین حالا» تا یک ساعت، پشتیبان «همین حالا» تا یک دقیقه. آنچه یکجا
 * شد «محاسبه» است، نه «واژگان» — هر پوشِ عمومی امضا و مسیرِ وارداتِ خودش
 * را نگه میدارد (قراردادِ r384).
 */

/** latin → Persian digits — از study-theme به مالکِ واقعیِ دامنه کوچید (r385) */
export function faNum(v: number | string): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(v).replace(/\d/g, (d) => fa[Number(d)]);
}

const MIN_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** شکلِ گویش: پنجرهٔ «همین لحظه» + برچسبش + پلهٔ ماه برای کهنگیِ ≥۳۰ روز */
export interface RelativeFaShape {
  headMs: number;
  headLabel: string;
  months: boolean;
}

/** گویشِ یادگیرنده — فیدِ خانه و دفترچه‌ها؛ کهنگیِ ماه‌شماری میخواهد */
export const LEARNER_HEAD: RelativeFaShape = {
  headMs: MIN_MS,
  headLabel: "لحظاتی پیش",
  months: true,
};

/** گویشِ معلم — فهرستِ کلاس یکنگاهِ سنجیده میشود؛ دقیقه، نوفهٔ بیارزش است */
export const TEACHER_HEAD: RelativeFaShape = {
  headMs: HOUR_MS,
  headLabel: "همین حالا",
  months: false,
};

/** گویشِ پشتیبان — سنِ پشتیبانِ خودکار همیشه روبه‌جوان است */
export const BACKUP_HEAD: RelativeFaShape = {
  headMs: MIN_MS,
  headLabel: "همین حالا",
  months: false,
};

/**
 * پله‌سِ واحدِ زمانِ نسبی — تنها جایی در src که «N دقیقه/ساعت/روز/ماه پیش»
 * ساخته میشود. قرارداد:
 *  • ورودیِ نامتناهی (NaN/±∞) → null — حکمِ صادقِ «بیشاهدِ زمانی»؛ فراخوان
 *    فالبکِ دامنهایِ خودش را میگذارد («هرگز» معلم، «نامشخص» پشتیبان).
 *  • تفاضلِ منفی (کِلاکِ عقب / رکوردِ از-آینده) → گیرهٔ صفر — پله‌س هرگز
 *    با دادهٔ خراب ورق نمیزند (رفعِ سه رفتارِ تصادفیِ پیشین، r385).
 */
export function relativeAgeFa(
  elapsedMs: number,
  shape: RelativeFaShape
): string | null {
  if (!Number.isFinite(elapsedMs)) return null;
  const age = Math.max(0, elapsedMs);
  if (age < shape.headMs) return shape.headLabel;
  if (age < HOUR_MS) return `${faNum(Math.floor(age / MIN_MS))} دقیقه پیش`;
  if (age < DAY_MS) return `${faNum(Math.floor(age / HOUR_MS))} ساعت پیش`;
  if (!shape.months) return `${faNum(Math.floor(age / DAY_MS))} روز پیش`;
  if (age < 30 * DAY_MS) return `${faNum(Math.floor(age / DAY_MS))} روز پیش`;
  return `${faNum(Math.floor(age / (30 * DAY_MS)))} ماه پیش`;
}

/** زمانِ نسبیِ یادگیرنده از یک ISO کامل — مالکِ پیشینش study-theme بود (r385)
 *  فالبکِ رشتهٔ ناخوانا «نامشخص» است (پیشتر «NaN ماه پیش» میراند — حشرهٔ
 *  واقعی که سرشماریِ r385 بیرون کشید). */
export function timeAgoFa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  return relativeAgeFa(diff, LEARNER_HEAD) ?? "نامشخص";
}

const DAY_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * برچسبِ روز-گرا برای کلیدِ روزِ محلی (YYYY-MM-DD) — دواِ مصرف: چیپِ
 * «بازگشت به میدان» خانه و سطرهایِ دفترچهٔ نبرد در لابی.
 * قراردادِ شاهد: کلیدِ روز فقط «روز» را گواهی میکند، پس برچسب هم فقط روز
 * ادعا میکند — «امروز / دیروز / N روز پیش / N ماه پیش». نیمهشبِ محلیِ خودِ
 * کلید مبناست نه نیمهشبِ UTC (دروغِ نیمهشبِ UTC، r385). کلیدِ آینده دادهٔ
 * خراب است — گیرهٔ صفر، همان قراردادِ کِلاکِ پله‌س. رشتهٔ بی‌شکل → «نامشخص».
 */
export function dayKeyAgoFa(dayKey: string, now: number = Date.now()): string {
  const m = DAY_KEY_RE.exec(dayKey ?? "");
  if (!m) return "نامشخص";
  const day = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(day.getTime())) return "نامشخص";
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - day.getTime()) / DAY_MS);
  if (days <= 0) return "امروز";
  if (days === 1) return "دیروز";
  if (days < 30) return `${faNum(days)} روز پیش`;
  return `${faNum(Math.floor(days / 30))} ماه پیش`;
}
