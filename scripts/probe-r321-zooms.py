# r321 — زوم‌های ۲۴۰۰dpi برای واژه‌های سرنوشت‌ساز خطوط ترجمهٔ ص۱۹۲
import fitz

doc = fitz.open('upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf')
page = doc[191]  # ص۱۹۲
W, H = page.rect.width, page.rect.height

# (نام، متنِ جستوجو، گسترش چپ/راست/بالا/پایین نسبت به مستطیل یافته)
targets = [
    ('i02-line',  'فوتبال بازی کردن',      -30, 260, -14, 14),
    ('i05-ping',  'پینگ پونگ',             -60, 120, -10, 12),
    ('i05-begum', 'صادقانه بگم',           -30, 130, -10, 12),
    ('i06-man',   'وظیفه منه',             -50, 130, -10, 12),
    ('i06-ali',   'وظیفه عیل',             -50, 130, -10, 12),
    ('i06-tamiz', 'تمیر  کند',             -60, 130, -10, 12),
    ('i10-mi',    'مسواک میر',             -60, 130, -10, 12),
    ('i14-ba',    'خییل با تجربه',         -30, 150, -10, 12),
    ('i18-line',  'صندلیهای زیادی',        -30, 300, -14, 14),
    ('i19-gush',  'گوش میکنم',             -40, 130, -10, 12),
]
for name, needle, dx0, dx1, dy0, dy1 in targets:
    hits = page.search_for(needle)
    if not hits:
        print(name, 'NOT FOUND:', needle)
        continue
    r = hits[0]
    clip = fitz.Rect(max(0, r.x0 + dx0), max(0, r.y0 + dy0),
                     min(W, r.x0 + dx1), min(H, r.y1 + dy1))
    pix = page.get_pixmap(dpi=2400, clip=clip)
    pix.save(f'/tmp/r321-zoom-{name}.png')
    print(name, 'ok', needle, '->', pix.width, 'x', pix.height)
