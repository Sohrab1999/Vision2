# -*- coding: utf-8 -*-
# r328 — مختصاتِ لایهٔ متنِ ص۸۹/۹۰/۲۶۱/۲۶۲/۲۶۳ برای برش‌های جراحی
import fitz, json

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)

# واژه‌های لنگر برای هر صفحه: (صفحه، الگو، برچسب)
PROBES = [
    (89, "pilot said", "p89-q3-stem-end"),
    (89, "snow", "p89-q19"),
    (90, "observe", "p90-q40-opt-d"),
    (90, "happened", "p90-q40-opts"),
    (261, "عمددهی", "p261-q2-omde"),
    (261, "عمده", "p261-q2-omde2"),
    (261, "خدان", "p261-q3-khoda"),
    (261, "فرد آمدن", "p261-q5-opt4"),
    (261, "فرود", "p261-q5-forud"),
    (261, "اینچا", "p261-q7-inja"),
    (261, "اهدأ", "p261-q10-ehda"),
    (261, "اهداء", "p261-q10-ehda2"),
    (261, "رسد", "p261-q10-rasad"),
    (261, "نبستند", "p261-q12-nabudand"),
    (261, "نبودند", "p261-q12-nabudand2"),
    (261, "شگقتی", "p261-q15-shoghti"),
    (261, "دیگر جنگ", "p261-q16-jang"),
    (261, "درگیر", "p261-q16-dargir"),
    (261, "برگزیده", "p261-q8-bargozide"),
    (262, "قطرات", "p262-q20-ghatrat"),
    (262, "شکفت", "p262-q21-shogoft"),
    (262, "اشارع", "p262-q22-eshare"),
    (262, "اشاره", "p262-q22-eshare2"),
    (262, "نثار", "p262-q22-nesar"),
    (262, "نشان", "p262-q22-neshan"),
    (262, "Drop a hint", "p262-q22-hint"),
    (262, "دسی", "p262-q27-dessert"),
    (262, "دسر", "p262-q27-dessert2"),
    (262, "به طور مهم", "p262-q27-opt1"),
    (262, "هواری", "p262-q35-havai"),
    (262, "هوایی", "p262-q35-havai2"),
    (262, "آن]", "p262-q29-bracket"),
    (263, "دانشگاهه", "p263-q36-daneshgah"),
    (263, "معلمی", "p263-q37-moallemi"),
    (263, "بوستتان", "p263-q39-poost"),
    (263, "پوستتان", "p263-q39-poost2"),
    (263, "مریب", "p263-q39-marib"),
    (263, "مرتب", "p263-q39-morattab"),
    (263, "طول عمر", "p263-q40-gloss"),
    (263, "ازون", "p263-q40-ozon"),
]

for pno, needle, tag in PROBES:
    page = doc[pno - 1]
    hits = page.search_for(needle)
    if not hits:
        print(f"MISS {tag} (p{pno}) «{needle}»")
        continue
    for r in hits[:3]:
        print(f"HIT  {tag}  p{pno}  rect=({r.x0:.1f},{r.y0:.1f},{r.x1:.1f},{r.y1:.1f})  «{needle}»")
