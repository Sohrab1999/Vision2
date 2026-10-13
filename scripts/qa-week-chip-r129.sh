#!/bin/bash
# Task 129 QA — the weekly-goal mini-ring chip in the header — single session.
# A. seed a real week (3 goal days) — backup kept
# B. DESKTOP: chip visible ≥sm, aria==title contract, arc dasharray 43 57,
#    stone-token track (light), sits next to GoalChip
# C. CLICK: opens the weekly report (real open-report dispatch) — live ring appears
# D. DARK: stone token darkens (#37312b kernel), arc survives
# E. MOBILE 390 + 320: chip hidden below sm, OV=0
# F. console errors of whole session = 0; strip seed.
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
  localStorage.setItem("vision2-study-v1-r129chip-backup", raw || "__ABSENT__");
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

echo "--- B. DESKTOP probes: chip contract + arc + track + neighbor GoalChip"
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  if (!chip) return "CHIP-MISSING";
  const arc = chip.querySelector("circle[pathLength=\"100\"]");
  const track = chip.querySelector("circle[stroke=\"var(--color-stone-200)\"]");
  const goalChip = document.querySelector("button.goal-chip");
  const cs = getComputedStyle(chip);
  return JSON.stringify({
    light: !document.documentElement.classList.contains("dark"),
    aria: chip.getAttribute("aria-label"),
    titleEq: chip.getAttribute("aria-label") === chip.getAttribute("title"),
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
    arcStroke: arc ? arc.getAttribute("stroke") : "NO-ARC",
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
    display: cs.display,
    goalChipNeighbor: !!goalChip && goalChip.nextElementSibling === chip,
    gradientIdOnce: document.querySelectorAll("#week-chip-arc").length,
  });
})()' 2>/dev/null

echo "--- C. CLICK chip → weekly report opens (live ring appears)"
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  if (!chip) return "CHIP-MISSING";
  chip.click();
  return "CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=img][aria-label*=\"از ۷ روزِ هدف\"]");
  const digestOpen = !!document.querySelector(".report-digest");
  return JSON.stringify({
    liveRingAria: ring ? ring.getAttribute("aria-label") : "RING-MISSING",
    ringDash: ring ? (ring.querySelector("circle[pathLength=\"100\"]") || {}).getAttribute?.("stroke-dasharray") || "NO-ARC" : "-",
    digestOpen,
  });
})()' 2>/dev/null

echo "--- D. DARK probes (report still open)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK-CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  if (!chip) return "CHIP-MISSING";
  const track = chip.querySelector("circle[stroke=\"var(--color-stone-200)\"]");
  const arc = chip.querySelector("circle[pathLength=\"100\"]");
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    trackComputed: track ? getComputedStyle(track).stroke : "NO-TRACK",
    arcDash: arc ? arc.getAttribute("stroke-dasharray") : "NO-ARC",
  });
})()' 2>/dev/null

echo "--- E. MOBILE 390: chip hidden below sm + OV=0 ; then 320 OV=0"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  const doc = document.documentElement;
  return JSON.stringify({
    chipDisplay: chip ? getComputedStyle(chip).display : "MISSING",
    ovX390: doc.scrollWidth - doc.clientWidth,
  });
})()' 2>/dev/null
agent-browser set viewport 320 700 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const doc = document.documentElement;
  return JSON.stringify({ ovX320: doc.scrollWidth - doc.clientWidth });
})()' 2>/dev/null

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ci "error" || echo "0"

echo "--- G. strip seed (restore backup)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r129chip-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak !== null) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r129chip-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "--- QA-DONE"
