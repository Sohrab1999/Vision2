#!/usr/bin/env python3
"""jozve-g11-supplementary-r278.py — بانک‌های واژگان تکمیلی یازدهم (ص۲۱ + ص۹۳)

ادامهٔ مأموریت «استخراج جزوه‌ها» طبق کارِ اولِ جلسهٔ بعد (worklog r277):
  - درس ۴: «آزمون صفحه ۲۱ — ۲۲تست واژگان درس اول» (بخش دوم، سطح کنکوری)
  - درس ۵: «آزمون صفحه ۹۳ — ۲۰تست واژگان درس سوم» (بخش دوم، سطح استاندارد/کنکوری)
تفاوت ساختاری با r275:
  - سؤال‌ها تک‌خطی و تمیزند (سطر «N. ساقه» + سطر «a. … b. … c. … d. …») — ۲۲×۲ و ۲۰×۲.
  - کلید در سرصفحهٔ ترجمه نیست: گرید چاپی «پاسخنامه کلیدی» در خود g11.json هست
    (c12/sec0 خط ۸۲-۸۴ برای ص۲۱؛ c14/sec0 خط ۷۱-۷۵ برای ص۹۳).
  - ترجمه‌ای چاپ نشده — پس translation اصلاً نمی‌گذاریم (غنی‌سازی بعدی ممکن).
نرمال‌سازی: خالی‌های چندتکهٔ پیچیده‌شده («---- ---- -- ---------») → یک خالی واحد؛
بقیهٔ متن دست‌نخورده. خروجی: افزودن درس ۴/۵ به public/jozve/tests-g11.json.
"""
import json
import re

import pdfplumber

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
G11 = f"{ROOT}/public/jozve/g11.json"
OUT = f"{ROOT}/public/jozve/tests-g11.json"

LETTER = {"a": 0, "b": 1, "c": 2, "d": 3}

STEM_RE = re.compile(r"^(\d{1,2})\s*\.\s*(\S.*)$")
OPTS_RE = re.compile(r"^a\.\s*(.+)$")
# خالیِ چندتکه: دو یا چند قطعهٔ خط‌تیره که فقط با فاصله از هم جدا شده‌اند
BLANK_CLUSTER = re.compile(r"(?:-{2,}[ ]*){2,}")

TARGETS = [
    {
        "lesson": 4,
        "pdfPage": 20,
        "expected": 22,
        "title": "تکمیلی واژگان درس اول (ص۲۱)",
        "chapter": "c12",
        "keyAnchor": re.compile(r"پاسخنامه کلیدی\s*۲?۲?22\s*تست واژگان درس اول|22تست واژگان درس اول"),
        "keyCount": 22,
        "sourcePages": "21",
        "keyNote": "c12/sec0 — گرید چاپی «پاسخنامه کلیدی 22تست واژگان درس اول» (بدون ترجمه)",
    },
    {
        "lesson": 5,
        "pdfPage": 92,
        "expected": 20,
        "title": "تکمیلی واژگان درس سوم (ص۹۳)",
        "chapter": "c14",
        "keyAnchor": re.compile(r"20تست واژگان درس سوم"),
        "keyCount": 20,
        "sourcePages": "93",
        "keyNote": "c14/sec0 — گرید چاپی «پاسخنامه کلیدی 20تست واژگان درس سوم» (بدون ترجمه)",
    },
]

PAIR = re.compile(r"(?<![\da-z])(\d{1,2})\s+([a-d])(?![a-z])")


def parse_key_grid(g11: dict, t: dict) -> dict[int, str]:
    """گرید کلید چاپی را از فصلِ کلیدِ همان جزوه می‌خواند (نه هاردکد)."""
    c = next(x for x in g11["chapters"] if x["id"] == t["chapter"])
    sec = c["sections"][0]
    lines = sec["lines"]
    anchor_idx = next(i for i, l in enumerate(lines) if t["keyAnchor"].search(l))
    keys: dict[int, str] = {}
    j = anchor_idx + 1
    while j < len(lines) and len(keys) < t["keyCount"]:
        line = lines[j]
        if "Note" in line:
            break
        for m in PAIR.finditer(line):
            n, letter = int(m.group(1)), m.group(2)
            if 1 <= n <= t["expected"] and n not in keys:
                keys[n] = letter
        j += 1
    return keys


def parse_questions(page_text: str, t: dict) -> list[dict]:
    """سؤال‌ها را از متن خام PDF می‌کشد: سطر ساقه + سطر گزینه‌های چهارگانه."""
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
        # سطر گزینه‌ها باید بلافاصله (حداکثر یک سطر پرش) بیاید
        opts = None
        for k in (i + 1, i + 2):
            if k < len(lines):
                om = OPTS_RE.match(lines[k])
                if om:
                    opts = parse_options(om.group(1))
                    i = k
                    break
        if opts is None:
            raise ValueError(f"[{t['title']}] گزینه‌های سؤال {n} پیدا نشد: «{stem[:60]}»")
        qs.append({"n": n, "raw_stem": stem, "options": opts})
        i += 1
    return qs


