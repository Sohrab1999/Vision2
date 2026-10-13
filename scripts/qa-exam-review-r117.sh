#!/usr/bin/env bash
# r117 QA — «معلمِ کارنامه» تک‌سشنِ سرتاسری:
#   آزمون جامع ۱۰تایی → نتیجه → کارتِ معلم → تولیدِ واقعی AI → کشِ همان جلسه
#   → مسیرِ 400 صادق (curl) → تاریک → موبایل ۳۹۰ → کنسول
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
EV() { $AB eval "$1" 2>/dev/null | tr -d '"'; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 5

# ---- 0. DB baseline before the run ------------------------------------------
R_DB0=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => { console.log('attempts=' + (await db.quizAttempt.count()) + ' reviewCache=' + (await db.reviewCache.count())); await db.\$disconnect(); })().catch(e => console.log('DB-ERR'));
" 2>/dev/null)
note "DB0" "$R_DB0"

# ---- 1. navigate to the comprehensive exam ----------------------------------
R_NAV=$(EV "(() => { const b=[...document.querySelectorAll('button,a')].find(e=>e.textContent.trim()==='آزمون جامع'); if(!b) return 'NO-NAV'; b.click(); return 'nav-ok'; })()")
sleep 2
R_START=$(EV "(() => { const b=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('شروع آزمون جامع')); if(!b) return 'NO-START'; b.click(); return 'started'; })()")
sleep 2
note "EXAM" "nav=$R_NAV start=$R_START"
chk "$([ "$R_START" = "started" ] && echo 1)" "exam session started (10 questions, default count)"

# ---- 2. answer everything with option 0 (exam mode: choose → بعدی) ----------
DONE="no"
for i in $(seq 1 14); do
  R=$(EV "(() => {
    const opt = document.querySelector('[data-quiz-option=\"0\"]');
    if (opt) { opt.click(); return 'chose'; }
    return 'no-option';
  })()")
  sleep 0.5
  EV "(() => { const n = document.querySelector('[data-quiz-next]'); if (n) n.click(); return 'ok'; })()" >/dev/null
  sleep 0.7
  R_T=$(EV "(() => { const t=document.body.innerText||''; return (t.includes('نتیجهٔ نهایی')||t.includes('WEBBOOK CERTIFICATE')||t.includes('معلمِ کارنامه')) ? 'RESULT' : 'RUNNING'; })()")
  if [ "$R_T" = "RESULT" ]; then DONE="yes"; break; fi
done
chk "$([ "$DONE" = "yes" ] && echo 1)" "quiz finished and result screen reached (loops used: $i)"

# ---- 3. the teacher card is on the result screen -----------------------------
R_TC=$(EV "(() => { const el = document.querySelector('[aria-label=\"معلمِ کارنامه\"]'); return el ? 'TEACHER-CARD' : 'MISSING'; })()")
chk "$([ "$R_TC" = "TEACHER-CARD" ] && echo 1)" "teacher card mounted on the result screen"
$AB screenshot /home/z/my-project/qa-r117-01-result-teacher.png >/dev/null 2>&1

# ---- 4. ask the teacher — real AI generation ---------------------------------
EV "(() => { const b=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('نظرِ معلم را بخواه')); if(!b) return 'no'; b.click(); return 'asked'; })()" >/dev/null
sleep 1
R_LD=$(EV "(() => { const t=document.body.innerText||''; return t.includes('معلم دارد کارنامه‌ات را می‌خواند') ? 'LOADING' : 'NO-LOADING'; })()")
note "TEACHER" "loading state=$R_LD"
GOT="no"
for i in $(seq 1 40); do
  sleep 1
  R_P=$(EV "(() => { const p=document.querySelector('[data-ai-review]'); return p ? 'PANEL' : 'WAIT'; })()")
  if [ "$R_P" = "PANEL" ]; then GOT="yes"; break; fi
