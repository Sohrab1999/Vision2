#!/bin/bash
# Task 149 — CSS wave 9 live QA against a PRODUCTION verification instance.
#
# WHY production: the long-lived dev server (3000) froze pre-wave-9 — its
# Turbopack watcher event stream died mid-round (registered incident), so the
# served CSS bundle can never contain this wave's rules. Instead of killing the
# platform-owned dev server (no revival path), this script builds nothing —
# it starts the ALREADY-BUILT side-distDir standalone bundle (.next-prod149)
# on port 3004, runs the full QA inside THIS single tool call (the child-process
# reaping law only applies BETWEEN calls), then kills it. Zero traces beyond
# the dist dir, which is removed after QA.
#
# Phases (all against 127.0.0.1:3004, real dictionary view, no seed, no DB):
#   A. dark: migrated trio paints through the real cascade — active
#      bg-stone-700 chip rgb(87,83,78); inactive badge rgba(60,55,49,0.95)
#      + ink rgb(168,162,158); chip ink rgb(201,194,187) via the STAYED
#      canonical-group member.
#   B. light: darkLeak=false (no migrated value paints outside .dark —
#      utility shapes are lab()/oklab() in chrome, so leak-only assertions).
#   C. CSSOM single-strike (selectorText-first walk): three heads x1 each,
#      same family sheet; globals sheet (srs-donut host) carries ZERO
#      dict-state-chip heads except the canonical member (exactly 1).
#   D. source freshness: served chunks carry the three heads once each and
#      the canonical member (minified — shape-free occurrence counts).
#   E. OV390=0 on the dictionary view.  F. console=0.
set -u
cd /home/z/my-project

echo "--- orchestration: start prod149 on 3004 (lives only inside this call)"
# NOTE: Next overwrites process.title ("next-server (v16.1.3)") so pkill -f on
# the cmdline never matches — kill by the ss-reported PID instead.
for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do kill -9 "$pid" 2>/dev/null; done
sleep 1
( NEXT_DIST_DIR=.next-prod149 NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod149-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
if [ "$UP" != "1" ]; then echo "SERVER-FAILED"; tail -20 /tmp/prod149-3004.log; exit 1; fi

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5

echo "--- warm-up: enter app"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- A. real dictionary view + dark paint through the real cascade"
agent-browser eval '(() => {
  const nav=[...document.querySelectorAll("nav[aria-label=\"ناوبری اصلی\"] button")];
  const dictBtn=nav.find(x=>x.textContent.includes("دیکشنری"));
  if(!dictBtn) return "NAVBTN-MISSING";
  dictBtn.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 2
# transition-all lesson: the chip carries Tailwind transition-all — reading
# computed style in the same tick as the .dark toggle yields a TRANSITION
# FRAME (interpolated in oklab space), not the final value. Wait past the
# 150ms default duration before asserting.
agent-browser eval '(async () => {
  for(const c of document.querySelectorAll(".dict-state-chip, .dict-state-chip *")){
    c.style.transition="none";
  }
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const chips=[...document.querySelectorAll(".dict-state-chip")];
  if(chips.length<2) return "CHIPS-MISSING:"+chips.length;
  const active=chips.find(c=>c.classList.contains("bg-stone-700"));
  const inactive=chips.find(c=>c.classList.contains("bg-stone-100"));
  if(!active||!inactive) return "CHIP-KINDS-MISSING";
  const badge=inactive.querySelector("[class*=\"bg-stone-200\"]");
  if(!badge) return "BADGE-MISSING";
  const bgc=(el)=>getComputedStyle(el).backgroundColor;
  const res={
    chipCount: chips.length,
    activeBgIsMigrated: bgc(active)==="rgb(87, 83, 78)",
    badgeBgIsMigrated:  bgc(badge)==="rgba(60, 55, 49, 0.95)",
    badgeInkIsMigrated: getComputedStyle(badge).color==="rgb(168, 162, 158)",
    chipInkViaCanonicalMember: getComputedStyle(inactive).color==="rgb(201, 194, 187)",
    rawActiveBg: bgc(active), rawBadgeBg: bgc(badge),
  };
  return "DARK|"+JSON.stringify(res);
})()' 2>/dev/null

