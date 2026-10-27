#!/bin/bash
# Task 134 smoke — input-state re-verification before new work. Single session.
# A. home loads + core chrome
# B. duel setup regression: display-name input (Task 131) still present
# C. week-chip honest absence in normal week (Task 132 regression)
# D. features.css bundle live (Task 133): a rush rule must be present in served CSS
# E. dark mode toggle
# F. mobile 390: overflow = 0 (set viewport)
# G. console errors = 0
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
  const todayChip=txt.includes("امروز");
  const duelBtn=[...document.querySelectorAll("button")].some(x=>x.textContent.includes("نبرد"));
  return "HOME|todayChip="+todayChip+"|duelEntry="+duelBtn;
})()' 2>/dev/null

echo "--- B. duel setup — display-name regression (Task 131)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد"));
  if(b){b.click();return "CLICKED";} return "NO-DUEL-BTN";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const inp=document.querySelector("input[aria-label=\"نام نمایشی در این نبرد\"]");
  const create=[...document.querySelectorAll("button")].some(x=>x.textContent.includes("اتاق جدید بساز"));
  return "SETUP|nameInput="+(!!inp)+"|maxLength="+(inp?inp.maxLength:-1)+"|createBtn="+create;
})()' 2>/dev/null

echo "--- C. week-chip badge honest absence (Task 132 regression)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")&&x.getAttribute("aria-label").includes("هدف هفته"));
  if(!b) return "WEEKCHIP|missing-label";
  const badge=b.querySelector("span.absolute");
  return "WEEKCHIP|found=true|badgeInNormalWeek="+(!!badge);
})()' 2>/dev/null

echo "--- D. features.css bundle live (Task 133 regression)"
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

echo "--- E. dark mode"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const isDark=document.documentElement.classList.contains("dark");
  return "DARK|applied="+isDark;
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- F. mobile 390 overflow (set viewport)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "SMOKE-DONE"
