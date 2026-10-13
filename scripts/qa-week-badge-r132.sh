#!/bin/bash
# Task 132 QA — «نشانِ هفتهٔ کامل» (the week-complete badge on the header week chip).
# Single session. A. seed a 7-goal-day week + onboarded profile (backup kept)
# B. chip present, aria-label celebrates («کامل شد»), arc «100 0»
# C. badge: span.absolute aria-hidden, computed bg = emerald-600, 14px, positioned corner
# D. dark: same badge value — zero new dark rule proves itself
# E. partial week (3 days): NO badge — honesty of the claim
# F. mobile 390: chip hidden entirely (budget rule of 123/129)
# G. console errors = 0 across whole session. H. strip seed.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed 7-goal-day week"
agent-browser eval '
(() => {
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r132-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, userName: "آزمون‌گر", onboarded: true,
    goalMetDays: [0,1,2,3,4,5,6].map(k),
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED|goalMetDays=7";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- B+C. chip + badge contract (light)"
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  if (!chip) return "NO-CHIP";
  const aria = chip.getAttribute("aria-label") || "";
  const arc = chip.querySelector("circle[pathLength=\"100\"]");
  const badge = chip.querySelector("span.absolute");
  if (!badge) return "NO-BADGE|aria=" + aria.slice(0,40);
  const cs = getComputedStyle(badge);
  const r = chip.getBoundingClientRect(), b = badge.getBoundingClientRect();
  return [
    "ariaCelebrate=" + aria.includes("کامل شد"),
    "arc=" + (arc ? arc.getAttribute("stroke-dasharray") : "none"),
    "badgeAriaHidden=" + badge.getAttribute("aria-hidden"),
    "badgeBg=" + cs.backgroundColor,
    "badgePos=" + cs.position, "badgeSize=" + b.width + "x" + b.height,
    "badgeTopInChip=" + (b.top <= r.top + 2),
    "relative=" + cs.position + "|" + getComputedStyle(chip).position,
  ].join("|");
})()' 2>/dev/null

echo "--- D. dark mode — badge keeps its value (no dark rule needed)"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const badge = document.querySelector("button.week-chip span.absolute");
  if (!badge) return "NO-BADGE-DARK";
  return "DARK-badgeBg=" + getComputedStyle(badge).backgroundColor;
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- E. partial week (3 days) — badge must vanish"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.goalMetDays = [0,1,2].map(k);
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "RESEEDED|goalMetDays=3";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  if (!chip) return "NO-CHIP";
  const aria = chip.getAttribute("aria-label") || "";
  return "PARTIAL|badge=" + (!!chip.querySelector("span.absolute")) + "|ariaPct=" + aria.slice(0, 14);
})()' 2>/dev/null

echo "--- F. mobile 390 — whole chip hidden (set viewport — resize is a no-op, caught live)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '
(() => {
  const chip = document.querySelector("button.week-chip");
  const d = document.documentElement;
  const ov = Math.max(d.scrollWidth - window.innerWidth, 0);
  return "MOBILE|innerWidth=" + window.innerWidth + "|display=" + (chip ? getComputedStyle(chip).display : "gone") + "|OV=" + ov;
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- H. strip seed"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r132-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r132-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
