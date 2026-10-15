// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 96 «سپرِ داورگواه روی دفترچهٔ نبردها» — پنلِ «آخرین نبردها» در فازِ
// setup حالا اعتمادِ تسک ۹۴ را روی هر ردیف نشان می‌دهد:
//   ① ردیفِ دارایِ receiptSig → چیپِ سپرِ سبز با title/aria «داورگواه»
//   ② ردیفِ قدیمیِ بی‌sig → هیچ سپری (زیرمجموعهٔ صادق، نه وضعیتِ دودویی)
//   ③ پانوشتِ «N از M … رسیدِ امضاشدهٔ داور» فقط وقتی N>0 رندر می‌شود
// الگوی رندر هم‌الگوی goal-chip/due-pill: seed مستقیمِ store.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";
import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import { sanitizeDuelHistory, type DuelRecord } from "@/lib/duel-history";

const SIG = "a".repeat(64);
const SIG2 = "f".repeat(64);

const rec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
  id: "d1000",
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

const shieldChips = () => screen.queryAllByRole("img", { name: "داورگواه" });

const footerLine = () =>
  screen.queryByText(
    (_content, el) =>
      el?.tagName === "SPAN" &&
      /نبردِ دفترچه با رسیدِ امضاشدهٔ داور تأیید می‌شود/.test(el.textContent ?? "")
  );

describe("سپرِ داورگواه روی دفترچهٔ نبردها (Task 96)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 2, duelLosses: 0, duelTies: 0, duelHistory: [] });
  });

  it("ردیفِ رسیددار → چیپِ سپر با title؛ ردیفِ قدیمیِ بی‌sig → هیچ سپری (زیرمجموعهٔ صادق)", () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d2", receiptSig: SIG }), rec({ id: "d1" })],
    });
    renderSetup();

    const chips = shieldChips();
    expect(chips).toHaveLength(1); // فقط ردیفِ رسیددار — رکوردِ قدیمی سپر ندارد
    expect(chips[0]).toHaveAttribute(
      "title",
      "رسیدِ امضاشدهٔ داور — این نبرد با امضای سرور تأیید شد"
    );
    // پانوشتِ زیرمجموعه: «۱ از ۲»
    const foot = footerLine();
    expect(foot).toBeInTheDocument();
    expect(foot!.textContent).toContain("۱ از ۲");
  });

  it("دفترچهٔ کاملاً قدیمی (بی‌sig) → صفر سپر و بدونِ پانوشتِ اعتماد", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d2" }), rec({ id: "d1" })] });
    renderSetup();

    expect(shieldChips()).toHaveLength(0);
    expect(footerLine()).not.toBeInTheDocument();
    // خودِ پنل سرِ پا است — دو ردیف با نامِ حریف
    // (+۱ از بلوکِ «رقیبِ همیشگی» — Task 201: هر دو رکورد مقابلِ «سینا»ست
    // و بلوک هم نامِ او را نشان می‌دهد؛ رندرِ کاملِ بلوک جای دیگری قفل است)
    expect(screen.getAllByText("سینا")).toHaveLength(3);
  });

  it("دو رسید از سه نبرد → دو سپر + پانوشتِ «۲ از ۳» — نیمی‌داورگواه نیمی دیده می‌شود", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", receiptSig: SIG }),
        rec({ id: "d2", outcome: "loss" }),
        rec({ id: "d1", receiptSig: SIG2 }),
      ],
    });
    renderSetup();

    expect(shieldChips()).toHaveLength(2);
    expect(footerLine()!.textContent).toContain("۲ از ۳");
  });

  it("sig خراب هرگز سپر نمی‌گیرد — ورودیِ دفترچه همیشه از sanitize می‌گذرد (SyncField)", () => {
    // مسیرِ واقعی: snapshotِ ذخیره/دریافتی قبل از رسیدن به UI پاک‌سازی می‌شود؛
    // sigِ دست‌نویسِ «junk» در sanitize می‌افتد و رکورد بی‌sig می‌ماند.
    const raw = [rec({ id: "d1", receiptSig: "junk" })];
    const clean = sanitizeDuelHistory(raw);
    expect(clean[0].receiptSig).toBeUndefined();

    useStudy.setState({ duelHistory: clean });
    renderSetup();
    expect(shieldChips()).toHaveLength(0);
    expect(footerLine()).not.toBeInTheDocument();
  });
});
