#!/usr/bin/env python3
"""jozve-g12-rel-drill-r310.py — دو بانکِ دستگریمی/تخصیصِ «ضمایر موصولی» جزوهٔ دوازدهم

ادامهٔ مأموریت «استخراج جزوه ها رو ادامه بده» — پس از دو کشفِ تکراری (l1-l3 واژگان و
دستگریمی/کنکوریِ گرامرِ یازدهم که r276/r277/r278 برداشته بودند)، خانوادهٔ واقعاً باقی‌مانده:
  - درس ۳۲۵ (شناسهٔ داخلی): «۲۰ تست دستگریمی گرامر ضمایر موصولی» — PDF ص۸۶،
    سطح آموزش/متوسط، پاسخنامهٔ توضیحی ص۲۰۳-۲۰۴ («N - ( گزینهX)» + شرح + ترجمه)
  - درس ۳۲۶: «۱۱ تست مبحث حذف ضمایر موصولی — زبان تخصیص» — PDF ص۸۷،
    سطح کنکور/نسبتاً دشوار، پاسخنامهٔ توضیحی ص۲۰۵-۲۰۶
تزریق به public/jozve/grammar-g12-topic.json (درس‌های ۳۲۵/۳۲۶ — خانوادهٔ g12-rel ص۸۸-۹۱
در l1/l2 همان‌جاست و دست‌نخورده می‌ماند؛ استخراجِ قبلی ص۸۶/۸۷ را نداشت — گارد داور می‌شود).

درس‌های راند (از r309 تأیید شد):
  - لایهٔ pdfplumberِ PDF فارسی را معکوس می‌چیند — حتی پرانتزها (گزینه(d) ← )d( هنیزگ).
  - داوریِ سه‌گانه: Pass A (ریجکس آینه‌ای روی pdfplumber) + Pass B (ریجکسِ طبیعی روی
    booklet-extract/g12.txt) + رونویسیِ چشمیِ چاپ (رندر pdftoppm چهار صفحهٔ کلید).
  - ترجمه‌های چاپی «ترجمه:» به دلیل آشفتگیِ لایهٔ RTL موکول شدند (غیبتِ صادقانهٔ موکول‌شده).
خروجی: افزودن درس‌های ۳۲۵/۳۲۶ (اجرای دوباره = همان نتیجه).
"""
import json
import re

import pdfplumber

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
OUT = f"{ROOT}/public/jozve/grammar-g12-topic.json"
TXT = f"{ROOT}/booklet-extract/g12.txt"

LETTER = {"a": 0, "b": 1, "c": 2, "d": 3}

STEM_RE = re.compile(r"^(\d{1,2})\s*\.\s*(\S.*)$")
OPTS_RE = re.compile(r"^a\.\s*(.+)$")
BLANK_CLUSTER = re.compile(r"(?:-{2,}[ ]*){2,}")

# Pass A — لایهٔ pdfplumberِ معکوس: «)d( هنیزگ -1» (پرانتزها هم معکوس‌اند؛
# خطِ تیرهٔ پیکان گاهی در شکستِ سطر گم می‌شود — «هنیزگ 10» — پس اختیاری است)
KEY_A = re.compile(r"[)(]?\s*([a-dA-D])\s*[)(]?\s*ه\s*ن\s*ی\s*ز\s*گ\s*[-–]?\s*(\d{1,2})")
# Pass B — لایهٔ g12.txt جهتِ طبیعی: «1 - ( گزینهd )» با شکستگی‌های درون‌واژه‌ای
KEY_B = re.compile(
    r"(\d{1,2})\s*[-–]\s*\(?\s*(?:گزینه|گزی\s*نه|گز\s*ینه)\s*\(?\s*([a-dA-D])\s*\)?"
)

