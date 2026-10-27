#!/bin/bash
# Task 134 QA — «نشانِ هفتهٔ کامل» به حلقهٔ زندهٔ هفته‌نامه + کارتِ PNG می‌رسد.
# Single session. A. seed 7-goal-day week (backup kept)
# B. live ring in report dialog: seal inside ring (emerald token, aria-hidden, 14px, tick path)
# C. PNG pixel proof (7/7): stub capture → seal center emerald #059669, tick white, named claim present
# D. partial week (3/7): NO seal in ring; PNG: seal point = stone track, no emerald claim
# E. mobile 390 overflow with report open. F. console errors = 0. G. strip seed.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A. seed 7-goal-day week"
agent-browser eval '
(() => {
  const raw = localStorage.getItem("vision2-study-v1");
  localStorage.setItem("vision2-study-v1-r134-backup", raw || "__ABSENT__");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  obj.state = Object.assign({}, obj.state, {
    introDone: true, userName: "آزمون‌گر", onboarded: true,
    goalMetDays: [0,1,2,3,4,5,6].map(k),
  });
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "SEEDED|goalMetDays=7";
})()' 2>/dev/null

agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- B. live ring seal in report dialog (light)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=\"img\"][aria-label*=\"روزِ هدف\"]");
  if (!ring) return "NO-RING";
  const seal = ring.querySelector("span.bg-emerald-600");
  if (!seal) return "NO-SEAL|aria=" + (ring.getAttribute("aria-label")||"").slice(0,30);
  const cs = getComputedStyle(seal);
  const b = seal.getBoundingClientRect();
  const tick = seal.querySelector("svg path");
  return [
    "ariaHidden=" + seal.getAttribute("aria-hidden"),
    "bg=" + cs.backgroundColor,
    "size=" + Math.round(b.width) + "x" + Math.round(b.height),
    "tickPath=" + (tick ? tick.getAttribute("d") : "none"),
    "ringPct=" + (ring.textContent.includes("۱۰۰٪")),
    "ringAria=" + (ring.getAttribute("aria-label")||"").includes("کامل شد"),
  ].join("|");
})()' 2>/dev/null

echo "--- C. PNG pixel proof (7/7)"
agent-browser eval '
(() => {
  window.__caps = [];
  URL.createObjectURL = (b) => { window.__caps.push(b); return "blob:cap" + window.__caps.length; };
  HTMLAnchorElement.prototype.click = function () { return undefined; };
  return "STUBBED";
})()' 2>/dev/null
agent-browser eval '(() => {
  const btn = document.querySelector("button[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]");
  if (!btn) return "NO-PNG-BTN";
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
  // exact-ish emerald-600 (5,150,105) with ±20 — the arc gradient
  // (#10b981=16,185,129 / #0d9488=13,148,136) has g≥148 → excluded by |g-150|<20
  const isSeal = (d) => Math.abs(d[0]-5) < 20 && Math.abs(d[1]-150) < 20 && Math.abs(d[2]-105) < 20;
  const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return d[0] + "," + d[1] + "," + d[2]; };
  // 5-point cross avoiding the white tick strokes (AA fringe of the tick
  // poisoned the single center sample in round 1)
  const pts = [[885,225],[875,232],[895,238],[880,246],[890,227]];
  let sealHits = 0;
  for (const [x, y] of pts) if (isSeal(ctx.getImageData(x, y, 1, 1).data)) sealHits++;
  let zoneCount = 0;
  const zone = ctx.getImageData(870, 220, 32, 32).data;
  for (let i = 0; i < zone.length; i += 4) if (isSeal(zone.subarray(i))) zoneCount++;
  let claim = false;
  const box = ctx.getImageData(845, 408, 80, 26).data;
  for (let i = 0; i < box.length; i += 4) if (isSeal(box.subarray(i))) { claim = true; break; }
  return "PNG7|size=" + bmp.width + "x" + bmp.height +
    "|sample=" + px(885, 225) + "|sealHits=" + sealHits + "/5|zone=" + zoneCount + "|claim=" + claim;
})()' 2>/dev/null

echo "--- D. partial week (3/7) — seal must vanish in ring AND png"
agent-browser eval '
(() => {
  const k = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.goalMetDays = [0,1,2].map(k);
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "RESEEDED|goalMetDays=3";
})()' 2>/dev/null
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-report")); return "OPENED"; })()' 2>/dev/null
sleep 2
agent-browser eval '
(() => {
  const ring = document.querySelector("[role=\"img\"][aria-label*=\"روزِ هدف\"]");
  if (!ring) return "NO-RING";
  return "PARTIAL|sealInRing=" + (!!ring.querySelector("span.bg-emerald-600")) +
    "|aria=" + (ring.getAttribute("aria-label")||"").slice(0, 12);
})()' 2>/dev/null
agent-browser eval '
(() => {
  window.__caps = [];
  URL.createObjectURL = (b) => { window.__caps.push(b); return "blob:cap" + window.__caps.length; };
  HTMLAnchorElement.prototype.click = function () { return undefined; };
  const btn = document.querySelector("button[aria-label=\"گرفتن عکس هفته‌نامهٔ پیشرفت\"]");
  if (!btn) return "NO-PNG-BTN";
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
  const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return d[0] + "," + d[1] + "," + d[2]; };
  const isSeal3 = (d) => Math.abs(d[0]-5) < 20 && Math.abs(d[1]-150) < 20 && Math.abs(d[2]-105) < 20;
  let emerald = false;
  const box = ctx.getImageData(845, 408, 80, 26).data;
  for (let i = 0; i < box.length; i += 4) if (isSeal3(box.subarray(i))) { emerald = true; break; }
  let sealZoneCount = 0;
  const sbox = ctx.getImageData(870, 220, 32, 32).data;
  for (let i = 0; i < sbox.length; i += 4) if (isSeal3(sbox.subarray(i))) sealZoneCount++;
  return "PNG3|sealPoint=" + px(885, 235) + "|claimBox=" + emerald + "|sealZoneCount=" + sealZoneCount;
})()' 2>/dev/null

echo "--- E. mobile 390 overflow with report open"
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
  const bak = localStorage.getItem("vision2-study-v1-r134-backup");
  if (bak === "__ABSENT__") localStorage.removeItem("vision2-study-v1");
  else if (bak) localStorage.setItem("vision2-study-v1", bak);
  localStorage.removeItem("vision2-study-v1-r134-backup");
  return "STRIPPED";
})()' 2>/dev/null
agent-browser close --all >/dev/null 2>&1
echo "QA-DONE"
