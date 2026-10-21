#!/usr/bin/env bash
# ------------------------------------------------------------------
# r290 — QAِ زندهٔ «کتاب‌خانهٔ داستان‌ها» (سه کتابِ Hill، ۲۴ داستان).
# ① خانه → کارتِ ابزار «کتاب‌خانهٔ داستان‌ها» → ویؤ کتاب‌خانه (۳ کتاب، ۰ از ۲۴)
# ② بازکردنِ s1-1 → متنِ LTR + واژه‌نامه + ۶ پرسشِ صحیح/غلط
# ③ پاسخ‌دادنِ هر ۶ پرسش → کارتِ نمره + توستِ رادیکس ([role=status]) + تیکِ فهرست
# ④ اسکرین‌شاتِ ۱۲۸۰ روشن + سوییچِ ۳۹۰ تاریک با openِ تازه (DOM نو — الزامی)
# ⑤ سرریزِ سند + خطایِ کنسول
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"

echo "--- A. fresh open + home census"
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
agent-browser eval '(()=>{ localStorage.clear(); sessionStorage.clear(); return "cleared"; })()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1
sleep 4
agent-browser eval '(()=>{
  const card=[...document.querySelectorAll("button")].find(b=>(b.textContent||"").includes("کتاب‌خانهٔ داستان‌ها"));
  if(!card) return JSON.stringify({ok:false,why:"no-home-card"});
  card.click();
  return JSON.stringify({ok:true,clicked:"home-tool"});
})()' 2>/dev/null
sleep 3
echo "--- B. library view census"
agent-browser eval '(()=>{
  const secs=[...document.querySelectorAll("section[aria-label]")].map(s=>s.getAttribute("aria-label"));
  const books=secs.filter(l=>l&&l.includes("داستان‌های بازگوکردنی"));
  const pill=document.querySelector("[aria-label=\"پیشرفت کل کتاب‌خانه\"]")?.textContent||"";
  const rows=document.querySelectorAll("ul[role=list] li button[dir=ltr], ul[role=list] li button").length;
  return JSON.stringify({books:books.length,pill,rows});
})()' 2>/dev/null

echo "--- C. open story s1-1 → answer all TF"
agent-browser eval '(()=>{
  const row=[...document.querySelectorAll("button")].find(b=>(b.textContent||"").includes("Mr Jones"));
  if(!row) return JSON.stringify({ok:false,why:"no-story-row"});
  row.click();
  return JSON.stringify({ok:true,opened:"s1-1"});
})()' 2>/dev/null
sleep 2
agent-browser eval '(()=>{
  const text=document.querySelector("div[dir=ltr][class*=font-serif]");
  const gloss=[...document.querySelectorAll("li")].filter(l=>l.textContent?.includes("|")).length;
  const tfSec=document.querySelector("section[aria-label=\"بخش صحیح یا نادرست\"]");
  const qs=tfSec?tfSec.querySelectorAll("li").length:0;
  return JSON.stringify({hasText:!!text,textLen:(text?.textContent||"").length,glossChips:gloss,tfQuestions:qs});
})()' 2>/dev/null
# پاسخ: درست،نادرست،نادرست،درست،درست،نادرست → انتظارِ ۵ از ۶
agent-browser eval '(()=>{
  const sec=document.querySelector("section[aria-label=\"بخش صحیح یا نادرست\"]");
  if(!sec) return "no-section";
  const rows=[...sec.querySelectorAll("li")];
  const plan=[true,false,false,true,true,false];
  for(let i=0;i<rows.length;i++){
    const label=plan[i]?"درست":"نادرست";
    const btn=[...rows[i].querySelectorAll("button")].find(b=>(b.textContent||"").trim()===label);
    if(btn) btn.click();
  }
  return "answered-"+rows.length;
})()' 2>/dev/null
sleep 2
echo "--- D. score card + toast + list tick"
agent-browser eval '(()=>{
  const role=[...document.querySelectorAll("[role=status]")].map(d=>(d.textContent||"").slice(0,60));
  const score=[...document.querySelectorAll("p")].find(p=>(p.textContent||"").includes("نمرهٔ تو"))?.textContent||"";
  const tick=[...document.querySelectorAll("li")].some(l=>(l.textContent||"").includes("Mr Jones")&&(l.textContent||"").includes("از"));
  return JSON.stringify({roleStatuses:role,score,tickInList:tick});
})()' 2>/dev/null

echo "--- E. screenshot 1280 light (reader)"
agent-browser eval '(()=>{ const s=document.querySelector("section[aria-label=\"بخش صحیح یا نادرست\"]"); if(s) s.scrollIntoView({block:"center"}); return "scrolled"; })()' >/dev/null 2>&1
sleep 1
agent-browser screenshot --filename /tmp/r290-reader-1280.png >/dev/null 2>&1 || agent-browser screenshot /tmp/r290-reader-1280.png >/dev/null 2>&1 || true
ls -la /tmp/r290-reader-1280.png 2>/dev/null || echo "screenshot missing"

echo "--- F. mobile 390 dark: fresh open (حادثهٔ سوییچِ ۳۹۰ را با open تازه دور می‌زنیم)"
agent-browser eval '(()=>{ localStorage.setItem("vision2-theme","dark"); return "theme-dark"; })()' >/dev/null 2>&1
agent-browser viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1
sleep 4
agent-browser eval '(()=>{ const vp=window.innerWidth; const ofl=document.documentElement.scrollWidth>vp; return JSON.stringify({vp,DOC_OVERFLOW:ofl,sw:document.documentElement.scrollWidth}); })()' 2>/dev/null
agent-browser eval '(()=>{
  const card=[...document.querySelectorAll("button")].find(b=>(b.textContent||"").includes("کتاب‌خانهٔ داستان‌ها"));
  if(!card) return JSON.stringify({lib:false});
  card.click();
  return JSON.stringify({lib:true,clicked:true});
})()' 2>/dev/null
sleep 3
agent-browser eval '(()=>{
  const vp=window.innerWidth;
  const ofl=document.documentElement.scrollWidth>vp;
  const pill=document.querySelector("[aria-label=\"پیشرفت کل کتاب‌خانه\"]")?.textContent||"";
  return JSON.stringify({vp,DOC_OVERFLOW:ofl,pill});
})()' 2>/dev/null
agent-browser screenshot --filename /tmp/r290-library-390.png >/dev/null 2>&1 || agent-browser screenshot /tmp/r290-library-390.png >/dev/null 2>&1 || true
ls -la /tmp/r290-library-390.png 2>/dev/null || echo "screenshot missing"
echo "--- G. console errors"
agent-browser console 2>/dev/null | tail -6
