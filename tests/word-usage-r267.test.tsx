// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۷ — بندهای ①+② پیشنهادهایِ ۲۶۶: مقیاسِ دوتاییِ چیپ‌هایِ درس و
// tooltipِ گم‌شدهٔ badgeِ «بیشترین»
//
//   ① هر چیپِ درسِ نوارِ پراکندگی حالا خودکفاست: «درس ۵ · ۵ از ۱۳» —
//      مخرج = اندازهٔ همان توزیعِ جاری (visibleSites.length؛ زیرِ لنزِ
//      ریدینگ: «· ۴ از ۱۱»). وعدهٔ aria همان مقیاس را می‌گیرد — WCAG 2.5.3
//      (نامِ دسترس‌پذیری متنِ مرئی را در بر دارد)؛ دنبالهٔ وعدهٔ r263
//      («کاربردِ این واژه در ...») پیوسته می‌ماند و قفل‌هایِ منبعِ r263/264
//      بدونِ ویرایش سبز می‌مانند — فقط دو toBeِ دقیقِ r264 با مخرج به‌روز شد.
//   ② badgeِ پرِ آسمانیِ «بیشترین» — تنها هم‌خانوادهٔ بی-tooltip — حالا
//      می‌آموزد: «بیشترین واژهٔ در-متن از واژگانِ همان درس — کلیکِ سطر همان
//      واژه‌ها را می‌آورد»؛ سه خواهرِ دیگر از راندهایِ پیش tooltip دارند.
//
// لنگرهایِ پیش‌شمارشِ r267 (scripts/precount-r267.ts):
//   change: ۵·۵از۱۳ | ۶·۳از۱۳ | ۹·۲از۱۳ | ۲·۱از۱۳ | ۷·۱از۱۳ | ۱۱·۱از۱۳
//   زیرِ ریدینگ: ۵·۴از۱۱ | ۶·۳از۱۱ | ... · زیرِ مکالمه: ۵·۱از۲ | ۹·۱از۲
//   communication: ۱·۲از۳ | ۲·۱از۳ · ability: تک-درسه بی-نوار
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

const CHANGE = findWordUsages("change");
const CHANGE_LEN = CHANGE.length; // ۱۳
const READING = CHANGE.filter((s) => s.kind === "reading");
const READING_LEN = READING.length; // ۱۱
const CONV = CHANGE.filter((s) => s.kind === "conversation");
expect(CHANGE_LEN).toBe(13);
expect(READING_LEN).toBe(11);
expect(CONV.length).toBe(2);
const COMM = findWordUsages("communication");
expect(COMM.length).toBe(3);

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

const renderDialog = (en: string, withHandler = false) =>
  render(
    <WordUsageDialog
      target={{ en, sites: findWordUsages(en) }}
      onClose={vi.fn()}
      {...(withHandler ? { onOpenLesson: vi.fn() } : {})}
    />
  );

