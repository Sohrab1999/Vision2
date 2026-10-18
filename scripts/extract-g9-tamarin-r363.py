#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r363 — خانوادهٔ «تمرین‌های مکالمه» جزوهٔ نهم (لطفی بوکان) + اصلاحِ باگِ امتیازدهیِ تایپیِ تک‌گزینه‌ای

الف) استخراجِ ۱۱ سکشنِ «تمرین ۱/۲» شش درس (ص۱۷/۳۱/۵۱/۶۵/۸۳/۹۶) → ۶ بانکِ تازه (بانک ۳-۸)
     ۵۵ جفتِ پرسش‌وپاسخِ تایپی؛ پرسش و پاسخ هر دو چاپیِ درون‌صفحه‌اند (بی‌پاسخنامهٔ جدا).
     ساختارِ لایه در این جزوه: هر آیتم = [بلوکِ پاسخ EN][پاسخ FA][بلوکِ سؤال EN][سؤال FA]
     (پاسخ در لایه پیش از سؤال می‌آید — ترتیبِ استخراجِ لایه، نه ترتیبِ بصری چاپ).
ب) کشفِ راند: باگِ typedAnswerIndex برای آیتم‌های تایپیِ تک‌گزینه‌ای — ورودیِ غلط به
     (answer+1)%len نگاشت می‌شود که با len=1 همیشه خودِ answer است → هر ورودیِ غلطی
     «درست» امتیاز می‌گرفت. ۴۳ آیتمِ معیوب (g9:4، g10:35، g11:4) با اسکافولدِ غلطِ
     خانواده‌محور اصلاح می‌شوند (گزینهٔ غلط هرگز برای تایپی رندر نمی‌شود — کارنامه متنِ
     خامِ تایپ‌شده را نشان می‌دهد؛ گزینه‌ها فقط داربستِ اندیس‌اند).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"
G10 = ROOT / "public/jozve/tests-g10.json"
G11 = ROOT / "public/jozve/tests-g11.json"

PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_idx() -> dict[int, int]:
    marks = {}
    for i, l in enumerate(LAYER):
        m = re.match(r"<<<PAGE (\d+)>>>", l)
        if m:
            marks[int(m.group(1))] = i
    return marks


PM = page_idx()


def slice_between(a: tuple[int, int], b: tuple[int, int]) -> list[str]:
    """(page, line-in-page) تا (page, line-in-page)"""
    s = PM[a[0]] + a[1]
    e = PM[b[0]] + b[1]
    return LAYER[s:e]


def find_line(page: int, needle: str, span: int = 1) -> tuple[int, int]:
    """نخستین سطرِ دربردارندهٔ needle از صفحهٔ pdf تا span صفحه؛ خروجی (page، offset-in-page)"""
    for p in range(page, page + span):
        start = PM[p]
        end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
        for i in range(start, end):
            if needle in LAYER[i]:
                return (p, i - start)
    raise AssertionError(f"anchor not found from pdf-p{page} (span={span}): {needle!r}")


# ————— پارسرِ بلوکی —————
JUNK = re.compile(
    r"^<<<PAGE|جزوه کامل زبان انگلیسی|^تم ?رین|^صفحه|^[:.،؛]*\s*صحبت کردن|^ترجمه\s*[Pp]ractice"
    r"|^درس (اول|دوم|سوم|چهارم|پنجم|ششم)$|^پایه$|^نهم$|^\.{4,}|^……+|^آهنگ زبان|^Intonation"
    r"|^کلمات ،? ?عبارات|^نکته|^کلمات پرسشی|^در زبان انگلیسی|^تعریف|^ضمایر|^افعال to be"
    r"|^\d{1,3}$|^\s*$|^[:.؟?]+$"
)


def is_junk(l: str) -> bool:
    s = l.strip()
    if JUNK.match(s):
        return True
    # قطعه‌های یتیمِ شکستِ RTL: «م ؟» / «؟» / «.»
    if re.fullmatch(r"[م؟?.\s]+", s):
        return True
    return False


def is_fa(l: str) -> bool:
    return bool(PERSIAN.search(l))


def norm_join(pieces: list[str]) -> str:
    """پیوستنِ قطعه‌های شکسته با فاصله + فروپاشیِ فاصله‌های چندگانه"""
    return re.sub(r"\s+", " ", " ".join(pieces)).strip()


