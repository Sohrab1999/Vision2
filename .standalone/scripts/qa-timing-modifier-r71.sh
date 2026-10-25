#!/bin/bash
# Round 71 live QA — timing modifier in parameterized palette commands
# «آزمون ۲۰ بدون زمان» → exam view with untimed toggle active (cold-mount path)
# «کنکور ۲۰ بدون زمان» → konkur untimed active; «آزمون ۳۰» default timed; event path both ways.
set -u
cd /home/z/my-project
echo "=== r71 QA start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

# helper: type into the palette input via native setter (React controlled input)
type_query() {
  agent-browser eval "(() => {
    const inp = document.querySelector('.command-palette input');
    if (!inp) return 'no-input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '$1');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()" 2>/dev/null | head -2
  sleep 1
}

echo "--- open palette (Ctrl+K) + query «آزمون ۲۰ بدون زمان» (cold-mount path)"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۲۰ بدون زمان"
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 60)});
})()' 2>/dev/null | head -3
agent-browser press Enter >/dev/null 2>&1
sleep 3
echo "--- exam view: untimed active + chip ۲۰?"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  const chip = [...document.querySelectorAll("button")].filter(b => /^(۱۰|۲۰|۳۰)$/.test((b.textContent||"").trim()) && (b.className||"").includes("emerald")).length;
  return JSON.stringify({
    untimedActive: untimed ? untimed.className.includes("border-emerald-500") : "missing",
    timedActive: timed ? timed.className.includes("border-emerald-500") : "missing",
    activeChips: chip
  });
})()' 2>/dev/null | head -3

echo "--- regression: «آزمون ۳۰» (bare) → timed default"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۳۰"
agent-browser press Enter >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({untimedActive: untimed?.className.includes("border-emerald-500"), timedActive: timed?.className.includes("border-emerald-500")});
})()' 2>/dev/null | head -3

echo "--- event path on OPEN view: «آزمون ۱۰ بدون زمان» then «آزمون ۱۰ با زمان»"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۱۰ بدون زمان"
agent-browser press Enter >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  return JSON.stringify({untimedActive_eventPath: untimed?.className.includes("border-emerald-500")});
})()' 2>/dev/null | head -3
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۱۰ با زمان"
agent-browser press Enter >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({timedActive_eventPath2: timed?.className.includes("border-emerald-500")});
})()' 2>/dev/null | head -3

echo "--- konkur: «کنکور ۲۰ بدون زمان» (cold path after nav)"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "کنکور ۲۰ بدون زمان"
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({first: opts[0]?.textContent?.slice(0, 60)});
})()' 2>/dev/null | head -3
agent-browser press Enter >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const untimed = btns.find(b => (b.textContent||"").includes("بدون تایمر"));
  const timed = btns.find(b => (b.textContent||"").includes("با تایمر"));
  return JSON.stringify({konkurUntimedActive: untimed?.className.includes("border-emerald-500"), konkurTimedActive: timed?.className.includes("border-emerald-500")});
})()' 2>/dev/null | head -3

echo "--- recents revival: reopen palette, first group = اخیر with modified labels"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const groups = [...document.querySelectorAll(".command-palette [role=group], .command-palette [class*=group]")];
  const firstGroupLabel = document.querySelector(".command-palette [class*=group]")?.textContent?.slice(0, 30);
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({firstOpt: opts[0]?.textContent?.slice(0, 50), hasUntimed: opts.some(o => (o.textContent||"").includes("بدون زمان"))});
})()' 2>/dev/null | head -3
agent-browser press Escape >/dev/null 2>&1

echo "--- mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}))()' 2>/dev/null | head -3
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- fresh console errors"
agent-browser console --level error 2>/dev/null | grep -ci "error" || echo "0"
agent-browser close --all >/dev/null 2>&1
echo "=== r71 QA end $(date +%T) ==="
