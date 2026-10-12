// ------------------------------------------------------------------
// Task 77 — قرارداد خالص نشانگر یخِ زنجیره.
// دو سطح قفل می‌شود:
//   ① freezeBadgeMeta — چیپ هدر: مخزن/نجات/گاردها + تساوی wording
//   ② freezeEarnMeta — پیشرفتِ ساختن یخ: دقیقاً قرارداد goalAndFreezePatch
//     (پنجرهٔ ۷روزه با مقایسهٔ رشته‌ای، آستانهٔ ۳، سردشدن ۷روزه، سقف ۲)
//     — مرزها با کلید روزِ ثابت قفل می‌شوند (windowStart/سردشدن/سقف).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { freezeBadgeMeta, freezeEarnMeta } from "@/lib/freeze-badge";

const T = "2026-10-13"; // سه‌شنبه — کلید ثابت برای همهٔ مرزها
const dAgo = (n: number): string => {
  const [y, m, d] = T.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d!);
  dt.setDate(dt.getDate() - n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

describe("freezeBadgeMeta — چیپ هدر (Task 77)", () => {
  it("بدون یخ و بدون نجات → هیچ (خموشی برای تازه‌وارد)", () => {
    expect(freezeBadgeMeta({ freezeCount: 0, freezeSavedDay: "", today: T })).toBeNull();
  });

  it("مخزن: ۲ یخ → mode stock + برچسب «۲ یخ» + عنوانِ پوشش خودکار با سقف", () => {
    const m = freezeBadgeMeta({ freezeCount: 2, freezeSavedDay: "", today: T })!;
    expect(m.mode).toBe("stock");
    expect(m.label).toBe("۲ یخ");
    expect(m.title).toContain("۲ یخِ زنجیره داری");
    expect(m.title).toContain("سقف ۲ یخ");
  });

  it("تک یخ: «۱ یخ» با رقم فارسی", () => {
    const m = freezeBadgeMeta({ freezeCount: 1, freezeSavedDay: "", today: T })!;
    expect(m.mode).toBe("stock");
    expect(m.label).toBe("۱ یخ");
  });

  it("نجات امروز اولویت دارد: mode saved + «نجات شد» حتی با مخزن خالی", () => {
    const m = freezeBadgeMeta({ freezeCount: 0, freezeSavedDay: T, today: T })!;
    expect(m.mode).toBe("saved");
    expect(m.label).toBe("نجات شد");
    expect(m.title).toContain("امروز یخ، زنجیره را نجات داد");
    expect(m.title).toContain("زنجیرهٔ فردا را خودت نگه دار");
  });

  it("نجات با مخزن پُر: باقی‌مانده در عنوان می‌آید", () => {
    const m = freezeBadgeMeta({ freezeCount: 2, freezeSavedDay: T, today: T })!;
    expect(m.mode).toBe("saved");
    expect(m.title).toContain("۲ یخ دیگر در انبار");
  });

  it("گارد ورودی: NaN/منفی/کسری → صفر → null (persist خراب نمی‌شکند)", () => {
    expect(freezeBadgeMeta({ freezeCount: NaN, freezeSavedDay: "", today: T })).toBeNull();
    expect(freezeBadgeMeta({ freezeCount: -3, freezeSavedDay: "", today: T })).toBeNull();
    expect(freezeBadgeMeta({ freezeCount: 1.7, freezeSavedDay: "", today: T })!.count).toBe(1);
  });
});

describe("freezeEarnMeta — پیشرفتِ ساختن یخ، آینهٔ goalAndFreezePatch (Task 77)", () => {
  it("progress: ۲ روزِ هدف‌دار داخل پنجره (یکی بیرون) → «۲ از ۳»", () => {
    const m = freezeEarnMeta({
      goalMetDays: [dAgo(1), dAgo(3), dAgo(20)], // dAgo(20) بیرون پنجرهٔ ۷روزه
      freezeEarnedDay: "",
      freezeCount: 0,
      today: T,
    });
    expect(m.inWindow).toBe(2);
    expect(m.state).toBe("progress");
    expect(m.label).toBe("۲ از ۳ روزِ هدف‌دار");
    expect(m.title).toContain("۱ روزِ هدفِ دیگر");
  });

  it("مرز پنجره: روزِ دقیقاً windowStart (۶ روز پیش) شمرده می‌شود — شرط >= موتور", () => {
    const m = freezeEarnMeta({ goalMetDays: [dAgo(6)], freezeEarnedDay: "", freezeCount: 0, today: T });
    expect(m.inWindow).toBe(1);
  });

  it("روزِ قبل از پنجره (۷ روز پیش) شمرده نمی‌شود", () => {
    const m = freezeEarnMeta({ goalMetDays: [dAgo(7)], freezeEarnedDay: "", freezeCount: 0, today: T });
    expect(m.inWindow).toBe(0);
  });

  it("eligible: ۳ روز داخل پنجره بدون ساختِ قبلی → «یخ بعدی آماده»", () => {
    const m = freezeEarnMeta({
      goalMetDays: [dAgo(1), dAgo(3), dAgo(5)],
      freezeEarnedDay: "",
      freezeCount: 0,
      today: T,
    });
    expect(m.inWindow).toBe(3);
    expect(m.state).toBe("eligible");
    expect(m.label).toBe("یخ بعدی آماده");
  });

  it("cooldown: ساختِ ۳ روز پیش → ۴ روز باقی (۷ منزوی فاصله) و دروازه بسته", () => {
    const m = freezeEarnMeta({
      goalMetDays: [dAgo(1), dAgo(3), dAgo(5)],
      freezeEarnedDay: dAgo(3),
      freezeCount: 1,
      today: T,
    });
    expect(m.state).toBe("cooldown");
    expect(m.label).toContain("۴ روز تا یخ بعدی");
  });

  it("مرز سردشدن: ساختِ ۷ روز پیش از دروازه خارج شده → eligible", () => {
    const m = freezeEarnMeta({
      goalMetDays: [dAgo(1), dAgo(3), dAgo(5)],
      freezeEarnedDay: dAgo(7),
      freezeCount: 1,
      today: T,
    });
    expect(m.state).toBe("eligible");
  });

  it("cap: ۲ یخ در انبار → state cap فارغ از پنجره", () => {
    const m = freezeEarnMeta({ goalMetDays: [dAgo(1)], freezeEarnedDay: "", freezeCount: 2, today: T });
    expect(m.state).toBe("cap");
    expect(m.label).toBe("سقف یخ‌ها پر است");
  });

  it("گارد ورودی: goalMetDays خراب → صفرِ امن (progress با ۰ از ۳)", () => {
    const m = freezeEarnMeta({
      goalMetDays: "corrupt" as unknown as string[],
      freezeEarnedDay: "",
      freezeCount: 0,
      today: T,
    });
    expect(m.inWindow).toBe(0);
    expect(m.state).toBe("progress");
    expect(m.label).toBe("۰ از ۳ روزِ هدف‌دار");
  });
});
