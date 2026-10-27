# -*- coding: utf-8 -*-
# r349 — جراحیِ گاردهای g10 (الگوی r347/r348): ۹۵→۹۶ بانک، ۱۱۸۹→۱۲۴۶ آیتم،
# وکتور کاملِ r326/r338 +۱ عضو (57)، sliceهای نسبیِ r346/r347 بازلنگر (+۷ جابه‌جایی)،
# عنوان‌های «95 banks»→«96 banks»، کامنتِ فارسیِ jozve-view (درسِ r347: بازبینیِ همهٔ sliceهای نسبی)
import glob

def sub_file(path, pairs):
    s = open(path, encoding="utf-8").read()
    changed = False
    for old, new, expected in pairs:
        c = s.count(old)
        assert c == expected, f"{path}: {old[:60]!r} count={c} expected={expected}"
        if old != new:
            s = s.replace(old, new)
            changed = True
    if changed:
        open(path, "w", encoding="utf-8").write(s)
    return changed

changed = []

# ۱) همهٔ فایل‌های g10: ۱۱۸۹ → ۱۲۴۶ (اعداد + عنوان‌ها)
for f in glob.glob("/home/z/my-project/tests/jozve-tests-g10-*.test.ts"):
    s = open(f, encoding="utf-8").read()
    if "1189" in s:
        open(f, "w", encoding="utf-8").write(s.replace("1189", "1246"))
        changed.append(f"{f.split('/')[-1]}: 1189→1246")

# ۲) ۹۵ → ۹۶ در طول‌ها و عنوان‌ها
for f in glob.glob("/home/z/my-project/tests/jozve-tests-g10-*.test.ts"):
    s = open(f, encoding="utf-8").read()
    n0 = s
    s = s.replace("toHaveLength(95)", "toHaveLength(96)")
    s = s.replace("length).toBe(95)", "length).toBe(96)")
    s = s.replace("95 banks", "96 banks")
    if s != n0:
        open(f, "w", encoding="utf-8").write(s)
        changed.append(f"{f.split('/')[-1]}: 95→96 shapes/titles")

# ۳) وکتور کاملِ r326/r338 — +۱ عضو (57)
for name in ("l2-r326", "l3tashrihi-r338"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    if sub_file(f, [("16, 12, 13, 2, 4, 6, 6]);", "16, 12, 13, 2, 4, 6, 6, 57]);", 1)]):
        changed.append(f"{name}: full vector +1 member (57)")

# ۴) sliceهای نسبیِ graml4c-r347: بانک‌های ۸۲-۸۸ حالا در -21..-14؛ خانوادهٔ قبلی در -26..-21؛ طول ۸۹→۹۰
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.length).toBe(89)", "tail.length).toBe(90)", 1),
    ("tail.slice(-14, -7)", "tail.slice(-21, -14)", 1),
    ("tail.slice(-19, -14)", "tail.slice(-26, -21)", 1),
    ("+7 members (8,10,10,5,5,10,20) — 89 members", "+8 members (8,10,10,5,5,10,20,57) — 90 members", 1),
]):
    changed.append("graml4c-r347: tail 89→90 + slices re-anchored")

# ۵) sliceهای نسبیِ l4vocab40-r346: بانک ۸۸ حالا در -9؛ tashrihi4 در -26..-22؛ طول ۸۹→۹۰
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.length).toBe(89)", "tail.length).toBe(90)", 1),
    ("tail.slice(-8, -7)", "tail.slice(-9, -8)", 1),
    ("tail.slice(-19, -15)", "tail.slice(-26, -22)", 1),
    ("+7 members (8,10,10,5,5,10,20) — 89 members", "+8 members (8,10,10,5,5,10,20,57) — 90 members", 1),
]):
    changed.append("l4vocab40-r346: tail 89→90 + slices re-anchored")

# ۶) کامنتِ فارسیِ jozve-view: «۱۱۸۹ در ۹۵ بانک» → «۱۲۴۶ در ۹۶ بانک»
f = "/home/z/my-project/src/components/study/jozve/jozve-view.tsx"
if sub_file(f, [("tests-g10 = ۱۱۸۹ در ۹۵ بانک", "tests-g10 = ۱۲۴۶ در ۹۶ بانک", 1)]):
    changed.append("jozve-view.tsx: Persian count comment updated")

print("\n".join(changed))
print(f"total: {len(changed)} files/steps")
