// r376 — درایورِ پنج بانکِ جفتِ خانوادهٔ سوم/چهارمِ کارتِ هشتم — الگویِ r375 (ساقه‌محور،
// جست‌وجوی case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه).
//  بانک ۸: بانکِ چاپیِ تک‌اضافی — ق۱ غلطِ عمدی با «take» (اضافیِ هرگز-کلید؛ کلید = do) → ۳/۴ + اکو
//  بانک ۹: چهار ناهماهنگِ چاپی — buying/draw/chess/morning → ۴/۴ + قهرمان
//  بانک ۱۰: فرگمنت‌های رندر-فقط — make tea/draw a picture/ride a horse/type → ۴/۴ + قهرمان
//  بانک ۱۱: ناهماهنگِ خ۴ — Health/nurse → ۲/۲ + قهرمان
//  بانک ۱۲: نخستین ساقهٔ تمام‌فارسیِ کارت (تلفظ ch) — school → ۱/۱ + قهرمان
(() => {
  window.__r376 = {
    b8: { ok: 0, miss: [], done: false }, b9: { ok: 0, miss: [], done: false },
    b10: { ok: 0, miss: [], done: false }, b11: { ok: 0, miss: [], done: false },
    b12: { ok: 0, miss: [], done: false },
    log: [], phase: "b8",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r376.log.push({
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
  const backToCard = async () => {
    for (let w = 0; w < 15; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === "بازگشت");
      if (b) { b.click(); await sleep(900); }
      if ([...document.querySelectorAll("button")].some((x) => (x.textContent || "").includes("امتحانی درس"))) return true;
    }
    for (let w = 0; w < 10; w++) {
      const logo = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").includes("ویژن ۲"));
      if (logo) { logo.click(); await sleep(1200); }
      const lib = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").includes("کتابخانهٔ جزوه‌ها"));
      if (lib) { lib.click(); await sleep(1500); }
      const g8 = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").trim().startsWith("پایهٔ هشتم"));
      if (g8) { g8.click(); await sleep(2000); }
      if ([...document.querySelectorAll("button")].some((x) => (x.textContent || "").includes("امتحانی درس"))) return true;
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
    window.__r376[key].score = readScore();
    window.__r376[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r376[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r376[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r376.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r376[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r376[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r376[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  };

  (async () => {
    // ——— بانک ۸: بانکِ چاپیِ تک‌اضافی (۴ MCQ پنج‌گزینه‌ای) — ق۱ غلطِ عمدی با take ———
    window.__r376.phase = "b8-open";
    await openBank("سوم — تکمیل با بانک واژه");
    const B8 = [
      { frag: "a hard puzzle", click: "take", want: false }, // غلطِ عمدی: کلید = do
      { frag: "All my classmate", click: "speak" },
      { frag: "some food", click: "Cook" },
      { frag: "learn how to", click: "type" },
    ];
    const stem8 = () => B8.find((x) => body().includes(x.frag))?.frag || null;
    await play("b8", B8, stem8);

    // ——— بانک ۹: چهار ناهماهنگِ چاپی ———
    window.__r376.phase = "b9-back";
    window.__r376.b9.cardOk = await backToCard();
    snap("b9-card:" + window.__r376.b9.cardOk);
    window.__r376.phase = "b9-open";
    await openBank("سوم — کلمهٔ ناهماهنگ");
    const B9 = [
      { frag: "Swimming – running", click: "buying" },
      { frag: "Badminton – ping pong", click: "draw" },
      { frag: "Speak – read", click: "chess" },
      { frag: "Playing – doing", click: "morning" },
    ];
    const stem9 = () => B9.find((x) => body().includes(x.frag))?.frag || null;
    await play("b9", B9, stem9);

    // ——— بانک ۱۰: فرگمنت‌های رندر-فقط ———
    window.__r376.phase = "b10-back";
    window.__r376.b10.cardOk = await backToCard();
    snap("b10-card:" + window.__r376.b10.cardOk);
    window.__r376.phase = "b10-open";
    await openBank("کامل‌کردن حروف (س۴");
    const B10 = [
      { frag: "m-------ke t-------a", click: "make tea" },
      { frag: "dr-------w a pict-------re", click: "draw a picture" },
      { frag: "r-------de a h-------rse", click: "ride a horse" },
      { frag: "t-------p-------", click: "type" },
    ];
    const stem10 = () => B10.find((x) => body().includes(x.frag))?.frag || null;
    await play("b10", B10, stem10);

    // ——— بانک ۱۱: ناهماهنگِ درس چهارم ———
    window.__r376.phase = "b11-back";
    window.__r376.b11.cardOk = await backToCard();
    snap("b11-card:" + window.__r376.b11.cardOk);
    window.__r376.phase = "b11-open";
    await openBank("چهارم — کلمهٔ ناهماهنگ");
    const B11 = [
      { frag: "Health – sore eyes", click: "Health" },
      { frag: "Sneeze – cough", click: "nurse" },
    ];
    const stem11 = () => B11.find((x) => body().includes(x.frag))?.frag || null;
    await play("b11", B11, stem11);

    // ——— بانک ۱۲: تلفظ ch — نخستین ساقهٔ تمام‌فارسیِ کارت ———
    window.__r376.phase = "b12-back";
    window.__r376.b12.cardOk = await backToCard();
    snap("b12-card:" + window.__r376.b12.cardOk);
    window.__r376.phase = "b12-open";
    await openBank("تلفظ ch");
    const B12 = [{ frag: "صدای", click: "school" }];
    const stem12 = () => B12.find((x) => body().includes(x.frag))?.frag || null;
    await play("b12", B12, stem12);
    window.__r376.phase = "done";
  })();
})();
