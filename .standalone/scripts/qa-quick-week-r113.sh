#!/usr/bin/env bash
# Task 113 — «هفتهٔ چابک» در هفته‌نامه — تک‌سشن agent-browser (الگوی ۱۰۹)
# ① seedِ هفتهٔ واجدِ نقره (۱۰۹۰ms بینِ دو آستانه) ② ری‌اوپن (skipHydration فقط در mount)
# ③ خطِ «هفتهٔ چابک!» با ممیزِ فارسی + titleِ گیت ④ طلا (۷۰۰ms) → «هفتهٔ برق!»
# ⑤ کندِ ۱۶۰۰ → خطِ غایب، خطِ فکر حاضر ⑥ هفتهٔ واجدِ گذشته → غایب
# ⑦ موبایلِ ۳۹۰ سرریزِ صفر ⑧ کنسولِ صفر ⑨ strip و بهداشتِ localStorage
# فقط localStorage — هیچ POST/نبردِ واقعی؛ DB دست‌نخورده می‌ماند.
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
fa() { tr -d '"\\'; }

seed_week() { # $1 = avgMs-triplet spec: "900 1200 1400" | "700 700 700" | "1600 1600 1600"; $2 = extra days offset (0 = this week, 7 = last week)
  local a=$1; local off=$2
  set -- $a
  $AB eval "
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const [m1, m2, m3] = [$1, $2, $3];
  const rec = (id, ago, avg, seen) => ({
    id, day: key(ago + $off), outcome: 'win', reason: 'finished',
    opponent: 'حریفِ' + id, opponentColor: 'rose',
    myScore: 1100, oppScore: 800, myCorrect: 9, oppCorrect: 7, answered: 10, total: 10,
    durationSec: 80,
    think: { avgMs: avg, minMs: Math.max(100, avg - 400), maxMs: avg + 400, seen, total: 10 },
  });
  const hist = [rec('qa', 0, m1, 5), rec('qb', 1, m2, 3), rec('qc', 2, m3, 2)];
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, { duelHistory: hist, introDone: true, userName: 'آزمون‌گر' });
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'SEEDED:' + hist.length;
})()
" >/dev/null 2>&1
}

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

# ---- A. هفتهٔ واجدِ نقره: ۱۰۹۰ms (بینِ ۱۰۰۰ و ۱۵۰۰) · نرخ ۲۷/۳۰ = ۹۰٪ ----
seed_week "900 1200 1400" 0
open_report
SILVER=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  const line = el.querySelector('div[title]') ? [...el.querySelectorAll('div[title]')].map(d => d.getAttribute('title') || '') : [];
  return JSON.stringify({
    weekLine: t.includes('هفتهٔ چابک!'),
    silverAvg: t.includes('میانگینِ فکر ۱٫۱ ثانیه'),
    silverRate: t.includes('نرخِ درستی ۹۰٪'),
    goldAbsent: !t.includes('هفتهٔ برق!'),
    thinkLine: t.includes('فکرِ میانگین'),
    gateTitle: line.some(x => x.includes('گیتِ هفته') && x.includes('۳ نبردِ فکردار') && x.includes('۳۰ پاسخ')),
    winRate: t.includes('نرخِ برد'),
  });
})()
" 2>/dev/null | fa)
note "INFO" "silver-probe: $SILVER"
chk "$(echo "$SILVER" | grep -q "weekLine:true" && echo 1 || echo 0)" "خطِ «هفتهٔ چابک!» حاضر"
chk "$(echo "$SILVER" | grep -q "silverAvg:true" && echo 1 || echo 0)" "میانگینِ وزن‌دار ۱۰۹۰ms → «۱٫۱ ثانیه»"
chk "$(echo "$SILVER" | grep -q "silverRate:true" && echo 1 || echo 0)" "نرخِ درستی ۲۷/۳۰ → «۹۰٪»"
chk "$(echo "$SILVER" | grep -q "goldAbsent:true" && echo 1 || echo 0)" "طلا (زیرِ یک ثانیه) ادعا نشده"
chk "$(echo "$SILVER" | grep -q "thinkLine:true" && echo 1 || echo 0)" "خطِ فکرِ هفته هم‌زمان حاضر"
chk "$(echo "$SILVER" | grep -q "gateTitle:true" && echo 1 || echo 0)" "titleِ گیت: «۳ نبردِ فکردار، ۳۰ پاسخ»"
chk "$(echo "$SILVER" | grep -q "winRate:true" && echo 1 || echo 0)" "بلوکِ نبرد با نرخِ برد حاضر"

