#!/usr/bin/env python3
"""probe-g12-gaps-r280.py — صفحات میانیِ جاافتاده: 39-43, 46-49, 89-91, 143-147 + 48
نقشهٔ اجرهای سؤال بدون فیلترِ کلمهٔ «گرامر»
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

SKIP = re.compile(r"^\s*(\d+\s*|\"?جزوه\s*|جام ــع.*|جامع.*|زبان انگل.*|زبان انگلیس.*|پایه دو ازدهم.*|پایه دوازدهم.*|“Vision Three”.*|\"Vision Three\".*|تألیـــف.*|تألیف.*|\"جمـــــال.*|جمال احمدی.*|همکاران\"?.*)\s*$")

def body(p):
    return [l.strip() for l in pages.get(p, "").split("\n") if l.strip() and not SKIP.match(l.strip())]

NUM_DOT = re.compile(r"(?<![\d.])(\d{1,3})\s*\.\s+(?=[A-Za-z'\"(])")
NUM_DASH = re.compile(r"(?<![\d-])(\d{1,3})\s*-\s+(?=[A-Za-z'\"(])")

CAND = [39,40,41,42,43,46,47,48,49,89,90,91,92,143,144,145,146,147]
for p in CAND:
    lines = body(p)
    joined = "\n".join(lines)
    nd = [int(x) for x in NUM_DOT.findall(joined)]
    nh = [int(x) for x in NUM_DASH.findall(joined)]
    print(f"--- p{p} ({len(lines)}L) dot={nd[:22]} dash={nh[:22]}")
    for l in lines[:7]:
        print("    |", l[:100])
    print()
