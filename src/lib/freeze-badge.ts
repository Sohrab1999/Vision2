// ------------------------------------------------------------------
// Task 77 «نشانگر یخِ زنجیره» — قرارداد متنی دو سطح.
// خالص و بی‌UI:
//   ① freezeBadgeMeta — چیپ هدر کنار شعله: مخزن یخ (۲ یخ) یا نجاتِ
//      امروز (freezeSavedDay). یخ سطح هدر مستقل از streak است — زنجیره
//      صفر هم «تور نجات داری» پیام مهمی است.
//   ② freezeEarnMeta — میکرونوار پیشرفتِ ساختن یخ در خانه: دقیقاً همان
//      قرارداد goalAndFreezePatch در day-engine (۳ روزِ هدف‌دار در پنجرهٔ
//      ۷روزه + سردشدن ۷روزهٔ ساخت قبلی + زیر سقف). محاسبهٔ پنجره از
//      today پارامتری می‌آید نه ساعت واقعی — تست‌پذیرِ کامل.
// تغییر wording = یک‌جا. هیچ جهشی به store نمی‌زند — فقط ترجمه.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { FREEZE_CAP, FREEZE_EARN_GOALS, FREEZE_WINDOW } from "@/state/types";

// ---------------- ① چیپ هدر ----------------

export interface FreezeBadgeMeta {
  /** «stock» = مخزن یخ، «saved» = یخ امروز زنجیره را نجات داد */
  mode: "stock" | "saved";
  /** تعداد یخ در انبار (حالت saved هم ممکن است یخِ باقی‌مانده داشته باشد) */
  count: number;
  /** برچسب چیپ «۲ یخ» / «نجات شد» */
  label: string;
  /** عنوان کامل — aria-label و tooltip (تساوی aria==title قرارداد است) */
  title: string;
}

export function freezeBadgeMeta(input: {
  freezeCount: number;
  freezeSavedDay: string;
  today: string;
}): FreezeBadgeMeta | null {
  const n = Number.isFinite(input.freezeCount) ? Math.max(0, Math.floor(input.freezeCount)) : 0;
  const savedToday = input.freezeSavedDay === input.today;
  if (savedToday) {
    const rest =
      n > 0
        ? ` — ${faNum(n)} یخ دیگر در انبار`
        : " — با فعالیت امروز، زنجیرهٔ فردا را خودت نگه دار";
    return {
      mode: "saved",
      count: n,
      label: "نجات شد",
      title: `امروز یخ، زنجیره را نجات داد${rest}`,
    };
  }
  if (n <= 0) return null;
  return {
    mode: "stock",
    count: n,
    label: `${faNum(n)} یخ`,
    title: `${faNum(n)} یخِ زنجیره داری — یک روز غیبت را خودکار پوشش می‌دهد (سقف ${faNum(FREEZE_CAP)} یخ)`,
  };
}

// ---------------- ② پیشرفتِ ساختن یخ (خانه) ----------------

export type FreezeEarnState = "progress" | "eligible" | "cooldown" | "cap";

export interface FreezeEarnMeta {
  /** روزهای هدف‌دار در پنجرهٔ ۷روزه — همان inWindow موتور */
  inWindow: number;
  /** آستانهٔ ساخت یخ (ثابت ۳) */
  needed: number;
  state: FreezeEarnState;
  /** برچسب کوتاه برای میکرونوار خانه */
  label: string;
  /** عنوان کامل — tooltip خط */
  title: string;
}

/** ISO day-key معادل n روز قبل از today — از خودِ today (نه ساعت واقعی) */
function dayKeyAgo(today: string, n: number): string {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** اختلاف روزِ گردشده بین دو کلید روز (ظهرِ محلی — مصون از DST) */
function diffDays(a: string, b: string): number {
  const p = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12).getTime();
  };
  return Math.round((p(a) - p(b)) / 86_400_000);
}

export function freezeEarnMeta(input: {
  goalMetDays: string[];
  freezeEarnedDay: string;
  freezeCount: number;
  today: string;
}): FreezeEarnMeta {
  // نگهبان ورودی: persist خراب هرگز خط نمی‌سازد
  const days = Array.isArray(input.goalMetDays) ? input.goalMetDays : [];
  const count = Number.isFinite(input.freezeCount) ? Math.max(0, Math.floor(input.freezeCount)) : 0;
  const today = typeof input.today === "string" && input.today ? input.today : todayStr0();

  const windowStart = dayKeyAgo(today, FREEZE_WINDOW - 1);
  // دقیقاً شرط موتور: مقایسهٔ رشته‌ای >= windowStart (بدون فیلتر آینده)
  const inWindow = days.filter((d) => typeof d === "string" && d >= windowStart).length;
  const cooledDown = !input.freezeEarnedDay || input.freezeEarnedDay < windowStart;
  const atCap = count >= FREEZE_CAP;

  if (atCap) {
    return {
      inWindow,
      needed: FREEZE_EARN_GOALS,
      state: "cap",
      label: "سقف یخ‌ها پر است",
      title: `هر ${faNum(FREEZE_CAP)} یخ در انبار است — تا آزادشدن جا، یخِ تازه ساخته نمی‌شود`,
    };
  }
  if (inWindow >= FREEZE_EARN_GOALS && cooledDown) {
    return {
      inWindow,
      needed: FREEZE_EARN_GOALS,
      state: "eligible",
      label: "یخ بعدی آماده",
      title: "آستانهٔ یخ کامل شد — با کامل‌کردن هدفِ بعدی، یخِ تازه ساخته می‌شود",
    };
  }
  if (inWindow >= FREEZE_EARN_GOALS && !cooledDown) {
    const left = Math.max(1, FREEZE_WINDOW - diffDays(today, input.freezeEarnedDay));
    return {
      inWindow,
      needed: FREEZE_EARN_GOALS,
      state: "cooldown",
      label: `${faNum(left)} روز تا یخ بعدی`,
      title: `ساختِ یخ قبلی تازه است — ${faNum(left)} روز تا بازشدن ساختِ یخِ بعدی`,
    };
  }
  const remaining = Math.max(0, FREEZE_EARN_GOALS - inWindow);
  return {
    inWindow,
    needed: FREEZE_EARN_GOALS,
    state: "progress",
    label: `${faNum(inWindow)} از ${faNum(FREEZE_EARN_GOALS)} روزِ هدف‌دار`,
    title: `${faNum(inWindow)} روزِ هدف‌دار در ${faNum(FREEZE_WINDOW)} روزِ گذشته — ${faNum(remaining)} روزِ هدفِ دیگر تا آستانهٔ یخ بعدی`,
  };
}

/** کلید روزِ محلی — فقط نگهبان مسیر today خالی */
function todayStr0(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