# ---- B. هفتهٔ برق: ۷۰۰ms — زیرِ یک ثانیه ----
seed_week "700 700 700" 0
open_report
GOLD=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  return JSON.stringify({
    goldLine: t.includes('هفتهٔ برق!'),
    goldAvg: t.includes('میانگینِ فکر ۰٫۷ ثانیه'),
    silverAbsent: !t.includes('هفتهٔ چابک!'),
  });
})()
" 2>/dev/null | fa)
note "INFO" "gold-probe: $GOLD"
chk "$(echo "$GOLD" | grep -q "goldLine:true" && echo 1 || echo 0)" "هفتهٔ ۰٫۷ثانیه‌ای → «هفتهٔ برق!»"
chk "$(echo "$GOLD" | grep -q "goldAvg:true" && echo 1 || echo 0)" "میانگینِ ۷۰۰ms → «۰٫۷ ثانیه»"
chk "$(echo "$GOLD" | grep -q "silverAbsent:true" && echo 1 || echo 0)" "نقره ادعا نشده — تایرِ درست"

# ---- C. کندِ ۱۶۰۰: خطِ هفته غایب، خطِ فکر حاضر ----
seed_week "1600 1600 1600" 0
open_report
SLOW=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  return JSON.stringify({
    weekGone: !t.includes('هفتهٔ چابک!') && !t.includes('هفتهٔ برق!'),
    thinkLine: t.includes('فکرِ میانگین ۱٫۶ ثانیه'),
    blockAlive: t.includes('نبرد این هفته'),
  });
})()
" 2>/dev/null | fa)
note "INFO" "slow-probe: $SLOW"
chk "$(echo "$SLOW" | grep -q "weekGone:true" && echo 1 || echo 0)" "کندِ ۱۶۰۰ → هر دو تایر غایب (گیتِ نگذرانده)"
chk "$(echo "$SLOW" | grep -q "thinkLine:true" && echo 1 || echo 0)" "خطِ فکر با «۱٫۶» حاضر — بلوک سالم"
chk "$(echo "$SLOW" | grep -q "blockAlive:true" && echo 1 || echo 0)" "چیپِ شمارشِ نبرد سرِ پا"

# ---- D. هفتهٔ واجدِ گذشته (۷/۸/۹) → خطِ غایب ----
seed_week "700 700 700" 7
open_report
LASTW=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  return JSON.stringify({
    weekGone: !t.includes('هفتهٔ چابک!') && !t.includes('هفتهٔ برق!'),
    zeroThis: t.includes('۰ نبرد این هفته'),
  });
})()
" 2>/dev/null | fa)
note "INFO" "lastweek-probe: $LASTW"
chk "$(echo "$LASTW" | grep -q "weekGone:true" && echo 1 || echo 0)" "هفتهٔ واجدِ گذشته → خطِ غایب (پنجره‌سازیِ سخت‌گیر)"
chk "$(echo "$LASTW" | grep -q "zeroThis:true" && echo 1 || echo 0)" "چیپِ «۰ نبرد این هفته» صادق"

# ---- E. موبایلِ ۳۹۰: سرریزِ صفر (روی حالتِ نقره) ----
seed_week "900 1200 1400" 0
open_report
$AB resize 390 844 >/dev/null 2>&1
sleep 1
OVF=$($AB eval "
(() => JSON.stringify({ x: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()
" 2>/dev/null | fa)
chk "$(echo "$OVF" | grep -q "x:0[,}]" && echo 1 || echo 0)" "موبایلِ ۳۹۰ سرریزِ افقیِ صفر"

# ---- F. کنسولِ صفر ----
sleep 1
CON=$($AB console 2>/dev/null | grep -ciE "error|warn" || true)
chk "$([ "${CON:-1}" = "0" ] && echo 1 || echo 0)" "کنسولِ صفر (error/warn = $CON)"

# ---- G. strip و بهداشتِ localStorage ----
$AB eval "
(() => {
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  if (obj.state) { delete obj.state.duelHistory; }
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'STRIPPED';
})()
" >/dev/null 2>&1
open_report
STRIP=$($AB eval "
(() => JSON.stringify({ blockGone: !document.querySelector('.duel-week') }))()
" 2>/dev/null | fa)
chk "$(echo "$STRIP" | grep -q "blockGone:true" && echo 1 || echo 0)" "seedِ strip شد — بلوکِ نبرد غایب (فقطِ localStorage، بی‌POST)"

note "DONE" "fail=$fail"
exit $fail
