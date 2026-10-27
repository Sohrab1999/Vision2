# r379 — probe g8 «نمونه سؤالات امتحانی ترم اول و دوم» (pdf-p73 cover, content p74+)
# Renders p74-p90 at 150dpi for visual reading; prints non-footer layer lines per page.
import fitz, re, os

PDF = "upload/جزوه هشتم.pdf"

print("PDF:", PDF)
doc = fitz.open(PDF)
print("pages:", doc.page_count)
os.makedirs("/tmp/qa-r379", exist_ok=True)

FOOT = re.compile(r"(جزوه کامل زبان|دکتر حسن لطفی)")

for pno in range(73, min(92, doc.page_count)):  # pdf pages 74..92 (0-based 73..91)
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    out = f"/tmp/qa-r379/p{pno+1}.png"
    pix.save(out)
    txt = page.get_text("text")
    lines = [ln.rstrip() for ln in txt.splitlines()]
    keep = []
    for ln in lines:
        if not ln.strip():
            continue
        if FOOT.search(ln):
            continue
        if re.fullmatch(r"\s*\d{1,3}\s*", ln):
            continue
        keep.append(ln)
    print(f"\n<<<PDFPAGE {pno+1}>>> non-footer={len(keep)}")
    for ln in keep[:60]:
        print("   |", ln)
doc.close()
