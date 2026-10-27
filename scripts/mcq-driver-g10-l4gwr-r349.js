// r349 — درایورِ رقمیِ همگامِ MCQ برای بانکِ ۹۶ (الگوی r343 v2 + حالتِ fire-and-forget با window.__r349)
(() => {
  const inner = (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.__r349) return "ALREADY-RUNNING:" + JSON.stringify(window.__r349.status || {});
  window.__r349 = { status: "running", log: [], done: false };
  const GRID = "a d c b d a a b a d d b a c b b d d d c a d b d a c a d b b a c d b c c a c c a c d a d a c b d c a b c b b d b a"
    .replace(/\s+/g, ""); // ۵۷ حرف — گریدِ کلیدِ چاپیِ ص۲۹۵-۲۹۹
  if (GRID.length !== 57) return "GRID-LEN-ERROR:" + GRID.length;
  const results = [];
  const body = () => document.body.innerText;
  function counter() {
    const m = body().match(/(\d+)\s*\/\s*57/);
    return m ? parseInt(m[1], 10) : -1;
  }
  function chips(letter) {
    return [...document.querySelectorAll("button")].filter((b) => {
      const s = b.textContent.trim();
      // textContentِ بی‌فاصله («amust») — درسِ r348؛ حرف + متنِ گزینه
      return s.length > 2 && s[0] === letter && /[a-z’'/ -]/i.test(s[1]);
    });
  }
  async function advance() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await sleep(250);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await sleep(250);
    const nxt = [...document.querySelectorAll("button")].find((b) => /بعدی|نتیجه/.test(b.textContent));
    if (nxt) nxt.click();
    await sleep(250);
  }
  const startQ = Math.max(1, counter());
  for (let q = startQ; q <= 57; q++) {
    let n = -1;
    for (let i = 0; i < 70; i++) { n = counter(); if (n === q) break; await sleep(120); }
    if (n !== q) { results.push(`DESYNC at Q${q} (counter=${n})`); window.__r349.status = "desync"; break; }
    await sleep(350);
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
    if (q < 57) {
      const before = counter();
      await advance();
      let moved = false;
      for (let i = 0; i < 40; i++) { const c = counter(); if (c === q + 1) { moved = true; break; } await sleep(120); }
      if (!moved) { results.push(`NOMOVE after Q${q} (was ${before})`); window.__r349.status = "nomove"; break; }
    }
  }
  window.__r349.done = true;
  window.__r349.status = "done";
  window.__r349.results = results.join(" ");
  window.__r349.tail = body().slice(-900);
})();
  void inner;
  return "STARTED";
})()
