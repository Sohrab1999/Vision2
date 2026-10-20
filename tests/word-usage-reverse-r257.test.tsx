// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۷ — لنزِ معکوسِ «فقط بی‌کاربردها» + سرشماریِ واژگانِ درس
// (بندِ ③ و ② پیشنهادهایِ r256/r254):
//
//   ① propِ unusedOnly رویِ کارتِ جدول (هم‌سطحِ usedOnlyِ r256): ردیف‌ها به
//      خانواده‌هایِ بی‌کاربرد محدود می‌شوند — «مطالعهٔ هدفمندِ واژه‌هایی که
//      هنوز در متن نیامده‌اند»؛ چیپِ «N از M خانوادهٔ بی‌کاربرد» و جدولِ
//      کاملاً استفاده‌شده ردیفِ خالیِ صادقانهٔ معکوس می‌گیرد.
//   ② ضمیمه: دوتاییِ متقابلاً انحصاری در همان گروهِ r256 — روشن‌کردنِ یکی
//      دیگری را خاموش می‌کند؛ شمارنده‌هایِ هم‌مقیاسِ خانواده با فیلترِ پایه.
//   ③ تبِ واژگانِ درس: spanِ سرشماریِ «N از M واژه در جزوه» — هم‌مقیاسِ کارت
//      با لنزِ دیکشنری (Σ درس‌ها = ۱۹۱۵/۴۰۳۲)؛ بی‌کاربرد، هیچ.
//
// لنگرهایِ داده‌ای قفل‌شده با پیش‌شمارشِ ترمینالِ r257 (scripts/precount-r257.ts):
//   scopeهایِ بی‌کاربرد: همه=۹۲ · دهم=۲۹ · یازدهم=۲۰ · دوازدهم=۴۳
//   جدولِ اول (دهم·درس اول): ۳ بی‌کاربرد از ۳۱ — division/identification/injury
//   سرشماریِ واژگان: درس ۱ = ۱۳۳/۲۰۴ · Σ = ۱۹۱۵/۴۰۳۲
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import AppendixView from "@/components/study/lesson/appendix-view";
import VocabTab from "@/components/study/lesson/vocab-tab";
import { useStudy } from "@/lib/study-store";
import { WORD_FAMILY_TABLES, type WordFamilyTable } from "@/data/word-families";
import { lessons } from "@/data";
import {
  findWordUsages,
  lessonVocabUsageCensus,
  wordFamilyUsageCensus,
} from "@/lib/word-usage";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پایه — همان قفل‌هایِ r252/r253
expect(findWordUsages("ability").length).toBe(1);
expect(findWordUsages("broadcast").length).toBe(0);

// جدولِ لنگردار — همان TABLE0ِ r256 (دهم · درس اول، ۲۸/۳۱ کاربرددار)
const TABLE0 = WORD_FAMILY_TABLES[0];
expect(TABLE0.grade).toBe("دهم");
expect(TABLE0.lesson).toBe("درس اول");

// لنگرهایِ پیش‌شمارشِ r257 — بی‌کاربردهایِ جدولِ اول
expect(wordFamilyUsageCensus(TABLE0.families).totalFamilies).toBe(31);
expect(wordFamilyUsageCensus(TABLE0.families).usedFamilies).toBe(28);

// لنگرهایِ واژه‌هایِ کاملاً استفاده‌شده — جدولِ ساختگیِ معکوس
expect(findWordUsages("communication").length).toBe(3);
expect(findWordUsages("culture").length).toBe(14);

// جدولِ ساختگیِ کاملاً استفاده‌شده — برایِ صداقتِ معکوس (در پیکرهٔ واقعی
// چنین جدولی نیست — پیش‌شمارشِ r257 صفر جدولِ تمام‌استفاده یافت)
const FULL_TABLE: WordFamilyTable = {
  grade: "دهم",
  vision: "Vision Full",
  lesson: "درس آزمونِ معکوس",
  families: [
    { noun: "communication", verb: "", adjective: "", adverb: "", fa: "ارتباط" },
    { noun: "culture", verb: "", adjective: "", adverb: "", fa: "فرهنگ" },
  ],
};

