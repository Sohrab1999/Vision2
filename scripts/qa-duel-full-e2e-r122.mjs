// Task 122 — live full-duel E2E over the EXTRACTED wiring (room-manager.ts):
// register (QA identity) → mint 2 tickets → create → join → countdown →
// 10 answers each → duel:end with a REAL HMAC receipt → rematch both votes →
// fresh countdown. Zero /api/stats calls (no quiz rows); only DB write is the
// QA profile (creds overwrite node_modules/.cache/r112-creds.json for cleanup).
// Run: bun scripts/qa-duel-full-e2e-r122.mjs
import { io } from "socket.io-client";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:3000";
const JUDGE = "http://127.0.0.1:3003";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (m) => { console.error(`FAIL — ${m}`); process.exit(1); };

function connect() {
  const s = io(JUDGE, { path: "/", transports: ["websocket"], timeout: 5000, forceNew: true });
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("connect timeout")), 8000);
    s.on("connect", () => { clearTimeout(t); resolve(s); });
    s.on("connect_error", (e) => { clearTimeout(t); reject(e); });
  });
}
const emitAck = (s, event, payload) => new Promise((res) => s.emit(event, payload, (r) => res(r)));

async function registerIdentity() {
  const res = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "نبردکاملِ QA" }),
  });
  const json = await res.json();
  if (!res.ok || !json.userId || !json.secret) fail("register: " + JSON.stringify(json));
  return json;
}
async function mintTicket(cred) {
  const res = await fetch(`${BASE}/api/duel-ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cred),
  });
  const json = await res.json();
  if (!res.ok || !json.ticket) fail("mint: " + JSON.stringify(json));
  return json.ticket;
}

const s1 = await connect();
const s2 = await connect();

const cred = await registerIdentity();
mkdirSync("node_modules/.cache", { recursive: true });
writeFileSync("node_modules/.cache/r112-creds.json", JSON.stringify(cred));
const t1 = await mintTicket(cred);
const t2 = await mintTicket(cred);

const created = await emitAck(s1, "duel:create", { ticket: t1, name: "یکی", color: "#112233" });
if (!created?.ok) fail("create: " + JSON.stringify(created));
console.log(`PASS — create | code=${created.code} perQMs=${created.state?.perQMs}`);

const joined = await emitAck(s2, "duel:join", { code: created.code, ticket: t2, name: "دیگری", color: "#224466" });
if (!joined?.ok) fail("join: " + JSON.stringify(joined));
console.log(`PASS — join | players=${joined.state?.players?.length}`);

let start = null, ended = null;
s1.on("duel:start", (p) => { start = p; });
s1.on("duel:end", (p) => { ended = p; });

await sleep(5600); // countdown 5s → start
if (!start) fail("no duel:start after countdown");
if (start.total !== 10 || !Array.isArray(start.questions) || start.questions.length !== 10)
  fail("bad duel:start payload: " + JSON.stringify(start).slice(0, 120));
console.log(`PASS — duel:start | total=${start.total} firstPerm=${JSON.stringify(start.questions[0].perm)}`);

// هر دو همهٔ ۱۰ را می‌پرسند (گزینهٔ ۰ — درست/غلط فرقی ندارد؛ داوریِ سرور است)
const answers = [];
for (let qi = 0; qi < 10; qi++) {
  s1.emit("duel:answer", { qi, choice: 0, ms: 0 });
  s2.emit("duel:answer", { qi, choice: 1, ms: 999 });
  answers.push(qi);
}
for (let i = 0; i < 40 && !ended; i++) await sleep(100);
if (!ended) fail("no duel:end after 10 answers");
if (ended.reason !== "finished") fail("end reason: " + ended.reason);
// receipt = DuelReceiptِ واقعی (شیءِ امضاشده — sig هگزِ ۶۴نویسه)
const sig = ended.receipt?.sig ?? (typeof ended.receipt === "string" ? ended.receipt : null);
if (typeof sig !== "string" || !/^[0-9a-f]{64}$/.test(sig)) fail("bad receipt: " + JSON.stringify(ended.receipt).slice(0, 120));
const thinkKeys = Object.keys(ended.think ?? {});
if (thinkKeys.length !== 2) fail("think keys: " + thinkKeys.join(","));
console.log(`PASS — duel:end | winner=${ended.winner} scores=${JSON.stringify(ended.players.map((p) => p.score))} sig=${sig.slice(0, 16)}…`);

// زمانِ شروعِ نخستین بازی پیش از رأیِ دوباره ذخیره می‌شود — هر دو شنونده با رأیِ دوم صدا زده می‌شوند
const firstStartedAt = start.startedAt;

// نبردِ دوباره: دو رأی → شمارشِ ۳ثانیه‌ای → دکِ نو
let rematchStart = null;
s1.on("duel:start", (p) => { rematchStart = p; });
s1.emit("duel:rematch");
await sleep(150);
s2.emit("duel:rematch");
await sleep(3400);
if (!rematchStart || rematchStart.startedAt === firstStartedAt) fail("rematch did not restart");
console.log(`PASS — rematch | fresh deck startedAt=${rematchStart.startedAt}`);

s1.disconnect(); s2.disconnect();
console.log("FULL-DUEL-E2E-ALL-PASS");
process.exit(0);
