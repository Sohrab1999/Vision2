// r393 — درایورِ پنج بانک (الگویِ r392): l115 شنیداریِ متن‌چاپ — ترکیبی (۲ mcq + ۱ تایپی؛ ۳/۳ قهرمان)؛
// l121 ناهماهنگِ یگانه — نخستین بانکِ ناهماهنگِ یگانهٔ tests-g12 (۴/۴ قهرمان)؛
// l122 شکلِ فعل — تایپی (سؤالِ سوم با «had learnt» = فرمِ دومِ acceptedِ دوبخشی → ۴/۴ قهرمان)؛
// l124 مرتب‌کردنِ کلمات — تایپی (سؤالِ دوم با ترتیبِ دومِ ضمیریِ acceptedِ دوبخشی → ۲/۲ قهرمان)؛
// l123 گرامر — ق۱ غلطِ عمدی (کلیدِ رسمی had met) → ۳/۴ + اکوی کارنامه.
(() => {
  window.__r393 = {
    b115: { ok: 0, miss: [], done: false }, b121: { ok: 0, miss: [], done: false },
    b122: { ok: 0, miss: [], done: false }, b124: { ok: 0, miss: [], done: false },
    b123: { ok: 0, miss: [], done: false },
    log: [], phase: "b115",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r393.log.push({
      tag,
      opts: document.querySelectorAll("button[data-quiz-option]:not([disabled])").length,
      typedInput: !!document.querySelector("input[data-quiz-typed-input]"),
      hasResult: body().includes("کارنامه"),
    });
  };
  const optBtns = () => [...document.querySelectorAll("button[data-quiz-option]")].filter((b) => !b.disabled);
  const optText = (b) => (b.lastElementChild ? b.lastElementChild.textContent : b.textContent).trim();
  const clickOpt = async (want) => {
    for (let w = 0; w < 30; w++) {
      const t = optBtns().find((b) => optText(b) === want);
      if (t) { t.click(); return true; }
      await sleep(200);
    }
    return false;
  };
  const typeAnswer = async (text) => {
    for (let w = 0; w < 30; w++) {
      const inp = document.querySelector("input[data-quiz-typed-input]");
      if (inp && !inp.disabled) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(inp, text);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(300);
        const btn = document.querySelector("button[data-quiz-typed-submit]");
        if (btn && !btn.disabled) { btn.click(); return true; }
      }
      await sleep(300);
    }
    return false;
  };
  const waitStem = async (fn, want) => {
    for (let w = 0; w < 60; w++) {
      const s = fn();
      if (s && want(s)) return true;
      await sleep(250);
    }
    return false;
  };
  const advance = async () => {
    for (let w = 0; w < 12; w++) {
      const nxt = [...document.querySelectorAll("button")].find(
        (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").trim() === "بعدی" || (b.textContent || "").includes("دیدن نتیجه")));
      if (nxt) { nxt.click(); return true; }
      await sleep(400);
    }
    return false;
  };
  const waitResult = async () => {
    for (let w = 0; w < 50; w++) {
      if (body().includes("کارنامه")) return true;
      await advance();
      await sleep(500);
    }
    return false;
  };
  const readScore = () => {
    const m = body().match(/(\d{1,2})\s*از\s*(\d{1,2})/);
    return m ? m[0] : null;
  };
  const openBank = async (frag) => {
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes(frag));
      if (b) { b.click(); return true; }
      await sleep(300);
    }
    return false;
  };
  const finish = (key, r) => {
    window.__r393[key].score = readScore();
    window.__r393[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r393[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r393[key].done = true;
    snap(key + "-result:" + r);
  };
  const backToCard = async () => {
    for (let w = 0; w < 20; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("بازگشت"));
      if (b) { b.click(); await sleep(1200); return true; }
      await sleep(400);
    }
    return false;
  };
  const runAnyBank = async (key, frag, steps) => {
    window.__r393.phase = key + "-open";
    await openBank(frag);
    const started = () =>
      document.querySelector("input[data-quiz-typed-input]") || optBtns()[0] ? "ready" : null;
    await waitStem(started, (s) => s === "ready");
    snap(key + "-opened");
    for (let i = 0; i < steps.length; i++) {
      window.__r393.phase = key + "-q" + (i + 1);
      const st = steps[i];
      let ok = false;
      if (st.typed) {
        const seen = await waitStem(
          () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null),
          (s) => s === "ready"
        );
        if (seen) ok = await typeAnswer(st.val);
        if (!ok) window.__r393[key].miss.push((i + 1) + "-typed:" + st.val);
      } else {
        const seen = await waitStem(() => (optBtns().length ? "ready" : null), (s) => s === "ready");
        if (seen) ok = await clickOpt(st.val);
        if (!ok) window.__r393[key].miss.push((i + 1) + "-opt:" + st.val);
      }
      if (ok) window.__r393[key].ok++;
      snap(key + "-q" + (i + 1) + (st.typed ? "-t" : "-m"));
      await sleep(900);
      if (i < steps.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
    await backToCard();
  };
  const runTypedBank = async (key, frag, answers) => {
    await runAnyBank(key, frag, answers.map((v) => ({ typed: true, val: v })));
  };

  (async () => {
    // ——— l115: شنیداریِ متن‌چاپ — ترکیبی — ۲ mcq + ۱ تایپی — ۳/۳ هدف ———
    await runAnyBank("b115", "شنیداریِ متن‌چاپ — ترکیبی (س۲، ص۲۵۱)", [
      { typed: false, val: "her close friend" },   // ق۷ (کلیدِ چاپ: b)
      { typed: false, val: "Maryam's sister" },    // ق۸ (کلیدِ چاپ: c)
      { typed: true, val: "She lives in another neighborhood." },  // ق۹
    ]);
    // ——— l121: ناهماهنگِ یگانه — نخستینِ tests-g12 — ۴/۴ قهرمان ———
    await runAnyBank("b121", "ناهماهنگِ یگانه (س۸، ص۲۵۳)", [
      { typed: false, val: "coal" },       // ق۲۵ (کلید: c)
      { typed: false, val: "resource" },   // ق۲۶ (کلید: d)
      { typed: false, val: "confusing" },  // ق۲۷ (کلید: c)
      { typed: false, val: "generate" },   // ق۲۸ (کلید: a)
    ]);
    // ——— l122: شکلِ فعل — تایپی — ۴/۴ قهرمان (سؤالِ ۳ با فرمِ دومِ دوبخشی: had learnt) ———
    await runTypedBank("b122", "شکلِ صحیحِ فعل — تایپی (س۹، ص۲۵۳)",
      ["has bought", "were killed", "had learnt", "be sent"]);
    // ——— l124: مرتب‌کردنِ کلمات — تایپی — ۲/۲ قهرمان (سؤالِ ۲ با ترتیبِ دومِ ضمیری) ———
    await runTypedBank("b124", "مرتب‌کردنِ کلمات — تایپی (س۱۱، ص۲۵۳)",
      ["My brother went to the library, but he didn't study at all.",
       "Her father is watching the DVD that she has bought."]);
    // ——— l123: گرامر — ق۱ غلطِ عمدی (کلید رسمی: had met) → ۳/۴ + اکو ———
    await runAnyBank("b123", "گرامرِ چهارگزینه‌ای (س۱۰، ص۲۵۳)", [
      { typed: false, val: "meet" },        // غلطِ عمدی — کلیدِ رسمی: c) had met
      { typed: false, val: "would" },
      { typed: false, val: "which" },
      { typed: false, val: "is collected" },
    ]);
    window.__r393.phase = "done";
  })();
})();
