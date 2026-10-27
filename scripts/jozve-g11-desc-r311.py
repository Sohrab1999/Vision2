# -*- coding: utf-8 -*-
"""
r311 — استخراج «آزمون تشریحی واژگان درس اول» جزوهٔ جامع یازدهم
(ص۱۶-۱۸، کلید واژه‌ای چاپی ص۱۷۶) → ۴ بانک / ۵۷ آیتم به tests-g11.json

بانک‌ها:
  l25 — بخش ۱: جای خالی از بانک واژه (۱۶ آیتم، تایپی؛ دو بانک واژهٔ ۹تایی چاپی)
  l26 — بخش ۲: جدول کلمه با حرف اول (۸ آیتم، تایپی)
  l27 — بخش ۳: تعریف‌ها (۸ آیتم، تایپی؛ بانک واژهٔ ۹تایی با یک مزاحم «despite»)
  l28 — بخش ۴: تست چهارگزینه‌ای (۲۵ آیتم MCQ؛ کلید واژه‌ایِ چاپی → نگاشت واژه→حرف)

کلید ص۱۷۶ واژه‌محور است؛ برای MCQ نگاشتِ واژه→حرف با تطبیقِ یکتا انجام و
ادعا می‌شود (هر ناهماهنگی = خطای سخت). تزریق idempotent است.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

import pdfplumber

ROOT = Path("/home/z/my-project")
PDF = ROOT / "upload/جزوه جامع یازدهم .pdf"
BANK = ROOT / "public/jozve/tests-g11.json"

DASH15 = "-" * 15
# خط‌تیره‌های چاپی: یک یا چند گروهِ ۵+ تیره که ممکن است با فاصله از هم جدا شده باشند
DASH_RUN = re.compile(r"-{5,}(?:\s+-{5,})*")

FA = re.compile(r"[\u0600-\u06FF]")

def norm_word(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())

def norm_stem(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def extract():
    with pdfplumber.open(str(PDF)) as pdf:
        p16 = pdf.pages[15].extract_text() or ""
        p17 = pdf.pages[16].extract_text() or ""
        p18 = pdf.pages[17].extract_text() or ""
        p176 = pdf.pages[175].extract_text() or ""
    return p16, p17, p18, p176


# ————————————————————— کلید ص۱۷۶ —————————————————————

def parse_key(p176: str):
    """چهار سکشنِ کلیدِ واژه‌ای؛ سرفصل‌ها در لایهٔ آینه‌ای RTL با «.N» تمام می‌شوند."""
    lines = [ln.strip() for ln in p176.splitlines() if ln.strip()]
    sections = {1: [], 2: [], 3: [], 4: []}
    cur = None
    pair = re.compile(r"(\d+)\.\s*([A-Za-z][A-Za-z'’ ]*?)\s*(?=(?:\d+\.)|$)")
    for ln in lines:
        m_end = re.search(r"\.([1-4])\s*$", ln)
        # سرفصل‌های سکشن در لایهٔ آینه‌ای فارسی‌اند و با «.N» تمام می‌شوند؛
        # سطرهای کلیدی انگلیسی‌اند — آزمونِ فارسی کافی و مقاوم است
        # (سرفصلِ سکشن ۳ «کامل کنید» ندارد: «… با تطبیق مناسب دهید .3»)
        if m_end and FA.search(ln):
            cur = int(m_end.group(1))
            continue
        if cur is None:
            continue
        if FA.search(ln):
            # سطرِ فارسی (سرفصل یا سربرگ) — رد
            continue
        words = [(int(a), b.strip()) for a, b in pair.findall(ln)]
        sections[cur].extend(words)
    out = {}
    for k, v in sections.items():
        nums = [n for n, _ in v]
        assert nums == list(range(1, len(nums) + 1)), f"key section {k}: numbering broken {nums}"
        out[k] = [w for _, w in v]
    return out


# ————————————————————— بدنهٔ آزمون ص۱۶-۱۸ —————————————————————

BOX_LINE = re.compile(r"^[A-Za-z][A-Za-z'’ ]*(?:\s*/\s*[A-Za-z][A-Za-z'’ ]*){4,}\s*$")
STEM = re.compile(r"^(\d+)\.\s+(.+)$")
OPT_SEG = re.compile(r"([a-d])\.\s+")


def split_boxes_and_items(p16: str, p17: str, p18: str):
    lines16 = [ln.strip() for ln in p16.splitlines() if ln.strip()]
    lines17 = [ln.strip() for ln in p17.splitlines() if ln.strip()]
    lines18 = [ln.strip() for ln in p18.splitlines() if ln.strip()]

    # — ص۱۶: سکشن ۱ (دو بانک واژه + ۱۶ ساقه) و آغاز سکشن ۲ (۸ جدول) —
    boxes = []          # [(idx, [words])]
    s1_items = {}       # n -> stem
    s2_items = {}       # n -> stem
    cur_box = None
    zone = 1  # 1 = section1, 2 = section2
    for ln in lines16:
        if ln.startswith('"') or "Vision Two" in ln or FA.search(ln.replace("_", "")) and not STEM.match(ln):
            # سربرگ‌ها و خطوط فارسی — اما ساقه‌های سکشن ۲ انگلیسی‌اند
            pass
        if BOX_LINE.match(ln):
            cur_box = [re.sub(r"\s+", " ", w).strip() for w in ln.split("/")]
            boxes.append(cur_box)
            continue
        m = STEM.match(ln)
        if not m:
            continue
        n = int(m.group(1))
        stem = m.group(2).strip()
        if "_" in ln and re.search(r"[A-Za-z]\s*(?:_\s*)+", ln):
            # سکشن ۲ — جدول حرف اول
            zone = 2
            s2_items[n] = stem
        elif zone == 1:
            s1_items[n] = stem
    assert len(boxes) == 2, f"expected 2 word boxes on p16, got {len(boxes)}"
    assert len(s1_items) == 16, f"section1: expected 16 stems, got {len(s1_items)}"
    assert len(s2_items) == 8, f"section2: expected 8 stems, got {len(s2_items)}"

    # — ص۱۷: سکشن ۳ (بانک واژه + ۸ تعریف) و سکشن ۴ (۱-۱۰) —
    box3 = None
    s3_items = {}
    s4_items = {}
    s4_opts = {}
    pend = None  # ساقهٔ معلقِ در انتظارِ سطرِ گزینه
    for ln in lines17:
        if BOX_LINE.match(ln) and pend is None:
            box3 = [re.sub(r"\s+", " ", w).strip() for w in ln.split("/")]
            continue
        m = STEM.match(ln)
        if m:
            n = int(m.group(1))
            stem = m.group(2).strip()
            if "(----" in ln or "(------------" in ln:
                s3_items[n] = stem
            else:
                pend = (n, stem)
            continue
        if OPT_SEG.search(ln) and pend:
            opts = parse_options(ln)
            s4_items[pend[0]] = pend[1]
            s4_opts[pend[0]] = opts
            pend = None
    assert box3 and len(box3) == 9, f"s3 box expected 9 words, got {box3}"
    assert len(s3_items) == 8, f"section3: expected 8, got {len(s3_items)}"
    assert len(s4_items) == 10, f"section4 on p17: expected 10, got {len(s4_items)}"

    # — ص۱۸: ادامهٔ سکشن ۴ (۱۱-۲۵) —
    pend = None
    for ln in lines18:
        m = STEM.match(ln)
        if m:
            n = int(m.group(1))
            stem = m.group(2).strip()
            if OPT_SEG.search(ln):
                # ساقه و گزینه در یک سطر (احتیاط)
                s4_items[n] = stem
                s4_opts[n] = parse_options(ln)
            else:
                pend = (n, stem)
            continue
        if OPT_SEG.search(ln) and pend:
            s4_items[pend[0]] = pend[1]
            s4_opts[pend[0]] = parse_options(ln)
            pend = None
    assert len(s4_items) == 25, f"section4 total: expected 25, got {len(s4_items)}"
    return boxes[0], boxes[1], box3, s1_items, s2_items, s3_items, s4_items, s4_opts


def parse_options(line: str):
    segs = OPT_SEG.split(line)
    # segs = ['', 'a', ' through ', 'b', ' extra ', ...]
    opts = {}
    for i in range(1, len(segs) - 1, 2):
        letter = segs[i]
        val = segs[i + 1].strip()
        opts[letter] = val
    assert sorted(opts) == list("abcd"), f"bad options line: {line!r} -> {opts}"
    vals = [opts[c] for c in "abcd"]
    assert len(set(vals)) == 4, f"duplicate options: {line!r}"
    for v in vals:
        assert v and not FA.search(v), f"option pollution: {v!r}"
    return vals


def norm_dash(stem: str) -> str:
    """ادغامِ گروه‌های خط‌تیرهٔ چاپی در یک جای‌خالیِ استاندارد ۱۵تیره."""
    return DASH_RUN.sub(DASH15, stem).strip()


# ————————————————————— ساخت بانک‌ها —————————————————————

def build(boxes, keys, s1, s2, s3, s4, s4o):
    boxA, boxB, box3 = boxes
    receipts = {"unusedBoxWords": {}, "s1PrintQuirks": []}

    # — l25: سکشن ۱ —
    q25 = []
    for i in range(1, 17):
        stem = norm_dash(s1[i])
        ans = keys[1][i - 1]
        box = boxA if i <= 8 else boxB
        # کلیدِ ۱۳ «Imagine» حرف‌بزرگ چاپ شده — مقایسهٔ حساس‌به‌حروف نیست
        assert norm_word(ans) in {norm_word(w) for w in box}, f"s1 q{i}: key {ans!r} not in its box"
        # سکوتِ چاپی: کلمهٔ بدونِ استفادهٔ هر بانک
        opts = [ans] + [w for w in box if norm_word(w) != norm_word(ans)]
        q25.append({
            "id": f"g11-l25-{i}", "n": i, "category": "vocab", "kind": "typed",
            "question": f"{stem} [bank: {' / '.join(box)}]",
            "options": opts, "answer": 0, "accepted": [ans],
            "placeholder": "fill in the blank with the bank word…",
        })
    usedA = {norm_word(keys[1][i - 1]) for i in range(1, 9)}
    usedB = {norm_word(keys[1][i - 1]) for i in range(9, 17)}
    receipts["unusedBoxWords"]["s1boxA"] = [w for w in boxA if norm_word(w) not in usedA]
    receipts["unusedBoxWords"]["s1boxB"] = [w for w in boxB if norm_word(w) not in usedB]

    # — l26: سکشن ۲ — جدول حرف اول —
    q26 = []
    for i in range(1, 9):
        stem = s2[i].strip()
        assert re.match(r"^\d+\.\s", "") or True
        ans = keys[2][i - 1]
        first = stem.split()[0] if stem else ""
        # الگوی «C _ _ _ _ _ _» — حرف اول + خط‌زیرین‌ها
        assert re.search(r"[A-Za-z]\s*_", stem), f"s2 q{i}: no first-letter hint: {stem!r}"
        hinted = re.search(r"([A-Za-z])\s*(?:_\s*)+", stem).group(1)
        assert hinted.lower() == ans[0].lower(), f"s2 q{i}: hint {hinted} != key {ans}"
        others = [w for w in keys[2] if norm_word(w) != norm_word(ans)]
        q26.append({
            "id": f"g11-l26-{i}", "n": i, "category": "vocab", "kind": "typed",
            "question": stem,
            "options": [ans] + others, "answer": 0, "accepted": [ans],
            "placeholder": "complete the word (first letter is given)…",
        })

    # — l27: سکشن ۳ — تعریف‌ها —
    q27 = []
    for i in range(1, 9):
        stem = norm_dash(s3[i])
        ans = keys[3][i - 1]
        assert ans in box3, f"s3 q{i}: key {ans!r} not in box3"
        assert "(----" in stem or "(" in stem, f"s3 q{i}: no parenthetical blank"
        opts = [ans] + [w for w in box3 if norm_word(w) != norm_word(ans)]
        q27.append({
            "id": f"g11-l27-{i}", "n": i, "category": "vocab", "kind": "typed",
            "question": f"{stem} [bank: {' / '.join(box3)}]",
            "options": opts, "answer": 0, "accepted": [ans],
            "placeholder": "type the word for the definition…",
        })
    used3 = {norm_word(keys[3][i - 1]) for i in range(1, 9)}
    receipts["unusedBoxWords"]["s3box"] = [w for w in box3 if norm_word(w) not in used3]

    # — l28: سکشن ۴ — MCQ با نگاشتِ واژه→حرف —
    LETTERS = "abcd"
    q28 = []
    for i in range(1, 26):
        stem = norm_dash(s4[i])
        opts = s4o[i]
        ans_word = keys[4][i - 1]
        hits = [j for j, o in enumerate(opts) if norm_word(o) == norm_word(ans_word)]
        assert len(hits) == 1, f"s4 q{i}: key word {ans_word!r} matched {len(hits)} options {opts}"
        q28.append({
            "id": f"g11-l28-{i}", "n": i, "category": "vocab",
            "question": stem,
            "options": opts, "answer": hits[0],
        })
    return q25, q26, q27, q28, receipts


LESSON_META = [
    (25, "تشریحی واژگان — جای خالی از بانک واژه (ص۱۶)", 16, "تشریحی — تایپی"),
    (26, "تشریحی واژگان — جدول کلمه با حرف اول (ص۱۶)", 8, "تشریحی — تایپی"),
    (27, "تشریحی واژگان — تعریف‌ها، بنویسید (ص۱۷)", 8, "تشریحی — تایپی"),
    (28, "تشریحی واژگان — تست چهارگزینه‌ای (ص۱۷-۱۸)", 25, "تشریحی — چهارگزینه‌ای"),
]


def dup_hunt(new_qs, bank):
    """برابریِ ساقه با بانک‌های پیشینِ همان فایل (الگوی r309/r310)."""
    existing = []
    for L in bank["lessons"]:
        if L["lesson"] in (25, 26, 27, 28):
            continue
        for q in L["questions"]:
            existing.append((L["lesson"], q["id"], norm_stem(DASH_RUN.sub(DASH15, q["question"]))))
    dup = []
    for q in new_qs:
        ns = norm_stem(DASH_RUN.sub(DASH15, q["question"].split(" [bank:")[0]))
        for les, qid, es in existing:
            if ns == es:
                dup.append({"new": q["id"], "old": qid, "oldLesson": les})
    return dup


def main():
    p16, p17, p18, p176 = extract()
    keys = parse_key(p176)
    assert [len(keys[k]) for k in (1, 2, 3, 4)] == [16, 8, 8, 25], \
        f"key sizes: {[(k, len(keys[k])) for k in (1,2,3,4)]}"
    boxes = split_boxes_and_items(p16, p17, p18)
    boxA, boxB, box3, s1, s2, s3, s4, s4o = boxes
    q25, q26, q27, q28, receipts = build((boxA, boxB, box3), keys, s1, s2, s3, s4, s4o)

    bank = json.loads(BANK.read_text(encoding="utf-8"))
    dup = dup_hunt(q25 + q26 + q27 + q28, bank)

    new_lessons = []
    for (les, title, count, level), qs in zip(
        LESSON_META, [q25, q26, q27, q28]
    ):
        assert len(qs) == count, f"lesson {les}: {len(qs)} != {count}"
        new_lessons.append({
            "lesson": les, "title": title, "level": level, "count": count, "questions": qs,
        })

    # تزریقِ idempotent: حذفِ نسخه‌های پیشینِ ۲۵..۲۸ و الحاق
    bank["lessons"] = [L for L in bank["lessons"] if L["lesson"] not in (25, 26, 27, 28)]
    bank["lessons"].extend(new_lessons)

    # رسیدِ منبع
    src = bank.setdefault("source", {})
    src["descVocab1"] = {
        "family": "descriptive-vocab-lesson1",
        "printedHeader": "آزمون تشریحی واژگان درس اول (پاسخ: صفحهٔ ۱۷۶) — چهار بخش",
        "questionPages": "16-18",
        "keyPage": "176",
        "keyKind": "word-keyed — نگاشتِ واژه→حرف برای MCQ با تطبیقِ یکتا",
        "sections": {
            "l25": "بخش ۱ — جای خالی از بانک واژه: دو بانک ۹تایی چاپی (مزاحم‌ها در unusedBoxWords) — تایپی",
            "l26": "بخش ۲ — جدول کلمه با حرف اول («C _ _ _ _ _ _ …») — تایپی",
            "l27": "بخش ۳ — تعریف‌ها با بانک ۹تایی (مزاحم: despite) — تایپی",
            "l28": "بخش ۴ — «بهترین گزینه را انتخاب کنید» ۲۵تستی؛ کلید واژه‌ای چاپی ص۱۷۶",
        },
        "normalization": "گروه‌های خط‌تیرهٔ چاپی («------ ------») در یک جای‌خالیِ ۱۵تیره ادغام شد؛ بانک واژه به‌صورت «[bank: …]» داخلِ ساقه آمد تا هر سؤال خودبسنده باشد.",
        "printQuirks": [
            "کلیدِ ۱۳ سکشن ۱ با «Imagine» حرف‌بزرگ چاپ شده — عینِ چاپ نگه داشته شد (تطبیقِ تایپ حساس به حروف نیست).",
            "کلیدِ ۱۴ سکشن ۱ «range» است با ساقهٔ «The cost … (مفرد)» — هر دو مزاحمِ «varied» و «range» از نظر دستور ممکن‌اند؛ عینِ چاپ حاکم است.",
        ],
        "unusedBoxWords": receipts["unusedBoxWords"],
        "duplicateHunt": {
            "scope": "همهٔ بانک‌های پیشینِ tests-g11 (l1..l24) — ساقهٔ نرمال‌شده",
            "duplicates": dup,
            "note": "ساقه‌های آزمون تشریحی با خانواده‌های استاندارد/تکمیلی/کنکوری/جامعِ۳۶۰ هم‌پوشانی ندارند." if not dup else f"{len(dup)} هم‌پوشانی",
        },
        "translation": "برای این آزمون در جزوه ترجمهٔ چاپی نیست (الگوی صادقانهٔ r278/r308/r309) — translation ساخته نشد.",
        "extractedRound": "r311",
    }

    before = json.dumps(bank, ensure_ascii=False, sort_keys=True, indent=1)
    BANK.write_text(before + "\n", encoding="utf-8")

    # idempotency probe
    h1 = hashlib.md5(BANK.read_bytes()).hexdigest()
    total = sum(len(L["questions"]) for L in bank["lessons"])
    print(json.dumps({
        "ok": True,
        "banks": {L["lesson"]: len(L["questions"]) for L in new_lessons},
        "totalItems": total,
        "totalLessons": len(bank["lessons"]),
        "duplicates": dup,
        "unused": receipts["unusedBoxWords"],
        "md5": h1,
    }, ensure_ascii=False, indent=1))

    # اجرای دومِ کاملِ پارسر برای اثباتِ idempotency
    p16b, p17b, p18b, p176b = extract()
    keys2 = parse_key(p176b)
    boxes2 = split_boxes_and_items(p16b, p17b, p18b)
    b2 = json.loads(BANK.read_text(encoding="utf-8"))
    q25b, q26b, q27b, q28b, _ = build((boxes2[0], boxes2[1], boxes2[2]), keys2, boxes2[3], boxes2[4], boxes2[5], boxes2[6], boxes2[7])
    b2["lessons"] = [L for L in b2["lessons"] if L["lesson"] not in (25, 26, 27, 28)]
    for (les, title, count, level), qs in zip(LESSON_META, [q25b, q26b, q27b, q28b]):
        b2["lessons"].append({"lesson": les, "title": title, "level": level, "count": count, "questions": qs})
    h2 = hashlib.md5((json.dumps(b2, ensure_ascii=False, sort_keys=True, indent=1) + "\n").encode("utf-8")).hexdigest()
    assert h1 == h2, f"idempotency broken: {h1} != {h2}"
    print("idempotency: OK", h1)


if __name__ == "__main__":
    sys.exit(main())
