#!/bin/bash
# Task 164 — §8.3 wave 17 (the grammar-metro family: .gmetro map + .glesson
# 90s flow → grammar/grammar-metro.css) live QA against a PRODUCTION
# verification instance on 3004 (dev 3000 bundle is frozen pre-wave-9 —
# same one-call route as r149..r163).
#
# WHY production: the long-lived dev server (3000) can never contain wave 17.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Navigation: home tools card «متروی گرامر» → grammar map (.gmetro) →
# first station chip «درس دارد» → station dialog (.gmetro-dialog) →
# button «درس ۹۰ثانیه‌ای» → lesson flow (.glesson, step 0 = SeeStep with
# the role pieces). Dark via documentElement class (smoke precedent).
#
# EPHEMERAL-PROFILE LESSON (r161): agent-browser close --all starts a NEW
# temp profile — 3004 origin localStorage starts EMPTY. Everything this
# script needs is seeded, never "restored from a backup that cannot exist".
# No reload happens after the FETCH/beacon patch → the patch survives.
#
# Phases (against 127.0.0.1:3004):
#   A. light: map present + light role-piece painters (the band's only
#      light rules — 5 hex-literal pieces; probe the subject piece)
#   B. dark flow: piece override + see/timebar/note/close painters
#   C. dark map: hero gradient (3 rgb stops, no lab/oklab residue),
#      emerald line washes, node-open ring; dialog + tip washes
#   D. CSSOM single-hit ×12 heads (selectorText-first walk); zero wave-17
#      heads in the globals sheet (anchor .dark .review-hero — 5th wave
#      in a row); family sheet = the .flip-scene sheet (features bundle)
#   E. served source: 8 heads in the family CSS chunk, absent from the
#      globals chunk
#   F. OV390 = 0 (grammar view, mobile 390)
#   G. console errors = 0
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r164.bak
DIST=.next-prod164

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod164",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r164-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r164-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod164 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod164-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod164-3004.log; exit 1; }

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

echo "--- 2. navigate: home tools card «متروی گرامر» → grammar map"
agent-browser eval '(() => {
  const el=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("متروی گرامر"));
  if(!el) return "TOOL-MISSING";
  el.click();
  return "TOOL-CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const map=document.querySelector(".gmetro");
  if(!map) return "MAP-MISSING";
  return "MAP-OK|lines="+document.querySelectorAll(".gmetro-line").length+"|stations="+document.querySelectorAll(".gmetro-chip").length;
})()' 2>/dev/null

echo "--- 3. first station with lesson «درس دارد» → dialog → «درس ۹۰ثانیه‌ای»"
agent-browser eval '(() => {
  const btns=[...document.querySelectorAll("button")].filter(b=>b.querySelector(".gmetro-chip") && b.querySelector(".gmetro-chip").textContent.includes("درس دارد"));
  if(!btns.length) return "LESSON-CHIP-MISSING";
  btns[0].click();
  return "STATION-CLICKED|candidates="+btns.length;
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const dlg=document.querySelector(".gmetro-dialog");
  if(!dlg) return "DIALOG-MISSING";
  const lb=[...dlg.querySelectorAll("button")].find(x=>x.textContent.includes("درس ۹۰ثانیه‌ای"));
  if(!lb) return "LESSON-BTN-MISSING";
  lb.click();
  return "LESSON-OPENED";
})()' 2>/dev/null
sleep 3

echo "--- A. light: role pieces (band light painters = hex literals → rgb)"
agent-browser eval '(() => {
  const p=document.querySelector(".glesson-piece.glesson-role-subject");
  if(!p) return "PIECE-MISSING";
  const m=getComputedStyle(p);
  return "LIGHT-PIECE|" + JSON.stringify({ bg: m.backgroundColor, border: m.borderColor, color: m.color });
})()' 2>/dev/null

echo "--- B. dark flow: piece override + see/timebar/note/close"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const p=document.querySelector(".glesson-piece.glesson-role-subject");
  const see=document.querySelector(".glesson-see");
  const tb=document.querySelector(".glesson-timebar");
  const note=document.querySelector(".glesson-note");
  const close=document.querySelector(".glesson-close");
  if(!p||!see||!tb||!note||!close) return "FLOW-ELTS-MISSING|" + JSON.stringify({p:!!p,see:!!see,tb:!!tb,note:!!note,close:!!close});
  const mp=getComputedStyle(p), ms=getComputedStyle(see), mt=getComputedStyle(tb), mn=getComputedStyle(note), mc=getComputedStyle(close);
  return "DARK-FLOW|" + JSON.stringify({
    pieceBg: mp.backgroundColor, pieceBorder: mp.borderColor, pieceColor: mp.color,
    seeBg: ms.backgroundColor, seeBorder: ms.borderColor,
    timebarBg: mt.backgroundColor, noteColor: mn.color, closeBg: mc.backgroundColor
  });
})()' 2>/dev/null

