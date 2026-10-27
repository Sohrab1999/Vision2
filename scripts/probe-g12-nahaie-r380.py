# r380 — probe g12 «بخش چهارم: آزمونهای دی‌ماه ۱۳۹۷ تا شهریور ۱۴۰۱ نهایی با کلید»
# Renders the exam pages at 150dpi; dumps non-epigraph layer lines per page.
import fitz, re, os

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
print("PDF:", PDF)
doc = fitz.open(PDF)
print("pages:", doc.page_count)
os.makedirs("/tmp/qa-r380", exist_ok=True)

# Epigraph/footer noise to skip
NOISE = re.compile(r"(جزوه\s+جام\s*ع|کمک آموزش|زبان انگل|پایه دو|Vision|تألیــــف|جمـــــال اح|Grade|English for|Lesson One|Lesson Two|Lesson Three|Failure is a part|If you don|شکست بخیس|از زندگیست|اگ ـ|اد نگ|م وف|واه|ی ش ـ|Skill|skill)")

for pno in range(3, min(18, doc.page_count)):
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    pix.save(f"/tmp/qa-r380/p{pno+1}.png")
    txt = page.get_text("text")
    lines = [ln.rstrip() for ln in txt.splitlines()]
    keep = []
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if NOISE.search(t):
            continue
        if re.fullmatch(r"\d{1,3}", t):
            continue
        keep.append(t)
    print(f"\n<<<PDFPAGE {pno+1}>>> non-noise={len(keep)}")
    for ln in keep[:55]:
        print("   |", ln)
doc.close()
