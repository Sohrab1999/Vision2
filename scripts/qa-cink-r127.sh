#!/bin/bash
# Task 127 QA — c-ink-amber semantic ink family (tranche 4 phase 9) — single session.
# LIGHT: injected RAW text-amber-700 reference vs the migrated c-ink-amber sites —
#        computed COLOR equality proves light byte-parity (same var token).
# DARK : absolute retired-literal probes (#fcd34d) vs the global band (#fbbf24 on
#        the raw utility) — proves the deviation lives on the class, not the token.
# RUSH : real round driven to the done screen — the migrated combo chip probes the
#        retired .dark .rush-done literal absolutely (dark kept).
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

echo "--- A1. seed SRS (3 due + 2 future) + one weak quiz result (skill CTA) — full-key build, backup kept"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r127-backup", prev||"__ABSENT__");
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
  st.results={"1:vocab":{correct:4,total:10,percent:40,at:new Date().toISOString()}};
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED|srs=5|results=1";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1

echo "--- B. LIGHT probes: c-ink-amber sites vs injected RAW text-amber-700 reference (equality = byte parity)"
agent-browser eval '(() => {
  const host=document.createElement("div");
  host.style.cssText="position:fixed;top:-200px;left:-200px";
  host.innerHTML=`<span id="raw-amber-ink" class="text-amber-700">REF</span>`;
  document.body.appendChild(host);
  const raw=()=>getComputedStyle(document.getElementById("raw-amber-ink")).color;
  const col=(sel)=>{const el=document.querySelector(sel); return el?getComputedStyle(el).color:"MISSING:"+sel;};
  const out={
    lightMode: !(document.documentElement.classList.contains("dark")),
    srs_chip_ink: col(".srs-panel .c-ink-amber"), raw_ink: raw(),
    skill_cta_ink: col(".skill-weak-cta .c-ink-amber"),
    srs_chip_bg: col(".srs-panel .c-wash-amber"),
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

echo "--- D. DARK probes: absolute retired literal #fcd34d vs global band #fbbf24 on raw utility"
agent-browser eval '(() => {
  const host=document.createElement("div");
  host.style.cssText="position:fixed;top:-200px;left:-200px";
  host.innerHTML=`<span id="raw-amber-ink" class="text-amber-700">REF</span>`;
  document.body.appendChild(host);
  const raw=()=>getComputedStyle(document.getElementById("raw-amber-ink")).color;
  const col=(sel)=>{const el=document.querySelector(sel); return el?getComputedStyle(el).color:"MISSING:"+sel;};
  const out={
    dark: document.documentElement.classList.contains("dark"),
    srs_chip_ink: col(".srs-panel .c-ink-amber"),
    skill_cta_ink: col(".skill-weak-cta .c-ink-amber"),
    raw_ink_global_band: raw(),
  };
  host.remove();
  return JSON.stringify(out);
})()' 2>/dev/null

echo "--- E. real rush round → done screen (dark kept) — migrated combo chip absolute probe"
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
for i in $(seq 1 14); do
  agent-browser eval '(() => {
    const card=document.querySelector(".rush-card");
    if(!card) return "NO-CARD";
    const opts=card.querySelectorAll("button");
    if(opts.length){opts[0].click(); return "ANSWERED";}
    return "NO-OPTS";
  })()' >/dev/null 2>&1
  sleep 5
done
echo "waited out the 60s timer (14x5s — r125 lesson)"
sleep 2
agent-browser eval '(() => {
  const done=document.querySelector(".rush-done");
  if(!done) return "DONE-SCREEN-MISSING";
  const col=(sel)=>{const el=done.querySelector(sel); return el?getComputedStyle(el).color:"MISSING";};
  const bg=(sel)=>{const el=done.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING";};
  return JSON.stringify({
    combo_chip_ink: col(".c-ink-amber"),
    combo_chip_wash: bg(".c-wash-amber"),
    emerald_pill_bg: bg(".c-wash-emerald"),
    rose_pill_bg: bg(".c-wash-rose"),
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
  const bak=localStorage.getItem("vision2-study-v1-r127-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r127-backup");
  return "STRIPPED|restored="+(bak==="__ABSENT__"?"absent":!!bak);
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA127_END"
