// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۶ — لنزِ «فقط کاربرددارها» + سرشماریِ هدرِ جدول (بندِ ①+②
// پیشنهادِ ۲۵۵): هر جدولِ «اجزای کلماتی» حالا دو چیزِ تازه دارد:
//
//   ① چیپِ سرشماریِ آسمانیِ «N از M سلول در جزوه» در هدر — spanِ
//      اطلاعاتی (نه دکمه)، فقط با شمارشِ واقعی؛ بی‌کاربرد، هیچ.
//   ② propِ usedOnly (لنزِ ضمیمه): ردیف‌ها به خانواده‌هایِ کاربرددار
//      (دست‌کم یک سلول در متن) محدود می‌شوند؛ «N خانواده» می‌شود
//      «N از M خانواده»؛ جدولِ خالیِ واقعی ردیفِ صادقانه می‌گیرد.
//
// تک‌منبع: wordFamilyUsageCensus در lib — هم چیپِ هدر و هم شمارندهٔ
// لنزِ ضمیمه از همان می‌خورند؛ هیچ سرشماریِ خصوصیِ دوم.
//
// لنگرهایِ داده‌ای قفل‌شده با پیش‌شمارشِ ترمینالِ r256:
//   wf-g10-l1 (دهم·درس اول): ۲۸ خانوادهٔ کاربرددار از ۳۱ · ۵۹ سلول از ۱۱۸
//   wf-g11-l1 (یازدهم·درس اول): ۱۹ از ۲۴ · ۳۰ از ۷۶ (همان ۳۰ چیپِ r255)
//   scopeها: همه=۱۵۴ خانواده · دهم=۸۱ · یازدهم=۴۸ · دوازدهم=۲۵
//   خانوادهٔ بی‌کاربردِ واقعیِ جدولِ اول: division/divide/divisible
//   واژه‌هایِ صفر: amusement · broadcast · amazement
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { WORD_FAMILY_TABLES, type WordFamilyTable } from "@/data/word-families";
import {
  findWordUsages,
  wordFamilyUsageCensus,
} from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پایه — همان قفل‌هایِ r252/r253
expect(findWordUsages("ability").length).toBe(1);
expect(findWordUsages("broadcast").length).toBe(0);

// جدول‌هایِ لنگردار — پیش‌شمارشِ ترمینالِ r256
const TABLE0 = WORD_FAMILY_TABLES[0];
expect(TABLE0.grade).toBe("دهم");
expect(TABLE0.lesson).toBe("درس اول");
const TABLE11L1 = WORD_FAMILY_TABLES.find((t) => t.grade === "یازدهم" && t.lesson === "درس اول")!;
expect(TABLE11L1).toBeTruthy();

// جدولِ ساختگیِ کاملاً بی‌کاربرد — برایِ صداقتِ صفر
const ZERO_TABLE: WordFamilyTable = {
  grade: "دهم",
  vision: "Vision Zero",
  lesson: "درس آزمون",
  families: [
    { noun: "broadcast", verb: "", adjective: "", adverb: "", fa: "پخش" },
    { noun: "amusement", verb: "", adjective: "", adverb: "", fa: "سرگرمی" },
  ],
};

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

