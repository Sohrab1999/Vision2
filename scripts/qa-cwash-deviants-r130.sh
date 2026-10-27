#!/bin/bash
# Task 130 QA — deviant consolidation (c-wash-emerald-soft / c-wash-sky / c-wash-teal-deep) — single session.
# A. seed: week (3 goal days) + bestStreak 4 (unlocks streak-3 → congrats box) + onboarded
# B. LIGHT: injected raw refs — badge popover congrats box and report-month
#    «جمع کل» chip compute BYTE-IDENTICAL to their raw utilities (parity by construction, proven live)
# C. DARK: migrated sites = the exact retired literals (0.4 / 0.5 / 0.6); raw refs
#    = kernel (0.35 / 0.45 / 0.35) — the value-tier step is proven; synthetic
#    .rush-done container: c-wash-sky = 0.5 while a raw bg-sky-50 inside the same
#    container now falls to kernel 0.45 (scoped rule is gone — class carries the grade)
# D. real rush round → done screen (dark kept): «دقت» pill = rgba(8,47,60,0.5),
#    phase-8 siblings unchanged (emerald/rose/amber)
# E. mobile 390 overflow = 0; console errors of whole session = 0; strip seed.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed week + bestStreak 4 + onboarded (full-key build, backup kept)"
agent-browser eval '
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const ds = (n, c) => Object.assign({ day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r130-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    dayHistory: {
      [key(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [key(1)]: ds(1, { reviews: 8 }),
      [key(2)]: ds(2, { reviews: 6, words: 2 }),
    },
    goalMetDays: [key(0), key(1), key(2)],
    bestStreak: 4, streak: 4, introDone: true, userName: "آزمون‌گر", onboarded: true,
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED|goalDays=3|bestStreak=4";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- B. inject raw refs + LIGHT parity probes (badge popover + report month chip)"
agent-browser eval '
(() => {
  const host=document.createElement("div");
  host.id="r130-refs";
  host.style.cssText="position:fixed;top:-300px;left:-300px";
  host.innerHTML=`<span id="ref-em" class="bg-emerald-50">E</span><span id="ref-teal" class="bg-teal-50">T</span><span id="ref-sky" class="bg-sky-50">S</span>`;
  document.body.appendChild(host);
  return "REFS-IN";
})()' 2>/dev/null

agent-browser eval '
(() => {
  const trig=document.querySelector("button[aria-label=\"جزئیات نشان سه‌روزهٔ پیوسته\"]");
  if(!trig) return "STREAK3-TRIGGER-MISSING";
  trig.click(); return "POPOVER-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const pop=document.querySelector(".badge-popover");
  if(!pop) return "POPOVER-MISSING";
  const box=pop.querySelector(".c-wash-emerald-soft");
  const ref=document.getElementById("ref-em");
  return JSON.stringify({
    light: !document.documentElement.classList.contains("dark"),
    congratsText: box ? box.textContent.trim().slice(0,30) : "MISSING",
    congratsBg: box ? getComputedStyle(box).backgroundColor : "MISSING",
    rawEmRef: ref ? getComputedStyle(ref).backgroundColor : "NO-REF",
    parity: box && ref ? getComputedStyle(box).backgroundColor === getComputedStyle(ref).backgroundColor : false,
  });
})()' 2>/dev/null

agent-browser eval 'document.body.click(); "closed"' >/dev/null 2>&1
sleep 1
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2
agent-browser eval '
(() => {
  const chip=document.querySelector(".report-month .c-wash-teal-deep");
  const ref=document.getElementById("ref-teal");
  return JSON.stringify({
    monthChipText: chip ? chip.textContent.trim().slice(0,16) : "MISSING",
    monthChipBg: chip ? getComputedStyle(chip).backgroundColor : "MISSING",
    rawTealRef: ref ? getComputedStyle(ref).backgroundColor : "NO-REF",
    parity: chip && ref ? getComputedStyle(chip).backgroundColor === getComputedStyle(ref).backgroundColor : false,
  });
})()' 2>/dev/null

echo "--- C. DARK: retired literals vs kernel steps + synthetic rush-done container"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
agent-browser eval '
(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-ON";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  let host=document.getElementById("r130-refs");
  if(!host){
    host=document.createElement("div");
    host.id="r130-refs";
    host.style.cssText="position:fixed;top:-300px;left:-300px";
    host.innerHTML=`<span id="ref-em" class="bg-emerald-50">E</span><span id="ref-teal" class="bg-teal-50">T</span><span id="ref-sky" class="bg-sky-50">S</span>`;
    document.body.appendChild(host);
  }
  const syn=document.createElement("div");
  syn.id="r130-syn";
  syn.className="rush-done";
  syn.style.cssText="position:fixed;top:-500px;left:-500px";
  syn.innerHTML=`<span id="syn-class" class="c-wash-sky">C</span><span id="syn-raw" class="bg-sky-50">R</span>`;
  document.body.appendChild(syn);
  return "DARK-REFS-IN|dark="+document.documentElement.classList.contains("dark");
})()' 2>/dev/null

agent-browser eval '
(() => {
  const trig=document.querySelector("button[aria-label=\"جزئیات نشان سه‌روزهٔ پیوسته\"]");
  if(!trig) return "TRIGGER-MISSING";
  trig.click(); return "POPOVER-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const g=(id)=>{const el=document.getElementById(id); return el?getComputedStyle(el).backgroundColor:"MISSING";};
  const box=document.querySelector(".badge-popover .c-wash-emerald-soft");
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    congratsBg: box ? getComputedStyle(box).backgroundColor : "MISSING",
    rawEmRef: g("ref-em"),
    monthChip: "PENDING-REPORT",
    synClassInContainer: g("syn-class"),
    synRawInContainer: g("syn-raw"),
    rawSkyStandalone: g("ref-sky"),
  });
})()' 2>/dev/null

agent-browser eval 'document.body.click(); "closed"' >/dev/null 2>&1
sleep 1
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2
agent-browser eval '
(() => {
  const chip=document.querySelector(".report-month .c-wash-teal-deep");
  const ref=document.getElementById("ref-teal");
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    monthChipBg: chip ? getComputedStyle(chip).backgroundColor : "MISSING",
    rawTealRef: ref ? getComputedStyle(ref).backgroundColor : "NO-REF",
  });
})()' 2>/dev/null

