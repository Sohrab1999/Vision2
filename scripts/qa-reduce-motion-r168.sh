#!/bin/bash
# Task 168 — the AUTOMATIC reduce-motion channel (globals F2b) + the
# framer-motion dual-channel wiring (MotionConfig in StudyApp) + the
# settings honesty hint — live QA against a PRODUCTION verification
# instance on 3004 (dev 3000 bundle is frozen pre-wave-9 — the same
# one-call route as r149-r167).
#
# WHY production: the long-lived dev server (3000) can never contain
# task 168. Temporarily patch next.config.ts distDir, `bunx next build`
# into a SIDE dir, `next start -p 3004`, run all phases, kill via
# ss-PID, restore config + tsconfig, rm the side dir — one tool call.
#
# ARBITRATION MEMO: the estate had a MANUAL reduce-motion policy only
# (globals F2: html.user-reduce-motion ← settings hub toggle). The OS
# channel (@media prefers-reduced-motion: reduce) was absent — a
# visitor whose device already asks for less motion got full motion
# until they found the in-app setting. Task 168 adds:
#   ① globals F2b — the same four declarations mirrored inside the
#     media query + the flame hard-stop on both channels
#   ② study-app MotionConfig reducedMotion={manual ? "always" : "user"}
#     — framer-motion components (12 files) now honor BOTH channels
#   ③ settings hint — the toggle now TELLS the user the OS channel
#     applies automatically (honesty copy)
#
# NEW QA CAPABILITY (first use): `agent-browser set media dark
# reduced-motion` emulates the OS preference — the OS channel is not
# merely present in the bundle (phase A), it is proven APPLIED live
# (phase B: computed animation-duration collapses to <1ms and the
# flame hard-stop returns animationName "none" under emulation).
#
# No seed this round (no badge-gate assertions); the ephemeral profile
# starts visitor-fresh (onboarding modal → «ناشناس میمانم» skip).
# Probes are SYNTHETIC elements carrying the real classes
# (.reward-shimmer / .streak-flame) — computed styles reflect the full
# cascade incl. both channels (the r166 probe-element pattern).
#
# Phases:
#   A. served source: media band present in the built CSS bundle
#      (loose needles — the minifier owns formatting)
#   B1. baseline probes, no emulation: shimmer ≈ 2400ms, flame flickers
#   B2. OS emulation ON: matchMedia=true, shimmer < 1ms, flame "none"
#   B3. emulation reset (ladder: set-media-dark → light-then-dark →
#       fresh tab): probes fully restored
#   C. manual channel: settings toggle → html class + shimmer < 1ms +
#      flame "none" with NO OS emulation → toggle OFF → restored
#   D. honesty hint visible in the settings popover
#   E. OV390 = 0
#   F. console errors = 0
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r168.bak
DIST=.next-prod168

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod168",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r168-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r168-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod168 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod168-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod168-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1

# skip the first-run welcome modal — POLL + ZWNJ-TOLERANT regex. The r168
# run's big harness lesson: the button text is «ناشناس می‌مانم» WITH ZWNJ
# (onboarding.tsx) while the old matcher searched "ناشناس میمانم" without
# it — includes() never matched, the dialog stayed open, and every later
# agent-browser click (hit-tested, unlike JS .click()) was silently
# intercepted by its overlay. Poll until dismissed, then VERIFY it's gone.
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
patch_net() {
agent-browser eval '(() => {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.includes("/api/event")) return Promise.resolve(new Response("{}", { status: 200 }));
    return realFetch(input, init);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = () => true;
  return "FETCH-PATCHED";
})()' 2>/dev/null
}
patch_net

# probe(): synthetic elements with the real animation classes; returns a
# pipe-tagged line — shimmerMs (parsed to ms), flameName, osReduced
# (matchMedia), manualClass (html.user-reduce-motion)
probe() {
agent-browser eval '(() => {
  const mkProbe = (id, cls) => { let el = document.getElementById(id); if(!el){ el = document.createElement("div"); el.id = id; el.className = cls; document.body.appendChild(el);} return el; };
  const toMs = (v) => { const s = String(v); if (s.endsWith("ms")) return Math.round(parseFloat(s) * 1000) / 1000; if (s.endsWith("s")) return Math.round(parseFloat(s) * 1000 * 1000) / 1000; return -1; };
  const shimmer = mkProbe("rm-probe-shimmer", "reward-shimmer");
  const flame = mkProbe("rm-probe-flame", "streak-flame");
  return "PROBE|shimmerMs=" + toMs(getComputedStyle(shimmer).animationDuration) +
         "|flameName=" + getComputedStyle(flame).animationName +
         "|osReduced=" + matchMedia("(prefers-reduced-motion: reduce)").matches +
         "|manualClass=" + document.documentElement.classList.contains("user-reduce-motion") +
         "|dialogs=" + document.querySelectorAll("[data-state=open]").length;
})()' 2>/dev/null
}

