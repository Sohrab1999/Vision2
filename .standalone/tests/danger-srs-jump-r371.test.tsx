// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۷۱ — «پرش به پنلِ همسایه» (بندِ ④ پیشنهادِ r370): چیپهایِ
// «در چرخه/سررسید» و چیپِ پلِ کارتِ خطرها از نمایشِ محض به ناوبریِ
// واقعی میرسند — کلیک = اسکرولِ نرم به داشبوردِ مرور + پالسِ گذرا.
//
//   ① چیپِ پل دکمهٔ واقعی است — قراردادِ پرش (aria + حلقهٔ فوکوس + متن)
//   ② چیپِ ردیف دکمهٔ واقعی است — aria با نامِ واژه + رنگِ حالت
//   ③ کلیکِ پل: scrollIntoView رویِ خودِ سکشن (block:start, smooth) +
//     فوکوسِ برنامه‌ای + data-spotlit + حلقهٔ درونیِ زمردی
//   ④ پالس میمیرد — ۱۶۰۰ms بعد خاموش (صفرِ صادق، نه پالسِ دائمی)
//   ⑤ کلیکِ دوباره مهلتِ تایمر را نو میکند (تایمرِ مُهرِدارِ r244)
//   ⑥ صداقتِ نداشتن: بیچرخه = هیچ دکمهٔ پرشی + پاورقیِ نو حاضر
//   ⑦ پرشِ چیپِ ردیف هم واقعی است (سررسید/در چرخه یکسان پرش میکنند)
//   ⑧ reduced-motion = اسکرولِ auto (احترامِ تنظیمِ کاربر)
//   ⑨ قفلهایِ تکمنبع: تابعِ پرش و نامِ رویداد فقط در srs-due؛
//     لنگرِ id فقط در پنل؛ رجیستریِ ۵۲؛ بی transition-all
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DangerWords from "@/components/study/practice/danger-words";
import SrsPanel from "@/components/study/practice/srs-panel";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const matchMediaStub = (matches: boolean) =>
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  matchMediaStub(false);
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    wordMistakes: {},
    wordSeen: {},
    starredWords: [],
    srs: {},
  } as never);
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
});

// دو واژهٔ واجدِ خطر که هر دو داخلِ چرخهٔ مرورند (پلِ «۲ از ۳») + یک
// واژهٔ خطرِ بیرونِ چرخه (صداقتِ نداشتنِ چیپ — میراثِ r370 ادامه دارد)
const NOW = Date.now();
const SEED = {
  wordMistakes: { "1:ability": 2, "1:absolutely": 1, "1:access": 2 },
  wordSeen: { "1:ability": 3, "1:absolutely": 3, "1:access": 3 },
  srs: {
    "1:ability": { level: 0, dueAt: NOW + 14 * 60_000 },
    "1:access": { level: 2, dueAt: NOW + 30 * 60_000 },
  },
};

/** خانهٔ واقعی: داشبوردِ مرور و کارتِ خطر — همسایه‌هایِ یک صفحه */
const renderWorld = (seed: Record<string, unknown> = SEED) => {
  useStudy.setState(seed as never);
  render(
    <>
      <SrsPanel />
      <DangerWords />
    </>
  );
};

