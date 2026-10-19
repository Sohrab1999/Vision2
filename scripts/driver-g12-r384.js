// r384 — درایورِ دو بانکِ نهایی (الگویِ r383): بانکِ l30 گرامر — ق۱ غلطِ عمدی (کلید = didn’t they)
// → ۳/۴ + اکو؛ بانکِ l35 مرتب‌سازیِ شش‌گزینه‌ای «مورچه‌ها» — همه درست → قهرمان (opts=6 در موتور واقعی)
(() => {
  window.__r384 = { b30: { ok: 0, miss: [], done: false }, b35: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b30" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r384.log.push({
      tag,
      opts: document.querySelectorAll("button[data-quiz-option]:not([disabled])").length,
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
    window.__r384[key].score = readScore();
    window.__r384[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r384[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r384[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r384.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r384[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r384[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r384[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
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
    // ——— بانک l30: گرامرِ نهاییِ خرداد ۱۴۰۰ — ق۱ غلطِ عمدی (کلید رسمی: didn’t they) ———
    window.__r384.phase = "b30-open";
    await openBank("نهایی خرداد ۱۴۰۰ — گرامر");
    const B30 = [
      { frag: "They invited you to their party", click: "didn’t we", want: false }, // کلید رسمی: didn’t they
      { frag: "What did the students want to do", click: "whom" },
      { frag: "lunch before I went out", click: "had eaten" },
      { frag: "How can we have better streets", click: "must be obeyed" },
    ];
    const stem30 = () => B30.find((x) => body().includes(x.frag))?.frag || null;
    await play("b30", B30, stem30);
    await backToCard();

    // ——— بانک l35: مرتب‌سازیِ شش‌گزینه‌ای «مورچه‌ها» — قهرمان ———
    window.__r384.phase = "b35-open";
    await openBank("نهایی خرداد ۱۴۰۰ — مرتب‌سازیِ پاراگرافِ مورچه‌ها");
    const B35 = [
      { frag: "جایگاهِ ۵۱", click: "Ants are hardworking insects." },
      { frag: "جایگاهِ ۵۲", click: "Throughout the summer, they collect food for the winter season." },
      { frag: "جایگاهِ ۵۳", click: "Whenever they find sweet lying on the floor," },
      { frag: "جایگاهِ ۵۴", click: "they stick to the sweet and carry it to their home." },
      { frag: "جایگاهِ ۵۵", click: "Thus, in this way, they clean the floor." },
      { frag: "جایگاهِ ۵۶", click: "As a result, they are known as helpful and active insects." },
    ];
    const stem35 = () => B35.find((x) => body().includes(x.frag))?.frag || null;
    const stem35snap = () => {
      const f = stem35();
      if (f) window.__r384.b35.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem35, (s) => s === "جایگاهِ ۵۱");
    snap("b35-opened");
    for (let i = 0; i < B35.length; i++) {
      window.__r384.phase = "b35-q" + (i + 1);
      const seen = await waitStem(stem35snap, (s) => s === B35[i].frag);
      if (!seen) { window.__r384.b35.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B35[i].click);
      if (!ok) { window.__r384.b35.miss.push((i + 1) + "-no-opt:" + B35[i].click); continue; }
      window.__r384.b35.ok++;
      await sleep(900);
      if (i < B35.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b35", r);
    window.__r384.phase = "done";
  })();
})();
