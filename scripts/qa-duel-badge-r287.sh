#!/usr/bin/env bash
# r287 — single-session QA: badge band on the duel-done share card.
# ① open :81 (duel sockets ride the Caddy XTransformPort proxy — r94 idiom)
# ② skip intro → seed flagged store (userName «میلاد ن» + first-visible flag
#    + today activity + 2 wins vs امیرمحمد → rival-hunter unlocks) → reload
# ③ duel view → create room → scripted joiner (r94 joiner plays all 10) →
#    browser auto-answers → match ends → receipt chip live
# ④ intercept URL.createObjectURL → click «عکسِ این نبرد» → capture blob →
#    createImageBitmap → assert 1080×740 (r287 grew 640→740 for the band) →
#    overlay the real card → screenshot = visual proof of the band
# ⑤ Radix toast «🖼 عکسِ این نبرد ذخیره شد» ([role=status] — r283 lesson) =
#    ok=true path = duel_image event fired (same gate)
# ⑥ mobile 390 overflow (authoritative DOC-OVERFLOW) ⑦ console clean.
# Local-only seed — zero server rows besides the real duel flow (cleaned later).
set -e
BASE="http://127.0.0.1:81"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r287-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r287-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r287-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed flagged store (name + first-visible + today + rival wins)"
agent-browser eval '(()=>{
  const dayKey=(n)=>{const d=new Date(Date.now()-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const today=dayKey(0);
  const raw=localStorage.getItem("vision2-study-v1");
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state.userName="میلاد ن";
  obj.state.onboarded=true;
  obj.state.seenBadges=["first-visible"];
  obj.state.dayStat={day:today,reviews:8,quizzes:0,words:0,dictation:0,rush:0};
  obj.state.dayHistory={[today]:{day:today,reviews:8,quizzes:0,words:0,dictation:0,rush:0}};
  const mk=(id,day,outcome,opponent,myScore,oppScore,myCorrect,sig)=>({ id, day, outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore, oppScore, myCorrect, oppCorrect:3, answered:10, total:10, durationSec:80, ...(sig?{receiptSig:sig}:{}) });
  obj.state.duelHistory=[
    mk("r287a",dayKey(3),"win","امیرمحمد",1200,500,8,"a".repeat(64)),
    mk("r287b",dayKey(1),"win","امیرمحمد",1100,400,8)
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-flagged-duel";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. duel view + create room"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 2.5
CREF=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "ساخت اتاق نبرد" \[[^]]*ref=(e[0-9]+)\]' | grep -oE 'e[0-9]+' | head -1)
if [ -z "$CREF" ]; then echo "CREATE-BUTTON-NOT-FOUND"; agent-browser snapshot | grep -E 'ساخت اتاق' | head -3; exit 1; fi
agent-browser click "$CREF" >/dev/null
sleep 2
CODE=$(agent-browser snapshot 2>/dev/null | grep -oE 'کد اتاق [A-Z2-9]{5}' | grep -oE '[A-Z2-9]{5}' | head -1)
if [ -z "$CODE" ]; then echo "ROOM-CODE-FAIL"; exit 1; fi
echo "room created: $CODE ✓"

echo "--- C. scripted opponent (r287 ticketed joiner) + browser auto-answer"
bun scripts/qa-duel-joiner-r287.mjs "$CODE" &
agent-browser eval 'window.__r94 = setInterval(() => {
  const root = document.querySelector("[class*=duel-play]") || document;
  const btns = [...root.querySelectorAll("button")].filter(b => b.className.includes("border-2") && b.offsetParent !== null && b.textContent.trim().length > 0 && b.textContent.trim().length < 120);
  if (btns.length >= 4) btns[0].click();
}, 1150); "loop-started"'
for i in $(seq 1 40); do
  sleep 3
  agent-browser snapshot >/tmp/r287-done.txt 2>/dev/null || true
  if grep -q 'کارنامهٔ نبرد' /tmp/r287-done.txt; then break; fi
done
agent-browser eval 'clearInterval(window.__r94); "loop-cleared"' >/dev/null
if grep -q 'کارنامهٔ نبرد' /tmp/r287-done.txt; then echo "DUEL-DONE-REACHED ✓"; else echo "DUEL-DONE-MISSING"; exit 1; fi

