// @vitest-environment jsdom
// ------------------------------------------------------------------
// r360 — «هشدارِ پیشازِسقف» — پیشنهادِ ④ِ r358 (دو راند باز): امروز
// فقط نوارها حرف میزنند (منفعل) و توستهایِ r347/r348 فقط وقتی سقف
// «بسته» شد میآیند (واکنشی). این راند حلقهٔ گمشده: تنِ «نزدیک»
// (از موتورِ تکحقیقتِ budget-tone) رویدادِ window میفرستد و توستِ
// اختصاصیِ هر سرویس، روزیِ یک‌بار، میآید.
//
// قراردادهایی که این فایل قفل میکند:
//   • آستانه فقط در موتور است — هشدار با واژگانِ «near» زندگی میکند،
//     هیچ لیترالِ ۸۵ای در مصرفکننده‌ها نیست
//   • سقفِ بسته (۱۰۰٪) هشدارِ پیشازِسقف نمیگیرد — آن لحظه مالِ
//     خانوادهٔ بستهٔ r347/r348 است (دوتاییِ صحنه ممنوع)
//   • دیتایِ زباله (خدمتِ ناشناخته، pct غایب/۰/بازل) ⇒ هیچ — جعل ممنوع
//   • روزیِ یک‌بار به ازایِ هر سرویس — دو کلیدِ مستقل، تکحقیقتِ lib
//   • خواندنِ ناموفق در نبض رویدادی نمیفرستد — هشدارِ جعلی ممنوع
//   • رجیستریِ ثبتشده — هشدار رویدادِ تحلیلی ندارد (۵۴ با r424)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

// mockِ سطحِ بالا (hoisted) — توستها در این آرایهی مشترک جمع میشوند
const toastSpy: { title: string; description?: string }[] = [];
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (t: { title: string; description?: string }) => { toastSpy.push(t); } }),
}));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const today = () => new Date().toISOString().slice(0, 10);
const eventsPayload = {
  events: [
    { name: "explain_generated", label: "توضیح هوشمند (تازه)", total: 6, week: 2 },
    { name: "tts_spoken", label: "روخوانیِ تازه", total: 9, week: 3 },
  ],
  series: [],
  updatedAt: `${today()}T12:34:00.000Z`,
};

// ---------------------------------------------------------------
// ① موتور — آستانهها فقط اینجاست (دستنخورده) + تکحقیقتِ استخراج‌شده
// ---------------------------------------------------------------
describe("موتورِ تن و تکحقیقتِ روزیِ یک‌بار", () => {
  it("① budgetTone: ۸۴ گرم / ۸۵ نزدیک / ۹۹ نزدیک / ۱۰۰ نزدیک — موتورِ دستنخورده", async () => {
    const { budgetTone, budgetPercent } = await import("@/lib/budget-tone");
    expect(budgetTone(84)).toBe("warm");
    expect(budgetTone(85)).toBe("near");
    expect(budgetTone(99)).toBe("near");
    expect(budgetTone(100)).toBe("near"); // بسته هم near است — جداکُننده در مصرفکننده است (pct<100)
    expect(budgetPercent(NaN, 100)).toBe(0);
    expect(budgetPercent(50, 0)).toBe(0);
  });

  it("② oncePerDay: نخستین true، همانِ روزِ دوم false، کلیدِ دیگر true، private-mode true", async () => {
    const { oncePerDay } = await import("@/lib/once-per-day");
    localStorage.clear();
    expect(oncePerDay("k1")).toBe(true);
    expect(oncePerDay("k1")).toBe(false);
    expect(oncePerDay("k2")).toBe(true);
    // private-mode — throw ⇒ اجازهٔ توست (fails-OPEN)
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("private");
    });
    expect(oncePerDay("k3")).toBe(true);
    spy.mockRestore();
  });

  it("③ تکحقیقتِ آیدیوم: pwa-layer نسخهٔ محلی ندارد، هر دو مصرفکننده از lib میخوانند، قلاب لیترالِ آستانه ندارد", () => {
    const layer = read("src/components/study/shell/pwa-layer.tsx");
    expect(layer).not.toContain("function oncePerDay");
    expect(layer).toContain('from "@/lib/once-per-day"');
    const hook = read("src/components/study/shell/use-budget-near-toast.ts");
    expect(hook).toContain('from "@/lib/once-per-day"');
    // هیچ لیترالِ آستانه‌ای در قلاب نیست — واژگانِ موتور، نه عدد
    expect(hook).not.toMatch(/>=\s*85/);
    expect(hook).not.toMatch(/>=\s*60/);
  });
});

