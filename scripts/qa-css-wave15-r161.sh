#!/bin/bash
# Task 161 — §8.3 wave 15 (the task-64 sweep band dissolved: listen-hero /
# name-cta / onboard-paper / dict-setup) live QA against a PRODUCTION
# verification instance on 3004 (dev 3000 bundle is frozen pre-wave-9 —
# same one-call route as r149/r150/r151/r155/r156/r157/r159).
#
# WHY production: the long-lived dev server (3000) can never contain wave 15.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Navigation (all four owners reachable with minimal movement):
#   .listen-hero   — home view directly (home-view.tsx:80 → ListenBanner)
#   .name-cta      — home view Leaderboard (home-view.tsx:104, default tab
#                    "exams") — renders only for anonymous users (!userName),
#                    so the seed forces userName:"" before the first reload.
#   .dict-setup    — home «دیکتهٔ امروز» button → lesson dictation tab →
#                    «شروع دیکته» → the active-round card's audio area.
#   .onboard-paper — LAST (modal blocks the page): seed onboarded:false +
#                    atomic reload → Dialog opens with the paper header; the
#                    cleanup seeds a normalized RETURNING-VISITOR state
#                    (introDone/onboarded true) + atomic reload → modal gone.
#
# EPHEMERAL-PROFILE LESSON (r161, three runs + qa-diag-r161d.sh proof):
# `agent-browser close --all` starts a FRESH browser profile — the 3004
# origin's localStorage begins EMPTY every run (D0: study=ABSENT). Restoring
# a "backup" of an absent original therefore legitimately yields the fresh-
# visitor state (onboarded defaults false → dialog opens) — correct app
# behavior, wrong harness assertion. All seed/restore steps are ATOMIC
# (setItem + location.reload() in ONE eval task) so no poll-timer setState
# can interleave (JS single-threaded).
#
# Phases (against 127.0.0.1:3004):
#   A. light: listen-hero + name-cta — present + utility-gradient probe
#      equality (Tailwind v4 lab() lesson) + zero migrated dark stops.
#   B. dark: the migrated painters paint through the real cascade —
#      listen (8,51,68 / 19,78,74), name-cta (6,55,40 / 19,78,74) —
#      rgba literals, comma-fold norm (r155 lesson).
#   C. dict-setup: navigate, start a round, light probe equality
#      (from-violet-50/70) + dark painter (59,32,96 → transparent).
#   D. served-source single-hit ×4 heads; zero wave-15 heads in the globals
#      sheet (anchor: .dark .review-hero which STAYS — multi-consumer);
#      family sheet check (same sheet as the hero-book::after anchor).
#   E. served source: the four heads present in the family CSS chunk,
#      absent from the globals chunk.
#   F. OV390 = 0 (home view).
#   G. onboarding: onboard-paper light probe + dark painter, then restore.
#   H. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r161.bak
DIST=.next-prod161

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod161",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r161-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r161-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod161 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod161-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod161-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
# seed BEFORE store hydration matters — backup ONCE, then force anonymous +
# onboarded (name-cta needs !userName; intro stays done) and reload
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const raw=localStorage.getItem(KEY);
  if(!localStorage.getItem("vision2-qa-bak-r161")) localStorage.setItem("vision2-qa-bak-r161", raw===null?"":raw);
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state=Object.assign({},obj.state,{introDone:true,onboarded:true,userName:""});
  localStorage.setItem(KEY,JSON.stringify(obj));
  location.reload();
  return "SEEDED-ANON";
})()' 2>/dev/null
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

# ============ A+B: listen-hero + name-cta (home view) ============
echo "--- A. listen-hero light: present + probe-equality"
agent-browser eval '(() => {
  const el=document.querySelector(".listen-hero");
  if(!el) return "LIGHT1|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-cyan-50 via-teal-50 to-emerald-50");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60)};
  probe.remove();
  return "LIGHT1|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B1. listen-hero dark: migrated painter paints (comma-fold norm)"
agent-browser eval '(async () => {
  const el=document.querySelector(".listen-hero");
  if(!el) return "DARK1|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={listen:g.includes("8 51 68")&&g.includes("19 78 74")&&g.includes("24 21 18"), sample:g.slice(0,100)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK1|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- C1. name-cta light (leaderboard exams tab, anonymous): present + probe-equality"
agent-browser eval '(() => {
  const el=document.querySelector(".name-cta");
  if(!el) return "LIGHT2|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-emerald-50 to-teal-50");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60)};
  probe.remove();
  return "LIGHT2|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B2. name-cta dark: migrated painter paints"
