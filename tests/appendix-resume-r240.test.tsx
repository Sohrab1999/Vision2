// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۰ — «مسیرهای اخیر» زیرِ دکمهٔ هدر (بندِ ① پیشنهادِ ۲۳۹):
// caretِ کوچکِ کنارِ نشانگر، پنلِ پرشِ سریعِ تا-۴-مسیرِ جدیدترینِ
// «دیگر»هایِ تاریخچه را باز می‌کند. قراردادهایِ حلقه همه پابرجا:
//   • خودِ رکوردِ فعلی هرگز در فهرست نمی‌آید (دکمهٔ اصلی همان را می‌برد)
//   • کلیکِ ردیف = ناوبریِ view از قلابِ مشترک — پرش ≠ نوشتن
//   • تک‌عضویِ همسانِ رکورد = بی‌caret (صداقت — هیچ کنشِ ساختگی)
//   • بی‌رکورد = کلِ خوشه غیب (قراردادِ r236؛ «اخیراً»ی بی‌رکورد کارِ
//     سینیِ خانه و پروفایل است — تقسیمِ کارِ r238)
//   • سقفِ ۴ (پروفایل مالکِ همهٔ ۸تاست) + واکنشِ زنده به نوشتنِ تازه
//   • بستن با Escape / پردهٔ بیرون‌زن / خودِ پرش
//   • حلقهٔ کیبوردِ واحدِ r239 رویِ caret و ردیف‌ها
// گاردهایِ راندِ ۲۳۶/۲۳۹ دربارهٔ دکمهٔ اصلی دست‌نخورده می‌مانند — این
// فایل فقط لایهٔ نو را می‌بندد.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import {
  writeAppendixResume,
  readAppendixResume,
  clearAppendixResume,
  clearAppendixResumeHistory,
  type AppendixResumeItem,
} from "@/lib/bg-reading";
import { RESUME_FOCUS_RING } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};
const verbRec: AppendixResumeItem = { scope: "verbs", id: "eat", title: "eat — ate — eaten", hint: "خوردن" };
const phonRec: AppendixResumeItem = { scope: "phonetics", id: "ʌ", title: "/ʌ/", hint: "cup — love" };
const posRec: AppendixResumeItem = { scope: "pos", id: "wf-g11-l1-1", title: "یازدهم · درس ۱" };
const abbrevRec: AppendixResumeItem = { scope: "abbrev", id: "n", title: "n — noun" };
const posRec2: AppendixResumeItem = { scope: "pos", id: "wf-g11-l1-2", title: "یازدهم · درس ۱ — دوم" };

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
  toastSpy.mockClear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

// ترتیبِ مهم: هر نوشتن، رکوردِ «ادامه» را هم بازنویسی می‌کند (write-wins)
// — رکوردِ فعلی باید «آخرینِ نوشته» باشد؛ بقیه فقط تاریخچه‌اند.
const seedRecord = (before: AppendixResumeItem[] = []) => {
  act(() => {
    for (const b of before) writeAppendixResume(b);
    writeAppendixResume(grammarRec);
  });
};

