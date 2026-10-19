// r382 — درایورِ دو بانکِ نهایی (الگویِ r381): بانکِ l18 گرامر — ق۱ غلطِ عمدی (کلید = have you)
// → ۳/۴ + اکو؛ بانکِ l16 کلوژِ پنج‌گزینه‌ای «فرهنگ لغت» — همه درست → قهرمان (opts=5 در موتور واقعی)
(() => {
  window.__r382 = { b18: { ok: 0, miss: [], done: false }, b16: { ok: 0, miss: [], done: false, optsSeen: [] }, log: [], phase: "b18" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r382.log.push({
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
    window.__r382[key].score = readScore();
    window.__r382[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r382[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r382[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r382.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r382[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r382[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r382[key].ok++;
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
    // ——— بانک l18: گرامرِ نهاییِ دی — ق۱ غلطِ عمدی (کلید رسمی: have you) ———
    window.__r382.phase = "b18-open";
    await openBank("نهایی دی ۱۴۰۰ — گرامر");
    const B18 = [
      { frag: "You haven’t done your homework", click: "haven’t you", want: false }, // کلید رسمی: have you
      { frag: "you met yesterday", click: "whom" },
      { frag: "of the danger of harmful gasses", click: "should be informed" },
      { frag: "fast food restaurants", click: "were opened" },
    ];
    const stem18 = () => B18.find((x) => body().includes(x.frag))?.frag || null;
    await play("b18", B18, stem18);
    await backToCard();

    // ——— بانک l16: کلوژِ پنج‌گزینه‌ای «فرهنگ لغت» — قهرمان ———
    window.__r382.phase = "b16-open";
    await openBank("نهایی دی ۱۴۰۰ — کلوژِ فرهنگِ لغت");
    const B16 = [
      { frag: "خانهٔ (12)", click: "information" },
      { frag: "خانهٔ (13)", click: "order" },
      { frag: "خانهٔ (14)", click: "definition" },
      { frag: "خانهٔ (15)", click: "imagine" },
      { frag: "خانهٔ (16)", click: "choice" },
    ];
    const stem16 = () => B16.find((x) => body().includes(x.frag))?.frag || null;
    const stem16snap = () => {
      const f = stem16();
      if (f) window.__r382.b16.optsSeen.push(document.querySelectorAll("button[data-quiz-option]:not([disabled])").length);
      return f;
    };
    await waitStem(stem16, (s) => s === "خانهٔ (12)");
    snap("b16-opened");
    for (let i = 0; i < B16.length; i++) {
      window.__r382.phase = "b16-q" + (i + 1);
      const seen = await waitStem(stem16snap, (s) => s === B16[i].frag);
      if (!seen) { window.__r382.b16.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B16[i].click);
      if (!ok) { window.__r382.b16.miss.push((i + 1) + "-no-opt:" + B16[i].click); continue; }
      window.__r382.b16.ok++;
      await sleep(900);
      if (i < B16.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    finish("b16", r);
    window.__r382.phase = "done";
  })();
})();
