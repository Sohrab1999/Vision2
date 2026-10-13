#!/usr/bin/env bash
# Task 119 — «معلمِ هفته» — تک‌سشن agent-browser (الگوی ۱۱۳)
# ① seedِ هفتهٔ واقعی (dayHistory + دفترچهٔ فکردار + زنجیره) ② پنل حاضر + کلیک
# ③ داوریِ واقعیِ AI (~۲s) → سه‌بخش + چیپِ «تازه» ④ درخواستِ دوباره → کشِ «آماده»
# ⑤ گرادیانِ بنفشِ دارک (هم‌قاعدهٔ quiz-teacher) ⑥ موبایلِ ۳۹۰ سرریزِ صفر
# ⑦ کنسولِ صفر ⑧ strip → پنلِ غایب (گیتِ داوری، صادقانه)
# فقط localStorage + دو POSTِ معلم — بهداشتِ DB با اسکریپتِ r119.
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
fa() { tr -d '"\\'; }

open_report() {
  $AB open "$BASE" >/dev/null 2>&1
  sleep 4
  $AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
  sleep 2
}

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB console --clear >/dev/null 2>&1 || true

# ---- ① seedِ هفتهٔ واجدِ داوری: ۳ روزِ فعال (۳۹ فعالیت)، ۳ نبردِ فکردار، زنجیرهٔ ۶ ----
$AB eval "
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const ds = (n, c) => Object.assign({ day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const rec = (id, ago, outcome) => ({
    id, day: key(ago), outcome, reason: 'finished',
    opponent: 'حریفِ' + id, opponentColor: 'rose',
    myScore: 1100, oppScore: 800, myCorrect: 8, oppCorrect: 7, answered: 10, total: 10,
    durationSec: 80,
    think: { avgMs: 1000, minMs: 600, maxMs: 1400, seen: 6, total: 10 },
  });
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    dayHistory: {
      [key(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [key(1)]: ds(1, { reviews: 8 }),
      [key(2)]: ds(2, { reviews: 6, words: 2 }),
      [key(9)]: ds(9, { reviews: 30 }),
    },
    goalMetDays: [key(0), key(1), key(2)],
    duelHistory: [rec('qa', 0, 'win'), rec('qb', 1, 'win'), rec('qc', 2, 'tie')],
    streak: 6, introDone: true, userName: 'آزمون‌گر',
  });
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'SEEDED';
})()
" >/dev/null 2>&1
open_report

