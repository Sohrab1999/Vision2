// پیش‌شمارشِ ترمینالِ r263 — لنگرهایِ داده‌محور برایِ:
// ① چیپ‌هایِ کلیک‌پذیرِ درس در نوارِ پراکندگی (الگویِ host-decides): کلیکِ
//   چیپِ «درس ۶ · ۳» در دیکشنری → فیلترِ همان درس + لنزِ آسمانیِ «کاربرددار»
//   — شمارِ نتیجه = usedWordsِ همان درس (لنگر: درسِ ۶ = ۹۵)
// ③ چیپ‌هایِ تفکیکِ نوع (مکالمه/ریدینگ) — فقط وقتی هر دو نوع موجودند
// اجرا: bun scripts/precount-r263.ts
import { lessonsVocabUsageRanking, findWordUsages } from "../src/lib/word-usage";

const RANK = lessonsVocabUsageRanking();
for (const id of [6, 5, 1, 2, 7, 11, 9]) {
  const r = RANK.find((x) => x.lessonId === id)!;
  console.log(`درسِ ${id}: usedWords=${r.usedWords} (لنگرِ لنزِ آسمانی)`);
}

for (const w of ["change", "communication", "ability"]) {
  const sites = findWordUsages(w);
  const byKind = new Map<string, number>();
  const byLesson = new Map<number, number>();
  for (const s of sites) {
    byKind.set(s.kind, (byKind.get(s.kind) ?? 0) + 1);
    byLesson.set(s.lessonId, (byLesson.get(s.lessonId) ?? 0) + 1);
  }
  console.log(`${w}: sites=${sites.length} · kinds=${[...byKind.entries()].map(([k, c]) => `${k}=${c}`).join(" · ")} · lessons=${[...byLesson.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).map(([l,c])=>`${l}=${c}`).join(" · ")}`);
}