def parse_pairs(lines: list[str], expect: int, q_first: str, q_last: str, label: str) -> list[dict]:
    """بلوک‌خوانیِ [A-EN][A-FA][Q-EN][Q-FA] — خروجی: [{q, a, qfa, afa}]"""
    # حذفِ جامپ
    seq: list[str] = []
    for l in lines:
        s = l.strip()
        if s.startswith("تمرین") or s.startswith("تم رین") or s.startswith("صفحه"):
            continue
        if is_junk(l):
            continue
        seq.append(s)
    # قطعه‌های سربرگِ FA پیش از نخستین سطرِ EN (مثل «آسیب ها» = ادامهٔ «صحبت کردن در مورد سالمتی و»)
    k = 0
    while k < len(seq) and is_fa(seq[k]):
        k += 1
    assert k < len(seq), f"{label}: no EN lines found"
    seq = seq[k:]

    items: list[dict] = []
    i = 0
    while i < len(seq):
        # بلوکِ A-EN: قطعه‌های EN تا نخستین FA
        a_en: list[str] = []
        while i < len(seq) and not is_fa(seq[i]):
            a_en.append(seq[i])
            i += 1
        a_fa: list[str] = []
        while i < len(seq) and is_fa(seq[i]):
            a_fa.append(seq[i])
            i += 1
        q_en: list[str] = []
        while i < len(seq) and not is_fa(seq[i]):
            q_en.append(seq[i])
            i += 1
        q_fa: list[str] = []
        while i < len(seq) and is_fa(seq[i]):
            q_fa.append(seq[i])
            i += 1
        if not (a_en and a_fa and q_en and q_fa):
            raise AssertionError(f"{label}: incomplete block at {i}: {seq[i:i+4]!r}")
        items.append({
            "a": norm_join(a_en),
            "afa": norm_join(a_fa),
            "q": norm_join(q_en),
            "qfa": norm_join(q_fa),
        })

    assert len(items) == expect, f"{label}: pairs={len(items)} expected={expect}"
    assert items[0]["q"] == q_first, f"{label}: first q={items[0]['q']!r} != {q_first!r}"
    assert items[-1]["q"] == q_last, f"{label}: last q={items[-1]['q']!r} != {q_last!r}"
    for it in items:
        assert it["q"].endswith("?"), f"{label}: Q not question: {it['q']!r}"
        assert not PERSIAN.search(it["q"]) and not PERSIAN.search(it["a"]), f"{label}: FA leak in EN: {it}"
        assert not it["q"].startswith(":") and not it["a"].startswith(":"), f"{label}: colon leak: {it}"
        assert "ترجمه" not in it["qfa"] and "ترجمه" not in it["afa"], f"{label}: footer leak: {it}"
    return items


def strip_stray_q(s: str) -> tuple[str, bool]:
    """حذفِ «؟» سرگردانِ انتهای ترجمهٔ پاسخ + پرچمِ وقوع"""
    if s.endswith("؟"):
        return s[:-1].rstrip(), True
    return s, False


print("=== ۱) پارسِ ۱۱ سکشن ===")
L1T1 = parse_pairs(
    slice_between(find_line(13, "تمرین1"), find_line(13, "تمرین2")), 5,
    "Are you hard-working?", "Are they upset?", "L1ت1")
L1T2 = parse_pairs(
    slice_between(find_line(13, "تمرین2"), find_line(13, "و تصاویر صفحات", span=2)), 6,
    "What’s your friend like?", "What are they like?", "L1ت2")
L2T1 = parse_pairs(
    slice_between(find_line(37, "تمرین1"), find_line(38, "تمرین2")), 4,
    "Are you visiting Tehran?", "Is Kate checking the map?", "L2ت1")
L2T2 = parse_pairs(
    slice_between(find_line(38, "تمرین2"), find_line(38, "و تصاویر صفحات", span=2)), 5,
    "Who is speaking English now?", "How are they traveling?", "L2ت2")
L3T1 = parse_pairs(
    slice_between(find_line(53, "تمرین1"), find_line(54, "تمرین2")), 4,
    "Do you buy new clothes for the New Year?", "Do Chinese people buy gold fish for the New Year?", "L3ت1")
L3T2 = parse_pairs(
    slice_between(find_line(54, "تمرین2"), find_line(55, "خواندن شعر حافظ", span=2)), 4,
    "Does he recite the Holy Quran at the turn of the year?", "Does your mom make a special food for Norooz?", "L3ت2")
