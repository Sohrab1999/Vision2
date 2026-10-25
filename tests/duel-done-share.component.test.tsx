// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 101 «عکسِ این نبرد» — دکمهٔ هم‌رسانی در صفحهٔ پایان نبرد:
//   ① دکمه رندر می‌شود و با دادهٔ EndPayload فراخوانی می‌شود
//   ② تفکیکِ پایه/سرعت از همان decomposeDuelScore (قراردادِ ۹۹)
//   ③ ثانیه‌ها فقط وقتی خودی تمام کرده؛ وگرنه null (و فورفیت دیده می‌شود)
//   ④ رسیدِ داور → receipt: true؛ مساوی → outcome صادق
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const doneImage = vi.fn();
vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadDuelDoneImage: (...args: unknown[]) => doneImage(...args),
}));

import DuelDone from "@/components/study/duel/duel-done";
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

const renderDone = (players: EndPayload["players"], winner: string | null = "s1", receipt = false) =>
  render(
    <DuelDone
      endData={{
        reason: "finished",
        winner,
        total: 10,
        startedAt: 1_000_000,
        players,
        ...(receipt ? { receipt: { sig: "a".repeat(64) } as EndPayload["receipt"] } : {}),
      }}
      mySid="s1"
      myFinishAt={1_000_000 + 95_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

const btn = () => screen.getByRole("button", { name: /عکسِ این نبرد/ });

describe("عکسِ این نبرد (Task 101)", () => {
  beforeEach(() => {
    cleanup();
    doneImage.mockReset();
  });

  it("برد: کلیک → outcome/امتیازها/تفکیکِ ۹۹/ثانیه/نام‌ها همه صادق پاس می‌شوند", async () => {
    doneImage.mockResolvedValue(true);
    renderDone([player("s1", "من", 999, 8), player("s2", "سینا", 1150, 9)]);
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(doneImage).toHaveBeenCalledTimes(1);
    const arg = doneImage.mock.calls[0][0];
    expect(arg.outcome).toBe("win");
    expect(arg.forfeit).toBe(false);
    expect(arg.myName).toBe("من");
    expect(arg.oppName).toBe("سینا");
    expect(arg.myScore).toBe(999);
    expect(arg.oppScore).toBe(1150);
    expect(arg.myCorrect).toBe(8);
    expect(arg.oppCorrect).toBe(9);
    expect(arg.total).toBe(10);
    expect(arg.durationSec).toBe(95);
    expect(arg.base).toBe(800);
    expect(arg.bonus).toBe(199);
    expect(arg.receipt).toBe(false);
  });

  it("مساوی + فورفیتِ خودی: outcome صادق، ثانیه null، forfeit دیده می‌شود", async () => {
    doneImage.mockResolvedValue(true);
    render(
      <DuelDone
        endData={{ reason: "forfeit", winner: null, total: 10, startedAt: 1_000_000, players: [player("s1", "من", 500, 5), player("s2", "امیر", 500, 5)] }}
        mySid="s1"
        myFinishAt={0}
        oppConnected={false}
        rematchVotes={0}
        rematch={() => {}}
        leaveRoom={() => {}}
      />
    );
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    const arg = doneImage.mock.calls[0][0];
    expect(arg.outcome).toBe("tie");
    expect(arg.forfeit).toBe(true);
    expect(arg.durationSec).toBeNull();
  });

  it("رسیدِ داور → receipt: true در کارت", async () => {
    doneImage.mockResolvedValue(true);
    renderDone([player("s1", "من", 800, 8), player("s2", "سینا", 600, 6)], "s1", true);
    fireEvent.click(btn());
    await waitFor(() => expect(doneImage).toHaveBeenCalled());
    expect(doneImage.mock.calls[0][0].receipt).toBe(true);
  });

  it("حینِ ساختِ تصویر دکمه معلول است و پس از پایان آزاد می‌شود", async () => {
    let resolve!: (v: boolean) => void;
    doneImage.mockImplementation(() => new Promise<boolean>((res) => (resolve = res)));
    renderDone([player("s1", "من", 999, 8), player("s2", "سینا", 1150, 9)]);
    fireEvent.click(btn());
    expect(btn()).toBeDisabled();
    resolve(false);
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });
});
