# -*- coding: utf-8 -*-
# r361 — جراحیِ مرحلهٔ سوم: چهار حسابِ جاافتاده + پنجرهٔ r360
from pathlib import Path

SUFFIX = " + 39)"
NOTE = "؛ +۳۹: پایان‌ترم تشریحی (r361)"


def sub_once(path: str, pairs: list[tuple[str, str]]):
    p = Path(path)
    txt = p.read_text(encoding="utf-8")
    for old, new in pairs:
        assert txt.count(old) == 1, f"{path}: {old[:60]!r} count={txt.count(old)}"
        txt = txt.replace(old, new)
    p.write_text(txt, encoding="utf-8")
    print(f"OK {path}")


sub_once("tests/jozve-desc-vocab-g11-r311.test.ts", [
    ("toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100);",
     f"toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100{SUFFIX.replace(')', '')});"),
    ("+۱۰۰: گرامر و نگارش د۳ (r360)\n", "+۱۰۰: گرامر و نگارش د۳ (r360)" + NOTE + "\n"),
])
sub_once("tests/jozve-gtashg11-l2-r356.test.ts", [
    ("toHaveLength(839 + 54 + 65 + 61 + 65 + 100); // ۸۳۹ (تا r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(839 + 54 + 65 + 61 + 65 + 100 + 39); // ۸۳۹ (تا r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)" + NOTE),
])
sub_once("tests/jozve-gtashg11-l3-r358.test.ts", [
    ("toHaveLength(958 + 61 + 65 + 100); // ۹۵۸ (تا r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)",
     "toHaveLength(958 + 61 + 65 + 100 + 39); // ۹۵۸ (تا r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)" + NOTE),
])
sub_once("tests/jozve-supplementary-g11-r278.test.ts", [
    ("toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100);",
     f"toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68 + 57 + 54 + 65 + 61 + 65 + 100{SUFFIX.replace(')', '')});"),
    ("+۱۰۰: گرامر و نگارش د۳ (r360)\n", "+۱۰۰: گرامر و نگارش د۳ (r360)" + NOTE + "\n"),
])
sub_once("tests/jozve-tests-g11-l3gwr-r360.test.ts", [
    ("expect(counts.slice(-30, -14)).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6]);\n    expect(counts.slice(-32, -30)).toEqual([30, 70]);",
     "expect(counts.slice(-30, -16)).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6]);\n    expect(counts.slice(-16, -14)).toEqual([30, 70]);"),
])

print("surgery-3 done")
