# -*- coding: utf-8 -*-
# r358 — دامپِ کاملِ متنِ ص۱۰۰-۱۰۲ (آزمون تشریحی گرامر درس سوم) + کلیدِ ص۱۹۶-۱۹۷
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
for pno in range(99, 102):
    out.append(f"@@@@@@ PAGE {pno+1} @@@@@@")
    out.append(page_clean(pno))
for pno in range(195, 198):
    out.append(f"@@@@@@ PAGE {pno+1} @@@@@@")
    out.append(page_clean(pno))

open("/tmp/r358-dump.txt", "w", encoding="utf-8").write("\n".join(out))
print("written /tmp/r358-dump.txt", len("\n".join(out)))
