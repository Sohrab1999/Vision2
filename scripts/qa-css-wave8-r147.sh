#!/bin/bash
# Task 147 — CSS wave 8 live QA (single session, synthetic duel-done cards).
# A. dark: migrated dd-* gradients paint through the REAL cascade from their
#    new home (computed style) — and the retired attribute-rule bg-images stay
#    dead (no double paint) while their border-color stays live.
# B. light: darkLeak=false (the dark gradients never paint outside .dark).
# C. CSSOM single-strike: dd-win/tie/lose each x1, in the SAME sheet as the
#    duel-dark family (.dark .duel-hero); attr rules x1 with zero gradients.
# D. bundle source: the features bundle carries the migrated rgba stops and
#    NOT the retired ones.
# E. OV390=0  F. console=0. No seed, no DB touch.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- warm-up: enter app"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- A. dark paint through the real cascade (migrated winners + retired masked)"
agent-browser eval '(() => {
  document.documentElement.classList.add("dark");
  const mk=(cls)=>{const d=document.createElement("div");d.className=cls;document.body.appendChild(d);return d;};
  const win=mk("duel-done dd-win border-emerald-300 bg-gradient-to-bl from-emerald-50 to-teal-50");
  const tie=mk("duel-done dd-tie border-amber-300 bg-gradient-to-bl from-amber-50 to-orange-50");
  const lose=mk("duel-done dd-lose border-rose-300 bg-gradient-to-bl from-rose-50 to-orange-50");
  const bg=(el)=>getComputedStyle(el).backgroundImage;
  const res={
    winHasMigrated: bg(win).includes("6, 55, 40"),
    winHasRetired:  bg(win).includes("2, 44, 34"),
    tieHasMigrated: bg(tie).includes("69, 48, 12"),
    tieHasRetired:  bg(tie).includes("69, 26, 3"),
    loseHasMigrated:bg(lose).includes("88, 18, 30"),
    loseHasRetired: bg(lose).includes("76, 5, 25"),
    winBorderLive:  getComputedStyle(win).borderColor.includes("16, 185, 129"),
  };
  win.remove(); tie.remove(); lose.remove();
  document.documentElement.classList.remove("dark");
  return JSON.stringify(res);
})()' 2>/dev/null

echo "--- B. light leak check"
agent-browser eval '(() => {
  const d=document.createElement("div");
  d.className="duel-done dd-win border-emerald-300 bg-gradient-to-bl from-emerald-50 to-teal-50";
  document.body.appendChild(d);
  const bg=getComputedStyle(d).backgroundImage;
  const leak=bg.includes("6, 55, 40");
  d.remove();
  return "LIGHT|darkLeak="+leak;
})()' 2>/dev/null

echo "--- C. CSSOM single-strike + family home"
agent-browser eval '(() => {
  const counts={"dd-win":0,"dd-tie":0,"dd-lose":0,"attrE":0,"attrA":0,"attrR":0,"retiredBg":0};
  let homeDD=null, homeDuelHero=null;
  for(const sheet of document.styleSheets){
    let rules; try{rules=sheet.cssRules;}catch(e){continue;}
    const walk=(rs)=>{for(const r of rs){
      if(r.selectorText){
        const s=r.selectorText, href=sheet.href||("style:"+(sheet.ownerNode&&sheet.ownerNode.getAttribute("data-n-testid")||"inline"));
        if(s===".dark .dd-win"){counts["dd-win"]++;homeDD=href;}
        if(s===".dark .dd-tie"){counts["dd-tie"]++;}
        if(s===".dark .dd-lose"){counts["dd-lose"]++;}
        if(s.indexOf(".dark .duel-done[class*=\"border-emerald-300\"]")===0){counts.attrE++;if((r.style.backgroundImage||"").includes("linear-gradient"))counts.retiredBg++;}
        if(s.indexOf(".dark .duel-done[class*=\"border-amber-300\"]")===0){counts.attrA++;if((r.style.backgroundImage||"").includes("linear-gradient"))counts.retiredBg++;}
        if(s.indexOf(".dark .duel-done[class*=\"border-rose-300\"]")===0){counts.attrR++;if((r.style.backgroundImage||"").includes("linear-gradient"))counts.retiredBg++;}
        if(s===".dark .duel-hero"){homeDuelHero=href;}
      }
      // NOTE: plain CSSStyleRule has a (truthy, EMPTY) cssRules list in modern
      // chrome — check selectorText FIRST, then recurse only when non-empty.
      if(r.cssRules && r.cssRules.length) walk(r.cssRules);
    }};
    walk(rules);
  }
  return "CSSOM|"+JSON.stringify(counts)+"|sameFamilySheet="+(homeDD!==null&&homeDD===homeDuelHero);
})()' 2>/dev/null

echo "--- D. source freshness (style tags + links — dev injects <style>)"
agent-browser eval '(async () => {
  const texts=[...document.querySelectorAll("style")].map(s=>s.textContent||"");
  for(const l of [...document.querySelectorAll("link[rel=stylesheet]")].map(x=>x.href)){
    try{ texts.push(await fetch(l).then(r=>r.text())); }catch(e){}
  }
  const all=texts.join("\n");
  // minifier converts rgba() literals to hex — match shape-free evidence:
  // the dd-win head present + the attr rule block carries NO gradient
  const i=all.indexOf('.dark .duel-done[class*="border-emerald-300"]');
  const seg=i>=0?all.slice(i,i+240):"";
  return "SRC|chunks="+texts.length+"|ddWinPresent="+all.includes(".dark .dd-win")+"|attrFound="+(i>=0)+"|attrRuleHasGradient="+seg.includes("gradient");
})()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "WAVE8-QA-DONE"
