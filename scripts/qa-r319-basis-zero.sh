#!/usr/bin/env bash
# ------------------------------------------------------------------
# r319 — ممیزیِ «دامِ basis-صفر» در کلِ app (تعمیمِ r318-probe)
#   همان دامِ سه راهاندازِ «واژههای من» (r318) ولی در همهٔ سطوح:
#   home · نبرد · پالت · پروفایل · واژههای من · آزمون · کنکور · کتابخانه ·
#   جزوهٔ L10 · درسِ L1 — روشنِ ۳۹۰ + یک لکهٔ تاریکِ home.
#   طبقهبند: r319-basis-zero-audit.js (truncate/input/column مشروع؛
#   dir=row با over>1 = کاندیدای لهشدگی).
# تکفراخوانی (الگویِ r308/r318): open → seed → پیمایشِ سطوح → audit → shot → close
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js
OUT=/tmp/r319-basis-zero-results.txt
mkdir -p "$EV"; : > "$OUT"

audit() { # $1 برچسبِ سطح
  echo "-- $1" | tee -a "$OUT"
  agent-browser eval "$(cat "$JSF")" 2>&1 | tee -a "$OUT"
  echo | tee -a "$OUT"
}

click_tool() { # $1 عنوانِ کارتِ ابزار — درونِ گریدِ ابزارها
  agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');if(!g)return 'NO-GRID';const b=[...g.querySelectorAll('button')].find(x=>x.textContent?.includes('$1'));if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >/dev/null 2>&1
}

open_spine() { # $1 برچسبِ قفسه (L1..L12) — تطبیقِ دقیقِ en-text
  agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='$1');if(!s)return 'NO-SPINE';const b=s.closest('button');if(!b)return 'NO-BTN';b.click();return 'clicked';})()" >/dev/null 2>&1
}

dispatch() { agent-browser eval "window.dispatchEvent(new Event(\"$1\")); 'ok'" >/dev/null 2>&1; }
reload() { agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4; }
shot() { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
# یادگیرندهٔ نامدار (بدونِ آنبوردینگ)
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-ی', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "########## LIGHT 390 ##########" | tee -a "$OUT"
audit "home"
shot r319-home-390.png

dispatch "open-duel"; sleep 1.8
audit "duel"
reload

dispatch "open-command-palette"; sleep 1.6
audit "palette"
agent-browser press Escape >/dev/null 2>&1; sleep 0.6

dispatch "open-profile"; sleep 1.6
audit "profile"
agent-browser press Escape >/dev/null 2>&1; sleep 0.6

click_tool "واژههای من"; sleep 2.2
audit "my-words (رگباریِ r318 — باید پاک باشد)"
shot r319-mywords-390.png
reload

click_tool "آزمون جامع"; sleep 2.2
audit "exam"
reload

click_tool "گوشهٔ کنکور"; sleep 2.2
audit "konkur"
reload

click_tool "کتابخانهٔ داستانها"; sleep 2.2
audit "library"
reload

open_spine L10; sleep 2.4
audit "booklet-L10"
reload

open_spine L1; sleep 2.4
audit "lesson-L1"
reload

echo "########## DARK 390 — لکهٔ home ##########" | tee -a "$OUT"
agent-browser eval "(()=>{localStorage.setItem('theme','dark');location.reload();return 'dark-set';})()" >/dev/null 2>&1
sleep 3.5
audit "home-dark"
agent-browser eval "(()=>{localStorage.setItem('theme','light');return 'light-back';})()" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done ==" | tee -a "$OUT"
echo "== خلاصه در $OUT =="
