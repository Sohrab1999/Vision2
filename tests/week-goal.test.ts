// ------------------------------------------------------------------
// Task 128 «هدفِ هفتگی» — قراردادِ خالصِ week-goal.ts.
// قفل‌ها:
//   ① توافقِ شبکه‌ای با weekCardPercent (حلقهٔ PNGِ کارتِ هفته) — دو工件
//      هرگز از هم دور نمی‌شوند (تک‌مالکِ ریاضی = week-goal.ts)
//   ② برچسبِ هم‌زبانِ سه工件: «X از ۷ روزِ هدف» (PNG/A4/زنده)
//   ③ گیرِ صادق: سقفِ ۷، کفِ ۰، NaN/کج → ۰ — هرگز بیش از goalDays ادعا
//   ④ done فقط در ۷/۷؛ remaining هم‌قراردادِ title
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { weekGoalMeta, WEEK_GOAL_DAYS } from "@/lib/week-goal";
import { weekCardPercent } from "@/lib/result-image";

describe("weekGoalMeta — قراردادِ حلقهٔ هدفِ هفتگی (Task 128)", () => {
  it("توافقِ شبکه‌ای با weekCardPercent — PNG و زنده یک ریاضی دارند", () => {
    const grid = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 99, Number.NaN, 2.6, 6.4];
    for (const x of grid) {
      expect(weekGoalMeta(x).pct, `grid ${x}`).toBe(weekCardPercent(x));
    }
  });

  it("درصدهای مرجعِ شبکه — ۳روز = ۴۳٪، ۵روز = ۷۱٪، ۷روز = ۱۰۰٪", () => {
    expect(weekGoalMeta(0).pct).toBe(0);
    expect(weekGoalMeta(1).pct).toBe(14);
    expect(weekGoalMeta(2).pct).toBe(29);
    expect(weekGoalMeta(3).pct).toBe(43);
    expect(weekGoalMeta(5).pct).toBe(71);
    expect(weekGoalMeta(6).pct).toBe(86);
    expect(weekGoalMeta(7).pct).toBe(100);
  });

  it("گیرِ صادق: بیش از ۷ سقف می‌خورد، منفی/NaN صفر می‌شود، کسری گرد می‌آید", () => {
    expect(weekGoalMeta(8).pct).toBe(100);
    expect(weekGoalMeta(99).label).toBe("۷ از ۷ روزِ هدف");
    expect(weekGoalMeta(-3).pct).toBe(0);
    expect(weekGoalMeta(-3).label).toBe("۰ از ۷ روزِ هدف");
    expect(weekGoalMeta(Number.NaN).pct).toBe(0);
    expect(weekGoalMeta(Number.NaN).done).toBe(false);
    expect(weekGoalMeta(2.6).pct).toBe(43); // گرد → ۳ روز
  });

  it("برچسب‌ها هم‌زبانِ PNG/A4 و با رقم‌های فارسی", () => {
    const m = weekGoalMeta(3);
    expect(m.label).toBe("۳ از ۷ روزِ هدف");
    expect(m.fraction).toBe("۳/۷");
    expect(m.remaining).toBe(4);
    expect(m.done).toBe(false);
    expect(m.title).toContain("۳ از ۷ روزِ هدف");
    expect(m.title).toContain("۴ روزِ هدفِ دیگر");
  });

  it("done فقط در ۷/۷ — عنوانِ جشن و remaining=۰", () => {
    const m = weekGoalMeta(7);
    expect(m.done).toBe(true);
    expect(m.remaining).toBe(0);
    expect(m.pct).toBe(100);
    expect(m.title).toContain("کامل شد");
    expect(weekGoalMeta(6).done).toBe(false);
  });

  it("WEEK_GOAL_DAYS = 7 — ثابتِ زبانِ مشترک (تغییرش یعنی تغییرِ هر سه工件)", () => {
    expect(WEEK_GOAL_DAYS).toBe(7);
  });
});

// ------------------------------------------------------------------
// Task 129 «چیپِ هفته در هدر» — قراردادِ خالصِ weekWindowGoalDays.
// قفل‌ها:
//   ⑤ توافقِ شبکه‌ای با computeWeeklyDigest().thisWeek.goalDays — چیپِ
//      هدر و حلقهٔ هفته‌نامه هرگز از هم دور نمی‌شوند (همان الگویِ
//      توافقِ ۱۲۸ بین PNG و زنده، این‌بار بین هدر و دایجست)
//   ⑥ مرزِ پنجره: امروز−۶ شمرده می‌شود، امروز−۷ نه، آینده هرگز
//   ⑦ گیرِ صادق: آرایهٔ نبود/کج → ۰، عضوِ غیررشته نادیده
// ------------------------------------------------------------------

