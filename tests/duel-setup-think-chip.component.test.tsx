// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 108 «ماندگاریِ آمارِ فکر» — چیپِ میانگینِ فکر روی ردیف‌های
// دفترچه (هم‌الگوی سپرِ داورگواه، Task 96):
//   ① ردیفِ دارایِ think → چیپِ ساعتشنی با «میانگینِ فکر X ثانیه» (ممیزِ فارسی)
//      + title حاملِ شمارِ سؤال‌های ثبت‌شده
//   ② ردیفِ قدیمیِ بی‌think (رکوردِ پیش از ۱۰۸ / سرویسِ قدیمی) → هیچ چیپی
//      (زیرمجموعهٔ صادق، نه وضعیتِ دودویی) — خودِ ردیف سرِ پا است
//   ③ دفترچهٔ ترکیبی → فقط رکوردهای thinkدار چیپ دارند
//   ④ ممیزِ فارسی: ۸۰۰ms → «۰٫۸» — نه «0.8» و نه «NaN»
// الگوی رندر: seed مستقیمِ store (هم‌الگوی shield/share tests).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";
import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
  id: "d1000",
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1100,
  oppScore: 900,
  myCorrect: 8,
  oppCorrect: 4,
  answered: 10,
  total: 10,
  durationSec: 80,
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

const thinkChips = () =>
  screen.queryAllByRole("img", { name: /فکرِ میانگین/ });

describe("چیپِ آمارِ فکر روی دفترچه (Task 108)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 2, duelLosses: 0, duelTies: 0, duelHistory: [] });
  });

  it("ردیفِ thinkدار → چیپ با ممیزِ فارسی و titleِ شمارِ نمونه‌ها", () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d2", think: { avgMs: 800, minMs: 200, maxMs: 1500, seen: 10, total: 10 } })],
    });
    renderSetup();

    const chips = thinkChips();
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveAttribute("aria-label", "فکرِ میانگین ۰٫۸ ثانیه");
    expect(chips[0].getAttribute("title") ?? "").toContain("۱۰");
    expect(chips[0].getAttribute("title") ?? "").toContain("۰٫۸");
    // متنِ خودِ چیپ هم ممیزِ فارسی دارد
    expect(chips[0].textContent).toContain("۰٫۸");
  });

  it("ردیفِ قدیمیِ بی‌think → هیچ چیپی؛ خودِ ردیف سالم", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();

    expect(thinkChips()).toHaveLength(0);
    expect(screen.getAllByText("سینا")).toHaveLength(1);
  });

  it("دفترچهٔ ترکیبی → فقط رکوردهای thinkدار چیپ دارند (۲ از ۳)", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", think: { avgMs: 1200, minMs: 300, maxMs: 2500, seen: 9, total: 10 } }),
        rec({ id: "d2" }),
        rec({ id: "d1", think: { avgMs: 1500, minMs: 100, maxMs: 3000, seen: 10, total: 10 } }),
      ],
    });
    renderSetup();

    const chips = thinkChips();
    expect(chips).toHaveLength(2);
    // هر چیپ بر اساسِ رکوردِ خودش عدد می‌خواند — نه میانگینِ کلِ دفترچه
    expect(chips.map((c) => c.getAttribute("aria-label"))).toEqual([
      "فکرِ میانگین ۱٫۲ ثانیه",
      "فکرِ میانگین ۱٫۵ ثانیه",
    ]);
  });

  it("گِردکردنِ مرزی: ۶۴۹ms → ۰٫۶ و ۶۵۰ms → ۰٫۷ (هم‌قراردادِ secFa)", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d1", think: { avgMs: 649, minMs: 100, maxMs: 1000, seen: 5, total: 10 } }),
        rec({ id: "d2", think: { avgMs: 650, minMs: 100, maxMs: 1000, seen: 5, total: 10 } }),
      ],
    });
    renderSetup();
    expect(thinkChips().map((c) => c.getAttribute("aria-label"))).toEqual([
      "فکرِ میانگین ۰٫۶ ثانیه",
      "فکرِ میانگین ۰٫۷ ثانیه",
    ]);
  });
});
