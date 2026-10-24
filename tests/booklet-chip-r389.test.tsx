// @vitest-environment jsdom
// ------------------------------------------------------------------
// r389 — «چیپِ «در جزوه · N» یک نام گرفت» — مالک:
//        src/components/study/lesson/booklet-usage-chip.tsx
//
// سه حکمی که این فایل قفل میکند:
//  ① سرشماریِ r389 (الگویِ r382..r388): قالبِ چیپِ «در جزوه · {faNum(n)}»
//     در پنج نما بایتبه‌بایت تکرار می‌شد (دیکشنری r252 · تبِ واژگان/فلش‌کارت
//     r253 · واژهٔ روز r254 · داورِ خطر r255) با شش عضوِ همسان — title،
//     aria-label، آیکونِ BookOpenText(11)، دروازهٔ صداقتِ r252 (بی‌کاربرد،
//     هیچ)، جست‌وجویِ sites از تک‌منبعِ findWordUsages، و سیم‌کشیِ هدفِ
//     دیالوگِ مشترک. حالا یک مالک دارد و پنج نما وامگیرند.
//  ② گویشهایِ میزبانِ عمدی (host-decidesِ r259/r263) پابرجا میمانند:
//     testidِ هر نما، stopPropagationِ فلش‌کارت/کارتِ بلدم، دروازهٔ
//     mounted، و دو گویشِ بصریِ نامدار (sky پیشفرض / flip پشتِ فلش‌کارت)
//     با رشتههایِ دقیقاً پیشین — قفلهایِ r252..r271 بی‌تغییر سبز میمانند.
//  ③ حکمِ «نخیر»ها: چیپِ سرصفحهٔ دیالوگ (word-usage-dialog r267)، باندهایِ
//     سرشماریِ «X از Y واژه/سلول در جزوه» (vocab-tab r257 ·
//     word-family-table-card r256) و «N بار غلط»ِ تک‌سایتِ داورِ خطر —
//     همه قراردادهایِ دیگرند و دستنخورده میمانند (درسِ r386: فقط
//     زیرگروهِ بایتهمسان یکجا میشود).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import BookletUsageChip, { useBookletUsageTarget } from "@/components/study/lesson/booklet-usage-chip";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";
import { lessons } from "@/data";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

const FIVE_VIEWS = [
  "src/components/study/lesson/dictionary-view.tsx",
  "src/components/study/lesson/vocab-tab.tsx",
  "src/components/study/lesson/flashcards.tsx",
  "src/components/study/lesson/word-of-day.tsx",
  "src/components/study/practice/danger-words.tsx",
];

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

// واژهٔ لنگر: اولین واژهٔ واژگانِ درس ۱ با کاربردِ واقعی در جزوه
const anchorWithSites = lessons[0].vocabulary.find((w) => findWordUsages(w.en).length > 0)!;
// واژهٔ لنگرِ بی‌کاربرد: اولین واژهٔ واژگانِ درس ۱ بدونِ هیچ تطبیقی
const anchorWithoutSites = lessons[0].vocabulary.find((w) => findWordUsages(w.en).length === 0)!;

