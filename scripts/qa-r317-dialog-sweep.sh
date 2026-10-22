#!/usr/bin/env bash
# ------------------------------------------------------------------
# r317 — پیمایشِ دیالوگها (پیشنهادِ ①ِ r316) + بُعدِ عمودی (پیشنهادِ ②ِ r316)
#   طبقهبندِ افقی همان سهگانهٔ r316 (scroller / truncate / transform)
#   طبقهبندِ عمودیِ تازه: vscroller / clamp / flow = مشروع؛ hidden_clip = کاندیدای بریدهشدنِ نامرئی
#   قالبِ JS در scripts/r317-sweep.js جدا شده — درسِ این راند: آپاستروفِ داخلِ
#   رشتهٔ تکنقلقولِ بش، نقلقولهایِ JS را میبلعد؛ قالبِ چندخطی باید فایل باشد.
# تکفراخوانی (الگویِ r308): open → wait → dispatch → sweep → shot → Escape
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
mkdir -p "$EV"

sweep() { # $1 selector — قالب از فایل، جایگذاری با sed
  local JS
  JS=$(sed "s|__SEL__|$1|" "$DIR/r317-sweep.js")
  agent-browser eval "$JS" 2>&1
}

run_dialog() { # $1 tag $2 event $3 selector $4 shotname
  local tag="$1" ev="$2" sel="$3" shot="$4"
  echo "== $tag =="
  agent-browser eval "window.dispatchEvent(new Event(\"$ev\")); \"$ev\"" >/dev/null 2>&1
  sleep 1.6
  sweep "$sel"
  agent-browser screenshot "$EV/$shot" >/dev/null 2>&1
  agent-browser press Escape >/dev/null 2>&1
  sleep 0.8
  # پسآزمونِ بستن: نودِ swept + لایههایِ radix + شمارشِ data-state=open
  agent-browser eval "JSON.stringify({sel: !!document.querySelector('$sel'), radix_wrappers: document.querySelectorAll('[data-radix-popper-content-wrapper]').length, open_state: document.querySelectorAll('[data-state=open]').length})" 2>&1
}

# نبرد با Escape بسته نمیشود (صفحهٔ کامل است نه مودال) — پس از هر نبرد بارگذاریِ دوباره
reload() { agent-browser open "$BASE" >/dev/null 2>&1; sleep 2; }

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5

echo "########## LIGHT 390 ##########"
run_dialog "weekly-report"  "open-report"           '.report-paper' r317-report-390.png
run_dialog "official"       "open-official-report"  '[aria-label="گزارش رسمی پیشرفت درسی"]' r317-official-390.png
run_dialog "profile"        "open-profile"          '[aria-label^="پروفایل من"]' r317-profile-390.png
run_dialog "settings"       "open-settings"         '[aria-label="تنظیمات"]' r317-settings-390.png
run_dialog "shortcuts"      "open-shortcuts"        '.shortcuts-dialog' r317-shortcuts-390.png
run_dialog "palette"        "open-command-palette"  '.command-palette' r317-palette-390.png
run_dialog "duel"           "open-duel"             '.duel-card' r317-duel-390.png
reload

echo "########## DARK 390 ##########"
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-on"' >/dev/null 2>&1
sleep 0.6
run_dialog "weekly-report"  "open-report"           '.report-paper' r317-report-390-dark.png
run_dialog "official"       "open-official-report"  '[aria-label="گزارش رسمی پیشرفت درسی"]' r317-official-390-dark.png
run_dialog "palette"        "open-command-palette"  '.command-palette' r317-palette-390-dark.png
run_dialog "duel"           "open-duel"             '.duel-card' r317-duel-390-dark.png
reload
agent-browser eval 'document.documentElement.classList.add("dark"); "dark-kept"' >/dev/null 2>&1
sleep 0.6
agent-browser eval 'document.documentElement.classList.remove("dark"); "dark-off"' >/dev/null 2>&1

echo "########## DESKTOP 1280 ##########"
agent-browser set viewport 1280 900 >/dev/null 2>&1
sleep 0.8
run_dialog "weekly-report"  "open-report"           '.report-paper' r317-report-1280.png
run_dialog "official"       "open-official-report"  '[aria-label="گزارش رسمی پیشرفت درسی"]' r317-official-1280.png
run_dialog "duel"           "open-duel"             '.duel-card' r317-duel-1280.png
reload

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
