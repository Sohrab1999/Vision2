# -*- coding: utf-8 -*-
# r368 — پروبِ لنگرهای واژگان/عبارت‌های درس پنجم نهم (رسانه، pdf-p77-84) — الگوی probe-g9-exam4-lex-r367
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i

def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]

ANCHORS = [
    "weekend", "wonderful", "interested", "surf", "address", "attend",
    "text a message", "message", "interview somebody", "interview",
    "update", "blog", "technology", "technolog",
    "football", "match", "quiz", "show",
    "amazing", "fantastic", "cartoon", "newsstand", "war movie",
    "install", "download", "connect", "Internet", "website",
    "festival", "report", "program", "channel", "search",
    "happy", "busy", "grandmother", "game", "enjoy",
    "receive", "email",
]

hits = {}
for p in range(77, 85):
    for j, s in enumerate(page_lines(p)):
        low = s.lower()
        for a in ANCHORS:
            if a.lower() in low:
                hits.setdefault(a, []).append(f"p{p}:{j:03d}| {s.strip()[:90]}")

for a in ANCHORS:
    rows = hits.get(a, [])
    if rows:
        print(f"### {a} — {len(rows)} hit(s)")
        for r in rows[:4]:
            print("   ", r)
