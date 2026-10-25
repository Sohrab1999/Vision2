#!/usr/bin/env bash
# Task 108 «ماندگاریِ آمارِ فکر» — single-session browser QA.
# ① duel view opens ② seeded ledger (3 quick + 2 legacy) → think chips ONLY on
#   think-bearing rows, Persian decimal labels ③ home badges: نیم‌نگاه unlocked
#   (badge-shine), برقِ فکر locked «۳ از ۷ نبردِ چابک», count chip «۱ از ۵۰»
# ④ REAL fast-paced duel (r107 pattern) → after duel-done the NEWEST localStorage
#   record carries think.seen=10 + finite avg + receiptSig — the live persistence
#   proof (persistResult wired end-to-end) ⑤ fresh record renders its chip in the
#   ledger ⑥ mobile 390 overflow 0 ⑦ console 0 ⑧ DB exact-userId cleanup.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r108-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r108-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[[^]]*ref=(e[0-9]+)\]' /tmp/r108-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. open duel view"
DREF=$(agent-browser snapshot 2>/dev/null | grep -B2 -A2 'نبرد دودنفره' | grep -oE 'ref=(e[0-9]+)' | head -1 | grep -oE 'e[0-9]+')
agent-browser click "$DREF" >/dev/null 2>&1 || true
sleep 1.5

echo "--- B. seed ledger (3 quick + 2 legacy) → chips only on think rows"
agent-browser eval '(()=>{
  const TH={avgMs:800,minMs:200,maxMs:1500,seen:10,total:10};
  const rec=(id,opp,over={})=>({id,day:"2026-10-13",outcome:"win",reason:"finished",opponent:opp,opponentColor:"rose",myScore:1100,oppScore:900,myCorrect:8,oppCorrect:4,answered:10,total:10,durationSec:80,...over});
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.userName="کاوهٔ QA";
  obj.state.duelWins=3;
  obj.state.duelHistory=[
    rec("qa1","حریفِ الف",{think:{...TH}}),
    rec("qa2","حریفِ ب",{think:{...TH,avgMs:1200,minMs:300,maxMs:2500}}),
    rec("qa3","حریفِ ج",{think:{...TH,avgMs:1500,minMs:100,maxMs:3000}}),
    rec("qa4","حریفِ د"),
    rec("qa5","حریفِ ه"),
  ];
  localStorage.setItem("vision2-study-v1",JSON.stringify(obj));
  return "seeded-5";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
DREF=$(agent-browser snapshot 2>/dev/null | grep -B2 -A2 'نبرد دودنفره' | grep -oE 'ref=(e[0-9]+)' | head -1 | grep -oE 'e[0-9]+')
agent-browser click "$DREF" >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval '(()=>{
  const chips=[...document.querySelectorAll("[aria-label^=\"فکرِ میانگین\"]")].map(c=>c.getAttribute("aria-label"));
  return JSON.stringify({chipCount:chips.length,chips});
})()'

echo "--- C. badges: نیم‌نگاه unlocked, برقِ فکر locked, chip ۱ از ۵۰"
HREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "خانه" \[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
agent-browser click "$HREF" >/dev/null 2>&1 || true
sleep 2
BREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button [^[]*نشان‌ها[^[]*\[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -n "$BREF" ]; then agent-browser click "$BREF" >/dev/null 2>&1 || true; else
  agent-browser eval 'window.dispatchEvent(new CustomEvent("open-badges")); "evt"' >/dev/null 2>&1 || true
fi
sleep 2
agent-browser eval '(()=>{
  const tile=(t)=>[...document.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));
  const glance=tile("نیم‌نگاه"); const flash=tile("برقِ فکر");
  const chip=[...document.querySelectorAll("span")].map(s=>s.textContent.trim()).find(t=>/^\S+ از ۵۰$/.test(t.replace(/\s+/g," ")));
  return JSON.stringify({
    glanceShine: !!glance && glance.className.includes("badge-shine"),
    glanceProgress: glance ? (glance.textContent.match(/۰ از ۳ نبردِ چابک|۳ از ۳ نبردِ چابک/)||["?"])[0] : null,
    flashShine: !!flash && flash.className.includes("badge-shine"),
    flashProgress: flash ? (flash.textContent.match(/۳ از ۷ نبردِ چابک/)||["?"])[0] : null,
    chip: chip||null,
    tiles: document.querySelectorAll(".badge-card").length
  });
})()'

