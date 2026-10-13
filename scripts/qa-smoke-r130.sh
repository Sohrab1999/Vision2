#!/bin/bash
# Task 130 entry smoke — state after Task 129 (week chip in header) — single session, read-only.
# A. home loads (today chip + week chip neighbors — r129)
# B. shelf surface
# C. week chip contract: aria==title, arc dasharray 43 57 (seeded 3-goal week)
# D. week chip click → report opens with live ring (same title/dash)
# E. duel surface (4-player host)
# F. dark round-trip + stone track darkens
# G. mobile 390 overflow = 0
# H. console errors of whole session = 0; strip seed.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed week (3 goal days) + onboarded"
agent-browser eval '
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const ds = (n, c) => Object.assign({ day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r130-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    dayHistory: {
      [key(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [key(1)]: ds(1, { reviews: 8 }),
      [key(2)]: ds(2, { reviews: 6, words: 2 }),
    },
    goalMetDays: [key(0), key(1), key(2)],
    streak: 6, introDone: true, userName: "آزمون‌گر", onboarded: true,
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED-WEEK|goalDays=3";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "HOME|TODAY|" + (/امروز/.test(t) ? "OK" : "FAIL") + "|LEN|" + t.length;
})()' 2>/dev/null

echo "--- B. shelf surface"
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "SHELF|" + (/قفسهٔ کتاب/.test(t) ? "OK" : "FAIL");
})()' 2>/dev/null

echo "--- C. week chip contract (header, next to GoalChip)"
agent-browser eval '
(() => {
  const chip = document.querySelector("button[aria-label*=\"از ۷ روزِ هدف\"]");
  if (!chip) return "CHIP-MISSING";
  const arc = chip.querySelector("circle[pathLength=\"100\"]");
  return JSON.stringify({
    aria: chip.getAttribute("aria-label"),
    titleEq: chip.getAttribute("aria-label") === chip.getAttribute("title"),
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
    gradient: chip.querySelector("linearGradient") ? "PRESENT" : "MISSING",
  });
})()' 2>/dev/null

echo "--- D. chip click → weekly report live ring"
agent-browser eval '(() => {
  const chip = document.querySelector("button[aria-label*=\"از ۷ روزِ هدف\"]");
  if (!chip) return "CHIP-MISSING";
  chip.click(); return "CHIP-CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const t = document.body.textContent || "";
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  const arc = ring ? ring.querySelector("circle[pathLength=\"100\"]") : null;
  return JSON.stringify({
    reportOpen: /گزارش هفتگی|هفته‌نامه/.test(t) ? "OK" : "CHECK",
    liveRingAria: ring ? ring.getAttribute("aria-label") : "MISSING",
    liveArcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
  });
})()' 2>/dev/null

echo "--- E. duel surface (back home via nav)"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const home = btns.find(b => (b.textContent || "").trim() === "خانه");
  if (!home) return "HOME-MISSING";
  home.click(); return "HOME-CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const card = btns.find(b => (b.textContent || "").includes("نبرد دودنفره"));
  if (!card) return "CARD-MISSING";
  card.click(); return "CARD-CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return "DUEL|CREATE|" + (/ساخت اتاق نبرد/.test(t) ? "OK" : "FAIL") +
    "|CONN|" + (/متصل به سرور نبرد/.test(t) ? "OK" : "FAIL");
})()' 2>/dev/null

echo "--- F. dark round-trip + stone track"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const home = btns.find(b => (b.textContent || "").trim() === "خانه");
  if (home) home.click();
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  const track = ring ? ring.querySelector("circle[stroke=\"var(--color-stone-200)\"]") : null;
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
  });
})()' 2>/dev/null

echo "--- G. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const d = document.documentElement;
  return "MOBILE390|OVERFLOW|" + (d.scrollWidth - d.clientWidth) + "|W|" + d.clientWidth;
})()' 2>/dev/null

echo "--- H. console errors (whole session)"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"

echo "--- I. strip seed (restore backup)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r130-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak !== null) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r130-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "SMOKE130_END"
