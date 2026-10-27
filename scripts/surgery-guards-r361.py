# -*- coding: utf-8 -*-
# r361 — جراحیِ گاردهای پیشینِ یازدهم: ۱۱۸۴→۱۲۲۳، ۹۴→۱۰۸ بانک، پنجره‌های tail بازمحاسبه، الحاقِ l95..l108
from pathlib import Path
import re

NEW_IDS = ", 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108"


def sub_once(path: str, pairs: list[tuple[str, str]]):
    p = Path(path)
    txt = p.read_text(encoding="utf-8")
    for old, new in pairs:
        assert txt.count(old) == 1, f"{path}: {old[:60]!r} count={txt.count(old)}"
        txt = txt.replace(old, new)
    p.write_text(txt, encoding="utf-8")
    print(f"OK {path}")


# ۱-۶) شش گاردِ خانواده: it-text + arithmetic + ۹۴→۱۰۸ + tail
sub_once("tests/jozve-tashg11-l1-r354.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("toHaveLength(714 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // ۷۱۴ (تا r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(714 + 68 + 57 + 54 + 65 + 61 + 65 + 100 + 39); // ۷۱۴ (تا r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳) + ۳۹ (r361 — پایان‌ترم تشریحی)"),
    ("toHaveLength(94)", "toHaveLength(108)"),
    ("slice(-58)", "slice(-72)"),
    ("last fifty-eight banks are l37..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)",
     "last seventy-two banks are l37..l108 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

sub_once("tests/jozve-jame11-l1-r355.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("toHaveLength(782 + 57 + 54 + 65 + 61 + 65 + 100); // ۷۸۲ (تا r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(782 + 57 + 54 + 65 + 61 + 65 + 100 + 39); // ۷۸۲ (تا r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳) + ۳۹ (r361 — پایان‌ترم تشریحی)"),
    ("toHaveLength(94)", "toHaveLength(108)"),
    ("slice(-52)", "slice(-66)"),
    ("last fifty-two banks are l43..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)",
     "last sixty-six banks are l43..l108 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

sub_once("tests/jozve-gtashg11-l2-r356.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("slice(-39)", "slice(-53)"),
    ("last thirty-nine banks are l56..l94 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)",
     "last fifty-three banks are l56..l108 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

sub_once("tests/jozve-jame11-l2-r357.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("toHaveLength(893 + 65 + 61 + 65 + 100); // ۸۹۳ (تا r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(893 + 65 + 61 + 65 + 100 + 39); // ۸۹۳ (تا r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳) + ۳۹ (r361 — پایان‌ترم تشریحی)"),
    ("slice(-35)", "slice(-49)"),
    ("last thirty-five banks are l60..l94 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)",
     "last forty-nine banks are l60..l108 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

sub_once("tests/jozve-gtashg11-l3-r358.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("slice(-35)", "slice(-49)"),
    ("last thirty-five banks are l60..l94 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)",
     "last forty-nine banks are l60..l108 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

sub_once("tests/jozve-jame11-l3-r359.test.ts", [
    ("total 1184 items in 94 banks", "total 1223 items in 108 banks"),
    ("toHaveLength(1019 + 65 + 100); // ۱۰۱۹ (تا r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(1019 + 65 + 100 + 39); // ۱۰۱۹ (تا r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳) + ۳۹ (r361 — پایان‌ترم تشریحی)"),
    ("toHaveLength(94)", "toHaveLength(108)"),
    ("slice(-35)", "slice(-49)"),
    ("last thirty-five banks are l60..l94 in order (r359 appended l79..l92، r360 appended l93..l94)",
     "last forty-nine banks are l60..l108 in order (r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)"),
    ("93, 94]);", f"93, 94{NEW_IDS}]);"),
])

# ۷) گاردِ r360 — بازنویسیِ بلوکِ shape
sub_once("tests/jozve-tests-g11-l3gwr-r360.test.ts", [
    ('it("file shape after r360: 94 banks, 1184 items, unique ids, tail vector ends [30, 70]", () => {\n    expect(bank.lessons).toHaveLength(94);',
     'it("file shape after r361: 108 banks, 1223 items, unique ids, tail vector l93..l108", () => {\n    expect(bank.lessons).toHaveLength(108);'),
    ("expect(counts.reduce((a, b) => a + b, 0)).toBe(1184);", "expect(counts.reduce((a, b) => a + b, 0)).toBe(1223);"),
    ("expect(new Set(ids).size).toBe(1184);", "expect(new Set(ids).size).toBe(1223);"),
    ("""    // وکتورِ دنباله: دو بانکِ جدید در انتها؛ پیش از آن جامعِ د۳ (r359) با [4,8,4,4,4,4,4,2,8,6,4,1,6,6]
    expect(counts.slice(-2)).toEqual([30, 70]);
    expect(counts.slice(-16, -2)).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6]);
    // دنبالهٔ کاملِ شناسه‌های l60..l94 از r357/r358/r359/r360
    const lastIds = bank.lessons.slice(-35).flatMap((l) => l.questions.map((q) => q.id));
    expect(lastIds.slice(0, 4)).toEqual(["g11-l60-1", "g11-l60-2", "g11-l60-3", "g11-l60-4"]);
    expect(lastIds.slice(-4)).toEqual(["g11-l94-67", "g11-l94-68", "g11-l94-69", "g11-l94-70"]);""",
     """    // وکتورِ دنباله: چهارده بانکِ جدیدِ r361 در انتها؛ پیش از آن گرامر/نگارشِ د۳ (l93/l94) و جامعِ د۳ (r359)
    expect(counts.slice(-14)).toEqual([6, 2, 2, 2, 1, 4, 4, 4, 4, 4, 3, 1, 1, 1]);
    expect(counts.slice(-30, -14)).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6]);
    expect(counts.slice(-32, -30)).toEqual([30, 70]);
    // دنبالهٔ کاملِ شناسه‌های l60..l108 از r357/r358/r359/r360/r361
    const lastIds = bank.lessons.slice(-49).flatMap((l) => l.questions.map((q) => q.id));
    expect(lastIds.slice(0, 4)).toEqual(["g11-l60-1", "g11-l60-2", "g11-l60-3", "g11-l60-4"]);
    expect(lastIds.slice(-4)).toEqual(["g11-l105-3", "g11-l106-1", "g11-l107-1", "g11-l108-1"]);"""),
])

# ۸-۱۱) چهار گاردِ کهنه‌تر: فقط it-text / arithmetic / ۹۴→۱۰۸
sub_once("tests/jozve-g11-comprehensive360-r308.test.ts", [
    ("total 1184 (r309 added l24، r360 added l93..l94)", "total 1223 (r309 added l24، r360 added l93..l94، r361 added l95..l108)"),
    ("toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); //",
     "toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100 + 39); //"),
    ("+۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)", "+۶۵: جامع تشریحی د۳ (r359)؛ +۱۰۰: گرامر و نگارش د۳ (r360)؛ +۳۹: پایان‌ترم تشریحی (r361)"),
])

sub_once("tests/jozve-konkur-vocab-g11-l24-r309.test.ts", [
    ("total 1184", "total 1223"),
])

sub_once("tests/jozve-desc-vocab-g11-r311.test.ts", [
    ("total 1184", "total 1223"),
])

sub_once("tests/jozve-desc-vocab-g11-l23-r312.test.ts", [
    ("total 1184 items", "total 1223 items"),
    ("toHaveLength(600 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100); // ۶۰۰ (r311) + ۱۱۴ (r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(600 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100 + 39); // ۶۰۰ (r311) + ۱۱۴ (r312) + ۶۸ (r354) + ۵۷ (r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳) + ۳۹ (r361 — پایان‌ترم تشریحی)"),
    ("toHaveLength(94)", "toHaveLength(108)"),
])

print("surgery done")
