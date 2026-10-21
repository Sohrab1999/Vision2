// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۸۱ — گامِ جمع‌بندیِ آنبوردینگ حالا خطاب میکند: کاربری که در
// گامِ ۱ نامش را نوشت، در گامِ ۳ «همه‌چیز آماده است، <نام>!» می‌شنود
// نه تیترِ عمومیِ همیشگی. یک گزاره (namedHere) سه لایه را می‌چیند:
// تیترِ خوش‌آمد + حرفِ اولِ آواتار + ردیفِ نام — همان ایدئومِ تک‌حقیقتِ
// r277. مسیرِ بی‌نام بایت‌به‌بایتِ قبل می‌ماند (صداقت با ناشناس).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import Onboarding from "@/components/study/shell/onboarding";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/identity", () => ({ sendProfile: vi.fn().mockResolvedValue({ ok: true }) }));

const GENERIC_TITLE = "همه‌چیز آماده است!";

beforeEach(() => {
  cleanup();
  act(() => {
    useStudy.setState({
      onboarded: false,
      userName: "",
      known: {},
      results: {},
      history: {},
      mistakes: {},
      streak: 0,
      bestStreak: 0,
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
      seenBadges: [],
    });
    useStudy.persist.rehydrate();
  });
});

const toSummary = () => {
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
  });
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "ثبت هدف" }));
  });
};

describe("راند ۲۸۱ — جمع‌بندیِ آنبوردینگ خطاب میکند", () => {
  it("پردهٔ ① — کاربرِ نام‌دار: تیتر با خودِ نام + ردیفِ پروفایل با نام و حرفِ اولِ آواتار", () => {
    render(<Onboarding />);
    const input = document.getElementById("onb-name") as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: "آرش ر" } });
    });
    toSummary();
    expect(screen.getByText("همه‌چیز آماده است، آرش ر!")).toBeInTheDocument();
    expect(screen.queryByText(GENERIC_TITLE)).toBeNull();
    // ردیفِ پروفایل: نامِ کامل + حرفِ اول در توکنِ آواتار:
    expect(screen.getByText("آرش ر")).toBeInTheDocument();
    const avatarToken = screen.getByText("آ").className;
    expect(avatarToken).toContain("rounded-full");
  });

  it("پردهٔ ② — کاربرِ بی-نام: تیترِ عمومیِ بایت‌به‌بایتِ قبل + «یادگیرندهٔ ناشناس»", () => {
    render(<Onboarding />);
    toSummary();
    expect(screen.getByText(GENERIC_TITLE)).toBeInTheDocument();
    expect(screen.getByText("یادگیرندهٔ ناشناس")).toBeInTheDocument();
    expect(screen.queryByText(/همه‌چیز آماده است،/)).toBeNull();
  });

  it("پردهٔ ③ — قفل‌هایِ منبع: یک گزاره برایِ سه لایه (بدونِ دوگانهٔ قدیمی)، تیترِ دومشاخه‌ای یک-بار، فضای نامِ بی-«جزوه»", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/shell/onboarding.tsx"),
      "utf8"
    );
    // گزارهٔ واحد — راندهای قبل دو دفعهٔ inline می‌نوشتند:
    expect(src.split("const summaryName = nameDraft.trim();").length - 1).toBe(1);
    expect(src.split("const namedHere = summaryName.length >= 2;").length - 1).toBe(1);
    // دوگانه‌هایِ قدیمیِ inline رفته‌اند:
    expect(src.split("nameDraft.trim().length >= 2").length - 1).toBe(0);
    // تیترِ دومشاخه‌ای یک-بار + شاخهٔ بی-نام بایت‌به‌بایتِ قبل:
    expect(src.split("همه‌چیز آماده است، ${summaryName}!").length - 1).toBe(1);
    expect(src.split('"همه‌چیز آماده است!"').length - 1).toBe(1);
    // سه مصرفِ namedHere (تیتر + آواتار + ردیفِ نام):
    expect(src.split("namedHere ?").length - 1).toBe(3);
    // فضای نامِ a11y: رشته‌هایِ نو «جزوه»ی برهنه نمی‌گیرند
    expect("همه‌چیز آماده است، آرش ر!".includes("جزوه")).toBe(false);
  });
});
