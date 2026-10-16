// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۱ — بندِ ② پیشنهادِ ۲۴۰: هیدریشنِ «اپِ کامل» (StudyApp) در همان
// هارنسِ سه‌کانالهٔ r240 — نگهبانِ تاج‌دارِ CI.
//
// تا این راند هارنسِ هیدریشن، درهایِ «ادامه» را تک‌تک هیدرات می‌کرد؛
// این فایل کلِ پوستهٔ اپ را همان مسیرِ Next می‌برد: renderToString با
// windowِ خداحذفی (SSRِ صادقانه) → تزریقِ HTML → hydrateRoot در act →
// شنودِ سه‌کاناله (console.error + throw + رویدادِ error پنجره).
//
// مدیریتِ next/dynamic لازم نبود و از خودِ حقیقت آمد: همهٔ نماها ssr:false
// هستند (Task 44) و نمایِ اول خانه eager است — در HTMLِ سرور فقط fallback
// و بعد از هیدریشن هم هیچ lazy-chunkی برای نمایِ خانه بار نمی‌شود.
// مدیریتِ واقعیِ این راند: window.scrollTo (jsdom ندارد)، fetch جهانی
// (آمارِ زندهٔ خانه — شبکه در CI معنا ندارد)، ThemeProviderِ واقعیِ
// next-themes (همان پیچِ layout) و ریشه‌یِ persist (skipHydration + کلیدِ
// seedشده) — هر دو مسیرِ بازدید: تازه‌کار و یادگیرندهٔ برگشتی.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, act, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import type { ReactElement } from "react";
import { ThemeProvider } from "@/components/study/shell/theme-provider";
import StudyApp from "@/components/study/study-app";
import { writeAppendixResume, type AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  trackEventOncePerSession: vi.fn(),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const grammarRec: AppendixResumeItem = { scope: "grammar", id: "t-present-simple", title: "حال ساده", hint: "ص ۲۳" };
const phonRec: AppendixResumeItem = { scope: "phonetics", id: "ʌ", title: "/ʌ/ کوتاه آ", hint: "cup — love" };

const fetchMock = vi.fn(async () => ({
  ok: true,
  json: async () => ({ total: 0, avgPercent: 0, last24h: 0, recent: [] }),
}));

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  // jsdom IntersectionObserver ندارد — whileInViewِ خانه (framer-motion) در
  // فازِ mount بعد از هیدریشن به آن دست می‌زند؛ در مرورگر واقعی همیشه هست.
  class IOStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
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

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  cleanup();
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

/** همان مسیرِ SSR → هیدریشنِ Next برایِ اپِ کامل — کپیِ صادقانهٔ هارنسِ r240
 *  با یک تفاوت: window با ذخیره/بازگردانیِ دستی خداحذف می‌شود نه
 *  unstubAllGlobals (تا stubِ fetch در فازِ هیدریشن زنده بماند) +
 *  rootِ برگشتی برایِ unmount (پاک‌سازیِ تایمرهایِ backup/sync). */
async function hydrateAppForTest(ui: ReactElement): Promise<{
  container: HTMLElement;
  errors: string[];
  serverHtml: string;
  unmount: () => void;
}> {
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map((a) => String(a)).join(" "));
  };
  const onError = (e: ErrorEvent) => {
    e.preventDefault();
    errors.push(`[window-error] ${String(e.message)}`);
  };
  window.addEventListener("error", onError);
  let serverHtml = "";
  const realWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = undefined;
  try {
    serverHtml = renderToString(ui);
  } finally {
    (globalThis as { window?: unknown }).window = realWindow;
  }
  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.appendChild(container);
  let root: { unmount: () => void } | null = null;
  try {
    await act(async () => {
      root = hydrateRoot(container, ui);
    });
    await act(async () => {});
    await act(async () => {}); // تیکِ سوم — زنجیرهٔ onFinishHydration/اوپن‌بوک
  } catch (e) {
    // React 19 خطایِ هیدریشن را در AggregateError جمع می‌کند — بازش کنیم
    const describeErr = (x: unknown): string => {
      if (x instanceof AggregateError) return x.errors.map(describeErr).join(" || ");
      if (x instanceof Error) return `${x.message}\n${x.stack ?? ""}`;
      return String(x);
    };
    errors.push(`[thrown] ${describeErr(e)}`);
  } finally {
    console.error = original;
    window.removeEventListener("error", onError);
  }
  return {
    container,
    errors,
    serverHtml,
    unmount: () => {
      try {
        act(() => root?.unmount());
      } catch {
        /* unmountِ دوم — نادیده */
      }
    },
  };
}

