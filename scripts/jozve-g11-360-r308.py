#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r308 — استخراج «آزمون جامع ۳۶۰ تست آموزش واژگان درس ۱ تا ۳ — پایه یازدهم»
منبع: booklet-extract/g11.txt — سؤال‌ها PDF ص۱۱۸-۱۳۵، گرید کلید چاپی «پاسخنامه کلیدی360» PDF ص۲۰۴
خروجی: الحاق ۱۸ بانک (درس ۶..۲۳ × ۲۰ تست) به public/jozve/tests-g11.json
نکتهٔ ساختاری: جزوه شمارهٔ ۲۲۸ را دو بار چاپ کرده (دو سؤالِ متفاوت) — جمعِ فیزیکی ۳۶۱ سؤال؛
بانکِ درسِ ۱۲ (سؤال‌های ۲۲۱-۲۴۰) هر دو «۲۲۸» را می‌گیرد (count=21).
idempotent: اجرای تکراری نتیجهٔ یکسان می‌دهد.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path("/home/z/my-project")
OCR_PATH = ROOT / "booklet-extract/g11.txt"
BANK_PATH = ROOT / "public/jozve/tests-g11.json"

OCR = OCR_PATH.read_text(encoding="utf-8")
LINES = OCR.split("\n")

# ————— ناحیهٔ سؤال‌ها: بین <<<PAGE 118>>> و <<<PAGE 136>>> —————
def page_start(pnum: int) -> int:
    pat = f"<<<PAGE {pnum}>>>"
    for i, l in enumerate(LINES):
        if pat in l:
            return i
    raise SystemExit(f"PAGE {pnum} not found")

Q_START = page_start(118)
Q_END = page_start(136)          # exclusive
KEY_ANCHOR = "پاسخنامه کلیدی360"  # «پاسخنامه کلیدی360» در انتهای فایل

HEADER_NOISE = re.compile(
    r'^(<<<PAGE \d+>>>|\d{1,3}|جزوه|جام ــ?ع?\s*کمک آموزش|زبان انگل'
    r'|پایه یاز|دهم\s*"|"جمـ{2,}ال احـ{2,}دی و همـ{2,}کاران"'
    r'|“Vision Two”|تألیـ{2,}ف و گـ{2,}ردآوری|سـایر منابع|:متـ{2}نوع در کانـال تلـگرایم'
    r'|ID: @|Mob:|با کمال افتخار منتظر|"انتقادات"|و"|"پیشنهادات"|هستم ?\.|تبلیغات|فهرست)'
)

STEM_RE = re.compile(r'^(\d{1,3})\s*[-.،]?\s*(.+)$')

def is_header(line: str) -> bool:
    s = line.strip()
    return bool(s) and bool(HEADER_NOISE.match(s))

def dash_norm(s: str) -> str:
    # فروپاشی فاصله‌های داخلی دور خالی‌ها نه خود خالی‌ها؛ فقط فاصلهٔ چندگانه → تک
    return re.sub(r"[ \t]{2,}", " ", s).strip()

# ————— ۱) برداشت بلوک‌های خام سؤال —————
raw_blocks = []  # (printed_num, [lines])
cur = None
for j in range(Q_START, Q_END):
    line = LINES[j]
    s = line.strip()
    m = STEM_RE.match(s)
    if m:
        n = int(m.group(1))
        rest = m.group(2)
        if 1 <= n <= 360 and (re.search(r"[A-Za-z]{2}", rest) or "----" in rest):
            cur = (n, [rest])
            raw_blocks.append(cur)
            continue
    if cur is not None and not is_header(line):
        cur[1].append(s)
    elif cur is not None and is_header(line) and s.startswith("<<<PAGE"):
        cur = None  # مرز صفحه — سؤالِ جدید باید شمارهٔ جدید بیاورد

print(f"raw blocks: {len(raw_blocks)}")

# ————— ۲) جداسازی ساقه / گزینه‌ها —————
OPT_LETTER = re.compile(r'(?:^|\s)([abcd])\.\s*')
VERT_LETTER = re.compile(r'^([abcd])\.?$')

