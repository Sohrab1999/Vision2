// @vitest-environment jsdom
// ------------------------------------------------------------------
// r287 «نشانها در کارتِ نبرد» — بندِ ② راندِ ۲۸۶:
//   ① کاربرِ پرچم‌دار: آرگومانِ badges هر دو دروازه (دانلود + هم‌رسانی) از
//     همان ارزیابیِ واحدِ رجیستری میآید — دو دروازه، یک ارزیابی، آرایهٔ برابر
//   ② بی‌نشانِ صادق: آرایهٔ تهی در هر دو دروازه — نه حذفِ باند
//   ③ رویدادِ duel_image فقط با کارتِ واقعاً ساختهشده — شکستِ ساخت رویداد ندارد
//   ④ قفلِ ساختاری: هیچ کارتی باندِ خودش را نمیکشد (سه کارت از یک نقاش) و
//     duel-done ارزیابیِ موازی ندارد (buildEvalInput یکبار، بدونِ کپیِ چیپ)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const { toastSpy, canShareSpy, shareSpy, buildBlob, doneImage, trackSpy } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  canShareSpy: vi.fn(() => true),
  shareSpy: vi.fn(),
  buildBlob: vi.fn(),
  doneImage: vi.fn(),
  trackSpy: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadDuelDoneImage: (...args: unknown[]) => doneImage(...args),
  buildDuelDoneBlob: (...args: unknown[]) => buildBlob(...args),
}));

