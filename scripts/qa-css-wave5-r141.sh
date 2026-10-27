#!/bin/bash
# Task 141 QA — CSS wave 5: the daily-quests family lives beside its owner.
# Single session. A. home → daily-quests REAL element probes (light: reward
# shimmer animation on the all-done band; dark: band paints from
# practice/daily-quests.css)  B. bundle freshness: moved heads ×1 each in
# fetched text  C. CSSOM single-hit: moved heads ×1; stayed r115 trio ×1
# (globals); c-track-80 elevated group ×1  D. stayed trio live (leaderboard
# member color via CSSOM, not computed — no duel entry needed)  E. mobile
# 390 OV  F. console 0  G. strip seed. DB untouched (CSS-only QA).
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A0. seed 5/5 today (reward band visible) + skip intro"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const perfect = (n) => ({ day: k(n), reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1 });
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r141-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, onboarded: true, userName: "آزمون‌گر",
    dayStat: perfect(0),
    dayHistory: { [k(0)]: perfect(0), [k(1)]: perfect(1), [k(2)]: perfect(2) },
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- A1. light: reward shimmer animation live on the all-done band"
agent-browser eval '
(() => {
  const panel = document.querySelector("section[aria-label=\"اهداف روزانه\"]");
  if (!panel) return "NO-PANEL";
  const shimmer = panel.querySelector(".reward-shimmer");
  if (!shimmer) return "NO-SHIMMER";
  const cs = getComputedStyle(shimmer);
  return JSON.stringify({
    animName: cs.animationName,
    animDur: cs.animationDuration,
    gradWhite: cs.backgroundImage.includes("255, 255, 255"),
    bandGrad: !!panel.querySelector(".reward-band"),
  });
})()' 2>/dev/null

echo "--- A2. dark: band paints from practice/daily-quests.css"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const panel = document.querySelector("section[aria-label=\"اهداف روزانه\"]");
  if (!panel) return "NO-PANEL";
  const cs = getComputedStyle(panel);
  const row = panel.querySelector(".quest-row");
  const rowCs = row ? getComputedStyle(row) : null;
  const doneRow = panel.querySelector(".quest-row.border-emerald-300");
  const doneCs = doneRow ? getComputedStyle(doneRow) : null;
  const chip = panel.querySelector(".quest-streak-chip");
  return JSON.stringify({
    panelBg: cs.backgroundColor,
    panelBorder: cs.borderColor,
    rowBg: rowCs ? rowCs.backgroundColor : "none",
    doneRowBg: doneCs ? doneCs.backgroundColor : "none",
    streakChipBg: chip ? getComputedStyle(chip).backgroundColor : "none",
  });
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- B. bundle freshness (fetched text, per-head count)"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  const out={};
  for(const h of links){
    try{ const t=await fetch(h).then(r=>r.text());
      const shimmer=(t.match(/\.reward-shimmer \{/g)||[]).length;
      const panel=(t.match(/\.dark \.daily-quests \{/g)||[]).length;
      const rowHover=(t.match(/\.dark \.daily-quests \.quest-row:hover/g)||[]).length;
      const trio=(t.match(/\.dark \.daily-quests \.text-violet-700/g)||[]).length;
      const track=(t.match(/\.daily-quests \.c-track-80/g)||[]).length;
      if(shimmer+panel+rowHover+trio+track>0){ out[h.slice(-40)]={shimmer,panel,rowHover,trio,track}; }
    }catch(e){}
  }
  return JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit across all sheets"
agent-browser eval '
(() => {
  const counts={shimmer:0,panel:0,rowHover:0,trio:0,track:0,shimmerAnim:0};
  for(const sheet of document.styleSheets){
    let rules; try{ rules=sheet.cssRules; }catch(e){ continue; }
    const walk=(list)=>{ for(const r of list){
      const t=r.cssText||"";
      if(t.includes(".reward-shimmer")) counts.shimmer++;
      if(/\.dark \.daily-quests \{/.test(t)) counts.panel++;
      if(t.includes(".dark .daily-quests .quest-row:hover")) counts.rowHover++;
      if(t.includes(".dark .daily-quests .text-violet-700")) counts.trio++;
      if(t.includes(".daily-quests .c-track-80")) counts.track++;
      if(r.type===CSSRule.KEYFRAMES_RULE && r.name==="reward-shine") counts.shimmerAnim++;
      if(r.cssRules) walk(r.cssRules);
    }};
    walk(rules);
  }
  return JSON.stringify(counts);
})()' 2>/dev/null

echo "--- D. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- F. strip seed"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r141-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r141-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA141-DONE"
