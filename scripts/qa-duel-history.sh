#!/usr/bin/env bash
# Live QA for «تاریخچهٔ نبردها» (task 65) — single browser session.
# Seeds 6 duel records + W/L/T counters → duel setup panel must show summary
# (نرخ برد ۵۰٪ / برد متوالی ۲ / بهترین امتیاز ۱۲۰۰), 5 form dots, 5 rows +
# «و ۱ نبرد قدیمی‌تر» footer, forfeit badge, newest-first order → persist
# round-trip (night toggle forces a zustand write → duelHistory must survive)
# → dark probe (row bg/ink darkened, vivid chips stay vivid) → mobile 390 →
# fresh-session console check. EventDay cleanup is a separate script.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/dh65-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/dh65-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/dh65-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed: 6 records (newest-first) + counters 3W/2L/1T ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now(), D = 86400000;
  const mk = (id, day, outcome, reason, opponent, opponentColor, myScore, oppScore, myCorrect, oppCorrect, durationSec) =>
    ({ id, day, outcome, reason, opponent, opponentColor, myScore, oppScore, myCorrect, oppCorrect, answered: 10, total: 10, durationSec });
  const dayOf = (ms) => { const d = new Date(ms); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
  obj.state.duelHistory = [
    mk("d"+(now-3600000),      dayOf(now-3600000), "win",  "finished", "سینا", "rose",   1200, 950,  8, 6, 95),
    mk("d"+(now-D-3600000),    dayOf(now-D),       "win",  "finished", "آرش",  "sky",    1100, 800,  7, 5, 120),
    mk("d"+(now-3*D),          dayOf(now-3*D),     "tie",  "finished", "مریم", "amber",  1000, 1000, 6, 6, 88),
    mk("d"+(now-5*D),          dayOf(now-5*D),     "loss", "finished", "سینا", "rose",   700,  1300, 4, 8, 100),
    mk("d"+(now-8*D),          dayOf(now-8*D),     "win",  "forfeit",  "آرش",  "sky",    900,  0,    6, 0, 45),
    mk("d"+(now-12*D),         dayOf(now-12*D),    "loss", "finished", "مریم", "amber",  600,  1400, 3, 8, 130)
  ];
  obj.state.duelWins = 3; obj.state.duelLosses = 2; obj.state.duelTies = 1;
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-6";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

# ---- navigate: home → نبرد دودنفره ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد دودنفره")); if(b){b.click();return "nav-ok";} return "nav-miss";})()' >/dev/null
sleep 2

echo "--- HISTORY PANEL (summary + form + rows) ---"
agent-browser eval '(()=>JSON.stringify((()=>{
  const sec = document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]");
  if (!sec) return { panel: false };
  const dots = [...sec.querySelectorAll("span[title]")].map(s=>s.getAttribute("title"));
  const stats = [...sec.querySelectorAll(".grid > div")].map(d=>{
    const v = d.querySelector("div.text-\\[15px\\]"), l = d.querySelector("div.text-\\[10\\.5px\\]");
    return (l?l.textContent:"?")+":"+(v?v.textContent:"?");
  });
  const rows = [...sec.querySelectorAll(".space-y-2 > div")];
  const first = rows[0];
  const forfeitRow = rows.find(r=>r.textContent.includes("ضربهٔ فنی"));
  const footer = [...sec.querySelectorAll("p")].map(p=>p.textContent).find(t=>t.includes("قدیمی‌تر"));
  return {
    panel: true,
    heading: sec.querySelector("h2")?.textContent,
    stats, dots,
    rowCount: rows.length,
    firstOpponent: first?.querySelector(".truncate")?.textContent,
    firstScore: first?.querySelector("[dir=ltr]")?.textContent,
    firstMeta: first?.querySelector(".text-\\[11px\\]")?.textContent,
    firstAgo: first?.querySelector("[dir=ltr] + div, div.shrink-0.text-left > div:last-child")?.textContent,
    forfeitHasBadge: !!forfeitRow,
    footer: footer || null
  };
})()))'

echo "--- SCORE ORDER (newest-first across rows) ---"
agent-browser eval '(()=>JSON.stringify([...document.querySelectorAll("section[aria-label=\"تاریخچهٔ نبردها\"] .space-y-2 > div")].map(r=>({
  opp: r.querySelector(".truncate")?.textContent,
  score: r.querySelector("[dir=ltr]")?.textContent
}))))'

echo "--- PERSIST ROUND-TRIP (night toggle forces zustand write) ---"
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label=\"حالت شب\"]")||[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "dark-ok";} return "dark-miss";})()' >/dev/null
sleep 1.5
agent-browser eval '(()=>{
  const s = JSON.parse(localStorage.getItem("vision2-study-v1")).state;
  const sec = document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"]");
  return JSON.stringify({
    persistedRecords: Array.isArray(s.duelHistory) ? s.duelHistory.length : null,
    persistedNewest: s.duelHistory?.[0]?.opponent,
    counters: { w: s.duelWins, l: s.duelLosses, t: s.duelTies }
  });
})()'

echo "--- DARK PROBE (row surface + ink + chip vivid) ---"
agent-browser eval '(()=>{
  const row = document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"] .space-y-2 > div");
  if (!row) return JSON.stringify({ row: false });
  const cs = getComputedStyle(row);
  const chip = row.querySelector("span.text-white");
  const stat = document.querySelector("section[aria-label=\"تاریخچهٔ نبردها\"] .grid > div");
  const lum = (rgb)=>{ const m = rgb.match(/\d+/g).map(Number); return (0.2126*m[0]+0.7152*m[1]+0.0722*m[2])/255; };
  return JSON.stringify({
    rowBg: cs.backgroundColor, rowBgLum: +lum(cs.backgroundColor).toFixed(3),
    rowInk: getComputedStyle(row.querySelector(".truncate")).color,
    chipBg: chip ? getComputedStyle(chip).backgroundColor : null,
    statBorder: stat ? getComputedStyle(stat).borderTopColor : null,
    bodyBg: getComputedStyle(document.body).backgroundColor
  });
})()'
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label=\"حالت شب\"]")||[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "light-ok";} return "light-miss";})()' >/dev/null
sleep 1

echo "--- MOBILE 390 ---"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد دودنفره")); if(b){b.click();return "nav-ok";} return "already-there";})()' >/dev/null
sleep 1
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth})'
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- FRESH SESSION CONSOLE ---"
agent-browser eval '(()=>{localStorage.clear(); return "cleared";})()' >/dev/null
agent-browser close >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser errors 2>&1 | tail -3
agent-browser close >/dev/null 2>&1
echo "QA-DONE"
