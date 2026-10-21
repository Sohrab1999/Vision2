// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۹ — «وعده برقرار شد»: تکمیلِ حلقهٔ بازخوردِ نام‌گذاری.
// r278 وعدهٔ معوق داد («با اولین فعالیتت … دیده میشوی»)؛ این راند
// لحظهٔ برقراریِ وعده را جشن میگیرد: نخستین ردیفِ آمارِ نام‌داری که
// سرور پذیرفت (هر ردیفِ فید و ردیفِ جدول از /api/stats میآید).
// پرچمِ یک‌باره = شبه‌نشانِ "first-visible" در seenBadges — بدونِ
// تغییرِ schema؛ خطِ لولهٔ نشانها از قبل ذخیره/ادغام/سفر میکند.
// گوش‌دهنده در ProfilePopover (خانهٔ UXِ نام‌گذاری) — همان ایدئومِ
// رویدادِ پنجرهٔ open-profile. قراردادِ announcer: تیترِ بی-«خطا».
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import ProfilePopover from "@/components/study/profile/profile-popover";
import { sendStats, FIRST_VISIBLE_BADGE_ID } from "@/lib/identity";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/identity", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/identity")>();
  return { ...actual, sendProfile: vi.fn().mockResolvedValue({ ok: true }) };
});
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const CELEBRATION_TITLE = "✓ وعده برقرار شد";
const celebrationDesc = (name: string) =>
  `اولین فعالیتت با نام «${name}» ثبت شد — حالا در جدول امتیازات کلاس و فید فعالیت دیده میشوی.`;

let fired: Array<{ name?: string }>;
const listener = (e: Event) => fired.push((e as CustomEvent<{ name?: string }>).detail ?? {});

beforeEach(() => {
  cleanup();
  toastSpy.mockClear();
  fired = [];
  window.addEventListener("first-visible", listener);
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));
  useStudy.setState({
    known: {},
    results: {},
    history: {},
    mistakes: {},
    streak: 0,
    bestStreak: 0,
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    seenBadges: [],
    userName: "",
    avatarColor: "emerald",
    userId: "u-test",
    userSecret: "s-test",
  });
});

afterEach(() => {
  window.removeEventListener("first-visible", listener);
  vi.unstubAllGlobals();
});

describe("راند ۲۷۹ — «وعده برقرار شد»: جشنِ نخستین دیده‌شدنِ نام", () => {
  it("پردهٔ ① — نخستین آمارِ نام‌دارِ پذیرفته‌شده: پرچم در seenBadges + دقیقاً یک رویداد با خودِ نام؛ خودِ sendStats هم true", async () => {
    act(() => {
      useStudy.setState({ userName: "آرش", seenBadges: [] });
    });
    let ok = false;
    await act(async () => {
      ok = await sendStats({ lesson: 1, category: "lesson-quiz", total: 10, correct: 8 });
    });
    expect(ok).toBe(true);
    expect(useStudy.getState().seenBadges).toContain(FIRST_VISIBLE_BADGE_ID);
    expect(fired).toHaveLength(1);
    expect(fired[0]?.name).toBe("آرش");
  });

  it("پردهٔ ② — کاربرِ بی-نام: حتی با ردیفِ پذیرفته‌شده، نه پرچم نه جشن (نامِ ناشناس هیچ‌جا دیده نمیشود)", async () => {
    act(() => {
      useStudy.setState({ userName: "", seenBadges: [] });
    });
    let ok = false;
    await act(async () => {
      ok = await sendStats({ lesson: 1, category: "lesson-quiz", total: 10, correct: 8 });
    });
    expect(ok).toBe(true);
    expect(useStudy.getState().seenBadges).not.toContain(FIRST_VISIBLE_BADGE_ID);
    expect(fired).toHaveLength(0);
  });

  it("پردهٔ ③ — جشنِ یک‌بارِ همیشگی: با پرچمِ موجود، ردیفِ بعدیِ نام‌دار هیچ رویدادِ تازه‌ای نمی‌سازد", async () => {
    act(() => {
      useStudy.setState({ userName: "آرش", seenBadges: [FIRST_VISIBLE_BADGE_ID] });
    });
    await act(async () => {
      await sendStats({ lesson: 2, category: "lesson-quiz", total: 10, correct: 9 });
    });
    expect(fired).toHaveLength(0);
  });

  it("پردهٔ ④ — گوش‌دهندهٔ ProfilePopover: رویدادِ پنجره → دقیقاً یک toast با تیترِ ثابت + خودِ نام + durationِ ۶۰۰۰؛ بی-نامِ در detail بی‌toast", () => {
    useStudy.setState({ userName: "آرش" });
    render(<ProfilePopover />);
    act(() => {
      window.dispatchEvent(new CustomEvent("first-visible", { detail: { name: "آرش" } }));
    });
    expect(toastSpy).toHaveBeenCalledTimes(1);
    const arg = toastSpy.mock.calls[0][0] as { title: string; description: string; duration: number };
    expect(arg.title).toBe(CELEBRATION_TITLE);
    expect(arg.description).toBe(celebrationDesc("آرش"));
    expect(arg.duration).toBe(6000);
    // detailِ بی‌نام → هیچ toastی (قراردادِ گِردِ در گوش‌دهنده)
    act(() => {
      window.dispatchEvent(new CustomEvent("first-visible", { detail: {} }));
    });
    expect(toastSpy).toHaveBeenCalledTimes(1);
  });

  it("پردهٔ ⑤ — قفل‌هایِ منبع: گِردِ پذیرش یک-بار و پیش از return، ثابتِ شبه‌نشان یک-بار، best-effort (try/catch)، گوش‌دهندهٔ یک-بار، کانالِ مؤدبانه و فضای نامِ بی-«جزوه»", () => {
    const ident = readFileSync(join(process.cwd(), "src/lib/identity.ts"), "utf8");
    const popover = readFileSync(
      join(process.cwd(), "src/components/study/profile/profile-popover.tsx"),
      "utf8"
    );
    // گِردِ جشن فقط در مسیرِ پذیرشِ سرور و پیش از return:
    expect(ident.split("if (res.ok) celebrateFirstVisible();").length - 1).toBe(1);
    expect(ident.indexOf("if (res.ok) celebrateFirstVisible();")).toBeLessThan(
      ident.indexOf("return res.ok;")
    );
    expect(ident.split('export const FIRST_VISIBLE_BADGE_ID = "first-visible";').length - 1).toBe(1);
    // جشن هرگز مسیرِ آمار را نمیشکند:
    expect(ident.slice(ident.indexOf("function celebrateFirstVisible"), ident.indexOf("export interface StatsPayload"))).toContain("catch");
    // گوش‌دهنده در ProfilePopover یک-بار:
    expect(popover.split('window.addEventListener("first-visible", handler)').length - 1).toBe(1);
    // قراردادِ announcer: تیترِ بی-«خطا» → کانالِ مؤدبانه
    expect(CELEBRATION_TITLE.includes("خطا")).toBe(false);
    expect(celebrationDesc("آرش").includes("خطا")).toBe(false);
    // فضای نامِ a11y: رشته‌هایِ نو «جزوه»ی برهنه نمی‌گیرند
    for (const s of [CELEBRATION_TITLE, celebrationDesc("کاوه")]) {
      expect(s.includes("جزوه")).toBe(false);
    }
  });
});
