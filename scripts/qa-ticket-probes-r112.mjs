// Task 112 «بلیتِ ورود» — socket-level probes for the entry-ticket gate (one process):
//   A) no ticket rejected        B) garbage ticket rejected
//   C) real identity → /api/duel-ticket → duel:create OK
//   C2) same token replayed on a new socket → rejected
//   J) fresh mint → duel:join <created code> → two players → leave (before countdown)
// Zero quiz rows; the only DB write is the QA learner profile (deleted in cleanup).
// Writes the QA creds to node_modules/.cache/r112-creds.json for the browser seed + cleanup.
// Run: bun scripts/qa-ticket-probes-r112.mjs
import { io } from "socket.io-client";
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "http://127.0.0.1:3000";
const JUDGE = "http://127.0.0.1:3003";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect() {
  const s = io(JUDGE, { path: "/", transports: ["websocket"], timeout: 5000, forceNew: true });
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("connect timeout")), 8000);
    s.on("connect", () => { clearTimeout(t); resolve(s); });
    s.on("connect_error", (e) => { clearTimeout(t); reject(e); });
  });
}

const emitAck = (s, event, payload) =>
  new Promise((resolve) => s.emit(event, payload, (res) => resolve(res)));

async function registerIdentity() {
  const res = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "بلیت‌آزمای QA" }),
  });
  const json = await res.json();
  if (!res.ok || !json.userId || !json.secret) throw new Error("register failed: " + JSON.stringify(json));
  return { userId: json.userId, secret: json.secret };
}

async function mintTicket(cred) {
  const res = await fetch(`${BASE}/api/duel-ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cred),
  });
  const json = await res.json();
  if (!res.ok || !json.ticket) throw new Error("mint failed " + res.status + ": " + JSON.stringify(json));
  return json.ticket;
}

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"} — ${name}${extra ? " | " + extra : ""}`);
  if (!cond) failures++;
};

// A — no ticket at all
const sA = await connect();
const ackA = await emitAck(sA, "duel:create", { name: "بی‌بلیت", color: "#a8a29e" });
check("A: ticketless create rejected with ticketError flag", ackA?.ok === false && ackA?.ticketError === true, JSON.stringify(ackA?.error ?? ""));
check("A: Persian message mentions the ticket", /بلیت/.test(String(ackA?.error ?? "")));
sA.disconnect();

// B — garbage ticket
const sB = await connect();
const ackB = await emitAck(sB, "duel:create", { name: "دغل‌باز", color: "#a8a29e", ticket: "garbage.sig" });
check("B: garbage ticket rejected", ackB?.ok === false && ackB?.ticketError === true, JSON.stringify(ackB?.error ?? ""));
sB.disconnect();

// C — real identity → mint → create
const cred = await registerIdentity();
mkdirSync("node_modules/.cache", { recursive: true });
writeFileSync("node_modules/.cache/r112-creds.json", JSON.stringify(cred));
const ticket1 = await mintTicket(cred);
check("C: minted ticket is a dotted token", typeof ticket1 === "string" && ticket1.includes("."), `${ticket1.length} chars`);
const sC = await connect();
const ackC = await emitAck(sC, "duel:create", { name: "بلیت‌آزمای داور", color: "#a8a29e", ticket: ticket1 });
check("C: valid ticket creates the room", ackC?.ok === true && typeof ackC?.code === "string", "code=" + (ackC?.code ?? "-"));
const createdCode = ackC?.code ?? null;

// C2 — same token again on a fresh socket (replay)
const sC2 = await connect();
const ackC2 = await emitAck(sC2, "duel:create", { name: "بازیِ دوباره", color: "#a8a29e", ticket: ticket1 });
check("C2: replayed token rejected (one-time nonce)", ackC2?.ok === false && ackC2?.ticketError === true, JSON.stringify(ackC2?.error ?? ""));
sC2.disconnect();

// J — fresh mint → join the created room → two players → leave before countdown
const ticket3 = await mintTicket(cred);
check("J: second mint yields a DIFFERENT token", ticket3 !== ticket1);
const sJ = await connect();
const ackJ = await emitAck(sJ, "duel:join", { code: createdCode, name: "پیوستهٔ بلیتی", color: "#a8a29e", ticket: ticket3 });
check("J: valid ticket joins the room", ackJ?.ok === true, JSON.stringify(ackJ?.error ?? ""));
const players = ackJ?.state?.players?.length ?? 0;
check("J: room now has two players", players === 2, `players=${players}`);
sJ.emit("duel:leave");
await sleep(400);
sJ.disconnect();
sC.disconnect();

console.log(failures === 0 ? "PROBES-ALL-PASS" : `PROBES-FAILED:${failures}`);
process.exit(failures > 0 ? 1 : 0);
