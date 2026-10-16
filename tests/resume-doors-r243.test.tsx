// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۳ — بندهای ①+② پیشنهادِ ۲۴۲: درهایِ حلقهٔ «ادامهٔ مطالعه» یک
// تک‌منبعِ حقیقت گرفتند (src/lib/resume-loop-doors.ts) و کارتِ راهنما از
// همان داده رندر می‌شود — «فهرستِ زنده»: درِ نو به فهرست بیاید، کارتِ
// راهنما خودش تازه می‌شود، هیچ ردیفِ هاردکدی نیست.
//
// بندِ ② — هر ردیف حالا یک دکمهٔ واقعی است و کلیکش همان در را باز می‌کند:
//   • فرمان‌یاب/پروفایل: بعد از HANDOFF_DELAY_MS (تحویلِ فوکوس — راهنما
//     هنگامِ بسته‌شدن فوکوس را به فراخوانش برمی‌گرداند؛ dispatchِ هم‌زمان
//     یعنی دزدیده‌شدنِ فوکوسِ فرمان‌یابِ تازه‌وارد).
//   • خانه/ضمیمه: ناوبریِ فوریِ view.
//   • هدر: با رکورد → اسکرول+فوکوسِ دکمهٔ هدر؛ بی‌رکورد یا رویِ خودِ
//     ضمیمه → disableِ صادقانه با توضیح (قراردادِ r236: بی‌رکورد هیچ
//     کنشِ ساختگی).
// صداقتِ کلیدِ r242 پابرجا: فقط Ctrl+K چیپ دارد.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act, fireEvent } from "@testing-library/react";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { RESUME_LOOP_DOORS } from "@/lib/resume-loop-doors";
import { useStudy } from "@/lib/study-store";
import { writeAppendixResume } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

