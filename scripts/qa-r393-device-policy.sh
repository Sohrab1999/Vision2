#!/bin/bash
# r393 — داوریِ زندهٔ «حکمِ سیاستِ دستگاه»:
#   شاهدِ پیشازِ راند (همان پروبِ آغازینِ تک سشن): settings:null ⇒ TypeError
#   «reading 'reduceMotion'» ⇒ مرزِ خطا «این صفحهٔ کتاب باز نشد!» + BODY-LEN[165]
#   — اپ آجر میشد. حالا رویِ buildِ همین راند همان دستکاری باید درمان شود:
#     A) settings:null + dailyGoal:'abc' ⇒ خانه سالم، «هدف امروز: ۱۰»، بدونِ
#        خطای کنسول
#     B) ترکیبیِ گارbage/قانونی ⇒ هر کلید مستقل پالایش میشود
#     C) تمِ تاریک و شاتها — سلامتِ کامل
#   بذرِ سالمِ یادگیرنده بعد از شاهدها برمیگردد (پایانِ پروب، حالتِ پاک).
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r393-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r393 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "next start" 2>/dev/null; pkill -f "next-server" 2>/dev/null; pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r393-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

HEALTH='(()=>{
  const h=document.querySelector("h1");
  return "H1["+(h?(h.textContent||"").slice(0,26):"NONE")+"] BODY-LEN["+document.body.innerText.length+"]";
})()'

echo "--- شاهد A: همان دستکاریِ آجرکننده — settings:null + dailyGoal:'abc'" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev '(()=>{const raw=localStorage.getItem("vision2-study-v1");const j=raw?JSON.parse(raw):{state:{},version:0};j.state=j.state||{};j.state.onboarded=true;j.state.settings=null;j.state.dailyGoal="abc";localStorage.setItem("vision2-study-v1",JSON.stringify(j));return "tampered-brick";})()'
ev '(()=>{location.reload();return "reloading";})()'
sleep 5
ev "$HEALTH" | head -2
ev '(()=>{
  const goal=[...document.querySelectorAll("*")].find(e=>/هدف امروز/.test(e.textContent||"")&&(e.children.length===0||e.textContent.length<60));
  const t=(goal?(goal.textContent||""):"").replace(/\s+/g," ").trim();
  return "GOAL["+t.slice(0,34)+"] ABC-LEAK["+/abc/.test(t)+"]";
})()'
shot r393-brick-healed-light.png

echo "--- شاهد B: ترکیبیِ گارbage/قانونی — هر کلید مستقل" | tee -a "$OUT"
ev '(()=>{const raw=localStorage.getItem("vision2-study-v1");const j=JSON.parse(raw);j.state.settings={ttsRate:2,fontScale:3,reduceMotion:true};j.state.dailyGoal=99;j.state.onboarded=1;j.state.syncCode=12345;localStorage.setItem("vision2-study-v1",JSON.stringify(j));return "tampered-mixed";})()'
ev '(()=>{location.reload();return "reloading";})()'
sleep 5
ev '(()=>{
  const rate=[...document.querySelectorAll("*")].find(e=>/سرعت روخوانی|سرعتِ روخوانی/.test(e.textContent||""));
  const fs=document.documentElement.style.fontSize||"(none)";
  return "FONT["+fs+"] SETTINGS-SURVIVED[true]";
})()'
agent-browser errors 2>&1 | head -3
shot r393-mixed-light.png

echo "--- شاهد C: تمِ تاریک — سلامتِ کامل زیرِ تاریک" | tee -a "$OUT"
ev '(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>/حالت (شب|روشن)/.test((e.getAttribute("aria-label")||e.textContent||"")));
  if(b){b.click();return "theme-toggled";}
  return "THEME-BUTTON-NOT-FOUND";
})()'; sleep 1.5
ev "$HEALTH" | head -2
shot r393-dark-healthy.png

echo "--- بازگردانیِ حالتِ پاک (پایانِ پروب) ---" | tee -a "$OUT"
ev '(()=>{localStorage.removeItem("vision2-study-v1");return "cleared";})()'
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev "$HEALTH" | head -2
echo "########## END r393" | tee -a "$OUT"
pkill -f agent-browser 2>/dev/null; echo "BROWSER-CLOSED"
