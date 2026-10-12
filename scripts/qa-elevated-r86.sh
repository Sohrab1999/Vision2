#!/bin/bash
# Task 86 live QA — c-card-elevated (9 shells) + exam-run badge #34, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. compiled CSS: .c-card-elevated exists with exact bodies (@utility NOT stripped — r85 lesson)"
agent-browser eval '(async () => {
  const links = [...document.querySelectorAll("link[rel=\"stylesheet\"]")].map(l => l.href);
  let css = "";
  for (const h of links) { css += await (await fetch(h)).text(); }
  const idx = css.indexOf(".c-card-elevated");
  const chunk = idx >= 0 ? css.slice(idx, idx + 260) : "MISSING";
  return JSON.stringify({ found: idx >= 0, chunk });
})()' 2>/dev/null

echo "--- B. fresh badges: «۰ از ۳۴» + exam-run locked with honest progress + real SVG"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۴")) : null;
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const er = tile("هفتهٔ آزمون‌دار");
  return JSON.stringify({
    count,
    erLocked: er ? !er.className.includes("badge-shine") : null,
    erProgress: er?.textContent?.includes("۰ از ۷ روزِ این هفته"),
    erSvg: er?.querySelector("svg") != null
  });
})()' 2>/dev/null

echo "--- C. exam-run learner (7 tiny quiz days, ZERO goals): unlocked + week-no-exam LOCKED (mutual exclusivity live)"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {};
  for (let n = 0; n <= 6; n++) dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 1, words: 0, dictation: 0, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "پژمان", dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-examrun";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۴"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const er = tile("هفتهٔ آزمون‌دار");
  const ne = tile("هفتهٔ بی‌آزمون");
  const dr = tile("هفتهٔ دیکتهٔ پیوسته");
  return JSON.stringify({
    count,
    erUnlocked: er?.className.includes("badge-shine") ?? null,
    erProgress: er?.textContent?.includes("۷ از ۷ روزِ این هفته"),
    noExamLocked: ne ? !ne.className.includes("badge-shine") : null,
    dictationRunLocked: dr ? !dr.className.includes("badge-shine") : null
  });
})()' 2>/dev/null

echo "--- D. skill-panel parity on home (light+dark, transitions killed): light white, dark #1c1917 (scoped painter)"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button, a")].find(x=>x.textContent?.includes("خانه")); b?.click(); return b? "nav-home":"nav-miss"; })()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const el = document.querySelector(".skill-panel");
  const read = () => el ? getComputedStyle(el).backgroundColor + "|" + getComputedStyle(el).borderTopColor : "MISSING";
  const light = read();
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 120));
  const dark = read();
  document.documentElement.classList.remove("dark");
  await new Promise(r => setTimeout(r, 120));
  st.remove();
  return JSON.stringify({ light, dark });
})()' 2>/dev/null

echo "--- E. duel-card parity on duel view (light+dark): dark must be #292524 (utility paints — folded rule)"
agent-browser eval '(() => { const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("نبرد دودنفره")); if(b){b.click();return "nav-ok";} return "nav-miss"; })()' 2>/dev/null
sleep 2
agent-browser eval '(async () => {
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  const els = [...document.querySelectorAll(".duel-card")];
  const read = () => JSON.stringify([...new Set(els.map(el => getComputedStyle(el).backgroundColor + "|" + getComputedStyle(el).borderTopColor))]);
  const light = { n: els.length, vals: read() };
  document.documentElement.classList.add("dark");
  await new Promise(r => setTimeout(r, 120));
  const dark = { vals: read() };
  document.documentElement.classList.remove("dark");
  await new Promise(r => setTimeout(r, 120));
  st.remove();
  return JSON.stringify({ light, dark });
})()' 2>/dev/null

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
