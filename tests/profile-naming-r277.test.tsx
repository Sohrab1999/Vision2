// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۷ — نام‌گذاریِ دیرهنگام (بندِ ② پیشنهادِ ۲۷۵/۲۷۶): کاربری که
// در آنبوردینگ «رد کردن — ناشناس می‌مانم» را زده تا امروز هیچ
// دعوتِ دوباره‌ای نمی‌دید — دکمهٔ trigger همان «پروفایل من»ِ بی-تفاوت
// را می‌گفت، پاپ‌آور همان متنِ عمومیِ «نام خود را وارد کنید…» (خطابِ
// شما-کین به کاربری که اصلاً نام ندارد) و دکمهٔ ذخیره «ذخیرهٔ پروفایل»
// می‌گفت برایِ پروفایلی که وجود ندارد. سه لایهٔ نو:
//   ① trigger: بی-نام ← «پروفایل من — هنوز ناشناسی؛ با انتخابِ نام در
//      جدول امتیازات دیده می‌شوی» / نام‌دار ← بایت‌به‌بایتِ «پروفایل من»
//   ② متنِ پاپ‌آور: بی-نام ← خطابِ مستقیمِ «هنوز ناشناسی — با انتخابِ
//      یک نام … دیده می‌شوی.» (هم‌ لحنِ آنبوردینگ) / نام‌دار ← متنِ قبلی
//   ③ دکمهٔ ذخیره: بی-نام ← «شروع با این نام» / نام‌دار ← «ذخیرهٔ پروفایل»
//   + رفتار: تایپِ نام و کلیکِ «شروع با این نام» واقعاً setProfile می‌کند
//     و sendProfile با همان نام/رنگ صدا می‌خورد.
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
vi.mock("@/lib/identity", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/identity")>()), sendProfile: vi.fn().mockResolvedValue({}) }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const ANON_HINT =
  "پروفایل من — هنوز ناشناسی؛ با انتخابِ نام در جدول امتیازات دیده می‌شوی";
const INVITE_COPY =
  "هنوز ناشناسی — با انتخابِ یک نام در جدول امتیازات کلاس و فید فعالیت دیده می‌شوی.";
const GENERIC_COPY =
  "نام خود را وارد کنید تا در جدول امتیازات کلاس و فید فعالیت دیده شوید.";

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

describe("راند ۲۷۷ — نام‌گذاریِ دیرهنگام", () => {
  it("پردهٔ ① — کاربرِ بی-نام: trigger حالتش را می‌گوید؛ پاپ‌آور دعوتِ مستقیم + «شروع با این نام»؛ متنِ عمومیِ قدیمی غایب", () => {
    render(<ProfilePopover />);
    expect(screen.getByRole("button", { name: ANON_HINT })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "پروفایل من" })).toBeNull();

    openProfile(ANON_HINT);
    expect(screen.getByText("پروفایل یادگیرنده")).toBeInTheDocument();
    expect(screen.getByText(INVITE_COPY)).toBeInTheDocument();
    expect(screen.queryByText(GENERIC_COPY)).toBeNull();
    expect(screen.getByRole("button", { name: "شروع با این نام" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ذخیرهٔ پروفایل" })).toBeNull();
  });

  it("پردهٔ ② — رفتار: تایپِ نام و کلیکِ «شروع با این نام» → setProfile + sendProfile با همان نام/رنگ + «✓ ذخیره شد!»", () => {
    render(<ProfilePopover />);
    openProfile(ANON_HINT);
    const input = screen.getByPlaceholderText("مثلاً: امیر محمد");
    const save = screen.getByRole("button", { name: "شروع با این نام" });
    expect(save).toBeDisabled();
    act(() => {
      fireEvent.change(input, { target: { value: "کاوه" } });
    });
    expect(save).toBeEnabled();
    act(() => {
      fireEvent.click(save);
    });
    expect(useStudy.getState().userName).toBe("کاوه");
    expect(sendProfile).toHaveBeenCalledWith({ name: "کاوه", color: "emerald" });
    expect(screen.getByText("✓ ذخیره شد!")).toBeInTheDocument();
  });

  it("پردهٔ ③ — کاربرِ نام‌دار: همه‌چیز بایت‌به‌بایتِ قبل («پروفایل من» + متنِ عمومی + «ذخیرهٔ پروفایل»)؛ دعوتِ نو غایب", () => {
    act(() => {
      useStudy.setState({ userName: "سارا" });
    });
    render(<ProfilePopover />);
    expect(screen.getByRole("button", { name: "پروفایل من" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ANON_HINT })).toBeNull();

    openProfile("پروفایل من");
    expect(screen.getByText(GENERIC_COPY)).toBeInTheDocument();
    expect(screen.queryByText(INVITE_COPY)).toBeNull();
    expect(screen.getByRole("button", { name: "ذخیرهٔ پروفایل" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "شروع با این نام" })).toBeNull();
  });

  it("پردهٔ ④ — قفل‌هایِ منبع: سه دو-شاخه‌ایِ نو + ثابتِ ANON؛ فضای نامِ a11y بی-«جزوه»", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/profile/profile-popover.tsx"),
      "utf8"
    );
    expect(src.split('aria-label={named ? "پروفایل من" : ANON_PROFILE_HINT}').length - 1).toBe(1);
    expect(src.split('title={named ? "پروفایل من" : ANON_PROFILE_HINT}').length - 1).toBe(1);
    expect(src.split("{saved ? \"✓ ذخیره شد!\" : named ? \"ذخیرهٔ پروفایل\" : \"شروع با این نام\"}").length - 1).toBe(1);
    expect(src.split("const named = Boolean(mounted && userName);").length - 1).toBe(1);
    expect(src.split("هنوز ناشناسی — با انتخابِ یک نام").length - 1).toBe(1);
    // فضای نامِ a11y: رشته‌هایِ نو «جزوه»ی برهنه نمی‌گیرند
    for (const s of [ANON_HINT, INVITE_COPY, GENERIC_COPY]) {
      expect(s.includes("جزوه")).toBe(false);
    }
  });
});
