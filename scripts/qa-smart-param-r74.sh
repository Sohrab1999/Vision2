#!/bin/bash
# Round 74 live QA — parametric smart practice («تمرین هوشمند ۱۵») +
# ignored-timing fix («هدف ۱۵ بدون زمان»). Single session, sequential.
set -u
cd /home/z/my-project
echo "=== r74 live QA start $(date +%T) ==="
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. cold-mount path: «تمرین هوشمند ۱۵» → exactly 1 option"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  if (!inp) return JSON.stringify({err: "no palette input"});
  const ph = inp.placeholder || "";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "تمرین هوشمند ۱۵");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return JSON.stringify({placeholderOk: ph.includes("تمرین هوشمند ۱۵"), typed: true});
})()' 2>/dev/null | head -3
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 55)});
})()' 2>/dev/null | head -3

echo "--- B. Enter → smart view, chip «۱۵ سؤال» active + prefill consumed"
agent-browser press Enter >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const chips = [...document.querySelectorAll("button")].filter(b => /سؤال$/.test(b.textContent.trim()));
  const active = chips.filter(b => b.className.includes("border-violet-500"));
  return JSON.stringify({
    heading: [...document.querySelectorAll("h1")].map(h => h.textContent).find(t => t?.includes("تمرین هوشمند")) ?? null,
    chipTexts: chips.map(b => b.textContent.trim()),
    activeChips: active.map(b => b.textContent.trim()),
    prefillLeft: window.sessionStorage.getItem("vision2-smart-prefill")
  });
})()' 2>/dev/null | head -3

echo "--- C. open-view event path: «تمرین هوشمند ۲۰» while smart view open"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "تمرین هوشمند ۲۰");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 55)});
})()' 2>/dev/null | head -3
agent-browser press Enter >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const active = [...document.querySelectorAll("button")].filter(b => /سؤال$/.test(b.textContent.trim()) && b.className.includes("border-violet-500"));
  return JSON.stringify({activeChips: active.map(b => b.textContent.trim())});
})()' 2>/dev/null | head -3

echo "--- D. snap live: «تمرین هوشمند ۱۲» → «۱۰ سؤالی»"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "تمرین هوشمند ۱۲");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 55)});
})()' 2>/dev/null | head -3
agent-browser press Enter >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const active = [...document.querySelectorAll("button")].filter(b => /سؤال$/.test(b.textContent.trim()) && b.className.includes("border-violet-500"));
  return JSON.stringify({activeChips: active.map(b => b.textContent.trim())});
})()' 2>/dev/null | head -3

echo "--- E. ignored-timing fix live: «هدف ۱۵ بدون زمان» → 1 option (was 0)"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "هدف ۱۵ بدون زمان");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length, first: opts[0]?.textContent?.slice(0, 55)});
})()' 2>/dev/null | head -3
agent-browser press Enter >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const raw = window.localStorage.getItem("vision2-study-v1");
  let goal = null;
  try { goal = JSON.parse(raw)?.state?.dailyGoal ?? null; } catch {}
  return JSON.stringify({viewStillSmart: !!document.querySelector("h1"), dailyGoalAfter: goal});
})()' 2>/dev/null | head -3

echo "--- F. bare query: «تمرین هوشمند» → nav-smart top (ناوبری), no param option"
agent-browser press Control+k >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "تمرین هوشمند");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "typed";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const opts = [...document.querySelectorAll(".command-palette [role=option]")];
  return JSON.stringify({count: opts.length,
    first: opts[0]?.textContent?.slice(0, 40),
    hasParametric: opts.some(o => o.textContent.includes("سؤالی"))});
})()' 2>/dev/null | head -3

echo "--- G. «اخیر» revival with empty query"
agent-browser eval '(() => {
  const inp = document.querySelector(".command-palette input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  return "cleared";
})()' 2>/dev/null | head -2
sleep 1
agent-browser eval '(() => {
  const groups = [...document.querySelectorAll(".command-palette [role=listbox] > div")];
  const recent = groups.find(g => g.textContent.includes("اخیر"));
  const labels = recent ? [...recent.querySelectorAll("[role=option]")].map(o => o.textContent.slice(0, 40)) : [];
  return JSON.stringify({recentLabels: labels.slice(0, 5)});
})()' 2>/dev/null | head -3
agent-browser press Escape >/dev/null 2>&1
sleep 1

echo "--- H. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => JSON.stringify({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
}))()' 2>/dev/null | head -3
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- I. fresh console after reload"
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser errors 2>/dev/null | head -5
agent-browser close --all >/dev/null 2>&1
echo "=== r74 live QA end $(date +%T) ==="
