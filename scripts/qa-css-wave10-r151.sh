#!/bin/bash
# Task 151 — §8.3 wave 10 (bookshelf family) live QA against a PRODUCTION
# verification instance on 3004.
#
# WHY production: the long-lived dev server (3000) froze pre-wave-9 — its
# bundle can never contain wave 10. Same one-call production route as r149/
# r150: temporarily patch next.config.ts distDir, `bunx next build` into a
# SIDE dir, `next start -p 3004`, run all phases, kill via ss-PID, restore
# config + tsconfig (build auto-writes the side dir into tsconfig include),
# rm the side dir — all inside THIS single tool call (children are only
# reaped BETWEEN calls). Zero traces; DB app_open rows from QA opens are
# cleaned afterwards via the r101 --clean script (established pattern).
#
# Phases (against 127.0.0.1:3004, home view):
#   A. dark: .shelf-strip/.shelf-edge computed background-image carry the
#      MIGRATED stops (28,25,23 / 15,13,12 and 61,55,47 / 38,34,29) and NOT
#      the light utility stops — the !important painters survived the move.
#   B. light: utility gradients live (245,245,244→250,250,249 and
#      214,211,209→168,162,158), zero migrated stops (no dark leak).
#   C. CSSOM single-hit (selectorText-first walk — wave-9 lesson): base
#      .book-spine ×1, .book-spine:hover ×1, .dark .shelf-strip ×1,
#      .dark .shelf-edge ×1; zero book-spine/shelf heads in the globals
#      sheet; family sheet check (same sheet as the home-hero anchor).
#   D. served source: shelf + spine heads present in the family CSS chunk
#      (form-free per the minifier lesson), absent from the globals chunk.
#   E. OV390 = 0 (home untouched, but the manifest changed).
#   F. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r151.bak
DIST=.next-prod151

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod151",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r151-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r151-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod151 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod151-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod151-3004.log; exit 1; }

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
  const strip = document.querySelector(".shelf-strip");
  const edge = document.querySelector(".shelf-edge");
  const spine = document.querySelector(".book-spine");
  return "HOME-ELEMENTS|strip=" + (strip ? "present" : "MISSING") + "|edge=" + (edge ? "present" : "MISSING") + "|spine=" + (spine ? "present" : "MISSING");
})()' 2>/dev/null

echo "--- A. dark: migrated gradients paint strip + edge"
agent-browser eval '(() => {
  const strip = document.querySelector(".shelf-strip");
  const edge = document.querySelector(".shelf-edge");
  if (!strip || !edge) return "DARK|elements=MISSING";
  strip.style.transition = "none"; edge.style.transition = "none";
  document.documentElement.classList.add("dark");
  const s = getComputedStyle(strip).backgroundImage;
  const e = getComputedStyle(edge).backgroundImage;
  const out = {
    stripMigrated: s.includes("rgb(28, 25, 23)") && s.includes("rgb(15, 13, 12)"),
    stripNoLight: !s.includes("rgb(245, 245, 244)"),
    edgeMigrated: e.includes("rgb(61, 55, 47)") && e.includes("rgb(38, 34, 29)"),
    edgeNoLight: !e.includes("rgb(214, 211, 209)"),
  };
  document.documentElement.classList.remove("dark");
  return "DARK|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- B. light: utility gradients live (probe-equality — Tailwind v4 computes stops as lab()), zero migrated stops"
agent-browser eval '(() => {
  const strip = document.querySelector(".shelf-strip");
  const edge = document.querySelector(".shelf-edge");
  strip.style.transition = "none"; edge.style.transition = "none";
  // r150 lesson: form-proof by ELEMENT COMPARISON — probes carry the same
  // utility pair; computed strings may be lab()/rgb() depending on engine
  const mk = (cls) => { const el = document.createElement("div"); el.className = cls; el.style.transition = "none"; document.body.appendChild(el); return el; };
  const probeStrip = mk("bg-gradient-to-b from-stone-100 to-stone-50");
  const probeEdge = mk("bg-gradient-to-b from-stone-300 to-stone-400");
  const s = getComputedStyle(strip).backgroundImage;
  const e = getComputedStyle(edge).backgroundImage;
  const out = {
    stripUtility: s === getComputedStyle(probeStrip).backgroundImage,
    edgeUtility: e === getComputedStyle(probeEdge).backgroundImage,
    stripSample: s.slice(0, 72),
    noDarkStops: !(s + e).includes("rgb(28, 25, 23)") && !(s + e).includes("rgb(61, 55, 47)")
  };
  probeStrip.remove(); probeEdge.remove();
  return "LIGHT|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit (selectorText-first walk)"
agent-browser eval '(() => {
  const seen = { spineBase: 0, spineHover: 0, shelfStrip: 0, shelfEdge: 0, globalsHeads: 0, familySheetOk: false };
  const globalsHeadRe = /^(book-spine|dark .shelf-strip|dark .shelf-edge)$/;
  const walk = (rules, sheetTags) => {
    for (const r of rules) {
      if (r.selectorText) {
        const st = r.selectorText.replace(/^\s+|\s+$/g, "");
        if (st === ".book-spine") { seen.spineBase++; if (sheetTags.has("globals")) seen.globalsHeads++; }
        else if (st === ".book-spine:hover") { seen.spineHover++; if (sheetTags.has("globals")) seen.globalsHeads++; }
        else if (st === ".dark .shelf-strip") { seen.shelfStrip++; if (sheetTags.has("globals")) seen.globalsHeads++; if (sheetTags.has("family")) seen.familySheetOk = sheetTags.has("heroAnchor"); }
        else if (st === ".dark .shelf-edge") { seen.shelfEdge++; if (sheetTags.has("globals")) seen.globalsHeads++; }
      }
      if (r.cssRules && r.cssRules.length > 0) walk(r.cssRules, sheetTags);
    }
  };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    const tags = new Set();
    let text = "";
    try { for (const r of rules) if (r.selectorText || r.cssText) text += r.cssText + "\n"; } catch {}
    const probe = (sel) => { try { return [...rules].some((r) => r.selectorText === sel) || [...rules].some((r) => r.cssText && r.cssText.includes(sel)); } catch { return false; } };
    if (probe(".dark .stat-band")) tags.add("globals");
    if (probe(".hero-book::after")) tags.add("heroAnchor");
    if (probe(".book-spine") || probe(".dark .shelf-strip")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- D. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads = [".book-spine{", ".book-spine:hover{", ".dark .shelf-strip{", ".dark .shelf-edge{"];
  const family = { present: 0, missing: [] };
  const chunks = [...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.href);
  return Promise.all(chunks.map((u) => fetch(u).then((r) => r.text()).then((t) => ({ u, t }))))
    .then((all) => {
      const globalsChunks = all.filter((x) => x.t.includes(".dark .stat-band"));
      const familyChunks = all.filter((x) => !x.t.includes(".dark .stat-band"));
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
echo "R151-QA-DONE"
