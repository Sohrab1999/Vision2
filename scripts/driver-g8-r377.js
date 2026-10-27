// r377 — درایورِ سه بانکِ جفتِ خانوادهٔ پنجم/ششمِ کارتِ هشتم — الگویِ r376 (ساقه‌محور،
// جست‌وجوی case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه).
//  بانک ۱۳: فرگمنت‌های لایه‌ایِ شکل‌یگانه — ق۱ غلطِ عمدی با «cinema» (کلید = airport) → ۳/۴ + اکو
//  بانک ۱۴: دو تلفظِ وارونه‌شدهٔ th به «ذ» — brother/this → ۲/۲ + قهرمان
//  بانک ۱۵: چهار ناهماهنگِ verbatimِ ص۶۰ (با تایپوی چاپیِ einter) — weather/River/story/hot → ۴/۴ + قهرمان
(() => {
  window.__r377 = {
    b13: { ok: 0, miss: [], done: false }, b14: { ok: 0, miss: [], done: false },
    b15: { ok: 0, miss: [], done: false },
    log: [], phase: "b13",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r377.log.push({
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
    window.__r377[key].score = readScore();
    window.__r377[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r377[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r377[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r377.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r377[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r377[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r377[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  };

  (async () => {
    // ——— بانک ۱۳: فرگمنت‌های لایه‌ای — ق۱ غلطِ عمدی با cinema (کلید = airport) ———
    window.__r377.phase = "b13-open";
    await openBank("پنجم — کامل‌کردن حروف");
    const B13 = [
      { frag: "Airp – rt", click: "cinema", want: false }, // غلطِ عمدی: کلید = airport
      { frag: "cin – ma", click: "cinema" },
      { frag: "shr – ne", click: "shrine" },
      { frag: "pal - ce", click: "palace" },
    ];
    const stem13 = () => B13.find((x) => body().includes(x.frag))?.frag || null;
    await play("b13", B13, stem13);

    // ——— بانک ۱۴: دو تلفظِ وارونه‌شدهٔ «ذ» ———
    window.__r377.phase = "b14-back";
    window.__r377.b14.cardOk = await backToCard();
    snap("b14-card:" + window.__r377.b14.cardOk);
    window.__r377.phase = "b14-open";
    await openBank("پنجم — تلفظ th");
    const B14 = [
      { frag: "حرف th", click: "brother" },
      { frag: "حرف th", click: "this" },
    ];
    const stem14 = () => B14.find((x) => body().includes(x.frag))?.frag || null;
    await play("b14", B14, stem14);

    // ——— بانک ۱۵: چهار ناهماهنگِ ص۶۰ ———
    window.__r377.phase = "b15-back";
    window.__r377.b15.cardOk = await backToCard();
    snap("b15-card:" + window.__r377.b15.cardOk);
    window.__r377.phase = "b15-open";
    await openBank("ششم — کلمهٔ ناهماهنگ");
    const B15 = [
      { frag: "Father – mother", click: "weather" },
      { frag: "River – summer", click: "River" },
      { frag: "Wet – rainy", click: "story" },
      { frag: "Icy – snowy", click: "hot" },
    ];
    const stem15 = () => B15.find((x) => body().includes(x.frag))?.frag || null;
    await play("b15", B15, stem15);
    window.__r377.phase = "done";
  })();
})();
