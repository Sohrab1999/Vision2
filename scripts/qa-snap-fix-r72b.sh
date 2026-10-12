#!/bin/bash
# Round 72 QA-B — exact active-state probes (definitive discriminators)
# exam chip active = bg-emerald-50 (inactive bg-white); konkur active = bg-amber-50.
# toggles: active = border-amber-500 bg-amber-50 (exam timed/untimed same pattern).
set -u
cd /home/z/my-project
echo "=== r72 QA-B start $(date +%T) ==="
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
  })()" 2>/dev/null | head -2
  sleep 1
}
# exact-state chip probe: active iff className contains bg-emerald-50 or bg-amber-50
chip_state() {
  agent-browser eval '(() => {
    const btns = [...document.querySelectorAll("button")];
    const chips = btns.filter(b => /^(۱۰|۲۰|۳۰) تست$/.test((b.textContent||"").trim()))
      .map(b => ({t: (b.textContent||"").trim(),
        active: /(bg-emerald-50|bg-amber-50)( |"|$)/.test(b.className) || (b.className||"").includes("bg-emerald-50") || (b.className||"").includes("bg-amber-50")}));
    const untimed = btns.find(b => (b.textContent||"").trim() === "بدون تایمر");
    const timed = btns.find(b => (b.textContent||"").startsWith("با تایمر ("));
    const tg = (b) => b ? ((b.className||"").includes("bg-amber-50") ? "active" : "inactive") : "missing";
    return JSON.stringify({chips, timed: tg(timed), untimed: tg(untimed)});
  })()' 2>/dev/null | head -4
}

echo "--- 1. «آزمون ۱۵» → chip ۱۰ active ONLY, timed kept (bare semantics)"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
type_query "آزمون ۱۵"
agent-browser press Enter >/dev/null 2>&1
sleep 3
chip_state

echo "--- 2. «کنکور ۲۵ بدون زمان» → chip ۲۰ active ONLY + untimed active"
agent-browser press Control+k >/dev/null 2>&1
sleep 0.6
type_query "کنکور ۲۵ بدون زمان"
agent-browser press Enter >/dev/null 2>&1
sleep 3
chip_state

echo "--- 3. user toggle still works: click «با تایمر» then re-probe (state preserved on same view)"
agent-browser eval '(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent||"").startsWith("با تایمر ("));
  if (!b) return "no-toggle";
  b.click();
  return "clicked";
})()' 2>/dev/null | head -2
sleep 1
chip_state
agent-browser close --all >/dev/null 2>&1
echo "=== r72 QA-B end $(date +%T) ==="
