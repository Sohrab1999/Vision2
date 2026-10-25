#!/bin/bash
# Task 81 live QA — ice badges + Persian digit hints, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh: «۰ از ۲۵» + ice locked + Persian progress digits (was Latin!)"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  if (!sec) return JSON.stringify({ miss: true });
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۲۵"));
  const iceTile = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("یخ‌ساز"));
  const wordTile = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("واژه‌آموز"));
  return JSON.stringify({
    count,
    iceLocked: iceTile ? !iceTile.className.includes("badge-shine") : null,
    iceProgress: iceTile?.textContent?.replace(/\s+/g, " ").slice(0, 60),
    wordProgressPersian: wordTile?.textContent?.includes("۰ از ۱۰ واژه"),
    wordProgressLatin: wordTile?.textContent?.includes("0 از 10 واژه")
  });
})()' 2>/dev/null

echo "--- B. seed ice learner: «۴ از ۲۵» + 4 ice tiles unlocked + first-in-order"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, freezeCount: 2, freezeSavedDay: "", freezeUsedDays: [key(3), key(8), key(14)],
    freezeEarnedDay: key(10), goalMetDays: [key(1)], dailyGoal: 10, seenBadges: []
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۲۵"));
  const iceIds = ["یخ‌ساز", "نجات‌گر", "انبار یخ", "سپر یخی"];
  const tiles = [...sec.querySelectorAll(".badge-card")];
  const iceTiles = iceIds.map(t => tiles.find(c => c.textContent?.includes(t)));
  const first4 = tiles.slice(0, 4).map(c => iceIds.find(id => c.textContent?.includes(id)) ?? "?");
  return JSON.stringify({
    count,
    allIceUnlocked: iceTiles.every(t => t?.className.includes("badge-shine")),
    first4AreIce: first4.join(","),
    shieldProgress: tiles.find(c => c.textContent?.includes("سپر یخی"))?.textContent?.includes("۳ از ۳ نجات")
  });
})()' 2>/dev/null

echo "--- C. dark via app toggle: ice tier gradients (existing dark rules, zero new)"
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const gold = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("سپر یخی"));
  const bronze = [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("یخ‌ساز"));
  return JSON.stringify({
    theme: document.documentElement.className,
    goldBg: gold ? getComputedStyle(gold).backgroundImage.slice(0, 60) : null,
    goldInk: gold ? getComputedStyle(gold).color : null,
    bronzeBg: bronze ? getComputedStyle(bronze).backgroundImage.slice(0, 60) : null
  });
})()' 2>/dev/null

echo "--- D. mobile 390: section fits, overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  gridCols: getComputedStyle(document.querySelector(".badge-section .grid")).gridTemplateColumns.split(" ").length
}))()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- E. fresh console (light restored)"
agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت روز"); btn?.click(); return "light"; })()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r81 QA end ==="
