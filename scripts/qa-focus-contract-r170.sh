#!/bin/bash
# Task 170 — keyboard focus contract — live QA against a PRODUCTION
# verification instance on 3004 (dev 3000 bundle frozen — the same
# one-call route as r149-r169).
#
# WHAT SHIPPED:
#   ① globals.css :focus-visible lost its border-radius:4px line — it
#     MUTATED the element's own radius on keyboard focus (a rounded-full
#     pill snapped square while focused). Outline now follows the
#     element's native radius natively.
#   ② the command-palette search input (the single outline-none element
#     in the estate with NO replacement indicator) got its own focus ring.
#   ③ css-hygiene grew a "keyboard focus contract" describe (4 tests):
#     outline-only rule pin + dark twin pin + estate-wide guard (every
#     outline-none line must carry a replacement indicator) + palette pin.
#
# NEW QA CAPABILITY: `element.focus({ focusVisible: true })` — Chrome's
# deterministic :focus-visible matcher (no real Tab-walking needed).
# The PILL DIFFERENTIAL is the mutation-fix proof: a synthetic
# rounded-full button reports borderRadius "9999px" WHILE focused
# (pre-fix the global rule forced "4px" in the same state).
#
# Phases:
#   0. patch distDir + production build into .next-prod170 + start 3004
#   1. open → ZWNJ-tolerant onboarding skip (dialogs=0 gate) →
#      FETCH/sendBeacon patch (DB hygiene)
#   A. light outline probe: focusVisible button → outlineWidth 2px solid
#      rgba(5,150,105,.65) + borderRadius stays 9999px (pill differential)
#   B. dark twin probe: documentElement.dark → outlineColor rgba(52,211,153,.7)
#   C. REAL pill element: native radius unchanged under focusVisible
#   D. palette input ring: window Ctrl+K KeyboardEvent → palette opens →
#      input boxShadow ≠ none (the ② fix) → Escape → dialogs=0
#   E. OV390 = 0 (dialogs closed — r168 discipline)
#   F. console errors = 0 (audio whitelist)
#   7. cleanup: kill 3004, restore config/tsconfig, rm side dir
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r170.bak
DIST=.next-prod170

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  git checkout tsconfig.json >/dev/null 2>&1 || true
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
  rm -rf "$DIST"
}
trap restore EXIT

echo "--- 0. patch distDir + production build into side dir ($DIST)"
cp "$CFG" "$BAK"
rg -q 'distDir' "$CFG" && { echo "CONFIG-ALREADY-PATCHED-ABORT"; exit 1; }
python3 - "$CFG" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s = s.replace('const nextConfig: NextConfig = {\n  output: "standalone",',
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod170",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r170-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r170-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod170 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod170-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod170-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1

# ZWNJ-tolerant onboarding skip (r168 lesson) + verify dialogs=0 after
SKIP=""
for i in $(seq 1 15); do
  sleep 1
  SKIP=$(agent-browser eval '(() => {
    const btn = [...document.querySelectorAll("button")].find(x => /ناشناس\s*می.مانم/.test(x.textContent || ""));
    if (btn) { btn.click(); return "SKIPPED"; }
    return "WAITING";
  })()' 2>/dev/null | tr -d '"')
  [ "$SKIP" = "SKIPPED" ] && break
done
echo "INTRO-SKIP=$SKIP (after ${i}s)"
sleep 1
DLG=$(agent-browser eval 'document.querySelectorAll("[data-state=open]").length' 2>/dev/null | tr -d '"')
echo "DIALOGS-AFTER-SKIP=$DLG"
[ "$DLG" = "0" ] || { echo "MODAL-STILL-OPEN-ABORT"; exit 1; }

# DB hygiene: intercept analytics events BEFORE any interaction
agent-browser eval '(() => {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.includes("/api/event")) return Promise.resolve(new Response("{}", { status: 200 }));
    return realFetch(input, init);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = () => true;
  return "FETCH-PATCHED";
})()' >/dev/null 2>&1

echo "--- A. light outline probe + PILL DIFFERENTIAL (focusVisible:true)"
P=$(agent-browser eval '(() => {
  let b = document.getElementById("fc-probe-pill");
  if (!b) { b = document.createElement("button"); b.id = "fc-probe-pill"; b.className = "rounded-full"; b.textContent = "fc"; document.body.appendChild(b); }
  b.focus({ focusVisible: true });
  const cs = getComputedStyle(b);
  const norm = (s) => String(s).replace(/,\s+/g, " ");
  // Tailwind v4 rounded-full = calc(infinity * 1px) — Chrome serializes it as
  // "3.35544e+07px" (2^25). Emit the NUMERIC value: the differential is
  // "still enormous (pill)" vs "4px (mutation)" — not a literal string.
  return "PROBE|ow=" + cs.outlineWidth + "|os=" + cs.outlineStyle + "|oc=" + norm(cs.outlineColor) + "|radius=" + parseFloat(cs.borderRadius);
})()' 2>/dev/null | tr -d '"')
echo "$P"
echo "$P" | rg -q "ow=2px" || { echo "OUTLINE-WIDTH-FAILED"; exit 1; }
echo "$P" | rg -q "os=solid" || { echo "OUTLINE-STYLE-FAILED"; exit 1; }
echo "$P" | rg -q "oc=rgba\(5 150 105 0.65\)" || { echo "OUTLINE-COLOR-FAILED"; exit 1; }
RADIUS=$(echo "$P" | rg -o 'radius=([0-9.e+]+)' -r '$1')
# pre-fix state: 4px. post-fix: calc(infinity*1px) ≈ 3.35e7. Anything > 10000
# proves the pill survived keyboard focus.
awk -v r="$RADIUS" 'BEGIN { exit !(r > 10000) }' || { echo "PILL-MUTATION-STILL-PRESENT (radius=$RADIUS)"; exit 1; }
echo "PILL-DIFFERENTIAL-OK (radius=$RADIUS px — stayed a pill under :focus-visible)"

