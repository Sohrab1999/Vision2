// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۸ — toastِ صادقِ پس از اولین نام‌گذاری (بندِ ① پیشنهادِ ۲۷۷).
// اندازه‌گیریِ زندهٔ همین راند، ارزشِ کاندیدا را فیصله داد: پس از
// «شروع با این نام»، نام تا اولین فعالیت هیچ‌جا ظاهر نمیشود — جدولِ
// امتیازات خالی است (نمرهای نیست) و فید هم (فعالیتی نیست)؛ پس وعدهٔ
// «دیده میشوی» معوق است و هیچ بازخوردی جز flipِ دکمه وجود ندارد.
// اصلاح: گذارِ بی-نام→نام‌دار یک toastِ یک-باره با وعدهٔ معوقِ صادق
// میدهد («با اولین فعالیتت…») — تغییرِ نامِ بعدی toast نمیگیرد.
// قراردادِ announcer (تسک ۱۷۱): تیترِ بی-«خطا» → کانالِ مؤدبانه.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import ProfilePopover from "@/components/study/profile/profile-popover";
import { sendProfile } from "@/lib/identity";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/identity", () => ({ sendProfile: vi.fn().mockResolvedValue({}) }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const ANON_HINT =
  "پروفایل من — هنوز ناشناسی؛ با انتخابِ نام در جدول امتیازات دیده می‌شوی";
const TOAST_TITLE = "✓ نامت ثبت شد";
const toastDesc = (name: string) =>
  `با اولین فعالیتت، «${name}» در جدول امتیازات کلاس و فید فعالیت دیده میشود.`;

const freshState = () => {
  useStudy.setState({
    known: {},
    results: {},
    history: {},
    mistakes: {},
    streak: 0,
    bestStreak: 0,
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    rushBest: 0,
    rushBestCorrect: 0,
    rushGames: 0,
    freezeCount: 0,
    freezeUsedDays: [],
    freezeEarnedDay: "",
    goalMetDays: [],
    seenBadges: [],
    userName: "",
    avatarColor: "emerald",
  });
};

const openProfile = (name: RegExp | string) => {
  const trigger = screen.getByRole("button", { name });
  act(() => {
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
  });
};

beforeEach(() => {
  cleanup();
  toastSpy.mockClear();
  vi.mocked(sendProfile).mockClear();
  freshState();
});

describe("راند ۲۷۸ — toastِ صادقِ پس از اولین نام‌گذاری", () => {
  it("پردهٔ ① — اولین نام‌گذاری: «شروع با این نام» → یک toast با تیترِ ثابت + وعدهٔ معوقِ صادق با خودِ نام + durationِ ۵۰۰۰؛ زنجیرهٔ قبلی دست‌نخورده", () => {
    render(<ProfilePopover />);
    openProfile(ANON_HINT);
    const input = screen.getByPlaceholderText("مثلاً: امیر محمد");
    act(() => {
      fireEvent.change(input, { target: { value: "کاوه" } });
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "شروع با این نام" }));
    });
    // زنجیرهٔ r277 دست‌نخورده:
    expect(useStudy.getState().userName).toBe("کاوه");
    expect(sendProfile).toHaveBeenCalledWith({ name: "کاوه", color: "emerald" });
    expect(screen.getByText("✓ ذخیره شد!")).toBeInTheDocument();
    // لایهٔ نوِ r278 — دقیقاً یک toast، با خودِ نام و وعدهٔ معوق:
    expect(toastSpy).toHaveBeenCalledTimes(1);
    const arg = toastSpy.mock.calls[0][0] as {
      title: string;
      description: string;
      duration: number;
    };
    expect(arg.title).toBe(TOAST_TITLE);
    expect(arg.description).toBe(toastDesc("کاوه"));
    expect(arg.duration).toBe(5000);
  });

  it("پردهٔ ② — تغییرِ نامِ بعدی: toast نمیگیرد (فقط گذارِ بی-نام→نام‌دار)؛ بقیهٔ رفتار سالم", () => {
    act(() => {
      useStudy.setState({ userName: "سارا" });
    });
    render(<ProfilePopover />);
    openProfile("پروفایل من");
    const input = screen.getByPlaceholderText("مثلاً: امیر محمد");
    act(() => {
      fireEvent.change(input, { target: { value: "سارا م" } });
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "ذخیرهٔ پروفایل" }));
    });
    expect(useStudy.getState().userName).toBe("سارا م");
    expect(sendProfile).toHaveBeenCalledWith({ name: "سارا م", color: "emerald" });
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("پردهٔ ③ — قفل‌هایِ منبع: گِردِ firstNaming یک-بار، رشته‌هایِ toast یک-بار، کانالِ مؤدبانه (بی-«خطا»)، فضای نامِ بی-«جزوه»، ترتیبِ گِرد پیش از toast", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/profile/profile-popover.tsx"),
      "utf8"
    );
    expect(src.split("const firstNaming = !named;").length - 1).toBe(1);
    expect(src.split("if (firstNaming) {").length - 1).toBe(1);
    expect(src.split('title: "✓ نامت ثبت شد"').length - 1).toBe(1);
    expect(
      src.split("با اولین فعالیتت، «${name}» در جدول امتیازات کلاس و فید فعالیت دیده میشود.").length - 1
    ).toBe(1);
    // گِرد پیش از فراخوانیِ toast میآید (منطقِ گذار، نه شعار):
    expect(src.indexOf("const firstNaming = !named;")).toBeLessThan(
      src.indexOf('title: "✓ نامت ثبت شد"')
    );
    // قراردادِ announcer: تیترِ بی-«خطا» → کانالِ مؤدبانه (اعلانِ مزاحم نیست)
    expect(TOAST_TITLE.includes("خطا")).toBe(false);
    // فضای نامِ a11y: رشته‌هایِ نو «جزوه»ی برهنه نمی‌گیرند
    for (const s of [TOAST_TITLE, toastDesc("کاوه")]) {
      expect(s.includes("جزوه")).toBe(false);
    }
  });
});
