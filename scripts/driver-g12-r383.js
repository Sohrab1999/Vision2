// r383 — درایورِ دو بانکِ نهایی (الگویِ r382): بانکِ l24 گرامر — ق۱ غلطِ عمدی (کلید = have you)
// → ۳/۴ + اکو؛ بانکِ l22 کلوژِ پنج‌گزینه‌ای «پزشکان» — همه درست → قهرمان (opts=5 در موتور واقعی)
(() => {
  window.__r383 = { b24: { ok: 0, miss: [], done: false }, b22: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b24" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r383.log.push({
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
    window.__r383[key].score = readScore();
    window.__r383[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r383[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r383[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r383.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r383[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r383[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r383[key].ok++;
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
    // ——— بانک l24: گرامرِ نهاییِ شهریور ۱۴۰۰ — ق۱ غلطِ عمدی (کلید رسمی: have you) ———
    window.__r383.phase = "b24-open";
    await openBank("نهایی شهریور ۱۴۰۰ — گرامر");
    const B24 = [
      { frag: "You haven’t done your homework", click: "haven’t you", want: false }, // کلید رسمی: have you
      { frag: "What did you find", click: "which" },
      { frag: "talk to the parents", click: "should be called" },
      { frag: "This question is very hard", click: "could ask" },
    ];
    const stem24 = () => B24.find((x) => body().includes(x.frag))?.frag || null;
    await play("b24", B24, stem24);
    await backToCard();

    // ——— بانک l22: کلوژِ پنج‌گزینه‌ای «پزشکان» — قهرمان ———
    window.__r383.phase = "b22-open";
    await openBank("نهایی شهریور ۱۴۰۰ — کلوژِ مکالمهٔ پزشکان");
    const B22 = [
      { frag: "خانهٔ (12)", click: "medicine" },
      { frag: "خانهٔ (13)", click: "history" },
      { frag: "خانهٔ (14)", click: "Persian" },
      { frag: "خانهٔ (15)", click: "life" },
      { frag: "خانهٔ (16)", click: "take" },
    ];
    const stem22 = () => B22.find((x) => body().includes(x.frag))?.frag || null;
    const stem22snap = () => {
      const f = stem22();
      if (f) window.__r383.b22.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem22, (s) => s === "خانهٔ (12)");
    snap("b22-opened");
    for (let i = 0; i < B22.length; i++) {
      window.__r383.phase = "b22-q" + (i + 1);
      const seen = await waitStem(stem22snap, (s) => s === B22[i].frag);
      if (!seen) { window.__r383.b22.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B22[i].click);
      if (!ok) { window.__r383.b22.miss.push((i + 1) + "-no-opt:" + B22[i].click); continue; }
      window.__r383.b22.ok++;
      await sleep(900);
      if (i < B22.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b22", r);
    window.__r383.phase = "done";
  })();
})();
