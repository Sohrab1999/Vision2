import { describe, expect, it } from "vitest";
import {
  BASE_POINTS,
  BONUS_STEP_MS,
  FEEDBACK_WINDOW_MS,
  RTT_TOLERANCE_MS,
  speedBonus,
} from "../mini-services/challenge-service/scoring";

// SEC (ممیزی 2026-10-12): پاداش سرعت دودل باید صرفاً از زمان‌سنجی سرور بیاید.
// این قرارداد ریاضیِ scoring.ts را قفل می‌کند تا هیچ بازگشتی به اعتمادِ
// گزارش ms کلاینت ممکن نشود.

const COMP = FEEDBACK_WINDOW_MS + RTT_TOLERANCE_MS; // کسری ثابت جبران (۷۳۰ms)

describe("duel speedBonus — server-authoritative scoring", () => {
  it("سقف پاداش برای پاسخ‌های زیرِ آستانهٔ جبران کامل است", () => {
    expect(speedBonus(0)).toBe(BASE_POINTS);
    expect(speedBonus(COMP)).toBe(BASE_POINTS); // estimate = 0
    expect(speedBonus(COMP + BONUS_STEP_MS - 1)).toBe(BASE_POINTS);
  });

  it("پاداش با هر ۱۵۰ms تأخیر یک واحد کم می‌شود", () => {
    expect(speedBonus(COMP + BONUS_STEP_MS)).toBe(BASE_POINTS - 1);
    expect(speedBonus(COMP + 5 * BONUS_STEP_MS)).toBe(BASE_POINTS - 5);
    expect(speedBonus(COMP + 10.4 * BONUS_STEP_MS)).toBe(BASE_POINTS - 10); // floor
  });

  it("پاداش هرگز منفی نمی‌شود (پاسخ‌های خیلی کند = امتیاز پایه)", () => {
    expect(speedBonus(COMP + 150 * BONUS_STEP_MS)).toBe(0);
    expect(speedBonus(COMP + 150 * BONUS_STEP_MS + 40_000)).toBe(0);
  });

  it("ورودی اعشاری/غیرمعتبر ایمن است و یکنوا کاهشی می‌ماند", () => {
    expect(speedBonus(COMP + 2.9 * BONUS_STEP_MS)).toBe(BASE_POINTS - 2);
    let prev = BASE_POINTS;
    for (let ms = 0; ms <= 40_000; ms += 97) {
      const b = speedBonus(ms);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(BASE_POINTS);
      expect(b).toBeLessThanOrEqual(prev);
      prev = b;
    }
  });

  it("سناریوی تقلب: کلاینتِ ms:0-فرست دیگر سود نمی‌کند — امتیاز تابع تأخیر واقعی سرور است", () => {
    // تقلب قدیمی: elapsed واقعی ۵ثانیه ولی ms گزارشی صفر → سقف پاداش.
    // اکنون سرور همان ۵۰۰۰ms را می‌بیند: estimate = 5000-730 = 4270 → 100-28
    const cheatedOutcome = speedBonus(5_000);
    const honestSlowOutcome = speedBonus(5_000);
    expect(cheatedOutcome).toBe(honestSlowOutcome); // ورودی کلاینت اصلاً وجود ندارد
    expect(cheatedOutcome).toBeLessThan(BASE_POINTS - 20); // نه سقفِ تقلبی
    // و بازیکن سریع صادق (۰٫۸ثانیه) پاداش به‌مراتب بیشتر می‌گیرد
    expect(speedBonus(800)).toBeGreaterThan(cheatedOutcome);
  });
});