# ---- ② پنل حاضر + کلیک ----
P=$($AB eval "
(() => {
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const btn = el.querySelector('button[aria-label=\"نظر معلم را برای این هفته بخواه\"]');
  if (!btn) return '0|NO-BUTTON';
  btn.click();
  return '1|PANEL|CLICKED';
})()
" 2>/dev/null | fa)
chk "$(echo "$P" | grep -q "^1|PANEL|CLICKED" && echo 1 || echo 0)" "پنلِ معلمِ هفته در باند حاضر و کلیک شد"

# ---- ③ داوریِ واقعی — انتظارِ poll تا ۳۵s (AI واقعی ~۲s) ----
DONE=""
for i in $(seq 1 17); do
  sleep 2
  DONE=$($AB eval "(() => { const el = document.querySelector('.week-teacher'); if (!el) return 'NO'; const s = el.querySelector('[data-week-review]'); return s ? 'DONE' : 'WAIT'; })()" 2>/dev/null | fa)
  [ "$DONE" = "DONE" ] && break
done
V=$($AB eval "
(() => {
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const s = el.querySelector('[data-week-review]');
  if (!s) return '0|NOT-DONE|' + (el.textContent || '').slice(0, 120);
  const t = el.textContent || '';
  return [
    '1',
    t.includes('نقطهٔ قوت') ? 'STRENGTH' : 'NO-STRENGTH',
    t.includes('تمرینِ پیشنهادی') ? 'ADVICE' : 'NO-ADVICE',
    t.includes('تازه') ? 'CHIP-FRESH' : t.includes('آماده') ? 'CHIP-CACHED' : t.includes('حالت آفلاین') ? 'CHIP-OFFLINE' : 'NO-CHIP',
    t.includes('روز از ۷ روز فعال بود') || t.includes('هفته') ? 'INTRO' : 'NO-INTRO',
  ].join('|');
})()
" 2>/dev/null | fa)
note "INFO" "verdict-probe: $V"
chk "$(echo "$V" | grep -q "^1|" && echo 1 || echo 0)" "داوری در ~$((i*2))s آماده شد"
chk "$(echo "$V" | grep -q "STRENGTH" && echo 1 || echo 0)" "بخشِ «نقطهٔ قوت» رندر شد"
chk "$(echo "$V" | grep -q "ADVICE" && echo 1 || echo 0)" "بخشِ «تمرینِ پیشنهادی» رندر شد"
chk "$(echo "$V" | grep -qE "CHIP-(FRESH|CACHED)" && echo 1 || echo 0)" "چیپِ منبعِ صادق حاضر (تازه/آماده)"

# ---- ④ درخواستِ دوباره → کشِ «آماده» (اقتصادِ یک تولید، چند خوانش) ----
$AB eval "
(() => {
  const btn = document.querySelector('.week-teacher button[aria-label=\"نظر معلم را برای این هفته بخواه\"]');
  if (!btn) return 'NO-BTN';
  btn.click();
  return 'RECLICKED';
})()
" >/dev/null 2>&1
CACHED=""
for i in $(seq 1 12); do
  sleep 2
  CACHED=$($AB eval "(() => { const t = (document.querySelector('.week-teacher') || {}).textContent || ''; return t.includes('آماده') ? 'CACHED' : 'WAIT'; })()" 2>/dev/null | fa)
  [ "$CACHED" = "CACHED" ] && break
done
chk "$([ "$CACHED" = "CACHED" ] && echo 1 || echo 0)" "درخواستِ دوباره از کش خواند — چیپِ «آماده» (~$((i*2))s)"

# ---- ⑤ دارک: گرادیانِ بنفشِ خانوادهٔ معلم ----
DARK=$($AB eval "
(() => {
  document.documentElement.classList.add('dark');
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const bg = getComputedStyle(el).backgroundImage || '';
  const ok = bg.includes('59, 7, 100') || bg.includes('59,7,100');
  document.documentElement.classList.remove('dark');
  return (ok ? '1|DARKGRAD' : '0|NOGRAD') ;
})()
" 2>/dev/null | fa)
chk "$(echo "$DARK" | grep -q "DARKGRAD" && echo 1 || echo 0)" "دارک: گرادیانِ بنفشِ (59,7,100) اعمال شد"

# ---- ⑥ موبایلِ ۳۹۰: سرریزِ صفر ----
$AB resize 390 844 >/dev/null 2>&1
sleep 1
OVF=$($AB eval "(() => JSON.stringify({ x: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()" 2>/dev/null | fa)
chk "$(echo "$OVF" | grep -q "x:0[,}]" && echo 1 || echo 0)" "موبایلِ ۳۹۰ سرریزِ افقیِ صفر"
$AB resize 1280 900 >/dev/null 2>&1

# ---- ⑦ کنسولِ صفر ----
sleep 1
CON=$($AB console 2>/dev/null | grep -ciE "error|warn" || true)
chk "$([ "${CON:-1}" = "0" ] && echo 1 || echo 0)" "کنسولِ صفر (error/warn = $CON)"

# ---- ⑧ strip → پنلِ غایب (گیتِ داوریِ صادق) ----
$AB eval "
(() => {
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  if (obj.state) { delete obj.state.dayHistory; delete obj.state.duelHistory; delete obj.state.goalMetDays; }
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'STRIPPED';
})()
" >/dev/null 2>&1
open_report
GONE=$($AB eval "(() => JSON.stringify({ gone: !document.querySelector('.week-teacher'), bandAlive: !!document.querySelector('.report-digest') }))()" 2>/dev/null | fa)
chk "$(echo "$GONE" | grep -q "gone:true" && echo 1 || echo 0)" "هفتهٔ خالی → پنل غایب (صادقانه، نه ساختگی)"
chk "$(echo "$GONE" | grep -q "bandAlive:true" && echo 1 || echo 0)" "باندِ هفته‌نامه بی‌پنل هم سرِ پا"

$AB screenshot /home/z/my-project/scripts/qa-r119-final.png >/dev/null 2>&1 || true
note "DONE" "fail=$fail"
exit $fail
