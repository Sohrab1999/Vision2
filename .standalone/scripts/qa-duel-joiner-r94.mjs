// Task 94 — scripted opponent for the single-session browser duel QA.
// Joins the room code given as argv[2] and answers every question
// immediately (choice=0) so the browser player can finish at its own pace.
// Writes nothing to the learner DB. Run: bun scripts/qa-duel-joiner-r94.mjs <CODE>
import { io } from "socket.io-client";

const code = process.argv[2];
if (!code) {
  console.error("joiner: missing room code");
  process.exit(1);
}
const s = io("http://127.0.0.1:3003", { path: "/", transports: ["websocket"], timeout: 5000 });
let qi = 0;
let done = false;
s.on("connect", () => {
  s.emit("duel:join", { code, name: "سارا" }, (r) => {
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
      s.emit("duel:answer", { qi, choice: 0 });
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
