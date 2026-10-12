// Task 76 «چیپ هدف امروز» — قرارداد خالص goalChipMeta.
// نکتهٔ کلیدی: شمارش باید «فقط reviews+quizzes» باشد — همان قراردادی که
// goalAndFreezePatch برای امنیت زنجیره می‌سنجد؛ واژهٔ نو/دیکته/برق‌آسا
// هرگز نباید چیپ را سبز کنند (تست ۲ این را قفل می‌کند).

import { describe, it, expect } from "vitest";
import { goalChipMeta } from "@/lib/goal-chip";

describe("goalChipMeta — قرارداد چیپ هدف امروز", () => {
  it("زیر هدف: کسر فعلی/هدف + باقی‌مانده در عنوان + درصد", () => {
    const m = goalChipMeta(3, 2, 10);
    expect(m.done).toBe(false);
    expect(m.fraction).toBe("۵/۱۰");
    expect(m.label).toBe("۵ از ۱۰");
    expect(m.remaining).toBe(5);
    expect(m.title).toBe("۵ از ۱۰ فعالیت — ۵ فعالیت تا امن‌شدن زنجیره");
    expect(m.pct).toBe(50);
  });

  it("قرارداد F-goal: واژهٔ نو/دیکته وارد شمارش نمی‌شود (فقط reviews+quizzes)", () => {
    // ۹ واژهٔ نو + ۰ فعالیت هدف‌دار → هنوز صفرِ راه‌رفته
    const m = goalChipMeta(0, 0, 10);
    expect(m.done).toBe(false);
    expect(m.fraction).toBe("۰/۱۰");
    expect(m.remaining).toBe(10);
    // ۹ واژه + ۳ دیکته + ۲ برق‌آسا + ۴ فعالیت هدف‌دار → فقط ۴
    const m2 = goalChipMeta(4, 0, 10);
    expect(m2.done).toBe(false);
    expect(m2.fraction).toBe("۴/۱۰");
  });

  it("دقیقاً روی هدف: برآورده + درصد ۱۰۰ + باقی‌مانده صفر", () => {
    const m = goalChipMeta(7, 3, 10);
    expect(m.done).toBe(true);
    expect(m.fraction).toBe("۱۰/۱۰");
    expect(m.remaining).toBe(0);
    expect(m.pct).toBe(100);
    expect(m.title).toContain("هدف برآورده شد");
  });

  it("بیش از هدف: درصد سقف می‌خورد نه اینکه سرریز کند", () => {
    const m = goalChipMeta(8, 5, 10);
    expect(m.done).toBe(true);
    expect(m.pct).toBe(100);
    expect(m.title).toContain("۱۳ فعالیت امروز");
  });

  it("نگهبان ورودی: NaN/منفی هرگز چیپ را نمی‌شکند", () => {
    const m = goalChipMeta(Number.NaN, 3, 10);
    expect(m.fraction).toBe("۳/۱۰");
    const m2 = goalChipMeta(-5, -2, 10);
    expect(m2.fraction).toBe("۰/۱۰");
    const m3 = goalChipMeta(2, 2, Number.NaN);
    expect(m3.done).toBe(false); // هدف نامعتبر → پیش‌فرض ۱۰
    expect(m3.fraction).toBe("۴/۱۰");
  });

  it("هدف نامعتبر/صفر: کف ۱ برای تقسیم‌برصفرِ امن", () => {
    const m = goalChipMeta(0, 0, 0);
    expect(m.done).toBe(false);
    expect(m.fraction).toBe("۰/۱");
    expect(m.pct).toBe(0);
  });
});
