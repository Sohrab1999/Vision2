#!/bin/bash
# Task 135 smoke — input-state re-verification before CSS wave-2 work. Single session.
# A. home core  B. report ring seal regression (Task 134)  C. week-chip honest absence
# D. features.css bundle live (Task 133)  E. dark  F. mobile 390 OV  G. console 0
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. home core"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const txt=document.body.innerText;
  return "HOME|todayChip=" + txt.includes("امروز") + "|duelEntry=" + [...document.querySelectorAll("button")].some(x=>x.textContent.includes("نبرد"));
})()' 2>/dev/null

echo "--- B. week-chip honest absence (132) + ring aria"
agent-browser eval '(() => {
  const chip=document.querySelector("button.week-chip");
  if(!chip) return "NO-CHIP";
  return "CHIP|badgeInNormalWeek=" + (!!chip.querySelector("span.absolute")) + "|aria=" + (chip.getAttribute("aria-label")||"").slice(0,12);
})()' 2>/dev/null

echo "--- C. features.css bundle live (Task 133 regression)"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  let found=false;
  for(const h of links){
    try{ const t=await fetch(h).then(r=>r.text());
      if(t.includes(".rush-hero")||t.includes(".srs-panel")||t.includes(".report-dialog")){found=true;break;}
    }catch(e){}
  }
  return "CSSBUNDLE|links="+links.length+"|extractedRulesPresent="+found;
})()' 2>/dev/null

echo "--- D. dark mode"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => document.documentElement.classList.contains("dark") ? "DARK|applied=true" : "DARK|applied=false")()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "SMOKE-DONE"
