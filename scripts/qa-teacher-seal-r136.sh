#!/bin/bash
# Task 136 QA — «هفتهٔ کامل» seal on the week-teacher PNG (4th badge layer).
# Single session. 0. DB event snapshot (review events — surgical cleanup later)
# A. seed rich 7/7 week (dayHistory + goalMetDays + duels + streak; backup kept)
# B. open report → ask the teacher → poll verdict (≤35s) → save button appears
# C. PNG pixel proof (7/7): seal exact emerald-600 (5-pt cross + zone), claim present
# D. reseed 3/7 (activities kept) → again: sealZone=0, claim=0, seal point = track
# E. mobile 390 OV. F. console 0. G. strip seed. H. DB delta cleanup.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1

echo "--- 0. DB event snapshot"
node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const d = new Date();
const day = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
(async () => {
  const rows = await db.eventDay.findMany({ where: { day, name: { in: ['week_review_generated','week_review_fallback'] } } });
  console.log('SNAPSHOT|' + JSON.stringify(rows.map(r => ({ name: r.name, count: r.count }))));
  await db.\$disconnect();
})();
" 2>&1 | tail -1

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed rich 7/7 week"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const ds = (n, c) => Object.assign({ day: k(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r136-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, userName: "آزمون‌گر", onboarded: true, streak: 5,
    goalMetDays: [0,1,2,3,4,5,6].map(k),
    dayHistory: {
      [k(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
      [k(1)]: ds(1, { reviews: 8 }),
      [k(2)]: ds(2, { reviews: 6, words: 2 }),
    },
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED7";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- B. ask the teacher, poll verdict"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const el = document.querySelector(".week-teacher");
  if (!el) return "NO-PANEL";
  const btn = el.querySelector("button[aria-label=\"نظر معلم را برای این هفته بخواه\"]");
  if (!btn) return "NO-ASK-BTN";
  btn.click(); return "ASKED";
})()' 2>/dev/null
DONE="WAIT"
for i in $(seq 1 17); do
  sleep 2
  DONE=$(agent-browser eval '(() => { const el = document.querySelector(".week-teacher"); return el && el.querySelector("[data-week-review]") ? "DONE" : "WAIT"; })()' 2>/dev/null)
  [ "$DONE" = '"DONE"' ] && break
done
echo "VERDICT=$DONE"
agent-browser eval '(() => {
  const el = document.querySelector(".week-teacher");
  const save = el && el.querySelector("button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]");
  return "SAVE_BTN=" + (!!save);
})()' 2>/dev/null

echo "--- C. PNG pixel proof (7/7)"
agent-browser eval '
(() => {
  window.__caps = [];
  URL.createObjectURL = (b) => { window.__caps.push(b); return "blob:cap" + window.__caps.length; };
  HTMLAnchorElement.prototype.click = function () { return undefined; };
  const btn = document.querySelector(".week-teacher button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]");
  if (!btn) return "NO-SAVE-BTN";
  btn.click(); return "CLICKED";
})()' 2>/dev/null
agent-browser eval '
(async () => {
  for (let i = 0; i < 60; i++) {
    if (window.__caps && window.__caps.length) break;
    await new Promise(r => setTimeout(r, 100));
  }
  if (!window.__caps || !window.__caps.length) return "NO-BLOB";
  const bmp = await createImageBitmap(window.__caps[0]);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const isSeal = (d) => Math.abs(d[0]-5) < 20 && Math.abs(d[1]-150) < 20 && Math.abs(d[2]-105) < 20;
  const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return d[0] + "," + d[1] + "," + d[2]; };
  const pts = [[885,225],[875,232],[895,238],[880,246],[890,227]];
  let sealHits = 0;
  for (const [x, y] of pts) if (isSeal(ctx.getImageData(x, y, 1, 1).data)) sealHits++;
  let zoneCount = 0;
  const zone = ctx.getImageData(870, 220, 32, 32).data;
  for (let i = 0; i < zone.length; i += 4) if (isSeal(zone.subarray(i))) zoneCount++;
  let claim = false;
  const box = ctx.getImageData(845, 408, 80, 26).data;
  for (let i = 0; i < box.length; i += 4) if (isSeal(box.subarray(i))) { claim = true; break; }
  return "PNG7|size=" + bmp.width + "x" + bmp.height + "|sample=" + px(885, 225) +
    "|sealHits=" + sealHits + "/5|zone=" + zoneCount + "|claim=" + claim;
})()' 2>/dev/null

echo "--- D. partial week (3/7, activities kept)"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const ds = (n, c) => Object.assign({ day: k(n), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 }, c);
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.goalMetDays = [0,1,2].map(k);
  raw.state.dayHistory = {
    [k(0)]: ds(0, { reviews: 12, quizzes: 2, words: 5, dictation: 1, rush: 3 }),
    [k(1)]: ds(1, { reviews: 8 }),
    [k(2)]: ds(2, { reviews: 6, words: 2 }),
  };
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "RESEEDED3";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const el = document.querySelector(".week-teacher");
  if (!el) return "NO-PANEL";
  const btn = el.querySelector("button[aria-label=\"نظر معلم را برای این هفته بخواه\"]");
  if (!btn) { const save = el.querySelector("button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]"); return save ? "CACHED" : "NO-ASK-BTN"; }
  btn.click(); return "ASKED";
})()' 2>/dev/null
for i in $(seq 1 17); do
  sleep 2
  DONE=$(agent-browser eval '(() => { const el = document.querySelector(".week-teacher"); return el && el.querySelector("[data-week-review]") ? "DONE" : "WAIT"; })()' 2>/dev/null)
  [ "$DONE" = '"DONE"' ] && break
done
echo "VERDICT3=$DONE"
agent-browser eval '
(() => {
  window.__caps = [];
  URL.createObjectURL = (b) => { window.__caps.push(b); return "blob:cap" + window.__caps.length; };
  HTMLAnchorElement.prototype.click = function () { return undefined; };
  const btn = document.querySelector(".week-teacher button[aria-label=\"ذخیرهٔ عکس نظر معلم هفته\"]");
  if (!btn) return "NO-SAVE-BTN";
  btn.click(); return "CLICKED";
})()' 2>/dev/null
agent-browser eval '
(async () => {
  for (let i = 0; i < 60; i++) {
    if (window.__caps && window.__caps.length) break;
    await new Promise(r => setTimeout(r, 100));
  }
  if (!window.__caps || !window.__caps.length) return "NO-BLOB";
  const bmp = await createImageBitmap(window.__caps[0]);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const isSeal = (d) => Math.abs(d[0]-5) < 20 && Math.abs(d[1]-150) < 20 && Math.abs(d[2]-105) < 20;
  const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return d[0] + "," + d[1] + "," + d[2]; };
  let zoneCount = 0;
  const zone = ctx.getImageData(870, 220, 32, 32).data;
  for (let i = 0; i < zone.length; i += 4) if (isSeal(zone.subarray(i))) zoneCount++;
  let claim = false;
  const box = ctx.getImageData(845, 408, 80, 26).data;
  for (let i = 0; i < box.length; i += 4) if (isSeal(box.subarray(i))) { claim = true; break; }
  return "PNG3|sealPoint=" + px(885, 235) + "|zone=" + zoneCount + "|claim=" + claim;
})()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

echo "--- G. strip seed"
agent-browser eval '
(() => {
  const bak = localStorage.getItem("vision2-study-v1-r136-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r136-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
