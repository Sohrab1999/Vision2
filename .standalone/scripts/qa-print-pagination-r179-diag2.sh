#!/bin/bash
# Task 179 DIAG-2 — light-data scenario (2 skills only, like the r176 QA):
# does the coverage section get pushed to page 2 leaving a big void on page 1?
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PDF="/home/z/my-project/download/r179-diag-light.pdf"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.results={"1:vocab":{correct:17,total:20,percent:85,at:"2026-10-14"},"1:dictation":{correct:19,total:20,percent:95,at:"2026-10-14"}};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4
agent-browser eval '(()=>{document.body.classList.add("print-official");return "ok"})()' >/dev/null 2>&1
agent-browser pdf "$PDF" >/dev/null 2>&1
sleep 1
PAGES=$(pdfinfo "$PDF" 2>/dev/null | awk '/^Pages:/{print $2}')
echo "PAGES=$PAGES"
for p in $(seq 1 "${PAGES:-0}"); do
  echo "--- page $p (first/last lines) ---"
  pdftotext -f "$p" -l "$p" -layout "$PDF" - 2>/dev/null | grep -vE '^\s*$' | head -4
  echo "   ..."
  pdftotext -f "$p" -l "$p" -layout "$PDF" - 2>/dev/null | grep -vE '^\s*$' | tail -4
done
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return 1;const d=JSON.parse(raw);
  if(d.state&&d.state.results){delete d.state.results["1:vocab"];delete d.state.results["1:dictation"];}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
agent-browser close >/dev/null 2>&1 || true
echo "DIAG2-DONE"