echo "--- B. dark twin probe"
D=$(agent-browser eval '(() => {
  const de = document.documentElement;
  de.classList.add("dark");
  const b = document.getElementById("fc-probe-pill");
  b.focus({ focusVisible: true });
  const oc = getComputedStyle(b).outlineColor.replace(/,\s+/g, " ");
  de.classList.remove("dark");
  return "DARK|oc=" + oc;
})()' 2>/dev/null | tr -d '"')
echo "$D"
echo "$D" | rg -q "oc=rgba\(52 211 153 0.7\)" || { echo "DARK-TWIN-FAILED"; exit 1; }

echo "--- C. REAL pill element: native radius unchanged under focusVisible"
R=$(agent-browser eval '(() => {
  const pill = [...document.querySelectorAll("button.rounded-full, [class*=rounded-full]")].find(x => x.tagName === "BUTTON" || x.hasAttribute("tabindex"));
  if (!pill) return "REAL|pill=MISSING";
  const before = getComputedStyle(pill).borderRadius;
  pill.focus({ focusVisible: true });
  const after = getComputedStyle(pill).borderRadius;
  pill.blur();
  return "REAL|pill=OK|before=" + before + "|after=" + after + "|same=" + (before === after);
})()' 2>/dev/null | tr -d '"')
echo "$R"
# rg has no backreferences (r170 lesson) — assert with -F literal + explicit
# before/after extraction and a shell comparison.
echo "$R" | rg -q "pill=OK" || { echo "REAL-PILL-MISSING"; exit 1; }
echo "$R" | rg -q -F "same=true" || { echo "REAL-PILL-ASSERT-FAILED"; exit 1; }
BEFORE=$(echo "$R" | rg -o 'before=([^|]+)' -r '$1')
AFTER=$(echo "$R" | rg -o 'after=([^|]+)' -r '$1')
[ -n "$BEFORE" ] && [ "$BEFORE" = "$AFTER" ] || { echo "REAL-PILL-RADIUS-CHANGED ($BEFORE → $AFTER)"; exit 1; }
echo "REAL-PILL-OK (native $BEFORE unchanged under :focus-visible)"

echo "--- D. palette input ring (Ctrl+K → input boxShadow)"
agent-browser eval '(() => {
  window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, code: "KeyK", bubbles: true }));
  return "CTRLK";
})()' >/dev/null 2>&1
sleep 1
C=$(agent-browser eval '(() => {
  const input = document.querySelector("input[aria-label=\"جست‌وجوی فرمان‌ها\"]");
  if (!input) return "PAL|input=MISSING";
  if (document.activeElement !== input) input.focus();
  const bs = getComputedStyle(input).boxShadow;
  const dialogs = document.querySelectorAll("[data-state=open]").length;
  return "PAL|input=OK|shadow=" + (bs && bs !== "none" ? "RING" : "NONE") + "|dialogs=" + dialogs;
})()' 2>/dev/null | tr -d '"')
echo "$C"
echo "$C" | rg -q "input=OK\|shadow=RING" || { echo "PALETTE-RING-FAILED"; exit 1; }
echo "$C" | rg -q "dialogs=[1-9]" || { echo "PALETTE-NOT-OPEN-FAILED"; exit 1; }
agent-browser eval '(() => {
  // Radix Dialog listens for Escape on document — dispatch there (window
  // events never reach document-level listeners; r170 lesson)
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  return "ESC";
})()' >/dev/null 2>&1
sleep 1

echo "--- E. OV390 (dialogs must be 0 — r168 discipline)"
OV=$(agent-browser eval '(() => {
  const els = [...document.querySelectorAll("*")];
  let over = 0;
  for (const el of els) {
    const s = getComputedStyle(el);
    if ((s.position === "fixed" || s.position === "absolute") && parseInt(s.zIndex || "0") >= 390) over++;
  }
  return "OV390=" + over + "|dialogs=" + document.querySelectorAll("[data-state=open]").length;
})()' 2>/dev/null | tr -d '"')
echo "$OV"
echo "$OV" | rg -q "OV390=0" || { echo "OV390-FAILED"; exit 1; }
echo "$OV" | rg -q "dialogs=0" || { echo "PALETTE-DID-NOT-CLOSE"; exit 1; }

echo "--- F. console errors = 0 (audio whitelist)"
CON=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "playAudio|audio|Autoplay" | wc -l)
echo "CONSOLE-ERRORS=$CON"
[ "$CON" = "0" ] || { echo "CONSOLE-FAILED"; agent-browser console 2>/dev/null | rg -i "error" | head -10; exit 1; }

echo "--- 7. cleanup via trap (kill 3004, restore config, rm side dir)"
agent-browser close --all >/dev/null 2>&1
echo "ALL-PHASES-PASS"
