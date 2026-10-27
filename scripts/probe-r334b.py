# -*- coding: utf-8 -*-
# r334 — probe ۲: مرزهای دقیق — ص۹۹ سربرگ (y<60) + ص۱۰۰ بالای صفحه (Q17) + x-coord ردیف‌های چندکلمه‌ای
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# 1) p99 header zone with x-coords (y 30-75)
page = doc[98]
words = page.get_text("words")
print("=== p99 header zone (y 30-78), x-coords ===")
ws = [w for w in words if 30 < w[1] < 78]
ws.sort(key=lambda w: (round(w[1]), -w[0]))
for w in ws:
    print(f"  x1={w[0]:7.2f} y0={w[1]:6.1f}  {w[4]}")

# 2) p100 top zone (y 0-60) — Q17 stem + options a/b
page = doc[99]
words = page.get_text("words")
print("\n=== p100 top zone (y 0-70), x-coords ===")
ws = [w for w in words if w[1] < 70]
ws.sort(key=lambda w: (round(w[1]), -w[0]))
for w in ws:
    print(f"  x1={w[0]:7.2f} y0={w[1]:6.1f}  {w[4]}")

# 3) Q12 options rows with x-coords (p99 y 537-585)
print("\n=== p99 Q12 options (y 537-585) ===")
ws = [w for w in words if 537 < w[1] < 585]
ws.sort(key=lambda w: (round(w[1]), -w[0]))
for w in ws:
    print(f"  x1={w[0]:7.2f} y0={w[1]:6.1f}  {w[4]}")

# 4) Q18 options (p100 y 77-115)
print("\n=== p100 Q18 options (y 72-118) ===")
ws = [w for w in words if 72 < w[1] < 118]
ws.sort(key=lambda w: (round(w[1]), -w[0]))
for w in ws:
    print(f"  x1={w[0]:7.2f} y0={w[1]:6.1f}  {w[4]}")

# 5) p265 key top box (y 40-200) full dump
page = doc[264]
words = page.get_text("words")
print("\n=== KEY p265 top (y 40-210) ===")
body = [w for w in words if w[1] > 40]
body.sort(key=lambda w: (round(w[1] / 6), -w[0]))
rows = {}
for w in body:
    key = round(w[1] / 6)
    rows.setdefault(key, []).append(w)
for k in sorted(rows.keys()):
    y = rows[k][0][1]
    if y < 210:
        ws = sorted(rows[k], key=lambda w: -w[0])
        print(f"y={y:6.1f}  {' '.join(w[4] for w in ws)}")
