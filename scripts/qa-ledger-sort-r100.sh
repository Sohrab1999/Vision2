#!/usr/bin/env bash
# Task 100 — single-session QA: «دفترچهٔ مرتب» (sort chips) + خانوادهٔ «سرعت» live.
# ① skip intro ② seed 8-record ledger (4 fast wins vs 4 distinct rivals + fast tie —
#   speed avg ≈۹۴ with 26 corrects; NO rival-family unlock: max 1 win per name)
# ③ sort panel: default 5 rows + expander → «بیشترین امتیاز» auto-expands 8 rows
#   ordered by score → «بیشترین اختلاف» heavy-win top / heavy-loss bottom
#   → «جدیدترین» restores 5-row view → search+sort combine → clear button
# ④ badges panel: صاعقه (Zap) + سرعتِ صوت (Rocket) shine, chip «۲ از ۴۶», 46 tiles,
#   rival tiles stay locked (honest grouping)
# ⑤ mobile 390 overflow 0 (home + duel) ⑥ console clean. Local-only seed — no server rows.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r100-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r100-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r100-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed ledger: 4 fast wins vs 4 distinct rivals + fast tie + 3 forfeit/slow losses"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  const dayKey=(n)=>{const d=new Date(now-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const mk=(id,outcome,opponent,myScore,oppScore,myCorrect,reason)=>({ id, day:dayKey(reason==="forfeit"?2:0), outcome, reason:reason||"finished", opponent,
    opponentColor:"rose", myScore, oppScore, myCorrect, oppCorrect:3, answered:10, total:10, durationSec:80 });
  obj.state.duelWins=4; obj.state.duelLosses=3; obj.state.duelTies=1;
  obj.state.duelHistory=[
    mk("r1","loss","سینا",0,1500,0,"forfeit"),
    mk("r2","win","سینا",950,100,5),
    mk("r3","loss","سینا",0,1000,0,"forfeit"),
    mk("r4","win","امیرمحمد",950,500,5),
    mk("r5","win","پریسا",950,500,5),
    mk("r6","loss","پریسا",300,700,3),
    mk("r7","win","امیر رضا",1000,350,5),
    mk("r8","tie","نیما",1200,1200,6)
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-sort-speed";
})()'
agent-browser open "$BASE" >/dev/null
sleep 5

echo "--- B. duel panel: default 5 rows + expander"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 3
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  if(!panel) return JSON.stringify({panel:false});
  const rows=panel.querySelectorAll(".space-y-2 > div").length;
  const exp=[...panel.querySelectorAll("button")].find(b=>/نمایش همهٔ/.test(b.textContent||""));
  const sortGroup=panel.querySelector("[aria-label=\"مرتب‌سازی نبردها\"]");
  const chip=(t)=>[...(sortGroup?sortGroup.querySelectorAll("button"):[])].find(b=>b.textContent.trim()===t);
  return JSON.stringify({
    panel:true, rows, expander: !!exp,
    sortGroup: !!sortGroup,
    newestPressed: chip("جدیدترین")?.getAttribute("aria-pressed") ?? null,
    scorePressed: chip("بیشترین امتیاز")?.getAttribute("aria-pressed") ?? null,
    marginPressed: chip("بیشترین اختلاف")?.getAttribute("aria-pressed") ?? null
  });
})()'

echo "--- C. sort by myScore: auto-expand 8 rows, 1200 top / 0 bottom, expander gone"
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const btn=[...panel.querySelectorAll("button")].find(b=>b.textContent.trim()==="بیشترین امتیاز");
  btn.click();
  return "clicked";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const rowEls=[...panel.querySelectorAll(".space-y-2 > div")];
  const sc=(r)=>r.querySelector("div[dir=\"ltr\"]")?.textContent ?? "";
  const exp=[...panel.querySelectorAll("button")].find(b=>/نمایش همهٔ/.test(b.textContent||""));
  const b=[...panel.querySelectorAll("button")].find(x=>x.textContent.trim()==="بیشترین امتیاز");
  return JSON.stringify({ rows: rowEls.length, top: sc(rowEls[0]), bottom: sc(rowEls[rowEls.length-1]),
    expanderGone: !exp, pressed: b?.getAttribute("aria-pressed") });
})()'

