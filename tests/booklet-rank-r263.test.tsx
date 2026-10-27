// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۳ — سطحِ هشتمِ «کاربرد در جزوه» (چیپِ واژه‌هایِ زنده رویِ
// مثال‌هایِ درسنامهٔ جامع در TopicCard) + تکمیلِ رتبهٔ پرکاربردی رویِ
// دو سطحِ باقی‌ماندهٔ چیپِ کاربرد (تبِ واژگان و فلش‌کارت).
//
// قراردادهایِ تحتِ قفل:
//   · سازندهٔ چیپ‌هایِ مثال = پارتیِ کامل با گذرِ مستقلِ regexِ کامل
//     (۲۶۳۷ واژهٔ یکتا × ۲۰۵ مثال) — همان معناشناسیِ هشت سطح؛ ترتیبِ
//     پایدار = ترتیبِ واژگانِ درس‌ها؛ sites = خودِ findWordUsages.
//   · UI: سقفِ ۵ چیپ + «+N» صادقانه؛ واژهٔ فقط-درسنامه‌ای «· ۰»
//     نمی‌گیرد و دیالوگش حالتِ خالیِ صادقانهٔ r259 دارد؛ مثالِ بی‌واژه
//     ردیف ندارد (در دادهٔ فعلی صفرِ مثالِ بی‌واژه — پیش‌شرط).
//   · رتبه در دو سطحِ جدید: همان usedWordRankِ r259-r262؛ فقط-نمایش
//     (span)؛ در تبِ واژگان با خانوادهٔ sky و در فلش‌کارت با ایدئومِ
//     سفیدِ نیمه‌شفافِ میزبان؛ بی‌کاربرد، هیچ.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { TopicCard } from "@/components/study/lesson/booklet-grammar-view";
import VocabTab from "@/components/study/lesson/vocab-tab";
import Flashcards from "@/components/study/lesson/flashcards";
import { topicExampleChips } from "@/lib/booklet-example-words";
import { findWordUsages, usedWordRank, wordFormRegex } from "@/lib/word-usage";
import { BOOKLET_GRAMMAR_TOPICS, type BgTopic } from "@/data/booklet-grammar";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("framer-motion", () => ({
  motion: { div: ({ children, ...p }: { children?: React.ReactNode }) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

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
    lessonTab: "grammar",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

/** واژه‌های یکتای کل جزوه به ترتیبِ درس‌ها — آینهٔ مستقلِ ددوپِ سازنده */
function uniqueVocab(): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const l of lessons)
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(w.en);
      }
    }
  return out;
}

/** تشخیصِ مستقلِ کامل — regexِ خودِ تطبیق روی همهٔ واژه‌های یکتا (بدونِ شاخص) */
function expectedExampleChips(en: string): string[] {
  return uniqueVocab().filter((w) => wordFormRegex(w).test(en));
}

const chipWordOf = (chip: HTMLElement): string =>
  chip.getAttribute("aria-label")?.match(/کاربرد (.+?) در جزوه/)?.[1] ?? "";

/** اولین (موضوع، اندیسِ مثال، واژه) با سایتِ صفر — شاخهٔ فقط-درسنامه‌ای */
function firstZeroSiteChip(): { topic: BgTopic; ei: number; en: string } | null {
  for (const t of BOOKLET_GRAMMAR_TOPICS) {
    const chips = topicExampleChips(t.id);
    for (let ei = 0; ei < chips.length; ei++) {
      const zero = chips[ei].find((h) => h.sites.length === 0);
      if (zero) return { topic: t, ei, en: zero.en };
    }
  }
  return null;
}

/** اولین (موضوع، اندیسِ مثال) با بیش از ۵ واژه — آزمونِ مرزِ سقف */
function firstOverCap(): { topic: BgTopic; ei: number } | null {
  for (const t of BOOKLET_GRAMMAR_TOPICS) {
    const chips = topicExampleChips(t.id);
    for (let ei = 0; ei < chips.length; ei++) {
      if (chips[ei].length > 5) return { topic: t, ei };
    }
  }
  return null;
}

const toggleNoop = () => {};