def parse_block(num: int, lines_):
    """ساقه + چهار گزینه از بلوک خام. الگوها: تک‌ردیفی، دوردیفی، عمودی (Q100)."""
    stem_lines = []
    opt_rows = []
    vert_letters = []   # خط‌های تک‌حرفی عمودی
    vert_words = []     # واژه‌های جفت‌شونده (ترتیبِ چاپ = ترتیبِ حروف)
    mode = "stem"
    for idx, l in enumerate(lines_):
        s = l.strip()
        if not s:
            continue
        if VERT_LETTER.match(s):
            mode = "vert"
            vert_letters.append(s.rstrip("."))
            continue
        if OPT_LETTER.search(" " + s):
            mode = "opts"
            opt_rows.append(s)
            continue
        if mode == "stem":
            stem_lines.append(s)
        elif mode == "opts" and not opt_rows[-1].endswith((".", "?", "!", '"')):
            # ادامهٔ ردیف گزینهٔ شکسته (نادر)
            opt_rows[-1] += " " + s
        elif mode == "vert":
            vert_words.append(s)
    stem = dash_norm(" ".join(stem_lines))
    # عمودی (تنها Q100): OCR جفت‌های (واژه، حرف) را از d تا a می‌دهد —
    # «واژهٔ» نخست (products) پیش از نخستین حرف می‌آید و به ساقه چسبیده است.
    if vert_letters:
        if num != 100:
            raise SystemExit(f"vertical options in unexpected Q{num}: {vert_letters}")
        # واژهٔ پیش از نخستین حرف از انتهای ساقه جدا می‌شود (تنها یک واژهٔ چسبیده مجاز)
        m = re.search(r"^(.*?)[.\"]?\s+([A-Za-z]+)$", stem)
        if m and len(vert_words) == 3 and len(m.group(2).split()) == 1:
            stem = dash_norm(m.group(1))
            vert_words = [m.group(2)] + vert_words
        if len(vert_letters) != 4 or len(vert_words) != 4:
            raise SystemExit(f"Q{num} vertical shape: letters={vert_letters} words={vert_words} stem={stem!r}")
        # جفت‌سازیِ مستقِمِ موقعیتی (درسِ key[100]=d=products)
        pairs = dict(zip(vert_letters, vert_words))
        if sorted(pairs) != ["a", "b", "c", "d"]:
            raise SystemExit(f"Q{num} vertical pairing broken: {pairs}")
        options = [pairs["a"], pairs["b"], pairs["c"], pairs["d"]]
        return stem, options, "vertical"
    # افقی: ادغام ردیف‌ها و برش با لنگرهای حرفی
    row = " ".join(opt_rows)
    row = dash_norm(row)
    # نقاطِ لنگر: حرف + نقطه بعد از فاصله/ابتدای ردیف
    anchors = [(m.group(1), m.start(), m.end()) for m in OPT_LETTER.finditer(" " + row)]
    if not anchors:
        raise SystemExit(f"Q{num}: no option anchors | row={row[:80]!r}")
    letters = [a[0] for a in anchors]
    if letters != ["a", "b", "c", "d"]:
        raise SystemExit(f"Q{num}: anchor letters {letters} | row={row[:120]!r}")
    opts = []
    for i, (letter, start, end_) in enumerate(anchors):
        # m.start روی رشتهٔ « row» است (یک فاصلهٔ اضافه در ابتدا)؛ جبران
        s_start = start  # اندیس در « row»
        s_end = anchors[i + 1][1] if i + 1 < len(anchors) else len(" " + row)
        text = (" " + row)[s_start + (end_ - start):s_end].strip()
        opts.append(dash_norm(text))
    return stem, opts, "horizontal"

# ————— ۳) گرید کلید —————
def parse_keys():
    anchor_idx = None
    for i, l in enumerate(LINES):
        if KEY_ANCHOR.replace(" ", "") in l.replace(" ", ""):
            anchor_idx = i
            break
    if anchor_idx is None:
        raise SystemExit("key anchor not found")
    toks = []
    for j in range(anchor_idx, len(LINES)):
        s = LINES[j].strip()
        if re.fullmatch(r"[abcd]", s):
            toks.append(("L", s, j + 1))
        elif re.fullmatch(r"\d{1,3}", s):
            toks.append(("N", s, j + 1))
    keys = {}
    i = 0
    while i < len(toks) - 1:
        (t1, v1, l1), (t2, v2, l2) = toks[i], toks[i + 1]
        if t1 == "L" and t2 == "N":
            keys[int(v2)] = v1
            i += 2
        else:
            i += 1
    return keys, anchor_idx + 1

