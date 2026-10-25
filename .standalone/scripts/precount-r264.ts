// پیش‌شمارشِ ترمینالِ r264 — لنگرهایِ داده‌محور برایِ:
// ① لنزِ نوعِ درِ دیالوگ: چیپ‌هایِ «مکالمه/ریدینگ» دکمه‌هایِ دوسطحیِ
//   aria-pressed می‌شوند — کلیک، فهرستِ سایت‌ها را درجا فیلتر می‌کند و
//   نوارِ پراکندگی از سایت‌هایِ هم-لنز بازمحاسبه می‌شود (تغییرِ چیپ‌هایِ درس
//   + بازمحاسبهٔ شمارندهٔ صدرنشین). کلیکِ دوباره = بازگشت؛ کلیکِ نوعِ دیگر =
//   تعویضِ متقابل (الگویِ زوجِ r257).
// ② شمارندهٔ «N از M» رویِ عنوانِ نوار: صدرنشینِ توزیعِ جاری — «۵ از ۱۳
//   کاربرد در درسِ ۵» — و زیرِ لنز با ذکرِ نوع: «۱ از ۲ کاربردِ مکالمه در
//   درسِ ...». تساویِ صدر: همهٔ درس‌هایِ هم-بیشینه نامیده می‌شوند (ایدئومِ
//   تساویِ امنِ r258/259).
// اجرا: bun scripts/precount-r264.ts
import { findWordUsages } from "../src/lib/word-usage";
import { lessons } from "../src/data";

function lensOf(sites: ReturnType<typeof findWordUsages>, kind?: string) {
  const vis = kind ? sites.filter((s) => s.kind === kind) : sites;
  const m = new Map<number, number>();
  vis.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const max = sorted[0]?.[1] ?? 0;
  const leaders = sorted.filter(([, c]) => c === max).map(([l]) => l);
  return { total: vis.length, sorted, leaders, max };
}

// ۱) واژه‌هایِ لنگرِ تست — سه واژهٔ نوارِ r262/263
for (const w of ["change", "communication", "ability"]) {
  const sites = findWordUsages(w);
  const all = lensOf(sites);
  console.log(
    `${w}: total=${all.total} · dist=${all.sorted.map(([l, c]) => `${l}=${c}`).join(" · ")} · leaders=[${all.leaders}]`
  );
  for (const kind of ["conversation", "reading"]) {
    const lk = lensOf(sites, kind);
    if (lk.total === 0) continue;
    console.log(
      `  · lens=${kind}: total=${lk.total} · dist=${lk.sorted.map(([l, c]) => `${l}=${c}`).join(" · ")} · leaders=[${lk.leaders}]`
    );
  }
}

// ۲) سرشماریِ کلِ پیکره: چند واژهٔ نواری (≥۲ درس) صدرنشینِ مساوی دارند؟
//    و چند واژه هر دو نوع را دارند؟ (لنگرِ صداقتِ دو-نوعی)
let barWords = 0, tiedLeaders = 0, bothKinds = 0, singleKindBar = 0;
let tieExample = "";
const seen = new Set<string>();
for (const l of lessons) {
  for (const v of l.vocabulary) {
    const en = v.en;
    if (!en || seen.has(en.toLowerCase())) continue;
    seen.add(en.toLowerCase());
    const sites = findWordUsages(en);
    const m = new Map<number, number>();
    sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    if (m.size < 2) continue;
    barWords++;
    const counts = [...m.values()];
    const max = Math.max(...counts);
    const nLeaders = counts.filter((c) => c === max).length;
    if (nLeaders > 1) {
      tiedLeaders++;
      if (!tieExample) tieExample = `${en} (${nLeaders} درسِ هم-بیشینه از ${m.size})`;
    }
    const kinds = new Set(sites.map((s) => s.kind));
    if (kinds.size === 2) bothKinds++;
    else singleKindBar++;
  }
}
console.log(`\nپیکره: barWords=${barWords} · tiedLeaders=${tiedLeaders} (${tieExample}) · bothKinds=${bothKinds} · singleKindBar=${singleKindBar}`);

// ۳) نمونهٔ لنگرِ تعویضِ متقابل: واژه‌ای که هم مکالمه هم ریدینگ دارد و
//    زیرِ لنزِ مکالمه نوارش به ۱ درس سقوط می‌کند (کنترلِ نوارِ زیرِ لنز)
for (const l of lessons) {
  for (const v of l.vocabulary) {
    const sites = findWordUsages(v.en);
    const kinds = new Set(sites.map((s) => s.kind));
    const m = new Map<number, number>();
    sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    const conv = lensOf(sites, "conversation");
    if (kinds.size === 2 && m.size >= 2 && conv.sorted.length === 1) {
      console.log(`نمونهٔ سقوطِ نوار زیرِ لنز: ${v.en} · کل=${sites.length} درس‌ها=${m.size} · مکالمه=${conv.total} در ۱ درس`);
      process.exit(0);
    }
  }
}
console.log("نمونهٔ سقوطِ نوار: یافت نشد");
