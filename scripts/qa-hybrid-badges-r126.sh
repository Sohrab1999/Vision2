#!/bin/bash
# Task 126 QA — hybrid badge family «آتش و یخ» (fire & ice) — single session.
# Seed: freezeEarnedDay + results.rush + bestStreak 4 + rushGames 2
#   → ice-fire unlocked (with ice-maker + rush-first) = «۳ از ۵۵»
#   → speedy-chain locked with the BINDING-dimension hint «۲ از ۵ چالش»
#     (2/5=0.4 < 4/7≈0.57) and a 40% popover bar
#   → shield-bolt locked, no bar data
# Plus: toast on fresh unlock, dark-mode tile probe, mobile-390, console.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1

echo "--- A. seed the hybrid state (full-key build, backup kept)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r126-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  st.freezeEarnedDay="2026-10-13";
  st.freezeUsedDays=[];
  st.results={ rush:{correct:3,total:5,percent:60,at:new Date().toISOString()} };
  st.bestStreak=4;
  st.rushGames=2;
  st.rushBest=60;
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1.5

echo "--- B. badge wall: count chip + hybrid tiles state"
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const chip=[...sec.querySelectorAll("span")].map(s=>s.textContent.trim()).find(t=>/^\d+\s*از\s*\d+$/.test(t.replace(/[۰-۹]/g,c=>c))||/از/.test(t)&&s.className.includes("amber"));
  const tileState=(id)=>{ /* find tile by popover trigger aria-label */ };
  const tile=(title)=>{
    const btns=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")];
    const b=btns.find(x=>x.textContent.includes(title));
    if(!b) return "MISSING";
    return {unlocked: b.textContent.includes("نشان") && b.querySelector(".badge-shine, [class*=badge-shine]") !== null || b.className.includes("badge-shine"), text: b.textContent.slice(0,80)};
  };
  return JSON.stringify({
    chip: chip ?? null,
    ice_fire: tile("آتش و یخ"),
    speedy_chain: tile("زنجیرهٔ برق‌آسا"),
    shield_bolt: tile("سپر و صاعقه"),
    tileCount: sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]").length,
  });
})()' 2>/dev/null

echo "--- C. toast fired for the fresh unlock"
agent-browser eval '(() => {
  const t=document.querySelector("[data-sonner-toast], [role=status], [role=alert]");
  const all=[...document.querySelectorAll("li,div")].map(x=>x.textContent||"").find(t=>t.includes("نشان جدید"));
  return all ? "TOAST|"+all.slice(0,90) : "NO-TOAST";
})()' 2>/dev/null

echo "--- D. popover of speedy-chain: binding-dimension hint + bar width"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")].find(x=>x.textContent.includes("زنجیرهٔ برق‌آسا"));
  if(!b) return "TILE-MISSING";
  b.click(); return "CLICKED";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const pop=document.querySelector(".badge-popover, [data-radix-popper-content-wrapper] *");
  const wrap=document.querySelector("[data-radix-popper-content-wrapper]");
  if(!wrap) return "POPOVER-MISSING";
  const bar=wrap.querySelector(".h-2 > div, .h-2 .rounded-full");
  return JSON.stringify({
    hint: (wrap.textContent.match(/پیشرفت تو:[^م]*/)||[""])[0].trim().slice(0,50),
    barW: bar ? bar.style.width : null,
  });
})()' 2>/dev/null

echo "--- E. dark-mode tile probe (header toggle)"
agent-browser eval '(() => {
  document.body.click();
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const tile=[...document.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")].find(x=>x.textContent.includes("آتش و یخ"));
  if(!tile) return "TILE-MISSING";
  const cs=getComputedStyle(tile);
  return JSON.stringify({dark: document.documentElement.classList.contains("dark"), tileBg: cs.backgroundColor, cls: tile.className.includes("badge-shine")});
})()' 2>/dev/null

echo "--- F. mobile 390 overflow"
agent-browser eval '(() => {document.body.click();return "x";})()' >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(() => {
  const d=document.documentElement;
  const before=d.scrollWidth-d.clientWidth;
  const sec=document.querySelector(".badge-section");
  sec && sec.scrollIntoView();
  const after=document.documentElement.scrollWidth-document.documentElement.clientWidth;
  return "MOBILE390|OV="+after+"|W="+document.documentElement.clientWidth;
})()' 2>/dev/null

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -iE "error" | grep -v "Download the React DevTools" | head -3
echo "CONSOLE_END"

echo "--- H. strip seed"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r126-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY); else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r126-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA126_END"
