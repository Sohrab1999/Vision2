# -*- coding: utf-8 -*-
# r352 — جراحیِ گاردهای g10 (الگوی r349/r350/r351): ۹۸→۹۹ بانک، ۱۴۶۶→۱۵۸۶ آیتم،
# وکتور کاملِ r326/r338 +۱ عضو (120)، sliceهای نسبیِ r346/r347/r349/r350/r351 بازلنگر (+۱ جابه‌جایی)،
# عنوان‌های «98 banks»→«99 banks».
import glob

BASE = "/home/z/my-project/tests/jozve-tests-g10-*.test.ts"
NEW = "/home/z/my-project/tests/jozve-tests-g10-v360b-r352.test.ts"  # استثنا — خودش به‌روز است

changed = []

# ۱) ۱۴۶۶ → ۱۵۸۶ (به‌جز r352)
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s = open(f, encoding="utf-8").read()
    if "1466" in s:
        open(f, "w", encoding="utf-8").write(s.replace("1466", "1586"))
        changed.append(f"{f.split('/')[-1]}: 1466→1586")

# ۲) ۹۸ → ۹۹ در طول‌ها و عنوان‌ها
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s0 = open(f, encoding="utf-8").read()
    s = s0.replace("toHaveLength(98)", "toHaveLength(99)")
    s = s.replace("length).toBe(98)", "length).toBe(99)")
    s = s.replace("98 banks", "99 banks")
    if s != s0:
        open(f, "w", encoding="utf-8").write(s)
        changed.append(f"{f.split('/')[-1]}: 98→99 shapes/titles")

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
    if sub_file(f, [("16, 12, 13, 2, 4, 6, 6, 57, 100, 120]);", "16, 12, 13, 2, 4, 6, 6, 57, 100, 120, 120]);", 1)]):
        changed.append(f"{name}: full vector +1 member (120)")

# ۴) sliceهای نسبیِ graml4c-r347: طول ۹۲→۹۳ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.length).toBe(92)", "tail.length).toBe(93)", 1),
    ("tail.slice(-17, -10))", "tail.slice(-18, -11))", 1),
    ("tail.slice(-22, -17))", "tail.slice(-23, -18))", 1),
]):
    changed.append("graml4c-r347: tail 92→93 + slices re-anchored (+1)")

# ۵) sliceهای نسبیِ l4vocab40-r346: طول ۹۲→۹۳ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.length).toBe(92)", "tail.length).toBe(93)", 1),
    ("tail.slice(-11, -10))", "tail.slice(-12, -11))", 1),
    ("tail.slice(-22, -18))", "tail.slice(-23, -19))", 1),
]):
    changed.append("l4vocab40-r346: tail 92→93 + slices re-anchored (+1)")

# ۶) sliceهای نسبیِ l4gwr-r349: طول ۹۲→۹۳ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4gwr-r349.test.ts"
if sub_file(f, [
    ("tail.length).toBe(92)", "tail.length).toBe(93)", 1),
    ("tail.slice(-3, -2)).toEqual([57])", "tail.slice(-4, -3)).toEqual([57])", 1),
    ("tail.slice(-10, -3)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-11, -4)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l4gwr-r349: tail 92→93 + slices re-anchored (+1)")

# ۷) sliceهای نسبیِ l14-r350: طول ۹۲→۹۳ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l14-r350.test.ts"
if sub_file(f, [
    ("tail.length).toBe(92)", "tail.length).toBe(93)", 1),
    ("tail.slice(-2, -1)).toEqual([100])", "tail.slice(-3, -2)).toEqual([100])", 1),
    ("tail.slice(-3, -2)).toEqual([57])", "tail.slice(-4, -3)).toEqual([57])", 1),
    ("tail.slice(-10, -3)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-11, -4)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l14-r350: tail 92→93 + slices re-anchored (+1)")

# ۸) sliceهای نسبیِ v360a-r351: طول ۹۲→۹۳ + سه لنگر (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-v360a-r351.test.ts"
if sub_file(f, [
    ("tail.length).toBe(92)", "tail.length).toBe(93)", 1),
    ("tail.slice(-2, -1)).toEqual([100])", "tail.slice(-3, -2)).toEqual([100])", 1),
    ("tail.slice(-1)).toEqual([120])", "tail.slice(-2, -1)).toEqual([120])", 1),
    ("tail.slice(-10, -2)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", "tail.slice(-11, -3)).toEqual([16, 12, 13, 2, 4, 6, 6, 57])", 1),
]):
    changed.append("v360a-r351: tail 92→93 + slices re-anchored (+1)")

print("\n".join(changed))
print(f"total: {len(changed)} files/steps")
