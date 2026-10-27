// qa-r309-bank.js — robust bulk-answer driver (keys via globalThis.__R309_KEYS)
// transition-safe: after clicking «سؤال بعدی», waits for the old next-button to
// unmount (AnimatePresence exit) before touching the next question's options.
(async () => {
  const KEYS = (globalThis.__R309_KEYS || "").split(",").map(Number);
  if (!KEYS.length) return { fail: "no keys set" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (sel, t = 2500) => {
    const t0 = Date.now();
    while (Date.now() - t0 < t) {
      const el = document.querySelector(sel);
      if (el) return el;
      await sleep(60);
    }
    return null;
  };
  const waitGone = async (sel, t = 2500) => {
    const t0 = Date.now();
    while (Date.now() - t0 < t) {
      const el = document.querySelector(sel);
      if (!el) return true;
      await sleep(60);
    }
    return false;
  };
  const steps = [];
  for (let i = 0; i < KEYS.length; i++) {
    const opt = await waitFor(`[data-quiz-option="${KEYS[i]}"]`);
    if (!opt) return { fail: `option ${KEYS[i]} not found at q${i + 1}`, steps };
    opt.click();
    const next = await waitFor("[data-quiz-next]");
    if (!next) return { fail: `next not found at q${i + 1}`, steps };
    steps.push(`q${i + 1}->${KEYS[i]}`);
    next.click();
    const gone = await waitGone("[data-quiz-next]");
    if (!gone) return { fail: `next still mounted after click at q${i + 1}`, steps };
    await sleep(80);
  }
  await sleep(500);
  const body = document.body.innerText;
  const m = body.match(/(\d+)\s*از\s*(\d+)/);
  const pct = body.match(/(\d+)\s*٪/);
  return { ok: true, answered: steps.length, score: m ? m[0] : null, pct: pct ? pct[0] : null };
})()
