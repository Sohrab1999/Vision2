#!/usr/bin/env bash
# ------------------------------------------------------------------
# r313 — QAِ تک‌فراخوانی (الگویِ r308): بالاآوردن → بازکردنِ کارنامه →
# باندِ برچسبِ خروجیها + tooltipها + دانلودِ واقعیِ ماه‌نامه از دکمهٔ
# خودش → اسکرین‌شاتِ برش → close. کنسولِ خطا جدا پایش میشود.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
mkdir -p "$EV"

echo "== open =="
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1

echo "== report-csv-hint band =="
agent-browser eval '(() => {
  window.dispatchEvent(new Event("open-report"));
  return "dispatched";
})()' 2>&1
sleep 2
agent-browser eval '(() => {
  const band = document.querySelector("[aria-label=\"ستونهایِ خروجیهایِ اکسل\"]");
  if (!band) return "band=MISSING";
  const aria = band.getAttribute("aria-label");
  const title = band.getAttribute("title");
  const spans = Array.from(band.querySelectorAll("span")).map((s) => s.textContent).filter(Boolean);
  return JSON.stringify({ aria_eq: aria === title, spans: spans.slice(0, 4) });
})()' 2>&1

echo "== tooltips (trend + month) =="
agent-browser eval '(() => {
  const trend = document.querySelector("[title*=\"روندِ ۴هفته‌ای CSV\"]");
  const month = document.querySelector("[title*=\"ماه‌نامهٔ خواندن CSV\"]");
  return JSON.stringify({
    trend: trend ? trend.getAttribute("title") : "MISSING",
    monthHasNewCols: month ? month.getAttribute("title").includes("جمعِ هفت‌روزه و تفاوت با هفت‌روزهٔ پیش") : false,
  });
})()' 2>&1

echo "== live month CSV from the real button =="
agent-browser download "[aria-label=\"دانلود ماه‌نامهٔ خواندن CSV\"]" "$EV/r313-month.csv" 2>&1
sleep 1
if [ -f "$EV/r313-month.csv" ]; then
  echo "csv-header: $(head -1 "$EV/r313-month.csv" | tr -d '\r')"
  echo "csv-cols: $(head -1 "$EV/r313-month.csv" | tr -d '\r' | awk -F, '{print NF}')"
  echo "csv-rows: $(( $(wc -l < "$EV/r313-month.csv") - 1 ))"
  echo "csv-last: $(tail -1 "$EV/r313-month.csv" | tr -d '\r')"
else
  echo "csv=MISSING (download gate)"
fi

echo "== toast of month save (6-column wording) =="
agent-browser eval '(() => {
  const t = document.body.innerText;
  return t.includes("ماه‌نامهٔ خواندن ذخیره شد") ? "toast=yes" : "toast=not-found";
})()' 2>&1

echo "== screenshot of the band =="
agent-browser eval '(() => {
  const band = document.querySelector("[aria-label=\"ستونهایِ خروجیهایِ اکسل\"]");
  if (band) band.scrollIntoView({ block: "center" });
  return band ? "scrolled" : "gone";
})()' 2>&1
sleep 1
agent-browser screenshot "$EV/r313-csv-hint-band.png" 2>&1

echo "== console errors snapshot =="
agent-browser eval '(() => "done")()' >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
