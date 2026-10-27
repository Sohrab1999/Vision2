#!/bin/bash
# r339 — درایورِ رقمیِ بانک ۵۷ (MCQ ۴۰تایی؛ Q1 دستی انجام شد)
# کلیدِ چاپِ ص۲۷۵-۲۷۶: cabadbdbaa/bbbaabbbaa/bbbbcabbbc/abccbbccaa
# الگویِ پایدارِ r338: رقم ۱-۴ (انتخاب/ثبت) + Enterِ گذر؛ poll با innerText (شمارندهٔ لاتین)
set -u
KEYS="a badbdbaa"   # placeholder replaced below
KEYS=$(cat <<'EOF'
1
4
1
4
1
1
2
2
2
1
1
2
2
2
1
1
2
2
2
2
3
1
2
2
2
3
1
2
3
3
2
2
3
3
1
1
2
3
3
EOF
)
# Q2=a(1) Q3=b(2) Q4=a(1) Q5=d(4) Q6=b(2) Q7=d(4) Q8=b(2) Q9=a(1) Q10=a(1)
# Q11=b(2) Q12=b(2) Q13=b(2) Q14=a(1) Q15=a(1) Q16=b(2) Q17=b(2) Q18=b(2) Q19=a(1) Q20=a(1)
# Q21=b(2) Q22=b(2) Q23=b(2) Q24=b(2) Q25=c(3) Q26=a(1) Q27=b(2) Q28=b(2) Q29=b(2) Q30=c(3)
# Q31=a(1) Q32=b(2) Q33=c(3) Q34=c(3) Q35=b(2) Q36=b(2) Q37=c(3) Q38=c(3) Q39=a(1) Q40=a(1)

mapfile -t DIGS < <(printf '%s\n' 1 2 1 4 2 4 2 1 1 2 2 2 1 1 2 2 2 1 1 2 2 2 2 3 1 2 2 2 3 1 2 3 3 2 2 3 3 1 1)

poll_counter() {
  # شمارندهٔ فعلی «N / 40» از innerText
  agent-browser eval "((document.querySelector('main')?.innerText||'').match(/(\d+)\s*\/\s*40/)||['','x'])[1]" 2>/dev/null | tr -d '"'
}

have_feedback() {
  agent-browser eval "/پاسخ (درست|غلط)/.test(document.querySelector('main')?.innerText||'')" 2>/dev/null | tr -d '"'
}

CURRENT=$(poll_counter)
echo "start at counter=$CURRENT"

i=0
while [ "$CURRENT" != "40" ] && [ $i -lt 45 ]; do
  i=$((i+1))
  QN=$CURRENT
  DIG=${DIGS[$((QN-2))]}
  if [ -z "$DIG" ]; then echo "!! no digit for Q$QN"; break; fi
  # ۱) اگر در حالتِ بازخوردیم، اول گذر
  FB=$(have_feedback)
  if [ "$FB" = "true" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.25
    CURRENT=$(poll_counter)
    [ "$CURRENT" = "$QN" ] || { echo "!! desync after dismiss: want Q$QN got $CURRENT"; break; }
  fi
  # ۳) رقمِ پاسخ + سنجِ بازخورد
  agent-browser press "$DIG" >/dev/null 2>&1
  sleep 0.2
  FB=$(have_feedback)
  if [ "$FB" != "true" ]; then
    agent-browser press Enter >/dev/null 2>&1
    sleep 0.2
    FB=$(have_feedback)
  fi
  [ "$FB" != "true" ] && { echo "!! Q$QN: no feedback after digit $DIG"; break; }
  # ۴) گذر به سؤال بعد
  agent-browser press Enter >/dev/null 2>&1
  sleep 0.2
  CURRENT=$(poll_counter)
  echo "Q$QN digit=$DIG -> counter=$CURRENT"
done

echo "final counter=$CURRENT"
if [ "$CURRENT" = "40" ]; then echo "DRIVER-OK: reached Q40"; else echo "DRIVER-INCOMPLETE"; fi
