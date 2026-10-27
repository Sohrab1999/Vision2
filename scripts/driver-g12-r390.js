// r390 — درایورِ دو بانک (الگویِ r389): بانکِ l88 «گرامرِ شکلِ صحیحِ فعل — تایپی» — دومین بانکِ
// تایپیِ خانوادهٔ نهایی‌ها (kind=typed، ورودیِ متنی؛ accepted عینِ کلیدِ سربرگِ قدیمی:
// can open / would sell / be paid / had not washed) — همه درست → ۴/۴ قهرمان؛
// بانکِ l89 گرامرِ چهارگزینه‌ای — ق۱ غلطِ عمدی (کلیدِ رسمی = who) → ۳/۴ + اکوی کارنامه.
(() => {
  window.__r390 = { b88: { ok: 0, miss: [], done: false }, b89: { ok: 0, miss: [], done: false }, log: [], phase: "b88" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r390.log.push({
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
    window.__r390[key].score = readScore();
    window.__r390[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r390[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r390[key].done = true;
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

  (async () => {
    // ——— بانک l88: دومین بانکِ تایپیِ نهایی‌ها — ورودی متنی، accepted عینِ کلیدِ سربرگ ———
    window.__r390.phase = "b88-open";
    await openBank("شکلِ صحیحِ فعل — تایپی (س۸، ص۲۳۰)");
    const stem88 = () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null);
    await waitStem(stem88, (s) => s === "ready");
    snap("b88-opened");
    const answers88 = ["can open", "would sell", "be paid", "had not washed"];
    for (let i = 0; i < answers88.length; i++) {
      window.__r390.phase = "b88-q" + (i + 1);
      const seen = await waitStem(stem88, (s) => s === "ready");
      if (!seen) { window.__r390.b88.miss.push((i + 1) + "-no-input"); continue; }
      const ok = await typeAnswer(answers88[i]);
      if (ok) window.__r390.b88.ok++; else window.__r390.b88.miss.push((i + 1) + "-no-typed:" + answers88[i]);
      snap("b88-q" + (i + 1));
      await sleep(900);
      if (i < answers88.length - 1) await advance();
      await sleep(600);
    }
    const r88 = await waitResult();
    finish("b88", r88);
    await backToCard();

    // ——— بانک l89: گرامرِ چهارگزینه‌ای — ق۱ غلطِ عمدی (کلید رسمی: who) → ۳/۴ + اکو ———
    window.__r390.phase = "b89-open";
    await openBank("گرامرِ چهارگزینه‌ای (س۹، ص۲۳۰-۲۳۱)");
    const B89 = [
      { frag: "is wearing glasses", click: "whose", want: false }, // کلید رسمی: who
      { frag: "by my father two hours ago", click: "was posted" },
      { frag: "had an accident last week", click: "didn't she" },
      { frag: "were talking about", click: "out" },
    ];
    const stem89 = () => B89.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem89, (s) => s === B89[0].frag);
    snap("b89-opened");
    for (let i = 0; i < B89.length; i++) {
      window.__r390.phase = "b89-q" + (i + 1);
      const seen = await waitStem(stem89, (s) => s === B89[i].frag);
      if (!seen) { window.__r390.b89.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B89[i].click);
      if (!ok) { window.__r390.b89.miss.push((i + 1) + "-no-opt:" + B89[i].click); continue; }
      if (B89[i].want !== false) window.__r390.b89.ok++;
      await sleep(900);
      if (i < B89.length - 1) await advance();
      await sleep(600);
    }
    const r89 = await waitResult();
    finish("b89", r89);
    window.__r390.phase = "done";
  })();
})();
