#!/bin/bash
# Task 179 DIAG — real print-pagination audit of the official report.
# Screen measurement cannot see A4 pagination (print viewport ~725px wide),
# so this drives agent-browser pdf (print media emulation) and inspects
# which page each or-section lands on with pdftotext.
# Output: page map + per-section page assignment + cut/huge-gap verdict.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PDF="/home/z/my-project/download/r179-diag.pdf"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2

# seed rich data: all 5 lessons x 6 skills + 30 days of history + known words
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1"); if(!raw) return "no-key";
  const d=JSON.parse(raw); d.state=d.state||{};
  const res={};
  const pcts=[85,92,78,66,88,74,55,81,90,60,70,95,44,73,87,69,91,52,80,63,76,84,58,97,71,65,89,75,68,82];
  let i=0;
  for(let l=1;l<=5;l++) for(const s of ["vocab","dictation","listening","writing","vocab-konkuri","grammar"]){
    res[l+":"+s]={correct:9,total:12,percent:pcts[i++ % pcts.length],at:"2026-10-14"};
  }
  d.state.results=res;
  const hist={};
  for(let k=0;k<30;k++){const dt=new Date(Date.now()-k*86400000).toISOString().slice(0,10);
    hist[dt]={reviews:5+(k%9),quizzes:k%3,words:k%4,dictation:k%2,rush:k%5};}
  d.state.dayHistory=hist;
  d.state.known={"1":[1,2,3,4,5],"2":[1,2,3],"3":[1]};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));
  return "seeded"})()' >/dev/null 2>&1

agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b){b.click();return "clicked"}return "no-btn"})()' >/dev/null 2>&1
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4

# add the print class exactly like printOfficial() does (agent-browser pdf
# emulates print media but never fires window.print()/beforeprint)
agent-browser eval '(()=>{document.body.classList.add("print-official");return document.querySelector("section.or-coverage")?"portal-ok":"no-portal"})()' 2>&1

agent-browser pdf "$PDF" >/dev/null 2>&1
sleep 1
PAGES=$(pdfinfo "$PDF" 2>/dev/null | awk '/^Pages:/{print $2}')
echo "PAGES=$PAGES"

# page-by-page text: which sections land where
for p in $(seq 1 "${PAGES:-0}"); do
  echo "--- page $p ---"
  pdftotext -f "$p" -l "$p" -layout "$PDF" - 2>/dev/null | grep -vE '^\s*$' | head -6
  echo "  ..."
  pdftotext -f "$p" -l "$p" -layout "$PDF" - 2>/dev/null | grep -vE '^\s*$' | tail -3
done

# section -> page map
echo "== section page map =="
for sec in "خلاصهٔ عملکرد" "عملکرد درس‌به‌درس" "پوشش مهارت‌ها" "فعالیت ۳۰ روز" "نشان‌های کسب‌شده" "امضای دانش‌آموز" "میانگینِ بهترینِ نمرات"; do
  for p in $(seq 1 "${PAGES:-0}"); do
    if pdftotext -f "$p" -l "$p" "$PDF" - 2>/dev/null | grep -q "$sec"; then
      echo "  [$sec] -> page $p"
    fi
  done
done

# strip seed (hygiene even in diag)
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return 1;const d=JSON.parse(raw);
  if(d.state){delete d.state.results;delete d.state.dayHistory;delete d.state.known;}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
agent-browser close >/dev/null 2>&1 || true
echo "DIAG-DONE"
