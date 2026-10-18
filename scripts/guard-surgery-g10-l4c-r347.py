# -*- coding: utf-8 -*-
# r347 — جراحیِ گاردهای قبلی (r323-r346): 81→88 بانک، 1062→1130 آیتم، وکتورِ خانواده +۷ عضو
# درسِ r346: جایگزینی باید بافت‌دار باشد — الگوها:
#   toHaveLength(81) → toHaveLength(88)          (فقط در بافتِ lessons)
#   lessons.length).toBe(81) → ...).toBe(88)
#   toBe(1062) → toBe(1130)                       (همه — کاهش/شناسه/مجموعه)
#   «81 banks» → «88 banks»                       (عنوانِ describe/it)
#   r326/r338 وکتور: «..., 16, 8, 8, 25, 40]);» → «..., 16, 8, 8, 25, 40, 8, 10, 10, 5, 5, 10, 20]);»
#   r346 خانواده: 75→82 عضو، آخرین عضو 40→20، توصیفِ جراحی
import re
from pathlib import Path

TESTS = Path("tests")
changed = []

for f in sorted(TESTS.glob("jozve-tests-g10-*.test.ts")):
    src = f.read_text(encoding="utf-8")
    orig = src
    # 1) toHaveLength(81) → 88 (بافتِ lessons — الگوی یکتا در این فایل‌ها)
    src = src.replace("toHaveLength(81)", "toHaveLength(88)")
    # 2) lessons.length).toBe(81) → 88
    src = src.replace("lessons.length).toBe(81)", "lessons.length).toBe(88)")
    # 3) 1062 → 1130
    src = src.replace("toBe(1062)", "toBe(1130)")
    # 4) عنوان‌ها
    src = src.replace("81 banks", "88 banks")
    src = src.replace("1062 items", "1130 items")
    # 5) وکتورِ خانوادهٔ r326/r338 (فقط انتهای آرایهٔ کامل — «25, 40]);» یگانه است)
    src = src.replace(
        "16, 8, 8, 25, 40]);",
        "16, 8, 8, 25, 40, 8, 10, 10, 5, 5, 10, 20]);",
    )
    # 6) توصیفِ جراحیِ عنوانِ فایل-شکل
    src = src.replace(
        "(4 tashrihi4 + 1 vocab40l4 appended — r345/r346 surgery)",
        "(4 tashrihi4 + 1 vocab40l4 + 7 g10l4c appended — r345/r346/r347 surgery)",
    )
    if src != orig:
        f.write_text(src, encoding="utf-8")
        changed.append(f.name)

# 7) گاردِ r346 — آزمونِ خانواده
p346 = TESTS / "jozve-tests-g10-l4vocab40-r346.test.ts"
src = p346.read_text(encoding="utf-8")
src = src.replace(
    'it("family shape vector extended: r326/r338 +1 member (40) — 75 members", () => {',
    'it("family shape vector extended: r326/r338 +7 members (8,10,10,5,5,10,20) — 82 members", () => {',
)
src = src.replace("expect(tail.length).toBe(75);", "expect(tail.length).toBe(82);")
src = src.replace("expect(tail.slice(-1)).toEqual([40]); // بانکِ ۸۱ — آخرین عضو",
                  "expect(tail.slice(-1)).toEqual([20]); // بانکِ ۸۸ — آخرین عضو")
p346.write_text(src, encoding="utf-8")

print("changed files:", len(changed))
for c in changed:
    print(" -", c)

# راستی‌آزمایی: هیچ «1062» یا «toHaveLength(81)» باقی نمانده
leftover = []
for f in sorted(TESTS.glob("jozve-tests-g10-*.test.ts")):
    s = f.read_text(encoding="utf-8")
    if "1062" in s or "toHaveLength(81)" in s or "81 banks" in s:
        leftover.append(f.name)
assert not leftover, f"leftover: {leftover}"
print("leftover check: CLEAN")