// fixtureِ درسِ ۱ با واژگانِ واقعیِ لایهٔ داده (لنگرِ ۱۳۳/۲۰۴)
const lesson1Real = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  vocabulary: lessons[0].vocabulary,
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

// fixtureِ کاملاً بی‌کاربرد — صداقتِ صفرِ سرشماریِ درس
const lessonZeroFixture = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  vocabulary: [
    { en: "broadcast", fa: "پخش" },
    { en: "amusement", fa: "سرگرمی" },
  ],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

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
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
});

describe("داده — لنگرهایِ پیش‌شمارشِ r257 (①)", () => {
  it("scopeهایِ بی‌کاربرد: همه=۹۲ · دهم=۲۹ · یازدهم=۲۰ · دوازدهم=۴۳ — مکملِ دقیقِ ۱۵۴/۸۱/۴۸/۲۵", () => {
    const scopes: Record<string, number> = {};
    for (const g of ["همه", "دهم", "یازدهم", "دوازدهم"] as const) {
      const tables = g === "همه" ? WORD_FAMILY_TABLES : WORD_FAMILY_TABLES.filter((t) => t.grade === g);
      scopes[g] = tables.reduce((s, t) => {
        const c = wordFamilyUsageCensus(t.families);
        return s + (c.totalFamilies - c.usedFamilies);
      }, 0);
    }
    expect(scopes["همه"]).toBe(92);
    expect(scopes["دهم"]).toBe(29);
    expect(scopes["یازدهم"]).toBe(20);
    expect(scopes["دوازدهم"]).toBe(43);
    // مکملِ دقیقِ سرشماریِ r256 — جمعِ دو لنز = کلِ خانواده‌ها
    expect(scopes["همه"]).toBe(246 - 154);
  });

  it("بی‌کاربردهایِ جدولِ اول دقیقاً سه خانواده‌اند: division/identification/injury", () => {
    const c0 = wordFamilyUsageCensus(TABLE0.families);
    const unusedIdx = TABLE0.families.map((_, fi) => fi).filter((fi) => !c0.usedFamilyIdx.includes(fi));
    expect(unusedIdx.length).toBe(3);
    const firstCells = unusedIdx.map(
      (fi) => TABLE0.families[fi].noun || TABLE0.families[fi].verb || TABLE0.families[fi].adjective || TABLE0.families[fi].adverb,
    );
    expect(firstCells).toEqual(["division", "identification", "injury"]);
  });

  it("سرشماریِ واژگانِ درس: درس ۱ = ۱۳۳ از ۲۰۴؛ جمعِ درس‌ها = ۱۹۱۵ از ۴۰۳۲ (هم‌مقیاسِ لنزِ دیکشنری)", () => {
    const c1 = lessonVocabUsageCensus(lessons[0].vocabulary);
    expect(c1.totalWords).toBe(204);
    expect(c1.usedWords).toBe(133);
    let used = 0;
    let total = 0;
    for (const l of lessons) {
      const c = lessonVocabUsageCensus(l.vocabulary);
      used += c.usedWords;
      total += c.totalWords;
    }
    expect(total).toBe(4032);
    expect(used).toBe(1915);
  });

  it("جدولِ کاملاً استفاده‌شده در پیکرهٔ واقعی وجود ندارد — FULL_TABLE ساختگیِ تست است", () => {
    for (const t of WORD_FAMILY_TABLES) {
      const c = wordFamilyUsageCensus(t.families);
      expect(c.usedFamilies).toBeLessThan(c.totalFamilies);
    }
    const cf = wordFamilyUsageCensus(FULL_TABLE.families);
    expect(cf.usedFamilies).toBe(cf.totalFamilies);
    expect(cf.usedFamilies).toBe(2);
  });
});

