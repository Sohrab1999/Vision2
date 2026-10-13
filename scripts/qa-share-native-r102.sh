#!/usr/bin/env bash
# Task 102 — single-session QA: هم‌رسانیِ بومیِ کارت‌ها (Web Share L2).
# ① skip intro ② seed 3-record ledger + userName (localStorage-only)
# ③ real env (linux headless): navigator.share absent → share button HIDDEN,
#   export button present (honest progressive enhancement)
# ④ stub canShare+share → re-render via search-box keystroke → share button VISIBLE
# ⑤ click share → stub captures REAL File (name/type/size from real canvas PNG)
#   + title/text honest → toast «کارنامه هم‌رسانی شد»
# ⑥ AbortError stub → cancelled → SILENT (no toast) ⑦ generic reject → failed toast
# ⑧ mobile 390 overflow 0 ⑨ console clean ⑩ DB hygiene via node cleanup.
# duel-done live needs a real match end → covered by component tests (r99/r101 precedent).
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r102-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r102-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r102-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed: 3-record ledger + userName (localStorage only)"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const dayKey=(()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");})();
  const mk=(id,outcome,opponent,myScore,oppScore,myCorrect)=>({ id, day:dayKey, outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore, oppScore, myCorrect, oppCorrect:3, answered:10, total:10, durationSec:80 });
  obj.state.userName="میلاد";
  obj.state.duelHistory=[ mk("s1","win","امیرمحمد",1200,500,8), mk("s2","loss","سینا",600,900,3), mk("s3","win","امیر محمد",900,400,6) ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. real env: share ABSENT (linux headless), export present"
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel")); "duel"'
sleep 3
agent-browser eval '(()=>{
  const share=document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]");
  const save=document.querySelector("button[aria-label=\"گرفتن عکس کارنامهٔ نبردها\"]");
  return JSON.stringify({ shareType: typeof navigator.share, canShareType: typeof navigator.canShare,
    shareBtn: !!share, saveBtn: !!save, saveEnabled: save ? !save.disabled : null });
})()'

echo "--- C. stub canShare+share → re-render via search keystroke → share VISIBLE"
agent-browser eval '(()=>{
  Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
  Object.defineProperty(navigator, "share", { configurable: true, value: (d) => {
    window.__shareCalls = window.__shareCalls || [];
    window.__shareCalls.push(d);
    return (window.__shareMode === "abort") ? Promise.reject(new DOMException("user aborted", "AbortError"))
         : (window.__shareMode === "reject") ? Promise.reject(new Error("boom"))
         : Promise.resolve();
  }});
  const inp=document.querySelector("input[aria-label=\"جست‌وجو در تاریخچهٔ نبردها\"]");
  if(!inp) return "no-search-input";
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
  setter.call(inp," ");
  inp.dispatchEvent(new Event("input",{bubbles:true}));
  return "stubbed+rerendered";
})()'
sleep 1
agent-browser eval '(()=>{
  const share=document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]");
  return JSON.stringify({ shareBtn: !!share, title: share ? share.getAttribute("title") : null });
})()'

echo "--- D. click share → REAL File captured + success toast"
agent-browser eval '(()=>{ window.__shareMode="ok"; window.__shareCalls=[]; const b=document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]"); b.click(); return "clicked"; })()'
sleep 2
agent-browser eval '(()=>{
  const c = window.__shareCalls || [];
  const f = c[0] && c[0].files && c[0].files[0];
  const t = document.body.innerText;
  return JSON.stringify({ calls: c.length, name: f && f.name, type: f && f.type, size: f && f.size,
    title: c[0] && c[0].title, text: c[0] && c[0].text,
    toast: /کارنامه هم‌رسانی شد/.test(t),
    btnEnabled: !document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]").disabled });
})()'

echo "--- E. AbortError → cancelled → SILENT"
agent-browser eval '(()=>{ window.__shareMode="abort"; const b=document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]"); b.click(); return "clicked"; })()'
sleep 2
agent-browser eval '(()=>{
  const t = document.body.innerText;
  return JSON.stringify({ calls: (window.__shareCalls||[]).length,
    toastError: /هم‌رسانی ممکن نشد/.test(t), toastOk: /کارنامه هم‌رسانی شد/.test(t),
    btnEnabled: !document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]").disabled });
})()'

echo "--- F. generic reject → failed toast"
agent-browser eval '(()=>{ window.__shareMode="reject"; const b=document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]"); b.click(); return "clicked"; })()'
sleep 2
agent-browser eval '(()=>{
  const t = document.body.innerText;
  return JSON.stringify({ toastError: /هم‌رسانی ممکن نشد/.test(t), hint: /ذخیره کنی و خودت بفرستی/.test(t),
    btnEnabled: !document.querySelector("button[aria-label=\"هم‌رسانی کارنامهٔ نبردها\"]").disabled });
})()'

echo "--- G. mobile 390 overflow (duel view with share button)"
agent-browser set viewport 390 844 >/dev/null 2>&1 || true
sleep 1
agent-browser eval '(()=>{ const d=document.documentElement; return JSON.stringify({ sw: d.scrollWidth, cw: d.clientWidth, overflow: d.scrollWidth - d.clientWidth }); })()'
agent-browser set viewport 1280 800 >/dev/null 2>&1 || true

echo "--- H. console errors (whole session)"
agent-browser console | grep -icE "error" || true
agent-browser close >/dev/null 2>&1 || true
echo "--- DONE"
