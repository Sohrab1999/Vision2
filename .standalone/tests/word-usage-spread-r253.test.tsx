// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۳ — گسترشِ خانوادهٔ «کاربرد در جزوه» به دو سطحِ باقی‌ماندهٔ واژه
// و لنزِ ششمِ دیکشنری (بندِ ①+② پیشنهادِ ۲۵۲):
//
//   ① تبِ واژگانِ درس: چیپِ «در جزوه» رویِ کارتِ کاربرددار؛ کلیک →
//     دیالوگِ مشترک با mark و ترجمهٔ فارسیِ خودِ جزوه؛ stopPropagation:
//     کارتِ کلیکِ خودش را دارد (بلدم‌کردن) — چیپ نباید toggle کند؛
//     واژهٔ بی‌کاربرد هیچ چیپی ندارد (بی‌کاربرد، هیچ — صداقتِ r252).
//   ② پشتِ فلش‌کارت: چیپ در ایدئومِ سفیدِ رویِ گرادیان؛ کلیک دیالوگِ
//     مشترک را باز می‌کند و کارت flip نمی‌شود (stopPropagation).
//   ③ لنزِ «کاربرددار» در دیکشنری: چیپ با شمارندهٔ صادقانهٔ هم‌مقیاسِ
//     با لایهٔ داده؛ فیلتر واقعی — هر کارتِ نمایان چیپ دارد و «N واژه
//     یافت شد» با badge یکی می‌خواند؛ با فیلترِ درس و جستجو ترکیب
//     می‌شود؛ «همه» کلِ دیکشنری را برمی‌گرداند؛ سرشماریِ ردیفِ وضعیت ۵→۶.
//   ④ تک‌منبعِ دیالوگ: markupِ usage-dialog فقط در word-usage-dialog
//     زندگی می‌کند و هر سه مصرف‌کننده از همان import می‌کنند — هیچ
//     رونوشتِ دومی که از حقیقت عقب بماند.
//
// لنگرهایِ داده‌ایِ قفل‌شده با پیش‌شمارشِ r253: ability (درس ۱) دقیقاً
// یک سایت دارد — مکالمهٔ درس ۱۱ (پرشِ میان‌درسیِ r252)؛ broadcast (درس ۱)
// صفر سایت — بی‌کاربرد، هیچ.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import VocabTab from "@/components/study/lesson/vocab-tab";
import Flashcards from "@/components/study/lesson/flashcards";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { findWordUsages } from "@/lib/word-usage";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ داده‌ای — قفل‌شده با پیش‌شمارشِ ترمینالِ r253
expect(findWordUsages("ability").length).toBe(1);
expect(findWordUsages("ability")[0].lessonId).toBe(11);
expect(findWordUsages("ability")[0].kind).toBe("conversation");
expect(findWordUsages("broadcast").length).toBe(0);

// شمارندهٔ صادقانهٔ لنز — مستقیم از لایهٔ داده (همان قراردادِ expectedPairedِ r205)
const allWords = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const expectedUsage = allWords.filter((w) => findWordUsages(w.en).length > 0).length;
const GRID_CAP = 300;

// fixtureهایِ درسِ ۱ — vocabulary واقعیِ لنگرها؛ نمایهٔ کاربرد همه‌درسی است
const lesson1Fixture = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
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

const flipCard = () =>
  document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
});

