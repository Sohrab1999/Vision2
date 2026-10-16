// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۲ — بندِ ① پیشنهادِ ۲۴۱: هیدریشنِ «بازدیدِ عمیق» — نماها هم
// نگهبانِ هیدریشن دارند. تا r241 هارنسِ سه‌کاناله فقط خانه و درهایِ هدر را
// هیدرات می‌کرد؛ این فایل دو نمایِ عمیق را با viewِ seedشده همان مسیرِ
// Next می‌برد: renderToString با windowِ خداحذفی (SSRِ صادقانه) → تزریقِ
// HTML → hydrateRoot در act → شنودِ سه‌کاناله (console.error + throw +
// رویدادِ error پنجره).
//
// «مدیریتِ next/dynamic با resolveِ صریح» (عینِ پیشنهادِ ۲۴۱): نماها
// lazy-chunkهای ssr:false هستند — بعد از هیدریشن، actهایِ پیاپی زنجیرهٔ
// import() را flush می‌کنند و منتظرِ رسیدنِ متنِ لنگر می‌مانیم (waitFor
// دستی رویِ act — نه تایمرِ واقعی، نه فرار از act).
//
// view در persist نیست (فقط دادهٔ یادگیری) — پس seed با setStateِ مستقیمِ
// استور قبل از SSR انجام می‌شود؛ HTMLِ سرور در هر دو حالت فقط پوسته +
// اسپینر می‌دهد (درِ hydrated=false) و هیچ لنگرِ نما در آن نیست.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import type { ReactElement } from "react";
import { ThemeProvider } from "@/components/study/shell/theme-provider";
import StudyApp from "@/components/study/study-app";
import { useStudy } from "@/lib/study-store";
import { writeAppendixResume, type AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  trackEventOncePerSession: vi.fn(),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const phonRec: AppendixResumeItem = { scope: "phonetics", id: "ʌ", title: "/ʌ/ کوتاه آ", hint: "cup — love" };

const fetchMock = vi.fn(async () => ({
  ok: true,
  json: async () => ({ total: 0, avgPercent: 0, last24h: 0, recent: [] }),
}));

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
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
  // استور به نقطهٔ شروعِ خنثی برگردد (view در persist نیست ولی ماژولِ
  // استور بینِ تست‌ها مشترک است)
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    flashIntent: "none",
    onboarded: true,
  } as Partial<ReturnType<typeof useStudy.getState>>);
});

