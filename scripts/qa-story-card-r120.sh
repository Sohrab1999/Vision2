#!/usr/bin/env bash
# Task 120 — «کارتِ داستان» — تک‌سشن agent-browser (الگوی r116 + stubِ r102)
# ① seedِ ۶ ستاره (کلیدهایِ r116 → کشِ داستان زنده) ② لانچر + دکمه‌هایِ غایبِ صادق
# ③ داستانِ واقعی ④ پنلِ قرارداد + دکمهٔ ذخیره حاضر/هم‌رسانیِ غایب
# ⑤ ذخیره → تُست ⑥ stubِ share +击键 → دکمه حاضر → Fileِ واقعی ⑦ AbortError سکوت
# ⑧ reject خطا ⑨ دارکِ sky ⑩ موبایلِ ۳۹۰ ⑪ کنسول
# DB: فقط app_open + رویدادهای story — پاکسازی با qa-db-cleanup-r116.cjs
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

# ---- 1. seed: onboarding skip + ۶ ستارهٔ r116 (کشِ داستان) + نام ----
$AB eval "
(() => {
  try { localStorage.setItem('vision2-onboarded', '1'); } catch {}
  const raw = localStorage.getItem('vision2-study-v1');
  const cur = raw ? JSON.parse(raw) : {};
  const state = { ...(cur.state || {}) };
  state.starredWords = ['1:ability','1:action','1:add','2:achieve','3:factor','2:active'];
  state.userName = 'آزمون‌گر';
  localStorage.setItem('vision2-study-v1', JSON.stringify({ ...cur, state, version: 0 }));
  return 'SEEDED-6';
})()" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4

# ---- 2. my-words از دکمهٔ ابزارها ----
$AB eval "
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b =>
    b.textContent && b.textContent.includes('واژه‌های من') && b.textContent.includes('واژه‌نامهٔ شخصی'));
  if (!btn) return 'NO-BTN';
  btn.click();
  return 'clicked';
})()" >/dev/null 2>&1
sleep 2
R_MW=$($AB eval "document.body.innerText.includes('داستانِ واژه‌های من') ? 'LAUNCHER' : 'MISSING'" 2>/dev/null | fa)
chk "$([ "$R_MW" = "LAUNCHER" ] && echo 1)" "my-words باز شد و لانچرِ داستان حاضر"

