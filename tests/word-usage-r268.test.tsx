// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۸ — دو بندِ نو: گشایندهٔ «+ N موردِ دیگر» و نشانِ درسِ کارت‌هایِ
// سایت
//
//   ① تا r26۷ خطِ «+ N موردِ دیگر در جزوه» متنِ مرده بود — کاربردهایِ نهم
//      به بعد هیچ‌راه بودند (پیش‌شمارشِ r268: از ۲۶۴۰ واژه، ۱۵۳ واژه بیش
//      از ۸ سایت دارند؛ بیشینه «of» با ۹۱ سایت و ۸۳ پنهان). حالا دکمهٔ
//      دوسطحی است: aria-expanded صداقتِ وضعیت، بازگشتِ کاملِ r260، و
//      متنِ مرئیِ جمع‌شده بایت‌به‌بایت همانِ قفل‌هایِ r264 (p → button
//      هیچ toContainی نمی‌شکند). نامِ دسترس‌پذیر از خودِ متنِ مرئی می‌آید
//      (بدونِ aria-label — WCAG 2.5.3 خودکار؛ فضای نامِ a11yِ r253
//      بی‌استثنا می‌ماند: هیچ خطِ aria-labelی «جزوه» نمی‌گیرد).
//   ② هر کارتِ سایت نشانِ خنثایِ «درس N» می‌گیرد — از s.lessonId تک‌منبع.
//      titleFa درس را در نثر می‌گوید ولی برای چشمِ جوینده گم است؛ چیپِ
//      سنگی آن را در یک نگاه می‌دهد. spanِ بی-هندلر: سفرِ درس کارِ
//      چیپ‌هایِ نوارِ پراکندگی است (r263) — دو مقصدِ یکسان رویِ یک کارت
//      شلوغی است نه سادگی.
//
// لنگرهایِ پیش‌شمارشِ r268 (scripts/precount-r268.ts):
//   change = ۱۳ سایت (+۵ پنهان) · کارتِ اول = درسِ ۲ — هرگز فرضِ ۵ نکن
//   change زیرِ ریدینگ = ۱۱ (+۳) · مکالمه = ۲ · communication = ۳ ·
//   ability = ۱ · «conversation» = ۱۰ (+۲) · ۱۵۳ واژه گشاینده‌دار
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

import { faNum } from "@/lib/study-theme";

const CHANGE = findWordUsages("change");
expect(CHANGE.length).toBe(13);
const READING = CHANGE.filter((s) => s.kind === "reading");
expect(READING.length).toBe(11);
const CONV = CHANGE.filter((s) => s.kind === "conversation");
expect(CONV.length).toBe(2);
const COMM = findWordUsages("communication");
expect(COMM.length).toBe(3);
const ABILITY = findWordUsages("ability");
expect(ABILITY.length).toBe(1);
const CONVWORD = findWordUsages("conversation");
expect(CONVWORD.length).toBe(10);

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

const cardsOf = () => [...document.querySelectorAll("[data-testid=usage-site]")];

