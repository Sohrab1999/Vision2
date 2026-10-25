#!/usr/bin/env bash
# ------------------------------------------------------------------
# r316 — پیمایشِ سیستمیِ سرریزِ پنهان (درسِ r315: هدرِ هفته‌نامه ۱۱px
# سرریزِ نامرئی داشت که هیچ QA چشمی ندیده بود). منطق:
#   · همهٔ عناصرِ داخلِ .report-paper سنجیده میشوند: sw در برابرِ cw
#   · offender = sw > cw + 1
#   · طبقه‌بندی: اگر خودش یا جدش overflow-x:auto/scroll دارد «اسکرولِ
#     مشروع» است؛ وگرنه «سرریزِ پنهان» — یا بریدهٔ overflow-hiddenِ
#     paper یا بلعیده‌شده در پدینگ
#   · دو فاز: روشن (۳۹۰) و تاریک (۳۹۰) + دسکتاپِ روشن برایِ مقایسه
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
mkdir -p "$EV"

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
  const seen = new Set();
  const offenders = [];
  for (const el of all) {
    const sw = el.scrollWidth, cw = el.clientWidth;
    if (sw > cw + 1 && cw > 0) {
      // فقط بالاترینِ offender — فرزندانِ یک والدِ سرریزشده نویزند
      let ancestorOffender = false;
      for (let n = el.parentElement; n && n !== paper; n = n.parentElement) {
        if (n.scrollWidth > n.clientWidth + 1) { ancestorOffender = true; break; }
      }
      if (ancestorOffender) continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 70),
        sw, cw, over: sw - cw,
        legit_scroller: isScroller(el)
      });
    }
  }
  return JSON.stringify({ count: offenders.length, offenders: offenders.slice(0, 12) });
})()'

run_sweep () {
  agent-browser eval "$SWEEP" 2>&1
}

echo "== open report (light 390) =="
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2

echo "-- sweep LIGHT 390 --"
run_sweep

echo ""
echo "-- sweep DARK 390 (class toggle on <html>) --"
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-on"' >/dev/null 2>&1
sleep 1
run_sweep
agent-browser eval 'document.documentElement.classList.remove("dark"); "dark-off"' >/dev/null 2>&1

echo ""
echo "-- sweep LIGHT 1280 (baseline) --"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
run_sweep

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
