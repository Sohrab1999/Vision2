# -*- coding: utf-8 -*-
# r361 — استخراجِ «آزمون تشریحی پایان ترم دوم» یازدهم (ص۱۱۴-۱۱۶، کلیدِ چاپیِ ص۲۰۳) → tests-g11.json بانک‌های ۹۵-۱۰۸
# چهارده سکشنِ خودِ آزمون = چهارده بانک (الگوی r355/r357/r359):
#  (۱) کلمات داده‌شده ×۶ تایپی (بانکِ ۷واژه‌ای، اضافیِ souvenirs) | (۲) کلمات ناقص ×۲ تایپی |
#  (۳) چهارگزینه‌ای ×۲ | (۴) تصاویر ×۲ تایپی (سطرِ دوستونیِ RTL راست=۱۲/چپ=۱۱ → بازچینی) |
#  (۵) جمله‌سازی ×۱ تایپی (قفلِ چندمجموعهٔ ۱۳تایی) | (۶) خط بکش ×۴ تایپی (فاعل/مفعول/قیدِ حالت/قیدِ زمان) |
#  (۷) شکل فعل ×۴ تایپی | (۸) پسوند/پیشوند ×۴ تایپی (ترتیبِ چاپِ ۲۴,۲۲,۲۵,۲۳ → بازچینی؛ رانِ شکسته) |
#  (۹) متضاد ×۴ تایپی (ترتیبِ چاپِ ۲۸,۲۶,۲۹,۲۷ → بازچینی؛ کلیدِ چندواریانتیِ «begin or start») |
#  (۱۰) کلوز ×۴ تایپی (بلنک‌های ---30---…---33--- + استخرِ ۴واژه‌ای) |
#  (۱۱) درک مطلب ×۳ (۲ درست/نادرست + ۱ تایپی) | (۱۲) ضمیرِ them ×۱ MCQ (سطرِ RTL → لنگرِ حروف) |
#  (۱۳) ایدهٔ اصلی ×۱ MCQ (دوستونی → لنگرِ حروف) | (۱۴) هم‌معنی make ×۱ تایپی. جمع: ۳۹ آیتم.
# درس‌های برازیده: r359 (خانوادهٔ جامع + کلیدِ چندواریانتی)، r357 (l67 پسوند + l54 کلوز)، r358 (قفلِ چندمجموعه)،
# g10-l92/r359 (درست/نادرست + تایپیِ مخلوط)، r355 l52 (لنگرِ تصاویر)، l80 (بانکِ [bank:])، l90 (تک‌آیتمِ تک‌گزینه).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    print(f"  [page_clean] p{pno+1}: header anchor not found — raw kept")
    return raw


exam = "\n".join(page_clean(p) for p in (113, 114, 115))  # ص۱۱۴-۱۱۶
key_raw = "\n".join(page_clean(p) for p in (202,))  # ص۲۰۳

# لوکاتورِ دوطرفه: آزمون «:(پاسخنامه صفحه203)» ⇠ کلیدِ ص۲۰۳ «:(آزمون صفحه114 تا116)»
exam_sq = re.sub(r"\s+", " ", exam)
key_sq = re.sub(r"\s+", " ", key_raw)
assert re.search(r"پاسخنامه صفحه\s*203", exam_sq), "exam locator missing"
assert re.search(r"آزمون صفحه\s*114\s*تا\s*116", key_sq), "key locator missing"
# سربرگِ scramble در هر دو (لایه: «تش  ییح»/«پایاب»)
assert re.search(r"آزمون تش\s*ییح\s*پایاب ترم دوم", exam_sq), "exam scrambled title missing"
assert re.search(r"آزمون تش\s*ییح\s*پایاب ترم دوم", key_sq), "key scrambled title missing"
assert "How many people use social media" in exam, "exam pages incomplete"

# ---------- کلید: ۳۶ مدخلِ شماره‌دار (سکشن‌های ۱-۱۱) + سطرِ مشترکِ ۳۶-۳۹ ----------
# شکل‌های سکشن‌ها: [6,2,2,2,1,4,4,4,4,4,3] = ۳۶؛ سکشن۸ کلید: ۲۲,۲۴,۲۳,۲۵ و سکشن۹: ۲۶,۲۸,۲۷,۲۹
# (ترتیبِ چاپِ RTL) — بازچینی با شماره؛ سطرِ آخرِ کلید: «36. … 37. B 38. B 39. create»
SIZES = [6, 2, 2, 2, 1, 4, 4, 4, 4, 4, 3]
key_entries = []
for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", key_raw):
    body = re.sub(r"\s+", " ", m.group(2)).strip()
    if PERSIAN.search(body):
        continue
    key_entries.append((int(m.group(1)), body))
