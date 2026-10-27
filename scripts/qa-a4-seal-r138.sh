#!/bin/bash
# Task 138 QA — the A4 paper joins the week-goal contract (5th badge layer).
# Single session. 0. DB event snapshot (surgical cleanup later, r136 pattern)
# A. seed rich 7/7 week (dayHistory + goalMetDays; backup kept)
# B. open the A4 paper (open-official-report) → poll verdict done → muted line
# C. verify 7/7: label «۷ از ۷ روزِ هدف کامل» + seal (or-goal-seal, computed
#    #059669, twin tick, text «هفتهٔ کامل») + or-band wave-3 regression
# D. reseed 3/7 (activities kept → gate passes) → seal absent + label ۳ از ۷
# E. mobile 390 OV  F. console 0  G. strip seed  H. DB delta cleanup (caller)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1

echo "--- 0. DB event snapshot"
node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const d = new Date();
const day = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
(async () => {
  const rows = await db.eventDay.findMany({ where: { day, name: { in: ['week_review_generated','week_review_fallback'] } } });
  console.log('SNAPSHOT|' + JSON.stringify(rows.map(r => ({ name: r.name, count: r.count }))));
  await db.\$disconnect();
})();
" 2>&1 | tail -1

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed rich 7/7 week"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const ds = (n, c) => Object.assign({ day: k(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r138-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, userName: "آزمون‌گر", onboarded: true, streak: 5,
    goalMetDays: [0,1,2,3,4,5,6].map(k),
    dayHistory: {
      [k(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [k(1)]: ds(1, { reviews: 8 }),
      [k(2)]: ds(2, { reviews: 6, words: 2 }),
    },
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED7";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- B. open the A4 paper, poll the muted line"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-official-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
MUTED="WAIT"
for i in $(seq 1 17); do
  sleep 2
  MUTED=$(agent-browser eval '(() => {
    const m = document.querySelector(".or-teacher-muted");
    return m ? "DONE" : "WAIT";
  })()' 2>/dev/null)
  [ "$MUTED" = '"DONE"' ] && break
done
echo "VERDICT_MUTED=$MUTED"

echo "--- C. 7/7: honest label + emerald seal + band regression"
agent-browser eval '
(() => {
  const m = document.querySelector(".or-teacher-muted");
  if (!m) return "NO-MUTED";
  const txt = m.textContent || "";
  const label7 = txt.includes("۷ از ۷ روزِ هدف کامل");
  const seal = m.querySelector(".or-goal-seal");
  const sealText = seal ? (seal.textContent || "").includes("هفتهٔ کامل") : false;
  const sealBg = seal ? getComputedStyle(seal).backgroundColor : "none";
  const sealPath = seal ? (seal.querySelector("svg path") || {}).getAttribute?.("d") : null;
  const band = document.querySelector(".or-band");
  const bandBg = band ? getComputedStyle(band).backgroundImage : "none";
  const stamp = !!document.querySelector(".or-stamp");
  const paper = !!document.querySelector(".official-report");
  return JSON.stringify({
    label7, sealPresent: !!seal, sealText, sealBg,
    sealPath: sealPath || "none", bandGrad: bandBg.includes("115deg"), stamp, paper,
  });
})()' 2>/dev/null

echo "--- D. reseed 3/7 (activities kept) → seal must vanish"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, { goalMetDays: [k(0), k(1), k(2)] });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "RESEEDED3";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-official-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
MUTED3="WAIT"
for i in $(seq 1 17); do
  sleep 2
  MUTED3=$(agent-browser eval '(() => {
    const m = document.querySelector(".or-teacher-muted");
    return m ? "DONE" : "WAIT";
  })()' 2>/dev/null)
  [ "$MUTED3" = '"DONE"' ] && break
done
echo "VERDICT_MUTED_3OF7=$MUTED3"
agent-browser eval '
(() => {
  const m = document.querySelector(".or-teacher-muted");
  if (!m) return "NO-MUTED";
  const txt = m.textContent || "";
  return JSON.stringify({
    label3: txt.includes("۳ از ۷ روزِ هدف کامل"),
    sealPresent: !!m.querySelector(".or-goal-seal"),
  });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d = document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- G. strip seed"
agent-browser eval '
(() => {
  const b = localStorage.getItem("vision2-study-v1-r138-backup");
  if (b === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (b) localStorage.setItem("vision2-study-v1", b);
  localStorage.removeItem("vision2-study-v1-r138-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
