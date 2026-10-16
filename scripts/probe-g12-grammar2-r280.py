#!/usr/bin/env python3
"""probe-g12-grammar2-r280.py — نقشهٔ دقیق خانوادهٔ گرامر دوازدهم با پرش سرصفحهٔ ثابت
خروجی: برای هر صفحهٔ کاندید → عنوانِ بخش (خطوط غیرسرصفحه) + اجرهای سؤال
"""
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

# header lines to skip: page number alone, جزوه, جامع..., زبان..., پایه..., Vision, تألیف...
SKIP = re.compile(
    r"^\s*(\d+\s*"
    r"|\"?جزوه\s*"
    r"|جام ــع.*|جامع.*"
    r"|زبان انگل.*|زبان انگل.*"
    r"|پایه دو ازدهم.*|پایه دوازدهم.*"
    r"|“Vision Three”.*|\"Vision Three\".*"
    r"|تألیـــف.*|تألیف.*"
    r"|\"جمـــــال.*|جمال احمدی.*"
    r")\s*$"
)

def body(p):
    lines = []
    for l in pages.get(p, "").split("\n"):
        s = l.strip()
        if not s or SKIP.match(s):
            continue
        lines.append(s)
    return lines

NUM_DOT = re.compile(r"(?<![\d.])(\d{1,3})\s*\.\s+(?=[A-Za-z'\"(])")
NUM_DASH = re.compile(r"(?<![\d-])(\d{1,3})\s*-\s+(?=[A-Za-z'\"(])")

CAND = [36,37,38,44,45,52,86,88,104,105,148,153,188,189,190,191,193,194,203,211,219,220,225]
for p in CAND:
    lines = body(p)
    joined = "\n".join(lines)
    nd = NUM_DOT.findall(joined)
    nh = NUM_DASH.findall(joined)
    print(f"--- p{p} ({len(lines)} body lines) dot={[int(x) for x in nd][:25]} dash={[int(x) for x in nh][:25]}")
    for l in lines[:8]:
        print("    |", l[:105])
    print()
