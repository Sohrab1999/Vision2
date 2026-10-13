#!/bin/bash
# Task 125 QA follow-up — rush-done pills absolute probes (fixed timing: full 60s + margin)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-ON";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش");
  if(!b) return "RUSH-BANNER-MISSING";
  b.click(); return "RUSH-NAV";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const b=document.querySelector(".rush-start");
  if(!b) return "START-MISSING";
  b.click(); return "START-OK";
})()' 2>/dev/null
sleep 2
# answer periodically across the full 60s window (14 x 5s = 70s > 60s timer)
for i in $(seq 1 14); do
  R=$(agent-browser eval '(() => {
    if(document.querySelector(".rush-done")) return "DONE";
    const card=document.querySelector(".rush-card");
    if(!card) return "NO-CARD";
    const opts=card.querySelectorAll("button");
    if(opts.length){opts[0].click(); return "ANSWERED";}
    return "NO-OPTS";
  })()' 2>/dev/null)
  if echo "$R" | grep -q DONE; then echo "done screen after ~$((i*5))s"; break; fi
  sleep 5
done
sleep 1.5
agent-browser eval '(() => {
  const done=document.querySelector(".rush-done");
  if(!done) return "DONE-SCREEN-MISSING";
  const pill=(sel)=>{const el=done.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING";};
  return JSON.stringify({
    emerald: pill(".c-wash-emerald"),
    rose: pill(".c-wash-rose"),
    amber: pill(".c-wash-amber"),
    sky_kernel: pill(".bg-sky-50"),
  });
})()' 2>/dev/null
echo "--- console"
agent-browser console 2>/dev/null | grep -iE "error" | head -3
echo "CONSOLE_END"
# strip any state the round wrote (identity persists — DB cleanup handles the rest)
agent-browser close --all >/dev/null 2>&1
echo "QA125RUSH_END"
