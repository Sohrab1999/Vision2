#!/usr/bin/env python3
r"""jozve-g12-connectives-r286.py — بانک‌های «کلمات ربط» دوازدهم (۴۰ تست)

خانوادهٔ A (درس ۱۳ — ۲۰ آیتم، ص۴۸، پاسخ تایپی): «تمرین دستگریم: برای هر یک از
  جاهای خالی در جملات مرکب زیر، مناسب‌ترین "کلمه ربط" را بنویسید (پاسخنامه صفحه 192)» —
  کلید توضیحیِ ترجمه‌دار ص۱۹۲ (۱-(but) ترجمه: ...) — دومین بانکِ kind=typed اپ.
خانوادهٔ B (درس ۱۴ — ۲۰ تست، ص۴۹): «20 تست کلمات ربط — سطح تستها: استاندارد و متوسط
  (پاسخنامه وسط صفحه192)» — کلید گرید ستونی چاپی در انتهای ص۱۹۲ (جفت‌های
  (حرف،عدد) خط‌به‌خط جدا — الگوی r283/r284).

نکته‌های چاپی:
- Q2 ص۴۸: خالیِ چندتکهٔ شکسته در OCR («-----
--
------») — ادغامِ MERGE_BLANKS (الگوی r282).
- Q5 ص۴۸: ساقهٔ دوخطی («tennis,\n----------------  ping- pong.»).
- گزینهٔ «Where» با W بزرگ در Q11 ص۴۹ — وفادار به چاپ.
- ترجمه‌های چاپی ص۱۹۲ OCR مخدوش دارند (شگرم کننده/بهی ه/خوایه) — رسید بازسازیِ خوانا
  ثبت می‌شود (الگوی r285، نه OCR خام).
خروجی: درس‌های ۱۳/۱۴ در public/jozve/grammar-g12-topic.json (خانوادهٔ موضوعی r280-r285).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

PERSIAN = re.compile(r"[\u0600-\u06FF]")
BLANK = "-" * 15

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

SKIP = re.compile(
    r"^\s*(\d+\s*"
    r"|\"?جزوه\s*"
    r"|جام ــع.*|جامع.*"
    r"|زبان انگل.*"
    r"|پایه دو ازدهم.*|پایه دوازدهم.*"
    r"|“Vision Three”.*|\"Vision Three\".*"
    r"|تألیـــف.*|تألیف.*"
    r"|\"جمـــــال.*|جمال احمدی.*|همکاران\"?.*"
    r")\s*$"
)

# ---------------- خانوادهٔ A (ص۴۸): ۲۰ ساقهٔ تایپی ----------------
NUM_LINE = re.compile(r"^(\d{1,2})\s*\.\s+(.+)$")

def norm_stem(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([.,?!])", r"\1", s)  # «books .» فاصلهٔ پیش از نقطه — آرتیفکت OCR
    s = re.sub(r"-{4,}", BLANK, s)        # خالی کانونی یکنواخت (الگوی r285)
    return s

def parse_typed_stems():
    lines = [l.strip() for l in pages[48].split("\n") if l.strip() and not SKIP.match(l.strip())]
    # شروع: بعد از سرصفحهٔ تمرین
    start = next(i for i, l in enumerate(lines) if "1." in l and "reads magazines" in l)
    # پایان: سرِ بلوک «Note:» (خط ':' و خط 'Note' جدا چاپ شده‌اند)
    end = next(i for i, l in enumerate(lines) if l == "Note")
    questions = {}
    cur_n, cur_text = None, None
    next_n = 1

    def flush():
        nonlocal cur_n, cur_text
        if cur_n is not None:
            # MERGE_BLANKS — تکه‌های خالیِ مجاور حتی کوتاه («----- -- ------» ص۴۸ Q2)
            merged = re.sub(r"\s*(?:-{2,}\s*)+", " " + BLANK + " ", cur_text)
            questions[cur_n] = norm_stem(merged)
        cur_n, cur_text = None, None

    for ln in lines[start:end]:
        ms = NUM_LINE.match(ln)
        if ms and int(ms.group(1)) == next_n:  # «انتظارِ عددِ بعدی» — الگوی r281
            flush()
            cur_n, cur_text = int(ms.group(1)), ms.group(2)
            next_n += 1
        elif cur_n is not None and not PERSIAN.search(ln) and not ms:
            # ادامهٔ ساقه یا تکه‌های خالی شکسته — فقط خطِ زبالهٔ «:» رد
            if ln != ":":
                cur_text += " " + ln
    flush()
    return questions

# ---------------- کلید تایپی ص۱۹۲: (N, حرف) + رسید ترجمه ----------------
def parse_typed_key():
    # ناحیه: از سرصفحهٔ پاسخنامهٔ دستگریم تا «پاسخنامه کلیدی» گرید
    raw192 = pages[192]
    a = raw192.find("تمرین")
    b = raw192.find("نامه کلیدی")  # «پاسخنامه» در OCR شکسته است (پاس خـ/نامه کلیدی)
    region = raw192[a:b]
    items = {}
    # الگو: عدد - ( حرف ) ترجمه : " ..." — کوت می‌تواند وارونه چاپ شود («ترجمه" :» — Q4)
    # و کوتِ پایانی می‌تواند در OCR افتاده باشد (Q3) — لنگرِ شروعِ آیتم + برش تا لنگرِ بعدی (الگوی r281)
    anchor = re.compile(r"(\d{1,2})\s*-\s*\(\s*([a-z]+)\s*\)\s*ترجمه")
    marks = [(int(ms.group(1)), ms.group(2), ms.start(), ms.end()) for ms in anchor.finditer(region)]
    for i, (n, key, s0, e0) in enumerate(marks):
        seg = region[e0 : marks[i + 1][2] if i + 1 < len(marks) else len(region)]
        # ترجمه = سگمنتِ پالایش‌شده (کوت/خط‌تیرهٔ جداکننده/فاصله حذف — جفتِ کوت قابل اعتماد نیست: Q3 کوتِ پایانی ندارد)
        tr = re.sub(r"[-\u2500\u2013\u2014]+", " ", seg)
        tr = tr.replace('"', " ").replace("«", " ").replace("»", " ")
        tr = re.sub(r"\s+", " ", tr).strip(" :.")
        tr = re.sub(r"(?:^|\s)[\u0600-\u06FF](?=\s|$)", " ", tr).strip(" .:،")  # بقایای تک‌حرفی (« ج »)
        items[n] = (key, tr)
    return items

# ---------------- رسیدهای ترجمهٔ بازسازیِ خوانا (الگوی r285) ----------------
# ترجمه‌های چاپی ص۱۹۲ در OCR مخدوش‌اند (شگرم کننده/بهی ه/خوایه/میر نم) —
# نسخهٔ خوانای وفادار به چاپ برای UI؛ استخراجِ OCR بالا فقط اثباتِ وجودِ ترجمه + کلیدهاست.
TRANSLATIONS = {
    1: "او روزنامه می‌خواند، اما دوست ندارد کتاب بخواند.",
    2: "بازی فوتبال در پارک در فصل زمستان هیجان‌انگیز است، اما در گرمای تابستان بهتر است.",
    3: "من هر یکشنبه به پارک می‌روم، چون دوست دارم اردک‌ها را در دریاچه تماشا کنم.",
    4: "من به مهمانی رفتم و از آن لذت بردم.",
    5: "او نه تنیس را دوست دارد و نه پینگ‌پونگ؛ صادقانه بگویم، او فقط فوتبال را دوست دارد.",
    6: "نه وظیفهٔ من بود و نه او؛ فقط وظیفهٔ علی بود که اتاق را تمیز کند.",
    7: "چای دوست داری یا قهوه؟",
    8: "این سوپ گرم و خوشمزه است.",
    9: "بهترین دوستم و خانواده‌اش اهل اسپانیا هستند.",
    10: "من می‌خواهم بروم بخوابم، بنابراین دارم دندان‌هایم را مسواک می‌کنم.",
    11: "آنها خیلی فقیر هستند؛ نه تلویزیون دارند و نه رادیو.",
    12: "ما باید به سینما برویم یا در خانه بمانیم.",
    13: "من همیشه کتابی برای خریدن می‌خرم، با وجود این به نظر نمی‌رسد حتی یک صفحه از آن را ورق بزنم.",
    14: "او خیلی جوان است، با وجود این خیلی باتجربه است.",
    15: "او هر بعدازظهر به باشگاه تنیس می‌رود، چون عاشق تنیس بازی کردن است.",
    16: "او به مدرسه نیامد، چون مریض بود.",
    17: "ما از فیلم خسته شدیم، بنابراین سینما را ترک کردیم.",
    18: "صندلی دیگری موجود نبود، بنابراین مجبور بودی بایستی.",
    19: "من هر جمعه به پارک می‌روم و به آواز خواندن پرندگان گوش می‌دهم.",
    20: "او شنا کردن را دوست دارد، اما نمی‌داند چطور شنا کند.",
}

# ---------------- کلید گرید ص۱۹۲: جفت‌های (حرف، عدد) خط‌جدا ----------------
def parse_grid_key():
    raw192 = pages[192]
    b = raw192.find("نامه کلیدی")  # «پاسخنامه» در OCR شکسته است (پاس خـ/نامه کلیدی)
    region = raw192[b:]
    region = region.split("<<<PAGE")[0]
    toks = re.findall(r"(?:^|\s)([a-d])(?=\s|$)|(?<![\w])([1-9]|1[0-9]|20)(?![\w])", region)
    seq = []
    for letter, number in toks:
        if letter:
            seq.append(("L", letter))
        elif number:
            seq.append(("N", int(number)))
    pairs = {}
    i = 0
    while i < len(seq) - 1:
        if seq[i][0] == "L" and seq[i + 1][0] == "N":
            n = seq[i + 1][1]
            if 1 <= n <= 20 and n not in pairs:
                pairs[n] = seq[i][1]
            i += 2
        else:
            i += 1
    return pairs

# ---------------- خانوادهٔ B (ص۴۹): ۲۰ تست MCQ تک‌خطی ----------------
OPTS_LINE = re.compile(r"a\.\s+(.+?)\s+b\.\s+(.+?)\s+c\.\s+(.+?)\s+d\.\s+(.+?)\s*$")

def parse_mcq():
    lines = [l.strip() for l in pages[49].split("\n") if l.strip() and not SKIP.match(l.strip())]
    questions = {}
    cur_n, buf = None, ""
    next_n = 1

    def try_extract(text):
        ms = OPTS_LINE.search(text)
        if not ms:
            return None
        stem = norm_stem(text[: ms.start()])
        opts = [norm_stem(o) for o in ms.groups()]
        return stem, opts

    for ln in lines:
        if not re.search(r"[A-Za-z]", ln):
            continue
        ms = NUM_LINE.match(ln)
        if ms and int(ms.group(1)) == next_n:
            # بستنِ سؤال قبلی اگر بافر معلق مانده (نباید رخ دهد — گارد پایین)
            if cur_n is not None:
                raise AssertionError(f"Q{cur_n} بدون گزینه بسته نشست: {buf!r}")
            cur_n, buf, next_n = int(ms.group(1)), ms.group(2), next_n + 1
        elif cur_n is not None:
            buf += " " + ln
        ext = try_extract(buf) if cur_n is not None else None
        if ext:
            questions[cur_n] = ext
            cur_n, buf = None, ""
    if cur_n is not None:
        raise AssertionError(f"Q{cur_n} بدون گزینه ماند: {buf!r}")
    return questions

# ---------------- داربست‌های تایپی: از استخرِ ۷ حرفِ ربطِ خود درس ----------------
POOL = ["but", "and", "or", "so", "for", "nor", "yet"]
SCAFFOLDS = {
    1: ["and", "or", "so"],
    2: ["so", "and", "or"],
    3: ["but", "so", "and"],
    4: ["but", "so", "or"],
    5: ["or", "but", "and"],
    6: ["or", "but", "so"],
    7: ["and", "but", "so"],
    8: ["but", "or", "so"],
    9: ["but", "or", "so"],
    10: ["but", "and", "or"],
    11: ["or", "and", "but"],
    12: ["and", "but", "so"],
    13: ["so", "but", "and"],
    14: ["so", "but", "or"],
    15: ["so", "and", "but"],
    16: ["so", "but", "and"],
    17: ["but", "and", "or"],
    18: ["but", "and", "or"],
    19: ["so", "but", "or"],
    20: ["and", "so", "or"],
}

def main():
    stems = parse_typed_stems()
    tkey = parse_typed_key()
    grid = parse_grid_key()
    mcq = parse_mcq()

    # ---- رسیدها ----
    assert len(stems) == 20, f"stems={len(stems)}"
    assert len(tkey) == 20, f"tkey={len(tkey)}"
    assert len(grid) == 20 and sorted(grid) == list(range(1, 21)), f"grid={sorted(grid)}"
    assert len(mcq) == 20, f"mcq={len(mcq)}"

    # قفل‌های معنایی تایپی — هم‌خوانی حسی ساقه با کلید چاپی
    TYPE_LOCKS = {
        1: ("but", "reads magazines"),
        3: ("for", "every Sunday"),
        5: ("nor", "doesn’t like tennis"),
        10: ("so", "brushing my teeth"),
        13: ("yet", "never seem to turn a single page"),
        16: ("for", "she was ill"),
        20: ("but", "doesn’t know how to swim"),
    }
    for n, (key, frag) in TYPE_LOCKS.items():
        assert tkey[n][0] == key, f"tkey Q{n}={tkey[n][0]}!={key}"
        assert frag in stems[n], f"stem Q{n} فاقد {frag!r}: {stems[n]!r}"
    # اثباتِ وجودِ ترجمهٔ چاپی برای هر ۲۰ آیتم (سگمنتِ OCR فارسی‌دار و بلند)
    for n in range(1, 21):
        tr_ocr = tkey[n][1]
        assert PERSIAN.search(tr_ocr) and len(tr_ocr) > 12, f"Q{n} ترجمهٔ چاپی نیامد: {tr_ocr!r}"
        assert n in TRANSLATIONS

    # قفل‌های معنایی MCQ — کلید گرید باید با منطق جمله بخواند
    MCQ_LOCKS = {
        1: (1, "so"),    # very long, so it took a long time
        5: (3, "so"),    # studied hard, so they passed
        8: (0, "so"),    # doesn’t like fast food, so she doesn’t eat any
        11: (2, "and"),  # …, and potatoes (فهرست خرید)
        13: (1, "so"),   # teeth hurting, so appointment
        16: (1, "so"),   # not comfortable, so rarely wear
        18: (3, "or"),   # homework, or shower
        20: (0, "so"),   # wanted a novel, so went to book store
    }
    for n, (idx, opt) in MCQ_LOCKS.items():
        assert grid[n] == "abcd"[idx], f"grid Q{n}={grid[n]}!={'abcd'[idx]}"
        assert mcq[n][1][idx] == opt, f"opt Q{n}={mcq[n][1][idx]}!={opt}"

    # خلوص انگلیسی + خالی کانونی تایپی‌ها
    for n, s in stems.items():
        assert not PERSIAN.search(s), f"Q{n} نشت فارسی: {s!r}"
        assert (s.count(BLANK)) == 1, f"Q{n} خالی کانونی ≠ ۱: {s!r}"
        assert s.endswith((".", "?")), f"Q{n} پایان نامعتبر: {s!r}"
    for n, (st, opts) in mcq.items():
        assert not PERSIAN.search(st), f"mcq Q{n} نشت فارسی"
        assert len(set(opts)) == 4, f"mcq Q{n} گزینه تکراری: {opts}"
        assert st.count(BLANK) == 1, f"mcq Q{n} خالی کانونی ≠ ۱: {st!r}"

    # ---- ساخت درس ۱۳ (تایپی) ----
    q13 = []
    for n in range(1, 21):
        key, _tr_ocr = tkey[n]
        wrong = SCAFFOLDS[n]
        assert len(set(wrong)) == 3 and key not in wrong, f"scaffold Q{n}"
        assert all(w in POOL for w in wrong), f"scaffold Q{n} خارج استخر"
        q13.append({
            "id": f"g12-connwrite-{n}",
            "n": n,
            "category": "grammar",
            "kind": "typed",
            "question": stems[n],
            "options": [key] + wrong,
            "answer": 0,
            "accepted": [key],
            "translation": TRANSLATIONS[n],
        })
    lesson13 = {
        "lesson": 13,
        "title": "کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)",
        "level": "آموزشی — ورود آزاد",
        "count": len(q13),
        "questions": q13,
    }

    # ---- ساخت درس ۱۴ (MCQ) ----
    q14 = []
    for n in range(1, 21):
        st, opts = mcq[n]
        ans = "abcd".index(grid[n])
        q14.append({
            "id": f"g12-conn-{n}",
            "n": n,
            "category": "grammar",
            # kind حذف — قرارداد خانواده: غایب یعنی mcq
            "question": st,
            "options": opts,
            "answer": ans,
        })
    lesson14 = {
        "lesson": 14,
        "title": "کلمات ربط — تست استاندارد و متوسط (ص۴۹)",
        "level": "استاندارد و متوسط",
        "count": len(q14),
        "questions": q14,
    }

    # ---- اسپلایس ----
    with open(OUT, encoding="utf-8") as f:
        data = json.load(f)
    lessons = data["lessons"]
    re_run = any(l["lesson"] in (13, 14) for l in lessons)
    lessons[:] = [l for l in lessons if l["lesson"] not in (13, 14)]
    if re_run:
        data["source"].pop("connectives", None)
    lessons.extend([lesson13, lesson14])

    data["source"]["connectives"] = {
        "pages": "48/49",
        "topic": "کلمات ربط همپایه‌ساز (coordinating conjunctions) — دستگرمیِ «بنویسید» + تست استاندارد",
        "questions": 40,
        "keyType": "ص۱۹۲ دو کلید: توضیحیِ ترجمه‌دار دستگریمی (۱-(but) ترجمه…) + گرید ستونیِ ۲۰تایی تست (جفت‌های (حرف،عدد) خط‌جدا — الگوی r283/r284)",
        "translations": "رسید ترجمهٔ چاپی ص۱۹۲ برای هر ۲۰ آیتم تایپی — بازسازی خوانا از OCR مخدوش (شگرم کننده/بهی ه/خوایه؛ الگوی r285)",
        "quirks": "Q2 ص۴۸ خالیِ چندتکهٔ شکسته (MERGE_BLANKS — الگوی r282)؛ Q5 ساقهٔ دوخطی؛ «Where» با W بزرگ در Q11 ص۴۹ وفادار به چاپ؛ «ping- pong» چاپی وفادار ماند",
        "extractedRound": 286,
    }
    # stats بلوکِ رسیدِ r280 — frozen (الگوی r281-r285)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")

    total = sum(l["count"] for l in lessons)
    print(f"OK — lessons 13({len(q13)} typed) + 14({len(q14)} mcq) spliced; "
          f"family now {len(lessons)} banks / {total} tests")
    print("grid:", {k: grid[k] for k in sorted(grid)})
    print("typed keys:", [tkey[n][0] for n in range(1, 21)])
    print("stems sample Q2:", stems[2])
    print("stems sample Q5:", stems[5])
    print("mcq Q11:", mcq[11])

if __name__ == "__main__":
    main()