echo "--- C. dark map: close flow → hero/line/node + dialog/tip"
agent-browser eval '(() => {
  const c=document.querySelector(".glesson-close");
  if(!c) return "CLOSE-MISSING";
  c.click();
  return "FLOW-CLOSED";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const hero=document.querySelector(".gmetro-hero");
  const line=document.querySelector(".gmetro-line[class*=\"border-emerald-200\"]");
  const node=document.querySelector(".gmetro-node-open");
  if(!hero||!line||!node) return "MAP-ELTS-MISSING|" + JSON.stringify({hero:!!hero,line:!!line,node:!!node});
  const mh=getComputedStyle(hero), ml=getComputedStyle(line), mn=getComputedStyle(node);
  const img=(mh.backgroundImage||"").replace(/,/g," ").replace(/\s+/g," ");
  // post-norm stops are space-separated: rgb(15 118 110) — Chrome also
  // serializes the corner keyword as "to left bottom"
  return "DARK-MAP|" + JSON.stringify({
    heroImg: img.slice(0,130),
    heroHasTeal: img.includes("rgb(15 118 110)"),
    heroHasMid: img.includes("rgb(17 94 89)"),
    heroHasDeep: img.includes("rgb(6 78 59)"),
    heroDirOk: img.includes("to left bottom") || img.includes("to bottom left"),
    heroIsGradient: img.startsWith("linear-gradient("),
    heroNoLab: !img.includes("lab(") && !img.includes("oklab"),
    lineBorder: ml.borderColor, lineBg: ml.backgroundColor,
    nodeBorder: mn.borderColor, nodeBg: mn.backgroundColor
  });
})()' 2>/dev/null
agent-browser eval '(() => {
  const btns=[...document.querySelectorAll("button")].filter(b=>b.querySelector(".gmetro-chip") && b.querySelector(".gmetro-chip").textContent.includes("درس دارد"));
  if(!btns.length) return "LESSON-CHIP-MISSING-2";
  btns[0].click();
  return "STATION-CLICKED-2";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const dlg=document.querySelector(".gmetro-dialog");
  const tip=dlg && dlg.querySelector(".gmetro-tip");
  const tipIcon=tip && tip.querySelector(".text-amber-600");
  if(!dlg||!tip) return "DIALOG2-MISSING";
  const md=getComputedStyle(dlg), mt2=getComputedStyle(tip), mi=tipIcon?getComputedStyle(tipIcon):null;
  const out={ dlgBg: md.backgroundColor, dlgBorder: md.borderColor, tipBg: mt2.backgroundColor, tipBorder: mt2.borderColor };
  if(mi) out.tipIconColor = mi.color;
  return "DARK-DIALOG|" + JSON.stringify(out);
})()' 2>/dev/null
agent-browser eval '(() => { document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",code:"Escape",keycode:27,bubbles:true})); return "ESC-SENT"; })()' 2>/dev/null
sleep 1

echo "--- D. CSSOM single-hit ×12 heads (selectorText-first walk)"
agent-browser eval '(() => {
  const heads={
    ".glesson-piece.glesson-role-subject":"subject",
    ".dark .glesson-piece.glesson-role-subject":"darkSubject",
    ".dark .gmetro-hero":"hero",
    ".dark .gmetro-line[class*=\"border-emerald-200\"]":"lineEm",
    ".dark .gmetro-node-open":"nodeOpen",
    ".dark .gmetro-dialog":"dialog",
    ".dark .gmetro-lesson":"lesson",
    ".dark .glesson-head[class*=\"border-emerald-200\"]":"headEm",
    ".dark .glesson-opt.glesson-opt-correct":"optCorrect",
    ".dark .glesson-mirror .glesson-mirror-fa":"mirrorFa",
    ".dark .glesson-done.glesson-done-perfect":"donePerfect",
    ".dark .gmetro-lesson-badge":"lessonBadge"
  };
  const seen={}; Object.values(heads).forEach(k=>seen[k]=0);
  seen.globalsHeads=0; seen.familyHits=0; seen.sheets=0;
  const walk=(rules, tags)=>{
    for(const r of rules){
      if(r.selectorText){
        const st=r.selectorText.trim();
        const k=heads[st];
        if(k){ seen[k]++; if(tags.has("globals")) seen.globalsHeads++; if(tags.has("family")) seen.familyHits++; }
      }
      if(r.cssRules && r.cssRules.length>0) walk(r.cssRules, tags);
    }
  };
  for(const sheet of document.styleSheets){
    let rules; try{rules=sheet.cssRules;}catch{continue;}
    if(!rules) continue;
    seen.sheets++;
    const tags=new Set();
    const probe=(sel)=>{try{return [...rules].some(r=>r.selectorText===sel);}catch{return false;}};
    if(probe(".dark .review-hero")) tags.add("globals");
    if(probe(".flip-scene")) tags.add("family");
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- E. served source: heads in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads=[".glesson-piece.glesson-role-subject{", ".dark .gmetro-hero{", ".dark .gmetro-node-open{", ".dark .gmetro-dialog{", ".dark .gmetro-lesson{", ".dark .glesson-opt.glesson-opt-correct{", ".dark .glesson-mirror .glesson-mirror-fa{", ".dark .gmetro-lesson-badge{"];
  const chunks=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  return Promise.all(chunks.map(u=>fetch(u).then(r=>r.text()).then(t=>({u,t}))))
    .then((all)=>{
      const globalsChunks=all.filter(x=>x.t.includes(".dark .review-hero"));
      const familyChunks=all.filter(x=>!x.t.includes(".dark .review-hero"));
      const missing=heads.filter(h=>!familyChunks.some(x=>x.t.includes(h)));
      const inGlobals=globalsChunks.some(x=>heads.some(h=>x.t.includes(h)));
      return "SOURCE|" + JSON.stringify({headsPresent:heads.length-missing.length, ofHeads:heads.length, missing:missing, inGlobalsChunk:inGlobals});
    });
})()' 2>/dev/null

echo "--- F. mobile 390 overflow (grammar map)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

agent-browser close --all >/dev/null 2>&1
echo "R164-QA-DONE"