// ---------------------------------------------------------------
// ② نبض — فرستندهٔ رویداد (سه حالت + دو سرویس + سقوطِ صادق)
// ---------------------------------------------------------------
describe("نبض — فرستندهٔ هشدارِ پیشازِسقف", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const wire = (
    xBody: unknown = { ok: true, used: 900, cap: 3000 }, // ۳۰٪ آرام
    ttsBody: unknown = { ok: true, used: 48_000, cap: 150_000 }, // ۳۲٪ آرام
    xStatus = 200,
    ttsStatus = 200
  ) => {
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes("/api/tts/usage"))
          return new Response(JSON.stringify(ttsBody), { status: ttsStatus });
        if (u.includes("/api/explain/usage"))
          return new Response(JSON.stringify(xBody), { status: xStatus });
        if (u.includes("/api/client-error"))
          return new Response(JSON.stringify({ ok: true, count: 0 }), { status: 200 });
        return new Response(JSON.stringify(eventsPayload), { status: 200 });
      }))
    );
  };

  const fired = (): { service: string; pct: number }[] => {
    const out: { service: string; pct: number }[] = [];
    window.addEventListener("budget-near", ((e: CustomEvent) => {
      out.push(e.detail);
    }) as EventListener);
    return out;
  };

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  const renderPulse = async () => {
    const { default: PulseDashboard } = await import("@/components/study/shared/pulse-dashboard");
    const { render } = await import("@testing-library/react");
    render(<PulseDashboard open onOpenChange={vi.fn()} />);
  };

  it("④ نزدیک (۹۰٪ توضیح) ⇒ رویداد با detail {service:'explain',pct:90} — و نوارِ data-near میگیرد", async () => {
    wire({ ok: true, used: 2700, cap: 3000 });
    const seen = fired();
    await renderPulse();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="pulse-budget"]')?.getAttribute("data-near")).toBe("true")
    );
    await waitFor(() => expect(seen).toHaveLength(1));
    expect(seen[0]).toEqual({ service: "explain", pct: 90 });
  });

  it("⑤ نزدیک (۸۷٪ روخوانی) ⇒ service:'tts' — نوارِ همزاد هم data-near", async () => {
    wire(undefined, { ok: true, used: 130_000, cap: 150_000 }); // ۸۷٪
    const seen = fired();
    await renderPulse();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="pulse-tts-budget"]')?.getAttribute("data-near")).toBe("true")
    );
    await waitFor(() => expect(seen).toHaveLength(1));
    expect(seen[0]).toEqual({ service: "tts", pct: 87 });
  });

  it("⑥ گرم (۷۰٪) و آرام (۳۰٪) ⇒ هیچ رویدادی — هشدار فقط رویِ نزدیک", async () => {
    wire({ ok: true, used: 2100, cap: 3000 }, { ok: true, used: 105_000, cap: 150_000 });
    const seen = fired();
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeTruthy());
    await new Promise((r) => setTimeout(r, 150));
    expect(seen).toHaveLength(0);
    expect(document.querySelector('[data-testid="pulse-budget"]')?.getAttribute("data-near")).toBeNull();
  });

  it("⑦ سقفِ بسته (۱۰۰٪) ⇒ هیچ — آن لحظه مالِ خانوادهٔ بستهٔ r347/r348 است", async () => {
    wire({ ok: true, used: 3000, cap: 3000 }, { ok: true, used: 150_000, cap: 150_000 });
    const seen = fired();
    await renderPulse();
    await waitFor(() =>
      expect(document.querySelector('[data-testid="pulse-tts-budget"]')?.getAttribute("data-near")).toBe("true")
    );
    await new Promise((r) => setTimeout(r, 150));
    expect(seen).toHaveLength(0); // نوار «near» است اما هشدارِ پیشازِسقف نمیدهد
  });

  it("⑧ خواندنِ ناموفق ⇒ هیچ — هشدارِ جعلی ممنوع (نوار هم پنهان میماند)", async () => {
    wire({ ok: false }, { ok: false }, 500, 500);
    const seen = fired();
    await renderPulse();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 150));
    expect(seen).toHaveLength(0);
    expect(document.querySelector('[data-testid="pulse-budget"]')).toBeNull();
    expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeNull();
  });
});

