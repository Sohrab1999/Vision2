#!/usr/bin/env bash
# r316 — پایشِ دوم: بچههایِ سربرگِ رسمی (کدام فرزند ۳px میخواهد؟) +
# اسکرین‌شاتِ هرت‌مپ در ۳۹۰ برایِ داوریِ چشمیِ خونِ سرستونها
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2

echo "== letterhead children widths =="
agent-browser eval '(() => {
  const row = document.querySelector(".report-band .flex.items-start.justify-between");
  if (!row) return "row=MISSING";
  return JSON.stringify(Array.from(row.children).map((c) => ({
    tag: c.tagName.toLowerCase(),
    cls: (c.className || "").toString().slice(0, 40),
    sw: c.scrollWidth, w: Math.round(c.getBoundingClientRect().width),
    minw: c.style.minWidth || "unset"
  })));
})()' 2>&1

echo "== letterhead row metrics =="
agent-browser eval '(() => {
  const row = document.querySelector(".report-band .flex.items-start.justify-between");
  const cs = getComputedStyle(row);
  return JSON.stringify({ sw: row.scrollWidth, cw: row.clientWidth, gap: cs.gap, pad: cs.padding });
})()' 2>&1

echo "== scroll to heatmap and screenshot =="
agent-browser eval '(() => {
  const t = document.querySelector("[role=\"table\"][aria-label*=\"حرارت\"]") || Array.from(document.querySelectorAll("div")).find((d) => d.textContent?.includes("ماتریسِ حرارت"));
  if (t) t.scrollIntoView({ block: "center" });
  return t ? "scrolled" : "gone";
})()' 2>&1
sleep 1
agent-browser screenshot "$EV/r316-heatmap-390-light.png" 2>&1

echo "== heatmap header cells detail =="
agent-browser eval '(() => {
  const heads = Array.from(document.querySelectorAll("[role=\"columnheader\"]"));
  return JSON.stringify(heads.map((h) => ({ t: h.textContent.trim(), sw: h.scrollWidth, w: Math.round(h.getBoundingClientRect().width) })));
})()' 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
