# -*- coding: utf-8 -*-
# r324 — پروبِ عمیقِ ص۵۲-۶۰: عنوان‌های بخش + ساختار سؤال‌ها + لنگرهای پاسخنامه
import re
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

HEADER_PAT = re.compile(
    r"جزوه جام|Vision One|تألیـــف|^\d+$|ـــ م|انگل"
)

def content_lines(pno):
    out = []
    for l in doc[pno].get_text("text").splitlines():
        s = l.strip()
        if not s or HEADER_PAT.search(s):
            continue
        out.append(s)
    return out

for p in range(51, 60):
    print(f"\n===== p{p+1} ({len(content_lines(p))} content lines) =====")
    for l in content_lines(p)[:45]:
        print("   ", l[:110])