L4C1 = parse_pairs(
    slice_between(find_line(67, "تمرین1"), find_line(67, "ترجمهpractice")), 10,
    "What is her job?", "How do you come to school?", "L4ت1(دوبلکی)")
L5T1 = parse_pairs(
    slice_between(find_line(79, "تمرین1"), find_line(79, "تمرین2")), 4,
    "Did the girls listen to the radio?", "Did Amir work with his computer?", "L5ت1")
L5T2 = parse_pairs(
    slice_between(find_line(79, "تمرین2"), find_line(80, "آهنگ زبان", span=3)), 5,
    "Who watched the movie last night?", "Where did she connect to the Internet?", "L5ت2")
L6T1 = parse_pairs(
    slice_between(find_line(91, "تم رین1"), find_line(92, "تمرین2")), 4,
    "Did Mina have an accident?", "Did you hurt your back?", "L6ت1")
L6T2 = parse_pairs(
    slice_between(find_line(92, "تمرین2"), find_line(93, "ضمایر مفعولی", span=2)), 4,
    "Who had an accident?", "Why did they have an accident?", "L6ت2")

SECTIONS = [L1T1, L1T2, L2T1, L2T2, L3T1, L3T2, L4C1, L5T1, L5T2, L6T1, L6T2]
assert sum(len(s) for s in SECTIONS) == 55, f"total={sum(len(s) for s in SECTIONS)}"
print(f"sections: {[len(s) for s in SECTIONS]} — total 55 OK")

# چاپ‌خطای محتواییِ L3ت1 ق۴: EN با Yes شروع می‌شود، FA با «نه»
err = L3T1[3]
assert err["a"] == "Yes, they don’t buy goldfish", f"erratum shape: {err['a']!r}"
assert err["afa"].startswith("نه"), f"erratum FA: {err['afa']!r}"
print("print-erratum L3ت1-4 confirmed (EN Yes / FA نه)")

# ————— ۲) ساختِ آیتم‌ها —————
EXPANSION = [
    ("isn’t", "is not"), ("aren’t", "are not"), ("don’t", "do not"),
    ("doesn’t", "does not"), ("didn’t", "did not"), ("’re not", " are not"),
    ("’s", " is"), ("’m", " am"),
]
PLACEHOLDER = "answer in English…"


def answer_variants(a: str, extra: list[str] | None = None) -> list[str]:
    """[چاپِ verbatim] + بی‌ویرگولِ Yes/No + بازشدنِ مخفف + ترکیبِ هر دو (+ استثناهای دستی)
    ترکیب لازم است: «No, they’re not.» → «No they are not» (دونگشتِ هم‌زمان)"""
    out = [a]

    def push(x):
        if x and x not in out:
            out.append(x)

    cl = a.replace(",", "", 1) if a.startswith(("Yes,", "No,")) else None
    pat, rep = next(((p, r) for p, r in EXPANSION if p in a), (None, None))
    exp = a.replace(pat, rep, 1) if pat else None
    comb = cl.replace(pat, rep, 1) if (cl and pat) else None
    for v in (cl, exp, comb):
        push(v)
    for e in extra or []:
        push(e)
    return out


def clean_afa(s: str) -> tuple[str, bool]:
    return strip_stray_q(s)


# اصلاح‌های هدفمندِ ترجمه (لنگر: مقدارِ پارس‌شده باید دقیقاً همین باشد)
FIXUPS = {
    ("L1ت1", 0): {"afa": "بله، من هستم"},        # بازسازیِ شکستِ RTL: «بله، من هست» + قطعهٔ «م ؟»
    ("L2ت1", 2): {"afa": "بله، او هست"},          # فاصلهٔ درون‌کلمه‌ایِ لایه: «هس ت»
}
FIXUPS_ORIG = {("L1ت1", 0): "بله، من هست", ("L2ت1", 2): "بله، او هس ت"}

SECTION_LIST = [
    ("L1ت1", L1T1), ("L1ت2", L1T2), ("L2ت1", L2T1), ("L2ت2", L2T2),
    ("L3ت1", L3T1), ("L3ت2", L3T2), ("L4ت1", L4C1), ("L5ت1", L5T1),
    ("L5ت2", L5T2), ("L6ت1", L6T1), ("L6ت2", L6T2),
]
for lab, sec in SECTION_LIST:
    for idx, it in enumerate(sec):
        key = (lab, idx)
        if key in FIXUPS:
            assert it["afa"] == FIXUPS_ORIG[key], f"fixup anchor broken {key}: {it['afa']!r}"
            it["afa"] = FIXUPS[key]["afa"]

