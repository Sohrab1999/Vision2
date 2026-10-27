// @vitest-environment jsdom
// ------------------------------------------------------------------
// r358 — «هشدارِ بودجهٔ روخوانی در نبض» — پیشنهادِ ②ِ r357 — نوارِ
// همزادِ نوارِ r355، چهارمین مصرفکنندهٔ موتورِ budget-tone.
//
// Contracts locked here:
//   • tts_spoken — the 52nd registry event: server-side, ONLY on a
//     real paid synthesis (cache miss) — the explain_generated sibling
//   • the TTS bar RIDES the family owning tts_spoken (derived from the
//     registry single truth — EVENT_CATEGORIES["tts_spoken"]): family
//     absent ⇒ bar absent (nothing floats loose — honest)
//   • tts/usage fetch failure ⇒ bar hidden, the AI bar AND the families
//     stay alive (visibility, not correctness — four INDEPENDENT fetches)
//   • the tone engine is BORROWED (budget-tone.ts) — thresholds live
//     exactly once; the pulse owns colors and copy only
//   • calm=emerald (the TTS brand from the r347 settings row) — NOT the
//     explain violet: two bars, two brands, one family
//   • pct=100 speaks the CLOSED truth: fresh narration shut until next
//     month; the audio cache keeps playing
//   • Persian digits everywhere; no transition-all (scoped-transitions)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// ---------------------------------------------------------------
// ① رجیستری — رویدادِ پنجاهودوم، سمتِ سرور، همخانوادهٔ توضیحِ هوشمند
// ---------------------------------------------------------------
describe("tts_spoken — the 52nd registry event", () => {
  it("در رجیستری است: برچسبِ «روخوانیِ تازه» و خانوادهٔ خودِ explain_generated (تکحقیقتِ هر دو سو)", async () => {
    const reg = await import("@/lib/analytics-events");
    expect(reg.EVENT_NAMES).toHaveLength(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    expect(reg.EVENT_NAMES).toContain("tts_spoken");
    expect(reg.EVENT_LABELS_FA.tts_spoken).toBe("روخوانیِ تازه");
    // نوارِ TTS خانواده را از همین کلید میخواند — هر دو سرویسِ پولیِ هوش مصنوعی همخانوادهاند
    expect(reg.EVENT_CATEGORIES.tts_spoken).toBe(reg.EVENT_CATEGORIES.explain_generated);
    expect(reg.EVENT_CATEGORIES.tts_spoken).toBe("هوش مصنوعی");
    expect(Object.keys(reg.EVENT_CATEGORIES).length).toBe(reg.EVENT_NAMES.length);
  });

  it("مسیرِ سرور: فقط سنتزِ واقعیِ پولی رویداد ثبت میکند — مسیرِ کش زودتر برمیگردد", () => {
    const route = read("src/app/api/tts/route.ts");
    expect(route).toContain('import { trackEventServer } from "@/lib/analytics-server"');
    expect(route).toContain('trackEventServer("tts_spoken")');
    // قفلِ ترتیب: برگشتِ کش پیش از ثبتِ رویداد است — روخوانیِ کشی رایگان و بیروید است
    const cachedReturn = route.indexOf("if (cached) return audioResponse(cached);");
    const recorded = route.indexOf('trackEventServer("tts_spoken")');
    expect(cachedReturn).toBeGreaterThan(-1);
    expect(recorded).toBeGreaterThan(cachedReturn);
  });

  it("تحلیلِ داده ساکت میشکند (r358 — شاهدهای زندهٔ مسیرِ TTS): خطایِ همگام هرگز پاسخ را نمیگیرد", () => {
    const lib = read("src/lib/analytics-server.ts");
    // قفلِ fails-silent: بدنه در try است — «db.eventDay»ی غایب (مثل تستِ
    // بدونِ mock) TypeErrorِ همگامِ فراری نمیسازد؛ همزادِ fails-OPENِ متر
    const fn = lib.indexOf("export function trackEventServer");
    const tryIdx = lib.indexOf("try {", fn);
    const catchIdx = lib.indexOf("} catch {", fn);
    expect(tryIdx).toBeGreaterThan(fn);
    expect(catchIdx).toBeGreaterThan(tryIdx);
    expect(lib).toContain("never break the response it rides");
  });
});

// ---------------------------------------------------------------
// ② قفلهایِ ساختاری — قرض از موتورِ تن، نه رونویسیِ آستانه
// ---------------------------------------------------------------
describe("structural locks — the TTS strip borrows, never forks", () => {
  it("نبض از budget-tone قرض میگیرد، خانواده را از رجیستری میخواند، لیترالِ آستانه ندارد", () => {
    const pulse = read("src/components/study/shared/pulse-dashboard.tsx");
    expect(pulse).toContain('from "@/lib/budget-tone"');
    expect(pulse).toContain('EVENT_CATEGORIES["tts_spoken"]'); // تکحقیقتِ رجیستری — رانش ناممکن
    expect(pulse).toContain('"/api/tts/usage"');
    expect(pulse).toContain('data-testid="pulse-tts-budget"');
    expect(pulse).not.toContain("pct >= 85"); // آستانه فقط در موتور است
    expect(pulse).not.toContain("pct >= 60");
    expect(pulse).not.toContain("transition-all"); // قفلِ scoped-transitions
  });

  it("دو نوار، دو برند، یک خانواده: آرامِ روخوانی زمردی است نه بنفشِ توضیح", () => {
    const pulse = read("src/components/study/shared/pulse-dashboard.tsx");
    expect(pulse).toContain("from-emerald-400 to-emerald-600"); // برندِ روخوانی در آرام
    expect(pulse).toContain("from-violet-400 to-violet-600"); // برندِ توضیح در آرام — دستنخورده
    expect(pulse).toContain("بودجهٔ روخوانیِ همین ماه");
    expect(pulse).toContain("کشِ صدا کار میکند"); // حقیقتِ بستهٔ TTS
  });
});

// ---------------------------------------------------------------
// ③ رندرِ زنده — سه تن + دو پنهانیِ صادق + استقلالِ واکشها
// ---------------------------------------------------------------
describe("PulseDashboard — the TTS budget strip", () => {
  const today = () => new Date().toISOString().slice(0, 10);

  const eventsPayload = {
    events: [
      { name: "explain_generated", label: "توضیح هوشمند (تازه)", total: 6, week: 2 },
      { name: "tts_spoken", label: "روخوانیِ تازه", total: 9, week: 3 },
    ],
    series: [{ day: today(), name: "tts_spoken", count: 1 }],
    updatedAt: `${today()}T12:34:00.000Z`,
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  const wire = (
    eventsBody: unknown = eventsPayload,
    xBody: unknown = { ok: true, used: 900, cap: 3000 },
    ttsBody: unknown = { ok: true, used: 48_000, cap: 150_000 }, // ۳۲٪
    ttsStatus = 200
  ) => {
    vi.stubGlobal(
      "fetch",
      (fetchMock = vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes("/api/tts/usage")) {
          return new Response(JSON.stringify(ttsBody), { status: ttsStatus });
        }
        if (u.includes("/api/explain/usage")) {
          return new Response(JSON.stringify(xBody), { status: 200 });
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

  it("آرام (۳۲٪) — نوارِ زمردی کنارِ نوارِ بنفش، هر دو در خانوادهٔ هوش مصنوعی، ارقامِ فارسی", async () => {
    wire();
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-tts-budget"]') as HTMLElement;
    expect(strip.textContent).toContain("۴۸۰۰۰");
    expect(strip.textContent).toContain("۱۵۰۰۰۰");
    expect(strip.textContent).toContain("۳۲٪");
    expect(strip.textContent).toContain("بودجهٔ روخوانیِ همین ماه");
    expect(strip.querySelector(".from-emerald-400")).toBeTruthy();
    expect(strip.textContent).not.toContain("ماه نزدیکِ سقف است");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
    // هر دو نوار زیرِ یک h3 زندهاند — خانوادهٔ واحدِ سرویسهایِ پولی
    const famDiv = strip.parentElement as HTMLElement;
    const h3 = famDiv?.querySelector(":scope > div > h3") as HTMLElement;
    expect(h3?.textContent).toBe("هوش مصنوعی");
    // ردیفِ روخوانیِ تازه هم در همان خانواده زنده است (eventِ نو، سطرِ نو)
    expect(famDiv?.textContent).toContain("روخوانیِ تازه");
    // نوارِ توضیحِ هوشمند هم همچنان زنده — همزادی، نه جانشینی
    expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy();
  });

  it("گرم (۶۳٪) — کهربا + خطِ «ماه نزدیکِ سقف است»", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 }, { ok: true, used: 95_000, cap: 150_000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-tts-budget"]') as HTMLElement;
    expect(strip.querySelector(".from-amber-400")).toBeTruthy();
    expect(strip.classList.contains("border-amber-200")).toBe(true);
    expect(strip.textContent).toContain("۶۳٪");
    expect(strip.textContent).toContain("ماه نزدیکِ سقف است");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
  });

  it("نزدیک (۹۰٪) — رز + خطِ نزدیکی — نه پیامِ بسته", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 }, { ok: true, used: 135_000, cap: 150_000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-tts-budget"]') as HTMLElement;
    expect(strip.querySelector(".from-rose-400")).toBeTruthy();
    expect(strip.textContent).toContain("۹۰٪");
    expect(strip.textContent).toContain("به سقفِ ماه نزدیک شده");
    expect(strip.textContent).not.toContain("سقفِ این ماه پر شده");
  });

  it("۱۰۰٪ — حقیقتِ بستهٔ روخوانی: سنتزِ تازه بسته، کشِ صدا زنده", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 }, { ok: true, used: 150_000, cap: 150_000 });
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeTruthy());
    const strip = document.querySelector('[data-testid="pulse-tts-budget"]') as HTMLElement;
    expect(strip.textContent).toContain("۱۰۰٪");
    expect(strip.textContent).toContain("سقفِ این ماه پر شده");
    expect(strip.textContent).toContain("کشِ صدا کار میکند");
  });

  it("شکستِ واکشِ TTS ⇒ نوارِ روخوانی پنهان، نوارِ توضیح و خانوادهها زنده (چهار واکشِ مستقل)", async () => {
    wire(eventsPayload, { ok: true, used: 900, cap: 3000 }, { ok: false }, 500);
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelector('[data-testid="pulse-budget"]')).toBeTruthy());
    expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeNull();
    expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(2);
    // برجِ مراقبت هم بیتأثیر — استقلالِ کاملِ واکشها
    expect(document.querySelector('[data-testid="pulse-watchtower"]')?.textContent).toContain("بدونِ خطایِ ثبت‌شده");
  });

  it("خانوادهٔ هوش مصنوعی غایب ⇒ نوارِ روخوانی هم غایب (سوارِ خانواده، نه رها)", async () => {
    wire(
      {
        events: [{ name: "app_open", label: "بازکردن وب‌کتاب", total: 30, week: 9 }],
        series: [],
        updatedAt: `${today()}T12:00:00.000Z`,
      },
      { ok: true, used: 900, cap: 3000 },
      { ok: true, used: 149_000, cap: 150_000 } // حتی نزدیکِ سقف — بیخانواده جعل نمیشود
    );
    const { waitFor } = await import("@testing-library/react");
    await renderPulse();
    await waitFor(() => expect(document.querySelectorAll('[data-testid="pulse-row"]').length).toBe(1));
    expect(document.querySelector('[data-testid="pulse-tts-budget"]')).toBeNull();
  });
});
