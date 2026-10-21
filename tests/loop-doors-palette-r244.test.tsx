// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۴ — بندهای ①+② پیشنهادِ ۲۴۳:
//
// ① «فهرستِ زنده» به‌مصرفِ دوم رسید: گروهِ «درهای حلقه» در فرمان‌یاب از
//    همان RESUME_LOOP_DOORS رندر می‌شود — درِ نو = یک سطرِ داده، نه یک
//    فرمانِ دستی. قراردادها:
//      • درِ فرمان‌یاب حذف است (فرمانِ باز کردنِ پالت از درونِ پالت =
//        کنشِ ساختگی — صداقتِ r236).
//      • درِ هدر فقط با رکورد و بیرونِ ضمیمه حاضر است (غیبتِ صادقانه نه
//        ردیفِ بی‌کنش — همان ایدئومِ nav-resume).
//      • برچسب از leadِ خودِ داده، hint = openLabel.
//      • اجرا: ناوبری‌ها فوری؛ درِ هدر بعد از DOOR_HANDOFF_DELAY_MS با
//        اسکرول+فوکوس+پالس؛ دکمه در فاصلهٔ باز-تا-اجرا غیب شود = هیچ.
//
// ② پالسِ زرشکیِ گذرای درِ هدر (همان ایدئومِ لنگرِ ضمیمهٔ r235): مالکِ
//    نمایش خودِ دکمهٔ هدر است و پرنده‌هایِ در فقط رویداد می‌فرستند —
//    فوکوسِ برنامه‌ای همیشه focus-visible نمی‌گیرد، پالس ۱٫۶ثانیه‌ای
//    جایِ حرفِ باقی‌مانده را پر می‌کند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import CommandPalette from "@/components/study/shell/command-palette";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import {
  COMMAND_GROUPS,
} from "@/lib/command-palette";
import {
  RESUME_LOOP_DOORS,
  DOOR_HANDOFF_DELAY_MS,
  PULSE_HEADER_RESUME_EVENT,
  doorCmdId,
  DOOR_CMD_PREFIX,
} from "@/lib/resume-loop-doors";
import { useStudy } from "@/lib/study-store";
import { writeAppendixResume, type AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};

const openPalette = () => {
  // fireEvent = پوشش act() — هم‌الگوی پالتِ Task 79
  fireEvent(window, new CustomEvent("open-command-palette"));
};

/** صبرِ واقعی تا پایانِ دورهٔ تحویل (۲۶۰ms + حاشیه) */
const waitHandoff = () => new Promise((r) => setTimeout(r, DOOR_HANDOFF_DELAY_MS + 100));

beforeAll(() => {
  // jsdom scrollIntoView ندارد — درِ هدر برایِ «نشان دادن» صدا می‌زند
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
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  useStudy.setState({
    view: { type: "dictionary" } as never, // نقطهٔ شروع غیرِمقصد — ناوبری واقعی اثبات شود
  });
  cleanup();
});

describe("قراردادِ داده — گروهِ «درهای حلقه» از تک‌منبع — r244 ①", () => {
  it("① شناسهٔ فرمانِ هر در خودکفا و ثابت است — «door-<id>» نه ایندکس", () => {
    for (const d of RESUME_LOOP_DOORS) {
      expect(doorCmdId(d.id)).toBe(`${DOOR_CMD_PREFIX}${d.id}`);
    }
    expect(doorCmdId("header")).toBe("door-header");
    expect(doorCmdId("home")).toBe("door-home");
  });

  it("② گروهِ «درهای حلقه» در COMMAND_GROUPS درست بعد از «ادامه‌های اخیر» و یکتاست", () => {
    expect(COMMAND_GROUPS).toContain("درهای حلقه");
    expect(new Set(COMMAND_GROUPS).size).toBe(COMMAND_GROUPS.length);
    expect(COMMAND_GROUPS.indexOf("درهای حلقه")).toBe(
      COMMAND_GROUPS.indexOf("ادامه‌های اخیر") + 1,
    );
    // قراردادهایِ کهنه پابرجا
    expect(COMMAND_GROUPS[0]).toBe("ناوبری");
    expect(COMMAND_GROUPS.indexOf("ادامه‌های اخیر")).toBe(
      COMMAND_GROUPS.indexOf("ناوبری") + 1,
    );
  });

  it("③ فهرستِ زنده: هر درِ غیرِفرمان‌یابی، یک فرمان با برچسبِ از lead و hintِ openLabel دارد", () => {
    // با رکورد تا درِ هدر هم در فهرست باشد (گِیتِ حضورِ r236)
    writeAppendixResume(grammarRec);
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    // درِ فرمان‌یاب حذف است — فرمانِ باز کردنِ پالت از درونِ پالت ساختگی است
    expect(group.textContent).not.toContain("باز کردن فرمان‌یاب");
    for (const d of RESUME_LOOP_DOORS.filter((x) => x.id !== "palette")) {
      const label = d.lead ? `درِ ${d.lead.replace(/:\s*$/, "")}` : d.openLabel;
      expect(group.textContent).toContain(label);
      expect(group.textContent).toContain(d.openLabel); // hint = openLabel
    }
  });
});

