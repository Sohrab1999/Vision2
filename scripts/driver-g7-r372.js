// r372 — درایورِ سه بانکِ تازهٔ کارتِ هفتم — نسخهٔ ساقه‌محور (درسِ r370/r371: ترتیبِ خودِ بانک،
// جست‌وجوی case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه).
//  بانک ۱۱: پنج‌گزینه‌ایِ ستونِ B — کلیکِ پاسخِ منطقیِ هر سؤال → ۴/۴ + قهرمان
//  بانک ۱۲: فرمِ Reza Pakzad — نگاشتِ یک‌به‌یکِ فیلد→مقدار → ۴/۴ + قهرمان
//  بانک ۱۵: هشت‌گزینه‌ایِ بانک واژه — ق۱ غلطِ عمدی با هرگز-کلیدِ «reading» (واژهٔ بی‌مصرفِ
//           حذفِ آیتمیِ b-B) → ۵/۶ + اکوی کارنامه
(() => {
  window.__r372 = {
    b11: { ok: 0, miss: [], done: false }, b12: { ok: 0, miss: [], done: false },
    b15: { ok: 0, miss: [], done: false }, log: [], phase: "b11",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r372.log.push({
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
      const g7 = [...document.querySelectorAll("button,a")].find((x) => (x.textContent || "").trim().startsWith("پایهٔ هفتم"));
      if (g7) { g7.click(); await sleep(2000); }
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
    window.__r372[key].score = readScore();
    window.__r372[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r372[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r372[key].done = true;
    snap(key + "-result:" + r);
  };

  (async () => {
    // ——— بانک ۱۱: پاسخ از ستون B (۴ MCQ پنج‌گزینه‌ای) ———
    window.__r372.phase = "b11-open";
    await openBank("پاسخ از ستون B");
    const B11 = [
      { frag: "How are you today?", click: "Great, thanks" },
      { frag: "What is his Job?", click: "He is a worker." },
      { frag: "Who is that woman?", click: "She is my teacher, Mrs Amini." },
      { frag: "isyour uncle", click: "He is sixteen years old." },
    ];
    const stem11 = () => B11.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem11, (s) => s === "How are you today?");
    snap("b11-opened");
    for (let i = 0; i < B11.length; i++) {
      window.__r372.phase = "b11-q" + (i + 1);
      const seen = await waitStem(stem11, (s) => s === B11[i].frag);
      if (!seen) { window.__r372.b11.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B11[i].click);
      if (!ok) { window.__r372.b11.miss.push((i + 1) + "-no-opt:" + B11[i].click); continue; }
      window.__r372.b11.ok++;
      await sleep(900);
      if (i < B11.length - 1) await advance();
      await sleep(600);
    }
    const r11 = await waitResult();
    finish("b11", r11);

    // ——— بانک ۱۲: کامل‌کردن فرم (۴ MCQ چهارگزینه‌ای) ———
    window.__r372.phase = "b12-back";
    window.__r372.b12.cardOk = await backToCard();
    snap("b12-card:" + window.__r372.b12.cardOk);
    window.__r372.phase = "b12-open";
    await openBank("کامل‌کردن فرم");
    const B12 = [
      { frag: "First name:", click: "Reza" },
      { frag: "Last name:", click: "Pakzad" },
      { frag: "Month of birth:", click: "Azar" },
      { frag: "Job:", click: "waiter" },
    ];
    const stem12 = () => B12.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem12, (s) => s === "First name:");
    snap("b12-opened");
    for (let i = 0; i < B12.length; i++) {
      window.__r372.phase = "b12-q" + (i + 1);
      const seen = await waitStem(stem12, (s) => s === B12[i].frag);
      if (!seen) { window.__r372.b12.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B12[i].click);
      if (!ok) { window.__r372.b12.miss.push((i + 1) + "-no-opt:" + B12[i].click); continue; }
      window.__r372.b12.ok++;
      await sleep(900);
      if (i < B12.length - 1) await advance();
      await sleep(600);
    }
    const r12 = await waitResult();
    finish("b12", r12);

    // ——— بانک ۱۵: کامل‌کردن با بانک واژه (۶ MCQ هشت‌گزینه‌ای) ———
    window.__r372.phase = "b15-back";
    window.__r372.b15.cardOk = await backToCard();
    snap("b15-card:" + window.__r372.b15.cardOk);
    window.__r372.phase = "b15-open";
    await openBank("کامل‌کردن با بانک واژه");
    // ترتیبِ خودِ بانک؛ فرگمنت‌های case-sensitive یکتا («Is he?» با I بزرگ در d نیست)
    const B15 = [
      { frag: "I am in the", click: "reading", want: false }, // غلطِ عمدی: هرگز-کلیدِ b-B حذف‌شده
      { frag: "What are you", click: "doing", want: true },
      { frag: "Is he?", click: "where", want: true },
      { frag: "in the living room", click: "she's", want: true },
      { frag: "is he doing.", click: "what", want: true },
      { frag: "TV.", click: "watching", want: true },
    ];
    const stem15 = () => B15.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem15, (s) => s === "I am in the");
    snap("b15-opened");
    for (let i = 0; i < B15.length; i++) {
      window.__r372.phase = "b15-q" + (i + 1);
      const seen = await waitStem(stem15, (s) => s === B15[i].frag);
      if (!seen) { window.__r372.b15.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B15[i].click);
      if (!ok) { window.__r372.b15.miss.push((i + 1) + "-no-opt:" + B15[i].click); continue; }
      if (B15[i].want) window.__r372.b15.ok++;
      await sleep(900);
      if (i < B15.length - 1) await advance();
      await sleep(600);
    }
    const r15 = await waitResult();
    finish("b15", r15);
    window.__r372.phase = "done";
  })();
})();
