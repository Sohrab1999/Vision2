# -*- coding: utf-8 -*-
# r328 — آیین‌نامهٔ سطرهای «گزینه (X)» در کلیدها + «سؤال» در برگه‌ها، برای برش جراحی
import fitz, json

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

out = {}
for pno in (89, 90, 261, 262, 263):
    page = doc[pno - 1]
    words = page.get_text("words")
    rows = {}
    for x0, y0, x1, y1, w, *_ in words:
        key = round(y0 / 14)  # سطرهای ~۱۴pt
        rows.setdefault(key, []).append((x0, y0, x1, y1, w))
    lines = []
    for k in sorted(rows):
        ws = sorted(rows[k])
        txt = " ".join(w for *_, w in ws)
        y0 = min(w[1] for w in ws); y1 = max(w[3] for w in ws)
        lines.append({"y": [round(y0, 1), round(y1, 1)], "text": txt})
    out[pno] = lines

json.dump(out, open("/tmp/r328-lines.json", "w"), ensure_ascii=False, indent=1)
for pno in (261, 262, 263):
    print(f"--- p{pno} ---")
    for i, l in enumerate(out[pno]):
        t = l["text"]
        if "گزینه" in t or "Note" in t or "Drop" in t:
            print(f"  L{i:02d} y={l['y']}  {t[:90]}")
for pno in (89, 90):
    print(f"--- p{pno} (English rows) ---")
    for i, l in enumerate(out[pno]):
        t = l["text"]
        if t.strip().startswith(tuple("0123456789")) and "." in t[:4]:
            print(f"  L{i:02d} y={l['y']}  {t[:80]}")
