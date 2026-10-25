#!/bin/bash
# Round 74 smoke QA — single session, status check before feature work
set -u
cd /home/z/my-project
echo "=== r77 smoke start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. home + console errors (fresh session)"
agent-browser eval '(() => JSON.stringify({
  title: document.title.slice(0, 40),
  lang: document.documentElement.lang,
  dir: document.documentElement.dir,
  landmarks: document.querySelectorAll("main, nav, header").length
}))()' 2>/dev/null | head -3
agent-browser errors 2>/dev/null | head -5

echo "--- B. palette Ctrl+K top-level options"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({inputOk: !!inp, opts: opts.length,
    first: opts[0]?.textContent?.slice(0,40), placeholder: inp?.placeholder?.slice(0,50)});
})()' 2>/dev/null | head -3

echo "--- C. snap regression: «آزمون ۱۵» → 1 option (r72 fix)"
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "آزمون ۱۵");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 60)});
})()' 2>/dev/null | head -3

echo "--- D. due pill visibility (srs empty in fresh browser → absent expected)"
agent-browser eval '(() => {
  const pill = document.querySelector("[data-testid=due-pill], [aria-label*=سررسیده]");
  return JSON.stringify({pillPresent: !!pill, headerChildren: document.querySelector("header")?.children?.length ?? 0});
})()' 2>/dev/null | head -3
agent-browser press Escape >/dev/null 2>&1
sleep 1

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}))()' 2>/dev/null | head -3
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -5
agent-browser close --all >/dev/null 2>&1
echo "=== r77 smoke end $(date +%T) ==="
