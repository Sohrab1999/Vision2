#!/usr/bin/env bash
# ------------------------------------------------------------------
# r316 — sweepِ نهایی با طبقه‌بندیِ سه‌گانهٔ مشروع:
#   ① legit_scroller — جدِ overflow-x:auto/scroll (جدولِ رسمیِ min-w)
#   ② legit_truncate — خودش text-overflow:ellipsis دارد (عنوانِ سطرِ ماتریس)
#   ③ legit_transform — فرزندِ چرخیده bbox پهن‌تری دارد (مهرِ rotate-6ِ سربرگ)
# offenderِ واقعی = sw > cw+1 و هیچ‌کدام از سه.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence

SWEEP='(() => {
  const paper = document.querySelector(".report-paper");
  if (!paper) return JSON.stringify({ paper: "MISSING" });
  const legitScroller = (el) => {
    for (let n = el; n && n !== paper.parentElement; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };
  const legitTruncate = (el) => {
    const cs = getComputedStyle(el);
    return cs.textOverflow === "ellipsis" && cs.overflowX === "hidden";
  };
  const legitTransform = (el) => {
    for (const d of el.querySelectorAll("*")) {
      const cs = getComputedStyle(d);
      // Tailwind v4: rotate-6 از ویژگیِ مستقلِ rotate میآید نه transform
      const t = cs.transform !== "none" || (cs.rotate && cs.rotate !== "none");
      if (t) {
        const bb = d.getBoundingClientRect().width;
        if (bb > d.offsetWidth + 1) return true;
      }
    }
    return false;
  };
  const all = paper.querySelectorAll("*");
  const offenders = [], legit = [];
  for (const el of all) {
    const sw = el.scrollWidth, cw = el.clientWidth;
    if (sw > cw + 1 && cw > 0) {
      let ancestorOffender = false;
      for (let n = el.parentElement; n && n !== paper; n = n.parentElement) {
        if (n.scrollWidth > n.clientWidth + 1) { ancestorOffender = true; break; }
      }
      if (ancestorOffender) continue;
      const item = { tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 50), sw, cw, over: sw - cw };
      if (legitScroller(el)) { item.why = "scroller"; legit.push(item); }
      else if (legitTruncate(el)) { item.why = "truncate"; legit.push(item); }
      else if (legitTransform(el)) { item.why = "transform"; legit.push(item); }
      else offenders.push(item);
    }
  }
  return JSON.stringify({ real_bugs: offenders.length, offenders: offenders.slice(0, 6), legit_count: legit.length });
})()'

echo "== open report =="
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2

echo "-- FINAL sweep LIGHT 390 --"
agent-browser eval "$SWEEP" 2>&1
echo "-- FINAL sweep DARK 390 --"
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-on"' >/dev/null 2>&1
sleep 1
agent-browser eval "$SWEEP" 2>&1
agent-browser eval 'document.documentElement.classList.remove("dark"); "dark-off"' >/dev/null 2>&1
echo "-- FINAL sweep 1280 --"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
agent-browser eval "$SWEEP" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
