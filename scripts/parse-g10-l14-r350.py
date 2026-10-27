# -*- coding: utf-8 -*-
# r350 — استخراجِ ساختاریافتهٔ ۱۰۰ سؤالِ گرامر (ص۱۷۲-۱۷۶): ساقه + ۴ گزینه برای هر سؤال
import fitz, re, json

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")
full = ""
for pno in range(171, 176):
    full += doc[pno].get_text("text") + "\n"

# حذفِ هدرِ صفحه‌ها (فرفرجهٔ تکراری)
full = re.sub(r'\d{3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "\n", full)

# تجزیهٔ سؤال‌ها: الگوی «N. متن ساقه» سپس گزینه‌ها
# شماره‌های سرخ‌اند و گزینه‌ها با a) b) c) d)
pat = re.compile(
    r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a\)\s*([\s\S]*?)\n?\s*b\)\s*([\s\S]*?)\n?\s*c\)\s*([\s\S]*?)\n?\s*d\)\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
)
qs = []
for m in pat.finditer(full):
    num = int(m.group(1))
    stem, a, b, c, d = (re.sub(r'\s+', ' ', g).strip() for g in m.groups()[1:])
    qs.append({"n": num, "stem": stem, "a": a, "b": b, "c": c, "d": d})

print("parsed:", len(qs))
missing = [n for n in range(1, 101) if n not in {q["n"] for q in qs}]
print("missing:", missing)
dupes = [n for n in set(x["n"] for x in qs) if [x["n"] for x in qs].count(n) > 1]
print("dupes:", dupes)

json.dump(qs, open("/tmp/r350-questions.json", "w"), ensure_ascii=False, indent=1)

# چاپِ ۵ سؤالِ نمونه + همهٔ سؤال‌هایی که نشانهٔ کوئیرک دارند
for q in qs:
    if q["n"] in (1, 4, 28, 34, 42, 44, 52, 64, 88, 91, 100):
        print(f"--- Q{q['n']}: {q['stem'][:150]}")
        print(f"    a) {q['a'][:70]} | b) {q['b'][:70]} | c) {q['c'][:70]} | d) {q['d'][:70]}")
