# -*- coding: utf-8 -*-
# r357 — استخراجِ «آزمون جامع تشریحی درس دوم» یازدهم (ص۷۴-۷۷، کلیدِ چاپیِ ص۱۹۱-۱۹۲) → tests-g11.json بانک‌های ۶۰-۷۳
# چهارده سکشنِ خودِ آزمون = چهارده بانک (الگوی r355):
#  (۱) کلمات ناقص ×۴ تایپی | (۲) کلمات داده‌شده ×۸ تایپی (بانکِ ۹واژه‌ای، یکی اضافی) |
#  (۳) کلمهٔ مناسب با حروفِ ناقص ×۴ تایپی | (۴) گزینهٔ متفاوت ×۴ تایپی | (۵) بهترین گزینه ×۴ MCQ |
#  (۶) بهترین گزینه ×۴ MCQ | (۷) جمله‌سازی ×۳ تایپی | (۸) پسوند/پیشوند ×۴ تایپی |
#  (۹) متضاد یا هم‌معنی ×۴ تایپی | (۱۰) شکلِ صحیحِ افعال ×۴ تایپی | (۱۱) افعال دوکلمه‌ای ×۴ تایپی |
#  (۱۲) اسم مصدرِ جدولِ سه‌ستونه ×۶ تایپی | (۱۳) کلوزِ اعتیاد ×۶ MCQ | (۱۴) درک مطلب ×۶ (۴ T/F + ۲ تایپی)
# جمع: ۶۵ آیتم → tests-g11 = ۹۵۸ در ۷۳ بانک.
# درس‌های برازیده: r355 (سیزده سکشن = سیزده بانک؛ کلوزِ بلنکِ شماره‌دار؛ T/F با options=["True","False"])،
# r354 (برشِ سکشن با لنگرِ اولین سؤال + گاردِ فارسی)، r351 (کلیدِ پارس‌شده از لایه، نه از حفظ)،
# r356 (لنگرِ متقابلِ دوطرفهٔ آزمون⇄کلید؛ پارسِ chunk-محور؛ عرضِ بلنکِ نرمال)، g10-l24 (درست/نادرست).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    """متنِ صفحه با حذفِ سربرگِ تکراری — regex تیره‌محورِ «هم[ـ]*کاران» (درسِ r354)."""
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    raise AssertionError(f"p{pno+1}: header anchor not found")


exam = "\n".join(page_clean(p) for p in (73, 74, 75, 76))  # ص۷۴-۷۷ (ص۷۸ فقط خطِ Note است)
key_raw = page_clean(190) + "\n" + page_clean(191)  # ص۱۹۱-۱۹۲

# ---------- لنگرهای متقابلِ آزمون ↔ کلید (سربرگِ هر دو، یکدیگر را تأیید می‌کنند — درسِ r356) ----------
assert re.search(r"پاسخنامه صفحه\s*191\s*و\s*192", exam), "exam header locator «پاسخنامه صفحه 191 و 192» missing"
assert re.search(r"آزمون صفحه\s*74\s*تا\s*77", key_raw), "key header locator «آزمون صفحه 74 تا 77» missing"
assert re.search(r"آزمون تش\s+ییح درس دوم", exam), "scrambled exam header missing"
assert re.search(r"پاسخنامه آزمون تش\s+ییح درس دوم", key_raw), "scrambled key header missing"

# ---------- کلید: ۵۹ مدخلِ شماره‌دار + جدولِ اسم مصدر (سکشن۱۲ بدونِ شماره) ----------
# سکشن۷ در چاپ دوستونی است («1. X     2. Y» در یک خط) — پارسِ دوستونی (درسِ این راند).
SIZES = [4, 8, 4, 4, 4, 4, 3, 4, 4, 4, 4, 6, 6]  # سکشن‌های ۱-۱۱ و ۱۳-۱۴ (سکشن۱۲ = جدول)
ENTRY = re.compile(r"(?:^|\s{3,})(\d{1,2})\.\s+(.+?)(?=\s{3,}\d{1,2}\.\s|$)")


