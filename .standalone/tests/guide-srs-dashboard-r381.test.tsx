// @vitest-environment jsdom
// ------------------------------------------------------------------
// r381 — «داشبوردِ مرور به کارتِ راهنما میپیوندد» — بندِ ④ِ پیشنهادِ
// r373 (هشت‌راند معطل). قراردادها:
//   • موتورِ تکمنبعِ گیت: hasProgressOf در srs-due (کنارِ پرش و پالسِ
//     داشبورد) — هیچ نسخهٔ موازیِ محلیِ چهارم مجاز نیست (پیشینهٔ r363)
//   • صداقتِ r236: بی‌پیشرفتِ واقعی نه پنل رندر میشود نه ردیفِ راهنما —
//     هیچ پرشِ ساختگی
//   • پرش عینِ dispatchِ پالتِ r372: از نمای دیگر پرچمِ یک‌بارمصرف +
//     ناوبری؛ رویِ خودِ خانه پرشِ فوکوس‌بر بعد از HANDOFF (درسِ r243)
//   • صفرِ رویدادِ تحلیلیِ نو — پرشِ ناوبری، کنشِ یادگیری نیست
//   • صفرِ CSS: c-stone-70ِ همان دیالوگ (نقاشِ تیرهٔ shortcuts-dialog
//     پوشش میدهد) + hoverی همان خانوادهٔ زمردیِ کارت
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { hasProgressOf, peekSrsSpotlight } from "@/lib/srs-due";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const GUIDE_SRC = readFileSync(join(process.cwd(), "src/components/study/shell/shortcut-guide.tsx"), "utf8");
const PALETTE_SRC = readFileSync(join(process.cwd(), "src/components/study/shell/command-palette.tsx"), "utf8");
const HOME_SRC = readFileSync(join(process.cwd(), "src/components/study/home/home-view.tsx"), "utf8");
const DISCOVERY_SRC = readFileSync(join(process.cwd(), "src/components/study/home/home-discovery-journey.tsx"), "utf8");
const ENGINE_SRC = readFileSync(join(process.cwd(), "src/lib/srs-due.ts"), "utf8");

