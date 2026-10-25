// ------------------------------------------------------------------
// Task 107 «ریتمِ نبرد» — قراردادِ خالصِ duel-pace:
//   ① clampPaceMs عضوِ دقیقِ فهرست را عیناً عبور می‌دهد
//   ② عددِ سالمِ خارجِ فهرست به نزدیک‌ترین ریتم می‌چسبد؛ گرهِ دوسر
//     (فاصلهٔ برابر) به آرام‌تر (عددِ بزرگ‌تر) — ابهام وقتِ بازیکن را کم نمی‌کند
//   ③ هر ورودیِ غیرعددی/بی‌سالم → پیش‌فرضِ ۱۵ ثانیه (نه throw، نه NaN)
//   ④ فهرستِ ریتم‌ها frozen است — هیچ مصرف‌کننده‌ای نمی‌تواند ریتمی بفزاید
//   ⑤ paceSecondsLabel برچسبِ فارسیِ بسته می‌سازد و ورودیِ خراب را هم
//     به برچسبِ پیش‌فرض می‌رساند (نه رشتهٔ «NaN ثانیه»)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import {
  DUEL_PACES,
  DEFAULT_PACE_MS,
  STALL_EXTRA_MS,
  clampPaceMs,
  paceSecondsLabel,
} from "@/lib/duel-pace";

describe("duel-pace — قراردادِ ریتمِ اتاق", () => {
  it("۱. فهرستِ سه ریتمِ بسته: ۸/۱۵/۲۵ ثانیه، frozen، پیش‌فرض = معمول", () => {
    expect(DUEL_PACES.map((p) => p.ms)).toEqual([8_000, 15_000, 25_000]);
    expect(DUEL_PACES.map((p) => p.key)).toEqual(["fast", "normal", "slow"]);
    expect(Object.isFrozen(DUEL_PACES)).toBe(true);
    expect(DEFAULT_PACE_MS).toBe(15_000);
    expect(STALL_EXTRA_MS).toBe(4_000);
  });

  it("۲. عضوِ دقیقِ فهرست عیناً عبور می‌کند (سیمِ دست‌نخورده دست نمی‌خورد)", () => {
    for (const p of DUEL_PACES) expect(clampPaceMs(p.ms)).toBe(p.ms);
  });

  it("۳. نزدیک‌ترین ریتم: ۱۰هزار→سریع، ۱۲هزار→معمول، ۲۱هزار→آرام", () => {
    expect(clampPaceMs(10_000)).toBe(8_000);
    expect(clampPaceMs(12_000)).toBe(15_000);
    expect(clampPaceMs(21_000)).toBe(25_000);
  });

  it("۴. گرهِ دوسر → آرام‌تر: ۱۱٫۵هزار→معمول، ۲۰هزار→آرام (ابهام وقت را کم نمی‌کند)", () => {
    expect(clampPaceMs(11_500)).toBe(15_000);
    expect(clampPaceMs(20_000)).toBe(25_000);
  });

  it("۴ب. بیرونِ گسترهٔ [۸هزار..۲۵هزار] = دست‌ساز، نه انتخاب → پیش‌فرض (نه چسبیدن به سریع‌ترین)", () => {
    expect(clampPaceMs(0)).toBe(DEFAULT_PACE_MS);
    expect(clampPaceMs(-1)).toBe(DEFAULT_PACE_MS);
    expect(clampPaceMs(7_999)).toBe(DEFAULT_PACE_MS);
    expect(clampPaceMs(25_001)).toBe(DEFAULT_PACE_MS);
    expect(clampPaceMs(60_000)).toBe(DEFAULT_PACE_MS);
  });

  it("۵. ورودیِ خرابِ سیم → پیش‌فرض: NaN/∞/رشته/شیء/بول/undefined/null", () => {
    for (const junk of [NaN, Infinity, -Infinity, "15000", { ms: 15000 }, true, false, undefined, null]) {
      expect(clampPaceMs(junk as unknown)).toBe(DEFAULT_PACE_MS);
    }
  });

  it("۶. خلوصِ قرارداد: clamp ورودیِ پیچیده را دست نمی‌زند و عددِ مجاز برمی‌گرداند", () => {
    const input = { perQMs: 8_000 };
    const out = clampPaceMs(input.perQMs);
    expect(out).toBe(8_000);
    expect(input.perQMs).toBe(8_000);
    // قطعیت: همان ورودی، همان خروجی — هر بار
    expect(clampPaceMs(19_999)).toBe(clampPaceMs(19_999));
  });

  it("۷. برچسبِ فارسی: ارقامِ فارسی + واژهٔ ثانیه", () => {
    expect(paceSecondsLabel(8_000)).toBe("۸ ثانیه");
    expect(paceSecondsLabel(15_000)).toBe("۱۵ ثانیه");
    expect(paceSecondsLabel(25_000)).toBe("۲۵ ثانیه");
  });

  it("۸. برچسب با ورودیِ خراب به برچسبِ پیش‌فرض می‌رسد نه «NaN ثانیه»", () => {
    expect(paceSecondsLabel(undefined)).toBe("۱۵ ثانیه");
    expect(paceSecondsLabel("x")).toBe("۱۵ ثانیه");
    expect(paceSecondsLabel(NaN)).toBe("۱۵ ثانیه");
  });
});
