# -*- coding: utf-8 -*-
# r355 — استخراجِ «آزمون جامع تشریحی درس اول» یازدهم (ص۴۰-۴۲، کلیدِ ص۱۸۳) → tests-g11.json بانک‌های ۴۳-۵۵
# سیزده سکشنِ خودِ آزمون = سیزده بانک:
#  (۱) کلمات ناقص ×۴ تایپی | (۲) کلمات داده‌شده ×۸ تایپی (بانکِ ۹واژه‌ای، یکی اضافی) |
#  (۳) کلمهٔ مناسب با حروفِ ناقص ×۴ تایپی | (۴) بهترین گزینه ×۴ MCQ | (۵) گزینهٔ متفاوت ×۴ تایپی |
#  (۶) وصل کردنِ تعریف ×۴ تایپی | (۷) بهترین گزینه ×۴ MCQ | (۸) جمله‌سازی ×۲ تایپی |
#  (۹) اجزای جمله S/V/O/AI ×۴ تایپی | (۱۰) تصاویر و پرانتز ×۳ تایپی | (۱۱) خط زیر گزینهٔ صحیح ×۴ تایپی |
#  (۱۲) کلوزِ قاره‌ها ×۶ MCQ | (۱۳) درک مطلبِ زبان اشاره ×۶ (۲ تایپی + ۴ درست/نادرست). جمع: ۵۷ آیتم.
# درس‌های برازیده: r354 (برشِ سکشن با لنگرِ اولین سؤال + گاردِ فارسیِ پارسر)، r351 (کلید هرگز از حفظ —
# پارسِ برنامه‌ای از ص۱۸۳ با شماره‌گذاریِ بازشونده)، r311 (بانکِ واژه به‌صورتِ [bank: …] در ساقه)،
# g10-l23 (کلوزِ بلنکِ شماره‌دار)، g10-l24 (درست/نادرست: options=["True","False"])، r354 (قراردادِ تایپی:
# accepted=[options[answer]] + placeholder).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    """متنِ صفحه با حذفِ سربرگِ تکراری — درسِ r354: regex تیره‌محورِ «هم[ـ]*کاران»."""
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    raise AssertionError(f"p{pno+1}: header anchor not found")


exam = "\n".join(page_clean(p) for p in (39, 40, 41))  # ص۴۰-۴۲
key_raw = page_clean(182)  # ص۱۸۳

# ---------- کلید: ۵۷ مدخلِ شماره‌دار با شماره‌گذاریِ بازشونده (۴/۸/۴/۴/۴/۴/۴/۲/۴/۳/۴/۶/۶) ----------
SIZES = [4, 8, 4, 4, 4, 4, 4, 2, 4, 3, 4, 6, 6]
key_entries = []
for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", key_raw):
    body = re.sub(r"\s+", " ", m.group(2)).strip()
    if PERSIAN.search(body):
        continue
    key_entries.append((int(m.group(1)), body))
assert len(key_entries) == 57, f"key entries={len(key_entries)} (expected 57)"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert [n for n, _ in grp] == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4, K5, K6, K7, K8, K9, K10, K11, K12, K13 = keys_by_sec

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤال هر سکشن (درسِ r354) ----------
ANCHORS = [
    ("After a long and emotional", "s1"),
    ("It’s the good weather that makes Iran", "s2"),
    ("She cannot hear. You must try to explain", "s3"),
    ("In some parts of Asia and Africa, milk", "s4"),
    ("lots of / many / a lot of / a little", "s5"),
    ("A person who comes from another country", "s6"),
    ("There are too", "s7"),
    ("students / there / the / in / many / are / class / how?", "s8"),
    ("They study English at school every day.", "s9"),
    ("I eat three", "s10"),
    ("Sometimes the prices in the local shop", "s11"),
    ("A continent is a large area of the land", "s12"),
    ("A sign language is a way of communicating", "s13"),
]
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    assert i >= 0, f"anchor missing: {tag}"
    starts.append(exam.rfind("\n", 0, i) + 1)
for k in range(len(ANCHORS) - 1):
    assert starts[k] < starts[k + 1], f"anchor order broken at {ANCHORS[k][1]}"
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(starts) else len(exam)
    sec_slices[tag] = exam[starts[k]:end]

ANS_LINE = re.compile(r"(?m)^\s*\d{1,2}\.\s+[-–\s.?]+$")


