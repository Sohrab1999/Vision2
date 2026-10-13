#!/bin/bash
# Task 92 — live QA: presence badges #39/#40 on a seeded returning learner
# + returning-learner console check (r85 hydration-artifact question)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed 25 words-only days + empty goal/seen → reload"
agent-browser eval '(() => {
  const key = (n) => { const d = new Date(); d.setDate(d.getDate()-n);
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
  const dayHistory = {};
  for (let n=0;n<=24;n++) dayHistory[key(n)] = { day:key(n), reviews:0, quizzes:0, words:1, dictation:0, rush:0 };
  const raw = localStorage.getItem("vision2-study-v1");
  const prev = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  prev.state = { ...(prev.state||{}), dayHistory, goalMetDays: [], seenBadges: [] };
  prev.version = 0;
  localStorage.setItem("vision2-study-v1", JSON.stringify(prev));
  return "seeded";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 5

echo "--- B. badge section: «۱ از ۴۰» + ماهِ حاضر shine + ماهِ درخشان locked hint"
agent-browser eval '(() => {
  const sec = document.querySelector(".badge-section");
  if (!sec) return JSON.stringify({ secFound: false });
  const chip = [...sec.querySelectorAll("span")].map(s=>s.textContent).find(t=>/از\s*۴۰/.test(t||""));
  const present = [...sec.querySelectorAll(".badge-card")].find(c=>/ماهِ حاضر/.test(c.textContent||""));
  const full = [...sec.querySelectorAll(".badge-card")].find(c=>/ماهِ درخشان/.test(c.textContent||""));
  return JSON.stringify({
    chip,
    presentShine: present?.className.includes("badge-shine") ?? false,
    presentSvg: !!present?.querySelector("svg"),
    fullShine: full?.className.includes("badge-shine") ?? false,
    fullHint: (full?.textContent||"").includes("۲۵ از ۳۰ روزِ فعال"),
  });
})()' 2>/dev/null

echo "--- C. report digest reflects 40-registry (official report shows X از ۴۰)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "opened"; })()' 2>/dev/null
sleep 3
agent-browser eval '(() => {
  const t = document.body.textContent || "";
  return JSON.stringify({ digest40: /از\s*۴۰/.test(t) });
})()' 2>/dev/null

echo "--- D. mobile 390 overflow"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "p"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const inp=document.querySelector("input"); if(inp){const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(inp,"خانه"); inp.dispatchEvent(new Event("input",{bubbles:true}));} return "t"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const o=[...document.querySelectorAll("[role=option], li, button")].find(x=>/خانه/.test(x.textContent||"")); if(o) o.click(); return "c"; })()' 2>/dev/null
sleep 2
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return JSON.stringify({ overflowX: d.scrollWidth - d.clientWidth, w: d.clientWidth }); })()' 2>/dev/null

echo "--- E. returning-learner console (hydration artifact check)"
agent-browser console 2>/dev/null | grep -iE "error|warn|hydrat" | grep -v "Download the React DevTools" | head -6
echo "CONSOLE_END"