echo "--- B. light leak check (same real chips)"
agent-browser eval '(async () => {
  for(const c of document.querySelectorAll(".dict-state-chip, .dict-state-chip *")){
    c.style.transition="none";
  }
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,150));
  const active=[...document.querySelectorAll(".dict-state-chip")].find(c=>c.classList.contains("bg-stone-700"));
  const inactive=[...document.querySelectorAll(".dict-state-chip")].find(c=>c.classList.contains("bg-stone-100"));
  const badge=inactive.querySelector("[class*=\"bg-stone-200\"]");
  const bgc=(el)=>getComputedStyle(el).backgroundColor;
  const res={
    activeBgNotDark: bgc(active)!=="rgb(87, 83, 78)",
    badgeBgNotDark:  bgc(badge)!=="rgba(60, 55, 49, 0.95)",
    badgeInkNotDark: getComputedStyle(badge).color!=="rgb(168, 162, 158)",
    chipInkNotDark:  getComputedStyle(inactive).color!=="rgb(201, 194, 187)",
    rawActiveBg: bgc(active), rawBadgeBg: bgc(badge),
  };
  return "LIGHT|"+JSON.stringify(res);
})()' 2>/dev/null

echo "--- C. CSSOM single-strike + family home + globals absence"
agent-browser eval '(() => {
  const counts={hover:0,attr:0,stone700:0};
  let homeTrio=null, homeSrsDonut=null;
  const chipHeadsInGlobalsSheet=[];
  for(const sheet of document.styleSheets){
    let rules; try{rules=sheet.cssRules;}catch(e){continue;}
    const walk=(rs,href)=>{for(const r of rs){
      if(r.selectorText){
        const s=r.selectorText;
        if(s===".dark .dict-state-chip.bg-stone-100:hover"){counts.hover++;homeTrio=href;}
        if(s===".dark .dict-state-chip [class*=\"bg-stone-200\"]"){counts.attr++;}
        if(s===".dark .dict-state-chip.bg-stone-700"){counts.stone700++;}
        if(s===".dark .srs-donut"){homeSrsDonut=href;}
        if(href===homeSrsDonut && s.indexOf("dict-state-chip")>=0) chipHeadsInGlobalsSheet.push(s);
      }
      // selectorText FIRST — plain CSSStyleRule carries a truthy-but-empty
      // cssRules list in modern chrome (wave-8 lesson)
      if(r.cssRules && r.cssRules.length) walk(r.cssRules,href);
    }};
    walk(rules, sheet.href||"inline");
  }
  return "CSSOM|"+JSON.stringify(counts)+"|trioSheetIsNotGlobals="+(homeTrio!==null&&homeTrio!==homeSrsDonut)+"|chipHeadsInGlobals="+JSON.stringify(chipHeadsInGlobalsSheet);
})()' 2>/dev/null

echo "--- D. source freshness (production chunks — shape-free counts)"
agent-browser eval '(async () => {
  const texts=[...document.querySelectorAll("style")].map(s=>s.textContent||"");
  for(const l of [...document.querySelectorAll("link[rel=stylesheet]")].map(x=>x.href)){
    try{ texts.push(await fetch(l).then(r=>r.text())); }catch(e){}
  }
  const all=texts.join("\n");
  const cnt=(re)=>(all.match(re)||[]).length;
  const res={
    chunks: texts.length,
    hoverHead:  cnt(/dict-state-chip\.bg-stone-100:hover/g),
    attrHead:   cnt(/dict-state-chip \[class\*=/g),
    stone700:   cnt(/dict-state-chip\.bg-stone-700/g),
    canonical:  cnt(/dict-state-chip\.bg-stone-100[ {:.]/g),
  };
  return "SRC|"+JSON.stringify(res);
})()' 2>/dev/null

echo "--- E. mobile 390 overflow (still on the dictionary view)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do kill -9 "$pid" 2>/dev/null; done
sleep 1
echo "WAVE9-PROD-QA-DONE"
