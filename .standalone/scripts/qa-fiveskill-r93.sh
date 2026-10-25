#!/bin/bash
# Task 93 — live QA: five-skill week badge #41 on a seeded returning learner
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed five skills spread over 5 window days → reload"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n);
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
  const mk = (o) => ({ day:"", reviews:0, quizzes:0, words:0, dictation:0, rush:0, ...o });
  const dayHistory = {};
  dayHistory[key(0)] = mk({ day: key(0), reviews: 1 });
  dayHistory[key(1)] = mk({ day: key(1), quizzes: 1 });
  dayHistory[key(2)] = mk({ day: key(2), dictation: 1 });
  dayHistory[key(4)] = mk({ day: key(4), words: 1 });
  dayHistory[key(6)] = mk({ day: key(6), rush: 1 });
  const raw = localStorage.getItem("vision2-study-v1");
  const prev = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  prev.state = { ...(prev.state||{}), dayHistory, goalMetDays: [], seenBadges: [] };
  prev.version = 0;
  localStorage.setItem("vision2-study-v1", JSON.stringify(prev));
  return "seeded";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 5

echo "--- B. badge section: «۱ از ۴۱» + پنج‌گانه shine + بی‌دیکته/بی‌آزمون locked"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  if (!sec) return JSON.stringify({ secFound: false });
  const chip = [...sec.querySelectorAll("span")].map(s=>s.textContent).find(t=>/از\s*۴۱/.test(t||""));
  const five = [...sec.querySelectorAll(".badge-card")].find(c=>/هفتهٔ پنج‌گانه/.test(c.textContent||""));
  const noDict = [...sec.querySelectorAll(".badge-card")].find(c=>/هفتهٔ بی‌دیکته/.test(c.textContent||""));
  const noExam = [...sec.querySelectorAll(".badge-card")].find(c=>/هفتهٔ بی‌آزمون/.test(c.textContent||""));
  return JSON.stringify({
    chip,
    fiveShine: five?.className.includes("badge-shine") ?? false,
    fiveSvg: !!five?.querySelector("svg"),
    noDictLocked: !(noDict?.className.includes("badge-shine") ?? true),
    noExamLocked: !(noExam?.className.includes("badge-shine") ?? true),
  });
})()' 2>/dev/null

echo "--- C. mobile 390 overflow + console"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return JSON.stringify({ overflowX: d.scrollWidth - d.clientWidth, w: d.clientWidth }); })()' 2>/dev/null
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "CONSOLE_END"
