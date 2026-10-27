// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۵ — «کاربرد در جزوه» دو سطحِ تازه: واژهٔ امروز + واژه‌های
// زندهٔ خطوطِ مکالمه (بندِ ① پیشنهادِ ۲۵۳/۲۵۴)
//
// سطحِ WOTD: چیپِ «در جزوه · N» کنارِ واژهٔ روز — همان تک‌منبعِ
//   findWordUsages، همان دیالوگِ مشترکِ r252-r253؛ بی‌کاربرد، هیچ.
// سطحِ مکالمه: هر خطِ مکالمه، واژه‌های زندهٔ خودش را از واژگانِ همان
//   درس نشان می‌دهد (همان معناشناسیِ تطبیق — مرزِ واژه + پسوندهایِ
//   مجاز)؛ کلیکِ چیپ فقط دیالوگ را باز می‌کند — پخش و بقیهٔ وضعیت‌ها
//   دست‌نخورده. دیالوگ اما کاربردِ سراسرِ جزوه را می‌دهد (پرشِ
//   میان‌درسیِ r252).
//
// گاردهایِ این فایل — همه داده‌محور، نه پینِ دستی:
//   ① WOTD: چیپ خودسازگار با تک‌منبع (هر دو شاخه: واژهٔ کاربرددارِ
//     امروز → چیپ + دیالوگ؛ واژهٔ بی‌کاربرد → بی‌چیپ — صداقت).
//   ② مکالمه: چیپ‌هایِ هر خط دقیقاً از تشخیصِ مستقلِ تست می‌آیند؛
//     کلیک → دیالوگِ مشترک؛ پخشِ کل هنوز «پخش» است نه «توقف».
//   ③ قفلِ دامنه: چیپ‌ها فقط از واژگانِ همین درس — واژهٔ درسِ دیگر
//     حتی اگر در خط زندگی کند چیپ نمی‌گیرد (پیش‌شرطِ داده قفل می‌شود).
//   ④ صداقتِ خطوط: خطِ بی‌واژه هیچ ردیفی ندارد؛ شمارشِ ردیف‌ها =
//     شمارشِ خط‌هایِ واژه‌دارِ تشخیصِ مستقل.
//   ⑤ دیالوگ از خطِ مکالمه: markِ amber + نشانِ نوع + ترجمهٔ جزوه +
//     شمارشِ سرصفحهٔ دیالوگ = شمارشِ مستقل (سقفِ ۸ رعایت).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import WordOfDay from "@/components/study/lesson/word-of-day";
import ConversationTab from "@/components/study/lesson/conversation-tab";
import { findWordUsages, wordFormRegex } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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
    lessonTab: "conversation",
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

/** تشخیصِ مستقلِ تست — همان معناشناسیِ مرزِ واژه + پسوندهایِ مجاز،
 *  با wordFormRegex (معناشناسیِ تطبیق خودش در پیمان‌های r252 قفل است)؛
 *  ددوپِ هم‌نامیِ داخلِ یک فهرست هم اینجاست. */
function expectedHitsFor(line: { en: string }, vocab: { en: string }[]): string[] {
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const w of vocab) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (wordFormRegex(w.en).test(line.en)) hits.push(w.en);
  }
  return hits;
}

/** بازتابِ منطقِ انتخابِ WOTD — همان بذرِ روز؛ برایِ گاردِ دو-شاخه‌ایِ ① */
function todayWotdEn(): string {
  const all = lessons.flatMap((l) => l.vocabulary.map((w) => w.en));
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return all[seed % all.length];
}

const chipWordOf = (chip: HTMLElement): string =>
  chip.getAttribute("aria-label")?.match(/کاربرد (.+?) در جزوه/)?.[1] ?? "";

