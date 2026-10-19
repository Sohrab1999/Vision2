// r370 — درایورِ دو بانکِ تازهٔ کارتِ هفتم — نسخهٔ ساقه‌محور (بدونِ اتکا به شمارنده):
//  موتورِ تست immediate است؛ تشخیصِ سؤالِ جاری با خودِ ساقه (نه شمارندهٔ N/M که در
//  این موتور در DOM برگ‌های متنی match نمی‌شود). مکث‌های بلند برای رندرِ بازخورد.
//  بانک ۱: ۱۱ ساقهٔ معلوم (A b K q R m X o D v G) — کلیکِ شکلِ دیگر → انتظار ۱۱/۱۱ + قهرمان
//  بانک ۴: ۵ ساقهٔ معلوم — ق۱ غلطِ عمدیِ «Hello.» (اضافیِ چاپی) → انتظار ۴/۵
(() => {
  window.__r370 = { b1: { ok: 0, miss: [], done: false }, b4: { ok: 0, miss: [], done: false }, log: [], phase: "b1" };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const snap = (tag) => {
    const t = document.body.textContent || "";
    window.__r370.log.push({
      tag,
      opts: document.querySelectorAll("button[data-quiz-option]:not([disabled])").length,
      hasResult: t.includes("کارنامه"),
      hasCard: [...document.querySelectorAll("button")].some((x) => (x.textContent || "").includes("امتحانی درس")),
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
  const body = () => document.body.textContent || "";
  const stem1 = () => (body().match(/([A-Za-z]) → -+/) || [null, null])[1]; // حرفِ چاپیِ سؤالِ جاری
  const stem4 = () => {
    const t = body();
    for (const p of ["My name is", "What's", "Fine,", "Good", "My last name"])
      if (t.includes(p + " ")) return p;
    return null;
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
    // «بعدی»/«دیدن نتیجه» — تا ۱۲ تلاش با مکث؛ بازخوردِ immediate نیاز به زمان دارد
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
    // بازگشت با «بازگشت»؛ اگر نبود (درازیابیِ میانی)، با دکمهٔ لوگو به خانه و ورودِ مجدد
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

  (async () => {
    // ——— بانک ۱: شکل کوچک و بزرگ حروف (۱۱ MCQ دوگزینه‌ای) ———
    window.__r370.phase = "b1-open";
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("شکل کوچک و بزرگ حروف"));
      if (b) { b.click(); break; }
      await sleep(300);
    }
    await waitStem(stem1, (s) => s === "A");
    snap("b1-opened");
    const ROW = ["A", "b", "K", "q", "R", "m", "X", "o", "D", "v", "G"];
    for (let i = 0; i < ROW.length; i++) {
      const printed = ROW[i];
      window.__r370.phase = "b1-q" + (i + 1);
      const seen = await waitStem(stem1, (s) => s === printed);
      if (!seen) { window.__r370.b1.miss.push((i + 1) + "-no-stem:" + printed); continue; }
      const target = printed === printed.toLowerCase() ? printed.toUpperCase() : printed.toLowerCase();
      const ok = await clickOpt(target);
      if (!ok) { window.__r370.b1.miss.push((i + 1) + "-no-opt:" + target); continue; }
      window.__r370.b1.ok++;
      await sleep(900); // رندرِ بازخوردِ immediate
      if (i < ROW.length - 1) await advance();
      await sleep(600);
    }
    snap("b1-answered");
    const r1 = await waitResult();
    snap("b1-result:" + r1);
    const t1 = body();
    const m1 = t1.match(/(\d{1,2})\s*از\s*(\d{1,2})/);
    window.__r370.b1.score = m1 ? m1[0] : null;
    window.__r370.b1.champion = t1.includes("قهرمان");
    window.__r370.b1.done = true;

    // ——— بانک ۴: وصل‌کردنیِ پایانِ جمله (۵ MCQ شش‌گزینه‌ای) ———
    window.__r370.phase = "b4-back";
    window.__r370.b4.cardOk = await backToCard();
    snap("b4-card:" + window.__r370.b4.cardOk);
    window.__r370.phase = "b4-open";
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("وصل‌کردنیِ پایانِ جمله"));
      if (b) { b.click(); break; }
      await sleep(300);
    }
    await waitStem(stem4, (s) => s === "My name is");
    snap("b4-opened");
    const PLAN = [
      ["My name is", "Hello."],       // ق۱ غلطِ عمدی (اضافیِ چاپی — هرگز کلید نیست)
      ["What's", "your name?"],
      ["Fine,", "Thanks."],
      ["Good", "morning."],
      ["My last name", "is Majidi."],
    ];
    for (let i = 0; i < PLAN.length; i++) {
      const [stem, want] = PLAN[i];
      window.__r370.phase = "b4-q" + (i + 1);
      const seen = await waitStem(stem4, (s) => s === stem);
      if (!seen) { window.__r370.b4.miss.push((i + 1) + "-no-stem:" + stem); continue; }
      const ok = await clickOpt(want);
      if (!ok) { window.__r370.b4.miss.push((i + 1) + "-no-opt:" + want); continue; }
      if (i !== 0) window.__r370.b4.ok++; // ق۱ غلطِ عمدی — شمرده نمی‌شود
      await sleep(900);
      if (i < PLAN.length - 1) await advance();
      await sleep(600);
    }
    snap("b4-answered");
    const r4 = await waitResult();
    snap("b4-result:" + r4);
    const m4 = body().match(/(\d{1,2})\s*از\s*(\d{1,2})/);
    window.__r370.b4.score = m4 ? m4[0] : null;
    window.__r370.b4.done = true;
    window.__r370.phase = "done";
  })();
})();
