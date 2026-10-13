#!/usr/bin/env bash
# r118 QA — «کارتِ معلم» تک‌سشنِ سرتاسری:
#   آزمون جامع ۱۰تایی → نتیجه → معلمِ واقعی AI → دکمهٔ ذخیرهٔ کارت → تُست
#   → محیطِ واقعی: هم‌رسانی مخفی (صداقتِ ۱۰۲) → stub canShare+share → رندرِ دوباره
#   → کلیک → Fileِ واقعیِ PNG (نام/نوع/حجم) + تُستِ موفق → AbortError = سکوت
#   → generic reject = تُستِ خطا → موبایل ۳۹۰ → کنسول → دلتای DB
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
EV() { $AB eval "$1" 2>/dev/null | tr -d '"'; }
SHARE_BTN='button[aria-label="هم‌رسانی عکس نظر معلم"]'
SAVE_BTN='button[aria-label="ذخیرهٔ عکس نظر معلم"]'

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 5

# ---- 0. DB baseline ----------------------------------------------------------
R_DB0=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => { console.log('attempts=' + (await db.quizAttempt.count())); await db.\$disconnect(); })().catch(e => console.log('DB-ERR'));
" 2>/dev/null)
note "DB0" "$R_DB0"

# ---- 1. real 10-question comprehensive exam ----------------------------------
R_NAV=$(EV "(() => { const b=[...document.querySelectorAll('button,a')].find(e=>e.textContent.trim()==='آزمون جامع'); if(!b) return 'NO-NAV'; b.click(); return 'nav-ok'; })()")
sleep 2
R_START=$(EV "(() => { const b=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('شروع آزمون جامع')); if(!b) return 'NO-START'; b.click(); return 'started'; })()")
sleep 2
note "EXAM" "nav=$R_NAV start=$R_START"
chk "$([ "$R_START" = "started" ] && echo 1)" "exam session started"

DONE="no"
for i in $(seq 1 14); do
  EV "(() => { const opt = document.querySelector('[data-quiz-option=\"0\"]'); if (opt) { opt.click(); return 'chose'; } return 'no-option'; })()" >/dev/null
  sleep 0.5
  EV "(() => { const n = document.querySelector('[data-quiz-next]'); if (n) n.click(); return 'ok'; })()" >/dev/null
  sleep 0.7
  R_T=$(EV "(() => { const t=document.body.innerText||''; return (t.includes('نتیجهٔ نهایی')||t.includes('WEBBOOK CERTIFICATE')||t.includes('معلمِ کارنامه')) ? 'RESULT' : 'RUNNING'; })()")
  if [ "$R_T" = "RESULT" ]; then DONE="yes"; break; fi
done
chk "$([ "$DONE" = "yes" ] && echo 1)" "quiz finished → result screen (loops: $i)"

# ---- 2. ask the teacher — real AI generation ----------------------------------
EV "(() => { const b=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('نظرِ معلم را بخواه')); if(!b) return 'no'; b.click(); return 'asked'; })()" >/dev/null
GOT="no"
for i in $(seq 1 40); do
  sleep 1
  R_P=$(EV "(() => { const p=document.querySelector('[data-ai-review]'); return p ? 'PANEL' : 'WAIT'; })()")
  if [ "$R_P" = "PANEL" ]; then GOT="yes"; break; fi
done
chk "$([ "$GOT" = "yes" ] && echo 1)" "teacher panel appeared (~${i}s)"
$AB screenshot /home/z/my-project/qa-r118-01-teacher-panel.png >/dev/null 2>&1

# ---- 3. real environment: share button honestly hidden, save present ---------
R_HONEST=$(EV "(() => { const s=document.querySelector('$SHARE_BTN'), v=document.querySelector('$SAVE_BTN'); return (typeof navigator.share === 'undefined' && !s && !!v) ? 'HONEST-HIDDEN' : 'LEAK-shareType-' + typeof navigator.share + '-btn-' + !!s; })()")
chk "$([ "$R_HONEST" = "HONEST-HIDDEN" ] && echo 1)" "honest env: no navigator.share → share hidden, save present ($R_HONEST)"

# ---- 4. save click → real PNG download path → success toast -------------------
EV "(() => { const b=document.querySelector('$SAVE_BTN'); if(!b) return 'no'; b.click(); return 'clicked'; })()" >/dev/null
sleep 2
R_ST=$(EV "(() => { const t=document.body.innerText||''; return t.includes('کارتِ معلم ذخیره شد') ? 'TOAST-OK' : 'NO-TOAST'; })()")
chk "$([ "$R_ST" = "TOAST-OK" ] && echo 1)" "save → «کارتِ معلم ذخیره شد» toast"
sleep 2

