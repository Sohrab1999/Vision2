// Task 94 — API gate probe: plays ONE real duel on :3003, then drives the
// REAL /api/stats on :3000 with a throwaway QA profile through the four
// contract cases (missing → 403, honest → 200, replay → 403, tampered → 403).
// Cleanup deletes the QA profile + the rows it created. NEVER touches real
// learner rows. Run: bun scripts/qa-duel-api-r94.mjs
import { io } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const NEXT = "http://127.0.0.1:3000";
const DUEL = "http://127.0.0.1:3003";
const OPTS = { path: "/", transports: ["websocket"], timeout: 5000 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const db = new PrismaClient();
const TAG = `qareceipt${Date.now() % 100000}`;

const fail = async (m) => {
  console.error("API-PROBE-FAIL:", m);
  await db.$disconnect();
  process.exit(1);
};

async function playDuel() {
  const mk = (name) => {
    const s = io(DUEL, OPTS);
    const c = { s, name, end: null };
    s.on("duel:end", (e) => (c.end = e));
    return c;
  };
  const A = mk("آرش");
  const B = mk("سارا");
  await wait(300);
  const code = await new Promise((res) => A.s.emit("duel:create", { name: "آرش" }, (r) => res(r.code)));
  const join = await new Promise((res) => B.s.emit("duel:join", { code, name: "سارا" }, (r) => res(r)));
  if (!join?.ok) throw new Error("join failed");
  await wait(5200);
  let qi = 0;
  const t = setInterval(() => {
    if (qi < 10) {
      A.s.emit("duel:answer", { qi, choice: 0 });
      B.s.emit("duel:answer", { qi, choice: 0 });
      qi += 1;
    } else if (A.end && B.end) clearInterval(t);
  }, 350);
  while (!(A.end && B.end)) await wait(200);
  clearInterval(t);
  A.s.disconnect();
  B.s.disconnect();
  return { end: A.end };
}

async function main() {
  // 1) throwaway signed identity
  const reg = await fetch(`${NEXT}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: TAG }),
  });
  if (!reg.ok) await fail("register failed: " + reg.status);
  const ident = await reg.json();
  if (!ident?.userId || !ident?.secret) await fail("register payload incomplete");

  // 2) real duel → receipt
  const { end } = await playDuel();
  const rec = end.receipt;
  if (!rec) await fail("no receipt in duel:end");
  const mine = rec.players.find((p) => p.name === "آرش");
  const honest = {
    userId: ident.userId,
    secret: ident.secret,
    lesson: 0,
    category: "duel",
    total: 10,
    correct: mine.correct,
    score: mine.score,
    outcome: end.winner === null ? "tie" : end.winner === mine.sid ? "win" : "loss",
    duelName: "آرش",
    receipt: rec,
  };
  console.log("match ended: outcome=" + honest.outcome + " winner=" + (end.winner === mine.sid ? "آرش" : end.winner === null ? "—" : "سارا"));

  const post = async (body) =>
    fetch(`${NEXT}/api/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // 3) duel WITHOUT receipt → 403
  const { receipt: _r, ...without } = honest;
  const r1 = await post(without);
  if (r1.status !== 403) await fail("missing receipt should 403, got " + r1.status);
  console.log("missing receipt → 403 ✓");

  // 4) honest receipt → 200
  const r2 = await post(honest);
  if (r2.status !== 200) await fail("honest receipt should 200, got " + r2.status + " " + JSON.stringify(await r2.json()));
  console.log("honest receipt → 200 ✓");

  // 5) replay same receipt → 403
  const r3 = await post(honest);
  if (r3.status !== 403) await fail("replay should 403, got " + r3.status);
  const j3 = await r3.json();
  if (!String(j3.error || "").includes("قبلاً ثبت")) await fail("replay message wrong: " + JSON.stringify(j3));
  console.log("replay → 403 «قبلاً ثبت» ✓");

  // 6) tampered receipt → 403
  const tampered = JSON.parse(JSON.stringify(rec));
  tampered.players[0].score += 7;
  const r4 = await post({ ...honest, receipt: tampered });
  if (r4.status !== 403) await fail("tampered should 403, got " + r4.status);
  console.log("tampered → 403 ✓");

  // 7) DB truth: exactly ONE duel row for the QA user, carrying the sig
  const rows = await db.quizAttempt.findMany({ where: { userId: ident.userId } });
  if (rows.length !== 1 || rows[0].receiptSig !== rec.sig) await fail("DB row wrong: " + JSON.stringify(rows));
  console.log("DB row receiptSig stored ✓");

  // 8) cleanup — QA profile + its row(s) gone, real learners untouched
  await db.quizAttempt.deleteMany({ where: { userId: ident.userId } });
  await db.learnerProfile.deleteMany({ where: { userId: ident.userId } });
  const left = await db.quizAttempt.count({ where: { userId: ident.userId } });
  if (left !== 0) await fail("cleanup incomplete");
  console.log("QA rows + profile cleaned ✓");
  console.log("API-PROBE-PASS ✓");
  await db.$disconnect();
  process.exit(0);
}

main().catch((e) => fail(String(e)));
