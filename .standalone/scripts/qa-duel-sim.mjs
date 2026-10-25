/* QA-only duel simulation: two scripted socket clients play a full duel
 * against the live :3003 service to verify the server-authoritative scoring
 * changes end-to-end (create → join → countdown → start → 10 answers → end →
 * rematch). Writes nothing to the learner DB (never calls /api/stats).
 * Run: bun scripts/qa-duel-sim.mjs
 */
import { io } from "socket.io-client";

const URL = "http://127.0.0.1:3003";
const OPTS = { path: "/", transports: ["websocket"], timeout: 5000 };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function client(name) {
  const s = io(URL, OPTS);
  const c = { s, name, events: [], end: null, progress: [] };
  s.on("duel:progress", (p) => c.progress.push(p));
  s.on("duel:end", (e) => {
    c.end = e;
    c.events.push("end");
  });
  s.on("connect_error", (e) => console.error(`[${name}] connect_error:`, e.message));
  return c;
}

function playAll(c, total, delayMs, cheatMs) {
  // answers every question sequentially; choice=0; sends reported ms (ignored by server now)
  let qi = 0;
  const timer = setInterval(async () => {
    if (c.end || qi >= total) return clearInterval(timer);
    c.s.emit("duel:answer", { qi, choice: 0, ms: cheatMs });
    qi += 1;
  }, delayMs);
  return () => clearInterval(timer);
}

async function runDuel(label, aDelay, bDelay) {
  const A = client("A-" + label);
  const B = client("B-" + label);
  await wait(300);

  const code = await new Promise((res) => A.s.emit("duel:create", { name: "شبیه‌ساز آ" }, (r) => res(r.code)));
  if (!code) throw new Error("create failed");
  const joinRes = await new Promise((res) => B.s.emit("duel:join", { code, name: "شبیه‌ساز ب" }, (r) => res(r)));
  if (!joinRes?.ok) throw new Error("join failed: " + JSON.stringify(joinRes));
  console.log(`[${label}] room ${code} — countdown…`);

  const start = await Promise.race([
    new Promise((res) => {
      const h = (p) => {
        A.s.off("duel:start", h);
        res(p);
      };
      A.s.on("duel:start", h);
    }),
    wait(12000).then(() => null),
  ]);
  if (!start) throw new Error("duel:start never arrived");
  console.log(`[${label}] started: ${start.total} questions, perQMs=${start.perQMs}`);

  const stopA = playAll(A, start.total, aDelay, 0); // A cheats with ms:0 (must be ignored)
  const stopB = playAll(B, start.total, bDelay, start.perQMs); // B reports honest max ms

  await Promise.race([
    wait(1000).then(async () => {
      while (!A.end) await wait(200);
    }),
    wait(20000).then(() => null),
  ]);
  stopA();
  stopB();

  if (!A.end) throw new Error("duel:end never arrived");
  const mine = A.end.players.find((p) => p.name === "شبیه‌ساز آ");
  const other = A.end.players.find((p) => p.name === "شبیه‌ساز ب");
  const ok =
    A.end.total === start.total &&
    mine && other &&
    Number.isInteger(mine.score) && Number.isInteger(other.score) &&
    mine.score >= 0 && mine.score <= start.total * 200 &&
    other.score >= 0 && other.score <= start.total * 200;
  console.log(`[${label}] end reason=${A.end.reason} winner=${A.end.winner ? "A/B" : "tie"} :: A score=${mine.score} correct=${mine.correct} | B score=${other.score} correct=${other.correct} ${ok ? "✓" : "✗ BOUNDS FAIL"}`);

  // rematch round-trip
  A.s.emit("duel:rematch");
  B.s.emit("duel:rematch");
  const rematchStarted = await Promise.race([
    new Promise((res) => {
      const h = (p) => {
        A.s.off("duel:start", h);
        res(true);
      };
      A.s.on("duel:start", h);
    }),
    wait(8000).then(() => false),
  ]);
  console.log(`[${label}] rematch started: ${rematchStarted ? "✓" : "✗"}`);
  A.s.disconnect();
  B.s.disconnect();
  return { ok, rematchStarted };
}

const r1 = await runDuel("fast-vs-slow", 250, 1500); // A سریع (با ms تقلبی صفر) — باید برندهٔ امتیازی شود
const r2 = await runDuel("slow-vs-fast", 1500, 250); // جای A و B عوض
const pass = r1.ok && r1.rematchStarted && r2.ok && r2.rematchStarted;
console.log(pass ? "ALL-DUEL-SIM-PASS ✓" : "DUEL-SIM-FAIL ✗");
process.exit(pass ? 0 : 1);
