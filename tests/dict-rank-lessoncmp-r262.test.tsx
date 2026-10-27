// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۲ — رتبهٔ پرکاربردی رویِ کارت‌هایِ دیکشنری + مقایسهٔ درس‌ها
// در لنزِ «کاربرددار» (بندهایِ ② و ③ پیشنهادِ ۲۶۰).
//
// قراردادهایِ تحتِ قفل:
//   · چیپِ رتبه رویِ هر کارتِ کاربرددار می‌آید — همان usedWordRankِ
//     نشانِ WOTD و دیالوگ؛ فقط-نمایش (span)، هم‌تا با چیپِ «در جزوه»؛
//     بی‌کاربرد، هیچ (صداقتِ همیشگیِ r252).
//   · مقایسهٔ درس‌ها فقط داخلِ لنز؛ شمارشِ هر ردیف از همان سیمِ
//     usedByLesson (آستانه‌آگاه) می‌خواند — با شمارندهٔ چیپِ درس یکی.
//   · عرضِ میله = سهم از بیشترینِ شمارشِ همان لحظه؛ درسِ صفر میلهٔ
//     خالیِ صادقانه (۰ واژه · ۰٪) — هیچ میلهٔ ساختگی.
//   · خروج از لنز جعبهٔ مقایسه را غیب می‌کند ولی چیپ‌هایِ رتبه
//     کارت‌سطح‌اند و می‌مانند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages, usedWordRank } from "@/lib/word-usage";
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
    lessonTab: "reading",
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

/** شمارشِ مستقلِ کارت‌هایِ کاربرددارِ n>=t هر درس (آینهٔ مستقلِ سیم) */
function countAtLeast(lessonId: number, t: number): number {
  const l = lessons.find((x) => x.id === lessonId)!;
  return l.vocabulary.filter((w) => findWordUsages(w.en).length >= t).length;
}

/** slug → واژه (برایِ خواندنِ رتبهٔ مستقل از testidِ چیپِ رتبه) */
const slugToWord = new Map<string, string>();
for (const l of lessons) for (const w of l.vocabulary) slugToWord.set(w.en.replace(/\s+/g, "-"), w.en);

/** ورود به لنزِ «کاربرددار» */
const enterUsedLens = () =>
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
  });

const rankText = (en: string) => {
  const r = usedWordRank(en)!;
  return `رتبهٔ ${faNum(r.rank)} از ${faNum(r.total)}`;
};