def numbered_items(text: str) -> list[tuple[int, str]]:
    """جفت‌های «N. متن» — خطوطِ پاسخِ نقطه‌چین و سربرگ‌های فارسی را نمی‌گیرد (گاردِ r354)."""
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


def merge_dash_runs(body: str, width: int = 28) -> str:
    """ران‌های شکستهٔ بین‌خطیِ dash («------⏎-----») در یک جای‌خالیِ پیوسته ادغام (قرارداد r311)."""
    return re.sub(r"-{2,}(?:\s*-{2,})+", "-" * width, body)


# سکشن ۱ — کلمات ناقص (تایپی ×۴)
s1_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s1"])]
assert_numbering(s1_items, 4, "sec1")

# سکشن ۲ — کلمات داده‌شده (تایپی ×۸ + بانکِ ۹واژه‌ای) — خطِ بانک پیش از لنگرِ اولین سؤال است
m_bank = re.search(r"(?m)^(despite\s*/\s*society.*)$", exam[: starts[1]])
assert m_bank, "sec2: word bank line missing"
BANK2 = [w.strip() for w in m_bank.group(1).split("/")]
assert BANK2 == ["despite", "society", "region", "native", "make up", "range", "access", "ability", "popular"], BANK2
s2_items = []
s2_raw = sec_slices["s2"]
_starts2 = [m.start() for m in re.finditer(r"(?m)^\d{1,2}\.\s", s2_raw)]
assert len(_starts2) == 8, f"sec2 item starts={len(_starts2)}"
for k2 in range(8):
    chunk = s2_raw[_starts2[k2] : _starts2[k2 + 1] if k2 + 1 < 8 else len(s2_raw)]
    # برش در جداکنندهٔ تمام‌داشِ سکشن (≥۴۰ تیره) — رانِ شکستهٔ آیتم۴ (۲۳ تیره) دست‌نخورده می‌ماند
    kept = []
    for ln in chunk.split("\n"):
        if re.fullmatch(r"-{40,}\s*", ln):
            break
        kept.append(ln)
    body = re.sub(r"\s+", " ", " ".join(kept)).strip()
    body = re.sub(r"^\d{1,2}\.\s+", "", body)
    body = merge_dash_runs(body)
    n = k2 + 1
    s2_items.append((n, body))
assert_numbering(s2_items, 8, "sec2")
assert "in our ---------------------------- ." in s2_items[3][1], s2_items[3][1]

# سکشن ۳ — کلمهٔ مناسب با حروفِ ناقصِ «m _ _ _ _» (تایپی ×۴)
s3_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s3"])]
assert_numbering(s3_items, 4, "sec3")


def incomplete_regex(token: str) -> str:
    """«expl__n__tion» → regexِ «expl.tion» (هر رانِ __ = دقیقاً یک حرف)؛ «m _ _ _ _» → «m....» با dotهای جدا."""
    t = token.replace(" _ ", "_").replace(" _", "_").replace("_ ", "_")
    parts = [re.escape(p) for p in t.split("_") if p != ""]
    return r"".join(parts)


def skeleton_regex(stem: str, pat: str) -> str:
    """از ساقه، توکنِ حاویِ الگوی ناقص را بیاب و regexِ قفل بساز."""
    for tok in stem.split():
        if "__" in tok or re.fullmatch(r"(?:_ )+_|_", tok):
            pass
    # توکن‌های دارای __ یا توالیِ «_»:
    toks = re.findall(r"\S*(?:__|_)\S*", stem.replace(" _ ", "_").replace(" _", "_").replace("_ ", "_"))
    assert toks, f"no incomplete token in {stem[:60]!r}"
    rx = incomplete_regex(toks[0])
    return "^" + rx + "$"


# قفلِ سکشن ۱ و ۳: کلید باید الگوی حروفِ ناقصِ همان ساقه را پر کند
for (n, stem), k in zip(s1_items, K1):
    tok = next(t for t in stem.split() if "__" in t).rstrip(".,?;:")
    rx = "^" + r"".join(re.escape(p) for p in tok.split("__") if p != "").replace(r"\_", "") + "$"
    # «expl__n__tion» → قطعاتِ literal بینِ ران‌های __؛ هر ران = یک حرف
    parts = [p for p in tok.split("__")]
    body = r".{1}".join(re.escape(p) for p in parts)
    assert re.match(body + r"$", k), f"sec1 Q{n}: key {k!r} vs pattern {tok!r}"
