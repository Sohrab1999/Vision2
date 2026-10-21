// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۹ — نوارِ چسبانِ پراکندگی + بازگشتِ اسکرولِ صادقانه
//
//   ① در دیوارِ بلندِ گشاینده («of» با ۹۱ کارت — پیش‌شمارشِ r268)، نوارِ
//      پراکندگی با اسکرول گم می‌شد و کنترل‌هایِ لنز از دسترس خارج. حالا
//      sticky top-0 است — با دو نکتهٔ چیدمانی: DialogContent یک grid است و
//      در grid محدودهٔ سفرِ sticky همان grid-areaِ آیتم است (سفرِ صفر) —
//      پس نوار و فهرست در یک wrapperِ بلند زندگی می‌کنند؛ و بدونِ z-10 —
//      نوارِ positioned بالایِ کارت‌هایِ غیر-positioned می‌نشیند و دکمهٔ
//      بستنِ absolute (بعد در DOM) بالایِ نوار می‌ماند. bg هم opaque شد —
//      در dark حالتِ /60 کارت‌هایِ ردشده را نشان می‌داد.
//   ② فروپاشیِ گشاینده و تعویضِ لنز کاربر را نیمه‌راه (یا تهِ فهرستِ
//      کوتاه‌شده) رها می‌کردند — حالا scrollTop به صفر برمی‌گردد: ایدئومِ
//      «بازگشتِ کاملِ» r260 حالا اسکرول را هم در بر می‌گیرد. گشودن هرگز
//      نمی‌کشد و mount هم نه.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

const CHANGE = findWordUsages("change");
expect(CHANGE.length).toBe(13);

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    wordMistakes: {},
    wordSeen: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
  });
});

const renderDialog = (en: string) =>
  render(<WordUsageDialog target={{ en, sites: findWordUsages(en) }} onClose={vi.fn()} />);

/** جاسوسیِ scrollTop رویِ خودِ ظرفِ اسکرولِ دیالوگ (پورتالِ Radix) */
const spyScroll = () => {
  const dlg = screen.getByTestId("usage-dialog") as HTMLElement;
  const sets: number[] = [];
  Object.defineProperty(dlg, "scrollTop", {
    get: () => 1234,
    set: (v: number) => sets.push(v),
    configurable: true,
  });
  return sets;
};

// ------------------------------------------------------------------
describe("نوارِ چسبانِ پراکندگی (r269 ①)", () => {
  it("نوار sticky top-0 است، bgِ opaque دارد و درونِ wrapperِ بلندِ سفر زندگی می‌کند", () => {
    renderDialog("change");
    const bar = screen.getByTestId("usage-lessons-bar") as HTMLElement;
    expect(bar.className).toContain("sticky top-0");
    expect(bar.className).toContain("bg-stone-50");
    expect(bar.className).toContain("dark:bg-stone-800");
    // نیمه‌شفافیِ کهنه — کارت‌هایِ ردشده از زیرش پیدا می‌شدند
    expect(bar.className).not.toContain("stone-800/60");
    // نوار مستقیمِ فرزندِ دیالوگ نیست — درونِ wrapperِ سفرِ sticky است
    const dlg = screen.getByTestId("usage-dialog") as HTMLElement;
    expect(bar.parentElement).not.toBe(dlg);
    expect(bar.parentElement!.className).toContain("flex flex-col gap-4");
    // فهرست و گشاینده هم در همان wrapper‌اند — همه‌جا دستِ نوار
    expect(bar.parentElement!.querySelector("ul")).not.toBeNull();
    expect(bar.parentElement!.querySelector('[data-testid="usage-more"]')).not.toBeNull();
  });

  it("بدونِ z-10: دکمهٔ بستن همچنان در دسترس است — بالایِ نوارِ چسبان می‌ماند (ترتیبِ DOM)", () => {
    // دیالوگِ مستقیم، controlled است (open={!!target}) — بستن یعنی
    // فراخوانیِ onClose، نه ناپدیدشدن (الگویِ همان r252 که فقط کلیک می‌کند)
    const onClose = vi.fn();
    render(
      <WordUsageDialog target={{ en: "change", sites: findWordUsages("change") }} onClose={onClose} />
    );
    const bar = screen.getByTestId("usage-lessons-bar");
    expect(bar.className).not.toMatch(/z-\d/);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("تک-درسه (ability): نه نوار دارد نه wrapperِ آسیب‌دیده — کارت‌ها سرِ جایشان", () => {
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-bar")).toBeNull();
    const dlg = screen.getByTestId("usage-dialog") as HTMLElement;
    expect(dlg.querySelectorAll("[data-testid=usage-site]").length).toBe(1);
  });
});

// ------------------------------------------------------------------
describe("بازگشتِ اسکرولِ صادقانه (r269 ②)", () => {
  it("فروپاشیِ گشاینده scrollTop را صفر می‌کند — از دلِ دیوارِ بلند به بالایِ دیالوگ", () => {
    renderDialog("change");
    const sets = spyScroll();
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more")); // گشودن
    });
    expect(sets).toEqual([]); // گشودن هرگز نمی‌کشد
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more")); // فروپاشی
    });
    expect(sets).toEqual([0]);
  });

  it("تعویضِ لنز (روشن/خاموش/متقابل) هر بار به بالایِ فهرست برمی‌گرداند", () => {
    renderDialog("change");
    const sets = spyScroll();
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(sets).toEqual([0]);
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation")); // متقابل
    });
    expect(sets).toEqual([0, 0]);
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation")); // خاموشی
    });
    expect(sets).toEqual([0, 0, 0]);
  });

  it("mount و گشودنِ خالص هیچ اسکرولی نمی‌کشند — prevها از stateهایِ اولیه آغاز می‌شوند", () => {
    renderDialog("change");
    const sets = spyScroll();
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    // فقط لنز — گشودن سهمی ندارد
    expect(sets).toEqual([0]);
    // و تعویضِ واژه (remount با key) اسکرولِSpyِ قبلی را تکرار نمی‌کند
    const sets2 = spyScroll();
    expect(sets2).toEqual([]);
  });
});

