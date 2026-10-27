#!/bin/bash
# Task 157 — §8.3 wave 13 (my-words dark launcher family) live QA against a
# PRODUCTION verification instance on 3004 (dev 3000 bundle is frozen
# pre-wave-9 — same one-call route as r149/r150/r151/r155/r156).
#
# WHY production: the long-lived dev server (3000) can never contain wave 13.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Navigation: the my-words view is lazy — reached via the home tool card
# «واژه‌های من» (home-tools.tsx) — the r149 nav-click pattern. All four
# launcher cards render together inside my-words.tsx (lines 139-154).
#
# Phases (against 127.0.0.1:3004, my-words view):
#   A. dark: the three MIGRATED gradients paint through the real cascade —
#      hero (69,48,12), cards/dictation (59,32,96 — one rule, two elements),
#      story (8,47,60) — rgba literals, comma-fold norm (r155 lesson).
#   B. light: utility gradients live (probe-equality on the cards card —
#      Tailwind v4 lab() lesson), zero migrated stops on all four elements.
#   C. CSSOM single-hit (selectorText-first walk — wave-9 lesson): each of
#      the three heads ×1; zero mywords heads in the globals sheet (anchor:
#      .dark .review-hero which STAYS — multi-consumer); family sheet check
#      (same sheet as the home-hero anchor).
#   D. served source: the three heads present in the family CSS chunk,
#      absent from the globals chunk (globals chunk identified by
#      .dark .review-hero).
#   E. OV390 = 0 on the my-words view (manifest changed).
#   F. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r157.bak
DIST=.next-prod157

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod157",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r157-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r157-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod157 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod157-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod157-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
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

echo "--- 2. navigate: home tool card «واژه‌های من» → my-words view"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button, [role=button]")].find(x=>x.textContent.includes("واژه‌های من"));
  if(!el) return "TOOLCARD-MISSING";
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const hero=document.querySelector(".mywords-hero");
  const cards=document.querySelector(".mywords-cards");
  const dict=document.querySelector(".mywords-dictation");
  const story=document.querySelector(".mywords-story");
  return "VIEW|hero=" + (hero?"present":"MISSING") + "|cards=" + (cards?"present":"MISSING") + "|dict=" + (dict?"present":"MISSING") + "|story=" + (story?"present":"MISSING");
})()' 2>/dev/null

echo "--- A. dark: the three migrated gradients paint (comma-fold norm)"
agent-browser eval '(async () => {
  const els=[".mywords-hero",".mywords-cards",".mywords-dictation",".mywords-story"].map(s=>document.querySelector(s));
  if(els.some(e=>!e)) return "DARK|elements=MISSING";
  els.forEach(e=>e.style.transition="none");
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=els.map(e=>norm(getComputedStyle(e).backgroundImage));
  const out={
    hero: g[0].includes("69 48 12") && g[0].includes("24 21 18"),
    cards: g[1].includes("59 32 96"),
    dict: g[2].includes("59 32 96"),
    story: g[3].includes("8 47 60"),
    heroSample: g[0].slice(0,84)
  };
  document.documentElement.classList.remove("dark");
  return "DARK|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- B. light: utility gradients live (probe-equality), zero migrated stops"
agent-browser eval '(() => {
  const els=[".mywords-hero",".mywords-cards",".mywords-dictation",".mywords-story"].map(s=>document.querySelector(s));
  els.forEach(e=>e.style.transition="none");
  const mk=(cls)=>{const el=document.createElement("div");el.className=cls;el.style.transition="none";document.body.appendChild(el);return el;};
  const probe=mk("bg-gradient-to-l from-violet-50/90 to-white");
  const g=els.map(e=>getComputedStyle(e).backgroundImage);
  const all=g.join(" ");
  const out={
    cardsUtility: g[1]===getComputedStyle(probe).backgroundImage,
    noDarkStops: !(all.includes("69, 48, 12")||all.includes("69 48 12")||all.includes("59, 32, 96")||all.includes("59 32 96")||all.includes("8, 47, 60")||all.includes("8 47 60"))
  };
  probe.remove();
  return "LIGHT|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit (selectorText-first walk)"
agent-browser eval '(() => {
  const seen={hero:0, cardsDict:0, story:0, globalsHeads:0, familySheetOk:false};
  const walk=(rules, sheetTags)=>{
    for(const r of rules){
      if(r.selectorText){
        const st=r.selectorText.replace(/^\s+|\s+$/g,"");
        if(st===".dark .mywords-hero"){seen.hero++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor");}
        else if(st===".dark .mywords-cards, .dark .mywords-dictation"){seen.cardsDict++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor");}
        else if(st===".dark .mywords-story"){seen.story++; if(sheetTags.has("globals"))seen.globalsHeads++;}
      }
      if(r.cssRules && r.cssRules.length>0) walk(r.cssRules, sheetTags);
    }
  };
  for(const sheet of document.styleSheets){
    let rules; try{rules=sheet.cssRules;}catch{continue;}
    if(!rules) continue;
    const tags=new Set();
    const probe=(sel)=>{try{return [...rules].some(r=>r.selectorText===sel)||[...rules].some(r=>r.cssText&&r.cssText.includes(sel));}catch{return false;}};
    if(probe(".dark .review-hero")) tags.add("globals");
    if(probe(".hero-book::after")) tags.add("heroAnchor");
    if(probe(".dark .mywords-hero")||probe(".dark .mywords-story")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- D. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads=[".dark .mywords-hero{", ".dark .mywords-cards,.dark .mywords-dictation{", ".dark .mywords-story{"];
  const family={present:0, missing:[]};
  const chunks=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  return Promise.all(chunks.map(u=>fetch(u).then(r=>r.text()).then(t=>({u,t}))))
    .then((all)=>{
      const globalsChunks=all.filter(x=>x.t.includes(".dark .review-hero"));
      const familyChunks=all.filter(x=>!x.t.includes(".dark .review-hero"));
      for(const h of heads){
        if(familyChunks.some(x=>x.t.includes(h))) family.present++;
        else family.missing.push(h);
      }
      const inGlobals=globalsChunks.some(x=>heads.some(h=>x.t.includes(h)));
      return "SOURCE|" + JSON.stringify({headsPresent:family.present, ofHeads:heads.length, missing:family.missing, inGlobalsChunk:inGlobals});
    });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow (on the my-words view)"
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
echo "R157-QA-DONE"
