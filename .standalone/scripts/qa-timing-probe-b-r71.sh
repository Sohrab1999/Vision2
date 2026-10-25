#!/bin/bash
# Round 71 QA-b — corrected probes (konkur=amber theme, exam chip active class)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
type_query() {
  agent-browser eval "(() => {
    const inp = document.querySelector('.command-palette input');
    if (!inp) return 'no-input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '$1');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()" 2>/dev/null | head -1
  sleep 1
}
echo "--- «کنکور ۲۰ بدون زمان» → konkur untimed (amber) active"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "کنکور ۲۰ بدون زمان"
agent-browser press Enter >/dev/null 2>&1; sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({
    konkurUntimedActive: untimed ? untimed.className.includes("border-amber-500") : "missing",
    konkurTimedActive: timed ? timed.className.includes("border-amber-500") : "missing"
  });
})()' 2>/dev/null | head -3
echo "--- «آزمون ۲۰ بدون زمان» → chip ۲۰ active (cold exam mount)"
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "آزمون ۲۰ بدون زمان"
agent-browser press Enter >/dev/null 2>&1; sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => ["۱۰","۲۰","۳۰"].includes((b.textContent||"").trim()));
  return JSON.stringify(btns.map(b => ({ t: (b.textContent||"").trim(), active: b.className.includes("border-emerald-500") })));
})()' 2>/dev/null | head -5
echo "--- bare «آزمون ۲۰» cold (fresh reload first)"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1; sleep 4
agent-browser press Control+k >/dev/null 2>&1; sleep 1
type_query "آزمون ۲۰"
agent-browser press Enter >/dev/null 2>&1; sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  return JSON.stringify({coldBare_timedActive: timed?.className.includes("border-emerald-500"), coldBare_untimedActive: untimed?.className.includes("border-emerald-500")});
})()' 2>/dev/null | head -3
agent-browser close --all >/dev/null 2>&1
echo done
