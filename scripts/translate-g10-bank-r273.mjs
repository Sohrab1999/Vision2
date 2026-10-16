// =====================================================================
// r273 — بازآرایی/ترجمهٔ فارسی بانک دهم با مدل زبانی
//
// ورودی: booklet-extract/g10-bank-r273.json (خروجی extract-g10-bank-r273.py)
// کار برای هر سؤال:
//   A) ترجمهٔ کلید جزوه موجود است → مدل فقط OCR-خرابی را با لنگرِ متن انگلیسی
//      بازآرایی می‌کند (معنا دست‌نخورده — منشأ: booklet-key+ai-repair)
//   B) ترجمه‌ای نیست → مدل از انگلیسی ترجمهٔ طبیعی فارسی می‌سازد (منشأ: ai)
//   C) note گرامری موجود است → فقط بازآرایی املایی
// خروجی: booklet-extract/g10-bank-final-r273.json (+ گزارش کیفیت)
// اجرا: bun scripts/translate-g10-bank-r273.mjs  (سرویس‌محور — SDK فقط backend)
// =====================================================================
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync } from "node:fs";

const IN = "booklet-extract/g10-bank-r273.json";
const OUT = "booklet-extract/g10-bank-final-r273.json";
let CONCURRENCY = 3;
const COOLDOWN_MS = 8000;

const SYSTEM = `تو ویراستار محتوای آموزشی زبان انگلیسی برای یادگیرندگان ایرانی هستی.
وظیفهٔ تو دقیقاً یکی از این دو کار است — هرگز معنا را عوض نکن:
1) «repair»: ترجمهٔ فارسیِ استخراج‌شده از PDF جزوه داری (خروجی OCR است و حروف جابجا/چسبیده دارد).
   متن انگلیسی سؤال لنگرِ معناست. فقط روان‌نویسی و املای فارسی را درست کن.
   جمله‌بندیِ مترجمِ جزوه را حفظ کن؛ کلمهٔ جابجاشده را با معنای درستِ همان بازنویس کن.
2) «translate»: ترجمه‌ای نیست؛ از متن انگلیسی یک ترجمهٔ فارسی طبیعی و دقیق بساز.
قواعد سخت:
- خروجی فقط JSON معتبر با کلیدهای translation و note (رشته یا null).
- translation: فقط فارسی — هیچ حرف لاتین، هیچ گیومه، هیچ «ترجمه تست:».
- جای خالی (-----) در انگلیسی = جایی که واژهٔ گم‌شده می‌نشیند؛ در فارسی با «……» نشان بده.
- note: توضیح گرامری فارسی است — فقط املای آن را درست کن، محتوا را کم/زیاد نکن.
- اگر ورودی ترجمه کاملاً نامفهوم بود و با لنگر انگلیسی نمی‌خواند، ترجمهٔ درست را خودت بساز.
- طول translation حداکثر ۲۶۰ نویسه.`;

const FA_RE = /[\u0600-\u06FF]/;
const LATIN_RE = /[A-Za-z]/;

function sanity(v) {
  if (typeof v !== "string") return null;
  v = v.replace(/^["“»\s]+|["”«\s]+$/g, "").replace(/^ترجمه تست\s*:?/, "").trim();
  if (!FA_RE.test(v)) return null;
  const latinRuns = v.match(/[A-Za-z]{2,}/g);
  if (latinRuns && latinRuns.length > 1) return null;
  if (v.length < 4 || v.length > 400) return null;
  return v;
}

async function ask(zai, user) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("no json");
      return JSON.parse(m[0]);
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.includes("429") || msg.toLowerCase().includes("too many")) {
        // خنک‌سازی جهانی — همهٔ ورکرها نفس بکشند
        globalCooldownUntil = Date.now() + COOLDOWN_MS * attempt;
        await sleep(COOLDOWN_MS * attempt);
        continue;
      }
      if (attempt === 5) return { __error: msg };
      await sleep(800 * attempt);
    }
  }
  return { __error: "rate-limited" };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let globalCooldownUntil = 0;

async function processOne(zai, q) {
  const task = q.translation ? "repair" : "translate";
  let user = `متن انگلیسی سؤال:\n${q.stem}\n\nگزینه‌ها: ${q.options.join(" | ")}\n`;
  user += `گزینهٔ درست: ${q.options[q.answerIdx] ?? "?"}\n\n`;
  if (q.translation) user += `ترجمهٔ OCR-دارِ کلید جزوه (فقط بازآرایی کن):\n${q.translation}\n\ncategory: repair\n`;
  else user += `category: translate\n`;
  if (q.note) user += `\nتوضیح گرامری OCR-دار (فقط بازآرایی املایی):\n${q.note}\n`;
  user += `\nخروجی: JSON {"translation": "...", "note": ...}`;
  const res = await ask(zai, user);
  if (res.__error) return { ...q, _err: res.__error };  const t = sanity(res.translation);
  const n = res.note == null ? q.note ?? null : sanity(res.note) ?? q.note;
  return {
    ...q,
    translation: t ?? q.translation ?? null,
    note: n ?? null,
    transSource: t ? (q.translation ? "booklet-key+ai-repair" : "ai") : q.translation ? "booklet-key-raw" : null,
    noteSource: n && n !== q.note ? "ai-repair" : q.note ? "booklet-key-raw" : null,
  };
}

async function main() {
  const data = JSON.parse(readFileSync(IN, "utf8"));
  const bank = data.bank.map((q) => ({ ...q }));
  // ادامه‌پذیری: خروجی قبلی موجود = رد شده از پردازش
  let prev = null;
  try { prev = JSON.parse(readFileSync(OUT, "utf8")); } catch {}
  const doneMap = new Map();
  if (prev?.bank) for (const q of prev.bank) if (q.transSource && !q._err) doneMap.set(q.id, q);
  const todo = [];
  for (let i = 0; i < bank.length; i++) {
    const d = doneMap.get(bank[i].id);
    if (d) bank[i] = d;
    else todo.push(i);
  }
  console.log(`bank: ${bank.length} | already done: ${bank.length - todo.length} | to process: ${todo.length}`);
  if (todo.length === 0) { console.log("nothing to do"); return; }
  const zai = await ZAI.create();
  let idx = 0, done = 0, errs = 0;

  async function worker() {
    while (idx < todo.length) {
      if (Date.now() < globalCooldownUntil) await sleep(globalCooldownUntil - Date.now() + 100);
      const my = todo[idx++];
      bank[my] = await processOne(zai, bank[my]);
      done++;
      if (bank[my]._err) errs++;
      if (done % 30 === 0) console.log(`  ${done}/${todo.length} (errs=${errs})`);
      await sleep(350);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  data.bank = bank;
  data.meta.llm = { at: new Date().toISOString(), repaired: bank.filter((x) => x.transSource === "booklet-key+ai-repair").length,
                    translated: bank.filter((x) => x.transSource === "ai").length,
                    rawKept: bank.filter((x) => x.transSource === "booklet-key-raw").length,
                    errors: errs };
  writeFileSync(OUT, JSON.stringify(data, null, 1));
  console.log("META:", JSON.stringify(data.meta.llm));
  console.log(`→ ${OUT}`);
  const noT = bank.filter((x) => !x.translation).length;
  console.log(`without translation: ${noT} | with note: ${bank.filter((x) => x.note).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