# مدخلِ ۱۱/۱۲ هم در یک سطرِ چاپیِ مشترک‌اند («11. My father … 12. If I have time…») — تقسیم
key_entries2 = []
for n, b in key_entries:
    m_split = re.match(r"^(\d{1,2})\.\s*(.*?)\s+12\.\s*(.+)$", f"{n}. {b}") if n == 11 else None
    if m_split:
        key_entries2.append((11, m_split.group(2).strip()))
        key_entries2.append((12, m_split.group(3).strip()))
    else:
        key_entries2.append((n, b))
key_entries = key_entries2
# سطرِ مشترکِ پایانی ۳۶-۳۹ را جدا می‌کنیم (۳۶ همراهِ ۳۷/۳۸/۳۹ در یک خطِ لایه است)
m_tail = re.search(
    r"36\.\s*(.+?)\s+37\.\s*([A-Da-d])\s+38\.\s*([A-Da-d])\s+39\.\s*([A-Za-z]+)", key_sq
)
assert m_tail, "key tail line (36-39) missing"
tail36, K37L, K38L, K39 = m_tail.group(1).strip(), m_tail.group(2).lower(), m_tail.group(3).lower(), m_tail.group(4)
key_entries = [(n, b) for n, b in key_entries if n <= 35]
key_entries.append((36, tail36))
nums = [n for n, _ in key_entries]
assert sorted(nums) == list(range(1, 37)), f"key numbering broken: {nums}"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert sorted(n for n, _ in grp) == list(range(pos + 1, pos + sz + 1)), f"key section broken at {pos}"
    grp.sort(key=lambda t: t[0])  # سکشن‌های ۸/۹ را بازچینی می‌کند؛ بقیه از قبل مرتب‌اند
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3L, K4, K5, K6, K7, K8, K9, K10, K11 = keys_by_sec
assert K1 == ["diversity", "recent", "identity", "ability", "culture", "lifestyle"], K1
assert K2 == ["metals", "century"], K2
assert K3L == ["a", "c"], K3L
assert K4 == ["My father (He) has bought a bag of rice.", "If I have time, I will wash the dishes."], K4
assert K5 == ["I have enough problems of my own without having to worry about yours."], K5
assert K6 == ["Our friend", "English", "fluently", "Last week"], K6
assert K7 == ["written", "answers", "to help", "watching"], K7
assert K8 == ["impossible", "rainy", "dangerous", "dislike"], K8
assert K9 == ["begin or start", "lose", "expensive", "slowly"], K9
assert K10 == ["addiction", "emotional", "decreases", "balanced"], K10
assert K11 == ["false", "true", "Millions of people use social media."], K11
# سکشن۱۲/۱۳ — کلیدِ حرفی با لنگرِ حروفِ چاپیِ گزینه‌ها
OPT37 = {"a": "people", "b": "media", "c": "magazines", "d": "millions"}
OPT38 = {"a": "media companies", "b": "two kinds of media", "c": "books and magazines", "d": "writing twitter posts"}
K12 = OPT37[K37L]
K13 = OPT38[K38L]
assert K12 == "media" and K13 == "two kinds of media", (K12, K13)
assert K39 == "create", K39

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤال/متنِ هر سکشن (درسِ r354) ----------
ANCHORS = [
    ("1. The animal ", "s1"),
    ("7. Gold and silver are valuable", "s2"),
    ("9. They’ve ", "s3"),
    ("12. What will you do if you have time?", "s4"),
    ("13. enough / without / yours / I / my own / about / problems / have / to worry / of / having", "s5"),
    ("14. Our friend lives in a very small village.", "s6"),
    ("18. Has your old grandfather ", "s7"),
    ("24. danger :", "s8"),
    ("28. cheap ≠", "s9"),
    ("emotional / balanced / addiction / decreases", "s10"),
    ("34. Magazines are types of social media.", "s11"),
    ("37. The underlined word ", "s12"),
    ("38. This passage mainly talks about", "s13"),
    ("39. Which word in the text is the synonym of", "s14"),
]
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    assert i >= 0, f"anchor missing: {tag}"
    starts.append(exam.rfind("\n", 0, i) + 1)
