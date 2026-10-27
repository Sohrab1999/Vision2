// r368 — درایورِ سه بانکِ تازهٔ «سؤالات امتحانی درس پنجم»:
//  بانک ۳۶ (س۲ — ۱۰ تایپیِ بانک واژه): ق۱ غلطِ عمدی = تایپِ واژهٔ اضافیِ چاپیِ «watched»
//   (تطابقِ دقیق با داربست/گزینهٔ دوم → باید غلط ثبت شود — تداومِ اصلاحِ r363)؛ ق۲-ق۱۰ درست؛
//   ق۷ با آپاستروفِ راستِ تایپ‌شده («didn't» در برابرِ چاپیِ خمیده «didn’t») — آزمونِ نرمال‌ساز
//  بانک ۴۲ (س۱۱ درست/غلط — نخستین درکِ مطلبِ کارتِ نهم): هر دو پاسخ «b» (False) → قهرمان
//  بانک ۴۳ (س۱۱ پاسخِ متن — ۲ تایپی): تایپِ واریانت‌های دورِ accepted
//   (ق۱ «No she was not» بی‌ویرگول+بازشده، ق۲ با نگه‌داشتنِ ضمیرِ دوم) → ۲/۲ قهرمان
(() => {
  window.__r368 = { b36: { ok: 0, miss: [], done: false }, b42: { ok: 0, miss: [], done: false }, b43: { ok: 0, miss: [], done: false }, phase: "b36" };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
    const joined = txts.join("|");
    let m = joined.match(/(?:^|\|)(\d{1,2})\| \/ \|(\d{1,2})(?:\||$)/);
    if (m) return +m[1];
    m = joined.match(/(?:^|\|)(\d{1,2}) \/ (\d{1,2})(?:\||$)/);
    return m ? +m[1] : null;
  };
  const openBank = async (needle) => {
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes(needle));
      if (b) { b.click(); return true; }
      await sleep(200);
    }
    return false;
  };
  const goBack = async () => {
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("بازگشت"));
      if (b) { b.click(); return true; }
      await sleep(200);
    }
    return false;
  };
  const nextLoop = async (qn) => {
    for (let w = 0; w < 40; w++) {
      if (counterN() === qn + 1) break;
      const nxt = [...document.querySelectorAll("button")].find(
        (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
      if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
    }
  };
  const typedOne = async (qn, text) => {
    window.__r368.phase = "q" + qn;
    let guard = 0;
    while (guard++ < 60) {
      const n = counterN();
      const inp = document.querySelector("input[data-quiz-typed-input]");
      if (n === qn && inp && !inp.disabled) break;
      await sleep(120);
    }
    const inp = document.querySelector("input[data-quiz-typed-input]");
    const sub = document.querySelector("button[data-quiz-typed-submit]");
    if (!inp || !sub) { return false; }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(inp, text);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(120);
    sub.click();
    await sleep(250);
    await nextLoop(qn);
    return true;
  };
  const mcqLetters = () => [...document.querySelectorAll("button")].filter(
    (b) => !b.disabled && /^[abcdefg]$/.test((b.firstChild?.textContent || "").trim()) && (b.textContent || "").trim().length > 1
  );

  (async () => {
    // ——— بانک ۳۶: تایپیِ بانک واژه (۱۰ آیتم) ———
    window.__r368.phase = "b36-open";
    await openBank("جشنوارهٔ فجر");
    await sleep(1500);
    const KEY36 = ["watched", "wonderful", "did", "attended", "interested", "watch", "didn't", "surf", "address", "text"]; // ق۱ غلطِ عمدی؛ ق۷ آپاستروفِ راست
    for (let qn = 1; qn <= 10; qn++) {
      const ok = await typedOne(qn, KEY36[qn - 1]);
      if (!ok) { window.__r368.b36.miss.push(qn + "-no-input"); continue; }
      if (qn !== 1) window.__r368.b36.ok++; // ق۱ غلطِ عمدی — شمرده نمی‌شود
    }
    let g1 = 0;
    while (g1++ < 50) {
      const t = document.body.textContent || "";
      if (t.includes("کارنامه") || t.includes("از ۱۰")) break;
      await sleep(300);
    }
    const t36 = document.body.textContent || "";
    window.__r368.b36.q1wrong = t36.includes("پاسخ درست");
    window.__r368.b36.done = true;

    // ——— بانک ۴۲: درست/غلط (۲ MCQ) ———
    await goBack();
    await sleep(1500);
    window.__r368.phase = "b42-open";
    await openBank("درست/غلط");
    await sleep(1500);
    for (let qn = 1; qn <= 2; qn++) {
      window.__r368.phase = "b42-q" + qn;
      let guard = 0;
      while (guard++ < 60) {
        if (counterN() === qn && mcqLetters().length === 2) break;
        await sleep(120);
      }
      const target = mcqLetters().find((b) => (b.firstChild?.textContent || "").trim() === "b");
      if (!target) { window.__r368.b42.miss.push(qn + "-no-letter"); continue; }
      target.click();
      window.__r368.b42.ok++;
      await sleep(200);
      await nextLoop(qn);
    }
    let g2 = 0;
    while (g2++ < 50) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r368.b42.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r368.b42.done = true;

    // ——— بانک ۴۳: پاسخِ متن با واریانت‌های دورِ accepted ———
    await goBack();
    await sleep(1500);
    window.__r368.phase = "b43-open";
    await openBank("پاسخ به سؤالِ متن");
    await sleep(1500);
    const KEY43 = ["No she was not", "She cleaned her room and she called her grandmother."]; // واریانت‌های روادارِ دور
    for (let qn = 1; qn <= 2; qn++) {
      const ok = await typedOne(qn, KEY43[qn - 1]);
      if (!ok) { window.__r368.b43.miss.push(qn + "-no-input"); continue; }
      window.__r368.b43.ok++;
    }
    let g3 = 0;
    while (g3++ < 50) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r368.b43.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r368.b43.done = true;
    window.__r368.phase = "done";
  })();
})();
