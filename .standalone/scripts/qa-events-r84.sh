#!/bin/bash
# Task 84 live QA — event-week badges + c-chip-freeze family migration + strip legend, single session
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. fresh: «۰ از ۳۲» + both event tiles locked with window progress"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = sec ? [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۲")) : null;
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const nd = tile("هفتهٔ بی‌دیکته"), ne = tile("هفتهٔ بی‌آزمون");
  return JSON.stringify({
    count,
    noDictLocked: nd ? !nd.className.includes("badge-shine") : null,
    noDictProgress: nd?.textContent?.includes("۰ از ۷ روزِ این هفته"),
    noExamLocked: ne ? !ne.className.includes("badge-shine") : null,
    iconsReal: nd?.querySelector("svg") != null && ne?.querySelector("svg") != null
  });
})()' 2>/dev/null

echo "--- B. pure event week (w0..w6 goal + reviews-only dayHistory): BOTH unlock, count «۶ از ۳۲»"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const dayHistory = {}, goalMetDays = [];
  for (let n = 0; n <= 6; n++) { dayHistory[key(n)] = { day: key(n), reviews: 6, quizzes: 0, words: 0, dictation: 0, rush: 0 }; goalMetDays.push(key(n)); }
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    userName: "سارا", goalMetDays, dayHistory, streak: 7, seenBadges: []
  }, version: 0 }));
  return "seeded-pure";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۲"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  return JSON.stringify({
    count,
    noDictShine: tile("هفتهٔ بی‌دیکته")?.className.includes("badge-shine"),
    noExamShine: tile("هفتهٔ بی‌آزمون")?.className.includes("badge-shine"),
    cageShine: tile("هفتهٔ بی‌قفسه")?.className.includes("badge-shine")
  });
})()' 2>/dev/null

echo "--- C. dictation INSIDE window: بی‌دیکته LOCKED «۷ از ۷» + بی‌آزمون still shine (independence live)"
agent-browser eval '(() => {
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  raw.state.dayHistory[key(3)] = { day: key(3), reviews: 0, quizzes: 0, words: 0, dictation: 2, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "seeded-dictation";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  const count = [...sec.querySelectorAll("span")].map(s => s.textContent).find(t => t?.includes("از ۳۲"));
  const tile = (t) => [...sec.querySelectorAll(".badge-card")].find(c => c.textContent?.includes(t));
  const nd = tile("هفتهٔ بی‌دیکته"), ne = tile("هفتهٔ بی‌آزمون");
  return JSON.stringify({
    count,
    noDictLocked: !nd.className.includes("badge-shine"),
    noDictHonest: nd.textContent?.includes("۷ از ۷ روزِ این هفته"),
    noExamShine: ne.className.includes("badge-shine")
  });
})()' 2>/dev/null

echo "--- D. freeze learner: ledger chips migrated to c-chip-freeze — family parity (3 surfaces equal) in LIGHT"
agent-browser eval '(() => {
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  raw.state.freezeCount = 2;
  raw.state.freezeSavedDay = key(0);
  raw.state.dayHistory[key(3)] = { day: key(3), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 };
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "seeded-freeze";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const home = document.querySelector("span[title^=\"یخِ زنجیره\"]");
  const badge = document.querySelector(".freeze-badge");
  const cs = (el) => el ? (({borderColor, backgroundColor, color}) => ({borderColor, backgroundColor, color}))(getComputedStyle(el)) : null;
  return JSON.stringify({ home: cs(home), badge: cs(badge), same: JSON.stringify(cs(home)) === JSON.stringify(cs(badge)) });
})()' 2>/dev/null
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const chip = document.querySelector(".freeze-ledger .c-chip-freeze");
  const badge = document.querySelector(".freeze-badge");
  const cs = (el) => el ? (({borderColor, backgroundColor, color}) => ({borderColor, backgroundColor, color}))(getComputedStyle(el)) : null;
  const strong = [...document.querySelectorAll(".freeze-ledger span")].find(s => s.textContent?.includes("نجات امروز"));
  const legend = document.querySelector(".report-legend");
  return JSON.stringify({
    ledgerChip: cs(chip),
    parityLedgerBadge: JSON.stringify(cs(chip)) === JSON.stringify(cs(badge)),
    strongToday: strong?.className?.includes("text-sky-700"),
    legendSamples: legend ? legend.querySelectorAll("span[aria-hidden]").length : 0,
    legendTexts: ["فعالیت","هفتهٔ پیش","امروز"].every(t => legend?.textContent?.includes(t)),
    legendGrad: !!legend?.querySelector(".from-teal-600")
  });
})()' 2>/dev/null

echo "--- E. DARK: same family parity + no regression"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "dark"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const chip = document.querySelector(".freeze-ledger .c-chip-freeze");
  const badge = document.querySelector(".freeze-badge");
  const home = document.querySelector("span[title^=\"یخِ زنجیره\"]") || chip;
  const cs = (el) => el ? (({borderColor, backgroundColor, color}) => ({borderColor, backgroundColor, color}))(getComputedStyle(el)) : null;
  return JSON.stringify({
    ledgerChipDark: cs(chip),
    parityLedgerBadge: JSON.stringify(cs(chip)) === JSON.stringify(cs(badge)),
    legendVisible: !!document.querySelector(".report-legend")
  });
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); const b=[...document.querySelectorAll("button")].find(x=>x.textContent?.includes("بستن")); b?.click(); return "light+closed"; })()' 2>/dev/null

echo "--- F. mobile 390: report legend fits, overflow 0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const legend = document.querySelector(".report-legend");
  const r = legend?.getBoundingClientRect();
  return JSON.stringify({
    legendW: r ? Math.round(r.width) : null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
  });
})()' 2>/dev/null

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -ci "error" || echo "0"

echo "--- H. cleanup: reset learner"
agent-browser eval '(() => { localStorage.removeItem("vision2-study-v1"); return "clean"; })()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "DONE"
