#!/bin/bash
# r391 — داوریِ زندهٔ «قراردادِ ستاره یک نام گرفت»:
#   سرشماریِ r391: ۸ دکمهٔ ستاره در ۶ نما؛ زیرگروهِ همقرارداد = قالبِ ariaِ
#   بی‌گیومِ «{افزودن|حذف} {en} به/از واژه‌های من» + aria-pressed همیشه حاضر —
#   مالکش starToggleAria در state/slices/starred.ts (بازنشر از study-store).
#   شاهدها (تک سشن، buildِ همین راند):
#     A) دیکشنری: aria-pressed="false" + ariaِ مالک → کلیک → true + «حذف …»
#        (رفت‌وبرگشتِ کاملِ قرارداد، titleِ ایستا دستنخورده)
#     B) my-words — ترمیمِ اصلیِ راند: پیش از r391 شاهدِ زندهٔ agent-browser
#        هیچ aria-pressedیی در این دکمه ندید؛ حالا "true" + ariaِ مالک
#     C) داورِ خطر: ariaِ بی‌گیوم از مالک در برابرِ titleِ گیومه‌دار —
#        دوگویشِ مستند در یک دکمه، زنده
#     D) فلش‌کارت: ariaِ ایستایِ بافتاری سرِ جای خودش (حکمِ «نخیر»ِ ①)
#   آموختههایِ r387..r390: بذر و reload جدا؛ خواندنِ attribute در سطحِ
#   المان (نه text node)؛ پرسش از DOMِ زنده نه حدسِ برچسب.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r391-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r391 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "next start" 2>/dev/null; pkill -f "next-server" 2>/dev/null; pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r391-server.log 2>&1 &) ; sleep 6
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
  j.state.wordSeen={"1:experience":8,"1:absolutely":8};
  j.state.wordMistakes={"1:experience":4,"1:absolutely":2};
  j.state.starredWords=[];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  return "seeded-r391";
})()'
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# شاهد A — دیکشنری: رفت‌وبرگشتِ aria-pressed + قالبِ مالک (سطحِ attribute)
STAR_STATE='(()=>{
  const b=document.querySelector("button[aria-label*=\"ability\"]");
  if(!b)return "NO-STAR";
  return "ARIA["+(b.getAttribute("aria-label")||"")+"] PRESSED["+(b.getAttribute("aria-pressed")||"ABSENT")+"] TITLE["+(b.getAttribute("title")||"")+"]";
})()'

echo "--- SEED (نوشتنِ جدا از reload — درسِ r387) ---" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_WRITE"
ev "$SEED_RELOAD"
sleep 5

echo "--- شاهد A: دیکشنری — رفت‌وبرگشتِ قراردادِ ستاره" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
ev "$STAR_STATE" | head -2
ev '(()=>{const b=document.querySelector("button[aria-label*=\"ability\"]");if(!b)return "NO-STAR";b.click();return "clicked";})()'
sleep 1.5
ev "$STAR_STATE" | head -2
shot r391-dict-star-light.png

echo "--- شاهد B: my-words — ترمیمِ aria-pressed (پیش از r391: ABSENT)" | tee -a "$OUT"
ev '(()=>{const hits=[...document.querySelectorAll("button,a")].map(x=>((x.textContent||"")+" "+(x.getAttribute("aria-label")||""))).filter(s=>/رفتن به واژه/.test(s));const b=[...document.querySelectorAll("button,a")].find(x=>/رفتن به واژه/.test((x.textContent||"")+" "+(x.getAttribute("aria-label")||"")));if(b){b.click();return "to-my-words:"+hits.length;}return "NO-MYWORDS-BTN";})()'
sleep 2.5
ev "$STAR_STATE" | head -2
ev '(()=>{const n=[...document.querySelectorAll("button[aria-pressed=\"true\"]")].filter(b=>(b.getAttribute("aria-label")||"").includes("حذف")).length;return "MYWORDS-STARRED[" + n + "]";})()'
shot r391-mywords-star-light.png

echo "--- شاهد C: داورِ خطر (خانه، زیرِ چینش) — ariaِ بی‌گیوم در برابرِ titleِ گیومه‌دار" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 4
DANGER_STAR='(()=>{
  const names=["experience","absolutely"];
  const out=[];
  for(const n of names){
    const b=[...document.querySelectorAll("button")].find(x=>new RegExp("^(افزودن|حذف) "+n+" (به|از) واژه").test((x.getAttribute("aria-label")||"")));
    if(!b){out.push(n+":ABSENT");continue;}
    out.push(n+" ARIA["+(b.getAttribute("aria-label")||"")+"] GUIL_ARIA["+((b.getAttribute("aria-label")||"").includes("«"))+"] TITLE["+(b.getAttribute("title")||"")+"] GUIL_TITLE["+((b.getAttribute("title")||"").includes("«"))+"]");
  }
  return out.join(" || ");
})()'
ev "$DANGER_STAR" | head -3
shot r391-danger-star-light.png

echo "--- شاهد D: فلش‌کارتِ درس ۱ — ariaِ ایستایِ بافتاری (حکمِ «نخیر»)" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").includes("شروع یادگیری — درس اول"));if(b){b.click();return "lesson-1-opened";}return "NO-LESSON-CARD";})()'
sleep 3
ev '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("حالت فلش‌کارت"));if(b){b.click();return "flash-opened";}return "NO-FLASH-BTN";})()'
sleep 2.5
ev '(()=>{
  const s=[...document.querySelectorAll(".flip-face button[aria-pressed]")].map(b=>(b.getAttribute("aria-label")||""));
  const stat=s.filter(a=>a==="افزودن به واژه‌های من"||a==="حذف از واژه‌های من");
  const named=s.filter(a=>a.includes("حذف ")&&a.includes("از واژه‌های من")&&a!=="حذف از واژه‌های من");
  return "FLASH-STATIC["+stat.length+"] NAMED-LEAK["+named.length+"] PRESSED-CARD["+s.length+"]";
})()'
shot r391-flash-star-light.png

echo "--- حالتِ شب: دیکشنری — ستارهها زیرِ تمِ تاریک" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev '(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>/حالت (شب|روشن)/.test((e.getAttribute("aria-label")||e.textContent||"")));
  if(b){b.click();return "theme-toggled";}
  return "THEME-BUTTON-NOT-FOUND";
})()'; sleep 1.5
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
ev '(()=>{
  const stars=[...document.querySelectorAll("button[aria-pressed]")].filter(b=>(b.getAttribute("aria-label")||"").includes("واژه‌های من"));
  const ok=stars.filter(b=>b.getAttribute("aria-pressed")==="false"||b.getAttribute("aria-pressed")==="true");
  return "DARK-STARS["+stars.length+"] WITH-PRESSED["+ok.length+"]";
})()'
shot r391-dict-stars-dark.png

echo "--- کنسول و وضعیت ---" | tee -a "$OUT"
agent-browser console 2>&1 | tee -a "$OUT" | head -6
ev '(()=>{return "URL["+location.pathname+"]";})()'
echo "########## END r391" | tee -a "$OUT"
