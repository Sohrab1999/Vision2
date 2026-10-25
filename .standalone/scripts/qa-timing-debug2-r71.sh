#!/bin/bash
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
echo "--- manual flag write, then palette bare «کنکور ۱۰» (no timing write)"
agent-browser eval '(() => { sessionStorage.setItem("vision2-konkur-timed-prefill", "0"); return sessionStorage.getItem("vision2-konkur-timed-prefill"); })()' 2>/dev/null | head -2
agent-browser press Control+k >/dev/null 2>&1; sleep 1
agent-browser eval "(() => {
  const inp = document.querySelector('.command-palette input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(inp, 'کنکور ۱۰');
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  return 'typed';
})()" 2>/dev/null | head -1
sleep 1
agent-browser press Enter >/dev/null 2>&1; sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({
    manualFlagUntimed: untimed ? (untimed.className.includes("border-amber-500") ? "ACTIVE" : "inactive") : "missing",
    manualFlagTimed: timed ? (timed.className.includes("border-amber-500") ? "ACTIVE" : "inactive") : "missing"
  });
})()' 2>/dev/null | head -3
echo "--- now full command path again: «کنکور ۲۰ بدون زمان» on top"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
agent-browser eval "(() => {
  const inp = document.querySelector('.command-palette input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(inp, 'کنکور ۲۰ بدون زمان');
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  return 'typed';
})()" 2>/dev/null | head -1
sleep 1
agent-browser press Enter >/dev/null 2>&1
echo "--- flag present right after Enter?"
agent-browser eval '(() => JSON.stringify({timedKey: sessionStorage.getItem("vision2-konkur-timed-prefill")}))()' 2>/dev/null | head -2
sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({
    cmdPathUntimed: untimed ? (untimed.className.includes("border-amber-500") ? "ACTIVE" : "inactive") : "missing",
    cmdPathTimed: timed ? (timed.className.includes("border-amber-500") ? "ACTIVE" : "inactive") : "missing",
    keyAfter: sessionStorage.getItem("vision2-konkur-timed-prefill")
  });
})()' 2>/dev/null | head -3
agent-browser close --all >/dev/null 2>&1
echo done