beforeAll(() => {
  // jsdom scrollIntoView ندارد — درِ هدر برایِ «نشان دادن» صدا می‌زند
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

function openGuide() {
  render(<ShortcutGuide />);
  act(() => {
    window.dispatchEvent(new Event("open-shortcuts"));
  });
}

/** صبرِ واقعی تا پایانِ HANDOFF_DELAY_MS (۲۶۰ms) — تایمرِ تحویل */
const waitHandoff = () => new Promise((r) => setTimeout(r, 360));

describe("تک‌منبعِ حقیقتِ درهایِ حلقه — r243 ①", () => {
  it("① داده: پنج در با شناسه‌هایِ یکتا؛ فقط فرمان‌یاب کلید دارد و آن Ctrl+K است", () => {
    expect(RESUME_LOOP_DOORS).toHaveLength(5);
    expect(RESUME_LOOP_DOORS.map((d) => d.id)).toEqual(["palette", "header", "home", "appendix", "profile"]);
    for (const d of RESUME_LOOP_DOORS) {
      expect(d.text.length).toBeGreaterThan(0);
      expect(d.openLabel.length).toBeGreaterThan(0);
    }
    const keyed = RESUME_LOOP_DOORS.filter((d) => d.keys);
    expect(keyed).toHaveLength(1);
    expect(keyed[0].id).toBe("palette");
    expect(keyed[0].keys).toEqual(["Ctrl", "K"]);
  });

  it("② داده: کنشِ هر در با معنایش می‌خواند و هدر توضیحِ درِ بسته دارد", () => {
    const byId = Object.fromEntries(RESUME_LOOP_DOORS.map((d) => [d.id, d]));
    expect(byId.palette.action).toEqual({ kind: "open-palette" });
    expect(byId.header.action).toEqual({ kind: "focus-header" });
    expect(byId.home.action).toEqual({ kind: "goto-home" });
    expect(byId.appendix.action).toEqual({ kind: "goto-appendix" });
    expect(byId.profile.action).toEqual({ kind: "open-profile" });
    expect(byId.header.closedHint).toContain("با نخستین دیدنِ ضمیمه");
  });

  it("③ کارتِ راهنما از داده رندر می‌شود — تعدادِ ردیف‌ها = طولِ داده و متنِ هر در در ردیفِ خودش", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    const rows = card.querySelectorAll('[data-testid^="resume-door-"]');
    expect(rows).toHaveLength(RESUME_LOOP_DOORS.length);
    for (const door of RESUME_LOOP_DOORS) {
      const row = screen.getByTestId(`resume-door-${door.id}`);
      expect(row).toHaveTextContent(door.text);
      if (door.lead) expect(row).toHaveTextContent(door.lead);
    }
  });
});

describe("درهایِ عملیاتی — کلیک، همان در را باز می‌کند — r243 ②", () => {
  it("④ درِ فرمان‌یاب: بستنِ راهنما + dispatchِ open-command-palette بعد از تحویلِ فوکوس — نه هم‌زمان", async () => {
    const fired: string[] = [];
    const l = () => fired.push("palette");
    window.addEventListener("open-command-palette", l);
    try {
      openGuide();
      await act(async () => {
        fireEvent.click(screen.getByTestId("resume-door-palette"));
      });
      // راهنما بسته شد و هنوز چیزی dispatch نشده (دورهٔ تحویلِ فوکوس)
      expect(screen.queryByTestId("shortcut-guide-resume-loop")).toBeNull();
      expect(fired).toEqual([]);
      await act(async () => {
        await waitHandoff();
      });
      expect(fired).toEqual(["palette"]);
    } finally {
      window.removeEventListener("open-command-palette", l);
    }
  });

  it("⑤ درِ پروفایل: بستنِ راهنما + dispatchِ open-profile بعد از تحویلِ فوکوس", async () => {
    const fired: string[] = [];
    const l = () => fired.push("profile");
    window.addEventListener("open-profile", l);
    try {
      openGuide();
      await act(async () => {
        fireEvent.click(screen.getByTestId("resume-door-profile"));
      });
      expect(screen.queryByTestId("shortcut-guide-resume-loop")).toBeNull();
      await act(async () => {
        await waitHandoff();
      });
      expect(fired).toEqual(["profile"]);
    } finally {
      window.removeEventListener("open-profile", l);
    }
  });

  it("⑥ درِ خانه: ناوبریِ فوریِ view به home — بی‌تایمر", () => {
    useStudy.setState({ view: { type: "dictionary" } } as Partial<ReturnType<typeof useStudy.getState>>);
    openGuide();
    act(() => {
      fireEvent.click(screen.getByTestId("resume-door-home"));
    });
    expect(useStudy.getState().view.type).toBe("home");
    expect(screen.queryByTestId("shortcut-guide-resume-loop")).toBeNull();
  });

  it("⑦ درِ ضمیمه: ناوبریِ فوریِ view به appendix", () => {
    openGuide();
    act(() => {
      fireEvent.click(screen.getByTestId("resume-door-appendix"));
    });
    expect(useStudy.getState().view.type).toBe("appendix");
    expect(screen.queryByTestId("shortcut-guide-resume-loop")).toBeNull();
  });

  it("⑧ درِ هدر با رکورد: بعد از تحویل، فوکوس روی دکمهٔ واقعیِ هدر می‌نشیند", async () => {
    writeAppendixResume({ scope: "grammar", id: "simple-present", title: "حال ساده", hint: "درس ۱" });
    render(
      <>
        <button type="button" data-testid="header-resume-button">
          ادامه از «حال ساده»
        </button>
        <ShortcutGuide />
      </>,
    );
    act(() => {
      window.dispatchEvent(new Event("open-shortcuts"));
    });
    const row = screen.getByTestId("resume-door-header");
    expect(row).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(row);
    });
    await act(async () => {
      await waitHandoff();
    });
    expect(document.activeElement).toBe(screen.getByTestId("header-resume-button"));
  });

  it("⑨ درِ هدر بی‌رکورد: صادقانه disable با توضیحِ درِ بسته — هیچ کنشِ ساختگی", () => {
    openGuide();
    const row = screen.getByTestId("resume-door-header");
    expect(row).toBeDisabled();
    expect(row).toHaveAttribute("title", expect.stringContaining("با نخستین دیدنِ ضمیمه"));
    // کلیکِ روی دکمهٔ disable راهنما را هم نمی‌بندد — هیچ اتفاقی نمی‌افتد
    act(() => {
      fireEvent.click(row);
    });
    expect(screen.queryByTestId("shortcut-guide-resume-loop")).not.toBeNull();
  });

  it("⑩ درِ هدر رویِ خودِ ضمیمه: disable با توضیحِ مستوری — نشانگرِ سرِ صفحه همان در است", () => {
    writeAppendixResume({ scope: "grammar", id: "simple-present", title: "حال ساده" });
    useStudy.setState({ view: { type: "appendix" } } as Partial<ReturnType<typeof useStudy.getState>>);
    openGuide();
    const row = screen.getByTestId("resume-door-header");
    expect(row).toBeDisabled();
    expect(row).toHaveAttribute("title", expect.stringContaining("مستور"));
    // درهایِ بقیه رویِ ضمیمه هم زنده‌اند — فقط درِ هدر بسته است
    expect(screen.getByTestId("resume-door-palette")).not.toBeDisabled();
    expect(screen.getByTestId("resume-door-home")).not.toBeDisabled();
  });

  it("⑪ پانویسِ عملیاتی کارت + هر ردیفِ زنده hintِ کنش دارد", () => {
    openGuide();
    const card = screen.getByTestId("shortcut-guide-resume-loop");
    expect(card).toHaveTextContent("کلیک روی هر ردیف، همان در را باز می‌کند");
    for (const door of RESUME_LOOP_DOORS) {
      const row = screen.getByTestId(`resume-door-${door.id}`);
      expect(row).toHaveAttribute("title");
    }
  });
});