const hydrationNoise = (errors: string[]) =>
  errors.filter((e) => /getServerSnapshot|hydrat|did not match|should be cached/i.test(e));

describe("هیدریشنِ اپِ کامل (StudyApp) — r241", () => {
  it("① تازه‌کار: سرور اسپینر می‌دهد، بعد از هیدریشن اپِ زنده + آنبوردینگ — صفرِ هشدار", async () => {
    const { container, errors, serverHtml, unmount } = await hydrateAppForTest(
      <ThemeProvider>
        <StudyApp />
      </ThemeProvider>,
    );
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    // SSR صادقانه: پوسته هست ولی هیچ حالتِ کلاینت‌محور در HTMLِ سرور نیست
    expect(serverHtml).toContain("در حال باز کردن کتاب");
    expect(serverHtml).not.toContain("header-resume-button");
    expect(serverHtml).not.toContain("به وبکتاب ویژن ۲ خوش آمدید"); // آنبوردینگ gated به mount
    // بعد از هیدریشن: هدر و دکمه‌های سراسری حاضرند (حالتِ کلاینت رسید)
    expect(container.querySelector('[aria-label^="فرمان‌یاب"]')).not.toBeNull();
    expect(container.textContent).toContain("ویژن ۲");
    // آنبوردینگِ تازه‌کار بعد از mount + rehydrate باز می‌شود — کاشفِ معناداری
    await act(async () => {});
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    // آمارِ زندهٔ خانه درخواست شد — کاشفِ دوم (شبکه mock است، درخواست واقعی ممنوع)
    expect(fetchMock).toHaveBeenCalledWith("/api/stats", expect.anything());
    unmount();
  });

  it("② یادگیرندهٔ برگشتی: رکورد + تاریخچه + onboarded — درهایِ «ادامه» بی‌هشدار برمی‌گردند", async () => {
    // seedِ وضعیتِ «برگشتی» پیش از رندرِ سرور — مثلِ یک ریلودِ واقعی
    localStorage.setItem(
      "vision2-study-v1",
      JSON.stringify({ state: { onboarded: true }, version: 0 }),
    );
    // ترتیبِ نوشتن = خودِ ترتیبِ تاریخچه: آخرینِ نوشتنِ رکوردِ فعلی است
    writeAppendixResume(phonRec);
    writeAppendixResume(grammarRec);
    const { container, errors, serverHtml, unmount } = await hydrateAppForTest(
      <ThemeProvider>
        <StudyApp />
      </ThemeProvider>,
    );
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    // درِ هدر در HTMLِ سرور نبود — بعد از هیدریشن با رکوردِ کلاینت حاضر شد
    expect(serverHtml).not.toContain("header-resume-button");
    const btn = container.querySelector('[data-testid="header-resume-button"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain("حال ساده");
    // خانه: خطِ «ادامه از» و چیپِ «اخیراً» — هفتمین/ششمیِ درِ حلقه، زنده
    const card = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("ضمیمهٔ کتاب"),
    );
    expect(card).toBeDefined();
    expect(card?.textContent).toContain("ادامه از");
    expect(container.querySelector('[data-testid="home-history-item-phonetics-ʌ"]')).not.toBeNull();
    // آنبوردینگ برایِ برگشتی نباید باز شود (seedِ n:true اعمال شد)
    await act(async () => {});
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    // فرمان‌یابِ اپِ کامل: فرمانِ «ادامهٔ مطالعه» + گروهِ «مسیرهای اخیر» —
    // اتصالِ بندِ ① به بندِ ② در همان درختِ هیدرات‌شده
    await act(async () => {
      fireEvent(window, new CustomEvent("open-command-palette"));
    });
    const opts = Array.from(document.querySelectorAll('[role="option"]'));
    expect(opts.some((o) => o.textContent?.includes("ادامهٔ مطالعه"))).toBe(true);
    expect(opts.some((o) => o.textContent?.includes("/ʌ/ کوتاه آ"))).toBe(true);
    unmount();
  });
});
