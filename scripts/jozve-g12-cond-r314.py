#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""jozve-g12-cond-r314.py — خانوادهٔ «۷۲ تست آموزش گرامر جمله‌های شرطی و کنکوری» جزوهٔ دوازدهم

ادامهٔ مأموریت «استخراج جزوه ها رو ادامه بده» (نوبت بیست‌وسوم) — مسیرِ (الف) handoff r313:
پروبِ کلیدِ توضیحیِ «جمله‌های شرطی». سربرگِ خودِ جزوه (ص۲۰۷) ابهامِ «ص۱۰۶-۱۱۰؟» را حل کرد:
  بدنه: PDF ص۹۶-۹۹ (۷۲ سؤالِ پیوسته؛ ۲۱/۲۳/۱۹/۹ در هر صفحه)
  کلید: PDF ص۲۰۷-۲۱۰ — آیتم‌های ۱-۵۰ با بلوکِ توضیحیِ «N - گزینه (X)» + خطِ قرمزِ «ترجمه:»
        آیتم‌های ۵۱-۷۲ با گریدِ حرفیِ «پاسخنامه کلیدی بقیهٔ تست‌های جملات شرطی» انتهای ص۲۱۰
        (۲۲ جفتِ (حرف، عدد) — الگوی r308)

داوریِ کلید (چهارلایه):
  Pass A — pdfplumberِ معکوسِ RTL (ریجکسِ آینه‌ای r310، پرانتزهای معکوس + تیرهٔ اختیاری)
  Pass B — booklet-extract/g12.txt جهتِ طبیعی («N - ( گزینهX)»)
  Pass C — fitz بلوک‌به‌بلوکِ لنگری (کلیدِ حرف در بلوکِ هر آیتم؛ لنگرهای دو-تکهٔ «۳۰/۳۲»
           با گروه‌بندیِ هم‌y و آستانهٔ ۳۰pt؛ آیتم‌های ۱۱/۲۷/۴۰ سرصفحه‌ای با لنگرِ نیافته)
  Pass D — گریدِ ۵۱-۷۲: جفت‌سازیِ مستقیمِ fitz (r308: جهت از چاپ حاکم است) + رونویسیِ چشمی

ترجمه‌ها: ۵۰ خطِ قرمز با رونویسیِ چشمیِ ۶۰۰-۱۴۰۰dpi (لایه‌های متنی فارسیِ خراب می‌دهند —
الگوی r313) و قفلِ حرف‌به‌حرف در گارد. آیتم‌های ۵۱-۷۲ گریدِ خالص‌اند — غیبتِ صادقانهٔ ترجمه.