describe("چیپهایِ پرش — دکمههایِ واقعی — r371", () => {
  it("① چیپِ پل: دکمهٔ واقعی با ariaِ پرش + حلقهٔ فوکوس + متنِ حسابشده", () => {
    renderWorld();
    const bridge = screen.getByTestId("danger-srs-bridge");
    expect(bridge.tagName).toBe("BUTTON");
    expect(bridge).toHaveAttribute("type", "button");
    expect(bridge.getAttribute("aria-label")).toContain("پرش به داشبوردِ مرور هوشمند");
    expect(bridge.getAttribute("aria-label")).toContain("۲ از ۳");
    // حلقهٔ کیبوردِ واحدِ درها (r239) — Tab-پذیرِ تازهٔ همین خانواده
    expect(bridge.className).toContain("focus-visible:ring-2");
    expect(bridge.textContent).toMatch(/۲ از ۳ در چرخهٔ مرور/);
    // بی transition-all — ترنزیشنِ scopeشده
    expect(bridge.className).not.toContain("transition-all");
  });

  it("② چیپِ ردیف: دکمهٔ واقعی با ariaِ نام‌دار + رنگِ حالتِ خودِ داشبورد", () => {
    renderWorld();
    const ability = screen.getByTestId("danger-srs-chip-ability");
    expect(ability.tagName).toBe("BUTTON");
    expect(ability.getAttribute("aria-label")).toContain("پرش به داشبوردِ مرور هوشمند");
    expect(ability.getAttribute("aria-label")).toContain("وضعیتِ ability");
    expect(ability.className).toContain("bg-amber-50"); // یادگیری
    expect(ability.className).toContain("focus-visible:ring-2");
    const access = screen.getByTestId("danger-srs-chip-access");
    expect(access.tagName).toBe("BUTTON");
    expect(access.getAttribute("aria-label")).toContain("وضعیتِ access");
    // همسایهٔ بیرونِ چرخه چیپ ندارد — نداشتن حرف است (r370)
    expect(screen.queryByTestId("danger-srs-chip-absolutely")).toBeNull();
  });

  it("③ کلیکِ پل: scrollIntoView رویِ خودِ سکشن + فوکوس + پالسِ زمردی", () => {
    renderWorld();
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    expect(panel.id).toBe("srs-dashboard");
    expect(panel.getAttribute("data-spotlit")).toBeNull();
    fireEvent.click(screen.getByTestId("danger-srs-bridge"));
    const spy = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
    expect(spy).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });
    // پرش دقیقاً به خودِ پنل است، نه به یک عنصرِ تصادفی
    expect(spy.mock.contexts).toContain(panel);
    expect(panel.getAttribute("data-spotlit")).toBe("true");
    expect(panel.className).toContain("shadow-[inset_0_0_0_2px]");
    expect(panel.className).toContain("shadow-emerald-300");
    expect(panel.className).toContain("dark:shadow-emerald-600");
    // فوکوسِ برنامه‌ای — صفحه‌خوان همان‌جا میایستد، اسکرول دوگانه نمیسازد
    // (تابعِ پرش preventScroll میفرستد؛ پنل tabIndex=-1 دارد)
    expect(panel.getAttribute("tabindex")).toBe("-1");
  });

  it("④ پالس میمیرد — ۱۶۰۰ms بعد خاموش؛ یک هایلایتِ گذرا نه چراغِ دائمی", () => {
    vi.useFakeTimers();
    renderWorld();
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    fireEvent.click(screen.getByTestId("danger-srs-bridge"));
    expect(panel.getAttribute("data-spotlit")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(1599);
    });
    expect(panel.getAttribute("data-spotlit")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(panel.getAttribute("data-spotlit")).toBeNull();
    expect(panel.className).not.toContain("shadow-emerald-300");
  });

  it("⑤ کلیکِ دوباره مهلت را نو میکند — تایمرِ مُهرِدار (هر درخواست، مهلتِ قبلی را باطل)", () => {
    vi.useFakeTimers();
    renderWorld();
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    const bridge = screen.getByTestId("danger-srs-bridge");
    fireEvent.click(bridge);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    fireEvent.click(bridge); // مهلتِ نو — تایمرِ قبلی باطل
    act(() => {
      vi.advanceTimersByTime(1200); // ۲۴۰۰ از نخستین کلیک گذشته ولی…
    });
    expect(panel.getAttribute("data-spotlit")).toBe("true"); // …هنوز روشن
    act(() => {
      vi.advanceTimersByTime(500); // ۱۷۰۰ از دومین کلیک
    });
    expect(panel.getAttribute("data-spotlit")).toBeNull();
  });

  it("⑥ صداقتِ نداشتن: بیچرخه = هیچ دکمهٔ پرشی + پاورقیِ نو حاضر", () => {
    renderWorld({
      wordMistakes: { "1:ability": 2, "1:absolutely": 1, "1:access": 2 },
      wordSeen: { "1:ability": 3, "1:absolutely": 3, "1:access": 3 },
      srs: {},
    });
    expect(screen.queryByTestId("danger-srs-bridge")).toBeNull();
    expect(document.querySelector('[data-testid^="danger-srs-chip-"]')).toBeNull();
    const card = screen.getByLabelText("واژه‌های خطرناک من");
    // خطِ پاورقی پرش را هم صادقانه میگوید — و از رشتهٔ r370 عاری نیست
    expect(card.textContent).toContain("چیپِ «در چرخه» از داشبوردِ مرورِ هوشمند می‌آید");
    expect(card.textContent).toContain("کلیکش به خودِ داشبورد پرش میزند");
  });

  it("⑦ پرشِ چیپِ ردیف هم واقعی است — در چرخه و سررسید یکسان پرش میکنند", () => {
    renderWorld({
      ...SEED,
      srs: { ...SEED.srs, "1:ability": { level: 0, dueAt: NOW - 60_000 } }, // ability سررسید
    });
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    const chip = screen.getByTestId("danger-srs-chip-ability");
    expect(chip.textContent).toMatch(/سررسید\s*·\s*سطح ۱ از ۶/); // واریانتِ سررسید زنده است
    fireEvent.click(chip);
    const spy = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
    expect(spy.mock.contexts).toContain(panel);
    expect(panel.getAttribute("data-spotlit")).toBe("true");
  });
});

