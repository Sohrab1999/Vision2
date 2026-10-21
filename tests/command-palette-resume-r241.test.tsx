// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۱ — بندِ ① پیشنهادِ ۲۴۰: «مسیرهای اخیر» در فرمان‌یاب.
//
// فرمانِ «ادامهٔ مطالعه» (r235) جست‌وجوپذیر می‌شود و ورودی‌هایِ اخیرِ
// تاریخچه (vision2-bg-history — بدونِ کلیدِ تازه) هم به‌شکلِ فرمان‌های
// گروهِ «ادامه‌های اخیر» سوارِ همان جست‌وجو می‌آیند — هشتمین درِ حلقه.
// قراردادهایی که قفل می‌شوند:
//   ① بی‌تاریخچه = هیچ گروهی — شمارشِ ۳۵/۳۷ سطح‌بالا (۳۱/۳۲ کهنه + ۴/۵ درِ r244/r246) دست‌نخورده
//   ② خودِ رکوردِ فعلی از فهرست حذف است (فرمانِ اصلی همان را می‌برد)
//     و جدیدترینِ «دیگر» اول می‌آید — ترتیب از خودِ نوشتن
//   ③ سقفِ ۴ مثلِ پنلِ هدرِ r240 — پروفایل مالکِ همهٔ ۸تاست
//   ④ بی‌رکورد و بی‌تاریخچه‌ایِ کامل = همهٔ تاریخچه حاضرند (دو معنایِ جدا)
//   ⑤ جست‌وجوپذیری — نکتهٔ اصلیِ این در: عنوانِ مسیر در پرس‌وجو می‌آید
//   ⑥ کلیک = پرشِ عمیقِ همان لایه از قلابِ مشترکِ r236 + صفرِ نوشتنِ
//     استور (پرش ≠ نوشتن) + شناسه‌اش واردِ نوارِ «اخیر» نمی‌شود
//   ⑦ صداقتِ اجرا: dispatch لحظهٔ اجرا تاریخچه را دوباره می‌خواند —
//     ورودیِ حذف‌شده در فاصلهٔ باز-تا-اجرا = هیچ جابه‌جاییِ ساختگی
//   ⑧ گروهِ «ادامه‌های اخیر» درست بعد از «ناوبری» می‌نشیند (COMMAND_GROUPS)
// الگوی seed هم‌الگوی r235: نوشتنِ واقعی با writeAppendixResume.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import CommandPalette from "@/components/study/shell/command-palette";
import { COMMAND_GROUPS } from "@/lib/command-palette";
import {
  writeAppendixResume,
  clearAppendixResume,
  readAppendixResumeHistory,
  type AppendixResumeItem,
} from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

const grammarRec: AppendixResumeItem = { scope: "grammar", id: "t-present-simple", title: "حال ساده", hint: "ص ۲۳" };
const phonRec: AppendixResumeItem = { scope: "phonetics", id: "ʌ", title: "/ʌ/ کوتاه آ", hint: "cup — love" };
const verbRec: AppendixResumeItem = { scope: "verbs", id: "eat", title: "eat — ate — eaten", hint: "خوردن" };
const abbrevRec: AppendixResumeItem = { scope: "abbrev", id: "e.g.", title: "e.g. — برای مثال", hint: "for example" };
const posRec: AppendixResumeItem = { scope: "pos", id: "uncountable", title: "اسامی غیرقابل شمارش", hint: "۵ خانواده" };

const openPalette = () => {
  // fireEvent = پوشش act() — هم‌الگوی تستِ پالتِ Task 79
  fireEvent(window, new CustomEvent("open-command-palette"));
};

beforeAll(() => {
  // jsdom scrollIntoView ندارد — افکتِ «ردیف فعال در دید» باید امن باشد
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  useStudy.setState({
    view: { type: "dictionary" } as never, // نقطهٔ شروع غیرِمقصد — ناوبری واقعی اثبات شود
  });
});

