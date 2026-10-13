#!/bin/bash
# Task 111 — «کتابِ زنده» — single-session live QA (localStorage-only, DB untouched).
# ① intro skip ② hero renders with ring (newcomer ۰٪ honest) ③ seed 126 known →
#    ring aria «۲۰٪» + «۱۲۶ از ۶۳۳ واژه» ④ tilt probe: pointermove → matrix3d,
#    pointerleave → settles back ⑤ reduce-motion seed → tilt inert ⑥ sheen class +
#    page-edge aria-hidden ⑦ mobile 390 overflow 0 ⑧ console 0. Screenshots light+dark.
set -e
BASE="http://127.0.0.1:3000"
C=node_modules/.cache/r111
mkdir -p node_modules/.cache

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot > $C-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' $C-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' $C-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi
echo "P1 intro-skipped"

echo "--- A. newcomer hero: ring honest zero + structure"
agent-browser eval '(()=>{
  const ring=document.querySelector("svg[aria-label^=\"گنجینهٔ واژگانِ تو\"]");
  const cover=document.querySelector("button.hero-book");
  const edge=cover?cover.querySelectorAll("[aria-hidden=\"true\"]").length:0;
  const arc=ring?ring.querySelectorAll("circle").length:0;
  return JSON.stringify({ringPresent:!!ring,ringAria:ring?ring.getAttribute("aria-label"):null,circles:arc,coverClass:!!cover,ariaHiddenCount:edge});
})()'

echo "--- B. seed 126 known → re-open → ring ۲۰٪ + count line"
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  const known={};
  for(let i=0;i<126;i++) known["w"+i]=true;
  obj.state.known=known;
  localStorage.setItem("vision2-study-v1",JSON.stringify(obj));
  return "seeded-126";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval '(()=>{
  const ring=document.querySelector("svg[aria-label^=\"گنجینهٔ واژگانِ تو\"]");
  const t=[...document.querySelectorAll("div")].map(d=>d.textContent.trim()).find(x=>/از ۶۳۳ واژه$/.test(x));
  return JSON.stringify({ringAria:ring?ring.getAttribute("aria-label"):null,countLine:t||"MISSING"});
})()'

echo "--- C. tilt probe: pointermove → rotated transform; leave → settles"
agent-browser eval '(()=>{
  const cover=document.querySelector("button.hero-book");
  const r=cover.getBoundingClientRect();
  const ev=new PointerEvent("pointermove",{clientX:r.left+r.width*0.15,clientY:r.top+r.height*0.2,bubbles:true});
  cover.dispatchEvent(ev);
  return "moved";
})()'
sleep 1
agent-browser eval '(()=>{
  const cover=document.querySelector("button.hero-book");
  return JSON.stringify({afterMove:cover.style.transform.slice(0,60)||"EMPTY"});
})()'
agent-browser eval '(()=>{const cover=document.querySelector("button.hero-book");cover.dispatchEvent(new PointerEvent("pointerleave",{bubbles:true}));return "left";})()'
sleep 2
agent-browser eval '(()=>{
  const cover=document.querySelector("button.hero-book");
  const t=cover.style.transform;
  return JSON.stringify({afterLeave:t.slice(0,60)||"EMPTY",settled:/matrix3d\(1, 0, 0, 1,|none|""/.test(t)||t==="none"});
})()'

echo "--- D. reduce-motion seed → tilt inert"
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.settings={ttsRate:1,fontScale:1,reduceMotion:true};
  localStorage.setItem("vision2-study-v1",JSON.stringify(obj));
  return "rm-seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval '(()=>{
  const cover=document.querySelector("button.hero-book");
  const r=cover.getBoundingClientRect();
  cover.dispatchEvent(new PointerEvent("pointermove",{clientX:r.left+r.width*0.1,clientY:r.top+r.height*0.15,bubbles:true}));
  return "moved-rm";
})()'
sleep 1
agent-browser eval '(()=>{
  const cover=document.querySelector("button.hero-book");
  const t=cover.style.transform;
  return JSON.stringify({reduceMotionTransform:t||"NONE-STYLE"});
})()'

echo "--- E. screenshots light/dark + strip reduce-motion"
agent-browser eval '(()=>{localStorage.removeItem("vision2-study-v1");const raw=localStorage.getItem("vision2-study-v1");return raw?"still-there":"stripped";})()'
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser eval '(()=>{const el=document.querySelector("section.grid");el.scrollIntoView({block:"start"});return "top";})()' >/dev/null
agent-browser screenshot /tmp/r111-hero-light.png >/dev/null 2>&1
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label*=\"حالت شب\"],button[aria-label*=\"شب\"]");if(b){b.click();return "dark-toggled";}return "toggle-not-found";})()' >/dev/null
sleep 1
agent-browser screenshot /tmp/r111-hero-dark.png >/dev/null 2>&1
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label*=\"حالت روشن\"],button[aria-label*=\"روشن\"],button[aria-label*=\"شب\"],button[aria-label*=\"روشنایی\"]");if(b){b.click();return "re-light";}return "no-toggle";})()' >/dev/null

echo "--- F. mobile 390 overflow (home)"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{const d=document.documentElement;return JSON.stringify({view:"home-mobile390",overflow:d.scrollWidth-d.clientWidth});})()'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

echo "--- G. console errors (whole session, expect 0)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE (localStorage-only QA — DB untouched)"
