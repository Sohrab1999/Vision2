// r364 — درایورِ دو بانکِ تازهٔ «سؤالات امتحانی درس اول»:
//  بانک ۱۱ (س۶ there is/are — ۴ تایپی): ق۱ غلطِ عمدی «There is» برای جمع (سوءتفاهمِ کلاسیک)
//   → باید غلط ثبت شود (تداومِ راستی‌آزماییِ اصلاحِ r363)؛ ق۲-۴ درست
//  بانک ۱۵ (س۱۴ وصل‌شدنی — ۴ MCQ پنج‌گزینه‌ای): همهٔ چهار پاسخ درست → قهرمان
(() => {
  window.__r364 = { b11: { ok: 0, miss: [], done: false }, b15: { ok: 0, miss: [], done: false }, phase: "b11" };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
    const joined = txts.join("|");
    let m = joined.match(/(?:^|\|)(\d{1,2})\| \/ \|(\d{1,2})(?:\||$)/);
    if (m) return +m[1];
    m = joined.match(/(?:^|\|)(\d{1,2}) \/ (\d{1,2})(?:\||$)/);
    return m ? +m[1] : null;
  };
  const liveBtns = () => [...document.querySelectorAll("button")].filter(
    (b) => !b.disabled && /^[abcde]$/.test((b.firstChild?.textContent || "").trim()) && (b.textContent || "").trim().length > 1
  );
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

  (async () => {
    // ——— بانک ۱۱: تایپی ———
    window.__r364.phase = "b11-open";
    await openBank("there is/there are");
    await sleep(1500);
    const KEY11 = ["There is", "There is", "There is", "There are"]; // ق۱ غلطِ عمدی (کلیدِ واقعی There are)
    for (let q = 1; q <= 4; q++) {
      window.__r364.phase = "b11-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        const inp = document.querySelector("input[data-quiz-typed-input]");
        if (n === q && inp && !inp.disabled) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r364.b11.miss.push(q + "-no-q"); continue; }
      const inp = document.querySelector("input[data-quiz-typed-input]");
      const sub = document.querySelector("button[data-quiz-typed-submit]");
      if (!inp || !sub) { window.__r364.b11.miss.push(q + "-no-input"); continue; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, KEY11[q - 1]);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      sub.click();
      await sleep(250);
      if (q !== 1) window.__r364.b11.ok++;      // ق۱ غلطِ عمدی — شمرده نمی‌شود
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g1 = 0;
    while (g1++ < 50) {
      const t = document.body.textContent || "";
      if (t.includes("کارنامه") || t.includes("از ۴")) break;
      await sleep(300);
    }
    const t11 = document.body.textContent || "";
    window.__r364.b11.q1wrong = t11.includes("پاسخ درست");   // «· پاسخ درست:» فقط برای غلط‌ها
    window.__r364.b11.done = true;

    // ——— بانک ۱۵: MCQ پنج‌گزینه‌ای ———
    await goBack();
    await sleep(1500);
    window.__r364.phase = "b15-open";
    await openBank("مکالمهٔ وصل‌شدنی");
    await sleep(1500);
    const KEY15 = ["e", "a", "c", "b"];
    for (let q = 1; q <= 4; q++) {
      window.__r364.phase = "b15-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        if (counterN() === q && liveBtns().length === 5) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r364.b15.miss.push(q + "-no-q"); continue; }
      const target = liveBtns().find((b) => (b.firstChild?.textContent || "").trim() === KEY15[q - 1]);
      if (!target) { window.__r364.b15.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r364.b15.ok++;
      await sleep(200);
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g2 = 0;
    while (g2++ < 50) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r364.b15.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r364.b15.done = true;
    window.__r364.phase = "done";
  })();
})();
