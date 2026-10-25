// Task 94 — live receipt probe: two scripted clients finish one duel and the
// probe asserts the duel:end payload carries a well-shaped, HMAC-valid receipt
// (verified against the on-disk judge secret via the REAL verifier), that the
// winner's own probe (name+score+correct+outcome) passes judgeReceiptShape,
// that a one-byte tamper breaks it, and that the loser's "win" claim fails.
// Writes nothing to the learner DB. Run: bun scripts/qa-duel-receipt-r94.mjs
import { io } from "socket.io-client";

const URL = "http://127.0.0.1:3003";
const OPTS = { path: "/", transports: ["websocket"], timeout: 5000 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function client(name) {
  const s = io(URL, OPTS);
  const c = { s, name, end: null };
  s.on("duel:end", (e) => (c.end = e));
  return c;
}

async function run() {
  const A = client("A");
  const B = client("B");
  await wait(300);
  const code = await new Promise((res) => A.s.emit("duel:create", { name: "آرش" }, (r) => res(r.code)));
  const join = await new Promise((res) => B.s.emit("duel:join", { code, name: "سارا" }, (r) => res(r)));
  if (!join?.ok) throw new Error("join failed");
  await wait(5200); // countdown 5s
  // both answer all questions quickly (choice=0)
  let qi = 0;
  const t = setInterval(() => {
    if (A.end && B.end) return clearInterval(t);
    if (qi < 10) {
      A.s.emit("duel:answer", { qi, choice: 0 });
      B.s.emit("duel:answer", { qi, choice: 0 });
      qi += 1;
    }
  }, 350);
  while (!(A.end && B.end)) await wait(200);
  clearInterval(t);

  const end = A.end;
  const rec = end.receipt;
  const fail = (m) => {
    console.error("RECEIPT-PROBE-FAIL:", m);
    process.exit(1);
  };
  if (!rec) fail("duel:end has NO receipt");
  if (rec.v !== 1 || !/^[0-9a-f]{64}$/.test(rec.sig) || rec.players.length !== 2) fail("malformed receipt shape");

  // dynamic import of the REAL server verifier (bun runs TS natively)
  const { verifyDuelSubmission, receiptSigMatches, readReceiptSecret } = await import(
    "../src/lib/duel-receipt-server.ts"
  );
  const { canonicalReceiptString } = await import("../src/lib/duel-receipt.ts");
  const secret = readReceiptSecret(process.cwd());
  if (!secret) fail("on-disk judge secret missing");
  if (!receiptSigMatches(rec, secret)) fail("HMAC does NOT verify against on-disk secret");
  console.log("sig verified ✓  sig=" + rec.sig.slice(0, 12) + "…  canonical=" + canonicalReceiptString(rec).slice(0, 60) + "…");

  const mine = rec.players.find((p) => p.name === "آرش");
  const other = rec.players.find((p) => p.name === "سارا");
  const outcomeFor = (sid) => (end.winner === null ? "tie" : end.winner === sid ? "win" : "loss");
  const vWin = verifyDuelSubmission(rec, { name: mine.name, score: mine.score, correct: mine.correct, outcome: outcomeFor(mine.sid) }, secret);
  const vLose = verifyDuelSubmission(rec, { name: other.name, score: other.score, correct: other.correct, outcome: outcomeFor(other.sid) }, secret);
  if (!vWin.ok) fail("winner's own claim rejected: " + vWin.reason);
  if (!vLose.ok) fail("loser's own claim rejected: " + vLose.reason);
  console.log("both players' honest claims verify ✓  winner=" + mine.name + " outcome=" + outcomeFor(mine.sid) + " loser=" + other.name + " outcome=" + outcomeFor(other.sid));

  // tamper: flip the loser's score by 1 → sig must break
  const tampered = JSON.parse(JSON.stringify(rec));
  tampered.players[1].score += 1;
  if (receiptSigMatches(tampered, secret)) fail("tampered receipt still verifies!");
  const vTam = verifyDuelSubmission(tampered, { name: other.name, score: other.players?.[1]?.score ?? tampered.players[1].score, correct: tampered.players[1].correct, outcome: "loss" }, secret);
  if (vTam.ok || vTam.reason !== "bad_sig") fail("tampered receipt verdict wrong: " + JSON.stringify(vTam));
  // liar: loser claims win
  const vLie = verifyDuelSubmission(rec, { name: other.name, score: other.score, correct: other.correct, outcome: "win" }, secret);
  if (vLie.ok || vLie.reason !== "outcome_mismatch") fail("liar claim not rejected: " + JSON.stringify(vLie));
  console.log("tamper → bad_sig ✓   liar(win on loss) → outcome_mismatch ✓");
  console.log("RECEIPT-PROBE-PASS ✓");
  A.s.disconnect();
  B.s.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error("RECEIPT-PROBE-FAIL:", e);
  process.exit(1);
});