describe("حضورِ صادقانه — گِیت‌هایِ درِ هدر — r244 ①", () => {
  it("④ بی‌رکورد: چهار در (خانه/نتایج/ضمیمه/پروفایل)، بی‌«درِ هدر» — شمارشِ ۳۶گزینه‌ای (r246 + nav-library؛ r290)", () => {
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(4);
    expect(group.textContent).not.toContain("درِ هدر");
    expect(screen.getAllByRole("option").length).toBe(36); // r290: + nav-library
  });

  it("⑤ با رکورد: «درِ هدر» هم حاضر است — شمارشِ ۳۸گزینه‌ای (۳۱ + nav-resume + ۵ در + nav-library؛ r290)", () => {
    writeAppendixResume(grammarRec);
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(5);
    expect(group.textContent).toContain("درِ هدر");
    // ۳۱ فرمانِ کهنه + فرمانِ «ادامهٔ مطالعه» (r235) + ۵ درِ حلقه
    expect(screen.getAllByRole("option").length).toBe(38); // r290: + nav-library
  });

  it("⑥ رویِ خودِ ضمیمه: «درِ هدر» غیب است (نشانگرِ سرِ صفحه همین در است) — سه درِ دیگر زنده", () => {
    writeAppendixResume(grammarRec);
    useStudy.setState({ view: { type: "appendix" } } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    expect(group.textContent).not.toContain("درِ هدر");
    expect(group.textContent).toContain("درِ خانه");
    expect(group.textContent).toContain("درِ ضمیمه");
    expect(group.textContent).toContain("درِ پروفایل");
  });

  it("⑦ جست‌وجوپذیر: «هدر» و «سینی» (از متنِ در) فرمان‌های درها را می‌آورد", () => {
    render(<CommandPalette />);
    openPalette();
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "درِ پروفایل" } });
    expect(screen.getAllByRole("option")[0]!.textContent).toContain("درِ پروفایل");
  });
});

