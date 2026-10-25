#!/bin/bash
# Task 89 — badge QA: fresh «۰ از ۳۷» / triple-run seeded open + 4 subsumed co-open
# + honest bottleneck progress + mobile 390 overflow + fresh console.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- 1. FRESH learner: «۰ از ۳۷»"
agent-browser eval '(() => {
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: { streak: 0, dailyGoal: 10 }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  click(b => b.textContent?.includes("دستاورد") || b.getAttribute("aria-label")?.includes("دستاورد"));
  await sleep(1500);
  const counter = [...document.querySelectorAll("span")].find(s => /۰\s*از\s*۳۷/.test(s.textContent ?? ""));
  const triple = [...document.querySelectorAll(".badge-card")].find(c => c.textContent?.includes("هفتهٔ سه‌گانه"));
  return JSON.stringify({
    freshCounter: !!counter,
    tripleTileExists: !!triple,
    tripleLocked: triple ? !triple.className.includes("badge-shine") : null,
    tripleProgress: triple?.querySelector("span")?.textContent ?? null,
  });
})()'

echo "--- 2. TRIPLE learner: badge open + 4 subsumed co-open"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 2, quizzes: 3, words: 0, dictation: 2, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 7, bestStreak: 9, dailyGoal: 10, dayHistory,
    dayStat: { day: key(0), reviews: 2, quizzes: 3, words: 0, dictation: 2, rush: 0 }
  }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  click(b => b.textContent?.includes("دستاورد") || b.getAttribute("aria-label")?.includes("دستاورد"));
  await sleep(1500);
  const tile = (t) => [...document.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const tri = tile("هفتهٔ سه‌گانه");
  return JSON.stringify({
    tripleUnlocked: tri?.className.includes("badge-shine") ?? null,
    tripleCrownSvg: !!tri?.querySelector("svg"),
    tripleProgress: tri?.textContent?.match(/\S+ از ۷ روزِ سه‌گانه\S*/)?.[0] ?? null,
    dictationCo: tile("هفتهٔ دیکتهٔ پیوسته")?.className.includes("badge-shine") ?? null,
    examCo: tile("هفتهٔ آزمون‌دار")?.className.includes("badge-shine") ?? null,
    doubleCo: tile("هفتهٔ دوبل")?.className.includes("badge-shine") ?? null,
    reviewCo: tile("هفتهٔ مرور")?.className.includes("badge-shine") ?? null,
  });
})()'

echo "--- 3. MOBILE 390: overflow scan"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("خانه")); b?.click(); return "home"; })()' >/dev/null 2>&1
sleep 1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  const overflow = [...document.querySelectorAll("body *")].filter(el => {
    const r = el.getBoundingClientRect();
    return r.right > window.innerWidth + 1 && r.width > 0;
  }).length;
  return JSON.stringify({ hScroll: doc.scrollWidth > doc.clientWidth, overflowEls: overflow, vw: window.innerWidth });
})()'

echo "--- 4. FRESH console"
agent-browser console 2>/dev/null | tail -5

agent-browser close --all >/dev/null 2>&1
echo "BADGE_QA_DONE"
