// ------------------------------------------------------------------
// Task 128 «هدفِ هفتگی» — قراردادِ خالصِ حلقهٔ هدفِ هفتگی.
// UI-free: goalDays (روزهای کامل‌شدهٔ هدفِ روزانه در پنجرهٔ ۷روزه،
// همان thisWeek.goalDays دایجست) را به درصدِ محدودشده، برچسب‌های
// فارسی و وضعیتِ کامل ترجمه می‌کند — دقیقاً همان زبانِ دو工件ِ
// قدیمی‌تر: حلقهٔ PNGِ کارتِ هفته (r121، «X از ۷ روزِ هدف» +
// weekCardPercent) و پانوشتِ کاغذِ A4 (r124، «X از ۷ روزِ هدف
// کامل»). سه سطحِ مصرف یک زبان می‌شوند و این هم‌زبانی با تستِ
// توافقِ شبکه‌ای قفل می‌شود.
// صداقت: هدفِ هفته یعنی «تعدادِ روزها»، نه جمعِ فعالیت‌ها — هیچ‌وقت
// از goalDays بزرگ‌تر ادعا نمی‌کند (سقفِ ۷، کفِ ۰، NaN → ۰).
// ------------------------------------------------------------------

import { faNum } from "./study-theme";

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
  return { pct, done, fraction, label, title, remaining };
}
