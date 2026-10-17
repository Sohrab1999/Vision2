#!/usr/bin/env python3
"""jozve-g11-konkur-vocab-r309.py — بانک واژگان کنکوری درس دوم (ص۵۹) جزوهٔ یازدهم

ادامهٔ مأموریت «استخراج جزوه ها رو ادامه بده» طبق handoff r308:
  - درس ۲۴ (شناسهٔ داخلی): «۲۰ تست استاندارد و کنکوری واژگان درس دوم — پایه یازدهم»
    سؤال‌ها PDF ص۵۹، گریدِ کلیدِ چاپی «Vocabulary Tests (lesson 2)» انتهای ص۱۸۶
    (سربرگِ خودِ بانک ارجاع می‌دهد: «پاسخنامه کلیدی: انتهای صفحه ۱۸۶»).
  - حلقهٔ گمشدهٔ سه‌گانهٔ p21 (l4) / p59 (l24) / p93 (l5) — هر سه «تست واژه/واژگان کنکوری» TOC.
تفاوت ساختاری با r278:
  - گریدِ کلید در g11.json نیست؛ در خودِ PDF (انتهای ص۱۸۶) است — مثل r308 از PDF خوانده می‌شود.
  - جفت‌های گرید «حرف-اول» می‌آیند (a 16 / c 11 / …) نه «شماره-اول» — هر دو جهت پذیرفته می‌شود
    و با گریدِ دومِ مستقل (رونویسیِ دستیِ چاپِ ص۱۸۶) داوری می‌شود.
  - ۶ ساقه با بانک جامع ۳۶۰ مشترک است (l10/l19/l21/l22/l23) — بازاستفادهٔ خودِ جزوه؛
    گاردِ برابریِ بین‌بانکی در tests، رسیدِ آن در source.konkurVocab2.crossBankDuplicates.
  - Q14 چاپِ خودِ جزوه «…the illness form getting worse…» است (تایپوی چاپ، نه OCR —
    جامع l10-17 هم عیناً «form» چاپ کرده) → وفادار به چاپ + رسیدِ printErrata.
ترجمه چاپ نشده → translation اصلاً نمی‌گذاریم (الگوی صادقانهٔ r278).
خروجی: افزودن درس ۲۴ به public/jozve/tests-g11.json (اجرای دوباره = همان نتیجه).
"""
import json
import re

import pdfplumber

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
OUT = f"{ROOT}/public/jozve/tests-g11.json"

LETTER = {"a": 0, "b": 1, "c": 2, "d": 3}

STEM_RE = re.compile(r"^(\d{1,2})\s*\.\s*(\S.*)$")
OPTS_RE = re.compile(r"^a\.\s*(.+)$")
BLANK_CLUSTER = re.compile(r"(?:-{2,}[ ]*){2,}")

# گریدِ دومِ مستقل — رونویسیِ دستی از تصویرِ چاپِ ص۱۸۶ («Vocabulary Tests (lesson 2)»)
SECOND_GRID = {
    1: "b", 2: "a", 3: "d", 4: "b", 5: "b", 6: "a", 7: "a", 8: "d", 9: "d", 10: "c",
    11: "c", 12: "c", 13: "b", 14: "c", 15: "a", 16: "a", 17: "d", 18: "b", 19: "c", 20: "a",
}

# داوریِ معنایی: سؤال → واژهٔ کلیدشده (تأییدِ چشمیِ چاپ ص۵۹)
SEMANTIC = {
    1: "takes", 2: "emotional", 3: "look after", 4: "disease", 5: "emergency",
    7: "details", 10: "physical", 13: "mission", 14: "prevent", 17: "diet",
    19: "blood pressure", 20: "couch potato",
}

# جفت‌های (حرف، شماره) و (شماره، حرف) — گریدِ ص۱۸۶ حرف-اول است
PAIR_LN = re.compile(r"(?<![a-z0-9])([a-d])\s+(\d{1,2})(?![\da-z])")
PAIR_NL = re.compile(r"(?<![\da-z])(\d{1,2})\s+([a-d])(?![a-z])")

LESSON_ID = 24
TITLE = "واژگان کنکوری درس دوم (ص۵۹)"


