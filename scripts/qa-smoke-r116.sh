#!/usr/bin/env bash
# r117 smoke (reused r116) — تک‌سشن، فقط خواندنی (بدون seed، بدون نوشتن DB)
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4

# ---- 1. home renders ---------------------------------------------------------
R_H=$($AB eval "document.querySelector('h1') ? document.querySelector('h1').textContent.slice(0,40) : 'NO-H1'" 2>/dev/null | tr -d '"')
note "HOME" "h1=$R_H"
chk "$([ "$R_H" != "NO-H1" ] && [ -n "$R_H" ] && echo 1)" "home renders with h1"

# ---- 2. shelf + lessons present (r117 fix: SPA has no href routes; shelf = h2 + lesson-title buttons)
R_L=$($AB eval "
(() => {
  const shelf = [...document.querySelectorAll('h2')].some(e => e.textContent.includes('قفسهٔ کتاب'));
  const titles = [...document.querySelectorAll('button, a')].filter(e => /Understanding People|A Healthy Lifestyle/.test(e.textContent)).length;
  return (shelf ? 'SHELF:' : 'NO-SHELF:') + titles;
})()" 2>/dev/null | tr -d '"')
note "LESSONS" "$R_L"
chk "$(echo "$R_L" | grep -q 'SHELF:' && echo 1)" "shelf + lesson cards exist ($R_L)"

# ---- 3. dark toggle round-trip ----------------------------------------------
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]') || document.querySelector('button[aria-label=\"حالت روشن\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 1
R_D1=$($AB eval "document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF'" 2>/dev/null | tr -d '"')
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]') || document.querySelector('button[aria-label=\"حالت روشن\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 1
R_D2=$($AB eval "document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF'" 2>/dev/null | tr -d '"')
chk "$([ "$R_D1" = "DARK-ON" ] && [ "$R_D2" = "DARK-OFF" ] && echo 1)" "dark toggle round-trip ($R_D1 → $R_D2)"

# ---- 4. duel view via open-duel custom event --------------------------------
R_DV=$($AB eval "
(() => {
  window.dispatchEvent(new CustomEvent('open-duel'));
  return 'dispatched';
})()" 2>/dev/null | tr -d '"')
sleep 2
R_DV2=$($AB eval "
(() => {
  const t = document.body.innerText || '';
  return t.includes('نبرد') || t.includes('دوئل') ? 'DUEL-VISIBLE' : 'DUEL-MISSING';
})()" 2>/dev/null | tr -d '"')
chk "$([ "$R_DV2" = "DUEL-VISIBLE" ] && echo 1)" "duel view opens via open-duel ($R_DV2)"

# ---- 5. home returns + mobile 390 overflow ----------------------------------
$AB eval "window.dispatchEvent(new CustomEvent('open-duel')); 'ok'" >/dev/null 2>&1
sleep 1
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -d '"')
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

# ---- 6. console errors -------------------------------------------------------
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

# ---- 7. DB baseline (read-only count) ---------------------------------------
R_DB=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const attempts = await db.quizAttempt.count();
  const opens = await db.appOpen?.count?.() ?? 'n/a';
  console.log('attempts=' + attempts + ' app_open=' + opens);
  await db.\$disconnect();
})().catch(e => { console.log('DB-ERR ' + e.message.slice(0,80)); process.exit(0); });
" 2>/dev/null || echo "DB-READ-FAILED")
note "DB" "$R_DB (baseline — must be restored/unchanged after any QA writes)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
