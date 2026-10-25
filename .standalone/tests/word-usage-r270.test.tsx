// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۰ — دو بندِ نو از دلِ QAِ همین راند:
//
//   ① بارِ فشردهٔ موبایل — در ۳۹۰px چیپ‌هایِ نوارِ چسبانِ r269 به ۴ ردیف
//      پیچیده و نوار ۱۶۱px می‌شد (یک‌پنجمِ ویوپورت فقط کنترل!). زیرِ sm
//      نوار یک ردیفِ افقیِ سوایپ‌شدنی می‌گیرد: flex-nowrap + overflow-x-auto
//      + scrollbar-none (کلاسِ نوِ globals.css). دسکتاپ دست‌نخورده: wrap
//      برایِ ≥sm می‌ماند — جفتِ واکنش‌گرا در همان classNameِ قفل‌شدهٔ r269
//      (افزودنِ در انتها؛ همهٔ قطعه‌هایِ قدیمی پیوسته می‌مانند).
//      پیش‌شمارشِ r270: ۵۵۰ واژه نوارِ لنز-آزاد دارند؛ هر ۱۵۳ واژهٔ
//      گشاینده‌دار هم نوار دارند — بیشترین سودِ فشردگی دقیقاً جایی است که
//      دیوارِ کارت هست.
//   ② tooltipِ هم-لنزِ گشاینده — زیرِ لنز، tooltip می‌گوید چه چیزی گشوده
//      می‌شود: «کلیک: نمایشِ همهٔ ۱۱ کاربردِ ریدینگ در جزوه» — از
//      activeKindLabel تک‌منبعِ r264. متنِ مرئیِ جمع‌شده («+ N موردِ دیگر
//      در جزوه») قفلِ r264 دست‌نخورده — آموزش فقط در tooltip؛ بی-لنز هم
//      بایت‌به‌بایت «... کاربردِ جزوه» (قفلِ toBeِ r268).
//
// لنگرهایِ پیش‌شمارشِ r270 (scripts/precount-r270.ts):
//   change: ریدینگ ۱۱ → «...۱۱ کاربردِ ریدینگ در جزوه» · مکالمه ۲ (بی-گشاینده)
//   of: ۹۱ سایت — ریدینگ ۷۱ · مکالمه ۲۰ (هر دو لنزِ گشاینده‌دار!)
//   ۵۵۰ نواردار · ۴۷۴ لنزپذیر · ۱۵۳ گشاینده‌دار (همه نواردار هم‌اند)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const CHANGE = findWordUsages("change");
expect(CHANGE.length).toBe(13);
const READING = CHANGE.filter((s) => s.kind === "reading");
expect(READING.length).toBe(11);
// «of» — تنها واژه‌ای که در هر دو نوع گشاینده دارد (پیش‌شمارشِ r270)
const OF = findWordUsages("of");
expect(OF.length).toBe(91);
const OF_READING = OF.filter((s) => s.kind === "reading");
expect(OF_READING.length).toBe(71);
const OF_CONV = OF.filter((s) => s.kind === "conversation");
expect(OF_CONV.length).toBe(20);

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

const barOf = () => document.querySelector("[data-testid=usage-lessons-bar]") as HTMLElement;
const moreOf = () => document.querySelector("[data-testid=usage-more]") as HTMLButtonElement;

const dlgSrc = readFileSync(
  join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
  "utf8"
);
const cssSrc = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

// ------------------------------------------------------------------
describe("بارِ فشردهٔ موبایل (r270 ①)", () => {
  it("نوار: جفتِ واکنش‌گرا در همان className — wrap برایِ ≥sm، nowrap+overflow-x برایِ max-sm", () => {
    renderDialog("change");
    const bar = barOf();
    // دسکتاپ دست‌نخورده — قطعه‌هایِ r269
    expect(bar.className).toContain("sticky top-0");
    expect(bar.className).toContain("flex flex-wrap items-center gap-1.5");
    expect(bar.className).toContain("bg-stone-50");
    expect(bar.className).toContain("dark:bg-stone-800");
    // فشردهٔ موبایل — سه قطعهٔ نوِ r270
    expect(bar.className).toContain("max-sm:flex-nowrap");
    expect(bar.className).toContain("max-sm:overflow-x-auto");
    expect(bar.className).toContain("max-sm:scrollbar-none");
  });

  it("بدونِ z و بدونِ /60 — قفل‌هایِ چیدمانیِ r269 زیرِ پسوندِ نو زنده می‌مانند", () => {
    renderDialog("change");
    const bar = barOf();
    expect(bar.className).not.toMatch(/z-\d/);
    expect(bar.className).not.toContain("stone-800/60");
    // والدِ نوار همان wrapperِ سفرِ sticky است (نه خودِ دیالوگ)
    expect(bar.parentElement!.className).toContain("flex flex-col gap-4");
  });

  it("قفلِ منبع: classNameِ کاملِ گسترش‌یافته + scrollbar-none فقط رویِ نوار + utility در globals.css", () => {
    // رشتهٔ کامل — افزوده در انتها، همهٔ قطعه‌هایِ r269 پیوسته
    expect(dlgSrc).toContain(
      'className="sticky top-0 flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:scrollbar-none"'
    );
    // wrapperِ سفرِ sticky حالا min-w-0 دارد — بدونِ آن min-contentِ نوارِ
    // nowrap به trackِ gridِ دیالوگ نشت می‌کند و track به ۴۸۰px می‌رود
    // (اندازه‌گیریِ زندهٔ r270: dlgW=۳۹۰ ولی track=۴۸۰)
    expect(dlgSrc).toContain('<div className="flex flex-col gap-4 min-w-0">');
    // هر فرزندِ مستقیمِ نوار shrink-0 و whitespace-nowrap دارد — سرریز به
    // اسکرولِ افقی می‌رود نه له‌شدنِ متنِ رهبر (اندازه‌گیریِ زنده: barH
    // با له‌شدگی ۱۱۳px، با shrink-0 دقیقاً ۳۹pxِ تک-ردیف) — ۶ جا: برچسب +
    // رهبر + دو شاخهٔ clsِ چیپِ درس + دو شاخهٔ چیپِ نوع
    expect(dlgSrc.match(/shrink-0 whitespace-nowrap/g)?.length).toBe(6);
    // ده max-sm — سه‌تایِ r270 رویِ نوار + هفت‌تایِ r271 (orderها و hidden)
    expect(dlgSrc.match(/max-sm:/g)?.length).toBe(10);
    // دیالوگ اسکرولِ عمودیِ خودش را دارد (r252) — افقی نمی‌شود
    expect(dlgSrc).toContain("overflow-y-auto nice-scroll");
    // utilityِ نو در globals.css — بی-نوار، فقط برایِ همین نوار
    expect(cssSrc).toContain(".scrollbar-none {");
    expect(cssSrc).toContain("scrollbar-width: none;");
    expect(cssSrc).toContain(".scrollbar-none::-webkit-scrollbar {");
    expect(cssSrc).toContain("display: none;");
  });
});

