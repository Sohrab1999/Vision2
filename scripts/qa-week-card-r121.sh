#!/usr/bin/env bash
# Task 121 — «کارتِ معلمِ هفته» — تک‌سشن agent-browser (الگوی r119 + stubِ r102/120)
# ① seedِ هفتهٔ r119 (فینگپرینتِ کشِ WeekReview زنده) ② پنل + کلیک
# ③ داوریِ کش‌شده (~۲s) → سه‌بخش + چیپ ④ دکمه‌های کارت: ذخیره حاضر/هم‌رسانیِ غایبِ صادق
# ⑤ ذخیره → تُست ⑥ stub + سیکلِ busy → دکمه آمد → Fileِ واقعی ⑦ AbortError سکوت
# ⑧ reject خطا ⑨ دارکِ بنفش ⑩ موبایلِ ۳۹۰ ⑪ کنسول ⑫ strip → پنلِ غایب
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
fa() { tr -d '"\\'; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB console --clear >/dev/null 2>&1 || true

# ---- 1. seedِ هفتهٔ واقعی (همان seedِ r119 → کش) + onboarded واقعی ----
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
    streak: 6, introDone: true, userName: 'آزمون‌گر', onboarded: true,
  });
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'SEEDED-WEEK';
})()" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 3

# ---- 2. پنل حاضر + کلیک ----
P=$($AB eval "
(() => {
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const btn = el.querySelector('button[aria-label=\"نظر معلم را برای این هفته بخواه\"]');
  if (!btn) return '0|NO-BUTTON';
  btn.click();
  return '1|CLICKED';
})()" 2>/dev/null | fa)
chk "$(echo "$P" | grep -q "^1|CLICKED" && echo 1 || echo 0)" "پنلِ معلمِ هفته حاضر و کلیک شد"

# ---- 3. داوری — انتظار تا ۳۵s (کشِ r119 → ~۲s) ----
DONE=""
for i in $(seq 1 17); do
  sleep 2
  DONE=$($AB eval "(() => { const el = document.querySelector('.week-teacher'); return el && el.querySelector('[data-week-review]') ? 'DONE' : 'WAIT'; })()" 2>/dev/null | fa)
  [ "$DONE" = "DONE" ] && break
done
V=$($AB eval "
(() => {
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const s = el.querySelector('[data-week-review]');
  if (!s) return '0|NOT-DONE';
  const t = el.textContent || '';
  return [
    '1',
    t.includes('نقطهٔ قوت') ? 'STRENGTH' : 'NO-STRENGTH',
    t.includes('تمرینِ پیشنهادی') ? 'ADVICE' : 'NO-ADVICE',
    t.includes('آماده') ? 'CHIP-CACHED' : t.includes('تازه') ? 'CHIP-FRESH' : t.includes('حالت آفلاین') ? 'CHIP-OFFLINE' : 'NO-CHIP',
    s.querySelector('button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]') ? 'SAVE-ON' : 'SAVE-OFF',
    s.querySelector('button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]') ? 'SHARE-ON' : 'SHARE-OFF',
  ].join('|');
})()" 2>/dev/null | fa)
note "INFO" "verdict: $V"
chk "$(echo "$V" | grep -q "^1|" && echo 1 || echo 0)" "داوری در ~$((i*2))s آماده شد"
chk "$(echo "$V" | grep -q "STRENGTH" && echo 1 || echo 0)" "بخشِ «نقطهٔ قوت» رندر شد"
chk "$(echo "$V" | grep -qE "CHIP-(FRESH|CACHED)" && echo 1 || echo 0)" "چیپِ منبعِ صادق حاضر"
chk "$(echo "$V" | grep -qF 'SAVE-ON' && echo 1 || echo 0)" "دکمهٔ «ذخیرهٔ کارتِ هفته» حاضر"
chk "$(echo "$V" | grep -qF 'SHARE-OFF' && echo 1 || echo 0)" "هم‌رسانی در محیطِ بی‌share صادقانه غایب"

# ---- 4. ذخیره → تُستِ موفق ----
$AB eval "
(() => {
  const b = document.querySelector('.week-teacher button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'saving';
})()" >/dev/null 2>&1
sleep 2
R_SV=$($AB eval "document.body.innerText.includes('کارتِ معلمِ هفته ذخیره شد') ? 'TOAST-OK' : 'TOAST-MISS'" 2>/dev/null | fa)
chk "$([ "$R_SV" = "TOAST-OK" ] && echo 1)" "ذخیره → تُستِ «کارتِ معلمِ هفته ذخیره شد»"
sleep 4

# ---- 5. stubِ share + سیکلِ busyِ ذخیره برای رندرِ دوباره → دکمه حاضر ----
$AB eval "
(() => {
  const rec = { name: '', type: '', size: 0, calls: 0 };
  window.__qaFile = rec;
  Object.defineProperty(window.navigator, 'canShare', {
    configurable: true,
    value: (d) => !!(d && d.files && d.files.length),
  });
  Object.defineProperty(window.navigator, 'share', {
    configurable: true,
    value: (d) => {
      rec.calls++;
      const f = d && d.files && d.files[0];
      if (f) { rec.name = f.name; rec.type = f.type; rec.size = f.size; }
      return Promise.resolve();
    },
  });
  const b = document.querySelector('.week-teacher button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.click(); // سیکلِ busy — رندرِ دوباره با بازگشتش
  return 'STUBBED+RECLICK';
})()" >/dev/null 2>&1
sleep 3
R_SH=$($AB eval "document.querySelector('.week-teacher button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]') ? 'SHARE-ON' : 'SHARE-OFF'" 2>/dev/null | fa)
chk "$([ "$R_SH" = "SHARE-ON" ] && echo 1)" "پس از stub واقعی + رندرِ دوباره، دکمهٔ هم‌رسانی آمد"

# ---- 6. هم‌رسانی → Fileِ واقعی + تُست ----
$AB eval "
(() => {
  const b = document.querySelector('.week-teacher button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'sharing';
})()" >/dev/null 2>&1
sleep 3
R_F=$($AB eval "
(() => {
  const f = window.__qaFile || {};
  const ok = f.calls === 1 && f.name === 'vision2-week-teacher.png' && f.type === 'image/png' && f.size > 10000;
  return (ok ? 'FILE-OK' : 'FILE-BAD') + '|' + (f.name || '') + '|' + (f.type || '') + '|' + (f.size || 0);
})()" 2>/dev/null | fa)
chk "$(echo "$R_F" | grep -qF 'FILE-OK' && echo 1)" "stub Fileِ واقعی را گرفت ($R_F)"
R_T=$($AB eval "document.body.innerText.includes('کارتِ معلمِ هفته هم‌رسانی شد') ? 'TOAST-OK' : 'TOAST-MISS'" 2>/dev/null | fa)
chk "$([ "$R_T" = "TOAST-OK" ] && echo 1)" "هم‌رسانی موفق → تُست"
sleep 4

# ---- 7. AbortError → سکوتِ کامل ----
$AB eval "
(() => {
  Object.defineProperty(window.navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(new DOMException('user cancelled', 'AbortError')),
  });
  const b = document.querySelector('.week-teacher button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'aborting';
})()" >/dev/null 2>&1
sleep 3
R_Q=$($AB eval "
(() => {
  const t = document.body.innerText || '';
  return (t.includes('هم‌رسانی ممکن نشد') || t.includes('هم‌رسانی شد')) ? 'NOISY' : 'QUIET';
})()" 2>/dev/null | fa)
chk "$([ "$R_Q" = "QUIET" ] && echo 1)" "AbortError → سکوتِ کامل (لغوِ کاربر اتفاق نیست)"

# ---- 8. generic reject → تُستِ خطا ----
$AB eval "
(() => {
  Object.defineProperty(window.navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(new Error('network gone')),
  });
  const b = document.querySelector('.week-teacher button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'rejecting';
})()" >/dev/null 2>&1
sleep 3
R_E=$($AB eval "document.body.innerText.includes('هم‌رسانی ممکن نشد') ? 'ERR-OK' : 'ERR-MISS'" 2>/dev/null | fa)
chk "$([ "$R_E" = "ERR-OK" ] && echo 1)" "generic reject → تُستِ خطا"

# ---- 9. دارک: گرادیانِ بنفشِ خانوادهٔ معلم ----
DARK=$($AB eval "
(() => {
  document.documentElement.classList.add('dark');
  const el = document.querySelector('.week-teacher');
  if (!el) return '0|NO-PANEL';
  const bg = getComputedStyle(el).backgroundImage || '';
  const ok = bg.includes('59, 7, 100') || bg.includes('59,7,100');
  document.documentElement.classList.remove('dark');
  return ok ? '1|DARKGRAD' : '0|NOGRAD';
})()" 2>/dev/null | fa)
chk "$(echo "$DARK" | grep -q "DARKGRAD" && echo 1 || echo 0)" "دارک: گرادیانِ بنفشِ (59,7,100) اعمال شد"

# ---- 10. موبایلِ ۳۹۰ ----
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | fa)
chk "$([ "$OVF" = "0" ] && echo 1)" "موبایلِ ۳۹۰ سرریزِ صفر (got $OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

# ---- 11. کنسول ----
sleep 1
CON=$($AB console 2>/dev/null | grep -ciE "error|warn" || true)
chk "$([ "${CON:-1}" = "0" ] && echo 1)" "کنسولِ صفر (error/warn = $CON)"

$AB screenshot /home/z/my-project/scripts/qa-r121-final.png >/dev/null 2>&1 || true

# ---- 12. strip → پنلِ غایب (دکمه‌های کارت هم با آن می‌روند) ----
$AB eval "
(() => {
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  if (obj.state) { delete obj.state.dayHistory; delete obj.state.duelHistory; delete obj.state.goalMetDays; }
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'STRIPPED';
})()" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2
GONE=$($AB eval "(() => JSON.stringify({ gone: !document.querySelector('.week-teacher'), bandAlive: !!document.querySelector('.report-digest') }))()" 2>/dev/null | fa)
chk "$(echo "$GONE" | grep -q "gone:true" && echo 1 || echo 0)" "هفتهٔ خالی → پنل و کارتِ غایب (صادقانه)"
chk "$(echo "$GONE" | grep -q "bandAlive:true" && echo 1 || echo 0)" "باندِ هفته‌نامه بی‌پنل هم سرِ پا"

note "DONE" "fail=$fail"
exit $fail
