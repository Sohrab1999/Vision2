#!/bin/bash
# r345 — درایورِ ترکیبیِ بانک ۸۰ (Q2-25): کلیکِ چیپ از دیتا + سنجِ ✓ + Enterِ واقعیِ agent-browser
set -e
cd /home/z/my-project
LETTERS=(b c a b d b d c a c d b a d b c a d c b a c c b)
LOG=/tmp/qa-r345-b80-driver.log
: > "$LOG"
for L in "${LETTERS[@]}"; do
  res=$(agent-browser eval "
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let chip = null;
      for (let t = 0; t < 30; t++) {
        chip = [...document.querySelectorAll('main button')].find((b) => (b.firstElementChild?.textContent || '').trim() === '$L');
        if (chip && !chip.disabled) break;
        await sleep(150);
      }
      if (!chip) return JSON.stringify({ok:false, why:'no-chip-$L'});
      chip.click();
      await sleep(400);
      const fb = document.querySelector('[data-quiz-feedback]');
      const ok = fb && fb.textContent.includes('✓');
      return JSON.stringify({ok: !!ok, fb: fb ? fb.textContent.replace(/\s+/g,' ').slice(0,36) : 'no-fb'});
    })()
  " 2>&1 | tail -1)
  echo "$L → $res" >> "$LOG"
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.4
  agent-browser press Enter > /dev/null 2>&1
  sleep 0.6
done
cat "$LOG"
