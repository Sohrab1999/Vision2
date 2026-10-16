// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۲ — بندِ ② پیشنهادِ ۲۴۱: کشفِ حلقهٔ «ادامهٔ مطالعه» در راهنمای
// میان‌برهای کیبورد. نُه درِ r231-r241 تا حالا فقط با تصادف پیدا می‌شدند —
// راهنما (کلید «؟») پرحرف‌ترین جای کتاب است و حالا کارتِ زمردیِ «حلقهٔ
// ادامهٔ مطالعه» همهٔ درها را یک‌جا معرفی می‌کند:
//   • کلیدِ واقعی فقط Ctrl+K است (فرمانیاب: فرمانِ اصلی + گروهِ «ادامه‌های اخیر»)
//   • چهار درِ کلیک‌محور (هدر/خانه/ضمیمه/پروفایل) با برچسبِ محلِ خود
//     توصیف می‌شوند نه با کلیدِ جعلی — صداقتِ راهنما هم قرارداد است.
// گاردهایِ ساختاریِ راهنما (چهار گروهِ کیبوردی + پانوشتِ کهربایی) هم
// پین می‌شوند تا کارتِ نو جای کسی را نگیرد.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

/** راهنما با همان رویدادِ واقعیِ هدر/فوتر باز می‌شود (open-shortcuts). */
function openGuide() {
  render(<ShortcutGuide />);
  act(() => {
    window.dispatchEvent(new Event("open-shortcuts"));
  });
}

describe("کارتِ کشفِ حلقهٔ «ادامهٔ مطالعه» در راهنمای میان‌برها — r242", () => {
  it("① کارتِ زمردی با عنوانِ حلقه حاضر است و هر پنج در را نام می‌برد", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    expect(card).toHaveTextContent("حلقهٔ «ادامهٔ مطالعه»");
    // پنج در: فرمان‌یاب + چهار درِ کلیک‌محور
    expect(card).toHaveTextContent("فرمان‌یاب");
    expect(card).toHaveTextContent("هدر:");
    expect(card).toHaveTextContent("خانه:");
    expect(card).toHaveTextContent("ضمیمه:");
    expect(card).toHaveTextContent("پروفایل:");
  });

  it("② هر دو نامِ «ادامه‌های اخیر» (گروهِ فرمان‌یاب) و «مسیرهای اخیر» (پنلِ هدر) معرفی می‌شوند", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    expect(card).toHaveTextContent("ادامه‌های اخیر");
    expect(card).toHaveTextContent("مسیرهای اخیر");
  });

  it("③ کلیدِ واقعیِ Ctrl+K با چیپ‌های Kbd داخلِ کارت است — بدونِ کلیدِ جعلی برایِ درهایِ کلیک‌محور", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    const kbds = Array.from(card.querySelectorAll("kbd")).map((k) => k.textContent);
    expect(kbds).toEqual(["Ctrl", "K"]);
    // هیچ ردیفِ دیگری چیپِ کلید ندارد (چهار درِ کلیک‌محور = برچسبِ محل، نه کلید)
    const rows = card.querySelectorAll("li");
    expect(rows).toHaveLength(5);
    const rowsWithKbd = Array.from(rows).filter((r) => r.querySelector("kbd"));
    expect(rowsWithKbd).toHaveLength(1);
  });

  it("④ کارت بعد از چهار گروهِ کیبوردی و قبل از پانوشتِ کهربایی می‌نشیند — جایِ درست، بدونِ آشفتگی", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    // چهار گروهِ کهن سرِ جایشان‌اند و ترتیبشان عوض نشده
    const groupTitles = ["میان‌برهای سراسری", "در درس‌ها", "فلش‌کارت‌ها", "در آزمون‌ها"];
    let lastPos = -1;
    for (const t of groupTitles) {
      const h = screen.getByText(t);
      const pos = Array.from(document.querySelectorAll("h3")).indexOf(h as HTMLHeadingElement);
      expect(pos, `گروهِ ${t} باید قبل از کارت باشد`).toBeGreaterThan(lastPos);
      lastPos = pos;
    }
    const cardPos = Array.from(document.querySelectorAll("section")).indexOf(card);
    const headingPositions = Array.from(document.querySelectorAll("h3")).filter(
      (h) => groupTitles.some((t) => h.textContent?.includes(t)),
    );
    // کارت جایی بینِ آخرین گروه و پانوشتِ کهربایی است: بعد از همهٔ h3هایِ گروه‌ها
    const footnote = screen.getByText(/میان‌برهای حرفی هنگام تایپ/);
    expect(
      (headingPositions[headingPositions.length - 1] as HTMLElement).compareDocumentPosition(card) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(card.compareDocumentPosition(footnote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cardPos).toBeGreaterThan(0);
  });

  it("⑤ Ctrl+Kِ سراسری در گروهِ نخست هم پابرجاست — کارتِ نو تکرارِ ممنوعِ ناسازگار نیست", () => {
    openGuide();
    // گروهِ سراسری همان ردیفِ فرمان‌یاب را دارد
    const globalGroup = screen.getByText("میان‌برهای سراسری").closest("section");
    expect(globalGroup?.textContent).toContain("فرمان‌یاب — جست‌وجوی همه‌جا و اجرای سریع فرمان‌ها");
    // و کارتِ نو توصیفِ متفاوتِ مکمل دارد (گروهِ «ادامه‌های اخیر» را می‌گوید)
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    expect(card.textContent).toContain("ادامه‌های اخیر");
  });
});
