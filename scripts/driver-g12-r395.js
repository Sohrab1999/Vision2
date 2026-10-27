// r395 — درایورِ قهرمان‌سازیِ بانکِ l142 (مرورِ تایپیِ نهایی‌ها — شکلِ فعل، ۲۲ آیتم)
// همهٔ ۲۲ پاسخ تایپی درست؛ ق۵ با شکلِ دومِ دوتاییِ چاپی (had gotten) و ق۱۷ با عضوِ دومِ
// سه‌گانهٔ چاپی (would choose) — اثباتِ پذیرشِ چندعضوی در موتور واقعی.
(() => {
  window.__r395 = { b142: { ok: 0, miss: [], done: false }, log: [], phase: "b142-open" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r395.log.push({
      tag,
      typedInput: !!document.querySelector("input[data-quiz-typed-input]"),
      hasResult: body().includes("کارنامه"),
    });
  };
  const typeAnswer = async (text) => {
    for (let w = 0; w < 30; w++) {
      const inp = document.querySelector("input[data-quiz-typed-input]");
      if (inp && !inp.disabled) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(inp, text);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(300);
        const btn = document.querySelector("button[data-quiz-typed-submit]");
        if (btn && !btn.disabled) { btn.click(); return true; }
      }
      await sleep(300);
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

  (async () => {
    await openBank("قسمتِ افعالِ مخزن");
    const started = () =>
      document.querySelector("input[data-quiz-typed-input]") ? "ready" : null;
    await waitStem(started, (s) => s === "ready");
    snap("b142-opened");
    const answers = [
      "be kept",            // ق۱ — r381 (داوری ۳۰۰dpi همان راند)
      "had studied",        // ق۲
      "would tell",         // ق۳
      "had seen",           // ق۴ — r382
      "had gotten",         // ق۵ — r383: عضوِ دومِ دوتاییِ چاپیِ had got/gotten
      "was broken",         // ق۶ — r384
      "had paid",           // ق۷ — r385
      "had studied",        // ق۸ — r386 (تکرارِ بین‌برگه‌ایِ موجه)
      "is spoken",          // ق۹
      "was found",          // ق۱۰ — ناشنوایان
      "forgets",            // ق۱۱
      "got",                // ق۱۲
      "been made",          // ق۱۳
      "have been invited",  // ق۱۴ — r388m مکالمهٔ Babak/Ali
      "was said",           // ق۱۵
      "decides",            // ق۱۶
      "would choose",       // ق۱۷ — عضوِ دومِ سه‌گانهٔ چاپیِ might/would/could
      "increasingly",       // ق۱۸ — r389 انسانی
      "collect",            // ق۱۹
      "has been discovered",// ق۲۰
      "were invented",      // ق۲۱
      "were",               // ق۲۲
    ];
    for (let i = 0; i < answers.length; i++) {
      window.__r395.phase = "b142-q" + (i + 1);
      const seen = await waitStem(
        () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null),
        (s) => s === "ready"
      );
      let ok = false;
      if (seen) ok = await typeAnswer(answers[i]);
      if (ok) window.__r395.b142.ok++;
      else window.__r395.b142.miss.push((i + 1) + ":" + answers[i]);
      snap("b142-q" + (i + 1));
      await sleep(900);
      if (i < answers.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    window.__r395.b142.score = readScore();
    window.__r395.b142.champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r395.b142.echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r395.b142.done = true;
    snap("b142-result:" + r);
    window.__r395.phase = "done";
  })();
})();