for (n, stem), k in zip(s3_items, K3):
    slots = stem.count("_")
    letters = re.sub(r"[ _]", "", stem)
    m = re.search(r"([A-Za-z](?:\s*_\s*)+)", stem)  # حرفِ آغازینِ متصل
    pat = re.escape(letters) + r"\.{" + str(slots) + "}$" if False else None
    # «m _ _ _ _» → حروفِ پیوستهٔ چاپی = m + ۴ جای خالی؛ کلید = m + ۴ حرف
    bare = re.sub(r"[ _]+", "", stem)
    # فقط توکنِ ناقصِ انتهای معنی‌دار: در این سکشن الگو داخلِ جمله است — الگو را از « _ » ران‌ها بساز
    runs = re.findall(r"([A-Za-z])((?:\s*_\s*)+)", stem)
    assert runs, f"sec3 Q{n}: no incomplete run in {stem[:70]!r}"
    first, run = runs[0]
    n_slots = len(re.findall(r"_", run))
    rx = "^" + re.escape(first) + r".{" + str(n_slots) + "}$"
    assert re.match(rx, k), f"sec3 Q{n}: key {k!r} vs {first}+{n_slots} slots"

assert set(K2) <= set(BANK2), f"sec2 keys ∉ bank: {set(K2) - set(BANK2)}"
assert set(BANK2) - set(K2) == {"range"}, f"sec2 extra word: {set(BANK2) - set(K2)}"


# سکشن ۴ و ۷ — MCQ (ماشینِ r354)
def parse_mcq(text: str, tag: str):
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    items, cur = [], None
    for ln in lines:
        mq = re.match(r"^(\d{1,2})\.\s+(.+)$", ln)
        mo = re.match(r"^([a-d])[.)]\s+(.+)$", ln)
        if mq and not mo:
            if PERSIAN.search(mq.group(2)):
                continue  # سربرگِ سکشنِ بعدی — سؤال نیست (درسِ r354)
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


s4_items = parse_mcq(sec_slices["s4"], "sec4")
assert_numbering([(i["n"], "") for i in s4_items], 4, "sec4")
A4 = [opt_index(it, k, "sec4") for it, k in zip(s4_items, K4)]

# سکشن ۵ — گزینهٔ متفاوت (تایپی؛ گزینه‌ها = چهار چاپِ همان سؤال)
s5_items = []
for n, body in numbered_items(sec_slices["s5"]):
    body = re.sub(r"\s+", " ", body).strip()
    cands = [c.strip() for c in body.split("/")]
    assert len(cands) == 4, f"sec5 Q{n}: {cands}"
    s5_items.append({"n": n, "cands": cands})
assert_numbering([(i["n"], "") for i in s5_items], 4, "sec5")
for it, k in zip(s5_items, K5):
    assert k in it["cands"], f"sec5 Q{it['n']}: key {k!r} ∉ {it['cands']}"

# سکشن ۶ — وصل کردنِ تعریف (تایپی؛ استخرِ چهارواژه‌ایِ a-d)
s6_raw = sec_slices["s6"]
pool_lines = re.findall(r"(?m)^([a-d])\.\s+(.+)$", s6_raw)
POOL6 = [w.strip() for _, w in pool_lines]
assert POOL6 == ["specific", "vary", "foreigner", "society"], POOL6
s6_items = []
for n, body in numbered_items(s6_raw):
    body = re.sub(r"\s+", " ", body).strip()
    assert body.endswith("(--------------)"), f"sec6 Q{n}: {body[-40:]!r}"
    s6_items.append((n, body))
assert_numbering(s6_items, 4, "sec6")
for k in K6:
    assert k in POOL6, f"sec6 key {k!r} ∉ pool"

s7_items = parse_mcq(sec_slices["s7"], "sec7")
assert_numbering([(i["n"], "") for i in s7_items], 4, "sec7")
A7 = [opt_index(it, k, "sec7") for it, k in zip(s7_items, K7)]

# سکشن ۸ — جمله‌سازی (تایپی ×۲)
s8_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s8"])]
assert_numbering(s8_items, 2, "sec8")
for n, body in s8_items:
    assert "/" in body, f"sec8 Q{n}: {body[:50]!r}"

# سکشن ۹ — اجزای جمله (تایپی ×۴؛ کلیدِ برچسب‌دارِ S/V/O/AI)
s9_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices["s9"])]
assert_numbering(s9_items, 4, "sec9")
K9_canon = []
for k in K9:
    c = re.sub(r"\s+", " ", k).strip()
    c = re.sub(r"\s+(S|V|O|AI):", r" | \1:", c)
    assert re.match(r"^S: .+ \| V: .+ \| O: .+", c), f"sec9 key shape: {c!r}"
    K9_canon.append(c)

