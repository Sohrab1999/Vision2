#!/usr/bin/env bash
# ------------------------------------------------------------------
# r288 — QAِ زندهٔ باندِ «نشان‌های نبردی» روی کارتِ کارنامهٔ دفترچه.
# تک‌سشنِ :3000 — بدونِ سوکت و بدونِ joiner (فازِ SETUP دفترچه دارد).
# ① seed: نامِ «سپهر م» + دفترچهٔ ۳نبردی (۲ برد مقابلِ «آرش ر» + ۱ باخت)
#    → rival-hunter (نقره) باز؛ «اولین قدم» (۸ مرورِ امروز) همگانیِ باز
# ② open-duel → دکمهٔ «گرفتن عکس کارنامهٔ نبردها»
# ③ رهگیریِ URL.createObjectURL (خودِ Blob — درسِ r287) → کلیک → کپچر
# ④ توستِ Radix «عکسِ کارنامهٔ نبردها ذخیره شد» ([role=status] — درسِ r283)
# ⑤ بیت‌مپ: ۱۰۸۰×۷۶۰ (هندسهٔ r288) + پیکسل‌سنجیِ باند:
#    نقره (#f1f5f9) باید هست؛ برنز (#ffedd5) باید نیست (منفیِ «اولین قدم»)
# ⑥ اورلی + اسکرین‌شات + DOC-OVERFLOW در ۳۹۰
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"

echo "--- A. fresh page"
agent-browser open "$BASE" >/dev/null 2>&1
sleep 3
agent-browser eval '(()=>{ localStorage.clear(); sessionStorage.clear(); return "cleared"; })()' >/dev/null 2>&1

echo "--- B. seed: named + 3-record ledger (rival-hunter live) + 8 reviews today (first-step live)"
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
      mk("r288a",dayKey(4),"win","آرش ر",1200,500,8),
      mk("r288b",dayKey(2),"win","آرش ر",1100,400,8),
      mk("r288c",dayKey(1),"loss","سینا",600,1000,7)
    ]
  },version:0}));
  return "seeded-ledger";
})()'
agent-browser open "$BASE" >/dev/null 2>&1
sleep 5

echo "--- C. duel view → ledger button reachable"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()' >/dev/null 2>&1
sleep 2
BTN=$(agent-browser eval '(()=>{
  const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent!==null&&(x.getAttribute("aria-label")||"").includes("گرفتن عکس کارنامهٔ نبردها"));
  return b?"LEDGER-BTN-OK":"LEDGER-BTN-MISSING";
})()' 2>/dev/null)
BTN="${BTN//\"/}"
echo "button: $BTN"
case "$BTN" in LEDGER-BTN-OK) ;; *) echo "QA-FAILED: $BTN"; exit 1 ;; esac

echo "--- D. intercept createObjectURL → click → capture (keep the Blob — r287 lesson)"
agent-browser eval '(()=>{
  window.__cardCaptures=[];
  if(!window.__origCOU){ window.__origCOU=URL.createObjectURL.bind(URL);
    URL.createObjectURL=(b)=>{ const u=window.__origCOU(b); window.__cardCaptures.push({size:b.size,type:b.type,blob:b}); return u; }; }
  const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent!==null&&(x.getAttribute("aria-label")||"").includes("گرفتن عکس کارنامهٔ نبردها"));
  if(!b) return "NO-BTN";
  b.click(); return "clicked";
})()' >/dev/null 2>&1
sleep 3
agent-browser eval '(()=>{
  const t=[...document.querySelectorAll("[role=status]")].map(d=>d.textContent||"").join(" | ");
  const caps=(window.__cardCaptures||[]).map(c=>({size:c.size,type:c.type}));
  return JSON.stringify({ captures: caps.length, last: caps[caps.length-1]||null, toast: t.slice(0,160) });
})()' 2>/dev/null

echo "--- E. decode: dims must be 1080×760 (r288 band zone)"
agent-browser eval '(async()=>{
  const cap=(window.__cardCaptures||[]).slice(-1)[0];
  if(!cap) return JSON.stringify({ok:false,why:"no-capture"});
  const bmp=await createImageBitmap(cap.blob);
  window.__cardBitmap=bmp;
  return JSON.stringify({ok:true,dims:{w:bmp.width,h:bmp.height}});
})()' 2>/dev/null

echo "--- F. pixel census on the band rect (y 544..642): silver yes / bronze no / green pill yes"
agent-browser eval '(async()=>{
  const bmp=window.__cardBitmap; if(!bmp) return JSON.stringify({ok:false,why:"no-bitmap"});
  const cv=document.createElement("canvas"); cv.width=bmp.width; cv.height=bmp.height;
  const cx=cv.getContext("2d"); cx.drawImage(bmp,0,0);
  const d=cx.getImageData(70,544,1080-140,98).data; // همان هندسهٔ باند: x=70,y=544,w=940,h=98
  let silver=0, bronze=0, gold=0, pill=0;
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2];
    if(r===241&&g===245&&b===249) silver++;        // slate[100] — چیپِ «شکارچیِ رقیب»
    else if(r===255&&g===237&&b===213) bronze++;   // orange[100] — «اولین قدم» ممنوع
    else if(r===254&&g===249&&b===195) gold++;     // yellow[100] — خانواده فعلاً ندارد
    else if(r===240&&g===253&&b===244) pill++;     // green[50] — قرصِ شمارنده
  }
  return JSON.stringify({ok:true,silver,bronze,gold,pill});
})()' 2>/dev/null

echo "--- G. overlay the real card for visual proof"
agent-browser eval '(()=>{
  const bmp=window.__cardBitmap; if(!bmp) return "no-bitmap";
  document.querySelectorAll(".__r288-card-overlay").forEach(n=>n.remove());
  const ov=document.createElement("div");
  ov.className="__r288-card-overlay";
  ov.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;";
  const cv=document.createElement("canvas");
  cv.width=bmp.width; cv.height=bmp.height;
  cv.style.cssText="max-width:96vw;max-height:96vh;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.5)";
  cv.getContext("2d").drawImage(bmp,0,0);
  ov.appendChild(cv); document.body.appendChild(ov);
  return "overlay-up";
})()' 2>/dev/null
sleep 1
agent-browser screenshot --filename /tmp/r288-card-overlay.png >/dev/null 2>&1 || agent-browser screenshot /tmp/r288-card-overlay.png >/dev/null 2>&1 || true
ls -la /tmp/r288-card-overlay.png 2>/dev/null || echo "screenshot missing"

echo "--- H. toast gate (ok path ⇒ duel_ledger_image fired — قراردادِ r286/287)"
agent-browser eval '(()=>{
  const t=[...document.querySelectorAll("[role=status]")].map(d=>d.textContent||"").find(x=>x.includes("کارنامهٔ نبردها"));
  return t?"TOAST-OK":"TOAST-MISSING";
})()' 2>/dev/null

echo "--- I. mobile 390: DOC-OVERFLOW + console"
agent-browser setviewport 390 844 >/dev/null 2>&1 || agent-browser viewport 390 844 >/dev/null 2>&1 || true
sleep 2
agent-browser eval '(()=>{ document.querySelectorAll(".__r288-card-overlay").forEach(n=>n.remove()); return "overlay-down"; })()' >/dev/null 2>&1
agent-browser eval '(()=>{ const ofl=document.documentElement.scrollWidth>window.innerWidth; return "DOC-OVERFLOW="+ofl+" sw="+document.documentElement.scrollWidth; })()' 2>/dev/null
