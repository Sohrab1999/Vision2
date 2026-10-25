#!/bin/bash
# r389 — داوریِ زندهٔ «چیپِ «در جزوه · N» یک نام گرفت»:
#   سرشماریِ r389: قالبِ چیپِ «در جزوه · {faNum(n)}» در پنج نما بایتبه‌بایت
#   تکرار می‌شد (دیکشنری r252 · تبِ واژگان/فلش‌کارت r253 · واژهٔ روز r254 ·
#   داورِ خطر r255) — اکنون BookletUsageChip مالکِ یکتایِ قالب، دروازهٔ
#   صداقت و سیم‌کشیِ هدفِ دیالوگ است. شاهدها (تک سشن، buildِ همین راند):
#     A) کارتِ واژهٔ روز (خانه): usage-chip-* با قالبِ «در جزوه · N»
#     B) داورِ خطر (خانه): بذرِ 1:experience=4/8 و 1:absolutely=2/8
#        ⇒ danger-usage-chip-* (experience=۳ سایت، absolutely=۲ — پیش‌شماریِ bun)
#     C) دیکشنری: چیپِ آسمانیِ سطرها + کلیک ⇒ دیالوگِ مشترکِ r253
#     D) فلش‌کارتِ درس ۱: چیپِ سفیدِ flip (tone="flip") رویِ پشتِ کارت
#   آموختههایِ r387/r388 رعایت میشود: بذر و reload دو فرمانِ جدا؛
#   خواندنِ متنِ چیپ در سطحِ المان (JSX متن را به nodeهایِ جدا میشکند).
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r389-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## r389 — buildِ همین راند + ریاستارت (تک سشن)" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r389-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

# بذرِ یادگیرندهٔ کوچک + واژه‌هایِ خطرناک (نوشتن جدا از reload — درسِ r387)
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
  return "seeded-r389";
})()'
SEED_RELOAD='(()=>{location.reload();return "reloading";})()'

# خواندنِ چیپها — سطحِ المان (textContentِ دکمه = قالبِ کاملِ «در جزوه · N»)
READ_CHIPS='(()=>{
  const chips=[...document.querySelectorAll("[data-testid]")].filter(e=>/usage-chip/.test(e.getAttribute("data-testid")||""));
  const rows=chips.map(e=>{
    const txt=(e.textContent||"").replace(/\s+/g," ").trim();
    const ar=(e.getAttribute("aria-label")||"").slice(0,80);
    const cls=(e.className||"").includes("flip-pair-chip")?"flip":((e.className||"").includes("border-sky-200")?"sky":"?");
    return e.getAttribute("data-testid")+"|"+txt+"|"+cls+"|"+ar;
  });
  return "CHIPS["+(chips.length)+"] "+rows.join(" || ");
})()'
OPEN_DIALOG_BY_TESTID='((id)=>{
  const c=document.querySelector("[data-testid=\""+id+"\"]");
  if(!c) return "NO-CHIP:"+id;
  c.click();
  return "clicked:"+id;
})'
CHECK_DIALOG='(()=>{
  const d=document.querySelector("[data-testid=\"usage-dialog\"]");
  return d? "DIALOG-OPEN("+((d.textContent||"").match(/در جزوه · [۰-۹]+/)||["?"])[0]+")" : "DIALOG-ABSENT";
})()'
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

echo "--- شاهد A: کارتِ واژهٔ روز — پیش‌شماریِ bun: pickِ امروز broadcast با ۰ سایت ⇒ هیچ (دروازهٔ صداقتِ مالک، زنده)" | tee -a "$OUT"
ev '(()=>{const card=[...document.querySelectorAll("section,div")].find(e=>(e.textContent||"").includes("واژهٔ امروز"));if(!card)return "WOTD-CARD-ABSENT";const w=[...card.querySelectorAll("[dir=ltr] ")].map(x=>(x.textContent||"").trim()).find(t=>/^[a-zA-Z]+$/.test(t));const chip=card.querySelector("[data-testid^=\"usage-chip-\"]");return "WOTD[word="+(w||"?")+" chip="+(chip?"PRESENT":"none-honest")+"]";})()'
shot r389-wotd-honest-none.png

