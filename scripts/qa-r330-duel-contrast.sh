#!/usr/bin/env bash
# ------------------------------------------------------------------
# r330 — داوریِ کنتراستِ خانوادهٔ نبرد: سطوحی که فقط با بازیِ واقعی باز
#   میشوند (spell/rush زنده و تمامشد + duel-doneِ دوکلاینتی) — پیشنهادِ
#   ②③ِ r328/r329 که دو راند معلق مانده بود.
#   پروبها در هر مرحله: dbgِ کنتراست (r328-fails-dbg.js) + basis-صفرِ r319.
#   تم: همان نمایِ تمامشد با کلاسِ html.dark همان‌جا تاریک میشود (بدونِ
#   reload — نمایِ گذرا با reload میمرد) تا هر دو تم رویِ همان محتوا سنجیده
#   شوند. دوئلِ واقعی: میزبان+مهمان رویِ داورِ :3003 (الگویِ r321).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r330-duel-contrast.txt
mkdir -p "$EV"; : > "$OUT"

dbg() { echo "-- [contrast] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
basis() { echo "-- [basis-zero] $1" | tee -a "$OUT"; agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
to_dark() { agent-browser eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark-inplace';})()" >/dev/null 2>&1; sleep 1.2; }
to_light() { agent-browser eval "(()=>{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');return 'light-inplace';})()" >/dev/null 2>&1; sleep 1.2; }

wait_round_end() {
  local MISS=0 ALIVE
  for i in $(seq 1 26); do
    ALIVE=$(agent-browser eval "String(!!document.querySelector('.rush-score-live'))" 2>&1 | tr -d '"\n')
    if [[ "$ALIVE" == "false" ]]; then MISS=$((MISS+1)); [[ $MISS -ge 2 ]] && return 0; else MISS=0; fi
    sleep 4
  done
  return 0
}
answer_loop() { # پاسخگویِ سادهٔ کوییز — محتوایِ واقعی برایِ نمایِ تمامشد
  local N=0
  for i in $(seq 1 40); do
    agent-browser eval "(()=>{const o=document.querySelectorAll('[data-rush-option]');if(o.length>0){o[0].click();return 1;}return 0;})()" >/dev/null 2>&1
    sleep 1.4
  done
}

echo "########## S1. SPELL — ستآپ و دورِ واقعی (روشن ۳۹۰)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
PERSONA=$(node "$DIR/r325-persona.js" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const o=JSON.parse(s);o.state.freezeCount=1;console.log(JSON.stringify(o))})')
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4
dbg "home-بازسنجیِ پایه"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.rush-banner button')].find(x=>x.textContent?.includes('شروع چالش'));if(!b)return 'NO-BANNER';b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const t=[...document.querySelectorAll('[role=tab]')].find(x=>x.textContent?.includes('املا'));if(!t)return 'NO-TAB';t.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.2
dbg "spell-setup"
basis "spell-setup"
agent-browser eval "(()=>{const s=document.querySelector('.rush-start');if(!s)return 'NO-START';s.click();return 'started';})()" >/dev/null 2>&1
sleep 4
dbg "spell-PLAY-live"
shot r330-spell-live-light.png
wait_round_end; sleep 2
dbg "spell-DONE روشن"
basis "spell-DONE روشن"
shot r330-spell-done-light.png
to_dark
dbg "spell-DONE تاریک"
shot r330-spell-done-dark.png
to_light

echo "########## S2. RUSH QUIZ — دورِ واقعی با پاسخگویی (روشن)" | tee -a "$OUT"
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت به خانه')||x.textContent?.includes('خانه'));if(b)b.click();return 'nav';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const b=[...document.querySelectorAll('.rush-banner button')].find(x=>x.textContent?.includes('شروع چالش'));if(!b)return 'NO-BANNER';b.click();return 'clicked';})()" >/dev/null 2>&1
sleep 2.4
agent-browser eval "(()=>{const s=document.querySelector('.rush-start');if(!s)return 'NO-START';s.click();return 'started';})()" >/dev/null 2>&1
sleep 4
dbg "rush-PLAY-live"
basis "rush-PLAY-live"
shot r330-rush-live-light.png
answer_loop
wait_round_end; sleep 2
dbg "rush-DONE روشن"
basis "rush-DONE روشن"
shot r330-rush-done-light.png
to_dark
dbg "rush-DONE تاریک"
shot r330-rush-done-dark.png
to_light
agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('بازگشت به خانه'));if(b)b.click();return 'home';})()" >/dev/null 2>&1
sleep 2
agent-browser close >/dev/null 2>&1

