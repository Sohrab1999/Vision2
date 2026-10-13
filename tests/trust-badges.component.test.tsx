// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 105 — نشان‌های خانوادهٔ «اعتماد» روی پنلِ نشان‌ها:
//   ① تازه‌وارد: «۰ از ۵۵» — دو کاشیِ تازه قفل با پیشرفتِ شمارشیِ صادق
//   ② سه بردِ گواه‌دار → «گواه‌گرفته» باز (نقره/ShieldCheck) + «۱ از ۵۵»
//   ③ هفت بردِ گواه‌دار → «سندِ زنده» هم باز (زیرمجموعهٔ ۷⇒۳) + «۲ از ۵۵»
//   ④ بردِ پراکندهٔ بی‌رسید هرگز باز نمی‌کند — صفرِ صادقِ قدیمی‌ها
// الگوی seed هم‌الگوی rival-badges.component.test (beforeEach ضدآلودگی — درسِ ۹۲).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import Badges from "@/components/study/practice/badges";
import type { DuelRecord } from "@/lib/duel-history";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const SIG = "c".repeat(64);

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
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

const chipText = () =>
  screen.getAllByText((_c, el) => !!el?.textContent && /از ۵۵$/.test(el.textContent.trim()))[0]
    ?.textContent?.replace(/\s+/g, " ")
    .trim();

describe("خانوادهٔ اعتماد — گواه‌گرفته / سندِ زنده (Task 105)", () => {
  beforeAll(() => {
    // jsdom IntersectionObserver ندارد — whileInView فریمرموشن امن شود (الگوی badges)
    class IOStub {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({
      duelHistory: [],
      duelWins: 0,
      duelLosses: 0,
      duelTies: 0,
      goalMetDays: [],
      freezeCount: 0,
      freezeUsedDays: [],
      freezeEarnedDay: undefined,
      streak: 0,
      seenBadges: [],
    });
  });

  it("تازه‌وارد: هر دو کاشیِ اعتماد قفل با پیشرفتِ صادقِ «۰ از ۳/۷ بردِ گواه‌دار»", () => {
    render(<Badges />);
    const trust = screen.getByText("گواه‌گرفته").closest(".badge-card");
    const oath = screen.getByText("سندِ زنده").closest(".badge-card");
    expect(trust).not.toBeNull();
    expect(oath).not.toBeNull();
    expect(trust!.className).not.toContain("badge-shine");
    expect(oath!.className).not.toContain("badge-shine");
    expect(trust!.textContent).toContain("۰ از ۳ بردِ گواه‌دار");
    expect(oath!.textContent).toContain("۰ از ۷ بردِ گواه‌دار");
    expect(chipText()).toContain("۰ از ۵۵");
  });

  it("سه بردِ گواه‌دار → گواه‌گرفته باز + «۱ از ۵۵» — سندِ زنده هنوز قفل با «۳ از ۷»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "v1", receiptSig: SIG, opponent: "حریفِ یکم" }),
        rec({ id: "v2", receiptSig: SIG, opponent: "حریفِ دوم" }),
        rec({ id: "v3", receiptSig: SIG, opponent: "حریفِ سوم" }),
      ],
      duelWins: 3,
    });
    render(<Badges />);

    const trust = screen.getByText("گواه‌گرفته").closest(".badge-card")!;
    const oath = screen.getByText("سندِ زنده").closest(".badge-card")!;
    expect(trust.className).toContain("badge-shine");
    expect(oath.className).not.toContain("badge-shine");
    expect(oath.textContent).toContain("۳ از ۷ بردِ گواه‌دار");
    // خانوادهٔ رقیب با حریف‌های متمایز قفل می‌ماند — تنها گواه‌گرفته باز است
    expect(chipText()).toContain("۱ از ۵۵");
  });

  it("هفت بردِ گواه‌دار → زیرمجموعهٔ ۷⇒۳ در هر دو جهت: هر دو باز + «۲ از ۵۵»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "w1", receiptSig: SIG, opponent: "حریفِ یکم" }),
        rec({ id: "w2", receiptSig: SIG, opponent: "حریفِ دوم" }),
        rec({ id: "w3", receiptSig: SIG, opponent: "حریفِ سوم" }),
        rec({ id: "w4", receiptSig: SIG, opponent: "حریفِ چهارم" }),
        rec({ id: "w5", receiptSig: SIG, opponent: "حریفِ پنجم" }),
        rec({ id: "w6", receiptSig: SIG, opponent: "حریفِ ششم" }),
        rec({ id: "w7", receiptSig: SIG, opponent: "حریفِ هفتم" }),
      ],
      duelWins: 7,
    });
    render(<Badges />);

    const trust = screen.getByText("گواه‌گرفته").closest(".badge-card")!;
    const oath = screen.getByText("سندِ زنده").closest(".badge-card")!;
    expect(trust.className).toContain("badge-shine");
    expect(oath.className).toContain("badge-shine");
    // کاشیِ باز خطِ پیشرفت ندارد (مخصوصِ قفل است) — شمارش روی چیپِ سربرگ سالم است
    expect(chipText()).toContain("۲ از ۵۵");
  });

  it("بردِ پراکندهٔ بی‌رسید هرگز باز نمی‌کند — صفرِ صادق برای دفترچهٔ قدیمی (درسِ ۱۰۴: زنجیره تا دیروز می‌مرد)", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "p1", opponent: "حریفِ یکم" }),
        rec({ id: "p2", opponent: "حریفِ دوم" }),
        rec({ id: "p3", opponent: "حریفِ سوم" }),
        rec({ id: "p4", opponent: "حریفِ چهارم", outcome: "loss", receiptSig: SIG }), // باختِ رسیددار: verified هست، verifiedWin نه
        rec({ id: "p5", opponent: "حریفِ پنجم", outcome: "tie", receiptSig: SIG }), // مساویِ رسیددار: همین‌طور
      ],
      duelWins: 3,
    });
    render(<Badges />);

    const trust = screen.getByText("گواه‌گرفته").closest(".badge-card")!;
    const oath = screen.getByText("سندِ زنده").closest(".badge-card")!;
    expect(trust.className).not.toContain("badge-shine");
    expect(oath.className).not.toContain("badge-shine");
    expect(trust.textContent).toContain("۰ از ۳ بردِ گواه‌دار");
    expect(oath.textContent).toContain("۰ از ۷ بردِ گواه‌دار");
    expect(chipText()).toContain("۰ از ۵۵");
  });
});