agent-browser eval '(async () => {
  const el=document.querySelector(".name-cta");
  if(!el) return "DARK2|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={name:g.includes("6 55 40")&&g.includes("19 78 74"), sample:g.slice(0,84)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK2|" + JSON.stringify(out);
})()' 2>/dev/null

# ============ C: dict-setup (lesson dictation tab, active round) ============
echo "--- 2C. navigate: home «دیکتهٔ امروز» → lesson dictation tab"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ امروز"));
  if(!el) return "NAV-MISSING";
  el.click();
  return "NAV-CLICKED";
})()' 2>/dev/null
sleep 3
echo "--- 2C2. start a dictation round («شروع دیکته»)"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("شروع دیکته"));
  if(!el) return "START-MISSING";
  el.click();
  return "START-CLICKED";
})()' 2>/dev/null
sleep 2
echo "--- C2. dict-setup light: present + probe-equality (from-violet-50/70)"
agent-browser eval '(() => {
  const el=document.querySelector(".dict-setup");
  if(!el) return "LIGHT3|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-b from-violet-50/70 to-transparent");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60)};
  probe.remove();
  return "LIGHT3|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- B3. dict-setup dark: migrated painter paints"
agent-browser eval '(async () => {
  const el=document.querySelector(".dict-setup");
  if(!el) return "DARK3|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={dict:g.includes("59 32 96"), sample:g.slice(0,84)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK3|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- back home («خانه» header button)"
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

# ============ D: CSSOM single-hit (selectorText-first walk) ============
echo "--- D. CSSOM single-hit ×4 heads (home view)"
agent-browser eval '(() => {
  const seen={listen:0, name:0, onboard:0, dict:0, globalsHeads:0, familySheetOk:false};
  const heads={".dark .listen-hero":"listen", ".dark .name-cta":"name", ".dark .onboard-paper":"onboard", ".dark .dict-setup":"dict"};
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
    if(probe(".dark .listen-hero")||probe(".dark .name-cta")||probe(".dark .onboard-paper")||probe(".dark .dict-setup")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

# ============ E: served source ============
echo "--- E. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads=[".dark .listen-hero{", ".dark .name-cta{", ".dark .onboard-paper{", ".dark .dict-setup{"];
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

# ============ F: mobile 390 overflow (home view) ============
echo "--- F. mobile 390 overflow (home view)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

# ============ G: onboarding (LAST — modal blocks the page) ============
echo "--- G. onboard-paper: seed onboarded:false + reload → Dialog opens"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const raw=localStorage.getItem(KEY);
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state=Object.assign({},obj.state,{onboarded:false});
  localStorage.setItem(KEY,JSON.stringify(obj));
  location.reload();
  return "ONBOARD-SEEDED";
})()' 2>/dev/null
sleep 5
agent-browser eval '(() => {
  const el=document.querySelector(".onboard-paper");
  if(!el) return "LIGHT4|MISSING";
  el.style.transition="none";
  const mk=(cls)=>{const p=document.createElement("div");p.className=cls;p.style.transition="none";document.body.appendChild(p);return p;};
  const probe=mk("bg-gradient-to-l from-emerald-50 via-white to-white");
  const g=getComputedStyle(el).backgroundImage;
  const pg=getComputedStyle(probe).backgroundImage;
  const out={present:true, utility:g===pg, sample:g.slice(0,60)};
  probe.remove();
  return "LIGHT4|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- G2. onboard-paper dark: migrated painter paints"
agent-browser eval '(async () => {
  const el=document.querySelector(".onboard-paper");
  if(!el) return "DARK4|MISSING";
  el.style.transition="none";
  document.documentElement.classList.add("dark");
  await new Promise(r=>setTimeout(r,150));
  const norm=(v)=>v.replace(/,\s+/g," ");
  const g=norm(getComputedStyle(el).backgroundImage);
  const out={onboard:g.includes("6 55 40")&&g.includes("24 21 18"), sample:g.slice(0,100)};
  document.documentElement.classList.remove("dark");
  await new Promise(r=>setTimeout(r,80));
  return "DARK4|" + JSON.stringify(out);
})()' 2>/dev/null
echo "--- G3. leave a normalized returning-visitor state + atomic reload → modal gone"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  localStorage.removeItem("vision2-qa-bak-r161");
  localStorage.setItem(KEY, JSON.stringify({state:{introDone:true,onboarded:true,userName:""},version:0}));
  location.reload();
  return "RESTORED";
})()' 2>/dev/null
sleep 5
agent-browser eval '(() => {
  const modal=document.querySelector(".onboard-paper");
  return modal ? "ONBOARD-STILL-OPEN" : "ONBOARD-CLOSED-OK";
})()' 2>/dev/null

# ============ H: console errors ============
echo "--- H. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools|audio|Audio" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R161-QA-DONE"
