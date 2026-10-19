# -*- coding: utf-8 -*-
# r367 — لنگرهای درس چهارم نهم (خدمات، pdf-p65-72) برای کلیدِ استنتاجی
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")

WORDS = ["open an account", "take out money", "round the corner", "hire a taxi", "fill out this form",
         "fill out a form", "donate", "Donate", "charity", "Charity", "information desk", "Information",
         "fire station", "Fire station", "firefighter", "fire fighter", "Recharge", "recharge", "e-ticket",
         "E-ticket", "emergency", "Emergency", "voluntary", "Voluntary", "shifts", "shift", "Paveh",
         "Mr. Amaini", "Amaini", "keep the city clean", "save people", "puts out", "put out"]

cur = None
hits = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        cur = int(m.group(1))
        continue
    for w in WORDS:
        if w in l:
            hits.setdefault(w, []).append((cur, i, l.strip()[:90]))

for w in WORDS:
    rows = hits.get(w, [])
    pages = sorted({p for p, _, _ in rows})
    if rows:
        print(f"\n### {w}: {len(rows)} hit, pages {pages[:12]}")
        for p, i, t in rows[:5]:
            print(f"  p{p} l{i}: {t!r}")
