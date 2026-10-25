#!/usr/bin/env bash
# ------------------------------------------------------------------
# r315 — QAِ تک‌فراخوانی (الگویِ r308/r313): دو فاز بر سرِ چیپِ «فعالیتِ امروز»:
#   فازِ صفر: seedِ نام‌دار بی‌بازی → چیپِ «۰ فعالیت امروز» خنثی (صفرِ صادق)
#   فازِ فعال: seed + یک دستِ واقعیِ برق‌آسا → چیپِ زمردی و عددش === خانهٔ
#     امروزِ نوار (قراردادِ سنجش — درسِ r309، این‌بار زیرِ خودِ نوار)
#   + سنجشِ هدر در ۳۹۰px: سرریزِ پنهانِ ۱۱pxِ قبل از تغییر باید رفته باشد
#   + اسکرین‌شاتِ موبایل و دسکتاپ
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
mkdir -p "$EV"

MEASURE='(() => {
  const chip = Array.from(document.querySelectorAll("span")).find((s) => /فعالیت امروز$/.test((s.textContent || "").trim()) && s.className.includes("rounded-full"));
  if (!chip) return JSON.stringify({ chip: "MISSING" });
  const row = chip.parentElement;
  const bar = Array.from(document.querySelectorAll(".ring-emerald-500\\/60")).find((b) => b.getAttribute("title")?.includes("فعالیت"));
  const title = Array.from(document.querySelectorAll("div")).find((d) => d.className.includes("justify-between") && d.textContent.includes("هفته‌نامهٔ پیشرفت") && d.querySelector("button"));
  const cluster = title ? title.querySelector(":scope > div:last-child") : null;
  const num = (s) => (s.match(/[۰-۹]+/) || ["?"])[0];
  const faToEn = (s) => s.replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));
  return JSON.stringify({
    chip_text: chip.textContent.trim(),
    chip_zero_tone: chip.className.includes("bg-stone-100"),
    chip_active_tone: chip.className.includes("bg-emerald-50"),
    chip_num: faToEn(num(chip.textContent)),
    bar_title: bar ? bar.getAttribute("title") : "BAR-MISSING",
    bar_num: bar ? faToEn(num(bar.getAttribute("title") || "")) : "?",
    row_children: row ? row.children.length : 0,
    chip_is_last: row ? row.lastElementChild === chip : false,
    header_overflow: title ? title.scrollWidth > title.clientWidth : null,
    header_wrapped: title && cluster ? cluster.getBoundingClientRect().top > title.getBoundingClientRect().top + 4 : null
  });
})()'

echo "== phase A: fresh named seed (no play) → honest zero =="
bash scripts/qa-fresh-session.sh --name "آرش ص" 2>&1 | tail -2
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2
echo "-- zero-phase measurements (390px) --"
agent-browser eval "$MEASURE" 2>&1

echo ""
echo "== phase B: seed + real rush hand → active chip =="
bash scripts/qa-fresh-session.sh --name "آرش ط" --play 2>&1 | tail -2
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser eval 'window.dispatchEvent(new Event("open-report")); "dispatched"' >/dev/null 2>&1
sleep 2
echo "-- active-phase measurements (390px) --"
agent-browser eval "$MEASURE" 2>&1

echo ""
echo "== mobile screenshot (390px, chip under the strip) =="
agent-browser eval '(() => {
  const chip = Array.from(document.querySelectorAll("span")).find((s) => /فعالیت امروز$/.test((s.textContent || "").trim()));
  if (chip) chip.scrollIntoView({ block: "center" });
  return chip ? "scrolled" : "gone";
})()' 2>&1
sleep 1
agent-browser screenshot "$EV/r315-today-chip-390.png" 2>&1

echo "== desktop sanity (1280px: header stays one line) =="
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const title = Array.from(document.querySelectorAll("div")).find((d) => d.className.includes("justify-between") && d.textContent.includes("هفته‌نامهٔ پیشرفت") && d.querySelector("button"));
  const cluster = title ? title.querySelector(":scope > div:last-child") : null;
  return JSON.stringify({
    header_overflow: title ? title.scrollWidth > title.clientWidth : null,
    one_line: title && cluster ? cluster.getBoundingClientRect().top === title.getBoundingClientRect().top : null
  });
})()' 2>&1
agent-browser screenshot "$EV/r315-today-chip-1280.png" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
