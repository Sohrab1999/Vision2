#!/bin/bash
# r345 — درایورِ ترکیبیِ بانک ۷۷ (Q2-16): تزریقِ درون‌صفحه (fill+submit+feedback) + Enterِ واقعیِ agent-browser
set -e
cd /home/z/my-project
ANSWERS=("anything" "international" "historical" "quietly" "illness" "attractions" "behavior" "junk" "destination" "means" "range" "located" "generously" "pilgrims" "souvenir")
LOG=/tmp/qa-r345-b77-driver.log
: > "$LOG"
for ans in "${ANSWERS[@]}"; do
  res=$(agent-browser eval "
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let input = null;
      for (let t = 0; t < 30; t++) {
        input = document.querySelector('main input');
        if (input && !input.disabled && !input.readOnly) break;
        await sleep(150);
      }
      if (!input) return JSON.stringify({ok:false, why:'no-input'});
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '$ans');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(300);
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('بررسی پاسخ') && !b.disabled);
      if (btn) btn.click(); else return JSON.stringify({ok:false, why:'no-btn'});
      await sleep(400);
      const fb = document.querySelector('[data-quiz-feedback]');
      const ok = fb && fb.textContent.includes('✓');
      return JSON.stringify({ok: !!ok, fb: fb ? fb.textContent.replace(/\s+/g,' ').slice(0,40) : 'no-fb'});
    })()
  " 2>&1 | tail -1)
  echo "$ans → $res" >> "$LOG"
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.4
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.6
done
cat "$LOG"
