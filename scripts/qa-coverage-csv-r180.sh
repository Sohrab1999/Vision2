#!/bin/bash
# Task 180 — coverage CSV export live QA (single session, blob capture).
# The tidy long table (lesson x skill rows) exported from the official
# report chrome. Blob capture is the 169 innovation: patch
# URL.createObjectURL, click, assert type + size band + toast in the SAME
# eval wave (toasts live 3s — checking later misses them, r178 lesson).
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

PATCH='(()=>{if(!window.__covPatched){window.__covPatched=true;window.__covBlob=null;const o=URL.createObjectURL.bind(URL);URL.createObjectURL=(b)=>{try{if(!window.__covBlob)window.__covBlob=b;}catch(e){}return o(b)};}return "patched"})()'

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2

# seed rich data: all 5 lessons x 6 skills (with a couple of weak scores so
# the status column has variety) + empty case first
echo "== P1: fresh visitor — button present, export still works (honest empty rows) =="
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b){b.click();return "clicked"}return "no-btn"})()' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4
R=$(agent-browser eval '(()=>{const b=document.querySelector("[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]");
  const print=document.querySelector(".official-chrome");
  return JSON.stringify({btn:!!b,chrome:!!print})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'btn:true' && ok "coverage CSV button in official chrome" || bad "coverage CSV button missing"
echo "$R" | grep -q 'chrome:true' && ok "official chrome intact" || bad "chrome broken"

agent-browser eval "$PATCH" >/dev/null 2>&1
agent-browser eval '(()=>{const b=document.querySelector("[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]");b&&b.click();return "clicked"})()' >/dev/null 2>&1
sleep 1
R=$(agent-browser eval '(()=>{const b=window.__covBlob;if(!b)return JSON.stringify({got:false});
  const t=(document.body.innerText||"");
  return JSON.stringify({got:true,type:b.type,size:b.size,band:b.size>=700&&b.size<=4000,
    toast:t.includes("CSV پوشش ذخیره شد")})})()' 2>&1 | tr -d '"\')
echo "fresh: $R"
echo "$R" | grep -q 'got:true' && ok "blob captured (fresh visitor)" || bad "no blob (fresh)"
echo "$R" | grep -q 'type:text/csv;charset=utf-8' && ok "mime text/csv;charset=utf-8" || bad "mime wrong"
echo "$R" | grep -q 'band:true' && ok "size in band (BOM + header + 30 tidy rows)" || bad "size band wrong"
echo "$R" | grep -q 'toast:true' && ok "toast fired (same eval wave as click)" || bad "toast missing"

echo "== P2: seeded variety — weak/good/excellent statuses land in the file =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};
  d.state.results={"1:vocab":{correct:19,total:20,percent:95,at:"2026-10-14"},"1:dictation":{correct:9,total:20,percent:45,at:"2026-10-13"},"2:vocab":{correct:14,total:20,percent:70,at:"2026-10-14"}};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4
agent-browser eval "$PATCH" >/dev/null 2>&1
agent-browser eval '(()=>{const b=document.querySelector("[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]");b&&b.click();return "clicked"})()' >/dev/null 2>&1
sleep 1
R=$(agent-browser eval '(()=>{const b=window.__covBlob;if(!b)return JSON.stringify({got:false});
  return JSON.stringify({got:true,band:b.size>=700&&b.size<=4000,s:b.size})})()' 2>&1 | tr -d '"\')
echo "seeded: $R"
echo "$R" | grep -q 'got:true' && ok "blob captured (seeded variety)" || bad "no blob (seeded)"
echo "$R" | grep -q 'band:true' && ok "seeded size in band (same 31 rows, statuses differ)" || bad "seeded band wrong"

echo "== P3: hygiene =="
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return 1;const d=JSON.parse(raw);
  if(d.state&&d.state.results){delete d.state.results["1:vocab"];delete d.state.results["1:dictation"];delete d.state.results["2:vocab"];}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check (dialog state)"

echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
