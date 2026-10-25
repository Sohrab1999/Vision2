// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 107 «ریتمِ نبرد» — اتاقِ انتظار (duel-waiting):
//   ① چیپِ «سرعت هر سؤال» ریتمِ داور را با ارقامِ فارسی نشان می‌دهد
//   ② سرویسِ قدیمی/پیش‌فرض (۱۵۰۰۰) → «۱۵ ثانیه» — نه خالی، نه NaN
//   ③ چیپ خارجِ دکمهٔ کدِ اتاق است (کلیکِ کد = کپی، نه تغییرِ ریتم)
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";

import DuelWaiting from "@/components/study/duel/duel-waiting";
import type { PublicPlayer } from "@/components/study/duel/duel-types";

const me: PublicPlayer = {
  sid: "s1", name: "کاوه", color: "#a8a29e",
  qi: 0, score: 0, correct: 0, answered: 0, done: false, disconnected: false,
};

const baseProps = (paceMs: number) => ({
  roomCode: "K7M2X",
  players: [me],
  mySid: "s1",
  paceMs,
  copyCode: vi.fn(),
  leaveRoom: vi.fn(),
});

describe("duel-waiting — چیپِ ریتمِ اتاق (Task 107)", () => {
  beforeEach(() => cleanup());

  it("۱. ریتمِ ۸۰۰۰ → «سرعت هر سؤال: ۸ ثانیه»", () => {
    render(<DuelWaiting {...baseProps(8_000)} />);
    expect(screen.getByText(/سرعت هر سؤال/)).toBeInTheDocument();
    expect(screen.getByText(/۸ ثانیه/)).toBeInTheDocument();
  });

  it("۲. ریتمِ ۱۵۰۰۰ (سرویسِ قدیمی/پیش‌فرض) → «۱۵ ثانیه»", () => {
    render(<DuelWaiting {...baseProps(15_000)} />);
    expect(screen.getByText(/۱۵ ثانیه/)).toBeInTheDocument();
  });

  it("۳. کدِ اتاق جدا از چیپِ ریتم دیده می‌شود", () => {
    render(<DuelWaiting {...baseProps(25_000)} />);
    expect(screen.getByText("K7M2X")).toBeInTheDocument();
    expect(screen.getByText(/۲۵ ثانیه/)).toBeInTheDocument();
  });
});
