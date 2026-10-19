// r371 — درایورِ سه بانکِ تازهٔ کارتِ هفتم — نسخهٔ ساقه‌محور (درسِ r370: دکمهٔ بعدِ موتور
// «سؤال بعدی» است و شمارندهٔ N/M match نمی‌شود — تشخیصِ سؤال با خودِ ساقه).
//  بانک ۵: ۴ ساقهٔ لایه‌محور (Sev/Elev/Nine/Six + نقطه‌چین) — کلیکِ واژه‌ای که با ساقه می‌سازد → ۴/۴ + قهرمان
//  بانک ۹: ۴ آیتمِ هفت‌گزینه‌ای — ق۱ غلطِ عمدی با هرگز-کلیدِ «florist» (دوکلیدیِ حذف‌شده) → ۳/۴
//  بانک ۱۰: ۷ دوگزینه‌ایِ He/She — کلیکِ ضمیرِ درستِ هر واژه → ۷/۷ + قهرمان
(() => {
  window.__r371 = {
    b5: { ok: 0, miss: [], done: false }, b9: { ok: 0, miss: [], done: false },
    b10: { ok: 0, miss: [], done: false }, log: [], phase: "b5",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r371.log.push({
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
    window.__r371[key].score = readScore();
    window.__r371[key].champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r371[key].echo = t.slice(Math.max(0, ei - 120), ei + 160);
    window.__r371[key].done = true;
    snap(key + "-result:" + r);
  };

  (async () => {
    // ——— بانک ۵: تکمیل اعداد با en/ten (۴ MCQ چهارگزینه‌ای) ———
    window.__r371.phase = "b5-open";
    await openBank("تکمیل اعداد با en/ten");
    const stem5 = () => {
      const m = body().match(/(Sev|Elev|Nine|Six)[….]+/);
      return m ? m[0] : null;
    };
    const B5 = stemsFromLayerSafe();
    await waitStem(stem5, (s) => s === B5[0]);
    snap("b5-opened");
    for (let i = 0; i < B5.length; i++) {
      window.__r371.phase = "b5-q" + (i + 1);
      const seen = await waitStem(stem5, (s) => s === B5[i]);
      if (!seen) { window.__r371.b5.miss.push((i + 1) + "-no-stem"); continue; }
      const prefix = B5[i].replace(/[….]/g, "");
      const btn = optBtns().find((b) => optText(b).startsWith(prefix));
      if (!btn) { window.__r371.b5.miss.push((i + 1) + "-no-opt:" + prefix); continue; }
      btn.click();
      window.__r371.b5.ok++;
      await sleep(900);
      if (i < B5.length - 1) await advance();
      await sleep(600);
    }
    const r5 = await waitResult();
    finish("b5", r5);

    // ——— بانک ۹: تکمیل جمله با بانک واژه (۴ MCQ هفت‌گزینه‌ای) ———
    window.__r371.phase = "b9-back";
    window.__r371.b9.cardOk = await backToCard();
    snap("b9-card:" + window.__r371.b9.cardOk);
    window.__r371.phase = "b9-open";
    await openBank("تکمیل جمله با بانک واژه");
    const FRAGS = ["Ahmadi", "Happy (", "Day (", "Nice to ("];
    const stem9 = () => FRAGS.find((f) => body().includes(f)) || null;
    await waitStem(stem9, (s) => s === "Ahmadi");
    snap("b9-opened");
    const B9 = [
      { frag: "Ahmadi", click: "florist", want: false },   // غلطِ عمدی: هرگز-کلیدِ دوکلیدیِ حذف‌شده
      { frag: "Happy (", click: "birthday", want: true },
      { frag: "Day (", click: "Bahman", want: true },
      { frag: "Nice to (", click: "meet", want: true },
    ];
    for (let i = 0; i < B9.length; i++) {
      window.__r371.phase = "b9-q" + (i + 1);
      const seen = await waitStem(stem9, (s) => s === B9[i].frag);
      if (!seen) { window.__r371.b9.miss.push((i + 1) + "-no-stem"); continue; }
      const ok = await clickOpt(B9[i].click);
      if (!ok) { window.__r371.b9.miss.push((i + 1) + "-no-opt:" + B9[i].click); continue; }
      if (B9[i].want) window.__r371.b9.ok++;
      await sleep(900);
      if (i < B9.length - 1) await advance();
      await sleep(600);
    }
    const r9 = await waitResult();
    finish("b9", r9);

    // ——— بانک ۱۰: مذکر و مونث (۷ MCQ دوگزینه‌ای He/She) ———
    window.__r371.phase = "b10-back";
    window.__r371.b10.cardOk = await backToCard();
    snap("b10-card:" + window.__r371.b10.cardOk);
    window.__r371.phase = "b10-open";
    await openBank("مذکر و مونث");
    // ترتیبِ خودِ بانک (Father/mother/sister/brother/grandfather/grangmoter/uncle) —
    // جست‌وجوی case-sensitive امن است: «Father →» با F بزرگ در «grandfather» نیست
    const WORDS = ["Father", "mother", "sister", "brother", "grandfather", "grangmoter", "uncle"];
    const stem10 = () => WORDS.find((w) => body().includes(w + " → ")) || null;
    await waitStem(stem10, (s) => s === "Father");
    snap("b10-opened");
    const HE = ["Father", "brother", "grandfather", "uncle"];
    for (let i = 0; i < WORDS.length; i++) {
      window.__r371.phase = "b10-q" + (i + 1);
      const seen = await waitStem(stem10, (s) => s === WORDS[i]);
      if (!seen) { window.__r371.b10.miss.push((i + 1) + "-no-stem:" + WORDS[i]); continue; }
      const pron = HE.includes(WORDS[i]) ? "He" : "She";
      const ok = await clickOpt(pron);
      if (!ok) { window.__r371.b10.miss.push((i + 1) + "-no-opt:" + pron); continue; }
      window.__r371.b10.ok++;
      await sleep(900);
      if (i < WORDS.length - 1) await advance();
      await sleep(600);
    }
    const r10 = await waitResult();
    finish("b10", r10);
    window.__r371.phase = "done";
  })();

  function stemsFromLayerSafe() {
    // همان چهار ساقهٔ لایه (اسکریپت r371 از booklet-extract خواند؛ اینجا هم‌ارزِ ثابت)
    return ["Sev……….", "Elev……….", "Nine……….", "Six………..."];
  }
})();
