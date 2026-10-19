// r369 — درایورِ سه بانکِ تازهٔ «سؤالات امتحانی درس ششم»:
//  بانک ۴۵ (س۲ — ۸ تایپیِ بانک واژه): ق۱ غلطِ عمدی = تایپِ واژهٔ اضافیِ چاپیِ «stay»
//   (همان داربستِ گزینهٔ دوم → باید غلط ثبت شود — تداومِ راستی‌آزماییِ اصلاحِ r363)؛
//   ق۲ با حروفِ بزرگِ تایپ‌شده («BROKE») — آزمونِ نرمال‌سازِ حروف؛ ق۳-ق۸ درست
//  بانک ۴۸ (س۵ وصل‌کردنیِ پنج‌گزینه‌ایِ چاپی — ۴ MCQ): حروفِ b/d/e/a → ۴/۴ قهرمان
//   (جفتِ verbatimِ تمرینِ ۲ درس: Why→Because؛ اضافیِ c هرگز کلید نیست)
//  بانک ۴۹ (س۶ پرانتزِ سه‌گزینه‌ایِ چاپی — ۳ MCQ): حروفِ b/a/c → ۳/۳ قهرمان
(() => {
  window.__r369 = { b45: { ok: 0, miss: [], done: false }, b48: { ok: 0, miss: [], done: false }, b49: { ok: 0, miss: [], done: false }, phase: "b45" };

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
    window.__r369.phase = "q" + qn;
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
  const mcqOne = async (qn, letter, acc) => {
    window.__r369.phase = "b" + acc + "-q" + qn;
    let guard = 0;
    while (guard++ < 60) {
      if (counterN() === qn && mcqLetters().length > 0) break;
      await sleep(120);
    }
    const target = mcqLetters().find((b) => (b.firstChild?.textContent || "").trim() === letter);
    if (!target) { window.__r369[acc].miss.push(qn + "-no-letter"); return; }
    target.click();
    window.__r369[acc].ok++;
    await sleep(200);
    await nextLoop(qn);
  };
  const waitChampion = () => {
    let g = 0;
    return (async () => {
      while (g++ < 50) {
        if ((document.body.textContent || "").includes("قهرمان")) break;
        await sleep(300);
      }
    })();
  };

  (async () => {
    // ——— بانک ۴۵: تایپیِ بانک واژهٔ سلامتی و آسیب (۸ آیتم) ———
    window.__r369.phase = "b45-open";
    await openBank("سلامتی و آسیب");
    await sleep(1500);
    const KEY45 = ["stay", "BROKE", "twisted", "stayed", "participated", "learn", "did", "advice"]; // ق۱ غلطِ عمدی؛ ق۲ حروفِ بزرگ
    for (let qn = 1; qn <= 8; qn++) {
      const ok = await typedOne(qn, KEY45[qn - 1]);
      if (!ok) { window.__r369.b45.miss.push(qn + "-no-input"); continue; }
      if (qn !== 1) window.__r369.b45.ok++; // ق۱ غلطِ عمدی — شمرده نمی‌شود
    }
    let g1 = 0;
    while (g1++ < 50) {
      const t = document.body.textContent || "";
      if (t.includes("کارنامه") || t.includes("از ۸")) break;
      await sleep(300);
    }
    const t45 = document.body.textContent || "";
    window.__r369.b45.q1wrong = t45.includes("پاسخ درست");
    window.__r369.b45.done = true;

    // ——— بانک ۴۸: وصل‌کردنیِ پنج‌گزینه‌ای (۴ MCQ) ———
    await goBack();
    await sleep(1500);
    window.__r369.phase = "b48-open";
    await openBank("وصل‌کردنیِ پرسش/پاسخ (س۵");
    await sleep(1500);
    const L48 = ["b", "d", "e", "a"]; // Where→b، Why→d (جفتِ verbatim)، Who→e، When→a
    for (let qn = 1; qn <= 4; qn++) await mcqOne(qn, L48[qn - 1], "b48");
    await waitChampion();
    window.__r369.b48.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r369.b48.done = true;

    // ——— بانک ۴۹: پرانتزِ سه‌گزینه‌ای (۳ MCQ) ———
    await goBack();
    await sleep(1500);
    window.__r369.phase = "b49-open";
    await openBank("کامل با کلماتِ پرانتز (س۶");
    await sleep(1500);
    const L49 = ["b", "a", "c"]; // us→b، When→a، because→c
    for (let qn = 1; qn <= 3; qn++) await mcqOne(qn, L49[qn - 1], "b49");
    await waitChampion();
    window.__r369.b49.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r369.b49.done = true;
    window.__r369.phase = "done";
  })();
})();
