# -*- coding: utf-8 -*-
# r351 — جراحیِ گاردهای g10 (الگوی r349/r350): ۹۷→۹۸ بانک، ۱۳۴۶→۱۴۶۶ آیتم،
# وکتور کاملِ r326/r338 +۱ عضو (120)، sliceهای نسبیِ r346/r347/r349/r350 بازلنگر (+۱ جابه‌جایی —
# درسِ r349: جابه‌جایی = تعدادِ عضوهای appended)، عنوان‌های «97 banks»→«98 banks»،
# کامنتِ فارسیِ jozve-view (راندِ قبلی) به جمعِ فعلی.
import glob

BASE = "/home/z/my-project/tests/jozve-tests-g10-*.test.ts"
NEW = "/home/z/my-project/tests/jozve-tests-g10-v360a-r351.test.ts"  # استثنا — خودش به‌روز است

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

# ۱) ۱۳۴۶ → ۱۴۶۶ (به‌جز r351)
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s = open(f, encoding="utf-8").read()
    if "1346" in s:
        open(f, "w", encoding="utf-8").write(s.replace("1346", "1466"))
        changed.append(f"{f.split('/')[-1]}: 1346→1466")

# ۲) ۹۷ → ۹۸ در طول‌ها و عنوان‌ها
for f in sorted(glob.glob(BASE)):
    if f == NEW:
        continue
    s0 = open(f, encoding="utf-8").read()
    s = s0.replace("toHaveLength(97)", "toHaveLength(98)")
    s = s.replace("length).toBe(97)", "length).toBe(98)")
    s = s.replace("97 banks", "98 banks")
    if s != s0:
        open(f, "w", encoding="utf-8").write(s)
        changed.append(f"{f.split('/')[-1]}: 97→98 shapes/titles")

# ۳) وکتور کاملِ r326/r338 — +۱ عضو (120)
for name in ("l2-r326", "l3tashrihi-r338"):
    f = f"/home/z/my-project/tests/jozve-tests-g10-{name}.test.ts"
    if sub_file(f, [("16, 12, 13, 2, 4, 6, 6, 57, 100]);", "16, 12, 13, 2, 4, 6, 6, 57, 100, 120]);", 1)]):
        changed.append(f"{name}: full vector +1 member (120)")

# ۴) sliceهای نسبیِ graml4c-r347: طول ۹۱→۹۲ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-graml4c-r347.test.ts"
if sub_file(f, [
    ("tail.length).toBe(91)", "tail.length).toBe(92)", 1),
    ("tail.slice(-16, -9)", "tail.slice(-17, -10)", 1),
    ("tail.slice(-21, -16)", "tail.slice(-22, -17)", 1),
    ("+9 members (8,10,10,5,5,10,20,57,100) — 91 members", "+10 members (8,10,10,5,5,10,20,57,100,120) — 92 members", 1),
]):
    changed.append("graml4c-r347: tail 91→92 + slices re-anchored (+1)")

# ۵) sliceهای نسبیِ l4vocab40-r346: طول ۹۱→۹۲ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4vocab40-r346.test.ts"
if sub_file(f, [
    ("tail.length).toBe(91)", "tail.length).toBe(92)", 1),
    ("tail.slice(-10, -9)", "tail.slice(-11, -10)", 1),
    ("tail.slice(-21, -17)", "tail.slice(-22, -18)", 1),
    ("+9 members (8,10,10,5,5,10,20,57,100) — 91 members", "+10 members (8,10,10,5,5,10,20,57,100,120) — 92 members", 1),
]):
    changed.append("l4vocab40-r346: tail 91→92 + slices re-anchored (+1)")

# ۶) sliceهای نسبیِ l4gwr-r349: طول ۹۱→۹۲ (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l4gwr-r349.test.ts"
if sub_file(f, [
    ("tail.length).toBe(91)", "tail.length).toBe(92)", 1),
    ("tail.slice(-2, -1)).toEqual([57])", "tail.slice(-3, -2)).toEqual([57])", 1),
    ("tail.slice(-9, -2)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-10, -3)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l4gwr-r349: tail 91→92 + slices re-anchored (+1)")

# ۷) sliceهای نسبیِ l14-r350: طول ۹۱→۹۲ + سه لنگر (+۱)
f = "/home/z/my-project/tests/jozve-tests-g10-l14-r350.test.ts"
if sub_file(f, [
    ("tail.length).toBe(91)", "tail.length).toBe(92)", 1),
    ("tail.slice(-1)).toEqual([100])", "tail.slice(-2, -1)).toEqual([100])", 1),
    ("tail.slice(-2, -1)).toEqual([57])", "tail.slice(-3, -2)).toEqual([57])", 1),
    ("tail.slice(-9, -2)).toEqual([16, 12, 13, 2, 4, 6, 6])", "tail.slice(-10, -3)).toEqual([16, 12, 13, 2, 4, 6, 6])", 1),
]):
    changed.append("l14-r350: tail 91→92 + slices re-anchored (+1)")

# ۸) کامنتِ فارسیِ jozve-view (کامنتِ راندِ قبلیِ r350): «۱۳۴۶ در ۹۷ بانک» → «۱۴۶۶ در ۹۸ بانک»
f = "/home/z/my-project/src/components/study/jozve/jozve-view.tsx"
if sub_file(f, [("کنکوری» (رندر حاکم؛ جلدِ خانواده «متوسط و استاندارد») — سی‌ویکمین گروهِ کارتِ دهم — tests-g10 = ۱۳۴۶ در ۹۷ بانک",
                 "کنکوری» (رندر حاکم؛ جلدِ خانواده «متوسط و استاندارد») — سی‌ویکمین گروهِ کارتِ دهم — tests-g10 = ۱۴۶۶ در ۹۸ بانک", 1)]):
    changed.append("jozve-view.tsx: previous-round Persian count comment bumped")

print("\n".join(changed))
print(f"total: {len(changed)} files/steps")
