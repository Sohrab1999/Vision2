#!/usr/bin/env bash
# Task 107 «ریتمِ نبرد» — single-session browser QA of the lobby pace setting.
# ① three pace chips (سریع/معمول/آرام) render, default معمول pressed
# ② click سریع → pressed flips ③ create room → waiting chip shows «۸ ثانیه»
# ④ scripted joiner → FULL fast-paced match (10 answers, 8s/question)
# ⑤ duel-done: receipt chip + think block intact (r106 parity)
# ⑥ timer ring never exceeds ۸ during play (client obeys server pace)
# ⑦ mobile 390 overflow 0 ⑧ console clean. BASE=:3000 (dev bridge).
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r107-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r107-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[[^]]*ref=(e[0-9]+)\]' /tmp/r107-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. open duel view"
DREF=$(agent-browser snapshot 2>/dev/null | grep -B2 -A2 'نبرد دودنفره' | grep -oE 'ref=(e[0-9]+)' | head -1 | grep -oE 'e[0-9]+')
agent-browser click "$DREF" >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ساخت اتاق نبرد"));return b?"setup-open":"SETUP-FAIL"})()'

echo "--- B. pace chips: three present, default معمول pressed"
agent-browser eval '(()=>{
  const grp=[...document.querySelectorAll("div[role=group]")].find(g=>g.getAttribute("aria-label")==="انتخاب سرعت هر سؤال");
  if(!grp) return JSON.stringify({group:false});
  const chips=[...grp.querySelectorAll("button")].map(b=>({t:b.textContent.trim().replace(/\s+/g," "),p:b.getAttribute("aria-pressed")}));
  return JSON.stringify({group:true,chips});
})()'

echo "--- C. click سریع → pressed flips"
agent-browser eval '(()=>{
  const grp=[...document.querySelectorAll("div[role=group]")].find(g=>g.getAttribute("aria-label")==="انتخاب سرعت هر سؤال");
  const fast=[...grp.querySelectorAll("button")].find(b=>b.textContent.includes("سریع"));
  fast.click(); return "clicked-fast";
})()'
sleep 0.5
agent-browser eval '(()=>{
  const grp=[...document.querySelectorAll("div[role=group]")].find(g=>g.getAttribute("aria-label")==="انتخاب سرعت هر سؤال");
  const st={};[...grp.querySelectorAll("button")].forEach(b=>{if(b.textContent.includes("سریع"))st.fast=b.getAttribute("aria-pressed");if(b.textContent.includes("معمول"))st.normal=b.getAttribute("aria-pressed")});
  return JSON.stringify(st);
})()'

echo "--- D. create room → waiting chip shows ۸ ثانیه"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ساخت اتاق نبرد"));b.click();return "created"})()'
sleep 2
agent-browser eval '(()=>{
  const t=document.body.textContent;
  const code=(t.match(/[A-Z2-9]{5}/)||[])[0]||null;
  return JSON.stringify({waiting:/اتاق آماده است/.test(t),paceChip:/سرعت هر سؤال: ۸ ثانیه/.test(t),code});
})()'

echo "--- E. scripted joiner + browser auto-answer"
CODE=$(agent-browser eval 'document.body.textContent.match(/[A-Z2-9]{5}/)?.[0] || ""' | tr -d '"')
if [ -z "$CODE" ]; then echo "ROOM-CODE-FAIL"; exit 1; fi
echo "room: $CODE"
bun scripts/qa-duel-joiner-r94.mjs "$CODE" &
sleep 1
agent-browser eval 'window.__r107 = setInterval(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => b.className.includes("border-2") && b.offsetParent !== null && b.textContent.trim().length > 0 && b.textContent.trim().length < 120);
  if (btns.length >= 4) btns[0].click();
}, 1150); "loop-started"'

echo "--- F. timer ring sampling during play (must never exceed ۸)"
MAXS=0
for i in $(seq 1 16); do
  sleep 1
  V=$(agent-browser eval '(()=>{const s=document.querySelector("span.absolute.inset-0.flex");const n=s?parseInt(s.textContent.replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d))):NaN;return isNaN(n)?"":String(n)})()' 2>/dev/null | tr -d '"')
  if [ -n "$V" ] && [ "$V" -gt "$MAXS" ] 2>/dev/null; then MAXS=$V; fi
  agent-browser snapshot >/tmp/r107-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r107-done.txt; then break; fi
done
agent-browser eval 'clearInterval(window.__r107); "cleared"' >/dev/null 2>&1 || true
echo "timer-max-seen: $MAXS (fast room ⇒ must be ≤ 8)"
if [ "$MAXS" -gt 8 ] 2>/dev/null; then echo "PACE-WIRE-BROKEN"; exit 1; fi
echo "PACE-WIRE-OK ✓"

echo "--- G. wait for duel-done (joiner already done, browser finishes 10)"
for i in $(seq 1 25); do
  agent-browser snapshot >/tmp/r107-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r107-done.txt; then break; fi
  sleep 2
done
if ! grep -q 'کارنامهٔ نبرد' /tmp/r107-done.txt; then echo "DUEL-DONE-MISSING"; exit 1; fi
grep -q 'رسیدِ امضاشدهٔ داوری' /tmp/r107-done.txt && echo "RECEIPT-CHIP-LIVE ✓" || { echo "RECEIPT-MISSING"; exit 1; }

echo "--- H. think block intact (r106 parity)"
agent-browser eval '(()=>{
  const el=document.querySelector("[aria-label=\"زمانِ فکرِ من در این نبرد\"]");
  if(!el) return JSON.stringify({present:false});
  const chip=[...el.querySelectorAll("span")].map(s=>s.textContent).find(t=>t&&t.includes("ثبت برای"))||"";
  return JSON.stringify({present:true,chip});
})()'

echo "--- I. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({overflow:d.scrollWidth-d.clientWidth})})()'
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- J. console errors"
agent-browser console 2>/dev/null | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "QA-PACE-R107-DONE"
