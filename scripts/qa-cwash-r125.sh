#!/bin/bash
# Task 125 QA — c-wash-* semantic wash family (tranche 4 phase 8) — single session.
# LIGHT: injected RAW bg-*-50 references vs the c-wash chips — computed equality
#        proves light byte-parity (same var).
# DARK : absolute retired-literal probes (0.4/0.45/0.5/0.5) + kernel-step
#        difference proof (raw = 0.35, wash = panel-grade) + root border fold.
# RUSH : real round driven to the done screen — the three migrated pills probe
#        the retired .dark .rush-done literals absolutely.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A0. intro skip (if any)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- A1. seed SRS (3 due + 2 future) — full-key build, backup kept"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r125-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const now=Date.now(), H=3600e3, D=86400e3;
  st.srs={
    "1:ability":{level:0,dueAt:now-H},
    "1:access":{level:2,dueAt:now-2*H},
    "2:achieve":{level:3,dueAt:now-3*H},
    "2:active":{level:1,dueAt:now+2*D},
    "3:adapt":{level:4,dueAt:now+3*D},
  };
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED|srs=5";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1

echo "--- B. LIGHT probes: c-wash chips vs injected RAW references (equality = byte parity)"
agent-browser eval '(() => {
  const probe=(sel)=>{const el=document.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING:"+sel;};
  // inject raw references (the utilities still exist in the compiled chunk)
  const host=document.createElement("div");
  host.style.cssText="position:fixed;top:-200px;left:-200px";
  host.innerHTML=`<div id="raw-rose" class="bg-rose-50"></div><div id="raw-amber" class="bg-amber-50"></div><div id="raw-emerald" class="bg-emerald-50"></div><div id="raw-teal" class="bg-teal-50"></div>`;
  document.body.appendChild(host);
  const raw=(id)=>getComputedStyle(document.getElementById(id)).backgroundColor;
  const chip=(c)=>probe(".srs-panel ."+c);
  const out={
    lightMode: !(document.documentElement.classList.contains("dark")),
    rose_chip: chip("c-wash-rose"), raw_rose: raw("raw-rose"),
    amber_chip: chip("c-wash-amber"), raw_amber: raw("raw-amber"),
    emerald_chip: chip("c-wash-emerald"), raw_emerald: raw("raw-emerald"),
    teal_chip: chip("c-wash-teal"), raw_teal: raw("raw-teal"),
    count_pill: probe(".srs-panel span.rounded-full.c-wash-rose"),
    vocab_pill: probe(".vocab-donut .c-wash-emerald"),
    srs_root_border: getComputedStyle(document.querySelector(".srs-panel")).borderColor,
  };
  host.remove();
  return JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. toggle DARK (header button — aria-label flips)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-ON|"+document.documentElement.className;
})()' 2>/dev/null
sleep 1

echo "--- D. DARK probes: absolute retired literals + kernel-step difference"
agent-browser eval '(() => {
  const probe=(sel)=>{const el=document.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING:"+sel;};
  const host=document.createElement("div");
  host.style.cssText="position:fixed;top:-200px;left:-200px";
  host.innerHTML=`<div id="raw-rose" class="bg-rose-50"></div><div id="raw-amber" class="bg-amber-50"></div><div id="raw-emerald" class="bg-emerald-50"></div><div id="raw-teal" class="bg-teal-50"></div>`;
  document.body.appendChild(host);
  const raw=(id)=>getComputedStyle(document.getElementById(id)).backgroundColor;
  const chip=(c)=>probe(".srs-panel ."+c);
  const out={
    dark: document.documentElement.classList.contains("dark"),
    rose_chip: chip("c-wash-rose"),       raw_rose_kernel: raw("raw-rose"),
    amber_chip: chip("c-wash-amber"),     raw_amber_kernel: raw("raw-amber"),
    emerald_chip: chip("c-wash-emerald"), raw_emerald_kernel: raw("raw-emerald"),
    teal_chip: chip("c-wash-teal"),       raw_teal_kernel: raw("raw-teal"),
    count_pill: probe(".srs-panel span.rounded-full.c-wash-rose"),
    vocab_pill: probe(".vocab-donut .c-wash-emerald"),
    srs_root_border: getComputedStyle(document.querySelector(".srs-panel")).borderColor,
  };
  host.remove();
  return JSON.stringify(out);
})()' 2>/dev/null

echo "--- E. real rush round → done screen (dark kept) — migrated pills absolute probes"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش");
  if(!b) return "RUSH-BANNER-MISSING";
  b.click(); return "RUSH-NAV";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const b=document.querySelector(".rush-start") || [...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش");
  if(!b) return "START-MISSING";
  b.click(); return "START-OK";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const card=document.querySelector(".rush-card");
  const opts=card?card.querySelectorAll("button"):[];
  return "Q1|options="+opts.length;
})()' 2>/dev/null
for i in $(seq 1 10); do
  agent-browser eval '(() => {
    const card=document.querySelector(".rush-card");
    if(!card) return "NO-CARD";
    const opts=card.querySelectorAll("button");
    if(opts.length){opts[0].click(); return "ANSWERED";}
    return "NO-OPTS";
  })()' >/dev/null 2>&1
  sleep 4
done
echo "waited out the 60s timer"
sleep 2
agent-browser eval '(() => {
  const done=document.querySelector(".rush-done");
  if(!done) return "DONE-SCREEN-MISSING";
  const pill=(sel)=>{const el=done.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING";};
  return JSON.stringify({
    emerald: pill(".c-wash-emerald"),
    rose: pill(".c-wash-rose"),
    amber: pill(".c-wash-amber"),
    sky_kernel: pill(".bg-sky-50"),
    combo_wash: pill(".c-wash-amber:not(.rounded-full)") || pill("div.c-wash-amber"),
  });
})()' 2>/dev/null

echo "--- F. mobile 390 overflow (home, dark)"
agent-browser open "http://127.0.0.1:3000" >/dev/null 2>&1
sleep 3
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b) b.click();
  const d=document.documentElement;
  const ov=d.scrollWidth-d.clientWidth;
  return "MOBILE390|OV="+ov+"|W="+d.clientWidth;
})()' 2>/dev/null

echo "--- G. console errors (session)"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"

echo "--- H. strip seed (restore backup)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r125-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r125-backup");
  return "STRIPPED|restored="+(bak==="__ABSENT__"?"absent":!!bak);
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA125_END"
