// @vitest-environment jsdom
// ------------------------------------------------------------------
// r355 — «هشدارِ بودجه در خانوادهٔ هوش مصنوعیِ نبض» — پیشنهادِ ③ِ r351
// (دو راند باز) — سومین مصرفکنندهٔ ریاضیِ بودجه.
//
// Contracts locked here:
//   • budget-tone.ts — the SINGLE truth for budget math (thresholds
//     60/85 live ONLY here; settings rows borrow, the pulse borrows —
//     a parallel literal is forbidden and locked out)
//   • budgetPercent: clamped to [0,100]; impossible input (cap<=0,
//     NaN, negative, Infinity) ⇒ honest 0 — never a lying tone
//   • the pulse strip RIDES the AI family (derived from the registry
//     single truth via EVENT_CATEGORIES["explain_generated"]): family
//     absent ⇒ strip absent (nothing to contextualize — honest)
//   • usage fetch failure ⇒ strip hidden, families alive (visibility,
//     not correctness — the r347/r348 idiom)
//   • three tones: calm=violet (the explain brand), warm=amber with
//     «ماه نزدیکِ سقف است», near=rose; pct=100 speaks the CLOSED truth
//     (generation shut until next month; cache and TTS keep working)
//   • refresh re-reads the meter (ops value: the strip is live)
//   • Persian digits everywhere; no transition-all (scoped-transitions)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// ---------------------------------------------------------------
// ① موتورِ خالص — آستانهها فقط اینجا
// ---------------------------------------------------------------
describe("budget-tone — the single truth", () => {
  it("آستانهها رویِ مرزها: ۵۹ آرام، ۶۰ گرم، ۸۴ گرم، ۸۵ نزدیک، ۱۰۰ نزدیک", async () => {
    const { budgetTone } = await import("@/lib/budget-tone");
    expect(budgetTone(0)).toBe("calm");
    expect(budgetTone(59)).toBe("calm");
    expect(budgetTone(60)).toBe("warm");
    expect(budgetTone(84)).toBe("warm");
    expect(budgetTone(85)).toBe("near");
    expect(budgetTone(100)).toBe("near");
    expect(budgetTone(101)).toBe("near"); // دفاعی — ورودیِ بیرونِ بازه هم نزدیک است نه آرام
  });

  it("budgetPercent بسته در [0,100] — ورودیِ ناممکن ⇒ صفرِ صادق، نه تنِ دروغین", async () => {
    const { budgetPercent } = await import("@/lib/budget-tone");
    expect(budgetPercent(0, 3000)).toBe(0);
    expect(budgetPercent(900, 3000)).toBe(30);
    expect(budgetPercent(1800, 3000)).toBe(60);
    expect(budgetPercent(2550, 3000)).toBe(85);
    expect(budgetPercent(1500, 3000)).toBe(50);
    expect(budgetPercent(3100, 3000)).toBe(100); // سقفِ بالا
    expect(budgetPercent(0, 0)).toBe(0); // تقسیم بر صفر هرگز
    expect(budgetPercent(5, -1)).toBe(0);
    expect(budgetPercent(NaN, 3000)).toBe(0);
    expect(budgetPercent(-2, 3000)).toBe(0); // مصرفِ منفی ناممکن است
    expect(budgetPercent(Infinity, 3000)).toBe(0);
  });
});

// ---------------------------------------------------------------
// ② قفلهایِ تکحقیقت — آستانه فقط در budget-tone.ts زندگی میکند
// ---------------------------------------------------------------
describe("structural locks — the threshold lives exactly once", () => {
  it("تنظیمات از موتورِ قرض میگیرد و لیترالِ موازی ندارد؛ نبض هم قرضگیر است", () => {
    const settings = read("src/components/study/shared/settings-popover.tsx");
    expect(settings).toContain('from "@/lib/budget-tone"');
    expect(settings).toContain("budgetPercent(");
    expect(settings).toContain("budgetTone(");
    expect(settings).not.toContain("pct >= 85"); // لیترالِ موازی ممنوع
    expect(settings).not.toContain("pct >= 60");

    const lib = read("src/lib/budget-tone.ts");
    expect(lib).toContain("pct >= 85");
    expect(lib).toContain("pct >= 60");

    const pulse = read("src/components/study/shared/pulse-dashboard.tsx");
    expect(pulse).toContain('from "@/lib/budget-tone"');
  });

  it("نوارِ نبض سوارِ خانوادهٔ مالکِ explain_generated است + آیدیومهایِ صادق", () => {
    const pulse = read("src/components/study/shared/pulse-dashboard.tsx");
    expect(pulse).toContain('EVENT_CATEGORIES["explain_generated"]'); // تکحقیقتِ رجیستری — رانش بدونِ کامپایل ناممکن
    expect(pulse).toContain('data-testid="pulse-budget"');
    expect(pulse).toContain('"/api/explain/usage"');
    expect(pulse).toContain("from-violet-400 to-violet-600"); // برندِ بنفشِ توضیح در حالتِ آرام
    expect(pulse).toContain("سقفِ این ماه پر شده"); // حقیقتِ بسته — نه «تلاش دوباره»ی دروغین
    expect(pulse).not.toContain("transition-all"); // قفلِ scoped-transitions
  });
});