for k in range(len(ANCHORS) - 1):
    assert starts[k] < starts[k + 1], f"anchor order broken at {ANCHORS[k][1]} ({starts[k]} >= {starts[k+1]})"
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(ANCHORS) else len(exam)
    sec_slices[tag] = exam[starts[k]:end]

ANS_LINE = re.compile(r"(?m)^\s*\d{1,2}\.\s+[-–\s.?]+$")


def numbered_items(text: str) -> list[tuple[int, str]]:
    out = []
    for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", text):
        body = m.group(2).strip()
        if ANS_LINE.match(m.group(0).strip()):
            continue
        if PERSIAN.search(body):
            continue
        out.append((int(m.group(1)), body))
    return out


def assert_numbering(items, expect, tag, ordered=False):
    """شماره‌گذاریِ سراسریِ این آزمون (۱-۳۹) — expect = فهرستِ شماره‌های سراسریِ سکشن."""
    nums = [i for i, _ in items]
    assert sorted(nums) == expect, f"{tag}: {nums} != {expect}"
    assert len(items) == len(expect), f"{tag}: {len(items)} != {len(expect)}"
    if ordered:
        assert nums == expect, f"{tag} order: {nums}"


def normalize_blanks(body: str, width: int = 31) -> str:
    return re.sub(r"-{2,}(?:\s*-{2,})*", "-" * width, body)


def squash(body: str) -> str:
    return re.sub(r"\s+", " ", body).strip()


def opt_index(it: dict, key: str, tag: str) -> int:
    hits = [L for L, txt in it["opts"].items() if txt == key]
    assert len(hits) == 1, f"{tag}: key {key!r} matched {hits}"
    return "abcd".index(hits[0])


