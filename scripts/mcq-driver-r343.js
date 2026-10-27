// r343 — درایورِ رقمیِ همگامِ MCQ v2 (settle + کلیکِ مجدد + پیشرویِ راستی‌آزمایی‌شده + شروعِ تطبیقی)
(async () => {
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GRID = "ccdaabbcabbcdbdcbdbbbbababbccbdddbbbadbbacaada"; // Q1-46
const results = [];
const body = () => document.body.innerText;
function counter() {
  const m = body().match(/(\d+)\s*\/\s*46/);
  return m ? parseInt(m[1], 10) : -1;
}
function chips(letter) {
  return [...document.querySelectorAll("button")].filter((b) => {
    const s = b.textContent.trim();
    return s.length > 2 && s[0] === letter && /[a-z/ ]/i.test(s[1]);
  });
}
async function advance() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await sleep(250);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await sleep(250);
  // اگر شمارنده پیش نرفت: کلیکِ مستقیمِ دکمهٔ «بعدی/نتیجه»
  const nxt = [...document.querySelectorAll("button")].find((b) => /بعدی|نتیجه/.test(b.textContent));
  if (nxt) nxt.click();
  await sleep(250);
}
const startQ = Math.max(2, counter());
for (let q = startQ; q <= 46; q++) {
  let n = -1;
  for (let i = 0; i < 70; i++) { n = counter(); if (n === q) break; await sleep(120); }
  if (n !== q) { results.push(`DESYNC at Q${q} (counter=${n})`); break; }
  await sleep(350); // زمانِ سکونِ رندر
  const letter = GRID[q - 1];
  let ok = false;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    const cs = chips(letter);
    if (!cs.length) { await sleep(400); continue; }
    cs[cs.length - 1].click();
    await sleep(200);
    for (let i = 0; i < 25; i++) { if (body().includes("پاسخ درست")) { ok = true; break; } await sleep(100); }
  }
  results.push(`Q${q}:${letter}:${ok ? "OK" : "MISS"}`);
  if (q < 46) {
    const before = counter();
    await advance();
    let moved = false;
    for (let i = 0; i < 40; i++) { const c = counter(); if (c === q + 1) { moved = true; break; } await sleep(120); }
    if (!moved) { results.push(`NOMOVE after Q${q} (was ${before})`); break; }
  } else {
    // Q46 — رفتن به نتیجه
    await advance();
    await sleep(400);
  }
}
const score = body().match(/(\d+)\s*از\s*۴۶/) || body().match(/(\d+)\s*از\s*46/);
return "DRIVER-DONE " + results.join(" ") + " | score=" + (score ? score[0] : body().slice(0, 120).replace(/\n/g, " "));
})()