// ------------------------------------------------------------------
describe("گشایندهٔ «+ N موردِ دیگر» (r268 ①)", () => {
  it("change جمع‌شده: دکمه است نه p — متنِ مرئیِ r264 بایت‌به‌بایت؛ aria-expanded=false؛ ۸ کارت", () => {
    renderDialog("change");
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.tagName).toBe("BUTTON");
    expect(more.getAttribute("aria-expanded")).toBe("false");
    // متنِ مرئیِ قفل‌شدهٔ r264 — toContainهایِ آن راند دست‌نخورده می‌مانند
    expect(more.textContent).toContain(`+ ${faNum(CHANGE.length - 8)} موردِ دیگر`);
    expect(more.textContent).toContain("در جزوه");
    // tooltip رفتار را می‌آموزد — با شمارشِ زنده، نه رشتهٔ منجمد
    expect(more.getAttribute("title")).toBe(
      `کلیک: نمایشِ همهٔ ${faNum(CHANGE.length)} کاربردِ جزوه`
    );
    // نامِ دسترس‌پذیر از متنِ مرئی می‌آید — بدونِ aria-label (WCAG 2.5.3)
    expect(more.getAttribute("aria-label")).toBeNull();
    // فهرستِ جمع‌شده: ۸ کارتِ نخست
    expect(cardsOf().length).toBe(8);
  });

  it("کلیک: همهٔ ۱۳ کارت می‌آیند — aria-expanded=true و متن به «نمایشِ کمتر» می‌گردد", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more"));
    });
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.getAttribute("aria-expanded")).toBe("true");
    expect(cardsOf().length).toBe(CHANGE.length);
    expect(more.textContent).toContain("نمایشِ کمتر");
    expect(more.textContent).toContain(`همهٔ ${faNum(CHANGE.length)} کاربرد`);
    // جمع‌شده دیگر advertised نمی‌شود — صادقیتِ وضعیت
    expect(more.textContent).not.toContain(`+ ${faNum(CHANGE.length - 8)} موردِ دیگر`);
    expect(more.getAttribute("title")).toBe("کلیک: بازگشت به فهرستِ فشرده");
    // هر ۱۳ سایتِ داده، هر کدام با نشانِ درسِ خودشان
    const chips = [...document.querySelectorAll("[data-testid=usage-site-lesson]")];
    expect(chips.length).toBe(CHANGE.length);
  });

  it("کلیکِ دوباره: بازگشتِ کامل به ۸ کارت — وعدهٔ r260 همان رفتار است", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more"));
    });
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.getAttribute("aria-expanded")).toBe("false");
    expect(cardsOf().length).toBe(8);
    expect(more.textContent).toContain(`+ ${faNum(CHANGE.length - 8)} موردِ دیگر`);
    expect(more.getAttribute("title")).toBe(
      `کلیک: نمایشِ همهٔ ${faNum(CHANGE.length)} کاربردِ جزوه`
    );
  });

  it("زیرِ لنزِ ریدینگ: جمع‌شده «+ ۳ موردِ دیگر» (قفلِ r264) و گشودن ۱۱ کارتِ ریدینگ می‌دهد", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.textContent).toContain(`+ ${faNum(READING.length - 8)} موردِ دیگر`);
    expect(cardsOf().length).toBe(8);
    act(() => {
      fireEvent.click(more);
    });
    const expanded = screen.getByTestId("usage-more") as HTMLElement;
    expect(expanded.getAttribute("aria-expanded")).toBe("true");
    const cards = cardsOf();
    expect(cards.length).toBe(READING.length);
    for (const c of cards) expect(c.textContent).toContain("ریدینگ");
  });

  it("گشوده + تعویضِ متقابل به مکالمه: دکمه صادقانه ناپدید می‌شود و خاموشیِ لنز گشودگی را بی‌دروغ نگه می‌دارد", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-more"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    // ۲ سایت — نه گشاینده، نه cap: هر دو کارت حاضرند
    expect(screen.queryByTestId("usage-more")).toBeNull();
    expect(cardsOf().length).toBe(CONV.length);
    // خاموشیِ لنز: showAll همچنان زنده است — کاربر «همه» را خواسته
    // و ساکت-reset کردنش وعده را می‌شکند؛ ۱۳ کارت + دکمهٔ «نمایشِ کمتر»
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.getAttribute("aria-expanded")).toBe("true");
    expect(cardsOf().length).toBe(CHANGE.length);
    expect(more.textContent).toContain("نمایشِ کمتر");
  });

  it("«conversation» با ۱۰ سایت (+۲) گشاینده دارد و communication/ability بی-گشاینده می‌مانند", () => {
    renderDialog("conversation");
    const more = screen.getByTestId("usage-more") as HTMLElement;
    expect(more.textContent).toContain(`+ ${faNum(CONVWORD.length - 8)} موردِ دیگر`);
    expect(cardsOf().length).toBe(8);
    act(() => {
      fireEvent.click(more);
    });
    expect(cardsOf().length).toBe(CONVWORD.length);
  });

  it("communication (۳) و ability (۱): هیچ‌گاه گشاینده ندارند — صداقتِ r252", () => {
    renderDialog("communication");
    expect(screen.queryByTestId("usage-more")).toBeNull();
    expect(cardsOf().length).toBe(COMM.length);
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-more")).toBeNull();
    expect(cardsOf().length).toBe(ABILITY.length);
  });
});