# رونویسیِ دستیِ چاپِ چهار صفحهٔ کلید (رندر pdftoppm دیده شد — داوریِ سومِ مستقل)
SECOND = {
    325: {  # ص۲۰۳ + ص۲۰۴
        1: "d", 2: "b", 3: "b", 4: "a", 5: "a", 6: "c", 7: "a", 8: "d", 9: "b", 10: "c",
        11: "a", 12: "d", 13: "a", 14: "b", 15: "c", 16: "b", 17: "d", 18: "a", 19: "a", 20: "d",
    },
    326: {  # ص۲۰۵ + ص۲۰۶
        1: "b", 2: "b", 3: "a", 4: "b", 5: "c", 6: "c", 7: "b", 8: "b", 9: "c", 10: "a", 11: "b",
    },
}

# داوریِ معنایی: سؤال → متنِ دقیقِ گزینهٔ کلیدشده (شرحِ خودِ جزوه پین می‌کند)
SEMANTIC = {
    325: {
        1: "whom",   # شرح: مرجعِ «انسان the teacher» + بعد آن فاعل — نقش مفعولی
    },
    326: {
        1: "examining",   # شرح: بائفاروی — «حذف ضمیر + فعل ing» (گزینهٔ d حذف: who دارد)
        2: "published",   # شرح: مفعول‌حذفی — شکل سوم فعل (which were published)
        3: "taught",      # شرح: مفعول‌حذفی — شکل سوم فعل (which is taught)
    },
}

BANKS = [
    {
        "lesson": 325,
        "id_prefix": "g12-reldrill",
        "title": "ضمایر موصولی — دستگرمی (ص۸۶)",
        "level": "دستگرمی — آموزش / متوسط",
        "body_pages": [86],
        "key_pages": [203, 204],
        "expected": 20,
        "printed_header": "«۲۰ تست دستگریمی گرامر ضمایر موصولی» (سطح: آموزش / متوسط؛ پاسخنامه: ص۲۰۳ و ۲۰۴)",
    },
    {
        "lesson": 326,
        "id_prefix": "g12-relreduce",
        "title": "حذف ضمایر موصولی — زبان تخصیص (ص۸۷)",
        "level": "کنکور — نسبتاً دشوار",
        "body_pages": [87],
        "key_pages": [205, 206],
        "expected": 11,
        "printed_header": "«۱۱ تست مبحث حذف ضمایر موصولی — زبان تخصیص» (سطح: کنکور، نسبتاً دشوار؛ پاسخنامه: ص۲۰۵ و ۲۰۶)",
    },
]


def parse_keys(page_texts: list[str], regex: re.Pattern, mirrored: bool) -> dict[int, str]:
    keys: dict[int, str] = {}
    for t in page_texts:
        for m in regex.finditer(t):
            if mirrored:
                letter, num = m.group(1), m.group(2)
            else:
                num, letter = m.group(1), m.group(2)
            n, l = int(num), letter.lower()
            if n not in keys:
                keys[n] = l
    return keys


def parse_keys_txt(page_nums: list[int]) -> dict[int, str]:
    raw = open(TXT, encoding="utf-8").read()
    pages: dict[int, str] = {}
    for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
        start = m.end()
        nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
        end = start + nxt.start() if nxt else len(raw)
        pages[int(m.group(1))] = raw[start : end]
    keys: dict[int, str] = {}
    for p in page_nums:
        for n, l in KEY_B.findall(pages.get(p, "")):
            n = int(n)
            if n not in keys:
                keys[n] = l.lower()
    return keys


def parse_questions(page_text: str) -> list[dict]:
    lines = [l.strip() for l in page_text.split("\n")]
    qs: list[dict] = []
    i = 0
    while i < len(lines):
        m = STEM_RE.match(lines[i])
        if not m:
            i += 1
            continue
        n = int(m.group(1))
        stem = m.group(2)
        # ساقه‌های چندسطری — تا سطرِ گزینه‌ها پیوند بزن (سطرِ فارسیِ معکوسِ لایهٔ PDF نمی‌پیوندد)
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
        opts = None
        k = i_stem + 1
        if k < len(lines) and OPTS_RE.match(lines[k]):
            joined = OPTS_RE.match(lines[k]).group(1)
            kk = k
            while kk + 1 < len(lines) and not re.search(
                r"(?:^|\s)d\.\s+\S.*$", joined
            ) and not STEM_RE.match(lines[kk + 1]):
                joined += " " + lines[kk + 1]
                kk += 1
            opts = parse_options(joined)
            i = kk
        if opts is None:
            raise ValueError(f"گزینه‌های سؤال {n} پیدا نشد: «{stem[:60]}»")
        qs.append({"n": n, "raw_stem": stem, "options": opts})
        i += 1
    return qs


