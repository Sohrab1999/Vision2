# -*- coding: utf-8 -*-
# r366 — لنگرهای واژگانی/متنیِ درس سوم نهم (جشن‌ها و مراسم) برای کلیدِ استنتاجی
# پرسش‌های داوری: Eid/Fitr؟ ceremony/culture/festival در واژگان درس؟ hold a ceremony؟
# Fajr Film Festival در متنِ درس؟ عبارت‌های س۱ (parade/fireworks/anthem) در واژنامهٔ درس؟
import re
from pathlib import Path

LAYER = Path("/home/z/my-project/booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")

WORDS = ["Eid", "Fitr", "ceremony", "Ceremony", "culture", "Culture", "festival", "Festival",
         "hold", "Hold", "celebrate", "Celebrate", "fireworks", "parade", "Parade",
         "anthem", "martyr", "Commemorate", "Fajr", "Norooz", "Noruz", "Nowruz", "relatives",
         "meal", "swim", "wears", "generous", "Generous"]

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
        for p, i, t in rows[:6]:
            print(f"  p{p} l{i}: {t!r}")
