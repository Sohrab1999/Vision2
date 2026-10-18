// r350 — درایورِ رقمیِ همگامِ MCQ برای بانکِ ۹۷ (۱۰۰ سؤال — الگوی r349: fire-and-forget با window.__r350)
(() => {
  const inner = (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (window.__r350) return "ALREADY-RUNNING:" + JSON.stringify(window.__r350.status || {});
  window.__r350 = { status: "running", log: [], done: false };
  const GRID = (
    "b c b a d a b c a b " + "d b c a b d c c d b " + "b d c b a c c a b b " +
    "c d d d c c b d a c " + "b b c c a b b c b b " + "a a b b c b a c a b " +
    "d b c b c d d b d d " + "b b d c a d a c d d " + "b b a c b a b b b b " +
    "c a c d a c b a b b"
  ).replace(/\s+/g, ""); // ۱۰۰ حرف — گریدِ کلیدِ جدولیِ ص۳۰۰
  if (GRID.length !== 100) { window.__r350.status = "GRID-LEN-ERROR"; window.__r350.log = [String(GRID.length)]; return; }
  const results = [];
  const body = () => document.body.innerText;
  function counter() {
    const m = body().match(/(\d+)\s*\/\s*100/);
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
  for (let q = startQ; q <= 100; q++) {
    let n = -1;
    for (let i = 0; i < 70; i++) { n = counter(); if (n === q) break; await sleep(120); }
    if (n !== q) { results.push(`DESYNC at Q${q} (counter=${n})`); window.__r350.status = "desync"; break; }
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
    if (q < 100) {
      const before = counter();
      await advance();
      let moved = false;
      for (let i = 0; i < 40; i++) { const c = counter(); if (c === q + 1) { moved = true; break; } await sleep(120); }
      if (!moved) { results.push(`NOMOVE after Q${q} (was ${before})`); window.__r350.status = "nomove"; break; }
    }
  }
  window.__r350.done = true;
  window.__r350.status = "done";
  window.__r350.results = results.join(" ");
  window.__r350.tail = body().slice(-900);
})();
  void inner;
  return "STARTED";
})()