بانک‌ها: ۴ بانک × ۱۸ = ۷۲ (l327..l330) — ids: g12-cond-1..72
تزریقِ idempotent به public/jozve/grammar-g12-topic.json
"""
import hashlib
import json
import re
import sys

import fitz
import pdfplumber

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"
TXT = f"{ROOT}/booklet-extract/g12.txt"

LETTER = {"a": 0, "b": 1, "c": 2, "d": 3}
BODY_PAGES = [96, 97, 98, 99]
KEY_PAGES = [207, 208, 209, 210]
PAGE_FIRST_ITEM = {207: 1, 208: 11, 209: 27, 210: 40}
GRID_START_Y = 700  # ص۲۱۰: عنوانِ «پاسخنامه کلیدی بقیه» در y≈681 — گرید پس از آن

STEM_RE = re.compile(r"^(\d{1,2})\s*\.\s*(\S.*)$")
OPTS_RE = re.compile(r"^a\.\s*(.+)$")
BLANK_CLUSTER = re.compile(r"(?:-{2,}[ ]*){2,}")

KEY_A = re.compile(r"[)(]?\s*([a-dA-D])\s*[)(]?\s*ه\s*ن\s*ی\s*ز\s*گ\s*[-–]?\s*(\d{1,2})")
KEY_B = re.compile(
    r"(\d{1,2})\s*[-–]\s*\(?\s*(?:گزینه|گزی\s*نه|گز\s*ینه)\s*\(?\s*([a-dA-D])\s*\)?"
)
KEY_FITZ = re.compile(r"گزینه\s*\(?\s*([a-dA-D])\s*\)?")

# ── Pass D — رونویسیِ چشمیِ گریدِ انتهای ص۲۱۰ (رندر ۶۰۰dpi دیده شد) ──────────────
GRID_VISUAL = {
    51: "d", 52: "a", 53: "b", 54: "b", 55: "d", 56: "c", 57: "b", 58: "a", 59: "c",
    60: "d", 61: "a", 62: "b", 63: "d", 64: "c", 65: "c", 66: "d", 67: "a", 68: "d",
    69: "a", 70: "d", 71: "a", 72: "a",
}

# ── رونویسیِ چشمیِ دستیِ ۵۰ خطِ قرمزِ «ترجمه:» (رندر ۶۰۰-۱۴۰۰dpi؛ لایه‌های متنی مبنا نیستند) ──
TRANSLATIONS = {
    1: "اگر دوست صمیمیش نبودی، من به تو هیچ چیزی در مورد او به تو نمیگفتم.",
    2: "اگه من جای تو بودم، آن کت را نمیخریدم، خیلی گران بود.",
    3: "اگه یک باغ بزرگی داشتی، چکار میکردی؟",
    4: "اگه ما کلید نداشتیم، چکار میکردیم؟",
    5: "اگر آنها اینجا بودند، ماشینشان را قرض میگرفتم.",
    6: "اگه خیلی زیاد غذا نمیخوردی، چاق نمیشدی.",
    7: "اگه تو انگشت نداشتی، چطور میتوانستی بنویسی؟",
    8: "اگه من جای تو بودم، آن ریسک را نمیکردم.",
    9: "اگه میخواهی یک کشور یا ملتی را به خوبی بشناسی، باید هنر آن را مطالعه کنی.",
    10: "اگه به سختی تلاش کرده بودم، قادر میشدم که از سیگار کشیدن دست بکشم.",
    11: "اگه او تصمیم میگیره آن شغل را قبول کنه،و برای بقیه عمرش پشیمان خواهد شد.",
    12: "اگه داری برای آن شغل درخواست میدی، نصیحت من اینه: آن را فراموش کن.",
    13: "اگه میخواهد که امتحاناتش را پاس کنه، او به زودی این کیفیت را خواهد داشت که مثل یک وکیل کار کنه.",
    14: "اگه میخواهی یاری رسان باشی، تو مجبور خواهی بود حقیقت را به من بگویی.",
    15: "اگه من در رقابت برنده بشوم، به عنوان یک کادو یک ماشین اسباب بازی خیلی بزرگی برایت خواهم خرید.",
    16: "اگه برایت یک ماشین بزرگ میخریدم، تو خیلی خوشحال میشدی؟",
    17: "اگه به اندازه او ثروتمند بودم، به یک خانه جدید اسباب کشی میکردم.",
    18: "اگه ما برایت یک پرستار بچه پیدا کنیم، آیا برای شام با ما میآمدی؟",
    19: "اگه قادر باشم به سختی تلاش خواهم کرد که بیایم و شام را در خانه شما بخورم.",
    20: "اگه جای تو بودم، خیلی به شدت کار میکردم تا اینکه پول بیشتری را کسب کنم.",
    21: "اگه می دانستم چطور شنا کنم، من سعی می کردم آن مرد را نجات دهم.",
    22: "من کاملاً مطمئن هستم که اگر جنیفر جای تو بود همان کار (وظیفه) را به شیوهٔ ای متفاوت انجام میداد.",
    23: "اگه دوباره زود بروی، رئیس عصبانی خواهد شد. پس اول از او درخواست اجازه کن.",
    24: "اگه آنها آن شغل سخت را به تو پیشنهاد می دادند، آیا آن را قبول میکردی؟",
    25: "اگه آنها عجله نمیکردند در امتحاناتشان موفق میشدند.",
    26: "اگه من به اندازه کافی سیب داشتم یک کیک سیب میپختم",
    27: "من فکر کنم همه چیز درست خواهد شد. اما اگه مشکلی وجود داشت با من تماس بگیر، باشه؟",
    28: "این سوپ خیلی خوب نیست. اگه نمکین نبود، بهتر میشد.",
    29: "اگه هیچ کسی به من کمک نکنه، من دوچرخه را خودم تعمیر خواهم کرد.",
    30: "تو همیشه خسته هستی. اگه خیلی دیر نمی خوابیدی، تو انقدر خسته نمی شدی.",
    31: "از یک هواپیما به بیرون می پریدی اگر یک چتر نجات داشت؟",
    32: "اگر او تجربه کافی برای آن شغل داشت، رئیس می توانست او را استخدام کند.",
    33: "خانه ای شبیه به یک کاخ می خریدم اگر مرد پولداری بودم اما من فقیر هستم.",
    34: "اگر من می توانستم خیلی خوب انگلیسی صحبت کنم، دنبال شغلی در شرکت های خارجی می گشتم.",
    35: "اگر مجبور نبودم کار کنم، با تو به پارک تفریحی می آمدم.",
    36: "اگر علی و رضا بزرگتر بودند، آنها در تیم فوتبال ما بازی می کردند.",
    37: "همه آن امتحان را قبول می شدند اگر سوالات به اندازه کافی آسان بودند.",
    38: "اگر او پولدارتر بود، در یک خانه بزرگتر زندگی می کرد.",
    39: "تاکسی دیر کرده است. اگر فرهاد مصاحبه شغلی اش را ازدست بدهد، او صاحب کار جدیدی نخواهد شد.",
    40: "اگر هوا خوب بشه، ما فوتبال بازی خواهیم کرد.",
    41: "کجا زندگی می کردی اگر می توانستی هرجای دنیا زندگی کنی؟",
    42: "اگر علی وقت آزاد کافی برای تمرین کردن داشت، او گیتاریست خوبی می شد.",
    43: "اگر من جای تو بودم، منتظر نمی ماندنم. فوراً می رفتتم.",
    44: "شما شغل بهتری به دست می آوردید اگر می توانستید از یک رایانه استفاده کنید.",
    45: "پدربزرگت می توانست این روزنامه را بهتر بخواند اگر عینکش را زده بود.",
    46: "اگر از من می خواست که با او ازدواج کنم، \"بله\" می گفتم.",
    47: "اگر مادربزرگم سیگار نمی کشید، او خیلی سالمتر می بود.",
    48: "جلوی خیلی از مشکلات سلامتی می توانست گرفته شود اگر مردم بهتر غذا می خوردند. (غذاهای بهتری می خوردند.)",
    49: "اگر شما به من مقداری پول قرض بدهید، من قبل از آخر همین ماه به شما آن را برخواهم گرداند.",
    50: "شما تصادفات خیلی زیادی نمی کردید اگر با دقت بیشتری رانندگی می کردید.",
}

# داوریِ معنایی: سؤال → کلیدِ حرفیِ موردِ انتظار (شرحِ خودِ جزوه + منطقِ شرطی‌ها)
SEMANTIC = {
    1: "c",   # I wouldn't tell — شرطی نوع دوم (were)
    2: "a",   # wouldn't buy — شرطی نوع دوم
    3: "d",   # will / do — شرطی نوع اول (have)
    4: "c",   # didn't have — شرطی نوع دوم (could)
    5: "a",   # would borrow — شرطی نوع دوم (were)
    6: "c",   # didn't eat — شرطی نوع دوم
    7: "c",   # could — شرح: شکل دوم افعال ناقص
    8: "d",   # would — «اگه من جای تو بودم، آن ریسک را نمیکردم»
    13: "d",  # she'll — شرحِ خودِ جزوه: شرطی نوع اول (goes on → will be qualified)
    22: "c",  # were — «if she were you» (شرح: جای was از were)
    26: "a",  # could bake — «یک کیک سیب میپختم»
    30: "b",  # didn't go — میانهٔ wouldn't be (شرطی نوع دوم)
    32: "b",  # had / could — شرطی نوع دوم + توانایی
    33: "b",  # would buy / were — «اما من فقیر هستم»
    40: "c",  # is / will play — شرطی نوع اول؛ شرح: حذفِ b/d/a با استدلالِ خودِ جزوه
    46: "d",  # asked / say — «بله می گفتم» (I'd say yes)
    47: "a",  # didn't / would be — شرح: would/will/could حذف
}

# رسیدهای چاپی (printQuirks) — عینِ چاپ، بدونِ بازچینی
PRINT_QUIRKS = {
    1: "«به تو» دوبار در یک جمله («من به تو هیچ چیزی در مورد او به تو نمیگفتم») — عینِ چاپ",
    3: "«باغ بزرگی» + «چکار میکردی؟» — عینِ چاپ",
    7: "«می توانستی» پس از «چطور» — عینِ چاپ (خوانشِ اولیهٔ «مینواستی» با زومِ ۱۳۰۰dpi رد شد)",
    10: "ناسازگاریِ درون‌جزوه‌ای: شرح دربارهٔ rice/tonight است اما خطِ ترجمه دربارهٔ ترکِ سیگار — عینِ چاپ (الگوی printErrata r309)",
    11: "«کنه،و» چسبیده (ویرگول بدونِ فاصله) — عینِ چاپ",
    16: "پایان با «؟» بدونِ نقطه و بدونِ «اسباب بازی» در برابرِ ساقه (new toy car → ماشین بزرگ) — عینِ چاپ",
    22: "«کاملاً» با لِن، «(وظیفه)» داخلِ پرانتز، «شیوهٔ ای» — عینِ چاپ",
    26: "بدونِ نقطهٔ پایانی (بسته با گیومه) — عینِ چاپ",
    31: "«می پریدی» با فاصله؛ پایان با «؟» — عینِ چاپ",
    39: "«ازدست» چسبیده (بدونِ فاصله) — عینِ چاپ",
    43: "«نمی ماندنم» و «می رفتتم» (ت دوبل) — عینِ چاپ",
    46: "«بله» با گیومهٔ درونی پس از شکافِ چاپیِ پهن — عینِ چاپ",
    48: "«سلامتی» (لایهٔ fitz «سالمت» می‌دهد — افتِ گلیف) + پرانتزِ پایانی — عینِ چاپ",
}

BANKS = [
    {"lesson": 327, "title": "جمله‌های شرطی — بانک ۱ (ص۹۶)", "page_span": "۹۶", "rng": (1, 18)},
    {"lesson": 328, "title": "جمله‌های شرطی — بانک ۲ (ص۹۶-۹۷)", "page_span": "۹۶-۹۷", "rng": (19, 36)},
    {"lesson": 329, "title": "جمله‌های شرطی — بانک ۳ (ص۹۷-۹۸)", "page_span": "۹۷-۹۸", "rng": (37, 54)},
    {"lesson": 330, "title": "جمله‌های شرطی — بانک ۴ (ص۹۸-۹۹)", "page_span": "۹۸-۹۹", "rng": (55, 72)},
]


def md5(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()


def parse_body():
    """۷۲ سؤال از pdfplumberِ ص۹۶-۹۹ (ماشین r309/r310)."""
    with pdfplumber.open(PDF) as pdf:
        texts = {p: (pdf.pages[p - 1].extract_text() or "") for p in BODY_PAGES}
    qs = []
    for p in BODY_PAGES:
        lines = [l.strip() for l in texts[p].split("\n")]
        i = 0
        while i < len(lines):
            m = STEM_RE.match(lines[i])
            if not m:
                i += 1
                continue
            n = int(m.group(1))
            stem = m.group(2)
            i_stem = i
            while i_stem + 1 < len(lines):
                nxt = lines[i_stem + 1]
                if (
                    STEM_RE.match(nxt)
                    or OPTS_RE.match(nxt)
                    or re.search(r"[\u0600-\u06FF]", nxt)
                    or nxt == ""
                ):
                    break
                stem += " " + nxt
                i_stem += 1
            k = i_stem + 1
            if k >= len(lines) or not OPTS_RE.match(lines[k]):
                raise ValueError(f"گزینه‌های سؤال {n} (ص{p}) پیدا نشد")
            joined = OPTS_RE.match(lines[k]).group(1)
            kk = k
            while kk + 1 < len(lines) and not re.search(
                r"(?:^|\s)d\.\s+\S.*$", joined
            ) and not STEM_RE.match(lines[kk + 1]):
                joined += " " + lines[kk + 1]
                kk += 1

            def parse_options(s):
                parts = re.split(r"(?:^|\s)([a-d])\.\s+", "a. " + s)
                vals = [parts[j].strip() for j in range(2, len(parts), 2)]
                letters = [parts[j] for j in range(1, len(parts), 2)]
                assert letters == ["a", "b", "c", "d"], f"حروف گزینه ناقص: {letters}"
                return vals

            qs.append({"n": n, "page": p, "raw_stem": stem, "options": parse_options(joined)})
            i = kk + 1
    qs.sort(key=lambda q: q["n"])
    nums = [q["n"] for q in qs]
    assert nums == list(range(1, 73)), f"توالیِ بدنه شکسته: {len(nums)} آیتم"
    return qs


def normalize_stem(stem: str) -> str:
    s = BLANK_CLUSTER.sub("-" * 20, stem)
    s = re.sub(r"([A-Za-z0-9])(-{5,})", r"\1 \2", s)
    s = re.sub(r"(-{20})(?=[A-Za-z0-9'\u201c\"])", r"\1 ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s


def keys_pass_a():
    """ریجکسِ آینه‌ای روی pdfplumberِ ص۲۰۷-۲۱۰."""
    out = {}
    with pdfplumber.open(PDF) as pdf:
        for p in KEY_PAGES:
            t = pdf.pages[p - 1].extract_text() or ""
            for m in KEY_A.finditer(t):
                letter, num = m.group(1), m.group(2)
                n = int(num)
                if 1 <= n <= 50:
                    out.setdefault(n, letter.lower())
    return out


def keys_pass_b():
    """ریجکسِ جهتِ طبیعی روی g12.txt ص۲۰۷-۲۱۰."""
    raw = open(TXT, encoding="utf-8").read()
    pages = {}
    for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
        start = m.end()
        nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
        end = start + nxt.start() if nxt else len(raw)
        pages[int(m.group(1))] = raw[start:end]
    out = {}
    for p in KEY_PAGES:
        for num, letter in KEY_B.findall(pages.get(p, "")):
            n = int(num)
            if 1 <= n <= 50:
                out.setdefault(n, letter.lower())
    return out


def keys_pass_c():
    """fitz بلوک‌به‌بلوکِ لنگری: کلیدِ حرف از بلوکِ هر آیتم (۱-۵۰)."""
    doc = fitz.open(PDF)
    out = {}
    for p in KEY_PAGES:
        page = doc[p - 1]
        d = page.get_text("dict")
        ymax = 842
        if p == 210:
            ymax = GRID_START_Y
        rows = []
        for blk in d["blocks"]:
            for ln in blk.get("lines", []):
                txt = "".join(sp["text"] for sp in ln["spans"]).strip()
                m = re.match(r"^(\d{1,2})\s*-?\s*$", txt) or re.match(
                    r"^(\d{1,2})\s*-\s*گزینه", txt
                )
                if m:
                    y = min(sp["bbox"][1] for sp in ln["spans"])
                    if 8 < y < ymax:
                        rows.append((y, int(m.group(1))))
        rows.sort()
        # گروه‌بندیِ توکن‌ها به بلوک با شکافِ >۳۰pt (لنگرهای دو-تکه و سرگردان‌های نزدیک ادغام می‌شوند)
        blocks = []
        for y, n in rows:
            if blocks and y - blocks[-1][0] < 30:
                blocks[-1][1].add(n)
                blocks[-1][2] = max(blocks[-1][2], y)
            else:
                blocks.append([y, {n}, y])
        # تطبیقِ ترتیبی: شمارهٔ موردِ انتظار در توکن‌های بلوک، یا ارقامِ دو-تکه‌اش (۳۰ = {۳،۰})
        first = PAGE_FIRST_ITEM[p]
        expected = first
        picked = []
        for y0, vals, _y2 in blocks:
            if expected > 50:
                break
            split = {expected // 10, expected % 10} if expected >= 10 else None
            if expected in vals or (split is not None and vals <= split and split <= vals | vals):
                picked.append((expected, y0))
                expected += 1
        if p in (208, 209, 210):
            assert picked and picked[0][0] == first and picked[0][1] < 30, (
                f"ص{p}: بلوکِ سرصفحه‌ایِ {first} یافت نشد: {picked[:2]}"
            )
        for bi, (n, y0) in enumerate(picked):
            y1 = picked[bi + 1][1] - 2 if bi + 1 < len(picked) else ymax
            clip = fitz.Rect(0, max(0, y0 - 4), 612, y1)
            btxt = page.get_text(clip=clip)
            km = KEY_FITZ.search(btxt)
            if not km:
                raise ValueError(f"Pass C: کلیدِ بلوکِ {n} (ص{p}) یافت نشد")
            out[n] = km.group(1).lower()
    assert len(out) == 50, f"Pass C: {len(out)} بلوک"
    return out


def keys_pass_d_grid():
    """گریدِ ۵۱-۷۲: جفت‌سازیِ مستقیمِ fitz (r308) در برابرِ رونویسیِ چشمی."""
    doc = fitz.open(PDF)
    page = doc[209]
    t = page.get_text(clip=fitz.Rect(0, GRID_START_Y, 612, 842))
    toks = re.findall(r"(?:^|\s)([a-dA-D]|\d{1,2})(?=\s|$)", t)
    pairs = {}
    i = 0
    while i + 1 < len(toks):
        a, b = toks[i], toks[i + 1]
        if a.isdigit() and b in "abcd":
            n, l = int(a), b
        elif a in "abcd" and b.isdigit():
            n, l = int(b), a
        else:
            i += 1
            continue
        if 51 <= n <= 72:
            pairs.setdefault(n, l.lower())
            i += 2
        else:
            i += 1
    assert set(pairs) == set(range(51, 73)), f"گریدِ fitz ناقص: {sorted(pairs)}"
    bad = {n: (pairs[n], GRID_VISUAL[n]) for n in pairs if pairs[n] != GRID_VISUAL[n]}
    assert not bad, f"گرید: ناهم‌خوانیِ fitz/چشمی: {bad}"
    return pairs


def main():
    before = md5(OUT)
    data = json.load(open(OUT, encoding="utf-8"))

    # ۱) بدنه
    qs = parse_body()
    print(f"بدنه: {len(qs)} سؤال از ص{BODY_PAGES}")

    # ۲) داوریِ چهارلایهٔ کلید
    a, b, c = keys_pass_a(), keys_pass_b(), keys_pass_c()
    grid = keys_pass_d_grid()
    keys = {}
    conflicts = []
    gaps = []
    for n in range(1, 51):
        votes = {k: x.get(n) for k, x in (("A", a), ("B", b), ("C", c))}
        cast = {k: v for k, v in votes.items() if v}
        if len(set(cast.values())) != 1 or len(cast) < 2:
            conflicts.append((n, votes))
        if len(cast) < 3:
            gaps.append((n, [k for k, v in votes.items() if not v]))
        keys[n] = c[n]
    if gaps:
        print(f"هشدار: رأیِ نیاوردنِ برخی لایه‌ها (رسید): {gaps}")
    for n, l in grid.items():
        keys[n] = l
    assert len(keys) == 72
    if conflicts:
        sys.exit(f"FATAL: ناهم‌خوانیِ Pass A/B/C: {conflicts}")
    print("کلید: ۵۰ بلوکِ توضیحی سه‌صدا + گریدِ ۲۲تاییِ دوصدا ✓")

    # ۳) داوریِ معنایی
    for n, want in SEMANTIC.items():
        got = keys[n]
        if got != want:
            q = qs[n - 1]
            sys.exit(
                f"FATAL: semantic {n}: انتظار {want}، کلید {got} — «{q['raw_stem'][:60]}»"
            )
    print(f"داوریِ معنایی: {len(SEMANTIC)} لنگر ✓")

    # ۴) خلوصِ بدنه
    for q in qs:
        assert len(set(q["options"])) == 4, f"گزینهٔ تکراری در {q['n']}"
        assert not re.search(r"[\u0600-\u06FF]", q["raw_stem"] + " ".join(q["options"])), q["n"]
    dist = {}
    for n in range(1, 73):
        dist[keys[n]] = dist.get(keys[n], 0) + 1
    print(f"توزیعِ کلید: {dict(sorted(dist.items()))}")

    # ۵) dup-hunt: برخوردِ ساقه با بانک‌های موجود
    def norm(s):
        s = re.sub(r"-+", " ", s)
        s = re.sub(r"[^\w\s]", " ", s)
        return " ".join(s.lower().split())

    new_norm = {norm(q["raw_stem"]) for q in qs}
    hits = []
    for les in data["lessons"]:
        if les["lesson"] in (327, 328, 329, 330):
            continue  # بانک‌های خودِ این راند — مقایسه فقط با بانک‌های پیشین
        for q in les.get("questions", []):
            if norm(q.get("question", "")) in new_norm:
                hits.append(q.get("id"))
    assert not hits, f"dup-hunt: برخورد با {hits}"
    print("dup-hunt: صفر برخورد ✓")

    # ۶) تزریقِ idempotent — ۴ بانک × ۱۸
    existing = {l["lesson"] for l in data["lessons"]}
    changed = 0
    for b in BANKS:
        lo, hi = b["rng"]
        items = []
        for q in qs[lo - 1 : hi]:
            n = q["n"]
            items.append(
                {
                    "id": f"g12-cond-{n}",
                    "n": n,
                    "type": "mcq",
                    "question": normalize_stem(q["raw_stem"]),
                    "options": q["options"],
                    "answer": LETTER[keys[n]],
                    **({"translation": TRANSLATIONS[n]} if n in TRANSLATIONS else {}),
                }
            )
        if b["lesson"] in existing:
            les = [l for l in data["lessons"] if l["lesson"] == b["lesson"]][0]
            les.pop("source", None)  # رسید فقط در bank.source — الگوی r310
            if (
                les.get("questions") != items
                or les.get("title") != b["title"]
                or les.get("count") != 18
                or not les.get("level")
            ):
                les["questions"] = items
                les["title"] = b["title"]
                les["count"] = 18
                les["level"] = "آموزشی و کنکوری — سرصفحهٔ خود جزوه"
                changed += 1
        else:
            data["lessons"].append(
                {
                    "lesson": b["lesson"],
                    "title": b["title"],
                    "count": 18,
                    "level": "آموزشی و کنکوری — سرصفحهٔ خود جزوه",
                    "questions": items,
                }
            )
            changed += 1

    # ۷) رسیدِ منبع
    src = data.setdefault("source", {})
    src["condSentences"] = {
        "round": "r314",
        "title": "۷۲ تست آموزش گرامر «جملات شرطی» و کنکوری",
        "bodyPages": "96-99",
        "keyPages": "207-210 (بلوکِ توضیحیِ ۱-۵۰ + گریدِ «پاسخنامه کلیدی بقیهٔ تست‌های جملات شرطی» برای ۵۱-۷۲)",
        "printedHeader": "سربرگِ خودِ جزوه: «پاسخنامه 72 تست آموزش گرامر جملات شرطی و کنکوری (صفحه: 96 تا 99)» — ابهامِ «ص۱۰۶-۱۱۰؟» handoff r313 را حل کرد",
        "items": 72,
        "translated": 50,
        "honestAbsence": "آیتم‌های ۵۱-۷۲ گریدِ خالص‌اند (بدونِ خطِ ترجمهٔ چاپی) — الگوی r278",
        "method": (
            "بدنه: pdfplumber (ماشین r309/r310)؛ کلید: داوریِ چهارلایه (pdfplumber-آینه‌ای + "
            "g12.txt + fitz بلوک‌به‌بلوکِ لنگری + گریدِ دوصدا)؛ ترجمه‌ها: رونویسیِ چشمیِ "
            "۶۰۰-۱۴۰۰dpi (الگوی r313 — لایه‌های متنی فارسیِ خراب می‌دهند)."
        ),
        "printQuirks": PRINT_QUIRKS,
        "banks": "۴ بانک × ۱۸ (l327..l330، ids g12-cond-1..72)",
    }

    if changed:
        json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        open(OUT, "a", encoding="utf-8").write("\n")

    after1 = md5(OUT)
    json.dump(json.load(open(OUT, encoding="utf-8")), open("/tmp/r314-idem.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open("/tmp/r314-idem.json", "a", encoding="utf-8").write("\n")
    after2 = md5("/tmp/r314-idem.json")

    total = sum(len(l["questions"]) for l in data["lessons"])
    washed = sum(
        1
        for l in data["lessons"]
        if l["lesson"] in (327, 328, 329, 330)
        for q in l["questions"]
        if q.get("translation")
    )
    print(f"OK: changed={changed} washed={washed}/50 total_lessons={len(data['lessons'])} total_items={total}")
    print(f"idempotent={after1 == after2}  md5 before={before} after={after1}")


if __name__ == "__main__":
    main()
