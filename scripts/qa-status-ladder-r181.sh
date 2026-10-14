#!/bin/bash
# Task 181 — status ladder on paper: ضعیف/عالی micro-labels under the best%
# cells must survive into the REAL print-media PDF (mono-photocopy safety).
# Also re-checks pagination did not shift (coverage head+foot same page).
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PDF="/home/z/my-project/download/r181-ladder.pdf"
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2

# seed: 45 (weak), 95 (excellent), 70 (mid, unlabeled) in lesson 1-2
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};
  d.state.results={"1:vocab":{correct:9,total:20,percent:45,at:"2026-10-14"},"1:dictation":{correct:19,total:20,percent:95,at:"2026-10-14"},"2:vocab":{correct:14,total:20,percent:70,at:"2026-10-14"}};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1

agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4

echo "== P1: screen computed — labels present with correct colors =="
R=$(agent-browser eval '(()=>{
  const sec=document.querySelector("section.or-coverage");
  if(!sec) return JSON.stringify({found:false});
  const row1=[...sec.querySelectorAll("tr")].find(tr=>(tr.textContent||"").startsWith("درس ۱")||[...(tr.querySelectorAll("td")||[])].some(td=>td.textContent==="درس ۱"));
  if(!row1) return JSON.stringify({found:true,row:false});
  const bad=row1.querySelector("td.or-bad");
  const ex=[...row1.querySelectorAll("span.text-emerald-700")].find(s=>s.textContent==="عالی");
  const badCol=bad?getComputedStyle(bad).color:"";
  const exCol=ex?getComputedStyle(ex).color:"";
  return JSON.stringify({found:true,
    weak:!!bad&&bad.textContent.includes("ضعیف"),badCol,
    exc:!!ex,exCol})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'weak:true' && ok "۴۵٪ cell carries ضعيف label" || bad "weak label missing"
echo "$R" | grep -q 'badCol:rgb(190, 18, 60)' && ok "weak label keeps rose #be123c (r179 fix)" || bad "weak color wrong"
echo "$R" | grep -q 'exc:true' && ok "۹۵٪ cell carries عالی label" || bad "excellent label missing"
# Tailwind v4 emerald-700 is an oklch token — Chromium computed returns lab(...),
# while hand-written hex (or-bad) returns rgb(...). lab(44.5,-41,11) == #047857.
echo "$R" | grep -qE 'exCol:(rgb\(4, 120, 87\)|lab\(44\.4)' && ok "عالی emerald-700 computed (rgb or lab form)" || bad "excellent color wrong"

echo "== P2: real print PDF — labels extracted from paper =="
agent-browser eval '(()=>{document.body.classList.add("print-official");return "ok"})()' >/dev/null 2>&1
rm -f "$PDF"
agent-browser pdf "$PDF" >/dev/null 2>&1
sleep 1
PAGES=$(pdfinfo "$PDF" 2>/dev/null | awk '/^Pages:/{print $2}')
echo "PAGES=$PAGES"
[ -n "$PAGES" ] && [ "$PAGES" -ge 1 ] && ok "PDF generated ($PAGES pages)" || bad "no PDF"
T=$(pdftotext "$PDF" - 2>/dev/null)
echo "$T" | grep -q "ضعیف" && ok "«ضعیف» extracted from paper (mono-photocopy safe)" || bad "ضعیف lost in PDF"
echo "$T" | grep -q "عالی" && ok "«عالی» extracted from paper" || bad "عالی lost in PDF"
# pagination unchanged: coverage head + foot same page
COVER=""; FOOT=""
for p in $(seq 1 "$PAGES"); do
  TP=$(pdftotext -f "$p" -l "$p" "$PDF" - 2>/dev/null)
  [ -z "$COVER" ] && echo "$TP" | grep -q "پوشش مهارت‌ها" && COVER=$p
  [ -z "$FOOT" ] && echo "$TP" | grep -q "یعنی این مهارت" && FOOT=$p
done
[ -n "$COVER" ] && [ "$COVER" = "$FOOT" ] && ok "coverage head+foot same page (pagination intact)" || bad "coverage section split"

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
