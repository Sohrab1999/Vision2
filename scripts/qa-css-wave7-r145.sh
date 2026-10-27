#!/bin/bash
# Task 145 QA — CSS wave 7 (rush dark gradients → duel/rush.css) live probe. Single session.
# A. dark hero: computed bg = the r84 stops (now served by the owner file), border-color stays live
# B. CSSOM single-strike: .dark .rush-hero/.rush-done ×1 each (was 2×2 — the cross-file duplicate is retired); strip/hint ×1
# C. light regression: without .dark the hero keeps the utility gradient (dark rule must not leak)
# D. mobile 390 OV on the rush view   E. console 0   F. no-seed note + close
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. dark ON → rush view (KeyC) → hero computed styles"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
agent-browser eval '(() => { window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC", key: "c" })); return "KEYC"; })()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const h = document.querySelector(".rush-hero");
  if (!h) return JSON.stringify({ heroPresent: false });
  const cs = getComputedStyle(h);
  return JSON.stringify({
    heroPresent: true,
    bg: cs.backgroundImage.slice(0, 140),
    hasR84Stops: cs.backgroundImage.includes("rgba(69, 48, 12, 0.5)") && cs.backgroundImage.includes("rgba(24, 21, 18, 0.92)"),
    border: cs.borderColor,
    view: (location.href.match(/rush|study/) || ["?"])[0],
  });
})()' 2>/dev/null

echo "--- B. CSSOM single-strike counts"
agent-browser eval '
(() => {
  const count = (sel) => {
    let n = 0;
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules) {
        if (r.selectorText && r.selectorText.split(",").map(s => s.trim()).includes(sel)) n += 1;
      }
    }
    return n;
  };
  return JSON.stringify({
    hero: count(".dark .rush-hero"),
    done: count(".dark .rush-done"),
    strip: count(".dark .rush-board-strip"),
    hint: count(".dark .rush-board-hint"),
  });
})()' 2>/dev/null

echo "--- C. light regression (dark off → utility gradient, no dark leak)"
agent-browser eval '
(() => {
  document.documentElement.classList.remove("dark");
  const h = document.querySelector(".rush-hero");
  if (!h) return JSON.stringify({ heroPresent: false });
  const bg = getComputedStyle(h).backgroundImage;
  return JSON.stringify({
    heroPresent: true,
    lightBgHead: bg.slice(0, 60),
    darkLeak: bg.includes("rgba(69, 48, 12, 0.5)"),
  });
})()' 2>/dev/null

echo "--- D. mobile 390 overflow (rush view)"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- F. no seed was written (rush view is public) — close"
agent-browser close --all >/dev/null 2>&1
echo "QA145-DONE"
