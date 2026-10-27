# -*- coding: utf-8 -*-
# r350 — جراحیِ گاردهای g10 (الگوی r347/r348/r349): ۹۶→۹۷ بانک، ۱۲۴۶→۱۳۴۶ آیتم،
# وکتور کاملِ r326/r338 +۱ عضو (100)، sliceهای نسبیِ r346/r347/r349 بازلنگر (+۱ جابه‌جایی —
# درسِ r349: جابه‌جایی = تعدادِ عضوهای appended، نه اندازهٔ راند)، عنوان‌های «96 banks»→«97 banks»،
# کامنتِ فارسیِ jozve-view (راندِ قبلی) به جمعِ فعلی.
import glob

BASE = "/home/z/my-project/tests/jozve-tests-g10-*.test.ts"
NEW = "/home/z/my-project/tests/jozve-tests-g10-l14-r350.test.ts"  # استثنا — خودش به‌روز است

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

# ۱) همهٔ فایل‌های g10 (به‌جز r350): ۱۲۴۶ → ۱۳۴۶ (اعداد + عنوان‌ها)
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s = open(f, encoding="utf-8").read()
    if "1246" in s:
        open(f, "w", encoding="utf-8").write(s.replace("1246", "1346"))
        changed.append(f"{f.split('/')[-1]}: 1246→1346")

# ۲) ۹۶ → ۹۷ در طول‌ها و عنوان‌ها
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s0 = open(f, encoding="utf-8").read()
    s = s0.replace("toHaveLength(96)", "toHaveLength(97)")
    s = s.replace("length).toBe(96)", "length).toBe(97)")
    s = s.replace("96 banks", "97 banks")
    if s != s0:
        open(f, "w", encoding="utf-8").write(s)
        changed.append(f"{f.split('/')[-1]}: 96→97 shapes/titles")

# ۳) وکتور کاملِ r326/r338 — +۱ عضو (100)
for name in ("l2-r326", "l3tashrihi-r338"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    if sub_file(f, [("16, 12, 13, 2, 4, 6, 6, 57]);", "16, 12, 13, 2, 4, 6, 6, 57, 100]);", 1)]):
        changed.append(f"{name}: full vector +1 member (100)")

# ۴) sliceهای نسبیِ graml4c-r347: بانک‌های ۸۲-۸۸ حالا در -16..-10؛ خانوادهٔ قبلی در -21..-17؛ طول ۹۰→۹۱
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.length).toBe(90)", "tail.length).toBe(91)", 1),
    ("tail.slice(-15, -8)", "tail.slice(-16, -9)", 1),
    ("tail.slice(-20, -15)", "tail.slice(-21, -16)", 1),
    ("+8 members (8,10,10,5,5,10,20,57) — 90 members", "+9 members (8,10,10,5,5,10,20,57,100) — 91 members", 1),
]):
    changed.append("graml4c-r347: tail 90→91 + slices re-anchored (+1)")

# ۵) sliceهای نسبیِ l4vocab40-r346: بانک ۸۸ حالا در -10؛ tashrihi4 در -21..-18؛ طول ۹۰→۹۱
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.length).toBe(90)", "tail.length).toBe(91)", 1),
    ("tail.slice(-9, -8)", "tail.slice(-10, -9)", 1),
    ("tail.slice(-20, -16)", "tail.slice(-21, -17)", 1),
    ("+8 members (8,10,10,5,5,10,20,57) — 90 members", "+9 members (8,10,10,5,5,10,20,57,100) — 91 members", 1),
]):
    changed.append("l4vocab40-r346: tail 90→91 + slices re-anchored (+1)")

# ۶) sliceهای نسبیِ l4gwr-r349: بانک ۹۶ (۵۷) حالا در -2؛ جامعِ چهارم در -9..-3؛ طول ۹۰→۹۱
f = "/home/z/my-project/tests/jozve-tests-g10-l4gwr-r349.test.ts"
if sub_file(f, [
    ("tail.length).toBe(90)", "tail.length).toBe(91)", 1),
    ("tail.slice(-1)).toEqual([57])", "tail.slice(-2, -1)).toEqual([57])", 1),
    ("tail.slice(-8, -1)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-9, -2)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l4gwr-r349: tail 90→91 + slices re-anchored (+1)")

# ۷) کامنتِ فارسیِ jozve-view (کامنتِ راندِ قبلیِ r348): «۱۲۴۶ در ۹۶ بانک» → «۱۳۴۶ در ۹۷ بانک»
f = "/home/z/my-project/src/components/study/jozve/jozve-view.tsx"
if sub_file(f, [("کلیدِ S8 با واژهٔ غلطِ سرخِ زیرخط‌دار — tests-g10 = ۱۲۴۶ در ۹۶ بانک",
                 "کلیدِ S8 با واژهٔ غلطِ سرخِ زیرخط‌دار — tests-g10 = ۱۳۴۶ در ۹۷ بانک", 1)]):
    changed.append("jozve-view.tsx: previous-round Persian count comment bumped")

print("\n".join(changed))
print(f"total: {len(changed)} files/steps")
