// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 101 «عکسِ کارنامهٔ نبردها» — دکمهٔ هدرِ دفترچه در duel-setup:
//   ① دکمه فقط با دفترچهٔ پُر رندر می‌شود (قانونِ خودِ بخش)
//   ② کلیک → downloadDuelLedgerImage با تجمیعِ صادقِ کلِ دفترچه
//     (نه یافته‌های فیلترشده) + نامِ کاربر از store
//   ③ حینِ کارِ ناتمام دکمهٔ معلول است؛ پس از پایان آزاد
//   ④ شکستِ کانواس (false) → مسیرِ خطا بدونِ انفجار
// r288 — باندِ «نشان‌های نبردی»: آرگومانِ badges از همان ارزیابیِ واحدِ
// رجیستری میآید (duelFamilyBadges) — فقط خانوادهٔ نبرد با شمارندهٔ
// خودسازگار؛ نشانِ همگانیِ باز (اولین قدم) هرگز واردِ آرایه نمیشود.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

const { ledgerImage, trackSpy } = vi.hoisted(() => ({ ledgerImage: vi.fn(), trackSpy: vi.fn() }));
vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadDuelLedgerImage: (...args: unknown[]) => ledgerImage(...args),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

const renderSetup = () =>
  render(
    <DuelSetup
      conn="online"
      createRoom={() => {}}
      joinRoom={() => {}}
      joinInput=""
      setJoinInput={() => {}}
      joinBusy={false}
      createBusy={false}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

const LABEL = "گرفتن عکس کارنامهٔ نبردها";
const btn = () => screen.getByRole("button", { name: LABEL });

describe("عکسِ کارنامهٔ نبردها (Task 101)", () => {
  beforeEach(() => {
    cleanup();
    ledgerImage.mockReset();
    trackSpy.mockReset();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [], userName: "" });
  });

  it("دفترچهٔ خالی → بخشِ تاریخچه رندر نمی‌شود و دکمه‌ای در کار نیست", () => {
    renderSetup();
    expect(screen.queryByRole("button", { name: LABEL })).not.toBeInTheDocument();
  });

  it("کلیک → فراخوانی با تجمیعِ کلِ دفترچه و نامِ کاربر؛ دکمه حینِ کار معلول و بعد آزاد", async () => {
    let resolve!: (v: boolean) => void;
    ledgerImage.mockImplementation(() => new Promise<boolean>((res) => (resolve = res)));
    useStudy.setState({
      userName: "میلاد",
      duelHistory: [
        rec({ id: "d1", outcome: "win", myScore: 1200, opponent: "امیرمحمد" }),
        rec({ id: "d2", outcome: "loss", myScore: 600, opponent: "سینا" }),
        rec({ id: "d3", outcome: "win", myScore: 900, opponent: "امیر محمد" }),
      ],
      // نشانِ همگانیِ باز — باید در گرید بیاید ولی هرگز در باندِ خانوادهٔ نبرد نه
      history: { "2026-10-13": { quizzes: 2, reviews: 1 } },
    });
    renderSetup();

    expect(btn()).toBeInTheDocument();
    fireEvent.click(btn());
    expect(ledgerImage).toHaveBeenCalledTimes(1);
    const arg = ledgerImage.mock.calls[0][0];
    expect(arg.stats.total).toBe(3);
    expect(arg.stats.win).toBe(2);
    expect(arg.stats.winRate).toBe(67);
    expect(arg.stats.best).toBe(1200);
    expect(arg.stats.totalPoints).toBe(1200 + 600 + 900);
    expect(arg.stats.topRival).toEqual({ opponent: "امیرمحمد", wins: 2 });
    expect(arg.userName).toBe("میلاد");
    // r288 — باندِ خانواده: دو بردِ رسیددار؟ نه — دو برد مقابلِ یک حریفِ واحد
    // یعنی «شکارچیِ رقیب» (نقره) — و «اولین قدمِ» همگانیِ باز غایب است.
    expect(arg.badges).toEqual([{ title: "شکارچیِ رقیب", tier: "silver" }]);

    // حینِ کارِ ناتمام: معلول + رویداد هنوز نیامده (کارت ساخته نشده)
    expect(btn()).toBeDisabled();
    expect(trackSpy).not.toHaveBeenCalled();
    resolve(true);
    await waitFor(() => expect(btn()).not.toBeDisabled());
    // r288 — رویدادِ duel_ledger_image فقط با کارتِ واقعاً ساختهشده (قراردادِ r286/287)
    expect(trackSpy).toHaveBeenCalledWith("duel_ledger_image");
  });

  it("پاسخِ false (محیطِ بی‌کانواس) → مسیرِ خطا بدونِ انفجار و دکمه آزاد می‌شود؛ رویداد هرگز نیامده", async () => {
    ledgerImage.mockResolvedValue(false);
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();

    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(ledgerImage).toHaveBeenCalledTimes(1);
    expect(trackSpy).not.toHaveBeenCalled();
  });
});
