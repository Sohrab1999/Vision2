#!/bin/bash
# Task 131 QA — the per-duel display name (SEC-5, display-only) — single session.
# A. seed profile «آزمون‌گر» + onboarded
# B. setup surface: input present, maxLength=24, placeholder «پیش‌فرض: آزمون‌گر»,
#    honest footnote
# C. type an alias → create room → WAITING screen shows THE ALIAS (server echo —
#    the name flowed duel:create → 3003 → duel:state end-to-end)
# D. profile untouched in localStorage (display-only, never identity)
# E. «لغو و بازگشت» → back to setup, the draft persists in-session
# F. mobile 390 overflow = 0; console errors = 0; strip seed.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed profile + onboarded (backup kept)"
agent-browser eval '
(() => {
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r131-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, userName: "آزمون‌گر", onboarded: true, avatarColor: "emerald",
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED|userName=آزمون‌گر";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- B. duel setup surface — display-name field contract"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const card = btns.find(b => (b.textContent || "").includes("نبرد دودنفره"));
  if (!card) return "CARD-MISSING";
  card.click(); return "CARD-CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const input = document.querySelector("input[aria-label=\"نام نمایشی در این نبرد\"]");
  if (!input) return "NAME-INPUT-MISSING";
  const t = document.body.textContent || "";
  return JSON.stringify({
    online: /متصل به سرور نبرد/.test(t) ? "OK" : "CONNECTING",
    maxLength: input.getAttribute("maxlength"),
    placeholder: input.getAttribute("placeholder"),
    value: input.value,
    footnote: /فقط برای همین نبرد نشان داده می‌شود/.test(t) ? "OK" : "MISSING",
  });
})()' 2>/dev/null

echo "--- C. type alias → create room → server echo shows the ALIAS"
agent-browser eval '
(() => {
  const input = document.querySelector("input[aria-label=\"نام نمایشی در این نبرد\"]");
  if (!input) return "INPUT-MISSING";
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "شیرِ کدنویس");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return "ALIAS-TYPED";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").includes("ساخت اتاق نبرد"));
  if (!b) return "CREATE-MISSING";
  b.click(); return "CREATE-CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '
(() => {
  const t = document.body.textContent || "";
  return JSON.stringify({
    waiting: /منتظر پیوستن حریف/.test(t) ? "OK" : "PHASE-MISS",
    aliasEchoed: t.includes("شیرِ کدنویس") ? "OK|SERVER-ECHO" : "ALIAS-MISSING",
    roomCode: /کد اتاق|کدِ اتاق/.test(t) ? "PRESENT" : "CHECK",
  });
})()' 2>/dev/null

echo "--- D. profile untouched (display-only honesty)"
agent-browser eval '
(() => {
  const obj = JSON.parse(localStorage.getItem("vision2-study-v1") || "{}");
  return JSON.stringify({ profileName: (obj.state || {}).userName || "EMPTY" });
})()' 2>/dev/null

echo "--- E. leave room → draft persists in-session"
agent-browser eval '(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").includes("لغو و بازگشت"));
  if (!b) return "LEAVE-MISSING";
  b.click(); return "LEAVE-CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const input = document.querySelector("input[aria-label=\"نام نمایشی در این نبرد\"]");
  return JSON.stringify({
    backToSetup: input ? "OK" : "SETUP-MISS",
    draftKept: input ? input.value : "-",
  });
})()' 2>/dev/null

echo "--- F. mobile 390 overflow (duel setup)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const d = document.documentElement;
  return "MOBILE390|OVERFLOW|" + (d.scrollWidth - d.clientWidth) + "|W|" + d.clientWidth;
})()' 2>/dev/null

echo "--- G. console errors (whole session)"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"

echo "--- H. strip seed (restore backup)"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r131-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak !== null) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r131-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "QA131_END"
