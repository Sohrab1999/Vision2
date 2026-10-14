// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 191 — خطِ «کارنامهٔ مقابلِ این حریف» روی کارنامهٔ نبرد (duel-done):
//   ① با سابقهٔ دفترچه مقابلِ همان حریف → خط با برد/باخت/مساوی رندر می‌شود
//     (شمارش شاملِ نبردِ جاری است — برچسبِ «با همین نبرد» شفاف)
//   ② بی‌سابقه مقابلِ این حریف → بلوک غایب (نه صفرِ ساختگی)
//   ③ نامِ فالبکِ «حریف» → بلوک غایب حتی اگر رکوردهای «حریف» در دفترچه باشد
//   ④ تطبیقِ نرمال‌شدهٔ ۹۸: «امیر محمد» در payload با «امیرمحمد» دفترچه می‌نشیند
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

const renderDone = (oppName: string) =>
  render(
    <DuelDone
      endData={{
        reason: "finished",
        winner: "s1",
        total: 10,
        startedAt: Date.now() - 90_000,
        players: [player("s1", "من", 999, 8), player("s2", oppName, 1150, 9)],
      }}
      mySid="s1"
      myFinishAt={Date.now() - 5_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

describe("کارنامهٔ مقابلِ حریف در duel-done (Task 191)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ duelHistory: [] });
  });

  it("با سابقهٔ مقابلِ حریف، خطِ برد/باخت رندر می‌شود (شمارشِ شاملِ همین نبرد)", () => {
    // در تولید، persistResult رکوردِ همین نبرد را پیش از رندر push می‌کند؛
    // اینجا همان وضعیت را با seed بازسازی می‌کنیم (d3 = نبردِ جاری).
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", opponent: "سینا", outcome: "win" }), // همین نبردِ تازه‌وارد
        rec({ id: "d2", opponent: "سینا", outcome: "loss" }),
        rec({ id: "d1", opponent: "امیر", outcome: "win" }), // حریفِ دیگر — نمی‌شمارد
      ],
    });
    renderDone("سینا");
    const text = document.body.textContent ?? "";
    expect(text).toContain("کارنامهٔ مقابلِ سینا در دفترچه (با همین نبرد)");
    expect(text).toContain("۱ برد · ۱ باخت");
  });

  it("مساوی هم صادق دیده می‌شود", () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d2", opponent: "سینا", outcome: "win" }), rec({ id: "d1", opponent: "سینا", outcome: "tie" })],
    });
    renderDone("سینا");
    expect(document.body.textContent ?? "").toContain("۱ برد · ۰ باخت · ۱ مساوی");
  });

  it("بی‌سابقهٔ مقابلِ این حریف → بلوک غایب", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1", opponent: "امیر", outcome: "win" })] });
    renderDone("سینا");
    expect(document.body.textContent ?? "").not.toContain("کارنامهٔ مقابلِ");
  });

  it(`نامِ فالبکِ «حریف» → بلوک غایب؛ رکوردهای قدیمیِ «حریف» رقیبِ ساختگی نمی‌سازند`, () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d1", opponent: "حریف", outcome: "win" })],
    });
    renderDone("حریف");
    expect(document.body.textContent ?? "").not.toContain("کارنامهٔ مقابلِ");
  });

  it("تطبیقِ نرمال‌شدهٔ ۹۸: «امیر محمد» (payload) با «امیرمحمد» (دفترچه) یکی است", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1", opponent: "امیرمحمد", outcome: "loss" })] });
    renderDone("امیر محمد");
    const text = document.body.textContent ?? "";
    expect(text).toContain("کارنامهٔ مقابلِ امیر محمد در دفترچه (با همین نبرد)");
    expect(text).toContain("۰ برد · ۱ باخت");
  });
});
