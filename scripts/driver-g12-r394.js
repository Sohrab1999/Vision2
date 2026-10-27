// r394 — درایورِ پنج بانک (الگویِ r393): l129 شنیداریِ mcq (۴/۴ قهرمان)؛
// l133 واژگانِ بانکِ چاپ — تایپی (۳/۳ قهرمان)؛ l140 ربطِ تایپی — سومین توالیِ متمایز (۴/۴ قهرمان)؛
// l138 خوانداریِ محیط‌زیست — ترکیبیِ ۶تایی (۲ mcq + ۲ درست/غلط + ۲ تایپیِ مدل‌دار — ۶/۶ قهرمان)؛
// l141 نقش‌های پاراگرافِ آب — دومین بانکِ نقش‌محورِ استخراج‌شده (۶/۶ قهرمان).
(() => {
  window.__r394 = {
    b129: { ok: 0, miss: [], done: false }, b133: { ok: 0, miss: [], done: false },
    b140: { ok: 0, miss: [], done: false }, b138: { ok: 0, miss: [], done: false },
    b141: { ok: 0, miss: [], done: false },
    log: [], phase: "b129",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r394.log.push({
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
    window.__r394[key].score = readScore();
    window.__r394[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r394[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r394[key].done = true;
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
    window.__r394.phase = key + "-open";
    await openBank(frag);
    const started = () =>
      document.querySelector("input[data-quiz-typed-input]") || optBtns()[0] ? "ready" : null;
    await waitStem(started, (s) => s === "ready");
    snap(key + "-opened");
    for (let i = 0; i < steps.length; i++) {
      window.__r394.phase = key + "-q" + (i + 1);
      const st = steps[i];
      let ok = false;
      if (st.typed) {
        const seen = await waitStem(
          () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null),
          (s) => s === "ready"
        );
        if (seen) ok = await typeAnswer(st.val);
        if (!ok) window.__r394[key].miss.push((i + 1) + "-typed:" + st.val);
      } else {
        const seen = await waitStem(() => (optBtns().length ? "ready" : null), (s) => s === "ready");
        if (seen) ok = await clickOpt(st.val);
        if (!ok) window.__r394[key].miss.push((i + 1) + "-opt:" + st.val);
      }
      if (ok) window.__r394[key].ok++;
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
    // ——— l129: شنیداریِ بخشِ الف — mcqِ چهارگزینه‌ای — ۴/۴ قهرمان — کلیدِ چاپ: d/c/a/c ———
    await runAnyBank("b129", "شنیداریِ بخشِ الف (س۱، ص۲۷۷)", [
      { typed: false, val: "pens" },        // ق۱ (کلیدِ چاپ: d)
      { typed: false, val: "dictionary" },  // ق۲ (کلیدِ چاپ: c)
      { typed: false, val: "score" },       // ق۳ (کلیدِ چاپ: a)
      { typed: false, val: "clever" },      // ق۴ (کلیدِ چاپ: c)
    ]);
    // ——— l133: واژگانِ بانکِ چاپ — تایپی — ۳/۳ قهرمان (cooling/dedicated/combination) ———
    await runTypedBank("b133", "واژگانِ بانکِ چاپ — تایپی (س۶، ص۲۷۹)",
      ["cooling", "dedicated", "combination"]);
    // ——— l140: حروفِ ربط — تایپی — سومین توالیِ متمایز (and/so/or/but) — ۴/۴ قهرمان ———
    await runTypedBank("b140", "حروفِ ربط — تایپی (س۱۳، ص۲۸۲)",
      ["and", "so", "or", "but"]);
    // ——— l138: خوانداریِ محیط‌زیست — ترکیبیِ ۶تایی — ۶/۶ قهرمان ———
    await runAnyBank("b138", "خوانداریِ محیط‌زیست — ترکیبی (س۱۱، ص۲۸", [
      { typed: false, val: "an increase in most forms of environmental population" },  // ق۳۷ (کلید: c)
      { typed: false, val: "are more than they were in the past" },                    // ق۳۸ (کلید: c)
      { typed: false, val: "False" },                                                  // ق۳۹ (کلیدِ چاپ: False)
      { typed: false, val: "True" },                                                   // ق۴۰ (کلیدِ چاپ: True)
      { typed: true, val: "They think that the world seems to be getting worse." },    // ق۴۱ (مدلِ چاپ)
      { typed: true, val: "They believe that energy and natural resources have become more than they were in the past." },  // ق۴۲
    ]);
    // ——— l141: نقش‌های پاراگرافِ آب — دومینِ نقش‌محورِ استخراجی — ۶/۶ قهرمان ———
    await runAnyBank("b141", "نقش‌های پاراگرافِ آب (س۱۴، ص۲۸۲)", [
      { typed: false, val: "Concluding sentence" },    // ق۱: Thus… (a: concluding)
      { typed: false, val: "Supporting sentence" },    // ق۲
      { typed: false, val: "Topic sentence" },         // ق۳
      { typed: false, val: "Supporting sentence" },    // ق۴
      { typed: false, val: "Supporting sentence" },    // ق۵
      { typed: false, val: "Supporting sentence" },    // ق۶
    ]);
    window.__r394.phase = "done";
  })();
})();