describe("r389 — BookletUsageChip: مالکِ چیپِ «در جزوه»", () => {
  it("قالبِ دقیق: «در جزوه · N» با ارقامِ فارسی + title و aria-labelِ همسانِ پیشین", () => {
    const sites = findWordUsages(anchorWithSites.en);
    expect(sites.length).toBeGreaterThan(0);
    render(
      <BookletUsageChip en={anchorWithSites.en} testid="chip-x" onOpen={() => {}} />
    );
    const chip = screen.getByTestId("chip-x");
    expect(chip).toHaveTextContent(`در جزوه · ${faNum(sites.length)}`);
    expect(chip).not.toHaveTextContent(/[0-9]/); // ارقامِ فارسی
    expect(chip).toHaveAttribute("title", "کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه");
    expect(chip).toHaveAttribute(
      "aria-label",
      `کاربرد ${anchorWithSites.en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`
    );
    expect(chip.querySelector("svg")).not.toBeNull(); // BookOpenText(11)
  });

  it("دروازهٔ صداقتِ r252: واژهٔ بی‌کاربرد هیچ چیپی نمیشود", () => {
    render(
      <BookletUsageChip en={anchorWithoutSites.en} testid="chip-none" onOpen={() => {}} />
    );
    expect(screen.queryByTestId("chip-none")).not.toBeInTheDocument();
  });

  it("دروازهٔ mounted: پیشِ آبرسانی هیچ، حتی برایِ واژهٔ کاربرددار", () => {
    render(
      <BookletUsageChip en={anchorWithSites.en} mounted={false} testid="chip-um" onOpen={() => {}} />
    );
    expect(screen.queryByTestId("chip-um")).not.toBeInTheDocument();
  });

  it("onOpen هدفِ واقعی {en, sites} میگیرد — sites همان آرایهٔ کشِ تک‌منبع است", () => {
    let got: { en: string; sites: WordUsageSite[] } | null = null;
    render(
      <BookletUsageChip
        en={anchorWithSites.en}
        testid="chip-open"
        onOpen={(t) => { got = t; }}
      />
    );
    fireEvent.click(screen.getByTestId("chip-open"));
    expect(got).not.toBeNull();
    expect(got!.en).toBe(anchorWithSites.en);
    expect(got!.sites).toBe(findWordUsages(anchorWithSites.en)); // همان مرجعِ کششده
  });

  it("stopPropagation: چیپ رویِ کارتِ کلیک‌دار کارت را نمیبلعد — و بی‌پرچم میبلعد", () => {
    let cardClicks = 0;
    const Card = (p: { stopPropagation?: boolean }) => (
      <div onClick={() => { cardClicks++; }} data-testid="card">
        <BookletUsageChip
          en={anchorWithSites.en}
          testid="chip-bubble"
          onOpen={() => {}}
          stopPropagation={p.stopPropagation}
        />
      </div>
    );
    const { rerender } = render(<Card stopPropagation />);
    fireEvent.click(screen.getByTestId("chip-bubble"));
    expect(cardClicks).toBe(0); // قراردادِ فلش‌کارت/کارتِ بلدم
    rerender(<Card />);
    fireEvent.click(screen.getByTestId("chip-bubble"));
    expect(cardClicks).toBe(1); // قراردادِ ردیفِ دیکشنری/خطا و کارتِ واژهٔ روز
  });

  it("دو گویشِ بصریِ نامدار: sky پیشفرض، flipِ فلش‌کارت — رشتههایِ دقیقاً پیشین", () => {
    const { rerender } = render(
      <BookletUsageChip en={anchorWithSites.en} testid="chip-tone" onOpen={() => {}} />
    );
    let chip = screen.getByTestId("chip-tone");
    expect(chip.className).toContain("border-sky-200");
    expect(chip.className).toContain("bg-sky-50/60");
    expect(chip.className).toContain("text-sky-700");
    expect(chip.className).not.toContain("flip-pair-chip");

    rerender(
      <BookletUsageChip en={anchorWithSites.en} testid="chip-tone" onOpen={() => {}} tone="flip" />
    );
    chip = screen.getByTestId("chip-tone");
    expect(chip.className).toContain("flip-pair-chip");
    expect(chip.className).toContain("border-white/30");
    expect(chip.className).toContain("bg-black/20");
    expect(chip.className).toContain("text-white");
    expect(chip.className).not.toContain("border-sky-200");
  });

  it("پیشوندِ چیدمانِ میزبان (mt-1.5 واژهٔ روز) بدونِ آسیب به گویشِ sky", () => {
    render(
      <BookletUsageChip en={anchorWithSites.en} testid="chip-mt" onOpen={() => {}} className="mt-1.5" />
    );
    const chip = screen.getByTestId("chip-mt");
    expect(chip.className).toContain("mt-1.5");
    expect(chip.className).toContain("border-sky-200");
  });
});

describe("r389 — useBookletUsageTarget: سیم‌کشیِ یکتایِ هدفِ دیالوگ", () => {
  it("باز/بستنِ هدف — همان قراردادِ {en, sites} | nullِ پنج نمایِ پیشین", () => {
    function Host() {
      const u = useBookletUsageTarget();
      return (
        <div>
          <button data-testid="open" onClick={() => u.open({ en: anchorWithSites.en, sites: findWordUsages(anchorWithSites.en) })}>open</button>
          <button data-testid="close" onClick={u.close}>close</button>
          <span data-testid="state">{u.target === null ? "none" : u.target.en}</span>
        </div>
      );
    }
    render(<Host />);
    expect(screen.getByTestId("state")).toHaveTextContent("none");
    fireEvent.click(screen.getByTestId("open"));
    expect(screen.getByTestId("state")).toHaveTextContent(anchorWithSites.en);
    fireEvent.click(screen.getByTestId("close"));
    expect(screen.getByTestId("state")).toHaveTextContent("none");
  });
});

