// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 95 «داورگواه» — the leaderboard duel tab surfaces the judge-attested
// subset of wins (Task 94 receipts):
//   ① a dueler with verifiedWins>0 shows the emerald ShieldCheck chip with
//     the verified COUNT (honest subset — 2 of 3 wins verified → «۲»)
//   ② a legacy dueler (verifiedWins=0) shows NO shield
//   ③ the trust header switches per-tab: duels → «بردها با رسیدِ امضاشدهٔ داور…»
//   ④ the podium metric carries the shield for verified leaders
// Data arrives via fetch — stubbed here; the component renders from JSON.
// ------------------------------------------------------------------

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import Leaderboard from "@/components/study/duel/leaderboard";

function duelersPayload() {
  return {
    learners: [],
    totalLearners: 4,
    duelsTotal: 8,
    duelers: [
      {
        userId: "u-top",
        name: "مریم",
        color: "amber",
        duels: 5,
        wins: 5,
        losses: 0,
        ties: 0,
        verifiedWins: 5, // podium — shield via metric aria-label
        bestScore: 700,
        avgPercent: 95,
        winRate: 100,
      },
      {
        userId: "u-second",
        name: "سارا",
        color: "rose",
        duels: 3,
        wins: 2,
        losses: 1,
        ties: 0,
        verifiedWins: 0, // legacy wins — NO shield anywhere
        bestScore: 500,
        avgPercent: 80,
        winRate: 67,
      },
      {
        userId: "u-third",
        name: "رضا",
        color: "sky",
        duels: 2,
        wins: 2,
        losses: 0,
        ties: 0,
        verifiedWins: 1, // podium, partially verified — honest
        bestScore: 450,
        avgPercent: 75,
        winRate: 100,
      },
      {
        userId: "u-fourth",
        name: "آرش",
        color: "emerald",
        duels: 3,
        wins: 1,
        losses: 2,
        ties: 0,
        verifiedWins: 1, // rank 4 → recordBadge shield with COUNT
        bestScore: 300,
        avgPercent: 60,
        winRate: 33,
      },
    ],
  };
}

function stubFetch() {
  return vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(duelersPayload()),
      } as unknown as Response)
    )
  );
}

describe("سپرِ داورگواه روی رتبه‌بندی نبردها (Task 95)", () => {
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
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("داورگواه: چیپِ سپر با شمارِ تأییدشده‌ها در ردیفِ رتبهٔ ۴+ + سکو با aria؛ قدیمی بدونِ سپر", async () => {
    render(<Leaderboard />);
    // switch to the duels tab
    const duelsTab = await screen.findByRole("tab", { name: /نبردهای دودنفره/ });
    fireEvent.click(duelsTab);
    await waitFor(() => expect(screen.getByText("رتبه‌بندی نبردها")).toBeInTheDocument());

    // rank-4 row: the only title-carrying shield chip — honest count «۱» of «۱» wins
    const shieldChip = await screen.findByTitle("۱ بردِ داورگواه — با رسیدِ امضاشدهٔ سرور");
    expect(shieldChip).toBeInTheDocument();
    expect(shieldChip.textContent).toContain("۱");
    // legacy dueler (سارا، بدونِ رسید): exactly ONE row shield on screen (آرش) — سارا بی‌سپر
    expect(screen.getAllByTitle(/بردِ داورگواه/)).toHaveLength(1);
    // podium leaders with verifiedWins>0 carry the aria-labelled shield (مریم + رضا)
    expect(screen.getAllByLabelText("داورگواه")).toHaveLength(2);
  });

  it("سربرگِ اعتماد در تب دودل دربارهٔ رسیدِ داور است نه نمرات", async () => {
    render(<Leaderboard />);
    const duelsTab = await screen.findByRole("tab", { name: /نبردهای دودنفره/ });
    fireEvent.click(duelsTab);
    await waitFor(() => expect(screen.getByText("رتبه‌بندی نبردها")).toBeInTheDocument());
    expect(screen.getByText("بردها با رسیدِ امضاشدهٔ داور تأیید می‌شوند")).toBeInTheDocument();
    // and the exams tab keeps the original line
    fireEvent.click(screen.getByRole("tab", { name: /نمرات آزمون/ }));
    await waitFor(() => expect(screen.getByText("نمرات تأییدشدهٔ سمت سرور")).toBeInTheDocument());
  });
});