describe("احترامِ حرکتِ کاهشیافته + قفلهایِ تکمنبع — r371", () => {
  it("⑧ reduced-motion = اسکرولِ auto — نرمیِ پرش تنظیمِ کاربر را میخواند", () => {
    matchMediaStub(true);
    renderWorld();
    fireEvent.click(screen.getByTestId("danger-srs-bridge"));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
    matchMediaStub(false); // برگرداندنِ دستی — آزمون‌هایِ بعدی نرم بمانند
  });

  it("⑨ تکمنبع: تابعِ پرش و نامِ رویداد فقط در srs-due؛ لنگر فقط در پنل", () => {
    const due = readFileSync("src/lib/srs-due.ts", "utf8");
    expect(due).toContain('export const SRS_PANEL_SPOTLIGHT_EVENT = "srs-panel-spotlight"');
    expect(due).toContain('document.getElementById("srs-dashboard")');
    expect(due).toContain("(prefers-reduced-motion: reduce)");
    expect(due).toContain("window.dispatchEvent(new CustomEvent(SRS_PANEL_SPOTLIGHT_EVENT))");

    const panelSrc = readFileSync("src/components/study/practice/srs-panel.tsx", "utf8");
    expect(panelSrc).toContain('id="srs-dashboard"');
    expect(panelSrc).toContain("SRS_PANEL_SPOTLIGHT_EVENT");
    expect(panelSrc).toContain("scroll-mt-24");
    expect(panelSrc).toContain("data-spotlit");
    expect(panelSrc).toContain("1600");
    expect(panelSrc).not.toContain("transition-all");

    const dangerSrc = readFileSync("src/components/study/practice/danger-words.tsx", "utf8");
    expect(dangerSrc).toContain("onClick={focusSrsDashboard}");
    // نامِ رویداد در پرنده تکرار نمیشود — پرنده فقط تابعِ کتابخانه را صدا میزند
    expect(dangerSrc).not.toContain('"srs-panel-spotlight"');
    expect(dangerSrc).not.toContain("transition-all");
    expect(dangerSrc).not.toContain("از ۶");

    // هیچ رویدادِ تحلیلیِ نو — رجیستری ۵۲ میماند (پرش، کنشِ یادگیری نیست)
    expect(EVENT_NAMES.length).toBe(52);
  });
});