// ------------------------------------------------------------------
describe("نشانِ درسِ کارت‌هایِ سایت (r268 ②)", () => {
  it("هر کارتِ جمع‌شده نشانِ «درس N» دارد — از دادهٔ همان سایت، هم‌ترازِ کارت‌ها", () => {
    renderDialog("change");
    const cards = cardsOf();
    expect(cards.length).toBe(8);
    const expecteds = CHANGE.slice(0, 8);
    cards.forEach((card, i) => {
      const chip = card.querySelector("[data-testid=usage-site-lesson]") as HTMLElement;
      expect(chip).not.toBeNull();
      expect(chip.tagName).toBe("SPAN");
      expect(chip.textContent).toBe(`درس ${faNum(expecteds[i].lessonId)}`);
      expect(chip.getAttribute("title")).toBe(
        `این کاربرد از واژگانِ درسِ ${faNum(expecteds[i].lessonId)} است`
      );
    });
  });

  it("لنگرِ سختِ پیش‌شمارش: کارتِ اولِ change درسِ ۲ است — نه فرضِ صدرنشینیِ درسِ ۵", () => {
    renderDialog("change");
    const chip = document
      .querySelector("[data-testid=usage-site]")
      ?.querySelector("[data-testid=usage-site-lesson]") as HTMLElement;
    expect(chip.textContent).toBe(`درس ${faNum(2)}`);
  });

  it("نشان، spanِ بی-هندلر است — هیچ دکمه‌ای داخلِ کارت نیست (سفرِ درس کارِ نوار است)", () => {
    renderDialog("change");
    for (const card of cardsOf()) {
      expect(card.querySelectorAll("button").length).toBe(0);
    }
    // و در سطحِ دیالوگ هم دکمه‌ای به نامِ برهنهٔ «درس N» وجود ندارد —
    // نام‌هایِ چیپ‌هایِ نوار همیشه «درس N · X از Y»ی دوتکه‌اند
    expect(screen.queryByRole("button", { name: /^درس \d+$/ })).toBeNull();
  });

  it("لنزِ ریدینگ: نشان‌ها از توزیعِ هم-لنز می‌آیند — نه عکسِ کهنهٔ همه-نوعه", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const cards = cardsOf();
    expect(cards.length).toBe(8);
    const expecteds = READING.slice(0, 8);
    cards.forEach((card, i) => {
      const chip = card.querySelector("[data-testid=usage-site-lesson]") as HTMLElement;
      expect(chip.textContent).toBe(`درس ${faNum(expecteds[i].lessonId)}`);
    });
  });

  it("کارتِ اولِ communication درسِ ۱ — لنگرِ r252 با نشانِ نو هم زنده می‌ماند", () => {
    renderDialog("communication");
    const chip = document
      .querySelector("[data-testid=usage-site]")
      ?.querySelector("[data-testid=usage-site-lesson]") as HTMLElement;
    expect(chip.textContent).toBe(`درس ${faNum(1)}`);
    expect(COMM[0].lessonId).toBe(1);
  });
});

// ------------------------------------------------------------------
describe("قفل‌هایِ سطحِ منبع (r268)", () => {
  const dlgSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
    "utf8"
  );

  it("گشاینده: طولِ فهرست از showAll، صداقت از aria-expanded، متنِ r264 پیوسته", () => {
    expect(dlgSrc).toContain("(showAll ? visibleSites : visibleSites.slice(0, 8))");
    expect(dlgSrc).toContain("aria-expanded={showAll}");
    // متنِ مرئیِ جمع‌شده — قفلِ رفتاریِ r264 در سطحِ منبع هم پیوسته
    expect(dlgSrc).toContain("+ ${faNum(visibleSites.length - 8)} موردِ دیگر در جزوه");
    // بازگشتِ کامل — toggle نه set(false)
    expect(dlgSrc).toContain("setShowAll((v) => !v)");
  });

  it("گشاینده هیچ aria-labelی ندارد — نام از متنِ مرئی (WCAG 2.5.3 خودکار)", () => {
    const start = dlgSrc.indexOf('data-testid="usage-more"');
    const end = dlgSrc.indexOf("</button>", start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const block = dlgSrc.slice(start, end);
    expect(block).not.toContain("aria-label");
  });

  it("نشانِ درس از s.lessonId تک‌منبع می‌خواند — هرگز رشتهٔ منجمد", () => {
    expect(dlgSrc).toContain("این کاربرد از واژگانِ درسِ ${faNum(s.lessonId)} است");
    expect(dlgSrc).toContain("درس {faNum(s.lessonId)}");
  });

  it("فضای نامِ a11yِ خانواده: هیچ خطِ aria-labelی «کاربرددار» یا «جزوه» نمی‌گیرد (r253/r267)", () => {
    const ariaLines = dlgSrc.split("\n").filter((l) => l.includes("aria-label"));
    expect(ariaLines.length).toBeGreaterThan(0);
    for (const l of ariaLines) {
      expect(l).not.toContain("کاربرددار");
      expect(l).not.toMatch(/جزوه/);
    }
  });

  it("markupِ گشاینده فقط در دیالوگِ مشترک زندگی می‌کند — هیچ میزبانی رونوشت ندارد (ایدئومِ r255)", () => {
    const CONSUMERS = [
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/flashcards.tsx",
      "src/components/study/lesson/word-of-day.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/practice/danger-words.tsx",
    ];
    for (const f of CONSUMERS) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      expect(src, `${f} must NOT carry a private copy of the expander`).not.toContain(
        'data-testid="usage-more"'
      );
      expect(src, `${f} must NOT carry a private site-lesson badge`).not.toContain(
        'data-testid="usage-site-lesson"'
      );
    }
  });
});