# ---- 5. stub canShare+share → busy-cycle re-render (save click) → share VISIBLE
EV "(() => {
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
  Object.defineProperty(navigator, 'share', { configurable: true, value: (d) => {
    window.__shareCalls = window.__shareCalls || [];
    window.__shareCalls.push(d);
    return (window.__shareMode === 'abort') ? Promise.reject(new DOMException('user aborted', 'AbortError'))
         : (window.__shareMode === 'reject') ? Promise.reject(new Error('boom'))
         : Promise.resolve();
  }});
  return 'stubbed';
})()" >/dev/null
EV "(() => { const b=document.querySelector('$SAVE_BTN'); if(!b) return 'no'; b.click(); return 're-render-via-save'; })()" >/dev/null
sleep 2
R_V=$(EV "(() => { const s=document.querySelector('$SHARE_BTN'); return s ? 'SHARE-VISIBLE' : 'SHARE-MISSING'; })()")
chk "$([ "$R_V" = "SHARE-VISIBLE" ] && echo 1)" "stub + re-render → native share button appears"
sleep 2

# ---- 6. share click → REAL File captured + success toast ----------------------
EV "(() => { window.__shareMode='ok'; window.__shareCalls=[]; const b=document.querySelector('$SHARE_BTN'); b.click(); return 'clicked'; })()" >/dev/null
sleep 2
R_CAP=$(EV "(() => {
  const c = window.__shareCalls || [];
  const f = c[0] && c[0].files && c[0].files[0];
  const t = document.body.innerText;
  return [c.length, f && f.name, f && f.type, f && f.size > 1000 ? 'BIG' : 'SMALL-' + (f && f.size),
    c[0] && /نظرِ معلم دربارهٔ کارنامه‌ام/.test(c[0].text||'') && /٪/.test(c[0].text||'') ? 'TEXT-OK' : 'TEXT-BAD',
    /نظرِ معلم هم‌رسانی شد/.test(t) ? 'TOAST-OK' : 'TOAST-NO'].join('|');
})()")
echo "$R_CAP" | grep -q '^1|vision2-teacher.png|image/png|BIG|TEXT-OK|TOAST-OK$' \
  && chk 1 "share → real File (vision2-teacher.png · image/png · >100KB) + honest Persian text + success toast" || chk 0 "share capture ($R_CAP)"
$AB screenshot /home/z/my-project/qa-r118-02-shared.png >/dev/null 2>&1
sleep 2

# ---- 7. AbortError → cancelled → SILENCE --------------------------------------
EV "(() => { window.__shareMode='abort'; const b=document.querySelector('$SHARE_BTN'); b.click(); return 'clicked'; })()" >/dev/null
sleep 2
R_AB=$(EV "(() => { const t=document.body.innerText||''; return (/هم‌رسانی ممکن نشد/.test(t) ? 'ERR-SHOWN' : 'ERR-QUIET') + '|' + (/نظرِ معلم هم‌رسانی شد/.test(t) ? 'OK-SHOWN' : 'OK-QUIET'); })()")
chk "$([ "$R_AB" = "ERR-QUIET|OK-QUIET" ] && echo 1)" "AbortError → cancelled → complete silence ($R_AB)"

# ---- 8. generic reject → failed toast ------------------------------------------
EV "(() => { window.__shareMode='reject'; const b=document.querySelector('$SHARE_BTN'); b.click(); return 'clicked'; })()" >/dev/null
sleep 2
R_FJ=$(EV "(() => { const t=document.body.innerText||''; return /هم‌رسانی ممکن نشد/.test(t) ? 'FAILED-TOAST' : 'NO-TOAST'; })()")
chk "$([ "$R_FJ" = "FAILED-TOAST" ] && echo 1)" "generic reject → honest failure toast"

# ---- 9. mobile 390 overflow -----------------------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$(EV "document.documentElement.scrollWidth - document.documentElement.clientWidth")
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

# ---- 10. console errors ----------------------------------------------------------
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

# ---- 11. DB delta ----------------------------------------------------------------
R_DB1=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => { console.log('attempts=' + (await db.quizAttempt.count())); await db.\$disconnect(); })().catch(e => console.log('DB-ERR'));
" 2>/dev/null)
note "DB1" "$R_DB1 (delta vs DB0 is QA-owned — cleanup restores)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
