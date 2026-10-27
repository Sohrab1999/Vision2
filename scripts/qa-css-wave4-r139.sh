#!/bin/bash
# Task 139 QA — CSS wave 4: the duel dark band lives beside its owners.
# Single session. A. home → duel lobby → duel-hero REAL element probes
# (light gradient from JSX utilities, then dark: band paints from duel-dark.css)
# B. bundle freshness: fetched text carries the file's rules exactly once
# C. CSSOM single-hit: moved heads ×1 each; stayed r115 trio ×1 (globals)
# D. merged gmetro pair live (3a checkpoint)  E. leaderboard podium token
# F. mobile 390 OV  G. console 0. No DB writes (CSS-only QA).
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A1. enter duel lobby (real duel-hero, light mode)"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim().startsWith("نبرد"));
  if(!b) return "NO-DUEL-BTN";
  b.click(); return "CLICKED";
})()' 2>/dev/null
sleep 3
agent-browser eval '
(() => {
  const hero = document.querySelector(".duel-hero");
  if (!hero) return "NO-HERO";
  const cs = getComputedStyle(hero);
  return JSON.stringify({ lightGrad: cs.backgroundImage.includes("linear-gradient"), lightViolet: cs.backgroundImage.includes("139, 92, 246") });
})()' 2>/dev/null

echo "--- A2. dark mode → duel band paints from duel-dark.css"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const hero = document.querySelector(".duel-hero");
  if (!hero) return "NO-HERO";
  const cs = getComputedStyle(hero);
  // the moved dark gradient: rgb(59 7 100 / 0.72) first stop (computed → rgba form)
  const darkGrad = cs.backgroundImage.includes("59, 7, 100") && cs.backgroundImage.includes("0.72");
  const hud = document.querySelector(".duel-hud");
  const hudBg = hud ? getComputedStyle(hud).backgroundColor : "none";
  const code = document.querySelector(".duel-code");
  const codeBg = code ? getComputedStyle(code).backgroundColor : "none";
  const cardKernel = hero.querySelector(".bg-stone-100");
  const trioBg = cardKernel ? getComputedStyle(cardKernel).backgroundColor : "none";
  return JSON.stringify({ darkGrad, hudBg, codeBg, trioBg });
})()' 2>/dev/null

echo "--- B. bundle freshness (fetched text, per-file count)"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  for(const h of links){
    try{ const t=await fetch(h).then(r=>r.text());
      const heroCount=(t.match(/\.dark \.duel-hero \{/g)||[]).length;
      const podiumCount=(t.match(/\.dark \.leaderboard\.duel-mode \.to-purple-400/g)||[]).length;
      const trioCount=(t.match(/\.dark \.duel-card \.bg-stone-100/g)||[]).length;
      const gmetroMerged=(t.match(/\.dark \.gmetro-line \.border-stone-200,\.dark \.gmetro-dialog \.border-stone-200/g)||[]).length;
      const inkStay=(t.match(/\.dark \.duel-think \.text-stone-500/g)||[]).length;
      return JSON.stringify({links:links.length, heroCount, podiumCount, trioCount, gmetroMerged, inkStay});
    }catch(e){}
  }
  return "NO-CSS-FETCH";
})()' 2>/dev/null

echo "--- C. CSSOM single-hit audit"
agent-browser eval '
(() => {
  const count = (pred) => { let n=0;
    const walk = (rules) => { for (const r of rules) {
      if (r.cssRules) walk(r.cssRules);
      if (r.selectorText && pred(r.selectorText)) n++;
    }};
    for (const s of document.styleSheets) { try { walk(s.cssRules); } catch(e){} }
    return n; };
  return JSON.stringify({
    duelHero: count(s => s === ".dark .duel-hero"),
    duelCard: count(s => s === ".dark .duel-card"),
    duelHud: count(s => s === ".dark .duel-hud"),
    lbPodium: count(s => s.includes(".leaderboard.duel-mode") && s.includes(".to-purple-400")),
    doneEmerald: count(s => s.startsWith(".dark .duel-done") && s.includes("border-emerald-300")),
    trioBgStone: count(s => s.startsWith(".dark .duel-card .bg-stone-100")),
  });
})()' 2>/dev/null

echo "--- D. merged gmetro pair live (computed border on real gmetro scope probe)"
agent-browser eval '
(() => {
  const probe = document.createElement("div");
  probe.className = "dark";
  probe.style.cssText = "position:absolute;left:-9999px;top:0";
  probe.innerHTML = `<div class="gmetro-dialog" id="p139dlg"><span class="border-stone-200" id="p139sp"></span></div>`;
  document.body.appendChild(probe);
  const sp = probe.querySelector("#p139sp");
  const bc = getComputedStyle(sp).borderColor;
  probe.remove();
  return JSON.stringify({ mergedBorder: bc });
})()' 2>/dev/null

echo "--- E. leaderboard duel-mode podium token (injected probe)"
agent-browser eval '
(() => {
  const probe = document.createElement("div");
  probe.className = "dark";
  probe.style.cssText = "position:absolute;left:-9999px;top:0";
  probe.innerHTML = `<div class="leaderboard duel-mode"><span class="to-purple-400" id="p139pod"></span></div>`;
  document.body.appendChild(probe);
  const pod = probe.querySelector("#p139pod");
  const tok = getComputedStyle(pod).getPropertyValue("--tw-gradient-to").trim();
  probe.remove();
  return JSON.stringify({ podiumToken: tok });
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- F. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- G. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