def parse_key_grid(page_text: str) -> dict[int, str]:
    """گرید «Vocabulary Tests (lesson 2)» را از انتهای ص۱۸۶ می‌خواند.

    لنگرِ لاتینِ چاپی حاکم است (فارسیِ سربرگ در لایهٔ متنِ pdfplumber معکوس می‌آید)؛
    جفت‌ها در این گرید شماره-اول‌اند (1 b 6 a …) ولی هر دو جهت پذیرفته می‌شود.
    """
    anchor = re.search(r"Vocabulary Tests \(lesson 2\)", page_text)
    assert anchor, "لنگرِ «Vocabulary Tests (lesson 2)» در ص۱۸۶ نیست"
    tail = page_text[anchor.end():]
    # سربرگِ فارسی در لایهٔ pdfplumber معکوس است («درس دوم» → «مود سرد») — هر دو جهت + رقمِ صفحهٔ آزمون
    head = page_text[: anchor.start()]
    assert ("درس دوم" in head or "مود سرد" in head) and "59" in head, "سربرگِ درس دوم پیش از گرید نیست"
    keys: dict[int, str] = {}
    for m in PAIR_NL.finditer(tail):
        num, letter = int(m.group(1)), m.group(2)
        if 1 <= num <= 20 and num not in keys:
            keys[num] = letter
    for m in PAIR_LN.finditer(tail):
        letter, num = m.group(1), int(m.group(2))
        if 1 <= num <= 20 and num not in keys:
            keys[num] = letter
    return keys


