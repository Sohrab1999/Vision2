#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r360 — استخراج «تست های گرامر و نگارش درس3 - پایه11» از جزوهٔ جامع یازدهم
  بخش اول: ۳۰ تست (کنکوری – استاندارد)، ص۱۰۳-۱۰۴، کلیدِ تشریحیِ ص۱۹۸-۱۹۹ («N - گزینه (X)»)
  بخش دوم: ۷۰ تست (متوسط - کنکوری)، ص۱۰۵-۱۰۸، کلیدِ گریدِ مختصاتیِ ص۲۰۰ (۷ ستون × ۱۰ ردیف،
           ارقامِ سیاه + حروفِ سرخِ c#c00000 — ستونِ آخرِ ۶۱-۷۰ با سایزِ ۱۵ چاپ شده نه ۱۴)
خروجی: بانک‌های ۹۳-۹۴ به public/jozve/tests-g11.json (+ رسیدِ source.g11l3gwr)
پیش‌نمونه‌ها: r308 (همین جزوه، گریدِ کلید)، r350 (خانوادهٔ MCQِ ۱۰۰تاییِ دهم)، r358/r359 (لوکاتورِ دوطرفه).
idempotent: اجرای دوم NO-OP می‌دهد.
"""
import json
import re
from pathlib import Path

import fitz

ROOT = Path("/home/z/my-project")
OCR_PATH = ROOT / "booklet-extract/g11.txt"
BANK_PATH = ROOT / "public/jozve/tests-g11.json"
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

OCR = OCR_PATH.read_text(encoding="utf-8")
LINES = OCR.split("\n")
PERSIAN = re.compile(r"[\u0600-\u06FF]")

HEADER_NOISE = re.compile(
    r'^(<<<PAGE \d+>>>|\d{1,3}\s*$|جزوه|جام ــ?ع?\s*کمک آموزش|زبان انگل'
    r'|پایه یاز|دهم\s*"|"جمـ{2,}ال احـ{2,}دی و همـ{2,}کاران"'
    r'|“Vision Two”|تألیـ{2,}ف و گـ{2,}ردآوری|ست ت|های $| گرامر" و نگارش درس3| پایه11|"$)'
)


def page_slice(pnum: int) -> list[str]:
    start = next(i for i, l in enumerate(LINES) if f"<<<PAGE {pnum}>>>" in l)
    end = next(i for i in range(start + 1, len(LINES)) if "<<<PAGE" in LINES[i])
    return LINES[start:end]


OPT_LETTER = re.compile(r"(?:^|\s)([abcd])\.\s*")
STEM_RE = re.compile(r"^(\d{1,2})\.\s*(.+)$")
DASH_RUN = re.compile(r"-{3,}")


def parse_items(start_anchor: str, pages: list[int], expected_count: int) -> list[dict]:
    """بلوک‌های سؤال: ساقه تا نخستین لنگرِ حرفی، سپس ردیف‌های گزینه ادغام و برش با لنگرها."""
    # ناحیهٔ خام: از لنگرِ آغاز تا پایانِ آخرین صفحه
    seg: list[str] = []
    started = False
    for p in pages:
        for l in page_slice(p):
            if not started and start_anchor in l:
                started = True
            if started:
                seg.append(l.rstrip("\n"))
    assert started, f"start anchor not found: {start_anchor!r}"

    blocks: list[tuple[int, list[str]]] = []
    cur: tuple[int, list[str]] | None = None
    for l in seg:
        s = l.strip()
        if not s:
            continue
        m = STEM_RE.match(s)
        if m:
            n = int(m.group(1))
            rest = m.group(2)
            cur = (n, [rest])
            blocks.append(cur)
            continue
        if cur is None:
            continue  # نویزِ پیش از نخستین سؤال (باقیِ سربرگ)
        if s.startswith("Note") or s == ":" or set(s) <= {"-", " "}:
            cur = None  # جعبهٔ Note / خطِ جداکننده
            continue
        if PERSIAN.search(s):
            cur = None  # متنِ فارسی = خارجِ ناحیهٔ سؤال
            continue
        cur[1].append(s)
    assert len(blocks) == expected_count, f"blocks={len(blocks)} expected={expected_count}"

    items = []
    for idx, (n, ls) in enumerate(blocks, start=1):
        assert n == idx, f"sequence break: got Q{n} expected Q{idx}"
        stem_lines, opt_rows = [], []
        mode = "stem"
        for l in ls:
            s = re.sub(r"\s+", " ", l).strip()
            if not s:
                continue
            if OPT_LETTER.search(" " + s):
                mode = "opts"
                opt_rows.append(s)
                continue
            if mode == "stem":
                stem_lines.append(s)
            else:
                # ادامهٔ ردیفِ گزینهٔ شکسته
                opt_rows[-1] += " " + s
        stem = " ".join(stem_lines).strip()
        row = re.sub(r"\s+", " ", " ".join(opt_rows)).strip()
        anchors = [(m.group(1), m.start(), m.end()) for m in OPT_LETTER.finditer(" " + row)]
        letters = [a[0] for a in anchors]
        assert letters == ["a", "b", "c", "d"], f"Q{n} letters={letters}"
        opts = []
        for i, (letter, start, end_) in enumerate(anchors):
            s_end = anchors[i + 1][1] if i + 1 < len(anchors) else len(" " + row)
            text = (" " + row)[start + (end_ - start):s_end].strip()
            opts.append(re.sub(r"\s+", " ", text))
        assert all(opts), f"Q{n} empty option"
        # سانسِ تیره: رانِ خط‌شکسته فقط وقتی است که خطِ بعد هم با تیره آغاز شود
        for k, sl in enumerate(stem_lines):
            if sl.endswith("-") and k + 1 < len(stem_lines) and stem_lines[k + 1].startswith("-"):
                raise AssertionError(f"Q{n} broken dash run across lines: {sl!r} | {stem_lines[k+1]!r}")
        items.append({"n": n, "question": stem, "options": opts})
    return items


# ————— آیتم‌ها —————
SEC1_START = "1. If I find a book that is popular"
SEC2_START = "1. If you ---------------- more than 100 dollars"
sec1 = parse_items(SEC1_START, [103, 104], 30)
sec2 = parse_items(SEC2_START, [105, 106, 107, 108], 70)
print(f"parsed: sec1={len(sec1)} sec2={len(sec2)}")

# ————— کلیدِ بخش اول: تشریحیِ ص۱۹۸-۱۹۹ (لایهٔ متنی) —————
key1_flat = re.sub(r"\s+", " ", "\n".join(page_slice(198) + page_slice(199)))
k1_entries = re.findall(r"(\d{1,2})\s*-\s*گزینه\s*\(\s*([abcd])\s*\)", key1_flat)
k1_nums = [int(n) for n, _ in k1_entries]
assert k1_nums == list(range(1, 31)), f"key1 numbering broken: {k1_nums}"
KEY1 = {int(n): l for n, l in k1_entries}
assert len(KEY1) == 30

# ————— کلیدِ بخش دوم: گریدِ مختصاتیِ ص۲۰۰ (fitz dict) —————
doc = fitz.open(PDF)
d200 = doc[199].get_text("dict")
nums_sp, let_sp = [], []
for blk in d200.get("blocks", []):
    if blk.get("type", 0) != 0:
        continue
    for ln in blk.get("lines", []):
        for sp in ln.get("spans", []):
            t = sp.get("text", "").strip()
            if not t:
                continue
            sz = sp.get("size", 0)
            col = sp.get("color", 0)
            x0, y0, x1, y1 = sp["bbox"]
            if re.fullmatch(r"\d{1,2}", t) and col == 0x000000 and 13.0 <= sz <= 15.5 and y0 > 60:
                nums_sp.append((y0, x0, int(t)))
            elif re.fullmatch(r"[abcd]", t) and col == 0xC00000 and 14.0 <= sz <= 15.5:
                let_sp.append((y0, x0, t))
assert len(nums_sp) == 70, f"grid numbers={len(nums_sp)}"
assert len(let_sp) == 70, f"grid letters={len(let_sp)}"
rows: dict[int, list] = {}
for y, x, t in nums_sp + let_sp:
    rows.setdefault(round(y / 5), []).append((x, t))
KEY2: dict[int, str] = {}
for rk, cell in sorted(rows.items()):
    nums_r = sorted([(x, n) for x, n in cell if isinstance(n, int)])
    lets_r = sorted([(x, l) for x, l in cell if not isinstance(l, int)])
    assert len(nums_r) == len(lets_r) == 7, f"row {rk}: {len(nums_r)}n/{len(lets_r)}l"
    for (xn, n), (xl, l) in zip(nums_r, lets_r):
        assert xl > xn, f"row {rk}: letter {l} not right of number {n}"
        KEY2[n] = l
assert sorted(KEY2) == list(range(1, 71)), "grid incomplete"

# ————— قفل‌های معنایی (پیش‌پرکردنِ معنایی — درسِ r350) —————
def opt_of(items, n):
    return items[n - 1]["options"]

# بخش اول
assert KEY1[1] == "b" and opt_of(sec1, 1)[1].startswith("will buy"), "sem Q1"
assert KEY1[2] == "b" and opt_of(sec1, 2)[1] == "get / don’t leave", "sem Q2"
assert KEY1[4] == "b" and opt_of(sec1, 4)[1] == "find", "sem Q4"
assert KEY1[24] == "d" and opt_of(sec1, 24)[3] == "to tell / swimming", "sem Q24"
assert KEY1[30] == "b" and opt_of(sec1, 30)[1] == "to answer", "sem Q30"
# بخش دوم
assert KEY2[1] == "b" and opt_of(sec2, 1)[1] == "buy", "sem2 Q1"
assert KEY2[2] == "c" and opt_of(sec2, 2)[2] == "to see", "sem2 Q2"
assert KEY2[3] == "b" and opt_of(sec2, 3)[1] == "find", "sem2 Q3"
assert KEY2[60] == "d" and opt_of(sec2, 60)[3] == "to eat", "sem2 Q60"
assert KEY2[68] == "d" and opt_of(sec2, 68)[3] == "not to play", "sem2 Q68"
print("semantic locks OK")

# ————— تکرارِ چاپی با نرمال‌سازیِ عرضِ تیره: Q66 بخش دوم = Q13 بخش دوم —————
def dash_norm_q(q: str) -> str:
    return DASH_RUN.sub("—", q)

dup_pairs = []
for i in range(70):
    for j in range(i + 1, 70):
        if dash_norm_q(sec2[i]["question"]) == dash_norm_q(sec2[j]["question"]) and sec2[i]["options"] == sec2[j]["options"]:
            dup_pairs.append((i + 1, j + 1))
assert dup_pairs == [(13, 66)], f"unexpected in-bank duplicates: {dup_pairs}"
print("in-bank printed duplicates (sec2):", dup_pairs)
# تکرارِ بین‌بخشی: Q3 بخش دوم = Q4 بخش اول (ساقه/گزینه‌ها با نرمال‌سازیِ تیره)
cross = dash_norm_q(sec1[3]["question"]) == dash_norm_q(sec2[2]["question"]) and sec1[3]["options"] == sec2[2]["options"]
assert cross, "expected cross-section duplicate B1-Q4 == B2-Q3"
print("cross-section dup B1-Q4 == B2-Q3:", True)

# ————— ساخت بانک‌ها و الحاقِ idempotent —————
data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
lessons = data["lessons"]
existing = {b["lesson"] for b in lessons}
NO_TRANSLATION = None  # بدونِ ترجمهٔ چاپی روی صفحاتِ آزمون

def build(lesson_no: int, items: list[dict], keys: dict[int, str]) -> dict:
    qs = []
    for it in items:
        letter = keys[it["n"]]
        ans = "abcd".index(letter)
        qs.append({
            "id": f"g11-l{lesson_no}-{it['n']}",
            "n": it["n"],
            "category": "grammar",
            "question": it["question"],
            "options": it["options"],
            "answer": ans,
        })
    return qs

if 93 in existing or 94 in existing:
    b93 = next(b for b in lessons if b["lesson"] == 93)
    b94 = next(b for b in lessons if b["lesson"] == 94)
    q93 = build(93, sec1, KEY1)
    q94 = build(94, sec2, KEY2)
    same = json.dumps(b93["questions"], ensure_ascii=False) == json.dumps(q93, ensure_ascii=False) and \
        json.dumps(b94["questions"], ensure_ascii=False) == json.dumps(q94, ensure_ascii=False)
    if same and data["source"].get("g11l3gwr"):
        print("translations changed: 0 — NO-OP")
        raise SystemExit(0)
    raise SystemExit("banks exist but differ — manual arbitration needed")

q93 = build(93, sec1, KEY1)
q94 = build(94, sec2, KEY2)
bank93 = {
    "lesson": 93,
    "title": "کنکوری/استاندارد — بخش اول: ۳۰ تست گرامر و نگارش د۳ (ص۱۰۳-۱۰۴)",
    "level": "کنکوری/استاندارد — چهارگزینه‌ای",
    "count": 30,
    "questions": q93,
}
bank94 = {
    "lesson": 94,
    "title": "متوسط/کنکوری — بخش دوم: ۷۰ تست گرامر و نگارش د۳ (ص۱۰۵-۱۰۸)",
    "level": "متوسط/کنکوری — چهارگزینه‌ای",
    "count": 70,
    "questions": q94,
}
lessons.extend([bank93, bank94])

# ————— رسید —————
data["source"]["g11l3gwr"] = {
    "extractedRound": "r360",
    "examPages": "بخش اول 103-104؛ بخش دوم 105-108",
    "keyPages": "بخش اول 198-199 (تشریحی)؛ بخش دوم 200 (گریدِ مختصاتی 7×10)",
    "sections": 2,
    "items": 100,
    "printQuirkCount": 12,
    "printQuirks": [
        "لوکاتورِ دوطرفهٔ خوداعلام (بخش اول): آزمونِ ص۱۰۳ «(پاسخنامه صفحه198 و 199)» ⇠ کلیدِ ص۱۹۸ «(سؤاالت صفحه103 و 104)»",
        "لوکاتورِ دوطرفهٔ خوداعلام (بخش دوم): آزمونِ ص۱۰۵ «پاسخنامه صفحه200» ⇠ کلیدِ ص۲۰۰ «(سواالات صفحه105 تا108)»",
        "دو تجزیهٔ متفاوتِ لیگاتورِ «سؤالات» در دو سربرگِ کلید: «سؤاالت» (ص۱۹۸) در برابرِ «سواالات» (ص۲۰۰)",
        "سربرگِ کلیدِ بخش اول: «پاسخنامه تستهای دستگریمی گرامر و نگارش» — لایهٔ متنی «دستگریم» بدونِ «ی» آخر می‌دهد (رندرِ ۸x: چاپ «دستگریمی» دارد)؛ خویشاوندِ معناییِ «تست‌های گرم‌کردنی»",
        "سربرگِ کلیدِ بخش اول: «شیوه کیل حل تستهای گرامر» — چاپ‌غلطِ «کیل» به‌جای «کلید» (رندر تأیید)",
        "ارقامِ لوکاتور در چاپِ ص۱۹۸ فارسی‌اند («۱۰۳ و ۱۰۴») ولی لایهٔ متنی لاتین می‌دهد («103 و 104») — ناهم‌خوانیِ رقمیِ چاپ/لایه",
        "گریدِ کلیدِ ص۲۰۰: ۷ ستون × ۱۰ ردیف (سطرها ۱-۱۰، ستون‌ها ده‌تایی؛ ستونِ آخر ۶۱-۷۰) — ارقامِ سیاه و حروفِ سرخِ c#c00000؛ ستونِ ۶۱-۷۰ با سایزِ ۱۵ چاپ شده در برابرِ سایزِ ۱۴ بقیه (ناهم‌سایزیِ ستونی)",
        "سربرگِ ص۲۰۰ «پاسخنامه کلیدی 70 تست گرامر و نگارش درس سوم» با «۷۰» سرخِ c#ff0000 — سرخِ متفاوت از سرخیِ حروفِ گرید (c#c00000)؛ انگلیسیِ زیرِ آن: «Grammar / Writing Tests (lesson 3)»",
        "لکهٔ «cc» با قلمِ ۳پوینتیِ نامرئی‌چاپ در بالایِ گریدِ ص۲۰۰ (x≈22) — آرتیفکتِ چاپ؛ گرید را نمی‌شکند",
        "عنوانِ سربرگِ ص۱۰۳ در لایه به‌هم‌ریخته است: «ست تهای گرامر\" و نگارش درس3 - پایه11» — «تست» به «ست ت»+«های» شکسته (خانوادهٔ scramble)",
        "سطحِ چاپیِ دو بخش متفاوت است: بخش اول «سطح تستها: \"کنکوری\" – \"استاندارد\"» و بخش دوم «سطح: \"متوسط\" - \"کنکوری\"» — سرتیترِ ص۱۰۵ («۷۰ تست گرامر و نگارش») فقط بخش دوم را می‌پوشاند نه کلِ ۱۰۰تایی",
        "تکرارِ چاپیِ درون‌بانکیِ بخش دوم: Q13 = Q66 (ساقه و گزینه‌های یکسان با نرمال‌سازیِ عرضِ تیره — ۱۷ در برابرِ ۱۶ تیره؛ هر دو کلیدِ a) و تکرارِ بین‌بخشیِ Q4 بخش اول = Q3 بخش دوم — طبقِ قراردادِ r308 نگه داشته شد، نه حذف/ادغام",
    ],
    "keyVerification": {
        "sec1_explanatory": "30/30 مدخلِ «N - گزینه (X)» از ص۱۹۸-۱۹۹ با کاملِ ۱..۳۰",
        "sec2_grid": "70/70 جفتِ (عددِ سیاه، حرفِ سرخ) از گریدِ مختصاتیِ ص۲۰۰ — ۱۰ ردیف × ۷ ستونِ بی‌نقص",
        "semanticSpotChecks": "بخش اول Q1=b/Q2=b/Q4=b/Q24=d/Q30=b؛ بخش دوم Q1=b/Q2=c/Q3=b/Q60=d/Q68=d",
        "duplicates": "Q66=Q13 درونِ بخش دوم (فقط عرضِ تیره متفاوت)؛ Q4 بخش اول = Q3 بخش دوم — کلیدها هم‌ارز",
    },
}

BANK_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"appended banks 93 ({len(q93)}) + 94 ({len(q94)}) → total lessons={len(lessons)}")
print("source.g11l3gwr receipt written")
