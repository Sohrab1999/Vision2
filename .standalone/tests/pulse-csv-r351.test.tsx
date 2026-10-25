// @vitest-environment jsdom
// ------------------------------------------------------------------
// r351 — «برجِ بیدار» — دو عضوِ تازهٔ خانوادهٔ نبض:
//
//   ① نشانِ فعالِ برج (پیشنهادِ ②ِ r350): قلابِ useWatchtower با
//      خوانشِ تک‌GET در سوارشدن + کلیدِ تازهسازی در هر بازشدنِ
//      تنظیمات؛ «تازگی» = آخرین نانِ خطا در ۲۴ ساعت ⇒ نقطهٔ کهرباییِ
//      client-only رویِ ماشهٔ تنظیمات. خطا ⇒ بی‌نشان (دیدبانی).
//   ② «دفترِ سی‌روزهٔ نبض»: خروجیِ CSVِ خانواده از سریِ (روز × رویداد ×
//      تعداد) با days=30 — برادرِ ۱۶۹/۱۷۸/۱۸۰، با همان لهجه (BOM،
//      CRLF، عددِ ASCII، ساختارِ بیویرگول) و دو پا/دو قضاوت در دیالوگ.
//
// قفلهایِ ساختاری سیمکشیِ هر دو را میبندند تا راندهایِ بعدی نتوانند
// بیصدا ازشان بگذرند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWatchtower, isFreshBreadcrumb } from "@/lib/use-watchtower";
import { buildPulseCsv, downloadPulseCsv, PULSE_CSV_COLUMNS, pulseLabel } from "@/lib/pulse-csv";
import { EVENT_NAMES, EVENT_LABELS_FA, EVENT_CATEGORIES } from "@/lib/analytics-events";

const HOUR = 3600 * 1000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

// ------------------------------------------------------------------
// ① دفترِ CSV — سازنده و دانلود
// ------------------------------------------------------------------
describe("buildPulseCsv — برادرِ چهارمِ خانوادهٔ CSV", () => {
  it("سرستون + سطرهایِ tidy با CRLF و عددِ ASCII", () => {
    const csv = buildPulseCsv([
      { day: "2026-10-23", name: "quiz_done", count: 5 },
      { day: "2026-10-23", name: "lesson_open", count: 2 },
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(PULSE_CSV_COLUMNS.join(","));
    expect(lines[1]).toBe("2026-10-23,آزمون کوتاه,5"); // برچسب از تکحقیقتِ رجیستری
    expect(lines[2]).toBe("2026-10-23,بازکردن درس,2");
    expect(lines[3]).toBe(""); // CRLF پایانی
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n"); // هیچ LFِ لخت — فقط CRLF
  });

  it("ترتیبِ سرور دستنخورده میماند (روز صعودی، نام صعودی) — سازنده مرتب نمیکند", () => {
    const csv = buildPulseCsv([
      { day: "2026-10-22", name: "duel_done", count: 1 },
      { day: "2026-10-23", name: "app_open", count: 9 },
      { day: "2026-10-23", name: "pulse_open", count: 3 },
    ]);
    const lines = csv.split("\r\n").filter((l) => l.length > 0);
    expect(lines[1].startsWith("2026-10-22")).toBe(true);
    expect(lines[2].startsWith("2026-10-23,بازکردن وب‌کتاب")).toBe(true);
    expect(lines[3].startsWith("2026-10-23,بازکردنِ نبضِ کامل")).toBe(true);
  });

  it("نامِ ناشناخته همان خودش میماند — برچسبِ جعلی ساخته نمیشود", () => {
    expect(pulseLabel("quiz_done")).toBe("آزمون کوتاه");
    expect(pulseLabel("some_future_event")).toBe("some_future_event");
    const csv = buildPulseCsv([{ day: "2026-10-23", name: "some_future_event", count: 1 }]);
    expect(csv).toContain("some_future_event,1");
  });

  it("قفلِ ساختارِ خانواده: هیچ برچسبِ فارسیِ رجیستری ویرگول/نقل‌قول/شکستِ خط ندارد", () => {
    // ۴۶ عضو — این قفل کلِ رجیستری را برایِ هر CSVِ آینده جزم میکند
    for (const [name, label] of Object.entries(EVENT_LABELS_FA)) {
      expect(label, name).not.toMatch(/[,"\r\n،]/);
      expect(label.length, name).toBeGreaterThan(0);
    }
  });
});

describe("downloadPulseCsv — idiomِ COUِ r344", () => {
  const originalCOU = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;

  afterEach(() => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
  });

  it("پایِ سبز: COUیِ استاب → true و لنگرِ vision2-pulse-<روز>.csv", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r351-fake", writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      const ok = downloadPulseCsv([{ day: "2026-10-23", name: "pulse_open", count: 2 }], "2026-10-23");
      expect(ok).toBe(true);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === "vision2-pulse-2026-10-23.csv");
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = origAppend;
    }
  });

  it("پایِ سرخ: شکستِ COU → false و بدونِ هیچ لنگری", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => {
        throw new TypeError("r351-test-cou");
      },
      writable: true,
      configurable: true,
    });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      expect(downloadPulseCsv([{ day: "2026-10-23", name: "pulse_open", count: 2 }], "2026-10-23")).toBe(false);
      expect(appended).toHaveLength(0);
    } finally {
      document.body.appendChild = origAppend;
    }
  });
});

