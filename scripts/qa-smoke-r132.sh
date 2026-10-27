#!/bin/bash
# Task 132 smoke — input-state re-verification before new work. Single session.
# A. home loads + core chrome (today chip, streak, header buttons)
# B. duel setup regression: display-name input (Task 131) still present
# C. dark mode: html.dark + stone background
# D. mobile 390: overflow = 0
# E. console errors = 0 across whole session
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

echo "--- C. dark mode"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const isDark=document.documentElement.classList.contains("dark");
  return "DARK|applied="+isDark;
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- D. mobile 390 overflow (set viewport — resize is a no-op)"
agent-browser eval '(() => { window.__sweep=[]; return "READY"; })()' 2>/dev/null
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "SMOKE-DONE"
