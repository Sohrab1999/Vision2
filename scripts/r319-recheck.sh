#!/usr/bin/env bash
# r319-recheck — دومین بازبینیِ دو کورفتِ اجرایِ اولِ ممیزی: نبرد + جزوهٔ L10
#   کورفتِ اول: نبرد «total:1» دیدم بدونِ اینکه dispatchِ open-duel دیده شود —
#   این نسخه اول dispatch، بعد سنجش (duelCard=true، w=358).
#   کورفتِ دوم: زبانهٔ جزوه — «گرامر» فهرستِ فصلهاست، جزوه زبانهٔ نهمِ ناوِ درس.
#   درسِ ZWNJ: nav با includes('درس') پیدا میشود نه با نیمفاصلهٔ تایپی در انتخابگر.
set -uo pipefail
BASE="http://127.0.0.1:3000"
JSF=/home/z/my-project/scripts/r319-basis-zero-audit.js
EV=/home/z/my-project/qa-evidence

click_tab_safe() { # $1 متنِ دقیقِ زبانه — nav با includes (بی‌نیاز از نیمفاصله در انتخابگر)
  agent-browser eval "(()=>{const nav=[...document.querySelectorAll('nav')].find(n=>(n.getAttribute('aria-label')||'').includes('درس'));if(!nav)return 'NO-NAV';const b=[...nav.querySelectorAll('button')].find(x=>x.textContent?.trim()==='$1');if(!b)return 'NO-TAB';b.click();return 'clicked';})()" 2>&1
}

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'آرش-ی', onboarded:true}, version:0}));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== duel AFTER dispatch =="
agent-browser eval "window.dispatchEvent(new Event('open-duel')); 'ok'" >/dev/null 2>&1
sleep 2.2
agent-browser eval "(()=>{const d=document.querySelector('.duel-card');return JSON.stringify({duelCard:!!d, w:d?Math.round(d.getBoundingClientRect().width):0});})()" 2>&1
agent-browser eval "$(cat $JSF)" 2>&1
agent-browser screenshot "$EV/r319-duel-390.png" >/dev/null 2>&1

agent-browser open "$BASE" >/dev/null 2>&1; sleep 2.4
echo "== L10 booklet (زبانهٔ جزوه) =="
agent-browser eval "(()=>{const s=[...document.querySelectorAll('.book-spine .en-text')].find(x=>x.textContent?.trim()==='L10');if(!s)return 'NO-SPINE';s.closest('button').click();return 'opened';})()" 2>&1
sleep 2.4
click_tab_safe "جزوه"
sleep 2.4
agent-browser eval "JSON.stringify({minw0count:document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]').length})" 2>&1
agent-browser eval "$(cat $JSF)" 2>&1
agent-browser screenshot "$EV/r319-booklet-l10-390.png" >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== recheck done =="