echo "--- D. badge evaluation live: rival-hunter must be unlocked in store"
agent-browser eval '(()=>{
  const raw=localStorage.getItem("vision2-study-v1");
  const st=raw?JSON.parse(raw)?.state:{};
  return JSON.stringify({ userName: st.userName||"", seenBadges: st.seenBadges||[], ledger: (st.duelHistory||[]).length });
})()'

echo "--- E. intercept createObjectURL → click «عکسِ این نبرد» → capture blob"
# نکتهٔ r287: URL بعد از دانلود revoke میشود — خودِ Blob را نگه میداریم
# (Blob مستقل از URL زندگی میکند) — واکشیِ blob: در F بی‌معنا میشد.
agent-browser eval '(()=>{
  window.__cardCaptures=[];
  if(!window.__origCOU){ window.__origCOU=URL.createObjectURL.bind(URL);
    URL.createObjectURL=(b)=>{ const u=window.__origCOU(b); window.__cardCaptures.push({u,size:b.size,type:b.type,blob:b}); return u; }; }
  const btns=[...document.querySelectorAll("button")].filter(b=>b.offsetParent!==null&&b.textContent.includes("عکسِ این نبرد"));
  if(!btns.length) return JSON.stringify({btn:false});
  btns[0].click(); return JSON.stringify({btn:true});
})()'
sleep 3
agent-browser eval '(()=>{
  const t=[...document.querySelectorAll("[role=status]")].map(d=>d.textContent||"").join(" | ");
  const caps=(window.__cardCaptures||[]).map(c=>({size:c.size,type:c.type}));
  return JSON.stringify({ captures: caps.length, last: caps[caps.length-1]||null, toast: t });
})()'

echo "--- F. decode real card: dimensions must be 1080×740 (r287 band zone)"
agent-browser eval '(async()=>{
  const cap=(window.__cardCaptures||[]).slice(-1)[0];
  if(!cap) return JSON.stringify({ok:false,why:"no-capture"});
  const bmp=await createImageBitmap(cap.blob);
  const dims={w:bmp.width,h:bmp.height};
  window.__cardBitmap=bmp;
  return JSON.stringify({ok:true,dims});
})()'

echo "--- G. overlay the real card for visual proof"
agent-browser eval '(()=>{
  const bmp=window.__cardBitmap; if(!bmp) return "no-bitmap";
  document.querySelectorAll(".__r287-card-overlay").forEach(n=>n.remove());
  const ov=document.createElement("div");
  ov.className="__r287-card-overlay";
  ov.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;";
  const cv=document.createElement("canvas");
  cv.width=bmp.width; cv.height=bmp.height;
  cv.style.cssText="max-width:96vw;max-height:96vh;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.5)";
  cv.getContext("2d").drawImage(bmp,0,0);
  ov.appendChild(cv); document.body.appendChild(ov);
  return "overlay-up";
})()'
sleep 1
agent-browser screenshot --filename /tmp/r287-card-overlay.png >/dev/null 2>&1 || agent-browser screenshot /tmp/r287-card-overlay.png >/dev/null 2>&1 || true

echo "--- H. toast check (ok path ⇒ duel_image fired)"
agent-browser eval '(()=>{
  const t=[...document.querySelectorAll("[role=status]")].map(d=>d.textContent||"").join(" | ");
  return JSON.stringify({ okToast: t.includes("عکسِ این نبرد ذخیره شد"), toast: t });
})()'
agent-browser eval '(()=>{ document.querySelectorAll(".__r287-card-overlay").forEach(n=>n.remove()); return "overlay-down"; })()' >/dev/null

echo "--- I. mobile 390 overflow (authoritative doc-level)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(()=>{ const ofl=document.documentElement.scrollWidth>window.innerWidth; return JSON.stringify({ "DOC-OVERFLOW": ofl, w: window.innerWidth, sw: document.documentElement.scrollWidth }); })()'

echo "--- J. console errors"
agent-browser console 2>/dev/null | grep -iE "error" | grep -v "Download the React DevTools" | head -4
echo "QA-DUEL-BADGE-R287-DONE"
