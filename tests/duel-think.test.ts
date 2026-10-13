// ------------------------------------------------------------------
// Task 106 «زمانِ فکر» — قراردادِ خالصِ نمونه‌های دیدن→پاسخ.
// هر دو طرف (داورِ ۳۰۰۳ و کارنامهٔ نبرد) همین توابع را مصرف می‌کنند؛
// پس قراردادِ مشترک این‌جاست که قفل می‌شود:
//   • بی‌دیدن (seenAt=null) → نمونهٔ null — نه صفرِ ساختگی
//   • نمونه هرگز از کلِ پنجرهٔ پاسخ بلندتر نیست (seenِ خراب هم بی‌اثر)
//   • مقدار منفی ممکن نیست؛ ورودیِ خراب کلاً null می‌شود
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import {
  recordThinkSample,
  padThinkSamples,
  duelThinkStats,
  type ThinkSamples,
} from "@/lib/duel-think";

describe("recordThinkSample — ثبتِ یک نمونهٔ فکر", () => {
  it("نمونهٔ عادی: پاسخ منهای دیدن، محدود به پنجرهٔ کل", () => {
    // seen=1000، پاسخ=3500، شروعِ سؤال=500 → فکر=2500 ≤ پنجرهٔ 3000
    const out = recordThinkSample([], 0, 1000, 3500, 500);
    expect(out).toEqual([2500]);
  });

  it("بی‌دیدن (seenAt=null) → نمونهٔ nullِ صادق — نه صفرِ ساختگی", () => {
    const out = recordThinkSample([], 3, null, 3500, 500);
    expect(out).toEqual([null, null, null, null]);
    expect(out[3]).toBeNull();
  });

  it("ساعت‌های وارونه (پاسخ قبل از شروعِ سؤال) → null", () => {
    expect(recordThinkSample([], 0, 1000, 3500, 5000)[0]).toBeNull();
  });

  it("seenِ دیرهنگام (بعد از پاسخ) → گیره به ۰، نه مقدارِ منفی", () => {
    const out = recordThinkSample([], 0, 9000, 3500, 500);
    expect(out[0]).toBe(0);
  });

  it("seenِ خرابِ خیلی-زودهنگام → هرگز از کلِ پنجره نمی‌گذرد", () => {
    // seen=−4000 یعنی raw=7500 ولی پنجره فقط 2000 است → گیره به 2000
    const out = recordThinkSample([], 0, -4000, 2000, 0);
    expect(out[0]).toBe(2000);
  });

  it("خلوص: ورودی دست‌نخورده می‌ماند و تودهٔ تازه برمی‌گردد", () => {
    const base: ThinkSamples = [100, null, 300];
    const out = recordThinkSample(base, 1, 500, 1500, 1000);
    expect(base).toEqual([100, null, 300]); // ورودی دست‌نخورده
    expect(out).not.toBe(base); // تودهٔ تازه
    expect(out[1]).toBe(500);
  });

  it("qiِ خراب: منفی → آرایهٔ بدونِ تغییر (کپی)؛ اعشاری → کف", () => {
    expect(recordThinkSample([], -1, 100, 200, 0)).toEqual([]);
    const out = recordThinkSample([], 2.9, 100, 300, 0);
    expect(out).toEqual([null, null, 200]); // idx=floor(2.9)=2
  });
});

describe("padThinkSamples — کشش به طولِ نبرد", () => {
  it("پرکردنِ کمبود با null و بریدنِ اضافه", () => {
    expect(padThinkSamples([1000, null], 4)).toEqual([1000, null, null, null]);
    expect(padThinkSamples([1, 2, 3], 2)).toEqual([1, 2]);
    expect(padThinkSamples([1, 2], 0)).toEqual([]);
  });

  it("ورودیِ خراب (منفی/نامعین/غایب) → nullِ صادق", () => {
    expect(padThinkSamples([500, -3, NaN, undefined as unknown as number], 4)).toEqual([
      500, null, null, null,
    ]);
    expect(padThinkSamples([500], Number.NaN)).toEqual([]);
  });
});

describe("duelThinkStats — آمارِ صادق", () => {
  it("بی‌نمونه: میانگین/کمینه/بیشینه null و seen=۰ — نه صفرِ ساختگی", () => {
    expect(duelThinkStats([])).toEqual({ avgMs: null, minMs: null, maxMs: null, seen: 0, total: 0 });
    const allNull = duelThinkStats([null, null, null]);
    expect(allNull.avgMs).toBeNull();
    expect(allNull.minMs).toBeNull();
    expect(allNull.maxMs).toBeNull();
    expect(allNull.seen).toBe(0);
    expect(allNull.total).toBe(3);
  });

  it("نمونه‌های مختلط: میانگین/کمینه/بیشینه فقط بر نمونه‌های سالم + پوشش", () => {
    const st = duelThinkStats([1000, null, 3000, 2000]);
    expect(st.avgMs).toBeCloseTo(2000, 5);
    expect(st.minMs).toBe(1000);
    expect(st.maxMs).toBe(3000);
    expect(st.seen).toBe(3);
    expect(st.total).toBe(4);
  });

  it("ورودیِ خراب (NaN/منفی/بی‌نهایت) از آمار بیرون می‌ماند", () => {
    const st = duelThinkStats([NaN, -1, Infinity, 4000]);
    expect(st.seen).toBe(1);
    expect(st.avgMs).toBe(4000);
    expect(st.maxMs).toBe(4000);
  });

  it("قطعیت: همان ورودی، همان خروجی (دو بار)", () => {
    const s: ThinkSamples = [1200, null, 3400, 800];
    expect(duelThinkStats(s)).toEqual(duelThinkStats(s));
  });
});