echo "--- D. sort by margin: heavy win top (950-100), heavy loss bottom (0-1500)"
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  [...panel.querySelectorAll("button")].find(b=>b.textContent.trim()==="بیشترین اختلاف").click();
  return "clicked";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const rowEls=[...panel.querySelectorAll(".space-y-2 > div")];
  const sc=(r)=>r.querySelector("div[dir=\"ltr\"]")?.textContent ?? "";
  return JSON.stringify({ seq: rowEls.map(sc) });
})()'

echo "--- E. back to newest: 5 rows + expander restored"
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  [...panel.querySelectorAll("button")].find(b=>b.textContent.trim()==="جدیدترین").click();
  return "clicked";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const rows=panel.querySelectorAll(".space-y-2 > div").length;
  const exp=[...panel.querySelectorAll("button")].find(b=>/نمایش همهٔ ۸ نبرد/.test(b.textContent||""));
  return JSON.stringify({ rows, expanderBack: !!exp });
})()'

echo "--- F. combine: search «امیر» + sort by score → 2 rows ordered + status line"
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const input=panel.querySelector("input[aria-label=\"جست‌وجو در تاریخچهٔ نبردها\"]");
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
  setter.call(input,"امیر");
  input.dispatchEvent(new Event("input",{bubbles:true}));
  return "typed";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  [...panel.querySelectorAll("button")].find(b=>b.textContent.trim()==="بیشترین امتیاز").click();
  return "clicked";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const rowEls=[...panel.querySelectorAll(".space-y-2 > div")];
  const sc=(r)=>r.querySelector("div[dir=\"ltr\"]")?.textContent ?? "";
  const status=panel.querySelector("[role=\"status\"]");
  return JSON.stringify({ rows: rowEls.length, seq: rowEls.map(sc),
    status: status?status.textContent.trim():null });
})()'

echo "--- G. clear from sort row: everything resets"
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const clears=[...panel.querySelectorAll("button")].filter(b=>/پاک‌کردن فیلترها/.test(b.textContent||""));
  if(clears.length!==1) return JSON.stringify({clearButtons: clears.length, err:"expected exactly 1"});
  clears[0].click();
  return "cleared";
})()'
sleep 1
agent-browser eval '(()=>{
  const panel=[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها");
  const input=panel.querySelector("input[aria-label=\"جست‌وجو در تاریخچهٔ نبردها\"]");
  return JSON.stringify({ rows: panel.querySelectorAll(".space-y-2 > div").length,
    inputValue: input?input.value:null,
    expanderBack: !![...panel.querySelectorAll("button")].find(b=>/نمایش همهٔ ۸ نبرد/.test(b.textContent||"")) });
})()'

echo "--- H. badges panel: speed tiles shine + Rocket/Zap SVG + chip «۲ از ۴۶» + rival locked"
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser eval '(()=>{
  const sec=document.querySelector(".badge-section");
  if(!sec) return JSON.stringify({secFound:false});
  const tile=(t)=>{const el=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));return el?{shine:el.className.includes("badge-shine")}:null;};
  const svgFor=(t)=>{const el=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));
    if(!el) return null; const s=el.querySelector("svg"); return s?s.getAttribute("class"):null;};
  const chip=[...sec.querySelectorAll("span")].map(s=>s.textContent).find(t=>t&&/از ۴۶/.test(t));
  const prog=(t)=>{const el=[...sec.querySelectorAll(".badge-card")].find(c=>c.textContent.includes(t));return el?el.textContent.match(/[۰-۹]+ از [۰-۹]+ [^نب]/)?.[0]:null;};
  return JSON.stringify({
    bolt: tile("صاعقه"), sound: tile("سرعتِ صوت"),
    hunter: tile("شکارچیِ رقیب"),
    boltSvg: (svgFor("صاعقه")||"").includes("lucide-zap"),
    soundSvg: (svgFor("سرعتِ صوت")||"").includes("lucide-rocket"),
    chip: chip?chip.trim():null, tiles: sec.querySelectorAll(".badge-card").length
  });
})()'

echo "--- I. mobile 390 overflow (duel view + home)"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel"; })()'
sleep 2
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ view:"duel", w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-home")); return "home"; })()' >/dev/null 2>&1
sleep 2
agent-browser eval '(() => ({ view:"home", w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- J. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-R100-DONE"
