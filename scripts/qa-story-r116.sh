#!/usr/bin/env bash
# r116 QA — «داستانِ واژه‌های من» (تک‌سشن؛ seed فقط localStorage؛ DB واقعی دست‌نخورده)
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }

$AB close >/dev/null 2>&1 || true

# ---- 1. cold open + seed 6 stars + onboarding skip + reload -------------------
$AB open "$BASE" >/dev/null 2>&1
sleep 4
$AB eval "
(() => {
  try { localStorage.setItem('vision2-onboarded', '1'); } catch {}
  const raw = localStorage.getItem('vision2-study-v1');
  const cur = raw ? JSON.parse(raw) : {};
  const state = { ...(cur.state || {}) };
  state.starredWords = ['1:ability','1:action','1:add','2:achieve','3:factor','2:active'];
  localStorage.setItem('vision2-study-v1', JSON.stringify({ ...cur, state, version: 0 }));
  return 'seeded:' + state.starredWords.length;
})()" 2>/dev/null | tr -d '"'
$AB open "$BASE" >/dev/null 2>&1
sleep 4

# ---- 2. navigate to my-words via the tools BUTTON ----------------------------
$AB eval "
(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b =>
    b.textContent && b.textContent.includes('واژه‌های من') && b.textContent.includes('واژه‌نامهٔ شخصی'));
  if (!btn) return 'NO-BTN';
  btn.click();
  return 'clicked';
})()" >/dev/null 2>&1
sleep 2
R_MW=$($AB eval "document.body.innerText.includes('واژه‌های من') && document.body.innerText.includes('داستانِ واژه‌های من') ? 'STORY-LAUNCHER-VISIBLE' : 'MISSING'" 2>/dev/null | tr -d '"')
chk "$([ "$R_MW" = "STORY-LAUNCHER-VISIBLE" ] && echo 1)" "my-words opens with the story launcher card"

# ---- 3. launcher copy honest for 6 stars -------------------------------------
R_CP=$($AB eval "
(() => {
  const t = document.body.innerText || '';
  return t.includes('واژهٔ نشان‌شده‌ات') ? 'COPY-OK' : 'COPY-MISS';
})()" 2>/dev/null | tr -d '"')
chk "$(echo "$R_CP" | grep -qF "COPY-OK" && echo 1)" "launcher copy shows the 6-word count ($R_CP)"

# ---- 4. forge the story (real AI round-trip) ---------------------------------
$AB eval "
(() => {
  const b = document.querySelector('button[aria-label=\"ساخت داستان با واژه‌های نشان‌شده\"]');
  if (!b) return 'NO-BTN';
  b.click();
  return 'forging';
})()" >/dev/null 2>&1
SLEEP=0; FOUND=0
while [ $SLEEP -lt 40 ]; do
  sleep 2; SLEEP=$((SLEEP+2))
  FOUND=$($AB eval "document.querySelector('[data-ai-story]') ? 1 : 0" 2>/dev/null | tr -d '"')
  [ "$FOUND" = "1" ] && break
done
chk "$([ "$FOUND" = "1" ] && echo 1)" "story panel appeared in ${SLEEP}s (real AI round-trip)"

# ---- 5. panel contract: marks + summary + provenance + TTS -------------------
R_P=$($AB eval "
(() => {
  const panel = document.querySelector('[data-ai-story]');
  if (!panel) return 'NO-PANEL';
  const marks = panel.querySelectorAll('mark').length;
  const text = panel.innerText || '';
  const chip = text.includes('آماده') ? 'CHIP-CACHED' : (text.includes('حالت آفلاین') ? 'CHIP-FALLBACK' : (text.includes('تازه') ? 'CHIP-FRESH' : 'CHIP-UNKNOWN'));
  const hasSummary = text.includes('خلاصه:') ? 'SUM-YES' : 'SUM-NO';
  const hasTTS = panel.querySelector('button[aria-label=\"روخوانی داستان\"]') ? 'TTS-YES' : 'TTS-NO';
  return ['MARKS-' + marks, hasSummary, chip, hasTTS].join(' ');
})()" 2>/dev/null | tr -d '"')
note "PANEL" "$R_P"
chk "$(echo "$R_P" | grep -qE 'MARKS-[1-9]' && echo 1)" "target words highlighted with <mark> ($R_P)"
chk "$(echo "$R_P" | grep -qF 'SUM-YES' && echo 1)" "Persian summary line present"
chk "$(echo "$R_P" | grep -qE 'CHIP-(CACHED|FRESH)' && echo 1)" "honest provenance chip ($R_P)"
chk "$(echo "$R_P" | grep -qF 'TTS-YES' && echo 1)" "read-aloud button present"

# ---- 6. dark mode: story card gradient + panel legibility --------------------
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]'); if (b) b.click(); return 1; })()" >/dev/null 2>&1
sleep 1
R_DARK=$($AB eval "
(() => {
  const card = document.querySelector('.mywords-story');
  if (!card) return 'NO-CARD';
  const bg = getComputedStyle(card).backgroundImage;
  const darkOn = document.documentElement.classList.contains('dark');
  return [darkOn ? 'DARK-ON' : 'DARK-OFF', bg.includes('8, 47, 60') ? 'GRAD-SKY' : 'GRAD-OTHER'].join(' ');
})()" 2>/dev/null | tr -d '"')
chk "$(echo "$R_DARK" | grep -qF 'DARK-ON' && echo 1)" "dark mode on ($R_DARK)"
chk "$(echo "$R_DARK" | grep -qF 'GRAD-SKY' && echo 1)" "story card sky-kernel gradient in dark ($R_DARK)"
$AB screenshot /tmp/r116-dark-story.png >/dev/null 2>&1 || true

# ---- 7. mobile 390 overflow ---------------------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -d '"')
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true

# ---- 8. console errors --------------------------------------------------------
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