vi.mock("@/lib/share-card", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/share-card")>();
  return {
    ...actual,
    canShareImageFiles: () => canShareSpy(),
    shareImageFile: (req: { file: File; title: string; text: string }) => shareSpy(req),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
  // r397 — the failure branch borrows the real imageFailToast owner, which
  // calls the named `toast` export directly — the mock must carry it too.
  toast: toastSpy,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

import DuelDone from "@/components/study/duel/duel-done";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { FIRST_VISIBLE_BADGE_ID } from "@/lib/identity";
import type { EndPayload } from "@/components/study/duel/duel-types";

const player = (sid: string, name: string, score: number, correct: number, extra = {}) => ({
  sid,
  name,
  color: "#a8a29e",
  qi: 10,
  score,
  correct,
  answered: 10,
  done: true,
  disconnected: false,
  ...extra,
});

const renderDone = (winner: string | null = "s1") =>
  render(
    <DuelDone
      endData={{
        reason: "finished",
        winner,
        total: 10,
        startedAt: 1_000_000,
        players: [player("s1", "من", 999, 8), player("s2", "سینا", 1150, 9)],
      }}
      mySid="s1"
      myFinishAt={1_000_000 + 95_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

const dlBtn = () => screen.getByRole("button", { name: /عکسِ این نبرد/ });
const shBtn = () => screen.getByRole("button", { name: /هم‌رسانی/ });

const duelRec = (id: string, day: string, outcome: "win" | "loss" | "tie", opponent: string, sig?: string) => ({
  id,
  day,
  outcome,
  reason: "finished" as const,
  opponent,
  opponentColor: "rose",
  myScore: 1200,
  oppScore: 500,
  myCorrect: 8,
  oppCorrect: 3,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...(sig ? { receiptSig: sig } : {}),
});

function seedFlagged() {
  useStudy.setState({
    dayHistory: {
      [daysAgoKey(0)]: { day: daysAgoKey(0), reviews: 8, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    },
    dayStat: { day: daysAgoKey(0), reviews: 8, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    streak: 0,
    userName: "مینا",
    seenBadges: [FIRST_VISIBLE_BADGE_ID],
    history: {},
    duelHistory: [
      duelRec("r1", daysAgoKey(3), "win", "امیرمحمد", "a".repeat(64)),
      duelRec("r2", daysAgoKey(1), "win", "امیرمحمد"),
    ],
  });
}

function seedEmpty() {
  useStudy.setState({
    dayHistory: {},
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
    streak: 0,
    userName: "مینا",
    seenBadges: [],
    history: {},
    duelHistory: [],
  });
}

describe("نشانها در کارتِ نبرد (r287)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    canShareSpy.mockClear();
    shareSpy.mockReset();
    buildBlob.mockReset();
    doneImage.mockReset();
    trackSpy.mockReset();
    window.localStorage.clear();
    useStudy.setState({
      dayHistory: {},
      history: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
      streak: 0,
      bestStreak: 0,
      userName: "",
      duelHistory: [],
      seenBadges: [],
      mistakes: {},
      known: {},
      results: {},
      rushBest: 0,
      rushBestCorrect: 0,
      rushGames: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
      goalMetDays: [],
    });
  });

  it("پرچم‌دار: هر دو دروازه همان ارزیابیِ واحد را میگیرند — آرایهٔ برابر + تیِرِ صادق", async () => {
    doneImage.mockResolvedValue(true);
    buildBlob.mockResolvedValue({ size: 1024 });
    shareSpy.mockResolvedValue("shared");
    seedFlagged();
    renderDone();
    fireEvent.click(dlBtn());
    await waitFor(() => expect(dlBtn()).not.toBeDisabled());
    expect(doneImage).toHaveBeenCalledTimes(1);
    const dlBadges = doneImage.mock.calls[0][0].badges as { title: string; tier: string }[];
    expect(dlBadges.map((b) => b.title)).toContain("اولین دیده‌شدن");
    expect(dlBadges.map((b) => b.title)).toContain("اولین قدم");
    const fv = dlBadges.find((b) => b.title === "اولین دیده‌شدن");
    expect(fv?.tier).toBe("bronze");
    // دفترچهٔ دوبردِ مقابلِ یک حریف → نشانِ نبردیِ «شکارچیِ رقیب» هم باید در
    // کارتِ نبرد برسد — خانوادهٔ نبرد دقیقاً در بسترِ خودش (r287)
    expect(dlBadges.map((b) => b.title)).toContain("شکارچیِ رقیب");
    expect(dlBadges.length).toBe(3);
    // دروازهٔ دوم — هم‌رسانی بومی: همان آرایه (یک ارزیابی، دو بستر)
    fireEvent.click(shBtn());
    await waitFor(() => expect(shBtn()).not.toBeDisabled());
    expect(buildBlob).toHaveBeenCalledTimes(1);
    const shBadges = buildBlob.mock.calls[0][0].badges as { title: string; tier: string }[];
    expect(shBadges).toEqual(dlBadges);
  });

  it("بی‌نشانِ صادق: آرایهٔ تهی در هر دو دروازه — باند حذف نمیشود، خطِ خودش را دارد", async () => {
    doneImage.mockResolvedValue(true);
    buildBlob.mockResolvedValue({ size: 1024 });
    shareSpy.mockResolvedValue("shared");
    seedEmpty();
    renderDone();
    fireEvent.click(dlBtn());
    await waitFor(() => expect(dlBtn()).not.toBeDisabled());
    expect(doneImage.mock.calls[0][0].badges).toEqual([]);
    fireEvent.click(shBtn());
    await waitFor(() => expect(shBtn()).not.toBeDisabled());
    expect(buildBlob.mock.calls[0][0].badges).toEqual([]);
  });

  it("رویدادِ duel_image فقط با کارتِ ساختهشده — شکستِ ساخت رویداد نمی‌سازد", async () => {
    doneImage.mockResolvedValue(true);
    seedFlagged();
    renderDone();
    fireEvent.click(dlBtn());
    await waitFor(() => expect(dlBtn()).not.toBeDisabled());
    expect(trackSpy).toHaveBeenCalledWith("duel_image");
    // مسیرِ شکست: ok=false → هیچ رویدادی
    doneImage.mockResolvedValue(false);
    fireEvent.click(dlBtn());
    await waitFor(() => expect(dlBtn()).not.toBeDisabled());
    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it("قفلِ ساختاری: چهار کارت از یک نقاش میخوانند و duel-done ارزیابیِ موازی ندارد", () => {
    const painter = readFileSync(join(process.cwd(), "src/lib/result-image.ts"), "utf8");
    // drawBadgeBand: یک تعریف + دقیقاً چهار کارت (هفته‌نامه · رسمی · نبرد r287 ·
    // کارنامهٔ دفترچه r288 — خانوادهٔ نبردی با سرصفهٔ خودش، همان نقاش)
    const calls = painter.match(/drawBadgeBand\(ctx/g) ?? [];
    expect(calls.length).toBe(4);
    // تعریفِ نقاشِ مشترک موجود است
    expect(painter).toContain("function drawBadgeBand(");
    const comp = readFileSync(join(process.cwd(), "src/components/study/duel/duel-done.tsx"), "utf8");
    // ارزیابیِ یگانه: دقیقاً یک فراخوانیِ buildEvalInput/unlockedBadgeIds
    // (شمارشِ باپران — اظهارِ نظرهای کامنت نمی‌شمارند) — هیچ کپیِ چیپ/تیر
    expect(comp.match(/buildEvalInput\(/g)?.length).toBe(1);
    expect(comp.match(/unlockedBadgeIds\(/g)?.length).toBe(1);
    expect(comp).not.toMatch(/TIER_CHIP\s*=/);
    expect(comp).not.toMatch(/or-chip/);
  });
});
