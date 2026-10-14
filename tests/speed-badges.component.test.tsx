// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 100 — نشان‌های خانوادهٔ «سرعت» روی پنلِ نشان‌ها:
//   ① تازه‌وارد: «۰ از ۶۲» — دو کاشیِ تازه قفل با پیشرفتِ صادقِ گیتِ نمونه
//   ② نمونهٔ کم با میانگینِ بالا → هنوز قفل؛ پیشرفت روی نمونه می‌ماند
//     (هیچ‌وقت «۹۰ از ۶۲» زیرِ قفل دیده نمی‌شود — پیشرفتِ صادق)
//   ③ نمونهٔ کافی و سریع → هر دو باز (زیرمجموعه) + «۲ از ۶۲»
//   ۴ نمونهٔ کافی و کند → قفل با پیشرفتِ گیتِ میانگین («میانگینِ سرعت: ۰ از ۶۰»)
// الگوی seed هم‌الگوی rival-badges (beforeEach ضدآلودگی — درسِ ۹۲).
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
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 950, // ۵ درست × ۱۰۰ + پاداشِ ۴۵۰ → میانگینِ سرعتِ ۹۰
  oppScore: 500,
  myCorrect: 5,
  oppCorrect: 3,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

const chipText = () =>
  screen.getAllByText((_c, el) => !!el?.textContent && /از ۶۲$/.test(el.textContent.trim()))[0]
    ?.textContent?.replace(/\s+/g, " ")
    .trim();

describe("خانوادهٔ سرعت — صاعقه / سرعتِ صوت (Task 100)", () => {
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

  it("تازه‌وارد: هر دو کاشیِ سرعت قفل با پیشرفتِ صادقِ گیتِ نمونه", () => {
    render(<Badges />);
    const bolt = screen.getByText("صاعقه").closest(".badge-card");
    const sound = screen.getByText("سرعتِ صوت").closest(".badge-card");
    expect(bolt).not.toBeNull();
    expect(sound).not.toBeNull();
    expect(bolt!.className).not.toContain("badge-shine");
    expect(sound!.className).not.toContain("badge-shine");
    expect(bolt!.textContent).toContain("۰ از ۱۰ پاسخِ درست");
    expect(sound!.textContent).toContain("۰ از ۱۵ پاسخِ درست");
    expect(chipText()).toContain("۰ از ۶۲");
  });

  it("نمونهٔ کم با میانگینِ بالا (۹۰) → قفل می‌ماند و پیشرفت روی نمونه است — نه ادعای میانگین", () => {
    useStudy.setState({ duelHistory: [rec({ myCorrect: 2, myScore: 380 })], duelWins: 1 });
    render(<Badges />);

    const bolt = screen.getByText("صاعقه").closest(".badge-card")!;
    const sound = screen.getByText("سرعتِ صوت").closest(".badge-card")!;
    expect(bolt.className).not.toContain("badge-shine");
    expect(sound.className).not.toContain("badge-shine");
    expect(bolt.textContent).toContain("۲ از ۱۰ پاسخِ درست");
    expect(sound.textContent).toContain("۲ از ۱۵ پاسخِ درست");
    expect(bolt.textContent).not.toContain("از ۶۲");
    expect(chipText()).toContain("۰ از ۶۲");
  });

  it("سه نبردِ سریع (۱۵ پاسخِ درست، میانگینِ ۹۰) → هر دو باز + «۲ از ۶۲»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", opponent: "سینا" }),
        rec({ id: "d2", opponent: "امیر" }),
        rec({ id: "d1", opponent: "پریسا" }),
      ],
      duelWins: 3,
    });
    render(<Badges />);

    expect(screen.getByText("صاعقه").closest(".badge-card")!.className).toContain("badge-shine");
    expect(screen.getByText("سرعتِ صوت").closest(".badge-card")!.className).toContain("badge-shine");
    expect(chipText()).toContain("۲ از ۶۲");
  });

  it("نمونهٔ کافی ولی کند (پاداشِ صفر) → قفل با پیشرفتِ گیتِ میانگین: «میانگینِ سرعت: ۰ از ۶۰»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d2", myScore: 500, myCorrect: 5, oppScore: 900, outcome: "loss" }),
        rec({ id: "d1", myScore: 500, myCorrect: 5, oppScore: 900, outcome: "loss" }),
      ],
      duelLosses: 2,
    });
    render(<Badges />);

    const bolt = screen.getByText("صاعقه").closest(".badge-card")!;
    const sound = screen.getByText("سرعتِ صوت").closest(".badge-card")!;
    expect(bolt.className).not.toContain("badge-shine");
    expect(sound.className).not.toContain("badge-shine");
    expect(bolt.textContent).toContain("میانگینِ سرعت: ۰ از ۶۰");
    expect(sound.textContent).toContain("۱۰ از ۱۵ پاسخِ درست");
    expect(chipText()).toContain("۰ از ۶۲");
  });
});
