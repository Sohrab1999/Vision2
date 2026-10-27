#!/bin/bash
# Task 142 QA — «زنجیرهٔ مأموریت‌ها در هفته‌نامه» live probe. Single session.
# A. seed 3 perfect days → digest band: streak line = 2nd highlight, exact text
# B. seed 9 days → delta «۷ حلقه» نه ۹ (عددِ پنجره، نه کلِ زنجیره)
# C. today 4/5, chain alive via yesterday → line «به ۲ روز رسید — ۲ حلقه»
# D. single perfect day → honest absence (no line)
# E. mobile 390 OV   F. console 0   G. strip seed (backup/restore)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

OPEN_REPORT='window.dispatchEvent(new CustomEvent("open-report")); "DISPATCHED";'

PROBE='
(() => {
  const band = document.querySelector(".report-digest");
  if (!band) return JSON.stringify({ digestPresent: false });
  const lis = [...band.querySelectorAll("ul li")];
  const idx = lis.findIndex(li => (li.textContent||"").includes("زنجیرهٔ مأموریت‌ها به"));
  return JSON.stringify({
    digestPresent: true,
    hasLine: idx >= 0,
    liIndex: idx,
    lineText: idx >= 0 ? (lis[idx].textContent||"").trim() : null,
    ulCount: idx >= 0 ? lis[idx].parentElement.children.length : null,
  });
})()'

seed_eval () { # $1 = js expression returning hist object
agent-browser eval "
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,\"0\")}-\${String(d.getDate()).padStart(2,\"0\")}\`; };
  const perfect = (n) => ({ day: k(n), reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 });
  const four = (n) => Object.assign(perfect(n), { rush: 0 });
  const raw = localStorage.getItem(\"vision2-study-v1\");
  localStorage.setItem(\"vision2-study-v1-r142-backup\", raw || \"__ABSENT__\");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, onboarded: true, userName: \"آزمون‌گر\",
    dayHistory: $1,
  });
  localStorage.setItem(\"vision2-study-v1\", JSON.stringify(obj));
  return \"SEEDED\";
})()" 2>/dev/null
}

reopen_and_probe () {
  agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
  sleep 4
  agent-browser eval "$OPEN_REPORT" 2>/dev/null >/dev/null
  sleep 2
  agent-browser eval "$PROBE" 2>/dev/null
}

echo "--- A. 3 perfect days → line = 2nd highlight, exact text"
seed_eval '{ [k(0)]: perfect(0), [k(1)]: perfect(1), [k(2)]: perfect(2) }'
reopen_and_probe

echo "--- B. 9 days → «به ۹ روز رسید — ۷ حلقه» (delta = window count)"
seed_eval 'Object.fromEntries(Array.from({length: 9}, (_, i) => [k(i), perfect(i)]))'
reopen_and_probe

echo "--- C. today 4/5 → chain alive via yesterday: «به ۲ روز رسید — ۲ حلقه»"
seed_eval '{ [k(0)]: four(0), [k(1)]: perfect(1), [k(2)]: perfect(2) }'
reopen_and_probe

echo "--- D. single perfect day → honest absence"
seed_eval '{ [k(0)]: perfect(0) }'
reopen_and_probe

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- G. strip seed → restore backup"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r142-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r142-backup");
  return "STRIPPED|" + (bak === "__ABSENT__" ? "removed" : "restored");
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA142-DONE"