describe("تک‌منبعِ سرشماری — wordFamilyUsageCensus (r256 ①)", () => {
  it("لنگرهایِ پیش‌شمارش: جدولِ اول ۲۸/۳۱ خانواده و ۵۹/۱۱۸ سلول؛ یازدهمِ اول ۱۹/۲۴ و ۳۰/۷۶", () => {
    const c0 = wordFamilyUsageCensus(TABLE0.families);
    expect(c0.totalFamilies).toBe(31);
    expect(c0.usedFamilies).toBe(28);
    expect(c0.totalCells).toBe(118);
    expect(c0.usedCells).toBe(59);
    const c11 = wordFamilyUsageCensus(TABLE11L1.families);
    expect(c11.totalFamilies).toBe(24);
    expect(c11.usedFamilies).toBe(19);
    expect(c11.totalCells).toBe(76);
    expect(c11.usedCells).toBe(30);
  });

  it("usedFamilyIdx دقیقاً اندیسِ خانواده‌هایِ کاربرددار است — اولین عضو، خانوادهٔ amusement/amaze است و سلولِ amusementِ خودش صفر می‌ماند", () => {
    const c0 = wordFamilyUsageCensus(TABLE0.families);
    expect(c0.usedFamilyIdx.length).toBe(28);
    expect(c0.usedFamilyIdx[0]).toBe(0); // amusement/amaze/amazing/amazingly — خانواده کاربرددار
    expect(findWordUsages("amusement").length).toBe(0); // ولی سلولِ amusement خودش صفر است (ر255)
    // اندیس‌ها صعودی و بی‌تکرار — فیلترِ لنز به ترتیبِ جدول وفادار می‌ماند
    for (let i = 1; i < c0.usedFamilyIdx.length; i++) {
      expect(c0.usedFamilyIdx[i]).toBeGreaterThan(c0.usedFamilyIdx[i - 1]);
    }
  });

  it("جدولِ کاملاً بی‌کاربرد: همهٔ صفرها صادقانه — usedFamilyIdx خالی", () => {
    const cz = wordFamilyUsageCensus(ZERO_TABLE.families);
    expect(cz.totalFamilies).toBe(2);
    expect(cz.usedFamilies).toBe(0);
    expect(cz.totalCells).toBe(2);
    expect(cz.usedCells).toBe(0);
    expect(cz.usedFamilyIdx).toEqual([]);
  });

  it("سرشماریِ کلِ پیکره با پیش‌شمارشِ ترمینال می‌خواند: ۱۵۴ خانواده از ۲۴۶ · ۲۶۰ سلول از ۸۳۶", () => {
    let usedFam = 0;
    let cells = 0;
    let usedCells = 0;
    let fams = 0;
    for (const t of WORD_FAMILY_TABLES) {
      const c = wordFamilyUsageCensus(t.families);
      usedFam += c.usedFamilies;
      cells += c.totalCells;
      usedCells += c.usedCells;
      fams += c.totalFamilies;
    }
    expect(fams).toBe(246);
    expect(usedFam).toBe(154);
    expect(cells).toBe(836);
    expect(usedCells).toBe(260);
  });
});

describe("چیپِ سرشماریِ هدرِ جدول (r256 ①)", () => {
  it("هدرِ جدولِ اول «۵۹ از ۱۱۸ سلول در جزوه» دارد — spanِ اطلاعاتی، نه دکمه", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const chip = screen.getByTestId("wf-usage-census");
    expect(chip.tagName).toBe("SPAN");
    expect(chip.textContent).toContain(`${faNum(59)} از ${faNum(118)} سلول در جزوه`);
    // آیکنِ کتاب — همان زبانِ بصریِ خانوادهٔ «کاربرد در جزوه»
    expect(chip.querySelector("svg")).not.toBeNull();
  });

  it("یازدهمِ اول: «۳۰ از ۷۶» — همان ۳۰ چیپِ سلولیِ r255 با سرشماریِ هم‌مقیاس", () => {
    render(<WordFamilyTableCard table={TABLE11L1} />);
    expect(screen.getByTestId("wf-usage-census").textContent).toContain(
      `${faNum(30)} از ${faNum(76)} سلول در جزوه`,
    );
  });

  it("جدولِ کاملاً بی‌کاربرد هیچ چیپِ سرشماری ندارد — بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ جدول)", () => {
    render(<WordFamilyTableCard table={ZERO_TABLE} />);
    expect(screen.queryByTestId("wf-usage-census")).not.toBeInTheDocument();
  });
});

describe("لنزِ «فقط کاربرددارها» در سطحِ کارت (r256 ②)", () => {
  it("پیش‌فرض دست‌نخورده: ۳۱ ردیف + سرصفحه، چیپِ «۳۱ خانواده»، خانوادهٔ بی‌کاربردِ division حاضر", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(31 + 1); // + سرصفحه
    expect(screen.getByText(`${faNum(31)} خانواده`)).toBeTruthy();
    expect(screen.getByText("division")).toBeTruthy();
  });

  it("با usedOnly: ۲۸ ردیف، چیپِ «۲۸ از ۳۱ خانواده»، division حذف و amusement حاضر", () => {
    render(<WordFamilyTableCard table={TABLE0} usedOnly />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(28 + 1); // + سرصفحه
    expect(screen.getByText(`${faNum(28)} از ${faNum(31)} خانواده`)).toBeTruthy();
    expect(screen.queryByText("division")).not.toBeInTheDocument();
    expect(screen.getByText("amusement")).toBeTruthy(); // خانواده‌اش در متن زندگی می‌کند
    // چیپِ سرشماری در حالتِ لنز هم کلِ جدول را می‌گوید (سرشماریِ پیکره، نهِ دید)
    expect(screen.getByTestId("wf-usage-census").textContent).toContain(
      `${faNum(59)} از ${faNum(118)} سلول در جزوه`,
    );
  });

  it("جدولِ بی‌خانوادهٔ کاربرددار در حالتِ لنز ردیفِ خالیِ صادقانه می‌گیرد — نه سکوتِ render", () => {
    render(<WordFamilyTableCard table={ZERO_TABLE} usedOnly />);
    expect(screen.queryByTestId("wf-usage-census")).not.toBeInTheDocument();
    expect(
      screen.getByText("در این جدول هیچ خانواده‌ای در متنِ مکالمه‌ها و ریدینگ‌های جزوه زندگی نمی‌کند"),
    ).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(2); // سرصفحه + ردیفِ صادقانه
  });
});