describe("کارتِ جدول — لنزِ معکوسِ unusedOnly (②)", () => {
  it("با unusedOnly: ۳ ردیف، چیپِ «۳ از ۳۱ خانوادهٔ بی‌کاربرد»، division/identification/injury حاضر و change حذف", () => {
    render(<WordFamilyTableCard table={TABLE0} unusedOnly />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(3 + 1); // + سرصفحه
    expect(screen.getByText(`${faNum(3)} از ${faNum(31)} خانوادهٔ بی‌کاربرد`)).toBeTruthy();
    expect(screen.getByText("division")).toBeTruthy();
    expect(screen.getByText("identification")).toBeTruthy();
    expect(screen.getByText("injury")).toBeTruthy();
    expect(screen.queryByText("change")).not.toBeInTheDocument();
    // چیپِ سرشماری در حالتِ لنزِ معکوس هم کلِ جدول را می‌گوید (سرشماریِ پیکره، نهِ دید)
    expect(screen.getByTestId("wf-usage-census").textContent).toContain(
      `${faNum(59)} از ${faNum(118)} سلول در جزوه`,
    );
  });

  it("پیش‌فرضِ دست‌نخورده: ۳۱ ردیف و چیپِ «۳۱ خانواده» — unusedOnly خاموش هیچ‌چیز را عوض نمی‌کند", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    expect(screen.getAllByRole("row").length).toBe(31 + 1);
    expect(screen.getByText(`${faNum(31)} خانواده`)).toBeTruthy();
  });

  it("جدولِ کاملاً استفاده‌شده در لنزِ معکوس ردیفِ خالیِ صادقانهٔ معکوس می‌گیرد — نه سکوتِ render", () => {
    render(<WordFamilyTableCard table={FULL_TABLE} unusedOnly />);
    expect(
      screen.getByText("در این جدول همهٔ خانواده‌ها در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند"),
    ).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(2); // سرصفحه + ردیفِ صادقانه
    expect(screen.getByText(`${faNum(0)} از ${faNum(2)} خانوادهٔ بی‌کاربرد`)).toBeTruthy();
    expect(screen.queryByText("communication")).not.toBeInTheDocument();
  });

  it("در حالتِ پیش‌فرضِ FULL_TABLE، ردیفِ معکوسِ صادقانه ظاهر نمی‌شود — فقط زیرِ لنز", () => {
    render(<WordFamilyTableCard table={FULL_TABLE} />);
    expect(
      screen.queryByText("در این جدول همهٔ خانواده‌ها در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("row").length).toBe(2 + 1);
  });
});

describe("ضمیمه — دوتاییِ متقابلاً انحصاریِ لنزها (③)", () => {
  it("گروهِ r256 هر دو دکمه را دارد: شمارنده‌هایِ ۱۵۴ و ۹۲ — و هرگز داخلِ گروهِ فیلترِ پایه", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const lensGroup = screen.getByRole("group", { name: "لنز کاربرددار جدول‌های اجزای کلماتی" });
    const usedToggle = within(lensGroup).getByTestId("pos-used-only-toggle");
    const unusedToggle = within(lensGroup).getByTestId("pos-unused-only-toggle");
    expect(usedToggle.getAttribute("aria-pressed")).toBe("false");
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("false");
    expect(usedToggle.textContent).toContain("فقط کاربرددارها");
    expect(usedToggle.textContent).toContain(faNum(154));
    expect(unusedToggle.textContent).toContain("فقط بی‌کاربردها");
    expect(unusedToggle.textContent).toContain(faNum(92));
    // قراردادِ r228: گروهِ فیلترِ پایه فقط چیپ‌هایِ پایه دارد
    const gradeGroup = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    expect(gradeGroup.contains(usedToggle)).toBe(false);
    expect(gradeGroup.contains(unusedToggle)).toBe(false);
  });

  it("کلیکِ لنزِ معکوس: aria-pressed=true و ردیف‌هایِ جدولِ اول به ۳ می‌رسد — division حاضر و change حذف", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const unusedToggle = screen.getByTestId("pos-unused-only-toggle");
    const usedToggle = screen.getByTestId("pos-used-only-toggle");
    fireEvent.click(unusedToggle);
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("true");
    expect(usedToggle.getAttribute("aria-pressed")).toBe("false");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(3 + 1);
    expect(first.getByText(`${faNum(3)} از ${faNum(31)} خانوادهٔ بی‌کاربرد`)).toBeTruthy();
    expect(first.getByText("division")).toBeTruthy();
    expect(first.queryByText("change")).not.toBeInTheDocument();
  });

  it("انحصارِ متقابل: روشن‌کردنِ کاربرددارها بی‌کاربردها را خاموش می‌کند — و برعکس", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const usedToggle = screen.getByTestId("pos-used-only-toggle");
    const unusedToggle = screen.getByTestId("pos-unused-only-toggle");
    fireEvent.click(unusedToggle);
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(usedToggle);
    expect(usedToggle.getAttribute("aria-pressed")).toBe("true");
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("false");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(28 + 1);
    // برعکس — از حالتِ used مستقیم به unused
    fireEvent.click(unusedToggle);
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("true");
    expect(usedToggle.getAttribute("aria-pressed")).toBe("false");
    expect(first.getAllByRole("row").length).toBe(3 + 1);
  });

  it("ترکیب با فیلترِ پایه: «دهم» + لنزِ معکوس = شمارندهٔ ۲۹ و جدولِ اول همچنان ۳ ردیف", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const unusedToggle = screen.getByTestId("pos-unused-only-toggle");
    const gradeGroup = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    const gradeBtn = within(gradeGroup)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith("دهم")) as HTMLElement;
    fireEvent.click(gradeBtn);
    expect(unusedToggle.textContent).toContain(faNum(29));
    fireEvent.click(unusedToggle);
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("true");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(3 + 1);
  });

  it("خاموش‌کردنِ لنزِ معکوس به دیدِ کامل برمی‌گردد — ۳۱ ردیف و چیپِ «۳۱ خانواده»", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const unusedToggle = screen.getByTestId("pos-unused-only-toggle");
    fireEvent.click(unusedToggle);
    fireEvent.click(unusedToggle);
    expect(unusedToggle.getAttribute("aria-pressed")).toBe("false");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(31 + 1);
    expect(first.getByText(`${faNum(31)} خانواده`)).toBeTruthy();
  });
});

