// r392 — درایورِ چهار بانک (الگویِ r391): l103 شنیداریِ متن‌چاپ — نخستین بانکِ ترکیبیِ
// tests-g12 (۲ mcqِ چاپی + ۶ تایپی؛ ۸/۸ قهرمان هدف — آزمونِ مسیرِ موتورِ ترکیبی)؛
// l108 شکلِ فعل — تایپی (be spent / arrived / came / would give — ۴/۴ قهرمان؛
// سؤالِ چهارم، نخستین acceptedِ سه‌عضویِ نهایی‌ها would/might/could)؛
// l111 حروفِ ربط — تایپی (or/so/but/and — کلیدهای چاپیِ متفاوتِ خردادِ l100 → ۴/۴ قهرمان)؛
// l109 گرامر — ق۱ غلطِ عمدی (کلیدِ رسمی was taught) → ۳/۴ + اکوی کارنامه.
(() => {
  window.__r392 = {
    b103: { ok: 0, miss: [], done: false }, b108: { ok: 0, miss: [], done: false },
    b111: { ok: 0, miss: [], done: false }, b109: { ok: 0, miss: [], done: false },
    log: [], phase: "b103",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r392.log.push({
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
    window.__r392[key].score = readScore();
    window.__r392[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r392[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r392[key].done = true;
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
  // اجرای بانکِ ترکیبی: هر گام یا ورودیِ تایپی دارد یا گزینه‌ها؛ پاسخ از نقشهٔ [typed?|mcq] می‌آید
  const runAnyBank = async (key, frag, steps) => {
    window.__r392.phase = key + "-open";
    await openBank(frag);
    const started = () =>
      document.querySelector("input[data-quiz-typed-input]") || optBtns()[0] ? "ready" : null;
    await waitStem(started, (s) => s === "ready");
    snap(key + "-opened");
    for (let i = 0; i < steps.length; i++) {
      window.__r392.phase = key + "-q" + (i + 1);
      const st = steps[i];
      let ok = false;
      if (st.typed) {
        const seen = await waitStem(
          () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null),
          (s) => s === "ready"
        );
        if (seen) ok = await typeAnswer(st.val);
        if (!ok) window.__r392[key].miss.push((i + 1) + "-typed:" + st.val);
      } else {
        const seen = await waitStem(() => (optBtns().length ? "ready" : null), (s) => s === "ready");
        if (seen) ok = await clickOpt(st.val);
        if (!ok) window.__r392[key].miss.push((i + 1) + "-opt:" + st.val);
      }
      if (ok) window.__r392[key].ok++;
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
    // ——— l103: نخستین بانکِ ترکیبی — ۲ mcq + ۶ تایپی — ۸/۸ هدف ———
    await runAnyBank("b103", "شنیداریِ متن‌چاپ — ترکیبی (س۲-س۴، ص۲۴۴)", [
      { typed: false, val: "picnic" },            // ق۷ (کلیدِ چاپ: c)
      { typed: false, val: "in the morning" },    // ق۸ (کلیدِ چاپ: a)
      { typed: true, val: "They flew their kites." },  // ق۹
      { typed: true, val: "It was dark and quiet." },  // ق۱۰
      { typed: true, val: "The driver waved him." },   // ق۱۱
      { typed: true, val: "sure" },               // ق۱۲
      { typed: true, val: "life" },               // ق۱۳
      { typed: true, val: "abroad" },             // ق۱۴
    ]);
    // ——— l108: شکلِ فعل — تایپی — ۴/۴ قهرمان (سؤالِ ۴ = acceptedِ سه‌عضوی) ———
    await runTypedBank("b108", "شکلِ صحیحِ فعل — تایپی (س۹، ص۲۴۶)",
      ["be spent", "arrived", "came", "would give"]);
    // ——— l111: ربطِ تایپی — ۴/۴ قهرمان (کلیدهای چاپیِ or/so/but/and) ———
    await runTypedBank("b111", "حروفِ ربط — تایپی (س۱۲، ص۲۴۶)",
      ["or", "so", "but", "and"]);
    // ——— l109: گرامر — ق۱ غلطِ عمدی (کلید رسمی: was taught) → ۳/۴ + اکو ———
    await runAnyBank("b109", "گرامرِ چهارگزینه‌ای (س۱۰، ص۲۴۶)", [
      { typed: false, val: "had taught" },   // غلطِ عمدی — کلیدِ رسمی: b) was taught
      { typed: false, val: "because" },
      { typed: false, val: "whom" },
      { typed: false, val: "into" },
    ]);
    window.__r392.phase = "done";
  })();
})();
