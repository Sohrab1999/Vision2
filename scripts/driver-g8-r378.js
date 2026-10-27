// r378 — درایورِ بانکِ پایانیِ ۱۶ (خ۷/جدولِ ترجمهٔ دوروییِ ص۷۲) — الگویِ r377 (ساقه‌محور،
// case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه).
//  بانک ۱۶: ۶ MCQ دورویی — ق۱ غلطِ عمدی با «shopping» (کلید = gym) → ۵/۶ + اکو؛
//  ق۲-۶ درست: magazine/poem/خواندن/جستجو/خرید (ق۴-۶ نخستین گزینه‌های فارسیِ کارتِ هشتم)
(() => {
  window.__r378 = { b16: { ok: 0, miss: [], done: false }, log: [], phase: "b16" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r378.log.push({
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
    window.__r378[key].score = readScore();
    window.__r378[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r378[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r378[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r378.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r378[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r378[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r378[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  };

  (async () => {
    // ——— بانک ۱۶: جدولِ ترجمهٔ دورویی — ق۱ غلطِ عمدی با shopping (کلید = gym) ———
    window.__r378.phase = "b16-open";
    await openBank("هفتم — ترجمهٔ جدول");
    const B16 = [
      { frag: "باشگاه به انگلیسی", click: "shopping", want: false }, // غلطِ عمدی: کلید = gym
      { frag: "مجله به انگلیسی", click: "magazine" },
      { frag: "شعر به انگلیسی", click: "poem" },
      { frag: "reading به فارسی", click: "خواندن" },
      { frag: "searching به فارسی", click: "جستجو" },
      { frag: "shopping به فارسی", click: "خرید" },
    ];
    const stem16 = () => B16.find((x) => body().includes(x.frag))?.frag || null;
    await play("b16", B16, stem16);
    window.__r378.phase = "done";
  })();
})();
