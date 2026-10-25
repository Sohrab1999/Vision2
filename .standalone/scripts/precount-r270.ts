// پیش‌شمارشِ r270 — ابعادِ دو بندِ نو (از findWordUsages — همان تک‌منبعِ دیالوگ):
// ① بارِ فشردهٔ افقیِ موبایل — چند واژه نوارِ پراکندگی دارند (لنز-آزاد: ≥۲ درس)؟
//    نوار در هر دو حالتِ حاضر/لنزی ظاهر می‌شود؛ فشردگی فقط چیدمان است نه شرطِ نو.
// ② tooltipِ هم-لنزِ گشاینده — چند واژه لنزپذیرند (هر دو نوع)؟
// لنگرها: of = ۹۱ سایت (ریدینگ ۷۱ + مکالمه ۲۰) · change = ۱۳ (ریدینگ ۱۱ + مکالمه ۲)
import { findWordUsages } from "../src/lib/word-usage";
import { lessons } from "../src/data";
import { faNum } from "../src/lib/study-theme";

const allWords = lessons.flatMap((l) => l.vocabulary.map((v) => v.en));
const uniq = [...new Set(allWords)];

let barFree = 0; // نوارِ لنز-آزاد: سایت‌ها در ≥۲ درس
let lensAble = 0; // لنزپذیر: هر دو نوع
let expander = 0; // گشاینده: بیش از ۸ سایت
let bothFeatures = 0; // نوار + گشاینده با هم
let maxSites = 0;
let maxEn = "";
for (const w of uniq) {
  const sites = findWordUsages(w);
  const uniqLessons = new Set(sites.map((s) => s.lessonId));
  const kinds = new Set(sites.map((s) => s.kind));
  if (uniqLessons.size >= 2) barFree++;
  if (kinds.has("conversation") && kinds.has("reading")) lensAble++;
  if (sites.length > 8) {
    expander++;
    if (uniqLessons.size >= 2) bothFeatures++;
  }
  if (sites.length > maxSites) {
    maxSites = sites.length;
    maxEn = w;
  }
}

console.log(`واژه‌هایِ یکتا: ${faNum(uniq.length)}`);
console.log(`نوارِ پراکندگی (لنز-آزاد، ≥۲ درس): ${faNum(barFree)}`);
console.log(`لنزپذیر (هر دو نوع): ${faNum(lensAble)}`);
console.log(`گشاینده (>۸ سایت): ${faNum(expander)}`);
console.log(`نوار+گشاینده با هم (بیشترین سودِ فشردگی): ${faNum(bothFeatures)}`);
console.log(`بیشینهٔ سایت: «${maxEn}» با ${faNum(maxSites)}`);

// لنگرهایِ tooltipِ هم-لنزِ ② — از دادهٔ زنده
for (const w of ["change", "of"]) {
  const sites = findWordUsages(w);
  const r = sites.filter((s) => s.kind === "reading").length;
  const c = sites.filter((s) => s.kind === "conversation").length;
  console.log(
    `«${w}»: ریدینگ ${faNum(r)} → tooltipِ لنزِ ریدینگ: «کلیک: نمایشِ همهٔ ${faNum(r)} کاربردِ ریدینگ در جزوه» · مکالمه ${faNum(c)}`
  );
}