echo "--- D. REAL fast duel → newest record carries think.seen=10 + receiptSig"
# full re-navigation: seed lives in localStorage — safe; robust against the
# view-state left behind by the badges step (C) on home
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel"' >/dev/null
sleep 1.5
# wait for the setup panel (lazy duel view chunk) — robust against chunk timing
SETUP_OK=0
for i in $(seq 1 12); do
  R=$(agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ساخت اتاق نبرد"));const grp=[...document.querySelectorAll("div[role=group]")].find(g=>g.getAttribute("aria-label")==="انتخاب سرعت هر سؤال");return JSON.stringify({setup:!!b,pace:!!grp})})()' 2>/dev/null | tr -d '"\\')
  if grep -q 'setup:true' <<<"$R" && grep -q 'pace:true' <<<"$R"; then SETUP_OK=1; break; fi
  agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "re-open"' >/dev/null 2>&1 || true
  sleep 1.5
done
if [ "$SETUP_OK" != "1" ]; then echo "SETUP-PANEL-FAIL"; exit 1; fi
# pace FIRST (chips live in the setup view), THEN create the room (r107 order)
agent-browser eval '(()=>{const grp=[...document.querySelectorAll("div[role=group]")].find(g=>g.getAttribute("aria-label")==="انتخاب سرعت هر سؤال");const fast=[...grp.querySelectorAll("button")].find(b=>b.textContent.includes("سریع"));fast.click();return "fast"})()' >/dev/null
sleep 0.5
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ساخت اتاق نبرد"));b.click();return "created"})()' >/dev/null
sleep 2
CODE=$(agent-browser eval 'document.body.textContent.match(/[A-Z2-9]{5}/)?.[0] || ""' | tr -d '"')
if [ -z "$CODE" ]; then echo "ROOM-CODE-FAIL"; exit 1; fi
echo "room: $CODE"
bun scripts/qa-duel-joiner-r94.mjs "$CODE" &
sleep 1
agent-browser eval 'window.__r108 = setInterval(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => b.className.includes("border-2") && b.offsetParent !== null && b.textContent.trim().length > 0 && b.textContent.trim().length < 120);
  if (btns.length >= 4) btns[0].click();
}, 1150); "loop-started"' >/dev/null
for i in $(seq 1 30); do
  agent-browser snapshot >/tmp/r108-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r108-done.txt; then break; fi
  sleep 2
done
agent-browser eval 'clearInterval(window.__r108); "cleared"' >/dev/null 2>&1 || true
if ! grep -q 'کارنامهٔ نبرد' /tmp/r108-done.txt; then echo "DUEL-DONE-MISSING"; exit 1; fi
grep -q 'رسیدِ امضاشدهٔ داوری' /tmp/r108-done.txt && echo "RECEIPT-CHIP-LIVE ✓" || echo "RECEIPT-MISSING"
echo "--- E. newest localStorage record: think persisted end-to-end"
E_OUT=$(agent-browser eval '(()=>{
  const raw=JSON.parse(localStorage.getItem("vision2-study-v1")||"{}");
  const top=(raw.state?.duelHistory||[])[0]||{};
  return JSON.stringify({
    id:top.id,
    hasThink:"think" in top,
    seen:top.think?.seen ?? null,
    avgMs:top.think?.avgMs ?? null,
    avgFinite: Number.isFinite(top.think?.avgMs),
    avgUnderWindow: (top.think?.avgMs??0) <= (top.think?.total??0)*8000,
    receiptSig: typeof top.receiptSig==="string" && /^[0-9a-f]{64}$/.test(top.receiptSig),
    userId: raw.state?.userId ?? null
  });
})()')
echo "$E_OUT"
R108_UID=$(echo "$E_OUT" | grep -oE 'u-[a-z0-9-]+' | head -1)

echo "--- F. fresh record renders its chip in ledger (clean re-navigation)"
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel"' >/dev/null
sleep 2
agent-browser eval '(()=>{
  const chips=[...document.querySelectorAll("[aria-label^=\"فکرِ میانگین\"]")].map(c=>c.getAttribute("aria-label"));
  return JSON.stringify({chipCount:chips.length,first:chips[0]||null});
})()'

echo "--- G. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"duel",overflow:d.scrollWidth-d.clientWidth})})()'
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- H. console errors"
agent-browser console 2>/dev/null | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true

echo "--- I. DB cleanup (exact userId of the QA duel player)"
if [ -n "$R108_UID" ]; then
R108_UID="$R108_UID" node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const uid = process.env.R108_UID;
  const a = await p.quizAttempt.deleteMany({ where: { userId: uid } });
  let pr = 0;
  try { await p.learnerProfile.delete({ where: { userId: uid } }); pr = 1; } catch { pr = 0; }
  console.log("CLEAN_OK attempts:" + a.count + " profile:" + pr);
  await p.$disconnect();
})().catch((e) => { console.error(String(e).slice(0,200)); process.exit(1); });
'
else echo "no uid captured — cleanup skipped"; fi
echo "QA-THINK-PERSIST-R108-DONE"
