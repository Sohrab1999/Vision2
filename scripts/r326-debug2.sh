#!/usr/bin/env bash
# ------------------------------------------------------------------
# r326-debug2 — ردیابیِ جفتهای دقیقِ مشکوک: (توکنِ جوهر، توکنِ سطح)
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
: > /tmp/r326-debug2.txt

PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

PAIR='(()=>{const inkTok="__INK__";const surfTok="__SURF__";const out=[];const els=[...document.querySelectorAll("body *")];for(const el of els){const cls=typeof el.className==="string"?el.className:"";if(inkTok&&!cls.includes(inkTok))continue;if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;let anc=null;for(let n=el.parentElement;n&&n!==document.documentElement;n=n.parentElement){const c2=typeof n.className==="string"?n.className:"";if(surfTok&&c2.includes(surfTok)){anc=n;break;}}if(surfTok&&!anc)continue;const chain=[];for(let n=el;n&&n!==document.documentElement&&chain.length<6;n=n.parentElement){const cs=getComputedStyle(n);chain.push({tag:n.tagName,c:(typeof n.className==="string"?n.className:"").slice(0,80),op:cs.opacity,bg:cs.backgroundColor.slice(0,36),bgi:cs.backgroundImage!=="none"?cs.backgroundImage.slice(0,60):""});}out.push({text:el.textContent.trim().slice(0,30),ink:getComputedStyle(el).color.slice(0,44),fs:getComputedStyle(el).fontSize,chain});if(out.length>=__LIMIT__)break;}return JSON.stringify(out);})()'

run_pair() { # $1 ink token  $2 surf token  $3 limit
  local JS="${PAIR/__INK__/$1}"; JS="${JS/__SURF__/$2}"; JS="${JS/__LIMIT__/$3}"
  echo "### ink=$1 surf=$2" >> /tmp/r326-debug2.txt
  agent-browser eval "$JS" 2>&1 | tee -a /tmp/r326-debug2.txt
}

run_pair 'text-emerald-700' 'from-amber-50' 4
run_pair 'text-stone-800' 'from-amber-50' 3
run_pair 'text-stone-500' 'from-teal-50' 4
run_pair 'text-emerald-900' 'from-teal-50' 3
run_pair '' 'bg-amber-500' 3
run_pair '' 'from-emerald-400' 3
run_pair '' 'from-slate-400' 4
run_pair 'text-indigo-700' '' 3
run_pair 'text-rose-500' 'bg-rose-50' 3

agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark';})()" >/dev/null 2>&1
sleep 3.5
echo "### DARK ###" >> /tmp/r326-debug2.txt
run_pair 'text-indigo-700' '' 3
run_pair 'text-purple-700' '' 2
run_pair 'text-blue-700' '' 2
run_pair '' 'bg-sky-700' 3
run_pair 'text-violet-800' 'bg-violet-100' 2
run_pair 'text-stone-800' 'from-teal-50' 3

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
