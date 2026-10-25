// Task 73 «حبهٔ مرور سررسیده» — قرارداد متنی خالص + رویداد قیف.
import { describe, it, expect } from "vitest";
import { duePillMeta } from "@/lib/due-pill";
import { EVENT_NAMES, EVENT_LABELS_FA, isEventName } from "@/lib/analytics-events";

describe("duePillMeta", () => {
  it("عنوان با درس شروع: شمارش فارسی + نام درس", () => {
    const meta = duePillMeta(7, 2);
    expect(meta.long).toBe("۷ کارت سررسیده");
    expect(meta.short).toBe("۷");
    expect(meta.title).toBe("۷ کارت سررسیده — شروع مرور با فلش‌کارت‌های درس ۲");
  });

  it("بدون درس سررسیده (lesson=null): شروع مرور عمومی", () => {
    const meta = duePillMeta(5, null);
    expect(meta.title).toBe("۵ کارت سررسیده — شروع مرور");
    expect(meta.title).not.toContain("درس");
  });

  it("ارقام دوردی فارسی‌اند (۱۲ نه 12)", () => {
    const meta = duePillMeta(12, 3);
    expect(meta.long).not.toContain("12");
    expect(meta.long).toContain("۱۲");
    expect(meta.title).toContain("درس ۳");
  });

  it("کارت منفرد هم همان قرارداد (فارسی بعد از عدد جمع نمی‌سازد)", () => {
    expect(duePillMeta(1, 1).long).toBe("۱ کارت سررسیده");
  });
});

describe("srs_due_pill — رویداد قیف (Task 73)", () => {
  it("در رجیستری سفید فهرست شده و برچسب فارسی دارد", () => {
    expect(EVENT_NAMES).toContain("srs_due_pill");
    expect(EVENT_LABELS_FA.srs_due_pill).toBe("مرور سررسیدها از هدر");
    expect(isEventName("srs_due_pill")).toBe(true);
    // رویداد پیشین داشبورد دست‌نخورده — دو نقطهٔ ورود تفکیک‌پذیر می‌مانند
    expect(EVENT_LABELS_FA.srs_due_review).toBe("مرور سررسیدها از داشبورد");
  });
});