import { weekWindowGoalDays } from "@/lib/week-goal";
import { computeWeeklyDigest, dayKeyBefore } from "@/lib/weekly-digest";

describe("weekWindowGoalDays — شمارندهٔ پنجرهٔ چیپِ هفته (Task 129)", () => {
  const T = "2026-10-14";

  it("توافقِ شبکه‌ای با thisWeek.goalDays دایجست — هدر و هفته‌نامه یک خوان دارند", () => {
    // شبکه‌ای از پراکندگی‌هایِ واقعی: مرزها، بیرونِ پنجره، آینده، آلودهٔ کج
    const grids: (string[] | undefined)[] = [
      undefined,
      [],
      [T],
      [dayKeyBefore(T, 6)],
      [dayKeyBefore(T, 7)],
      [dayKeyBefore(T, 3), dayKeyBefore(T, 5)],
      [dayKeyBefore(T, 6), dayKeyBefore(T, 5), dayKeyBefore(T, 4), dayKeyBefore(T, 3), dayKeyBefore(T, 2), dayKeyBefore(T, 1), T],
      [dayKeyBefore(T, 8), dayKeyBefore(T, 9), T], // بیرونِ پنجره + امروز
      [T, dayKeyBefore(T, -2)], // آیندهٔ کج
      [dayKeyBefore(T, 13), dayKeyBefore(T, 10)], // هفتهٔ پیشِ کامل
      [T, T, T, dayKeyBefore(T, 1)], // دوباره‌ها — دایجست با Set می‌شمارد
      ["garbage", "2026-13-99"], // اعضایِ کج
    ];
    for (const gm of grids) {
      const digest = computeWeeklyDigest({ goalMetDays: gm }, T);
      expect(weekWindowGoalDays(gm, T), `grid ${JSON.stringify(gm)}`).toBe(digest.thisWeek.goalDays);
    }
  });

  it("مرزِ پنجره: امروز−۶ داخل، امروز−۷ بیرون، آینده هرگز", () => {
    expect(weekWindowGoalDays([dayKeyBefore(T, 6)], T)).toBe(1);
    expect(weekWindowGoalDays([dayKeyBefore(T, 7)], T)).toBe(0);
    expect(weekWindowGoalDays([dayKeyBefore(T, 6), dayKeyBefore(T, 7)], T)).toBe(1);
    expect(weekWindowGoalDays([dayKeyBefore(T, -1)], T)).toBe(0); // فردا
    expect(weekWindowGoalDays([T], T)).toBe(1); // خودِ امروز
  });

  it("گیرِ صادق: undefined/کج → ۰؛ عضوِ غیررشته نادیده؛ دوباره‌ها یک‌بار (Set — هم‌قراردادِ دایجست)", () => {
    expect(weekWindowGoalDays(undefined, T)).toBe(0);
    expect(weekWindowGoalDays([], T)).toBe(0);
    expect(weekWindowGoalDays([T, T, dayKeyBefore(T, 1)], T)).toBe(2); // دوباره‌ها یک‌بار
    const mixed = [T, 123, null, undefined, {}, dayKeyBefore(T, 1)] as unknown as string[];
    expect(weekWindowGoalDays(mixed, T)).toBe(2); // فقط دو رشتهٔ معتبر
  });

  it("ترکیبِ واقعی: خوانِ چیپ → weekGoalMeta، عنوانِ همان زبانِ حلقهٔ هفته‌نامه", () => {
    const gm = [dayKeyBefore(T, 1), dayKeyBefore(T, 3), dayKeyBefore(T, 6)];
    const meta = weekGoalMeta(weekWindowGoalDays(gm, T), "این هفته");
    expect(meta.pct).toBe(43);
    expect(meta.label).toBe("۳ از ۷ روزِ هدف");
    expect(meta.title).toBe("۳ از ۷ روزِ هدف — این هفته: ۴ روزِ هدفِ دیگر تا حلقهٔ کامل");
  });
});
