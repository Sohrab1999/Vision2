// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 106 «زمانِ فکر» در کارنامهٔ نبرد — بلوکِ ریتمِ دیدن→پاسخِ خودی:
//   ① نمونه‌های کامل → بلوک با میانگین/سریع‌ترینِ ارقام‌فارسی، بدونِ «بدونِ ثبت»
//   ② نمونه‌های ناقص → چیپِ پوششِ «۹ از ۱۰» + خطِ «۱ سؤال بدونِ ثبت» + نوارِ خاکستری
//   ③ بی‌فیلدِ think (سرویسِ قدیمی) → کلِ بلوک غایب — نه صفرِ ساختگی
//   ④ همه‌null → بلوک غایب (صداقتِ زیرمجموعه)
// نمونه‌ها نمایشِ همان لحظه‌اند (بیرونِ رسیدِ امضاشده) — قراردادِ ۹۴ دست‌نخورده.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";

const { toastSpy, buildBlob, doneImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  buildBlob: vi.fn(),
  doneImage: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadDuelDoneImage: (...args: unknown[]) => doneImage(...args),
  buildDuelDoneBlob: (...args: unknown[]) => buildBlob(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

import DuelDone from "@/components/study/duel/duel-done";
import type { EndPayload } from "@/components/study/duel/duel-types";

const player = (sid: string, name: string, score: number, correct: number) => ({
  sid,
  name,
  color: "#a8a29e",
  qi: 10,
  score,
  correct,
  answered: 10,
  done: true,
  disconnected: false,
});

const baseEnd = (think?: EndPayload["think"]): EndPayload => ({
  reason: "finished",
  winner: "s1",
  total: 10,
  startedAt: 1_000_000,
  players: [player("s1", "من", 999, 8), player("s2", "سینا", 850, 7)],
  ...(think ? { think } : {}),
});

const renderDone = (think?: EndPayload["think"]) =>
  render(<DuelDone endData={baseEnd(think)} mySid="s1" myFinishAt={0} oppConnected rematchVotes={0} rematch={() => {}} leaveRoom={() => {}} />);

const block = () => screen.queryByLabelText("زمانِ فکرِ من در این نبرد");

describe("«زمانِ فکر» در کارنامهٔ نبرد (Task 106)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    buildBlob.mockReset();
    doneImage.mockReset();
  });

  it("نمونه‌های کامل → بلوک با میانگین/سریع‌ترینِ ارقام‌فارسی + ده نوار + بدونِ «بدونِ ثبت»", () => {
    renderDone({
      s1: [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100],
      s2: Array(10).fill(500),
    });
    const el = block();
    expect(el).toBeInTheDocument();
    // میانگین 1650ms → ۱٫۷ ثانیه؛ کمینه 1200 → ۱٫۲
    expect(el!.textContent).toContain("میانگینِ فکر ۱٫۷ ثانیه");
    expect(el!.textContent).toContain("سریع‌ترین ۱٫۲ ثانیه");
    expect(el!.textContent).toContain("ثبت برای ۱۰ از ۱۰ سؤال");
    expect(el!.textContent).not.toContain("بدونِ ثبت");
    // ده نوار با عنوانِ سؤال — ارقامِ فارسی
    const bars = el!.querySelectorAll("span[title^='سؤال']");
    expect(bars.length).toBe(10);
  });

  it("نمونه‌های ناقص → چیپِ پوششِ «۹ از ۱۰» + «۱ سؤال بدونِ ثبت» + نوارِ خاکستریِ ثبت‌نشده", () => {
    renderDone({
      s1: [1200, null, 3400, 800, 1500, 2200, 1800, 2600, 900, 3100],
    });
    const el = block();
    expect(el).toBeInTheDocument();
    expect(el!.textContent).toContain("ثبت برای ۹ از ۱۰ سؤال");
    expect(el!.textContent).toContain("۱ سؤال بدونِ ثبت");
    // میانگین 17500/9=1944.4 → ۱٫۹؛ کمینه 800 → ۰٫۸
    expect(el!.textContent).toContain("میانگینِ فکر ۱٫۹ ثانیه");
    expect(el!.textContent).toContain("سریع‌ترین ۰٫۸ ثانیه");
    // نوارِ خاکستریِ جایِ سؤالِ بی‌نمونه با عنوانِ صادق
    const silent = screen.getByTitle("سؤال ۲: ثبت نشده");
    expect(silent).toBeInTheDocument();
    // بلندترین نوار = بیشینهٔ 3400 → 44px (نسبتِ صادق)
    const tallest = screen.getByTitle("سؤال ۳: ۳٫۴ ثانیه");
    expect(tallest.getAttribute("style")).toContain("44px");
  });

  it("بی‌فیلدِ think (سرویسِ قدیمیِ ۳۰۰۳) → کلِ بلوک غایب", () => {
    renderDone(undefined);
    expect(block()).not.toBeInTheDocument();
  });

  it("همه‌null (هیچ سؤالی دیده/ثبت نشده) → بلوک غایب — صداقتِ زیرمجموعه", () => {
    renderDone({ s1: Array(10).fill(null), s2: Array(10).fill(300) });
    expect(block()).not.toBeInTheDocument();
  });
});
