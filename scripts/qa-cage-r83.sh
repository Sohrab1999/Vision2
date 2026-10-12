#!/bin/bash
# Task 83 live QA — cage-free badge, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh: «۰ از ۳۰» + cage-free locked with window progress"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۰")) : null;
  const cage = sec ? [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ بی‌قفسه")) : null;
  return JSON.stringify({
    count,
    cageLocked: cage ? !cage.className.includes("badge-shine") : null,
    cageProgress: cage?.textContent?.includes("۰ از ۷ روزِ این هفته")
  });
})()' 2>/dev/null

echo "--- B. pure week (today+6, zero rescues): cage-free UNLOCKED «۴ از ۳۰»"
agent-browser eval '(() => {
  const w = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "سارا", goalMetDays: [w(0), w(1), w(2), w(3), w(4), w(5), w(6)], seenBadges: []
  }, version: 0 }));
  return "seeded-pure";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۰"));
  const cage = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ بی‌قفسه"));
  return JSON.stringify({
    count,
    cageShine: cage?.className.includes("badge-shine"),
    toastFired: document.body.textContent?.includes("نشان جدید")
  });
})()' 2>/dev/null

echo "--- C. rescued INSIDE window: cage-free LOCKED at «۷ از ۷» + chain-rescuer unlocked (honest hint)"
agent-browser eval '(() => {
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  const w = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  raw.state.freezeUsedDays = [w(3)];
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "seeded-rescued";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۰"));
  const cage = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ بی‌قفسه"));
  const rescuer = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("نجات‌گر"));
  return JSON.stringify({
    count,
    cageLocked: cage ? !cage.className.includes("badge-shine") : null,
    cageHonestHint: cage?.textContent?.includes("۷ از ۷ روزِ این هفته"),
    rescuerShine: rescuer?.className.includes("badge-shine")
  });
})()' 2>/dev/null

echo "--- D. mobile 390: overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}))()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- E. fresh console"
agent-browser reload >/dev/null 2>&1
sleep 3
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r83 QA end ==="
