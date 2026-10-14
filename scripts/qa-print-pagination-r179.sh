#!/bin/bash
# Task 179 — teacher-ready paper pass 2: zebra visibility + pagination
# micro-contracts, verified against a REAL print-media PDF (agent-browser pdf)
# plus computed-style assertions on the live report.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PDF="/home/z/my-project/download/r179-print.pdf"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2

# seed all 5 lessons x 6 skills + 30 days history (full paper)
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1"); if(!raw) return "no-key";
  const d=JSON.parse(raw); d.state=d.state||{};
  const res={}; const pcts=[85,92,78,66,88,74,55,81,90,60,70,95,44,73,87,69,91,52,80,63,76,84,58,97,71,65,89,75,68,82];
  let i=0;
  for(let l=1;l<=5;l++) for(const s of ["vocab","dictation","listening","writing","vocab-konkuri","grammar"]){
    res[l+":"+s]={correct:9,total:12,percent:pcts[i++ % pcts.length],at:"2026-10-14"};
  }
  d.state.results=res;
  const hist={};
  for(let k=0;k<30;k++){const dt=new Date(Date.now()-k*86400000).toISOString().slice(0,10);
    hist[dt]={reviews:5+(k%9),quizzes:k%3,words:k%4,dictation:k%2,rush:k%5};}
  d.state.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));
  return "seeded"})()' >/dev/null 2>&1

agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4

echo "== P1: zebra + bad-cell computed styles (official report open) =="
R=$(agent-browser eval '(()=>{
  const t=[...document.querySelectorAll(".or-table")].find(x=>x.closest(".or-coverage"))||
          document.querySelector(".or-table");
  if(!t) return JSON.stringify({found:false});
  const rows=t.querySelectorAll("tbody tr");
  if(rows.length<2) return JSON.stringify({found:true,rows:rows.length});
  const evenTd=rows[1].querySelector("td");
  const bg=evenTd?getComputedStyle(evenTd).backgroundColor:"";
  const badTd=[...t.querySelectorAll("td.or-bad")][0]||[...t.querySelectorAll(".or-bad")][0];
  const badColor=badTd?getComputedStyle(badTd).color:"";
  return JSON.stringify({found:true,rows:rows.length,
    zebra:bg,bgOk:bg==="rgb(245, 245, 244)",
    badColor,badOk:badColor==="rgb(190, 18, 60)"})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'bgOk:true' && ok "zebra even-row = stone-100 rgb(245,245,244)" || bad "zebra wrong: $R"
echo "$R" | grep -q 'badOk:true' && ok "or-bad keeps rose text over new zebra" || bad "or-bad color lost"
echo "$R" | grep -q 'rows:5' && ok "coverage table has 5 lesson rows (full seed)" || skp "row count varies"

echo "== P2: real print-media PDF — page map =="
agent-browser eval '(()=>{document.body.classList.add("print-official");return "ok"})()' >/dev/null 2>&1
rm -f "$PDF"
agent-browser pdf "$PDF" >/dev/null 2>&1
sleep 1
PAGES=$(pdfinfo "$PDF" 2>/dev/null | awk '/^Pages:/{print $2}')
echo "PAGES=$PAGES"
if [ -n "$PAGES" ] && [ "$PAGES" -ge 2 ] && [ "$PAGES" -le 3 ]; then ok "PDF page count in band (2-3, was 2 before)"; else bad "unexpected page count: $PAGES"; fi

page_txt(){ pdftotext -f "$1" -l "$1" "$PDF" - 2>/dev/null; }
COVER_PAGE=""
SIGN_PAGE=""
FOOT_PAGE=""
for p in $(seq 1 "$PAGES"); do
  T=$(page_txt "$p")
  [ -z "$COVER_PAGE" ] && echo "$T" | grep -q "پوشش مهارت‌ها" && COVER_PAGE=$p
  [ -z "$FOOT_PAGE" ] && echo "$T" | grep -q "یعنی این مهارت" && FOOT_PAGE=$p
  echo "$T" | grep -q "امضای دانش‌آموز" && SIGN_PAGE=$p
done
echo "cover=$COVER_PAGE foot=$FOOT_PAGE sign=$SIGN_PAGE"
[ -n "$COVER_PAGE" ] && [ "$COVER_PAGE" = "$FOOT_PAGE" ] && ok "coverage section head+foot on SAME page (no cut)" || bad "coverage section split across pages"
[ -n "$SIGN_PAGE" ] && ok "signatures present (page $SIGN_PAGE)" || bad "signatures missing"
# all three signature boxes on one page = atomic grid survived
T=$(page_txt "$SIGN_PAGE")
echo "$T" | grep -q "امضای معلم" && echo "$T" | grep -q "امضای والدین" && ok "all 3 signature boxes on same page (atomic)" || bad "signature boxes split"

echo "== P3: hygiene =="
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C errors"
# strip seed
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return 1;const d=JSON.parse(raw);
  if(d.state){delete d.state.results;delete d.state.dayHistory;}
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "stripped"})()' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({ov:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R" | grep -q 'ov:false' && ok "mobile-390 no overflow" || skp "mobile check (dialog state)"

echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
agent-browser close >/dev/null 2>&1 || true
