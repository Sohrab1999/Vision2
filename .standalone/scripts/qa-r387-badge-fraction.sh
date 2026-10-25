#!/bin/bash
# r387 — داوریِ زندهٔ «کسرِ سرشماریِ نشان یک نام گرفت»:
#   بذرِ یادگیرندهٔ کوچک (۱۲ واژهٔ بلد + ۶ تست) ⇒ سه نشان باز (اولین قدم،
#   واژه‌آموز، تست‌باز) ⇒ کسرِ «X از ۵۶» باید در هر چهار نما «همانِ همان» باشد:
#     ① چیپِ گریدِ نشان‌ها (خانه)   ② KPIِ کارنامه   ③ باندِ هفته‌نامه
#     ④ اوراقِ رسمی (رویدادِ open-official-report)
#   حکمِ یگانگیِ r383: گزارشِ ناهم‌روا مرد؛ r387 شکلِ کسر را هم یکجا کرد —
#   پس گره‌ها باید همه یک عدد ببینند. بازخوانیِ مخرج از رجیستریِ زنده.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r387-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# بذر — ۱۲ واژهٔ بلد + تاریخچهٔ امروز (۶ آزمون، ۲ مرور) + ۶ نتیجهٔ تست
# (هر سه از گیتِ sanitize میگذرند؛ totalQuizzes از history میآید نه results)
SEED_WRITE='(()=>{
  const d=new Date();
  const today=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const raw=localStorage.getItem("vision2-study-v1");
  const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  const known={};for(let i=1;i<=12;i++)known["w"+i]=true;
  j.state.known=known;
  j.state.history={};j.state.history[today]={quizzes:6,reviews:2};
  const results={};for(let i=1;i<=6;i++)results["quiz"+i]={correct:4,total:5};
  j.state.results=results;
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  return "seeded-12-6";
})()'
# آموختهٔ راند: reload درونِ همان eval با setItem مسابقه میگذارد — نوشتن و
# بارگذاری باید دو فرمانِ جدا باشند (شاهد: بذرِ اول ناپدید شد)
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# خواندنِ همهٔ کسرهایِ «X از ۵۶» در صفحهٔ جاری — ارقامِ فارسی به لاتین برایِ لاگ
READ_FRACTIONS='(()=>{
  const toLatin=(s)=>s.replace(/[۰-۹]/g,(d)=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const set=new Set();
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){
    const t=toLatin(w.currentNode.textContent.trim());
    const m=t.match(/^(\d+) از 56$/);
    if(m) set.add(m[1]+"/56");
  }
  return "FRACTIONS["+[...set].join(" | ")+"]";
})()'

wait_frac(){ for i in $(seq 1 15); do R=$(agent-browser eval "$READ_FRACTIONS" 2>/dev/null | tr -d '"'); case "$R" in FRACTIONS[*0-9]*) echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return;; esac; sleep 0.4; done; echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; }

OPEN_REPORT='(()=>{
  const cards=[...document.querySelectorAll("button,a")];
  const rc=cards.find(e=>(e.getAttribute("aria-label")||"").includes("کارنامهٔ من")||(e.textContent||"").includes("کارنامهٔ من"));
  if(rc){rc.click();return "clicked-report-card";}
  return "REPORT-CARD-NOT-FOUND";
})()'

OPEN_OFFICIAL='(()=>{
  window.dispatchEvent(new CustomEvent("open-official-report"));
  return "dispatched-official";
})()'

TOGGLE_DARK='(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>(e.getAttribute("aria-label")||e.textContent||"").includes("حالت شب"));
  if(b){b.click();return "dark-clicked";}
  return "DARK-BUTTON-NOT-FOUND";
})()'

echo "########## PHASE-B — buildِ r387 + ریاستارت (تک‌فاز — تغییرِ نمایشیِ یگانِساز)" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r387-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -8 /tmp/r387-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r387-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

echo "— بذرِ ۱۲واژه+۶آزمون ⇒ سه نشان (نوشتن، بعد بارگذاریِ جدا)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_WRITE" >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.5

echo "— ① گریدِ نشان‌ها (خانه)" | tee -a "$OUT"
wait_frac
shot r387-badges-light.png

echo "— ②+③ کارنامه: KPI + باندِ هفته‌نامه" | tee -a "$OUT"
ev "$OPEN_REPORT" >/dev/null 2>&1; sleep 2.5
wait_frac
shot r387-report-light.png

echo "— ④ اوراقِ رسمی" | tee -a "$OUT"
ev "$OPEN_OFFICIAL" >/dev/null 2>&1; sleep 2
wait_frac
shot r387-official-light.png

echo "— تاریکِ اوراق" | tee -a "$OUT"
ev "$TOGGLE_DARK" >/dev/null 2>&1; sleep 1
shot r387-official-dark.png

echo "— کنسول" | tee -a "$OUT"
ev "(()=>{const errs=(window.__qaErrors||[]).length;return 'CONSOLE_ERRORS='+errs;})()" | tee -a "$OUT"
echo "QA-DONE" | tee -a "$OUT"