stray_q_count = 0
ALL_ITEMS: list[dict] = []   # (bank, item)
BANK_DEF = [
    (3, "تمرین مکالمه درس اول (ص۱۷) — صحبت کردن در مورد شخصیت", [("L1ت1", L1T1), ("L1ت2", L1T2)]),
    (4, "تمرین مکالمه درس دوم (ص۳۱) — صحبت کردن در مورد سفر", [("L2ت1", L2T1), ("L2ت2", L2T2)]),
    (5, "تمرین مکالمه درس سوم (ص۵۱) — صحبت کردن در مورد جشن ها و مراسمات", [("L3ت1", L3T1), ("L3ت2", L3T2)]),
    (6, "تمرین مکالمه درس چهارم (ص۶۵) — صحبت کردن در مورد خدمات", [("L4ت1", L4C1)]),
    (7, "تمرین مکالمه درس پنجم (ص۸۳) — صحبت کردن در مورد رسانه", [("L5ت1", L5T1), ("L5ت2", L5T2)]),
    (8, "تمرین مکالمه درس ششم (ص۹۶) — صحبت کردن در مورد سالمتی و آسیب ها", [("L6ت1", L6T1), ("L6ت2", L6T2)]),
]
ERRATUM_ACCEPTED_EXTRA = ["No, they don’t buy goldfish", "No, they do not buy goldfish"]

for bank_no, title, parts in BANK_DEF:
    flat = [it for _, sec in parts for it in sec]
    n = len(flat)
    qs = []
    for i, it in enumerate(flat, start=1):
        afa, stray = clean_afa(it["afa"])
        stray_q_count += int(stray)
        extra = ERRATUM_ACCEPTED_EXTRA if (bank_no == 5 and i == 4) else None
        acc = answer_variants(it["a"], extra)
        qs.append({"it": it, "acc": acc, "afa": afa})
    for i, row in enumerate(qs, start=1):
        it, acc = row["it"], row["acc"]
        distractor = qs[i % n]["acc"][0]           # پاسخِ آیتمِ بعدیِ همان بانک (اسکافولدِ غلطِ درون‌بانکی)
        assert distractor != acc[0], f"bank{bank_no} item{i}: distractor==answer"
        ALL_ITEMS.append({
            "bank": bank_no, "title": title,
            "item": {
                "id": f"g9-l{bank_no}-{i}", "n": i, "category": "grammar", "kind": "typed",
                "question": it["q"], "options": [acc[0], distractor], "answer": 0,
                "accepted": acc, "placeholder": PLACEHOLDER,
                "translation": f"{it['qfa']} {row['afa']}",
            },
        })

assert len(ALL_ITEMS) == 55
assert stray_q_count == 4, f"stray ؟ count={stray_q_count}"   # جفت‌های ۲-۵ِ L1ت1
print(f"items built: 55; stray-؟ cleaned on {stray_q_count} translations")

# قفل‌های معناییِ نمونه‌ای (هر شش درس)
def item_of(bank: int, n: int) -> dict:
    return next(x["item"] for x in ALL_ITEMS if x["bank"] == bank and x["item"]["n"] == n)

locks = [
    (3, 1, "Are you hard-working?", "Yes, I am."),
    (3, 11, "What are they like?", "They are very kind."),
    (4, 9, "How are they traveling?", "They are traveling by train."),
    (5, 4, "Do Chinese people buy gold fish for the New Year?", "Yes, they don’t buy goldfish"),
    (6, 10, "How do you come to school?", "I take a bus."),
    (7, 6, "What did you do last week?", "I attended Fajr International Film Festival."),
    (7, 9, "Where did she connect to the Internet?", "She connected to the Internet at school."),
    (8, 8, "Why did they have an accident?", "Because they drove fast."),
]
for b, n, q, a in locks:
    it = item_of(b, n)
    assert it["question"] == q and it["accepted"][0] == a, f"lock broken {b}-{n}: {it}"
err4 = item_of(5, 4)
assert err4["accepted"] == [
    "Yes, they don’t buy goldfish", "Yes they don’t buy goldfish",
    "Yes, they do not buy goldfish", "Yes they do not buy goldfish",
    "No, they don’t buy goldfish", "No, they do not buy goldfish",
], err4["accepted"]
print("semantic locks OK (8 spot locks + erratum)")
