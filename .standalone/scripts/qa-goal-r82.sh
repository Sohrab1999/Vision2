#!/bin/bash
# Task 82 live QA — goal-family badges + avatar new-badge ring, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh: no ring/dot + «۰ از ۲۹» + goal/ice tiles locked"
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "پروفایل من");
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۲۹")) : null;
  const week = sec ? [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ هدف‌دار")) : null;
  const flag = sec ? [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("اولین هدف")) : null;
  return JSON.stringify({
    btnFound: !!btn,
    ring: !!btn?.querySelector(".new-badge-ring"),
    dot: !!btn?.querySelector(".new-badge-dot"),
    count,
    weekShine: week ? week.className.includes("badge-shine") : null,
    weekProgress: week?.textContent?.includes("۰ از ۷ روزِ هدف‌دار"),
    flagShine: flag ? flag.className.includes("badge-shine") : null
  });
})()' 2>/dev/null

echo "--- B. seed goal learner (home): «۴ از ۲۹» + week shine + fortnight locked; ring CONSUMED at home (single-writer)"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "سارا", streak: 3, bestStreak: 3,
    goalMetDays: [key(1), key(2), key(3), key(4), key(5), key(6), key(7)],
    seenBadges: []
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "پروفایل من");
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۲۹"));
  const week = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ هدف‌دار"));
  const fort = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("دو هفتهٔ درخشان"));
  const toast = document.body.textContent?.includes("نشان جدید");
  return JSON.stringify({
    count,
    weekShine: week?.className.includes("badge-shine"),
    fortLocked: fort ? !fort.className.includes("badge-shine") : null,
    fortProgress: fort?.textContent?.includes("۷ از ۱۴ روزِ هدف‌دار"),
    toastFired: toast,
    ringAfterHome: !!btn?.querySelector(".new-badge-ring"),
    dotAfterHome: !!btn?.querySelector(".new-badge-dot")
  });
})()' 2>/dev/null

echo "--- C. CSS probe: inject exact ring/dot classes, capture LIGHT computed styles"
agent-browser eval '(() => {
  const host = document.createElement("div");
  host.id = "r82-probe";
  host.innerHTML = `<span class="r82-ring ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent rounded-full"></span><span class="r82-dot border border-white/90 bg-amber-500 rounded-full"></span>`;
  document.body.appendChild(host);
  const ring = host.querySelector(".r82-ring");
  const dot = host.querySelector(".r82-dot");
  window.__r82 = {
    ringLight: getComputedStyle(ring).boxShadow,
    dotBgLight: getComputedStyle(dot).backgroundColor,
    dotBorderLight: getComputedStyle(dot).borderTopColor
  };
  return JSON.stringify(window.__r82);
})()' 2>/dev/null

echo "--- D. dark: ring/dot equality (raw saturated, zero new dark rules)"
agent-browser eval '(() => { const b = [...document.querySelectorAll("header button")].find(x => x.getAttribute("aria-label") === "حالت شب"); b?.click(); return "dark"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const host = document.getElementById("r82-probe");
  const ring = host?.querySelector(".r82-ring");
  const dot = host?.querySelector(".r82-dot");
  return JSON.stringify({
    theme: document.documentElement.className,
    ringEqual: window.__r82.ringLight === (ring ? getComputedStyle(ring).boxShadow : null),
    dotBgEqual: window.__r82.dotBgLight === (dot ? getComputedStyle(dot).backgroundColor : null),
    dotBorderEqual: window.__r82.dotBorderLight === (dot ? getComputedStyle(dot).borderTopColor : null),
    ringDark: ring ? getComputedStyle(ring).boxShadow.slice(0, 80) : null
  });
})()' 2>/dev/null
agent-browser eval '(() => { document.getElementById("r82-probe")?.remove(); const b = [...document.querySelectorAll("header button")].find(x => x.getAttribute("aria-label") === "حالت روز"); b?.click(); return "light"; })()' 2>/dev/null

echo "--- E. mobile 390: overflow 0 (dot is absolute -left-1.5 on avatar)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}))()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. fresh console"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r82 QA end ==="