// ---------------------------------------------------------------
// ③ رندرِ زنده — سه تن + دو حالتِ پنهانیِ صادق
// ---------------------------------------------------------------
describe("PulseDashboard — the AI budget strip", () => {
  const today = () => new Date().toISOString().slice(0, 10);

  const eventsPayload = {
    events: [
      { name: "app_open", label: "بازکردن وب‌کتاب", total: 30, week: 9 },
      { name: "explain_generated", label: "تولیدِ توضیحِ هوشمند", total: 6, week: 2 },
      { name: "explain_open", label: "گشودنِ توضیحِ هوشمند", total: 11, week: 5 },
    ],
    series: [{ day: today(), name: "explain_generated", count: 1 }],
    updatedAt: `${today()}T12:34:00.000Z`,
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  const wire = (eventsBody: unknown = eventsPayload, xBody: unknown = { ok: true, used: 900, cap: 3000 }, xStatus = 200) => {
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes("/api/explain/usage")) {
          return new Response(JSON.stringify(xBody), { status: xStatus });
        }
        if (u.includes("/api/client-error")) {
          return new Response(JSON.stringify({ ok: true, count: 0 }), { status: 200 });
        }
        return new Response(JSON.stringify(eventsBody), { status: 200 });
      }))
    );
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

  it("حالتِ آرام — نوارِ بنفش داخلِ خانوادهٔ هوش مصنوعی، ارقامِ فارسی، بیخطِ هشدار", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 }); // ۳۰٪
    const { screen, waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-budget"]') as HTMLElement;
    expect(strip.textContent).toContain("۹۰۰");
    expect(strip.textContent).toContain("۳۰۰۰");
    expect(strip.textContent).toContain("۳۰٪");
    expect(strip.textContent).toContain("بودجهٔ توضیحِ هوشمندِ همین ماه");
    expect(strip.querySelector(".from-violet-400")).toBeTruthy();
    expect(strip.textContent).not.toContain("ماه نزدیکِ سقف است");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
    // نوار سوارِ خانوادهٔ هوش مصنوعی است — مستقل، بیخانه جعل نمیشود
    const famDiv = strip.parentElement as HTMLElement;
    const h3 = famDiv?.querySelector(":scope > div > h3") as HTMLElement;
    expect(h3?.textContent).toBe("هوش مصنوعی");
    expect(screen.getByText("تولیدِ توضیحِ هوشمند")).toBeTruthy(); // ردیفهایِ خانواده زندهاند
  });

  it("گرم (۶۳٪) — کهربا + خطِ «ماه نزدیکِ سقف است»", async () => {
    wire(eventsPayload, { ok: true, used: 1900, cap: 3000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-budget"]') as HTMLElement;
    expect(strip.querySelector(".from-amber-400")).toBeTruthy();
    expect(strip.classList.contains("border-amber-200")).toBe(true); // قاب، خودِ نوار است
    expect(strip.textContent).toContain("۶۳٪");
    expect(strip.textContent).toContain("ماه نزدیکِ سقف است");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
  });

  it("نزدیک (۹۰٪) — رز + خطِ «به سقف نزدیک شده» — نه پیامِ بسته", async () => {
    wire(eventsPayload, { ok: true, used: 2700, cap: 3000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-budget"]') as HTMLElement;
    expect(strip.querySelector(".from-rose-400")).toBeTruthy();
    expect(strip.textContent).toContain("۹۰٪");
    expect(strip.textContent).toContain("به سقفِ ماه نزدیک شده");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
  });

  it("۱۰۰٪ — حقیقتِ بسته: تولید تا ماهِ بعد بسته، کش و روخوانی زنده", async () => {
    wire(eventsPayload, { ok: true, used: 3000, cap: 3000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-budget"]') as HTMLElement;
    expect(strip.textContent).toContain("۱۰۰٪");
    expect(strip.textContent).toContain("سقفِ این ماه پر شده");
    expect(strip.textContent).toContain("کش و روخوانی کار میکنند");
  });

  it("شکستِ واکشِ بودجه ⇒ نوار پنهان، خانوادهها زنده (دیدبانی نه درستکاری)", async () => {
    wire(eventsPayload, { ok: false }, 500);
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(3));
    expect(document.querySelector('[data-testid="pulse-budget"]')).toBeNull();
    // برجِ مراقبت هم بیتأثیر — سه واکش مستقلاند
    expect(document.querySelector('[data-testid="pulse-watchtower"]')?.textContent).toContain("بدونِ خطایِ ثبت‌شده");
  });

  it("خانوادهٔ هوش مصنوعی غایب ⇒ نوار هم غایب (سوارِ خانواده، نه رها)", async () => {
    wire(
      {
        events: [{ name: "app_open", label: "بازکردن وب‌کتاب", total: 30, week: 9 }],
        series: [],
        updatedAt: `${today()}T12:00:00.000Z`,
      },
      { ok: true, used: 2900, cap: 3000 } // حتی نزدیکِ سقف — بیخانواده جعل نمیشود
    );
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(1));
    expect(document.querySelector('[data-testid="pulse-budget"]')).toBeNull();
  });

  it("تازهسازی — دکمهٔ نبض متر را هم دوباره میخواند (۳+۳ واکش)", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 });
    const { waitFor, fireEvent } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    const refresh = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "به‌روزرسانی نبض");
    expect(refresh).toBeTruthy();
    fireEvent.click(refresh as HTMLElement);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(6));
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
  });
});
