#!/bin/bash
# r347 — درایورِ چیپِ بانک ۸۸ (Q2-20): کلیکِ چیپ از گریدِ دیتا + سنجِ ✓ + دو Enterِ واقعی
# درسِ r346: حرفِ چیپ از firstElementChild خوانده شود (textContent بدون فاصله می‌چسبد)
set -e
cd /home/z/my-project
LETTERS=($(cat /tmp/qa-r347-b88-letters.txt))
LOG=/tmp/qa-r347-b88-driver.log
: > "$LOG"
i=0
for L in "${LETTERS[@]}"; do
  i=$((i+1))
  res=$(agent-browser eval "
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let chip = null;
      for (let t = 0; t < 30; t++) {
        chip = [...document.querySelectorAll('main button')].find((b) => (b.firstElementChild?.textContent || '').trim().toLowerCase() === '$L');
        if (chip && !chip.disabled) break;
        await sleep(150);
      }
      if (!chip) return JSON.stringify({ok:false, why:'no-chip-$L'});
      chip.click();
      await sleep(450);
      const fb = document.querySelector('[data-quiz-feedback]');
      const ok = fb && fb.textContent.includes('✓');
      return JSON.stringify({ok: !!ok, fb: fb ? fb.textContent.replace(/\s+/g,' ').slice(0,36) : 'no-fb'});
    })()
  " 2>&1 | tail -1)
  echo "Q$i [$L] → $res" >> "$LOG"
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.4
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.6
done
cat "$LOG"
