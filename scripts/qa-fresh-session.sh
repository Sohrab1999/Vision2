#!/usr/bin/env bash
# ------------------------------------------------------------------
# r281 — نشستِ تازه و قطعیِ QA در یک فرمان.
# درسِ راندهای ۲۷۷–۲۸۰: مرورگرِ سرخورده (پروفایلِ تازه یا نام‌دارِ
# مانده) آنبوردینگ/پاپ‌آور را در وضعیتِ پیش‌بینی‌نشده می‌گذارد،
# کلیک‌های مصنوعی به inputِ لایهٔ رویی می‌روند و رگرسیون «شکستِ»
# جعلی می‌سازد. این اسکریپت همان ایدئومِ دستیِ localStorage.clear +
# reload را قطعی میکند و وضعیتِ نهایی را صادقانه گزارش میدهد.
# کاربرد:  bash scripts/qa-fresh-session.sh
# خروجی:   FRESH (آنبوردینگ مرئی) یا NOT-FRESH (+ریشهٔ علت)
# ------------------------------------------------------------------
set -uo pipefail

BASE="${1:-http://127.0.0.1:3000}"

agent-browser open "$BASE" > /dev/null 2>&1
sleep 2
# کلیدهای برنامه پاک می‌شوند؛ reload تا آنبوردینگِ تازه‌کار از persist
# بخواند (eval دوم جدا است — کانتکستِ eval با reload نوسازی می‌شود)
agent-browser eval "(()=>{localStorage.clear(); sessionStorage.clear(); location.reload(); return 'cleared';})()" > /dev/null 2>&1
sleep 4

STATE=$(agent-browser eval "(()=>{
  // نکتهٔ r281: Radix Dialog position:fixed است — offsetParent برایِ fixed
  // همیشه null است و فریب میدهد؛ سنجشِ درست computed-style + data-state است.
  const dlg=[...document.querySelectorAll('[role=dialog]')].some(d=>{
    const cs=getComputedStyle(d);
    return d.textContent?.includes('خوش آمدی') && cs.visibility!=='hidden' && cs.display!=='none' && d.getAttribute('data-state')==='open';
  });
  const trig=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')?.startsWith('پروفایل من'));
  return dlg ? 'FRESH' : 'NOT-FRESH profile=' + (trig?trig.getAttribute('aria-label'):'none');
})()" 2>/dev/null)

echo "result=${STATE}"
# CLI خروجیِ eval را در کوتیشن می‌پیچد — پيش از case می‌ریزيم
STATE="${STATE//\"/}"
case "${STATE}" in
  FRESH*) echo "FRESH: onboarding visible — session is a clean new learner" ;;
  *) echo "NOT-FRESH: onboarding NOT visible — inspect result above" ;;
esac
