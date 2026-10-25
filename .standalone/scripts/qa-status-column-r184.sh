#!/bin/bash
# Task 184 — وضعیت column in the per-lesson table: the 180/181 ladder
# (تلاش‌نشده/ضعیف/خوب/عالی) read off each lesson AVERAGE, rendered beside
# میانگین. Checks: header position, three bands on screen with the
# photocopy-safe contract (or-bad rose / emerald-700 / plain bold), the
# honest dash for the untried lesson, and survival into the REAL
# print-media PDF (mono photocopy). r181 template reused.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PDF="/home/z/my-project/download/r184-status-column.pdf"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 2

# seed: L1 avg(45,95)=70 -> خوب | L2 avg(30)=30 -> ضعیف | L3 untouched -> —
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};
  d.state.results={"1:vocab":{correct:9,total:20,percent:45,at:"2026-10-14"},"1:dictation":{correct:19,total:20,percent:95,at:"2026-10-14"},"2:vocab":{correct:6,total:20,percent:30,at:"2026-10-14"},"3:vocab":{correct:18,total:20,percent:92,at:"2026-10-14"}};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1

agent-browser open "$BASE" >/dev/null
sleep 6
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("کارنامهٔ من"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 8
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("رسمی چاپی"));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 4

echo "== P1: screen — header position + three bands + honest dash =="
R=$(agent-browser eval '(()=>{
  const sec=[...document.querySelectorAll("section")].find(s=>(s.textContent||"").includes("عملکرد درس‌به‌درس"));
  if(!sec) return JSON.stringify({found:false});
  const ths=[...sec.querySelectorAll("th")].map(t=>t.textContent);
  const ai=ths.indexOf("میانگین");
  const rowOf=n=>[...sec.querySelectorAll("tr")].find(tr=>(tr.querySelector("td")?.textContent||"").startsWith(n));
  const cell=tr=>tr?tr.querySelectorAll("td")[4]:null;
  const r1=cell(rowOf("درس ۱")), r2=cell(rowOf("درس ۲")), r3=cell(rowOf("درس ۳"));
  const weakSpan=r2&&r2.querySelector("span.or-bad");
  const exSpan=r3&&r3.querySelector("span.text-emerald-700");
  return JSON.stringify({found:true,
    colPos:ths[ai+1]==="وضعیت",
    good:r1&&r1.textContent==="خوب",
    weak:!!weakSpan&&r2.textContent==="ضعیف",weakCol:weakSpan?getComputedStyle(weakSpan).color:"",
    exc:!!exSpan&&r3.textContent==="عالی",exCol:exSpan?getComputedStyle(exSpan).color:"",
    dash:!!r3||(r1&&r1.textContent==="—"),
    foot:(sec.textContent||"").includes("زیرِ ۵۰")})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'found:true' && ok "per-lesson section found" || bad "section missing"
echo "$R" | grep -q 'colPos:true' && ok "وضعیت header sits right after میانگین" || bad "column position wrong"
echo "$R" | grep -q 'good:true' && ok "L1 avg70 -> خوب (mid band labeled in dedicated column)" || bad "خوب missing"
echo "$R" | grep -q 'weak:true' && ok "L2 avg30 -> ضعیف with or-bad span" || bad "ضعیف missing"
echo "$R" | grep -q 'weakCol:rgb(190, 18, 60)' && ok "ضعیف keeps rose #be123c (r179 contract)" || bad "weak color wrong"
echo "$R" | grep -q 'exc:true' && ok "L3 avg92 -> عالی with emerald span" || bad "عالی missing"
echo "$R" | grep -qE 'exCol:(rgb\(4, 120, 87\)|lab\(44\.4)' && ok "عالی emerald-700 computed (rgb or lab form)" || bad "excellent color wrong"
echo "$R" | grep -q 'foot:true' && ok "foot decodes the ladder for the teacher" || bad "foot missing"

echo "== P2: real print PDF — column survives the mono copy =="
agent-browser eval '(()=>{document.body.classList.add("print-official");return "ok"})()' >/dev/null 2>&1
rm -f "$PDF"
agent-browser pdf "$PDF" >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{document.body.classList.remove("print-official");return "ok"})()' >/dev/null 2>&1
if [ -s "$PDF" ]; then ok "PDF produced ($(du -h "$PDF" | cut -f1))"; else bad "PDF missing"; fi
if [ -s "$PDF" ]; then
  T=$(pdftotext "$PDF" - 2>/dev/null)
  echo "$T" | grep -q "وضعیت" && ok "PDF text: وضعیت header present" || bad "PDF: وضعیت missing"
  echo "$T" | grep -q "ضعیف" && ok "PDF text: ضعیف survives mono copy" || bad "PDF: ضعیف missing"
  echo "$T" | grep -q "عالی" && ok "PDF text: عالی survives mono copy" || bad "PDF: عالی missing"
  echo "$T" | grep -q "خوب" && ok "PDF text: خوب survives mono copy" || bad "PDF: خوب missing"
  PAGES=$(pdfinfo "$PDF" 2>/dev/null | rg -o "Pages:\s+(\d+)" -r '$1' || echo "?")
  echo "PDF pages: $PAGES"
fi

echo "== P3: hygiene — console errors, 390 overflow =="
E=$(agent-browser errors 2>&1)
echo "$E" | rg -qi "error" && bad "console has errors: $E" || ok "console clean"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
SW=$(agent-browser eval 'window.innerWidth+"sw"+document.documentElement.scrollWidth' 2>&1 | tr -d '"')
echo "$SW" | grep -q "390sw390" && ok "390 viewport no overflow" || bad "overflow: $SW"
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "== RESULT: PASS=$PASS FAIL=$FAIL =="
[ "$FAIL" -eq 0 ]