echo "--- A. served source: the F2b media band must be in the built bundle"
# bash-side fetch (the async eval returned {} — agent-browser eval is sync);
# loose needles only — the minifier owns formatting (0.01ms may become .01ms)
HREFS=$(agent-browser eval '(() => "|" + [...document.querySelectorAll("link[rel=stylesheet]")].map(l => l.href).join("|") + "|")()' 2>/dev/null | tr -d '"')
echo "CSSHREFS$HREFS"
ALLCSS=""
for h in $(echo "$HREFS" | tr '|' ' '); do
  [ -z "$h" ] && continue
  CHUNK=$(curl -s "$h" --max-time 10 2>/dev/null)
  ALLCSS="$ALLCSS$CHUNK"
done
FLAT=$(printf '%s' "$ALLCSS" | tr -d ' \n\t\r')
echo "SERVED|mediaBand=$(echo "$FLAT" | rg -c 'prefers-reduced-motion:reduce' || echo 0)|hardStops=$(echo "$FLAT" | rg -o 'animation:none!important' | wc -l)|scrollAuto=$(echo "$FLAT" | rg -o 'scroll-behavior:auto!important' | wc -l)|iterOne=$(echo "$FLAT" | rg -o 'animation-iteration-count:1!important' | wc -l)"

echo "--- B1. baseline probes (no emulation): motion fully alive"
probe

echo "--- B2. OS emulation ON (set media dark reduced-motion)"
agent-browser set media dark reduced-motion >/dev/null 2>&1
sleep 1
probe

echo "--- B3. emulation reset ladder"
agent-browser set media dark >/dev/null 2>&1
sleep 1
P=$(probe)
RESET_METHOD="set-media-dark"
if echo "$P" | rg -q "osReduced=true"; then
  agent-browser set media light >/dev/null 2>&1
  sleep 1
  P=$(probe)
  RESET_METHOD="set-media-light"
fi
if echo "$P" | rg -q "osReduced=true"; then
  agent-browser close --all >/dev/null 2>&1
  sleep 1
  agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
  sleep 5
  for j in $(seq 1 10); do
    sleep 1
    agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x => /ناشناس\s*می.مانم/.test(x.textContent || "")); if (b) { b.click(); return "SKIPPED"; } return "WAITING"; })()' >/dev/null 2>&1
  done
  sleep 1
  patch_net
  RESET_METHOD="fresh-tab"
fi
echo "RESET-METHOD=$RESET_METHOD"
probe

echo "--- C. manual channel: settings toggle → html class (NO OS emulation)"
agent-browser click 'button[aria-label="تنظیمات"]' >/dev/null 2>&1
sleep 1.5
agent-browser click 'button[aria-label="کاهش حرکت و انیمیشن"]' >/dev/null 2>&1
sleep 1.5
probe

echo "--- C2. toggle back OFF → restored"
agent-browser click 'button[aria-label="کاهش حرکت و انیمیشن"]' >/dev/null 2>&1
sleep 1.5
probe

echo "--- D. honesty hint visible in the settings popover"
agent-browser eval '(() => {
  const txt = document.body.textContent || "";
  return "HINT|" + (txt.includes("خودکار هم آرام می‌شوند") ? "PRESENT" : "MISSING");
})()' 2>/dev/null
agent-browser press Escape >/dev/null 2>&1

echo "--- E. mobile 390 overflow (all overlays force-closed first)"
# run-3 lesson: the settings popover left open by C2 leaked into the
# viewport check (dialogs=2 → OV390=15) — the run-1 variant had the same
# artifact via the undismissed welcome modal (OV390=5). Measure only with
# a clean page: double Escape, verify dialogs=0, then measure.
agent-browser press Escape >/dev/null 2>&1
sleep 1
agent-browser press Escape >/dev/null 2>&1
sleep 1
probe
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const d = document.documentElement;
  const iw = window.innerWidth;
  let worst = null;
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.right > iw + 1 && r.width > 0) {
      if (!worst || r.right > worst.right) worst = { tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right) };
    }
  }
  return "OV390|innerWidth=" + iw + "|" + Math.max(d.scrollWidth - iw, 0) + "|worst=" + JSON.stringify(worst);
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools|audio|Audio" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "QA-DONE"
