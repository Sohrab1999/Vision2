// r374 — درایورِ سه بانکِ نخستین کارتِ هشتم — نسخهٔ ساقه‌محور (ترتیبِ خودِ بانک، جست‌وجوی
// case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه — الگویِ r370-r373).
//  بانک ۱: ناهماهنگ — ق۱/۲/۴ درست (Spanish/Europe/Britain) و ق۳ غلطِ عمدی با «Asia»
//           (کلیدِ چاپ = china با c کوچک) → ۳/۴ + اکوی کارنامه
//  بانک ۲: بانکِ دواضعی — alittle/originally/Beautiful (B بزرگِ چاپ، case-sensitive) → ۳/۳ + قهرمان
//  بانک ۳: ترجمهٔ جدولِ ساقه‌فارسی — continent/a beautiful country/year → ۳/۳ + قهرمان
(() => {
  window.__r374 = {
    b1: { ok: 0, miss: [], done: false }, b2: { ok: 0, miss: [], done: false },
    b3: { ok: 0, miss: [], done: false }, log: [], phase: "b1",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r374.log.push({
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
    window.__r374[key].score = readScore();
    window.__r374[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r374[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r374[key].done = true;
    snap(key + "-result:" + r);
  };

  (async () => {
    // ——— بانک ۱: ناهماهنگ (۴ MCQ) — ق۳ غلطِ عمدی ———
    window.__r374.phase = "b1-open";
    await openBank("کلمهٔ ناهماهنگ (س۲");
    const B1 = [
      { frag: "Indonesia", click: "Spanish", want: true },
      { frag: "Australia", click: "Europe", want: true },
      { frag: "Asia – Europe", click: "Asia", want: false }, // غلطِ عمدی: کلید = china
      { frag: "Chinese", click: "Britain", want: true },
    ];
    const stem1 = () => B1.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem1, (s) => s === "Indonesia");
    snap("b1-opened");
    for (let i = 0; i < B1.length; i++) {
      window.__r374.phase = "b1-q" + (i + 1);
      const seen = await waitStem(stem1, (s) => s === B1[i].frag);
      if (!seen) { window.__r374.b1.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B1[i].click);
      if (!ok) { window.__r374.b1.miss.push((i + 1) + "-no-opt:" + B1[i].click); continue; }
      if (B1[i].want) window.__r374.b1.ok++;
      await sleep(900);
      if (i < B1.length - 1) await advance();
      await sleep(600);
    }
    const r1 = await waitResult();
    finish("b1", r1);

    // ——— بانک ۲: بانکِ دواضعی (۳ MCQ پنج‌گزینه‌ای) ———
    window.__r374.phase = "b2-back";
    window.__r374.b2.cardOk = await backToCard();
    snap("b2-card:" + window.__r374.b2.cardOk);
    window.__r374.phase = "b2-open";
    await openBank("تکمیل با بانک واژه (س۳");
    const B2 = [
      { frag: "I speak French", click: "alittle" },
      { frag: "Australian but", click: "originally" },
      { frag: "Spain is a", click: "Beautiful" },
    ];
    const stem2 = () => B2.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem2, (s) => s === "I speak French");
    snap("b2-opened");
    for (let i = 0; i < B2.length; i++) {
      window.__r374.phase = "b2-q" + (i + 1);
      const seen = await waitStem(stem2, (s) => s === B2[i].frag);
      if (!seen) { window.__r374.b2.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B2[i].click);
      if (!ok) { window.__r374.b2.miss.push((i + 1) + "-no-opt:" + B2[i].click); continue; }
      window.__r374.b2.ok++;
      await sleep(900);
      if (i < B2.length - 1) await advance();
      await sleep(600);
    }
    const r2 = await waitResult();
    finish("b2", r2);

    // ——— بانک ۳: ترجمهٔ جدول (۳ MCQ ساقه‌فارسی) ———
    window.__r374.phase = "b3-back";
    window.__r374.b3.cardOk = await backToCard();
    snap("b3-card:" + window.__r374.b3.cardOk);
    window.__r374.phase = "b3-open";
    await openBank("ترجمهٔ جدول");
    const B3 = [
      { frag: "قاره", click: "continent" },
      { frag: "کشوری زیبا", click: "a beautiful country" },
      { frag: "سال", click: "year" },
    ];
    const stem3 = () => B3.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem3, (s) => s === "قاره");
    snap("b3-opened");
    for (let i = 0; i < B3.length; i++) {
      window.__r374.phase = "b3-q" + (i + 1);
      const seen = await waitStem(stem3, (s) => s === B3[i].frag);
      if (!seen) { window.__r374.b3.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B3[i].click);
      if (!ok) { window.__r374.b3.miss.push((i + 1) + "-no-opt:" + B3[i].click); continue; }
      window.__r374.b3.ok++;
      await sleep(900);
      if (i < B3.length - 1) await advance();
      await sleep(600);
    }
    const r3 = await waitResult();
    finish("b3", r3);
    window.__r374.phase = "done";
  })();
})();
