#!/usr/bin/env bash
# Task 120 — visual re-probe: clean screenshot of the story panel + card buttons
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fa() { tr -d '"\\'; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval "
(() => {
  const raw = localStorage.getItem('vision2-study-v1');
  const cur = raw ? JSON.parse(raw) : {};
  const state = { ...(cur.state || {}) };
  state.onboarded = true;
  state.starredWords = ['1:ability','1:action','1:add','2:achieve','3:factor','2:active'];
  state.userName = 'آزمون‌گر';
  localStorage.setItem('vision2-study-v1', JSON.stringify({ ...cur, state, version: 0 }));
  return 'SEEDED-ONBOARDED';
})()" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval "
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b =>
    b.textContent && b.textContent.includes('واژه‌های من') && b.textContent.includes('واژه‌نامهٔ شخصی'));
  if (btn) btn.click();
  return 'nav';
})()" >/dev/null 2>&1
sleep 2
$AB eval "
(() => {
  const b = document.querySelector('button[aria-label=\"ساخت داستان با واژه‌های نشان‌شده\"]');
  if (b) b.click();
  return 'forging';
})()" >/dev/null 2>&1
for i in $(seq 1 20); do
  sleep 2
  D=$($AB eval "document.querySelector('[data-ai-story]') ? '1' : '0'" 2>/dev/null | fa)
  [ "$D" = "1" ] && break
done
echo "STORY=$D after ${i*2}s"
$AB eval "(() => { const el = document.querySelector('[data-ai-story]'); if (el) el.scrollIntoView({ block: 'center' }); return 'scrolled'; })()" >/dev/null 2>&1
sleep 1
$AB screenshot /home/z/my-project/scripts/qa-r120-panel.png >/dev/null 2>&1 || true
B=$($AB eval "
(() => {
  const p = document.querySelector('[data-ai-story]');
  const save = !!p && !!p.querySelector('button[aria-label=\"ذخیرهٔ عکس داستان\"]');
  const share = !!p && !!p.querySelector('button[aria-label=\"هم‌رسانی عکس داستان\"]');
  const modal = !!document.querySelector('[role=\"dialog\"]');
  return 'SAVE=' + (save?1:0) + '|SHARE=' + (share?1:0) + '|MODAL=' + (modal?1:0);
})()" 2>/dev/null | fa)
echo "STATE: $B"
