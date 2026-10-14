#!/bin/bash
# Task 163 — §8.3 wave 16 (the Flashcard 3D flip family + the appendix
# table's scroll rule) live QA against a PRODUCTION verification instance
# on 3004 (dev 3000 bundle is frozen pre-wave-9 — same one-call route as
# r149..r162).
#
# WHY production: the long-lived dev server (3000) can never contain wave 16.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Navigation: home word-of-day card button «فلش‌کارت درس» → lesson vocab tab
# → «حالت فلش‌کارت» → flashcards render (.flip-scene/.flip-card/.flip-face).
# Appendix via the header nav button «ضمیمه» (.verbs-table).
#
# Phases (against 127.0.0.1:3004):
#   A. flip structural styles live: perspective 1400px, preserve-3d,
#      0.55s transition, backface-visibility hidden (theme-free rules —
#      direct computed-style reads, no probe/probe-equality needed)
#   B. appendix: .verbs-table min-width 540px live
#   C. CSSOM single-hit ×6 heads (5 flip + verbs-table); zero wave-16
#      heads in the globals sheet (anchor: .dark .review-hero which STAYS);
#      family sheet check (same sheet as the hero-book::after anchor)
#   D. served source: the six heads present in the family CSS chunk,
#      absent from the globals chunk
#   E. OV390 = 0
#   F. console errors = 0
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r163.bak
DIST=.next-prod163

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod163",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r163-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r163-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod163 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod163-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod163-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1
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

echo "--- 2. navigate: word-of-day «فلش‌کارت درس» → vocab tab → «حالت فلش‌کارت»"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("فلش‌کارت درس"));
  if(!el) return "WOD-MISSING";
  el.click();
  return "WOD-CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("حالت فلش‌کارت"));
  if(!el) return "FLASHBTN-MISSING";
  el.click();
  return "FLASH-CLICKED";
})()' 2>/dev/null
sleep 3

echo "--- A. flip structural styles live (theme-free — direct computed reads)"
agent-browser eval '(() => {
  const scene=document.querySelector(".flip-scene");
  const card=document.querySelector(".flip-card");
  const face=document.querySelector(".flip-face");
  const back=document.querySelector(".flip-face.back");
  if(!scene||!card||!face||!back) return "FLIP-MISSING|" + JSON.stringify({scene:!!scene,card:!!card,face:!!face,back:!!back});
  const sc=getComputedStyle(scene), cc=getComputedStyle(card), fc=getComputedStyle(face);
  return "FLIP|" + JSON.stringify({
    perspective: sc.perspective,
    transformStyle: cc.transformStyle,
    transition: cc.transitionDuration + " " + cc.transitionTimingFunction.slice(0,24),
    backface: fc.backfaceVisibility,
    webkitBackface: fc.webkitBackfaceVisibility || "(none)"
  });
})()' 2>/dev/null

echo "--- B. flipped live: click the card → rotateY(180deg)"
agent-browser eval '(() => {
  const card=document.querySelector(".flip-card");
  if(!card) return "CARD-MISSING";
  card.click();
  return "CARD-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const card=document.querySelector(".flip-card");
  if(!card) return "CARD-MISSING";
  const m=getComputedStyle(card);
  return "FLIPPED|" + JSON.stringify({ hasFlippedClass: card.classList.contains("flipped"), transform: m.transform.slice(0,60) });
})()' 2>/dev/null
agent-browser eval '(() => {
  const card=document.querySelector(".flip-card");
  if(card) card.click();
  return "UNFLIPPED";
})()' 2>/dev/null

echo "--- C. appendix: header «ضمیمه» → .verbs-table min-width"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="ضمیمه");
  if(!el){ document.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyA",key:"a",bubbles:true})); return "NAV-KEY"; }
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const t=document.querySelector(".verbs-table");
  if(!t) return "VERBS-MISSING";
  const m=getComputedStyle(t);
  return "VERBS|" + JSON.stringify({ minWidth: m.minWidth });
})()' 2>/dev/null

echo "--- D. CSSOM single-hit ×6 heads (selectorText-first walk)"
agent-browser eval '(() => {
  const seen={scene:0, card:0, flipped:0, face:0, back:0, verbs:0, globalsHeads:0, familySheetOk:false};
  const heads={".flip-scene":"scene", ".flip-card":"card", ".flip-card.flipped":"flipped", ".flip-face":"face", ".flip-face.back":"back", ".verbs-table":"verbs"};
  const walk=(rules, sheetTags)=>{
    for(const r of rules){
      if(r.selectorText){
        const st=r.selectorText.replace(/^\s+|\s+$/g,"");
        if(heads[st]){ seen[heads[st]]++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor"); }
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
    if(probe(".flip-scene")||probe(".verbs-table")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- E. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads=[".flip-scene{", ".flip-card{", ".flip-card.flipped{", ".flip-face{", ".flip-face.back{", ".verbs-table{"];
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

echo "--- F. mobile 390 overflow (appendix view)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- G. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R163-QA-DONE"
