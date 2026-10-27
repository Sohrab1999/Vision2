#!/bin/bash
# r347 — درایورِ تایپیِ بانک ۸۲ (نسخهٔ ۲): mapfile برای پاسخ‌های چندکلمه‌ای + فوکوسِ اینپوت قبل از Enter
set -e
cd /home/z/my-project
mapfile -t ANSWERS < /tmp/qa-r347-b82-answers.txt
LOG=/tmp/qa-r347-b82-driver.log
: > "$LOG"
i=0
for A in "${ANSWERS[@]}"; do
  i=$((i+1))
  res=$(agent-browser eval "
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let inp = null;
      for (let t = 0; t < 30; t++) {
        inp = document.querySelector('[data-quiz-typed-input]');
        if (inp && !inp.disabled) break;
        await sleep(150);
      }
      if (!inp) return JSON.stringify({ok:false, why:'no-input'});
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, '$A');
      inp.dispatchEvent(new Event('input', {bubbles: true}));
      inp.focus();
      await sleep(250);
      return JSON.stringify({q: $i, typed: '$A', focused: document.activeElement === inp});
    })()
  " 2>&1 | tail -1)
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.6
  fb=$(agent-browser eval "
    (() => { const fb = document.querySelector('[data-quiz-feedback]'); return fb ? fb.textContent.replace(/\s+/g,' ').slice(0,46) : 'no-fb'; })()
  " 2>&1 | tail -1)
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.7
  echo "Q$i [$A] submit=$res fb=$fb" >> "$LOG"
done
cat "$LOG"
