#!/usr/bin/env bash
# Post-fix dark gradient verification (task 64) — single browser session.
# Each view: navigate by button text, REQUIRE a landmark (proves the view
# actually switched — the first scan's weak spot), then run the leak scan.
# Also probes: exam dictation dialog (dict-setup), onboarding (fresh dark
# session via theme=dark in localStorage).
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true

# ---- fresh DARK session: onboarding renders dark via next-themes storage ----
agent-browser open "$BASE" >/dev/null
sleep 3
agent-browser eval 'localStorage.clear(); localStorage.setItem("theme","dark"); "theme-set"' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 5

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
    out.push({ tag: el.tagName + "." + cls, text: (el.textContent || "").trim().slice(0, 26), stops: bi.slice(0, 130) });
    if (out.length >= 12) break;
  }
  return JSON.stringify({ leaks: out.length, items: out });
}' >/dev/null

scan_view() {
  local label="$1" nav="$2" landmark="$3"
  if [ "$nav" != "-" ]; then
    agent-browser eval "(()=>{const b=[...document.querySelectorAll('button, a')].find(x=>x.textContent.trim().includes('$nav')); if(b){b.click();return 'ok';} return 'miss';})()" >/dev/null
    sleep 2
  fi
  local ok
  ok=$(agent-browser eval "(()=>{return document.body.textContent.includes('$landmark') ? 'landmark-ok' : 'landmark-MISS';})()" 2>/dev/null | tr -d '"')
  local res
  res=$(agent-browser eval "window.SCAN()" 2>/dev/null | head -c 1800)
  echo "--- $label [$ok] ---"
  echo "$res"
}

scan_view "onboarding-dark"  "-"               "به وبکتاب"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("رد کردن")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 5

scan_view "home"             "-"               "واژه‌های خطرناک من"
scan_view "dictionary"       "دیکشنری"         "واژه"
scan_view "exam"             "آزمون جامع"      "آزمون جامع واژگان"
scan_view "appendix"         "ضمیمه"           "فعل"
scan_view "lesson-1"         "درس اول"         "واژگان"
scan_view "my-words"         "واژه‌های من"      "واژه‌های من"

# exam dictation dialog → dict-setup screen
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکشنری")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("آزمون جامع")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1.5
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ واژگان کنکور")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1.5
echo "--- dictation-setup-dialog ---"
agent-browser eval '(()=>{
  const d = document.querySelector(".dict-setup");
  if (!d) return JSON.stringify({ dialog: false });
  const bi = getComputedStyle(d).backgroundImage;
  const input = document.querySelector("[role=dialog] input[dir=ltr]");
  return JSON.stringify({ dialog: true, setupStops: bi.slice(0,110), inputInk: input ? getComputedStyle(input).color : null });
})()'
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="بازگشت"); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 0.5

agent-browser close >/dev/null 2>&1
echo "VERIFY-DONE"
