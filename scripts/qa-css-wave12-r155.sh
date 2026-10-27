#!/bin/bash
# Task 155 — §8.3 wave 12 (home stat + quote band dark painters) live QA
# against a PRODUCTION verification instance on 3004.
#
# WHY production: the long-lived dev server (3000) froze pre-wave-9 — its
# bundle can never contain wave 12. Same one-call production route as
# r149/r150/r151: temporarily patch next.config.ts distDir, `bunx next build`
# into a SIDE dir, `next start -p 3004`, run all phases, kill via ss-PID,
# restore config + tsconfig (build auto-writes the side dir into tsconfig
# include), rm the side dir — all inside THIS single tool call (children are
# only reaped BETWEEN calls). Zero traces; DB app_open rows from QA opens
# are cleaned afterwards via the r101 --clean script (established pattern).
#
# Phases (against 127.0.0.1:3004, home view — both owners render there:
# home-view.tsx line 105 <HomeFeed /> + line 112 quote-band):
#   A. dark: .stat-band computed background-image carries the MIGRATED stops
#      (6,55,40 / 6,44,40) and .quote-band carries (69,48,12 / 60,34,8) —
#      the !important painters survived the move (rgba literals → string
#      match valid; both comma and space serializations accepted).
#   B. light: utility gradients live via PROBE-EQUALITY (Tailwind v4 lab()
#      lesson — r151), zero migrated stops (no dark leak).
#   C. CSSOM single-hit (selectorText-first walk — wave-9 lesson):
#      .dark .stat-band ×1, .dark .quote-band ×1; zero band heads in the
#      globals sheet (anchored by .dark .review-hero, which stays); family
#      sheet check (same sheet as the home-hero anchor).
#   D. served source: band heads present in the family CSS chunk, absent
#      from the globals chunk (globals chunk identified by .dark .review-hero).
#   E. OV390 = 0 (manifest changed).
#   F. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r155.bak
DIST=.next-prod155

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  git checkout tsconfig.json >/dev/null 2>&1 || true
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod155",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r155-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r155-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod155 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod155-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod155-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1
# swallow analytics before anything else (DB hygiene — r150 lesson)
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
agent-browser eval '(() => {
  const band = document.querySelector(".stat-band");
  const quote = document.querySelector(".quote-band");
  return "HOME-ELEMENTS|statBand=" + (band ? "present" : "MISSING") + "|quoteBand=" + (quote ? "present" : "MISSING");
})()' 2>/dev/null

echo "--- A. dark: migrated gradients paint stat-band + quote-band"
agent-browser eval '(() => {
  const band = document.querySelector(".stat-band");
  const quote = document.querySelector(".quote-band");
  if (!band || !quote) return "DARK|elements=MISSING";
  band.style.transition = "none"; quote.style.transition = "none";
  document.documentElement.classList.add("dark");
  // normalize both serializations: "rgba(6, 55, 40, 0.45)" and
  // "rgb(6 55 40 / 0.45)" both become "... 6 55 40 ..." after comma-fold
  const norm = (v) => v.replace(/,\s+/g, " ");
  const s = norm(getComputedStyle(band).backgroundImage);
  const q = norm(getComputedStyle(quote).backgroundImage);
  const out = {
    bandMigrated: s.includes("6 55 40") && s.includes("6 44 40"),
    bandSample: s.slice(0, 90),
    quoteMigrated: q.includes("69 48 12") && q.includes("60 34 8"),
    quoteSample: q.slice(0, 90),
  };
  document.documentElement.classList.remove("dark");
  return "DARK|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- B. light: utility gradients live (probe-equality — Tailwind v4 lab() lesson), zero migrated stops"
agent-browser eval '(() => {
  const band = document.querySelector(".stat-band");
  const quote = document.querySelector(".quote-band");
  band.style.transition = "none"; quote.style.transition = "none";
  // r151 lesson: form-proof by ELEMENT COMPARISON — probes carry the same
  // utility pair; computed strings may be lab()/rgb() depending on engine
  const mk = (cls) => { const el = document.createElement("div"); el.className = cls; el.style.transition = "none"; document.body.appendChild(el); return el; };
  const probeBand = mk("bg-gradient-to-l from-emerald-50 to-teal-50");
  const probeQuote = mk("bg-gradient-to-l from-amber-50 to-orange-50");
  const s = getComputedStyle(band).backgroundImage;
  const q = getComputedStyle(quote).backgroundImage;
  const all = s + q;
  const out = {
    bandUtility: s === getComputedStyle(probeBand).backgroundImage,
    quoteUtility: q === getComputedStyle(probeQuote).backgroundImage,
    bandSample: s.slice(0, 72),
    noDarkStops: !(all.includes("6, 55, 40") || all.includes("6 55 40") || all.includes("69, 48, 12") || all.includes("69 48 12"))
  };
  probeBand.remove(); probeQuote.remove();
  return "LIGHT|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit (selectorText-first walk)"
agent-browser eval '(() => {
  const seen = { statBand: 0, quoteBand: 0, globalsHeads: 0, familySheetOk: false };
  const globalsHeadRe = /^dark .(stat-band|quote-band)$/;
  const walk = (rules, sheetTags) => {
    for (const r of rules) {
      if (r.selectorText) {
        const st = r.selectorText.replace(/^\s+|\s+$/g, "");
        if (st === ".dark .stat-band") { seen.statBand++; if (sheetTags.has("globals")) seen.globalsHeads++; if (sheetTags.has("family")) seen.familySheetOk = sheetTags.has("heroAnchor"); }
        else if (st === ".dark .quote-band") { seen.quoteBand++; if (sheetTags.has("globals")) seen.globalsHeads++; if (sheetTags.has("family")) seen.familySheetOk = sheetTags.has("heroAnchor"); }
      }
      if (r.cssRules && r.cssRules.length > 0) walk(r.cssRules, sheetTags);
    }
  };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    const tags = new Set();
    const probe = (sel) => { try { return [...rules].some((r) => r.selectorText === sel) || [...rules].some((r) => r.cssText && r.cssText.includes(sel)); } catch { return false; } };
    if (probe(".dark .review-hero")) tags.add("globals");
    if (probe(".hero-book::after")) tags.add("heroAnchor");
    if (probe(".dark .stat-band") || probe(".dark .quote-band")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- D. served source: band heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads = [".dark .stat-band{", ".dark .quote-band{"];
  const family = { present: 0, missing: [] };
  const chunks = [...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.href);
  return Promise.all(chunks.map((u) => fetch(u).then((r) => r.text()).then((t) => ({ u, t }))))
    .then((all) => {
      const globalsChunks = all.filter((x) => x.t.includes(".dark .review-hero"));
      const familyChunks = all.filter((x) => !x.t.includes(".dark .review-hero"));
      for (const h of heads) {
        if (familyChunks.some((x) => x.t.includes(h))) family.present++;
        else family.missing.push(h);
      }
      const inGlobals = globalsChunks.some((x) => heads.some((h) => x.t.includes(h)));
      return "SOURCE|" + JSON.stringify({ headsPresent: family.present, ofHeads: heads.length, missing: family.missing, inGlobalsChunk: inGlobals });
    });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow (manifest changed)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R155-QA-DONE"
