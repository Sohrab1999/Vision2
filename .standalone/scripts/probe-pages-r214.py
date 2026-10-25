#!/usr/bin/env python3
# r214 — page-level section map of the three jame booklets.
# The per-page watermark block scatters the header across many lines
# (mid-word splits like «مرور گـرامـ / ــرهای»), so we JOIN the first
# content lines of each page and search the joined text for section
# keywords; the watermark tail is cropped by dropping lines until one
# carries a real keyword.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

KEYS = re.compile(r"گرامر|نگارش|واژ|تست|آزمون|مرور|مکالمه|ریدینگ|بخش|درس")

for f in ("g10", "g11", "g12"):
    lines = (BASE / f"{f}.txt").read_text().split("\n")
    for i, l in enumerate(lines):
        m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
        if not m:
            continue
        page = int(m.group(1))
        buf = []
        for j in range(i + 1, min(i + 30, len(lines))):
            t = lines[j].strip()
            if not t or re.fullmatch(r"\d+", t):
                continue
            if "Vision" in t or t.startswith("<<<"):
                continue
            buf.append(t)
            if len(buf) >= 9:
                break
        joined = " ".join(buf)
        # crop watermark: title says «جزوه جامع زبان انگلیسی پایه …»
        wm = joined.find("همکاران")
        if wm >= 0:
            joined = joined[wm + len("همکاران"):]
        km = KEYS.search(joined)
        if km:
            print(f, page, "|", joined[max(0, km.start() - 10):km.end() + 60][:100])
