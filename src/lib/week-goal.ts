// ------------------------------------------------------------------
// Task 128 «هدفِ هفتگی» — قراردادِ خالصِ حلقهٔ هدفِ هفتگی.
// UI-free: goalDays (روزهای کامل‌شدهٔ هدفِ روزانه در پنجرهٔ ۷روزه،
// همان thisWeek.goalDays دایجست) را به درصدِ محدودشده، برچسب‌های
// فارسی و وضعیتِ کامل ترجمه می‌کند — دقیقاً همان زبانِ دو اثرِ
// قدیمی‌تر: حلقهٔ PNGِ کارتِ هفته (r121، «X از ۷ روزِ هدف» +
// weekCardPercent) و پانوشتِ کاغذِ A4 (r124، «X از ۷ روزِ هدف
// کامل»). سه سطحِ مصرف یک زبان می‌شوند و این هم‌زبانی با تستِ
// توافقِ شبکه‌ای قفل می‌شود.
// Task 129 «چیپِ هفته در هدر» — زبان، سطحِ چهارم می‌گیرد: مینی‌حلقهٔ
// هدر (week-chip.tsx) همان weekGoalMeta را می‌خوانَد و goalDays را
// با weekWindowGoalDays از همان پنجرهٔ دایجست می‌شمارد — چیپِ امروز
// (GoalChip، Task 76) و حلقهٔ هفته حالا همسایه‌اند: یک روایت.
// Task 132 «نشانِ هفتهٔ کامل» — done حالا یک نشانِ نام‌دار دارد:
// meta.badge فقط در ۷/۷ «هفتهٔ کامل» است و در هر حالتِ دیگر null —
// زبانِ نشان هم از همین قرارداد می‌آید تا لایه‌هایِ بعدیِ هر مصرفی
// که بیاید، همان برچسب را ببیند (نشان = صادقِ دعوی، نه تزئینِ جدا).
// صداقت: هدفِ هفته یعنی «تعدادِ روزها»، نه جمعِ فعالیت‌ها — هیچ‌وقت
// از goalDays بزرگ‌تر ادعا نمی‌کند (سقفِ ۷، کفِ ۰، NaN → ۰).
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { dayKeyBefore } from "./weekly-digest";

export const WEEK_GOAL_DAYS = 7;

export interface WeekGoalMeta {
  /** درصدِ محدودشدهٔ ۰..۱۰۰ — همان ریاضیِ weekCardPercent (توافقِ شبکه‌ای) */
  pct: number;
  /** حلقه کامل شد؟ (هر ۷ روزِ هدف) */
  done: boolean;
  /** برچسبِ جمع‌وشدهٔ «۳/۷» */
  fraction: string;
  /** برچسبِ کاملِ هم‌زبانِ PNG/A4 — «۳ از ۷ روزِ هدف» */
  label: string;
  /** عنوانِ کامل — aria-label و tooltip حلقه */
  title: string;
  /** چند روزِ هدف تا پُرشدنِ حلقه مانده (برآورده → ۰) */
  remaining: number;
  /** نشانِ «هفتهٔ کامل» — فقطِ ۷/۷؛ هر حالتِ دیگر null (قراردادِ ۱۳۲) */
  badge: string | null;
}

export function weekGoalMeta(goalDays: number, todayLabel = "این هفته"): WeekGoalMeta {
  // نگهبان ورودی: persist خراب/NaN هرگز حلقه را نمی‌شکند — همان سقف/کفِ PNG
  const n = Number.isFinite(goalDays) ? Math.round(goalDays) : 0;
  const clamped = Math.max(0, Math.min(WEEK_GOAL_DAYS, n));
  const pct = Math.round((clamped / WEEK_GOAL_DAYS) * 100);
  const done = clamped >= WEEK_GOAL_DAYS;
  const remaining = WEEK_GOAL_DAYS - clamped;
  const fraction = `${faNum(clamped)}/${faNum(WEEK_GOAL_DAYS)}`;
  const label = `${faNum(clamped)} از ${faNum(WEEK_GOAL_DAYS)} روزِ هدف`;
  const title = done
    ? `${label} — ${todayLabel} کامل شد! هفت‌روزهٔ تمام، آفرین`
    : `${label} — ${todayLabel}: ${faNum(remaining)} روزِ هدفِ دیگر تا حلقهٔ کامل`;
  return { pct, done, fraction, label, title, remaining, badge: done ? "هفتهٔ کامل" : null };
}

/**
 * Task 129 «چیپِ هفته در هدر» — شمارندهٔ روزهای هدف‌دارِ پنجرهٔ ۷روزه،
 * عینِ تعریفِ thisWeek.goalDays دایجست (weekly-digest.sumTotals):
 * روزهای عضوِ goalMetDays که در [امروز−۶ .. امروز] می‌افتند — نه بیشتر،
 * نه کمتر. چیپِ هدر با همین خوان از حلقهٔ زندهٔ هفته‌نامه جدا نمی‌افتد و
 * توافقِ شبکه‌ایِ تست (چیپ ↔ دایجست) همین را قطعی می‌کند.
 * صادق‌نگه‌داشتنِ ورودی: آرایهٔ نبود/کج → ۰؛ عضوِ غیررشته نادیده؛
 * دوباره‌ها مثل دایجست یک‌بار می‌شمارند (دایجست از Set می‌سازد — این‌جا
 * هم Setِ محلی تا توافقِ شبکه‌ای رویِ هر ورودیِ ممکن قطعی بماند)؛
 * روزِ آینده هرگز شمرده نمی‌شود (دایجست هم با dayKeyBefore هرگز کلیدِ
 * آینده نمی‌سازد — هم‌قرارداد تا مغزِ استخوان).
 */
export function weekWindowGoalDays(
  goalMetDays: readonly string[] | undefined,
  todayKey: string
): number {
  if (!Array.isArray(goalMetDays)) return 0;
  const start = dayKeyBefore(todayKey, WEEK_GOAL_DAYS - 1);
  const seen = new Set<string>();
  for (const d of goalMetDays) {
    if (typeof d !== "string" || seen.has(d) || d < start || d > todayKey) continue;
    seen.add(d);
  }
  return seen.size;
}