const openGuide = () => {
  render(<ShortcutGuide />);
  act(() => {
    window.dispatchEvent(new CustomEvent("open-shortcuts"));
  });
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
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
    libraryDone: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ------------------------------------------------------------------
// ① قفلهایِ منبع — تکمنبعیِ گیت، قراردادِ پرش، بیرویدادِ نو
// ------------------------------------------------------------------
describe("source locks — r381", () => {
  it("the gate engine is single-source: srs-due exports it, three consumers borrow it, no inline twin remains", () => {
    expect(ENGINE_SRC).toContain("export function hasProgressOf");
    expect(HOME_SRC).toContain("hasProgressOf(known, results, srs, libraryDone)");
    expect(DISCOVERY_SRC).toContain("hasProgressOf(known, results, srs, libraryDone)");
    expect(PALETTE_SRC).toContain("hasProgressOf(known, results, srsMap, libraryDone)");
    expect(GUIDE_SRC).toContain("hasProgressOf(known, results, srsMap, libraryDone)");
    // دوقلوی محلیِ چهارسیگنالی ممنوع — عبارتِ امضای موتور فقط در کتابخانه
    // میماند (تک‌سیگنالیهای دیگر پروندهها محاسباتِ مستقلِ مشروعاند — درسِ
    // این قفل: امضای «تکخطی» بیش از حدّ گسترده است؛ چهارسیگنالی را قفل کن)
    const engineSignature = "Object.values(known ?? {}).some(Boolean) ||";
    expect(ENGINE_SRC).toContain(engineSignature);
    expect(HOME_SRC).not.toContain(engineSignature);
    expect(DISCOVERY_SRC).not.toContain(engineSignature);
    expect(PALETTE_SRC).not.toContain(engineSignature);
    expect(GUIDE_SRC).not.toContain(engineSignature);
  });

  it("the guide's jump borrows the domain library primitives — spotlight flag + focus + handoff, no new jump twin", () => {
    expect(GUIDE_SRC).toContain('import { requestSrsSpotlight, focusSrsDashboard, hasProgressOf } from "@/lib/srs-due";');
    expect(GUIDE_SRC).toContain("requestSrsSpotlight()");
    expect(GUIDE_SRC).toContain("focusSrsDashboard()");
    expect(GUIDE_SRC).toContain("HANDOFF_DELAY_MS"); // یک عدد، یک منبع (r244)
    expect(GUIDE_SRC).toContain('data-testid="shortcut-guide-srs-dashboard"');
    expect(GUIDE_SRC).toContain('data-testid="guide-srs-dashboard-row"');
    expect(GUIDE_SRC).toContain("{hasProgress && ("); // گیتِ صادقِ ردیف
  });

  it("honesty and hygiene: no fake-jump footnote is dropped, no transition-all, no stone-400, zero new analytics", () => {
    expect(GUIDE_SRC).toContain("بی‌پیشرفت داشبوردی نیست که به آن پرید");
    expect(GUIDE_SRC).not.toContain("transition-all");
    expect(GUIDE_SRC).not.toContain("text-stone-400");
    expect(EVENT_NAMES).toHaveLength(52); // رجیستری دستنخورده — پرشِ ناوبری رویداد نیست
    expect(EVENT_NAMES.some((n) => n.includes("guide"))).toBe(false);
    expect(ENGINE_SRC).not.toContain("guide_srs");
  });
});

// ------------------------------------------------------------------
// ② موتورِ خالص — چهار سیگنال، گاردِ بیشاهد
// ------------------------------------------------------------------
describe("hasProgressOf engine", () => {
  it("empty everything ⇒ false — the absolute newcomer gate", () => {
    expect(hasProgressOf({}, {}, {}, {})).toBe(false);
    expect(hasProgressOf(undefined as never, undefined as never, undefined as never, undefined as never)).toBe(false);
  });

  it("each of the four real signals alone opens the gate", () => {
    expect(hasProgressOf({ "1-0": true }, {}, {}, {})).toBe(true); // بلدم
    expect(hasProgressOf({}, { "1-0": {} }, {}, {})).toBe(true); // آزمون
    expect(hasProgressOf({}, {}, { "1-0": {} }, {})).toBe(true); // srs
    expect(hasProgressOf({}, {}, {}, { "s-1": {} })).toBe(true); // کتابخانه
  });

  it("known=false values are NOT progress — only true values count (the home-view semantics)", () => {
    expect(hasProgressOf({ "1-0": false, "1-1": false }, {}, {}, {})).toBe(false);
    expect(hasProgressOf({ "1-0": false, "1-1": true }, {}, {}, {})).toBe(true);
  });
});

// ------------------------------------------------------------------
// ③ نما — گیتِ صادق + پرشِ واقعی از دو دنیا
// ------------------------------------------------------------------
describe("guide SRS-dashboard row", () => {
  it("a newcomer with no progress sees NO dashboard section — no fake jump (r236)", () => {
    openGuide();
    expect(screen.queryByTestId("shortcut-guide-srs-dashboard")).toBeNull();
    expect(screen.queryByTestId("guide-srs-dashboard-row")).toBeNull();
  });

  it("a learner with real progress sees the section with the honest footnote", () => {
    useStudy.setState({ srs: { "1-0": { level: 1, dueAt: Date.now() + 60_000 } } } as Partial<ReturnType<typeof useStudy.getState>>);
    openGuide();
    const section = screen.getByTestId("shortcut-guide-srs-dashboard");
    expect(screen.getByTestId("guide-srs-dashboard-row")).toBeInTheDocument();
    expect(section).toHaveTextContent("داشبورد مرور هوشمند");
    expect(section).toHaveTextContent("بی‌رکورد، هیچ");
  });

  it("clicking on home schedules the focus jump after the handoff — no panel in jsdom ⇒ graceful false, flag untouched", async () => {
    useStudy.setState({
      view: { type: "home" },
      srs: { "1-0": { level: 1, dueAt: Date.now() + 60_000 } },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    openGuide();
    // پرچمِ ماژولِ srs-due stateی بینِ تستهاست — گاردِ خطِ پایه: شاخهٔ خانه
    // پرچم را «تغییر» نمیدهد (این تست نخستِ خانواده است تا خطِ پایه صفر باشد)
    const baseline = peekSrsSpotlight();
    act(() => {
      fireEvent.click(screen.getByTestId("guide-srs-dashboard-row"));
    });
    // دیالوگ بسته شد؛ پرشِ فوکوس‌بر در دورهٔ تحویل (r243) زمان‌بندی شد
    await new Promise((r) => setTimeout(r, 350)); // HANDOFF_DELAY_MS = ۲۶۰ms
    expect(useStudy.getState().view).toEqual({ type: "home" }); // خانه میماند
    expect(peekSrsSpotlight()).toBe(baseline); // شاخهٔ خانه پرچم نمیگذارد — پرچم مالِ پرشِ بین‌نظری است
  });

  it("clicking from a non-home view sets the one-shot spotlight flag and navigates home — the r372 palette idiom", () => {
    useStudy.setState({
      view: { type: "dictionary" },
      srs: { "1-0": { level: 1, dueAt: Date.now() + 60_000 } },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    openGuide();
    act(() => {
      fireEvent.click(screen.getByTestId("guide-srs-dashboard-row"));
    });
    expect(useStudy.getState().view).toEqual({ type: "home" });
    expect(peekSrsSpotlight()).toBe(true); // پرچم زنده — srs-panel بعد از mount مصرفش میکند
  });
});
