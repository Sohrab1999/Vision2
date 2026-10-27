// r391 — درایورِ سه بانک (الگویِ r390): l98 شکلِ فعلِ مکالمه — تایپی (accepted عینِ کلید:
// seems / had decided / would go / are served → ۴/۴ قهرمان)؛ l97 حرف‌اولِ تایپی
// (absorb / symbol / hug — کلیدِ بریدهٔ «hu» تکمیل‌شده → ۳/۳ قهرمان)؛
// l99 گرامر — ق۱ غلطِ عمدی (کلیدِ رسمی which) → ۳/۴ + اکوی کارنامه.
(() => {
  window.__r391 = { b98: { ok: 0, miss: [], done: false }, b97: { ok: 0, miss: [], done: false }, b99: { ok: 0, miss: [], done: false }, log: [], phase: "b98" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r391.log.push({
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
    window.__r391[key].score = readScore();
    window.__r391[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r391[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r391[key].done = true;
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
  const runTypedBank = async (key, frag, answers) => {
    window.__r391.phase = key + "-open";
    await openBank(frag);
    const ready = () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null);
    await waitStem(ready, (s) => s === "ready");
    snap(key + "-opened");
    for (let i = 0; i < answers.length; i++) {
      window.__r391.phase = key + "-q" + (i + 1);
      const seen = await waitStem(ready, (s) => s === "ready");
      if (!seen) { window.__r391[key].miss.push((i + 1) + "-no-input"); continue; }
      const ok = await typeAnswer(answers[i]);
      if (ok) window.__r391[key].ok++; else window.__r391[key].miss.push((i + 1) + "-no-typed:" + answers[i]);
      snap(key + "-q" + (i + 1));
      await sleep(900);
      if (i < answers.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
    await backToCard();
  };

  (async () => {
    // ——— l98: شکلِ فعلِ مکالمه — تایپی — ۴/۴ هدف ———
    await runTypedBank("b98", "فعلِ مکالمه — تایپی (س۹، ص۲۳۹)",
      ["seems", "had decided", "would go", "are served"]);
    // ——— l97: حرف‌اولِ تایپی — ۳/۳ هدف (شاملِ hugِ تکمیل‌شده) ———
    await runTypedBank("b97", "حرف‌اول — تایپی (س۸، ص۲۳۹)",
      ["absorb", "symbol", "hug"]);
    // ——— l99: گرامر — ق۱ غلطِ عمدی (کلید رسمی: which) → ۳/۴ + اکو ———
    window.__r391.phase = "b99-open";
    await openBank("گرامرِ چهارگزینه‌ای (س۱۰، ص۲۳۹)");
    const B99 = [
      { frag: "is not very crowded", click: "whose", want: false }, // کلید رسمی: which
      { frag: "when we burn garbage", click: "may be produced" },
      { frag: "kept to himself", click: "communicative" },
      { frag: "jumped ------- the next part", click: "into" },
    ];
    const stem99 = () => B99.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem99, (s) => s === B99[0].frag);
    snap("b99-opened");
    for (let i = 0; i < B99.length; i++) {
      window.__r391.phase = "b99-q" + (i + 1);
      const seen = await waitStem(stem99, (s) => s === B99[i].frag);
      if (!seen) { window.__r391.b99.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B99[i].click);
      if (!ok) { window.__r391.b99.miss.push((i + 1) + "-no-opt:" + B99[i].click); continue; }
      if (B99[i].want !== false) window.__r391.b99.ok++;
      await sleep(900);
      if (i < B99.length - 1) await advance();
      await sleep(600);
    }
    const r99 = await waitResult();
    finish("b99", r99);
    window.__r391.phase = "done";
  })();
})();
