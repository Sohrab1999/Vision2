# -*- coding: utf-8 -*-
# r357 — دامپِ کاملِ متنِ ص۷۴-۷۸ (آزمون جامع تشریحی درس دوم) + کلیدِ ص۱۸۹-۱۹۲
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)


def page_clean(pno: int) -> str:
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    return raw


out = []
for pno in range(73, 78):
    out.append(f"@@@@@@ PAGE {pno+1} @@@@@@")
    out.append(page_clean(pno))
for pno in range(188, 193):
    out.append(f"@@@@@@ PAGE {pno+1} @@@@@@")
    out.append(page_clean(pno))

Path = __import__("pathlib").Path
Path("/tmp/r357-jame2-dump.txt").write_text("\n".join(out), encoding="utf-8")
print("written /tmp/r357-jame2-dump.txt", len("\n".join(out)))
