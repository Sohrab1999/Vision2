#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r360 — جراحیِ گاردهای پیشینِ یازدهم: ۱۰۸۴→۱۱۸۴، ۹۲→۹۴، جمع‌ها +۱۰۰ (r360 — گرامر و نگارش د۳)،
پنجره‌های slice بازلنگر، آرایه‌های کاملِ شناسه‌ها +۹۳,۹۴.
درسِ r359: چهار گاردِ قدیمی‌تر آرایهٔ کامل هم دارند — toHaveLength و آرایه‌ها را هم بگرید.
"""
from pathlib import Path

T = Path("/home/z/my-project/tests")

def patch(fname: str, pairs: list[tuple[str, str]]) -> int:
    p = T / fname
    txt = p.read_text(encoding="utf-8")
    n = 0
    for old, new in pairs:
        c = txt.count(old)
        if c == 0 and new in txt:
            n += 1  # از قبل اعمال شده — idempotent
            continue
        if c == 0:
            raise SystemExit(f"{fname}: NOT FOUND: {old[:90]!r}")
        if c != 1:
            raise SystemExit(f"{fname}: AMBIGUOUS ({c}x): {old[:90]!r}")
        txt = txt.replace(old, new)
        n += 1
    p.write_text(txt, encoding="utf-8")
    print(f"{fname}: {n} edits")
    return n

ARR_APPEND_OLD = """      // r359 — «آزمون جامع تشریحی درس سوم» (ص۱۰۹-۱۱۱، کلید ص۲۰۱-۲۰۲) — l79..l92 الحاق شد
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
    ]);"""
ARR_APPEND_NEW = """      // r359 — «آزمون جامع تشریحی درس سوم» (ص۱۰۹-۱۱۱، کلید ص۲۰۱-۲۰۲) — l79..l92 الحاق شد
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
      // r360 — «تست های گرامر و نگارش درس3 - پایه11» (ص۱۰۳-۱۰۸، کلیدهای ص۱۹۸-۲۰۰) — l93..l94 الحاق شد
      93, 94,
    ]);"""

ARR_APPEND_R275_OLD = """      // r359 — «آزمون جامع تشریحی درس سوم» (ص۱۰۹-۱۱۱، کلید ص۲۰۱-۲۰۲) — l79..l92 الحاق شد
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
    ]);"""
ARR_APPEND_R275_NEW = """      // r359 — «آزمون جامع تشریحی درس سوم» (ص۱۰۹-۱۱۱، کلید ص۲۰۱-۲۰۲) — l79..l92 الحاق شد
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
      // r360 — «تست های گرامر و نگارش درس3 - پایه11» (ص۱۰۳-۱۰۸، کلیدهای ص۱۹۸-۲۰۰) — l93..l94 الحاق شد
    93, 94,
    ]);"""

SUM_OLD = "+ ۶۵ (r359 — جامع تشریحی د۳)"
SUM_NEW = "+ ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"

# ————— ۱) r354 —————
patch("jozve-tashg11-l1-r354.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(714 + 68 + 57 + 54 + 65 + 61 + 65); // ۷۱۴ (تا r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(714 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // ۷۱۴ (تا r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last fifty-six banks are l37..l92 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92)"',
     'it("file shape: last fifty-eight banks are l37..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-56)", "bank.lessons.slice(-58)"),
    ("88, 89, 90, 91, 92]);\n  });\n});", "88, 89, 90, 91, 92, 93, 94]);\n  });\n});"),
])

# ————— ۲) r355 —————
patch("jozve-jame11-l1-r355.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(782 + 57 + 54 + 65 + 61 + 65); // ۷۸۲ (تا r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(782 + 57 + 54 + 65 + 61 + 65 + 100); // ۷۸۲ (تا r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last fifty banks are l43..l92 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92)"',
     'it("file shape: last fifty-two banks are l43..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-50)", "bank.lessons.slice(-52)"),
    ("88, 89, 90, 91, 92]);\n  });\n});", "88, 89, 90, 91, 92, 93, 94]);\n  });\n});"),
])

# ————— ۳) r356 —————
patch("jozve-gtashg11-l2-r356.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(839 + 54 + 65 + 61 + 65); // ۸۳۹ (تا r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(839 + 54 + 65 + 61 + 65 + 100); // ۸۳۹ (تا r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last thirty-seven banks are l56..l92 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92)"',
     'it("file shape: last thirty-nine banks are l56..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-37)", "bank.lessons.slice(-39)"),
    ("88, 89, 90, 91, 92]);\n  });", "88, 89, 90, 91, 92, 93, 94]);\n  });"),
])

# ————— ۴) r357 —————
patch("jozve-jame11-l2-r357.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(893 + 65 + 61 + 65); // ۸۹۳ (تا r356) + ۶۵ (r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(893 + 65 + 61 + 65 + 100); // ۸۹۳ (تا r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last thirty-three banks are l60..l92 in order (r358 appended l74..l78، r359 appended l79..l92)"',
     'it("file shape: last thirty-five banks are l60..l94 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-33)", "bank.lessons.slice(-35)"),
    ("88, 89, 90, 91, 92]);\n  });", "88, 89, 90, 91, 92, 93, 94]);\n  });"),
])

# ————— ۵) r358 —————
patch("jozve-gtashg11-l3-r358.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(958 + 61 + 65); // ۹۵۸ (تا r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(958 + 61 + 65 + 100); // ۹۵۸ (تا r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last thirty-three banks are l60..l92 in order (r358 appended l74..l78، r359 appended l79..l92)"',
     'it("file shape: last thirty-five banks are l60..l94 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-33)", "bank.lessons.slice(-35)"),
    ("88, 89, 90, 91, 92]);\n  });", "88, 89, 90, 91, 92, 93, 94]);\n  });"),
])

# ————— ۶) r359 —————
patch("jozve-jame11-l3-r359.test.ts", [
    ("total 1084 items in 92 banks", "total 1184 items in 94 banks"),
    ("expect(all).toHaveLength(1019 + 65); // ۱۰۱۹ (تا r358) + ۶۵ (r359)",
     "expect(all).toHaveLength(1019 + 65 + 100); // ۱۰۱۹ (تا r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
    ('it("file shape: last thirty-three banks are l60..l92 in order (r359 appended l79..l92)"',
     'it("file shape: last thirty-five banks are l60..l94 in order (r359 appended l79..l92، r360 appended l93..l94)"'),
    ("bank.lessons.slice(-33)", "bank.lessons.slice(-35)"),
    ("88, 89, 90, 91, 92]);\n  });", "88, 89, 90, 91, 92, 93, 94]);\n  });"),
])

# ————— ۷) r312 —————
patch("jozve-desc-vocab-g11-l23-r312.test.ts", [
    ("bank.lessons.map((l) => l.lesson).slice(-50)).toEqual([43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]); // r356: l56..l59، r357: l60..l73، r358: l74..l78، r359: l79..l92 الحاق شدند — دنبالهٔ l29..l36 در برابر [-51:-43] می‌ماند (پنجرهٔ ۵۰ = ۹۲-۴۳+۱ محاسبه‌شده)",
     "bank.lessons.map((l) => l.lesson).slice(-52)).toEqual([43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]); // r356: l56..l59، r357: l60..l73، r358: l74..l78، r359: l79..l92، r360: l93..l94 الحاق شدند — دنبالهٔ l29..l36 در برابر [-53:-45] می‌ماند (پنجرهٔ ۵۲ = ۹۴-۴۳+۱ محاسبه‌شده)"),
    ("total 1084 items", "total 1184 items"),
    ("expect(all).toHaveLength(600 + 114 + 68 + 57 + 54 + 65 + 61 + 65); // ۶۰۰ (r311) + ۱۱۴ (r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) " + SUM_OLD,
     "expect(all).toHaveLength(600 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // ۶۰۰ (r311) + ۱۱۴ (r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)"),
    ("expect(bank.lessons).toHaveLength(92);", "expect(bank.lessons).toHaveLength(94);"),
])

# ————— ۸) r311 —————
patch("jozve-desc-vocab-g11-r311.test.ts", [
    ("bank.lessons.map((l) => l.lesson).slice(-50)).toEqual([43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]); // r356: l56..l59، r357: l60..l73، r358: l74..l78، r359: l79..l92 الحاق شدند — دنبالهٔ l25..l28 در برابر [-51:-43] می‌ماند (پنجرهٔ ۵۰ محاسبه‌شده)",
     "bank.lessons.map((l) => l.lesson).slice(-52)).toEqual([43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]); // r356: l56..l59، r357: l60..l73، r358: l74..l78، r359: l79..l92، r360: l93..l94 الحاق شدند — دنبالهٔ l25..l28 در برابر [-53:-45] می‌ماند (پنجرهٔ ۵۲ محاسبه‌شده)"),
    ("unique across the whole bank, total 1084", "unique across the whole bank, total 1184"),
    ("expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65); // +۵۷: تشریحی درس اول (r311)؛ +۱۱۴: تشریحی درس دوم/سوم (r312)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)",
     "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // +۵۷: تشریحی درس اول (r311)؛ +۱۱۴: تشریحی درس دوم/سوم (r312)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)"),
])

# ————— ۹) r308 —————
patch("jozve-g11-comprehensive360-r308.test.ts", [
    ("total 1084 (r309 added l24)", "total 1184 (r309 added l24، r360 added l93..l94)"),
    ("expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)",
     "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)"),
])

# ————— ۱۰) r309 —————
patch("jozve-konkur-vocab-g11-l24-r309.test.ts", [
    ("unique across the whole bank — total 1084", "unique across the whole bank — total 1184"),
    ("expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)",
     "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)"),
    (ARR_APPEND_OLD, ARR_APPEND_NEW),
])

# ————— ۱۱) r278 —————
patch("jozve-supplementary-g11-r278.test.ts", [
    ("expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65); // +۳۶۱: جامع ۳۶۰ (r308) — با دو «۲۲۸» چاپی؛ +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)",
     "expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // +۳۶۱: جامع ۳۶۰ (r308) — با دو «۲۲۸» چاپی؛ +۲۰: واژگان کنکوری درس دوم (r309)؛ +۶۸: تشریحی گرامر د۱ (r354)؛ +۵۷: جامع تشریحی د۱ (r355)؛ +۵۴: تشریحی گرامر د۲ (r356)؛ +۶۵: جامع تشریحی د۲ (r357)؛ +۶۱: تشریحی گرامر د۳ (r358)؛ +۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)"),
    (ARR_APPEND_R275_OLD, ARR_APPEND_R275_NEW),
])

# ————— ۱۲) r275 —————
patch("jozve-test-bank-g11-r275.test.ts", [
    (ARR_APPEND_R275_OLD, ARR_APPEND_R275_NEW),
])

print("ALL GUARD SURGERY DONE")