describe("r389 — قفلهایِ منبع: پنج نما وامگیرند؛ قالبِ دستی منقرض", () => {
  it("هر پنج نما از مالک چیپ و هوک را وام میگیرند", () => {
    for (const v of FIVE_VIEWS) {
      const src = read(v);
      expect(src, `importِ BookletUsageChip در ${v}`).toContain("import BookletUsageChip, { useBookletUsageTarget }");
      expect(src, `useBookletUsageTarget در ${v}`).toContain("useBookletUsageTarget()");
    }
  });

  it("قالبِ دستیِ «در جزوه · {faNum(sites.length)}» در نماها منقرض است — فقط مالک", () => {
    const template = "در جزوه · {faNum(sites.length)}";
    for (const v of FIVE_VIEWS) {
      expect(read(v), `قالبِ دستی در ${v}`).not.toContain(template);
    }
    const owner = read("src/components/study/lesson/booklet-usage-chip.tsx");
    expect(owner).toContain(template);
  });

  it("قالبِ دستیِ aria («در مکالمه‌ها و ریدینگ‌ها — ... مورد») فقط در مالک زندگی میکند", () => {
    for (const v of FIVE_VIEWS) {
      expect(read(v), `ariaِ دستی در ${v}`).not.toContain("در مکالمه‌ها و ریدینگ‌ها — ");
    }
    const owner = read("src/components/study/lesson/booklet-usage-chip.tsx");
    expect(owner).toContain("در مکالمه‌ها و ریدینگ‌ها — ");
  });

  it("سیم‌کشیِ قدیمیِ useState<{en, sites}> در کلِ src منقرض است", () => {
    for (const v of FIVE_VIEWS) {
      expect(read(v), `useStateِ کهنه در ${v}`).not.toMatch(/useState<\{\s*en: string; sites:/);
    }
  });

  it("دوقلوهایِ مردهٔ واردات: findWordUsages از سه نما چرخید (کجا فقط چیپ میخواست)", () => {
    expect(read("src/components/study/practice/danger-words.tsx")).not.toContain('from "@/lib/word-usage"');
    expect(read("src/components/study/lesson/flashcards.tsx")).not.toContain('from "@/lib/word-usage"');
    expect(read("src/components/study/lesson/word-of-day.tsx")).not.toContain('from "@/lib/word-usage"');
    // دیکشنری همچنان میخواهد (لنزِ usageِ r253 — سطرِ ۱۰۹)؛ تبِ واژگان فقط سرشماری
    expect(read("src/components/study/lesson/dictionary-view.tsx")).toContain('from "@/lib/word-usage"');
    expect(read("src/components/study/lesson/vocab-tab.tsx")).toContain("lessonVocabUsageCensus");
  });

  it("حکمِ «نخیر»ها پابرجاست: دیالوگ، باندهایِ سرشماری، «بار غلط»ِ تک‌سایت", () => {
    const dialog = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(dialog).toContain("در جزوه · ${target ? faNum(target.sites.length)"); // عنوانِ دیالوگ — گویشِ r267
    expect(read("src/components/study/lesson/vocab-tab.tsx")).toContain("واژه در جزوه"); // باندِ r257
    expect(read("src/components/study/lesson/word-family-table-card.tsx")).toContain("سلول در جزوه"); // باندِ r256
    expect(read("src/components/study/practice/danger-words.tsx")).toContain("بار غلط"); // تک‌سایت، دوقلو نیست
  });

  it("تعریفِ مالک یکجاست و دو گویشِ بصری رشتههایِ دقیقِ پیشین را حمل میکند", () => {
    const owner = read("src/components/study/lesson/booklet-usage-chip.tsx");
    expect(owner.match(/export default function BookletUsageChip/g)?.length).toBe(1);
    expect(owner.match(/export function useBookletUsageTarget/g)?.length).toBe(1);
    expect(owner).toContain("flip-pair-chip inline-flex items-center gap-1 rounded-md border border-white/30 bg-black/20 px-1.5 py-0.5 text-[10.5px] font-bold text-white");
    expect(owner).toContain("inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700");
  });
});
