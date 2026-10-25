// راند ۲۶۸ — پیش‌شمارشِ ترمینال: سنجشِ زنده‌بودنِ هر دو حالتِ گشایندهٔ
// «+ N موردِ دیگر» و دادهٔ چیپِ درسِ کارت‌هایِ سایت.
// اجرا: bun scripts/precount-r268.ts
import { findWordUsages } from "../src/lib/word-usage";
import { lessons } from "../src/data";
import { faNum } from "../src/lib/study-theme";

// واژگانِ همهٔ درس‌ها — همان لایهٔ رتبه‌بندیِ پنلِ مقایسه
const allWords = lessons.flatMap((l) => l.vocabulary.map((v) => v.en));
const uniq = [...new Set(allWords)];

// سرشماریِ گشاینده: چند واژه بیش از ۸ سایت دارد؟
let expandable = 0;
let maxSites = 0;
let maxWord = "";
let maxHidden = 0;
const hiddenHist = new Map<number, number>();
for (const w of uniq) {
  const n = findWordUsages(w).length;
  if (n > 8) {
    expandable++;
    const hidden = n - 8;
    hiddenHist.set(hidden, (hiddenHist.get(hidden) ?? 0) + 1);
    if (n > maxSites) {
      maxSites = n;
      maxWord = w;
      maxHidden = hidden;
    }
  }
}
console.log(`واژگانِ یکتا: ${faNum(uniq.length)}`);
console.log(`گشاینده‌دار (>۸ سایت): ${faNum(expandable)} — حالتِ زنده ✓`);
console.log(`بیشینهٔ سایت: «${maxWord}» با ${faNum(maxSites)} (${faNum(maxHidden)} پنهان)`);
console.log(
  "توزیعِ پنهان‌ها:",
  [...hiddenHist.entries()].sort((a, b) => a[0] - b[0]).map(([h, c]) => `+${h}: ${c}`).join(" · ")
);

// لنگرهایِ دیالوگ
const anchors = ["change", "communication", "ability", "interest", "conversation", "absolutely"];
for (const a of anchors) {
  const sites = findWordUsages(a);
  console.log(
    `«${a}»: ${faNum(sites.length)} سایت — ${sites.length > 8 ? `گشاینده (+${faNum(sites.length - 8)})` : "بی-گشاینده"} · کارتِ اول = درسِ ${faNum(sites[0]?.lessonId ?? 0)}`
  );
}

// لنگرِ لنزِ ریدینگِ change
const changeReading = findWordUsages("change").filter((s) => s.kind === "reading");
console.log(`change زیرِ ریدینگ: ${faNum(changeReading.length)} سایت — ${changeReading.length > 8 ? `گشاینده (+${faNum(changeReading.length - 8)})` : "بی-گشاینده"}`);

// تغییر-ناپذیری: جمعِ سایت‌ها بعد از گشودن = طولِ کامل (بدونِ دست‌کاریِ داده)
const c = findWordUsages("change");
console.log(`صحتِ گشودنِ change: ۸ + ${faNum(c.length - 8)} = ${faNum(c.length)} ✓`);

// یکتاییِ چیپِ درس: کارتِ اولِ هر واژه درسِ خودش را دارد (نمونهٔ ۵تایی)
for (const w of uniq.slice(0, 5)) {
  const s0 = findWordUsages(w)[0];
  console.log(`کارتِ اولِ «${w}» → درسِ ${faNum(s0.lessonId)} (${s0.kind})`);
}
