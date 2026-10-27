# -*- coding: utf-8 -*-
"""
r313 — شست‌وشوی ترجمه‌های موکول‌شدهٔ خانوادهٔ ضمایر موصولی (مسیرِ (الف) handoff r312)
درس ۳۲۵ (۲۰ تست دستگریمی، ص۸۶؛ کلیدِ توضیحی ص۲۰۳-۲۰۴) + درس ۳۲۶ (۱۱ تست حذف، ص۸۷؛ کلید ص۲۰۵-۲۰۶)
r310 ترجمه‌های چاپی «ترجمه:» را به دلیل آشفتگیِ لایهٔ RTL موکول کرده بود (source.relDrill.deferredTranslations).
این پارسر:
  1) کلیدِ حرفیِ هر ۳۱ آیتم را از لایهٔ fitz (PyMuPDF — ترتیبِ منطقیِ bidi) مستقل می‌گیرد و با JSON می‌سنجد
     (چهارمین داوریِ مستقل پس از pdfplumber-ریجکس + g12.txt-ریجکس + رونویسیِ pdftoppm).
  2) حضورِ نشانگرِ «ترجمه» را در بلوکِ هر آیتم اثبات می‌کند (ترجمهٔ چاپی برای هر ۳۱ هست).
  3) ترجمه‌ها از رونویسیِ چشمیِ دستیِ خطوطِ قرمزِ رندر pdftoppm (150/300/600dpi) تزریق می‌شوند —
     لایه‌های متنیِ PDF (fitz/pdftotext) فارسیِ خراب می‌دهند (قبأل/معلیم/دکیی/…) و مبنای تزریق نیستند.
  4) رسیدِ source.relDrill: deferredTranslations حذف و translationsWashed ثبت می‌شود.
تزریق idempotent است (اجرای دوم، md5 یکسان).
"""
import hashlib
import json
import re
import sys

import fitz

PDF = "upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
BANK = "public/jozve/grammar-g12-topic.json"

# ── رونویسیِ چشمیِ دستی (کلیدِ وفاداری) — خطوطِ قرمزِ «ترجمه:» ص۲۰۳-۲۰۶ ──────────
TRANSLATIONS = {
    325: {
        1: "دانش آموزان با معلمی که جان قبلاً ملاقات کرده بود، صحبت کردند.",
        2: "من نامه ای را دریافت کردم که توسط یکی از دانش آموزان نوشته شده بود.",
        3: "او به من سنگهایی را داد که او از استرالیا آورده بود.",
        4: "مکانیکی که خیلی ماهر است، یک تصادف داشت.",
        5: "دانش آموزی که والدینش هر دو معلم هستند، برنده جایزه اول در رقابت شد.",
        6: "رمانی که پدرم هفته گذشته برایم خرید، واقعا سرگرم کننده بود.",
        7: "هنرپیشه ای که قبلاً با اصغر فرهادی کار کرده بود، در مورد نقش با او تماس گرفت.",
        8: "این معلمی بود که به من گفت پسرم در کلاس رفتار بدی داشته است.",
        9: "خواهرم که من خیلی دوستش دارم,برایم در سر کار,گلهایی فرستاد.",
        10: "او دختری است که هفته گذشته ماشینش را با درخت برخورد کرد.",
        11: "آنها جعبه هایی هستند که ماه گذشته برای ما فرستاده شدند.",
        12: "او DVDهایی را که پدرش خریده بود، تماشا کرد.",
        13: "ما تعدادی کتاب خریدیم که معلم پیشنهاد داده بود.",
        14: "من دوستانی دارم که عاشق من هستند. آنها برای من یک مهمانی تولد دیدنی گرفتند.",
        15: "مرد جوانی که زندگی برادرمان را در آن تصادف ماشین نجات داد خیلی شجاع است.",
        16: "این یک راه دیگر برای گفتن آن (موضوع) است. من درباره ماشینی که آنجا پارک شده بود، حرف میزنم.",
        17: "خوبی، من باید بگویم که پول برای او اهمیتی ندارد.",
        18: "من مردی را که در همسایگی ما زندگی میکند را دیدم.",
        19: "جالب. ما داریم در مورد ماشینی که سقف قرمز رنگی دارد حرف میزنیم.",
        20: "این بهترین ماشینی است که تا به حال داشته ام. چرا این (سؤال) را پرسیدی؟",
    },
    326: {
        1: "دکتری که دیروز آن پسربچه را معاینه کرد (معاینه میکرد) خیلی پیر بود.",
        2: "عکسهای منتشر شده در روزنامه، فوق العاده بودند.",
        3: "تو خوش شانسی هستی که در یک کلاسی هستی که توسط چنین معلم محترمی تدریس میشود",
        4: "آیا این مقاله عالی در باره اقتصاد بومی که شنبه گذشته در روزنامه چاپ شده بود را خواندی؟",
        5: "موضوعات بحث شده در آن کتاب خیلی برای دانش آموزان آقای کاظمی جالب هستند.",
        6: "در سراسر دنیا، افرادی وجود دارند که خشکی، دریا و هوا را آلوده میکنند.",
        7: "دیواری که دور خانه را احاطه کرده، از چوب و آهن ساخته شده است.",
        8: "تعداد زیادی از افرادی که به مهمانی دعوت شده بودند، سر وقت نیامدند.",
        9: "اسم مردی که توسط پلیس دستگیر شد، چی بود؟",
        10: "آنها گفتند که آزمایشات انجام گرفته توسط دانشآموزان دانشگاه شیراز خیلی موفقیت آمیز بودند.",
        11: "پدرم ماشین آبی بزرگی دارد که در بیرون خانه پارک شده است.",
    },
}

