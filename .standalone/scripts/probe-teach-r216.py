#!/usr/bin/env python3
# r216 — full survey of the grade-12 (Vision Three) jame booklet's teaching
# sections: scan EVERY line for grammar-teaching keywords, bucket hits per
# page, and print a per-page hit count + first matching line. The watermark
# block is scrubbed. Output feeds the page-by-page read for the third
# source group of the 'درسنامهٔ جامع' tab.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

KEYS = [
    ("passive", re.compile(r"مجهول|Passive|passive|گذشتهٔ مجهول")),
    ("reported", re.compile(r"نقل قول|Reported|reported")),
    ("relative", re.compile(r"موصولی|Relative|relative|who\s*,?\s*which")),
    ("connectives", re.compile(r"عبارات الحاق|الحاق|Connective|ربط")),
    ("pastperfect", re.compile(r"گذشتهٔ کامل|گذشته کامل|Past Perfect|past perfect|had \+")),
    ("conditionals", re.compile(r"شرطی نوع دوم|شرطی نوع دوم|Conditional|conditional|If \+ ")),
    ("tenses", re.compile(r"زمان|Tense|tense")),
    ("modals", re.compile(r"افعال ناقص|افعال کمکی|Modal|modal|must|should|can\b")),
    ("vocab", re.compile(r"واژگان|Vocabulary|لغت")),
]

WM = re.compile(
    r"جزوه|جام|Vision|تألیف|گردآوری|احمدی|همکاران|تلگرام|Telegram|هزینه|تعداد صفحه|"
    r"دبیرستان|بوکان|آذربایجان|کمک آموزش|بان ز|انگلییس|^[\d\sـ\-=\"»«()\.]+$"
)

lines = (BASE / "g12.txt").read_text().split("\n")
pages = []
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l.strip())
    if m:
        pages.append([int(m.group(1)), i, None])
        if len(pages) > 1:
            pages[-2][2] = i
pages[-1][2] = len(lines)

print(f"pages={len(pages)} lines={len(lines)}")
print("pg | hits | first-hit-sample")
for pg, s, e in pages:
    per_key = {}
    sample = None
    for j in range(s + 1, e):
        t = lines[j].strip()
        if not t or WM.search(t):
            continue
        for name, rx in KEYS:
            if rx.search(t):
                per_key[name] = per_key.get(name, 0) + 1
                if sample is None:
                    sample = t[:90]
    if per_key:
        ks = ",".join(f"{k}:{v}" for k, v in sorted(per_key.items(), key=lambda x: -x[1]))
        print(f"p{pg:3d} | {ks} | {sample}")
