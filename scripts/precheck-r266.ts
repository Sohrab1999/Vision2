// ------------------------------------------------------------------
// پیش‌سنجهٔ r266 — ستونِ «سطح» در CSVِ لنز
// توزیعِ شمارشِ کاربردِ ۱۹۱۵ واژهٔ رتبه‌دار + جای‌گذاریِ مرزهایِ سه‌گانه
// (سؤال: آیا مرزِ ثلثِ رتبه داخلِ نوارِ هم‌شمارها می‌افتد؟)
// ------------------------------------------------------------------
import { lessons } from "../src/data";
import { findWordUsages } from "../src/lib/word-usage";

const hist = new Map<number, number>();
let total = 0;
for (const l of lessons) {
  for (const w of l.vocabulary) {
    const c = findWordUsages(w.en).length;
    if (c > 0) {
      total++;
      hist.set(c, (hist.get(c) ?? 0) + 1);
    }
  }
}
console.log("total ranked =", total);

const countsDesc = [...hist.keys()].sort((a, b) => b - a);
// نوارهایِ هم‌شمار: [شروعِ رتبه, پایانِ رتبه, شمارش، جمعیت]
const bands: { start: number; end: number; count: number; size: number }[] = [];
let rank = 1;
for (const c of countsDesc) {
  const size = hist.get(c)!;
  bands.push({ start: rank, end: rank + size - 1, count: c, size });
  rank += size;
}

// مرزهایِ ثلثیِ ساده
const t1 = Math.ceil(total / 3);
const t2 = Math.ceil((2 * total) / 3);
console.log("t1 =", t1, " t2 =", t2);

for (const t of [t1, t2]) {
  const band = bands.find((b) => t >= b.start && t <= b.end)!;
  console.log(
    `t=${t} falls in band count=${band.count} ranks=[${band.start}..${band.end}] size=${band.size} ` +
      `inside=${t > band.start && t < band.end ? "YES (splits ties!)" : "no"}`
  );
}

// برشِ مقاومِ به تساوی: پرکاربرد = واژه‌هایِ count ≥ c1 که c1 بالاترینِ شمارشی است
// که آ,cumulativeِ آن ≥ t1؛ میانه = count در [c2, c1) ؛ کم‌کاربرد = count < c2
let acc = 0;
let c1 = 0, c2 = 0, acc1 = 0, acc2 = 0;
for (const b of bands) {
  acc += b.size;
  if (c1 === 0 && acc >= t1) { c1 = b.count; acc1 = acc; }
  if (c2 === 0 && acc >= t2) { c2 = b.count; acc2 = acc; }
}
console.log(`cut1: count>=${c1} → ${acc1} words (target ${t1})`);
console.log(`cut2: count in [${c2},${c1}) → ${acc2 - acc1} words (target ${t2 - t1})`);
console.log(`low: count<${c2} → ${total - acc2} words (target ${total - t2})`);

// چند لنگر
const anchors = ["of", "language", "communication", "ability"];
for (const a of anchors) {
  for (const l of lessons) {
    const w = l.vocabulary.find((v) => v.en.trim().toLowerCase() === a);
    if (w) {
      const c = findWordUsages(w.en).length;
      const band = bands.find((b) => b.count === c);
      console.log(`${a}: count=${c} rank-band=[${band?.start}..${band?.end}] → ${c >= c1 ? "پرکاربرد" : c >= c2 ? "میانه" : "کم‌کاربرد"}`);
      break;
    }
  }
}

// توزیعِ خشن
console.log("top bands:", bands.slice(0, 8).map((b) => `c${b.count}×${b.size}@[${b.start}..${b.end}]`).join(" "));
const count1Band = bands.find((b) => b.count === 1);
console.log("count=1 band:", count1Band ? `[${count1Band.start}..${count1Band.end}] size=${count1Band.size}` : "none");
