// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 101 «عکسِ کارنامهٔ نبردها» — دکمهٔ هدرِ دفترچه در duel-setup:
//   ① دکمه فقط با دفترچهٔ پُر رندر می‌شود (قانونِ خودِ بخش)
//   ② کلیک → downloadDuelLedgerImage با تجمیعِ صادقِ کلِ دفترچه
//     (نه یافته‌های فیلترشده) + نامِ کاربر از store
//   ③ حینِ کارِ ناتمام دکمهٔ معلول است؛ پس از پایان آزاد
//   ④ شکستِ کانواس (false) → مسیرِ خطا بدونِ انفجار
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

const ledgerImage = vi.fn();
vi.mock("@/lib/result-image", () => ({
  downloadDuelLedgerImage: (...args: unknown[]) => ledgerImage(...args),
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
        nameDraft=""
        setNameDraft={() => {}}
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

    // حینِ کارِ ناتمام: معلول
    expect(btn()).toBeDisabled();
    resolve(true);
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("پاسخِ false (محیطِ بی‌کانواس) → مسیرِ خطا بدونِ انفجار و دکمه آزاد می‌شود", async () => {
    ledgerImage.mockResolvedValue(false);
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();

    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(ledgerImage).toHaveBeenCalledTimes(1);
  });
});
