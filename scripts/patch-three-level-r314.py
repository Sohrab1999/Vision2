#!/usr/bin/env python3
# r314 — three-level-r313.test.tsx 的补丁：
#   ① 提示带文案 ۸→۱۰ 列同步
#   ② 新增活动单元的跨层链接测试（35天 CSV 末行 ↔ weekStripSums）
import io

P = "/home/z/my-project/tests/three-level-r313.test.tsx"
s = io.open(P, encoding="utf-8").read()

# ---- ① band strings ----
a1 = 'expect(band).toHaveTextContent("۳۵روزه: ۸ ستون");'
b1 = 'expect(band).toHaveTextContent("۳۵روزه: ۱۰ ستون (با جمعِ هفت‌روزه و تفاوتش)");'
assert a1 in s
s = s.replace(a1, b1, 1)

a2 = 'screen.getByTitle("جدولِ ۳۵روزه — ۸ ستون: تاریخ، روز هفته، مرور، آزمون، واژهٔ نو، دیکته، برق‌آسا، مجموع"'
b2 = 'screen.getByTitle("جدولِ ۳۵روزه — ۱۰ ستون: تاریخ، روز هفته، پنج شمارنده، مجموع، جمعِ هفت‌روزه، تفاوت با هفت‌روزهٔ پیش"'
assert a2 in s
s = s.replace(a2, b2, 1)

# ---- header comment addendum ----
a3 = "//   + برچسبِ ستونهایِ خروجیهایِ اکسل در UIِ هفته‌نامه (پیشنهادِ ②ِ r312):"
b3 = """// r314 — پیوندِ دوم در واحدِ فعالیت: جدولِ ۳۵روزه (پنج شمارنده — همان
//   واحدِ نوارِ کارتها) هم صاحبِ دو ستونِ هفت‌روزه شد؛ سطرِ آخرش باید با
//   weekStripSums رویِ همان statOfDayهایِ ۱۴روزه برابر باشد — «یک منبع،
//   سه سطح» حالا در هر دو واحد (داستان‌ها r313 / فعالیت r314) عددی قفلست.
//   + برچسبِ ستونهایِ خروجیهایِ اکسل در UIِ هفته‌نامه (پیشنهادِ ②ِ r312):"""
assert a3 in s
s = s.replace(a3, b3, 1)

# ---- ② imports ----
a4 = 'import { weekStripSums } from "@/lib/result-image";'
b4 = 'import { weekStripSums } from "@/lib/result-image";\nimport { dayKeyBefore, statOfDay } from "@/lib/weekly-digest";'
assert a4 in s
s = s.replace(a4, b4, 1)

io.open(P, "w", encoding="utf-8").write(s)
print("band + imports patched")