def key_line_entries(line: str) -> list[tuple[int, str]]:
    out = []
    for m in ENTRY.finditer(line):
        body = re.sub(r"\s+", " ", m.group(2)).strip()
        if body and not PERSIAN.search(body):
            out.append((int(m.group(1)), body))
    return out


key_entries: list[tuple[int, str]] = []
for ln in key_raw.split("\n"):
    key_entries.extend(key_line_entries(ln))
assert len(key_entries) == 59, f"key entries={len(key_entries)} (expected 59)"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert [n for n, _ in grp] == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4, K5, K6, K7, K8, K9, K10, K11, K13, K14 = keys_by_sec

# قفل‌های نرمِ کلید
assert K1 == ["wakes", "influenced", "condition", "heartbeat"], K1
assert K3 == ["after", "gained", "blood", "cure"], K3
assert K4 == ["banana", "candy", "useful", "sailing"], K4
assert K5 == ["miracle", "decreases", "minerals", "won"], K5
assert K6 == ["forgotten", "riding", "believed", "using"], K6
assert len(K7) == 3 and K7[2].endswith("?") and all(k.endswith(".") for k in K7[:2]), K7
assert K8 == ["incorrect", "natural", "translator", "unimportant"], K8
assert K9 == ["give up", "stop", "turn off", "finish"], K9
assert K10 == ["has played", "living", "have seen", "travelling"], K10
assert K11 == ["in", "up", "out", "out"], K11
assert K13 == ["badly", "called", "sick", "hurt", "cure", "habit"], K13
assert K14[:4] == ["true", "false", "true", "false"], K14[:4]

# ---------- سکشن۱۲: جدولِ اسم مصدر از کلیدِ ص۱۹۲ (سطر-محور: Subject/Object/Prep × ۲ سطر) ----------
i12 = key_raw.find("Gerund as Subject")
assert i12 > 0, "sec12 table header not found in key"
seg12 = key_raw[i12 : key_raw.find("13", i12)]
words12 = [ln.strip() for ln in seg12.split("\n") if re.fullmatch(r"[A-Za-z]+", ln.strip())]
assert words12 == ["Playing", "walking", "doing", "Travelling", "reading", "answering"], words12
CLASS12 = {"Playing": "subject", "Travelling": "subject", "walking": "object", "reading": "object", "doing": "preposition", "answering": "preposition"}

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤالِ هر سکشن (درسِ r354) — یکتاییِ لنگر هم گارد می‌شود ----------
ANCHORS = [
    ("My mother often", "s1"),
    ("avoiding / balanced / goal", "s2"),
    ("I need someone to look", "s3"),
    ("carrot / tomato / banana / potato", "s4"),
    ("nobody died in the accident", "s5"),
    ("She told me her name", "s6"),
    ("written / letters / have / today", "s7"),
    ("al / un / or / in", "s8"),
    ("quit =", "s9"),
    ("1. He", "s10"),
    ("Passengers are requested", "s11"),
    ("I’m tired of doing the same job", "s12"),
    ("Addiction is when the body or mind", "s13"),
    ("A healthy diet or balanced diet", "s14"),
]
for anchor, tag in ANCHORS:
    assert exam.count(anchor) == 1, f"anchor {tag} not unique: {exam.count(anchor)}"
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    starts.append(exam.rfind("\n", 0, i) + 1)
for k in range(len(ANCHORS) - 1):
    assert starts[k] < starts[k + 1], f"anchor order broken at {ANCHORS[k][1]}"
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(starts) else len(exam)
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


def assert_numbering(items, n, tag):
    assert [i for i, _ in items] == list(range(1, n + 1)), f"{tag}: {[i for i,_ in items]}"
    assert len(items) == n, f"{tag}: {len(items)} != {n}"


