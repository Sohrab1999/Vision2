#!/bin/bash
# Round 71 QA-final — corrected button probes (toggle buttons only, exclude desc cards)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
type_query() {
  agent-browser eval "(() => {
    const inp = document.querySelector('.command-palette input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '$1');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()" 2>/dev/null | head -1
  sleep 1
}
toggle_state() {
  agent-browser eval '(() => {
    const btns = [...document.querySelectorAll("button")].filter(b => {
      const t = (b.textContent||"").replace(/\s+/g," ").trim();
      return t === "بدون تایمر" || t.startsWith("با تایمر (");
    });
    return JSON.stringify(btns.map(b => ({
      t: (b.textContent||"").replace(/\s+/g," ").trim().slice(0,12),
      active: b.className.includes("border-amber-500") || b.className.includes("border-emerald-500")
    })));
  })()' 2>/dev/null | head -6
}
echo "--- A) «آزمون ۲۰ بدون زمان» cold → untimed + chip ۲۰"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "آزمون ۲۰ بدون زمان"
agent-browser press Enter >/dev/null 2>&1; sleep 3
toggle_state
agent-browser eval '(() => {
  const chip = [...document.querySelectorAll("button")].find(b => (b.textContent||"").trim() === "۲۰ تست");
  return JSON.stringify({chip20Active: chip ? chip.className.includes("border-emerald-500") : "missing"});
})()' 2>/dev/null | head -3
echo "--- B) konkur cold «کنکور ۳۰ با زمان» → timed"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "کنکور ۳۰ با زمان"
agent-browser press Enter >/dev/null 2>&1; sleep 3
toggle_state
agent-browser eval '(() => {
  const chip = [...document.querySelectorAll("button")].find(b => (b.textContent||"").trim() === "۳۰ تست");
  return JSON.stringify({chip30Active: chip ? chip.className.includes("border-amber-500") : "missing"});
})()' 2>/dev/null | head -3
echo "--- C) event path on open konkur: «کنکور ۱۰ بدون زمان» → untimed"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "کنکور ۱۰ بدون زمان"
agent-browser press Enter >/dev/null 2>&1; sleep 2
toggle_state
echo "--- D) recents revival labels"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify(opts.slice(0,3).map(o => (o.textContent||"").replace(/\s+/g," ").slice(0,38)));
})()' 2>/dev/null | head -4
agent-browser press Escape >/dev/null 2>&1
echo "--- E) mobile 390 + console"
agent-browser set viewport 390 844 >/dev/null 2>&1; sleep 1
agent-browser eval '(() => JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}))()' 2>/dev/null | head -2
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser console --level error 2>/dev/null | grep -ci "error" || echo "0"
agent-browser close --all >/dev/null 2>&1
echo done
