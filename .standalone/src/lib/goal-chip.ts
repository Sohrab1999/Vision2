// ------------------------------------------------------------------
// Task 76 «چیپ هدف امروز» — قرارداد متنی چیپ هدر.
// خالص و بی‌UI: reviews+quizzes امروز و dailyGoal را به برچسب/عنوان/
// درصد ترجمه می‌کند — دقیقاً همان قراردادی که goalAndFreezePatch در
// day-engine برای «امن‌شدن زنجیره» می‌سنجد (met = reviews+quizzes >=
// dailyGoal)؛ واژه‌ها/دیکته/برق‌آسا عمداً وارد شمارش نمی‌شوند تا چیپ
// هیچ‌وقت چیزی جز امنیت زنجیره را ادعا نکند. تغییر wording = یک‌جا.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { percent } from "./domain/percent";

export interface GoalChipMeta {
  /** هدف امروز برآورده شده؟ (قرارداد goalAndFreezePatch) */
  done: boolean;
  /** برچسب جمع‌وشدهٔ موبایل «۳/۱۰» — current/goal */
  fraction: string;
  /** برچسب بلند دسکتاپ «۳ از ۱۰» */
  label: string;
  /** عنوان کامل — aria-label و tooltip چیپ */
  title: string;
  /** درصد پیشرفت محدودشده ۰..۱۰۰ برای میکرونوار چیپ */
  pct: number;
  /** چند فعالیت تا امن‌شدن زنجیره مانده (برآورده → ۰) */
  remaining: number;
}

export function goalChipMeta(
  reviews: number,
  quizzes: number,
  dailyGoal: number
): GoalChipMeta {
  // نگهبان ورودی: persist خراب/NaN هرگز چیپ را نمی‌شکند
  const r = Number.isFinite(reviews) ? Math.max(0, reviews) : 0;
  const q = Number.isFinite(quizzes) ? Math.max(0, quizzes) : 0;
  const g = Number.isFinite(dailyGoal) ? Math.max(1, Math.round(dailyGoal)) : 10;
  const act = r + q;
  const done = act >= g;
  const remaining = Math.max(0, g - act);
  const title = done
    ? `${faNum(act)} فعالیت امروز — هدف برآورده شد و زنجیره‌ات امروز امن است`
    : `${faNum(act)} از ${faNum(g)} فعالیت — ${faNum(remaining)} فعالیت تا امن‌شدن زنجیره`;
  return {
    done,
    fraction: `${faNum(act)}/${faNum(g)}`,
    label: `${faNum(act)} از ${faNum(g)}`,
    title,
    pct: percent(Math.min(act, g), g),
    remaining,
  };
}