def chunk_items(text: str, n: int, tag: str) -> list[tuple[int, str]]:
    """آیتم‌های چندخطی — برش با شروعِ «N.» و توقفِ رانِ تمام‌داش / رقمِ تنها / سربرگِ فارسی
    (درسِ r355/r356 + مرزِ صفحهٔ ص۷۵→۷۶ که جداکنندهٔ dash ندارد)."""
    raw = text.split("\n")
    idx = [i for i, ln in enumerate(raw) if re.match(r"^\d{1,2}\.\s", ln)]
    assert len(idx) == n, f"{tag}: item starts={len(idx)}"
    out = []
    for k in range(n):
        a, b = idx[k], idx[k + 1] if k + 1 < n else len(raw)
        kept = []
        for ln in raw[a:b]:
            if re.fullmatch(r"-{40,}\s*", ln):
                break
            if re.fullmatch(r"\d{1,2}\s*", ln):  # سربرگِ سکشنِ بعدی («12» تنها)
                break
            if PERSIAN.search(ln):
                break
            kept.append(ln)
        body = re.sub(r"\s+", " ", " ".join(kept)).strip()
        body = re.sub(r"^\d{1,2}\.\s+", "", body)
        out.append((k + 1, body))
    return out


def merge_dash_runs(body: str, width: int) -> str:
    return re.sub(r"-{2,}(?:\s*-{2,})+", "-" * width, body)


def fix_rtl_parens(body: str) -> str:
    """پرانتزِ RTL-واژگونِ لایه («)w__k__s(») → توکنِ برهنه (قراردادِ r355-l43)."""
    return re.sub(r"\)\s*([A-Za-z][A-Za-z_]*)\s*\(", r"\1", body)


# ---------- سکشن ۱ — کلمات ناقص (تایپی ×۴) ----------
s1_items = [(n, fix_rtl_parens(re.sub(r"\s+", " ", b).strip())) for n, b in numbered_items(sec_slices["s1"])]
assert_numbering(s1_items, 4, "sec1")
assert s1_items[0][1] == "My mother often w__k__s up early. But today she’s still asleep.", s1_items[0][1]
# قفل: کلید باید الگوی حروفِ ناقصِ همان ساقه را پر کند (هر رانِ __ = یک حرف)
for (n, stem), k in zip(s1_items, K1):
    tok = next(t for t in stem.split() if "__" in t).rstrip(".,?;:")
    rx = r".{1}".join(re.escape(p) for p in tok.split("__"))
    assert re.match(rx + r"$", k), f"sec1 Q{n}: key {k!r} vs pattern {tok!r}"

# ---------- سکشن ۲ — کلمات داده‌شده (تایپی ×۸ + بانکِ ۹واژه‌ای) ----------
m_bank = re.search(r"(?m)^(avoiding\s*/\s*balanced.*)$", sec_slices["s2"])
assert m_bank, "sec2: word bank line missing"
BANK2 = [w.strip() for w in m_bank.group(1).split("/")]
assert BANK2 == ["avoiding", "balanced", "goal", "decreased", "serving", "relationships", "emotional", "heart", "emergency"], BANK2
s2_items = []
for n, body in chunk_items(sec_slices["s2"], 8, "sec2"):
    body = merge_dash_runs(body, 28)
    s2_items.append((n, body))
assert_numbering(s2_items, 8, "sec2")
assert set(K2) <= set(BANK2), f"sec2 keys ∉ bank: {set(K2) - set(BANK2)}"
assert set(BANK2) - set(K2) == {"serving"}, f"sec2 extra word: {set(BANK2) - set(K2)}"

# ---------- سکشن ۳ — کلمهٔ مناسب با حروفِ ناقصِ «a _ _ _ _» (تایپی ×۴) ----------
s3_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s3"])]
assert_numbering(s3_items, 4, "sec3")
for (n, stem), k in zip(s3_items, K3):
    runs = re.findall(r"([A-Za-z])((?:\s*_\s*)+)", stem)
    assert runs, f"sec3 Q{n}: no incomplete run in {stem[:70]!r}"
    first, run = runs[0]
    n_slots = len(re.findall(r"_", run))
    assert re.match("^" + re.escape(first) + r".{" + str(n_slots) + "}$", k), f"sec3 Q{n}: key {k!r} vs {first}+{n_slots}"