def parse_options(s: str) -> list[str]:
    """«a. x b. y c. z d. w» → ["x","y","z","w"] (مرز: حرف + نقطه در آغاز توکن)."""
    parts = re.split(r"(?:^|\s)([a-d])\.\s+", "a. " + s)
    # parts: ['', 'a', 'x', 'b', 'y', 'c', 'z', 'd', 'w']
    vals = [parts[i].strip() for i in range(2, len(parts), 2)]
    letters = [parts[i] for i in range(1, len(parts), 2)]
    assert letters == ["a", "b", "c", "d"], f"حروف گزینه ناقص: {letters} از «{s[:70]}»"
    return vals


def normalize_stem(stem: str) -> str:
    """خالی‌های چندتکه → یک خالی واحد ۲۰تایی؛ فاصله‌های دوبل فرو می‌ریزند."""
    s = BLANK_CLUSTER.sub("-" * 20, stem)
    # جایگزینی فضایِ بلعیده‌شده بعد از خالی (ولی نه وقتی علامت سجاوندی می‌آید)
    s = re.sub(r"(-{20})(?=[A-Za-z0-9'\u201c\"])", r"\1 ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s


def main() -> None:
    g11 = json.load(open(G11))
    bank = json.load(open(OUT))

    receipts = []
    for t in TARGETS:
        # — گرید کلید از خود جزوه (g11.json) —
        keys = parse_key_grid(g11, t)
        missing = [n for n in range(1, t["expected"] + 1) if n not in keys]
        assert not missing, f"[{t['title']}] کلیدِ سؤال‌های {missing} در گرید نیست"
        assert len(keys) == t["keyCount"], f"[{t['title']}] گرید {len(keys)} کلید دارد نه {t['keyCount']}"

        # — سؤال‌ها از PDF —
        with pdfplumber.open(PDF) as pdf:
            text = pdf.pages[t["pdfPage"]].extract_text() or ""
        raw = parse_questions(text, t)
        assert len(raw) == t["expected"], f"[{t['title']}] {len(raw)} سؤال گرفتم نه {t['expected']}"
        assert [q["n"] for q in raw] == list(range(1, t["expected"] + 1)), "شماره‌ها ناپیوسته"

        questions = []
        for q in raw:
            stem = normalize_stem(q["raw_stem"])
            assert re.search(r"-{5,}", stem), f"خالی در سؤال {q['n']} نیست: «{stem[:60]}»"
            assert re.search(r"(?:^|\s)-{5,}(?=$|[\s,.!?;:])", stem), (
                f"مرز خالی ناسالم در سؤال {q['n']}: «{stem[:70]}»"
            )
            assert len(set(q["options"])) == 4, f"گزینه‌های تکراری در سؤال {q['n']}: {q['options']}"
            assert not re.search(r"[\u0600-\u06FF]", stem + " ".join(q["options"])), f"فارسی در سؤال {q['n']}"
            answer = LETTER[keys[q["n"]]]
            questions.append(
                {
                    "id": f"g11-l{t['lesson']}-{q['n']}",
                    "n": q["n"],
                    "category": "vocab",
                    "question": stem,
                    "options": q["options"],
                    "answer": answer,
                }
            )

        # — درج/جایگزینی در بانک —
        bank["lessons"] = [l for l in bank["lessons"] if l["lesson"] != t["lesson"]]
        bank["lessons"].append(
            {"lesson": t["lesson"], "title": t["title"], "count": len(questions), "questions": questions}
        )
        bank["lessons"].sort(key=lambda l: l["lesson"])

        # — به‌روزرسانی رسانهٔ منبع —
        src = bank.setdefault("source", {}).setdefault("lessons", [])
        src[:] = [s for s in src if s.get("lesson") != t["lesson"]]
        src.append({"lesson": t["lesson"], "questionPages": t["sourcePages"], "key": t["keyNote"]})
        src.sort(key=lambda s: s.get("lesson", 0))

        receipts.append(
            {
                "lesson": t["lesson"],
                "title": t["title"],
                "pdfIndex": t["pdfPage"],
                "count": len(questions),
                "keyGrid": [keys[n] for n in range(1, t["expected"] + 1)],
                "sample": {
                    "q1": questions[0]["question"][:80],
                    "opts1": questions[0]["options"],
                    "ans1": questions[0]["answer"],
                },
            }
        )

    json.dump(bank, open(OUT, "w"), ensure_ascii=False, indent=1)

    print("=== r278 RECEIPT — بانک‌های واژگان تکمیلی یازدهم ===")
    for r in receipts:
        print(f"درس {r['lesson']} «{r['title']}»: {r['count']} تست (PDF ایندکس {r['pdfIndex']})")
        print(f"  گرید کلید: {' '.join(r['keyGrid'])}")
        print(f"  Q1: {r['sample']['q1']}")
        print(f"      {r['sample']['opts1']} → ans={r['sample']['ans1']}")
    total = sum(l["count"] for l in bank["lessons"])
    print(f"جمع بانک یازدهم: {total} تست در {len(bank['lessons'])} درس → {OUT}")


if __name__ == "__main__":
    main()