# ---- 3. صداقتِ پیش از داستان: دکمه‌های کارت هنوز غایب ----
R_PRE=$($AB eval "
(() => {
  const save = !!document.querySelector('button[aria-label=\"ذخیرهٔ عکس داستان\"]');
  const share = !!document.querySelector('button[aria-label=\"هم‌رسانی عکس داستان\"]');
  return (save ? 'SAVE-ON' : 'SAVE-OFF') + '|' + (share ? 'SHARE-ON' : 'SHARE-OFF');
})()" 2>/dev/null | fa)
chk "$(echo "$R_PRE" | grep -qF 'SAVE-OFF|SHARE-OFF' && echo 1)" "بی‌داستان هیچ دکمهٔ کارتی نیست ($R_PRE)"

# ---- 4. ساختِ داستان (AI واقعی / کشِ r116) ----
$AB eval "
(() => {
  const b = document.querySelector('button[aria-label=\"ساخت داستان با واژه‌های نشان‌شده\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'forging';
})()" >/dev/null 2>&1
SLEEP=0; FOUND=0
while [ $SLEEP -lt 40 ]; do
  sleep 2; SLEEP=$((SLEEP+2))
  FOUND=$($AB eval "document.querySelector('[data-ai-story]') ? 1 : 0" 2>/dev/null | fa)
  [ "$FOUND" = "1" ] && break
done
chk "$([ "$FOUND" = "1" ] && echo 1)" "داستان در ${SLEEP}s آمد (مسیرِ واقعی)"

# ---- 5. قراردادِ پنل + دکمه‌های کارت: ذخیره حاضر / هم‌رسانیِ غایبِ صادق ----
R_P=$($AB eval "
(() => {
  const panel = document.querySelector('[data-ai-story]');
  if (!panel) return 'NO-PANEL';
  const marks = panel.querySelectorAll('mark').length;
  const text = panel.innerText || '';
  const chip = text.includes('آماده') ? 'CACHED' : (text.includes('تازه') ? 'FRESH' : (text.includes('حالت آفلاین') ? 'FALLBACK' : 'UNKNOWN'));
  const save = !!panel.querySelector('button[aria-label=\"ذخیرهٔ عکس داستان\"]');
  const share = !!panel.querySelector('button[aria-label=\"هم‌رسانی عکس داستان\"]');
  return ['MARKS-' + marks, chip, save ? 'SAVE-ON' : 'SAVE-OFF', share ? 'SHARE-ON' : 'SHARE-OFF'].join('|');
})()" 2>/dev/null | fa)
note "INFO" "panel: $R_P"
chk "$(echo "$R_P" | grep -qE 'MARKS-[1-9]' && echo 1)" "واژه‌های هدف با mark برجسته‌اند"
chk "$(echo "$R_P" | grep -qE '\|(CACHED|FRESH)\|' && echo 1)" "چیپِ منبعِ صادق (تازه/آماده)"
chk "$(echo "$R_P" | grep -qF 'SAVE-ON' && echo 1)" "دکمهٔ «ذخیرهٔ کارتِ داستان» حاضر"
chk "$(echo "$R_P" | grep -qF 'SHARE-OFF' && echo 1)" "هم‌رسانی در محیطِ بی‌share صادقانه غایب"

# ---- 6. ذخیره → تُستِ موفق ----
$AB eval "
(() => {
  const b = document.querySelector('button[aria-label=\"ذخیرهٔ عکس داستان\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'saving';
})()" >/dev/null 2>&1
sleep 2
R_SV=$($AB eval "document.body.innerText.includes('کارتِ داستان ذخیره شد') ? 'TOAST-OK' : 'TOAST-MISS'" 2>/dev/null | fa)
chk "$([ "$R_SV" = "TOAST-OK" ] && echo 1)" "ذخیره → تُستِ «کارتِ داستان ذخیره شد»"
sleep 4  # تُست‌ها ۳ثانیه‌ای‌اند — قبل از گامِ سکوت پاک شوند

# ---- 7. stubِ share +击键ِ رندرِ دوباره → دکمه حاضر ----
$AB eval "
(() => {
  const rec = { name: '', type: '', size: 0, calls: 0 };
  window.__qaFile = rec;
  const files = [];
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
  const inp = document.querySelector('input[placeholder*=\"جستجو\"]');
  if (!inp) return 'NO-INPUT';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(inp, 'a');
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  return 'STUBBED';
})()" >/dev/null 2>&1
sleep 2
R_SH=$($AB eval "document.querySelector('[data-ai-story] button[aria-label=\"هم‌رسانی عکس داستان\"]') ? 'SHARE-ON' : 'SHARE-OFF'" 2>/dev/null | fa)
chk "$([ "$R_SH" = "SHARE-ON" ] && echo 1)" "پس از stub واقعی + رندرِ دوباره، دکمهٔ هم‌رسانی آمد"

# ---- 8. هم‌رسانی → Fileِ واقعی + تُستِ موفق ----
$AB eval "
(() => {
  const b = document.querySelector('[data-ai-story] button[aria-label=\"هم‌رسانی عکس داستان\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'sharing';
})()" >/dev/null 2>&1
sleep 3
R_F=$($AB eval "
(() => {
  const f = window.__qaFile || {};
  const ok = f.calls === 1 && f.name === 'vision2-story.png' && f.type === 'image/png' && f.size > 10000;
  return (ok ? 'FILE-OK' : 'FILE-BAD') + '|' + (f.name || '') + '|' + (f.type || '') + '|' + (f.size || 0);
})()" 2>/dev/null | fa)
chk "$(echo "$R_F" | grep -qF 'FILE-OK' && echo 1)" "stub Fileِ واقعی را گرفت ($R_F)"
R_T=$($AB eval "document.body.innerText.includes('کارتِ داستان هم‌رسانی شد') ? 'TOAST-OK' : 'TOAST-MISS'" 2>/dev/null | fa)
chk "$([ "$R_T" = "TOAST-OK" ] && echo 1)" "هم‌رسانی موفق → تُست"
sleep 4

# ---- 9. AbortError → سکوتِ کامل ----
$AB eval "
(() => {
  Object.defineProperty(window.navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(new DOMException('user cancelled', 'AbortError')),
  });
  const b = document.querySelector('[data-ai-story] button[aria-label=\"هم‌رسانی عکس داستان\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'aborting';
})()" >/dev/null 2>&1
sleep 3
R_Q=$($AB eval "
(() => {
  const t = document.body.innerText || '';
  const err = t.includes('هم‌رسانی ممکن نشد');
  const ok = t.includes('هم‌رسانی شد');
  return (err || ok) ? 'NOISY' : 'QUIET';
})()" 2>/dev/null | fa)
chk "$([ "$R_Q" = "QUIET" ] && echo 1)" "AbortError → سکوتِ کامل (لغوِ کاربر اتفاق نیست)"

# ---- 10. generic reject → تُستِ خطا ----
$AB eval "
(() => {
  Object.defineProperty(window.navigator, 'share', {
    configurable: true,
    value: () => Promise.reject(new Error('network gone')),
  });
  const b = document.querySelector('[data-ai-story] button[aria-label=\"هم‌رسانی عکس داستان\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'rejecting';
})()" >/dev/null 2>&1
sleep 3
R_E=$($AB eval "document.body.innerText.includes('هم‌رسانی ممکن نشد') ? 'ERR-OK' : 'ERR-MISS'" 2>/dev/null | fa)
chk "$([ "$R_E" = "ERR-OK" ] && echo 1)" "generic reject → تُستِ خطا"

# ---- 11. دارک: گرادیانِ skyِ کرنل ----
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]'); if (b) b.click(); return 1; })()" >/dev/null 2>&1
sleep 1
R_D=$($AB eval "
(() => {
  const card = document.querySelector('.mywords-story');
  if (!card) return 'NO-CARD';
  const bg = getComputedStyle(card).backgroundImage || '';
  return [document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF', bg.includes('8, 47, 60') ? 'GRAD-SKY' : 'GRAD-OTHER'].join('|');
})()" 2>/dev/null | fa)
chk "$(echo "$R_D" | grep -qF 'DARK-ON' && echo 1)" "دارک روشن شد"
chk "$(echo "$R_D" | grep -qF 'GRAD-SKY' && echo 1)" "گرادیانِ skyِ کرنلِ پنلِ داستان در تاریکی"

# ---- 12. موبایلِ ۳۹۰ ----
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_O=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | fa)
chk "$([ "$R_O" = "0" ] && echo 1)" "موبایلِ ۳۹۰ سرریزِ صفر (got $R_O)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true
$AB eval "(() => { document.documentElement.classList.remove('dark'); return 1; })()" >/dev/null 2>&1

# ---- 13. کنسول ----
sleep 1
R_C=$($AB console 2>/dev/null | grep -ciE "error|warn" || true)
chk "$([ "$R_C" = "0" ] && echo 1)" "کنسولِ صفر (error/warn = $R_C)"

$AB screenshot /home/z/my-project/scripts/qa-r120-final.png >/dev/null 2>&1 || true
note "DONE" "fail=$fail"
exit $fail