# ---------- سکشن ۴ — گزینهٔ متفاوت (تایپی؛ گزینه‌ها = چهار چاپِ همان سؤال) ----------
s4_items = []
for n, body in numbered_items(sec_slices["s4"]):
    body = re.sub(r"\s+", " ", body).strip()
    cands = [c.strip() for c in body.split("/")]
    assert len(cands) == 4, f"sec4 Q{n}: {cands}"
    s4_items.append({"n": n, "cands": cands})
assert_numbering([(i["n"], "") for i in s4_items], 4, "sec4")
for it, k in zip(s4_items, K4):
    assert k in it["cands"], f"sec4 Q{it['n']}: key {k!r} ∉ {it['cands']}"


# ---------- سکشن‌های ۵ و ۶ — بهترین گزینه (MCQ؛ ماشینِ r354/r355) ----------
def parse_mcq(text: str, tag: str):
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    items, cur = [], None
    for ln in lines:
        mq = re.match(r"^(\d{1,2})\.\s+(.+)$", ln)
        mo = re.match(r"^([a-d])[.)]\s+(.+)$", ln)
        if mq and not mo:
            if PERSIAN.search(mq.group(2)):
                continue  # سربرگِ سکشنِ بعدی — سؤال نیست
            if cur:
                items.append(cur)
            cur = {"n": int(mq.group(1)), "stem": re.sub(r"\s+", " ", mq.group(2)).strip(), "opts": {}}
        elif mo and cur is not None:
            cur["opts"][mo.group(1)] = re.sub(r"\s+", " ", mo.group(2)).strip()
    if cur:
        items.append(cur)
    for it in items:
        assert set(it["opts"]) == {"a", "b", "c", "d"}, f"{tag} Q{it['n']}: opts={list(it['opts'])}"
    return items


def opt_index(it, key_text: str, tag: str) -> int:
    key_n = re.sub(r"\s+", " ", key_text).strip()
    hits = [L for L, txt in it["opts"].items() if txt == key_n]
    assert len(hits) == 1, f"{tag} Q{it['n']}: key {key_n!r} matched {hits} (opts={it['opts']})"
    return "abcd".index(hits[0])


s5_items = parse_mcq(sec_slices["s5"], "sec5")
assert_numbering([(i["n"], "") for i in s5_items], 4, "sec5")
A5 = [opt_index(it, k, "sec5") for it, k in zip(s5_items, K5)]
s6_items = parse_mcq(sec_slices["s6"], "sec6")
assert_numbering([(i["n"], "") for i in s6_items], 4, "sec6")
A6 = [opt_index(it, k, "sec6") for it, k in zip(s6_items, K6)]

# ---------- سکشن ۷ — جمله‌سازی (تایپی ×۳) ----------
s7_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s7"])]
assert_numbering(s7_items, 3, "sec7")
for n, body in s7_items:
    assert "/" in body, f"sec7 Q{n}: {body[:50]!r}"

# ---------- سکشن ۸ — پسوند/پیشوند (تایپی ×۴؛ ترتیبِ لایه RTL-شکسته ۱،۳،۲،۴) ----------
s8_items = sorted(numbered_items(sec_slices["s8"]), key=lambda x: x[0])
assert_numbering(s8_items, 4, "sec8")
s8_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in s8_items]
assert [b for _, b in s8_items] == ["correct:", "nature:", "translate:", "important:"], s8_items
AFFIXES8 = ["al", "un", "or", "in"]
for (n, stem), k in zip(s8_items, K8):
    root = stem.rstrip(":")[:4].lower()
    assert root in k.lower(), f"sec8 Q{n}: key {k!r} lacks root {root!r}"
    assert any(k.lower().startswith(a) or k.lower().endswith(a) for a in AFFIXES8), f"sec8 Q{n}: {k!r} has no pool affix"

