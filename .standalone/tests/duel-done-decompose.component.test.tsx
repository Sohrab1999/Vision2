// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 99 — تفکیکِ امتیاز روی کارنامهٔ نبرد (duel-done):
//   ① هر بازیکن: نوارِ دوبخشی (پایه emerald / سرعت amber) + «پایه + سرعت»
//   ② نسبتِ نوار = پایه/امتیاز (۸۰۰/۹۹۹ → ۸۰٪)
//   ③ پاداشِ صفر صادق دیده می‌شود («۱۰۰۰ پایه + ۰ سرعت»)
//   ④ امتیازِ صفر → بدونِ نوار و بدونِ متن (هیچ‌چیزِ دروغین)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

const renderDone = (players: EndPayload["players"], winner: string | null = "s1") =>
  render(
    <DuelDone
      endData={{ reason: "finished", winner, total: 10, startedAt: Date.now() - 90_000, players }}
      mySid="s1"
      myFinishAt={Date.now() - 5_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

const barsOf = () => {
  const rows = screen.getAllByText(/درست از ۱۰/).map((el) => el.closest(".rounded-xl"));
  return rows.map((row) => row?.querySelector(".h-1\\.5"));
};

describe("تفکیکِ امتیاز در کارنامهٔ نبرد (Task 99)", () => {
  beforeEach(() => cleanup());

  it("۹۹۹ با ۸ درست → «۸۰۰ پایه + ۱۹۹ سرعت» و نوارِ ۸۰/۲۰ برای من و حریف", () => {
    renderDone([player("s1", "من", 999, 8), player("s2", "سینا", 1150, 9)]);
    expect(screen.getByText("۸۰۰ پایه + ۱۹۹ سرعت")).toBeInTheDocument();
    expect(screen.getByText("۹۰۰ پایه + ۲۵۰ سرعت")).toBeInTheDocument();
    const bars = barsOf();
    expect(bars).toHaveLength(2);
    expect(bars[0]!.firstElementChild).toHaveStyle({ width: "80%" }); // 800/999
    expect(bars[1]!.firstElementChild).toHaveStyle({ width: "78%" }); // 900/1150
  });

  it("پاداشِ صفر صادق: سریع‌ترین بازیکنِ ممکن «۱۰۰۰ پایه + ۰ سرعت» می‌بیند", () => {
    renderDone([player("s1", "من", 1000, 10), player("s2", "سینا", 850, 8)]);
    expect(screen.getByText("۱۰۰۰ پایه + ۰ سرعت")).toBeInTheDocument();
    expect(barsOf()[0]!.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("امتیازِ صفر (باختِ بی‌پاسخ) → بدونِ نوار و بدونِ متنِ تفکیک", () => {
    renderDone([player("s1", "من", 800, 8), player("s2", "حریفِ‌قطع", 0, 0, { disconnected: true })]);
    // ۸ درست × ۱۰۰ = ۸۰۰ پایه؛ امتیاز هم ۸۰۰ → پاداشِ صفرِ صادق (همان سریع‌ترین ممکن)
    expect(screen.getByText("۸۰۰ پایه + ۰ سرعت")).toBeInTheDocument();
    const texts = screen.queryAllByText(/پایه \+/);
    expect(texts).toHaveLength(1); // فقط ردیفِ من
    expect(barsOf()[1]).toBeNull();
  });
});
