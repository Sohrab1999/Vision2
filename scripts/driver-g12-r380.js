// r380 — درایورِ دو بانکِ نهایی (الگویِ r379): بانکِ l6 گرامر — ق۱ غلطِ عمدی (کلید = is he)
// → ۵/۶ + اکو؛ بانکِ l4 کلوژِ سالمندان — همه درست → قهرمان (نخستین آیتم‌های کلیدِ رسمیِ وزارتی در موتور واقعی)
(() => {
  window.__r380 = { b6: { ok: 0, miss: [], done: false }, b4: { ok: 0, miss: [], done: false }, log: [], phase: "b6" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r380.log.push({
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
    window.__r380[key].score = readScore();
    window.__r380[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r380[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r380[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r380.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r380[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r380[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r380[key].ok++;
      await sleep(900);
      if (i < B.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish(key, r);
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
    // ——— بانک l6: گرامرِ نهایی — ق۱ غلطِ عمدی (کلید = is he) ———
    window.__r380.phase = "b6-open";
    await openBank("نهایی خرداد ۱۴۰۲ — گرامر");
    const B6 = [
      { frag: "Hamid has not come to school", click: "has he", want: false }, // کلید رسمی: is he
      { frag: "The woman ------- my sister met", click: "whom" },
      { frag: "This book -------into countless languages", click: "has been translated" },
      { frag: "This summer is really hot", click: "should be done" },
      { frag: "the baby------- asleep", click: "had fallen" },
      { frag: "ضمیرِ موصولیِ مناسب", click: "who" },
    ];
    const stem6 = () => B6.find((x) => body().includes(x.frag))?.frag || null;
    await play("b6", B6, stem6);
    await backToCard();

    // ——— بانک l4: کلوژِ سالمندان — قهرمان ———
    window.__r380.phase = "b4-open";
    await openBank("نهایی خرداد ۱۴۰۲ — کامل‌کردن متن");
    const B4 = [
      { frag: "خانهٔ (11)", click: "forgive" },
      { frag: "خانهٔ (12)", click: "knowledge" },
      { frag: "خانهٔ (13)", click: "faced" },
      { frag: "خانهٔ (14)", click: "respecting" },
      { frag: "خانهٔ (15)", click: "feel" },
      { frag: "خانهٔ (16)", click: "appreciate" },
    ];
    const stem4 = () => B4.find((x) => body().includes(x.frag))?.frag || null;
    await play("b4", B4, stem4);
    window.__r380.phase = "done";
  })();
})();
