// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۴ — «کاربرد در جزوه» به کارتِ واژهٔ روز رسید (بندِ ① پیشنهادِ ۲۵۳)
//
//   ① صداقتِ تاریخ‌مقاوم: pickِ امروز با همان فرمولِ قطعیِ کامپوننت از
//     لایهٔ داده حساب می‌شود؛ چیپِ «در جزوه» دقیقاً وقتی حاضر است که
//     pick کاربردِ واقعی داشته باشد — و کلیکش همان دیالوگِ مشترکِ
//     خانواده را با mark و نشانِ نوع باز می‌کند. اگر pick امروز
//     بی‌کاربرد باشد، گاردِ برعکس: هیچ چیپی (بی‌کاربرد، هیچ).
//   ② قراردادِ نامِ a11y (درسِ r253): نامِ چیپ «جزوه»ی برهنه ندارد.
//   ③ رشدِ صادقانهٔ سرشماریِ تک‌منبع: word-of-day چهارمین مصرف‌کنندهٔ
//     import‌کنندهٔ دیالوگِ مشترک است (قفلِ r253-④ گسترش می‌یابد).
//
// لنگرِ پیش‌شمارشِ ترمینالِ ۲۰۲۶-۱۰-۲۱: pick = beginning (درس ۱) با
// دقیقاً ۱ سایت (ریدینگِ درس ۱) — تست به تاریخِ اجرا وابسته نیست.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordOfDay from "@/components/study/lesson/word-of-day";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { findWordUsages } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

// همان فرمولِ قطعیِ کامپوننت — یک منبع، دو دید
function todayPick(): { en: string; lessonId: number } {
  const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return all[seed % all.length];
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
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

describe("«کاربرد در جزوه» — کارتِ واژهٔ روز (r254)", () => {
  it("pickِ رندرشده با فرمولِ قطعی یکی است؛ چیپ فقط با کاربردِ واقعی و کلیکش دیالوگِ مشترک را باز می‌کند", () => {
    const pick = todayPick();
    const sites = findWordUsages(pick.en);
    render(<WordOfDay />);
    // واژهٔ رندرشده همان pickِ فرمول است
    const wordEl = screen.getByText(pick.en, { selector: "span.en-text" });
    expect(wordEl).toBeInTheDocument();
    if (sites.length === 0) {
      // بی‌کاربرد، هیچ — و دیالوگی هم باز نیست
      expect(screen.queryByTestId(`usage-chip-${pick.en.replace(/\s+/g, "-")}`)).not.toBeInTheDocument();
      expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
      return;
    }
    const chip = screen.getByTestId(`usage-chip-${pick.en.replace(/\s+/g, "-")}`);
    expect(chip).toHaveTextContent("در جزوه");
    expect(chip).toHaveTextContent(faNum(sites.length));
    fireEvent.click(chip);
    const dialog = screen.getByTestId("usage-dialog");
    expect(dialog.textContent).toContain(pick.en);
    // همان قراردادِ خانواده: markهایِ amber + نشانِ نوع + ترجمهٔ فارسیِ جزوه
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    for (const card of dialog.querySelectorAll("[data-testid=usage-site]")) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("قراردادِ a11y (درسِ r253): نامِ چیپ «جزوه»ی برهنه ندارد", () => {
    const pick = todayPick();
    if (findWordUsages(pick.en).length === 0) return; // امروز بی‌چیپ است — گاردی برای قفل‌کردن نیست
    render(<WordOfDay />);
    const chip = screen.getByTestId(`usage-chip-${pick.en.replace(/\s+/g, "-")}`);
    expect(chip.getAttribute("aria-label")).not.toContain("جزوه");
  });

  it("سرشماریِ تک‌منبع رشدِ صادقانه کرد: word-of-day چهارمین مصرف‌کنندهٔ دیالوگِ مشترک است", () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    const consumers = [
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/flashcards.tsx",
      "src/components/study/lesson/word-of-day.tsx",
    ];
    for (const f of consumers) {
      const src = read(f);
      expect(src, `${f} must import the shared dialog`).toContain('from "./word-usage-dialog"');
      expect(src, `${f} must NOT carry a private copy`).not.toContain('data-testid="usage-dialog"');
    }
    // و markupِ دیالوگ فقط در فایلِ مشترک زندگی می‌کند
    const shared = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(shared).toContain('data-testid="usage-dialog"');
  });
});
