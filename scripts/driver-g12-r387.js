// r387 — درایورِ دو بانکِ نهایی (الگویِ r386): بانکِ l54 گرامر — ق۱ غلطِ عمدی (کلید = won`t they)
// → ۵/۶ + اکو؛ بانکِ l59 اصطلاحاتِ س۱۶-ب — همه درست → قهرمان (۴/۴ در موتور واقعی)
(() => {
  window.__r387 = { b54: { ok: 0, miss: [], done: false }, b59: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b54" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r387.log.push({
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
    window.__r387[key].score = readScore();
    window.__r387[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r387[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r387[key].done = true;
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
    // ——— بانک l54: گرامرِ نهاییِ شهریور ۱۳۹۹ — ق۱ غلطِ عمدی (کلید رسمی: won`t they با بک‌تیکِ چاپ) ———
    window.__r387.phase = "b54-open";
    await openBank("گرامر (س۸، ص۲۸۶)"); // فرگمنتِ یکتا — بقیهٔ گرامرها س۹/س۱۰اند
    const B54 = [
      { frag: "They will buy a new house", click: "will he", want: false }, // کلید رسمی: won`t they
      { frag: "My mother found the keys", click: "which" },
      { frag: "Hafez", click: "is known" },
      { frag: "What is the problem?", click: "have been broken" },
      { frag: "If the old man had his glasses", click: "could read" },
      { frag: "My job has become", click: "increasingly" },
    ];
    const stem54 = () => B54.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem54, (s) => s === B54[0].frag);
    snap("b54-opened");
    for (let i = 0; i < B54.length; i++) {
      window.__r387.phase = "b54-q" + (i + 1);
      const seen = await waitStem(stem54, (s) => s === B54[i].frag);
      if (!seen) { window.__r387.b54.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B54[i].click);
      if (!ok) { window.__r387.b54.miss.push((i + 1) + "-no-opt:" + B54[i].click); continue; }
      if (B54[i].want !== false) window.__r387.b54.ok++;
      await sleep(900);
      if (i < B54.length - 1) await advance();
      await sleep(600);
    }
    const r54 = await waitResult();
    finish("b54", r54);
    await backToCard();

    // ——— بانک l59: اصطلاحاتِ س۱۶-ب — همه درست → قهرمان ———
    window.__r387.phase = "b59-open";
    await openBank("اصطلاحات (س۱۶-ب، ص۲۸۹)");
    const B59 = [
      { frag: "Out of sight, out of mind", click: "You soon forget people or things that are no longer visible or present." },
      { frag: "Practice makes perfect", click: "You have to practice a skill a lot to become good at it." },
      { frag: "Easy come, easy go", click: "When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well." },
      { frag: "Two heads are better than one", click: "When two people cooperate with each other, they come up with better ideas." },
    ];
    const stem59 = () => B59.find((x) => body().includes(x.frag))?.frag || null;
    await waitStem(stem59, (s) => s === B59[0].frag);
    snap("b59-opened");
    for (let i = 0; i < B59.length; i++) {
      window.__r387.phase = "b59-q" + (i + 1);
      const seen = await waitStem(stem59, (s) => s === B59[i].frag);
      if (!seen) { window.__r387.b59.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B59[i].click);
      if (!ok) { window.__r387.b59.miss.push((i + 1) + "-no-opt:" + B59[i].click); continue; }
      window.__r387.b59.ok++;
      await sleep(900);
      if (i < B59.length - 1) await advance();
      await sleep(600);
    }
    const r59 = await waitResult();
    finish("b59", r59);
    window.__r387.phase = "done";
  })();
})();
