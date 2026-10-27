// r362 — درایورِ مختلط برای بانک ۱ گ۹ «تست گرامری» (۳ MCQ ستاره‌ای + ۴ تایپی is/are)
// MCQ: کلیکِ گزینهٔ درست (الگوی r360)؛ تایپی: fill ورودیِ data-quiz-typed-input + کلیکِ بررسی
(() => {
  const MCQ_KEY = ["d", "d", "b"];
  const TYPED_KEY = ["is", "are", "is", "are"];
  window.__r362b1 = { ok: 0, miss: [], done: false, total: 7, step: "start" };

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

  (async () => {
    for (let q = 1; q <= 7; q++) {
      const isTyped = q >= 4;
      window.__r362b1.step = "wait-q" + q;
      // ۱) صبر برای سؤالِ q
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        if (isTyped) {
          const inp = document.querySelector("input[data-quiz-typed-input]");
          if (n === q && inp && !inp.disabled) break;
        } else if (n === q && liveBtns().length === 4) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r362b1.miss.push(q + "-no-q"); continue; }

      if (!isTyped) {
        // ۲) MCQ — کلیکِ گزینهٔ درست
        const btns = liveBtns();
        const target = btns.find((b) => (b.firstChild?.textContent || "").trim() === MCQ_KEY[q - 1]);
        if (!target) { window.__r362b1.miss.push(q + "-no-letter"); continue; }
        target.click();
        window.__r362b1.ok++;
        await sleep(150);
      } else {
        // ۳) تایپی — fill + بررسی
        const inp = document.querySelector("input[data-quiz-typed-input]");
        const sub = document.querySelector("button[data-quiz-typed-submit]");
        if (!inp || !sub) { window.__r362b1.miss.push(q + "-no-input"); continue; }
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(inp, TYPED_KEY[q - 4]);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(120);
        sub.click();
        window.__r362b1.ok++;
        await sleep(200);
      }
      // ۴) پیشرفت: «سؤال بعدی» یا «دیدن نتیجه» یا پیشرفتِ خودکار
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    // ۵) نتیجه
    let g2 = 0;
    while (g2++ < 60) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r362b1.step = "end-q" + (counterN() ?? "?");
    window.__r362b1.done = true;
  })();
})();