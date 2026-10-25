// Task 95 — leaderboard shield live seed: registers a throwaway QA profile,
// plays ONE real duel on :3003, posts the honest receipt to /api/stats
// (KEEPING the row so the leaderboard shows the judge-attested shield),
// prints the profile name for browser assertion. Cleanup via --clean.
// Run: bun scripts/qa-lb-seed-r95.mjs [--clean]
import { io } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const NEXT = "http://127.0.0.1:3000";
const DUEL = "http://127.0.0.1:3003";
const OPTS = { path: "/", transports: ["websocket"], timeout: 5000 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const db = new PrismaClient();
const NAME = "داورگواه‌QA";

async function playDuel(bChoice) {
  const mk = (name) => {
    const s = io(DUEL, OPTS);
    const c = { s, name, end: null };
    s.on("duel:end", (e) => (c.end = e));
    return c;
  };
  const A = mk(NAME);
  const B = mk("حریفِ‌QA");
  await wait(300);
  const code = await new Promise((res) => A.s.emit("duel:create", { name: NAME }, (r) => res(r.code)));
  const join = await new Promise((res) => B.s.emit("duel:join", { code, name: "حریفِ‌QA" }, (r) => res(r)));
  if (!join?.ok) throw new Error("join failed");
  await wait(5200);
  let qi = 0;
  const t = setInterval(() => {
    if (qi < 10) {
      A.s.emit("duel:answer", { qi, choice: 0 });
      B.s.emit("duel:answer", { qi, choice: bChoice });
      qi += 1;
    } else if (A.end && B.end) clearInterval(t);
  }, 350);
  while (!(A.end && B.end)) await wait(200);
  clearInterval(t);
  A.s.disconnect();
  B.s.disconnect();
  return A.end;
}

async function main() {
  if (process.argv.includes("--clean")) {
    const profs = await db.learnerProfile.findMany({ where: { name: { in: [NAME, "حریفِ‌QA"] } }, select: { userId: true, name: true } });
    for (const p of profs) {
      const a = await db.quizAttempt.deleteMany({ where: { userId: p.userId } });
      const pr = await db.learnerProfile.deleteMany({ where: { userId: p.userId } });
      console.log("cleaned", p.name, "attempts:", a.count, "profiles:", pr.count);
    }
    console.log("CLEAN-OK");
    await db.$disconnect();
    return;
  }

  const reg = await fetch(`${NEXT}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: NAME }),
  });
  if (!reg.ok) throw new Error("register failed: " + reg.status);
  const ident = await reg.json();

  // asymmetric matches until a WIN lands (B never answers → A needs ≥1 correct;
  // ~94% per match) — the shield lives on wins only
  let end = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    end = await playDuel(-1);
    const mine0 = end.receipt.players.find((p) => p.name === NAME);
    const out0 = end.winner === null ? "tie" : end.winner === mine0.sid ? "win" : "loss";
    if (out0 === "win") break;
    console.log("attempt", attempt, "→", out0, "— retrying");
  }
  const rec = end.receipt;
  if (!rec) throw new Error("no receipt");
  const mine = rec.players.find((p) => p.name === NAME);
  const outcome = end.winner === null ? "tie" : end.winner === mine.sid ? "win" : "loss";
  const r = await fetch(`${NEXT}/api/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: ident.userId,
      secret: ident.secret,
      lesson: 0,
      category: "duel",
      total: 10,
      correct: mine.correct,
      score: mine.score,
      outcome,
      duelName: NAME,
      receipt: rec,
    }),
  });
  if (r.status !== 200) throw new Error("stats post failed: " + r.status + " " + JSON.stringify(await r.json()));
  console.log("seeded: name=" + NAME + " outcome=" + outcome + " (shield shows only on wins — tie/loss rows still appear without shield)");
  console.log("LB-SEED-OK");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("LB-SEED-FAIL:", e);
  process.exit(1);
});
