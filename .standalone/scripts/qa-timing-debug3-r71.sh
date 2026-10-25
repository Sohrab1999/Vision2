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
agent-browser press Enter >/dev/null 2>&1; sleep 3
echo "--- ALL untimed/timed buttons in DOM"
agent-browser eval '(() => {
  const all = [...document.querySelectorAll("button")].filter(b => /بدون تایمر|با تایمر/.test(b.textContent||""));
  return JSON.stringify(all.map(b => ({
    t: (b.textContent||"").replace(/\s+/g," ").trim().slice(0,30),
    amber: b.className.includes("border-amber-500"),
    emerald: b.className.includes("border-emerald-500"),
    visible: b.offsetParent !== null
  })));
})()' 2>/dev/null | head -8
echo "--- konkur view root count + session state via store"
agent-browser eval '(() => {
  const roots = document.querySelectorAll("[class*=konkur-setup], [class*=konkur]");
  return JSON.stringify({konkurRoots: roots.length});
})()' 2>/dev/null | head -3
agent-browser close --all >/dev/null 2>&1
echo done
