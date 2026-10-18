# -*- coding: utf-8 -*-
# r335 — crop helper: برشِ بندهای «ترجمه» و نقاطِ نزاع از صفحاتِ کلید/آزمون با زومِ بالا
import sys, json
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"

def find_lines(page, needles):
    """y-rects of lines containing any needle"""
    out = []
    d = page.get_text("dict")
    for blk in d["blocks"]:
        if blk.get("type") != 0:
            continue
        for ln in blk["lines"]:
            txt = "".join(s["text"] for s in ln["spans"])
            for nd in needles:
                if nd in txt.replace("\u200c", ""):
                    out.append((ln["bbox"], txt))
                    break
    return out

def crop(page, y0, y1, x0=None, x1=None, zoom=8, out="/tmp/r335-crop.png"):
    r = page.rect
    x0 = r.x0 if x0 is None else x0
    x1 = r.x1 if x1 is None else x1
    clip = fitz.Rect(x0, y0, x1, y1)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip)
    pix.save(out)
    print(f"saved {out} ({pix.width}x{pix.height})")

def main():
    mode = sys.argv[1]
    doc = fitz.open(PDF)
    if mode == "tr":
        # translations of one key page: page num, zoom
        pno = int(sys.argv[2]) - 1
        zoom = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        page = doc[pno]
        lines = find_lines(page, ["ترجمه"])
        print(f"page {pno+1}: {len(lines)} ترجمه lines")
        for i, (bb, txt) in enumerate(lines):
            print(i, [round(v, 1) for v in bb], txt[:60])
        # crop all as stacked bands (label + continuation lines below)
        n = len(lines)
        for i, (bb, txt) in enumerate(lines):
            y_end = lines[i + 1][0][1] - 2 if i + 1 < n else bb[3] + 30
            crop(page, bb[1] - 6, max(y_end, bb[3] + 22), None, None, zoom, f"/tmp/r335-tr-p{pno+1}-{i:02d}.png")
            print("   text:", txt.replace(chr(0x202b), "").replace(chr(0x202a), "").replace(chr(0x202c), ""))
    elif mode == "band":
        # arbitrary band: page y0 y1 [x0 x1 zoom out]
        pno = int(sys.argv[2]) - 1
        y0, y1 = float(sys.argv[3]), float(sys.argv[4])
        x0 = float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] != "-" else None
        x1 = float(sys.argv[6]) if len(sys.argv) > 6 and sys.argv[6] != "-" else None
        zoom = int(sys.argv[7]) if len(sys.argv) > 7 else 8
        out = sys.argv[8] if len(sys.argv) > 8 else "/tmp/r335-crop.png"
        crop(doc[pno], y0, y1, x0, x1, zoom, out)
    elif mode == "find":
        pno = int(sys.argv[2]) - 1
        needle = sys.argv[3]
        page = doc[pno]
        for bb, txt in find_lines(page, [needle]):
            print([round(v, 1) for v in bb], txt[:80])

if __name__ == "__main__":
    main()
