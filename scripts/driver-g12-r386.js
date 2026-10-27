// r386 — درایورِ دو بانکِ نهایی (الگویِ r385): بانکِ l46 گرامر — ق۱ غلطِ عمدی (کلید = hasn’t she)
// → ۳/۴ + اکو؛ بانکِ l50 مرتب‌سازیِ شش‌گزینه‌ای «کانادا» — همه درست → قهرمان (opts=6 در موتور واقعی)
(() => {
  window.__r386 = { b46: { ok: 0, miss: [], done: false }, b50: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b46" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r386.log.push({
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
    window.__r386[key].score = readScore();
    window.__r386[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r386[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r386[key].done = true;
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
    // ——— بانک l46: گرامرِ نهاییِ دی ۱۳۹۹ — ق۱ غلطِ عمدی (کلید رسمی: hasn’t she) ———
    window.__r386.phase = "b46-open";
    await openBank("گرامر (س۱۰، ص۳۰۳)"); // فرگمنتِ یکتا — بقیهٔ گرامرها س۹اند
    const B46 = [
      { frag: "Your sister has passed the exam", click: "has she", want: false }, // کلید رسمی: hasn’t she
      { frag: "Are you writing the letter to your father", click: "which" },
      { frag: "The traffic rules", click: "must be obeyed" },
      { frag: "My parents-------healthier", click: "would be" },
    ];
    const stem46 = () => B46.find((x) => body().includes(x.frag))?.frag || null;
    await play("b46", B46, stem46);
    await backToCard();

    // ——— بانک l50: مرتب‌سازیِ شش‌گزینه‌ای «کانادا» — قهرمان ———
    window.__r386.phase = "b50-open";
    await openBank("مرتب‌سازیِ پاراگرافِ کانادا");
    const B50 = [
      { frag: "جایگاهِ ۵۶", click: "there are several reasons why Canada is one of the best countries in the world" },
      { frag: "جایگاهِ ۵۷", click: "first, Canada has an excellent health care system" },
      { frag: "جایگاهِ ۵۸", click: "therefore, many patients are easily cured in hospitals in Canada" },
      { frag: "جایگاهِ ۵۹", click: "second, it has a high standard of education for young people" },
      { frag: "جایگاهِ ۶۰", click: "in addition there are many chances for them to get a good job" },
      { frag: "جایگاهِ ۶۱", click: "as a result, many people like to live in Canada" },
    ];
    const stem50 = () => B50.find((x) => body().includes(x.frag))?.frag || null;
    const stem50snap = () => {
      const f = stem50();
      if (f) window.__r386.b50.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem50, (s) => s === "جایگاهِ ۵۶");
    snap("b50-opened");
    for (let i = 0; i < B50.length; i++) {
      window.__r386.phase = "b50-q" + (i + 1);
      const seen = await waitStem(stem50snap, (s) => s === B50[i].frag);
      if (!seen) { window.__r386.b50.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B50[i].click);
      if (!ok) { window.__r386.b50.miss.push((i + 1) + "-no-opt:" + B50[i].click); continue; }
      window.__r386.b50.ok++;
      await sleep(900);
      if (i < B50.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b50", r);
    window.__r386.phase = "done";
  })();

  // همان playِ r385 — تعریفِ دیرهنگامِ hoistingِ تابع
  async function play(key, B, stemFn) {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r386.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r386[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r386[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r386[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  }
})();
