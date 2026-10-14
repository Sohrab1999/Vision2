#!/bin/bash
# Task 148 — «امضایِ دفترچه در هفته‌نامه» live probe. Single session.
# A. ledger [2W/1L this week + old tie WITH sig] → line «دفترچه: ۲ برد از ۴ نبرد — بهترین: ۱۱۰۰ — ۱ داورگواه»
# B. verified=0 → same line, NO «داورگواه» (honest silence, not a fake claim)
# C. empty ledger → no duel block at all (honest absence)
# D. mobile 390 OV   E. console 0   F. strip seed (backup-ONCE restore — r144 lesson)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

seed_eval () { # $1 = JS expression evaluating to the duelHistory array
agent-browser eval "
(() => {
  const KEY = \"vision2-study-v1\";
  const BAK = \"vision2-study-v1-r148-backup\";
  if (localStorage.getItem(BAK) === null) localStorage.setItem(BAK, localStorage.getItem(KEY) || \"__ABSENT__\");
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,\"0\")}-\${String(d.getDate()).padStart(2,\"0\")}\`; };
  const rec = (o) => Object.assign({
    id: \"qa\" + Math.random().toString(36).slice(2, 8),
    day: k(0), outcome: \"win\", reason: \"finished\",
    opponent: \"حریفِ آزمون\", opponentColor: \"rose\",
    myScore: 1000, oppScore: 800, myCorrect: 9, oppCorrect: 7,
    answered: 10, total: 10, durationSec: 80,
  }, o);
  const raw = localStorage.getItem(KEY);
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, onboarded: true, userName: \"آزمون‌گر\",
    duelHistory: $1,
  });
  localStorage.setItem(KEY, JSON.stringify(obj));
  return \"SEEDED\";
})()" 2>/dev/null
}

reopen_and_probe () {
  agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
  sleep 4
  agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "DISPATCHED";' >/dev/null 2>&1
  sleep 2
  agent-browser eval '
(() => {
  const block = document.querySelector("[aria-label^=\"نبردهای واژگانی\"]");
  if (!block) return JSON.stringify({ blockPresent: false });
  const sig = [...block.querySelectorAll("div")].find((d) => (d.textContent || "").includes("دفترچه: "));
  return JSON.stringify({
    blockPresent: true,
    hasSignature: !!sig,
    sigText: sig ? (sig.textContent || "").trim() : null,
    verifiedMentioned: (block.textContent || "").includes("داورگواه"),
  });
})()' 2>/dev/null
}

echo "--- warm-up: enter app"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO"; })()' 2>/dev/null
sleep 1

echo "--- A. verified=1: full signature line"
seed_eval '[
  rec({ day: k(0), outcome: "win", myScore: 1100 }),
  rec({ day: k(1), outcome: "win", myScore: 900 }),
  rec({ day: k(2), outcome: "loss", myScore: 500 }),
  rec({ day: k(9), outcome: "tie", myScore: 300, receiptSig: "c".repeat(64) }),
]'
reopen_and_probe

echo "--- B. verified=0: honest silence on the shield"
seed_eval '[
  rec({ day: k(0), outcome: "win", myScore: 1100 }),
  rec({ day: k(1), outcome: "win", myScore: 900 }),
  rec({ day: k(2), outcome: "loss", myScore: 500 }),
  rec({ day: k(9), outcome: "tie", myScore: 300 }),
]'
reopen_and_probe

echo "--- C. empty ledger: no block at all"
seed_eval '[]'
reopen_and_probe

echo "--- D. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- F. strip seed → restore backup (backup-ONCE)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r148-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r148-backup");
  return "STRIPPED|" + (bak === "__ABSENT__" ? "removed" : "restored");
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA148-DONE"
