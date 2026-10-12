#!/bin/bash
# Task 76 live QA — goal chip (header daily-goal progress), single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh learner: 0/10 target chip, unmet styling"
agent-browser eval '(() => {
  const chip = document.querySelector(".goal-chip");
  return JSON.stringify({
    present: !!chip,
    aria: chip?.getAttribute("aria-label")?.slice(0, 70),
    text: chip?.textContent?.slice(0, 12),
    unmetBg: chip?.classList?.contains("bg-emerald-50"),
    solidClass: chip?.classList?.contains("bg-emerald-600"),
    barWidth: chip?.querySelector("span[aria-hidden] > span")?.style.width
  });
})()' 2>/dev/null

echo "--- B. seed 7/10 (words=9 pollution probe) + click → home + microbar 70%"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    dailyGoal: 10,
    dayStat: { day, reviews: 3, quizzes: 4, words: 9, dictation: 0, rush: 0 }
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const chip = document.querySelector(".goal-chip");
  return JSON.stringify({
    aria: chip?.getAttribute("aria-label"),
    text: chip?.textContent?.slice(0, 16),
    barWidth: chip?.querySelector("span[aria-hidden] > span")?.style.width,
    polluted: chip?.textContent?.includes("۱۶")
  });
})()' 2>/dev/null
# navigate to dictionary, then tap chip → back home
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("header nav button")];
  const dict = btns.find(b => b.textContent?.includes("دیکشنری"));
  dict?.click(); return dict ? "nav-dict" : "nav-miss";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => { document.querySelector(".goal-chip")?.click(); return "clicked"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => JSON.stringify({
  questsVisible: !!document.querySelector("[aria-label=\"اهداف روزانه\"]")
}))()' 2>/dev/null

echo "--- C. met state 10/10 → solid emerald + reward title"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    dailyGoal: 10,
    dayStat: { day, reviews: 6, quizzes: 4, words: 0, dictation: 0, rush: 0 }
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const chip = document.querySelector(".goal-chip");
  return JSON.stringify({
    aria: chip?.getAttribute("aria-label")?.slice(0, 60),
    text: chip?.textContent?.slice(0, 10),
    solid: chip?.classList?.contains("bg-emerald-600"),
    barWidth: chip?.querySelector("span[aria-hidden] > span")?.style.width
  });
})()' 2>/dev/null

echo "--- D. dark mode unmet 7/10: global emerald bands apply (zero new dark rules)"
agent-browser eval '(() => {
  const t = new Date();
  const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    dailyGoal: 10,
    dayStat: { day, reviews: 3, quizzes: 4, words: 0, dictation: 0, rush: 0 }
  }, version: 0 }));
  return "seeded";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب");
  btn?.click(); return btn ? "dark-toggled" : "btn-miss";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const chip = document.querySelector(".goal-chip");
  const cs = getComputedStyle(chip);
  return JSON.stringify({
    theme: document.documentElement.className,
    bg: cs.backgroundColor,
    ink: cs.color,
    track: getComputedStyle(chip.querySelector("span[aria-hidden]")).backgroundColor
  });
})()' 2>/dev/null

echo "--- E. mobile 390: compact fraction visible, long label display:none, overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const chip = document.querySelector(".goal-chip");
  const spans = [...chip.querySelectorAll(":scope > span[dir=ltr]")];
  const hidden = spans.filter(s => getComputedStyle(s).display === "none").length;
  return JSON.stringify({
    chipW: Math.round(chip.getBoundingClientRect().width),
    spansTotal: spans.length,
    spansHidden: hidden,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -4
agent-browser close --all >/dev/null 2>&1
echo "=== r76 QA end ==="
