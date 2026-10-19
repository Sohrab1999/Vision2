// r385 — درایورِ دو بانکِ نهایی (الگویِ r384): بانکِ l37 گرامر — ق۱ غلطِ عمدی (کلید = does he)
// → ۳/۴ + اکو؛ بانکِ l42 مرتب‌سازیِ شش‌گزینه‌ای «ارتباطات» — همه درست → قهرمان (opts=6 در موتور واقعی)
(() => {
  window.__r385 = { b37: { ok: 0, miss: [], done: false }, b42: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b37" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r385.log.push({
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
    window.__r385[key].score = readScore();
    window.__r385[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r385[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r385[key].done = true;
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
    // ——— بانک l37: گرامرِ نهاییِ خرداد ۱۴۰۰ ریاضی-تجربی — ق۱ غلطِ عمدی (کلید رسمی: does he) ———
    window.__r385.phase = "b37-open";
    await openBank("گرامر (س۹، ص۳۱۰)"); // فرگمنتِ یکتا — l30ِ r384 هم «گرامر» دارد (ص۳۱۷)
    const B37 = [
      { frag: "Hamid doesn’t say a bad word", click: "did Hamid", want: false }, // کلید رسمی: does he
      { frag: "What did she do last Friday", click: "which" },
      { frag: "Guess what we have for dinner", click: "may be made" },
      { frag: "If you had a good job", click: "could earn" },
    ];
    const stem37 = () => B37.find((x) => body().includes(x.frag))?.frag || null;
    await play("b37", B37, stem37);
    await backToCard();

    // ——— بانک l42: مرتب‌سازیِ شش‌گزینه‌ای «ارتباطات» — قهرمان ———
    window.__r385.phase = "b42-open";
    await openBank("نهایی خرداد ۱۴۰۰ — مرتب‌سازیِ پاراگرافِ ارتباطات");
    const B42 = [
      { frag: "جایگاهِ ۵۱", click: "The new century has brought big changes in communication." },
      { frag: "جایگاهِ ۵۲", click: "Cell phones are important in these changes." },
      { frag: "جایگاهِ ۵۳", click: "Most of these cell phones can help you have video calls." },
      { frag: "جایگاهِ ۵۴", click: "But some people do not have such phones" },
      { frag: "جایگاهِ ۵۵", click: "because they are very expensive." },
      { frag: "جایگاهِ ۵۶", click: "In short, communication can depend on technology." },
    ];
    const stem42 = () => B42.find((x) => body().includes(x.frag))?.frag || null;
    const stem42snap = () => {
      const f = stem42();
      if (f) window.__r385.b42.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem42, (s) => s === "جایگاهِ ۵۱");
    snap("b42-opened");
    for (let i = 0; i < B42.length; i++) {
      window.__r385.phase = "b42-q" + (i + 1);
      const seen = await waitStem(stem42snap, (s) => s === B42[i].frag);
      if (!seen) { window.__r385.b42.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B42[i].click);
      if (!ok) { window.__r385.b42.miss.push((i + 1) + "-no-opt:" + B42[i].click); continue; }
      window.__r385.b42.ok++;
      await sleep(900);
      if (i < B42.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b42", r);
    window.__r385.phase = "done";
  })();

  // همان playِ r384 — تعریفِ دیرهنگامِ هوistingِ تابع
  async function play(key, B, stemFn) {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r385.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r385[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r385[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r385[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
  }
})();
