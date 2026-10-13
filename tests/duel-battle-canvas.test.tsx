// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 101 — مسیرِ صادقِ بی‌کانواس: jsdom «2d» ندارد → getContext(null)
// → هر دو کارتِ نبرد false برمی‌گردانند (بدونِ انفجار) — همان قراردادِ
// downloadResultImage (محیطِ بی‌کانواس = شکستِ آرام، نه استثنا).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { downloadDuelLedgerImage, downloadDuelDoneImage } from "@/lib/result-image";
import type { DuelLedgerStats } from "@/lib/duel-history";

const stats: DuelLedgerStats = {
  total: 5,
  win: 3,
  loss: 1,
  tie: 1,
  winRate: 60,
  best: 1200,
  streak: 2,
  totalPoints: 4300,
  topRival: { opponent: "امیر", wins: 2 },
  verified: 1,
};

describe("کارت‌های نبرد — مسیرِ بی‌کانواس (Task 101)", () => {
  it("downloadDuelLedgerImage در محیطِ بی‌کانواس false برمی‌گرداند", async () => {
    await expect(downloadDuelLedgerImage({ stats, userName: "میلاد" })).resolves.toBe(false);
  });

  it("downloadDuelDoneImage در محیطِ بی‌کانواس false برمی‌گرداند", async () => {
    await expect(
      downloadDuelDoneImage({
        outcome: "win",
        forfeit: false,
        myName: "من",
        oppName: "سینا",
        myScore: 999,
        oppScore: 1150,
        myCorrect: 8,
        oppCorrect: 9,
        total: 10,
        durationSec: 95,
        base: 800,
        bonus: 199,
        receipt: false,
      })
    ).resolves.toBe(false);
  });
});