# سکشن ۱۰ — تصاویر و پرانتز (تایپی ×۳)
s10_items = []
for n, body in numbered_items(sec_slices["s10"]):
    body = re.sub(r"\s+", " ", body).strip()
    body = merge_dash_runs(body, width=42)
    assert re.search(r"\((loaf|cup|slice)\)$", body), f"sec10 Q{n}: {body[-40:]!r}"
    s10_items.append((n, body))
assert_numbering(s10_items, 3, "sec10")

# سکشن ۱۱ — خط زیر گزینهٔ صحیح (تایپیِ پرانتزی ×۴)
PAREN = re.compile(r"\(([^()]+)\)")
s11_items = []
for n, body in numbered_items(sec_slices["s11"]):
    body = re.sub(r"\s+", " ", body).strip()
    m = PAREN.search(body)
    assert m, f"sec11 Q{n}: no parens in {body[:60]!r}"
    cands = [c.strip() for c in m.group(1).split("/")]
    assert len(cands) == 2, f"sec11 Q{n}: {cands}"
    s11_items.append({"n": n, "stem": body, "cands": cands})
assert_numbering([(i["n"], "") for i in s11_items], 4, "sec11")
for it, k in zip(s11_items, K11):
    assert k in it["cands"], f"sec11 Q{it['n']}: key {k!r} ∉ {it['cands']}"

# سکشن ۱۲ — کلوزِ قاره‌ها (MCQ ×۶؛ بلنکِ شماره‌دار — الگوی g10-l23)
s12_raw = sec_slices["s12"]
m_pass = re.search(r"(?ms)^\s+A continent.*?(?=^\s*1\s+a\.\s+appeared)", s12_raw)
assert m_pass, "sec12: passage not found"
passage = re.sub(r"\s+", " ", m_pass.group(0)).strip()
opt_lines = re.findall(r"(?m)^(?:(\d)\s+)?([a-d])\.\s+(.+)$", s12_raw)
cloze_opts = {}
order = []
for num, letter, txt in opt_lines:
    txt = re.sub(r"\s+", " ", txt).strip()
    if num:
        n = int(num)
        assert n not in cloze_opts, f"sec12: blank {n} duplicated"
        cloze_opts[n] = {}
        order.append(n)
    assert order, "sec12: option before first blank"
    cloze_opts[order[-1]][letter] = txt
assert order == [1, 2, 3, 4, 5, 6], order
for n, opts in cloze_opts.items():
    assert set(opts) == {"a", "b", "c", "d"}, f"sec12 blank {n}: {list(opts)}"
s12_sents = {}
for seg in re.split(r"(?<=[.!?])\s+", passage):
    for m in re.finditer(r"---\((\d)\)---", seg):
        s12_sents[int(m.group(1))] = seg.strip()
assert sorted(s12_sents) == [1, 2, 3, 4, 5, 6], sorted(s12_sents)
A12 = [opt_index({"n": n, "opts": cloze_opts[n]}, k, "sec12") for n, k in zip(range(1, 7), K12)]

# سکشن ۱۳ — درک مطلب (۲ تایپی + ۴ درست/نادرست)
s13_raw = sec_slices["s13"]
s13_items = []
for n, body in numbered_items(s13_raw):
    body = re.sub(r"\s+", " ", body).strip()
    s13_items.append({"n": n, "stem": body})
assert_numbering([(i["n"], "") for i in s13_items], 6, "sec13")
TF_KEYS = []
for it, k in zip(s13_items[2:], K13[2:]):
    assert re.search(r"\(True or False\)$", it["stem"]), f"sec13 Q{it['n']}: {it['stem'][-40:]!r}"
    assert k in ("true", "false"), f"sec13 Q{it['n']}: key {k!r}"
    TF_KEYS.append(0 if k == "true" else 1)

# ---------- هم‌پوشانی‌سنجی با بانک‌های پیشینِ یازدهم (ساقهٔ نرمال‌شده — درسِ r311) ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 43 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 43 exists — banks={before[0]} items={before[1]}")
    raise SystemExit(0)
prev_stems = set()
for les in data["lessons"]:
    for q in les["questions"]:
        prev_stems.add(re.sub(r"\s+", " ", q["question"]).strip().lower())
