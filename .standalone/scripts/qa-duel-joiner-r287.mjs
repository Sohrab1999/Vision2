// r287 — scripted opponent WITH the r112 entry-ticket flow (the r94 joiner
// predates the gate and is rejected today: «بلیتِ ورود معتبر نیست»).
// register identity → POST /api/duel-ticket → connect judge → duel:join
// {code, name, ticket} → answers every question immediately (choice=0).
// The only DB write is the QA learner profile (reported — never deleted — by
// the standing cleanup contract). Run: bun scripts/qa-duel-joiner-r287.mjs <CODE>
import { io } from "socket.io-client";

const code = process.argv[2];
if (!code) {
  console.error("joiner: missing room code");
  process.exit(1);
}
const BASE = "http://127.0.0.1:3000";
const JUDGE = "http://127.0.0.1:3003";

const res = await fetch(`${BASE}/api/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "سارا بلیت‌آزمای QA" }),
});
const cred = await res.json();
if (!res.ok || !cred.userId || !cred.secret) {
  console.error("joiner: register failed", JSON.stringify(cred));
  process.exit(1);
}
const tres = await fetch(`${BASE}/api/duel-ticket`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(cred),
});
const tjson = await tres.json();
if (!tres.ok || !tjson.ticket) {
  console.error("joiner: mint failed", tres.status, JSON.stringify(tjson));
  process.exit(1);
}

const s = io(JUDGE, { path: "/", transports: ["websocket"], timeout: 5000 });
let qi = 0;
let done = false;
s.on("connect", () => {
  s.emit("duel:join", { code, name: "سارا", ticket: tjson.ticket }, (r) => {
    if (!r?.ok) {
      console.error("joiner: join failed", r?.error);
      process.exit(1);
    }
    console.log("joiner: joined", code);
  });
});
s.on("duel:start", () => {
  const t = setInterval(() => {
    if (done) return clearInterval(t);
    if (qi < 10) {
      s.emit("duel:answer", { qi, choice: 0, ms: 3000 });
      qi += 1;
    }
  }, 320);
});
s.on("duel:end", (e) => {
  done = true;
  console.log("joiner: match ended — reason=" + e.reason + " hasReceipt=" + Boolean(e.receipt));
  s.disconnect();
  process.exit(0);
});
setTimeout(() => {
  console.error("joiner: timeout");
  process.exit(1);
}, 150_000);
