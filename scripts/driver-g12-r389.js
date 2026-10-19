// r389 — درایورِ دو بانک (الگویِ r388): بانکِ l74 «خانه‌های چاپِ ایمیل» — نخستین بانکِ تایپیِ
// خانوادهٔ نهایی‌ها (kind=typed، ورودیِ متنی به‌جای گزینه؛ accepted: responding/personal)
// — همه درست → ۲/۲ قهرمان؛ بانکِ l77 گرامرِ انسانی — ق۱ غلطِ عمدی (کلیدِ رسمی = which)
// → ۴/۵ + اکو؛ ق۴ کلیدِ بک‌تیک‌دارِ «didn`t she» با fromCharCode(96) (ایمنِ شل)
(() => {
  window.__r389 = { b74: { ok: 0, miss: [], done: false }, b77: { ok: 0, miss: [], done: false }, log: [], phase: "b74" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r389.log.push({
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
    window.__r389[key].score = readScore();
    window.__r389[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r389[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r389[key].done = true;
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
    // ——— بانک l74: نخستین بانکِ تایپیِ نهایی‌ها — ورودی متنی، accepted چاپی ———
    window.__r389.phase = "b74-open";
    await openBank("خانه‌های چاپِ ایمیل (س۳، ص۲۶۸)");
    const stem74 = () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null);
    await waitStem(stem74, (s) => s === "ready");
    snap("b74-opened");
    // q1: accepted = responding
    window.__r389.phase = "b74-q1";
    let ok1 = await typeAnswer("responding");
    if (ok1) window.__r389.b74.ok++; else window.__r389.b74.miss.push("1-no-typed:responding");
    snap("b74-q1");
    await sleep(900);
    await advance();
    await sleep(600);
    // q2: accepted = personal
    window.__r389.phase = "b74-q2";
    const seen2 = await waitStem(() => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null), (s) => s === "ready");
    if (seen2) {
      const ok2 = await typeAnswer("personal");
      if (ok2) window.__r389.b74.ok++; else window.__r389.b74.miss.push("2-no-typed:personal");
    } else window.__r389.b74.miss.push("2-no-input");
    snap("b74-q2");
    await sleep(900);
    const r74 = await waitResult();
    finish("b74", r74);
    await backToCard();

    // ——— بانک l77: گرامرِ انسانی — ق۱ غلطِ عمدی (کلید رسمی: which) → ۴/۵ + اکو ———
    window.__r389.phase = "b77-open";
    await openBank("گرامر (س۷، ص۲۶۹-۲۷۰)");
    const BT = String.fromCharCode(96); // بک‌تیکِ چاپ — ایمنِ شل
    const B77 = [
      { frag: "Where is his car", click: "whom", want: false }, // کلید رسمی: which
      { frag: "she could get a good score", click: "studied" },
      { frag: "The workers", click: "have built" },
      { frag: "bought a new dress", click: "didn" + BT + "t she" }, // کلیدِ چاپیِ بک‌تیک‌دار
      { frag: "He is not very", click: "communicative" },
    ];
    const stem77 = () => B77.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem77, (s) => s === B77[0].frag);
    snap("b77-opened");
    for (let i = 0; i < B77.length; i++) {
      window.__r389.phase = "b77-q" + (i + 1);
      const seen = await waitStem(stem77, (s) => s === B77[i].frag);
      if (!seen) { window.__r389.b77.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B77[i].click);
      if (!ok) { window.__r389.b77.miss.push((i + 1) + "-no-opt:" + B77[i].click); continue; }
      if (B77[i].want !== false) window.__r389.b77.ok++;
      await sleep(900);
      if (i < B77.length - 1) await advance();
      await sleep(600);
    }
    const r77 = await waitResult();
    finish("b77", r77);
    window.__r389.phase = "done";
  })();
})();
