// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۱ — دو بندِ نو از دلِ QAِ این راند:
//
//   ① سرفِ لنز در ردیفِ موبایل — در ردیفِ تک-ردیفیِ r270، چیپ‌هایِ لنز
//      (تنها کنترل‌هایِ واقعیِ نوار) تهِ ۹۷۸px بودند؛ نخستین تعویضِ لنز یک
//      سوایپِ کامل می‌خواست — وعدهٔ r269 («کنترل‌ها همیشه در دسترس») در
//      اولین رنگِ موبایل نیمه‌مانده بود. orderهایِ واکنش‌گرا (فقط max-sm)
//      ترتیبِ بصری را می‌چینند: لنز (۱) ← چیپ‌هایِ درس (۲) ← برچسب و رهبر
//      (۳). DOM/tab/testidها دست‌نخورده؛ جداکنندهٔ تزئینی max-sm:hidden.
//      پیش‌شمارشِ r271: ۴۷۴ واژه نوارِ لنزدار دارند — همه سود می‌برند.
//   ② مقیاسِ هم-لنزِ تیتر — زیرِ لنز، تیتر تنها عنصرِ بی-مقیاسِ دیالوگ
//      بود: فهرست ۷۱ کارت می‌داد و تیتر می‌گفت «۹۱ کاربرد». حالا مثلِ
//      چیپ‌هایِ r267 خودش مخرج می‌گیرد: «در جزوه · ۷۱ کاربردِ ریدینگ از ۹۱»
//      — شاخهٔ بی-لنز بایت‌به‌بایتِ قبلی (قفلِ r255: «در جزوه · ۶ کاربرد»).
//
// لنگرهایِ پیش‌شمارشِ r271 (scripts/precount-r271.ts):
//   amaze: کل ۶ (ریدینگ ۳ + مکالمه ۳) — لنگرِ r255
//   change: کل ۱۳ → ریدینگ «۱۱ کاربردِ ریدینگ از ۱۳» · مکالمه «۲ از ۱۳»
//   of: کل ۹۱ → ریدینگ «۷۱ از ۹۱» · مکالمه «۲۰ از ۹۱»
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
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const CHANGE = findWordUsages("change");
expect(CHANGE.length).toBe(13);
const READING = CHANGE.filter((s) => s.kind === "reading");
expect(READING.length).toBe(11);
const AMAZE = findWordUsages("amaze");
expect(AMAZE.length).toBe(6);
const OF = findWordUsages("of");
expect(OF.length).toBe(91);
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

const dlgSrc = readFileSync(
  join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
  "utf8"
);

// ------------------------------------------------------------------
describe("سرفِ لنز در ردیفِ موبایل (r271 ①)", () => {
  it("ترتیبِ واکنش‌گرا رویِ عناصر: چیپ‌هایِ لنز order-1، چیپ‌هایِ درس order-2، برچسب/رهبر order-3", () => {
    renderDialog("change");
    const bar = barOf();
    // چیپ‌هایِ نوع — کنترل‌ها اول
    const kindChip = bar.querySelector("[data-testid=usage-kind-chip-reading]") as HTMLElement;
    expect(kindChip.className).toContain("max-sm:order-1");
    // چیپ‌هایِ درس — داده بعد از کنترل
    const lessonChip = bar.querySelector("[data-testid=usage-lesson-chip-5]") as HTMLElement;
    expect(lessonChip.className).toContain("max-sm:order-2");
    // برچسب و رهبر — اطلاعاتی در انتها
    const leader = bar.querySelector("[data-testid=usage-lessons-leader]") as HTMLElement;
    expect(leader.className).toContain("max-sm:order-3");
    // جداکنندهٔ تزئینی در موبایل پنهان
    const divider = [...bar.querySelectorAll("span[aria-hidden]")].find((s) =>
      s.className.includes("w-px")
    );
    expect(divider).toBeTruthy();
    expect(divider!.className).toContain("max-sm:hidden");
  });

  it("قفلِ منبع: شمارِ ۱۰ max-sm + ترتیبِ عددیِ orderها ۱<۲<۳ + دسکتاپ بی-order", () => {
    // ۳ رویِ خودِ نوار (r270) + hiddenِ جداکننده + ۲ order-1 + ۲ order-2 + ۲ order-3
    expect(dlgSrc.match(/max-sm:/g)?.length).toBe(10);
    // ترتیبِ کنترل-نخست در خودِ منبع ثبت است — مجموعهٔ orderها دقیقاً {۱،۲،۳}
    // (موقعیتِ متنِ منبع مهم نیست؛ ترتیبِ عددیِ CSS است که معنا دارد)
    expect(dlgSrc).toContain("max-sm:order-1");
    expect(dlgSrc).toContain("max-sm:order-2");
    expect(dlgSrc).toContain("max-sm:order-3");
    const orders = new Set(
      [...dlgSrc.matchAll(/max-sm:order-(\d)/g)].map((m) => Number(m[1]))
    );
    expect([...orders].sort()).toEqual([1, 2, 3]);
    // دسکتاپ دست‌نخورده — wrap می‌ماند و هیچ orderِ بی-max-sm اضافه نشده
    expect(dlgSrc).toContain("flex flex-wrap items-center gap-1.5");
    expect(dlgSrc.replace(/max-sm:order-\d/g, "")).not.toContain("order-1");
  });

  it("قفلِ r270 و r269 دست‌نخورده — رشتهٔ کاملِ نوار و min-w-0 و shrink-0ها", () => {
    expect(dlgSrc).toContain(
      'className="sticky top-0 flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:scrollbar-none"'
    );
    expect(dlgSrc).toContain('<div className="flex flex-col gap-4 min-w-0">');
    expect(dlgSrc.match(/shrink-0 whitespace-nowrap/g)?.length).toBe(6);
  });
});

