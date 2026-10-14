// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 108 — نشان‌های نهمین خانوادهٔ «چابکیِ ذهن» روی پنلِ نشان‌ها:
//   ① تازه‌وارد: «۰ از ۵۸» — دو کاشیِ تازه قفل با پیشرفتِ شمارشیِ صادق
//   ② سه نبردِ چابک → «نیم‌نگاه» باز (نقره/Eye) + «۱ از ۵۸» — برقِ فکر قفل
//   ③ هفت نبردِ چابک → «برقِ فکر» هم باز (زیرمجموعهٔ ۷⇒۳) + «۲ از ۵۸»
//   ④ دفترچهٔ پرِ بردِ عادیِ بی‌think هرگز باز نمی‌کند — صفرِ صادقِ قدیمی‌ها
//   ⑤ نبردِ چابکِ کم‌درست (فکرِ کم ولی درستیِ زیرِ گیت) باز نمی‌کند —
//     گیتِ دومرحله‌ای واقعی است، نه شمارشِ سرعتِ خلوت
// الگوی seed هم‌الگوی trust-badges.component.test (beforeEach ضدآلودگی — درسِ ۹۲؛
// ورودیِ eval فقط از duelHistory واقعی می‌سازند — درسِ ۱۰۵).
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
  myScore: 1200,
  oppScore: 950,
  myCorrect: 8,
  oppCorrect: 6,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

const THINK = { avgMs: 800, minMs: 200, maxMs: 1500, seen: 10, total: 10 };
const quick = (over: Partial<DuelRecord> = {}, thinkOver: Partial<DuelRecord["think"]> = {}) =>
  rec({ think: { ...THINK, ...thinkOver }, ...over });

const chipText = () =>
  screen.getAllByText((_c, el) => !!el?.textContent && /از ۵۸$/.test(el.textContent.trim()))[0]
    ?.textContent?.replace(/\s+/g, " ")
    .trim();

describe("خانوادهٔ چابکیِ ذهن — نیم‌نگاه / برقِ فکر (Task 108)", () => {
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

  it("تازه‌وارد: هر دو کاشیِ چابکی قفل با پیشرفتِ صادقِ «۰ از ۳/۷ نبردِ چابک»", () => {
    render(<Badges />);
    const glance = screen.getByText("نیم‌نگاه").closest(".badge-card");
    const flash = screen.getByText("برقِ فکر").closest(".badge-card");
    expect(glance).not.toBeNull();
    expect(flash).not.toBeNull();
    expect(glance!.className).not.toContain("badge-shine");
    expect(flash!.className).not.toContain("badge-shine");
    expect(glance!.textContent).toContain("۰ از ۳ نبردِ چابک");
    expect(flash!.textContent).toContain("۰ از ۷ نبردِ چابک");
    expect(chipText()).toContain("۰ از ۵۸");
  });

  it("سه نبردِ چابک → هفتهٔ ۰٫۸ثانیه‌ای هر دو پلهٔ ۱۱۰ + نیم‌نگاه (۱۰۸) را روشن می‌کند + «۳ از ۵۸» — برقِ فکر هنوز قفل با «۳ از ۷»", () => {
    useStudy.setState({
      duelHistory: [
        quick({ id: "q1", opponent: "حریفِ یکم" }),
        quick({ id: "q2", opponent: "حریفِ دوم" }),
        quick({ id: "q3", opponent: "حریفِ سوم" }),
      ],
      duelWins: 3,
    });
    render(<Badges />);

    const glance = screen.getByText("نیم‌نگاه").closest(".badge-card")!;
    const flash = screen.getByText("برقِ فکر").closest(".badge-card")!;
    expect(glance.className).toContain("badge-shine");
    expect(flash.className).not.toContain("badge-shine");
    expect(flash.textContent).toContain("۳ از ۷ نبردِ چابک");
    expect(chipText()).toContain("۳ از ۵۸");
  });

  it("هفت نبردِ چابک → زیرمجموعهٔ ۷⇒۳ در هر دو جهت: چهار کاشیِ دو خانواده باز + «۴ از ۵۸»", () => {
    useStudy.setState({
      duelHistory: [
        quick({ id: "q1", opponent: "حریفِ یکم" }),
        quick({ id: "q2", opponent: "حریفِ دوم" }),
        quick({ id: "q3", opponent: "حریفِ سوم" }),
        quick({ id: "q4", opponent: "حریفِ چهارم" }),
        quick({ id: "q5", opponent: "حریفِ پنجم" }),
        quick({ id: "q6", opponent: "حریفِ ششم" }),
        quick({ id: "q7", opponent: "حریفِ هفتم" }),
      ],
      duelWins: 7,
    });
    render(<Badges />);

    expect(screen.getByText("نیم‌نگاه").closest(".badge-card")!.className).toContain("badge-shine");
    expect(screen.getByText("برقِ فکر").closest(".badge-card")!.className).toContain("badge-shine");
    // حریف‌های متمایز — خانوادهٔ رقیب را روشن نمی‌کنند (درسِ ۱۰۵)؛ فقط دو کاشیِ این خانواده
    expect(chipText()).toContain("۴ از ۵۸");
  });

  it("پانزده بردِ عادیِ بی‌think → هر دو قفل — صفرِ صادقِ دفترچهٔ قدیمی", () => {
    useStudy.setState({
      duelHistory: Array.from({ length: 15 }, (_, i) =>
        rec({ id: `l${i}`, opponent: `حریفِ ${i}` })
      ),
      duelWins: 15,
    });
    render(<Badges />);

    const glance = screen.getByText("نیم‌نگاه").closest(".badge-card")!;
    const flash = screen.getByText("برقِ فکر").closest(".badge-card")!;
    expect(glance.className).not.toContain("badge-shine");
    expect(flash.className).not.toContain("badge-shine");
    expect(glance.textContent).toContain("۰ از ۳ نبردِ چابک");
    expect(flash.textContent).toContain("۰ از ۷ نبردِ چابک");
    expect(chipText()).toContain("۰ از ۵۸");
  });

  it("گیتِ دومرحله‌ای واقعی: فکرِ کم ولی درستیِ کم (۳ از ۱۰) → قفل؛ فکرِ زیاد ولی درستِ بالا → قفل", () => {
    useStudy.setState({
      duelHistory: [
        // فکرِ ۶۰۰ms ولی فقط ۳۰٪ درست — نیم‌نگاهِ شتاب‌زده، نه چابکی
        quick({ id: "s1", myCorrect: 3, answered: 10 }, { avgMs: 600 }),
        // فکرِ ۴ثانیه‌ای با ۹۰٪ درست — دقیق ولی نه چابک
        quick({ id: "s2", myCorrect: 9, answered: 10 }, { avgMs: 4000, maxMs: 5000 }),
        quick({ id: "s3" }),
      ],
      duelWins: 2,
    });
    render(<Badges />);

    const glance = screen.getByText("نیم‌نگاه").closest(".badge-card")!;
    expect(glance.className).not.toContain("badge-shine");
    expect(glance.textContent).toContain("۱ از ۳ نبردِ چابک");
  });
});
