// @vitest-environment jsdom
// ------------------------------------------------------------------
// r285 «نشان‌ها در عکسِ هفته‌نامه» — نوارِ نشانها از DOM به کارتِ PNG:
//   ① کاربرِ پرچم‌دار: آرگومانِ badges از همان ارزیابیِ واحدِ نوار میآید —
//     تعدادِ چیپهای DOM === طولِ آرایهٔ PNG (یک ارزیابی، دو سطح)
//   ② بی‌نشانِ صادق: آرایهٔ تهی + خطِ صادقِ DOM — نه حذفِ نوار
//   ③ قفلِ آینه: WEEKLY_TIER_CHIP دقیقاً hexهایِ or-chip-*ِ globals.css —
//     بوم و DOM هرگز واگرا نمیشوند (الگویِ منبعِ یگانهٔ TIER_CHIPِ r284)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const { toastSpy, weeklyImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  weeklyImage: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/result-image")>();
  return {
    ...actual,
    downloadWeeklyImage: (...args: unknown[]) => weeklyImage(...args),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

import WeeklyReportSection from "@/components/study/reports/weekly-report";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { FIRST_VISIBLE_BADGE_ID } from "@/lib/identity";
import { WEEKLY_TIER_CHIP, type WeeklyImageOpts } from "@/lib/result-image";
import type { BadgeTier } from "@/lib/achievements";

const btn = () => screen.getByRole("button", { name: "گرفتن عکس هفته‌نامهٔ پیشرفت" });

function seedFlagged() {
  useStudy.setState({
    dayHistory: {
      [daysAgoKey(0)]: { day: daysAgoKey(0), reviews: 8, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    },
    dayStat: { day: daysAgoKey(0), reviews: 8, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    goalMetDays: [],
    streak: 0,
    userName: "مینا",
    seenBadges: [FIRST_VISIBLE_BADGE_ID],
    history: {},
    duelHistory: [],
  });
}

function seedEmpty() {
  useStudy.setState({
    dayHistory: {},
    goalMetDays: [],
    streak: 0,
    userName: "مینا",
    seenBadges: [],
    history: {},
    duelHistory: [],
  });
}

const domChips = () => document.querySelectorAll('.badge-band [class*="or-chip"]').length;

describe("نشانها در عکسِ هفته‌نامه (r285)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    weeklyImage.mockReset();
    window.localStorage.clear();
    useStudy.setState({
      dayHistory: {},
      history: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      goalMetDays: [],
      streak: 0,
      userName: "",
      duelHistory: [],
      seenBadges: [],
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
    });
  });

  it("پرچم‌دار: آرگومانِ PNG همان ارزیابیِ نوار است — تعدادِ چیپهای DOM === طولِ آرایه", async () => {
    weeklyImage.mockResolvedValue(true);
    seedFlagged();
    render(<WeeklyReportSection />);
    fireEvent.click(btn());
    await waitFor(() => expect(weeklyImage).toHaveBeenCalledTimes(1));
    const arg = weeklyImage.mock.calls[0][0] as WeeklyImageOpts;
    const titles = arg.badges.map((b) => b.title);
    expect(titles).toContain("اولین دیده‌شدن");
    expect(titles).toContain("اولین قدم");
    const fv = arg.badges.find((b) => b.title === "اولین دیده‌شدن");
    expect(fv?.tier).toBe("bronze");
    expect(arg.badges.length).toBe(domChips());
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("بی‌نشان: آرایهٔ تهیِ صادق + خطِ صادقِ DOM", async () => {
    weeklyImage.mockResolvedValue(true);
    seedEmpty();
    render(<WeeklyReportSection />);
    fireEvent.click(btn());
    await waitFor(() => expect(weeklyImage).toHaveBeenCalledTimes(1));
    const arg = weeklyImage.mock.calls[0][0] as WeeklyImageOpts;
    expect(arg.badges).toEqual([]);
    expect(screen.getByText(/هنوز نشانی باز نشده/)).toBeInTheDocument();
    expect(domChips()).toBe(0);
  });

  it("قفلِ آینه: WEEKLY_TIER_CHIP = hexهایِ or-chip-* در globals.css", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const chipHex = (name: string): { bg: string; ring: string; text: string } => {
      const m = css.match(new RegExp(`\\.or-chip-${name}\\s*\\{([^}]*)\\}`));
      if (!m) throw new Error(`or-chip-${name} not found in globals.css`);
      const bg = m[1].match(/background-color:\s*(#[0-9a-fA-F]{6})/)?.[1] ?? "";
      const ring = m[1].match(/border:\s*1px solid\s*(#[0-9a-fA-F]{6})/)?.[1] ?? "";
      const text = m[1].match(/(?<![\w-])color:\s*(#[0-9a-fA-F]{6})/)?.[1] ?? "";
      return { bg, ring, text };
    };
    const tiers: BadgeTier[] = ["bronze", "silver", "gold"];
    for (const t of tiers) {
      expect(WEEKLY_TIER_CHIP[t], `tier ${t}`).toEqual(chipHex(t));
    }
  });
});