describe("A — caretِ «مسیرهای اخیر» کنارِ دکمهٔ هدر", () => {
  it("① رکورد + چندمسیر: caret حاضر است (بسته به‌صورت پیش‌فرض، aria-controls درست)، دکمهٔ اصلی دست‌نخورده", () => {
    seedRecord([verbRec, phonRec]);
    render(<HeaderResumeButton />);
    expect(screen.getByTestId("header-resume-button")).toHaveTextContent("حال ساده");
    const caret = screen.getByTestId("header-resume-recent-toggle");
    expect(caret).toHaveAttribute("aria-expanded", "false");
    expect(caret).toHaveAttribute("aria-controls", "header-resume-recent");
    expect(screen.queryByTestId("header-resume-recent")).toBeNull();
  });

  it("② بازشدن: جدیدترینِ «دیگر» اول، فعلی هرگز در فهرست نیست، برچسبِ لایه + پانویسِ صداقت", () => {
    seedRecord([verbRec, phonRec]);
    render(<HeaderResumeButton />);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    const panel = screen.getByTestId("header-resume-recent");
    expect(panel).toBeInTheDocument();
    expect(screen.getByTestId("header-resume-recent-toggle")).toHaveAttribute("aria-expanded", "true");
    const rows = screen.getAllByTestId(/^header-recent-item-/);
    expect(rows).toHaveLength(2);
    // جدیدترین اول — phonetics (آخرین نوشتنِ غیرِفعلی)
    expect(rows[0]).toHaveAttribute("data-testid", "header-recent-item-phonetics-ʌ");
    expect(rows[1]).toHaveAttribute("data-testid", "header-recent-item-verbs-eat");
    expect(rows[0]).toHaveTextContent("/ʌ/");
    expect(rows[0]).toHaveTextContent("جدول تلفظ");
    // فعلی (حال ساده) در فهرست نیست — دکمهٔ اصلی همان را می‌برد
    expect(screen.queryByTestId("header-recent-item-grammar-t-present-simple")).toBeNull();
    // پانویسِ صداقتِ حلقه
    expect(panel).toHaveTextContent("نشانگرِ «ادامهٔ مطالعه» را عوض نمی‌کند");
  });

  it("③ کلیکِ ردیف = پرشِ view به همان لایه + بستنِ پنل + رکوردِ سالم (پرش ≠ نوشتن)", () => {
    seedRecord([phonRec]);
    render(<HeaderResumeButton />);
    // درسِ راند: در React 19، actِ تودرتو همگام flush نمی‌کند — هر تعامل
    // در actِ خودش (ایدئومِ فایلِ ۲۳۹)
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("header-recent-item-phonetics-ʌ"));
    });
    const view = useStudy.getState().view;
    expect(view.type).toBe("appendix");
    if (view.type === "appendix") {
      expect(view.phonemeId).toBe("ʌ");
    }
    // پنل بسته شد
    expect(screen.queryByTestId("header-resume-recent")).toBeNull();
    // پرش ≠ نوشتن
    expect(readAppendixResume()?.id).toBe("t-present-simple");
  });

  it("④ Escape و پردهٔ بیرون‌زن هر دو می‌بندند", () => {
    seedRecord([phonRec]);
    render(<HeaderResumeButton />);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    expect(screen.getByTestId("header-resume-recent")).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.queryByTestId("header-resume-recent")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-backdrop"));
    });
    expect(screen.queryByTestId("header-resume-recent")).toBeNull();
  });

  it("⑤ تک‌عضویِ همسانِ رکورد = بی‌caret؛ بی‌رکورد = کلِ خوشه غیب", () => {
    seedRecord();
    render(<HeaderResumeButton />);
    expect(screen.getByTestId("header-resume-button")).toBeInTheDocument();
    expect(screen.queryByTestId("header-resume-recent-toggle")).toBeNull();
    cleanup();
    act(() => {
      clearAppendixResume();
    });
    render(<HeaderResumeButton />);
    expect(screen.queryByTestId("header-resume-cluster")).toBeNull();
  });

  it("⑥ سقفِ ۴ از تاریخچهٔ بلندتر — جدیدترین‌ها می‌مانند", () => {
    seedRecord([abbrevRec, posRec2, posRec, verbRec, phonRec]);
    render(<HeaderResumeButton />);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    const rows = screen.getAllByTestId(/^header-recent-item-/);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveAttribute("data-testid", "header-recent-item-phonetics-ʌ");
    expect(rows[3]).toHaveAttribute("data-testid", "header-recent-item-pos-wf-g11-l1-2");
    expect(screen.queryByTestId("header-recent-item-abbrev-n")).toBeNull();
  });

  it("⑦ واکنشِ زنده: پاک‌کردنِ تاریخچه از پروفایل در حینِ بازبودنِ پنل = پنل و caret واکنشی می‌روند؛ نوشتنِ تازه = جابه‌جاییِ درستِ «دیگر»ها", () => {
    seedRecord([verbRec]);
    render(<HeaderResumeButton />);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    expect(screen.getByTestId("header-recent-item-verbs-eat")).toBeInTheDocument();
    // رویدادِ واقعی: «پاک‌کردنِ تاریخچه» در پروفایل — رکوردِ اصلی باید
    // پابرجا بماند (دو معنایِ جدا — r237) و پنل صادقانه غیب شود
    act(() => {
      clearAppendixResumeHistory();
    });
    expect(screen.queryByTestId("header-resume-recent")).toBeNull();
    expect(screen.queryByTestId("header-resume-recent-toggle")).toBeNull();
    expect(screen.getByTestId("header-resume-button")).toHaveTextContent("حال ساده");
    expect(readAppendixResume()?.id).toBe("t-present-simple");
    cleanup();
    // نوشتنِ تازه: رکوردِ نو خودش از فهرستِ «دیگر»ها بیرون می‌افتد و
    // جدیدترینِ باقی‌مانده سرِ فهرست می‌آید
    seedRecord([verbRec]);
    render(<HeaderResumeButton />);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    act(() => {
      writeAppendixResume(abbrevRec); // رویدادِ واقعیِ لایه‌ای دیگر
    });
    const rows = screen.getAllByTestId(/^header-recent-item-/);
    expect(rows[0]).toHaveAttribute("data-testid", "header-recent-item-grammar-t-present-simple");
    expect(rows).toHaveLength(2); // abbrev خودِ رکورد شد — در فهرست نیست
    expect(screen.queryByTestId("header-recent-item-abbrev-n")).toBeNull();
  });

  it("⑧ حلقهٔ کیبوردِ واحد: caret و ردیف‌ها RESUME_FOCUS_RING دارند", () => {
    seedRecord([phonRec]);
    render(<HeaderResumeButton />);
    const ring = RESUME_FOCUS_RING.split(" ")[0];
    expect(screen.getByTestId("header-resume-recent-toggle")).toHaveClass(ring);
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-recent-toggle"));
    });
    expect(screen.getByTestId("header-recent-item-phonetics-ʌ")).toHaveClass(ring);
  });

  it("⑨ پاک‌کردنِ رکورد با کلیکِ راست، caret را هم واکنشی می‌برد (خوشهٔ record-gated)", () => {
    seedRecord([phonRec]);
    render(<HeaderResumeButton />);
    expect(screen.getByTestId("header-resume-recent-toggle")).toBeInTheDocument();
    act(() => {
      fireEvent.contextMenu(screen.getByTestId("header-resume-button"));
    });
    expect(toastSpy).toHaveBeenCalled();
    expect(screen.queryByTestId("header-resume-cluster")).toBeNull();
    // تاریخچه پابرجاست — دو معنایِ جدا (r237)
    expect(useStudy.getState().view.type).toBe("home");
  });
});