// ---------------------------------------------------------------
// ③ قلاب — توستِ روزیِ یک‌بارِ هر سرویس + سقوطِ صادق
// ---------------------------------------------------------------
describe("قلابِ هشدار — توستِ اختصاصیِ هر سرویس", () => {
  beforeEach(() => {
    localStorage.clear();
    toastSpy.length = 0;
    cleanup();
  });

  const fire = (service: string, pct: number | undefined) => {
    window.dispatchEvent(
      new CustomEvent("budget-near", { detail: { service, pct } })
    );
  };

  it("⑨ توستِ TTS با درصدِ فارسی؛ تکرارِ همانِ روز ساکت؛ سرویسِ دیگر توستِ خودش را دارد", async () => {
    const { renderHook } = await import("@testing-library/react");
    const { useBudgetNearToast } = await import("@/components/study/shell/use-budget-near-toast");
    renderHook(() => useBudgetNearToast());
    fire("tts", 88);
    await waitFor(() => expect(toastSpy).toHaveLength(1));
    expect(toastSpy[0]!.title).toContain("روخوانی به آستانهٔ سقف رسید");
    expect(toastSpy[0]!.description).toContain("۸۸٪");
    fire("tts", 90); // همانِ روز — ساکت
    expect(toastSpy).toHaveLength(1);
    fire("explain", 91); // سرویسِ دیگر — توستِ خودش
    await waitFor(() => expect(toastSpy).toHaveLength(2));
    expect(toastSpy[1]!.title).toContain("توضیحِ هوشمند به آستانهٔ سقف رسید");
    expect(toastSpy[1]!.description).toContain("۹۱٪");
  });

  it("⑩ دیتایِ زباله ⇒ هیچ: خدمتِ ناشناخته، pctِ غایب، صفر، و ۱۰۰ (سقفِ بسته دوتایی نمیشود)", async () => {
    const { useBudgetNearToast } = await import("@/components/study/shell/use-budget-near-toast");
    const { renderHook } = await import("@testing-library/react");
    renderHook(() => useBudgetNearToast());
    fire("word-day", 88);
    fire("tts", undefined);
    fire("tts", 0);
    fire("explain", 100);
    await new Promise((r) => setTimeout(r, 100));
    expect(toastSpy).toHaveLength(0);
  });

  it("⑪ رجیستریِ رشدِ ثبتشده — هشدار رویدادِ تحلیلی ندارد (۵۴ با r424)", async () => {
    const reg = await import("@/lib/analytics-events");
    expect(reg.EVENT_NAMES).toHaveLength(60); // r456 +۵ — دوقلویِ شعلهٔ زنجیره + چیپِ هفته + آغازِ داستان + دو گیتِ مرورِ هوشمندِ معلم — بعد از ۵۵ِ r424/r425
    expect(reg.isEventName("budget_near")).toBe(false);
  });
});
