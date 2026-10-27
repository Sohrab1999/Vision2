#!/bin/bash
# Task 137 QA — §8.3 wave 3 extraction live proof. Single session.
# 0. freshness: moved rules live in the served bundle (or-* + report-month),
#    exactly once each; the print band stays global (@page A4 intact).
# A. home core (smoke pattern reuse)
# B. CSSOM single-hit walk (official-report token patch / or-table / or-teacher / report-month)
# C. computed styles via injected probe: light painters + dark theme-immunity
#    (the A4 paper must NEVER go dark) + report-month dark twins (#716b63).
# D. mobile 390 OV. E. console 0.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- 0. served-chunk freshness"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  let text="";
  for(const h of links){ try{ text += await fetch(h).then(r=>r.text()); }catch(e){} }
  const overlay=text.includes(".official-overlay { background-color: rgb(12 10 9 / 0.68); }");
  const teacher=text.includes(".or-teacher { background-color: #faf5ff;");
  const reprint=text.includes("@page { size: A4; margin: 9mm; }");
  const nOrBand=(text.match(/\.or-band \{/g)||[]).length;
  const nReportMonth=(text.match(/\.dark \.report-month \{/g)||[]).length;
  const nTokenPatch=(text.match(/--color-emerald-100: #d0fae5/g)||[]).length;
  return "FRESH|overlay="+overlay+"|teacher="+teacher+"|printA4="+reprint+"|orBandDefs="+nOrBand+"|reportMonthDefs="+nReportMonth+"|tokenPatch="+nTokenPatch;
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
    overlay: (s)=>s.trim().startsWith(".official-overlay"),
    report:  (s)=>s.trim().startsWith(".official-report") && s.includes("--color-stone-50"),
    chrome:  (s)=>s.trim().startsWith(".dark .official-chrome"),
    orTable: (s)=>s.trim().startsWith(".or-table th"),
    orTeacher:(s)=>s.trim().startsWith(".or-teacher {"),
    chipFresh:(s)=>s.trim().startsWith(".or-chip-fresh"),
    reportMonth:(s)=>s.trim().startsWith(".dark .report-month {") && s.includes("rgb(28 25 23 / 0.6)"),
    monthInk: (s)=>s.includes(".report-month .text-stone-400") && s.includes("#716b63"),
  };
  const count = {};
  const walk = (rs) => { for (const r of rs) {
    if (r.cssRules) walk(r.cssRules);
    if (r.selectorText) {
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

echo "--- C. computed styles via probe (light -> dark theme-immunity)"
agent-browser eval '(() => {
  const host=document.createElement("div");
  host.innerHTML=`<div class="official-report" id=p-or><div class="or-band" id=p-band></div><div class="or-kpi" id=p-kpi></div><div class="or-teacher" id=p-tch></div><div class="report-month" id=p-mon><span class="text-stone-400" id=p-monink>x</span></div></div>`;
  document.body.appendChild(host);
  const gs=(el,p)=>getComputedStyle(el).getPropertyValue(p);
  const r={};
  r.orBg=gs(document.getElementById("p-or"),"background-color");
  r.bandImg=gs(document.getElementById("p-band"),"background-image").slice(0,40);
  r.kpiBg=gs(document.getElementById("p-kpi"),"background-color");
  r.tchBg=gs(document.getElementById("p-tch"),"background-color");
  r.monBg=gs(document.getElementById("p-mon"),"background-color");
  r.monInk=gs(document.getElementById("p-monink"),"color");
  document.body.removeChild(host);
  return "LIGHT|"+JSON.stringify(r);
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const host=document.createElement("div");
  host.innerHTML=`<div class="official-report" id=p-or><div class="or-kpi" id=p-kpi></div><div class="or-teacher" id=p-tch></div><div class="report-month" id=p-mon><span class="text-stone-400" id=p-monink>x</span></div></div>`;
  document.body.appendChild(host);
  const gs=(el,p)=>getComputedStyle(el).getPropertyValue(p);
  const r={};
  r.orBg=gs(document.getElementById("p-or"),"background-color");
  r.stoneTok=gs(document.getElementById("p-or"),"--color-stone-50").trim();
  r.kpiBg=gs(document.getElementById("p-kpi"),"background-color");
  r.tchBg=gs(document.getElementById("p-tch"),"background-color");
  r.monBg=gs(document.getElementById("p-mon"),"background-color");
  r.monInk=gs(document.getElementById("p-monink"),"color");
  document.body.removeChild(host);
  return "DARK|"+JSON.stringify(r);
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
