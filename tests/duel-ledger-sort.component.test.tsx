// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 100 «دفترچهٔ مرتب» — چیپ‌های مرتب‌سازی روی پنلِ «آخرین نبردها»:
//   ① «بیشترین امتیاز»: نمایشِ خودکارِ همهٔ رکوردها (قراردادِ ۹۸) با
//     بیشترین امتیازِ شخصی بالا؛ بازگشت به «جدیدترین» نمایِ ۵تایی را برمی‌گرداند
//   ② «بیشترین اختلاف»: بردِ سنگین بالا، باختِ سنگین پایینِ طیف
//   ③ ترکیبِ ابزارها: جست‌وجو + مرتب‌سازی هم‌زمان (AND)
//   ۴ «پاک‌کردن فیلترها» در ردیفِ مرتب‌سازی (فقط وقتی مرتب‌سازیِ تنها فعال است)
// الگوی رندر هم‌الگوی ledger-filter تسک ۹۸.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";
import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-12",
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

const rows = () => screen.queryAllByText(/از ۱۰ درست/).length;

/** امتیازِ ردیف‌ها به ترتیبِ رندر — از divِ امتیاز (dir="ltr") که فقط «۱۲۰۰–۹۵۰» دارد */
const rowScores = () =>
  screen
    .getAllByText(/از ۱۰ درست/)
    .map((el) => el.closest(".rounded-xl"))
    .map((row) => row?.querySelector('div[dir="ltr"]')?.textContent ?? "");

const score = (my: number, opp: number) => `${faNum(my)}–${faNum(opp)}`;

describe("دفترچهٔ مرتب (Task 100)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 3, duelLosses: 1, duelTies: 1, duelHistory: [] });
  });

  it("«بیشترین امتیاز»: همهٔ رکوردها خودکار باز می‌شوند و بیشترین امتیاز بالا — «جدیدترین» نمایِ ۵تایی را برمی‌گرداند", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d1", myScore: 500, oppScore: 100 }),
        rec({ id: "d2", myScore: 1400, oppScore: 200 }),
        rec({ id: "d3", myScore: 900, oppScore: 300 }),
        rec({ id: "d4", myScore: 300, oppScore: 150 }),
        rec({ id: "d5", myScore: 1100, oppScore: 400 }),
        rec({ id: "d6", myScore: 700, oppScore: 250 }),
        rec({ id: "d7", myScore: 1250, oppScore: 350 }),
        rec({ id: "d8", myScore: 60, oppScore: 10 }),
      ],
    });
    renderSetup();

    expect(rows()).toBe(5);
    expect(screen.getByRole("button", { name: /نمایش همهٔ ۸ نبرد/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بیشترین امتیاز" }));
    expect(screen.getByRole("button", { name: "بیشترین امتیاز" })).toHaveAttribute("aria-pressed", "true");
    expect(rows()).toBe(8); // مرتب‌کردنِ پنج‌تایِ بریده بی‌معناست — همه باز می‌شوند
    expect(screen.queryByRole("button", { name: /نمایش همهٔ/ })).not.toBeInTheDocument();
    const s = rowScores();
    expect(s[0]).toBe(score(1400, 200));
    expect(s[1]).toBe(score(1250, 350));
    expect(s[s.length - 1]).toBe(score(60, 10));

    // بازگشت به پیش‌فرض: ۵ تای آخر + دکمهٔ بازکردن
    fireEvent.click(screen.getByRole("button", { name: "جدیدترین" }));
    expect(rows()).toBe(5);
    expect(screen.getByRole("button", { name: /نمایش همهٔ ۸ نبرد/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "جدیدترین" })).toHaveAttribute("aria-pressed", "true");
  });

  it("«بیشترین اختلاف»: بردِ سنگین‌تر بالا و باختِ سنگین‌تر پایینِ طیف", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d1", outcome: "win", myScore: 1300, oppScore: 300 }), // +۱۰۰۰
        rec({ id: "d2", outcome: "loss", myScore: 200, oppScore: 1500 }), // −۱۳۰۰
        rec({ id: "d3", outcome: "win", myScore: 900, oppScore: 600 }), // +۳۰۰
        rec({ id: "d4", outcome: "loss", myScore: 500, oppScore: 1000 }), // −۵۰۰
      ],
    });
    renderSetup();

    fireEvent.click(screen.getByRole("button", { name: "بیشترین اختلاف" }));
    const s = rowScores();
    expect(s).toHaveLength(4);
    expect(s[0]).toBe(score(1300, 300)); // اختلافِ +۱۰۰۰
    expect(s[s.length - 1]).toBe(score(200, 1500)); // −۱۳۰۰ پایینِ طیف
    expect(screen.getByRole("button", { name: "بیشترین اختلاف" })).toHaveAttribute("aria-pressed", "true");
  });

  it("ترکیبِ ابزارها: جست‌وجوی حریف + مرتب‌سازیِ امتیاز — فقط یافته‌ها به‌ترتیب", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d4", opponent: "امیر", myScore: 400, oppScore: 100 }),
        rec({ id: "d3", opponent: "سینا", myScore: 1900, oppScore: 100 }),
        rec({ id: "d2", opponent: "امیر", myScore: 1200, oppScore: 100 }),
        rec({ id: "d1", opponent: "امیر", myScore: 800, oppScore: 100 }),
      ],
    });
    renderSetup();

    fireEvent.change(screen.getByLabelText("جست‌وجو در تاریخچهٔ نبردها"), { target: { value: "امیر" } });
    expect(rows()).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "بیشترین امتیاز" }));
    expect(rowScores()).toEqual([score(1200, 100), score(800, 100), score(400, 100)]);
    // خطِ «یافت شد» — مالِ جست‌وجوست، با مرتب‌سازی هم می‌ماند
    expect(screen.getByRole("status").textContent).toContain("۳ نبرد یافت شد");
  });

  it("مرتب‌سازیِ تنها → «پاک‌کردن فیلترها» در ردیفِ ترتیب (تک‌دکمه) همه‌چیز را برمی‌گرداند", () => {
    useStudy.setState({
      duelHistory: Array.from({ length: 7 }, (_, i) => rec({ id: "d" + (i + 1), myScore: (i + 1) * 100 })),
    });
    renderSetup();

    fireEvent.click(screen.getByRole("button", { name: "بیشترین امتیاز" }));
    expect(rows()).toBe(7);
    const clears = screen.getAllByRole("button", { name: /پاک‌کردن فیلترها/ });
    expect(clears).toHaveLength(1); // حالتِ خالی نیست — فقط دکمهٔ ردیفِ ترتیب
    fireEvent.click(clears[0]);
    expect(rows()).toBe(5);
    expect(screen.getByRole("button", { name: /نمایش همهٔ ۷ نبرد/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "جدیدترین" })).toHaveAttribute("aria-pressed", "true");
  });
});
