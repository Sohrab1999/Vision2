#!/bin/bash
# Task 128 QA — the live weekly-goal ring on the weekly report — single session.
# LIGHT: ring exists (role=img, aria==title contract), center ۴۳٪ for 3 goal days,
#        arc dasharray 43 57, stone-token track computed #e7e5e4, label visible ≥sm.
# DARK : the stone token auto-darkens (#37312b kernel), report-digest ink band
#        rules paint the center/label (#a8a29e family), arc gradient untouched.
# MOBILE 390: OV=0, label hidden below sm (row budget), ring still on-duty.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed a real week (3 goal days in window) + onboarded — backup kept"
agent-browser eval '
(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
  const ds = (n, c) => Object.assign({ day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r128-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    dayHistory: {
      [key(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [key(1)]: ds(1, { reviews: 8 }),
      [key(2)]: ds(2, { reviews: 6, words: 2 }),
      [key(9)]: ds(9, { reviews: 30 }),
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

echo "--- B. LIGHT probes: ring contract + center + arc + stone track + label visible"
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  if (!ring) return "RING-MISSING";
  const arc = ring.querySelector("circle[pathLength=\"100\"]");
  const track = ring.querySelector("circle[stroke=\"var(--color-stone-200)\"]");
  const center = ring.querySelector("span");
  const label = ring.parentElement ? ring.parentElement.querySelector("span.hidden") : null;
  return JSON.stringify({
    light: !document.documentElement.classList.contains("dark"),
    aria: ring.getAttribute("aria-label"),
    titleEq: ring.getAttribute("aria-label") === ring.getAttribute("title"),
    center: center ? center.textContent : "MISSING",
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
    centerColor: center ? getComputedStyle(center).color : "MISSING",
    labelText: label ? label.textContent : "MISSING",
    labelShown: label ? getComputedStyle(label).display : "MISSING",
  });
})()' 2>/dev/null

echo "--- C. toggle DARK"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-CLICKED";
})()' 2>/dev/null
sleep 1

echo "--- D. DARK probes: stone token darkens, ink band rules, arc survives"
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  if (!ring) return "RING-MISSING";
  const track = ring.querySelector("circle[stroke=\"var(--color-stone-200)\"]");
  const center = ring.querySelector("span");
  const label = ring.parentElement ? ring.parentElement.querySelector("span.hidden") : null;
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
    centerColor: center ? getComputedStyle(center).color : "MISSING",
    labelColor: label ? getComputedStyle(label).color : "MISSING",
    arcStill: !!ring.querySelector("circle[pathLength=\"100\"]"),
  });
})()' 2>/dev/null

echo "--- E. mobile 390: OV=0 + label hidden below sm + ring still renders"
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '
(() => {
  const d = document.documentElement;
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  if (!ring) return "RING-MISSING";
  const label = ring.parentElement ? ring.parentElement.querySelector("span.hidden") : null;
  const row = ring.closest(".c-veil-60");
  return JSON.stringify({
    OV: d.scrollWidth - d.clientWidth,
    W: d.clientWidth,
    ringAlive: !!ring,
    center: (ring.querySelector("span")||{}).textContent,
    labelHidden: label ? getComputedStyle(label).display : "NO-LABEL",
    rowH: row ? Math.round(row.getBoundingClientRect().height) : 0,
  });
})()' 2>/dev/null

echo "--- F. console errors (session)"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"

echo "--- G. strip seed (restore backup)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r128-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r128-backup");
  return "STRIPPED|restored="+(bak==="__ABSENT__"?"absent":!!bak);
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA128_END"
