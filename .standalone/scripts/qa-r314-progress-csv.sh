#!/usr/bin/env bash
# ------------------------------------------------------------------
# r314 — QAِ تک‌فراخوانی (الگویِ r308): کارنامه → باندِ برچسب با زبانِ
# تازهٔ ۳۵روزه (۱۰ ستون) + دانلودِ واقعیِ CSVِ ۳۵روزه از دکمهٔ خودش →
# سنجشِ سرستونِ ۱۰فیلدی و خانههایِ تهیِ صادق → اسکرین‌شات → close.
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
mkdir -p "$EV"

echo "== open =="
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser wait "[aria-label=\"دستور رنگ‌های گزارش\"]" >/dev/null 2>&1 || true
sleep 1

echo "== open report =="
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' 2>&1
sleep 2

echo "== band wording (35-day now 10 columns) =="
agent-browser eval '(() => {
  const band = document.querySelector("[aria-label=\"ستونهایِ خروجیهایِ اکسل\"]");
  if (!band) return "band=MISSING";
  const spans = Array.from(band.querySelectorAll("span")).map((s) => s.textContent).filter(Boolean);
  return JSON.stringify({ aria_eq: band.getAttribute("aria-label") === band.getAttribute("title"), spans: spans.slice(0, 4) });
})()' 2>&1

echo "== 35-day button tooltip =="
agent-browser eval '(() => {
  const b = document.querySelector("[title*=\"۳۵روزهٔ فعالیت\"]");
  return JSON.stringify({ title: b ? b.getAttribute("title") : "MISSING" });
})()' 2>&1

echo "== live 35-day CSV from the real button =="
agent-browser download "[aria-label=\"دانلود جدول CSV پیشرفت\"]" "$EV/r314-progress.csv" 2>&1
sleep 1
if [ -f "$EV/r314-progress.csv" ]; then
  echo "csv-header: $(head -1 "$EV/r314-progress.csv" | tr -d '\r')"
  echo "csv-cols: $(head -1 "$EV/r314-progress.csv" | tr -d '\r' | awk -F, '{print NF}')"
  echo "csv-rows: $(( $(wc -l < "$EV/r314-progress.csv") - 1 ))"
  echo "row-7 : $(sed -n '8p' "$EV/r314-progress.csv" | tr -d '\r')"
  echo "row-8 : $(sed -n '9p' "$EV/r314-progress.csv" | tr -d '\r')"
  echo "row-14: $(sed -n '15p' "$EV/r314-progress.csv" | tr -d '\r')"
  echo "row-15: $(sed -n '16p' "$EV/r314-progress.csv" | tr -d '\r')"
  echo "csv-last: $(tail -1 "$EV/r314-progress.csv" | tr -d '\r')"
else
  echo "csv=MISSING (download gate)"
fi

echo "== toast of 35-day save =="
agent-browser eval '(() => document.body.innerText.includes("جدول CSV ذخیره شد") ? "toast=yes" : "toast=not-found")()' 2>&1

echo "== screenshot of the band =="
agent-browser eval '(() => {
  const band = document.querySelector("[aria-label=\"ستونهایِ خروجیهایِ اکسل\"]");
  if (band) band.scrollIntoView({ block: "center" });
  return band ? "scrolled" : "gone";
})()' 2>&1
sleep 1
agent-browser screenshot "$EV/r314-csv-hint-band.png" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
