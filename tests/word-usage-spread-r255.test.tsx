// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۵ — «کاربرد در جزوه» به دو سطحِ باقی‌مانده رسید (بندِ ①
// پیشنهادِ ۲۵۴) — مصرف‌کننده‌هایِ پنجم و ششمِ دیالوگِ مشترک:
//
//   ① جدولِ «اجزای کلماتی» (word-family-table-card): هر سلولِ انگلیسیِ
//     غیرتهی که در متنِ مکالمه‌ها/ریدینگ‌هایِ جزوه واقعاً آمده باشد
//     چیپِ فشردهٔ آسمانی می‌گیرد (آیکن + شمارش — جدولِ پنج‌ستونه متر
//     است؛ نامِ کامل در title/aria-label)؛ بی‌کاربرد، هیچ. چون کارت هم
//     در ضمیمه و هم در تبِ واژگانِ درس رندر می‌شود، دو سطح با یک رندر
//     واردِ خانواده شدند — گاردِ یکپارچگیِ آکاردئونِ تبِ درس هم هست.
//   ② دفترِ اشتباهات (danger-words): ردیفِ هر واژهٔ خطرناک چیپِ کاملِ
//     «در جزوه · N» دارد — خطایِ مکرر یک کلیک تا متنِ واقعیِ جزوه.
//   ③ فضای نامِ a11y (درسِ r253): aria-labelِ هر دو خانوادهٔ چیپِ نو
//     «مکالمه‌ها و ریدینگ‌ها» می‌گوید، هرگز «جزوه»ی برهنه.
//   ④ سرشماریِ تک‌منبع: شش مصرف‌کننده، هیچ رونوشتِ خصوصیِ دیالوگ.
//
// لنگرهایِ داده‌ای قفل‌شده با پیش‌شمارشِ ترمینالِ r255:
// جدولِ «دهم · درس اول»: amaze:6 · amazing:6 · attention:1 · beauty:3 ·
// beautiful:8 · change:13 (دوبار — اسم و فعل) · amusement:0 ·
// amazingly:0 · attend:0 · correction:0 — و سرشماریِ کل: ۲۶۰ سلولِ
// کاربرددار از ۸۳۶ سلولِ انگلیسیِ غیرتهی.
// ability (درس ۱) دقیقاً یک سایت دارد — مکالمهٔ درس ۱۱ (پرشِ میان‌درسی
// r252)؛ broadcast صفر — همان لنگرهایِ r253.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import VocabTab from "@/components/study/lesson/vocab-tab";
import DangerWords from "@/components/study/practice/danger-words";
import { useStudy } from "@/lib/study-store";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { findWordUsages } from "@/lib/word-usage";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ داده‌ای — قفل‌شده با پیش‌شمارشِ ترمینالِ r255
expect(findWordUsages("ability").length).toBe(1);
expect(findWordUsages("ability")[0].lessonId).toBe(11);
expect(findWordUsages("ability")[0].kind).toBe("conversation");
expect(findWordUsages("broadcast").length).toBe(0);

// جدولِ اول («دهم · درس اول · Vision One») — همان که QA زنده دید
const TABLE0 = WORD_FAMILY_TABLES[0];
expect(TABLE0.grade).toBe("دهم");
expect(TABLE0.lesson).toBe("درس اول");

// سرشماریِ صادقانهٔ جدول‌ها — مستقیم از لایهٔ داده
let expectedFamilyUsage = 0;
let expectedFamilyCells = 0;
for (const t of WORD_FAMILY_TABLES)
  for (const f of t.families)
    for (const w of [f.noun, f.verb, f.adjective, f.adverb]) {
      if (!w) continue;
      expectedFamilyCells++;
      if (findWordUsages(w).length > 0) expectedFamilyUsage++;
    }
expect(expectedFamilyCells).toBe(836);
expect(expectedFamilyUsage).toBe(260);

