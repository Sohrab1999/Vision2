#!/bin/bash
# Task 90 — AFTER probe: c-track parity (light+dark) vs BEFORE + marathon badge QA.
# BEFORE values: kernel light oklab(0.922998 0.0019699 0.00227594 / α),
# kernel dark oklab(0.317487 0.00523295 0.0124858 / α),
# srs deviating rgba(41,37,36,0.7), quest opaque rgb(41,37,36).
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 4, bestStreak: 6, dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } },
    srs: { "1:ability": { k: "1:ability", level: 2, dueAt: Date.now() - 3600e3, lesson: 1 } }
  }, version: 0 }));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser reload >/dev/null 2>&1
sleep 4

SWEEP='(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const kill = () => { const st = document.createElement("style"); st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}"; document.head.appendChild(st); return st; };
  const grab = (sel) => [...document.querySelectorAll(sel)].map(el => getComputedStyle(el).backgroundColor);
  const click = (pred) => { const b = [...document.querySelectorAll("button, a")].find(pred); if (b) { b.click(); return true; } return false; };
  const st = kill();
  const data = {};
  click(b => b.textContent?.includes("خانه"));
  await sleep(1500);
  data.tracks70 = grab("[class*=\"c-track-70\"]");
  data.tracks80 = grab("[class*=\"c-track-80\"]");
  data.srsBar = grab(".srs-panel [class*=\"c-track-70\"]");
  await sleep(300);
  st.remove();
  return JSON.stringify(data);
})()'

echo "--- LIGHT"
agent-browser eval "$SWEEP" 2>/dev/null | tee /tmp/track-after.light

agent-browser eval '(() => { const btn = [...document.querySelectorAll("header button")].find(b => b.getAttribute("aria-label") === "حالت شب"); btn?.click(); return btn ? "dark" : "miss"; })()' >/dev/null 2>&1
sleep 2

echo "--- DARK"
agent-browser eval "$SWEEP" 2>/dev/null | tee /tmp/track-after.dark

echo "--- MARATHON badge QA (dark session continues)"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 13; n++) dayHistory[key(n)] = { day: key(n), reviews: 2, quizzes: 3, words: 0, dictation: 2, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 14, bestStreak: 14, dailyGoal: 10, dayHistory,
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
  const mar = tile("ماراتنِ دوهفته‌ای");
  return JSON.stringify({
    marathonUnlocked: mar?.className.includes("badge-shine") ?? null,
    marathonTrophySvg: !!mar?.querySelector("svg"),
    tripleCo: tile("هفتهٔ سه‌گانه")?.className.includes("badge-shine") ?? null,
    dictationCo: tile("هفتهٔ دیکتهٔ پیوسته")?.className.includes("badge-shine") ?? null,
    examCo: tile("هفتهٔ آزمون‌دار")?.className.includes("badge-shine") ?? null,
    doubleCo: tile("هفتهٔ دوبل")?.className.includes("badge-shine") ?? null,
    reviewCo: tile("هفتهٔ مرور")?.className.includes("badge-shine") ?? null,
    counter38: [...document.querySelectorAll("span")].some(s => /از\s*۳۸/.test(s.textContent ?? "")),
  });
})()'

echo "--- MOBILE 390"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("خانه")); b?.click(); return "home"; })()' >/dev/null 2>&1
sleep 1
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ hScroll: doc.scrollWidth > doc.clientWidth, vw: window.innerWidth });
})()'
agent-browser console 2>/dev/null | grep -iE "error" | grep -vc "hydration" | head -1

agent-browser close --all >/dev/null 2>&1
echo "AFTER_DONE"