describe("«کاربرد در جزوه» — سطوحِ WOTD و مکالمه — r255", () => {
  it("① WOTD: چیپِ «در جزوه» خودسازگار با تک‌منبع؛ واژهٔ بی‌کاربردِ امروز بی‌چیپ می‌ماند", () => {
    render(<WordOfDay />);
    const pickEn = todayWotdEn();
    const n = findWordUsages(pickEn).length;
    const chip = screen.queryByTestId("wotd-usage-chip");
    if (n === 0) {
      // شاخهٔ صداقت: واژهٔ امروز بی‌کاربرد است — چیپ وجود ندارد
      expect(chip).not.toBeInTheDocument();
      return;
    }
    expect(chip).not.toBeNull();
    expect(chipWordOf(chip!)).toBe(pickEn);
    expect(chip!.textContent).toContain(`در جزوه · ${faNum(n)}`);
    // کلیک: دیالوگِ مشترک با همان واژه و همان شمارش
    act(() => {
      fireEvent.click(chip!);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(pickEn);
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(n)}`);
  });

  it("② مکالمه: چیپ‌هایِ خط دقیقاً از تشخیصِ مستقل؛ کلیک → دیالوگ، پخش دست‌نخورده", () => {
    const lesson = lessons[0];
    const expected = lesson.conversation.lines.map((ln) => expectedHitsFor(ln, lesson.vocabulary));
    const firstHit = expected.findIndex((h) => h.length > 0);
    expect(firstHit).toBeGreaterThanOrEqual(0); // پیش‌شرطِ داده: دست‌کم یک خطِ واژه‌دار
    render(<ConversationTab lesson={lesson} />);
    const row = screen.getByTestId(`line-usage-row-${firstHit}`);
    const visible = expected[firstHit].slice(0, 5);
    for (const en of visible) {
      expect(screen.getByTestId(`line-usage-chip-${en.replace(/\s+/g, "-")}`)).toBeInTheDocument();
    }
    if (expected[firstHit].length > 5) {
      expect(row.textContent).toContain(`+${faNum(expected[firstHit].length - 5)}`);
    }
    // کلیکِ اولین چیپ: دیالوگِ مشترک با همان واژه؛ پخشِ کل هنوز «پخش» است
    const playAll = screen.getByRole("button", { name: /پخش کل مکالمه/ });
    const chip = within(row).getAllByRole("button")[0];
    const en = chipWordOf(chip);
    expect(expected[firstHit]).toContain(en);
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(en);
    // دیالوگِ باز، پس‌زمینه را aria-hidden می‌کند — وضعیتِ پخش را رویِ
    // خودِ عنصرِ گرفته‌شده می‌سنجیم: هنوز «پخش کل مکالمه»، نه «توقف»
    expect(playAll.textContent).toContain("پخش کل مکالمه");
    expect(playAll.textContent).not.toContain("توقف پخش");
  });

  it("③ قفلِ دامنه: چیپ‌ها فقط از واژگانِ همین درس‌اند — واژهٔ درسِ دیگر چیپ نمی‌گیرد", () => {
    const lesson = lessons[0];
    const lessonWords = new Set(lesson.vocabulary.map((w) => w.en.toLowerCase()));
    render(<ConversationTab lesson={lesson} />);
    const chips = screen.getAllByTestId(/^line-usage-chip-/);
    expect(chips.length).toBeGreaterThan(0);
    for (const c of chips) {
      const en = chipWordOf(c).toLowerCase();
      expect(en.length).toBeGreaterThan(0);
      expect(lessonWords.has(en)).toBe(true);
    }
    // پیش‌شرطِ داده: واژهٔ خارج از درس ۱ در متنِ مکالمه‌اش زندگی می‌کند
    const cross = lessons
      .slice(1)
      .flatMap((l) => l.vocabulary)
      .filter(
        (w) =>
          !lessonWords.has(w.en.toLowerCase()) &&
          lesson.conversation.lines.some((ln) => wordFormRegex(w.en).test(ln.en))
      );
    expect(cross.length).toBeGreaterThan(0);
    for (const w of cross) {
      expect(screen.queryByTestId(`line-usage-chip-${w.en.replace(/\s+/g, "-")}`)).not.toBeInTheDocument();
    }
  });

  it("④ صداقتِ خطوط: خطِ بی‌واژه هیچ ردیفی ندارد؛ ردیف‌ها = خط‌هایِ واژه‌دارِ تشخیصِ مستقل", () => {
    const lesson = lessons[0];
    const expected = lesson.conversation.lines.map((ln) => expectedHitsFor(ln, lesson.vocabulary));
    const hitLines = expected.filter((h) => h.length > 0).length;
    expect(hitLines).toBeGreaterThan(0);
    render(<ConversationTab lesson={lesson} />);
    const rows = screen.getAllByTestId(/^line-usage-row-/);
    expect(rows).toHaveLength(hitLines);
    for (let i = 0; i < expected.length; i++) {
      const row = screen.queryByTestId(`line-usage-row-${i}`);
      if (expected[i].length === 0) {
        expect(row).not.toBeInTheDocument();
      } else {
        expect(row).not.toBeNull();
        expect(row!.textContent).toContain("واژه‌های زندهٔ این خط");
      }
    }
  });

  it("⑤ دیالوگ از خطِ مکالمه: markِ amber + نشانِ نوع + ترجمهٔ جزوه + شمارشِ خودسازگار (سقفِ ۸)", () => {
    const lesson = lessons[0];
    let target: { en: string; idx: number } | null = null;
    lesson.conversation.lines.forEach((ln, i) => {
      if (target) return;
      for (const en of expectedHitsFor(ln, lesson.vocabulary)) {
        if (findWordUsages(en).length >= 2) {
          target = { en, idx: i };
          return;
        }
      }
    });
    expect(target).not.toBeNull(); // پیش‌شرطِ داده: واژهٔ چندکاربردی در خطوطِ درس ۱
    render(<ConversationTab lesson={lesson} />);
    const chip = screen.getByTestId(`line-usage-chip-${target!.en.replace(/\s+/g, "-")}`);
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    const n = findWordUsages(target!.en).length;
    expect(n).toBeGreaterThanOrEqual(2);
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(n)}`);
    // هایلایتِ mark — کلاسِ amberِ ریمپ‌شدهٔ kernel (عینِ r252)
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    // نشانِ نوع + ترجمهٔ فارسیِ خودِ جزوه در هر سایت؛ سقفِ ۸ رعایت
    const cards = dialog.querySelectorAll("[data-testid=usage-site]");
    expect(cards.length).toBe(Math.min(n, 8));
    for (const card of cards) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
      expect(card.textContent).toContain("درس");
    }
  });
});
