#!/usr/bin/env bash
# ------------------------------------------------------------------
# r316 — اثباتِ پس از اصلاح: sweepِ دوباره باید صفرِ offender بدهد
# (سربرگِ gap-2 و گریدِ کپشده) + اسکرین‌شاتِ هرت‌مپِ خوانا در ۳۹۰.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence

SWEEP='(() => {
  const paper = document.querySelector(".report-paper");
  if (!paper) return JSON.stringify({ paper: "MISSING" });
  const isScroller = (el) => {
    for (let n = el; n && n !== paper.parentElement; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };
  const all = paper.querySelectorAll("*");
  const offenders = [];
  for (const el of all) {
    const sw = el.scrollWidth, cw = el.clientWidth;
    if (sw > cw + 1 && cw > 0) {
      let ancestorOffender = false;
      for (let n = el.parentElement; n && n !== paper; n = n.parentElement) {
        if (n.scrollWidth > n.clientWidth + 1) { ancestorOffender = true; break; }
      }
      if (ancestorOffender) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 60),
        sw, cw, over: sw - cw,
        legit_scroller: isScroller(el)
      });
    }
  }
  return JSON.stringify({ count: offenders.length, offenders: offenders.slice(0, 8) });
})()'

echo "== open report (390 light) =="
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2

echo "-- sweep LIGHT 390 (post-fix) --"
agent-browser eval "$SWEEP" 2>&1

echo ""
echo "-- sweep DARK 390 (post-fix) --"
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-on"' >/dev/null 2>&1
sleep 1
agent-browser eval "$SWEEP" 2>&1
agent-browser eval 'document.documentElement.classList.remove("dark"); "dark-off"' >/dev/null 2>&1

echo ""
echo "-- heatmap header cells (post-fix) --"
agent-browser eval '(() => {
  const heads = Array.from(document.querySelectorAll("[role=\"columnheader\"]"));
  return JSON.stringify(heads.map((h) => ({ t: h.textContent.trim(), sw: h.scrollWidth, w: Math.round(h.getBoundingClientRect().width) })));
})()' 2>&1

echo ""
echo "-- letterhead row (post-fix) --"
agent-browser eval '(() => {
  const row = document.querySelector(".report-band .flex.items-start.justify-between");
  return JSON.stringify({ sw: row.scrollWidth, cw: row.clientWidth, overflow: row.scrollWidth > row.clientWidth });
})()' 2>&1

echo ""
echo "-- screenshots: heatmap readable + letterhead --"
agent-browser eval '(() => {
  const t = document.querySelector("[role=\"table\"][aria-label*=\"حرارت\"]");
  if (t) t.scrollIntoView({ block: "center" });
  return t ? "scrolled" : "gone";
})()' 2>&1
sleep 1
agent-browser screenshot "$EV/r316-heatmap-390-fixed.png" 2>&1

echo "-- sweep at 1280 (desktop unchanged) --"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
agent-browser eval "$SWEEP" 2>&1
agent-browser screenshot "$EV/r316-heatmap-1280.png" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
