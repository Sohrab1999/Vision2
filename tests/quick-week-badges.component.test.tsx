// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 110 — نشان‌های دهمین خانوادهٔ «هفتهٔ چابک» روی پنلِ نشان‌ها:
//   ① تازه‌وارد: «۰ از ۶۲» — دو کاشیِ تازه قفل با پیشرفتِ شمارشیِ صادق
//   ② هفتهٔ واجدِ ۰٫۸ثانیه‌ای → هر دو باز (زیرمجموعهٔ طلا⇒نقره) + «۳ از ۶۲»
//     (نیم‌نگاهِ ۱۰۸ با همان seed روشن می‌شود — سه رکوردِ چابک، درسِ شمارش)
//   ③ هفتهٔ ۱٫۲ثانیه‌ای → نقره باز، طلا قفل با پیشرفتِ «۱٫۲ از ۱ ثانیه»
//   ④ دفترچهٔ قدیمیِ بی‌think → هر دو قفل — صفرِ صادق
//   ⑤ هفتهٔ سریعِ بی‌دقت (نرخِ ۰٫۷) → هر دو قفل؛ نقره شمارِ ۳از۳ را دارد
//     ولی طلا بی‌متن می‌ماند (گیتِ ترکیبی واقعی، نه شمارشِ خلوت)
// الگوی seed هم‌الگوی quick-think-badges.component.test (beforeEach ضدآلودگی —
// درسِ ۹۲؛ حریف‌های متمایز — درسِ ۱۰۵؛ ورودی از duelHistory واقعی).
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
  myCorrect: 9,
  oppCorrect: 6,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

const THINK = { avgMs: 800, minMs: 200, maxMs: 1500, seen: 10, total: 10 };
const quick = (over: Partial<DuelRecord> = {}, thinkOver: Partial<DuelRecord["think"]> = {}) =>
  rec({ think: { ...THINK, ...thinkOver }, ...over });

/** هفتهٔ واجدِ استاندارد — سه نبردِ فکردار روی سه روزِ متوالی با حریف‌های متمایز */
const weekAt = (avgMs: number): DuelRecord[] => [
  quick({ id: "w1", day: "2026-10-13", opponent: "حریفِ یکم" }, { avgMs, minMs: Math.min(200, avgMs - 100) }),
  quick({ id: "w2", day: "2026-10-12", opponent: "حریفِ دوم" }, { avgMs, minMs: Math.min(200, avgMs - 100) }),
  quick({ id: "w3", day: "2026-10-11", opponent: "حریفِ سوم" }, { avgMs, minMs: Math.min(200, avgMs - 100) }),
];

const chipText = () =>
  screen.getAllByText((_c, el) => !!el?.textContent && /از ۶۲$/.test(el.textContent.trim()))[0]
    ?.textContent?.replace(/\s+/g, " ")
    .trim();