describe("«مسیرهای اخیر» در فرمان‌یاب (r241)", () => {
  it("① بی‌تاریخچه: هیچ گروهِ «ادامه‌های اخیر»ای نیست — شمارشِ پایه دست‌نخورده", () => {
    render(<CommandPalette />);
    openPalette();
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(36); // r290: + nav-library (کتاب‌خانهٔ داستان‌ها) // ۳۱ کهنه + ۴ درِ حلقه (r246 — بی‌رکورد)
    expect(screen.queryByRole("group", { name: "ادامه‌های اخیر" })).toBeNull();
    // حتی با رکورد، بدونِ تاریخچه فقط فرمانِ اصلی هست (۳۷ = ۳۱ + nav-resume + ۵ در) و گروهِ اخیر نیست
    writeAppendixResume(phonRec);
    cleanup();
    render(<CommandPalette />);
    openPalette();
    expect(screen.getAllByRole("option").length).toBe(38); // r290: + nav-library
    expect(screen.queryByRole("group", { name: "ادامه‌های اخیر" })).toBeNull();
  });

  it("② با رکورد و تاریخچه: گروه بعد از «ناوبری»، حذفِ فعلی، جدیدترینِ دیگر اول", () => {
    writeAppendixResume(phonRec); // قدیمی‌ترینِ دیگر
    writeAppendixResume(verbRec); // میانه
    writeAppendixResume(grammarRec); // فعلی — در فهرستِ اخیر نمی‌آید
    render(<CommandPalette />);
    openPalette();
    const groups = screen.getAllByRole("group");
    expect(groups[0]?.getAttribute("aria-label")).toBe("ناوبری");
    expect(groups[1]?.getAttribute("aria-label")).toBe("ادامه‌های اخیر");
    const rows = groups[1]!.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(2);
    // جدیدترینِ «دیگر» اول — ترتیب از خودِ نوشتن، بدونِ timestamp
    expect(rows[0]!.textContent).toContain("eat — ate — eaten");
    expect(rows[1]!.textContent).toContain("/ʌ/");
    // خودِ رکوردِ فعلی در هیچ ردیفی نیست — فرمانِ اصلی همان را می‌برد
    expect(groups[1]!.textContent).not.toContain("حال ساده");
  });

  it("③ سقفِ ۴: از تاریخچهٔ بلندتر فقط چهارِ جدیدترینِ دیگر می‌آید", () => {
    writeAppendixResume(posRec);
    writeAppendixResume(abbrevRec);
    writeAppendixResume(phonRec);
    writeAppendixResume(verbRec);
    writeAppendixResume(grammarRec); // فعلی
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "ادامه‌های اخیر" });
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(4);
    // چهارِ جدیدترین: verb > phonetics > abbrev > pos (قدیمی‌ترین دور ریخته)
    expect(rows[0]!.textContent).toContain("eat — ate — eaten");
    expect(rows[3]!.textContent).toContain("اسامی غیرقابل شمارش");
  });

  it("④ بی‌رکورد: کلِ تاریخچه حاضر است — دو معنایِ جدا (ادامه ≠ اخیراً)", () => {
    writeAppendixResume(phonRec);
    writeAppendixResume(verbRec);
    writeAppendixResume(grammarRec);
    clearAppendixResume(); // پاک‌کردنِ رکورد — تاریخچه دست‌نخورده می‌ماند
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "ادامه‌های اخیر" });
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(3); // پاک‌کردنِ رکورد چیزی از تاریخچه نمی‌کشد
    expect(group.textContent).toContain("حال ساده"); // حالا خودش هم مسیرِ اخیر است
  });

  it("⑤ جست‌وجوپذیری — نکتهٔ اصلیِ این در: عنوانِ مسیر با پرس‌وجو می‌آید", () => {
    writeAppendixResume(phonRec);
    writeAppendixResume(verbRec);
    render(<CommandPalette />);
    openPalette();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "کوتاه آ" } });
    const opts = screen.getAllByRole("option");
    expect(opts.some((o) => o.textContent?.includes("/ʌ/ کوتاه آ"))).toBe(true);
    // جست‌وجوی لایه هم می‌گیرد
    fireEvent.change(input, { target: { value: "تلفظ" } });
    expect(screen.getAllByRole("option").some((o) => o.textContent?.includes("/ʌ/"))).toBe(true);
  });

  it("⑥ کلیکِ ردیف = پرشِ عمیقِ همان لایه + رکوردِ سالم (پرش ≠ نوشتن) + بی‌ورود به «اخیر»", () => {
    // ترتیبِ نوشتن = خودِ ترتیبِ تاریخچه: آخرینِ نوشتنِ رکوردِ فعلی است
    writeAppendixResume(phonRec); // دیگرِ اخیر
    writeAppendixResume(grammarRec); // فعلی (آخرینِ نوشتن) — در فهرستِ اخیر نمی‌آید
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "ادامه‌های اخیر" });
    const row = group.querySelector('[role="option"]') as HTMLElement;
    expect(row.textContent).toContain("/ʌ/");
    fireEvent.click(row);
    // مقصد از قلابِ مشترکِ r236 — viewِ همان لایه با لنگرِ واک
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      phonemeId: "ʌ",
    });
    // پرش ≠ نوشتن: رکوردِ «ادامه» دست‌نخورده ماند
    expect(useStudy.getState().view).not.toEqual({ type: "appendix" });
    const raw = JSON.parse(window.localStorage.getItem("vision2-bg-last-item") ?? "{}");
    expect(raw.id).toBe("t-present-simple");
    // فرمان‌های مسیرِ اخیر واردِ نوارِ «اخیر» نمی‌شوند — شناسه‌شان session-محلی است
    const recents = JSON.parse(window.localStorage.getItem("vision2-cmd-recent") ?? "[]");
    expect(recents).not.toContain("resume-recent-phonetics%7C%CA%8C");
    expect(recents).toHaveLength(0);
  });

  it("⑦ صداقتِ اجرا: ورودیِ حذف‌شده در فاصلهٔ باز-تا-اجرا = هیچ جابه‌جاییِ ساختگی", () => {
    writeAppendixResume(phonRec);
    writeAppendixResume(verbRec); // فعلی (آخرینِ نوشتن) — از «اخیر» حذف
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "ادامه‌های اخیر" });
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows[0]!.textContent).toContain("/ʌ/");
    // در فاصلهٔ باز-تا-اجرا، خودِ «/ʌ/» از تاریخچه حذف می‌شود (بازنویسیِ مستقیمِ کلید)
    const rest = readAppendixResumeHistory().filter((h) => h.id !== "ʌ");
    window.localStorage.setItem("vision2-bg-history", JSON.stringify(rest));
    fireEvent.click(rows[0]!);
    // فرمانِ بی‌مقصد هیچ — همان صداقتِ nav-resume در r235
    expect(useStudy.getState().view.type).toBe("dictionary");
  });

  it("⑧ قراردادِ lib: گروهِ تازه درست بعد از «ناوبری» و یکتاست", () => {
    expect(COMMAND_GROUPS).toContain("ادامه‌های اخیر");
    expect(new Set(COMMAND_GROUPS).size).toBe(COMMAND_GROUPS.length);
    expect(COMMAND_GROUPS.indexOf("ادامه‌های اخیر")).toBe(
      COMMAND_GROUPS.indexOf("ناوبری") + 1,
    );
    expect(COMMAND_GROUPS[0]).toBe("ناوبری"); // قراردادهایِ کهنهٔ lib پابرجا
    expect(COMMAND_GROUPS.indexOf("بخش‌های درس")).toBe(
      COMMAND_GROUPS.indexOf("درس‌ها") + 1,
    );
  });
});
