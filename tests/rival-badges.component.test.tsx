// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 99 — نشان‌های خانوادهٔ «نبرد» روی پنلِ نشان‌ها:
//   ① تازه‌وارد: «۰ از ۴۶» — دو کاشیِ تازه قفل با پیشرفتِ صادق
//   ② دو برد مقابلِ یک حریف → «شکارچیِ رقیب» باز (نقره/Swords) + «۱ از ۴۶»
//   ③ سه برد → «کابوسِ رقیب» هم باز (زیرمجموعهٔ ۳⇒۲ — هم‌قراردادِ حضور/ران)
//   ④ بردِ پراکنده میانِ حریف‌های مختلف هرگز باز نمی‌کند (گروه‌بندیِ واحد)
// الگوی seed هم‌الگوی badges.component.test (beforeEach ضدآلودگی — درسِ ۹۲).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import Badges from "@/components/study/practice/badges";
import type { DuelRecord } from "@/lib/duel-history";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "امیر",
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
  screen.getAllByText((_c, el) => !!el?.textContent && /از ۴۶$/.test(el.textContent.trim()))[0]
    ?.textContent?.replace(/\s+/g, " ")
    .trim();

describe("خانوادهٔ نبرد — شکارچیِ رقیب / کابوسِ رقیب (Task 99)", () => {
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
    // ضدآلودگی (درسِ ۹۲): هر فیلدی که ادعای شمارشیِ چیپ به آن وابسته است صفر می‌شود
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

  it("تازه‌وارد: هر دو کاشیِ نبرد قفل با پیشرفتِ صادقِ «۰ از ۲/۳ برد»", () => {
    render(<Badges />);
    const hunter = screen.getByText("شکارچیِ رقیب").closest(".badge-card");
    const nightmare = screen.getByText("کابوسِ رقیب").closest(".badge-card");
    expect(hunter).not.toBeNull();
    expect(nightmare).not.toBeNull();
    expect(hunter!.className).not.toContain("badge-shine");
    expect(nightmare!.className).not.toContain("badge-shine");
    expect(hunter!.textContent).toContain("۰ از ۲ برد مقابلِ یک حریف");
    expect(nightmare!.textContent).toContain("۰ از ۳ برد مقابلِ یک حریف");
    expect(chipText()).toContain("۰ از ۴۶");
  });

  it("دو برد مقابلِ یک حریف → شکارچیِ رقیب باز + «۱ از ۴۶» — کابوس هنوز قفل با «۲ از ۳»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d2", opponent: "امیرمحمد", outcome: "win" }),
        rec({ id: "d1", opponent: "امیر محمد", outcome: "win" }), // همان رقیب با نرمال
      ],
      duelWins: 2,
    });
    render(<Badges />);

    const hunter = screen.getByText("شکارچیِ رقیب").closest(".badge-card")!;
    const nightmare = screen.getByText("کابوسِ رقیب").closest(".badge-card")!;
    expect(hunter.className).toContain("badge-shine");
    expect(nightmare.className).not.toContain("badge-shine");
    expect(nightmare.textContent).toContain("۲ از ۳ برد مقابلِ یک حریف");
    expect(chipText()).toContain("۱ از ۴۶");
  });

  it("سه برد → زیرمجموعهٔ ۳⇒۲ در هر دو جهت: هر دو باز + «۲ از ۴۶»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", outcome: "win" }),
        rec({ id: "d2", outcome: "win" }),
        rec({ id: "d1", outcome: "win" }),
      ],
      duelWins: 3,
    });
    render(<Badges />);

    expect(screen.getByText("شکارچیِ رقیب").closest(".badge-card")!.className).toContain("badge-shine");
    expect(screen.getByText("کابوسِ رقیب").closest(".badge-card")!.className).toContain("badge-shine");
    expect(chipText()).toContain("۲ از ۴۶");
  });

  it("دو بردِ پراکنده میانِ حریف‌های مختلف هرگز باز نمی‌کند — شرط «واحد» صادق است", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", opponent: "امیر", outcome: "win" }),
        rec({ id: "d2", opponent: "سینا", outcome: "win" }),
        rec({ id: "d1", opponent: "پریسا", outcome: "win" }),
      ],
      duelWins: 3,
    });
    render(<Badges />);

    expect(screen.getByText("شکارچیِ رقیب").closest(".badge-card")!.className).not.toContain("badge-shine");
    expect(screen.getByText("کابوسِ رقیب").closest(".badge-card")!.className).not.toContain("badge-shine");
    expect(screen.getByText("شکارچیِ رقیب").closest(".badge-card")!.textContent).toContain("۱ از ۲ برد");
    expect(chipText()).toContain("۰ از ۴۶");
  });
});
