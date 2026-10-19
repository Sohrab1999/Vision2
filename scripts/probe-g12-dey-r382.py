#!/usr/bin/env python3
# r382 probe: g12 final-exam paper #3 from paperMap — the «دی» sitting (pdf-p329-333 exam + p334-335 key)
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = "/tmp/qa-r382"
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)

# 1) dump layer text p327-336 (1-based)
for pno in range(327, 337):
    page = doc[pno - 1]
    txt = page.get_text("text")
    with open(f"{OUT}/layer-p{pno}.txt", "w", encoding="utf-8") as f:
        f.write(txt)
    nonfooter = [l.strip() for l in txt.split("\n") if l.strip()]
    print(f"p{pno}: {len(txt)} chars, {len(nonfooter)} lines")

# 2) render 150dpi p329-335
for pno in range(329, 336):
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=150)
    pix.save(f"{OUT}/p{pno}.png")
print("rendered 150dpi p329-335 to", OUT)

# 3) sitting/date detection per page
for pno in range(329, 336):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    joined = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in txt.split("\n") if l.strip()))
    date = re.search(r"تاريخ امتحان:\s*([\d/\s]+)", joined)
    nobt = re.search(r"نوبت\s*(خرداد|شهریور|دي|دی)", joined)
    kind = "KEY" if "راهنمای تصحیح" in joined[:600] or "راهنماي تصحيح" in joined[:600] else "EXAM"
    print(f"p{pno}: {kind} | date={date.group(1).strip() if date else '?'} | nobt={nobt.group(1) if nobt else '?'}")

# 4) question markers per exam page
for pno in range(329, 334):
    txt = open(f"{OUT}/layer-p{pno}.txt", encoding="utf-8").read()
    rows = re.findall(r"^\s*(\d+)\)\s", txt, re.M)
    print(f"p{pno} question-markers:", rows[:30])
doc.close()
