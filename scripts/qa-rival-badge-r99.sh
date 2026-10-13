#!/usr/bin/env bash
# Task 99 — single-session QA: rival badges (battle family) live on the home panel.
# ① seed ledger: 3 wins vs «امیرمحمد» (+1 win / 1 loss vs others)
# ② badges panel: both rival tiles shine (lock-only contract hides progress on unlocked)
#    + chip contains «از ۴۴» (registry 42 → 44)
# ③ icon guard live: Swords SVG renders inside the hunter tile
# ④ duel ledger still intact (Task 98): header pill + rows
# ⑤ mobile 390 overflow 0 ⑥ console clean. Local-only seed — no server rows.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r99-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r99-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r99-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed ledger: 3 wins vs one rival + 2 scattered"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  const dayKey=(n)=>{const d=new Date(now-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,opponent)=>({ id, day:dayKey(1), outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore:1200, oppScore:950, myCorrect:8, oppCorrect:6, answered:10, total:10, durationSec:95 });
  obj.state.duelWins=4; obj.state.duelLosses=1; obj.state.duelTies=0;
  obj.state.duelHistory=[
    mk("r1","win","امیرمحمد"),
    mk("r2","win","امیرمحمد"),
    mk("r3","loss","سینا"),
    mk("r4","win","سینا"),
    mk("r5","win","امیر محمد")
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-rival";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. badges panel: rival tiles + registry chip"
agent-browser eval '(()=>{
  const sec=document.querySelector(".badge-section");
  if(!sec) return JSON.stringify({secFound:false});
  const tile=(t)=>{const el=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));return el?{shine:el.className.includes("badge-shine"),cls:el.className.slice(0,60)}:null;};
  const chip=[...sec.querySelectorAll("span")].map(s=>s.textContent).find(t=>t&&/از ۴۴/.test(t));
  return JSON.stringify({
    hunter: tile("شکارچیِ رقیب"),
    nightmare: tile("کابوسِ رقیب"),
    chip: chip ? chip.trim() : null,
    tiles: sec.querySelectorAll(".badge-card").length
  });
})()'

echo "--- C. Swords SVG live inside hunter tile"
agent-browser eval '(()=>{
  const sec=document.querySelector(".badge-section");
  const tile=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes("شکارچیِ رقیب"));
  const svg=tile?tile.querySelector("svg.lucide-swords"):null;
  return JSON.stringify({ swordsSvg: !!svg, ariaHidden: svg?svg.getAttribute("aria-hidden"):null });
})()'

echo "--- D. duel ledger intact (open-duel event)"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 3
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  if(!panel) return JSON.stringify({panel:false});
  const pill=[...panel.querySelectorAll("h2 span")].map(s=>s.textContent).find(t=>t&&/نبرد$/.test(t.trim()));
  const rows=panel.querySelectorAll(".space-y-2 > div").length;
  const amirRows=[...panel.querySelectorAll(".space-y-2 > div")].filter(r=>/امیر/.test(r.textContent||"")).length;
  return JSON.stringify({ panel:true, pill: pill?pill.trim():null, rows, amirRows });
})()'

echo "--- E. mobile 390 overflow (home)"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-home")); return "home"; })()' >/dev/null 2>&1
sleep 2
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- F. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-R99-DONE"
