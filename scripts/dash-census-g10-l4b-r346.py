# -*- coding: utf-8 -*-
# r346 — شمارشِ ران‌های خط‌تیرهٔ لایهٔ ص۱۵۱-۱۵۲ + الگوی گزینه(x) در کلید ص۲۸۸-۲۸۹ (الگوی r343/r344)
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

print("=== DASH RUNS pp151-152 (0-based 150-151) ===")
total = 0
for pno in (150, 151):
    txt = doc[pno].get_text("text")
    runs = re.findall(r"-{2,}", txt)
    lens = [len(r) for r in runs]
    total += sum(lens)
    print(f"page {pno+1}: {len(runs)} runs, lengths={lens}, total_dashes={sum(lens)}")
print(f"TOTAL dashes: {total}")

print("\n=== SPACED vs ATTACHED runs (print micro-quirk census) ===")
for pno in (150, 151):
    txt = doc[pno].get_text("text")
    # attached: dash run directly touching a word char on either side
    for m in re.finditer(r"(\S?)(-{3,})(\S?)", txt):
        pre, run, post = m.group(1), m.group(2), m.group(3)
        line_start = txt.rfind("\n", 0, m.start()) + 1
        line = txt[line_start: txt.find("\n", m.end()) if txt.find("\n", m.end()) != -1 else len(txt)]
        line_no = txt.count("\n", 0, m.start()) + 1
        kind = "ATTACHED-pre" if pre.isalnum() else ("ATTACHED-post" if post.isalnum() else "spaced")
        print(f"  p{pno+1} L{line_no} len={len(run)} {kind} | line: {line.strip()[:90]}")

print("\n=== KEY PRANTEZ PATTERN pp288-289 (گزینه (x) spacing) ===")
for pno in (287, 288):
    txt = doc[pno].get_text("text")
    # flatten to single line to see tokens
    flat = re.sub(r"\s+", " ", txt)
    hits = re.findall(r"گزینه\s*\(\s*([a-d])\s*\)", flat)
    print(f"  p{pno+1}: flat regex 'گزینه (x)': {hits}")
    # raw form with newlines preserved
    raw_hits = re.findall(r"گزینه\(([a-d])\)|گزینه \(([a-d])\)", txt)
    print(f"      raw attached/spaced pairs: {[a or b for a, b in raw_hits]}")
    for m in re.finditer(r"گزینه", txt):
        seg = txt[m.start(): m.start()+20].replace("\n", "⏎")
        print(f"      raw: {seg!r}")
