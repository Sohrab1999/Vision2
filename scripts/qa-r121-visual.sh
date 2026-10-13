#!/usr/bin/env bash
# Task 121 — visual re-probe: week-teacher panel + card buttons screenshot
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fa() { tr -d '"\\'; }
$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4
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
  return 'SEEDED';
})()" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 3
$AB eval "
(() => {
  const btn = document.querySelector('.week-teacher button[aria-label=\"نظر معلم را برای این هفته بخواه\"]');
  if (!btn) return 'NO-BTN';
  btn.click();
  return 'clicked';
})()" >/dev/null 2>&1
for i in $(seq 1 17); do
  sleep 2
  D=$($AB eval "(() => { const el = document.querySelector('.week-teacher'); return el && el.querySelector('[data-week-review]') ? '1' : '0'; })()" 2>/dev/null | fa)
  [ "$D" = "1" ] && break
done
echo "VERDICT=$D"
$AB eval "
(() => {
  const b = document.querySelector('.week-teacher button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]');
  if (!b) return 'NO-BTN';
  b.scrollIntoView({ block: 'center' });
  return 'SCROLLED';
})()" 2>/dev/null
sleep 1
$AB screenshot /home/z/my-project/scripts/qa-r121-panel.png >/dev/null 2>&1 || true
$AB eval "
(() => {
  const s = document.querySelector('[data-week-review]');
  const save = !!s && !!s.querySelector('button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]');
  const share = !!s && !!s.querySelector('button[aria-label=\"هم‌رسانی عکس نظر معلم هفته\"]');
  const modal = !!document.querySelector('[role=\"dialog\"]');
  const chip = s ? ((s.textContent || '').includes('آماده') ? 'CACHED' : 'OTHER') : 'NO';
  return 'SAVE=' + (save?1:0) + '|SHARE=' + (share?1:0) + '|MODAL=' + (modal?1:0) + '|CHIP=' + chip;
})()" 2>/dev/null
