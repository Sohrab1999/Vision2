#!/usr/bin/env node
/* r297 — QA مرورگر E2E تک‌سشن: ده بانک نو تا ۱۰۰٪ — جریان eval-محور (درس r296) */
const { execFileSync } = require("node:child_process");

const ev = (js) => {
  const out = execFileSync("agent-browser", ["eval", js], { encoding: "utf8", timeout: 60000 });
  return out.trim();
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clickByTitle = (frag) =>
  ev(`(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes(${JSON.stringify(frag)})); if(!b) return 'MISS'; b.scrollIntoView({block:'center'}); b.click(); return 'OK'; })()`);

const clickOption = (i) =>
  ev(`(() => { const o=document.querySelector('[data-quiz-option="${i}"]'); if(!o) return 'MISS'; o.scrollIntoView({block:'center'}); o.click(); return 'OK'; })()`);

const typeAnswer = (text) => {
  const esc = JSON.stringify(text);
  const r = ev(`(() => { const inp=document.querySelector('[data-quiz-typed-input]'); if(!inp) return 'MISS-INP'; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; inp.focus(); setter.call(inp, ${esc}); inp.dispatchEvent(new Event('input',{bubbles:true})); return 'SET'; })()`);
  if (r.includes("MISS")) return r;
  return ev(`(() => { const s=document.querySelector('[data-quiz-typed-submit]'); if(!s) return 'MISS-SUB'; s.click(); return 'SUBMITTED'; })()`);
};

const nextQ = () =>
  ev(`(() => { const n=document.querySelector('[data-quiz-next]'); if(!n) return 'NO-NEXT'; n.scrollIntoView({block:'center'}); n.click(); return 'NEXT'; })()`);

const resultText = () =>
  ev(`(() => { const t=document.body.innerText; const m=t.match(/[0-9۰-۹]+٪/g); return JSON.stringify(m ? m.slice(-4) : []); })()`);

const shot = (path) => execFileSync("agent-browser", ["screenshot", path], { encoding: "utf8", timeout: 60000 });

const withRetry = async (fn, label, tries = 4) => {
  for (let a = 1; a <= tries; a++) {
    const r = await fn();
    if (!String(r).includes("MISS") && !String(r).includes("NO-NEXT")) return r;
    await sleep(400 * a);
  }
  throw new Error(`step failed after ${tries} tries: ${label}`);
};

const BANKS = [
  { lesson: 120, frag: "شنیداری فایل ۱: تست + درست/نادرست + پرسش پاسخ (ص۲۶۸)", steps: ["click:3", "click:1", "type:Because she can’t hear well.", "type:It might be something as simple as an infection."] },
  { lesson: 121, frag: "شنیداری فایل ۲: تست + پرسش پاسخ (ص۲۶۸)", steps: ["click:3", "click:1", "click:0", "type:Because her phone battery was running low.", "type:She needed enough electricity to finish watching the movie."] },
  { lesson: 126, frag: "گرامر: تست چهارگزینه‌ای (ص۲۶۹-۲۷۰)", steps: ["click:0", "click:1", "click:0", "click:2", "click:3"] },
  { lesson: 127, frag: "شکل صحیح فعل (ص۲۷۰)", steps: ["type:increasingly", "type:collect", "type:has been discovered", "type:were invented", "type:were"] },
  { lesson: 129, frag: "ریدینگ آینشتاین: پرسش پاسخ (ص۲۷۰)", steps: ["type:The Nobel Prize was awarded to Einstein for physics in 1921.", "type:He wrote a letter to President Roosevelt expressing his worry about the atomic bomb."] },
  { lesson: 132, frag: "ریدینگ انرژی: پرسش پاسخ (ص۲۷۲)", steps: ["type:The energy is stored in their roots, fruits, and leaves.", "type:Three forms of renewable energy are: solar energy, water energy and wind energy."] },
  { lesson: 133, frag: "ادامهٔ جمله: مچینگ ستون A/B (ص۲۷۲)", steps: ["click:2", "click:3", "click:0", "click:1"] },
  { lesson: 136, frag: "ضرب‌المثل‌ها: ستون B، بخش ب (ص۲۷۳)", steps: ["click:3", "click:2", "click:0", "click:4"] },
  { lesson: 135, frag: "واژگان: تعریف‌های ستون B، بخش الف (ص۲۷۳)", steps: ["click:3", "click:4", "click:2", "click:1"] },
  { lesson: 137, frag: "مرتب‌کردن کلمات: هر دو بخش الف/ب (ص۲۷۳)", steps: ["type:The woman who bought that apartment was talking to the neighbors in the yard.", "type:His parents became happy after they had met their son.", "type:He could be a good runner if he had more free time to practice.", "type:They must be informed about the result today."] },
];

(async () => {
  const results = [];
  for (const bank of BANKS) {
    const opened = await withRetry(() => Promise.resolve(clickByTitle(bank.frag)), `open ${bank.lesson}`);
    if (!opened.includes("OK")) throw new Error(`bank button not found: ${bank.lesson}`);
    await sleep(900);
    for (let i = 0; i < bank.steps.length; i++) {
      const step = bank.steps[i];
      if (step.startsWith("click:")) {
        await withRetry(() => Promise.resolve(clickOption(step.slice(6))), `L${bank.lesson} q${i + 1} click`);
      } else {
        await withRetry(() => Promise.resolve(typeAnswer(step.slice(5))), `L${bank.lesson} q${i + 1} type`);
      }
      await sleep(350);
      await withRetry(() => Promise.resolve(nextQ()), `L${bank.lesson} next ${i + 1}`).catch(() => "last question");
      await sleep(300);
    }
    await sleep(800);
    const res = await resultText();
    shot(`/tmp/qa-r297-l${bank.lesson}-result.png`);
    results.push({ lesson: bank.lesson, result: res });
    console.log(`L${bank.lesson} → ${res}`);
    // خروج از سشن برای بانک بعدی
    const exit = ev(`(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='بازگشت'); if(!b) return 'NO-EXIT'; b.click(); return 'EXITED'; })()`);
    if (!exit.includes("EXITED")) console.log(`warn: no exit button after L${bank.lesson}`);
    await sleep(900);
  }
  console.log("FINAL:", JSON.stringify(results));
})().catch((e) => { console.error("QA FAILED:", e.message); process.exit(1); });
