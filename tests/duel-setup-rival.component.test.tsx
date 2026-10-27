// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 201 «رقیبِ همیشگی» روی setup نبرد (توصیهٔ ۱۹۴) — رندرِ بلوک:
//   ① دفترچه با رکوردِ نام‌دار → بلوکِ «رقیبِ همیشگی تو» با نام و
//      کارنامهٔ کاملِ سه‌وضعیتی با ارقامِ فارسی
//   ② دفترچهٔ خالی → بلوک غایب (نه صفرِ ساختگی)
//   ③ فقط رکوردِ ناشناسِ «حریف» → بلوک غایب (فالبک هرگز رقیب نمی‌سازد)
//   ④ چند-حریفه: بلوکِ حریفِ بیشترین-روبه‌روشدن را نشان می‌دهد نه
//      بیشترین-برد (تفاوتِ قراردادی با duelTopRival)
// الگوی رندر: seed مستقیمِ store (هم‌الگوی think-chip/shield tests).
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
  day: "2026-10-15",
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
      nameDraft=""
      setNameDraft={() => {}}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

// بلوکِ رقیبِ همیشگی — نام در ردیف‌های دفترچه هم تکرار می‌شود؛ همهٔ
// ادعاها باید درونِ همین بلوک سنجیده شوند (جداسازیِ واقعیت از نمایش)
const rivalBlock = () => screen.getByText("رقیبِ همیشگی تو").closest("div.rounded-2xl");

describe("بلوکِ رقیبِ همیشگی روی setup (Task 201)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [] });
  });

  it("دفترچهٔ نام‌دار → بلوک با نامِ رقیب و کارنامهٔ سه‌وضعیتیِ فارسی", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", opponent: "امیر", outcome: "win" }),
        rec({ id: "d2", opponent: "امیر", outcome: "loss" }),
        rec({ id: "d1", opponent: "امیر", outcome: "tie" }),
      ],
    });
    renderSetup();

    expect(screen.getByText("رقیبِ همیشگی تو")).toBeInTheDocument();
    const block = rivalBlock()!;
    expect(block.textContent).toContain("امیر");
    // ارقامِ فارسی روی هر چهار چیپِ نتیجه
    expect(block.textContent).toContain("۱ برد");
    expect(block.textContent).toContain("۱ باخت");
    expect(block.textContent).toContain("۱ مساوی");
    expect(block.textContent).toContain("از ۳ نبرد");
    // خطِ صداقت: منبعِ داده (دفترچهٔ همین دستگاه) صریح است
    expect(block.textContent).toContain("دفترچهٔ نبردهای همین دستگاه");
  });

  it("دفترچهٔ خالی → بلوک غایب (زیرمجموعهٔ صادق)", () => {
    renderSetup();
    expect(screen.queryByText("رقیبِ همیشگی تو")).toBeNull();
  });

  it("فقط رکوردِ ناشناسِ «حریف» → بلوک غایب — فالبک هرگز رقیب نمی‌سازد", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d2", opponent: "حریف", outcome: "win" }),
        rec({ id: "d1", opponent: "حریف", outcome: "loss" }),
      ],
    });
    renderSetup();
    expect(screen.queryByText("رقیبِ همیشگی تو")).toBeNull();
  });

  it("چند-حریفه → بیشترین روبه‌روشدن نمایش داده می‌شود، نه بیشترین برد", () => {
    // سینا: ۲ برد (۲ نبرد)؛ امیر: ۱ برد + ۲ باخت (۳ نبرد) — رقیبِ همیشگی امیر است
    useStudy.setState({
      duelHistory: [
        rec({ id: "d5", opponent: "سینا", outcome: "win" }),
        rec({ id: "d4", opponent: "سینا", outcome: "win" }),
        rec({ id: "d3", opponent: "امیر", outcome: "win" }),
        rec({ id: "d2", opponent: "امیر", outcome: "loss" }),
        rec({ id: "d1", opponent: "امیر", outcome: "loss" }),
      ],
    });
    renderSetup();
    const block = rivalBlock()!;
    expect(block.textContent).toContain("امیر");
    expect(block.textContent).toContain("از ۳ نبرد");
    // نامِ رقیبِ غیرِ منتخب در بلوک رندر نمی‌شود (فقط در ردیف‌های دفترچه)
    expect(block.textContent).not.toContain("سینا");
  });
});
