#!/usr/bin/env python3
# r314 — progress-csv.test.ts 的 8→10 列补丁（按行操作，避开 ZWNJ 显示歧义）
import io

P = "/home/z/my-project/tests/progress-csv.test.ts"
s = io.open(P, encoding="utf-8").read()

orig = s

# 1) header comment: add r314 block after the "دانلود" line
anchor = "//   دانلود: BOM=U+FEFF · نامِ فایلِ لنگر · SSR=false"
r314_block = anchor + """
// r314 — زبانِ دوهفته‌ای در هر سه اکسل: ۸→۱۰ ستون (+جمعِ هفت‌روزه،
//   +تفاوت با هفت‌روزهٔ پیش) — همان الگویِ r312 در ماه‌نامه: پنجرهها از
//   سطرهایِ خودِ جدول مشتق میشوند، شش سطرِ اول بی‌پنجرهٔ کامل (خانهٔ
//   تهیِ صادق)، چهاردهمین سطر اولین تفاوتِ صادق، افت با مینوسِ ASCII؛
//   و واحدِ این جدول (پنج شمارنده) همان واحدِ نوارِ کارتهاست — سطرِ
//   آخر با weekStripSums می‌سنجد (آزمونِ پیوندیِ three-level-r313)."""
assert anchor in s, "anchor missing"
s = s.replace(anchor, r314_block, 1)

# 2) frozen header test: title + columns
s = s.replace("ترتیبِ ۸ستونیِ منجمد", "ترتیبِ ۱۰ستونیِ منجمد (r314: +دو ستونِ هفت‌روزه)", 1)
old_cols = '"تاریخ", "روز هفته", "مرور", "آزمون", "واژهٔ نو", "دیکته", "برق‌آسا", "مجموع",'
new_cols = ('"تاریخ", "روز هفته", "مرور", "آزمون", "واژهٔ نو", "دیکته", "برق‌آسا", "مجموع",\n'
            '      "جمعِ هفت‌روزه", "تفاوت با هفت‌روزهٔ پیش",')
assert old_cols in s, "columns line missing"
s = s.replace(old_cols, new_cols, 1)

# 3) exact row strings — append the two new (empty or value) cells
pairs = [
    ("${T},چهارشنبه,12,3,4,2,1,22`", "${T},چهارشنبه,12,3,4,2,1,22,,`"),
    ("${T},چهارشنبه,5,0,0,0,0,5`", "${T},چهارشنبه,5,0,0,0,0,5,,`"),
    ("\"2026-10-12,دوشنبه,0,0,0,0,0,0\"", "\"2026-10-12,دوشنبه,0,0,0,0,0,0,,\""),
    ("\"2026-10-13,سه‌شنبه,0,0,0,0,0,0\"", "\"2026-10-13,سه‌شنبه,0,0,0,0,0,0,,\""),
    ("${T},چهارشنبه,1,0,0,0,0,1`", "${T},چهارشنبه,1,0,0,0,0,1,,`"),
]
for a, b in pairs:
    assert a in s, f"missing: {a}"
    s = s.replace(a, b, 1)

# 4) structure test: 8 -> 10 fields
s = s.replace("دقیقاً ۸ فیلد", "دقیقاً ۱۰ فیلد", 1)
s = s.replace("toHaveLength(8)", "toHaveLength(10)", 1)

assert s != orig
io.open(P, "w", encoding="utf-8").write(s)
print("patched OK")