# ---------- سکشن ۹ — متضاد یا هم‌معنی (تایپی ×۴؛ ترتیبِ لایه RTL-شکسته) ----------
s9_items = sorted(numbered_items(sec_slices["s9"]), key=lambda x: x[0])
assert_numbering(s9_items, 4, "sec9")
s9_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in s9_items]
assert [b for _, b in s9_items] == ["quit =", "prevent =", "turn on ≠", "begin ≠"], s9_items
for (n, stem), k in zip(s9_items, K9):
    assert PERSIAN.search(k) is None and k, f"sec9 Q{n}: bad key {k!r}"
    word = stem.split()[0]
    assert k.lower() != word.lower(), f"sec9 Q{n}: key == stem word"

# ---------- سکشن ۱۰ — شکلِ صحیحِ افعالِ پرانتزی (تایپی ×۴؛ آیتم۱ چندخطی) ----------
PAREN = re.compile(r"\(([^()]+)\)")
s10_items = []
for n, body in chunk_items(sec_slices["s10"], 4, "sec10"):
    body = merge_dash_runs(body, 40)
    m = PAREN.search(body)
    assert m, f"sec10 Q{n}: no parens in {body[:60]!r}"
    s10_items.append((n, body))
assert_numbering(s10_items, 4, "sec10")
for (n, stem), k in zip(s10_items, K10):
    verb = PAREN.search(stem).group(1).strip()
    assert verb.split()[0][:3].lower() in k.lower(), f"sec10 Q{n}: key {k!r} vs verb {verb!r} (قفلِ رادیکال)"

# ---------- سکشن ۱۱ — افعال دوکلمه‌ای (تایپی ×۴؛ آیتم۱ چندخطی) ----------
s11_items = []
for n, body in chunk_items(sec_slices["s11"], 4, "sec11"):
    body = merge_dash_runs(body, 24)
    s11_items.append((n, body))
assert_numbering(s11_items, 4, "sec11")
for k in K11:
    assert k in ("in", "up", "out", "on", "off", "down", "away"), f"sec11 key {k!r} not a particle"

# ---------- سکشن ۱۲ — اسم مصدرِ جدولِ سه‌ستونه (تایپی ×۶؛ خودِ جمله گِراندِ کلاس است) ----------
s12_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s12"])]
assert_numbering(s12_items, 4 + 2, "sec12")
G12 = []
for (n, stem), expected in zip(s12_items, ["doing", "Playing", "walking", "Travelling", "answering", "reading"]):
    hits = [w for w in words12 if re.search(rf"\b{re.escape(w)}\b", stem, re.IGNORECASE)]
    assert hits == [expected], f"sec12 Q{n}: gerund hits={hits} expected={expected!r}"
    G12.append({"n": n, "stem": stem, "word": expected, "cls": CLASS12[expected]})
assert sorted(g["word"].lower() for g in G12) == sorted(w.lower() for w in words12), "sec12: table↔sentence matching broken"

# ---------- سکشن ۱۳ — کلوزِ اعتیاد (MCQ ×۶؛ بلنکِ شماره‌دار — الگوی r355-l54) ----------
s13_raw = sec_slices["s13"]
lines13 = [ln for ln in s13_raw.split("\n")]
passage_lines, opt_groups, cur13 = [], {}, None
for ln in lines13:
    t = ln.strip()
    if re.fullmatch(r"[1-6]", t):
        cur13 = int(t)
        assert cur13 not in opt_groups, f"sec13: blank {cur13} duplicated"
        opt_groups[cur13] = {}
        continue
    mo = re.match(r"^([a-d])[.)]\s+(.+)$", t)
    if mo and cur13 is not None:
        opt_groups[cur13][mo.group(1)] = re.sub(r"\s+", " ", mo.group(2)).strip()
        continue
    if cur13 is None:
        passage_lines.append(ln)
passage = re.sub(r"\s+", " ", " ".join(passage_lines)).strip()
assert sorted(opt_groups) == [1, 2, 3, 4, 5, 6], sorted(opt_groups)
for n, opts in opt_groups.items():
    assert set(opts) == {"a", "b", "c", "d"}, f"sec13 blank {n}: {list(opts)}"
s13_sents = {}
for seg in re.split(r"(?<=[.!?])\s+", passage):
    for m in re.finditer(r"---\((\d)\)---", seg):
        s13_sents[int(m.group(1))] = seg.strip()
