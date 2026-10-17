// qa-r311-typed.js — typed-answer bulk driver for the r311 descriptive banks.
// Keys via globalThis.__R311_TYPED ("word|word|…"). React-safe: native value
// setter + input event, then click «بررسی پاسخ», then «سؤال بعدی» — transition-
// safe (r309/r310 lesson): wait for the next-button to unmount before continuing.
(async () => {
  const KEYS = (globalThis.__R311_TYPED || "").split("|").filter(Boolean);
  if (!KEYS.length) return { fail: "no typed keys set" };
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
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const steps = [];
  for (let i = 0; i < KEYS.length; i++) {
    const input = await waitFor("[data-quiz-typed-input]");
    if (!input) return { fail: `typed input not found at q${i + 1}`, steps };
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(input, KEYS[i]);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(40);
    const submit = await waitFor("[data-quiz-typed-submit]");
    if (!submit || submit.disabled) return { fail: `submit disabled/missing at q${i + 1}`, steps };
    submit.click();
    const next = await waitFor("[data-quiz-next]");
    if (!next) return { fail: `next not found at q${i + 1}`, steps };
    steps.push(`q${i + 1}:${KEYS[i]}`);
    next.click();
    const gone = await waitGone("[data-quiz-next]");
    if (!gone) return { fail: `next still mounted at q${i + 1}`, steps };
    await sleep(80);
  }
  await sleep(700);
  const body = document.body.innerText;
  const m = body.match(/(\d+)\s*از\s*(\d+)/);
  const pct = body.match(/(\d+)\s*٪/);
  return { ok: true, answered: steps.length, score: m ? m[0] : null, pct: pct ? pct[0] : null };
})()
