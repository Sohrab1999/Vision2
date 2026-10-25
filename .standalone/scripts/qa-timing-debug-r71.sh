#!/bin/bash
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser press Control+k >/dev/null 2>&1; sleep 1
agent-browser eval "(() => {
  const inp = document.querySelector('.command-palette input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(inp, 'کنکور ۲۰ بدون زمان');
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  return 'typed';
})()" 2>/dev/null | head -1
sleep 1
echo "--- options before Enter"
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify(opts.map(o => o.getAttribute("data-cmd-id") || o.id || o.textContent?.slice(0,40)));
})()' 2>/dev/null | head -4
agent-browser press Enter >/dev/null 2>&1
echo "--- immediately after Enter: sessionStorage"
agent-browser eval '(() => JSON.stringify({
  count: sessionStorage.getItem("vision2-konkur-prefill"),
  timed: sessionStorage.getItem("vision2-konkur-timed-prefill")
}))()' 2>/dev/null | head -3
sleep 3
echo "--- after mount: sessionStorage + buttons"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({
    count: sessionStorage.getItem("vision2-konkur-prefill"),
    timed: sessionStorage.getItem("vision2-konkur-timed-prefill"),
    view: document.querySelector("[class*=konkur]") ? "konkur-el" : "unknown",
    untimedBtn: untimed ? (untimed.className.includes("border-amber-500") ? "active" : "inactive") : "missing",
    timedBtn: timed ? (timed.className.includes("border-amber-500") ? "active" : "inactive") : "missing"
  });
})()' 2>/dev/null | head -5
agent-browser close --all >/dev/null 2>&1
echo done