describe("رتبهٔ کارت‌ها و مقایسهٔ درس‌ها — r262", () => {
  it("① چیپِ رتبه: هم‌تایِ چیپِ «در جزوه» رویِ همهٔ کارت‌هایِ کاربرددار؛ متن = مستقل؛ فقط-نمایش (span)", () => {
    render(<DictionaryView />);
    const chips = screen.getAllByTestId(/^usage-chip-.+$/);
    const ranks = screen.getAllByTestId(/^usage-rank-.+$/);
    // هر کارتِ کاربرددار دقیقاً یک چیپِ رتبه دارد (پیش‌سنجه: ۱۹۱۵/۱۹۱۵)
    expect(ranks.length).toBe(chips.length);
    // نمونه‌گیریِ مستقل: ۲۵ چیپِ نخست — واژه از slug، متن از usedWordRank
    for (const r of ranks.slice(0, 25)) {
      const slug = r.getAttribute("data-testid")!.replace("usage-rank-", "");
      const en = slugToWord.get(slug)!;
      expect(en).toBeTruthy();
      expect(r.textContent).toBe(rankText(en));
      // فقط-نمایش: span است نه دکمه — کلیکِ دیالوگ با چیپِ «در جزوه» می‌ماند
      expect(r.tagName).toBe("SPAN");
    }
    // چیپِ رتبه درست کنارِ چیپِ کاربرد می‌نشیند (هم‌والد، بلافاصله بعدش)
    const firstCard = chips[0].parentElement!;
    expect(within(firstCard).getAllByTestId(/^usage-rank-.+$/).length).toBe(1);
  });

  it("② رتبه در لنزِ مرتب‌شده: اولین کارتِ of با «رتبهٔ ۱ از ۱۹۱۵»؛ کلیکِ چیپِ کاربرد همان رتبه را در دیالوگ می‌آورد", () => {
    render(<DictionaryView />);
    enterUsedLens();
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    // اولین کارت = پرکاربردترین (of · ۹۱) — رتبهٔ مستقل
    const firstChip = screen.getAllByTestId(/^usage-chip-.+$/)[0];
    const ofSlug = firstChip.getAttribute("data-testid")!.replace("usage-chip-", "");
    const ofWord = slugToWord.get(ofSlug)!;
    expect(usedWordRank(ofWord)!.rank).toBe(1);
    const rankChip = document.querySelector(`[data-testid="usage-rank-${ofSlug}"]`)!;
    expect(rankChip.textContent).toBe(rankText(ofWord));
    // کلیکِ چیپِ کاربرد → دیالوگِ مشترک همان واژه با همان رتبه (r260)
    act(() => {
      fireEvent.click(firstChip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(`در جزوه · ${faNum(usedWordRank(ofWord)!.count)}`);
    expect(within(dialog).getByTestId("usage-rank").textContent).toBe(rankText(ofWord));
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("③ مقایسهٔ درس‌ها: شمارشِ هر ردیف = مستقل و = شمارندهٔ چیپِ درس؛ عرضِ میله = سهمِ بیشترین؛ بیشترین ۱۰۰٪", () => {
    render(<DictionaryView />);
    enterUsedLens();
    const box = screen.getByTestId("dict-lesson-cmp");
    expect(within(box).getAllByTestId(/^dict-lesson-cmp-\d+$/).length).toBe(lessons.length);
    // بی‌آستانه: بیشترینِ شمارش میانِ درس‌ها (آینهٔ مستقل)
    const counts = lessons.map((l) => countAtLeast(l.id, 1));
    const max = Math.max(...counts);
    for (let i = 0; i < lessons.length; i++) {
      const row = screen.getByTestId(`dict-lesson-cmp-${lessons[i].id}`);
      const penetration = Math.round((counts[i] / lessons[i].vocabulary.length) * 100);
      expect(row.textContent).toContain(`${faNum(counts[i])} واژه`);
      expect(row.textContent).toContain(`${faNum(penetration)}٪`);
      const bar = row.querySelector("span[aria-hidden] > span") as HTMLElement;
      expect(bar.style.width).toBe(`${Math.round((counts[i] / max) * 100)}%`);
      // هم‌نفس با شمارندهٔ چیپِ همان درس (درسِ راندِ ۲۵۸: یک عدد)
      const chip = screen
        .getAllByRole("button")
        .find((b) => (b.textContent ?? "").startsWith(`درس ${faNum(lessons[i].id)}:`))!;
      expect(chip.textContent).toContain(`· ${faNum(counts[i])}`);
    }
    // بیشترین واقعاً ۱۰۰٪ می‌گیرد (پیش‌شرطِ معناِ «سهم از بیشترین»)
    expect(barWidthOfTopLesson()).toBe("100%");
  });

  it("④ آستانه‌آگاه: سرصفحه آستانه را می‌گوید؛ شمارش‌ها باریک می‌شوند؛ درسِ صفر میلهٔ خالیِ صادقانه", () => {
    render(<DictionaryView />);
    enterUsedLens();
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    const box = screen.getByTestId("dict-lesson-cmp");
    expect(box.textContent).toContain(`(فقط واژه‌هایِ ${faNum(20)}+ کاربرد)`);
    const counts = lessons.map((l) => countAtLeast(l.id, 20));
    const max = Math.max(...counts);
    expect(max).toBeGreaterThan(0);
    for (let i = 0; i < lessons.length; i++) {
      const row = screen.getByTestId(`dict-lesson-cmp-${lessons[i].id}`);
      const penetration = Math.round((counts[i] / lessons[i].vocabulary.length) * 100);
      expect(row.textContent).toContain(`${faNum(counts[i])} واژه · ${faNum(penetration)}٪`);
      const bar = row.querySelector("span[aria-hidden] > span") as HTMLElement;
      expect(bar.style.width).toBe(`${Math.round((counts[i] / max) * 100)}%`);
    }
    // پیش‌سنجهٔ داده: درس ۲ و ۳ در ۲۰+ صفرند — میلهٔ خالیِ صادقانه
    const zeroRow = screen.getByTestId("dict-lesson-cmp-2");
    expect(countAtLeast(2, 20)).toBe(0);
    expect((zeroRow.querySelector("span[aria-hidden] > span") as HTMLElement).style.width).toBe("0%");
    expect(zeroRow.textContent).toContain(`${faNum(0)} واژه · ${faNum(0)}٪`);
  });

  it("⑤ دامنه: جعبهٔ مقایسه فقط داخلِ لنز؛ چیپ‌هایِ رتبه کارت‌سطح‌اند و بیرونِ لنز هم می‌مانند؛ درسِ فیلترشده data-active", () => {
    render(<DictionaryView />);
    // بیرونِ لنز: جعبه غیب، رتبه حاضر (کارت‌سطح)
    expect(screen.queryByTestId("dict-lesson-cmp")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^usage-rank-.+$/).length).toBeGreaterThan(0);
    enterUsedLens();
    expect(screen.getByTestId("dict-lesson-cmp")).toBeInTheDocument();
    // فیلترِ درس ۱ → ردیفش data-active می‌گیرد و برچسبش برجسته می‌شود
    act(() => {
      fireEvent.click(
        screen.getAllByRole("button").find((b) => (b.textContent ?? "").startsWith(`درس ${faNum(1)}:`))!
      );
    });
    const row1 = screen.getByTestId("dict-lesson-cmp-1");
    expect(row1.getAttribute("data-active")).toBe("true");
    expect(row1.textContent).toContain(`${faNum(countAtLeast(1, 1))} واژه`);
    expect(screen.getByTestId("dict-lesson-cmp-2").getAttribute("data-active")).toBe("false");
    // خروج از لنز: جعبه غیب — رتبه‌ها می‌مانند
    act(() => {
      fireEvent.click(
        screen.getAllByRole("button").find((b) => (b.textContent ?? "").startsWith("همهٔ درس‌ها"))!
      );
    });
    act(() => {
      fireEvent.click(
        screen
          .getAllByRole("button")
          .find((b) => (b.textContent ?? "").startsWith("همه") && !(b.textContent ?? "").includes("درس"))!
      );
    });
    expect(screen.queryByTestId("dict-lesson-cmp")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^usage-rank-.+$/).length).toBeGreaterThan(0);
  });
});

/** عرضِ میلهٔ درسی که بیشترینِ شمارش را دارد (باید ۱۰۰٪ باشد) */
function barWidthOfTopLesson(): string {
  const counts = lessons.map((l) => countAtLeast(l.id, 1));
  const max = Math.max(...counts);
  const topId = lessons[counts.indexOf(max)].id;
  const row = screen.getByTestId(`dict-lesson-cmp-${topId}`);
  return (row.querySelector("span[aria-hidden] > span") as HTMLElement).style.width;
}
