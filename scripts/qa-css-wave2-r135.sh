#!/bin/bash
# Task 135 QA — §8.3 wave 2 extraction live proof. Single session.
# 0. freshness: served chunk re-compiled (dictation-box GONE) AND feature files bundled (flame-flicker present exactly once)
# A. home core
# B. CSSOM: moved rules live exactly once (streak-flame/footer/word-day/heat-cell/pop-fade/badge-shine/hero-book/certificate)
# C. computed styles: footer-band light+dark gradients, quote ::before content, word-day light+dark, hero-book sheen animation
# D. mobile 390 OV. E. console 0.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- 0. served-chunk freshness (lesson 130: ask content, not names)"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  let text="";
  for(const h of links){ try{ text += await fetch(h).then(r=>r.text()); }catch(e){} }
  const deadGone = !text.includes(".dictation-box");
  const flame = (text.match(/flame-flicker/g)||[]).length;
  const popfade = (text.match(/@keyframes pop-fade/g)||[]).length;
  const footerLight = text.includes(".footer-band {") && text.includes(".dark .footer-band {");
  const wordday = text.includes(".dark .word-day {") && text.includes(".dark .word-day .text-emerald-700");
  const heat = text.includes(".dark .heat-cell.bg-emerald-200");
  return "FRESH|deadGone="+deadGone+"|flameRefs="+flame+"|popFadeDefs="+popfade+"|footerTwins="+footerLight+"|wordDaySet="+wordday+"|heatDark="+heat;
})()' 2>/dev/null

echo "--- A. home core"
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const txt=document.body.innerText;
  return "HOME|todayChip="+txt.includes("امروز")+"|duelEntry="+[...document.querySelectorAll("button")].some(x=>x.textContent.includes("نبرد"));
})()' 2>/dev/null

echo "--- B. CSSOM single-hit checks (moved rules, exactly once each)"
agent-browser eval '(() => {
  const want = {
    flame: (s)=>s.includes(".streak-flame") && !s.includes("user-reduce-motion"),
    flameKey: (s)=>s.includes("@keyframes flame-flicker"),
    footer: (s)=>s.trim().startsWith(".footer-band"),
    footerDark: (s)=>s.includes(".dark .footer-band"),
    quoteBefore: (s)=>s.includes(".quote-band::before") && !s.startsWith(".dark"),
    heroBook: (s)=>s.includes(".hero-book::after"),
    heroKey: (s)=>s.includes("@keyframes hero-sheen"),
    badgeShine: (s)=>s.includes(".badge-shine::after"),
    popFade: (s)=>s.includes(".badge-popover") && s.includes("pop-fade") && !s.includes("user-reduce-motion"),
    heat: (s)=>s.trim().startsWith(".heat-cell"),
    heatDark: (s)=>s.includes(".dark .heat-cell.bg-emerald-200"),
    wordDay: (s)=>s.trim().startsWith(".word-day"),
    wordDayDark: (s)=>s.trim().startsWith(".dark .word-day") && s.includes("background-image"),
    cert: (s)=>s.trim().startsWith(".certificate-card") && !s.includes("bg-stone-50") && !s.includes("border-dashed"),
    wordDayEm: (s)=>s.includes(".word-day .text-emerald-700"),
  };
  const count = {};
  const walk = (rs) => { for (const r of rs) {
    if (r.cssRules) walk(r.cssRules);
    if (r.selectorText || (r.type === CSSRule.KEYFRAMES_RULE)) {
      const t = r.cssText;
      for (const k of Object.keys(want)) if (want[k](t)) count[k] = (count[k]||0)+1;
    }
  } };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch(e) { continue; }
    walk(rules);
  }
  return "CSSOM|" + Object.keys(want).map(k=>k+"="+(count[k]||0)).join("|");
})()' 2>/dev/null

echo "--- C. computed styles (light -> dark twins)"
agent-browser eval '(() => {
  const fb = document.querySelector(".footer-band");
  const qb = document.querySelector(".quote-band");
  const wd = document.querySelector(".word-day");
  const hb = document.querySelector(".hero-book");
  const r = {};
  r.footer = fb ? getComputedStyle(fb).backgroundImage.slice(0, 60) : "NO-EL";
  r.quoteMark = qb ? getComputedStyle(qb, "::before").content : "NO-EL";
  r.wordDay = wd ? getComputedStyle(wd).backgroundImage.slice(0, 60) : "NO-EL";
  r.heroAnim = hb ? getComputedStyle(hb, "::after").animationName : "NO-EL";
  return "LIGHT|" + JSON.stringify(r);
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const fb = document.querySelector(".footer-band");
  const wd = document.querySelector(".word-day");
  const qb = document.querySelector(".quote-band");
  const r = {};
  r.footerDark = fb ? getComputedStyle(fb).backgroundImage.slice(0, 70) : "NO-EL";
  r.wordDayDark = wd ? getComputedStyle(wd).backgroundImage.slice(0, 70) : "NO-EL";
  r.quoteMarkDark = qb ? getComputedStyle(qb, "::before").color : "NO-EL";
  return "DARK|" + JSON.stringify(r);
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- D. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- E. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
