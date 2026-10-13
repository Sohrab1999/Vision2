#!/usr/bin/env bash
# Task 95 — single-session QA: ① seed 35 all-active days → «ماهِ بی‌وقفه»
# shines + chip «X از ۴۲» ② leaderboard duels tab → داورگواه‌QA row carries
# the emerald shield «۱» ③ mobile 390 overflow 0 ④ console clean.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r95-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r95-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r95-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed 35 all-active days (words-only presence)"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const dh={};
  for(let n=0;n<35;n++) dh[dayKey(n)]={day:dayKey(n),reviews:0,quizzes:0,words:2,dictation:0,rush:0};
  obj.state.dayHistory=dh;
  obj.state.goalMetDays=[];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-35";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

echo "--- B. perfect-month tile + chip count"
agent-browser eval '(()=>{
  const tile=[...document.querySelectorAll("button,div")].find(e=>e.textContent && e.textContent.includes("ماهِ بی‌وقفه") && e.className && String(e.className).length<300);
  const shine=document.querySelector(".badge-shine");
  const chip=[...document.querySelectorAll("span")].find(e=>e.children.length===0 && /از\s*۴۲/.test(e.textContent||""));
  return JSON.stringify({ tile: !!tile, shine: !!shine, chip: chip? chip.textContent.trim() : null });
})()'

echo "--- C. leaderboard duels tab — judge-attested shield"
agent-browser eval '(()=>{
  const rows=[...document.querySelectorAll("button,div[role=button],a")];
  const lb=rows.find(e=>/جدول امتیازات/.test(e.textContent||"") && e.textContent.length<60);
  if(lb){lb.click(); return "lb-opened";}
  return "lb-link-miss";
})()'
sleep 2.5
agent-browser eval '(()=>{
  const tabs=[...document.querySelectorAll("button[role=tab]")];
  const duels=tabs.find(t=>/نبردهای دودنفره/.test(t.textContent||""));
  if(duels){duels.click(); return "duels-tab";}
  return "tab-miss:"+tabs.map(t=>t.textContent.trim()).join("|");
})()'
sleep 2
agent-browser eval '(()=>{
  const shield=[...document.querySelectorAll("span")].find(e=>e.title && String(e.title).includes("بردِ داورگواه"));
  const row=[...document.querySelectorAll("span,li")].find(e=>e.textContent && e.textContent.includes("داورگواه‌QA"));
  const header=[...document.querySelectorAll("span")].find(e=>/بردها با رسیدِ امضاشدهٔ داور/.test(e.textContent||""));
  return JSON.stringify({ shield: shield? shield.textContent.trim()+" («"+shield.title.slice(0,14)+"…»)" : null, rowVisible: !!row, header: !!header });
})()'

echo "--- D. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- E. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-R95-DONE"
