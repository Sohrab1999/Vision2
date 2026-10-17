#!/usr/bin/env python3
r"""jozve-g12-s89-r288.py — تکمیل آزمون تشریحی درس اول: بخش‌های ۸/۹ (۱۶ آیتم)

بخش ۸ (درس ۲۲ — ۱۲ آیتم، ص۵۴، پاسخ تایپی): «جملات زیر را با کلمات ربط
  (and, or, but, so) کامل کنید.» — کلید گرید دوسطریِ چاپی ص۱۹۴ (ستون فرد ۱/۳/.../۱۱
  سپس ستون زوج ۲/۴/.../۱۲ — هر ۱۲ روی صفحه).
بخش ۹ (درس ۲۳ — ۴ آیتم، ص۵۴): «متن زیر را با کلمات ربط کامل کنید.» — متنِ پیوستهٔ
  Amin با خالی‌های شماره‌دار چاپی (---N---)؛ کلید فهرست ۴تایی ص۱۹۴.

نکته‌های چاپی:
- استخرِ واژگان هر دو بخش دقیقاً {and, or, but, so} است — داربستِ هر آیتم = سه واژهٔ
  دیگرِ استخر (هیچ داربست بیرون از استخر؛ الگوی r286 با استخرِ بسته).
- توزیع کلید بخش ۸: so۳/and۳/or۳/but۳ — توزیع متوازنِ کامل؛ بخش ۹: هر چهار واژه یک‌بار.
- ساقه‌های بخش ۹ تکه‌های verbatim از خودِ متن‌اند (هر تکه دقیقاً یک خالیِ شماره‌دار).
- کلیدها هر دو با داوریِ معناییِ مستقل دوباره راستی‌آزمایی شدند (EXPECTED زیر).
خروجی: درس‌های ۲۲/۲۳ در public/jozve/grammar-g12-topic.json — آزمون تشریحی کامل می‌شود
(۹ بخش / ۱۱۰ آیتم: ۹۴ r287 + ۱۶ r288).
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"

PERSIAN = re.compile(r"[\u0600-\u06FF]")
BLANK = "-" * 15
POOL = ["and", "or", "but", "so"]

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

NUM_LINE = re.compile(r"^(\d{1,2})\s*\.\s+(.+)$")
KEY_PAIR = re.compile(r"^(\d{1,2})\s*\.\s*(and|or|but|so)\s*$", re.M)


def norm_stem(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([.,?!])", r"\1", s)  # «worm ,» فاصلهٔ پیش از نقطه/ویرگول — آرتیفکت OCR
    s = re.sub(r"-{4,}", BLANK, s)        # خالی کانونی یکنواخت (الگوی r285/r286)
    return s


# ---------------- بخش ۸ (ص۵۴): ۱۲ ساقهٔ «کامل کنید» ----------------
def parse_s8_stems() -> dict:
    p = pages[54]
    anchors = [m.start() for m in re.finditer(r"کامل کنید\s*\(and,\s*or,\s*but,\s*so\)", p)]
    assert len(anchors) == 2, f"لنگرِ «کامل کنید» ص۵۴: {len(anchors)} (انتظار ۲ — بخش ۸ و ۹)"
    region = p[anchors[0]:anchors[1]]
    items = {}
    for line in region.splitlines():
        mm = NUM_LINE.match(line.strip())
        if mm:
            n, text = int(mm.group(1)), mm.group(2)
            assert n not in items, f"شمارهٔ تکراری S8: {n}"
            items[n] = text
    assert sorted(items) == list(range(1, 13)), f"شماره‌های S8: {sorted(items)}"
    return items


# ---------------- بخش ۹ (ص۵۴): متنِ پیوستهٔ Amin ----------------
def parse_s9_passage() -> str:
    p = pages[54]
    anchors = [m.start() for m in re.finditer(r"کامل کنید\s*\(and,\s*or,\s*but,\s*so\)", p)]
    region = p[anchors[1]:]
    # سربرگِ گاربلید «9 .» و خانه‌های خالیِ پاسخِ چاپی («1.» ...) هر دو خطِ عددِ لخت‌اند —
    # حذفِ همهٔ خطوطِ عددِ لخت و بعد برشِ از Amin تا «arrived.» (پایانِ چاپیِ متن)
    lines = [l for l in region.splitlines() if not re.match(r"^\s*\d{1,2}\s*\.\s*$", l)]
    text = norm_stem(" ".join(lines))
    a = text.find("Amin")
    assert a >= 0, "متنِ Amin در ص۵۴ یافت نشد"
    b = text.find("arrived.", a)
    assert b >= 0, "پایانِ چاپیِ متن («arrived.») یافت نشد"
    text = text[a:b + len("arrived.")]
    for n in (1, 2, 3, 4):
        assert f"(---{n}---)" in text, f"خالیِ شماره‌دار {n} در متن نیست"
    assert len(re.findall(r"\(---\d---\)", text)) == 4, "متن باید دقیقاً ۴ خالیِ شماره‌دار داشته باشد"
    return text


# ---------------- کلیدها (ص۱۹۴) ----------------
def parse_keys(page: int, which: int) -> dict:
    p = pages[page]
    anchors = [m.start() for m in re.finditer(r"کامل کنید\s*\(and,\s*or,\s*but,\s*so\)", p)]
    assert len(anchors) == 2, f"لنگرِ «کامل کنید» ص۱۹۴: {len(anchors)}"
    start = anchors[which]
    end = anchors[which + 1] if which + 1 < len(anchors) else min(len(p), start + 900)
    region = p[start:end]
    keys = {}
    for mm in KEY_PAIR.finditer(region):
        n, w = int(mm.group(1)), mm.group(2)
        assert n not in keys, f"کلیدِ تکراری ص۱۹۴ بخش {which}: {n}"
        keys[n] = w
    return keys


# داوریِ معناییِ مستقل (کلیدِ دومِ اعتبارسنجی — وفاداریِ کامل بررسی شد)
EXPECTED_S8 = {1: "so", 2: "and", 3: "so", 4: "or", 5: "or", 6: "and",
               7: "but", 8: "or", 9: "so", 10: "but", 11: "and", 12: "but"}
EXPECTED_S9 = {1: "and", 2: "or", 3: "but", 4: "so"}

# تکه‌های verbatim بخش ۹ — هر تکه دقیقاً یک خالیِ شماره‌دارِ خودش
S9_STEMS = {
    1: "Amin is a student, (---1---) he goes to a school near his house.",
    2: "He can come home by taxi, (---2---) he can come on foot.",
    3: "He usually gets back on time, (---3---) yesterday he came home late because one of his friends got sick,",
    4: "yesterday he came home late because one of his friends got sick, (---4---) Amin waited until his friend’s father arrived.",
}


def scaffold(key: str) -> list:
    wrong = [w for w in POOL if w != key]
    assert len(wrong) == 3 and len(set(wrong)) == 3
    return [key] + wrong


def main() -> None:
    s8 = parse_s8_stems()
    passage = parse_s9_passage()
    k8 = parse_keys(194, 0)
    k9 = parse_keys(194, 1)

    # --- رسیدهای وفاداری ---
    assert len(s8) == 12 and len(k8) == 12, "S8 باید ۱۲ آیتم/کلید"
    assert len(k9) == 4, "S9 باید ۴ کلید"
    assert k8 == EXPECTED_S8, f"کلید S8 با داوریِ معنایی نمی‌سازد: {k8}"
    assert k9 == EXPECTED_S9, f"کلید S9 با داوریِ معنایی نمی‌سازد: {k9}"
    for n, stem in S9_STEMS.items():
        assert stem in passage, f"S9-{n} تکهٔ verbatim متن نیست: {stem!r}"
        assert stem.count(f"(---{n}---)") == 1, f"S9-{n} خالیِ شماره‌دار ≠ ۱"
        assert len(re.findall(r"\(---\d---\)", stem)) == 1, f"S9-{n} خالیِ دیگران هم دارد"
        assert not PERSIAN.search(stem), f"S9-{n} نشت فارسی"
    dist8 = {w: sum(1 for v in k8.values() if v == w) for w in POOL}
    assert dist8 == {"and": 3, "or": 3, "but": 3, "so": 3}, f"توزیع S8: {dist8}"
    dist9 = {w: sum(1 for v in k9.values() if v == w) for w in POOL}
    assert dist9 == {"and": 1, "or": 1, "but": 1, "so": 1}, f"توزیع S9: {dist9}"

    # --- ساخت درس ۲۲ ---
    q22 = []
    for n in range(1, 13):
        stem = norm_stem(s8[n])
        assert stem.count(BLANK) == 1, f"S8-{n} خالی ≠ ۱: {stem!r}"
        assert not PERSIAN.search(stem), f"S8-{n} نشت فارسی"
        q22.append({
            "id": f"g12-dconn-{n}", "n": n, "category": "grammar",
            "kind": "typed", "question": stem,
            "options": scaffold(k8[n]), "answer": 0, "accepted": [k8[n]],
        })
    lesson22 = {"lesson": 22, "title": "تشریحی — کامل کنید: کلمات ربط (ص۵۴)",
                "level": "آموزشی — ورود آزاد", "count": len(q22), "questions": q22}

    # --- ساخت درس ۲۳ ---
    q23 = []
    for n in range(1, 5):
        stem = S9_STEMS[n]
        q23.append({
            "id": f"g12-dcloze-{n}", "n": n, "category": "grammar",
            "kind": "typed", "question": stem,
            "options": scaffold(k9[n]), "answer": 0, "accepted": [k9[n]],
        })
    lesson23 = {"lesson": 23, "title": "تشریحی — متن ۴خالی: کلمات ربط (ص۵۴)",
                "level": "آموزشی — ورود آزاد", "count": len(q23), "questions": q23}

    # --- اسپلایس + provenance ---
    with open(OUT, encoding="utf-8") as f:
        data = json.load(f)
    lessons = data["lessons"]
    re_run = any(l["lesson"] >= 22 for l in lessons)
    lessons[:] = [l for l in lessons if l["lesson"] < 22]
    if re_run:
        data["source"].pop("diagnosticS89", None)
    lessons.extend([lesson22, lesson23])

    data["source"]["diagnostic"]["deferred"] = (
        "بخش‌های ۸/۹ ص۵۴ در r288 استخراج شد — رسیدش در source.diagnosticS89؛ "
        "آزمون تشریحی اکنون کامل است (۹ بخش / ۱۱۰ آیتم)"
    )

    data["source"]["diagnosticS89"] = {
        "pages": "54 (بدنه) + 194 (کلید)",
        "topic": "تکمیل آزمون تشریحی بخش گرامر و نگارش درس اول — بخش‌های ۸/۹: کلمات ربط (and, or, but, so)",
        "questions": 16,
        "keyType": "ص۱۹۴ دو کلید: گرید دوسطریِ ۱۲تایی بخش ۸ (ستون فرد ۱..۱۱ سپس زوج ۲..۱۲ — الگوی ستونیِ r283/r284) + فهرست ۴تایی بخش ۹",
        "typedMode": "kind=typed + accepted؛ داربست = سه واژهٔ دیگرِ استخرِ بستهٔ خودِ بخش (and/or/but/so) — الگوی r286 با استخرِ بسته",
        "passage": "بخش ۹ متنِ پیوستهٔ Amin با خالی‌های شماره‌دار چاپی (---N---) — نخستین بانکِ متنِ ۴خالیِ اپ؛ ساقه‌های ۴گانه تکه‌های verbatim از خودِ متن با دقیقاً یک خالیِ شماره‌دار",
        "keyBalance": "بخش ۸: so۳/and۳/or۳/but۳ — توزیع متوازنِ کاملِ چاپی؛ بخش ۹: هر چهار واژه یک‌بار",
        "translations": "غیبت صادقانه — بدنهٔ آزمون تشریحی ترجمه چاپی ندارد (الگوی r281-r287)",
        "examComplete": "آزمون تشریحی درس اول اکنون ۹ بخش / ۱۱۰ آیتم کامل است (۹۴ r287 + ۱۶ r288) — کلید ص۱۹۳-۱۹۴",
        "extractedRound": 288,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")

    total = sum(l["count"] for l in lessons)
    print(f"OK — lessons 22/23 spliced (16 items); family now {len(lessons)} banks / {total} tests")
    print("S8 dist:", dist8, "| S9 dist:", dist9)
    print("S8 sample Q1:", norm_stem(s8[1]), "->", k8[1])
    print("S9 passage:", passage)
    print("S9 stems:")
    for n, st in S9_STEMS.items():
        print(f"  {n}. {st} -> {k9[n]}")


if __name__ == "__main__":
    main()
