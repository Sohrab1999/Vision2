// r365 — درایورِ دو بانکِ تازهٔ «سؤالات امتحانی درس دوم»:
//  بانک ۱۶ (س۲ بانک‌واژهٔ هتل — ۸ تایپی): ق۱ غلطِ عمدی «staying» (داربستِ خودِ آیتم —
//   تطابقِ دقیق با گزینهٔ غلط → باید غلط ثبت شود؛ تداومِ راستی‌آزماییِ اصلاحِ r363)؛ ق۲-۸ درست
//  بانک ۱۸ (س۴ وصل‌کردنی — ۴ MCQ پنج‌گزینه‌ای): همهٔ چهار پاسخ درست → قهرمان
(() => {
  window.__r365 = { b16: { ok: 0, miss: [], done: false }, b18: { ok: 0, miss: [], done: false }, phase: "b16" };

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
    // ——— بانک ۱۶: تایپیِ بانک‌واژه ———
    window.__r365.phase = "b16-open";
    await openBank("بانک واژهٔ مکالمهٔ هتل");
    await sleep(1500);
    // ق۱ غلطِ عمدی: «staying» = داربستِ گزینهٔ دومِ ق۱ (کلیدِ واقعی «help»)
    const KEY16 = ["staying", "reservation", "staying", "visiting", "wife", "standing", "key", "enjoy"];
    for (let q = 1; q <= 8; q++) {
      window.__r365.phase = "b16-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        const inp = document.querySelector("input[data-quiz-typed-input]");
        if (n === q && inp && !inp.disabled) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r365.b16.miss.push(q + "-no-q"); continue; }
      const inp = document.querySelector("input[data-quiz-typed-input]");
      const sub = document.querySelector("button[data-quiz-typed-submit]");
      if (!inp || !sub) { window.__r365.b16.miss.push(q + "-no-input"); continue; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, KEY16[q - 1]);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      sub.click();
      await sleep(250);
      if (q !== 1) window.__r365.b16.ok++;      // ق۱ غلطِ عمدی — شمرده نمی‌شود
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
      if (t.includes("کارنامه") || t.includes("از ۸")) break;
      await sleep(300);
    }
    const t16 = document.body.textContent || "";
    window.__r365.b16.q1wrong = t16.includes("پاسخ درست");   // «· پاسخ درست:» فقط برای غلط‌ها
    window.__r365.b16.done = true;

    // ——— بانک ۱۸: MCQ پنج‌گزینه‌ای ———
    await goBack();
    await sleep(1500);
    window.__r365.phase = "b18-open";
    await openBank("وصل‌کردنیِ پرسش/پاسخ");
    await sleep(1500);
    const KEY18 = ["c", "d", "e", "a"]; // Yes,she is / He’s checking / No,they are / Paul.
    for (let q = 1; q <= 4; q++) {
      window.__r365.phase = "b18-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        if (counterN() === q && liveBtns().length === 5) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r365.b18.miss.push(q + "-no-q"); continue; }
      const target = liveBtns().find((b) => (b.firstChild?.textContent || "").trim() === KEY18[q - 1]);
      if (!target) { window.__r365.b18.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r365.b18.ok++;
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
    window.__r365.b18.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r365.b18.done = true;
    window.__r365.phase = "done";
  })();
})();