new_stems = (
    [b for _, b in s1_items]
    + [b for _, b in s2_items]
    + [b for _, b in s3_items]
    + [i["stem"] for i in s4_items]
    + ["/".join(i["cands"]) for i in s5_items]
    + [b for _, b in s6_items]
    + [i["stem"] for i in s7_items]
    + [b for _, b in s8_items]
    + [b for _, b in s9_items]
    + [b for _, b in s10_items]
    + [i["stem"] for i in s11_items]
    + [s12_sents[n] for n in range(1, 7)]
    + [i["stem"] for i in s13_items]
)
dups = [s for s in new_stems if s.lower() in prev_stems]
assert not dups, f"overlap with prior banks: {dups[:3]}"

# ---------- ساختِ بانک‌ها ----------
def typed_q(bank: int, n: int, question: str, opts: list[str], answer_text: str, placeholder: str, category: str = "vocab", answer_idx: int | None = None):
    ai = opts.index(answer_text) if answer_idx is None else answer_idx
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
BANK_TAG = "آزمون جامع تشریحی درس اول"

# بانک ۴۳ — سکشن ۱: کلمات ناقص
q43 = []
for idx, ((n, stem), k) in enumerate(zip(s1_items, K1)):
    others = [K1[j] for j in range(4) if j != idx]
    q43.append(typed_q(43, n, stem, [k] + others, k, "complete the word…"))
banks.append({"lesson": 43, "title": "تشریحی جامع — کلمات ناقص (ص۴۰)", "level": "تشریحی — تایپی", "count": 4, "questions": q43})

# بانک ۴۴ — سکشن ۲: کلمات داده‌شده (بانکِ واژه در ساقه — الگوی r311)
BANK2_STR = " / ".join(BANK2)
q44 = []
for idx, ((n, stem), k) in enumerate(zip(s2_items, K2)):
    q_text = f"{stem} [bank: {BANK2_STR}]"
    others = [K2[j] for j in range(8) if j != idx]
    q44.append(typed_q(44, n, q_text, [k] + others[:3], k, "complete with the given words…"))
banks.append({"lesson": 44, "title": "تشریحی جامع — کلمات داده‌شده (ص۴۰)", "level": "تشریحی — تایپی", "count": 8, "questions": q44})

# بانک ۴۵ — سکشن ۳: کلمهٔ مناسب با حروفِ ناقص
q45 = []
for idx, ((n, stem), k) in enumerate(zip(s3_items, K3)):
    others = [K3[j] for j in range(4) if j != idx]
    q45.append(typed_q(45, n, stem, [k] + others, k, "write the word that fits the blanks…"))
banks.append({"lesson": 45, "title": "تشریحی جامع — کلمهٔ مناسب با حروف ناقص (ص۴۰)", "level": "تشریحی — تایپی", "count": 4, "questions": q45})

# بانک ۴۶ — سکشن ۴: بهترین گزینه (MCQ)
q46 = []
for it, ai in zip(s4_items, A4):
    q46.append({"id": f"g11-l46-{it['n']}", "n": it["n"], "category": "vocab", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 46, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۴۰)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q46})

# بانک ۴۷ — سکشن ۵: گزینهٔ متفاوت (options = چهار چاپ؛ answer = اندیسِ متفاوت)
q47 = []
for it, k in zip(s5_items, K5):
    q47.append(typed_q(47, it["n"], " / ".join(it["cands"]), it["cands"], k, "type the option that is different…"))
banks.append({"lesson": 47, "title": "تشریحی جامع — گزینهٔ متفاوت (ص۴۰)", "level": "تشریحی — تایپی", "count": 4, "questions": q47})

# بانک ۴۸ — سکشن ۶: وصل کردنِ تعریف (استخر در ساقه — الگوی r311)
POOL6_STR = " / ".join(POOL6)
q48 = []
for idx, ((n, stem), k) in enumerate(zip(s6_items, K6)):
    q_text = f"{stem} [bank: {POOL6_STR}]"
    others = [w for w in POOL6 if w != k]
    q48.append(typed_q(48, n, q_text, [k] + others, k, "write the matching word…"))
banks.append({"lesson": 48, "title": "تشریحی جامع — وصل کردن تعریف‌ها (ص۴۰)", "level": "تشریحی — تایپی", "count": 4, "questions": q48})

