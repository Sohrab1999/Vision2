#!/bin/bash
# Task 85 BEFORE probe — c-card baseline: computed bg/border of the plain card family in both themes (single session)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- BEFORE light: all plain-card family elements on home (value sweep + count)"
agent-browser eval '(() => {
  const els = [...document.querySelectorAll(".border-stone-200.bg-white")];
  const sweep = els.slice(0, 6).map(el => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, border: cs.borderTopColor };
  });
  const uniq = [...new Set(els.map(el => {
    const cs = getComputedStyle(el);
    return cs.backgroundColor + "|" + cs.borderTopColor;
  }))];
  return JSON.stringify({ count: els.length, uniq, sweep });
})()' 2>/dev/null

echo "--- BEFORE dark: same sweep"
agent-browser eval '(() => {
  document.documentElement.classList.add("dark");
  const els = [...document.querySelectorAll(".border-stone-200.bg-white")];
  const uniq = [...new Set(els.map(el => {
    const cs = getComputedStyle(el);
    return cs.backgroundColor + "|" + cs.borderTopColor;
  }))];
  const sample = els.slice(0, 3).map(el => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, border: cs.borderTopColor };
  });
  document.documentElement.classList.remove("dark");
  return JSON.stringify({ count: els.length, uniq, sample });
})()' 2>/dev/null

echo "--- BEFORE: scoped-context sanity (word-day card must deviate in dark)"
agent-browser eval '(() => {
  document.documentElement.classList.add("dark");
  const wd = document.querySelector(".word-day .border-stone-200, .word-day.border-stone-200");
  const r = wd ? { found: true, bg: getComputedStyle(wd).backgroundColor, border: getComputedStyle(wd).borderTopColor } : { found: false };
  document.documentElement.classList.remove("dark");
  return JSON.stringify(r);
})()' 2>/dev/null

echo "--- BEFORE baseline saved to scripts/r85-ccard-baseline.json (manual copy from outputs above)"
