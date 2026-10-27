// r354 — درایورِ MCQ برای بانک ۳۹ (۲۰ سؤال — الگوی r351-r353: fire-and-forget با window.__r354a)
(() => {
  const inner = (async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    if (window.__r354a) return "ALREADY-RUNNING:" + JSON.stringify(window.__r354a.status || {});
    window.__r354a = { status: "running", log: [], done: false };
    const GRID = "dbccacacdbcdadbcacac";
    if (GRID.length !== 20) { window.__r354a.status = "GRID-LEN-ERROR"; return; }
    const results = [];
    const body = () => document.body.innerText;
    function counter() {
      const m = body().match(/(\d+)\s*\/\s*20/);
      return m ? parseInt(m[1], 10) : -1;
    }
    function chips(letter) {
      return [...document.querySelectorAll("button")].filter((b) => {
        const s = b.textContent.trim();
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
    for (let q = 1; q <= 20; q++) {
      let n = -1;
      for (let i = 0; i < 60; i++) { n = counter(); if (n === q) break; await sleep(120); }
      if (n !== q) { window.__r354a.status = "COUNTER-DESYNC"; window.__r354a.log = results; return; }
      const L = GRID[q - 1];
      let chip = null;
      for (let i = 0; i < 40; i++) {
        chip = chips(L)[0];
        if (chip && !chip.disabled) break;
        await sleep(120);
      }
      if (!chip) { window.__r354a.status = "NO-CHIP"; window.__r354a.log = results; return; }
      chip.click();
      await sleep(300);
      const fb = document.querySelector("[data-quiz-feedback]");
      const ok = fb && fb.textContent.includes("✓");
      results.push(`Q${q}:${ok ? "OK" : "MISS:" + (fb ? fb.textContent.slice(0, 20) : "no-fb")}`);
      await advance();
    }
    window.__r354a.done = true;
    window.__r354a.status = results.every((r) => r.endsWith("OK")) ? "ALL-OK" : "HAS-MISS";
    window.__r354a.log = results;
    window.__r354a.finalText = body().slice(0, 400);
  })();
  return "r354a-started";
})()
