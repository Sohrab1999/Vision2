// r396 — درایورِ قهرمان‌سازیِ بانکِ l143 (مرورِ تایپیِ نهایی‌ها — جمله‌سازی، ۱۸ آیتم)
// همهٔ ۲۲ پاسخ تایپی درست؛ ق۵ با شکلِ دومِ دوتاییِ چاپی (had gotten) و ق۱۷ با عضوِ دومِ
// سه‌گانهٔ چاپی (would choose) — اثباتِ پذیرشِ چندعضوی در موتور واقعی.
(() => {
  window.__r396 = { b143: { ok: 0, miss: [], done: false }, log: [], phase: "b143-open" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const body = () => document.body.textContent || "";
  const snap = (tag) => {
    window.__r396.log.push({
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
    await openBank("قسمتِ دومِ مخزن");
    const started = () =>
      document.querySelector("input[data-quiz-typed-input]") ? "ready" : null;
    await waitStem(started, (s) => s === "ready");
    snap("b143-opened");
    const answers = [
      "The students had done their homework when the teacher came to the class.", // ق۱ — ترتیبِ دومِ چاپی (اثباتِ دوتایی)
      "The baby had fallen asleep when I got home.",       // ق۲ — r382
      "John could rest if he had more time.",              // ق۳
      "Sara had never seen a bear before she went to the zoo.", // ق۴ — r383
      "My sister would clean her room if she were at home.", // ق۵
      "Roya was upset because she had gotten a bad score.", // ق۶ — r384
      "John could fix the car if he were at home.",        // ق۷
      "Joe had already learned Chinese when he moved to China.", // ق۸ — r385
      "They would buy a house if they were you.",          // ق۹
      "Mina was upset because she had gotten a bad score.", // ق۱۰ — r386
      "There are some workers and teachers who work in the village.", // ق۱۱ — r387
      "The girl wrote a letter, didn't she?",              // ق۱۲
      "Everything in the garden was brown because it hadn't rained.", // ق۱۳
      "The parents should be called by the teacher.",      // ق۱۴
      "Mina would help you with your homework if she had more free time.", // ق۱۵ — r388m س۱۶
      "My mother was angry with my brother because he hadn't washed his hands.", // ق۱۶
      "The students bought some useful books which their teacher suggested.", // ق۱۷
      "Can water be converted into ice in cold weather?",  // ق۱۸
    ];
    for (let i = 0; i < answers.length; i++) {
      window.__r396.phase = "b143-q" + (i + 1);
      const seen = await waitStem(
        () => (document.querySelector("input[data-quiz-typed-input]") ? "ready" : null),
        (s) => s === "ready"
      );
      let ok = false;
      if (seen) ok = await typeAnswer(answers[i]);
      if (ok) window.__r396.b143.ok++;
      else window.__r396.b143.miss.push((i + 1) + ":" + answers[i]);
      snap("b143-q" + (i + 1));
      await sleep(900);
      if (i < answers.length - 1) await advance();
      await sleep(600);
    }
    const r = await waitResult();
    window.__r396.b143.score = readScore();
    window.__r396.b143.champion = body().includes("قهرمان");
    const t = body();
    const ei = t.indexOf("پاسخ درست");
    if (ei >= 0) window.__r396.b143.echo = t.slice(Math.max(0, ei - 160), ei + 200);
    window.__r396.b143.done = true;
    snap("b143-result:" + r);
    window.__r396.phase = "done";
  })();
})();
