#!/bin/bash
# r390 — داوریِ زندهٔ «چیپِ «روخوانی جفت» یک نام گرفت»:
#   سرشماریِ r390: دکمهٔ جفتِ مترادف/متضاد با شش عضوِ بایتهمسان در شش نما —
#   اکنون PairSpeakChips مالکِ یکتایِ قالب، کلیکِ r345 (بی-onError ممنوع)
#   و سرریزِ «+N» است. شاهدها (تک سشن، buildِ همین راند):
#     A) دیکشنری: چیپهایِ sky (emerald/rose) + کلیک ⇒ فراخوانِ روخوانی
#        (بدونِ توستِ خطا در مسیرِ سالم) + سرریزِ «+N» اگر >۳
#     B) داورِ خطر (بذرِ 1:experience/1:absolutely): گویشِ فشردهٔ
#        compact + max=2 + titleِ سرریز
#     C) فلش‌کارتِ درس ۱: tone="flip" — سفیدِ رویِ گرادیان
#     D) واژهٔ روز: چیپها فقط با جفتِ واقعی (صداقتِ همیشگی)
#   آموختههایِ r387/r388/r389 رعایت میشود: بذر و reload جدا؛ خواندنِ
#   متن در سطحِ المان؛ پرسش از DOMِ زنده نه حدسِ برچسب.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r390-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r390 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r390-server.log 2>&1 &) ; sleep 6
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
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  return "seeded-r390";
})()'
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# خواندنِ چیپهایِ جفت — سطحِ المان: کلاس + متن + aria
READ_PAIRS='(()=>{
  const chips=[...document.querySelectorAll(".dict-pair-chip,.flip-pair-chip")];
  const rows=chips.slice(0,6).map(c=>{
    const t=(c.textContent||"").replace(/\s+/g," ").trim();
    const cls=c.className.includes("flip-pair-chip")?"flip":(c.className.includes("text-[10px]")?"compact":"sky");
    return t+"|"+cls;
  });
  const over=[...document.querySelectorAll("span")].filter(e=>/^\+[۰-۹]+$/.test((e.textContent||"").trim())&&(e.previousElementSibling&&/pair-chip/.test(e.previousElementSibling.className)||e.parentElement&&e.parentElement.querySelector(".pair-chip, .dict-pair-chip, .flip-pair-chip")));
  return "PAIRS["+chips.length+"] "+rows.join(" || ")+" OVERFLOW["+over.map(e=>(e.textContent||"").trim()+((e.getAttribute("title")||"")?"(titled)":"")).slice(0,3).join(",")+"]";
})()'
CHECK_SPEAK_NO_TOAST='(()=>{const t=[...document.querySelectorAll("[data-sonner-toast],[role=status],li")].some(e=>(e.textContent||"").includes("پخش صدا ممکن نشد"));return t?"TOAST-SHOWN":"NO-TOAST";})()'
ESCAPE='(()=>{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return "esc";})()'
TOGGLE_DARK='(()=>{
  const b=[...document.querySelectorAll("button")].find(e=>/حالت (شب|روشن)/.test((e.getAttribute("aria-label")||e.textContent||"")));
  if(b){b.click();return "theme-toggled";}
  return "THEME-BUTTON-NOT-FOUND";
})()'

echo "--- SEED (نوشتنِ جدا از reload — درسِ r387) ---" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_WRITE"
ev "$SEED_RELOAD"
sleep 5

echo "--- شاهد D+A: خانه (واژهٔ روز) و سپس دیکشنری — چیپهایِ sky" | tee -a "$OUT"
ev "$READ_PAIRS" | head -3
shot r390-home-wotd-light.png
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
ev "$READ_PAIRS" | head -3
# کلیکِ نخستین چیپِ جفت — فراخوانِ روخوانی (بدونِ توستِ شکست در مسیرِ سالم/یا توستِ خانواده اگر آفلاین)
ev '(()=>{const c=document.querySelector(".dict-pair-chip");if(!c)return "NO-CHIP";c.click();return "clicked:"+(c.textContent||"").replace(/\s+/g," ").trim();})()'
sleep 2
ev "$CHECK_SPEAK_NO_TOAST"
shot r390-dict-pairs-light.png

echo "--- شاهد B: داورِ خطر — گویشِ فشرده (max=2 + titleِ سرریز)" | tee -a "$OUT"
ev "$ESCAPE"; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev '(()=>{const c=document.querySelector("[data-testid=\"danger-usage-chip-experience\"]");if(!c)return "DANGER-ROW-ABSENT";const row=c.closest("div,div,div");const scope=row?row.parentElement:document;const chips=scope.querySelectorAll(".dict-pair-chip");const over=[...scope.querySelectorAll("span[title]")].find(e=>/^\+[۰-۹]+$/.test((e.textContent||"").trim()));return "DANGER-PAIRS["+chips.length+"]"+(over?" OVERFLOW["+(over.textContent||"").trim()+" titled="+(over.getAttribute("title")||"").slice(0,24)+"]":" NO-OVERFLOW");})()'
shot r390-danger-compact-light.png

echo "--- شاهد C: فلش‌کارتِ درس ۱ — tone=\"flip\"" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").includes("شروع یادگیری — درس اول"));if(b){b.click();return "lesson-1-opened";}return "NO-LESSON-CARD";})()'
sleep 3
ev '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("حالت فلش‌کارت"));if(b){b.click();return "flash-opened";}return "NO-FLASH-BTN";})()'
sleep 2.5
for i in $(seq 1 12); do
  R=$(agent-browser eval '(()=>{const c=document.querySelector(".flip-pair-chip");if(!c)return "NO-CHIP";return "FOUND["+(c.textContent||"").replace(/\s+/g," ").trim()+"|"+(c.className.includes("bg-black/20")?"veiled":"?")+"]";})()' 2>/dev/null | tr -d '"')
  case "$R" in FOUND*) echo "FLASH-TRY$i $R" | tee -a "$OUT"; break;; esac
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("بعدی"));if(b){b.click();return "next";}return "no-next";})()' >/dev/null 2>&1
  sleep 1.2
done
shot r390-flash-flip-light.png

echo "--- حالتِ شب: دیکشنری با چیپهایِ جفت" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev "$TOGGLE_DARK"; sleep 1.5
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
ev '(()=>{const n=document.querySelectorAll(".dict-pair-chip").length;return "DARK-PAIRS["+n+"]";})()'
shot r390-dict-pairs-dark.png

echo "--- کنسول و وضعیت ---" | tee -a "$OUT"
ev '(()=>{return "URL["+location.pathname+"]";})()'
echo "########## END r390" | tee -a "$OUT"