/** همان مسیرِ SSR → هیدریشنِ Next برایِ اپِ کامل — کپیِ هارنسِ r241. */
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
    await act(async () => {});
  } catch (e) {
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

/** resolveِ صریحِ lazy-chunk (درسِ این راند): زنجیرهٔ import() در vitest
 *  برایِ تَرحَلِ ماژول‌گراف به «چرخشِ ماکروتسک» واقعی نیاز دارد — حلقهٔ
 *  خالصِ act فقط میکروتسک flush می‌کند و loader را تا ابد گرسنه نگه
 *  می‌دارد (۴۰ تیک هم کافی نبود). پس هر تیک = setTimeoutِ کوتاه (راه
 *  دادنِ event loop به Vite) + act (flushِ کارِ React). */
async function waitForAnchor(container: HTMLElement, text: string, maxTicks = 60): Promise<void> {
  let seen = "";
  for (let i = 0; i < maxTicks; i++) {
    await new Promise((r) => setTimeout(r, 20));
    await act(async () => {});
    seen = container.textContent ?? "";
    if (seen.includes(text)) return;
  }
  throw new Error(`لنگرِ «${text}» بعد از ${maxTicks} تیکِ act نرسید — آخرینِ متن: ${seen.slice(0, 400)}`);
}

const hydrationNoise = (errors: string[]) =>
  errors.filter((e) => /getServerSnapshot|hydrat|did not match|should be cached/i.test(e));

describe("هیدریشنِ بازدیدِ عمیق — نماها با viewِ seedشده (r242)", () => {
  it("① نمایِ درس (id=1): سرور فقط اسپینر، بعد از هیدریشن سرِ درس + هشت تب + فهرستِ پرشِ r232 — صفرِ هشدار", async () => {
    useStudy.setState({ view: { type: "lesson", id: 1 } } as Partial<ReturnType<typeof useStudy.getState>>);
    const { container, errors, serverHtml, unmount } = await hydrateAppForTest(
      <ThemeProvider>
        <StudyApp />
      </ThemeProvider>,
    );
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    // SSR صادقانه: پوسته هست، هیچی از نمایِ درس نیست (lazy + hydrated=false)
    expect(serverHtml).toContain("در حال باز کردن کتاب");
    expect(serverHtml).not.toContain("Understanding People");
    // بعد از هیدریشن + resolveِ صریحِ chunk: سرِ درس زنده است
    await waitForAnchor(container, "Understanding People");
    expect(container.textContent).toContain("درس اول — پایهٔ یازدهم");
    // هشت تبِ درسِ یازدهم همه حاضرند
    for (const tab of ["واژگان", "مکالمه", "ریدینگ", "گرامر", "نگارش", "دیکته", "تست‌ها", "مترادف و متضاد"]) {
      expect(container.textContent, `تبِ ${tab}`).toContain(tab);
    }
    // فهرستِ پرشِ r232 (تازه‌ترین لایهٔ درس) در همان درختِ هیدرات‌شده سالم است
    const jumpBtn = container.querySelector('button[aria-controls="lesson-jump-index"]');
    expect(jumpBtn).not.toBeNull();
    expect(jumpBtn?.getAttribute("aria-expanded")).toBe("false");
    expect(jumpBtn?.textContent).toContain("فهرست درس‌ها");
    unmount();
  });

  it("② نمایِ ضمیمه با لنگرِ عمیقِ واک (phonemeId=ʌ): فرودِ مستقیم رویِ زیرتبِ تلفظ + کارتِ واک + خوشهٔ «ادامه» با چیپِ رکورد — صفرِ هشدار", async () => {
    // رکوردِ «ادامه» با scopeی متفاوت از لنگر — خوشهٔ r239 باید با چیپش حاضر باشد
    writeAppendixResume(phonRec);
    useStudy.setState({
      view: { type: "appendix", phonemeId: "ʌ" },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const { container, errors, serverHtml, unmount } = await hydrateAppForTest(
      <ThemeProvider>
        <StudyApp />
      </ThemeProvider>,
    );
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    expect(serverHtml).not.toContain("ضمیمهٔ کتاب");
    await waitForAnchor(container, "ضمیمهٔ کتاب");
    // لنگرِ عمیق: زیرتبِ phonetics فعال است (نه grammarِ پیش‌فرض) — زیرتاب‌ها
    // دکمه‌هایِ ساده‌اند؛ فعالِ وایلتِ توپُر شناخته می‌شود
    const activeTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.className.includes("bg-violet-600"),
    );
    expect(activeTab?.textContent).toContain("جدول تلفظ");
    // کارتِ واکِ /ʌ/ با همان شناسهٔ لنگر رندر شد
    expect(container.querySelector('#ph-ʌ')).not.toBeNull();
    // خوشهٔ «ادامهٔ مطالعه» سرِ ضمیمه (r239) با رکوردِ زنده + چیپِ اخیر
    expect(container.querySelector('[data-testid="appendix-resume-cluster"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="appendix-resume-pill"]')?.textContent).toContain("/ʌ/ کوتاه آ");
    unmount();
  });

  it("③ سرور هرگز HTMLِ نما را نمی‌دهد حتی با viewِ seedشده — هیدریشنِ دو نما بدونِ هیچ mismatchِ درخت", async () => {
    useStudy.setState({ view: { type: "lesson", id: 7 } } as Partial<ReturnType<typeof useStudy.getState>>);
    const { serverHtml, errors, unmount } = await hydrateAppForTest(
      <ThemeProvider>
        <StudyApp />
      </ThemeProvider>,
    );
    // dهم (id=7) چیزی در HTMLِ سرور نگذاشته — نه عنوانِ درس، نه تب
    expect(serverHtml).not.toContain("درس ۷");
    expect(serverHtml).toContain("در حال باز کردن کتاب");
    expect(hydrationNoise(errors)).toHaveLength(0);
    expect(errors).toHaveLength(0);
    unmount();
  });
});
