// r352 — درایورِ رقمیِ همگامِ MCQ برای بانکِ ۹۹ (۱۲۰ سؤال — الگوی r351: fire-and-forget با window.__r352)
(() => {
  const inner = (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.__r352) return "ALREADY-RUNNING:" + JSON.stringify(window.__r352.status || {});
  window.__r352 = { status: "running", log: [], done: false };
  const GRID = (
    "a a b b b d d a b b " + "d b b c d c b b d d " + "a d b b a a c c c d " + "b b a b c c b b d b " +
    "d c c c d c b d d c " + "a d b c a b b c c b " + "b c d d d b b b c c " + "d d b c c a b b d b " +
    "c a d d d c d d a a " + "b b d b a c b b d c " + "a b b d b c c c a c " + "a b d b b a b d d d"
  ).replace(/\s+/g, ""); // ۱۲۰ حرف — گریدِ کلیدِ جدولِ ص۳۰۱ (سؤال ۱۲۱-۲۴۰)
  if (GRID.length !== 120) { window.__r352.status = "GRID-LEN-ERROR"; window.__r352.log = [String(GRID.length)]; return; }
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
    if (n !== q) { results.push(`DESYNC at Q${q} (counter=${n})`); window.__r352.status = "desync"; break; }
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
      if (!moved) { results.push(`NOMOVE after Q${q} (was ${before})`); window.__r352.status = "nomove"; break; }
    }
  }
  window.__r352.done = true;
  window.__r352.status = "done";
  window.__r352.results = results.join(" ");
  window.__r352.tail = body().slice(-900);
})();
  void inner;
  return "STARTED";
})()
