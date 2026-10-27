# -*- coding: utf-8 -*-
# r329 — مختصات لایه + میکروزوم‌های جراحی ص۵۹/۶۰/۲۴۸
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# ۱) لنگرهای لایه
PROBES = [
    (59, "camera", "p59-q10-camera"),
    (59, "going / a house", "p59-s2-1"),
    (60, "m going o", "p60-q9-optc"),
    (60, "willn", "p60-q4-optd"),
    (60, "barometer", "p60-q4-stem"),
    (248, "going to", "p248-grid"),
    (248, "are / going to", "p248-q4"),
]
for pno, needle, tag in PROBES:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS {tag} (p{pno}) «{needle}»")
        continue
    for r in hits[:2]:
        print(f"HIT  {tag}  p{pno}  rect=({r.x0:.1f},{r.y0:.1f},{r.x1:.1f},{r.y1:.1f})")
