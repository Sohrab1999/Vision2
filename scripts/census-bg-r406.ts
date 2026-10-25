// سرشماریِ r406 — ساختارِ درسنامهٔ جامع (BOOKLET_GRAMMAR_TOPICS)
// نامزدِ ④ِ r405: بانکِ پنجمِ دریل — نیازمندِ سرشماریِ ساختار
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";

const t = BOOKLET_GRAMMAR_TOPICS;
console.log("TOPICS:", t.length);
const bySource: Record<string, number> = {};
for (const x of t) bySource[x.source] = (bySource[x.source] ?? 0) + 1;
console.log("BY-SOURCE:", JSON.stringify(bySource));

let withExamples = 0, withNotes = 0, withTables = 0, withIntro = 0;
let totalExamples = 0, totalNotes = 0;
const exPerTopic: number[] = [];
for (const x of t) {
  const n = x.examples?.length ?? 0;
  exPerTopic.push(n);
  totalExamples += n;
  if (n > 0) withExamples++;
  if (x.notes?.length) { withNotes++; totalNotes += x.notes.length; }
  if (x.tables?.length) withTables++;
  if (x.intro) withIntro++;
}
console.log("WITH-EXAMPLES:", withExamples, "TOTAL-EXAMPLES:", totalExamples);
console.log("WITH-NOTES:", withNotes, "TOTAL-NOTES:", totalNotes);
console.log("WITH-TABLES:", withTables, "WITH-INTRO:", withIntro);
console.log("EX-PER-TOPIC min:", Math.min(...exPerTopic), "max:", Math.max(...exPerTopic));

// یکتاییِ fa مثال‌ها (برایِ گزینه‌سازی)
const faCount = new Map<string, number>();
for (const x of t) for (const e of x.examples ?? []) faCount.set(e.fa, (faCount.get(e.fa) ?? 0) + 1);
const dupFa = [...faCount.entries()].filter(([, c]) => c > 1);
console.log("DUP-FA:", dupFa.length, JSON.stringify(dupFa.slice(0, 8)));

// یکتاییِ en مثال‌ها
const enCount = new Map<string, number>();
for (const x of t) for (const e of x.examples ?? []) enCount.set(e.en, (enCount.get(e.en) ?? 0) + 1);
const dupEn = [...enCount.entries()].filter(([, c]) => c > 1);
console.log("DUP-EN:", dupEn.length, JSON.stringify(dupEn.slice(0, 8)));

// نمونه: سه موضوعِ نخستِ هر منبع
for (const s of ["دهم", "یازدهم", "دوازدهم"] as const) {
  console.log("---", s);
  for (const x of t.filter((y) => y.source === s).slice(0, 3)) {
    console.log(`  ${x.id} | ${x.title} | ex=${x.examples?.length ?? 0} notes=${x.notes?.length ?? 0} tables=${x.tables?.length ?? 0} drill=${x.drill?.length ?? 0} type=${x.typeDrill?.length ?? 0} order=${x.orderDrill?.length ?? 0}`);
    const e0 = x.examples?.[0];
    if (e0) console.log(`    ex0: ${e0.en} → ${e0.fa}`);
  }
}