def parse_questions(page_text: str) -> list[dict]:
    """سؤال‌ها از متن خام ص۵۹: سطر «N. ساقه» + سطر گزینه‌های چهارگانه (ماشین r278)."""
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
        opts = None
        for k in (i + 1, i + 2):
            if k < len(lines):
                om = OPTS_RE.match(lines[k])
                if om:
                    opts = parse_options(om.group(1))
                    i = k
                    break
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
    # فاصلهٔ بلعیده‌شدهٔ «پیش از» خالی (a------- → a -------) — فقط برای ران‌های ≥۵ (مضرسِ درون‌واژه‌ای مثل twenty-first نمی‌گیرد)
    s = re.sub(r"([A-Za-z0-9])(-{5,})", r"\1 \2", s)
    # جایگزینی فضایِ بلعیده‌شده بعد از خالی (ولی نه وقتی علامت سجاوندی می‌آید)
    s = re.sub(r"(-{20})(?=[A-Za-z0-9'\u201c\"])", r"\1 ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s


def main() -> None:
    bank = json.load(open(OUT))

    # — گرید کلید از خود PDF (ص۱۸۶) —
    with pdfplumber.open(PDF) as pdf:
        q_text = pdf.pages[58].extract_text() or ""
        k_text = pdf.pages[185].extract_text() or ""
    keys = parse_key_grid(k_text)
    missing = [n for n in range(1, 21) if n not in keys]
    assert not missing, f"کلیدِ سؤال‌های {missing} در گرید نیست"
    assert len(keys) == 20, f"گرید {len(keys)} کلید دارد نه ۲۰"
    # داوریِ دومِ مستقل: رونویسیِ دستیِ چاپ
    mismatch = {n: (keys[n], want) for n, want in SECOND_GRID.items() if keys[n] != want}
    assert not mismatch, f"گریدِ OCR با رونویسیِ چاپی می‌خواند نیست: {mismatch}"

    # — سؤال‌ها از ص۵۹ —
    raw = parse_questions(q_text)
    assert len(raw) == 20, f"{len(raw)} سؤال گرفتم نه ۲۰"
    assert [q["n"] for q in raw] == list(range(1, 21)), "شماره‌ها ناپیوسته"

    questions = []
    for q in raw:
        stem = normalize_stem(q["raw_stem"])
        assert re.search(r"-{5,}", stem), f"خالی در سؤال {q['n']} نیست: «{stem[:60]}»"
        assert re.search(r"(?:^|\s)-{5,}(?=$|[\s,.!?;:])", stem), f"مرز خالی ناسالم در {q['n']}: «{stem[:70]}»"
        assert len(set(q["options"])) == 4, f"گزینه‌های تکراری در سؤال {q['n']}: {q['options']}"
        assert not re.search(r"[\u0600-\u06FF]", stem + " ".join(q["options"])), f"فارسی در سؤال {q['n']}"
        if q["n"] in SEMANTIC:
            assert q["options"][LETTER[keys[q["n"]]]] == SEMANTIC[q["n"]], (
                f"کلیدِ سؤال {q['n']} معنایی نیست: «{q['options'][LETTER[keys[q['n']]]]}» ≠ «{SEMANTIC[q['n']]}»"
            )
        questions.append(
            {
                "id": f"g11-l{LESSON_ID}-{q['n']}",
                "n": q["n"],
                "category": "vocab",
                "question": stem,
                "options": q["options"],
                "answer": LETTER[keys[q["n"]]],
            }
        )

    # — تزریقِ idempotent —
    bank["lessons"] = [l for l in bank["lessons"] if l["lesson"] != LESSON_ID]
    bank["lessons"].append(
        {"lesson": LESSON_ID, "title": TITLE, "count": len(questions), "questions": questions}
    )
    bank["lessons"].sort(key=lambda l: l["lesson"])

    # — رسیدِ منبع —
    src = bank["source"]
    src["lessons"] = [s for s in src["lessons"] if s.get("lesson") != LESSON_ID]
    src["lessons"].append(
        {
            "lesson": LESSON_ID,
            "questionPages": "59",
            "key": "ص۱۸۶ انتهایی — گرید چاپی «Vocabulary Tests (lesson 2)» (پاسخنامه کلیدی 20 تست واژگان درس دوم، آزمون صفحه ۵۹) (بدون ترجمه)",
        }
    )
    src["lessons"].sort(key=lambda s: s.get("lesson", 0))
    src["konkurVocab2"] = {
        "family": "konkur-vocab-lesson2",
        "printedHeader": "۲۰ تست استاندارد و کنکوری واژگان «درس دوم _ پایه یازدهم» (پاسخنامه کلیدی: انتهای صفحه ۱۸۶)",
        "questionPage": "59",
        "keyGridPage": "186",
        "keyGridAnchor": "Vocabulary Tests (lesson 2)",
        "secondGrid": "رونویسیِ دستیِ چاپِ ص۱۸۶ — با گریدِ OCR داوری شد (تطبیقِ کامل)",
        "printErrata": [
            {
                "q": 14,
                "printed": "the illness form getting worse",
                "why": "تایپوی خودِ چاپ است نه OCR — جامعِ l10-17 هم عیناً «form» چاپ کرده؛ وفادار به چاپ (الگوی ERRATA_DUP ر۲۷۹)، کلیدِ prevent سالم است",
            }
        ],
        "crossBankDuplicates": [
            {"l24q": 7, "twin": "g11-l22-9", "note": "همان ساقه؛ ترتیبِ گزینه‌ها متفاوت — واژهٔ کلید one: details هر دو"},
            {"l24q": 9, "twin": "g11-l22-7", "note": "همان ساقه؛ ترتیبِ متفاوت — واژهٔ کلید: imagine هر دو"},
            {"l24q": 12, "twin": "g11-l21-13", "note": "همان ساقه؛ گزینهٔ d متفاوت (guided/quitted) — واژهٔ کلید: gained هر دو"},
            {"l24q": 13, "twin": "g11-l23-14", "note": "همان ساقه و همان ترتیب — mission هر دو"},
            {"l24q": 14, "twin": "g11-l10-17", "note": "همان ساقه (با همان «form» چاپی) — prevent هر دو"},
            {"l24q": 15, "twin": "g11-l19-7", "note": "همان ساقه — general هر دو"},
        ],
        "extractedRound": "r309",
    }

    json.dump(bank, open(OUT, "w"), ensure_ascii=False, indent=1)

    print("=== r309 RECEIPT — واژگان کنکوری درس دوم (ص۵۹) ===")
    print(f"درس {LESSON_ID} «{TITLE}»: {len(questions)} تست (PDF ص۵۹؛ کلید ص۱۸۶)")
    print(f"گرید کلید: {' '.join(keys[n] for n in range(1, 21))}")
    print("کل بانک: درس‌ها =", [l["lesson"] for l in bank["lessons"]])
    print("جمعِ تست‌ها =", sum(len(l["questions"]) for l in bank["lessons"]))
    print("نمونه Q1:", questions[0]["question"][:80], "| گزینه‌ها:", questions[0]["options"], "| کلید:", questions[0]["answer"])
    print("Q14 (چاپِ وفادار):", questions[13]["question"])


if __name__ == "__main__":
    main()
