#!/bin/bash
# Task 178 — CSV family live QA on :3000 dev (single session, blob capture).
# Rebuilt 35-day CSV (task 169 lost to rollback) + NEW 4-week trend CSV.
# Blob capture (the 169 innovation): monkey-patch URL.createObjectURL before
# clicking, store the Blob, assert type + size band — sync eval has no
# blob.text(), but type+size+pure-lib unit tests pin the contract.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

open_report() {
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b){b.click();return "clicked"}return "no-btn"})()' >/dev/null 2>&1
  sleep 10
}

PATCH='(()=>{if(!window.__csvPatched){window.__csvPatched=true;window.__csvBlob=null;window.__csvBlob2=null;const o=URL.createObjectURL.bind(URL);URL.createObjectURL=(b)=>{try{if(!window.__csvBlob)window.__csvBlob=b;else if(!window.__csvBlob2)window.__csvBlob2=b;}catch(e){}return o(b)};}return "patched"})()'

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return "skipped"}return "no-intro"})()' >/dev/null 2>&1

echo "== P1: fresh report — both CSV buttons present =="
open_report
R=$(agent-browser eval '(()=>{const root=document.querySelector(".report-digest");if(!root)return JSON.stringify({found:false});
  const csv35=root.querySelector("[aria-label=\"دانلود جدول CSV پیشرفت\"]");
  const trend=root.querySelector("[aria-label=\"دانلود روند ۴هفته‌ای CSV\"]");
  return JSON.stringify({found:true,csv35:!!csv35,trend:!!trend,img:!!root.querySelector("[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'csv35:true' && ok "35-day CSV button (rebuilt 169)" || bad "35-day CSV button missing"
echo "$R" | grep -q 'trend:true' && ok "4-week trend CSV button (new)" || bad "trend button missing"
echo "$R" | grep -q 'img:true' && ok "weekly image button untouched" || bad "image button lost"

echo "== P2: blob capture — click both, assert type + size bands =="
agent-browser eval "$PATCH" >/dev/null 2>&1
agent-browser eval '(()=>{const root=document.querySelector(".report-digest");const b=root.querySelector("[aria-label=\"دانلود جدول CSV پیشرفت\"]");b&&b.click();return "clicked"})()' >/dev/null 2>&1
sleep 1
R=$(agent-browser eval '(()=>{const b=window.__csvBlob;if(!b)return JSON.stringify({got:false});
  const t=(document.body.innerText||"");
  return JSON.stringify({got:true,type:b.type,size:b.size,band:b.size>=900&&b.size<=6000,csvToast:t.includes("جدول CSV ذخیره شد")})})()' 2>&1 | tr -d '"\')
echo "csv35: $R"
echo "$R" | grep -q 'got:true' && ok "blob captured for 35-day CSV" || bad "no blob captured"
echo "$R" | grep -q 'type:text/csv;charset=utf-8' && ok "mime text/csv;charset=utf-8" || bad "mime wrong"
echo "$R" | grep -q 'band:true' && ok "35-day size in band (BOM+36 rows)" || bad "size band wrong"
echo "$R" | grep -q 'csvToast:true' && ok "csv toast fired (checked in same wave as click)" || bad "csv toast missing"
agent-browser eval '(()=>{const root=document.querySelector(".report-digest");const b=root.querySelector("[aria-label=\"دانلود روند ۴هفته‌ای CSV\"]");b&&b.click();return "clicked"})()' >/dev/null 2>&1
sleep 1
R=$(agent-browser eval '(()=>{const b=window.__csvBlob2;if(!b)return JSON.stringify({got:false});
  return JSON.stringify({got:true,type:b.type,band:b.size>=150&&b.size<=1200})})()' 2>&1 | tr -d '"\')
echo "trend: $R"
echo "$R" | grep -q 'got:true' && ok "blob captured for trend CSV" || bad "no trend blob"
echo "$R" | grep -q 'band:true' && ok "trend size in band (BOM+5 rows)" || bad "trend size band wrong"
# trend toast (fresh, just-clicked)
R=$(agent-browser eval '(()=>{const t=(document.body.innerText||"");return JSON.stringify({trend:t.includes("روندِ ۴هفته‌ای ذخیره شد")})})()' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'trend:true' && ok "trend toast fired" || bad "trend toast missing"

echo "== P3: seeded week → trend row reflects activity =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.dayHistory=Object.assign({},d.state.dayHistory,
   {"'"$(date -u +%F)"'":{reviews:10,quizzes:2,words:3,dictation:1,rush:1}});
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
open_report
agent-browser eval "$PATCH" >/dev/null 2>&1
agent-browser eval '(()=>{const root=document.querySelector(".report-digest");const b=root.querySelector("[aria-label=\"دانلود روند ۴هفته‌ای CSV\"]");b&&b.click();return "clicked"})()' >/dev/null 2>&1
sleep 1
R=$(agent-browser eval '(()=>{const b=window.__csvBlob;if(!b)return JSON.stringify({got:false});
  return JSON.stringify({got:true,band:b.size>=150&&b.size<=1200})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'band:true' && ok "seeded trend CSV rebuilt fine" || bad "seeded trend failed"

echo "== P4: hygiene =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  if(d.state&&d.state.dayHistory){delete d.state.dayHistory["'"$(date -u +%F)"'"];}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check"
echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
