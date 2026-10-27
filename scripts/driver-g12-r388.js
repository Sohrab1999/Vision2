// r388 — درایورِ دو بانک (الگویِ r387): بانکِ l66 گرامرِ خرداد ۱۳۹۹ ریاضی-تجربی — ق۱ غلطِ عمدی
// (کلیدِ رسمی = whom) → ۳/۴ + اکو؛ بانکِ l69 حروفِ ربطِ پاراگرافی (نخستین رندرِ چهارخانه‌ایِ (N))
// — همه درست → قهرمان (۴/۴ در موتور واقعی)
(() => {
  window.__r388 = { b66: { ok: 0, miss: [], done: false }, b69: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b66" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r388.log.push({
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
    window.__r388[key].score = readScore();
    window.__r388[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r388[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r388[key].done = true;
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
    // ——— بانک l66: گرامرِ خرداد ۱۳۹۹ ریاضی-تجربی — ق۱ غلطِ عمدی (کلید رسمی: whom) ———
    window.__r388.phase = "b66-open";
    await openBank("گرامر (س۷، ص۲۶۰-۲۶۱)"); // فرگمنتِ یکتا
    const B66 = [
      { frag: "She was the person", click: "when", want: false }, // کلید رسمی: whom
      { frag: "Scientists believe that hot weather", click: "endangering" },
      { frag: "Zhila never says a word", click: "does she" }, // کلیدِ چاپیِ ۲۸ = ( d )
      { frag: "My father might buy a new car", click: "were saved" },
    ];
    const stem66 = () => B66.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem66, (s) => s === B66[0].frag);
    snap("b66-opened");
    for (let i = 0; i < B66.length; i++) {
      window.__r388.phase = "b66-q" + (i + 1);
      const seen = await waitStem(stem66, (s) => s === B66[i].frag);
      if (!seen) { window.__r388.b66.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B66[i].click);
      if (!ok) { window.__r388.b66.miss.push((i + 1) + "-no-opt:" + B66[i].click); continue; }
      if (B66[i].want !== false) window.__r388.b66.ok++;
      await sleep(900);
      if (i < B66.length - 1) await advance();
      await sleep(600);
    }
    const r66 = await waitResult();
    finish("b66", r66);
    await backToCard();

    // ——— بانک l69: حروفِ ربطِ پاراگرافی — نخستین رندرِ چهارخانه‌ای — همه درست → قهرمان ———
    window.__r388.phase = "b69-open";
    await openBank("حروفِ ربطِ پاراگراف (س۱۲، ص۲۶۳)");
    const B69 = [
      { frag: "Teachers work hard every day", click: "so" },
      { frag: "You should know their values", click: "and" },
      { frag: "You may sometimes forget their kindness", click: "but" },
      { frag: "Treat them well when they are still around", click: "or" },
    ];
    const stem69 = () => B69.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem69, (s) => s === B69[0].frag);
    snap("b69-opened");
    for (let i = 0; i < B69.length; i++) {
      window.__r388.phase = "b69-q" + (i + 1);
      const seen = await waitStem(stem69, (s) => s === B69[i].frag);
      if (!seen) { window.__r388.b69.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B69[i].click);
      if (!ok) { window.__r388.b69.miss.push((i + 1) + "-no-opt:" + B69[i].click); continue; }
      window.__r388.b69.ok++;
      await sleep(900);
      if (i < B69.length - 1) await advance();
      await sleep(600);
    }
    const r69 = await waitResult();
    window.__r388.b69.optsSeen = window.__r388.log.filter((x) => x.tag.startsWith("b69-q")).map((x) => x.opts);
    finish("b69", r69);
    window.__r388.phase = "done";
  })();
})();
