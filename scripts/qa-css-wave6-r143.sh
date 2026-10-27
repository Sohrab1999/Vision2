#!/bin/bash
# Task 143 QA — CSS wave 6: the report print-button dark pair lives beside its
# owner (reports/report-card.css). Single session.
# A. report card open → light probe (bg-white utility untouched) → dark probe
#    (bg #1c1917, border rgba(4,120,87,0.6), ink #6ee7b7 — from the migrated
#    rules) + dialog dark regression (.report-dialog #1c1917)
# B. bundle freshness: migrated heads ×1 each; print band ×1
# C. CSSOM single-hit: btn + :hover + dialog = 1 each; print band = 1
# D. mobile 390 OV   E. console 0   F. strip seed. DB: open-only → r101 clean.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A0. minimal seed (skip intro) + open report card"
agent-browser eval '
(() => {
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r143-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, { introDone: true, onboarded: true, userName: "آزمون‌گر" });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-report")); "OPENED";' 2>/dev/null
sleep 2

echo "--- A1. light: print button keeps utility skin (bg-white + emerald-300 border)"
agent-browser eval '
(() => {
  const btn = document.querySelector(".report-print-btn");
  if (!btn) return "NO-BTN";
  const cs = getComputedStyle(btn);
  return JSON.stringify({ lightBg: cs.backgroundColor, lightBorder: cs.borderColor, lightInk: cs.color });
})()' 2>/dev/null

echo "--- A2. dark: migrated painters from report-card.css"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '
(() => {
  const btn = document.querySelector(".report-print-btn");
  const dialog = document.querySelector(".report-dialog");
  if (!btn || !dialog) return "MISSING";
  const bs = getComputedStyle(btn);
  const ds = getComputedStyle(dialog);
  return JSON.stringify({
    btnBg: bs.backgroundColor,
    btnBorder: bs.borderColor,
    btnInk: bs.color,
    dialogBg: ds.backgroundColor,
  });
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- B. bundle freshness (fetched text, per-head count)"
agent-browser eval '(async () => {
  const links=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  const out={};
  for(const h of links){
    try{ const t=await fetch(h).then(r=>r.text());
      const btn=(t.match(/\.dark \.report-print-btn \{/g)||[]).length;
      const hover=(t.match(/\.dark \.report-print-btn:hover \{/g)||[]).length;
      const dialog=(t.match(/\.dark \.report-dialog \{/g)||[]).length;
      const band=(t.match(/body\.print-report \.report-paper/g)||[]).length;
      if(btn+hover+dialog+band>0){ out[h.slice(-40)]={btn,hover,dialog,band}; }
    }catch(e){}
  }
  return JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit across all sheets"
agent-browser eval '
(() => {
  const counts={btn:0,hover:0,dialog:0,printBand:0};
  for(const sheet of document.styleSheets){
    let rules; try{ rules=sheet.cssRules; }catch(e){ continue; }
    const walk=(list)=>{ for(const r of list){
      const t=r.cssText||"";
      if(/^\.dark \.report-print-btn \{/.test(t.trim()) || t.startsWith(".dark .report-print-btn {")) counts.btn++;
      if(t.startsWith(".dark .report-print-btn:hover {")) counts.hover++;
      if(/^\.dark \.report-dialog \{/.test(t.trim())) counts.dialog++;
      if(t.includes("body.print-report .report-paper")) counts.printBand++;
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
  const bak = localStorage.getItem("vision2-study-v1-r143-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r143-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA143-DONE"
