#!/bin/bash
# Task 88 live QA — veil phase 5 (c-veil-80/95) + review-run badge #36, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 5

echo "--- A. compiled chunk: veil-80/95 verbatim + retarget + exclusion painter + no /95 raw"
agent-browser eval '(async () => {
  const links = [...document.querySelectorAll("link[rel=\"stylesheet\"]")].map(l => l.href);
  let css = "";
  for (const h of links) { css += await (await fetch(h)).text(); }
  const grab = (needle) => { const i = css.indexOf(needle); return i >= 0 ? css.slice(i, i + 170).replace(/\n/g, " ") : "MISSING"; };
  return JSON.stringify({
    v80: grab(".c-veil-80 {"),
    v80dark: grab(".dark .c-veil-80 {"),
    v95dark: grab(".dark .c-veil-95 {"),
    heroRetarget: css.includes(".dark .rush-hero .c-veil-80"),
    exclPainter: css.includes(".dark .bg-white\\/80 { background-color: rgba(28, 25, 23, 0.8); }"),
    tokenPinned: css.includes("--color-white")
  });
})()' 2>/dev/null

echo "--- B. fresh: «۰ از ۳۶» + review-run locked with honest hint + real SVG"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۶")) : null;
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const rr = tile("هفتهٔ مرور");
  return JSON.stringify({
    count,
    rrLocked: rr ? !rr.className.includes("badge-shine") : null,
    rrHint: rr?.textContent?.includes("۰ از ۷ روزِ این هفته"),
    rrSvg: rr?.querySelector("svg") != null
  });
})()' 2>/dev/null

echo "--- C. review-run learner (7 tiny review days, zero goal days): #36 unlocked"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "مرورگر", dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-reviewrun";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۶"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const rr = tile("هفتهٔ مرور");
  const cf = tile("هفتهٔ بی‌قفسه");
  return JSON.stringify({
    count,
    rrUnlocked: rr?.className.includes("badge-shine") ?? null,
    cageFreeLocked: cf ? !cf.className.includes("badge-shine") : null
  });
})()' 2>/dev/null

echo "--- D. home reset + rush hero rows (c-veil-80) parity light+dark"
agent-browser eval '(() => { localStorage.removeItem("vision2-study-v1"); return "cleared"; })()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("شروع چالش")); if(b){b.click();return "nav-ok";} return "nav-miss"; })()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const els = [...document.querySelectorAll(".rush-hero .c-veil-80")];
  const read = () => JSON.stringify([...new Set(els.map(el => getComputedStyle(el).backgroundColor))]);
  const light = { n: els.length, vals: read() };
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 150));
  const dark = { vals: read() };
  document.documentElement.classList.remove("dark");
  await new Promise(r => setTimeout(r, 150));
  st.remove();
  return JSON.stringify({ light, dark });
})()' 2>/dev/null

echo "--- E. banner record chip (c-veil-80, seeded rushBest)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button, a")].find(x=>x.textContent?.includes("خانه")); b?.click(); return "home";
})()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const st = useStudy2; void st;
  const seed = JSON.parse(localStorage.getItem("vision2-study-v1") || "{}");
  seed.state = Object.assign(seed.state || {}, { rushBest: 150, rushBestCorrect: 9, rushGames: 2, streak: 4, bestStreak: 6, dailyGoal: 10,
    dayHistory: { [key(0)]: { day: key(0), reviews: 4, quizzes: 0, words: 0, dictation: 0, rush: 0 } } });
  localStorage.setItem("vision2-study-v1", JSON.stringify(seed));
  return "seeded-rushbest";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const el = document.querySelector(".rush-banner .c-veil-80");
  const read = () => el ? getComputedStyle(el).backgroundColor : "MISSING";
  const light = read();
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 150));
  const dark = read();
  document.documentElement.classList.remove("dark");
  await new Promise(r => setTimeout(r, 150));
  st.remove();
  return JSON.stringify({ light, dark });
})()' 2>/dev/null

echo "--- F. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ overflowX: doc.scrollWidth - doc.clientWidth, w: doc.clientWidth });
})()' 2>/dev/null

echo "--- G. console (fresh) — reload once more clean"
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "CONSOLE_END"
agent-browser close --all >/dev/null 2>&1
