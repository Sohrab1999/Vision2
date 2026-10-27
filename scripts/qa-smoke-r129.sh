#!/bin/bash
# Task 129 smoke — live state after Task 128 (weekly-goal ring) — single session.
# A. seed a real week (3 goal days) — backup kept
# B. LIGHT: ring contract (role=img, aria==title), center ۴۳٪, dasharray 43 57
# C. DARK : stone token darkens (#37312b kernel), arc survives
# D. MOBILE 390: OV=0
# E. console errors of whole session = 0; strip seed.
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
  localStorage.setItem("vision2-study-v1-r129-backup", raw || "__ABSENT__");
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
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "opened"' >/dev/null 2>&1
sleep 2

echo "--- B. LIGHT probes"
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  if (!ring) return "RING-MISSING";
  const arc = ring.querySelector("circle[pathLength=\"100\"]");
  const center = ring.querySelector("span");
  return JSON.stringify({
    light: !document.documentElement.classList.contains("dark"),
    aria: ring.getAttribute("aria-label"),
    titleEq: ring.getAttribute("aria-label") === ring.getAttribute("title"),
    center: center ? center.textContent : "MISSING",
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
  });
})()' 2>/dev/null

echo "--- C. DARK probes"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  if (!ring) return "RING-MISSING";
  const track = ring.querySelector("circle[stroke=\"var(--color-stone-200)\"]");
  const arc = ring.querySelector("circle[pathLength=\"100\"]");
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
  });
})()' 2>/dev/null

echo "--- D. MOBILE 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '
(() => {
  const doc = document.documentElement;
  return JSON.stringify({ ovX: doc.scrollWidth - doc.clientWidth });
})()' 2>/dev/null

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ci "error" || echo "0"

echo "--- F. strip seed (restore backup)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r129-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak !== null) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r129-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "--- SMOKE-DONE"
