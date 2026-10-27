// r375 — درایورِ چهار بانکِ خانوادهٔ درس دومِ کارتِ هشتم — الگویِ r374 (ساقه‌محور،
// جست‌وجوی case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه).
//  بانک ۴: فرگمنت‌های رندر-فقط — shopping/library → ۲/۲ + قهرمان
//  بانک ۵: بانکِ بدونِ اضافی — ق۱ غلطِ عمدی با «Mountain» (کلید = relax) → ۴/۵ + اکوی کارنامه
//  بانک ۶: درون‌چاپی با ساقهٔ فارسیِ «شروع کردن» — Friday/Lessons/start → ۳/۳ + قهرمان
//  بانک ۷: ناهماهنگِ تک‌ردیفی — midday → ۱/۱ + قهرمان
(() => {
  window.__r375 = {
    b4: { ok: 0, miss: [], done: false }, b5: { ok: 0, miss: [], done: false },
    b6: { ok: 0, miss: [], done: false }, b7: { ok: 0, miss: [], done: false },
    log: [], phase: "b4",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r375.log.push({
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
    window.__r375[key].score = readScore();
    window.__r375[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r375[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r375[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r375.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r375[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r375[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r375[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  };

  (async () => {
    // ——— بانک ۴: فرگمنت‌های رندر-فقط (۲ MCQ) ———
    window.__r375.phase = "b4-open";
    await openBank("کامل‌کردن حروف (س۱");
    const B4 = [
      { frag: "go sh-------ing", click: "shopping" },
      { frag: "go to l-------br-------y", click: "library" },
    ];
    const stem4 = () => B4.find((x) => body().includes(x.frag))?.frag || null;
    await play("b4", B4, stem4);

    // ——— بانک ۵: بانکِ بدونِ اضافی (۵ MCQ پنج‌گزینه‌ای) — ق۱ غلطِ عمدی ———
    window.__r375.phase = "b5-back";
    window.__r375.b5.cardOk = await backToCard();
    snap("b5-card:" + window.__r375.b5.cardOk);
    window.__r375.phase = "b5-open";
    await openBank("تکمیل با بانک واژه (س۲");
    const B5 = [
      { frag: "I stay at home", click: "Mountain", want: false }, // غلطِ عمدی: کلید = relax
      { frag: "correct", click: "pronunciation" },
      { frag: "I climb a", click: "Mountain" },
      { frag: "We visit our", click: "relative" },
      { frag: "I will let her", click: "know" },
    ];
    const stem5 = () => B5.find((x) => body().includes(x.frag))?.frag || null;
    await play("b5", B5, stem5);

    // ——— بانک ۶: گزینهٔ صحیح (۳ MCQ سه‌گزینه‌ای؛ آیتمِ ۳ ساقهٔ فارسی) ———
    window.__r375.phase = "b6-back";
    window.__r375.b6.cardOk = await backToCard();
    snap("b6-card:" + window.__r375.b6.cardOk);
    window.__r375.phase = "b6-open";
    await openBank("گزینهٔ صحیح (س۳");
    const B6 = [
      { frag: "is the weekend", click: "Friday" },
      { frag: "I study my", click: "Lessons" },
      { frag: "شروع کردن", click: "start" },
    ];
    const stem6 = () => B6.find((x) => body().includes(x.frag))?.frag || null;
    await play("b6", B6, stem6);

    // ——— بانک ۷: ناهماهنگِ تک‌ردیفی (۱ MCQ) ———
    window.__r375.phase = "b7-back";
    window.__r375.b7.cardOk = await backToCard();
    snap("b7-card:" + window.__r375.b7.cardOk);
    window.__r375.phase = "b7-open";
    await openBank("کلمهٔ ناهماهنگ (س۴");
    const B7 = [{ frag: "Monday – Sunday", click: "midday" }];
    const stem7 = () => B7.find((x) => body().includes(x.frag))?.frag || null;
    await play("b7", B7, stem7);
    window.__r375.phase = "done";
  })();
})();
