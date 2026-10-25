#!/usr/bin/env bash
# ------------------------------------------------------------------
# r326-debug — ردیابیِ زندهٔ گروههایِ مشکوکِ سویپ: برای هر «متنِ نمونه»
#   زنجیرهٔ اجداد (tag + کلاسها + opacity + زمینه) چاپ میشود تا معلوم شود
#   حکمِ پروب از کجا آمده — حکمِ ابزار یا بیماریِ واقعی اپ.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
OUT=/tmp/r326-debug.txt
: > "$OUT"

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

FINDER='(()=>{const wanted=__WANTED__;const out=[];const els=[...document.querySelectorAll("body *")];for(const el of els){const t=(el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))?el.textContent.trim().slice(0,30):"";if(!t)continue;if(!wanted.some(w=>t.includes(w)))continue;const chain=[];for(let n=el;n&&n!==document.documentElement&&chain.length<7;n=n.parentElement){const cs=getComputedStyle(n);chain.push({tag:n.tagName,c:(typeof n.className==="string"?n.className:"").slice(0,90),op:cs.opacity,bg:cs.backgroundColor.slice(0,40),bgi:cs.backgroundImage!=="none"?cs.backgroundImage.slice(0,70):""});}out.push({text:t,ink:getComputedStyle(el).color,clip:getComputedStyle(el).webkitBackgroundClip,fs:getComputedStyle(el).fontSize,fw:getComputedStyle(el).fontWeight,chain});if(out.length>=__LIMIT__)break;}return JSON.stringify(out,null,1);})()'

run_find() { # $1 JSON آرایهٔ متنها، $2 سقف
  local JS="${FINDER/__WANTED__/$1}"; JS="${JS/__LIMIT__/$2}"
  agent-browser eval "$JS" 2>&1 | tee -a "$OUT"
}

echo "########## LIGHT: suspicious texts ##########" | tee -a "$OUT"
run_find '["ورود به درس","فارغ‌التحصیل","هفتهٔ ۱","L5","درس چهارم","واژه"]' 12

agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark';})()" >/dev/null 2>&1
sleep 3.5
echo "########## DARK: suspicious texts ##########" | tee -a "$OUT"
run_find '["ورود به درس","درس چهارم","L5","۶۰","W","Vision Two"]' 14

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
