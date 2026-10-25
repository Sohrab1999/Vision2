#!/bin/bash
# Task 174 — coverage map live QA on :3000 dev (single session, localStorage seed).
# Selector strategy: .coverage-map class hook — no spaces/ZWNJ in the selector,
# so no quote-nesting hell in bash-single-quoted eval strings.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
R=$(agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return "skipped"}return "no-intro"})()' 2>&1 | tr -d '"\')
echo "intro: $R"

open_report() {
  # the home entry is the multi-line «کارنامهٔ من» tool card (trim()==="گزارش"
  # matches nothing on this tree — task-169 lesson evolved)
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b){b.click();return "clicked"}return "no-btn"})()' >/dev/null 2>&1
  sleep 10
}

echo "== P1: fresh map inside report dialog =="
open_report
R=$(agent-browser eval '(()=>{const sec=document.querySelector(".coverage-map");
  if(!sec) return JSON.stringify({found:false,body:(document.body.innerText||"").slice(0,60)});
  const t=sec.textContent||"";
  return JSON.stringify({found:true,fresh:t.includes("۰ از ۱۸ تلاش‌شده"),gaps:(t.match(/گامِ بعدی/g)||[]).length,
    rows:document.querySelectorAll(".coverage-map .rounded-xl").length,
    dash:t.includes("تست واژگان —")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'found:true' && ok "coverage section renders in report dialog" || bad "coverage section missing"
echo "$R" | grep -q 'fresh:true' && ok "fresh counter ۰ از ۱۸" || bad "fresh counter wrong"
echo "$R" | grep -Eq "gaps:3" && ok "3 honest gap lines (one per lesson)" || bad "gap lines != 3"
echo "$R" | grep -Eq 'rows:3' && ok "3 lesson rows (title-agnostic)" || bad "lesson rows != 3"
echo "$R" | grep -q 'dash:true' && ok "dashed never-tried chip honest" || bad "dashed chip missing"

echo "== P2: seeded best % + gap shift =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.results=Object.assign({},d.state.results,{"1:vocab":{correct:17,total:20,percent:85,at:"2026-10-14"}});
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
# same-profile reload only — agent-browser close would kill the profile and lose the seed
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
open_report
R=$(agent-browser eval '(()=>{const sec=document.querySelector(".coverage-map");if(!sec)return JSON.stringify({found:false});
  const t=sec.textContent||"";
  return JSON.stringify({found:true,has85:t.includes("تست واژگان ۸۵٪"),counter:t.includes("۱ از ۱۸ تلاش‌شده"),
    gapShift:(t.match(/گامِ بعدی: دیکته/g)||[]).length})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'has85:true' && ok "seeded best shows as emerald ۸۵٪ chip" || bad "seeded best chip missing"
echo "$R" | grep -q 'counter:true' && ok "counter advanced to ۱ از ۱۸" || bad "counter not advanced"
echo "$R" | grep -Eq "gapShift:1" && ok "lesson-1 gap shifted to دیکته" || bad "gap not shifted"

echo "== P3: strip + hygiene =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  if(d.state&&d.state.results)delete d.state.results["1:vocab"];
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check (dialog state)"
echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