# بانک ۴۹ — سکشن ۷: بهترین گزینه (MCQ)
q49 = []
for it, ai in zip(s7_items, A7):
    q49.append({"id": f"g11-l49-{it['n']}", "n": it["n"], "category": "grammar", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 49, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۴۱)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q49})

# بانک ۵۰ — سکشن ۸: جمله‌سازی (×۲ — گزینه‌ها = پاسخِ خود + پاسخِ دیگر؛ الگوی r354-l42)
q50 = []
for idx, ((n, stem), k) in enumerate(zip(s8_items, K8)):
    other = K8[1 - idx]
    q50.append(typed_q(50, n, stem, [k, other], k, "make a sentence with the given words…", category="grammar"))
banks.append({"lesson": 50, "title": "تشریحی جامع — جمله‌سازی (ص۴۱)", "level": "تشریحی — جمله‌سازی", "count": 2, "questions": q50})

# بانک ۵۱ — سکشن ۹: اجزای جمله (S/V/O/AI)
q51 = []
for idx, ((n, stem), k) in enumerate(zip(s9_items, K9_canon)):
    others = [K9_canon[j] for j in range(4) if j != idx]
    q51.append(typed_q(51, n, stem, [k] + others, k, "label the parts: S: … | V: … | O: … | AI: …", category="grammar"))
banks.append({"lesson": 51, "title": "تشریحی جامع — اجزای جمله (فاعل/فعل/مفعول/قید) (ص۴۱)", "level": "تشریحی — تایپی", "count": 4, "questions": q51})

# بانک ۵۲ — سکشن ۱۰: تصاویر و پرانتز
q52 = []
for idx, ((n, stem), k) in enumerate(zip(s10_items, K10)):
    others = [K10[j] for j in range(3) if j != idx]
    q52.append(typed_q(52, n, stem, [k] + others, k, "write the phrase with the plural counting unit…"))
banks.append({"lesson": 52, "title": "تشریحی جامع — تصاویر و پرانتز (ص۴۱)", "level": "تشریحی — تایپی", "count": 3, "questions": q52})

# بانک ۵۳ — سکشن ۱۱: خط زیر گزینهٔ صحیح (الگوی r354-l40)
q53 = [typed_q(53, it["n"], it["stem"], it["cands"], k, "type the correct option in parentheses…", category="grammar")
       for it, k in zip(s11_items, K11)]
banks.append({"lesson": 53, "title": "تشریحی جامع — خط زیر گزینهٔ صحیح (ص۴۱)", "level": "تشریحی — تایپی", "count": 4, "questions": q53})

# بانک ۵۴ — سکشن ۱۲: کلوزِ قاره‌ها (الگوی g10-l23)
q54 = []
for n in range(1, 7):
    ai = A12[n - 1]
    q54.append({
        "id": f"g11-l54-{n}", "n": n, "category": "vocab",
        "question": s12_sents[n],
        "options": [cloze_opts[n][L] for L in "abcd"], "answer": ai,
    })
banks.append({"lesson": 54, "title": "تشریحی جامع — کلوز قاره‌ها (ص۴۲)", "level": "تشریحی — چهارگزینه‌ای", "count": 6, "questions": q54})

# بانک ۵۵ — سکشن ۱۳: درک مطلب (۲ تایپی + ۴ درست/نادرست — الگوی g10-l24)
q55 = []
q55.append(typed_q(55, 1, s13_items[0]["stem"], [K13[0], K13[1]], K13[0], "answer according to the reading passage…"))
q55.append(typed_q(55, 2, s13_items[1]["stem"], [K13[1], K13[0]], K13[1], "answer according to the reading passage…"))
for j, (it, ai) in enumerate(zip(s13_items[2:], TF_KEYS)):
    stem = re.sub(r"\s*\(True or False\)$", "", it["stem"])
    q55.append({"id": f"g11-l55-{it['n']}", "n": it["n"], "category": "vocab", "question": stem, "options": ["True", "False"], "answer": ai})
banks.append({"lesson": 55, "title": "تشریحی جامع — درک مطلب زبان اشاره (ص۴۲)", "level": "تشریحی — درست/نادرست و تایپی", "count": 6, "questions": q55})

# ---------- نوشتن (idempotent — چکِ زودهنگام بالا انجام شد) ----------
data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+57)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
print("spot: l46 answers", [q["answer"] for q in q46], "| l49", [q["answer"] for q in q49], "| l54", [q["answer"] for q in q54], "| l55 TF", TF_KEYS)
