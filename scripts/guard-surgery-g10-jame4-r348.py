# -*- coding: utf-8 -*-
# r348 — جراحیِ گاردهای g10 (الگوی r347): ۸۸→۹۵ بانک، ۱۱۳۰→۱۱۸۹ آیتم، وکتورهای r326/r338 +۷ عضو،
# sliceهای نسبیِ r346/r347 (درسِ r347: پس از هر راند همهٔ sliceهای نسبی بازبینی شوند)
import re, glob

V_ADD = ", 16, 12, 13, 2, 4, 6, 6"

def sub_file(path, pairs, must_count=None):
    s = open(path, encoding="utf-8").read()
    n0 = s
    for old, new, expected in pairs:
        c = s.count(old)
        assert c == expected, f"{path}: {old[:60]!r} count={c} expected={expected}"
        s = s.replace(old, new)
    if s != n0:
        open(path, "w", encoding="utf-8").write(s)
        return True
    return False

changed = []

# ۱) همهٔ فایل‌های g10: ۱۱۳۰ → ۱۱۸۹ (اعداد + عنوان‌ها)
for f in glob.glob("/home/z/my-project/tests/jozve-tests-g10-*.test.ts"):
    s = open(f, encoding="utf-8").read()
    if "1130" in s:
        s2 = s.replace("1130", "1189")
        s2 = s2.replace("family 1189 items", "family 1189 items")  # عنوان‌ها خودکار می‌آیند
        open(f, "w", encoding="utf-8").write(s2)
        changed.append(f"{f.split('/')[-1]}: 1130→1189")

# ۲) toHaveLength(88) → 95 در چهار گارد
for name in ("refl1-r344", "l4voc-r345", "jame3-r342", "r323"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    if sub_file(f, [("toHaveLength(88)", "toHaveLength(95)", 1)], ):
        changed.append(f"{name}: toHaveLength 88→95")

# ۳) lessons.length).toBe(88) در r347
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [("bank.lessons.length).toBe(88)", "bank.lessons.length).toBe(95)", 1)]):
    changed.append("graml4c-r347: length 88→95")

# ۴) وکتورهای کاملِ r326/r338 — +۷ عضو
for name in ("l2-r326", "l3tashrihi-r338"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    s = open(f, encoding="utf-8").read()
    old_tail = "8, 10, 10, 5, 5, 10, 20]);"
    assert s.count(old_tail) == 1, f"{name}: vector tail count {s.count(old_tail)}"
    s = s.replace(old_tail, "8, 10, 10, 5, 5, 10, 20" + V_ADD + "]);")
    open(f, "w", encoding="utf-8").write(s)
    changed.append(f"{name}: vector +7 members")

# ۵) sliceهای نسبیِ r347: بانک‌های ۸۲-۸۸ حالا در -14..-8؛ خانوادهٔ قبلی (۷۷-۸۱) در -19..-15
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.slice(-7)", "tail.slice(-14, -7)", 1),
    ("tail.slice(-12, -7)", "tail.slice(-19, -14)", 1),
]):
    changed.append("graml4c-r347: slices re-anchored")

# ۶) sliceهای نسبیِ r346: بانک ۸۸ حالا در -8؛ خانوادهٔ tashrihi4 (۷۷-۸۰) در -19..-16
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.slice(-1)", "tail.slice(-8, -7)", 1),
    ("tail.slice(-12, -8)", "tail.slice(-19, -15)", 1),
]):
    changed.append("l4vocab40-r346: slices re-anchored")

print("CHANGED:")
for c in changed:
    print(" -", c)
