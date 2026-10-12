#!/usr/bin/env bash
# Direct element probes for every task-64 patched surface (dark mode).
# For each: navigate best-effort, find the element BY CLASS, report the
# computed gradient stops + a PASS/FAIL luminance verdict on every stop.
set -e
BASE="http://127.0.0.1:3000"
agent-browser close >/dev/null 2>&1 || true

agent-browser open "$BASE" >/dev/null
sleep 3
agent-browser eval 'localStorage.clear(); localStorage.setItem("theme","dark"); "ok"' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("رد کردن")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  obj.state.mistakes = { "1:q1": 2 };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 5

# probe helper: pass a CSS selector; returns computed bg-image + verdict
agent-browser eval 'window.PROBE = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return JSON.stringify({ found: false });
  const bi = getComputedStyle(el).backgroundImage;
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
  const verdicts = stopsOf(bi).map((s) => Math.round(lum(s) * 100) / 100);
  const pass = verdicts.every((v) => v <= 0.72);
  return JSON.stringify({ found: true, pass, stops: verdicts, bi: bi.slice(0, 110) });
}' >/dev/null

probe() {
  echo "$1 => $(agent-browser eval "window.PROBE('$2')" 2>/dev/null | head -c 320)"
}

# 1) onboard-paper (fresh dialog behind current session? open dialog may persist)
probe "onboard-paper" ".onboard-paper"

# 2) home: listen-hero + name-cta
probe "listen-hero" ".listen-hero"
probe "name-cta" ".name-cta"

# 3) lesson-1 tests tab: mistakes-cta (seed 1 mistake in lesson 1)
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim().startsWith("درس اول")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 2
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>["تست‌ها","آزمون درس"].some(t=>x.textContent.includes(t))); if(b){b.click();return "ok";} return "miss:"+[...document.querySelectorAll("[role=tab],button")].map(x=>x.textContent.trim()).filter(t=>t&&t.length<12).slice(0,14).join("|");})()'
sleep 1.5
probe "mistakes-cta (lesson)" ".lesson-mistakes-cta"

# 4) rush view: rush-hero + rush-board strips
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("شروع چالش")||x.textContent.includes("برق‌آسا")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 2
probe "rush-hero" ".rush-hero"
probe "rush-board-strip" ".rush-board-strip"
probe "rush-board-hint" ".rush-board-hint"

# 5) exam view: exam-dict-cta + dict-setup dialog
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("آزمون جامع")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 2
probe "exam-dict-cta" ".exam-dict-cta"
probe "mistakes-cta (exam)" ".mistakes-cta"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ واژگان کنکور")); if(b){b.click();return "ok";} return "miss";})()' >/dev/null
sleep 1.5
probe "dict-setup (exam dialog)" ".dict-setup"

agent-browser close >/dev/null 2>&1
echo "PROBE-DONE"
