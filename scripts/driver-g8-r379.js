// r379 — درایورِ سه بانکِ تازهٔ جامع (الگویِ r378: ساقه‌محور، case-sensitive، اکوی کارنامه).
//  بانک ۱۷ (۸ MCQ سه‌گزینه‌ای): ق۱ غلطِ عمدی با «It is over there» (کلید = It is hot) → ۷/۸ + اکو؛
//  بانک ۱۸ (۵ پنج‌گزینه‌ایِ بانک‌دار): همه درست → قهرمان؛
//  بانک ۱۹ (۵ سلولِ جدولِ درک‌متن): همه درست → قهرمان.
(() => {
  window.__r379 = {
    b17: { ok: 0, miss: [], done: false }, b18: { ok: 0, miss: [], done: false },
    b19: { ok: 0, miss: [], done: false }, log: [], phase: "b17",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r379.log.push({
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
    window.__r379[key].score = readScore();
    window.__r379[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r379[key].echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r379[key].done = true;
    snap(key + "-result:" + r);
  };
  const play = async (key, B, stemFn) => {
    await waitStem(stemFn, (s) => s === B[0].frag);
    snap(key + "-opened");
    for (let i = 0; i < B.length; i++) {
      window.__r379.phase = key + "-q" + (i + 1);
      const seen = await waitStem(stemFn, (s) => s === B[i].frag);
      if (!seen) { window.__r379[key].miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B[i].click);
      if (!ok) { window.__r379[key].miss.push((i + 1) + "-no-opt:" + B[i].click); continue; }
      if (B[i].want !== false) window.__r379[key].ok++;
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
    // ——— بانک ۱۷: هشت MCQ سه‌گزینه‌ای — ق۱ غلطِ عمدی ———
    window.__r379.phase = "b17-open";
    await openBank("بهترین پاسخِ مکالمه");
    const B17 = [
      { frag: "How is the weather?", click: "It is over there", want: false }, // کلید = It is hot
      { frag: "What's the matter?", click: "I have a headache" },
      { frag: "Where is Ahvaz?", click: "It is in the South." },
      { frag: "Where is he from?", click: "He is from England" },
      { frag: "Can you play chess?", click: "Yes, I can" },
      { frag: "What's your hobby?", click: "I play football as a hobby" },
      { frag: "What days do you go to the library?", click: "On Mondays" },
      { frag: "Is there a metro system", click: "there is" },
    ];
    const stem17 = () => B17.find((x) => body().includes(x.frag))?.frag || null;
    await play("b17", B17, stem17);
    await backToCard();

    // ——— بانک ۱۸: تکمیل متن با بانکِ ۵واژه‌ایِ برچسبِ تصاویر — قهرمان ———
    window.__r379.phase = "b18-open";
    await openBank("بانک تصویری");
    const B18 = [
      { frag: "Hello. I am Ali", click: "mechanic" },
      { frag: "and cloudy country", click: "rainy" },
      { frag: "restaurant and famous buildings", click: "fields" },
      { frag: "I walk in a park", click: "chess" },
      { frag: "I should rest at home", click: "backache" },
    ];
    const stem18 = () => B18.find((x) => body().includes(x.frag))?.frag || null;
    await play("b18", B18, stem18);
    await backToCard();

    // ——— بانک ۱۹: جدولِ درک‌متنِ Tom Anderson — قهرمان ———
    window.__r379.phase = "b19-open";
    await openBank("جدولِ درک‌متن");
    const B19 = [
      { frag: "«Name» در جدولِ متن", click: "Tom Anderson" },
      { frag: "«Nationality» در جدولِ متن", click: "Spanish" },
      { frag: "«Hobby» در جدولِ متن", click: "swimming" },
      { frag: "«age» در جدولِ متن", click: "12" },
      { frag: "«Free time» در جدولِ متن", click: "read books" },
    ];
    const stem19 = () => B19.find((x) => body().includes(x.frag))?.frag || null;
    await play("b19", B19, stem19);
    window.__r379.phase = "done";
  })();
})();