echo "--- شاهد B: داورِ خطر — چیپهایِ ردیفِ خطا (experience=۳، absolutely=۲)" | tee -a "$OUT"
ev '(()=>{const a=document.querySelector("[data-testid=\"danger-usage-chip-experience\"]");const b=document.querySelector("[data-testid=\"danger-usage-chip-absolutely\"]");return "DANGER-CHIPS["+(a?"exp✓":"exp✗")+" "+(b?"abs✓":"abs✗")+"]";})()'
ev '(()=>{const a=document.querySelector("[data-testid=\"danger-usage-chip-experience\"]");return a?"EXP["+a.textContent.replace(/\s+/g," ").trim()+"]":"EXP[absent]";})()'
ev '(()=>{const a=document.querySelector("[data-testid=\"danger-usage-chip-absolutely\"]");return a?"ABS["+a.textContent.replace(/\s+/g," ").trim()+"]":"ABS[absent]";})()'
ev "$OPEN_DIALOG_BY_TESTID(\"danger-usage-chip-experience\")"
sleep 1.5; ev "$CHECK_DIALOG"; sleep 0.5
shot r389-danger-dialog-light.png
ev "$ESCAPE"; sleep 1

echo "--- شاهد C: دیکشنری — سطرها با چیپِ آسمانی + دیالوگِ مشترک" | tee -a "$OUT"
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
ev "$READ_CHIPS" | head -3
D=$(agent-browser eval '(()=>{const c=document.querySelector("[data-testid^=\"usage-chip-\"]");return c?c.getAttribute("data-testid"):"none";})()' 2>/dev/null | tr -d '"')
echo "DICT-CHIP=$D" | tee -a "$OUT"
if [ "$D" != "none" ] && [ -n "$D" ]; then
  ev "$OPEN_DIALOG_BY_TESTID(\"$D\")"
  sleep 1.5; ev "$CHECK_DIALOG"; sleep 0.5
  shot r389-dict-dialog-light.png
  ev "$ESCAPE"; sleep 1
fi

echo "--- شاهد D: فلش‌کارتِ درس ۱ — چیپِ سفیدِ flip رویِ پشتِ کارت" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").includes("شروع یادگیری — درس اول"));if(b){b.click();return "lesson-1-opened";}return "NO-LESSON-CARD";})()'
sleep 3
ev '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("حالت فلش‌کارت"));if(b){b.click();return "flash-opened";}return "NO-FLASH-BTN";})()'
sleep 2.5
# یافتنِ چیپِ flip: برگرداندن/بعدی تا چیپِ واژهٔ کاربرددار پیدا شود (حداکثر ۱۲ کارت)
for i in $(seq 1 12); do
  R=$(agent-browser eval '(()=>{const c=document.querySelector("[data-testid=\"flash-usage-chip\"]");if(!c)return "NO-CHIP";const card=c.closest("[data-testid]")||c;return "FOUND["+c.textContent.replace(/\s+/g," ").trim()+"|"+(c.className.includes("flip-pair-chip")?"flip":"?")+"]";})()' 2>/dev/null | tr -d '"')
  case "$R" in FOUND*) echo "FLASH-TRY$i $R" | tee -a "$OUT"; break;; esac
  agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("بعدی"));if(b){b.click();return "next";}return "no-next";})()' >/dev/null 2>&1
  sleep 1.2
done
D=$(agent-browser eval '(()=>{const c=document.querySelector("[data-testid=\"flash-usage-chip\"]");return c?"yes":"no";})()' 2>/dev/null | tr -d '"')
if [ "$D" = "yes" ]; then
  ev '(()=>{const c=document.querySelector("[data-testid=\"flash-usage-chip\"]");c.click();return "flash-chip-clicked";})()'
  sleep 1.5; ev "$CHECK_DIALOG"; sleep 0.5
  shot r389-flash-dialog-light.png
  ev "$ESCAPE"; sleep 1
else
  echo "FLASH-CHIP-ABSENT" | tee -a "$OUT"
fi

echo "--- حالتِ شب: دیکشنری با چیپ + دیالوگ" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
ev "$TOGGLE_DARK"; sleep 1.5
ev '(()=>{const b=[...document.querySelectorAll("button,a")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(b){b.click();return "to-dictionary";}return "NO-DICT-BTN";})()'
sleep 2.5
D=$(agent-browser eval '(()=>{const c=document.querySelector("[data-testid^=\"usage-chip-\"]");return c?c.getAttribute("data-testid"):"none";})()' 2>/dev/null | tr -d '"')
if [ "$D" != "none" ] && [ -n "$D" ]; then
  ev "$OPEN_DIALOG_BY_TESTID(\"$D\")"
  sleep 1.5
  shot r389-dict-dialog-dark.png
  ev "$ESCAPE"; sleep 1
fi

echo "--- کنسول و وضعیت ---" | tee -a "$OUT"
ev '(()=>{return "URL["+location.pathname+"] CONSOLE["+(window.__qaErrors?window.__qaErrors.length:"?")+"]";})()'
echo "########## END r389" | tee -a "$OUT"