def wlist(s: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", re.sub(r"[’‘]", "'", s).lower().replace("/", " "))


# سکشن ۱ — کلمات داده‌شده (تایپی ×۶ + بانکِ ۷واژه‌ای با اضافیِ souvenirs)
m_bank = re.search(r"(?m)^(recent\s*/.*)$", exam[: starts[0]])
assert m_bank, "sec1: word bank line missing"
BANK1 = [w.strip() for w in m_bank.group(1).split("/")]
assert BANK1 == ["recent", "culture", "ability", "souvenirs", "diversity", "identity", "lifestyle"], BANK1
s1_items = [(n, normalize_blanks(squash(b))) for n, b in numbered_items(sec_slices["s1"])]
assert_numbering(s1_items, [1, 2, 3, 4, 5, 6], "sec1", ordered=True)
for _, b in s1_items:
    assert re.search(r"-{31}", b), f"sec1 blank broken: {b!r}"

# سکشن ۲ — کلمات ناقص (تایپی ×۲)
s2_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s2"])]
assert_numbering(s2_items, [7, 8], "sec2", ordered=True)
assert "valuable m_ _ _ _ _." in s2_items[0][1], s2_items[0]
assert "twenty-first c_ _ _ _ _ _." in s2_items[1][1], s2_items[1]

# سکشن ۳ — چهارگزینه‌ای (MCQ ×۲)
def parse_mcq2(raw: str, tag: str) -> list[dict]:
    items = []
    starts3 = [m.start() for m in re.finditer(r"(?m)^\d{1,2}\.\s", raw)]
    assert len(starts3) == 2, f"{tag}: item starts={len(starts3)}"
    prnums = [int(re.match(r"(\d{1,2})\.", raw[s:]).group(1)) for s in starts3]
    assert prnums == [9, 10], f"{tag}: print numbers {prnums}"
    for k3 in range(2):
        chunk = raw[starts3[k3] : starts3[k3 + 1] if k3 + 1 < 2 else len(raw)]
        opts = dict(re.findall(r"(?m)^\s*([a-d])\.\s+(.+)$", chunk))
        assert set(opts) == {"a", "b", "c", "d"}, f"{tag} Q{k3+1}: {sorted(opts)}"
        stem = normalize_blanks(squash(chunk.split("\n")[0]))
        stem = re.sub(r"^\d{1,2}\.\s+", "", stem)
        items.append({"n": k3 + 1, "stem": stem, "opts": {L: squash(t) for L, t in opts.items()}})
    return items


s3_items = parse_mcq2(sec_slices["s3"], "sec3")
assert s3_items[0]["opts"] == {"a": "decided", "b": "to decide", "c": "decide", "d": "deciding"}, s3_items[0]["opts"]
assert s3_items[1]["opts"] == {"a": "exciting", "b": "excite", "c": "excited", "d": "excitement"}, s3_items[1]["opts"]

# سکشن ۴ — تصاویر (تایپی ×۲؛ سطرِ دوستونیِ RTL: لایه ۱۲ را پیش از ۱۱ می‌دهد → بازچینی)
s4_items = sorted(numbered_items(sec_slices["s4"]), key=lambda t: t[0])
assert_numbering(s4_items, [11, 12], "sec4")
assert "What has your father bought?" in s4_items[0][1] and "What will you do if you have time?" in s4_items[1][1]

# سکشن ۵ — جمله‌سازی (تایپی ×۱؛ قفلِ چندمجموعهٔ ساقه⇄کلید — درسِ r358)
s5_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s5"])]
assert_numbering(s5_items, [13], "sec5", ordered=True)
s5_stem = re.sub(r"^\d{1,2}\.\s+", "", s5_items[0][1])
assert sorted(wlist(s5_stem)) == sorted(wlist(K5[0])), f"sec5 multiset lock broken\n  stem={wlist(s5_stem)}\n  key ={wlist(K5[0])}"
assert "/" in s5_stem, "sec5: jumbled slash stem expected"

# سکشن ۶ — خط بکش (تایپی ×۴؛ پرانتزِ توضیح verbatim)
s6_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s6"])]
assert_numbering(s6_items, [14, 15, 16, 17], "sec6", ordered=True)
for (n, b), expl in zip(s6_items, ["(subject)", "(object)", "(adverb of manner)", "(adverb of time)"]):
    assert b.endswith(expl), f"sec6 Q{n}: {b!r} !~ {expl}"

# سکشن ۷ — شکل صحیح افعال (تایپی ×۴)
s7_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s7"])]
assert_numbering(s7_items, [18, 19, 20, 21], "sec7", ordered=True)
for (n, b), verb in zip(s7_items, ["(write)", "(answer)", "(help)", "(watch)"]):
    assert b.endswith(verb), f"sec7 Q{n}: {b!r} !~ {verb}"
    assert re.search(r"-{31}", b), f"sec7 blank broken: {b!r}"

# سکشن ۸ — پسوند/پیشوند (تایپی ×۴؛ ترتیبِ چاپِ ۲۴,۲۲,۲۵,۲۳ → بازچینی؛ رانِ شکسته)
s8_raw = numbered_items(sec_slices["s8"])
assert_numbering(s8_raw, [22, 23, 24, 25], "sec8")
s8_items = sorted(s8_raw, key=lambda t: t[0])
AFFIX_POOL = "dis / im / ous / y"
for (n, b), root in zip(s8_items, ["possible", "rain", "danger", "like"]):
    assert re.match(rf"^{root}\s*:", squash(b)), f"sec8 Q{n} root mismatch: {b!r}"
# رانِ dashِ شکسته در چاپ (۲۳/۲۵) — حضورِ ران‌های ۱۱/۱۲تایی در سکشن را راستی‌آزمایی می‌کنیم
assert re.search(r"-{10,}\s+-{10,}", sec_slices["s8"]), "sec8 broken dash run not found"

# سکشن ۹ — متضاد (تایپی ×۴؛ ترتیبِ چاپِ ۲۸,۲۶,۲۹,۲۷ → بازچینی)
s9_raw = numbered_items(sec_slices["s9"])
assert_numbering(s9_raw, [26, 27, 28, 29], "sec9")
s9_items = sorted(s9_raw, key=lambda t: t[0])
for n, b in s9_items:
    assert "≠" in b, f"sec9 Q{n} without ≠: {b!r}"
    assert re.search(r"≠\s+-{20,}", squash(b)), f"sec9 Q{n} blank missing: {b!r}"

# سکشن ۱۰ — کلوز (تایپی ×۴؛ بلنک‌های ---N--- + استخرِ ۴واژه‌ای)
m_pool10 = re.search(r"(?m)^(emotional\s*/.*)$", sec_slices["s10"])
assert m_pool10, "sec10: pool line missing"
POOL10 = [w.strip() for w in m_pool10.group(1).split("/")]
assert POOL10 == ["emotional", "balanced", "addiction", "decreases"], POOL10
CLOZE = {
    30: "Bad habits and ---30--- can be harmful to health.",
    31: "The most important thing to enjoy a good life is having ---31--- health.",
    32: "Praying ---32--- stress and gives people a calm and ---33--- life.",
}
for nn, sent in CLOZE.items():
    assert sent in re.sub(r"\s+", " ", sec_slices["s10"]), f"sec10 sentence {nn} missing"
# سکشن ۱۱ — درک مطلب (۲ درست/نادرست + ۱ تایپی)
s11_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s11"])]
assert_numbering(s11_items, [34, 35, 36], "sec11", ordered=True)
assert "(True or False)" in s11_items[0][1] and "(True or False)" in s11_items[1][1]
s11_stems = [re.sub(r"\s*\(True or False\)\s*$", "", b).strip() for _, b in s11_items[:2]]

# سکشن ۱۲/۱۳ — MCQ با گزینه‌های سطری/دوستونیِ RTL (لایه به‌هم‌ریخته؛ ترتیب با لنگرِ حروف بازسازی)
s12_chunk = sec_slices["s12"]
m37 = re.search(r"37\.\s+(.+?)\n", s12_chunk)
assert m37, "sec12 stem missing"
S12_STEM = normalize_blanks(squash(m37.group(1)))
opts12 = dict(re.findall(r"(?m)^\s*([a-d])\.\s+(.+)$", s12_chunk))
assert opts12 == {"d": "millions", "c": "magazines", "b": "media", "a": "people"}, opts12  # ترتیبِ لایه
s13_chunk = sec_slices["s13"]
m38 = re.search(r"38\.\s+(.+?)\n", s13_chunk)
assert m38, "sec13 stem missing"
S13_STEM = normalize_blanks(squash(m38.group(1)))
opts13 = dict(re.findall(r"(?m)^\s*([a-d])\.\s+(.+)$", s13_chunk))
assert opts13 == {"b": "two kinds of media", "a": "media companies", "d": "writing twitter posts", "c": "books and magazines"}, opts13

# سکشن ۱۴ — هم‌معنی (تایپی ×۱؛ پرانتزِ نقطه‌چین verbatim)
s14_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s14"])]
assert_numbering(s14_items, [39], "sec14", ordered=True)
S14_STEM = re.sub(r"\(\s+(-{4,})\s*\)", r"(\1)", s14_items[0][1])
S14_STEM = re.sub(r"^\d{1,2}\.\s+", "", S14_STEM)
assert re.search(r"\(-{4,}\)$", S14_STEM), S14_STEM

# ---------- ساختِ بانک‌ها ----------
BANK_PREFIX = "تشریحی پایان‌ترم"
GROUP = "آزمون تشریحی پایان ترم دوم"
BANK1_pool = " [bank: recent / culture / ability / souvenirs / diversity / identity / lifestyle]"
POOL10_bank = " [bank: emotional / balanced / addiction / decreases]"
banks = []


def typed_bank(lesson, title, level, rows, category="vocab"):
    """rows: list of (question, accepted, options, placeholder) — answer همیشه ۰."""
    qs = []
    for i, (q, acc, opts, ph) in enumerate(rows, 1):
        assert opts[0] == acc[0], f"l{lesson} q{i}: options[0] != accepted[0]"
        qs.append(
            {
                "id": f"g11-l{lesson}-{i}",
                "n": i,
                "category": category,
                "kind": "typed",
                "question": q,
                "options": opts,
                "answer": 0,
                "accepted": acc,
                "placeholder": ph,
            }
        )
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


def mcq_bank(lesson, title, level, rows, category="vocab"):
    """rows: list of (question, options(list, a..d order), answer_index)."""
    qs = []
    for i, (q, opts, ans) in enumerate(rows, 1):
        qs.append(
            {
                "id": f"g11-l{lesson}-{i}",
                "n": i,
                "category": category,
                "question": q,
                "options": opts,
                "answer": ans,
            }
        )
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


# l95 — سکشن۱
rows95 = []
for (n, b), key in zip(s1_items, K1):
    stem = re.sub(r"^\d{1,2}\.\s+", "", b) + BANK1_pool
    distractors = [w for w in BANK1 if w != key][:3]
    rows95.append((stem, [key], [key] + distractors, "complete with the given words…"))
banks.append(typed_bank(95, f"{BANK_PREFIX} — کلمات داده‌شده (ص۱۱۴)", "تشریحی — تایپی", rows95, "vocab"))

# l96 — سکشن۲
rows96 = [
    (s2_items[0][1], ["metals"], ["metals", "medals", "models", "mentors"], "complete the word…"),
    (s2_items[1][1], ["century"], ["century", "country", "custody", "cruelty"], "complete the word…"),
]
banks.append(typed_bank(96, f"{BANK_PREFIX} — کلمات ناقص (ص۱۱۴)", "تشریحی — تایپی", rows96, "vocab"))

# l97 — سکشن۳ (۹=a، ۱۰=c)
banks.append(
    mcq_bank(
        97,
        f"{BANK_PREFIX} — تست چهارگزینه‌ای (ص۱۱۴)",
        "تشریحی — چهارگزینه‌ای",
        [
            (s3_items[0]["stem"], [s3_items[0]["opts"][L] for L in "abcd"], opt_index(s3_items[0], "decided", "sec3-Q1")),
            (s3_items[1]["stem"], [s3_items[1]["opts"][L] for L in "abcd"], opt_index(s3_items[1], "excited", "sec3-Q2")),
        ],
    )
)
banks[-1]["questions"][0]["category"] = "grammar"  # Q9 گرامری (decide+infinitive)
banks[-1]["questions"][1]["category"] = "vocab"  # Q10 واژگانی

# l98 — سکشن۴ (تصاویر؛ لنگرِ کلیدِ چاپی — قراردادِ l52)
K11_variants = [
    "My father (He) has bought a bag of rice.",
    "My father has bought a bag of rice.",
    "He has bought a bag of rice.",
]
rows98 = [
    (s4_items[0][1], K11_variants, [K11_variants[0], K4[1]], "answer the question in a complete sentence…"),
    (s4_items[1][1], [K4[1]], [K4[1], K11_variants[0]], "answer the question in a complete sentence…"),
]
banks.append(typed_bank(98, f"{BANK_PREFIX} — تصاویر و سؤال (ص۱۱۴)", "تشریحی — تایپی", rows98, "vocab"))

# l99 — سکشن۵
banks.append(
    typed_bank(
        99,
        f"{BANK_PREFIX} — جمله‌سازی (ص۱۱۴)",
        "تشریحی — جمله‌سازی",
        [(s5_stem, K5, K5, "build the sentence from the jumbled words…")],
        "grammar",
    )
)

# l100 — سکشن۶ (خط بکش؛ پاسخ = عبارتِ زیرخط‌دار)
rows100 = []
for i, ((n, b), key) in enumerate(zip(s6_items, K6)):
    stem = re.sub(r"^\d{1,2}\.\s+", "", b)
    others = [k for j, k in enumerate(K6) if j != i]
    rows100.append((stem, [key], [key] + others, "write the underlined word or phrase…"))
banks.append(typed_bank(100, f"{BANK_PREFIX} — خط بکش: اجزای جمله (ص۱۱۴)", "تشریحی — تایپی", rows100, "grammar"))

# l101 — سکشن۷
rows101 = []
for (n, b), key in zip(s7_items, K7):
    stem = re.sub(r"^\d{1,2}\.\s+", "", b)
    others = [k for j, k in enumerate(K7) if j != i] if False else [k for k in K7 if k != key]
    rows101.append((stem, [key], [key] + others, "write the correct form of the verb in parentheses…"))
banks.append(typed_bank(101, f"{BANK_PREFIX} — شکل صحیح افعال (ص۱۱۵)", "تشریحی — تایپی", rows101, "grammar"))

# l102 — سکشن۸ (فرمتِ l67: ریشه: [bank: …])
rows102 = []
for (n, b), key in zip(s8_items, K8):
    root = re.match(r"^([a-z]+)\s*:", b).group(1)
    stem = f"{root}: [bank: {AFFIX_POOL}]"
    others = [k for k in K8 if k != key]
    rows102.append((stem, [key], [key] + others, "add a prefix or suffix to make a meaningful word…"))
banks.append(typed_bank(102, f"{BANK_PREFIX} — پسوند و پیشوند (ص۱۱۵)", "تشریحی — تایپی", rows102, "vocab"))

# l103 — سکشن۹
rows103 = []
for (n, b), key in zip(s9_items, K9):
    word = re.match(r"^([a-z]+)\s*≠", b).group(1)
    stem = normalize_blanks(f"{word} ≠ {b.split('≠', 1)[1].strip()}")
    others = [k for k in K9 if k != key]
    rows103.append((stem, [key], [key] + others, "write the opposite…"))
banks.append(typed_bank(103, f"{BANK_PREFIX} — متضاد (ص۱۱۵)", "تشریحی — تایپی", rows103, "vocab"))

# l104 — سکشن۱۰ (کلوز؛ استخر در هر ساقه — قراردادِ l80)
rows104 = [
    (CLOZE[30] + POOL10_bank, ["addiction"], ["addiction", "emotional", "balanced", "decreases"], "complete with the given words…"),
    (CLOZE[31] + POOL10_bank, ["emotional"], ["emotional", "addiction", "balanced", "decreases"], "complete with the given words…"),
    (CLOZE[32] + POOL10_bank, ["decreases"], ["decreases", "addiction", "emotional", "balanced"], "complete with the given words…"),
    (CLOZE[32] + POOL10_bank, ["balanced"], ["balanced", "addiction", "emotional", "decreases"], "complete with the given words…"),
]
banks.append(typed_bank(104, f"{BANK_PREFIX} — کلوز عادت‌های بد (ص۱۱۵)", "تشریحی — تایپی", rows104, "vocab"))

# l105 — سکشن۱۱ (۲ درست/نادرست + ۱ تایپی)
qs105 = [
    {
        "id": "g11-l105-1",
        "n": 1,
        "category": "vocab",
        "question": s11_stems[0],
        "options": ["True", "False"],
        "answer": 1,  # false
    },
    {
        "id": "g11-l105-2",
        "n": 2,
        "category": "vocab",
        "question": s11_stems[1],
        "options": ["True", "False"],
        "answer": 0,  # true
    },
    {
        "id": "g11-l105-3",
        "n": 3,
        "category": "vocab",
        "kind": "typed",
        "question": s11_items[2][1],
        "options": [K11[2]],
        "answer": 0,
        "accepted": [K11[2]],
        "placeholder": "answer according to the reading passage…",
    },
]
banks.append({"lesson": 105, "title": f"{BANK_PREFIX} — درک مطلب شبکه‌های اجتماعی (ص۱۱۵)", "level": "تشریحی — درست/نادرست و تایپی", "count": 3, "questions": qs105})

# l106/l107 — سکشن‌های ۱۲/۱۳ (ترتیبِ گزینه‌ها = لنگرِ حروفِ چاپی a→d)
banks.append(
    mcq_bank(
        106,
        f"{BANK_PREFIX} — ضمیر «them» (ص۱۱۶)",
        "تشریحی — چهارگزینه‌ای",
        [(S12_STEM, [OPT37[L] for L in "abcd"], "abcd".index(K37L))],
    )
)
banks.append(
    mcq_bank(
        107,
        f"{BANK_PREFIX} — ایدهٔ اصلی متن (ص۱۱۶)",
        "تشریحی — چهارگزینه‌ای",
        [(S13_STEM, [OPT38[L] for L in "abcd"], "abcd".index(K38L))],
    )
)

# l108 — سکشن۱۴
banks.append(
    typed_bank(
        108,
        f"{BANK_PREFIX} — هم‌معنی «make» (ص۱۱۶)",
        "تشریحی — تایپی",
        [(S14_STEM, [K39], [K39], "write the synonym from the passage…")],
        "vocab",
    )
)

# ---------- ادغامِ idempotent ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
lessons = data["lessons"]
existing = {b["lesson"] for b in lessons}
if existing & set(range(95, 109)):
    # اجرای دوم — NO-OP: راستی‌آزماییِ پایداری
    import hashlib

    assert data["source"]["g11l4jame"]["extractedRound"] == "r361"
    assert len(lessons) == 108 and sum(b["count"] for b in lessons) == 1223
    print("NO-OP — banks already present; md5:", hashlib.md5(PATH.read_bytes()).hexdigest())
    raise SystemExit(0)
assert lessons[-1]["lesson"] == 94, f"registry tail mismatch: {lessons[-1]['lesson']}"

after = lessons + banks
new_ids = [q["id"] for b in banks for q in b["questions"]]
assert len(new_ids) == 39 and len(set(new_ids)) == 39, f"id problem: {len(new_ids)}"
all_ids = [q["id"] for b in after for q in b["questions"]]
assert len(all_ids) == len(set(all_ids)) == 1184 + 39, f"total ids={len(all_ids)}"

data["lessons"] = after
data["source"]["g11l4jame"] = {
    "extractedRound": "r361",
    "examPages": "114-116",
    "keyPages": "203",
    "sections": 14,
    "items": 39,
    "printQuirkCount": 11,
    "printQuirks": [
        "لوکاتورِ دوطرفهٔ خوداعلام: آزمونِ ص۱۱۴ «(پاسخنامه صفحه203)» ⇠ کلیدِ ص۲۰۳ «(آزمون صفحه114 تا116)» — ارقامِ لاتین در هر دو",
        "خانوادهٔ scrambleِ سربرگ: «تش  ییح» (تشریحی) و «پایاب» (پایان) در هر دو سربرگِ آزمون و کلید؛ «جمالت»، «اضاق  یم»، «سؤاالت» (آزمون) در برابرِ «سئواالت» (کلید — نوسانِ همزه)، «نوشی» (نوشتن)، «پرانی» (پرانتز)، «چیر» (چین)، «صحی( .ح» (شکل صحیح با پرانتزِ نمرهٔ شکسته)",
        "سکشن۴: دو سؤال در یک سطرِ دوستونیِ RTL چاپ شده‌اند (راست=۱۲ «What will you do…»، چپ=۱۱ «What has your father bought?») با خطوطِ پاسخِ جداگانهٔ ۱۱/۱۲ زیرشان — با شمارهٔ مدخل‌ها بازچینی شد",
        "سکشن۸: ترتیبِ چاپِ دوستونیِ RTL در آزمون و کلیدِ یکسان (۲۴,۲۲,۲۵,۲۳) — بازچینی با شماره؛ رانِ dashِ شکستهٔ «------------ -----------» در آیتم‌های ۲۳/۲۵ (پردة ص۱۰۳→ص۱۱۵)",
        "سکشن۹: ترتیبِ چاپِ به‌هم‌ریختهٔ (۲۸,۲۶,۲۹,۲۷) — بازچینی با شماره؛ کلیدِ چندواریانتیِ چاپیِ «begin or start» verbatim نگه داشته شد (تنها مدخلِ دوبخشی)",
        "گزینه‌های س۳۷ در یک سطرِ RTL چاپ شده‌اند (لایه: d,c,b,a — چپ‌به‌راستِ بصری با مختصاتِ x: a→d) و س۳۸ دوستونی است (سطرِ ۱: b,a / سطرِ ۲: d,c) — ترتیبِ گزینه‌ها با لنگرِ حروفِ چاپی بازسازی شد (a=people…)",
        "ص۱۱۶ پس از س۳۹ فقط جعبهٔ «Note:» خالی است (فضای پاسخِ آزاد) — آزمون در س۳۹ تمام می‌شود؛ ضمیمه از ص۱۱۷ (Vocabulary Tests — راندِ بعد)",
        "سکشن۱۱: کلیدِ مدخل‌های ۳۶-۳۹ در یک سطرِ چاپیِ مشترک است («36. Millions… 37. B 38. B 39. create») و مدخل‌های ۱۱/۱۲ نیز سطرِ مشترک دارند («11. My father… 12. If I have time…») — مدخل‌های ۳۷/۳۸ حرفی‌اند و با ستونِ حروفِ چاپیِ گزینه‌ها واژه شدند",
        "تصاویرِ سکشن۴ استخراج‌ناپذیرند — لنگرِ کلیدِ چاپی («a bag of rice» / «wash the dishes») سؤال‌ها را خوداتکا می‌کند (قراردادِ l52/r355)؛ واریانتِ پرانتزیِ «(He)» کلید + دو واریانتِ بازشده در accepted",
        "بلنک‌های dash (۳۰تاییِ سبزِ sz9) به عرضِ یکنواختِ ۳۱ نرمال شدند (قراردادِ r311/r357/r359)؛ خطوطِ پاسخِ بلندِ ~۱۰۷/۱۴۳تاییِ سکشن‌های ۴/۵ صدورِ چاپ‌اند و در ساقه‌ها نیامدند؛ پرانتزِ نقطه‌چینِ س۳۹ verbatim",
        "بدونِ ترجمهٔ چاپی (خانوادهٔ تشریحی)؛ متنِ ریدینگِ سکشن۱۱ فقط در گزاره‌های درست/نادرست و سؤالِ ۳۶ حضور دارد (قراردادِ کتابخانه)",
    ],
}

before_txt = PATH.read_text(encoding="utf-8")
out = json.dumps(data, ensure_ascii=False, indent=1) + "\n"
if out == before_txt:
    print("NO-OP — file unchanged")
else:
    PATH.write_text(out, encoding="utf-8")
    print(f"WROTE: {len(after)} banks, {sum(b['count'] for b in after)} items (+39 in 14 banks l95-l108)")
    import hashlib

    print("md5:", hashlib.md5(out.encode()).hexdigest())
