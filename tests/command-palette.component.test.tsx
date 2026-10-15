// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 79 — پنجمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// پالت فرمان — موتور پارامتریِ ۴ راندی (۶۹-۷۲/۷۴) که تست سطح‌UI نداشت
// (دو راند تعویق شده بود). قراردادهایی که قفل می‌شوند:
//   ① بسته به‌صورت پیش‌فرض؛ باز شدن با رویداد پنجره‌ای (دکمهٔ هدر/فوتر)
//     و چرخهٔ Ctrl+K — هر دو مسیر باز شدن واقعی
//   ② نمای خالی = ۲۵ فرمان سطح‌بالا (ناوبری+درس‌ها+تمرین+گزارش+ابزار)
//   ③ «آزمون ۱۵» → دقیقاً ۱ گزینهٔ پارامتری با مقدار اسنپ‌شده به
//     خانواده (exam values = [10,20,30] → ۱۵ به ۱۰ می‌چسبد — قرارداد
//     واقعی، نه حدس؛ رگرسیون snap راند ۷۲ در سطح UI)
//   ④ اجرای گزینهٔ پارامتری: نمای واقعی store + prefill در sessionStorage
//     + رویداد open-exam-with — هر سه پل هم‌زمان
//   ⑤ ناوبری ساده: «ضمیمه» → ۱ گزینه → Enter → view appendix (store واقعی)
//   ⑥ «اخیر»: شناسهٔ پارامتری ذخیره‌شده با commandFromParamId احیا می‌شود
// الگوی seed هم‌الگوی due-pill/goal-chip/freeze-badge/weekly-report:
// setState مستقیم (skipHydration) — analytics ماک، اکشن‌ها هرگز.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import CommandPalette from "@/components/study/shell/command-palette";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

const typeQuery = (value: string) => {
  const input = screen.getByRole("combobox") as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
};

const openPalette = () => {
  // fireEvent = پوشش act() — dispatch خامِ بیرونِ act رندر را فلاش نمی‌کند
  fireEvent(window, new CustomEvent("open-command-palette"));
};

describe("پالت فرمان — کامپوننت (Task 79)", () => {
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
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      goalMetDays: [],
    });
  });

  it("بسته به‌صورت پیش‌فرض؛ رویداد پنجره‌ای باز می‌کند — ۳۱ گزینهٔ سطح‌بالا (قفسهٔ دوازده‌درسی)", () => {
    const { container } = render(<CommandPalette />);
    expect(container.querySelector(".command-palette")).toBeNull();
    openPalette();
    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(31);
    // گروه‌بندی: «ناوبری» اول است
    expect(screen.getAllByRole("group")[0]?.getAttribute("aria-label")).toBe("ناوبری");
  });

  it("چرخهٔ Ctrl+K: با e.code باز می‌کند، دوباره بسته — پرس‌وجو هم ریست", () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { ctrlKey: true, code: "KeyK" });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    typeQuery("آزمون");
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { ctrlKey: true, code: "KeyK" });
    expect(screen.queryByRole("combobox")).toBeNull();
    // بازِ دوباره: پرس‌وجوی کهنه نمانده — نمای خالیِ ۳۱گزینهٔ دوازده‌درسی
    fireEvent.keyDown(window, { ctrlKey: true, code: "KeyK" });
    expect(screen.getAllByRole("option").length).toBe(31);
  });

  it("«آزمون ۱۵» → دقیقاً ۱ گزینه با مقدار اسنپ‌شده به [۱۰/۲۰/۳۰] (قرارداد واقعی)", () => {
    render(<CommandPalette />);
    openPalette();
    typeQuery("آزمون ۱۵");
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(1);
    // ۱۵ عضو خانواده نیست → نزدیک‌ترین ۱۰ (تساویِ فاصله اولی را می‌برد)
    expect(opts[0]).toHaveTextContent("آزمون جامع ۱۰ سؤالی");
  });

  it("اجرای پارامتری: Enter → نمای آزمون واقعی + prefill «۱۰» + رویداد open-exam-with", () => {
    const spy = vi.fn();
    window.addEventListener("open-exam-with", spy);
    render(<CommandPalette />);
    openPalette();
    typeQuery("آزمون ۱۵");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    // سه پل هم‌زمان: store واقعی + prefill + رویداد
    expect(useStudy.getState().view.type).toBe("exam");
    expect(window.sessionStorage.getItem("vision2-exam-prefill")).toBe("10");
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ count: 10 });
    // اجرا پالت را می‌بندد
    expect(screen.queryByRole("combobox")).toBeNull();
    window.removeEventListener("open-exam-with", spy);
  });

  it("ناوبری ساده: «ضمیمه» → ۱ گزینه → Enter → store واقعی به appendix می‌رود", () => {
    render(<CommandPalette />);
    openPalette();
    typeQuery("ضمیمه");
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(1);
    expect(opts[0]).toHaveTextContent("ضمیمهٔ کتاب");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(useStudy.getState().view.type).toBe("appendix");
  });

  it("«اخیر»: شناسهٔ پارامتریِ ذخیره‌شده با برچسب اسنپ‌شده احیا می‌شود — همیشه اول", () => {
    window.localStorage.setItem("vision2-cmd-recent", JSON.stringify(["exam-count-10", "nav-smart"]));
    render(<CommandPalette />);
    openPalette();
    const groups = screen.getAllByRole("group");
    expect(groups[0]?.getAttribute("aria-label")).toBe("اخیر");
    const opts = screen.getAllByRole("option");
    // دو فرمانِ اخیر جلوتر از بقیه؛ پارامتری با label بازسازی‌شده
    expect(opts[0]).toHaveTextContent("آزمون جامع ۱۰ سؤالی");
    expect(opts[1]).toHaveTextContent("تمرین هوشمند");
  });
});
