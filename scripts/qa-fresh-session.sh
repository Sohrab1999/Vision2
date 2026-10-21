#!/usr/bin/env bash
# ------------------------------------------------------------------
# r281 — نشستِ تازه و قطعیِ QA در یک فرمان.
# r282 — دو مد:
#   ① نوکار: bash scripts/qa-fresh-session.sh [--base URL]
#      localStorage/sessionStorage پاک → reload → آنبوردینگِ تازه‌کار
#      خروجی: FRESH یا NOT-FRESH (+ریشهٔ علت)
#   ② seed نام‌دار: bash scripts/qa-fresh-session.sh --name "آرش ر"
#      پاک‌سازی + تزریقِ persistِ حداقلی (userName + onboarded) → reload
#      → کاربرِ نام‌دارِ بازگشته، بدونِ رقصِ UI (بندِ ① راندِ ۲۸۱ — شش راند باز بود)
#      خروجی: SEEDED یا SEEDED-FAILED (+ریشهٔ علت)
# دامنهٔ صادقِ seed: حالتِ کلاینت را نام‌دار میکند (پاپ‌آور/خوش‌آمد/رگرسیون‌های
# نام) — userId از سرور نمیآید، پس رگرسیونِ «ردیفِ خودیِ فید» (تطبیقِ userId
# راندِ ۲۸۰) با seed پوشش داده نمیشود؛ آن مسیر فقط با فعالیتِ واقعی بسته میشود.
# ------------------------------------------------------------------
set -uo pipefail

BASE="http://127.0.0.1:3000"
NAME=""

# پارسِ آرگومان: --name X → seed نام‌دار؛ --base URL → مقصد؛ غیرِ -- → BASE (سازگاریِ قدیم)
while [ $# -gt 0 ]; do
  case "$1" in
    --name) NAME="${2:-}"; shift 2 ;;
    --base) BASE="${2:-$BASE}"; shift 2 ;;
    *) BASE="$1"; shift ;;
  esac
done

agent-browser open "$BASE" > /dev/null 2>&1
sleep 2

if [ -z "$NAME" ]; then
  # ---------- مدِ ①: نشستِ تازه‌کار ----------
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

  STATE="${STATE//\"/}"
  case "${STATE}" in
    FRESH*) echo "result=FRESH"; echo "FRESH: onboarding visible — session is a clean new learner" ;;
    *)      echo "result=${STATE}"; echo "NOT-FRESH: onboarding NOT visible — inspect result above" ;;
  esac
  exit 0
fi

# ---------- مدِ ②: seed نام‌دار ----------
# نام با نقل‌قول/بک‌اسلش/سطرِ نو به فرمانِ eval آسیب میزند — زودتر رد میکنیم
case "$NAME" in
  *"'"*|*\"*|*\\*|*$'\n'*) echo "result=SEEDED-FAILED"; echo "SEEDED-FAILED: name must not contain quote/backslash/newline"; exit 1 ;;
esac
if [ -z "$NAME" ] || [ ${#NAME} -lt 2 ]; then
  echo "result=SEEDED-FAILED"; echo "SEEDED-FAILED: name too short"; exit 1
fi

INITIAL="${NAME:0:1}"
agent-browser eval "(()=>{
  localStorage.clear(); sessionStorage.clear();
  // seedِ حداقلی: zustand persist فقط کلیدهایِ حاضر را رویِ پیش‌فرضها merge میکند؛
  // userName و onboarded هر دو در PERSIST_KEYS هستند (schema.ts:373/420).
  localStorage.setItem('vision2-study-v1', JSON.stringify({state:{userName:'${NAME}', onboarded:true}, version:0}));
  location.reload(); return 'seeded';
})()" > /dev/null 2>&1
sleep 4

STATE=$(agent-browser eval "(()=>{
  const dlg=[...document.querySelectorAll('[role=dialog]')].some(d=>{
    const cs=getComputedStyle(d);
    return d.textContent?.includes('خوش آمدی') && cs.visibility!=='hidden' && cs.display!=='none' && d.getAttribute('data-state')==='open';
  });
  if (dlg) return 'FAILED-REASON=ONBOARDING-STILL-OPEN';
  const trig=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')?.startsWith('پروفایل من'));
  if (!trig) return 'FAILED-REASON=NO-PROFILE-TRIGGER';
  const initial=trig.textContent?.trim()||'';
  if (!initial.includes('${INITIAL}')) return 'FAILED-REASON=WRONG-INITIAL got=' + initial;
  let stored='';
  try { const raw=localStorage.getItem('vision2-study-v1'); stored = raw ? (JSON.parse(raw)?.state?.userName||'') : ''; } catch {}
  if (stored !== '${NAME}') return 'FAILED-REASON=STORE-MISMATCH got=' + stored;
  return 'SEEDED name=' + stored + ' initial=' + initial;
})()" 2>/dev/null)

STATE="${STATE//\"/}"
case "${STATE}" in
  SEEDED*) echo "result=SEEDED"; echo "${STATE} — named returning learner ready (no onboarding)" ;;
  *)       echo "result=${STATE}"; echo "SEEDED-FAILED: inspect reason above" ;;
esac
