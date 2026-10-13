// Task 104 — e2e proof of the duel receipt trust chain (before/after the cwd fix).
//
// Bug: the :3003 judge was launched with cwd = mini-services/challenge-service,
// so loadOrCreateReceiptSecret() created the HMAC secret at a nested junk path
// invisible to Next (cwd = repo root) → readReceiptSecret() = null →
// verifyDuelSubmission returns bad_sig for EVERY duel submission (route line 99).
//
// `before` mode (run BEFORE the fix): signs a receipt with the service's live
// secret (the nested file — provably the in-memory boot secret) and POSTs it to
// /api/stats. Expected: 401 «امضای داور روی این رسید معتبر نیست» → BUG-CONFIRMED.
// The QA learner profile it registers is deleted before exit.
//
// `after` mode (run AFTER mv + fix + restart): same flow against the canonical
// secret. Expected: success → attempt row exists with the receipt's sig →
// script deletes the row + profile → attempts total returns to baseline.
//
// usage: bun scripts/qa-receipt-e2e-r104.ts before|after
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { signDuelEnd } from "../src/lib/duel-receipt-server";

// run from repo root: bun scripts/qa-receipt-e2e-r104.ts before|after
const ROOT = process.cwd();
const NESTED = join(ROOT, "mini-services/challenge-service/mini-services/challenge-service/.receipt-secret");
const CANON = join(ROOT, "mini-services/challenge-service/.receipt-secret");
const API = "http://127.0.0.1:3000";
const mode = process.argv[2] ?? "before";
const secretPath = mode === "before" ? NESTED : CANON;

const secret = readFileSync(secretPath, "utf8").trim();
if (!/^[0-9a-f]{64}$/.test(secret)) throw new Error("bad/missing secret file: " + secretPath);
console.log(`[${mode}] secret read from ${mode === "before" ? "NESTED" : "CANONICAL"} path (64-hex ok)`);

// fresh QA learner — never touches the 6 real learner profiles
const reg = await fetch(`${API}/api/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "QA-104receipt", color: "sky" }),
});
const regJson = (await reg.json()) as { ok?: boolean; userId?: string; secret?: string };
if (!reg.ok || !regJson.userId || !regJson.secret) {
  throw new Error("register failed: " + JSON.stringify(regJson));
}
console.log(`[${mode}] QA learner registered: ${regJson.userId.slice(0, 8)}…`);

const now = Date.now();
const receipt = signDuelEnd(
  {
    code: "QA" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    startedAt: now - 120_000,
    endedAt: now - 5_000,
    reason: "finished",
    winner: "sid-qa-winner",
    players: [
      { sid: "sid-qa-winner", name: "کاوای QA", score: 990, correct: 9 },
      { sid: "sid-qa-loser", name: "حریفِ QA", score: 640, correct: 6 },
    ],
  },
  secret
);

const res = await fetch(`${API}/api/stats`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    userId: regJson.userId,
    secret: regJson.secret,
    lesson: 0,
    category: "duel",
    total: 10,
    correct: 9,
    score: 990,
    outcome: "win",
    duelName: "کاوای QA",
    receipt,
  }),
});
const txt = await res.text();
console.log(`[${mode}] POST /api/stats → ${res.status} ${txt.slice(0, 160)}`);

const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
try {
  if (mode === "before") {
    // rejection is the EXPECTED bug proof; clean the QA profile either way
    const delP = await p.learnerProfile.deleteMany({ where: { userId: regJson.userId } });
    console.log(`[${mode}] cleanup: QA profile deleted=${delP.count}`);
    if (res.status === 401 || res.status === 403) console.log("BUG-CONFIRMED — judge-signed receipt rejected while judge holds the secret");
    else console.log("UNEXPECTED in before-mode — bug may already be fixed?");
    process.exitCode = res.status === 401 || res.status === 403 ? 0 : 1;
  } else {
    if (!res.ok) {
      const delP = await p.learnerProfile.deleteMany({ where: { userId: regJson.userId } });
      console.log(`[${mode}] cleanup-after-failure: QA profile deleted=${delP.count}`);
      throw new Error("after-mode expected success");
    }
    const row = await p.quizAttempt.findFirst({
      where: { receiptSig: receipt.sig },
      select: { id: true, category: true, outcome: true, score: true },
    });
    console.log(`[${mode}] attempt row by receiptSig: ${JSON.stringify(row)}`);
    const del = await p.quizAttempt.deleteMany({ where: { receiptSig: receipt.sig } });
    const delP = await p.learnerProfile.deleteMany({ where: { userId: regJson.userId } });
    console.log(
      `[${mode}] cleanup: QA attempt deleted=${del.count} (expect 1), QA profile deleted=${delP.count} (expect 1)`
    );
    console.log(`[${mode}] attempts total now: ${await p.quizAttempt.count()} (baseline 10)`);
    if (del.count !== 1 || delP.count !== 1) process.exitCode = 1;
    else console.log("CHAIN-OK — judge-signed receipt accepted end-to-end, DB restored");
  }
} finally {
  await p.$disconnect();
}
