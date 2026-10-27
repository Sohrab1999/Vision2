#!/bin/bash
# r346 — درایورِ چیپِ بانک ۸۱ (Q2-40): کلیکِ چیپ از گریدِ چاپی + سنجِ ✓ + دو Enterِ واقعی
# گرید از دیتا ساخته شد (python از tests-g10.json) — درسِ r343/r344: هرگز گریدِ دستی ننویس
set -e
cd /home/z/my-project
LETTERS=(b c a c a b d b a c d a b b c a d a c b b d b d a b a c a c c d b a b a a b a)
LOG=/tmp/qa-r346-b81-driver.log
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
