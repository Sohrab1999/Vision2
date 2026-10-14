#!/bin/bash
# Task 171 — «لایهٔ اعلام به صفحه‌خوان» — the screen-reader announcement
# layer, live QA against a PRODUCTION verification instance on 3004
# (dev 3000 bundle frozen — the same one-call route as r149-r170).
#
# WHAT SHIPPED:
#   ① lib/announcer.ts — the publish side: announceFa / announceToast /
#     isAssertiveToast (pure pub-sub, SSR-safe)
#   ② shell/live-announcer.tsx — two sr-only regions (polite status +
#     assertive alert), mounted ONCE in layout.tsx beside <Toaster />
#   ③ ui/toaster.tsx — a ToastAnnouncer child per toast announces
#     «title — description» through the layer: ONE wiring point covers
#     all 50 toast call sites; «خطا» titles take the assertive channel.
#
# WHY: the live audit (toast open → ZERO [aria-live] elements in the
# DOM) proved this Radix build ships no live region — screen readers
# heard nothing from the app's central notification channel.
#
# Phases:
#   0. patch distDir + production build into .next-prod171 + start 3004
#   1. open → ZWNJ-tolerant onboarding skip → dialogs=0 → FETCH patch
#   A. both regions exist at load: polite(status)+assertive(alert),
#      sr-only (1px clip), both empty
#   B. end-to-end: profile → «دانلود پشتیبان» → toast fires → polite
#      region carries «✓ پشتیبان دانلود شد — …» (composed dash format),
#      assertive region stays EMPTY (polite routing)
#   C. no duplicated announcement text (single set, no double-fire)
#   D. Escape on document (r170 lesson) → dialogs=0 → OV390 = 0
#   E. console errors = 0 (audio whitelist)
#   7. cleanup: kill 3004, restore config/tsconfig, rm side dir
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r171.bak
DIST=.next-prod171

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod171",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r171-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r171-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod171 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod171-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod171-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1

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

echo "--- A. both regions exist at load (sr-only, empty)"
A=$(agent-browser eval '(() => {
  const polite = document.querySelector("[aria-live=\"polite\"]");
  const assertive = document.querySelector("[aria-live=\"assertive\"]");
  const hidden = (el) => { if (!el) return false; const s = getComputedStyle(el); return s.position === "absolute" && (parseInt(s.width) <= 1 || s.clipPath !== "none" || s.overflow === "hidden"); };
  return "REG|polite=" + (polite ? "OK" : "MISSING") + "|politeRole=" + (polite ? polite.getAttribute("role") : "-") +
         "|assertive=" + (assertive ? "OK" : "MISSING") + "|assertiveRole=" + (assertive ? assertive.getAttribute("role") : "-") +
         "|srOnly=" + (hidden(polite) && hidden(assertive)) +
         "|emptyAtLoad=" + (!polite?.textContent && !assertive?.textContent);
})()' 2>/dev/null | tr -d '"')
echo "$A"
echo "$A" | rg -q "polite=OK\|politeRole=status" || { echo "POLITE-REGION-FAILED"; exit 1; }
echo "$A" | rg -q "assertive=OK\|assertiveRole=alert" || { echo "ASSERTIVE-REGION-FAILED"; exit 1; }
echo "$A" | rg -q "srOnly=true" || { echo "SR-ONLY-FAILED"; exit 1; }
echo "$A" | rg -q "emptyAtLoad=true" || { echo "REGIONS-NOT-EMPTY-AT-LOAD"; exit 1; }

echo "--- B. end-to-end: backup toast → polite region"
agent-browser eval '(() => {
  const t = document.querySelector("button[aria-label=\"پروفایل من\"]");
  if (!t) return "TRIGGER-MISSING";
  t.click(); return "POPOVER-OPENED";
})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("button")].find(x => /پشتیبان|دانلود/.test(x.textContent || "") && x.getAttribute("aria-label") !== "پروفایل من");
  if (!btn) return "EXPORT-MISSING";
  btn.click(); return "EXPORT-CLICKED";
})()' >/dev/null 2>&1
sleep 1
B=$(agent-browser eval '(() => {
  const polite = document.querySelector("[aria-live=\"polite\"]");
  const assertive = document.querySelector("[aria-live=\"assertive\"]");
  const p = (polite?.textContent || "").replace(/,\s+/g, " ");
  return "ANN|polite=" + JSON.stringify(p.slice(0, 90)) + "|assertiveEmpty=" + (!assertive?.textContent);
})()' 2>/dev/null | tr -d '"')
echo "$B"
echo "$B" | rg -q "پشتیبان دانلود شد" || { echo "POLITE-ANNOUNCEMENT-FAILED"; exit 1; }
echo "$B" | rg -q "assertiveEmpty=true" || { echo "ASSERTIVE-SHOULD-BE-EMPTY"; exit 1; }

echo "--- C. single announcement (no double-fire in the region)"
C=$(agent-browser eval '(() => {
  const polite = document.querySelector("[aria-live=\"polite\"]");
  const t = polite?.textContent || "";
  // the backup toast description itself carries an em-dash, so counting
  // dashes would false-positive — the TITLE must appear exactly once
  return "DUP|titleCount=" + (t.split("✓ پشتیبان دانلود شد").length - 1) + "|len=" + t.length;
})()' 2>/dev/null | tr -d '"')
echo "$C"
echo "$C" | rg -q "titleCount=1" || { echo "DOUBLE-FIRE-FAILED"; exit 1; }

echo "--- D. close popover (trigger toggle — Radix Popover ignores synthetic document Escape, unlike Dialog; r171 lesson) → OV390"
agent-browser eval '(() => {
  const t = document.querySelector("button[aria-label=\"پروفایل من\"]");
  if (!t) return "TRIGGER-GONE";
  t.click();
  return "TOGGLED";
})()' >/dev/null 2>&1
sleep 1
# the toast itself (3500ms) may still be open — let it auto-dismiss
sleep 3
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
echo "$OV" | rg -q "dialogs=0" || { echo "POPOVER-DID-NOT-CLOSE"; exit 1; }

echo "--- E. console errors = 0 (audio whitelist)"
CON=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "playAudio|audio|Autoplay" | wc -l)
echo "CONSOLE-ERRORS=$CON"
[ "$CON" = "0" ] || { echo "CONSOLE-FAILED"; agent-browser console 2>/dev/null | rg -i "error" | head -10; exit 1; }

echo "--- 7. cleanup via trap (kill 3004, restore config, rm side dir)"
agent-browser close --all >/dev/null 2>&1
echo "ALL-PHASES-PASS"
