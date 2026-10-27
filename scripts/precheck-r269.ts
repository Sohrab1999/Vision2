// ------------------------------------------------------------------
// پیش‌سنجهٔ r269 — زبانِ پنجمِ سطح: titleِ چیپِ رتبه (۵ در) +
// ترکیبِ سطحِ سؤال‌هایِ دریل رویِ کارتِ نتیجه (سؤال‌هایِ wordدار)
// لنگرها: توزیعِ tally برایِ دریل‌هایِ واقعی + وجودِ بی‌سطح در دامنه‌هایِ
// باریک + تأییدِ ۵ سایتِ title
// ------------------------------------------------------------------
import { execSync } from "node:child_process";
import { lessons } from "../src/data";
import type { LessonData } from "../src/lib/study-types";
import { findWordUsages, usedWordRank, wordFormRegex } from "../src/lib/word-usage";
import { usageTierLabel } from "../src/lib/lens-csv";
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";

// بی‌سایت‌هایِ مثال‌دار (شاخهٔ r259) — همان فهرستِ داخلیِ live-words-quiz
const BG_EXAMPLES: { en: string; title: string }[] = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((e: { en: string; fa: string }) => ({ en: e.en, fa: e.fa, title: t.title }))
);

/** آینهٔ انتخابِ دریل زنده — ۸ نامزدِ سالمِ اول با همان ترتیبِ پایدار */
function mirrorLive(scope: LessonData[]): string[] {
  const seen = new Set<string>();
  const cands: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count >= 1) cands.push({ en: w.en, count });
    }
  }
  cands.sort((a, b) => b.count - a.count);
  const pool = cands.map((c) => c.en);
  const out: string[] = [];
  for (const c of cands) {
    if (out.length >= 8) break;
    const site = findWordUsages(c.en)[0];
    if (!site) continue;
    const healthy = pool.filter(
      (d) => d.toLowerCase() !== c.en.toLowerCase() && !wordFormRegex(d).test(site.en)
    );
    if (healthy.length < 3) continue;
    out.push(c.en);
  }
  return out;
}

/** آینهٔ انتخابِ دریل مثال‌ها — نامزدها فقط واژگانِ دامنه (شاملِ count=0) */
function mirrorGram(scope: LessonData[]): string[] {
  const seen = new Set<string>();
  const cands: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (!BG_EXAMPLES.some((e) => wordFormRegex(w.en).test(e.en))) continue;
      cands.push({ en: w.en, count: findWordUsages(w.en).length });
    }
  }
  cands.sort((a, b) => b.count - a.count);
  const pool = cands.map((c) => c.en);
  const out: string[] = [];
  for (const c of cands) {
    if (out.length >= 8) break;
    const ex = BG_EXAMPLES.find((e) => wordFormRegex(c.en).test(e.en));
    if (!ex) continue;
    const healthy = pool.filter(
      (d) => d.toLowerCase() !== c.en.toLowerCase() && !wordFormRegex(d).test(ex.en)
    );
    if (healthy.length < 3) continue;
    out.push(c.en);
  }
  return out;
}

function tally(ens: string[]): Record<string, number> {
  const t: Record<string, number> = {};
  for (const en of ens) {
    const c = usedWordRank(en)?.count ?? 0;
    const tier = usageTierLabel(c) || "بی‌سطح";
    t[tier] = (t[tier] ?? 0) + 1;
  }
  return t;
}
const fmt = (t: Record<string, number>) =>
  Object.entries(t)
    .map(([k, v]) => `${k}=${v}`)
    .join(" · ") || "(خالی)";

// --- ۱) دریل واژه‌های زنده — پیش‌فرض همهٔ درس‌ها (top-8 پرکاربرد) ---
const liveAll = mirrorLive(lessons);
console.log("[live all] words:", liveAll.join(", "));
console.log("[live all] tally:", fmt(tally(liveAll)));

// --- ۲) دریل زندهٔ درسِ ۱ — انتظارِ ترکیبِ مخلوط ---
const liveL1 = mirrorLive(lessons.filter((l) => l.id === 1));
console.log("[live L1] words:", liveL1.join(", "));
console.log("[live L1] tally:", fmt(tally(liveL1)));

// --- ۳) دریل مثال‌های درسنامه — پیش‌فرض (همه + بی‌سایت‌ها در انتها) ---
const gramAll = mirrorGram(lessons);
console.log("[gram all] words:", gramAll.join(", "));
console.log("[gram all] tally:", fmt(tally(gramAll)));

// --- ۴) کدام درسِ تنها بی‌سایت را به دریل می‌آورد؟ ---
for (const l of lessons) {
  const words = mirrorGram(lessons.filter((x) => x.id === l.id));
  const zero = words.filter((w) => (usedWordRank(w)?.count ?? 0) === 0).length;
  if (zero > 0) {
    console.log(`[gram L${l.id}] total=${words.length} بی‌سایت=${zero} → tally:`, fmt(tally(words)));
  }
}

// --- ۵) لنگرهایِ سطح (آینهٔ r266) ---
for (const w of ["of", "language", "communication", "ability"]) {
  const r = usedWordRank(w);
  console.log(`[anchor] ${w}: count=${r?.count} tier=${usageTierLabel(r?.count ?? 0)}`);
}

// --- ۶) سایت‌هایِ title چیپ رتبه (انتظار: دقیقاً ۵ فایل) ---
const grep = execSync(
  `rg -l "یعنی پرکاربردترین" src/`,
  { encoding: "utf8" }
).trim();
console.log("[title sites] files:\n" + grep.split("\n").map((s) => "  " + s).join("\n"));

// --- ۷) واژه‌های خط‌تیره‌دار (سلامتِ word: مسیرِ مستقیم — نه بازگشتیِ id) ---
const hyphen = lessons.flatMap((l) => l.vocabulary).filter((w) => w.en.includes("-")).map((w) => w.en);
console.log("[hyphen words in vocab] =", hyphen.length, hyphen.slice(0, 5).join(", "));

