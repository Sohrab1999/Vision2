#!/bin/bash
# Task 87 live QA — c-veil-60/70 (tranche 4 phase 4) + double-run badge #35, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 5

echo "--- A. compiled chunk: plain c-veil rules verbatim + retargets + gmetro painter + no @utility form"
agent-browser eval '(async () => {
  const links = [...document.querySelectorAll("link[rel=\"stylesheet\"]")].map(l => l.href);
  let css = "";
  for (const h of links) { css += await (await fetch(h)).text(); }
  const grab = (needle) => { const i = css.indexOf(needle); return i >= 0 ? css.slice(i, i + 150).replace(/\n/g, " ") : "MISSING"; };
  return JSON.stringify({
    veil60: grab(".c-veil-60 {"),
    veil60dark: grab(".dark .c-veil-60 {"),
    veil70: grab(".c-veil-70 {"),
    utilityForm: css.includes("@utility c-veil") ? "PRESENT-BAD" : "absent-good",
    srsRetarget: css.includes(".srs-panel .c-veil-70"),
    heroRetarget: css.includes(".rush-hero .c-veil-70"),
    digestRetarget: css.includes(".report-digest .c-veil-60"),
    gmetroPainter: css.includes(".dark .gmetro-lesson-badge"),
    tokenPinned: css.includes("--color-white"),
    oldRawDark60: /\.dark \.bg-white\\\/60\s*\{/.test(css) ? "PRESENT-BAD" : "retired-good"
  });
})()' 2>/dev/null

echo "--- B. fresh: «۰ از ۳۵» + double-run locked with honest bottleneck hint + real SVG"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۵")) : null;
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const dr = tile("هفتهٔ دوبل");
  return JSON.stringify({
    count,
    drLocked: dr ? !dr.className.includes("badge-shine") : null,
    drHint: dr?.textContent?.includes("۰ از ۷ روزِ دوبلِ این هفته"),
    drSvg: dr?.querySelector("svg") != null
  });
})()' 2>/dev/null

echo "--- C. double-run learner (7 dual days): #35 + both single runs co-unlock"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 1, words: 0, dictation: 1, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "دوبل", dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-doublerun";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۵"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const dr = tile("هفتهٔ دوبل");
  const dcr = tile("هفتهٔ دیکتهٔ پیوسته");
  const er = tile("هفتهٔ آزمون‌دار");
  return JSON.stringify({
    count,
    doubleUnlocked: dr?.className.includes("badge-shine") ?? null,
    dictationCoUnlock: dcr?.className.includes("badge-shine") ?? null,
    examCoUnlock: er?.className.includes("badge-shine") ?? null
  });
})()' 2>/dev/null

echo "--- D. bottleneck learner (dictation 7d + quiz 3d): #35 locked with honest «۳ از ۷ روزِ دوبل»"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: [2,4,6].includes(n) ? 1 : 0, words: 0, dictation: 1, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "نیمه", dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-bottleneck";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const dr = tile("هفتهٔ دوبل");
  const er = tile("هفتهٔ آزمون‌دار");
  const dcr = tile("هفتهٔ دیکتهٔ پیوسته");
  return JSON.stringify({
    doubleLocked: dr ? !dr.className.includes("badge-shine") : null,
    doubleHint: dr?.textContent?.includes("۳ از ۷ روزِ دوبلِ این هفته"),
    examUnlocked: er?.className.includes("badge-shine") ?? null,
    dictationUnlocked: dcr?.className.includes("badge-shine") ?? null
  });
})()' 2>/dev/null

echo "--- E. home reset + rush-hero chip parity (light+dark, transitions killed)"
agent-browser eval '(() => {
  localStorage.removeItem("vision2-study-v1");
  return "cleared";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("شروع چالش")); if(b){b.click();return "nav-ok";} return "nav-miss"; })()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const el = document.querySelector(".rush-hero .c-veil-70");
  const read = () => el ? getComputedStyle(el).backgroundColor : "MISSING";
  const light = read();
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 150));
  const dark = read();
  document.documentElement.classList.remove("dark");
  await new Promise(r => setTimeout(r, 150));
  st.remove();
  return JSON.stringify({ light, dark, expectDark: "rgb(41, 37, 36, 0.85)" });
})()' 2>/dev/null

echo "--- F. spell-chip parity (same hero shell, dictation mode)"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("role")==="tab" && x.textContent?.includes("املا")); if(b){b.click();return "nav-ok";} return "nav-miss"; })()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const el = document.querySelector(".spell-chip");
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

echo "--- G. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ overflowX: doc.scrollWidth - doc.clientWidth, w: doc.clientWidth });
})()' 2>/dev/null

echo "--- H. console errors"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"
agent-browser close --all >/dev/null 2>&1
