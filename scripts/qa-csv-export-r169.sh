#!/bin/bash
# Task 169 — «خروجیِ CSV از پیشرفت» — the progress CSV export lives on:
# lib/progress-csv.ts (pure builder, anchor-day contract mirroring
# computeWeeklyDigest) + the second export button in the weekly report
# header (FileDown, beside Task 104's image button) + toast feedback.
#
# WHY production 3004: dev 3000 bundle is frozen pre-wave-9 — the same
# one-call route as r149-r168 (patch distDir → build side dir →
# next start -p 3004 → phases → kill → restore → rm).
#
# NO SEED this round: the CSV is honest with an empty history too
# (35 zero-filled calendar rows — the zero-fill contract IS part of
# the feature). The ephemeral profile starts visitor-fresh; the
# onboarding modal is skipped via the ZWNJ-tolerant poll (r168 lesson:
# «ناشناس می‌مانم» carries U+200C — includes() with a plain space
# never matches; and a live dialog silently intercepts hit-tested
# agent-browser clicks).
#
# NEW QA CAPABILITY: the download itself is captured SYNCHRONOUSLY —
# URL.createObjectURL is monkey-patched to stash the Blob on
# window.__csvBlob BEFORE the UI button is clicked. After the click we
# assert blob.type === "text/csv;charset=utf-8" and blob.size inside a
# computed band (36 lines ≈ 1.6–1.8KB: header + 35 rows of
# date,weekday,counters,total). agent-browser eval is sync (r168
# lesson) — so no blob.text(); the SIZE+TYPE pair plus the 14 unit
# tests on the pure builder cover the contract end to end.
#
# Phases:
#   0. patch distDir + production build into .next-prod169 + start 3004
#   1. open → ZWNJ-tolerant onboarding skip → FETCH/sendBeacon patch
#      (DB hygiene — no QA events reach the real DB)
#   2. blob-capture patch installed (survives until the click — no
#      reload happens in between)
#   3. navigate to the reports view (nav tab «گزارش») and assert the
#      CSV button exists BESIDE the image button (aria-label match)
#   4. click → toast «جدول CSV ذخیره شد» + captured blob TYPE/SIZE band
#   5. OV390 = 0 (dialogs closed; popover never opened)
#   6. console errors = 0 (audio-error whitelist per r16x convention)
#   7. cleanup: kill 3004 listeners, restore config/tsconfig, rm side dir
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r169.bak
DIST=.next-prod169

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod169",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r169-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r169-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod169 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod169-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod169-3004.log; exit 1; }

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

# DB hygiene: intercept analytics events BEFORE any navigation
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

echo "--- 2. blob-capture patch (sync — no reload between here and the click)"
agent-browser eval '(() => {
  const orig = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (b) => { window.__csvBlob = b; return orig(b); };
  return "BLOB-PATCHED";
})()' 2>/dev/null

echo "--- 3. navigate to reports view + CSV button presence"
agent-browser eval '(() => {
  const nav = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === "گزارش" || /گزارش/.test(x.textContent || ""));
  if (nav) { nav.click(); return "NAV-CLICKED"; }
  return "NAV-MISSING";
})()' 2>/dev/null
sleep 2
BTN=$(agent-browser eval '(() => {
  const csv = document.querySelector("button[aria-label=\"دانلود جدول CSV پیشرفت\"]");
  const img = document.querySelector("button[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]");
  const weekly = /هفته‌نامهٔ پیشرفت/.test(document.body.innerText || "");
  return "UI|weekly=" + weekly + "|csvBtn=" + (csv ? "OK" : "MISSING") + "|imgBtn=" + (img ? "OK" : "MISSING");
})()' 2>/dev/null | tr -d '"')
echo "$BTN"
echo "$BTN" | rg -q "weekly=true\|csvBtn=OK\|imgBtn=OK" || { echo "UI-ASSERT-FAILED"; exit 1; }

echo "--- 4. click → toast + captured blob"
agent-browser eval '(() => {
  const csv = document.querySelector("button[aria-label=\"دانلود جدول CSV پیشرفت\"]");
  if (!csv) return "BTN-GONE";
  csv.click();
  return "CLICKED";
})()' 2>/dev/null
sleep 1
RESULT=$(agent-browser eval '(() => {
  const b = window.__csvBlob;
  const toast = /جدول CSV ذخیره شد/.test(document.body.innerText || "");
  return "CAP|toast=" + toast + "|type=" + (b ? b.type : "none") + "|size=" + (b ? b.size : -1);
})()' 2>/dev/null | tr -d '"')
echo "$RESULT"
echo "$RESULT" | rg -q "toast=true" || { echo "TOAST-ASSERT-FAILED"; exit 1; }
echo "$RESULT" | rg -q "type=text/csv;charset=utf-8" || { echo "BLOB-TYPE-FAILED"; exit 1; }
SIZE=$(echo "$RESULT" | rg -o 'size=([0-9]+)' -r '$1')
# 36 lines (header + 35 rows): date 10 + weekday ~14-18 (UTF-8) + counters 5-10
# + commas 7 + CRLF 2 ⇒ ~1.5-1.9KB with BOM. Band 900..6000 is generous but
# excludes both "empty string" (3) and "whole dayHistory JSON" (>50KB).
if [ "$SIZE" -lt 900 ] || [ "$SIZE" -gt 6000 ]; then echo "BLOB-SIZE-FAILED ($SIZE)"; exit 1; fi
echo "BLOB-SIZE-OK ($SIZE bytes ≈ 36 CSV lines + BOM)"

echo "--- 5. OV390 (dialogs must be 0 — r168 lesson)"
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

echo "--- 6. console errors = 0 (audio-error whitelist)"
CON=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "playAudio|audio|Autoplay" | wc -l)
echo "CONSOLE-ERRORS=$CON"
[ "$CON" = "0" ] || { echo "CONSOLE-FAILED"; agent-browser console 2>/dev/null | rg -i "error" | head -10; exit 1; }

echo "--- 7. cleanup via trap (kill 3004, restore config, rm side dir)"
agent-browser close --all >/dev/null 2>&1
echo "ALL-PHASES-PASS"
