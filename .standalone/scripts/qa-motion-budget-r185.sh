#!/bin/bash
# Task 185 — P6 motion budget live QA: the three P6 edits measured in the
# REAL browser. P1: CSS-rule level (.flip-card 0.42s, .confetti-piece
# ease-out). P2: a REAL card flip through واژه‌های من → شروع فلش‌کارت,
# computed transition-duration on the flipped element. P3: hygiene.
# Weekly-chart bars are framer-JS driven — pinned at source level by
# tests/motion-budget.test.ts (not DOM-measurable reliably).
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3000"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 6
# seed one starred lesson-1 word so the my-words flashcards deck is non-empty
# (stars live in starredWords: string[] — NOT the known/blam map)
agent-browser eval '(()=>{const raw=localStorage.getItem("vision2-study-v1");if(!raw)return "no-key";const d=JSON.parse(raw);
  d.state=d.state||{};d.state.starredWords=["1:ability"];d.state.known={};
  localStorage.setItem("vision2-study-v1",JSON.stringify(d));return "seeded"})()' >/dev/null 2>&1
agent-browser eval 'location.reload();"reloading"' >/dev/null 2>&1
sleep 7
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b)b.click();return 1})()' >/dev/null 2>&1
sleep 1

echo "== P1: CSS rule level — the two globals.css edits resolve =="
R=$(agent-browser eval '(()=>{
  let flip=null,conf=null;
  for(const sheet of document.styleSheets){
    let rules;try{rules=sheet.cssRules}catch{continue}
    for(const r of rules){
      if(r.selectorText===".flip-card")flip=r.style.transitionDuration;
      if(r.selectorText===".confetti-piece")conf=r.style.animationTimingFunction;
    }
  }
  return JSON.stringify({flip,conf})})()' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'flip:0.42s' && ok ".flip-card rule = 0.42s (was 0.55s)" || bad "flip rule: $R"
echo "$R" | grep -q 'conf:ease-out' && ok ".confetti-piece rule = ease-out (was ease-in)" || bad "confetti rule: $R"

echo "== P2: real flip through my-words deck (UI path: star via dictionary) =="
# localStorage seeding is racy in this app (mount-time app_open set() writes
# defaults BEFORE skipHydration rehydrate reads storage — seed gets clobbered),
# so the star is created through the app's own UI: dictionary -> star button.
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("دیکشنری جستجو"));if(b){b.click();return "dict-open"}const n=[...document.querySelectorAll("a,button")].find(x=>(x.textContent||"").trim()==="دیکشنری");if(n){n.click();return "dict-nav"}return "nf"})()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const i=document.querySelector("input[placeholder*=language]");if(!i)return "no-input";const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;s.call(i,"ability");i.dispatchEvent(new Event("input",{bubbles:true}));return "typed"})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"").includes("افزودن ability"));if(!b)return "already-starred-or-nf";b.click();return "starred"})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="رفتن به واژه‌های من");if(b){b.click();return "nav-mywords"}return "nf-link"})()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/شروع فلش‌کارت/.test(x.textContent||""));if(b){b.click();return "started"}return "nf"})()' >/dev/null 2>&1
sleep 2
# flip via synthetic click on the .flip-card div (role=button) — ONE event
# only: Enter+click together double-toggle and cancel out (the same
# double-toggle class the task-183 P2 test pins for Space)
agent-browser eval '(()=>{const c=document.querySelector(".flip-card");if(!c)return "no-card";c.dispatchEvent(new MouseEvent("click",{bubbles:true}));return "flip-clicked"})()' >/dev/null 2>&1
sleep 1
R2=$(agent-browser eval '(()=>{
  const c=document.querySelector(".flip-card");
  if(!c)return JSON.stringify({card:false});
  const cs=getComputedStyle(c);
  return JSON.stringify({card:true,flipped:c.classList.contains("flipped"),dur:cs.transitionDuration})})()' 2>&1 | tr -d '"\')
echo "$R2"
echo "$R2" | grep -q 'card:true' && ok "flashcard deck mounted" || bad "deck did not open"
echo "$R2" | grep -q 'flipped:true' && ok "card really flipped (Enter/click path)" || bad "flip did not engage"
echo "$R2" | grep -q 'dur:0.42s' && ok "computed transition-duration on live element = 0.42s" || bad "live duration: $R2"

echo "== P3: hygiene =="
E=$(agent-browser errors 2>&1)
echo "$E" | rg -qi "error" && bad "console errors: $E" || ok "console clean"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
SW=$(agent-browser eval 'window.innerWidth+"sw"+document.documentElement.scrollWidth' 2>&1 | tr -d '"')
echo "$SW" | grep -q "390sw390" && ok "390 viewport no overflow" || bad "overflow: $SW"
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "== RESULT: PASS=$PASS FAIL=$FAIL =="
[ "$FAIL" -eq 0 ]
