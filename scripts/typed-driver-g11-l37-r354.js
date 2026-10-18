// r354 — درایورِ تایپی برای بانک ۳۷ (۱۰ سؤال much/many — الگوی r311 با نگرِ fire-and-forget r349)
(() => {
  const inner = (async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    if (window.__r354b) return "ALREADY-RUNNING:" + JSON.stringify(window.__r354b.status || {});
    window.__r354b = { status: "running", log: [], done: false };
    const KEYS = "many|much|many|much|many|much|much|many|many|many".split("|");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const waitFor = async (sel, t = 3000) => {
      const t0 = Date.now();
      while (Date.now() - t0 < t) {
        const el = document.querySelector(sel);
        if (el) return el;
        await sleep(60);
      }
      return null;
    };
    const results = [];
    for (let i = 0; i < KEYS.length; i++) {
      const input = await waitFor("[data-quiz-typed-input]");
      if (!input) { window.__r354b.status = "NO-INPUT-q" + (i + 1); window.__r354b.log = results; return; }
      setter.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      setter.call(input, KEYS[i]);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      const submit = await waitFor("[data-quiz-typed-submit]");
      if (!submit) { window.__r354b.status = "NO-SUBMIT-q" + (i + 1); window.__r354b.log = results; return; }
      submit.click();
      await sleep(350);
      const fb = document.querySelector("[data-quiz-feedback]");
      const ok = fb && fb.textContent.includes("✓");
      results.push(`Q${i + 1}:${ok ? "OK" : "MISS:" + (fb ? fb.textContent.slice(0, 24) : "no-fb")}`);
      // گذر به سؤال بعد
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      document.activeElement && document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(220);
      const nxt = [...document.querySelectorAll("button")].find((b) => /بعدی|نتیجه/.test(b.textContent));
      if (nxt) nxt.click();
      await sleep(280);
    }
    window.__r354b.done = true;
    window.__r354b.status = results.every((r) => r.endsWith("OK")) ? "ALL-OK" : "HAS-MISS";
    window.__r354b.log = results;
    window.__r354b.finalText = document.body.innerText.slice(0, 400);
  })();
  return "r354b-started";
})()