// ------------------------------------------------------------------
describe("قفل‌هایِ سطحِ منبع (r269)", () => {
  const dlgSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
    "utf8"
  );

  it("نوار: sticky top-0 بدونِ z — wrapperِ سفرِ sticky حاضر است", () => {
    expect(dlgSrc).toContain(
      'className="sticky top-0 flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800"'
    );
    expect(dlgSrc).toContain('<div className="flex flex-col gap-4">');
    expect(dlgSrc).not.toContain("sticky top-0 z-");
    // نیمه‌شفافیِ کهنه در کلِ فایل نمی‌ماند — نوار opaque است
    expect(dlgSrc).not.toContain('dark:bg-stone-800/60"');
  });

  it("بازگشتِ اسکرول: از refِ فهرست به ظرفِ دیالوگ، با scrollTop و prevهایِ mount-آگاه", () => {
    expect(dlgSrc).toContain("listRef.current?.closest");
    expect(dlgSrc).toContain('[data-testid="usage-dialog"]');
    expect(dlgSrc).toContain("scroller.scrollTop = 0");
    expect(dlgSrc).toContain("}, [showAll, kindFilter]);");
    expect(dlgSrc).toContain("const prevShowAll = useRef(showAll);");
    expect(dlgSrc).toContain("const prevKind = useRef<KindFilter>(null);");
  });

  it("راندهایِ پیش دست‌نخورده: متنِ گشایندهٔ r268، نشانِ درس، و فضای نامِ a11y", () => {
    // قفل‌هایِ r268 — بایت‌به‌بایت
    expect(dlgSrc).toContain("(showAll ? visibleSites : visibleSites.slice(0, 8))");
    expect(dlgSrc).toContain("aria-expanded={showAll}");
    expect(dlgSrc).toContain("+ ${faNum(visibleSites.length - 8)} موردِ دیگر در جزوه");
    expect(dlgSrc).toContain("این کاربرد از واژگانِ درسِ ${faNum(s.lessonId)} است");
    // فضای نامِ a11yِ خانواده (r253/r267/r268)
    const ariaLines = dlgSrc.split("\n").filter((l) => l.includes("aria-label"));
    expect(ariaLines.length).toBeGreaterThan(0);
    for (const l of ariaLines) {
      expect(l).not.toContain("کاربرددار");
      expect(l).not.toMatch(/جزوه/);
    }
  });
});
