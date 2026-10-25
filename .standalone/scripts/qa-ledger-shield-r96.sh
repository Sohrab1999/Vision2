#!/usr/bin/env bash
# Task 96 — single-session QA: ledger shield on «آخرین نبردها» rows.
# ① seed duelHistory (1 receipt-carrying win + 1 legacy row) → duel view
# ② assert: exactly 1 emerald shield chip (title + aria), footer «۱ از ۲»
# ③ legacy-only ledger → 0 shields (covered by component tests, skipped live)
# ④ mobile 390 overflow 0 ⑤ console clean. Local-only seed — no server rows.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r96-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r96-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r96-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed duelHistory: 1 receipt win + 1 legacy row"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  const dayKey=(n)=>{const d=new Date(now-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  obj.state.duelWins=1; obj.state.duelLosses=0; obj.state.duelTies=0;
  obj.state.duelHistory=[
    { id:"d"+now, day:dayKey(0), outcome:"win", reason:"finished", opponent:"داورگواه‌QA",
      opponentColor:"rose", myScore:1200, oppScore:950, myCorrect:8, oppCorrect:6,
      answered:10, total:10, durationSec:95, receiptSig:"a".repeat(64) },
    { id:"d"+(now-60000), day:dayKey(1), outcome:"loss", reason:"finished", opponent:"سینا",
      opponentColor:"emerald", myScore:700, oppScore:1150, myCorrect:6, oppCorrect:8,
      answered:9, total:10, durationSec:120 }
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-ledger";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

echo "--- B. open duel view via shell event"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 3

echo "--- C. ledger shield assertions"
agent-browser eval '(()=>{
  const chips=[...document.querySelectorAll("span[role=img][aria-label=داورگواه]")];
  const foot=[...document.querySelectorAll("p")].find(p=>/نبردِ دفترچه با رسیدِ امضاشدهٔ داور/.test(p.textContent||""));
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const rows=panel? panel.querySelectorAll(".space-y-2 > div").length : 0;
  return JSON.stringify({
    panel: !!panel, rows,
    shields: chips.length,
    title: chips[0]? chips[0].title.slice(0,24) : null,
    footer: foot? foot.textContent.replace(/\s+/g," ").trim() : null
  });
})()'

echo "--- D. emerald family live probe (bg + text classes on chip)"
agent-browser eval '(()=>{
  const chip=document.querySelector("span[role=img][aria-label=داورگواه]");
  if(!chip) return "no-chip";
  return JSON.stringify({ cls: chip.className.includes("emerald-50/60") && chip.className.includes("text-emerald-700") ? "family-ok" : chip.className });
})()'

echo "--- E. mobile 390 overflow (duel view)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- F. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-R96-DONE"
