// @vitest-environment jsdom
// ------------------------------------------------------------------
// r289 «نشان‌های نبردی در DOMِ صفحهٔ نبرد» — نوارِ انگیزهٔ در-بستر:
//   ① هر ۱۰ عضوِ خانواده همیشه حاضرند — حتی با دفترچهٔ تهی (هدف‌ها دیده
//     میشوند): قفل = سکوتِ سنگی + تِلِ پیشرفت در title؛ شمارندهٔ خودسازگار
//   ② با دفترچهٔ واقعی: بازِ پلهای («شکارچیِ رقیب» نقره با TIER_STYLE) +
//     قفلِ همسایه با تِلِ دقیقِ پیشرفت («۲ از ۳ برد مقابلِ یک حریف»)
//   ③ خودسازگاری: نشانِ همگانیِ بازِ همان کاربر («اولین قدم») هرگز در نوار
//     راه ندارد — همان قراردادِ کارتِ PNGِ r288
//   ④ قفلِ ساختاری: duel-setup دقیقاً یک ارزیابی دارد (buildEvalInput ×۱) و
//     نوار از همان رجیستری/خانواده میخواند — هیچ ارزیابی یا لیستِ دومی
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

const { ledgerImage, trackSpy } = vi.hoisted(() => ({ ledgerImage: vi.fn(), trackSpy: vi.fn() }));
vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadDuelLedgerImage: (...args: unknown[]) => ledgerImage(...args),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import { TIER_STYLE, DUEL_BADGE_IDS } from "@/lib/achievements";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished" as const,
  opponent: "سینا",
  opponentColor: "rose" as const,
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
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
      nameDraft=""
      setNameDraft={() => {}}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

const strip = () => screen.getByRole("region", { name: "نشان‌های نبردی" });
const pill = () => strip().querySelector("h2 span")?.textContent ?? "";

describe("نوارِ نشان‌های نبردی (r289)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [], userName: "", history: {} });
  });

  it("دفترچهٔ تهی → نوار حاضر است با ۱۰ هدفِ قفل و شمارندهٔ «۰ از ۱۰» — تِلِ پیشرفت در title", () => {
    renderSetup();
    expect(strip()).toBeInTheDocument();
    expect(pill()).toBe("۰ از ۱۰");
    // هر ده عضو حاضرند — قفلها هم دیده میشوند (هدفگذاری، نه محوِ صادقِ کارتِ PNG)
    const chips = [...strip().querySelectorAll("ul li")];
    expect(chips).toHaveLength(DUEL_BADGE_IDS.length);
    // شکارچیِ رقیب قفل: تِلِ پیشرفتِ دقیقِ همان رجیستری
    const hunter = chips.find((c) => c.textContent?.includes("شکارچیِ رقیب"));
    expect(hunter).toBeTruthy();
    expect(hunter).toHaveAttribute("title", "۰ از ۲ برد مقابلِ یک حریف");
    // قفل = سکوتِ سنگی، نه چیپِ پلهای
    expect(hunter?.className).toContain("bg-stone-100");
  });

  it("دو برد مقابلِ یک حریف → شمارندهٔ «۱ از ۱۰» + شکارچیِ رقیبِ پلهایِ نقره + تِلِ کابوسِ رقیب", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "c1", opponent: "آرش ر" }),
        rec({ id: "c2", opponent: "آرش ر" }),
      ],
    });
    renderSetup();
    expect(pill()).toBe("۱ از ۱۰");
    // باز: چیپِ پلهایِ نقره از همان TIER_STYLE
    const hunter = [...strip().querySelectorAll("ul li")].find((c) => c.textContent?.includes("شکارچیِ رقیب"));
    expect(hunter?.className).toContain(TIER_STYLE.silver.chip);
    expect(hunter?.className).toContain(TIER_STYLE.silver.ring);
    // قفلِ همسایه: تِلِ پیشرفتِ زنده از همان ارزیابیِ واحد
    const nightmare = [...strip().querySelectorAll("ul li")].find((c) => c.textContent?.includes("کابوسِ رقیب"));
    expect(nightmare).toHaveAttribute("title", "۲ از ۳ برد مقابلِ یک حریف");
  });

  it("خودسازگاری: نشانِ همگانیِ باز («اولین قدم») هرگز در نوارِ خانواده راه ندارد", () => {
    useStudy.setState({
      history: { "2026-10-13": { quizzes: 2, reviews: 1 } }, // اولین قدم باز میشود
      duelHistory: [rec({ id: "c1", opponent: "آرش ر" })],
    });
    renderSetup();
    // نشانِ همگانیِ باز: در نوارِ خانواده غایب — چیپی با این عنوان وجود ندارد
    const all = [...strip().querySelectorAll("ul li")].map((c) => c.textContent ?? "");
    expect(all.some((t) => t.includes("اولین قدم"))).toBe(false);
    expect(pill()).toBe("۰ از ۱۰"); // خانوادهٔ نبرد هنوز صفر است — صادق
  });

  it("قفلِ ساختاری: یک ارزیابی در duel-setup و نوار از همان رجیستری/خانواده", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/duel/duel-setup.tsx"), "utf8");
    // ارزیابیِ یگانه: دقیقاً یک فراخوانیِ buildEvalInput (الگویِ قفلِ r287)
    expect((src.match(/buildEvalInput\(/g) ?? []).length).toBe(1);
    // نوار از همان منبعِ خانواده میخواند — نه لیستِ دستیِ دومی
    expect(src).toContain("DUEL_BADGE_IDS");
    expect(src).toContain("duelFamilyBadges");
    expect((src.match(/DUEL_BADGE_IDS\.includes/g) ?? []).length).toBe(1);
    // چیپهایِ پلهای از TIER_STYLE میآیند — رنگِ دستیِ دوم ممنوع
    expect(src).toContain("TIER_STYLE[b.tier].chip");
  });
});
