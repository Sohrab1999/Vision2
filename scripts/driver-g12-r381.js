// r381 — درایورِ دو بانکِ نهایی (الگویِ r380): بانکِ l11 گرامر — ق۱ غلطِ عمدی (کلید = whom)
// → ۳/۴ + اکو؛ بانکِ l9 کلوژِ شش‌گزینه‌ای «Last night» — همه درست → قهرمان (opts=6 در موتور واقعی)
(() => {
  window.__r381 = { b11: { ok: 0, miss: [], done: false }, b9: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b11" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r381.log.push({
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
    window.__r381[key].score = readScore();
    window.__r381[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r381[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r381[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r381.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r381[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r381[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r381[key].ok++;
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
    // ——— بانک l11: گرامرِ نهاییِ شهریور — ق۱ غلطِ عمدی (کلید رسمی: whom) ———
    window.__r381.phase = "b11-open";
    await openBank("نهایی شهریور ۱۴۰۱ — گرامر");
    const B11 = [
      { frag: "The boy ------- you invited", click: "which", want: false }, // کلید رسمی: whom
      { frag: "English ------- in many countries", click: "is spoken" },
      { frag: "His sister never behaves politely", click: "does she" },
      { frag: "Zahra ------- chess before", click: "hadn’t played" },
    ];
    const stem11 = () => B11.find((x) => body().includes(x.frag))?.frag || null;
    await play("b11", B11, stem11);
    await backToCard();

    // ——— بانک l9: کلوژِ شش‌گزینه‌ای «Last night» — قهرمان ———
    window.__r381.phase = "b9-open";
    await openBank("نهایی شهریور ۱۴۰۱ — متنِ شنیداریِ چاپ");
    const B9 = [
      { frag: "خانهٔ (13)", click: "late" },
      { frag: "خانهٔ (14)", click: "office" },
      { frag: "خانهٔ (15)", click: "quiet" },
      { frag: "خانهٔ (16)", click: "walking" },
      { frag: "خانهٔ (17)", click: "wondered" },
      { frag: "خانهٔ (18)", click: "suddenly" },
    ];
    const stem9 = () => B9.find((x) => body().includes(x.frag))?.frag || null;
    const stem9snap = () => {
      const f = stem9();
      if (f) window.__r381.b9.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem9, (s) => s === "خانهٔ (13)");
    snap("b9-opened");
    for (let i = 0; i < B9.length; i++) {
      window.__r381.phase = "b9-q" + (i + 1);
      const seen = await waitStem(stem9snap, (s) => s === B9[i].frag);
      if (!seen) { window.__r381.b9.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B9[i].click);
      if (!ok) { window.__r381.b9.miss.push((i + 1) + "-no-opt:" + B9[i].click); continue; }
      window.__r381.b9.ok++;
      await sleep(900);
      if (i < B9.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b9", r);
    window.__r381.phase = "done";
  })();
})();
