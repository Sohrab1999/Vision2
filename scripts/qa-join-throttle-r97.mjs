// Task 97 — probe live gate entry (SEC-5)
// ① join flood: 25 joins on one IP → 20 "room not found" + 5 throttled
// ② IP isolation: another IP is not affected
// ③ create flood: 12 successful + 13th rejected (per-kind budget is independent)
// ④ join bucket is still throttled (create flood does not clear the join budget)
// Note: the direct loopback connection is trusted — X-Real-IP is set with a fake header (isolated bucket,
// does not consume the budget of 127.0.0.1, and the normal duel-sim flow remains unaffected).
import { io } from "socket.io-client";

const DUEL = "http://127.0.0.1:3003";
const OPTS = (ip) => ({
  path: "/",
  transports: ["websocket"],
  timeout: 5000,
  extraHeaders: { "X-Real-IP": ip },
});

const ackOf = (s, ev, payload) =>
  new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("ack timeout: " + ev)), 5000);
    s.emit(ev, payload, (r) => {
      clearTimeout(t);
      res(r);
    });
  });

const connect = (ip) =>
  new Promise((res, rej) => {
    const s = io(DUEL, OPTS(ip));
    s.on("connect", () => res(s));
    s.on("connect_error", (e) => rej(new Error("connect_error: " + e.message)));
    setTimeout(() => rej(new Error("connect timeout")), 5000);
  });

const NOT_FOUND = "اتاقی با این کد پیدا نشد.";
let pass = 0, fail = 0;
const check = (name, cond) => {
  console.log((cond ? "  ✅ " : "  ❌ ") + name);
  cond ? pass++ : fail++;
};

try {
  // ① join flood — IP 203.0.113.77
  const s1 = await connect("203.0.113.77");
  let notFound = 0, throttled = 0;
  for (let i = 0; i < 25; i++) {
    const r = await ackOf(s1, "duel:join", { code: "ZZ" + String(i).padStart(3, "0"), name: "QA-مهاجم", color: "#a8a29e" });
    if (r?.ok === false && r.error === NOT_FOUND) notFound++;
    else if (r?.ok === false && /پیاپی/.test(r.error || "")) throttled++;
  }
  check(`join flood: ${notFound} «not found» (expected 20 — every attempt counts up to the limit)`, notFound === 20);
  check(`join flood: ${throttled} «repeated attempts» (expected 5)`, throttled === 5);
  const msgSample = await ackOf(s1, "duel:join", { code: "ZZ999", name: "QA-مهاجم", color: "#a8a29e" });
  check(`Persian message with Persian digits: «${msgSample?.error}»`, /[۰-۹]/.test(msgSample?.error || "") && /پیاپی/.test(msgSample?.error || ""));

  // ② IP isolation
  const s2 = await connect("198.51.100.5");
  const r2 = await ackOf(s2, "duel:join", { code: "ZZ999", name: "QA-بی‌گناه", color: "#a8a29e" });
  check("per-IP isolation: other IP sees «not found» not «throttled»", r2?.ok === false && r2.error === NOT_FOUND);

  // ③ create flood — the same IP but a separate create budget
  const creators = [];
  let createOk = 0, createThrottled = 0;
  for (let i = 0; i < 13; i++) {
    const s = await connect("203.0.113.77");
    const r = await ackOf(s, "duel:create", { name: "QA-سازنده" + i, color: "#a8a29e" });
    if (r?.ok === true) createOk++;
    else if (/بیش‌ازحد/.test(r?.error || "")) createThrottled++;
    creators.push(s);
  }
  check(`create flood: ${createOk} room created (expected 12)`, createOk === 12);
  check("create flood: 13th rejected — create budget is separate from join", createThrottled === 1);
  creators.forEach((s) => s.disconnect());

  // ④ the join bucket is still throttled
  const r4 = await ackOf(s1, "duel:join", { code: "ZZ777", name: "QA-مهاجم", color: "#a8a29e" });
  check("after the create flood, join is still throttled — budget does not fade", r4?.ok === false && /پیاپی/.test(r4?.error || ""));

  s1.disconnect();
  s2.disconnect();
} catch (e) {
  console.error("  ❌ probe exception:", e.message);
  fail++;
}

console.log(`\n=== join-throttle probe: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