done
chk "$([ "$GOT" = "yes" ] && echo 1)" "teacher panel appeared (~${i}s)"
R_SEC=$(EV "(() => { const t=document.body.innerText||''; return (t.includes('نقطهٔ قوت')?1:0) + (t.includes('تمرینِ پیشنهادی')?1:0) + ((document.querySelector('[data-ai-review]')?.textContent||'').length>60?1:0); })()")
chk "$([ "$R_SEC" = "3" ] && echo 1)" "three sections present (got $R_SEC/3)"
R_CHIP=$(EV "(() => { const t=document.body.innerText||''; return t.includes('تازه') ? 'FRESH' : (t.includes('آماده') ? 'CACHED' : 'NO-CHIP'); })()")
note "CHIP" "$R_CHIP (first request)"
$AB screenshot /home/z/my-project/qa-r117-02-teacher-panel.png >/dev/null 2>&1

# ---- 5. second request, same session → the cache answers ---------------------
EV "(() => { const b=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('نظرِ تازهٔ معلم')); if(!b) return 'no'; b.click(); return 're-asked'; })()" >/dev/null
CACHED="no"
for i in $(seq 1 20); do
  sleep 1
  R_C=$(EV "(() => { const t=document.body.innerText||''; return t.includes('آماده') ? 'CACHED' : 'WAIT'; })()")
  if [ "$R_C" = "CACHED" ]; then CACHED="yes"; break; fi
done
chk "$([ "$CACHED" = "yes" ] && echo 1)" "same session fingerprint served from cache (chip=آماده, ~${i}s)"

# ---- 6. honest 400 paths via curl (route contract live) ----------------------
R_400=$(curl -s -X POST "$BASE/api/exam-review" -H 'content-type: application/json' --max-time 10 -d '{"ids":["9:ghost"],"answers":[null]}' | head -c 220)
echo "$R_400" | grep -q "بانکِ وب‌کتاب" && chk 1 "out-of-bank id → honest Persian 400" || chk 0 "out-of-bank 400 (got: $R_400)"
R_MIS=$(curl -s -X POST "$BASE/api/exam-review" -H 'content-type: application/json' --max-time 10 -d '{"ids":["l1-v1"],"answers":[]}' | head -c 220)
echo "$R_MIS" | grep -q "هم‌خوان" && chk 1 "length mismatch → Persian validation error" || chk 0 "mismatch 400 (got: $R_MIS)"

# ---- 7. dark mode renders the violet kernel gradient --------------------------
EV "(() => { const b=document.querySelector('button[aria-label=\"حالت شب\"]')||document.querySelector('button[aria-label=\"حالت روشن\"]'); if(b) b.click(); return 'ok'; })()" >/dev/null
sleep 1
R_D=$(EV "document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT'")
R_GR=$(EV "(() => { const el=document.querySelector('.quiz-teacher'); return el ? getComputedStyle(el).backgroundImage.includes('59, 7, 100') ? 'KERNEL' : getComputedStyle(el).backgroundImage.slice(0,60) : 'NO-EL'; })()")
chk "$([ "$R_D" = "DARK" ] && echo "$R_GR" = "KERNEL" ] && echo 1)" "dark mode: violet kernel gradient active ($R_GR)"
$AB screenshot /home/z/my-project/qa-r117-03-dark.png >/dev/null 2>&1
EV "(() => { const b=document.querySelector('button[aria-label=\"حالت شب\"]')||document.querySelector('button[aria-label=\"حالت روشن\"]'); if(b) b.click(); return 'ok'; })()" >/dev/null
sleep 1

# ---- 8. mobile 390 overflow ----------------------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$(EV "document.documentElement.scrollWidth - document.documentElement.clientWidth")
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

# ---- 9. console errors ---------------------------------------------------------
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

# ---- 10. DB delta after the run -----------------------------------------------
R_DB1=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => { console.log('attempts=' + (await db.quizAttempt.count()) + ' reviewCache=' + (await db.reviewCache.count())); await db.\$disconnect(); })().catch(e => console.log('DB-ERR'));
" 2>/dev/null)
note "DB1" "$R_DB1 (delta vs DB0 is QA-owned — cleanup restores)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
