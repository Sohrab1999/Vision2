// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 94 «رسیدِ امضاشدهٔ داوری» — چیپ اعتمادِ کارنامهٔ نبرد.
//   ① پایانِ دارایِ رسید → چیپ «رسیدِ امضاشدهٔ داوری» + پانوشتِ داور
//   ② پایانِ بی‌رسید (سرورِ قدیمی) → هیچ چیپی، پانوشتِ قبلی
//   ③ title چیپ توضیحِ تأییدِ داور را می‌دهد
// الگوی رندر هم‌الگوی freeze-badge/due-pill: props محض، بدون store.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import DuelDone from "@/components/study/duel/duel-done";
import type { EndPayload } from "@/components/study/duel/duel-types";
import { signDuelEnd } from "@/lib/duel-receipt-server";

const SECRET = "c".repeat(64);

const receipt = signDuelEnd(
  {
    code: "K9M2P",
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_095_000,
    reason: "finished",
    winner: "sid-a",
    players: [
      { sid: "sid-a", name: "آرش", score: 194, correct: 9 },
      { sid: "sid-b", name: "سارا", score: 190, correct: 8 },
    ],
  },
  SECRET
);

const endWith: EndPayload = {
  reason: "finished",
  winner: "sid-a",
  total: 10,
  startedAt: 1_700_000_000_000,
  players: [
    { sid: "sid-a", name: "آرش", color: "#10b981", qi: 10, score: 194, correct: 9, answered: 10, done: true, disconnected: false },
    { sid: "sid-b", name: "سارا", color: "#f43f5e", qi: 10, score: 190, correct: 8, answered: 10, done: true, disconnected: false },
  ],
  receipt,
};

const endWithout: EndPayload = { ...endWith, receipt: undefined };

describe("چیپ رسیدِ داوری — کارنامهٔ نبرد (Task 94)", () => {
  beforeEach(() => cleanup());

  it("پایانِ دارایِ رسید → چیپ سبز + پانوشتِ داور + title", () => {
    render(
      <DuelDone
        endData={endWith}
        mySid="sid-a"
        myFinishAt={1_700_000_080_000}
        oppConnected={true}
        rematchVotes={0}
        rematch={() => {}}
        leaveRoom={() => {}}
      />
    );
    const chip = screen.getByText("رسیدِ امضاشدهٔ داوری");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute("title", "نتیجهٔ این نبرد با امضای داورِ سرور تأیید شد");
    expect(screen.getByText(/با رسیدِ امضاشدهٔ داور در آمار سرور ثبت شد/)).toBeInTheDocument();
  });

  it("پایانِ بی‌رسید → هیچ چیپی و پانوشتِ قدیمی (سرورِ قدیمی یا مسیرِ legacy)", () => {
    render(
      <DuelDone
        endData={endWithout}
        mySid="sid-a"
        myFinishAt={1_700_000_080_000}
        oppConnected={true}
        rematchVotes={0}
        rematch={() => {}}
        leaveRoom={() => {}}
      />
    );
    expect(screen.queryByText("رسیدِ امضاشدهٔ داوری")).not.toBeInTheDocument();
    expect(screen.getByText(/با امضای هویتی‌ات در آمار سرور ثبت شد/)).toBeInTheDocument();
  });

  it("بازنده هم چیپ را می‌بیند — رسیدِ یک مسابقه برای دو طرف است", () => {
    render(
      <DuelDone
        endData={endWith}
        mySid="sid-b"
        myFinishAt={0}
        oppConnected={false}
        rematchVotes={0}
        rematch={() => {}}
        leaveRoom={() => {}}
      />
    );
    expect(screen.getByText("رسیدِ امضاشدهٔ داوری")).toBeInTheDocument();
  });
});
