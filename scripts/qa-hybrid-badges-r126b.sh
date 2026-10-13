#!/bin/bash
# Task 126 QA follow-up — toast-at-mount + tile inner-card probes (fixed timing/selectors)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r126-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  st.freezeEarnedDay="2026-10-13";
  st.freezeUsedDays=[];
  st.results={ rush:{correct:3,total:5,percent:60,at:new Date().toISOString()} };
  st.bestStreak=4; st.rushGames=2; st.rushBest=60; st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED";
})()' >/dev/null 2>&1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' >/dev/null 2>&1

echo "--- A1. toast probed IMMEDIATELY after mount (fresh badges → first 2 toasts)"
agent-browser eval '(() => {
  const hit=[...document.querySelectorAll("body *")].map(x=>x.textContent||"").find(t=>t.includes("نشان جدید"));
  return hit ? "TOAST|"+hit.slice(0,120).replace(/\s+/g," ") : "NO-TOAST-YET";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const toasts=[...document.querySelectorAll("[role=status], [role=alert], li")].map(x=>x.textContent||"").filter(t=>t.includes("نشان جدید"));
  return JSON.stringify({count: toasts.length, first: (toasts[0]||"").replace(/\s+/g," ").slice(0,120)});
})()' 2>/dev/null

echo "--- A2. count chip + hybrid tile inner cards"
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const chip=[...sec.querySelectorAll("span.bg-amber-100")].map(s=>s.textContent.trim())[0] || null;
  const tile=(title)=>{
    const btn=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")].find(x=>x.textContent.includes(title));
    if(!btn) return "MISSING";
    const card=btn.querySelector(".badge-shine") ? "UNLOCKED" : (btn.querySelector(".border-stone-200") ? "LOCKED" : "?");
    const icon=btn.querySelector("svg") ? getComputedStyle(btn.querySelector("svg")).color : null;
    const lockHint=(btn.textContent.match(/قفل[^\n]*/)||[""])[0].trim().slice(0,40);
    return {card, lockHint};
  };
  return JSON.stringify({
    chip,
    total: sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]").length,
    ice_fire: tile("آتش و یخ"),
    speedy_chain: tile("زنجیرهٔ برق‌آسا"),
    shield_bolt: tile("سپر و صاعقه"),
  });
})()' 2>/dev/null

echo "--- A3. dark probe on the UNLOCKED hybrid tile (inner gradient card)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="حالت شب");
  if(!b) return "TOGGLE-MISSING";
  b.click(); return "DARK";
})()' >/dev/null 2>&1
sleep 1
agent-browser eval '(() => {
  const btn=[...document.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")].find(x=>x.textContent.includes("آتش و یخ"));
  if(!btn) return "TILE-MISSING";
  const card=btn.querySelector(".badge-shine");
  const cs=card?getComputedStyle(card):null;
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    shine: !!card,
    bg: cs?cs.backgroundImage.slice(0,60):null,
    ink: cs?cs.color:null,
  });
})()' 2>/dev/null

echo "--- A4. strip seed"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r126-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY); else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r126-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA126B_END"
