#!/bin/bash
# Task 144 QA — «روزهایِ هدف در هفته‌نامه» live probe. Single session.
# A. ۳ این هفته / ۲ هفتهٔ پیش → «— ۱ روز بیشتر از هفتهٔ پیش» (act days — بدونِ خطِ زنجیره، liIndex=۱)
# B. ۱ / ۳ → «— ۲ روز کمتر از هفتهٔ پیش»
# C. ۲/۲ → «— هم‌قدم با هفتهٔ پیش»
# D. ۳/۱ + زنجیرهٔ زنده → سطرِ هدف children[۲] با «۲ روز بیشتر»
# D2. بدونِ هیچ پایه → گویشِ لخت (bareEnd=true)
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
  const idx = lis.findIndex(li => (li.textContent||"").includes("روزِ هدفِ روزانه کامل شد"));
  const t = idx >= 0 ? (lis[idx].textContent||"").trim() : null;
  return JSON.stringify({
    digestPresent: true,
    hasLine: idx >= 0,
    liIndex: idx,
    lineText: t,
    bareEnd: idx >= 0 ? t.endsWith("کامل شد") : null,
    ulCount: idx >= 0 ? lis[idx].parentElement.children.length : null,
  });
})()'

seed_eval () { # $1 = goalMetDays keys js array expr, $2 = dayHistory js object expr
agent-browser eval "
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,\"0\")}-\${String(d.getDate()).padStart(2,\"0\")}\`; };
  const BAK = \"vision2-study-v1-r144-backup\";
  const raw = localStorage.getItem(\"vision2-study-v1\");
  if (localStorage.getItem(BAK) === null) localStorage.setItem(BAK, raw || \"__ABSENT__\");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, onboarded: true, userName: \"آزمون‌گر\",
    goalMetDays: $1,
    dayHistory: $2,
  });
  localStorage.setItem(\"vision2-study-v1\", JSON.stringify(obj));
  return \"SEEDED\";
})()" 2>/dev/null
}

goals_of () { echo "[$1]"; } # "0,1,2" -> [k(0),k(1),k(2)] viaGoals below

reopen_and_probe () {
  agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
  sleep 4
  agent-browser eval "$OPEN_REPORT" 2>/dev/null >/dev/null
  sleep 2
  agent-browser eval "$PROBE" 2>/dev/null
}

actDays () { # "$1" = comma list of offsets → dayHistory object of act days
  local js="{"
  local first=1
  IFS="," read -ra offs <<< "$1"
  for n in "${offs[@]}"; do
    [ $first -eq 0 ] && js="$js,"
    js="$js [k($n)]: { day: k($n), reviews: 10, quizzes: 3, words: 0, dictation: 0, rush: 0 }"
    first=0
  done
  echo "$js }"
}

goalKeys () { # "$1" = comma list of offsets → goalMetDays array of keys
  local js="["
  local first=1
  IFS="," read -ra offs <<< "$1"
  for n in "${offs[@]}"; do
    [ $first -eq 0 ] && js="$js,"
    js="$js k($n)"
    first=0
  done
  echo "$js ]"
}

echo "--- A. ۳ این هفته / ۲ هفتهٔ پیش → بیشتر"
seed_eval "$(goalKeys "0,1,2,7,8")" "$(actDays "0,7")"
reopen_and_probe

echo "--- B. ۱ / ۳ → کمتر"
seed_eval "$(goalKeys "0,7,8,9")" "$(actDays "0,7")"
reopen_and_probe

echo "--- C. ۲/۲ → هم‌قدم"
seed_eval "$(goalKeys "0,1,7,8")" "$(actDays "0,7")"
reopen_and_probe

echo "--- D. ۳/۱ با زنجیرهٔ زنده → سطرِ هدف children[۲] («۲ روز بیشتر»)"
seed_eval "$(goalKeys "0,1,2,7")" '{ [k(0)]: { day: k(0), reviews: 10, quizzes: 3, words: 5, dictation: 1, rush: 1 }, [k(1)]: { day: k(1), reviews: 10, quizzes: 3, words: 5, dictation: 1, rush: 1 } }'
reopen_and_probe

echo "--- D2. بدونِ هیچ پایه (هدف‌ها فقط این هفته) → گویشِ لخت، bareEnd=true"
seed_eval "$(goalKeys "0,1,2")" '{ [k(0)]: { day: k(0), reviews: 10, quizzes: 3, words: 5, dictation: 1, rush: 1 }, [k(1)]: { day: k(1), reviews: 10, quizzes: 3, words: 5, dictation: 1, rush: 1 } }'
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
  const bak = localStorage.getItem("vision2-study-v1-r144-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r144-backup");
  return "STRIPPED|" + (bak === "__ABSENT__" ? "removed" : "restored");
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA144-DONE"
