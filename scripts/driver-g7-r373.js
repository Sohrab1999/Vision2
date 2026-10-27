// r373 — درایورِ سه بانکِ تازهٔ کارتِ هفتم — نسخهٔ ساقه‌محور (ترتیبِ خودِ بانک، جست‌وجوی
// case-sensitive، اکوی «پاسخ درست» در لحظهٔ کارنامه — الگویِ r370/r371/r372).
//  بانک ۱۶: پنج‌گزینه‌ایِ بانکِ آبی — کلیکِ کلیدِ هر سؤال → ۴/۴ + قهرمان
//  بانک ۱۷: فرگمنت‌های املا — حروفِ o/o/e → ۳/۳ + قهرمان (نخستین بانکِ گزینه‌تک‌حرفیِ کارت)
//  بانک ۲۰: ناهماهنگِ خ۸ — ق۱ درست (favorite) و ق۲ غلطِ عمدی با «cocount» (کلیدِ چاپ = fish)
//           → ۱/۲ + اکوی کارنامه
(() => {
  window.__r373 = {
    b16: { ok: 0, miss: [], done: false }, b17: { ok: 0, miss: [], done: false },
    b20: { ok: 0, miss: [], done: false }, log: [], phase: "b16",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r373.log.push({
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
    window.__r373[key].score = readScore();
    window.__r373[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r373[key].echo = t.slice(Math.max(0, ei - 140), ei + 180);
    window.__r373[key].done = true;
    snap(key + "-result:" + r);
  };

  (async () => {
    // ——— بانک ۱۶: تکمیل با بانکِ آبی (۴ MCQ پنج‌گزینه‌ای، ساقه با برچسبِ نمونه‌پاسخ) ———
    window.__r373.phase = "b16-open";
    await openBank("تکمیل با بانک واژه");
    const B16 = [
      { frag: "are you going?", click: "time" },
      { frag: "What is your", click: "phone number" },
      { frag: "And your", click: "e-mail address" },
      { frag: "Where do you", click: "live" },
    ];
    const stem16 = () => B16.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem16, (s) => s === "are you going?");
    snap("b16-opened");
    for (let i = 0; i < B16.length; i++) {
      window.__r373.phase = "b16-q" + (i + 1);
      const seen = await waitStem(stem16, (s) => s === B16[i].frag);
      if (!seen) { window.__r373.b16.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B16[i].click);
      if (!ok) { window.__r373.b16.miss.push((i + 1) + "-no-opt:" + B16[i].click); continue; }
      window.__r373.b16.ok++;
      await sleep(900);
      if (i < B16.length - 1) await advance();
      await sleep(600);
    }
    const r16 = await waitResult();
    finish("b16", r16);

    // ——— بانک ۱۷: فرگمنت‌های املا (۳ MCQ حروفی) ———
    window.__r373.phase = "b17-back";
    window.__r373.b17.cardOk = await backToCard();
    snap("b17-card:" + window.__r373.b17.cardOk);
    window.__r373.phase = "b17-open";
    await openBank("کامل‌کردن حروف");
    const B17 = [
      { frag: "ffice", click: "o" },
      { frag: "m-------bile", click: "o" },
      { frag: "str-------", click: "e" },
    ];
    const stem17 = () => B17.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem17, (s) => s === "ffice");
    snap("b17-opened");
    for (let i = 0; i < B17.length; i++) {
      window.__r373.phase = "b17-q" + (i + 1);
      const seen = await waitStem(stem17, (s) => s === B17[i].frag);
      if (!seen) { window.__r373.b17.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B17[i].click);
      if (!ok) { window.__r373.b17.miss.push((i + 1) + "-no-opt:" + B17[i].click); continue; }
      window.__r373.b17.ok++;
      await sleep(900);
      if (i < B17.length - 1) await advance();
      await sleep(600);
    }
    const r17 = await waitResult();
    finish("b17", r17);

    // ——— بانک ۲۰: ناهماهنگِ خ۸ (۲ MCQ) — ق۲ غلطِ عمدی ———
    window.__r373.phase = "b20-back";
    window.__r373.b20.cardOk = await backToCard();
    snap("b20-card:" + window.__r373.b20.cardOk);
    window.__r373.phase = "b20-open";
    await openBank("ناهماهنگ (س۴");
    const B20 = [
      { frag: "favorite – carrot", click: "favorite", want: true },
      { frag: "Kebab – fish", click: "cocount", want: false }, // غلطِ عمدی: کلیدِ چاپ = fish
    ];
    const stem20 = () => B20.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem20, (s) => s === "favorite – carrot");
    snap("b20-opened");
    for (let i = 0; i < B20.length; i++) {
      window.__r373.phase = "b20-q" + (i + 1);
      const seen = await waitStem(stem20, (s) => s === B20[i].frag);
      if (!seen) { window.__r373.b20.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B20[i].click);
      if (!ok) { window.__r373.b20.miss.push((i + 1) + "-no-opt:" + B20[i].click); continue; }
      if (B20[i].want) window.__r373.b20.ok++;
      await sleep(900);
      if (i < B20.length - 1) await advance();
      await sleep(600);
    }
    const r20 = await waitResult();
    finish("b20", r20);
    window.__r373.phase = "done";
  })();
})();