assert sorted(s13_sents) == [1, 2, 3, 4, 5, 6], sorted(s13_sents)
A13 = [opt_index({"n": n, "opts": opt_groups[n]}, k, "sec13") for n, k in zip(range(1, 7), K13)]

# ---------- سکشن ۱۴ — درک مطلب (۴ درست/نادرست + ۲ تایپی؛ الگوی r355-l55) ----------
s14_raw = sec_slices["s14"]
s14_items = []
for n, body in numbered_items(s14_raw):
    body = re.sub(r"\s+", " ", body).strip()
    s14_items.append({"n": n, "stem": body})
assert_numbering([(i["n"], "") for i in s14_items], 6, "sec14")
TF_KEYS = []
for it, k in zip(s14_items[:4], K14[:4]):
    assert re.search(r"\(\s*True or False\s*\)$", it["stem"]), f"sec14 Q{it['n']}: {it['stem'][-40:]!r}"
    assert k in ("true", "false"), f"sec14 Q{it['n']}: key {k!r}"
    TF_KEYS.append(0 if k == "true" else 1)
s14_norm = re.sub(r"\s+", " ", s14_raw)
passage14 = re.search(r"A healthy diet or balanced diet.*?Fats, oils, and sweets give calories, fats, and sugars\.", s14_norm)
assert passage14, "sec14: passage not found"
passage14_norm = passage14.group(0).strip().lower()
k5, k6 = K14[4], K14[5]
assert re.sub(r"\s+", " ", k5).lower() in passage14_norm, f"sec14 Q5 key not verbatim in passage: {k5!r}"
assert "chart that can be used to see how many servings of each food should be eaten each day" in passage14_norm, "sec14 Q6 key tail not in passage"

# ---------- هم‌پوشانی‌سنجی با بانک‌های پیشینِ یازدهم ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 60 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 60 exists — banks={before[0]} items={before[1]}")
    raise SystemExit(0)
prev_stems = set()
for les in data["lessons"]:
    for q in les["questions"]:
        prev_stems.add(re.sub(r"\s+", " ", q["question"]).strip().lower())
new_stems = (
    [b for _, b in s1_items]
    + [b for _, b in s2_items]
    + [b for _, b in s3_items]
    + ["/".join(i["cands"]) for i in s4_items]
    + [i["stem"] for i in s5_items]
    + [i["stem"] for i in s6_items]
    + [b for _, b in s7_items]
    + [b for _, b in s8_items]
    + [b for _, b in s9_items]
    + [b for _, b in s10_items]
    + [b for _, b in s11_items]
    + [g["stem"] for g in G12]
    + [s13_sents[n] for n in range(1, 7)]
    + [i["stem"] for i in s14_items]
)
dups = [s for s in new_stems if s.lower() in prev_stems]
assert not dups, f"overlap with prior banks: {dups[:3]}"


# ---------- ساختِ بانک‌ها ----------
def typed_q(bank: int, n: int, question: str, opts: list[str], answer_text: str, placeholder: str, category: str = "vocab"):
    ai = opts.index(answer_text)
    return {
        "id": f"g11-l{bank}-{n}",
        "n": n,
        "category": category,
        "kind": "typed",
        "question": question,
        "options": opts,
        "answer": ai,
        "accepted": [answer_text],
        "placeholder": placeholder,
    }


banks = []
BANK_TAG = "آزمون جامع تشریحی درس دوم"

# بانک ۶۰ — سکشن ۱: کلمات ناقص
q60 = []
for idx, ((n, stem), k) in enumerate(zip(s1_items, K1)):
    others = [K1[j] for j in range(4) if j != idx]
    q60.append(typed_q(60, n, stem, [k] + others, k, "complete the word…"))
banks.append({"lesson": 60, "title": "تشریحی جامع — کلمات ناقص (ص۷۴)", "level": "تشریحی — تایپی", "count": 4, "questions": q60})

