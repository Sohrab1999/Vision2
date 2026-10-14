#!/bin/bash
# Task 159 — §8.3 wave 14 (the three remaining single-consumer launcher
# painters: smart-hero / konkur-hero / exam-dict-cta) live QA against a
# PRODUCTION verification instance on 3004 (dev 3000 bundle is frozen
# pre-wave-9 — same one-call route as r149/r150/r151/r155/r156/r157).
#
# WHY production: the long-lived dev server (3000) can never contain wave 14.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Navigation: three MUTUALLY EXCLUSIVE views (study-app view.type
# smart/exam/konkur), each reached from its home tool card (home-tools.tsx):
# «تمرین هوشمند» → smart-practice-view (.smart-hero, line 124),
# «گوشهٔ کنکور» → konkur-view (.konkur-hero, line 218),
# «آزمون جامع» → exam-view (.exam-dict-cta, line 283 — unconditional,
# disabled below DICTATION_MIN_EXAM). Return home between views via the
# header nav button «خانه» (exact trim match) with the KeyH shortcut as
# fallback (study-app shortcut handler).
#
# Phases (against 127.0.0.1:3004):
#   A. light: per-view — element present + utility gradient probe-equality
#      (Tailwind v4 lab() lesson — NEVER raw string match on utility stops)
#      + zero migrated dark stops in light mode.
#   B. dark: per-view — the three MIGRATED gradients paint through the real
#      cascade — smart (76,29,149), konkur (124,45,18), dict-cta (6,55,40) —
#      rgba literals, comma-fold norm (r155 lesson).
#   C. CSSOM single-hit (selectorText-first walk — wave-9 lesson): each of
#      the three heads ×1; zero wave-14 heads in the globals sheet (anchor:
#      .dark .review-hero which STAYS — multi-consumer, same anchor as 157);
#      family sheet check (same sheet as the hero-book::after anchor).
#   D. served source: the three heads present in the family CSS chunk,
#      absent from the globals chunk (globals chunk identified by
#      .dark .review-hero).
#   E. OV390 = 0 (home view).
#   F. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r159.bak
DIST=.next-prod159

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod159",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r159-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r159-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod159 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod159-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod159-3004.log; exit 1; }

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

go_home() {
  agent-browser eval '(() => {
    const btn=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="خانه");
    if(btn){btn.click();return "HOME-BTN";}
    document.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyH",key:"h",bubbles:true}));
    return "HOME-KEY";
  })()' 2>/dev/null
  sleep 2
  agent-browser eval '(() => {
    const card=[...document.querySelectorAll("button, [role=button]")].find(x=>x.textContent.includes("تمرین هوشمند"));
    return card ? "HOME-OK" : "HOME-MISSING";
  })()' 2>/dev/null
}

# ============ VIEW 1: smart (smart-practice-view) ============
echo "--- 2A. navigate: home tool card «تمرین هوشمند» → smart view"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button, [role=button]")].find(x=>x.textContent.includes("تمرین هوشمند"));
  if(!el) return "TOOLCARD-MISSING";
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
echo "--- A1. smart light: present + probe-equality + zero dark stops"
agent-browser eval '(() => {
  const el=document.querySelector(".smart-hero");
  if(!el) return "LIGHT1|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-violet-50 to-white");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60), probeSample:pg.slice(0,60)};
  probe.remove();
  return "LIGHT1|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B1. smart dark: migrated painter paints (comma-fold norm)"
agent-browser eval '(async () => {
  const el=document.querySelector(".smart-hero");
  if(!el) return "DARK1|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={smart:g.includes("76 29 149")&&g.includes("24 21 18"), sample:g.slice(0,84)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK1|" + JSON.stringify(out);
})()' 2>/dev/null

go_home

# ============ VIEW 2: konkur (konkur-view) ============
echo "--- 2B. navigate: home tool card «گوشهٔ کنکور» → konkur view"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button, [role=button]")].find(x=>x.textContent.includes("گوشهٔ کنکور"));
  if(!el) return "TOOLCARD-MISSING";
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
echo "--- A2. konkur light: present + probe-equality + zero dark stops"
agent-browser eval '(() => {
  const el=document.querySelector(".konkur-hero");
  if(!el) return "LIGHT2|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-red-600 via-orange-500 to-amber-500");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60), probeSample:pg.slice(0,60)};
  probe.remove();
  return "LIGHT2|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B2. konkur dark: migrated painter paints"
agent-browser eval '(async () => {
  const el=document.querySelector(".konkur-hero");
  if(!el) return "DARK2|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={konkur:g.includes("124 45 18")&&g.includes("24 21 18"), sample:g.slice(0,84)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK2|" + JSON.stringify(out);
})()' 2>/dev/null

go_home

# ============ VIEW 3: exam (exam-view) ============
echo "--- 2C. navigate: home tool card «آزمون جامع» → exam view"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button, [role=button]")].find(x=>x.textContent.includes("آزمون جامع"));
  if(!el) return "TOOLCARD-MISSING";
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
echo "--- A3. exam light: dict-cta present + probe-equality + zero dark stops"
agent-browser eval '(() => {
  const el=document.querySelector(".exam-dict-cta");
  if(!el) return "LIGHT3|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-emerald-50 to-white");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60), probeSample:pg.slice(0,60)};
  probe.remove();
  return "LIGHT3|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B3. exam dark: migrated painter paints"
agent-browser eval '(async () => {
  const el=document.querySelector(".exam-dict-cta");
  if(!el) return "DARK3|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={dict:g.includes("6 55 40")&&g.includes("24 21 18"), sample:g.slice(0,84)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK3|" + JSON.stringify(out);
})()' 2>/dev/null

go_home

echo "--- C. CSSOM single-hit (selectorText-first walk)"
agent-browser eval '(() => {
  const seen={smart:0, konkur:0, dict:0, globalsHeads:0, familySheetOk:false};
  const walk=(rules, sheetTags)=>{
    for(const r of rules){
      if(r.selectorText){
        const st=r.selectorText.replace(/^\s+|\s+$/g,"");
        if(st===".dark .smart-hero"){seen.smart++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor");}
        else if(st===".dark .konkur-hero"){seen.konkur++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor");}
        else if(st===".dark .exam-dict-cta"){seen.dict++; if(sheetTags.has("globals"))seen.globalsHeads++; if(sheetTags.has("family"))seen.familySheetOk=sheetTags.has("heroAnchor");}
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
    if(probe(".dark .smart-hero")||probe(".dark .konkur-hero")||probe(".dark .exam-dict-cta")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- D. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads=[".dark .smart-hero{", ".dark .konkur-hero{", ".dark .exam-dict-cta{"];
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

echo "--- E. mobile 390 overflow (home view)"
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
echo "R159-QA-DONE"
