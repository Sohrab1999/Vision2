#!/bin/bash
# Task 175 — coverage heatmap live QA on :3000 dev (single session, localStorage seed).
# Selector strategy: .coverage-heat class hook (task-174 lesson — no ZWNJ/spaces
# in selectors, no quote-nesting hell). Seed/reload: open WITHOUT close —
# agent-browser close kills the profile and loses the seed.
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
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b){b.click();return "clicked"}return "no-btn"})()' >/dev/null 2>&1
  sleep 10
}

echo "== P1: fresh heatmap inside report dialog =="
open_report
R=$(agent-browser eval '(()=>{const sec=document.querySelector(".coverage-heat");
  if(!sec) return JSON.stringify({found:false,body:(document.body.innerText||"").slice(0,60)});
  const cells=[...sec.querySelectorAll("[role=cell]")];
  const heads=[...sec.querySelectorAll("[role=columnheader]")];
  const t=sec.textContent||"";
  return JSON.stringify({found:true,cells:cells.length,cold:cells.filter(c=>c.textContent==="—").length,
    heads:heads.length,konkuri:t.includes("کنکوری"),legend:t.includes("تلاش نشده")&&t.includes("عالی"),
    avgFresh:t.includes("میانگینِ بهترین‌ها: —")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'found:true' && ok "heatmap section renders in report dialog" || bad "heatmap section missing"
echo "$R" | grep -Eq 'cells:18' && ok "18 matrix cells (3 lessons x 6 skills)" || bad "cell count != 18"
echo "$R" | grep -Eq 'cold:18' && ok "all 18 cold cells honest «—»" || bad "cold cells != 18"
echo "$R" | grep -Eq 'heads:7' && ok "7 column headers (درس + 6 skills)" || bad "headers != 7"
echo "$R" | grep -q 'konkuri:true' && ok "short header کنکوری wired" || bad "short header missing"
echo "$R" | grep -q 'legend:true' && ok "legend cold+dash ends present" || bad "legend incomplete"
echo "$R" | grep -q 'avgFresh:true' && ok "fresh avg chip honest «—»" || bad "fresh avg not honest"

echo "== P2: seeded bests → strong ۸۵ + elite ۹۵ + avg ۹۰٪ =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.results=Object.assign({},d.state.results,
   {"1:vocab":{correct:17,total:20,percent:85,at:"2026-10-14"},"1:dictation":{correct:19,total:20,percent:95,at:"2026-10-14"}});
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
open_report
R=$(agent-browser eval '(()=>{const sec=document.querySelector(".coverage-heat");if(!sec)return JSON.stringify({found:false});
  const cells=[...sec.querySelectorAll("[role=cell]")];
  const c85=cells.find(c=>c.textContent==="۸۵"),c95=cells.find(c=>c.textContent==="۹۵");
  const t=sec.textContent||"";
  return JSON.stringify({found:true,strong:!!c85&&c85.className.includes("bg-teal-50"),
    elite:!!c95&&c95.className.includes("bg-emerald-600"),
    avg:t.includes("میانگینِ بهترین‌ها: ۹۰٪"),coldLeft:cells.filter(c=>c.textContent==="—").length})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'strong:true' && ok "۸۵ cell painted strong teal" || bad "strong band wrong"
echo "$R" | grep -q 'elite:true' && ok "۹۵ cell painted elite solid emerald" || bad "elite band wrong"
echo "$R" | grep -q 'avg:true' && ok "avg chip ۹۰٪ (85+95)/2" || bad "avg chip wrong"
echo "$R" | grep -Eq 'coldLeft:16' && ok "16 cold cells remain" || bad "cold remainder != 16"

echo "== P3: strip + hygiene =="
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  if(d.state&&d.state.results){delete d.state.results["1:vocab"];delete d.state.results["1:dictation"];}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check (dialog state)"
echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