KEYS, KEY_LINE = parse_keys()
missing_keys = sorted(set(range(1, 361)) - set(KEYS))
if missing_keys:
    raise SystemExit(f"key grid incomplete: {len(KEYS)} mapped, missing {missing_keys[:10]}")
print(f"key grid: {len(KEYS)} entries (anchor line {KEY_LINE})")

# ————— ۴) پارس همهٔ بلوک‌ها + قفلِ ترتیبی —————
results = {}          # printed_num -> (stem, options, form)
dup228 = None
expected = 1
for num, lines_ in raw_blocks:
    stem, opts, form = parse_block(num, lines_)
    if num == expected:
        # نسخهٔ ۲۲۸ در توالی (p129) — مالکِ results[228]
        results[num] = (stem, opts, form)
        expected = num + 1
    elif num == 228 and num != expected and dup228 is None:
        # نخستین ۲۲۸ بیرون از توالی (p128) — نسخهٔ تکراریِ چاپی
        dup228 = (stem, opts, form)
    else:
        raise SystemExit(f"sequence break: got Q{num}, expected Q{expected}")

missing = sorted(set(range(1, 361)) - set(results))
if missing:
    raise SystemExit(f"missing stems: {missing}")
if dup228 is None:
    raise SystemExit("expected duplicate 228 (printed twice) — not found")
print(f"parsed 360 + duplicate-228 (occurrences: {len(raw_blocks)} blocks)")

# ————— ۵) پاکیزگی نهایی —————
NO_BLANK_OK = {341}  # «Choose the odd word out.» — تنها ساقهٔ بی‌خالیِ مجاز

def clean_q(stem, opts):
    # «؟» عربیِ چاپی (Q58) با پرسش‌علامِ لاتینِ بقیهٔ پیکره یکدست می‌شود
    stem = stem.replace("\u061F", "?")
    stem = re.sub(r"\s+([,.;:!?])", r"\1", stem)
    stem = re.sub(r"\s{2,}", " ", stem).strip()
    opts = [re.sub(r"\s{2,}", " ", o).strip() for o in opts]
    return stem, opts

problems = []
QUESTIONS = {}   # n -> dict
for n in range(1, 361):
    stem, opts, form = results[n]
    stem, opts = clean_q(stem, opts)
    if len(opts) != 4:
        problems.append(f"Q{n}: {len(opts)} options")
        continue
    if any(not o for o in opts):
        problems.append(f"Q{n}: empty option {opts}")
        continue
    if len(set(o.lower() for o in opts)) != 4:
        problems.append(f"Q{n}: duplicate options {opts}")
        continue
    if re.search(r"[\u0600-\u06FF]", stem + "".join(opts)):
        problems.append(f"Q{n}: Persian char leaked")
        continue
    if not re.search(r"-{3,}", stem) and n not in NO_BLANK_OK:
        problems.append(f"Q{n}: no blank and not whitelisted | {stem[:60]}")
        continue
    QUESTIONS[n] = {
        "stem": stem,
        "options": opts,
        "answer": "abcd".index(KEYS[n]),
        "form": form,
    }
if problems:
    raise SystemExit("data problems:\n" + "\n".join(problems[:20]))

# ————— ۶) چیدمان بانک‌ها: ۱۸ بانک × ۲۰ (درس ۶..۲۳)؛ دو «۲۲۸» هر دو در بانکِ ۱۲ —————
BANKS = []   # (lesson_no, printed_range_label, [qdict...])
for b in range(18):
    lo, hi = 1 + 20 * b, 20 + 20 * b
    qs = []
    for n in range(lo, hi + 1):
        qd = QUESTIONS[n]
        qs.append({"n360": n, **qd})
    if b == 11:  # بانکِ ۲۲۱-۲۴۰ ← دو نسخهٔ چاپیِ ۲۲۸ (نسخهٔ دومِ درهم‌چاپ‌شده)
        d_stem, d_opts = clean_q(dup228[0], dup228[1])
        qs.append({"n360": "228x", "stem": d_stem, "options": d_opts,
                   "answer": "abcd".index(KEYS[228]), "form": dup228[2]})
    BANKS.append(qs)

