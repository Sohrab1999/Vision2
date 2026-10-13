#!/usr/bin/env bash
# r115 AFTER-probe — لایهٔ -100 کرنلی شد (تک‌سشن، فقط خواندنی)
set -u
BASE="http://127.0.0.1:3000"
AB="agent-browser"
fail=0
note() { echo "[$1] $2"; }
chk() { if [ "$1" = "1" ]; then note "PASS" "$2"; else note "FAIL" "$2"; fail=1; fi; }

$AB close >/dev/null 2>&1 || true
$AB open "$BASE" >/dev/null 2>&1
sleep 4

P() { echo "$2" > /tmp/probe115.js; $AB eval --stdin < /tmp/probe115.js 2>/dev/null | tr -d '"'; }

# ---- LIGHT invariance: emerald-100 solid stays #d0fae5 ----------------------
R_L=$(P "light matrix" '
(() => {
  const mk = (c) => { const d = document.createElement("div"); d.className = c; d.style.display = "none"; document.body.appendChild(d); const v = getComputedStyle(d).backgroundColor; d.remove(); return v; };
  return "em100=" + mk("bg-emerald-100") + " | am100=" + mk("bg-amber-100");
})()')
note "LIGHT" "$R_L"
chk "$(echo "$R_L" | grep -qF "em100=lab(94.9" && echo 1)" "LIGHT emerald-100 unchanged (lab(94.9…) = #d0fae5, Chrome lab() serialization)"

# ---- DARK toggle + token matrix ---------------------------------------------
$AB eval "
(() => { const b = document.querySelector('button[aria-label=\"حالت شب\"]'); if (b) b.click(); return 'ok'; })()
" >/dev/null 2>&1
sleep 1
R_D=$($AB eval "document.documentElement.classList.contains('dark') ? 'DARK-ON' : 'DARK-OFF'" 2>/dev/null | tr -d '"')
chk "$([ "$R_D" = "DARK-ON" ] && echo 1)" "dark on → $R_D"

R_TOK=$(P "dark token matrix" '
(() => {
  const mk = (c, prop) => { const d = document.createElement("div"); d.className = c; d.style.display = "none"; document.body.appendChild(d); const cs = getComputedStyle(d); const v = prop ? cs.getPropertyValue(prop) : cs.backgroundColor; d.remove(); return v; };
  return ["em100=" + mk("bg-emerald-100"), "rose100=" + mk("bg-rose-100"), "am100=" + mk("bg-amber-100"), "te100=" + mk("bg-teal-100"), "or100=" + mk("bg-orange-100"), "sk100=" + mk("bg-sky-100"), "vi100=" + mk("bg-violet-100"), "fu100=" + mk("bg-fuchsia-100"), "emB=" + mk("border-emerald-100", "border-color"), "ringA=" + mk("ring-amber-100", "--tw-ring-color")].join(" | ");
})()')
note "TOKENS" "$R_TOK"
chk "$(echo "$R_TOK" | grep -qF "em100=rgba(6, 55, 40, 0.6)" && echo 1)" "bg-emerald-100 → kernel rgba(6,55,40,0.6) (was LIGHT leak on hover/border sites)"
chk "$(echo "$R_TOK" | grep -qF "rose100=rgba(76, 5, 25, 0.6)" && echo 1)" "bg-rose-100 → kernel rgba(76,5,25,0.6)"
chk "$(echo "$R_TOK" | grep -qF "am100=rgba(69, 48, 12, 0.55)" && echo 1)" "bg-amber-100 → family base (69,48,12@0.55; was 87,62,14@0.5)"
chk "$(echo "$R_TOK" | grep -qF "te100=rgba(19, 78, 74, 0.5)" && echo 1)" "bg-teal-100 → converged base (19,78,74@0.5)"
chk "$(echo "$R_TOK" | grep -qF "vi100=rgba(59, 7, 100, 0.5)" && echo 1)" "bg-violet-100 → kernel (was LIGHT leak on 9 sites)"
chk "$(echo "$R_TOK" | grep -qF "fu100=rgba(74, 4, 78, 0.6)" && echo 1)" "bg-fuchsia-100 → kernel (byte-equal to old duel-card value)"
chk "$(echo "$R_TOK" | grep -qF "emB=rgba(6, 55, 40, 0.6)" && echo 1)" "border-emerald-100 hairlines now dark (was LIGHT leak ×4)"
chk "$(echo "$R_TOK" | grep -qiF "ringA=#45300c8c" && echo 1)" "ring-amber-100 focus halo → dark translucent (#45300c8c = rgba(69,48,12,0.55); spell-input precedent)"

# ---- light screenshot + dark screenshots ------------------------------------
$AB screenshot /tmp/r115-dark-home.png >/dev/null 2>&1 || true

# ---- mobile 390 + console ----------------------------------------------------
$AB set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
R_OVF=$($AB eval "document.documentElement.scrollWidth - document.documentElement.clientWidth" 2>/dev/null | tr -d '"')
chk "$([ "$R_OVF" = "0" ] && echo 1)" "mobile-390 overflow = 0 (got $R_OVF)"
$AB set viewport 1280 800 >/dev/null 2>&1 || true
R_CON=$($AB console 2>/dev/null | grep -ci "error" || true)
chk "$([ "$R_CON" = "0" ] && echo 1)" "console errors = 0 (got $R_CON)"

echo "=== RESULT: $([ $fail = 0 ] && echo ALL-PASS || echo HAS-FAIL) ==="
exit $fail
