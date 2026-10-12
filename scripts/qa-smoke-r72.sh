#!/bin/bash
# Round 72 smoke QA — single session, status check before feature work
set -u
cd /home/z/my-project
echo "=== r72 smoke start $(date +%T) ==="
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
  const groups = [...document.querySelectorAll(".command-palette [role=listbox] > div")].length;
  return JSON.stringify({inputOk: !!inp, opts: opts.length, groups,
    first: opts[0]?.textContent?.slice(0,40), placeholder: inp?.placeholder?.slice(0,50)});
})()' 2>/dev/null | head -3

echo "--- C. param sample: «آزمون ۱۵ بدون زمان» → exactly 1 option"
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "آزمون ۱۵ بدون زمان");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 60)});
})()' 2>/dev/null | head -3

echo "--- D. recents group on empty query"
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "cleared";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const labels = [...document.querySelectorAll(".command-palette [role=listbox]")].map(l => l.textContent?.slice(0, 80));
  return JSON.stringify(labels);
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

echo "--- F. dark toggle probe"
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /حالت/.test(b.getAttribute("aria-label") || b.getAttribute("title") || ""));
  return JSON.stringify({found: !!btn, aria: btn?.getAttribute("aria-label")});
})()' 2>/dev/null | head -3

echo "--- G. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -5
echo "=== r72 smoke end $(date +%T) ==="