echo "########## S3. DUEL دوکلاینتی واقعی — میزبان/مهمان" | tee -a "$OUT"
A=(agent-browser --session dA)
B=(agent-browser --session dB)
seed_duel() { # $1 session  $2 name
  agent-browser --session "$1" open "$BASE" >/dev/null 2>&1
  agent-browser --session "$1" set viewport 390 844 >/dev/null 2>&1
  agent-browser --session "$1" wait 'body' >/dev/null 2>&1 || true
  agent-browser --session "$1" eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'$2', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
  sleep 4
}
seed_duel dA آرش-ر
seed_duel dB آرش-ز
agent-browser --session dA eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser --session dA eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='سریع');if(b)b.click();return 'fast';})()" >/dev/null 2>&1
agent-browser --session dA eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('ساخت اتاق نبرد'));if(!b)return 'NO-CREATE';b.click();return 'created';})()" 2>&1 | tee -a "$OUT"
CODE=""
for i in $(seq 1 12); do
  CODE=$(agent-browser --session dA eval "(()=>{const c=document.querySelector('.duel-code');if(!c)return '';const m=(c.getAttribute('aria-label')||'').match(/([A-Z0-9]{5})/);return m?m[1]:'';})()" 2>&1 | tr -d '"\n')
  [[ -n "$CODE" ]] && break
  sleep 2
done
echo "room_code=$CODE" | tee -a "$OUT"
agent-browser --session dB eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser --session dB eval "(()=>{const i=document.querySelector('input[aria-label=\"کد اتاق مسابقه\"]');if(!i)return 'NO-INPUT';const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,'$CODE');i.dispatchEvent(new Event('input',{bubbles:true}));return 'filled';})()" >/dev/null 2>&1
agent-browser --session dB eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('پیوستن'));if(!b)return 'NO-JOIN';b.click();return 'joined';})()" 2>&1 | tee -a "$OUT"
for s in dA dB; do
  for i in $(seq 1 20); do
    INPLAY=$(agent-browser --session "$s" eval "String(document.querySelectorAll('[data-duel-option]').length > 0)" 2>&1 | tr -d '"\n')
    [[ "$INPLAY" == "true" ]] && break
    sleep 2
  done
done
sleep 2
echo "-- [contrast] duel-PLAY-live (میزبان)" | tee -a "$OUT"
agent-browser --session dA eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"
echo | tee -a "$OUT"
shot_d() { agent-browser --session "$1" screenshot "$EV/$2" >/dev/null 2>&1; }
shot_d dA r330-duel-live-host.png
DONE_A=0; DONE_B=0
for i in $(seq 1 60); do
  if [[ $DONE_A -eq 0 ]]; then
    agent-browser --session dA eval "(()=>{const o=document.querySelectorAll('[data-duel-option]');if(o.length>0){o[0].click();return 1;}return 0;})()" >/dev/null 2>&1
    DA=$(agent-browser --session dA eval "String(['پیروزی در نبرد','این دور را باختی','مساوی — رقابت نزدیک'].some(t=>document.body.textContent.includes(t)))" 2>&1 | tr -d '"\n')
    [[ "$DA" == "true" ]] && DONE_A=1
  fi
  if [[ $DONE_B -eq 0 ]]; then
    agent-browser --session dB eval "(()=>{const o=document.querySelectorAll('[data-duel-option]');if(o.length>0){o[0].click();return 1;}return 0;})()" >/dev/null 2>&1
    DB=$(agent-browser --session dB eval "String(['پیروزی در نبرد','این دور را باختی','مساوی — رقابت نزدیک'].some(t=>document.body.textContent.includes(t)))" 2>&1 | tr -d '"\n')
    [[ "$DB" == "true" ]] && DONE_B=1
  fi
  [[ $DONE_A -eq 1 && $DONE_B -eq 1 ]] && break
  sleep 3
done
echo "done_A=$DONE_A done_B=$DONE_B" | tee -a "$OUT"
sleep 2
echo "-- [contrast] duel-DONE (میزبان)" | tee -a "$OUT"
agent-browser --session dA eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"
echo | tee -a "$OUT"
echo "-- [basis-zero] duel-DONE (میزبان)" | tee -a "$OUT"
agent-browser --session dA eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"
echo | tee -a "$OUT"
shot_d dA r330-duel-done-host.png
shot_d dB r330-duel-done-guest.png
echo "-- [contrast] duel-DONE (میزبان، تاریکِ درجا)" | tee -a "$OUT"
agent-browser --session dA eval "(()=>{localStorage.setItem('theme','dark');document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1.5
agent-browser --session dA eval "$(cat "$DIR/r328-fails-dbg.js")" 2>&1 | tee -a "$OUT"
echo | tee -a "$OUT"
shot_d dA r330-duel-done-host-dark.png
agent-browser close --all >/dev/null 2>&1
echo "== done ==" | tee -a "$OUT"