describe("خانوادهٔ هفتهٔ چابک — هفتهٔ چابک / هفتهٔ برق (Task 110)", () => {
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

  it("تازه‌وارد: هر دو کاشی قفل با پیشرفتِ صادقِ «۰ از ۳ نبردِ فکردار در یک هفته» + «۰ از ۶۲»", () => {
    render(<Badges />);
    const week = screen.getByText("هفتهٔ چابک").closest(".badge-card");
    const bolt = screen.getByText("هفتهٔ برق").closest(".badge-card");
    expect(week).not.toBeNull();
    expect(bolt).not.toBeNull();
    expect(week!.className).not.toContain("badge-shine");
    expect(bolt!.className).not.toContain("badge-shine");
    expect(week!.textContent).toContain("۰ از ۳ نبردِ فکردار در یک هفته");
    expect(bolt!.textContent).not.toContain("از ۱ ثانیه"); // طلا بی‌هفتهٔ واجد، بی‌متنِ پیشرفت
    expect(chipText()).toContain("۰ از ۶۲");
  });

  it("هفتهٔ ۰٫۸ثانیه‌ای → هر دو باز + نیم‌نگاهِ ۱۰۸ هم روشن — «۳ از ۶۲»", () => {
    useStudy.setState({ duelHistory: weekAt(800), duelWins: 3 });
    render(<Badges />);

    const week = screen.getByText("هفتهٔ چابک").closest(".badge-card")!;
    const bolt = screen.getByText("هفتهٔ برق").closest(".badge-card")!;
    expect(week.className).toContain("badge-shine");
    expect(bolt.className).toContain("badge-shine");
    // سه رکوردِ چابک، خانوادهٔ تک‌رکوردی (۱۰۸) را هم روشن می‌کند — شمارِ چیپِ ۳تایی
    expect(chipText()).toContain("۳ از ۶۲");
  });

  it("هفتهٔ ۱٫۲ثانیه‌ای → نقره باز، طلا قفل با پیشرفتِ «۱٫۲ از ۱ ثانیه» — زیرمجموعه در هر دو جهت", () => {
    useStudy.setState({ duelHistory: weekAt(1200), duelWins: 3 });
    render(<Badges />);

    const week = screen.getByText("هفتهٔ چابک").closest(".badge-card")!;
    const bolt = screen.getByText("هفتهٔ برق").closest(".badge-card")!;
    expect(week.className).toContain("badge-shine");
    expect(bolt.className).not.toContain("badge-shine");
    expect(bolt.textContent).toContain("۱٫۲ از ۱ ثانیه");
    expect(chipText()).toContain("۲ از ۶۲");
  });

  it("پانزده نبردِ عادیِ بی‌think → هر دو قفل — صفرِ صادقِ دفترچهٔ قدیمی", () => {
    useStudy.setState({
      duelHistory: Array.from({ length: 15 }, (_, i) =>
        rec({ id: `l${i}`, day: `2026-10-${String(13 - (i % 7)).padStart(2, "0")}`, opponent: `حریفِ ${i}` })
      ),
      duelWins: 15,
    });
    render(<Badges />);

    const week = screen.getByText("هفتهٔ چابک").closest(".badge-card")!;
    const bolt = screen.getByText("هفتهٔ برق").closest(".badge-card")!;
    expect(week.className).not.toContain("badge-shine");
    expect(bolt.className).not.toContain("badge-shine");
    expect(week.textContent).toContain("۰ از ۳ نبردِ فکردار در یک هفته");
    expect(bolt.textContent).not.toContain("از ۱ ثانیه");
    expect(chipText()).toContain("۰ از ۶۲");
  });

  it("گیتِ ترکیبیِ واقعی: هفتهٔ سریعِ بی‌دقت (نرخِ ۰٫۷) → هر دو قفل؛ شمارِ نقره ۳از۳ ولی طلا بی‌متن", () => {
    useStudy.setState({
      duelHistory: [
        ...weekAt(800),
        // حریفِ متمایز (درسِ ۱۰۵) — نبردِ عادیِ همان هفته با درستیِ فرو-ریخته
        rec({ id: "sloppy", day: "2026-10-12", opponent: "حریفِ چهارم", outcome: "loss", myCorrect: 1, myScore: 150 }),
      ],
      duelWins: 3,
      duelLosses: 1,
    });
    render(<Badges />);

    const week = screen.getByText("هفتهٔ چابک").closest(".badge-card")!;
    const bolt = screen.getByText("هفتهٔ برق").closest(".badge-card")!;
    expect(week.className).not.toContain("badge-shine");
    expect(bolt.className).not.toContain("badge-shine");
    // شمارِ فکردارِ پنجره ۳ است (پیشرفتِ شمارشیِ بعدِ بُعدِ فکر صادق است) ولی گیتِ نرخ نمی‌گذرد
    expect(week.textContent).toContain("۳ از ۳ نبردِ فکردار در یک هفته");
    // طلا بی‌هفتهٔ واجد → بی‌متنِ «ثانیه» — میانگینِ نمایشی هرگز دروغِ واجدی نمی‌گوید
    expect(bolt.textContent).not.toContain("از ۱ ثانیه");
    // فقط نیم‌نگاهِ ۱۰۸ روشن شده — «۱ از ۶۲»
    expect(chipText()).toContain("۱ از ۶۲");
  });
});