describe("«کاربرد در جزوه» — تبِ واژگانِ درس (r253 ①)", () => {
  it("چیپِ «در جزوه» با شمارشِ faNum رویِ کارتِ ability؛ کلیک → دیالوگِ مشترک با mark و ترجمهٔ جزوه", () => {
    render(<VocabTab lesson={lesson1Fixture} />);
    const chip = screen.getByTestId("usage-chip-ability");
    expect(chip).toHaveTextContent("در جزوه");
    expect(chip).toHaveTextContent(faNum(1)); // لنگر: دقیقاً یک سایت
    act_open: {
      fireEvent.click(chip);
      break act_open;
    }
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain("ability");
    // تک‌سایتِ ability مکالمهٔ درس ۱۱ است — پرشِ میان‌درسی
    expect(dialog.textContent).toContain("مکالمه");
    expect(dialog.textContent).toContain(`درس ${faNum(11)}`);
    // markهایِ amberِ ریمپ‌شدهٔ kernel + ترجمهٔ فارسیِ خودِ جزوه
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    const site = dialog.querySelector("[data-testid=usage-site]")!;
    expect(site.textContent).toContain("مکالمه");
    // بستن
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("کلیکِ چیپ «بلدم» toggle نمی‌کند (stopPropagation — قراردادِ کارتِ خودِ r205)", () => {
    render(<VocabTab lesson={lesson1Fixture} />);
    fireEvent.click(screen.getByTestId("usage-chip-ability"));
    expect(useStudy.getState().known).toEqual({}); // toggleKnown هرگز صدا نخورد
  });

  it("واژهٔ بی‌کاربرد هیچ چیپی ندارد — بی‌کاربرد، هیچ (صداقتِ r252 در سطحِ درس)", () => {
    render(<VocabTab lesson={lesson1Fixture} />);
    expect(screen.queryByTestId("usage-chip-broadcast")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("فضای نامِ a11y: کارتِ واژه نامِ صریح دارد و چیپ با تبِ «جزوه» تصادم نمی‌گیرد (درسِ زندهٔ r209)", () => {
    render(<VocabTab lesson={lesson1Fixture} />);
    // نامِ دسترس‌پذیریِ کارت صریح است — دیگر دیوارِ متنِ کلِ محتوا نیست
    const card = screen.getByRole("button", { name: "ability — کلیک: بلدم‌کردن" });
    expect(card).toHaveAttribute("aria-pressed", "false");
    // و چیپ «جزوه»ی برهنه در نامش ندارد — کلاسِ تصادمِ کوئریِ تبِ جزوه بسته است
    const chip = screen.getByTestId("usage-chip-ability");
    expect(chip.getAttribute("aria-label")).not.toContain("جزوه");
    // toggleِ کارت با نامِ صریح هم کار می‌کند (قراردادِ خودِ کارت سالم)
    fireEvent.click(card);
    expect(useStudy.getState().known["1:ability"]).toBe(true);
  });
});

describe("«کاربرد در جزوه» — پشتِ فلش‌کارت (r253 ②)", () => {
  it("بعد از flip، چیپِ سفیدِ رویِ گرادیان حاضر است؛ کلیکش دیالوگ را باز می‌کند و کارت flip نمی‌شود", () => {
    render(<Flashcards lesson={lesson1Fixture} onExit={() => {}} />);
    const card = flipCard();
    fireEvent.click(card); // flip به پشت
    expect(card.className).toContain("flipped");
    const chip = screen.getByTestId("flash-usage-chip");
    expect(chip).toHaveTextContent("در جزوه");
    expect(chip).toHaveTextContent(faNum(1));
    expect(chip.className).toContain("bg-black/20"); // ایدئومِ حجابِ تیرهٔ r333 (تینتِ سفیدِ کهنه ۲٫۲ می‌داد)
    fireEvent.click(chip);
    // دیالوگِ مشترک با همان قراردادِ r252
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain("ability");
    expect(dialog.textContent).toContain(`درس ${faNum(11)}`);
    // stopPropagation: flip دست‌نخورده — چیپ نباید کارت را برگرداند
    expect(flipCard().className).toContain("flipped");
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("واژهٔ بی‌کاربرد رویِ فلش‌کارت هم هیچ چیپی ندارد", () => {
    render(
      <Flashcards
        lesson={{ ...lesson1Fixture, vocabulary: [{ en: "broadcast", fa: "پخش" }] } as unknown as LessonData}
        onExit={() => {}}
      />
    );
    expect(screen.queryByTestId("flash-usage-chip")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });
});

describe("لنزِ «کاربرددار» دیکشنری (r253 ③)", () => {
  it("چیپ با شمارندهٔ صادقانهٔ هم‌مقیاسِ لایهٔ داده حاضر است — سرشماریِ ردیفِ وضعیت ۵ → ۶", () => {
    render(<DictionaryView />);
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    const chips = within(row).getAllByRole("button");
    expect(chips.length).toBe(6); // همه/بلدم/بلد نیستم/سررسید/جفت‌دار/کاربرددار
    const lens = within(row).getByRole("button", { name: /کاربرددار/ });
    expect(lens).toHaveTextContent(faNum(expectedUsage));
    expect(expectedUsage).toBeGreaterThan(1000); // لنگرِ پیش‌شمارش: ۱۹۱۵ از ۴۰۳۲
  });

  it("کلیکِ لنز فقط کارت‌هایِ کاربرددار را می‌گذارد — هر کارتِ نمایان چیپ دارد و «N یافت شد» با badge یکی است", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    const found = screen.getByText(/واژه یافت شد/);
    expect(found).toHaveTextContent(faNum(expectedUsage));
    const grid = document.querySelector(".nice-scroll") as HTMLElement;
    const cards = grid.querySelectorAll(":scope > div");
    expect(cards.length).toBe(Math.min(expectedUsage, GRID_CAP));
    for (const card of cards) {
      expect(card.querySelector('[data-testid^="usage-chip-"]')).not.toBeNull();
    }
  });

  it("با فیلترِ درس ترکیب می‌شود — زیرمجموعهٔ کاربرددارِ درس ۳", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    fireEvent.click(screen.getByRole("button", { name: "درس ۳: هنر و فرهنگ" }));
    const l3 = lessons.find((l) => l.id === 3)!.vocabulary;
    const expected = l3.filter((w) => findWordUsages(w.en).length > 0).length;
    expect(expected).toBeGreaterThan(0);
    expect(screen.getByText(/واژه یافت شد/)).toHaveTextContent(faNum(expected));
  });

  it("با جستجو ترکیب می‌شود — communication زیرِ لنز می‌ماند، broadcast خالیِ صادقانه", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    const input = screen.getByPlaceholderText(/language یا زبان/);
    fireEvent.change(input, { target: { value: "communication" } });
    expect(screen.getAllByTestId("usage-chip-communication").length).toBeGreaterThanOrEqual(1);
    fireEvent.change(input, { target: { value: "broadcast" } });
    expect(screen.getByText("واژه‌ای با این فیلترها یافت نشد")).toBeInTheDocument();
  });

  it("بازگشت به «همه» کلِ دیکشنری را برمی‌گرداند", () => {
    render(<DictionaryView />);
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: new RegExp(`^همه\\s*${faNum(allWords.length)}$`) }));
    expect(screen.getByText(/واژه یافت شد/)).toHaveTextContent(faNum(allWords.length));
  });
});

describe("تک‌منبعِ دیالوگِ «کاربرد در جزوه» (r253 ④)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
  const CONSUMERS = [
    "src/components/study/lesson/dictionary-view.tsx",
    "src/components/study/lesson/vocab-tab.tsx",
    "src/components/study/lesson/flashcards.tsx",
  ];

  it("markupِ usage-dialog فقط در word-usage-dialog زندگی می‌کند و هر سه مصرف‌کننده از همان import می‌کنند", () => {
    const shared = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(shared).toContain('data-testid="usage-dialog"');
    expect(shared).toContain('data-testid="usage-site"');
    for (const f of CONSUMERS) {
      const src = read(f);
      expect(src, `${f} must import the shared dialog`).toContain(
        'from "./word-usage-dialog"'
      );
      expect(src, `${f} must NOT carry a private copy of the dialog`).not.toContain(
        'data-testid="usage-dialog"'
      );
    }
  });
});
