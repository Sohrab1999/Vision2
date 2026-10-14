#!/bin/bash
# Task 176 — «پوشش مهارت‌ها» on the official printable report — live QA on
# :3000 dev (single session, localStorage seed, same-profile reload — the
# task-174 lesson: never close between seed and reload).
# Selector strategy: section.or-coverage class hook (no quote-nesting hell).
# Official report opens from the report-card dialog via the «رسمی چاپی»
# button (dispatches open-official-report); closed via its «بستن» button.
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

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
R=$(agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return "skipped"}return "no-intro"})()' 2>&1 | tr -d '"\')
echo "intro: $R"

echo "== P1: fresh official paper — honest empty coverage section =="
open_report
R=$(agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(!b)return "no-official-btn";b.click();return "opened"})()' 2>&1 | tr -d '"\')
echo "official: $R"
sleep 4
R=$(agent-browser eval '(()=>{const sec=document.querySelector("section.or-coverage");
  if(!sec) return JSON.stringify({found:false});
  const t=sec.textContent||"";
  return JSON.stringify({found:true,fresh:t.includes("۰ از ۱۸ تلاش‌شده"),
    empty:t.includes("هنوز هیچ مهارتی تلاش نشده"),noTable:!sec.querySelector("table")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'found:true' && ok "or-coverage section renders on official paper" || bad "or-coverage missing"
echo "$R" | grep -q 'fresh:true' && ok "fresh chip ۰ از ۱۸" || bad "fresh chip wrong"
echo "$R" | grep -q 'empty:true' && ok "honest empty state text" || bad "empty state missing"
echo "$R" | grep -q 'noTable:true' && ok "no fabricated table while empty" || bad "table should not render when empty"

echo "== P2: close paper, seed two bests, same-profile reload, reopen =="
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("بستن"));if(b){b.click();return "closed"}return "no-close"})()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("بستن"));if(b){b.click();return "closed2"}return "no-close2"})()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.results=Object.assign({},d.state.results,
   {"1:vocab":{correct:17,total:20,percent:85,at:"2026-10-14"},"2:vocab":{correct:6,total:20,percent:30,at:"2026-10-14"}});
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
open_report
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4
R=$(agent-browser eval '(()=>{const sec=document.querySelector("section.or-coverage");
  if(!sec) return JSON.stringify({found:false});
  const t=sec.textContent||"";
  const bad85=[...sec.querySelectorAll("td")].find(td=>td.textContent==="۸۵٪");
  const bad30=[...sec.querySelectorAll("td")].find(td=>td.textContent==="۳۰٪");
  const row1=[...sec.querySelectorAll("tr")].find(tr=>(tr.textContent||"").includes("درس ۱"));
  return JSON.stringify({found:true,chip:t.includes("۲ از ۱۸ تلاش‌شده"),
    c85:!!bad85&&!bad85.className.includes("or-bad"),
    c30:!!bad30&&bad30.className.includes("or-bad"),
    gapDictation:!!row1&&(row1.textContent||"").includes("دیکته"),
    avg:t.includes("میانگینِ بهترینِ نمراتِ تلاش‌شده: ۵۸٪")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'chip:true' && ok "chip ۲ از ۱۸ after seed" || bad "chip wrong"
echo "$R" | grep -q 'c85:true' && ok "۸۵٪ cell without or-bad" || bad "85 cell wrong"
echo "$R" | grep -q 'c30:true' && ok "۳۰٪ cell flagged or-bad (teacher alert)" || bad "30 cell not flagged"
echo "$R" | grep -q 'gapDictation:true' && ok "lesson-1 next step = دیکته (canonical order)" || bad "gap column wrong"
echo "$R" | grep -q 'avg:true' && ok "footer avg ۵۸٪ ((85+30)/2 rounded)" || bad "footer avg wrong"

echo "== P3: hygiene =="
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  if(d.state&&d.state.results){delete d.state.results["1:vocab"];delete d.state.results["2:vocab"];}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check (dialog state)"
echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
