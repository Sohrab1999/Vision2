# -*- coding: utf-8 -*-
# r360-c — ساختارِ ص۲۰۰: کلیدِ جدولیِ «پاسخنامه کلیدی 70 تست» — dict spans + جدول
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"
doc = fitz.open(PDF)
page = doc[199]  # p200

print("===== RAW text (full, with positions marked) =====")
raw = page.get_text("text")
print(repr(raw[:2500]))

print("\n===== dict spans (all, y-sorted, with bbox) =====")
d = page.get_text("dict")
spans = []
for blk in d.get("blocks", []):
    btype = blk.get("type", 0)
    if btype != 0:
        print(f"NON-TEXT BLOCK type={btype} bbox={[round(x) for x in blk.get('bbox', [])]}")
        continue
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            t = sp.get("text", "")
            if t.strip():
                x0, y0, x1, y1 = [round(v, 1) for v in sp["bbox"]]
                spans.append((y0, x0, x1, y1, sp.get("size", 0), sp.get("color", 0), t))
spans.sort(key=lambda s: (s[0], s[1]))
for y0, x0, x1, y1, sz, col, t in spans:
    print(f"y={y0:7.1f} x={x0:6.1f}-{x1:6.1f} sz={sz:4.1f} c#{col:06x} «{t[:60]}»")

print("\n===== tables =====")
try:
    tf = page.find_tables()
    print(f"tables found: {len(tf.tables)}")
    for ti, tab in enumerate(tf.tables):
        data = tab.extract()
        print(f"--- table {ti}: rows={len(data)} cols={len(data[0]) if data else 0} ---")
        for row in data[:12]:
            print(row)
except Exception as e:
    print("find_tables error:", e)