describe("لنزِ ضمیمه — دکمهٔ «فقط کاربرددارها» (r256 ③)", () => {
  it("دکمه در گروهِ خودش است (هرگز داخلِ گروهِ فیلترِ پایه — قراردادِ r228) با aria-pressed و شمارندهٔ ۱۵۴", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const lensGroup = screen.getByRole("group", { name: "لنز کاربرددار جدول‌های اجزای کلماتی" });
    const toggle = within(lensGroup).getByTestId("pos-used-only-toggle");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.textContent).toContain("فقط کاربرددارها");
    expect(toggle.textContent).toContain(faNum(154));
    // قراردادِ r228: گروهِ فیلترِ پایه فقط چیپ‌هایِ پایه دارد
    const gradeGroup = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    expect(gradeGroup.contains(toggle)).toBe(false);
  });

  it("کلیکِ لنز: aria-pressed=true و ردیف‌هایِ جدولِ اول به ۲۸ می‌رسد — با همان سرشماریِ لنگردار", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const toggle = screen.getByTestId("pos-used-only-toggle");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(28 + 1);
    expect(first.getByText(`${faNum(28)} از ${faNum(31)} خانواده`)).toBeTruthy();
    expect(first.queryByText("division")).not.toBeInTheDocument();
    // جدولِ کم‌کاربردترینِ پیکره هم لنگردار است: دوازدهمِ دوم «۱۰ از ۷۷»
    const g12l2 = within(document.getElementById("wf-table-wf-g12-l2")!);
    expect(g12l2.getByTestId("wf-usage-census").textContent).toContain(
      `${faNum(10)} از ${faNum(77)} سلول در جزوه`,
    );
  });

  it("ترکیبِ لنز با فیلترِ پایه: «دهم» + لنز = شمارندهٔ ۸۱ (هم‌مقیاسِ scope، قفلِ r253)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const toggle = screen.getByTestId("pos-used-only-toggle");
    // فیلترِ پایه — دکمهٔ «دهم» در گروهِ پایه
    const gradeGroup = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    const gradeBtn = within(gradeGroup)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith("دهم")) as HTMLElement;
    fireEvent.click(gradeBtn);
    expect(toggle.textContent).toContain(faNum(81));
    // حالا لنز روشن شود — جدولِ اول همچنان ۲۸ ردیف دارد و ناوبریِ scope کار می‌کند
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(28 + 1);
  });

  it("خاموش‌کردنِ لنز به دیدِ کامل برمی‌گردد — ۳۱ ردیفِ جدولِ اول و چیپِ «۳۱ خانواده»", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const toggle = screen.getByTestId("pos-used-only-toggle");
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(first.getAllByRole("row").length).toBe(31 + 1);
    expect(first.getByText(`${faNum(31)} خانواده`)).toBeTruthy();
  });
});

describe("تک‌منبعیِ سرشماری (r256 ④)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("wordFamilyUsageCensus فقط در lib تعریف می‌شود؛ کارت و ضمیمه از همان import می‌کنند", () => {
    const lib = read("src/lib/word-usage.ts");
    expect(lib).toContain("export function wordFamilyUsageCensus");
    for (const f of [
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/lesson/appendix-view.tsx",
    ]) {
      const src = read(f);
      expect(src, `${f} must import the single-source census`).toContain("wordFamilyUsageCensus");
      expect(src, `${f} must not redefine it`).not.toContain("function wordFamilyUsageCensus");
    }
    // هیچ فایلِ دیگری در درختِ study سرشماریِ خصوصی ندارد
    for (const f of ["src/components/study/lesson/vocab-tab.tsx", "src/components/study/practice/danger-words.tsx"]) {
      expect(read(f)).not.toContain("wordFamilyUsageCensus");
    }
  });

  it("شمارندهٔ لنز «خانواده» می‌شمارد نه «سلول» — هم‌مقیاسیِ برچسب‌ها با چیپِ «N خانواده»", () => {
    // قفلِ سطحِ منبع: متنِ دکمه و برچسبِ هدر هر دو از خانوادهٔ «خانواده»اند
    const appendix = read("src/components/study/lesson/appendix-view.tsx");
    expect(appendix).toContain("فقط کاربرددارها");
    const card = read("src/components/study/lesson/word-family-table-card.tsx");
    expect(card).toContain("خانواده");
    expect(card).toContain("سلول در جزوه");
  });
});
