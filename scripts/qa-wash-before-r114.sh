#!/usr/bin/env bash
# r114 BEFORE-probe + smoke — تک‌سشن agent-browser
# ① smoke: خانه + تم تاریک ② موبایل ۳۹۰ سرریز ③ کنسول
# ③ BEFORE: مقدارهای محاسبه‌شدهٔ لایهٔ شست در تاریکی —
#    الف) سطرِ درست/غلطِ OptionButton (bg-emerald-50 / bg-rose-50 جامد)
#    ب) باکسِ sky-50 در weekly-chart  ج) violet-50/70 explain-box  د) amber-50/70 my-words
# فقط خواندنی — هیچ seed/POST/نبردی؛ DB دست‌نخورده.
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4

# ---- A. smoke: home renders ------------------------------------------------
R_HOME=$($AB eval "document.querySelector('header') ? 'HEADER-OK' : 'NO-HEADER'" 2>/dev/null | tr -d '"')
chk "$([ "$R_HOME" = "HEADER-OK" ] && echo 1)" "home renders (header present) → $R_HOME"

# ---- B. dark mode via app's own toggle --------------------------------------
R_TGL=$($AB eval "
(() => {
  const btn = document.querySelector('button[aria-label*=\"حالت شب\"]');
  if (btn) { btn.click(); return 'TOGGLED'; }
  return document.documentElement.classList.contains('dark') ? 'ALREADY-DARK' : 'NO-TOGGLE';
})()
" 2>/dev/null | tr -d '"')
sleep 1
R_DARK=$($AB eval "document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF'" 2>/dev/null | tr -d '"')
chk "$([ "$R_DARK" = "DARK-ON" ] && echo 1)" "dark theme on → toggle=$R_TGL state=$R_DARK"

# ---- C. quiz option correct/wrong BEFORE (solid bg-emerald-50) --------------
R_NAV=$($AB eval "
(() => {
  const el = [...document.querySelectorAll('button, a, [role=button]')].find(b => (b.textContent||'').includes('درس ۱'));
  if (el) { el.click(); return 'LESSON-OPENED'; }
  return 'NO-LESSON';
})()
" 2>/dev/null | tr -d '"')
sleep 3
R_TAB=$($AB eval "
(() => {
  const tab = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'آزمون');
  if (tab) { tab.click(); return 'QUIZ-TAB'; }
  return 'NO-TAB';
})()
" 2>/dev/null | tr -d '"')
sleep 2
R_START=$($AB eval "
(() => {
  const start = [...document.querySelectorAll('button')].find(b => /شروع آزمون|شروع/.test((b.textContent||'').trim()) && !b.disabled);
  if (start) { start.click(); return 'STARTED'; }
  return 'NO-START';
})()
" 2>/dev/null | tr -d '"')
sleep 2
R_OPT=$($AB eval "
(() => {
  const opts = document.querySelectorAll('[data-quiz-option]');
  if (!opts.length) return 'NO-OPTIONS';
  opts[0].click();
  return 'CLICKED:' + opts.length;
})()
" 2>/dev/null | tr -d '"')
sleep 1
R_SUB=$($AB eval "
(() => {
  const b = [...document.querySelectorAll('button')].find(x => /بررسی پاسخ|بررسی/.test((x.textContent||'').trim()));
  if (b) { b.click(); return 'SUBMITTED'; }
  return 'NO-SUBMIT';
})()
" 2>/dev/null | tr -d '"')
sleep 2
R_CORRECT=$($AB eval "
(() => {
  const ok = document.querySelector('[data-quiz-option*=\"bg-emerald-50\"], button[class*=\"bg-emerald-50\"]');
  if (!ok) return 'NO-CORRECT-ROW';
  return 'CORRECT bg=' + getComputedStyle(ok).backgroundColor;
})()
" 2>/dev/null | tr -d '"')
note "BEFORE" "quiz correct-row (bg-emerald-50 solid): nav=$R_NAV tab=$R_TAB start=$R_START opt=$R_OPT sub=$R_SUB → $R_CORRECT"

# ---- D. weekly-report sky-50 box BEFORE -------------------------------------
$AB eval "window.dispatchEvent(new CustomEvent('open-report')); 'x'" >/dev/null 2>&1
sleep 2
R_SKY=$($AB eval "
(() => {
  const el = [...document.querySelectorAll('*')].find(e => e.className && String(e.className).includes('bg-sky-50') && !String(e.className).includes('sky-50/'));
  if (!el) return 'NO-SKY50';
  return 'SKY50 bg=' + getComputedStyle(el).backgroundColor;
})()
" 2>/dev/null | tr -d '"')
note "BEFORE" "weekly-report bg-sky-50 solid → $R_SKY"
$AB eval "document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); 'x'" >/dev/null 2>&1
sleep 1

# ---- E. mobile 390 overflow + console ---------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -d '"')
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
exit $fail
