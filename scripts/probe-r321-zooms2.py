# r321 — زومِ خطِ کامل آیتم ۲ + واژهٔ تکیِ آیتم ۱۰ (۳۴۰۰dpi)
import fitz

doc = fitz.open('upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf')
page = doc[191]
W, H = page.rect.width, page.rect.height

# خطِ کامل آیتم ۲: از حاشیهٔ چپِ متن تا انتهای «فوتبال بازی کردن»
hit = page.search_for('فوتبال بازی کردن')[0]
clip = fitz.Rect(55, hit.y0 - 16, hit.x1 + 15, hit.y1 + 16)
pix = page.get_pixmap(dpi=2200, clip=clip)
pix.save('/tmp/r321-zoom-i02-FULL.png')
print('i02-FULL', pix.width, 'x', pix.height)

# واژهٔ بعد از «مسواک» در آیتم ۱۰ — به سمتِ چپِ RTL
hits = page.search_for('مسواک میر')
r = hits[0]
clip = fitz.Rect(max(0, r.x0 - 135), r.y0 - 12, r.x1, r.y1 + 12)
pix = page.get_pixmap(dpi=3600, clip=clip)
pix.save('/tmp/r321-zoom-i10-WORD.png')
print('i10-WORD', pix.width, 'x', pix.height)