describe("سطحِ هشتم + رتبهٔ دو سطحِ باقی‌مانده — r263", () => {
  it("① سازنده: پارتیِ کاملِ ۳۲ موضوع × ۲۰۵ مثال با گذرِ مستقلِ regexِ کامل؛ ترتیبِ پایدار؛ sites = خودِ سیم", () => {
    // پیش‌شرطِ داده: هر ۲۰۵ مثال واژه‌دار (صفرِ مثالِ بی‌واژه در جزوه)
    let totalExamples = 0;
    let zeroSiteChips = 0;
    for (const t of BOOKLET_GRAMMAR_TOPICS) {
      const chips = topicExampleChips(t.id);
      expect(chips.length).toBe((t.examples ?? []).length);
      for (let ei = 0; ei < chips.length; ei++) {
        totalExamples++;
        const expected = expectedExampleChips((t.examples ?? [])[ei].en);
        expect(chips[ei].map((h) => h.en)).toEqual(expected); // هم‌مجموعه و هم‌ترتیب
        for (const h of chips[ei]) {
          expect(h.sites).toEqual(findWordUsages(h.en));
          if (h.sites.length === 0) zeroSiteChips++;
        }
      }
    }
    expect(totalExamples).toBe(205);
    expect(zeroSiteChips).toBeGreaterThan(0); // شاخهٔ فقط-درسنامه‌ای در داده زنده است
    // کش: فراخوانیِ دوم همان آرایه (هویتِ پایدار)
    const t0 = BOOKLET_GRAMMAR_TOPICS[0];
    expect(topicExampleChips(t0.id)).toBe(topicExampleChips(t0.id));
  });

  it("② TopicCard: هر مثالِ بازشده ردیفِ زنده دارد؛ مرزِ سقفِ دقیق: ۵ چیپ + «+N» صادقانه با ترتیبِ مستقل", () => {
    const over = firstOverCap();
    expect(over).not.toBeNull(); // پیش‌شرط: مثالِ فراتر از سقف داریم
    const { topic, ei } = over!;
    const expectedAll = topicExampleChips(topic.id);
    render(<TopicCard topic={topic} index={7} isOpen onToggle={toggleNoop} />);
    // همهٔ مثال‌هایِ موضوع ردیف دارند (۲۰۵/۲۰۵ واژه‌دار)
    const rows = screen.getAllByTestId(new RegExp(`^bg-ex-usage-row-${topic.id}-\\d+$`));
    expect(rows.length).toBe((topic.examples ?? []).length);
    // مرزِ سقف: دقیقاً ۵ چیپ، ترتیب = مستقل، شمارشِ هر چیپ = مستقل
    const row = screen.getByTestId(`bg-ex-usage-row-${topic.id}-${ei}`);
    const chips = within(row).getAllByTestId(new RegExp(`^bg-ex-usage-chip-${topic.id}-${ei}-.+$`));
    expect(chips.length).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(chipWordOf(chips[i])).toBe(expectedAll[ei][i].en);
      if (expectedAll[ei][i].sites.length > 0) {
        expect(chips[i].textContent).toContain(faNum(expectedAll[ei][i].sites.length));
      } else {
        // صداقتِ r259: واژهٔ فقط-درسنامه‌ای «· ۰» نمی‌گیرد
        expect(chips[i].textContent).not.toContain(`· ${faNum(0)}`);
      }
    }
    // «+N» صادقانه — و چیپِ ششم غایب
    expect(row.textContent).toContain(`+${faNum(expectedAll[ei].length - 5)}`);
    const sixth = expectedAll[ei][5];
    expect(
      screen.queryByTestId(`bg-ex-usage-chip-${topic.id}-${ei}-${sixth.en.replace(/\s+/g, "-")}`)
    ).not.toBeInTheDocument();
  });

  it("③ دیالوگ از مثال: شاخهٔ صفر-سایت حالتِ خالیِ صادقانه؛ شاخهٔ چندکاربردی سرِ پر با رتبه؛ بستن سالم", () => {
    const zero = firstZeroSiteChip();
    expect(zero).not.toBeNull();
    const { topic, ei, en } = zero!;
    render(<TopicCard topic={topic} index={3} isOpen onToggle={toggleNoop} />);
    const row = screen.getByTestId(`bg-ex-usage-row-${topic.id}-${ei}`);
    // واژهٔ صفر-سایت: چیپ بدونِ «· ۰» (صداقتِ r259)
    const chip = within(row).getByTestId(`bg-ex-usage-chip-${topic.id}-${ei}-${en.replace(/\s+/g, "-")}`);
    expect(chip.textContent).not.toContain(`· ${faNum(0)}`);
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(en);
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(0)} کاربرد`);
    expect(within(dialog).getByTestId("usage-empty")).toBeInTheDocument();
    expect(within(dialog).queryByTestId("usage-rank")).not.toBeInTheDocument();
    // متنِ مثال دست‌نخورده (پاراگرافِ همان مثال و ردیفِ چیپ‌ها سرِ جایش)
    expect(screen.getByText(topic.examples![ei].en)).toBeInTheDocument();
    expect(screen.getByTestId(`bg-ex-usage-row-${topic.id}-${ei}`)).toBeInTheDocument();
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
    // شاخهٔ چندکاربردی: اولین چیپِ سایت‌دارِ همین کارت
    const multi = topicExampleChips(topic.id)[ei].find((h) => h.sites.length > 0);
    expect(multi).toBeTruthy();
    const multiChip = within(row).getByTestId(
      `bg-ex-usage-chip-${topic.id}-${ei}-${multi!.en.replace(/\s+/g, "-")}`
    );
    act(() => {
      fireEvent.click(multiChip);
    });
    const dialog2 = screen.getByTestId("usage-dialog");
    expect(dialog2.textContent).toContain(`در جزوه · ${faNum(multi!.sites.length)} کاربرد`);
    expect(within(dialog2).getByTestId("usage-rank").textContent).toBe(
      `رتبهٔ ${faNum(usedWordRank(multi!.en)!.rank)} از ${faNum(usedWordRank(multi!.en)!.total)}`
    );
    act(() => {
      fireEvent.click(within(dialog2).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("④ رتبه در تبِ واژگان: چیپِ مستقل با متنِ رقابتی؛ spanِ فقط-نمایش؛ بی‌کاربرد هیچ", () => {
    const lesson = lessons[0];
    render(<VocabTab lesson={lesson} />);
    const used = lesson.vocabulary.find((w) => findWordUsages(w.en).length > 0)!;
    const rank = usedWordRank(used.en)!;
    const chip = screen.getByTestId(`usage-rank-${used.en.replace(/\s+/g, "-")}`);
    expect(chip.textContent).toBe(`رتبهٔ ${faNum(rank.rank)} از ${faNum(rank.total)}`);
    expect(chip.tagName).toBe("SPAN"); // کلیکِ دیالوگ با چیپِ کاربرد می‌ماند
    // بی‌کاربرد: نه چیپِ کاربرد، نه رتبه
    const unused = lesson.vocabulary.find((w) => findWordUsages(w.en).length === 0)!;
    expect(screen.queryByTestId(`usage-chip-${unused.en.replace(/\s+/g, "-")}`)).not.toBeInTheDocument();
    expect(screen.queryByTestId(`usage-rank-${unused.en.replace(/\s+/g, "-")}`)).not.toBeInTheDocument();
  });

  it("⑤ رتبه رویِ پشتِ فلش‌کارت: ایدئومِ سفیدِ میزبان؛ spanِ فقط-نمایش با متنِ مستقل", () => {
    const lesson = lessons[2];
    const word = lesson.vocabulary.find((w) => findWordUsages(w.en).length > 0)!;
    const fixture = {
      ...lesson,
      vocabulary: [word],
    } as unknown as LessonData;
    render(<Flashcards lesson={fixture} onExit={() => {}} />);
    const flipCard = document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;
    act(() => {
      fireEvent.click(flipCard); // flip → پشتِ کارت فعال
    });
    const rank = usedWordRank(word.en)!;
    const chip = screen.getByTestId(`usage-rank-${word.en.replace(/\s+/g, "-")}`);
    expect(chip.textContent).toBe(`رتبهٔ ${faNum(rank.rank)} از ${faNum(rank.total)}`);
    expect(chip.tagName).toBe("SPAN");
    // ایدئومِ میزبان: سفیدِ نیمه‌شفافِ جفت‌ها (نه skyِ سطوحِ روشن)
    expect(chip.className).toContain("bg-white/15");
    // فقط-نمایش: کلیکش هیچ دیالوگی باز نمی‌کند (دیالوگ با چیپِ کاربرد است)
    act(() => {
      fireEvent.click(chip);
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });
});
