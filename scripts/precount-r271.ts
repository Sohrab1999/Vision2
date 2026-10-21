// پیش‌شمارشِ r271 — ابعادِ دو بندِ نو:
// ① سرفِ لنز در ردیفِ سوایپِ موبایل — چند واژه چیپ‌هایِ لنز در نوار دارند
//    (هر دو نوع → kindsBoth) و سود می‌برند از نخست‌بودنِ کنترل‌ها؟
// ② مقیاسِ هم-لنزِ تیتر — لنگرهایِ متنیِ هر سه حالت (بی-لنز/ریدینگ/مکالمه)
import { findWordUsages } from "../src/lib/word-usage";
import { lessons } from "../src/data";
import { faNum } from "../src/lib/study-theme";

const allWords = lessons.flatMap((l) => l.vocabulary.map((v) => v.en));
const uniq = [...new Set(allWords)];

let lensAble = 0; // نوار با چیپ‌هایِ لنز: هر دو نوع
let barFree = 0;
for (const w of uniq) {
  const sites = findWordUsages(w);
  const uniqLessons = new Set(sites.map((s) => s.lessonId));
  const kinds = new Set(sites.map((s) => s.kind));
  if (uniqLessons.size >= 2) barFree++;
  if (kinds.has("conversation") && kinds.has("reading")) lensAble++;
}

console.log(`واژه‌هایِ یکتا: ${faNum(uniq.length)}`);
console.log(`نواردار (لنز-آزاد): ${faNum(barFree)}`);
console.log(`نوارِ لنزدار (هر دو نوع → سودِ سرفِ لنز): ${faNum(lensAble)}`);

// لنگرهایِ تیترِ ② — از دادهٔ زنده: «در جزوه · X کاربردِ نوع از Y»
for (const w of ["amaze", "change", "of"]) {
  const sites = findWordUsages(w);
  const r = sites.filter((s) => s.kind === "reading").length;
  const c = sites.filter((s) => s.kind === "conversation").length;
  console.log(
    `«${w}»: کل ${faNum(sites.length)} → بی-لنز: «در جزوه · ${faNum(sites.length)} کاربرد»` +
      (r > 0 && c > 0
        ? ` · ریدینگ: «در جزوه · ${faNum(r)} کاربردِ ریدینگ از ${faNum(sites.length)}»` +
          ` · مکالمه: «در جزوه · ${faNum(c)} کاربردِ مکالمه از ${faNum(sites.length)}»`
        : " · تک-نوع: تیتر هرگز تغییر نمی‌کند (صداقتِ r252)")
  );
}
