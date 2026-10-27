#!/bin/bash
# Task 140 QA — «دفترِ زنجیرهٔ مأموریت‌ها» live probe. Single session.
# A. seed 3 perfect days + today perfect → chip «زنجیرهٔ ۳ روزه» + reward band real count
# B. today 4/5, chain alive via yesterday → chip «زنجیرهٔ ۲ روزه», band absent
# C. empty dayHistory → honest absence (no chip)
# D. mobile 390 OV  E. console 0  F. strip seed (backup/restore)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed: 3 perfect days incl. today → chip + band"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const perfect = (n) => ({ day: k(n), reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 });
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r140-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const hist = { [k(0)]: perfect(0), [k(1)]: perfect(1), [k(2)]: perfect(2) };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, onboarded: true, userName: "آزمون‌گر",
    dayStat: perfect(0),
    dayHistory: hist,
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED3";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '
(() => {
  const chip = document.querySelector(".quest-streak-chip");
  if (!chip) return "NO-CHIP";
  const title = chip.getAttribute("title") || "";
  const aria = chip.getAttribute("aria-label") || "";
  const band = [...document.querySelectorAll("p")].find(p => (p.textContent||"").includes("پاداش روزانه گرفتی"));
  return JSON.stringify({
    chipLabel: (chip.textContent||"").trim(),
    ariaEqTitle: aria === title,
    titleHasTodayMember: title.includes("امروز هم عضوِ زنجیره‌ای"),
    flameHidden: !!(chip.querySelector("svg[aria-hidden=\"true\"]")),
    bandClaim: band ? (band.textContent||"").includes("زنجیرهٔ مأموریت‌ها به ۳ روز رسید!") : false,
    bandOldGone: band ? !(band.textContent||"").includes("زنجیره‌ات امن است!") : null,
  });
})()' 2>/dev/null

echo "--- B. today 4/5 → chain alive via yesterday: «زنجیرهٔ ۲ روزه», band absent"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const perfect = (n) => ({ day: k(n), reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 });
  const four = (n) => Object.assign(perfect(n), { rush: 0 });
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    dayStat: four(0),
    dayHistory: { [k(0)]: four(0), [k(1)]: perfect(1), [k(2)]: perfect(2) },
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "RESEEDED-4OF5";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '
(() => {
  const chip = document.querySelector(".quest-streak-chip");
  if (!chip) return "NO-CHIP";
  const band = [...document.querySelectorAll("p")].find(p => (p.textContent||"").includes("پاداش روزانه گرفتی"));
  return JSON.stringify({
    chipLabel: (chip.textContent||"").trim(),
    titleHasKeepGoing: (chip.getAttribute("title")||"").includes("امروز هم بگیر تا زنجیره قطع نشود"),
    bandPresent: !!band,
  });
})()' 2>/dev/null

echo "--- C. empty dayHistory → honest absence"
agent-browser eval '
(() => {
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, { dayHistory: {} });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "CLEARED-HIST";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '
(() => {
  const chip = document.querySelector(".quest-streak-chip");
  const panel = document.querySelector("section[aria-label=\"اهداف روزانه\"]");
  return "HONEST|panel=" + !!panel + "|chip=" + !!chip;
})()' 2>/dev/null

echo "--- D. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- F. strip seed → restore backup"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r140-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r140-backup");
  return "STRIPPED|" + (bak === "__ABSENT__" ? "removed" : "restored");
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA140-DONE"
