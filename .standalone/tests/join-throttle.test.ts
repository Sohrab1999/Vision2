import { describe, expect, it, vi } from "vitest";

import {
  clientIpOf,
  createJoinThrottle,
  entryThrottleError,
  type LimitInfo,
} from "@/lib/join-throttle";

describe("join-throttle — گلوگاهِ ورود به اتاق (Task 97)", () => {
  it("تا سقفِ پنجره قبول می‌کند؛ تلاشِ سقف+۱ رد می‌شود", () => {
    const t = createJoinThrottle({ windowMs: 60_000, limitJoin: 3, now: () => 1_000_000 });
    expect(t.attempt("ip-a", "join").ok).toBe(true);
    expect(t.attempt("ip-a", "join").ok).toBe(true);
    expect(t.attempt("ip-a", "join").ok).toBe(true);
    const rejected = t.attempt("ip-a", "join");
    expect(rejected.ok).toBe(false);
    expect(rejected.retryAfterMs).toBeGreaterThan(0);
  });

  it("قراردادِ تمامِ تلاش‌ها: کوبیدنِ مداوم قفل می‌ماند — پنجره با ردشده‌ها پیر نمی‌شود", () => {
    let t = 1_000_000;
    const th = createJoinThrottle({
      windowMs: 60_000,
      limitJoin: 2,
      now: () => t,
    });
    th.attempt("ip-a", "join");
    th.attempt("ip-a", "join");
    // ۵۹ ثانیه کوبش — همه رد، بدونِ آزادشدنِ ظرفیت
    for (let i = 0; i < 5; i++) {
      t += 11_000;
      expect(th.attempt("ip-a", "join").ok).toBe(false);
    }
    // پنجره واقعاً پیر شد: نخستین تلاش از پنجره بیرون می‌رود → ظرفیت آزاد
    t += 10_000; // 61s پس از نخستین تلاش
    expect(th.attempt("ip-a", "join").ok).toBe(true);
  });

  it("retryAfterMs صادق است: تا آزادشدنِ ظرفیتِ قدیمی‌ترین ضبط را می‌گوید", () => {
    let t = 500_000;
    const th = createJoinThrottle({ windowMs: 60_000, limitJoin: 1, now: () => t });
    th.attempt("ip-a", "join"); // ضبط در t=500_000
    t += 20_000;
    const rejected = th.attempt("ip-a", "join");
    expect(rejected.ok).toBe(false);
    expect(rejected.retryAfterMs).toBe(40_000); // 500k + 60k − 520k
  });

  it("جداسازیِ per-IP: آی‌پیِ دیگر بودجهٔ خودش را دارد", () => {
    const t = createJoinThrottle({ windowMs: 60_000, limitJoin: 1, now: () => 10_000 });
    expect(t.attempt("ip-a", "join").ok).toBe(true);
    expect(t.attempt("ip-a", "join").ok).toBe(false);
    expect(t.attempt("ip-b", "join").ok).toBe(true);
  });

  it("جداسازیِ per-kind: بودجهٔ create و join سهمیهٔ جدا دارند", () => {
    const t = createJoinThrottle({
      windowMs: 60_000,
      limitCreate: 2,
      limitJoin: 2,
      now: () => 10_000,
    });
    t.attempt("ip-a", "create");
    t.attempt("ip-a", "join");
    t.attempt("ip-a", "join");
    expect(t.attempt("ip-a", "join").ok).toBe(false);
    expect(t.attempt("ip-a", "create").ok).toBe(true); // join پُر، create هنوز جا دارد
  });

  it("sweep فقط سطل‌های پیر را جمع می‌کند و شمارشِ درست برمی‌گرداند", () => {
    let t = 1_000_000;
    const th = createJoinThrottle({ windowMs: 60_000, now: () => t });
    th.attempt("ip-a", "join");
    th.attempt("ip-b", "create");
    expect(th.sweep()).toBe(0); // تازه‌اند
    t += 61_000;
    expect(th.sweep()).toBe(2); // هر دو پیر
    expect(th.sweep()).toBe(0); // دیگر نیستند
  });

  it("sweep سطلِ زنده را نگه می‌دارد — ظرفیتِ مصرف‌شدهٔ درون‌پنجره از بین نمی‌رود", () => {
    let t = 1_000_000;
    const th = createJoinThrottle({ windowMs: 60_000, limitJoin: 2, now: () => t });
    th.attempt("ip-a", "join");
    t += 5_000;
    th.attempt("ip-a", "join"); // پنجره پُر — هر دو ضبط تازه
    t += 10_000;
    th.sweep(); // تازه‌ترین ضبط (t=1_005_000) هنوز درون‌پنجره است
    expect(th.attempt("ip-a", "join").ok).toBe(false); // سطلِ زنده پُر مانده است
    t += 55_000; // هر دو ضبط پیر شدند
    th.sweep();
    expect(th.attempt("ip-a", "join").ok).toBe(true); // پنجره واقعاً خالی شد
  });

  it("onLimit فقط یک‌بار در هر پنجرهٔ سطل صدا می‌شود و پس از خالی‌شدن نو می‌شود", () => {
    let t = 2_000_000;
    const hits: LimitInfo[] = [];
    const th = createJoinThrottle({
      windowMs: 60_000,
      limitJoin: 1,
      now: () => t,
      onLimit: (info) => hits.push(info),
    });
    th.attempt("ip-a", "join");
    for (let i = 0; i < 4; i++) th.attempt("ip-a", "join"); // ۴ ردِ پیاپی
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ ip: "ip-a", kind: "join" });
    // پنجره می‌گذرد، سطل خالی و هشدار نو — ردِ تازه دوباره گزارش می‌شود
    t += 61_000;
    th.attempt("ip-a", "join");
    th.attempt("ip-a", "join");
    expect(hits).toHaveLength(2);
  });

  it("پیامِ ردِ فارسی: ثانیه با سقف‌گیری و ارقامِ فارسی", () => {
    expect(entryThrottleError("join", 40_000)).toBe("تلاشِ پیاپی برای پیوستن؛ ۴۰ ثانیهٔ دیگر دوباره تلاش کن.");
    expect(entryThrottleError("create", 1_500)).toBe("ساختِ اتاقِ بیش‌ازحد؛ ۲ ثانیهٔ دیگر دوباره تلاش کن.");
    expect(entryThrottleError("join", 0)).toContain("۱ ثانیه");
    expect(entryThrottleError("join", 40_000)).toMatch(/[۰-۹]/);
  });

  it("clientIpOf: X-Real-IP مقدم، نخستین هاپِ XFF، پیرایشِ ::ffff: و فالبکِ local", () => {
    expect(clientIpOf({ headers: { "x-real-ip": "198.51.100.7" }, address: "127.0.0.1" })).toBe("198.51.100.7");
    expect(
      clientIpOf({ headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" }, address: "127.0.0.1" }),
    ).toBe("203.0.113.9");
    expect(clientIpOf({ headers: {}, address: "::ffff:127.0.0.1" })).toBe("127.0.0.1");
    expect(clientIpOf({ headers: {}, address: "" })).toBe("local");
    // هدرِ آرایه‌ای (IncomingHttpHeaders) هم خوانده می‌شود
    expect(clientIpOf({ headers: { "x-real-ip": ["192.0.2.4"] } })).toBe("192.0.2.4");
    // X-Real-IPِ خالی به XFF می‌افتد نه به address
    expect(clientIpOf({ headers: { "x-real-ip": " ", "x-forwarded-for": "198.51.100.2" } })).toBe("198.51.100.2");
  });

  it("سقفِ ضبط (HIT_CAP): بعد از سیلابِ بی‌رحمانه هم retryAfter صادق می‌ماند", () => {
    let t = 3_000_000;
    const th = createJoinThrottle({ windowMs: 60_000, limitJoin: 1, now: () => t });
    th.attempt("ip-a", "join"); // نخستین و تنها ضبطِ معنادار برای ظرفیت
    // ۱۰۰ ردِ پیاپی — حافظه رشد نمی‌کند و قفل می‌ماند
    for (let i = 0; i < 100; i++) {
      t += 100;
      expect(th.attempt("ip-a", "join").ok).toBe(false);
    }
    // ظرفیت با پیرشدنِ نخستین ضبط آزاد می‌شود (۶۰ثانیه از ۳_۰۰۰_۰۰۰)
    t = 3_060_001;
    expect(th.attempt("ip-a", "join").ok).toBe(true);
  });
});
