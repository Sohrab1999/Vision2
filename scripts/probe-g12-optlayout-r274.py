#!/usr/bin/env python3
"""probe-g12-optlayout-r274.py — تحلیل چیدمان گزینه‌ها در صفحات درس ۲/۳"""
import fitz, re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
doc = fitz.open(PDF)

for label, pages in (("L2", range(73, 78)), ("L3", range(131, 136))):
    lines = []
    for p in pages:
        lines.extend(doc[p].get_text("text").splitlines())
    one_line = multi = start_only = 0
    samples = []
    for ln in lines:
        s = ln.strip()
        if re.match(r"^a\s*\.", s):
            marks = re.findall(r"(?<![A-Za-z])([a-d])\s*\.", s)
            if len(marks) == 4 and marks == ["a", "b", "c", "d"]:
                one_line += 1
            elif len(marks) > 1:
                multi += 1
                if len(samples) < 6:
                    samples.append(s[:130])
            else:
                start_only += 1
    print(f"{label}: one-line-4={one_line} multi-partial={multi} a-only={start_only}")
    for s in samples:
        print(f"   partial |{s}")

# چند سؤال نمونهٔ کامل از L3 (شامل ساقهٔ چندخطی)
print("\n=== L3 page 134 (0-idx) lines 30-70 ===")
for ln in doc[133].get_text("text").splitlines()[30:70]:
    print(f"  |{ln[:150]}")
