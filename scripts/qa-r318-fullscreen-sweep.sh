#!/usr/bin/env bash
# ------------------------------------------------------------------
# r318 — پیمایشِ «سطحهایِ تمامصفحه» (پیشنهادِ ①ِ r317)
#   خانوادهٔ تازه: آنبوردینگ + ۸ زبانهٔ درس + جزوهٔ درسِ ۱۰ + ۹ نماِ ابزار
#   طبقهبند همان r317 (افقی: scroller/sr_only/truncate/transform — عمودی:
#   vscroller/sr_only/clamp/flow مشروع؛ hidden_clip کاندیدا) — ریشهٔ سنجش:
#   main (بسترِ همهٔ نماها) + چکِ سطحِ body (سربار/فوتر/بازگشت‌به‌بالا).
#   درسِ r317: قالبِ JS فایلِ مستقل (r317-sweep.js) + sed؛ هیچ قالبِ
#   چندخطیای در بش نمینشیند. ناوبریِ واقعیِ کاربر (کلیکِ کارت/قفسه/زبانه).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r318-sweep-results.txt
mkdir -p "$EV"; : > "$OUT"

sweep() { # $1 selector  $2 label — اگر باگِ واقعی دید، فرزندانِ خونی را هم لو میدهد
  local JS; JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  echo "-- $2" | tee -a "$OUT"
  local RES; RES=$(agent-browser eval "$JS" 2>&1)
  echo "$RES" | tee -a "$OUT"
  if [[ "$RES" == *'"h_bugs":0'* ]]; then echo | tee -a "$OUT"; return; fi
  agent-browser eval "JSON.stringify((()=>{const root=document.querySelector('$1');if(!root)return 'NO-ROOT';const er=root.getBoundingClientRect();return [...root.querySelectorAll('*')].filter(el=>el.scrollWidth>el.clientWidth+1&&el.clientWidth>0&&!getComputedStyle(el).overflowX.match(/auto|scroll/)).slice(0,6).map(el=>{const e=el.getBoundingClientRect();return {cls:String(el.className).slice(0,40),over:el.scrollWidth-el.clientWidth,bleeds:[...el.querySelectorAll('*')].filter(k=>{const cs=getComputedStyle(k);if(cs.display==='none')return false;const kr=k.getBoundingClientRect();return kr.right>e.right+1||kr.left<e.left-1||kr.bottom>e.bottom+1||kr.top<e.top-1;}).slice(0,5).map(k=>({tag:k.tagName,pos:getComputedStyle(k).position,pe:getComputedStyle(k).pointerEvents,ah:k.getAttribute('aria-hidden'),txt:(k.textContent||'').trim().slice(0,16)}))};});})())" 2>&1 | tee -a "$OUT"
  echo | tee -a "$OUT"
}

click_tool() { # $1 عنوانِ کارتِ ابزار — همیشه درونِ گریدِ ابزارها (محدودهٔ دقیق)
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>x.textContent?.includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

open_spine() { # $1 برچسبِ قفسه (L1..L12) — تطبیقِ دقیقِ en-text (نه L1 داخلِ L10)
  agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='$1');if(!s)return 'NO-SPINE';const b=s.closest('button');if(!b)return 'NO-BTN';b.click();return 'clicked';})()" 2>&1
}

click_tab() { # $1 برچسبِ زبانه — تطبیقِ دقیق در ناوبارِ درس
  agent-browser eval "(()=>{const nav=document.querySelector('nav[aria-label=\"بخش‌های درس\"]');if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}

reload_home() { agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }

# ============ فازِ روشنِ ۳۹۰ ============
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5

echo "########## LIGHT 390 — onboarding (آموزشِ بارِ اول) ##########" | tee -a "$OUT"
agent-browser eval "(()=>{localStorage.clear();sessionStorage.clear();location.reload();return 'cleared';})()" >/dev/null 2>&1
sleep 4
sweep '[role=dialog]' "onboarding-390"
shot r318-onboarding-390.png
# بازگشت به یادگیرندهٔ نامدار برایِ بقیهٔ فازها
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-و', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## LIGHT 390 — زبانههایِ درسِ ۱ (یک بازدید، هشت سنجش) ##########" | tee -a "$OUT"
open_spine L1 | tee -a "$OUT"
sleep 2.4
for tab in واژگان مکالمه ریدینگ گرامر نگارش دیکته "تست‌ها" "مترادف و متضاد"; do
  click_tab "$tab" >/dev/null 2>&1
  sleep 1.7
  sweep main "lesson1:$tab"
done
shot r318-lesson-vocab-390.png
reload_home

echo "########## LIGHT 390 — جزوهٔ درسِ ۱۰ ##########" | tee -a "$OUT"
open_spine L10 | tee -a "$OUT"
sleep 2.4
click_tab "جزوه" >/dev/null 2>&1
sleep 1.7
sweep main "lesson10:booklet"
reload_home

echo "########## LIGHT 390 — نماهایِ ابزار (۹ سطح) ##########" | tee -a "$OUT"
for t in "دیکشنری جستجو" "واژه‌های من" "آزمون جامع" "گوشهٔ کنکور" "متروی گرامر" "مرور سریع قبل امتحان" "ضمیمهٔ کتاب" "تمرین هوشمند" "کتاب‌خانهٔ داستان‌ها"; do
  click_tool "$t" | tee -a "$OUT"
  sleep 2.6
  sweep main "tool:$t"
  case "$t" in
    "گوشهٔ کنکور") shot r318-konkur-390.png ;;
    "ضمیمهٔ کتاب") shot r318-appendix-390.png ;;
    "متروی گرامر") shot r318-metro-390.png ;;
  esac
  reload_home
done

# ============ فازِ تاریکِ ۳۹۰ ============
echo "########## DARK 390 ##########" | tee -a "$OUT"
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 3.5
for t in "دیکشنری جستجو" "آزمون جامع" "ضمیمهٔ کتاب" "کتاب‌خانهٔ داستان‌ها"; do
  click_tool "$t" >/dev/null 2>&1
  sleep 2.6
  sweep main "dark:$t"
  case "$t" in "ضمیمهٔ کتاب") shot r318-appendix-390-dark.png ;; esac
  reload_home
done
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

# ============ فازِ دسکتاپِ ۱۲۸۰ ============
echo "########## DESKTOP 1280 ##########" | tee -a "$OUT"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
for t in "آزمون جامع" "گوشهٔ کنکور" "ضمیمهٔ کتاب" "کتاب‌خانهٔ داستان‌ها"; do
  click_tool "$t" >/dev/null 2>&1
  sleep 2.6
  sweep main "desktop:$t"
  case "$t" in "آزمون جامع") shot r318-exam-1280.png ;; esac
  reload_home
done

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
echo "== خلاصهٔ نتیجه‌ها در $OUT =="
