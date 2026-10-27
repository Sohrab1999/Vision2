// ------------------------------------------------------------------
// Task 150 «نشانِ ترکیبی زنجیره» — قراردادِ چیپِ یکپارچهٔ شعله×یخ.
// خالص و بی‌UI:
//   تا دیروز هدر دو چیپِ جدا داشت — شعلهٔ زنجیره (header.tsx، اسپنِ
//   غیرکلیک‌پذیر، بدونِ تحلیلی) و نشانگر یخ (FreezeBadge، دکمه،
//   freeze_badge). هر دو یک سیستم‌اند (نگهبانی زنجیره) و دو جای
//   بودجهٔ هدر (Task ۸۰) هدر می‌خوردند. نشانِ ترکیبی هر دو را در
//   «یک» چیپ می‌گذارد: شعله مهمانِ همیشگی است و یخ مهمانِ وضعیتی —
//   و برای نخستین‌بار ضربهٔ شعله هم تحلیل می‌شود (streak_badge).
//   نجاتِ امروز هم دیگر دو چیپ را نمی‌گیرد: «۹ · نجات شد» یک جمله است.
// ترکیب‌بندی از قراردادِ موجود می‌آید — freezeBadgeMeta یک‌جا برای
// همیشه منبعِ حقیقتِ یخ است (تغییر wording یخ = یک‌جا، اینجا رایگان
// به‌ارث می‌رسد). هیچ جهشی به store نمی‌زند — فقط ترجمه.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { freezeBadgeMeta, type FreezeBadgeMeta } from "./freeze-badge";

export interface StreakComboMeta {
  /** «flame-only» = فقط شعله؛ «ice-only» = زنجیرهٔ صفر ولی یخ حاضر؛ «combo» = هر دو */
  mode: "flame-only" | "ice-only" | "combo";
  /** زنجیرهٔ صاف‌شده (>= ۰) — صفر یعنی شعله مهمان نیست */
  streak: number;
  /** قراردادِ کامل یخ از freezeBadgeMeta — هیچ → مهمانِ یخ غایب */
  ice: FreezeBadgeMeta | null;
  /** عنوانِ یک‌پارچهٔ چیپ — aria-label و title (تساوی aria==title قرارداد است) */
  title: string;
}

export function streakComboMeta(input: {
  streak: number;
  freezeCount: number;
  freezeSavedDay: string;
  today: string;
}): StreakComboMeta | null {
  // نگهبان ورودی: persist خراب هرگز خط نمی‌سازد — هم‌قرارداد freezeBadgeMeta
  const streak = Number.isFinite(input.streak) ? Math.max(0, Math.floor(input.streak)) : 0;
  const ice = freezeBadgeMeta({
    freezeCount: input.freezeCount,
    freezeSavedDay: input.freezeSavedDay,
    today: input.today,
  });
  if (streak <= 0 && !ice) return null;

  // شعله فقط وقتی مهمان است که زنجیره زنده باشد — wording عین چیپِ قدیم
  const flameTitle = streak > 0 ? `زنجیرهٔ ${faNum(streak)} روزه مطالعه` : null;
  // ?? null: یخِ غایب undefined می‌دهد — فیلترِ قرارداد فقط null را می‌شناسد
  const parts = [flameTitle, ice?.title ?? null].filter((p): p is string => p !== null);
  const title = parts.join("؛ ");

  return {
    mode: streak > 0 && ice ? "combo" : streak > 0 ? "flame-only" : "ice-only",
    streak,
    ice,
    title,
  };
}
