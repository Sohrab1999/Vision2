// پیش‌شمارشِ ترمینالِ r267 — لنگرهایِ داده‌محور برایِ:
// ① مقیاسِ دوتاییِ چیپ‌هایِ درسِ نوارِ پراکندگی — «درس ۵ · ۵ از ۱۳»
//   (زیرِ لنز: «· ۴ از ۱۱») — مخرج = اندازهٔ همان توزیعِ جاری؛ وعدهٔ aria
//   هم «N از M کاربردِ ...» می‌گیرد (WCAG 2.5.3 — نامِ دسترس‌پذیری متنِ
//   مرئی را در بر دارد). دنبالهٔ وعدهٔ r263 پیوسته می‌ماند.
// ② titleِ آموزشیِ badgeِ «بیشترین» — تنها هم‌خانوادهٔ بی-tooltip: سه خواهرِ
//   دیگر (بیشترینِ نسبت/بیرونی‌ترین/بیرونی‌ترینِ نسبت) از راندهایِ پیش
//   tooltip دارند؛ پرِ آسمانی حالا «بیشترین واژهٔ در-متن از واژگانِ همان
//   درس — کلیکِ سطر همان واژه‌ها را می‌آورد» می‌گوید.
// اجرا: bun scripts/precount-r267.ts
import { findWordUsages } from "../src/lib/word-usage";

function distOf(en: string, kind?: string) {
  const sites = kind ? findWordUsages(en).filter((s) => s.kind === kind) : findWordUsages(en);
  const m = new Map<number, number>();
  sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  return { total: sites.length, sorted: [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]) };
}

for (const w of ["change", "communication", "ability"]) {
  const all = distOf(w);
  console.log(`${w}: total=${all.total} · chips=${all.sorted.map(([l, c]) => `${l}·${c}از${all.total}`).join(" | ")}`);
  for (const kind of ["conversation", "reading"]) {
    const lk = distOf(w, kind);
    if (lk.total === 0) continue;
    console.log(`  · lens=${kind}: total=${lk.total} · chips=${lk.sorted.map(([l, c]) => `${l}·${c}از${lk.total}`).join(" | ")}`);
  }
}
