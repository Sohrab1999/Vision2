#!/bin/bash
# r388 — داوریِ زندهٔ «قدمِ نرخ→درصد یک نام گرفت»:
#   سرشماریِ «درصدِ فارسی»: تنها زیرگروهِ بایتهمسان، قدمِ «نرخِ ۰..۱ →
#   درصدِ نمایشی» بود (۳ سایت) — اکنون percentFromRate (مالکِ محاسبه،
#   domain/percent) + percentFa (مالکِ قالب، time-fa). شاهدها:
#     ① واژه‌هایِ خطرناک (خانه): wordSeen/wordMistakes بذرشده
#        l1-v1 → rate=0.5 ⇒ «۵۰٪ خطا» (داغ) و l1-v2 → 0.25 ⇒ «۲۵٪ خطا»
#     ② هفته‌نامهٔ کارنامه: بذرِ ۳ نبردِ واجدِ گیت (answered=21،
#        correct=18 → rate≈0.857) ⇒ «هفتهٔ برق! … نرخِ درستی ۸۶٪»
#        و tooltipِ آستانه ⇒ «نرخِ درستی ≥ ۸۰٪» (correctRate=0.8 از مالک)
#   آموختهٔ r387 رعایت میشود: نوشتنِ بذر و reload دو فرمانِ جدا؛
#   totalQuizzes از history میآید نه results.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r388-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r388 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r388-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

# بذر: واژه‌هایِ خطرناک (۴/۸ و ۲/۸) + ۳ نبردِ واجدِ گیتِ هفتهٔ چابک
SEED_WRITE='(()=>{
  const d=new Date();
  const today=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const raw=localStorage.getItem("vision2-study-v1");
  const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  const known={};for(let i=1;i<=12;i++)known["l1-v"+i]=true;
  j.state.known=known;
  j.state.history={};j.state.history[today]={quizzes:6,reviews:2};
  const results={};for(let i=1;i<=6;i++)results["quiz"+i]={correct:4,total:5};
  j.state.results=results;
  j.state.wordSeen={"1:experience":8,"1:absolutely":8};
  j.state.wordMistakes={"1:experience":4,"1:absolutely":2};
  const mk=(ms,corr,ans)=>({id:"d"+ms,day:today,outcome:"win",reason:"finished",
    opponent:"سارا",opponentColor:"rose",myScore:corr*10,oppScore:10,
    myCorrect:corr,oppCorrect:1,answered:ans,total:ans,durationSec:120,
    think:{avgMs:900,minMs:800,maxMs:1000,seen:3,total:ans}});
  const base=Date.now();
  j.state.duelHistory=[mk(base,6,7),mk(base-86400000,6,7),mk(base-2*86400000,6,7)];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  return "seeded-r388";
})()'
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# خواندنِ «X٪ خطا»هایِ واژه‌هایِ خطرناک — متنِ سطحِ المان (JSX متنِ قالب و
# «خطا» را دو text node جدا میکند؛ درسِ داوریِ زندهٔ همین راند)
READ_DANGER='(()=>{
  const toLatin=(s)=>s.replace(/[۰-۹]/g,(dd)=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(dd))).replace(/٪/g,"%");
  const set=new Set();
  document.querySelectorAll("span,div,p,li").forEach(e=>{
    if(e.children.length>0)return;
    const t=toLatin((e.textContent||"").trim());
    const m=t.match(/^(\d+)% خطا$/);
    if(m) set.add(m[1]+"%خطا");
  });
  return "DANGER["+[...set].join(" | ")+"]";
})()'
wait_danger(){ for i in $(seq 1 25); do R=$(agent-browser eval "$READ_DANGER" 2>/dev/null | tr -d '"'); case "$R" in DANGER[*0-9]*) echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return 0;; esac; sleep 0.4; done; echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return 1; }

OPEN_REPORT='(()=>{
  const cards=[...document.querySelectorAll("button,a")];
  const rc=cards.find(e=>(e.getAttribute("aria-label")||"").includes("کارنامهٔ من")||(e.textContent||"").includes("کارنامهٔ من"));
  if(rc){rc.click();return "clicked-report-card";}
  return "REPORT-CARD-NOT-FOUND";
})()'

# خواندنِ خطِ هفتهٔ چابک/برق + tooltipِ آستانه از هفته‌نامه
READ_QUICKWEEK='(()=>{
  const toLatin=(s)=>s.replace(/[۰-۹]/g,(dd)=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(dd)));
  const hits=[];const tips=[];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){
    const t=toLatin(w.currentNode.textContent.trim());
    if(t.includes("نرخِ درستی")) hits.push(t.slice(0,90));
  }
  document.querySelectorAll("[title]").forEach(e=>{
    const t=toLatin(e.getAttribute("title")||"");
    if(t.includes("نرخِ درستی")) tips.push(t.slice(0,110));
  });
  return "QUICKWEEK["+hits.join(" || ")+"] TIPS["+tips.join(" || ")+"]";
})()'
wait_quickweek(){ for i in $(seq 1 25); do R=$(agent-browser eval "$READ_QUICKWEEK" 2>/dev/null | tr -d '"'); case "$R" in QUICKWEEK[*0-9]*) echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return 0;; esac; sleep 0.4; done; echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return 1; }

TOGGLE_DARK='(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>(e.getAttribute("aria-label")||e.textContent||"").includes("حالت شب"));
  if(b){b.click();return "dark-clicked";}
  return "DARK-BUTTON-NOT-FOUND";
})()'
READ_CONSOLE='(()=>{return "CONSOLE["+ (window.__qaErrors?window.__qaErrors.length:"?") +"]";})()'

echo "--- SEED (write جدا از reload — درسِ r387) ---" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_WRITE"
ev "$SEED_RELOAD"
sleep 5
ev '(()=>{return "ONBOARD["+ (localStorage.getItem("vision2-study-v1")||"").includes("onboarded") +"]";})()'

echo "--- شاهد ①: واژه‌هایِ خطرناک — «۵۰٪ خطا» و «۲۵٪ خطا» از مالکِ r388" | tee -a "$OUT"
wait_danger; sleep 1
shot r388-danger-light.png

echo "--- شاهد ②: هفته‌نامه — نرخِ زندهٔ ۸۶٪ + آستانهٔ ۸۰٪ در tooltip" | tee -a "$OUT"
ev "$OPEN_REPORT"
sleep 2
wait_quickweek; sleep 1
shot r388-weekly-light.png

echo "--- حالتِ شب (بستنِ کارنامه ← سوییچ ← بازگشایی) ---" | tee -a "$OUT"
ev '(()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "esc";})()'
sleep 1
ev "$TOGGLE_DARK"
sleep 1.5
ev "$OPEN_REPORT"
sleep 2
shot r388-weekly-dark.png

echo "--- کنسول ---" | tee -a "$OUT"
ev '(()=>{return "URL["+location.pathname+"]";})()'

echo "########## END r388" | tee -a "$OUT"
