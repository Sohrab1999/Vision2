#!/usr/bin/env bash
# بازبینی سه پروب پیش‌انتخاب — خروجی تخت بدون JSON تا گرپ دقیق بماند
set -u
AB="bunx agent-browser"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

pq(){ $AB press Control+k >/dev/null 2>&1; sleep 0.8; \
  $AB eval "(()=>{const inp=document.querySelector('.command-palette input');if(!inp)return 'no-input';const st=Object.getPrototypeOf(inp);const set=Object.getOwnPropertyDescriptor(st,'value').set;set.call(inp,'$1');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed'})()" >/dev/null 2>&1; sleep 0.8; }

chipOf(){ # $1=accent class fragment
  $AB eval "(()=>{const chips=[...document.querySelectorAll('button')].filter(b=>/^[۰-۹]+ تست$/.test((b.textContent||'').trim()));const act=chips.find(b=>(b.className||'').includes('$1'));return act?('chip='+act.textContent.trim()):('chips='+chips.length)})()" 2>&1
}

# بازگشت به خانه اول (برای مسیر cold-mount)
pq "خانه"; $AB press Enter >/dev/null 2>&1; sleep 2

echo "=== A) cold-mount: «آزمون ۲۰» ==="
pq "آزمون ۲۰"; $AB press Enter >/dev/null 2>&1; sleep 3
R=$(chipOf "border-emerald-500"); echo "  $R"
echo "$R" | grep -q "chip=۲۰ تست" && ok "cold-mount ۲۰" || bad "cold-mount: $R"

echo "=== B) نمای باز: «آزمون ۳۰» (رویداد) ==="
pq "آزمون ۳۰"; $AB press Enter >/dev/null 2>&1; sleep 1.5
R=$(chipOf "border-emerald-500"); echo "  $R"
echo "$R" | grep -q "chip=۳۰ تست" && ok "رویداد ۳۰" || bad "رویداد: $R"

echo "=== C) «کنکور ۲۰» (cold-mount کنکور) ==="
pq "کنکور ۲۰"; $AB press Enter >/dev/null 2>&1; sleep 3
R=$(chipOf "border-amber-500"); echo "  $R"
echo "$R" | grep -q "chip=۲۰ تست" && ok "کنکور ۲۰" || bad "کنکور: $R"

echo "=== D) نمای باز کنکور: «کنکور ۳۰» (رویداد) ==="
pq "کنکور ۳۰"; $AB press Enter >/dev/null 2>&1; sleep 1.5
R=$(chipOf "border-amber-500"); echo "  $R"
echo "$R" | grep -q "chip=۳۰ تست" && ok "کنکور رویداد ۳۰" || bad "کنکور رویداد: $R"

echo "=== E) پاک‌سازی prefill: رفت‌وبرگشت، چیپ به پیش‌فرض ۱۰ ==="
pq "خانه"; $AB press Enter >/dev/null 2>&1; sleep 1.5
pq "آزمون جامع"; $AB press Enter >/dev/null 2>&1; sleep 2.5
R=$(chipOf "border-emerald-500"); echo "  $R"
echo "$R" | grep -q "chip=۱۰ تست" && ok "prefill یک‌بارمصرف (۱۰ پیش‌فرض)" || bad "prefill ماندگار: $R"

echo "=============================="
echo "PASS=$PASS FAIL=$FAIL"