# بانک ۶۱ — سکشن ۲: کلمات داده‌شده (بانکِ واژه در ساقه — الگوی r311)
BANK2_STR = " / ".join(BANK2)
q61 = []
for idx, ((n, stem), k) in enumerate(zip(s2_items, K2)):
    q_text = f"{stem} [bank: {BANK2_STR}]"
    others = [K2[j] for j in range(8) if j != idx]
    q61.append(typed_q(61, n, q_text, [k] + others[:3], k, "complete with the given words…"))
banks.append({"lesson": 61, "title": "تشریحی جامع — کلمات داده‌شده (ص۷۴)", "level": "تشریحی — تایپی", "count": 8, "questions": q61})

# بانک ۶۲ — سکشن ۳: کلمهٔ مناسب با حروفِ ناقص
q62 = []
for idx, ((n, stem), k) in enumerate(zip(s3_items, K3)):
    others = [K3[j] for j in range(4) if j != idx]
    q62.append(typed_q(62, n, stem, [k] + others, k, "write the word that fits the blanks…"))
banks.append({"lesson": 62, "title": "تشریحی جامع — کلمهٔ مناسب با حروف ناقص (ص۷۴)", "level": "تشریحی — تایپی", "count": 4, "questions": q62})

# بانک ۶۳ — سکشن ۴: گزینهٔ متفاوت (options = چهار چاپ؛ الگوی r355-l47)
q63 = []
for it, k in zip(s4_items, K4):
    q63.append(typed_q(63, it["n"], " / ".join(it["cands"]), it["cands"], k, "type the option that is different…"))
banks.append({"lesson": 63, "title": "تشریحی جامع — گزینهٔ متفاوت (ص۷۴)", "level": "تشریحی — تایپی", "count": 4, "questions": q63})

# بانک ۶۴ — سکشن ۵: بهترین گزینه (MCQ واژگان)
q64 = []
for it, ai in zip(s5_items, A5):
    q64.append({"id": f"g11-l64-{it['n']}", "n": it["n"], "category": "vocab", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 64, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۷۴)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q64})

# بانک ۶۵ — سکشن ۶: بهترین گزینه (MCQ گرامر)
q65 = []
for it, ai in zip(s6_items, A6):
    q65.append({"id": f"g11-l65-{it['n']}", "n": it["n"], "category": "grammar", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 65, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۷۵)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q65})

# بانک ۶۶ — سکشن ۷: جمله‌سازی (×۳ — داربست = خودِ پاسخ + دو پاسخِ دیگر؛ الگوی r355-l50)
q66 = []
for idx, ((n, stem), k) in enumerate(zip(s7_items, K7)):
    others = [K7[j] for j in range(3) if j != idx]
    q66.append(typed_q(66, n, stem, [k] + others, k, "make a sentence with the given words…", category="grammar"))
banks.append({"lesson": 66, "title": "تشریحی جامع — جمله‌سازی (ص۷۵)", "level": "تشریحی — جمله‌سازی", "count": 3, "questions": q66})

# بانک ۶۷ — سکشن ۸: پسوند/پیشوند (استخرِ وندها در ساقه — الگوی r311)
AFF_STR = " / ".join(AFFIXES8)
q67 = []
for idx, ((n, stem), k) in enumerate(zip(s8_items, K8)):
    q_text = f"{stem} [bank: {AFF_STR}]"
    others = [K8[j] for j in range(4) if j != idx]
    q67.append(typed_q(67, n, q_text, [k] + others, k, "add a prefix or suffix to make a meaningful word…"))
banks.append({"lesson": 67, "title": "تشریحی جامع — پسوندها و پیشوندها (ص۷۵)", "level": "تشریحی — تایپی", "count": 4, "questions": q67})

# بانک ۶۸ — سکشن ۹: متضاد یا هم‌معنی (علامتِ چاپی = / ≠ در ساقه حفظ شده)
q68 = []
for idx, ((n, stem), k) in enumerate(zip(s9_items, K9)):
    others = [K9[j] for j in range(4) if j != idx]
    q68.append(typed_q(68, n, stem, [k] + others, k, "write a synonym (=) or an antonym (≠)…"))
