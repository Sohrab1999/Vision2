// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۵ — بندهای ①+② پیشنهادِ ۲۴۴:
//
// ① حبابِ آموزشیِ گذرای درِ هدر: پالس «کجا» را گفت، حباب «چه‌کار» را
//    می‌گوید — قراردادِ «پرش ≠ نوشتن» (r240) که فقط در پنلِ caret ساکن
//    بود، حالا لحظهٔ رسیدنِ در هم آموزش می‌دهد. pointer-events-none،
//    role=status، با کلیکِ رویِ خودِ خوشه یا ۳٫۶ثانیه می‌رود.
//
// ② «فهرستِ زنده» مصرفِ سومش را گرفت: بلوکِ پروفایل ردیف‌هایِ «ادامه» را
//    از RESUME_LOOP_DOORS می‌شناسد — درِ نو یک سطرِ داده. قراردادها:
//      • درِ خودِ پروفایل حذف (فرمانِ باز کردنِ پروفایل از درونِ پروفایل =
//        کنشِ ساختگی — صداقتِ r236).
//      • درِ هدر رویِ خودِ ضمیمه غیبِ صادقانه (نشانگرِ سرِ صفحه همان در).
//      • ناوبری‌ها فوری + بستنِ پاپ‌اُور؛ فرمان‌یاب/هدر بعد از دورهٔ تحویل.
//      • نامِ کوتاهِ هر در از doorShortName — یک اشتقاق، یک منبع.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import ProfilePopover from "@/components/study/profile/profile-popover";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import {
  RESUME_LOOP_DOORS,
  DOOR_HANDOFF_DELAY_MS,
  PULSE_HEADER_RESUME_EVENT,
  doorShortName,
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

const waitHandoff = () => new Promise((r) => setTimeout(r, DOOR_HANDOFF_DELAY_MS + 100));

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
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  useStudy.setState({
    view: { type: "home" },
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

const openProfile = () => {
  const trigger = screen.getByRole("button", { name: "پروفایل من" });
  act(() => {
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
  });
};

describe("حبابِ آموزشیِ درِ هدر — r245 ①", () => {
  it("① پیش‌فرض هیچ؛ رویدادِ پالس → حبابِ role=status با قراردادِ «پرش ≠ نوشتن» + پالس", () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    const btn = screen.getByTestId("header-resume-button");
    expect(screen.queryByTestId("header-resume-door-hint")).toBeNull();
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    const hint = screen.getByTestId("header-resume-door-hint");
    expect(hint).toHaveAttribute("role", "status");
    expect(hint).toHaveAttribute("data-hinting", "true");
    expect(hint.className).toContain("pointer-events-none");
    expect(hint.textContent).toContain("مسیرهای اخیر");
    // r247 — تصحیحِ صداقت: «پرش ≠ نوشتنِ دستی» (جملهٔ کهنه فقط برایِ دو لایهٔ شنیدنی درست بود)
    expect(hint.textContent).toContain("پرش ≠ نوشتنِ دستی");
    expect(btn).toHaveAttribute("data-pulsing", "true");
  });

  it("② حباب گذراست — بعد از ۳٫۶ثانیه خودش می‌رود", async () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 3800));
    });
    expect(screen.queryByTestId("header-resume-door-hint")).toBeNull();
  });

  it("③ کلیک روی خودِ خوشه حباب را زودتر می‌برد — کاربر خودش آمده", () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByTestId("header-resume-button"));
    });
    expect(screen.queryByTestId("header-resume-door-hint")).toBeNull();
  });

  it("④ پالسِ تازه حباب را نوسازی می‌کند — هر رسیدنی آموزشِ خودش را دارد", async () => {
    writeAppendixResume(grammarRec);
    render(<HeaderResumeButton />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2000));
    });
    // ۲ ثانیه از پالسِ اول — هنوز داخلِ پنجرهٔ ۳٫۶ثانیه‌ای
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_HEADER_RESUME_EVENT));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2100));
    });
    // ۴٫۱ ثانیه از اولین پالس ولی فقط ۲٫۱ از دومی — تایمر نوسازی شده، حباب هست
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1700));
    });
    // ۳٫۸ ثانیه از دومین پالس — گذشت
    expect(screen.queryByTestId("header-resume-door-hint")).toBeNull();
  }, 9000);
});

describe("doorShortName — یک اشتقاق، یک منبع — r245 ②", () => {
  it("⑤ درهایِ leadدار = leadِ بدونِ «:»؛ درِ بی‌lead = نخستینِ بخشِ متن (r246: درِ «نتایج» هم)", () => {
    const byId = Object.fromEntries(RESUME_LOOP_DOORS.map((d) => [d.id, d]));
    expect(doorShortName(byId.header!)).toBe("هدر");
    expect(doorShortName(byId.home!)).toBe("خانه");
    expect(doorShortName(byId.appendix!)).toBe("ضمیمه");
    expect(doorShortName(byId.results!)).toBe("نتایج");
    expect(doorShortName(byId.profile!)).toBe("پروفایل");
    expect(doorShortName(byId.palette!)).toBe("فرمان‌یاب");
  });
});

