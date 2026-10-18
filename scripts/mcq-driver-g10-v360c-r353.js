// r353 — درایورِ رقمیِ همگامِ MCQ برای بانکِ ۱۰۰ (۱۲۰ سؤال — الگوی r351/r352: fire-and-forget با window.__r353)
(() => {
  const inner = (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.__r353) return "ALREADY-RUNNING:" + JSON.stringify(window.__r353.status || {});
  window.__r353 = { status: "running", log: [], done: false };
  const GRID = (
    "c d b d c c b a a b " + "c b c c b c c b c c " + "b a c a c c a b a c " + "a a a d c b b c c b " +
    "a b a c a d c d a d " + "d c c a d b a c b d " + "c a d b a b b d b d " + "c d b c c d a a a c " +
    "b a a b b a d a b a " + "b a c b d d d a c b " + "c c d b a a c c c d " + "c d c a c c d b b d"
  ).replace(/\s+/g, ""); // ۱۲۰ حرف — گریدِ کلیدِ جدولِ ص۳۰۱ (سؤال ۲۴۱-۳۶۰)
  if (GRID.length !== 120) { window.__r353.status = "GRID-LEN-ERROR"; window.__r353.log = [String(GRID.length)]; return; }
  const results = [];
  const body = () => document.body.innerText;
  function counter() {
    const m = body().match(/(\d+)\s*\/\s*120/);
    return m ? parseInt(m[1], 10) : -1;
  }
  function chips(letter) {
    return [...document.querySelectorAll("button")].filter((b) => {
      const s = b.textContent.trim();
      // textContentِ بی‌فاصله («bmay be») — درسِ r348/r349؛ حرف + متنِ گزینه
      return s.length > 2 && s[0] === letter && /[a-z’'/ -]/i.test(s[1]);
    });
  }
  async function advance() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await sleep(220);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await sleep(220);
    const nxt = [...document.querySelectorAll("button")].find((b) => /بعدی|نتیجه/.test(b.textContent));
    if (nxt) nxt.click();
    await sleep(220);
  }
  const startQ = Math.max(1, counter());
  for (let q = startQ; q <= 120; q++) {
    let n = -1;
    for (let i = 0; i < 70; i++) { n = counter(); if (n === q) break; await sleep(120); }
    if (n !== q) { results.push(`DESYNC at Q${q} (counter=${n})`); window.__r353.status = "desync"; break; }
    await sleep(300);
    const letter = GRID[q - 1];
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      const cs = chips(letter);
      if (!cs.length) { await sleep(400); continue; }
      cs[cs.length - 1].click();
      await sleep(180);
      for (let i = 0; i < 25; i++) { if (body().includes("پاسخ درست")) { ok = true; break; } await sleep(100); }
    }
    results.push(`Q${q}:${letter}:${ok ? "OK" : "MISS"}`);
    if (q < 120) {
      const before = counter();
      await advance();
      let moved = false;
      for (let i = 0; i < 40; i++) { const c = counter(); if (c === q + 1) { moved = true; break; } await sleep(120); }
      if (!moved) { results.push(`NOMOVE after Q${q} (was ${before})`); window.__r353.status = "nomove"; break; }
    }
  }
  window.__r353.done = true;
  window.__r353.status = "done";
  window.__r353.results = results.join(" ");
  window.__r353.tail = body().slice(-900);
})();
  void inner;
  return "STARTED";
})()