banks.append({"lesson": 68, "title": "تشریحی جامع — متضاد یا هم‌معنی (ص۷۵)", "level": "تشریحی — تایپی", "count": 4, "questions": q68})

# بانک ۶۹ — سکشن ۱۰: شکلِ صحیحِ افعال (پرانتزِ فعل حفظ شده — الگوی r356-l58)
q69 = []
for idx, ((n, stem), k) in enumerate(zip(s10_items, K10)):
    others = [K10[j] for j in range(4) if j != idx]
    q69.append(typed_q(69, n, stem, [k] + others, k, "write the correct form of the verb in parentheses…", category="grammar"))
banks.append({"lesson": 69, "title": "تشریحی جامع — شکل صحیح افعال (ص۷۵)", "level": "تشریحی — تایپی", "count": 4, "questions": q69})

# بانک ۷۰ — سکشن ۱۱: افعال دوکلمه‌ای (داربست = ذراتِ متمایزِ خودِ سکشن)
PARTICLES = ["in", "up", "out", "on", "off", "down"]
q70 = []
for idx, ((n, stem), k) in enumerate(zip(s11_items, K11)):
    others = [p for p in PARTICLES if p != k][:3]
    q70.append(typed_q(70, n, stem, [k] + others, k, "complete the two-word verb…"))
banks.append({"lesson": 70, "title": "تشریحی جامع — افعال دوکلمه‌ای (ص۷۵)", "level": "تشریحی — تایپی", "count": 4, "questions": q70})

# بانک ۷۱ — سکشن ۱۲: اسم مصدرِ جدولِ سه‌ستونه (داربست = شش مصدرِ خودِ جدول)
GERUNDS = [g["word"] for g in G12]
q71 = []
for idx, g in enumerate(G12):
    others = [GERUNDS[j] for j in range(6) if j != idx][:3]
    q71.append(typed_q(71, g["n"], g["stem"], [g["word"]] + others, g["word"], "type the gerund used in the sentence…", category="grammar"))
banks.append({"lesson": 71, "title": "تشریحی جامع — اسم مصدر، جدول سه‌ستونه (ص۷۶)", "level": "تشریحی — تایپی", "count": 6, "questions": q71})

# بانک ۷۲ — سکشن ۱۳: کلوزِ اعتیاد (الگوی r355-l54)
q72 = []
for n in range(1, 7):
    ai = A13[n - 1]
    q72.append({
        "id": f"g11-l72-{n}", "n": n, "category": "vocab",
        "question": s13_sents[n],
        "options": [opt_groups[n][L] for L in "abcd"], "answer": ai,
    })
banks.append({"lesson": 72, "title": "تشریحی جامع — کلوز اعتیاد (ص۷۶)", "level": "تشریحی — چهارگزینه‌ای", "count": 6, "questions": q72})

# بانک ۷۳ — سکشن ۱۴: درک مطلب (۴ درست/نادرست + ۲ تایپی — الگوی r355-l55)
q73 = []
for j, (it, ai) in enumerate(zip(s14_items[:4], TF_KEYS)):
    stem = re.sub(r"\s*\(\s*True or False\s*\)$", "", it["stem"])
    q73.append({"id": f"g11-l73-{it['n']}", "n": it["n"], "category": "vocab", "question": stem, "options": ["True", "False"], "answer": ai})
q73.append(typed_q(73, 5, s14_items[4]["stem"], [k5, k6], k5, "answer according to the reading passage…"))
q73.append(typed_q(73, 6, s14_items[5]["stem"], [k6, k5], k6, "answer according to the reading passage…"))
banks.append({"lesson": 73, "title": "تشریحی جامع — درک مطلب تغذیه (ص۷۶-۷۷)", "level": "تشریحی — درست/نادرست و تایپی", "count": 6, "questions": q73})

# ---------- نوشتن (idempotent — چکِ زودهنگام بالا انجام شد) ----------
data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+65)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
print("spot: l64 answers", [q["answer"] for q in q64], "| l65", [q["answer"] for q in q65], "| l72", [q["answer"] for q in q72], "| l73 TF", TF_KEYS)
