#!/usr/bin/env bash
# r114 AFTER-probe — سنجشِ ارزش‌های همگرا شده + تغییرناپذیریِ روشن (تک‌سشن، فقط خواندنی)
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4

P() { echo "$2" > /tmp/probe114.js; $AB eval --stdin < /tmp/probe114.js 2>/dev/null | tr -d '"'; }

# ---- 1. LIGHT invariance: fuchsia chip must be UNCHANGED --------------------
R_LIGHT_F=$(P "light fuchsia" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-fuchsia-50") && !String(e.className).includes("fuchsia-50/"));
  return el ? getComputedStyle(el).backgroundColor : "NO-CHIP";
})()')
chk "$(echo "$R_LIGHT_F" | grep -q "lab(97" && echo 1)" "LIGHT fuchsia chip unchanged (leak-fix did not touch light) → $R_LIGHT_F"

# screenshot light home
$AB screenshot /tmp/r114-light-home.png >/dev/null 2>&1 || true

# ---- 2. DARK toggle ----------------------------------------------------------
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 1
R_DARK=$($AB eval "document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF'" 2>/dev/null | tr -d '"')
chk "$([ "$R_DARK" = "DARK-ON" ] && echo 1)" "dark on → $R_DARK"

# ---- 3. THE LEAK FIX: fuchsia chip in dark ----------------------------------
R_DARK_F=$(P "dark fuchsia" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-fuchsia-50") && !String(e.className).includes("fuchsia-50/"));
  return el ? getComputedStyle(el).backgroundColor : "NO-CHIP";
})()')
chk "$(echo "$R_DARK_F" | grep -q "0.35\|0,35\|74, 4, 78\|74 4 78" && echo 1)" "DARK fuchsia chip now kernel-dark → $R_DARK_F (was lab(97.1) light-leak)"

# ---- 4. emerald-50/70 canonical via profile popover sync box (best-effort) --
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"پروفایل من\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 2
R_E70=$(P "emerald-50/70" '
(() => {
  const el = [...document.querySelectorAll("*")].find(e => e.className && String(e.className).includes("bg-emerald-50/70"));
  return el ? getComputedStyle(el).backgroundColor : "NO-BOX";
})()')
if [ "$R_E70" = "NO-BOX" ]; then
  note "INFO" "popover /70 box not reachable this session — injected-probe em70 already proves rgba(6,55,40,0.5)"
else
  chk "$(echo "$R_E70" | grep -qF "0.5" && echo 1)" "emerald-50/70 converged (rgba(6,55,40,0.5)) → $R_E70"
fi

# ---- 5. quiz option chosen /50 UNCHANGED (regression guard) ------------------
$AB eval "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); 'x'" >/dev/null 2>&1
sleep 1
R_OPT=$(P "chosen /50 (static css check via injected probe element)" '
(() => {
  const d = document.createElement("div");
  d.className = "bg-emerald-50/50";
  d.style.display = "none";
  document.body.appendChild(d);
  const v = getComputedStyle(d).backgroundColor;
  d.remove();
  return v;
})()')
chk "$(echo "$R_OPT" | grep -q "0.38\|0,38" && echo 1)" "bg-emerald-50/50 unchanged (0.38) → $R_OPT"

# injected probe: solid fuchsia-50 + teal-50 + orange-50 token rides
R_TOK=$(P "token probes" '
(() => {
  const mk = (c) => { const d = document.createElement("div"); d.className = c; d.style.display = "none"; document.body.appendChild(d); const v = getComputedStyle(d).backgroundColor; d.remove(); return v; };
  return ["fuchsia50=" + mk("bg-fuchsia-50"), "teal50=" + mk("bg-teal-50"), "orange50=" + mk("bg-orange-50"), "rose70=" + mk("bg-rose-50/70"), "teal40=" + mk("bg-teal-50/40"), "em70=" + mk("bg-emerald-50/70")].join(" | ");
})()')
note "TOKENS" "$R_TOK"
chk "$(echo "$R_TOK" | grep -qF "teal40=rgba(6, 55, 50, 0.35)" && echo 1)" "teal-50/40 rides token base (6,55,50) → converged"
chk "$(echo "$R_TOK" | grep -qF "em70=rgba(6, 55, 40, 0.5)" && echo 1)" "emerald-50/70 utility rides canonical 0.5"

# ---- 6. dark screenshots for eyeball ----------------------------------------
$AB screenshot /tmp/r114-dark-home.png >/dev/null 2>&1 || true

# ---- 7. mobile 390 + console --------------------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -d '"')
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
exit $fail
