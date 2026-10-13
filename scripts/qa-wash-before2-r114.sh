#!/usr/bin/env bash
# r114 BEFORE-2 — مقادیر دقیقِ سطوحِ هدف پیش از همگرایی (تک‌سشن، فقط خواندنی)
# سطوح: home-tools chip (fuchsia-50 جامد) · popover sync box (emerald-50/70)
#        rush setup card (orange-50) · srs teal-50 · writing-tab rose-50/70 + emerald-50/70
#        نور: border-emerald-200 روشن (تغییرناپذیری)
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4

probe() { # $1=label, $2=js-finder (returns computed color string)
  echo "$2" > /tmp/probe.js
  R=$($AB eval --stdin < /tmp/probe.js 2>/dev/null | tr -d '"')
  echo "BEFORE2 $1 → $R"
}

# LIGHT first (dark not toggled yet)
probe "LIGHT border-emerald-200 (stat band)" '
(() => {
  const el = document.querySelector(".stat-band");
  if (!el) return "NO-BAND";
  return getComputedStyle(el).borderColor + " | bg=" + getComputedStyle(el).backgroundColor;
})()'

probe "LIGHT home-tools fuchsia-50 chip" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-fuchsia-50") && !String(e.className).includes("fuchsia-50/"));
  if (!el) return "NO-CHIP";
  return getComputedStyle(el).backgroundColor;
})()'

# toggle dark
$AB eval "
(() => { const b = document.querySelector('button[aria-label*=\"حالت شب\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 1

probe "DARK home-tools fuchsia-50 chip" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-fuchsia-50") && !String(e.className).includes("fuchsia-50/"));
  if (!el) return "NO-CHIP";
  return getComputedStyle(el).backgroundColor;
})()'

probe "DARK duel-code waiting box (if reachable)" '
(() => {
  const el = document.querySelector(".duel-code");
  if (!el) return "NOT-REACHABLE";
  return getComputedStyle(el).backgroundColor;
})()'

# profile popover → emerald-50/70 sync box
$AB eval "
(() => {
  const b = document.querySelector('button[aria-label*=\"پروفایل\"], button[aria-label*=\"حساب\"]');
  if (b) { b.click(); return 'clicked'; }
  return 'NO-BTN';
})()
" >/dev/null 2>&1
sleep 2
probe "DARK popover emerald-50/70 sync box" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-emerald-50/70"));
  if (!el) return "NO-BOX";
  return getComputedStyle(el).backgroundColor;
})()'
$AB eval "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); 'x'" >/dev/null 2>&1
sleep 1

# rush view → orange-50 card
$AB eval "
(() => {
  const el = [...document.querySelectorAll('button, a, [role=button]')].find(b => /تندمرور|رش|برق‌آسا/.test(b.textContent||''));
  if (el) { el.click(); return 'clicked'; }
  return 'NO-EL';
})()
" >/dev/null 2>&1
sleep 3
probe "DARK rush orange-50 solid" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-orange-50") && !String(e.className).includes("orange-50/"));
  if (!el) return "NO-EL";
  return getComputedStyle(el).backgroundColor;
})()'

probe "DARK srs/report teal-50 solid" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-teal-50") && !String(e.className).includes("teal-50/"));
  if (!el) return "NO-EL";
  return getComputedStyle(el).backgroundColor;
})()'

$AB close >/dev/null 2>&1 || true
echo "=== BEFORE-2 DONE ==="
