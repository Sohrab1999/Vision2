#!/bin/bash
# Round 70 live QA — tranche-3b part 2 (tone bands + elevated-surface group)
# Single agent-browser session; probes computed styles against expected values.
set -u
cd /home/z/my-project

echo "=== r70 QA start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- skip onboarding if present (avoid lesson CTA) or note state"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const skip = btns.find(x => /رد شدن|بعدا|بستن|skip/i.test(x.textContent||x.getAttribute("aria-label")||""));
  if (skip) { skip.click(); return "skipped"; }
  const ob = document.querySelector("[role=dialog]");
  return ob ? "onboarding-no-skip-btn" : "no-onboarding";
})()' 2>/dev/null | head -2
sleep 1

echo "--- enable dark via real theme button (state-relative aria-label)"
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("button")].find(b => (b.getAttribute("aria-label")||"") === "حالت شب");
  if (btn) { btn.click(); return "clicked-dark-toggle"; }
  document.documentElement.classList.add("dark");
  return "fallback-classlist";
})()' 2>/dev/null | head -2
sleep 2

echo "--- DARK probes (injected wrappers + real word-day)"
agent-browser eval '(() => {
  document.getElementById("qa-r70-probe")?.remove();
  const root = document.createElement("div");
  root.id = "qa-r70-probe";
  root.innerHTML = [
    "<div class=\"rush-done\"><div class=\"bg-white\" id=\"p-rushdone\">x</div></div>",
    "<div class=\"duel-card\"><div class=\"bg-white\" id=\"p-duel\">x</div></div>",
    "<div class=\"srs-panel\"><div class=\"bg-stone-200\" id=\"p-srs\">x</div><span class=\"text-teal-700\" id=\"p-teal\">t</span><span class=\"text-rose-600\" id=\"p-rose\">r</span></div>",
    "<div class=\"report-digest\"><div class=\"bg-white\" id=\"p-report\">x</div><span class=\"text-emerald-700\" id=\"p-em\">e</span></div>",
    "<div class=\"shortcuts-dialog\"><div class=\"bg-white\" id=\"p-short\">x</div></div>",
    "<div class=\"daily-quests\"><div class=\"bg-stone-200 bg-stone-200/80\" id=\"p-dq\">x</div></div>",
    "<span class=\"text-emerald-700\" id=\"p-emg\">g</span>",
    "<div class=\"word-day\"><span class=\"text-emerald-700\" id=\"p-wd\">w</span></div>"
  ].join("");
  document.body.appendChild(root);
  const cs = (id, prop) => { const el = document.getElementById(id); return el ? getComputedStyle(el)[prop] : "missing"; };
  return JSON.stringify({
    rushdoneCard: cs("p-rushdone","backgroundColor"),
    duelCard: cs("p-duel","backgroundColor"),
    srsSurf: cs("p-srs","backgroundColor"),
    reportCard: cs("p-report","backgroundColor"),
    shortCard: cs("p-short","backgroundColor"),
    dqSurf: cs("p-dq","backgroundColor"),
    teal700: cs("p-teal","color"),
    rose600: cs("p-rose","color"),
    em700: cs("p-em","color"),
    em700global: cs("p-emg","color"),
    worddayDrift: cs("p-wd","color")
  });
})()' 2>/dev/null | head -4

echo "--- real word-day element (home) + real daily-quests surface"
agent-browser eval '(() => {
  const wd = document.querySelector(".word-day .text-emerald-700");
  const dq = document.querySelector(".daily-quests .bg-stone-200\\/80");
  return JSON.stringify({
    realWordDay: wd ? getComputedStyle(wd).color : "absent",
    realDqSurf: dq ? getComputedStyle(dq).backgroundColor : "absent"
  });
})()' 2>/dev/null | head -3

echo "--- palette opens via Ctrl+K"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const pal = document.querySelector(".command-palette");
  return pal ? "palette-open" : "palette-missing";
})()' 2>/dev/null | head -2
agent-browser press Escape >/dev/null 2>&1
sleep 1

echo "--- LIGHT mode restore + no-dark-leak probes"
agent-browser eval '(() => {
  const btn = [...document.querySelectorAll("button")].find(b => (b.getAttribute("aria-label")||"") === "حالت روشن");
  if (btn) btn.click();
  document.documentElement.classList.remove("dark");
  const cs = (id, prop) => { const el = document.getElementById(id); return el ? getComputedStyle(el)[prop] : "missing"; };
  return JSON.stringify({
    em700global: cs("p-emg","color"),
    rushdoneCard: cs("p-rushdone","backgroundColor"),
    worddayDrift: cs("p-wd","color")
  });
})()' 2>/dev/null | head -3

echo "--- mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const d = document.documentElement;
  return JSON.stringify({overflow: d.scrollWidth - d.clientWidth});
})()' 2>/dev/null | head -3

echo "--- cleanup probe + desktop viewport"
agent-browser eval '(() => { document.getElementById("qa-r70-probe")?.remove(); return "probe-removed"; })()' 2>/dev/null | head -2
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- fresh console errors"
agent-browser console --level error 2>/dev/null | grep -ci "error" || echo "0"

agent-browser close --all >/dev/null 2>&1
echo "=== r70 QA end $(date +%T) ==="
