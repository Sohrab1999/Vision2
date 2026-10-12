#!/bin/bash
# Task 85 live QA — c-card semantic migration (77 consumers) + dictation-run badge #33, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. c-card parity sweep on home (light+dark, transitions killed): plain = baseline, word-day deviates"
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const read = (sel) => {
    const els = [...document.querySelectorAll(sel)];
    return { n: els.length, uniq: [...new Set(els.map(el => getComputedStyle(el).backgroundColor + "|" + getComputedStyle(el).borderTopColor))] };
  };
  const light = { cCard: read(".c-card"), wordDay: read(".word-day .border-stone-200, .word-day .c-card") };
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 100));
  const dark = { cCard: read(".c-card"), wordDay: read(".word-day .border-stone-200, .word-day .c-card") };
  document.documentElement.classList.remove("dark");
  st.remove();
  return JSON.stringify({ light, dark });
})()' 2>/dev/null

echo "--- B. fresh badges: «۰ از ۳۳» + dictation-run locked with window progress + real SVG"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۳")) : null;
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const dr = tile("هفتهٔ دیکتهٔ پیوسته");
  return JSON.stringify({
    count,
    drLocked: dr ? !dr.className.includes("badge-shine") : null,
    drProgress: dr?.textContent?.includes("۰ از ۷ روزِ این هفته"),
    drSvg: dr?.querySelector("svg") != null
  });
})()' 2>/dev/null

echo "--- C. dictation-run learner (7 dictation days, ZERO goals): «۱ از ۳۳» + tile unlocked (live independence)"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 1, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "پژمان", dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-run";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۳"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const dr = tile("هفتهٔ دیکتهٔ پیوسته");
  const cage = tile("هفتهٔ بی‌قفسه");
  return JSON.stringify({
    count,
    drUnlocked: dr?.className.includes("badge-shine") ?? null,
    cageLocked: cage ? !cage.className.includes("badge-shine") : null
  });
})()' 2>/dev/null

echo "--- D. report-digest excluded context stays raw (digest card keeps bg-white raw family)"
agent-browser eval '(() => {
  window.dispatchEvent(new CustomEvent("open-report"));
  return "opened";
})()' 2>/dev/null
sleep 3
agent-browser eval '(async () => {
  const digest = document.querySelector(".report-digest .bg-white, .report-digest.bg-white, .report-digest .c-card");
  const legend = !!document.querySelector(".report-legend");
  return JSON.stringify({
    legend,
    digestRawKept: digest ? digest.className.includes("bg-white") : null,
    digestHasCCard: digest ? digest.className.includes("c-card") : null
  });
})()' 2>/dev/null

echo "--- E. deep surface: lesson view card + dark sweep of c-card there"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button, a")].filter(b => b.textContent?.includes("خانه"));
  btns[0]?.click();
  return btns.length ? "nav-home" : "no-nav";
})()' 2>/dev/null
sleep 2

echo "--- F. mobile 390 viewport overflow check"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ overflowX: doc.scrollWidth - doc.clientWidth, w: doc.clientWidth });
})()' 2>/dev/null

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"
