# -*- coding: utf-8 -*-
# r353 — جراحیِ گاردهای g10 (الگوی r349/r350/r351/r352): ۹۹→۱۰۰ بانک، ۱۵۸۶→۱۷۰۶ آیتم،
# وکتور کاملِ r326/r338 +۱ عضو (120)، sliceهای نسبیِ r346/r347/r349/r350/r351/r352 بازلنگر (+۱ جابه‌جایی)،
# عنوان‌های «99 banks»→«100 banks». فایلِ جدیدِ r353 هنوز نوشته نشده — همهٔ فایل‌های حاضر ۱۵۸۶→۱۷۰۶ می‌روند.
import glob

BASE = "/home/z/my-project/tests/jozve-tests-g10-*.test.ts"

changed = []

# ۱) ۱۵۸۶ → ۱۷۰۶
for f in sorted(glob.glob(BASE)):
    s = open(f, encoding="utf-8").read()
    if "1586" in s:
        open(f, "w", encoding="utf-8").write(s.replace("1586", "1706"))
        changed.append(f"{f.split('/')[-1]}: 1586→1706")

# ۲) ۹۹ → ۱۰۰ در طول‌ها و عنوان‌ها
for f in sorted(glob.glob(BASE)):
    s0 = open(f, encoding="utf-8").read()
    s = s0.replace("toHaveLength(99)", "toHaveLength(100)")
    s = s.replace("length).toBe(99)", "length).toBe(100)")
    s = s.replace("99 banks", "100 banks")
    if s != s0:
        open(f, "w", encoding="utf-8").write(s)
        changed.append(f"{f.split('/')[-1]}: 99→100 shapes/titles")

def sub_file(path, pairs):
    s = open(path, encoding="utf-8").read()
    file_changed = False
    for old, new, expected in pairs:
        c = s.count(old)
        assert c == expected, f"{path}: {old[:60]!r} count={c} expected={expected}"
        if old != new:
            s = s.replace(old, new)
            file_changed = True
    if file_changed:
        open(path, "w", encoding="utf-8").write(s)
    return file_changed

# ۳) وکتور کاملِ r326/r338 — +۱ عضو (120)
for name in ("l2-r326", "l3tashrihi-r338"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    if sub_file(f, [("16, 12, 13, 2, 4, 6, 6, 57, 100, 120, 120]);", "16, 12, 13, 2, 4, 6, 6, 57, 100, 120, 120, 120]);", 1)]):
        changed.append(f"{name}: full vector +1 member (120)")

# ۴) sliceهای نسبیِ graml4c-r347: طول ۹۳→۹۴ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-18, -11))", "tail.slice(-19, -12))", 1),
    ("tail.slice(-23, -18))", "tail.slice(-24, -19))", 1),
]):
    changed.append("graml4c-r347: tail 93→94 + slices re-anchored (+1)")

# ۵) sliceهای نسبیِ l4vocab40-r346: طول ۹۳→۹۴ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-11, -10))" , "tail.slice(-12, -11))", 0),  # نگهبانِ صفر — نباید حضور داشته باشد (r352 جابه‌جا شده)
    ("tail.slice(-12, -11))", "tail.slice(-13, -12))", 1),
    ("tail.slice(-23, -19))", "tail.slice(-24, -20))", 1),
]):
    changed.append("l4vocab40-r346: tail 93→94 + slices re-anchored (+1)")

# ۶) sliceهای نسبیِ l4gwr-r349: طول ۹۳→۹۴ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4gwr-r349.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-4, -3)).toEqual([57])", "tail.slice(-5, -4)).toEqual([57])", 1),
    ("tail.slice(-11, -4)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-12, -5)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l4gwr-r349: tail 93→94 + slices re-anchored (+1)")

# ۷) sliceهای نسبیِ l14-r350: طول ۹۳→۹۴ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l14-r350.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-3, -2)).toEqual([100])", "tail.slice(-4, -3)).toEqual([100])", 1),
    ("tail.slice(-4, -3)).toEqual([57])", "tail.slice(-5, -4)).toEqual([57])", 1),
    ("tail.slice(-11, -4)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-12, -5)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l14-r350: tail 93→94 + slices re-anchored (+1)")

# ۸) sliceهای نسبیِ v360a-r351: طول ۹۳→۹۴ + سه لنگر (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-v360a-r351.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-3, -2)).toEqual([100])", "tail.slice(-4, -3)).toEqual([100])", 1),
    ("tail.slice(-2, -1)).toEqual([120])", "tail.slice(-3, -2)).toEqual([120])", 1),
    ("tail.slice(-11, -3)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", "tail.slice(-12, -4)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", 1),
]):
    changed.append("v360a-r351: tail 93→94 + slices re-anchored (+1)")

# ۹) sliceهای نسبیِ v360b-r352: طول ۹۳→۹۴ + چهار لنگر (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-v360b-r352.test.ts"
if sub_file(f, [
    ("tail.length).toBe(93)", "tail.length).toBe(94)", 1),
    ("tail.slice(-3, -2)).toEqual([100])", "tail.slice(-4, -3)).toEqual([100])", 1),
    ("tail.slice(-2, -1)).toEqual([120])", "tail.slice(-3, -2)).toEqual([120])", 1),
    ("tail.slice(-1)).toEqual([120])", "tail.slice(-2, -1)).toEqual([120])", 1),
    ("tail.slice(-11, -3)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", "tail.slice(-12, -4)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", 1),
]):
    changed.append("v360b-r352: tail 93→94 + slices re-anchored (+1)")

print("\n".join(changed))
print(f"total: {len(changed)} files/steps")