// ------------------------------------------------------------------
describe("tooltipِ هم-لنزِ گشاینده (r270 ②)", () => {
  it("بی-لنز: tooltipِ r268 بایت‌به‌بایت — «کلیک: نمایشِ همهٔ ۱۳ کاربردِ جزوه»", () => {
    renderDialog("change");
    expect(moreOf().getAttribute("title")).toBe(
      `کلیک: نمایشِ همهٔ ${faNum(CHANGE.length)} کاربردِ جزوه`
    );
  });

  it("زیرِ لنزِ ریدینگِ change: «کلیک: نمایشِ همهٔ ۱۱ کاربردِ ریدینگ در جزوه» — از activeKindLabel", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(moreOf().getAttribute("title")).toBe(
      `کلیک: نمایشِ همهٔ ${faNum(READING.length)} کاربردِ ریدینگ در جزوه`
    );
    // متنِ مرئیِ جمع‌شده هرگز نوع را نمی‌گیرد — قفلِ مرئیِ r264 فقط «در جزوه»
    expect(moreOf().textContent).not.toContain("ریدینگ");
    expect(moreOf().textContent).toContain(`+ ${faNum(READING.length - 8)} موردِ دیگر`);
  });

  it("زیرِ لنزِ مکالمهٔ of: گشایندهٔ ۲۰تایی — «کلیک: نمایشِ همهٔ ۲۰ کاربردِ مکالمه در جزوه»", () => {
    renderDialog("of");
    expect(moreOf()).toBeTruthy();
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    // ۲۰ سایتِ مکالمه > ۸ → گشاینده زیرِ لنز هم زنده است
    expect(moreOf()).toBeTruthy();
    expect(moreOf().getAttribute("title")).toBe(
      `کلیک: نمایشِ همهٔ ${faNum(OF_CONV.length)} کاربردِ مکالمه در جزوه`
    );
    // گشودن: ۲۰ کارتِ مکالمه و tooltipِ حالتِ باز بدونِ نوع — همان بازگشتِ فشرده
    act(() => {
      fireEvent.click(moreOf());
    });
    expect(document.querySelectorAll("[data-testid=usage-site]").length).toBe(20);
    expect(moreOf().getAttribute("title")).toBe("کلیک: بازگشت به فهرستِ فشرده");
  });

  it("قفلِ منبع: دو شاخهٔ tooltip از دو تک‌منبع — بی-لنز «کاربردِ جزوه»، لنزی «کاربردِ ${activeKindLabel} در جزوه»", () => {
    // شاخهٔ بی-لنز — همان رشتهٔ پیوستهٔ r268
    expect(dlgSrc).toContain(
      "`کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ جزوه`"
    );
    // شاخهٔ لنزی — نوع از activeKindLabel (تک‌منبعِ برچسبِ نوعِ r264)
    expect(dlgSrc).toContain(
      "`کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel} در جزوه`"
    );
    // شرطِ شاخه از kindFilter است — نه رشتهٔ منجمد
    expect(dlgSrc).toContain("kindFilter && activeKindLabel");
  });
});

// ------------------------------------------------------------------
describe("فضای نامِ a11y و بی-رگرسیون (r270 ③)", () => {
  it("گشاینده همچنان بی-aria-label — نامِ دسترس‌پذیر از متنِ مرئی (WCAG 2.5.3)", () => {
    renderDialog("change");
    expect(moreOf().getAttribute("aria-label")).toBeNull();
    cleanup();
    renderDialog("of");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(moreOf().getAttribute("aria-label")).toBeNull();
  });

  it("فضای نامِ a11yِ خانواده: هیچ خطِ aria-labelی «جزوه» یا «کاربرددار» نمی‌گیرد", () => {
    const lines = dlgSrc.split("\n");
    for (const l of lines) {
      if (l.includes("aria-label")) {
        expect(l).not.toContain("جزوه");
        expect(l).not.toContain("کاربرددار");
      }
    }
  });

  it("بازگشتِ اسکرولِ r269 دست‌نخورده — تعویضِ لنز scrollTop را صفر می‌کند (منبع)", () => {
    expect(dlgSrc).toContain("scroller.scrollTop = 0");
    expect(dlgSrc).toContain("}, [showAll, kindFilter]);");
    expect(dlgSrc).toContain("const prevShowAll = useRef(showAll);");
  });
});
