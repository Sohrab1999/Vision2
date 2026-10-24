#!/bin/bash
# r392 — داوریِ زندهٔ «قراردادِ «سطح N از ۶» یک نام گرفت»:
#   سرشماریِ r392: ۴ متن + نردبانِ نقطه — مخرجِ حقیقت SRS_INTERVALS.length است
#   و حالا srsLevelFa (مالکِ موتور) آن را یکجا میسازد. شاهدها (تک سشن،
#   buildِ همین راند):
#     A) داشبوردِ مرورِ هوشمند (srs-panel): چیپِ سررسید و چیپِ پیشنگاه
#        titleِ «{en} — سطح {n} از ۶» از مالک — ارقامِ فارسی، موافقتِ رجیستری
#     B) داورِ خطر: چیپِ «سطح {n} از ۶» از مالک (بذرِ wordSeen/wordMistakes)
#     C) فلش‌کارت: نردبانِ نقطهها طولش از رجیستری + جملهٔ «مرور بعدی … (سطح n از ۶)»
#        + titleِ گویشِ «سطح مرور: N — بعدی» (حکمِ «نخیر» ① — پابرجا)
#     D) تاریک: همان شاهدها زیرِ تمِ تاریک
#   آموختههایِ r387..r391: بذر و reload جدا؛ خواندنِ attribute در سطحِ المان؛
#   پرسش از DOMِ زنده؛ بستنِ مرورگر پیش از سوئیتِ کامل (درسِ r387 — کرومِ
#   جامانده CPU میخورد).
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r392-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r392 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "next start" 2>/dev/null; pkill -f "next-server" 2>/dev/null; pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r392-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

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
  // بذرِ SRS: دو واژهٔ درس ۱ در چرخهٔ مرور (سطحِ ۱ = ایندکسِ ۰) + یک سررسید
  const now=Date.now();
  j.state.srs={
    "1:ability":{level:1,dueAt:now-3600_000,state:"due"},
    "1:absolutely":{level:2,dueAt:now+86_400_000,state:"learning"}
  };
  j.state.wordSeen={"1:experience":8,"1:absolutely":8};
  j.state.wordMistakes={"1:experience":4,"1:absolutely":2};
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  return "seeded-r392";
})()'
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# خواندنِ titleهایِ سطح — سطحِ attribute: موافقتِ قالبِ مالک + ارقامِ فارسی
READ_LEVELS='(()=>{
  const els=[...document.querySelectorAll("[title]")].filter(e=>/سطح [۰-۹]+ از [۰-۹]+/.test(e.getAttribute("title")||""));
  const lat=els.filter(e=>/[0-9]/.test(e.getAttribute("title")||""));
  const samples=els.slice(0,4).map(e=>(e.getAttribute("title")||"").replace(/\s+/g," ").trim());
  return "LEVELS["+els.length+"] LATIN-DIGIT["+lat.length+"] "+samples.join(" || ");
})()'

echo "--- SEED (نوشتنِ جدا از reload — درسِ r387) ---" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_WRITE"
ev "$SEED_RELOAD"
sleep 5

echo "--- شاهد A: داشبوردِ مرورِ هوشمند (خانه، زیرِ چینش) — چیپهایِ سطح از مالک" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/داشبورد|سررسید/.test(x.textContent||""));return b?("HOME-HAS-SRS["+(b.textContent||"").trim().slice(0,16)+"]"):"NO-SRS-SECTION";})()'
sleep 1
ev "$READ_LEVELS" | head -3
shot r392-srs-levels-light.png

echo "--- شاهد B: داورِ خطر (خانه) — چیپِ «در چرخه · سطح n از ۶» از مالک" | tee -a "$OUT"
ev '(()=>{
  const chip=[...document.querySelectorAll("[title]")].find(e=>/در چرخه|سررسیدِ مرور|در حال یادگیری|مستحکم|وارفته/.test(e.getAttribute("title")||"")&&/سطح [۰-۹]+ از [۰-۹]+/.test(e.getAttribute("title")||""));
  if(!chip)return "DANGER-LEVEL-ABSENT";
  const t=(chip.getAttribute("title")||"");
  const m=t.match(/سطح [۰-۹]+ از [۰-۹]+/);
  return "DANGER-LEVEL["+(m?m[0]:"?")+"] FULL["+t.replace(/\s+/g," ").trim().slice(0,60)+"] LATIN["+(/[0-9]/.test(t)?"LEAK":"CLEAN")+"]";
})()'
shot r392-danger-level-light.png

echo "--- شاهد C: فلش‌کارتِ درس ۱ — نردبانِ نقطهها + جملهٔ مرور بعدی" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").includes("شروع یادگیری — درس اول"));if(b){b.click();return "lesson-1-opened";}return "NO-LESSON-CARD";})()'
sleep 3
ev '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("حالت فلش‌کارت"));if(b){b.click();return "flash-opened";}return "NO-FLASH-BTN";})()'
sleep 2.5
ev '(()=>{
  const dots=document.querySelectorAll(".flip-face .absolute.left-4 span").length;
  const lat=[...document.querySelectorAll("p")].some(p=>/\([۰-۹]+ از [۰-۹]+\)/.test(p.textContent||"")&&/[0-9]/.test(p.textContent||""));
  const next=[...document.querySelectorAll("p")].find(p=>/مرور بعدی/.test(p.textContent||""));
  return "DOTS["+dots+"] NEXT-SENTENCE["+(next?(next.textContent||"").replace(/\s+/g," ").trim().slice(0,70):"ABSENT")+"] LATIN["+(lat?"LEAK":"CLEAN")+"]";
})()'
shot r392-flash-dots-light.png

echo "--- شاهد D: تمِ تاریک — چیپهایِ سطح زیرِ تاریک" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev '(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>/حالت (شب|روشن)/.test((e.getAttribute("aria-label")||e.textContent||"")));
  if(b){b.click();return "theme-toggled";}
  return "THEME-BUTTON-NOT-FOUND";
})()'; sleep 1.5
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev "$READ_LEVELS" | head -2
shot r392-dark-levels.png

echo "--- کنسول و وضعیت ---" | tee -a "$OUT"
agent-browser console 2>&1 | tee -a "$OUT" | head -5
echo "########## END r392" | tee -a "$OUT"
pkill -f agent-browser 2>/dev/null; echo "BROWSER-CLOSED"