// ------------------------------------------------------------------
describe("مقیاسِ دوتاییِ چیپ‌هایِ درس (r267 ①)", () => {
  it("change بی-لنز با هندلر: «درس ۵ · ۵ از ۱۳» — هر ۶ چیپ مخرجِ ۱۳ دارند؛ aria همان مقیاس؛ کلیک هندلر را با همان درس صدا می‌زند", () => {
    const onOpenLesson = vi.fn();
    render(
      <WordUsageDialog
        target={{ en: "change", sites: CHANGE }}
        onClose={vi.fn()}
        onOpenLesson={onOpenLesson}
      />
    );
    const expectations: Array<[number, number]> = [
      [5, 5],
      [6, 3],
      [9, 2],
      [2, 1],
      [7, 1],
      [11, 1],
    ];
    for (const [lessonId, count] of expectations) {
      const chip = screen.getByTestId(`usage-lesson-chip-${lessonId}`);
      expect(chip.textContent).toBe(
        `درس ${faNum(lessonId)} · ${faNum(count)} از ${faNum(CHANGE_LEN)}`
      );
    }
    // وعدهٔ aria با مخرج — دنبالهٔ r263 پیوسته
    expect(screen.getByTestId("usage-lesson-chip-6").getAttribute("aria-label")).toBe(
      `رفتن به واژه‌هایِ درسِ ${faNum(6)} — ${faNum(3)} از ${faNum(CHANGE_LEN)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`
    );
    // WCAG 2.5.3 به‌سبکِ همان خانواده (از r263): aria جملهٔ توصیفی با همان
    // داده است — جفتِ «N از M» و شمارهٔ درس در نامِ دسترس‌پذیری هم هست
    for (const [lessonId, count] of expectations) {
      const chip = screen.getByTestId(`usage-lesson-chip-${lessonId}`);
      expect(chip.getAttribute("aria-label")).toContain(
        `${faNum(count)} از ${faNum(CHANGE_LEN)}`
      );
      expect(chip.getAttribute("aria-label")).toContain(`درسِ ${faNum(lessonId)}`);
    }
    // کلیک همان وعدهٔ قدیم — مسیرِ r263 دست‌نخورده
    act(() => {
      fireEvent.click(screen.getByTestId("usage-lesson-chip-9"));
    });
    expect(onOpenLesson).toHaveBeenCalledWith(9);
  });

  it("لنزِ ریدینگ: «درس ۵ · ۴ از ۱۱» — مخرجِ هم-لنز، صدرنشینِ پر می‌ماند؛ aria «۳ از ۱۱ کاربردِ ریدینگِ...»", () => {
    const onOpenLesson = vi.fn();
    render(
      <WordUsageDialog
        target={{ en: "change", sites: CHANGE }}
        onClose={vi.fn()}
        onOpenLesson={onOpenLesson}
      />
    );
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const chip5 = screen.getByTestId("usage-lesson-chip-5");
    expect(chip5.textContent).toBe(`درس ${faNum(5)} · ${faNum(4)} از ${faNum(READING_LEN)}`);
    expect(chip5.className).toContain("bg-violet-600"); // هنوز صدرنشینِ پر
    expect(screen.getByTestId("usage-lesson-chip-6").getAttribute("aria-label")).toBe(
      `رفتن به واژه‌هایِ درسِ ${faNum(6)} — ${faNum(3)} از ${faNum(READING_LEN)} کاربردِ ریدینگِ این واژه در آن`
    );
    // و mخرج هر چیپِ هم-لنز ۱۱ است
    for (const id of [5, 6, 2, 7, 9, 11]) {
      expect(screen.getByTestId(`usage-lesson-chip-${id}`).textContent).toContain(
        `از ${faNum(READING_LEN)}`
      );
    }
  });

  it("لنزِ مکالمه: «· ۱ از ۲» برای هر دو هم-بیشینه؛ communication «۲ از ۳»؛ ability تک-درسه بی-نوار — بی-هندلر همه span", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    const chip5 = screen.getByTestId("usage-lesson-chip-5");
    const chip9 = screen.getByTestId("usage-lesson-chip-9");
    expect(chip5.textContent).toBe(`درس ${faNum(5)} · ${faNum(1)} از ${faNum(2)}`);
    expect(chip9.textContent).toBe(`درس ${faNum(9)} · ${faNum(1)} از ${faNum(2)}`);
    expect(chip5.className).toContain("bg-violet-600");
    expect(chip9.className).toContain("bg-violet-600"); // هر دو هم-بیشینه پر
    cleanup();
    renderDialog("communication");
    expect(screen.getByTestId("usage-lesson-chip-1").textContent).toBe(
      `درس ${faNum(1)} · ${faNum(2)} از ${faNum(3)}`
    );
    expect(screen.getByTestId("usage-lesson-chip-2").textContent).toBe(
      `درس ${faNum(2)} · ${faNum(1)} از ${faNum(3)}`
    );
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-bar")).toBeNull();
    cleanup();
    // بی-هندلر: spanِ اطلاعاتی با متنِ دوتایی
    renderDialog("change");
    expect(screen.getByTestId("usage-lesson-chip-5").tagName).toBe("SPAN");
    expect(screen.getByTestId("usage-lesson-chip-5").textContent).toBe(
      `درس ${faNum(5)} · ${faNum(5)} از ${faNum(CHANGE_LEN)}`
    );
    expect(screen.queryByRole("button", { name: /رفتن به واژه‌هایِ درسِ/ })).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("tooltipِ گم‌شدهٔ badgeِ «بیشترین» (r267 ②)", () => {
  it("badgeِ پرِ آسمانی حالا آموزش می‌دهد — و هر چهار هم-خانواده tooltip دارند؛ همه spanِ اطلاعاتی", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByTestId("usage-rank-toggle"));
    const row10 = screen.getByTestId("usage-rank-row-10");
    const maxBadge = within(row10).getByTestId("usage-rank-max");
    expect(maxBadge.tagName).toBe("SPAN");
    expect(maxBadge.getAttribute("title")).toBe(
      "بیشترین واژهٔ در-متن از واژگانِ همان درس — کلیکِ سطر همان واژه‌ها را می‌آورد"
    );
    // سه خواهر — tooltipهایِ راندهایِ پیش دست‌نخورده
    expect(within(row10).getByTestId("usage-rank-max-unused").getAttribute("title")).toContain(
      "Shift+کلیک"
    );
    const row7 = screen.getByTestId("usage-rank-row-7");
    expect(within(row7).getByTestId("usage-rank-max-ratio").getAttribute("title")).toContain(
      "سهمِ نسبی"
    );
    const row4 = screen.getByTestId("usage-rank-row-4");
    expect(
      within(row4).getByTestId("usage-rank-max-unused-ratio").getAttribute("title")
    ).toContain("Shift+کلیک");
    // هیچ دکمه‌ای با نامِ badgeها — فضای نامِ a11yِ r253
    expect(screen.queryByRole("button", { name: /^بیشترین$/ })).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("قفل‌هایِ سطحِ منبع (r267)", () => {
  const dlgSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
    "utf8"
  );
  const dictSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"),
    "utf8"
  );

  it("دیالوگ: مخرجِ چیپ و وعدهٔ aria از visibleSites.length می‌آید — تک‌منبعِ r264؛ دنبالهٔ وعدهٔ r263 پیوسته", () => {
    expect(dlgSrc).toContain(
      "`${faNum(count)} از ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel}ِ این واژه در آن`"
    );
    expect(dlgSrc).toContain(
      "`${faNum(count)} از ${faNum(visibleSites.length)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`"
    );
    expect(dlgSrc).toContain(
      "`درس ${faNum(lessonId)} · ${faNum(count)} از ${faNum(visibleSites.length)}`"
    );
    // دنباله‌هایِ قفل‌شده — هرگز جابه‌جا نمی‌شوند
    expect(dlgSrc).toContain("کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن");
    expect(dlgSrc).toContain("کاربردِ ${activeKindLabel}ِ این واژه در آن");
  });

  it("دیکشنری: badgeِ «بیشترین» tooltip دارد و سه خواهرِ پیش دست‌نخورده‌اند", () => {
    expect(dictSrc).toContain(
      'title="بیشترین واژهٔ در-متن از واژگانِ همان درس — کلیکِ سطر همان واژه‌ها را می‌آورد"'
    );
    expect(dictSrc).toContain('title="بیشترین سهمِ نسبی واژه‌های در-متن از واژگانِ همان درس"');
    expect(dictSrc).toContain("بیشترین واژهٔ بیرون-از-متن از واژگانِ همان درس");
    expect(dictSrc).toContain("بیشترین سهمِ نسبی واژه‌های بیرون-از-متن از واژگانِ همان درس");
  });

  it("فضای نامِ a11y: ariaهایِ چیپ هرگز «کاربرددار» یا «جزوه»ی برهنه نمی‌گیرند", () => {
    const ariaLines = dlgSrc.split("\n").filter((l) => l.includes("aria-label"));
    for (const l of ariaLines) {
      expect(l).not.toContain("کاربرددار");
      expect(l).not.toMatch(/جزوه/);
    }
  });
});