echo "--- D. real rush round → done screen (dark kept) — «دقت» pill absolute probe"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
agent-browser eval '
(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش");
  if(!b) return "RUSH-BANNER-MISSING";
  b.click(); return "RUSH-NAV";
})()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const b=document.querySelector(".rush-start") || [...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش");
  if(!b) return "START-MISSING";
  b.click(); return "START-OK";
})()' 2>/dev/null
sleep 2
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
echo "waited out the 60s timer (14x5s — r125/r127 lesson)"
sleep 2
agent-browser eval '
(() => {
  const done=document.querySelector(".rush-done");
  if(!done) return "DONE-SCREEN-MISSING";
  const bg=(sel)=>{const el=done.querySelector(sel); return el?getComputedStyle(el).backgroundColor:"MISSING";};
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    sky_pill_bg: bg(".c-wash-sky"),
    emerald_pill_bg: bg(".c-wash-emerald"),
    rose_pill_bg: bg(".c-wash-rose"),
    amber_pill_bg: bg(".c-wash-amber"),
    amber_pill_ink: (()=>{const el=done.querySelector(".c-ink-amber"); return el?getComputedStyle(el).color:"MISSING";})(),
  });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow (home, dark)"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const d = document.documentElement;
  return "MOBILE390|OVERFLOW|" + (d.scrollWidth - d.clientWidth) + "|W|" + d.clientWidth;
})()' 2>/dev/null

echo "--- F. console errors (whole session)"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"

echo "--- G. strip seed (restore backup)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r130-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak !== null) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r130-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "QA130_END"