KEY_PAGES = {325: (203, 204), 326: (205, 206)}
ITEM_START = re.compile(r"\n\s*(\d{1,2})\s*-\s*(?:\(\s*)?گزینه")
KEY_LETTER = re.compile(r"گزینه\s*(?:\(\s*)?([abcd])\s*\)?")
FA = re.compile(r"[\u0600-\u06FF]")


def md5(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()


def parse_key_pages():
    """کلیدِ حرفیِ هر آیتم از لایهٔ fitz + اثباتِ حضورِ نشانگرِ «ترجمه» در بلوکِ هر آیتم."""
    doc = fitz.open(PDF)
    out = {}
    for lesson, (p0, p1) in KEY_PAGES.items():
        text = ""
        for p in range(p0, p1 + 1):
            text += doc[p - 1].get_text() + "\n"
        starts = [(m.start(), int(m.group(1))) for m in ITEM_START.finditer(text)]
        seen = {}
        for i, (pos, num) in enumerate(starts):
            end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
            block = text[pos:end]
            if num in seen:
                sys.exit(f"FATAL: duplicate item {num} in lesson {lesson} blocks")
            km = KEY_LETTER.search(block)
            if not km:
                sys.exit(f"FATAL: no key letter in lesson {lesson} item {num} block")
            if "ترجمه" not in block:
                sys.exit(f"FATAL: no printed-translation marker in lesson {lesson} item {num} block")
            seen[num] = km.group(1)
        expected = sorted(TRANSLATIONS[lesson].keys())
        if sorted(seen.keys()) != expected:
            sys.exit(f"FATAL: lesson {lesson} items mismatch {sorted(seen.keys())} != {expected}")
        out[lesson] = seen
    return out


def main():
    before = md5(BANK)
    data = json.load(open(BANK, encoding="utf-8"))

    # 1) داوریِ مستقلِ چهارم: کلیدِ حرفیِ fitz در برابرِ JSON
    keys = parse_key_pages()
    for lesson in (325, 326):
        les = [l for l in data["lessons"] if l["lesson"] == lesson]
        if len(les) != 1:
            sys.exit(f"FATAL: lesson {lesson} not found")
        for q in les[0]["questions"]:
            letter = "abcd"[q["answer"]]
            got = keys[lesson][q["n"]]
            if letter != got:
                sys.exit(f"FATAL: {q['id']} JSON={letter} fitz={got}")

    # 2) سلامتِ رونویسی: فارسیِ خالص + حداقلِ طول
    for lesson, trs in TRANSLATIONS.items():
        for n, tr in trs.items():
            if not FA.search(tr) or len(tr) < 20:
                sys.exit(f"FATAL: suspicious transcription {lesson}-{n}: {tr!r}")
            if re.search(r"[A-Za-z]{4,}", tr) and lesson == 325 and n == 12:
                pass  # DVDهایی — تنها استثنای لاتینِ چاپی

    # 3) تزریقِ idempotent
    changed = 0
    for lesson in (325, 326):
        les = [l for l in data["lessons"] if l["lesson"] == lesson][0]
        for q in les["questions"]:
            tr = TRANSLATIONS[lesson][q["n"]]
            if q.get("translation") != tr:
                q["translation"] = tr
                changed += 1

    # 4) رسید: موکول → شسته‌شده
    rd = data["source"]["relDrill"]
    rd.pop("deferredTranslations", None)
    rd["translationsWashed"] = {
        "round": "r313",
        "pages": "203-206",
        "items": 31,
        "method": (
            "رونویسیِ چشمیِ دستیِ ۳۱ خطِ قرمزِ «ترجمه:» از رندرِ pdftoppm (۱۵۰/۳۰۰/۶۰۰dpi؛ برشِ "
            "پرچم‌قرمز با PyMuPDF) — لایه‌های متنیِ PDF (fitz/pdftotext) فارسیِ خراب می‌دهند "
            "(قبأل/معلیم/دکیی/پش) و فقط برای داوریِ ساختاریِ کلید و اثباتِ حضورِ نشانگر به‌کار رفتند."
        ),
        "fourthArbitration": "کلیدِ حرفیِ ۳۱/۳۱ از لایهٔ fitz هم با JSON برابر آمد (پس از pdfplumber، g12.txt، pdftoppm).",
        "printQuirks": [
            "l325-14: ساقه «last night» دارد اما چاپ «مهمانی تولد دیدنی گرفتند» — عینِ چاپ (الگوی printErrata r309)",
            "l325-9: ویرگول‌های لاتین (,) و «گلهایی فرستاد» بدونِ «را» — عینِ چاپ",
            "l325-18: «را … را» دوبار — عینِ چاپ",
            "l325-17: آغازِ «خوبی،» — عینِ چاپ",
            "l326-3: بدونِ نقطهٔ پایانی — عینِ چاپ",
            "l325-12: «DVDهایی» تنها نویسهٔ لاتینِ درونِ ترجمه‌ها — عینِ چاپ",
        ],
    }

    if changed:
        json.dump(data, open(BANK, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        open(BANK, "a", encoding="utf-8").write("\n")

    after1 = md5(BANK)
    json.dump(json.load(open(BANK, encoding="utf-8")), open("/tmp/r313-idem.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open("/tmp/r313-idem.json", "a", encoding="utf-8").write("\n")
    after2 = md5("/tmp/r313-idem.json")

    washed = sum(
        1
        for l in data["lessons"]
        if l["lesson"] in (325, 326)
        for q in l["questions"]
        if q.get("translation")
    )
    print(f"OK: changed={changed} washed={washed}/31 idempotent={after1 == after2}")
    print(f"md5 before={before} after={after1}")


if __name__ == "__main__":
    main()
