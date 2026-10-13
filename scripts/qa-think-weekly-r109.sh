#!/usr/bin/env bash
# Task 109 — «فکرِ هفته» در هفته‌نامه — تک‌سشن agent-browser
# ① seedِ نبردهای فکردار/بی‌فکر ② ری‌اوپن (skipHydration فقط در mount می‌خواند — درسِ همین اسکریپت)
# ③ خطِ فکر با ممیزِ فارسی + چیپِ پوششِ ناقص ④ بی‌فکردار → خطِ غایب، بلوکِ حاضر
# ⑤ فکرِ هفتهٔ پیش → نشتِ صفر ⑥ موبایلِ ۳۹۰ سرریزِ صفر ⑦ کنسولِ صفر
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }
fa() { tr -d '"\\'; }

$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB console --clear >/dev/null 2>&1 || true

# ---- A. seed: ۲ فکردار + ۱ بی‌فکر (همین هفته) + ۱ فکردارِ هفتهٔ پیش ----
SEED=$($AB eval "
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const rec = (id, ago, outcome, myScore, oppScore, think) => ({
    id, day: key(ago), outcome, reason: 'finished',
    opponent: 'حریفِ' + id, opponentColor: 'rose',
    myScore, oppScore, myCorrect: 9, oppCorrect: 7, answered: 10, total: 10,
    durationSec: 80, ...(think ? { think } : {})
  });
  const hist = [
    rec('a', 0, 'win', 1100, 800, { avgMs: 800, minMs: 200, maxMs: 1500, seen: 4, total: 10 }),
    rec('b', 2, 'loss', 500, 900, { avgMs: 1200, minMs: 300, maxMs: 2000, seen: 2, total: 10 }),
    rec('c', 1, 'win', 700, 600, null),
    rec('old', 9, 'win', 999, 100, { avgMs: 100, minMs: 50, maxMs: 200, seen: 9, total: 10 }),
  ];
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, { duelHistory: hist, introDone: true, userName: 'آزمون‌گر' });
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'SEEDED:' + hist.length;
})()
" 2>/dev/null | fa)
chk "$(echo "$SEED" | grep -q 'SEEDED:4' && echo 1 || echo 0)" "seed ۴ رکورد در localStorage"

# ---- B. ری‌اوپن — استور skipHydration دارد؛ seed فقط در mount خوانده می‌شود ----
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2

# ---- C. خطِ فکرِ هفته ----
THINK=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  return JSON.stringify({
    thinkLine: t.includes('فکرِ میانگین'),
    avgPart: t.includes('فکرِ میانگین ۰٫۹ ثانیه'),
    fastPart: t.includes('سریع‌ترین ۰٫۲ ثانیه'),
    partialChip: t.includes('ثبت برای ۶ از ۲۰ سؤال'),
    oldThinkLeak: t.includes('۰٫۱ ثانیه'),
    winRate: t.includes('نرخِ برد'),
  });
})()
" 2>/dev/null | fa)
note "INFO" "think-probe: $THINK"
chk "$(echo "$THINK" | grep -q "thinkLine:true" && echo 1 || echo 0)" "خطِ فکر حاضر"
chk "$(echo "$THINK" | grep -q "avgPart:true" && echo 1 || echo 0)" "میانگینِ وزن‌دار ۹۳۳ms → «۰٫۹»"
chk "$(echo "$THINK" | grep -q "fastPart:true" && echo 1 || echo 0)" "سریع‌ترین ۲۰۰ms → «۰٫۲» (کمینهٔ minMsهای فکردارِ این هفته)"
chk "$(echo "$THINK" | grep -q "partialChip:true" && echo 1 || echo 0)" "چیپِ «ثبت برای ۶ از ۲۰ سؤال» (پوششِ ناقص)"
chk "$(echo "$THINK" | grep -q "oldThinkLeak:false" && echo 1 || echo 0)" "فکرِ هفتهٔ پیش (۰٫۱) نشت نکرده"
chk "$(echo "$THINK" | grep -q "winRate:true" && echo 1 || echo 0)" "بلوکِ نبرد با نرخِ برد حاضر"

# ---- D. حذفِ فکرها → ری‌اوپن → خطِ غایب ولی بلوکِ حاضر ----
$AB eval "
(() => {
  const raw = localStorage.getItem('vision2-study-v1');
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const h = (obj.state?.duelHistory || []).map(r => { const { think, ...rest } = r; return rest; });
  obj.state = Object.assign({}, obj.state, { duelHistory: h });
  localStorage.setItem('vision2-study-v1', JSON.stringify(obj));
  return 'STRIPPED:' + h.length;
})()
" >/dev/null 2>&1
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2
ABSENT=$($AB eval "
(() => {
  const el = document.querySelector('.duel-week');
  if (!el) return 'NO-BLOCK';
  const t = el.textContent || '';
  return JSON.stringify({ thinkGone: !t.includes('فکرِ میانگین'), countChip: t.includes('نبرد این هفته') });
})()
" 2>/dev/null | fa)
note "INFO" "absent-probe: $ABSENT"
chk "$(echo "$ABSENT" | grep -q "thinkGone:true" && echo 1 || echo 0)" "بی‌فکردار → خطِ فکر غایب، بلوکِ نبرد حاضر"
chk "$(echo "$ABSENT" | grep -q "countChip:true" && echo 1 || echo 0)" "چیپِ شمارشِ نبرد سرِ پا"

# ---- E. موبایلِ ۳۹۰: سرریزِ صفر ----
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

note "DONE" "fail=$fail"
exit $fail