// ------------------------------------------------------------------
describe("مقیاسِ هم-لنزِ تیتر (r271 ②)", () => {
  it("بی-لنز: تیتر بایت‌به‌بایتِ قفلِ r255 — «در جزوه · ۶ کاربرد» برایِ amaze", () => {
    renderDialog("amaze");
    const dlg = screen.getByTestId("usage-dialog");
    expect(dlg.textContent).toContain("در جزوه · ۶ کاربرد");
    // بی-لنز مخرج نمی‌گیرد — هیچ «از M»ی در تیتر نیست
    expect(dlg.textContent).not.toContain("کاربردِ ریدینگ از");
  });

  it("زیرِ لنزِ ریدینگِ change: «در جزوه · ۱۱ کاربردِ ریدینگ از ۱۳» — از دو تک‌منبع", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const dlg = screen.getByTestId("usage-dialog");
    expect(dlg.textContent).toContain("در جزوه · ۱۱ کاربردِ ریدینگ از ۱۳");
    // خاموشیِ لنز: بازگشتِ کامل به بی-مقیاس
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(dlg.textContent).toContain("در جزوه · ۱۳ کاربرد");
    expect(dlg.textContent).not.toContain("کاربردِ ریدینگ از");
  });

  it("زیرِ لنزِ مکالمهٔ of: «در جزوه · ۲۰ کاربردِ مکالمه از ۹۱» — بزرگ‌ترین دیوار", () => {
    renderDialog("of");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    const dlg = screen.getByTestId("usage-dialog");
    expect(dlg.textContent).toContain("در جزوه · ۲۰ کاربردِ مکالمه از ۹۱");
  });

  it("قفلِ منبع: دو شاخهٔ تیتر — بی-لنز همان عبارتِ پیوسته، لنزی با مخرج از target.sites.length", () => {
    // شاخهٔ بی-لنز — همان عبارتِ قفل‌شدهٔ قدیمی، پیوسته
    expect(dlgSrc).toContain(
      "`در جزوه · ${target ? faNum(target.sites.length) : \"\"} کاربرد`"
    );
    // شاخهٔ لنزی — مقیاس از هر دو تک‌منبع، نوع از activeKindLabel
    expect(dlgSrc).toContain(
      "`در جزوه · ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel} از ${faNum(target.sites.length)}`"
    );
    // شرطِ شاخه از kindFilter است
    expect(dlgSrc).toContain("kindFilter && activeKindLabel && target");
  });
});

// ------------------------------------------------------------------
describe("فضای نامِ a11y و بی-رگرسیون (r271 ③)", () => {
  it("هیچ خطِ aria-labelی «جزوه» یا «کاربرددار» نمی‌گیرد — تیترِ نو هم aria ندارد", () => {
    const lines = dlgSrc.split("\n");
    for (const l of lines) {
      if (l.includes("aria-label")) {
        expect(l).not.toContain("جزوه");
        expect(l).not.toContain("کاربرددار");
      }
    }
    // تیتر با متنِ مرئی حرف می‌زند — بلوکِ header هیچ aria-labelی ندارد
    const header = dlgSrc.slice(
      dlgSrc.indexOf("<DialogHeader"),
      dlgSrc.indexOf("</DialogHeader>")
    );
    expect(header.includes("aria-label")).toBe(false);
  });

  it("tooltipِ هم-لنزِ گشایندهٔ r270 دست‌نخورده — دو شاخه از دو تک‌منبع", () => {
    expect(dlgSrc).toContain(
      "`کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel} در جزوه`"
    );
    expect(dlgSrc).toContain(
      "`کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ جزوه`"
    );
  });

  it("بازگشتِ اسکرولِ r269 و گشایندهٔ r268 در منبع زنده‌اند", () => {
    expect(dlgSrc).toContain("scroller.scrollTop = 0");
    expect(dlgSrc).toContain("(showAll ? visibleSites : visibleSites.slice(0, 8))");
    expect(dlgSrc).toContain("aria-expanded={showAll}");
  });
});