// fixtureهایِ درسِ ۱ — vocabulary واقعیِ لنگرها
const lesson1Fixture = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  grade: "دهم",
  vocabulary: [
    { en: "ability", fa: "توانایی" },
    { en: "broadcast", fa: "پخش" },
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

describe("«کاربرد در جزوه» — جدولِ اجزای کلماتی (r255 ①)", () => {
  it("چیپِ فشرده با شمارشِ faNum رویِ سلول‌هایِ کاربرددار؛ کلیک → دیالوگِ مشترک با mark و ترجمهٔ جزوه", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    // لنگرها: amaze دقیقاً ۶ · attention دقیقاً ۱ · beauty دقیقاً ۳
    const amaze = screen.getByTestId("wf-usage-chip-amaze");
    expect(amaze).toHaveTextContent(faNum(6));
    expect(screen.getByTestId("wf-usage-chip-attention")).toHaveTextContent(faNum(1));
    expect(screen.getByTestId("wf-usage-chip-beauty")).toHaveTextContent(faNum(3));
    // آیکنِ کتاب — همان زبانِ بصریِ خانواده
    expect(amaze.querySelector("svg")).not.toBeNull();
    // کلیک → دیالوگِ مشترک با همان قراردادِ r252
    fireEvent.click(amaze);
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain("amaze");
    expect(dialog.textContent).toContain("در جزوه · ۶ کاربرد".replace("۶", faNum(6)));
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    for (const card of dialog.querySelectorAll("[data-testid=usage-site]")) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("واژهٔ هم‌نام در دو ستون (اسم و فعلِ change) دو چیپِ مستقل با همان شمارشِ ۱۳ دارد", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const changes = screen.getAllByTestId("wf-usage-chip-change");
    expect(changes.length).toBe(2); // اسم و فعلِ جدول — دو سلولِ مستقل
    for (const c of changes) expect(c).toHaveTextContent(faNum(13));
  });

  it("بی‌کاربرد، هیچ — amusement/amazingly/attend/correction چیپ ندارند (صداقتِ r252 در جدول)", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    expect(screen.queryByTestId("wf-usage-chip-amusement")).not.toBeInTheDocument();
    expect(screen.queryByTestId("wf-usage-chip-amazingly")).not.toBeInTheDocument();
    expect(screen.queryByTestId("wf-usage-chip-attend")).not.toBeInTheDocument();
    expect(screen.queryByTestId("wf-usage-chip-correction")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("فضای نامِ a11y (درسِ r253): هر چیپِ جدول «مکالمه‌ها و ریدینگ‌ها» می‌گوید، هرگز «جزوه»ی برهنه", () => {
    render(<WordFamilyTableCard table={TABLE0} />);
    const chips = screen.getAllByTestId(/^wf-usage-chip-/);
    expect(chips.length).toBeGreaterThanOrEqual(10);
    for (const c of chips) {
      const label = c.getAttribute("aria-label") ?? "";
      expect(label).toContain("مکالمه‌ها و ریدینگ‌ها");
      expect(label).not.toContain("جزوه");
      expect(label).toContain("مورد");
    }
  });

  it("یکپارچگیِ تبِ درس: آکاردئونِ «خانوادهٔ واژه‌های مرتبط» باز شود، همان چیپ‌ها و همان دیالوگ داخلِ درس حاضرند", () => {
    // درسِ ۱ اپ یازدهم·درس اول است — جدولِ پیوندش WORD_FAMILY_LESSON_LINKS[1]
    // با لنگرِ پیش‌شمارش‌شده: communicate دقیقاً ۳ سایت (پرشِ میان‌درسی به درس‌های ۱/۲)
    render(<VocabTab lesson={lesson1Fixture} />);
    fireEvent.click(screen.getByRole("button", { name: /خانوادهٔ واژه‌های مرتبط/ }));
    const chip = screen.getByTestId("wf-usage-chip-communicate");
    expect(chip).toHaveTextContent(faNum(3));
    fireEvent.click(chip);
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain("communicate");
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });
});

describe("«کاربرد در جزوه» — دفترِ اشتباهات (r255 ②)", () => {
  it("ردیفِ واژهٔ خطری که در جزوه زندگی می‌کند چیپِ کاملِ «در جزوه · N» دارد؛ کلیک → دیالوگِ مشترک", () => {
    useStudy.setState({
      wordMistakes: { "1:ability": 3 },
      wordSeen: { "1:ability": 4 },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<DangerWords />);
    const chip = screen.getByTestId("danger-usage-chip-ability");
    expect(chip).toHaveTextContent("در جزوه");
    expect(chip).toHaveTextContent(faNum(1)); // لنگرِ r253: دقیقاً یک سایت
    fireEvent.click(chip);
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain("ability");
    // همان پرشِ میان‌درسیِ لنگردار: مکالمهٔ درس ۱۱
    expect(dialog.textContent).toContain("مکالمه");
    expect(dialog.textContent).toContain(`درس ${faNum(11)}`);
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("واژهٔ خطری که بی‌کاربرد است هیچ چیپی ندارد — حتی وقتی خطاترین ردیف است", () => {
    useStudy.setState({
      // broadcast خطاترین ردیف است (اشتباهِ بیشتر) ولی صفر سایت دارد
      wordMistakes: { "1:ability": 2, "1:broadcast": 5 },
      wordSeen: { "1:ability": 4, "1:broadcast": 6 },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<DangerWords />);
    // هر دو ردیف حاضرند (رتبه‌بندی کار می‌کند)...
    expect(screen.getByText("broadcast")).toBeInTheDocument();
    expect(screen.getByText("ability")).toBeInTheDocument();
    // ...اما فقط ability چیپ دارد — بی‌کاربرد، هیچ
    expect(screen.getByTestId("danger-usage-chip-ability")).toBeInTheDocument();
    expect(screen.queryByTestId("danger-usage-chip-broadcast")).not.toBeInTheDocument();
  });

  it("فضای نامِ a11y: چیپِ دفترِ اشتباهات هم «مکالمه‌ها و ریدینگ‌ها» می‌گوید", () => {
    useStudy.setState({
      wordMistakes: { "1:ability": 3 },
      wordSeen: { "1:ability": 4 },
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<DangerWords />);
    const chip = screen.getByTestId("danger-usage-chip-ability");
    const label = chip.getAttribute("aria-label") ?? "";
    expect(label).toContain("مکالمه‌ها و ریدینگ‌ها");
    expect(label).not.toContain("جزوه");
  });
});

describe("سرشماریِ تک‌منبعِ دیالوگ (r255 ④) — چهار → شش مصرف‌کننده", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  const CONSUMERS: Array<[string, string]> = [
    ["src/components/study/lesson/dictionary-view.tsx", 'from "./word-usage-dialog"'],
    ["src/components/study/lesson/vocab-tab.tsx", 'from "./word-usage-dialog"'],
    ["src/components/study/lesson/flashcards.tsx", 'from "./word-usage-dialog"'],
    ["src/components/study/lesson/word-of-day.tsx", 'from "./word-usage-dialog"'],
    ["src/components/study/lesson/word-family-table-card.tsx", 'from "./word-usage-dialog"'],
    ["src/components/study/practice/danger-words.tsx", 'from "../lesson/word-usage-dialog"'],
  ];

  it("شش مصرف‌کننده از دیالوگِ مشترک import می‌کنند و هیچ‌کدام رونوشتِ خصوصی ندارند", () => {
    for (const [f, importPath] of CONSUMERS) {
      const src = read(f);
      expect(src, `${f} must import the shared dialog`).toContain(importPath);
      expect(src, `${f} must NOT carry a private copy`).not.toContain('data-testid="usage-dialog"');
    }
    // و markupِ دیالوگ فقط در فایلِ مشترک زندگی می‌کند
    const shared = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(shared).toContain('data-testid="usage-dialog"');
    expect(shared).toContain('data-testid="usage-site"');
  });

  it("دو خانوادهٔ چیپِ نو از یک قراردادِ aria-label حرف می‌زنند — درسِ a11yِ r253 در سطحِ منبع قفل است", () => {
    // r389 — قالبِ چیپِ «در جزوه · N» (و ariaِ همسانش) به مالکِ یکتایِ
    // BookletUsageChip رفت؛ داورِ خطر (عضوِ دومِ این زوجِ r255) حالا از
    // مالک وام میگیرد و مالکِ وامگیرنده خودش قراردادِ «مکالمه‌ها و
    // ریدینگ‌ها» را حمل میکند. جدولِ خانواده (عضوِ اول) گویشِ فشردهٔ
    // سرشماریِ سلول خودش را دارد — حکمِ «نخیر»ِ سرشماریِ r389 (درسِ
    // r386: فقط زیرگروهِ بایتهمسان یکجا میشود) — مستند در سرصفحهٔ مالک.
    const danger = read("src/components/study/practice/danger-words.tsx");
    expect(danger, "danger-words must borrow the r389 chip owner").toContain(
      "import BookletUsageChip, { useBookletUsageTarget }"
    );
    const owner = read("src/components/study/lesson/booklet-usage-chip.tsx");
    expect(owner, "the r389 owner carries the r253 a11y contract").toContain(
      "در مکالمه‌ها و ریدینگ‌ها"
    );
  });
});
