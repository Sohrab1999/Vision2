#!/usr/bin/env bash
# ------------------------------------------------------------------
# r289 — QAِ زندهٔ نوارِ «نشان‌های نبردی» در DOMِ صفحهٔ نبرد.
# ① seedِ «سپهر م» با دفترچهٔ ۳نبردی (۲ برد مقابلِ «آرش ر») → rival-hunter
# ② open-duel → نوار باید: شمارندهٔ «۱ از ۱۰» + چیپِ نقره + ۹ قفلِ سنگی
# ③ منفیِ خودسازگاری: «اولین قدم» (۸ مرورِ امروز) در نوار نیست
# ④ اسکرین‌شاتِ ۱۲۸۰ + سوییچِ ۳۹۰ (این راند DOM/CSS دارد — الزامی) + کنسول
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"

echo "--- A. fresh page + seed"
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
agent-browser eval '(()=>{ localStorage.clear(); sessionStorage.clear(); return "cleared"; })()' >/dev/null 2>&1
agent-browser eval '(()=>{
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const today=dayKey(0);
  const mk=(id,day,outcome,opponent,myScore,oppScore,myCorrect)=>({ id, day, outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore, oppScore, myCorrect, oppCorrect:3, answered:10, total:10, durationSec:80 });
  localStorage.setItem("vision2-study-v1", JSON.stringify({state:{
    userName:"سپهر م", onboarded:true,
    seenBadges:["first-visible"],
    dayStat:{day:today,reviews:8,quizzes:0,words:0,dictation:0,rush:0},
    dayHistory:{[today]:{day:today,reviews:8,quizzes:0,words:0,dictation:0,rush:0}},
    duelHistory:[
      mk("r289a",dayKey(4),"win","آرش ر",1200,500,8),
      mk("r289b",dayKey(2),"win","آرش ر",1100,400,8),
      mk("r289c",dayKey(1),"loss","سینا",600,1000,7)
    ]
  },version:0}));
  return "seeded";
})()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1
sleep 5

echo "--- B. duel view → strip census"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()' >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{
  const sec=document.querySelector("[aria-label=\"نشان‌های نبردی\"]");
  if(!sec) return JSON.stringify({ok:false,why:"no-strip"});
  const pill=sec.querySelector("h2 span")?.textContent||"";
  const chips=[...sec.querySelectorAll("ul li")];
  const unlockedChips=chips.filter(c=>!c.className.includes("bg-stone-100")).map(c=>c.textContent?.trim());
  const hasFirstStep=chips.some(c=>(c.textContent||"").includes("اولین قدم"));
  const hunterLocked=chips.find(c=>(c.textContent||"").includes("شکارچیِ رقیب"));
  return JSON.stringify({ok:true,pill,total:chips.length,unlockedChips,hasFirstStep,hunterTitle:hunterLocked?.getAttribute("title")});
})()' 2>/dev/null

echo "--- C. screenshot at 1280 (strip visible in viewport)"
agent-browser eval '(()=>{ const s=document.querySelector("[aria-label=\"نشان‌های نبردی\"]"); if(!s) return "no-strip"; s.scrollIntoView({block:"center"}); return "scrolled"; })()' >/dev/null 2>&1
sleep 1
agent-browser screenshot --filename /tmp/r289-strip-1280.png >/dev/null 2>&1 || agent-browser screenshot /tmp/r289-strip-1280.png >/dev/null 2>&1 || true
ls -la /tmp/r289-strip-1280.png 2>/dev/null || echo "screenshot missing"

echo "--- D. mobile 390 dark: overflow + strip still sane (DOM/CSS changed this round — الزامی)"
agent-browser viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(()=>{ const vp=window.innerWidth; const ofl=document.documentElement.scrollWidth>vp; return JSON.stringify({vp,DOC_OVERFLOW:ofl,sw:document.documentElement.scrollWidth}); })()' 2>/dev/null
agent-browser eval '(()=>{ const sec=document.querySelector("[aria-label=\"نشان‌های نبردی\"]"); if(!sec) return JSON.stringify({strip:false}); const r=sec.getBoundingClientRect(); return JSON.stringify({strip:true,left:Math.round(r.left),right:Math.round(r.right),inViewport:r.right>0&&r.left<390}); })()' 2>/dev/null
