#!/usr/bin/env bash
# Dark-mode gradient leak scan (task 64) — single browser session.
# Toggles dark, walks the main views, and flags every element whose
# computed linear-gradient carries a LIGHT stop (rgb luminance > 0.72 or
# lab L > 72) — tinted surface gradients that leak light in dark mode.
# Vivid stripes (to-lime-400 etc.) may intentionally flag; triaged after.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/g64.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/g64.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/g64.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null; sleep 1
fi

# seed returning marker so gated sections render, then reload
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  obj.state.starredWords = ["1:ability"];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 5

# dark ON via the app toggle (persists via next-themes)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "dark-ok";} return "dark-miss";})()'
sleep 1

# scanner held in the page (regex-free: shell escaping mangles backslashes)
agent-browser eval 'window.SCAN = () => {
  function stopsOf(bi) {
    const out = [];
    for (let i = 0; i < bi.length; i++) {
      const rest = bi.slice(i);
      if (rest.startsWith("rgba(") || rest.startsWith("rgb(") || rest.startsWith("lab(")) {
        const end = rest.indexOf(")");
        if (end < 0) break;
        out.push(rest.slice(0, end + 1));
        i += end;
      }
    }
    return out;
  }
  function lum(c) {
    const nums = c.replace(/[^0-9.]/g, " ").trim().split(/\s+/).map(Number);
    if (c.startsWith("lab(")) return nums[0] / 100;
    const a = nums.length > 3 ? nums[3] : 1;
    if (a < 0.15) return 0;
    return (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / 255;
  }
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!(el instanceof HTMLElement) || !el.offsetParent) continue;
    if (el.offsetWidth < 48 || el.offsetHeight < 18) continue;
    const bi = getComputedStyle(el).backgroundImage;
    if (!bi || bi.indexOf("linear-gradient") < 0) continue;
    const light = stopsOf(bi).filter((s) => lum(s) > 0.72);
    if (!light.length) continue;
    const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 70) : "";
    out.push({ tag: el.tagName + "." + cls, text: (el.textContent || "").trim().slice(0, 26), stops: bi.slice(0, 150) });
    if (out.length >= 14) break;
  }
  return JSON.stringify({ leaks: out.length, items: out });
}'

scan_view() {
  echo "--- VIEW: $1 ---"
  agent-browser eval "window.SCAN()" 2>/dev/null | head -c 2600
  echo ""
}

nav_click() {
  agent-browser eval "(()=>{
    const b=[...document.querySelectorAll('button, a')].find(x=>x.textContent.trim().includes('$1'));
    if(b){b.click();return 'nav-ok';} return 'nav-miss:$1';
  })()" >/dev/null
  sleep 2
}

scan_view "home"
nav_click "دیکشنری"; scan_view "dictionary"
nav_click "آزمون جامع"; scan_view "exam"
nav_click "ضمیمه"; scan_view "appendix"
nav_click "درس اول"; scan_view "lesson-1"
nav_click "واژه‌های من"; scan_view "my-words"
nav_click "چالش برق‌آسا"; scan_view "rush"
nav_click "مرور سریع"; scan_view "review"
nav_click "گوشهٔ کنکور"; scan_view "konkur"

agent-browser close >/dev/null 2>&1
echo "SCAN-DONE"