counts = [len(b) for b in BANKS]
assert counts == [20]*11 + [21] + [20]*6, counts
total = sum(counts)
assert total == 361

# ————— ۷) تزریق به tests-g11.json (idempotent) —————
bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
existing_lessons = {L["lesson"] for L in bank["lessons"]}
new_lessons = []
for i, qs in enumerate(BANKS):
    lesson_no = 6 + i
    lo, hi = qs[0]["n360"], qs[-1]["n360"]
    hi_label = hi if isinstance(hi, int) else 240  # بانک ۱۲ با ۲۲۸x تمام نمی‌شود
    questions = []
    for k, qd in enumerate(qs, 1):
        questions.append({
            "id": f"g11-l{lesson_no}-{k}",
            "n": k,
            "category": "vocab",
            "question": qd["stem"],
            "options": qd["options"],
            "answer": qd["answer"],
        })
    new_lessons.append({
        "lesson": lesson_no,
        "title": f"آزمون جامع ۳۶۰ — بانک {i+1} (سؤال {qs[0]['n360']}-{hi_label})",
        "level": "جامع درس ۱ تا ۳",
        "count": len(questions),
        "questions": questions,
    })

if any(L["lesson"] in existing_lessons for L in new_lessons):
    # idempotent: نسخه‌های پیشینِ بانک‌های ۶+ را حذف و نو بساز
    keep = [L for L in bank["lessons"] if L["lesson"] < 6]
    bank["lessons"] = keep

bank["lessons"].extend(new_lessons)
bank["lessons"].sort(key=lambda L: L["lesson"])

# ————— ۸) provenance —————
src = bank.setdefault("source", {})
comp = {
    "family": "comprehensive360",
    "questionPages": "118-135",
    "keyGrid": "PDF p204 «پاسخنامه کلیدی360» — ۳۶۰ جفتِ (حرف، شماره)",
    "note": "جزوه شمارهٔ ۲۲۸ را دو بار چاپ کرده (دو سؤالِ متفاوت: نسخهٔ p128 بیرون از توالی، نسخهٔ p129 در توالی). هر دو در بانکِ درس ۱۲؛ گریدِ چاپی فقط یک کلیدِ ۲۲۸ دارد که برای هر دو سازگار است.",
    "translation": "برای این بخش در جزوه ترجمهٔ فارسی چاپ نشده (الگوی صادقانهٔ r278) — فیلد translation ساخته نشد.",
    "extractedRound": "r308",
}
lessons_src = src.setdefault("lessons", [])
lessons_src = [x for x in lessons_src if x.get("lesson", 0) < 6] + [
    {"lesson": 6 + i, "comprehensive360": True} for i in range(18)
]
src["lessons"] = lessons_src
src["comprehensive360"] = comp

BANK_PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# ————— ۹) راستی‌آزمایی مستقل چاپی —————
check = json.loads(BANK_PATH.read_text(encoding="utf-8"))
ids = [q["id"] for L in check["lessons"] for q in L["questions"]]
assert len(ids) == len(set(ids)), "id collision"
total_q = sum(len(L["questions"]) for L in check["lessons"])
lens = [(L["lesson"], L["count"], len(L["questions"])) for L in check["lessons"]]
print("lessons:", lens)
print(f"total questions: {total_q} (expect 162+361=523)")
assert total_q == 523

# spot-check معنایی دستی (کلیدِ گرید روی گزینهٔ معنادار می‌نشیند)
SPOT = {
    1: ("explain", 0), 2: ("Interview", 0), 8: ("society", 0), 100: ("products", 3),
    228: ("varies", 2), 240: ("give up / look after", 1), 341: ("cheap and expensive", 3),
    360: ("means", 2),
}
for n, (opt_text, want_idx) in SPOT.items():
    bank_i = (n - 1) // 20
    L = check["lessons"][5 + bank_i]
    k = (n - 1) % 20
    q = L["questions"][k]
    assert q["question"] and q["options"][want_idx] == opt_text, (n, q["options"], opt_text)
    assert q["answer"] == want_idx, (n, q["answer"], want_idx)
print("spot checks OK (incl. Q100 vertical, Q240 slash, Q341 odd-word, Q360)")

print(f"\nDONE r308 — 18 banks injected (l6..l23), 361 questions total, keys from p204 grid")
