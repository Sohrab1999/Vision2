#!/bin/bash
# Task 105 — single-session QA: خانوادهٔ «اعتماد» + پلِ سوکتِ محلی.
# ① skip intro ② seed: 7 verified wins vs 7 DISTINCT rivals + 1 verified loss
#   + 1 plain win (rival family honestly locked) ③ badges: گواه‌گرفته/سندِ زنده
#   shine with real ShieldCheck/Stamp SVGs + chip «۲ از ۴۸» + 48 tiles
#   ④ duel view CONNECTED via the dev socket bridge («متصل به سرور نبرد» —
#   first time in this sandbox era) ⑤ mobile 390 overflow 0 ⑥ console 0.
set -e
BASE="http://127.0.0.1:3000"
C=node_modules/.cache/r105
mkdir -p node_modules/.cache

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot > $C-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' $C-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' $C-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed: 7 verified wins (distinct rivals) + 1 verified loss + 1 plain win"
agent-browser eval '(()=>{
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const SIG="c7a1f3e2d4b5a6978877665544332211ffeeddccbbaa99887766554433221100";
  const mk=(id,outcome,opponent,sig,myScore)=>({ id, day: dayKey(0), outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore: myScore||1100, oppScore:500, myCorrect:8, oppCorrect:4, answered:10, total:10, durationSec:80, ...(sig?{receiptSig:SIG}:{}) });
  const names=["آرش","بردیا","کیان","نوید","پارسا","سام","رامین"];
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.duelHistory=[
    ...names.map((n,i)=>mk("tv"+i,"win",n,true,1000+i*10)),
    mk("tl0","loss","آرش",true,500),
    mk("tp0","win","بهرام",null,900)
  ];
  obj.state.userName="کاوهٔ QA";
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-9";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. badges: trust tiles shine, rival locked, chip ۲ از ۴۸, 48 tiles"
agent-browser eval '(()=>{
  const sec=document.querySelector(".badge-section");
  if(!sec) return JSON.stringify({secFound:false});
  const tile=(t)=>{const el=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));return el?{shine:el.className.includes("badge-shine")}:null;};
  const chip=[...sec.querySelectorAll("span")].map(s=>s.textContent).find(t=>t&&/از ۴۸/.test(t));
  return JSON.stringify({
    trust: tile("گواه‌گرفته"),
    oath: tile("سندِ زنده"),
    rival: tile("شکارچیِ رقیب"),
    chip: chip ? chip.trim() : null,
    tiles: sec.querySelectorAll(".badge-card").length
  });
})()'

echo "--- C. real ShieldCheck + Stamp SVGs with aria-hidden"
agent-browser eval '(()=>{
  const sec=document.querySelector(".badge-section");
  const tt=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes("گواه‌گرفته"));
  const to=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes("سندِ زنده"));
  const s1=tt?tt.querySelector("svg.lucide-shield-check"):null;
  const s2=to?to.querySelector("svg.lucide-stamp"):null;
  return JSON.stringify({ shieldCheck: !!s1, stamp: !!s2,
    a1: s1?s1.getAttribute("aria-hidden"):null, a2: s2?s2.getAttribute("aria-hidden"):null });
})()'

echo "--- D. duel view CONNECTED via dev socket bridge"
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel-opened"' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const t=document.body.textContent;
  return JSON.stringify({ connected: /متصل به سرور نبرد/.test(t), connecting: /در حال اتصال/.test(t), offline: /اتصال برقرار نیست/.test(t),
    ledgerIntact: /آرش/.test(t) });})()'

echo "--- E. mobile 390 overflow (duel + home)"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"duel",overflow:d.scrollWidth-d.clientWidth});})()'
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-home")); "home"' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"home",overflow:d.scrollWidth-d.clientWidth});})()'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

echo "--- F. console errors (whole session)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE"