describe("مینی‌کارتِ درهایِ حلقه در پروفایل — r245 ②", () => {
  it("⑥ با رکورد: پنج ردیف از داده — بی‌درِ پروفایل (اینجا ایستاده‌ای) + پانویسِ عملیاتی (r246: درِ ششم پیوست)", () => {
    writeAppendixResume(grammarRec);
    render(<ProfilePopover />);
    openProfile();
    const card = screen.getByTestId("profile-resume-doors");
    const rows = card.querySelectorAll('[data-testid^="profile-resume-door-"]');
    expect(rows).toHaveLength(RESUME_LOOP_DOORS.length - 1);
    expect(screen.queryByTestId("profile-resume-door-profile")).toBeNull();
    expect(screen.getByTestId("profile-resume-door-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-resume-door-palette")).toBeInTheDocument();
    // برچسب از doorShortName — «درِ فرمان‌یاب» از متنِ درِ بی‌lead
    expect(card.textContent).toContain("درِ فرمان‌یاب");
    expect(card.textContent).toContain("درِ هدر");
    // پانویسِ عملیاتی — همان قراردادِ کارتِ راهنما
    expect(card.textContent).toContain("کلیک روی هر ردیف، همان در را باز می‌کند");
    // hintِ کنش در title
    for (const door of RESUME_LOOP_DOORS.filter((d) => d.id !== "profile")) {
      expect(screen.getByTestId(`profile-resume-door-${door.id}`)).toHaveAttribute(
        "title",
        door.openLabel,
      );
    }
  });

  it("⑦ درِ خانه: بستنِ پاپ‌اُور + ناوبریِ فوریِ view", () => {
    writeAppendixResume(grammarRec);
    useStudy.setState({ view: { type: "dictionary" } } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<ProfilePopover />);
    openProfile();
    act(() => {
      fireEvent.click(screen.getByTestId("profile-resume-door-home"));
    });
    expect(useStudy.getState().view.type).toBe("home");
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
  });

  it("⑧ درِ ضمیمه: بستنِ پاپ‌اُور + ناوبریِ فوریِ view", () => {
    writeAppendixResume(grammarRec);
    render(<ProfilePopover />);
    openProfile();
    act(() => {
      fireEvent.click(screen.getByTestId("profile-resume-door-appendix"));
    });
    expect(useStudy.getState().view.type).toBe("appendix");
  });

  it("⑨ درِ فرمان‌یاب: در دورهٔ تحویل هیچ، بعدش dispatchِ open-command-palette", async () => {
    writeAppendixResume(grammarRec);
    const fired: string[] = [];
    const l = () => fired.push("palette");
    window.addEventListener("open-command-palette", l);
    try {
      render(<ProfilePopover />);
      openProfile();
      await act(async () => {
        fireEvent.click(screen.getByTestId("profile-resume-door-palette"));
      });
      expect(fired).toEqual([]); // دورهٔ تحویلِ فوکوس
      expect(screen.queryByTestId("profile-resume-section")).toBeNull();
      await act(async () => {
        await waitHandoff();
      });
      expect(fired).toEqual(["palette"]);
    } finally {
      window.removeEventListener("open-command-palette", l);
    }
  });

  it("⑩ درِ هدر: بعد از تحویل، فوکوس + پالس روی دکمهٔ واقعیِ سوارشده", async () => {
    writeAppendixResume(grammarRec);
    render(
      <>
        <HeaderResumeButton />
        <ProfilePopover />
      </>,
    );
    openProfile();
    await act(async () => {
      fireEvent.click(screen.getByTestId("profile-resume-door-header"));
    });
    await act(async () => {
      await waitHandoff();
    });
    const btn = screen.getByTestId("header-resume-button");
    expect(document.activeElement).toBe(btn);
    expect(btn).toHaveAttribute("data-pulsing", "true");
    // حبابِ آموزشی هم همراهِ پالس می‌آید — در از پروفایل هم «چه‌کار» را می‌گوید
    expect(screen.getByTestId("header-resume-door-hint")).toBeInTheDocument();
  });

  it("⑪ رویِ خودِ ضمیمه: درِ هدر غیبِ صادقانه — سه درِ دیگر زنده", () => {
    writeAppendixResume(grammarRec);
    useStudy.setState({ view: { type: "appendix" } } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<ProfilePopover />);
    openProfile();
    const card = screen.getByTestId("profile-resume-doors");
    const rows = card.querySelectorAll('[data-testid^="profile-resume-door-"]');
    expect(rows).toHaveLength(RESUME_LOOP_DOORS.length - 2);
    expect(screen.queryByTestId("profile-resume-door-header")).toBeNull();
    expect(screen.getByTestId("profile-resume-door-home")).toBeInTheDocument();
    expect(screen.getByTestId("profile-resume-door-appendix")).toBeInTheDocument();
    expect(screen.getByTestId("profile-resume-door-palette")).toBeInTheDocument();
  });

  it("⑫ بی‌رکورد: کلِ بخشِ «ادامه» غیب است — مینی‌کارت هم داخلِ همان بخش است (قراردادِ r237)", () => {
    render(<ProfilePopover />);
    openProfile();
    expect(screen.getByText("پروفایل یادگیرنده")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-resume-section")).toBeNull();
    expect(screen.queryByTestId("profile-resume-doors")).toBeNull();
  });
});