describe("درهایِ عملیاتی — کلیک، همان در را باز می‌کند — r244 ①", () => {
  it("⑧ درِ خانه و ضمیمه: ناوبریِ فوریِ view از storeِ واقعی", () => {
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    const homeRow = ([...group.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
      (r) => r.textContent?.includes("درِ خانه"),
    )!;
    fireEvent.click(homeRow);
    expect(useStudy.getState().view.type).toBe("home");
    // اجرا پالت را می‌بندد — بازِ دوباره برای درِ دوم (کلیک روی گرهِ جدا شده هیچ است)
    openPalette();
    const group2 = screen.getByRole("group", { name: "درهای حلقه" });
    const appendRow = ([...group2.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
      (r) => r.textContent?.includes("درِ ضمیمه"),
    )!;
    fireEvent.click(appendRow);
    expect(useStudy.getState().view.type).toBe("appendix");
  });

  it("⑨ درِ پروفایل: dispatchِ open-profile — فوری", () => {
    const fired: string[] = [];
    const l = () => fired.push("profile");
    window.addEventListener("open-profile", l);
    try {
      render(<CommandPalette />);
      openPalette();
      const group = screen.getByRole("group", { name: "درهای حلقه" });
      const row = ([...group.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
        (r) => r.textContent?.includes("درِ پروفایل"),
      )!;
      fireEvent.click(row);
      expect(fired).toEqual(["profile"]);
    } finally {
      window.removeEventListener("open-profile", l);
    }
  });

  it("⑩ درِ هدر: در دورهٔ تحویل هیچ، بعدش فوکوس + پالس روی دکمهٔ واقعیِ سوارشده", async () => {
    writeAppendixResume(grammarRec);
    const pulses: number[] = [];
    const l = () => pulses.push(1);
    window.addEventListener(PULSE_HEADER_RESUME_EVENT, l);
    try {
      render(
        <>
          <HeaderResumeButton />
          <CommandPalette />
        </>,
      );
      openPalette();
      const group = screen.getByRole("group", { name: "درهای حلقه" });
      const row = ([...group.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
        (r) => r.textContent?.includes("درِ هدر"),
      )!;
      await act(async () => {
        fireEvent.click(row);
      });
      // در دورهٔ تحویل: نه فوکوس، نه پالس — FocusScopeِ بسته‌شونده هنوز صاحبِ صحنه است
      expect(pulses).toEqual([]);
      expect(document.activeElement).not.toBe(screen.getByTestId("header-resume-button"));
      await act(async () => {
        await waitHandoff();
      });
      expect(pulses).toEqual([1]);
      expect(document.activeElement).toBe(screen.getByTestId("header-resume-button"));
      expect(screen.getByTestId("header-resume-button")).toHaveAttribute("data-pulsing", "true");
    } finally {
      window.removeEventListener(PULSE_HEADER_RESUME_EVENT, l);
    }
  });

  it("⑪ صداقتِ اجرا: رکورد در فاصلهٔ باز-تا-اجرا پاک شود = هیچ (بی‌فوکوس، بی‌پالس)", async () => {
    writeAppendixResume(grammarRec);
    const pulses: number[] = [];
    const l = () => pulses.push(1);
    window.addEventListener(PULSE_HEADER_RESUME_EVENT, l);
    try {
      render(
        <>
          <HeaderResumeButton />
          <CommandPalette />
        </>,
      );
      openPalette();
      const group = screen.getByRole("group", { name: "درهای حلقه" });
      const row = ([...group.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
        (r) => r.textContent?.includes("درِ هدر"),
      )!;
      await act(async () => {
        fireEvent.click(row);
        // در فاصلهٔ باز-تا-اجرا رکورد پاک می‌شود → دکمهٔ هدر واکنشی غیب می‌شود
        localStorage.removeItem("vision2-bg-last-item");
      });
      // رندرِ دوباره: دکمهٔ هدر دیگر نیست
      cleanup();
      render(
        <>
          <CommandPalette />
        </>,
      );
      await act(async () => {
        await waitHandoff();
      });
      expect(pulses).toEqual([]);
    } finally {
      window.removeEventListener(PULSE_HEADER_RESUME_EVENT, l);
    }
  });

  it("⑫ فرمان‌های درها واردِ نوارِ «اخیر» می‌شوند — فرمانِ ناوبری‌اند نه مسیرِ اخیر", () => {
    render(<CommandPalette />);
    openPalette();
    const group = screen.getByRole("group", { name: "درهای حلقه" });
    const row = ([...group.querySelectorAll('[role="option"]')] as HTMLElement[]).find(
      (r) => r.textContent?.includes("درِ خانه"),
    )!;
    fireEvent.click(row);
    const recents = JSON.parse(window.localStorage.getItem("vision2-cmd-recent") ?? "[]");
    expect(recents).toContain("door-home");
  });
});

describe("پالسِ زرشکیِ درِ هدر — r244 ②", () => {
  it("⑬ مالکِ پالس خودِ دکمه است: رویداد → data-pulsing + کلاسِ زرشکی، ۱٫۶ثانیه بعد → برطرف", async () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    const btn = screen.getByTestId("header-resume-button");
    expect(btn).not.toHaveAttribute("data-pulsing");
    expect(btn.className).toContain("border-emerald-200");
    expect(btn.className).not.toContain("border-rose-300");
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    expect(btn).toHaveAttribute("data-pulsing", "true");
    expect(btn.className).toContain("border-rose-300");
    expect(btn.className).toContain("shadow-rose-300");
    expect(btn.className).toContain("shadow-[inset_0_0_0_2px]");
    // در دارک هم سطحِ خودش را دارد
    expect(btn.className).toContain("dark:bg-rose-950/40");
    // پالس گذراست — ۱٫۶ثانیه بعد واقعاً برطرف می‌شود
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1750));
    });
    expect(btn).not.toHaveAttribute("data-pulsing");
    expect(btn.className).not.toContain("border-rose-300");
  });

  it("⑭ ترنزیشنِ scopeشده: box-shadow هم در فهرستِ ترنزیشن است تا حلقهٔ inset نرم محو شود", () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    const btn = screen.getByTestId("header-resume-button");
    expect(btn.className).toContain(
      "transition-[background-color,color,border-color,transform,box-shadow]",
    );
  });

  it("⑮ پرنده‌هایِ در فقط رویداد می‌فرستند — درِ هدرِ راهنما هم پالس می‌گیرد (یکپارچگیِ کمکیِ مشترک)", async () => {
    writeAppendixResume(grammarRec);
    const pulses: number[] = [];
    const l = () => pulses.push(1);
    window.addEventListener(PULSE_HEADER_RESUME_EVENT, l);
    try {
      render(
        <>
          <HeaderResumeButton />
          <ShortcutGuide />
        </>,
      );
      act(() => {
        window.dispatchEvent(new Event("open-shortcuts"));
      });
      await act(async () => {
        fireEvent.click(screen.getByTestId("resume-door-header"));
      });
      await act(async () => {
        await waitHandoff();
      });
      expect(pulses).toEqual([1]);
      expect(document.activeElement).toBe(screen.getByTestId("header-resume-button"));
      expect(screen.getByTestId("header-resume-button")).toHaveAttribute("data-pulsing", "true");
    } finally {
      window.removeEventListener(PULSE_HEADER_RESUME_EVENT, l);
    }
  });
});