// ------------------------------------------------------------------
// ② برجِ بیدار — تازگی و قلاب
// ------------------------------------------------------------------
describe("isFreshBreadcrumb — پنجرهٔ ۲۴ساعته با صداقت", () => {
  const now = Date.now();
  it("یکساعته ⇒ تازه؛ ۲۵ساعته ⇒ نه", () => {
    expect(isFreshBreadcrumb(iso(1 * HOUR), now)).toBe(true);
    expect(isFreshBreadcrumb(iso(23 * HOUR), now)).toBe(true);
    expect(isFreshBreadcrumb(iso(25 * HOUR), now)).toBe(false);
  });
  it("خالی/زباله/آینده ⇒ نه (ساعتِ واژگون تازگیِ جعلی نمیسازد)", () => {
    expect(isFreshBreadcrumb(undefined, now)).toBe(false);
    expect(isFreshBreadcrumb("", now)).toBe(false);
    expect(isFreshBreadcrumb("not-a-date", now)).toBe(false);
    expect(isFreshBreadcrumb(new Date(now + 2 * HOUR).toISOString(), now)).toBe(false);
  });
});

describe("useWatchtower — یک GET، کلیدِ تازهسازی، خطا = بی‌نشان", () => {
  let fetchCalls = 0;
  const stubFetch = (impl: () => Promise<unknown>) => {
    fetchCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(((..._args: unknown[]) => {
        fetchCalls++;
        return impl();
      }) as typeof fetch)
    );
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("نانِ تازه ⇒ ready + fresh:true + count", async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => ({ ok: true, count: 7, last: { at: iso(2 * HOUR), kind: "error", message: "boom" } }),
    }));
    const { result } = renderHook(() => useWatchtower());
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.fresh).toBe(true);
    expect(result.current.count).toBe(7);
    expect(fetchCalls).toBe(1); // تک‌GET در سوارشدن
  });

  it("نانِ کهنه (۳روزه) ⇒ ready اما بی‌نشان", async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => ({ ok: true, count: 4, last: { at: iso(72 * HOUR), kind: "boundary", message: "old" } }),
    }));
    const { result } = renderHook(() => useWatchtower());
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.fresh).toBe(false);
    expect(result.current.count).toBe(4);
  });

  it("شکستِ واکش ⇒ خطا و بی‌نشان — نه سلامتِ جعلی نه خطرِ جعلی", async () => {
    stubFetch(async () => {
      throw new Error("network-down");
    });
    const { result } = renderHook(() => useWatchtower());
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.fresh).toBe(false);
  });

  it("کلیدِ تازهسازی ⇒ واکشِ دوباره (هر بازشدنِ تنظیمات)", async () => {
    stubFetch(async () => ({
      ok: true,
      json: async () => ({ ok: true, count: 0 }),
    }));
    const { result, rerender } = renderHook((k: number) => useWatchtower(k), { initialProps: 0 });
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(fetchCalls).toBe(1);
    rerender(1); // toggleOpen(true) ⇒ setWtKey(k+1)
    await waitFor(() => expect(fetchCalls).toBe(2));
    expect(result.current.state).toBe("ready");
  });
});

// ------------------------------------------------------------------
// ③ رجیستری و سیمکشیِ ساختاری
// ------------------------------------------------------------------
describe("رجیستری و سیمکشیِ r351", () => {
  it("pulse_csv عضوِ «خروجی و هم‌رسانی» است و رجیستری بیرهبر نمیماند", () => {
    expect(EVENT_NAMES).toContain("pulse_csv");
    expect(EVENT_LABELS_FA.pulse_csv).toBe("خروجی CSV دفترِ نبض");
    expect(EVENT_CATEGORIES.pulse_csv).toBe("خروجی و هم‌رسانی");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("ماشهٔ تنظیمات: relative + نقطهٔ کهرباییِ client-only + aria-labelِ ثابت", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/shared/settings-popover.tsx"), "utf8");
    expect(src).toContain('className="relative flex h-11 w-11'); // لنگرِ نقطهٔ مطلق
    expect(src).toContain("data-testid=\"watchtower-dot\"");
    expect(src).toContain("bg-amber-500 animate-pulse");
    expect(src).toContain("aria-hidden"); // نقطه از درختِ دسترسپذیری بیرون
    expect(src).toContain('aria-label="تنظیمات"'); // قفلِ r317 دستنخورده
    expect(src).toContain("useWatchtower(wtKey)");
    expect(src).toContain("setWtKey((k) => k + 1)"); // تازهسازی در هر بازشدن
    // نقطه فقط با fresh — هرگز پیش از واکشی رندر نمیشود (هیدریشن)
    expect(src).toMatch(/watchtower\.fresh && \(/);
  });

  it("دیالوگِ نبض: دکمهٔ دانلود، واکشِ days=30، ردیابیِ pulse_csv و دو پا/دو قضاوت", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/shared/pulse-dashboard.tsx"), "utf8");
    expect(src).toContain('"pulse_csv"'); // قصدِ خروجی قبل از تلاش
    expect(src).toContain('fetch("/api/event?days=30"'); // دفترِ سی‌روزه
    expect(src).toContain("دانلود دفترِ سی‌روزهٔ رویدادها (CSV)");
    expect(src).toContain("دفترِ سی‌روزهٔ نبض ذخیره شد"); // پایِ سبزِ ساخت
    // r398 — شکستِ ساخت از مالکِ نامدار (fileFailToast) میسوزد؛ جفتِ دستی منقرض
    expect(src).toContain("fileFailToast()");
    expect(src).not.toContain("خطا در ساخت فایل");
    expect(src).toContain("دفترِ رویدادها خوانده نشد"); // شکستِ خواندن — دو پا
    expect(src).toContain("downloadPulseCsv");
    // دکمهٔ دانلود هم‌idiomِ دکمهٔ تازهسازی است (hoverِ همعنصرِ مستندِ r350)
    expect(src.match(/hover:bg-stone-200\/70/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
