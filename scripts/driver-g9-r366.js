// r366 — درایورِ دو بانکِ تازهٔ «سؤالات امتحانی درس سوم»:
//  بانک ۲۳ (س۲ سوالی/منفی — ۴ تایپی): ق۱ غلطِ عمدی = تایپِ جملهٔ سادهٔ خودِ ساقه
//   («The cat drinks its milk» — تطابقِ دقیق با داربست/گزینهٔ دوم → باید غلط ثبت شود؛
//   تداومِ راستی‌آزماییِ اصلاحِ r363)؛ ق۲-۴ درست — ق۲/ق۴ با آپاستروفِ راستِ تایپ‌شده
//   (راست‌آزماییِ نرمال‌سازیِ آپاستروفِ موتور در برابرِ acceptedِ خمیده)
//  بانک ۲۸ (س۷ گزینهٔ صحیح — ۶ MCQ): همهٔ شش پاسخ درست (c,d,d,d,b,b) → قهرمان
(() => {
  window.__r366 = { b23: { ok: 0, miss: [], done: false }, b28: { ok: 0, miss: [], done: false }, phase: "b23" };

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
    (b) => !b.disabled && /^[abcd]$/.test((b.firstChild?.textContent || "").trim()) && (b.textContent || "").trim().length > 1
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
    // ——— بانک ۲۳: تایپیِ سوالی/منفی ———
    window.__r366.phase = "b23-open";
    await openBank("سوالی و منفی (س۲");
    await sleep(1500);
    const KEY23 = [
      "The cat drinks its milk",           // ق۱ غلطِ عمدی — عینِ داربست
      "The cat doesn't drink its milk.",   // ق۲ درست — آپاستروفِ راست (نرمال‌سازی)
      "Do they listen to their teacher?",  // ق۳ درست
      "They don't listen to their teacher.", // ق۴ درست — آپاستروفِ راست
    ];
    for (let q = 1; q <= 4; q++) {
      window.__r366.phase = "b23-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        const inp = document.querySelector("input[data-quiz-typed-input]");
        if (n === q && inp && !inp.disabled) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r366.b23.miss.push(q + "-no-q"); continue; }
      const inp = document.querySelector("input[data-quiz-typed-input]");
      const sub = document.querySelector("button[data-quiz-typed-submit]");
      if (!inp || !sub) { window.__r366.b23.miss.push(q + "-no-input"); continue; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, KEY23[q - 1]);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      sub.click();
      await sleep(250);
      if (q !== 1) window.__r366.b23.ok++;      // ق۱ غلطِ عمدی — شمرده نمی‌شود
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
    const t23 = document.body.textContent || "";
    window.__r366.b23.q1wrong = t23.includes("پاسخ درست");   // «· پاسخ درست:» فقط برای غلط‌ها
    window.__r366.b23.done = true;

    // ——— بانک ۲۸: MCQ چهارگزینه‌ای ———
    await goBack();
    await sleep(1500);
    window.__r366.phase = "b28-open";
    await openBank("گزینهٔ صحیح (س۷");
    await sleep(1500);
    const KEY28 = ["c", "d", "d", "d", "b", "b"]; // hold/culture/his/its/uncle/b-sound
    for (let q = 1; q <= 6; q++) {
      window.__r366.phase = "b28-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        if (counterN() === q && liveBtns().length === 4) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r366.b28.miss.push(q + "-no-q"); continue; }
      const target = liveBtns().find((b) => (b.firstChild?.textContent || "").trim() === KEY28[q - 1]);
      if (!target) { window.__r366.b28.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r366.b28.ok++;
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
    window.__r366.b28.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r366.b28.done = true;
    window.__r366.phase = "done";
  })();
})();