def parse_options(s: str) -> list[str]:
    parts = re.split(r"(?:^|\s)([a-d])\.\s+", "a. " + s)
    vals = [parts[i].strip() for i in range(2, len(parts), 2)]
    letters = [parts[i] for i in range(1, len(parts), 2)]
    assert letters == ["a", "b", "c", "d"], f"حروف گزینه ناقص: {letters} از «{s[:70]}»"
    return vals


def normalize_stem(stem: str) -> str:
    s = BLANK_CLUSTER.sub("-" * 20, stem)
    s = re.sub(r"([A-Za-z0-9])(-{5,})", r"\1 \2", s)
    s = re.sub(r"(-{20})(?=[A-Za-z0-9'\u201c\"])", r"\1 ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s


def main() -> None:
    bank = json.load(open(OUT))
    needed = sorted({p for b in BANKS for p in b["body_pages"] + b["key_pages"]})
    with pdfplumber.open(PDF) as pdf:
        page_text = {p: (pdf.pages[p - 1].extract_text() or "") for p in needed}
    assert all(page_text.get(p) for p in needed), "لایهٔ متنِ یکی از صفحه‌ها خالی است"

    lessons_out = []
    for b in BANKS:
        les = b["lesson"]
        exp = b["expected"]

        keys_a = parse_keys(
            [page_text[p] for p in b["key_pages"]], KEY_A, mirrored=True
        )
        keys_b = parse_keys_txt(b["key_pages"])
        keys = {n: keys_a.get(n) for n in range(1, exp + 1)}
        missing = [n for n in range(1, exp + 1) if not keys.get(n)]
        assert not missing, f"درس {les}: کلیدِ سؤال‌های {missing} در لایهٔ PDF نیست"
        for n in range(1, exp + 1):
            kb = keys_b.get(n)
            assert kb == keys[n], f"درس {les} س{n}: A={keys[n]} ≠ B={kb}"
            ks = SECOND[les].get(n)
            assert ks == keys[n], f"درس {les} س{n}: استخراج={keys[n]} ≠ رونویسی={ks}"
        dist = {l: sum(1 for v in keys.values() if v == l) for l in "abcd"}
        assert set(dist.values()) != {0}, f"درس {les}: گرید منحط"

        body = "\n".join(page_text[p] for p in b["body_pages"])
        raw = parse_questions(body)
        nums = [q["n"] for q in raw]
        dup = sorted({n for n in nums if nums.count(n) > 1})
        assert not dup, f"درس {les}: شمارهٔ تکراری {dup}"
        assert nums == list(range(1, exp + 1)), f"درس {les}: شماره‌ها {nums} ≠ 1..{exp}"

        questions = []
        for q in raw:
            stem = normalize_stem(q["raw_stem"])
            assert re.search(r"(?:^|\s)-{5,}(?=$|[\s,.!?;:'\u201d\"])", stem), (
                f"مرز خالیِ ناسالم در درس {les} سؤال {q['n']}: «{stem[:70]}»"
            )
            assert len(set(q["options"])) == 4, (
                f"گزینه‌های تکراری در درس {les} سؤال {q['n']}: {q['options']}"
            )
            assert not re.search(r"[\u0600-\u06FF]", stem + " ".join(q["options"])), (
                f"فارسی در درس {les} سؤال {q['n']}"
            )
            ans = LETTER[keys[q["n"]]]
            if q["n"] in SEMANTIC.get(les, {}):
                want = SEMANTIC[les][q["n"]]
                got = q["options"][ans]
                assert got == want, (
                    f"درس {les} سؤال {q['n']}: کلیدِ معنایی نیست — «{got}» ≠ «{want}»"
                )
            questions.append(
                {
                    "id": f"{b['id_prefix']}-{q['n']}",
                    "n": q["n"],
                    "category": "grammar",
                    "question": stem,
                    "options": q["options"],
                    "answer": ans,
                }
            )

        lessons_out.append(
            {
                "lesson": les,
                "title": b["title"],
                "level": b["level"],
                "count": len(questions),
                "questions": questions,
            }
        )
        print(
            f"درس {les} «{b['title']}»: {len(questions)} تست — توزیعِ کلید {dist} — "
            f"سه داوری هم‌خوان"
        )

    # — تزریقِ idempotent —
    bank["lessons"] = [l for l in bank["lessons"] if l["lesson"] not in (325, 326)]
    bank["lessons"].extend(lessons_out)
    bank["lessons"].sort(key=lambda l: l["lesson"])

    # — رسیدِ منبع —
    src = bank["source"]
    src["relDrill"] = {
        "family": "relative-clauses-drill-and-reduction-g12",
        "round": "r310",
        "printedHeaders": {str(b["lesson"]): b["printed_header"] for b in BANKS},
        "questionPages": {str(b["lesson"]): str(b["body_pages"][0]) for b in BANKS},
        "keyPages": {
            str(b["lesson"]): f"{b['key_pages'][0]}-{b['key_pages'][1]}" for b in BANKS
        },
        "keyFormat": "«N - ( گزینهX)» توضیحی + ترجمهٔ تست (چاپِ خودِ جزوه)",
        "arbitration": {
            "passA": "ریجکسِ آینه‌ایِ RTL روی لایهٔ pdfplumber — «( گزینهd)» آنجا «)d( هنیزگ -1» می‌آید",
            "passB": "ریجکسِ جهتِ طبیعی روی لایهٔ booklet-extract/g12.txt (آرتیفکتِ مستقل)",
            "third": "رونویسیِ دستیِ چاپِ چهار صفحهٔ کلید از رندرِ pdftoppm — تطبیقِ کاملِ ۳۱/۳۱",
        },
        "deferredTranslations": (
            "ترجمه‌های چاپیِ «ترجمه:» عمداً درج نشدند: لایهٔ RTL واژه‌ها را می‌شکند "
            "(قبأل/معلیم/…)؛ شست‌وشوی دستی به راندی جداگانه موکول شد."
        ),
        "duplicateHunt": (
            "دو تکرارِ پیش از این بانک کشف و برگشت خورد: (۱) دستگریمی/کنکوریِ گرامرِ یازدهم "
            "= r277 (grammar-g11-konkur.json با ترجمه)، (۲) واژگانِ استانداردِ یازدهم = l1-l3 "
            "tests-g11. درس: پیش از پروب، همهٔ کارت‌های مانیفست (تست/گرامر/کنکوری/موضوعی) "
            "باید شمارش شوند — نه فقط بانکِ موضوعی."
        ),
    }

    json.dump(bank, open(OUT, "w"), ensure_ascii=False, indent=1)

    total = sum(len(l["questions"]) for l in bank["lessons"])
    print("=== r310 RECEIPT — دستگریمی/تخصیصِ ضمایر موصولیِ دوازدهم ===")
    print("آخرین درس‌ها =", [(l["lesson"], len(l["questions"])) for l in bank["lessons"][-3:]])
    print(f"جمعِ بانکِ موضوعیِ دوازدهم = {total} (قبلاً ۱۵۵۶)")
    print("نمونه l325 Q1:", bank["lessons"][-2]["questions"][0]["question"][:70])
    print("نمونه l326 Q1:", bank["lessons"][-1]["questions"][0]["question"][:70])


if __name__ == "__main__":
    main()
