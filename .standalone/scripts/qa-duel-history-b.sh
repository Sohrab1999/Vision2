#!/usr/bin/env bash
# Re-run of the two malformed probes from qa-duel-history.sh (outer arrow was
# never invoked → agent-browser printed the function repr {}). Session re-seeded
# the same way, then panel + score-order probes with correct () invocation.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/dh65b-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/dh65b-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/dh65b-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now(), D = 86400000;
  const mk = (id, day, outcome, reason, opponent, opponentColor, myScore, oppScore, myCorrect, oppCorrect, durationSec) =>
    ({ id, day, outcome, reason, opponent, opponentColor, myScore, oppScore, myCorrect, oppCorrect, answered: 10, total: 10, durationSec });
  const dayOf = (ms) => { const d = new Date(ms); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
  obj.state.duelHistory = [
    mk("d"+(now-3600000),   dayOf(now-3600000), "win",  "finished", "سینا", "rose",  1200, 950,  8, 6, 95),
    mk("d"+(now-D),         dayOf(now-D),       "win",  "finished", "آرش",  "sky",   1100, 800,  7, 5, 120),
    mk("d"+(now-3*D),       dayOf(now-3*D),     "tie",  "finished", "مریم", "amber", 1000, 1000, 6, 6, 88),
    mk("d"+(now-5*D),       dayOf(now-5*D),     "loss", "finished", "سینا", "rose",  700,  1300, 4, 8, 100),
    mk("d"+(now-8*D),       dayOf(now-8*D),     "win",  "forfeit",  "آرش",  "sky",   900,  0,    6, 0, 45),
    mk("d"+(now-12*D),      dayOf(now-12*D),    "loss", "finished", "مریم", "amber", 600,  1400, 3, 8, 130)
  ];
  obj.state.duelWins = 3; obj.state.duelLosses = 2; obj.state.duelTies = 1;
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-6";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد دودنفره")); if(b){b.click();return "nav-ok";} return "nav-miss";})()' >/dev/null
sleep 2

echo "--- HISTORY PANEL ---"
agent-browser eval '(()=>{
  const sec = document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]");
  if (!sec) return JSON.stringify({ panel: false });
  const dots = [...sec.querySelectorAll("span[title]")].map(s=>s.getAttribute("title"));
  const stats = [...sec.querySelectorAll(".grid > div")].map(d=>{
    const v = d.children[1], l = d.children[2];
    return (l?l.textContent:"?")+":"+(v?v.textContent:"?");
  });
  const rows = [...sec.querySelectorAll(".space-y-2 > div")];
  const first = rows[0];
  const footer = [...sec.querySelectorAll("p")].map(p=>p.textContent).find(t=>t.includes("قدیمی‌تر"));
  return JSON.stringify({
    panel: true,
    heading: sec.querySelector("h2") ? sec.querySelector("h2").textContent.trim() : null,
    stats, dots,
    rowCount: rows.length,
    firstOpponent: first.querySelector(".truncate") ? first.querySelector(".truncate").textContent : null,
    firstScore: first.querySelector("[dir=ltr]") ? first.querySelector("[dir=ltr]").textContent : null,
    firstMeta: first.querySelector("div.min-w-0 > div:last-child") ? first.querySelector("div.min-w-0 > div:last-child").textContent : null,
    forfeitBadge: rows.some(r=>r.textContent.includes("ضربهٔ فنی")),
    footer: footer || null
  });
})()'

echo "--- SCORE ORDER (newest-first) ---"
agent-browser eval '(()=>JSON.stringify([...document.querySelectorAll("section[aria-label=\"تاریخچهٔ نبردها\"] .space-y-2 > div")].map(r=>({
  opp: r.querySelector(".truncate") ? r.querySelector(".truncate").textContent : null,
  score: r.querySelector("[dir=ltr]") ? r.querySelector("[dir=ltr]").textContent : null
}))))()'

echo "--- EMPTY STATE (no history → no panel) ---"
agent-browser eval '(()=>{const o=JSON.parse(localStorage.getItem("vision2-study-v1")); o.state.duelHistory=[]; localStorage.setItem("vision2-study-v1", JSON.stringify(o)); return "emptied";})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد دودنفره")); if(b){b.click();return "nav-ok";} return "nav-miss";})()' >/dev/null
sleep 1.5
agent-browser eval '(()=>JSON.stringify({
  panelAbsent: !document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]"),
  heroCountersStillThere: [...document.querySelectorAll("span")].some(s=>s.textContent.includes("بردها:"))
}))()'

agent-browser close >/dev/null 2>&1
echo "QA-B-DONE"
