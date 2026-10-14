// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 192 — چیپِ «زنجیرهٔ بردهای متوالی» روی هیروی برد (duel-done):
//   ① دو بردِ متوالی (جدیدترین = همین نبرد) → «زنجیرهٔ ۲ بردِ متوالی»
//   ② یک بردِ واحد → چیپِ غایب (یک برد زنجیره نیست)
//   ③ باختِ وسطِ زنجیره → شمارش می‌شکند → غایب
//   ④ باخت/مساوی در نبردِ جاری → غایب حتی با سابقهٔ برد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import DuelDone from "@/components/study/duel/duel-done";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";
import type { EndPayload } from "@/components/study/duel/duel-types";

const player = (sid: string, name: string, score: number, correct: number) => ({
  sid,
  name,
  color: "#a8a29e",
  qi: 10,
  score,
  correct,
  answered: 10,
  done: true,
  disconnected: false,
});

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-15",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1200,
  oppScore: 950,
  myCorrect: 8,
  oppCorrect: 6,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

const renderDone = (winner: string | null = "s1", reason: EndPayload["reason"] = "finished") =>
  render(
    <DuelDone
      endData={{
        reason,
        winner,
        total: 10,
        startedAt: Date.now() - 90_000,
        players: [player("s1", "من", 999, 8), player("s2", "سینا", 850, 7)],
      }}
      mySid="s1"
      myFinishAt={Date.now() - 5_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

const STREAK = "بردِ متوالی";

describe("چیپِ زنجیرهٔ بردها در duel-done (Task 192)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ duelHistory: [] });
  });

  it("دو بردِ متوالی → چیپ با عددِ فارسی رندر می‌شود", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d2", outcome: "win" }), // همین برد
        rec({ id: "d1", outcome: "win" }),
      ],
    });
    renderDone();
    expect(document.body.textContent ?? "").toContain(`زنجیرهٔ ۲ ${STREAK}`);
  });

  it("یک بردِ واحد → چیپ غایب", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1", outcome: "win" })] });
    renderDone();
    expect(document.body.textContent ?? "").not.toContain(STREAK);
  });

  it("باختِ وسط، زنجیره را می‌شکند → با دو بردِ غیرمتوالی چیپ غایب است", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", outcome: "win" }), // همین برد
        rec({ id: "d2", outcome: "loss" }),
        rec({ id: "d1", outcome: "win" }),
      ],
    });
    renderDone();
    expect(document.body.textContent ?? "").not.toContain(STREAK);
  });

  it("نبردِ جاریِ باخت/مساوی → غایب حتی با زنجیرهٔ قبلی", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", outcome: "win" }),
        rec({ id: "d2", outcome: "win" }),
        rec({ id: "d1", outcome: "win" }),
      ],
    });
    renderDone("s2"); // باختِ الان
    expect(document.body.textContent ?? "").not.toContain(STREAK);
    cleanup();
    renderDone(null); // مساویِ الان
    expect(document.body.textContent ?? "").not.toContain(STREAK);
  });

  it("بردِ ضربهٔ فنی هم برد است — با زنجیرهٔ قبلی چیپ می‌گیرد", () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d2", outcome: "win", reason: "finished" }), rec({ id: "d1", outcome: "win" })],
    });
    renderDone("s1", "forfeit");
    expect(document.body.textContent ?? "").toContain(`زنجیرهٔ ۲ ${STREAK}`);
  });
});