describe("تبِ واژگانِ درس — سرشماریِ «N از M واژه در جزوه» (④)", () => {
  it("درسِ ۱ با واژگانِ واقعی: spanِ «۱۳۳ از ۲۰۴ واژه در جزوه» — اطلاعاتی، نه دکمه", () => {
    render(<VocabTab lesson={lesson1Real} />);
    const chip = screen.getByTestId("vocab-usage-census");
    expect(chip.tagName).toBe("SPAN");
    expect(chip.textContent).toContain(`${faNum(133)} از ${faNum(204)} واژه در جزوه`);
    // آیکنِ کتاب — همان زبانِ بصریِ خانوادهٔ «کاربرد در جزوه»
    expect(chip.querySelector("svg")).not.toBeNull();
  });

  it("درسِ کاملاً بی‌کاربرد هیچ سرشماری‌ای ندارد — بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ درس)", () => {
    render(<VocabTab lesson={lessonZeroFixture} />);
    expect(screen.queryByTestId("vocab-usage-census")).not.toBeInTheDocument();
  });
});

describe("تک‌منبعیِ سرشماریِ درس (⑤)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("lessonVocabUsageCensus فقط در lib تعریف می‌شود؛ vocab-tab از همان import می‌کند", () => {
    const lib = read("src/lib/word-usage.ts");
    expect(lib).toContain("export function lessonVocabUsageCensus");
    const tab = read("src/components/study/lesson/vocab-tab.tsx");
    expect(tab).toContain("lessonVocabUsageCensus");
    expect(tab).not.toContain("function lessonVocabUsageCensus");
    // هیچ سرشماریِ خصوصیِ دوم در درختِ study
    for (const f of [
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/lesson/appendix-view.tsx",
    ]) {
      expect(read(f), `${f} must not redefine the lesson census`).not.toContain("function lessonVocabUsageCensus");
    }
  });

  it("لنزِ معکوس در سطحِ منبع: دکمه، prop و چیپِ بی‌کاربرد همه حاضرند", () => {
    const appendix = read("src/components/study/lesson/appendix-view.tsx");
    expect(appendix).toContain("pos-unused-only-toggle");
    expect(appendix).toContain("فقط بی‌کاربردها");
    expect(appendix).toContain("unusedOnly={posLens === \"unused\"}");
    const card = read("src/components/study/lesson/word-family-table-card.tsx");
    expect(card).toContain("unusedOnly?: boolean");
    expect(card).toContain("خانوادهٔ بی‌کاربرد");
    expect(card).toContain("همهٔ خانواده‌ها در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند");
  });
});
