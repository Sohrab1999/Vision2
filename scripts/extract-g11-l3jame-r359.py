# -*- coding: utf-8 -*-
# r359 — استخراجِ «آزمون جامع تشریحی درس سوم» یازدهم (ص۱۰۹-۱۱۱، کلیدِ چاپیِ ص۲۰۱-۲۰۲) → tests-g11.json بانک‌های ۷۹-۹۲
# چهارده سکشنِ خودِ آزمون = چهارده بانک (الگوی r355/r357):
#  (۱) کلمات ناقص ×۴ تایپی | (۲) کلمات داده‌شده ×۸ تایپی (بانکِ ۹واژه‌ای، اضافیِ handicrafts) |
#  (۳) کلمهٔ مناسب با حروفِ ناقص ×۴ تایپی | (۴) گزینهٔ متفاوت ×۴ تایپی (گزینه‌ها به ترتیبِ چاپ) |
#  (۵) وصلِ تعریف ×۴ تایپی (استخرِ ستونِ چاپی) | (۶) چهارگزینه‌ای واژگان ×۴ | (۷) چهارگزینه‌ای گرامر ×۴ |
#  (۸) جمله‌سازی ×۲ تایپی (قفلِ چندمجموعهٔ واژگان) | (۹) متضاد ×۸ تایپی (ترتیبِ چاپِ به‌هم‌ریخته → بازچینی) |
#  (۱۰) وصلِ دوستونی ×۶ تایپی (نگاشتِ حرف→واژهٔ ستون) | (۱۱) پرانتزی ×۴ تایپی |
#  (۱۲) فشار صوت ×۱ تایپیِ مستند (کلیدِ آهنگِ دوبخشی) | (۱۳) کلوزِ فرهنگ ×۶ MCQ | (۱۴) درک مطلبِ عکاسی ×۶ (۴ درست/نادرست + ۲ تایپی). جمع: ۶۵ آیتم.
# درس‌های برازیده: r354 (لنگرِ اولین سؤال + گاردِ فارسی)، r355/r357 (خانوادهٔ جامع)، r358 (چاپِ به‌هم‌ریخته/کلیدِ حرفی/چندمجموعه)،
# g10-l92 (تک‌آیتمِ مستندِ آهنگ)، g10-l24 (درست/نادرست)، r311 (بانکِ واژه به‌صورتِ [bank: …]).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    """حذفِ سربرگِ تکراری — اگر لنگرِ «همکاران» نبود، خام برمی‌گردد (ص۱۰۹ سربرگِ استاندارد ندارد)."""
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    print(f"  [page_clean] p{pno+1}: header anchor not found — raw kept")
    return raw


exam = "\n".join(page_clean(p) for p in (108, 109, 110))  # ص۱۰۹-۱۱۱
key_raw = "\n".join(page_clean(p) for p in (200, 201))  # ص۲۰۱-۲۰۲

# لوکاتورِ دوطرفه: آزمون «(پاسخنامه صفحه: ۲۰۱ تا ۲۰۲)» ⇠ کلیدِ ص۲۰۱ «(آزمون صفحه: ۱۰۹ تا ۱۱۱)»
assert re.search(r"پاسخنامه صفحه\s*:", exam), "exam locator missing"
assert re.search(r"آزمون صفحه\s*:", key_raw), "key locator missing"
assert re.search(r"Culture is a word", exam) and re.search(r"Photography is a way", exam), "exam pages incomplete"

# ---------- کلید: ۶۴ مدخلِ شماره‌دار + مدخلِ بی‌شمارهٔ سکشن۱۲ ----------
# شکل‌ها: [4,8,4,4,4,4,4,2,8,6,4,6,6] — سکشن۹ ترتیبِ چاپیِ به‌هم‌ریخته (1,3,5,7,2,4,6,8) دارد؛
# سکشن۴ در کلید «۵» برچسب خورده (برچسب‌سوز؛ مدخل‌ها سالم‌اند)؛ سکشن۱۲ بدونِ مدخلِ شماره‌دار است.
SIZES = [4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 6, 6]
key_entries = []
for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", key_raw):
    body = re.sub(r"\s+", " ", m.group(2)).strip()
    if PERSIAN.search(body):
        continue
    key_entries.append((int(m.group(1)), body))
assert len(key_entries) == 64, f"key entries={len(key_entries)} (expected 64)"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert sorted(n for n, _ in grp) == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    grp.sort(key=lambda t: t[0])  # سکشن۹ را بازچینی می‌کند؛ بقیه از قبل ۱..n
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4, K5L, K6, K7, K8, K9, K10L, K11, K13L, K14 = keys_by_sec
# سکشن۱۲ — مدخلِ بی‌شمارهٔ چاپی با دو نشانهٔ آهنگ
m12 = re.search(r"If you don’t wash fruits before eating them,?\s*\(rising\)\s*you will get sick\.\s*\(falling\)", key_raw)
assert m12, "sec12 intonation key line missing"
K12_LINE = re.sub(r"\s+", " ", m12.group(0)).strip()
assert K12_LINE == "If you don’t wash fruits before eating them, (rising) you will get sick. (falling)", K12_LINE

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤال/متنِ هر سکشن (درسِ r354) ----------
ANCHORS = [
    ("1. The island has more d__ver__ity", "s1"),
    ("1. Recently there has been some movement away from", "s2"),
    ("1. Believe me, I’m telling the t _ _ _ _.", "s3"),
    ("1. totally / completely / certainly / entirely", "s4"),
    ("1. Very big and large:", "s5"),
    ("1. Spending six months in India", "s6"),
    ("1. I’ll ------------------------------- alone if you don’t come here.", "s7"),
    ("1. football / not / him / play / in / I / to / the yard / told.", "s8"),
    ("1. expensive ≠", "s9"),
    ("1. vast:", "s10"),
    ("1. I will be sad if my football team", "s11"),
    ("If you don’t wash fruits before eating them", "s12"),
    ("Culture is a word for the way of life", "s13"),
    ("Photography is a way of making a picture", "s14"),
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


def assert_numbering(items, n, tag, ordered=False):
    nums = [i for i, _ in items]
    assert sorted(nums) == list(range(1, n + 1)), f"{tag}: {nums}"
    assert len(items) == n, f"{tag}: {len(items)} != {n}"
    if ordered:
        assert nums == list(range(1, n + 1)), f"{tag} order: {nums}"


def normalize_blanks(body: str, width: int = 31) -> str:
    """همهٔ ران‌های dash (تکی یا شکستهٔ بین‌خطی) به عرضِ یکنواختِ ۳۱ (قراردادِ r311/r357)."""
    return re.sub(r"-{2,}(?:\s*-{2,})*", "-" * width, body)


def squash(body: str) -> str:
    return re.sub(r"\s+", " ", body).strip()


def opt_index(it: dict, key: str, tag: str) -> int:
    hits = [L for L, txt in it["opts"].items() if txt == key]
    assert len(hits) == 1, f"{tag}: key {key!r} matched {hits} (opts={it['opts']})"
    return "abcd".index(hits[0])


def wlist(s: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", re.sub(r"[’‘]", "'", s).lower().replace("/", " "))


# سکشن ۱ — کلمات ناقص (تایپی ×۴)
s1_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s1"])]
assert_numbering(s1_items, 4, "sec1", ordered=True)
for _, b in s1_items:
    assert re.search(r"[a-z]__[a-z]", b), f"sec1 stem without __ gaps: {b!r}"

# سکشن ۲ — کلمات داده‌شده (تایپی ×۸ + بانکِ ۹واژه‌ای) — خطِ بانک پیش از لنگرِ اولین سؤال است
m_bank = re.search(r"(?m)^(excited\s*/.*)$", exam[: starts[1]])
assert m_bank, "sec2: word bank line missing"
BANK2 = [w.strip() for w in m_bank.group(1).split("/")]
assert BANK2 == ["excited", "wellness", "handicrafts", "traditional", "custom", "bored", "sociable", "included", "ashamed"], BANK2
s2_items = []
s2_raw = sec_slices["s2"]
_starts2 = [m.start() for m in re.finditer(r"(?m)^\d{1,2}\.\s", s2_raw)]
assert len(_starts2) == 8, f"sec2 item starts={len(_starts2)}"
for k2 in range(8):
    chunk = s2_raw[_starts2[k2] : _starts2[k2 + 1] if k2 + 1 < 8 else len(s2_raw)]
    kept = []
    for ln in chunk.split("\n"):
        if re.fullmatch(r"-{40,}\s*", ln):
            break
        kept.append(ln)
    body = normalize_blanks(squash(" ".join(kept)))
    body = re.sub(r"^\d{1,2}\.\s+", "", body)  # پیشوندِ شمارهٔ آیتم از ساقه حذف
    n = int(re.match(r"(\d{1,2})\.", kept[0].strip()).group(1))
    s2_items.append((n, body))
assert_numbering(s2_items, 8, "sec2", ordered=True)
for _, b in s2_items:
    assert re.search(r"-{31}", b) and not re.search(r"-\s+-", b), f"sec2 blank broken: {b!r}"

# سکشن ۳ — کلمهٔ مناسب با حروفِ ناقص (تایپی ×۴)
s3_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s3"])]
assert_numbering(s3_items, 4, "sec3", ordered=True)
for _, b in s3_items:
    assert re.search(r"\b[a-z]( _)+", b), f"sec3 stem without _ _ gaps: {b!r}"

# سکشن ۴ — گزینهٔ متفاوت (تایپی ×۴؛ گزینه‌ها به ترتیبِ چاپ)
s4_items = []
for n, b in numbered_items(sec_slices["s4"]):
    cands = [c.strip() for c in b.split("/")]
    assert len(cands) == 4, f"sec4 Q{n}: {cands}"
    s4_items.append({"n": n, "cands": cands})
assert_numbering([(i["n"], "") for i in s4_items], 4, "sec4", ordered=True)
for it, k in zip(s4_items, K4):
    assert k in it["cands"], f"sec4 Q{it['n']}: key {k!r} ∉ {it['cands']}"

# سکشن ۵ — وصلِ تعریف (تایپی ×۴؛ کلیدِ حرفی با نگاشتِ ستونِ چاپی)
COL5 = dict(re.findall(r"(?m)^\s*([a-d])\.\s+([a-z]+)\s*$", sec_slices["s5"]))
assert COL5 == {"a": "pack", "b": "appreciate", "c": "earn", "d": "vast"}, COL5
K5 = [COL5[l] for l in K5L]
s5_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s5"])]
assert_numbering(s5_items, 4, "sec5", ordered=True)
for _, b in s5_items:
    assert re.search(r"\(-{4,}\)\s*$", b), f"sec5 dotted paren missing: {b!r}"
assert K5 == ["vast", "earn", "pack", "appreciate"], K5

# سکشن ۶ — چهارگزینه‌ای واژگان (MCQ ×۴؛ کلیدِ متنی)
def parse_mcq4(raw: str, tag: str) -> list[dict]:
    items = []
    starts6 = [m.start() for m in re.finditer(r"(?m)^\d{1,2}\.\s", raw)]
    assert len(starts6) == 4, f"{tag}: item starts={len(starts6)}"
    for k6 in range(4):
        chunk = raw[starts6[k6] : starts6[k6 + 1] if k6 + 1 < 4 else len(raw)]
        opts = dict(re.findall(r"(?m)^\s*([a-d])\.\s+(.+)$", chunk))
        assert set(opts) == {"a", "b", "c", "d"}, f"{tag} Q{k6+1}: {sorted(opts)}"
        stem = normalize_blanks(squash(chunk.split("\n")[0]))
        stem = re.sub(r"^\d{1,2}\.\s+", "", stem)  # پیشوندِ شمارهٔ آیتم از ساقه حذف
        items.append({"n": k6 + 1, "stem": stem, "opts": {L: squash(t) for L, t in opts.items()}})
    return items

s6_items = parse_mcq4(sec_slices["s6"], "sec6")
for it, k in zip(s6_items, K6):
    assert k in it["opts"].values(), f"sec6 Q{it['n']}: key {k!r} ∉ {list(it['opts'].values())}"

# سکشن ۷ — چهارگزینه‌ای گرامر (MCQ ×۴؛ کلیدِ متنی)
s7_items = parse_mcq4(sec_slices["s7"], "sec7")
for it, k in zip(s7_items, K7):
    assert k in it["opts"].values(), f"sec7 Q{it['n']}: key {k!r} ∉ {list(it['opts'].values())}"

# سکشن ۸ — جمله‌سازی (تایپی ×۲؛ قفلِ چندمجموعهٔ واژگانِ ساقه⇄کلید — درسِ r358)
s8_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s8"])]
assert_numbering(s8_items, 2, "sec8", ordered=True)
for (n, stem), k in zip(s8_items, K8):
    assert sorted(wlist(stem)) == sorted(wlist(k)), f"sec8 Q{n}: multiset lock broken\n  stem={wlist(stem)}\n  key ={wlist(k)}"
    assert "/" in stem, f"sec8 Q{n}: jumbled slash stem expected"

# سکشن ۹ — متضاد (تایپی ×۸؛ ترتیبِ چاپِ به‌هم‌ریخته 1,3,5,7,2,4,6,8 → بازچینی با شماره)
s9_raw_items = numbered_items(sec_slices["s9"])
assert_numbering(s9_raw_items, 8, "sec9")
s9_items = sorted(s9_raw_items, key=lambda t: t[0])
s9_items = [(n, squash(b)) for n, b in s9_items]
for _, b in s9_items:
    assert b.endswith("≠"), f"sec9 stem without ≠: {b!r}"
assert [b[:-1].strip() for _, b in s9_items] == ["expensive", "lose", "sell", "slowly", "hot", "cheerful", "increase", "falling"]
assert K9 == ["cheap", "find or win", "buy", "quickly or rapidly", "cold", "cheerless or gloomy", "decrease", "rising"], K9

# سکشن ۱۰ — وصلِ دوستونی (تایپی ×۶؛ کلیدِ حرفی با نگاشتِ ستونِ چاپی)
COL10 = dict(re.findall(r"(?m)^\s*([a-f])\.\s+([a-z]+)\s*$", sec_slices["s10"]))
assert COL10 == {"a": "people", "b": "customs", "c": "values", "d": "country", "e": "chairs", "f": "products"}, COL10
K10 = [COL10[l] for l in K10L]
s10_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s10"])]
assert_numbering(s10_items, 6, "sec10", ordered=True)
assert [re.match(r"([a-z-]+)[:,\s]", b).group(1) for _, b in s10_items] == ["vast", "hand-made", "local", "hard-working", "moral", "metal"]  # چاپ پس از آیتم‌های ۳/۴ «:» را جا انداخته — عجیبِ چاپی
assert K10 == ["country", "products", "customs", "people", "values", "chairs"], K10

# سکشن ۱۱ — خط زیر گزینهٔ صحیح (تایپی ×۴؛ پرانتزِ دونمونه‌ای)
PAREN = re.compile(r"\(([^()]+)\)")
s11_items = []
for n, body in numbered_items(sec_slices["s11"]):
    body = squash(body)
    m = PAREN.search(body)
    assert m, f"sec11 Q{n}: no parens in {body[:60]!r}"
    cands = [c.strip() for c in m.group(1).split("/")]
    assert len(cands) == 2, f"sec11 Q{n}: {cands}"
    s11_items.append({"n": n, "stem": body, "cands": cands})
assert_numbering([(i["n"], "") for i in s11_items], 4, "sec11", ordered=True)
for it, k in zip(s11_items, K11):
    assert k in it["cands"], f"sec11 Q{it['n']}: key {k!r} ∉ {it['cands']}"

# سکشن ۱۲ — فشار صوت (تک‌آیتمِ مستند — الگوی g10-l92)
m_s12 = re.search(r"(?m)^If you don’t wash fruits before eating them, you will get sick\.\s*$", sec_slices["s12"])
assert m_s12, "sec12 sentence line missing"

# سکشن ۱۳ — کلوزِ فرهنگ (MCQ ×۶؛ passage دوصفحه‌ای + گزینه‌های شماره‌سرخطی)
s13_raw = sec_slices["s13"]
m_pass = re.search(r"(?ms)^\s*Culture is a word.*?(?=\n\s*1\s*\n\s*a\.\s+uncertain)", s13_raw)
assert m_pass, "sec13: passage not found"
passage = squash(m_pass.group(0))
s13_sents = {}
for seg in re.split(r"(?<=[.!?])\s+", passage):
    for mm in re.finditer(r"---(\d)---", seg):
        s13_sents[int(mm.group(1))] = seg.strip()
assert sorted(s13_sents) == [1, 2, 3, 4, 5, 6], sorted(s13_sents)
opt_block = s13_raw[m_pass.end():]
cloze_opts, order = {}, []
for ln in opt_block.split("\n"):
    ln = ln.strip()
    if re.fullmatch(r"\d", ln):
        n = int(ln)
        assert n not in cloze_opts, f"sec13: blank {n} duplicated"
        cloze_opts[n] = {}
        order.append(n)
    else:
        mo = re.match(r"^([a-d])\.\s+(.+)$", ln)
        if mo and order:
            cloze_opts[order[-1]][mo.group(1)] = squash(mo.group(2))
assert order == [1, 2, 3, 4, 5, 6], order
for n, opts in cloze_opts.items():
    assert set(opts) == {"a", "b", "c", "d"}, f"sec13 blank {n}: {list(opts)}"
A13 = ["abcd".index(l) for l in K13L]  # کلیدِ حرفیِ چاپی → اندیسِ مستقیم (درسِ r358-l76)
assert K13L == ["b", "c", "a", "a", "d", "c"], K13L

# سکشن ۱۴ — درک مطلبِ عکاسی (۴ درست/نادرست + ۲ تایپی)
s14_items = [(n, squash(b)) for n, b in numbered_items(sec_slices["s14"])]
assert_numbering(s14_items, 6, "sec14", ordered=True)
for n, b in s14_items[:4]:
    assert re.search(r"\(True or False\)$", b), f"sec14 Q{n}: {b[-40:]!r}"
TF_KEYS = []
for (n, _), k in zip(s14_items[:4], K14[:4]):
    assert k in ("true", "false"), f"sec14 Q{n}: key {k!r}"
    TF_KEYS.append(0 if k == "true" else 1)
assert TF_KEYS == [0, 0, 1, 1], TF_KEYS
assert K14[4] == "A photographer takes photographs, especially as a job.", K14[4]
assert K14[5] == "The amount of time the shutter stays open for is called the shutter speed.", K14[5]
assert s14_items[4][1] == "What does a photographer do?" and s14_items[5][1] == "What is the shutter speed?"

# ---------- هم‌پوشانی‌سنجی با بانک‌های پیشینِ یازدهم (ساقهٔ نرمال‌شده — درسِ r311) ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 79 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 79 exists — banks={before[0]} items={before[1]}")
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
    + [b for _, b in s5_items]
    + [i["stem"] for i in s6_items]
    + [i["stem"] for i in s7_items]
    + [b for _, b in s8_items]
    + [b for _, b in s9_items]
    + [b for _, b in s10_items]
    + [i["stem"] for i in s11_items]
    + [m_s12.group(0).strip()]
    + [s13_sents[n] for n in range(1, 7)]
    + [b for _, b in s14_items]
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

# بانک ۷۹ — سکشن ۱: کلمات ناقص
q79 = []
for idx, ((n, stem), k) in enumerate(zip(s1_items, K1)):
    others = [K1[j] for j in range(4) if j != idx]
    q79.append(typed_q(79, n, stem, [k] + others, k, "complete the word…"))
banks.append({"lesson": 79, "title": "تشریحی جامع — کلمات ناقص (ص۱۰۹)", "level": "تشریحی — تایپی", "count": 4, "questions": q79})

# بانک ۸۰ — سکشن ۲: کلمات داده‌شده (بانکِ واژه در ساقه — الگوی r311)
BANK2_STR = " / ".join(BANK2)
q80 = []
for idx, ((n, stem), k) in enumerate(zip(s2_items, K2)):
    q_text = f"{stem} [bank: {BANK2_STR}]"
    others = [w for w in BANK2 if w != k and w != "handicrafts"][:3]
    q80.append(typed_q(80, n, q_text, [k] + others, k, "complete with the given words…"))
banks.append({"lesson": 80, "title": "تشریحی جامع — کلمات داده‌شده (ص۱۰۹)", "level": "تشریحی — تایپی", "count": 8, "questions": q80})

# بانک ۸۱ — سکشن ۳: کلمهٔ مناسب با حروفِ ناقص
q81 = []
for idx, ((n, stem), k) in enumerate(zip(s3_items, K3)):
    others = [K3[j] for j in range(4) if j != idx]
    q81.append(typed_q(81, n, stem, [k] + others, k, "write the word that fits the blanks…"))
banks.append({"lesson": 81, "title": "تشریحی جامع — کلمهٔ مناسب با حروف ناقص (ص۱۰۹)", "level": "تشریحی — تایپی", "count": 4, "questions": q81})

# بانک ۸۲ — سکشن ۴: گزینهٔ متفاوت (گزینه‌ها به ترتیبِ چاپ — الگوی r355-l47)
q82 = []
for it, k in zip(s4_items, K4):
    q82.append(typed_q(82, it["n"], " / ".join(it["cands"]), it["cands"], k, "type the option that is different…"))
banks.append({"lesson": 82, "title": "تشریحی جامع — گزینهٔ متفاوت (ص۱۰۹)", "level": "تشریحی — تایپی", "count": 4, "questions": q82})

# بانک ۸۳ — سکشن ۵: وصلِ تعریف (استخر در ساقه — الگوی r311)
POOL5_STR = " / ".join(COL5[l] for l in "abcd")
q83 = []
for idx, ((n, stem), k) in enumerate(zip(s5_items, K5)):
    q_text = f"{stem} [bank: {POOL5_STR}]"
    others = [w for w in ["pack", "appreciate", "earn", "vast"] if w != k]
    q83.append(typed_q(83, n, q_text, [k] + others, k, "write the matching word…"))
banks.append({"lesson": 83, "title": "تشریحی جامع — وصل کردن تعریف‌ها (ص۱۰۹)", "level": "تشریحی — تایپی", "count": 4, "questions": q83})

# بانک ۸۴ — سکشن ۶: چهارگزینه‌ای واژگان (MCQ)
q84 = []
for it, k in zip(s6_items, K6):
    q84.append({"id": f"g11-l84-{it['n']}", "n": it["n"], "category": "vocab", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": opt_index(it, k, "sec6")})
banks.append({"lesson": 84, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۱۰۹)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q84})

# بانک ۸۵ — سکشن ۷: چهارگزینه‌ای گرامر (MCQ)
q85 = []
for it, k in zip(s7_items, K7):
    q85.append({"id": f"g11-l85-{it['n']}", "n": it["n"], "category": "grammar", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": opt_index(it, k, "sec7")})
banks.append({"lesson": 85, "title": "تشریحی جامع — تست چهارگزینه‌ای (ص۱۱۰)", "level": "تشریحی — چهارگزینه‌ای", "count": 4, "questions": q85})

# بانک ۸۶ — سکشن ۸: جمله‌سازی (×۲ — گزینه‌ها = پاسخِ خود + پاسخِ دیگر؛ الگوی r354-l42)
q86 = []
for idx, ((n, stem), k) in enumerate(zip(s8_items, K8)):
    other = K8[1 - idx]
    q86.append(typed_q(86, n, stem, [k, other], k, "make a sentence with the given words…", category="grammar"))
banks.append({"lesson": 86, "title": "تشریحی جامع — جمله‌سازی (ص۱۱۰)", "level": "تشریحی — جمله‌سازی", "count": 2, "questions": q86})

# بانک ۸۷ — سکشن ۹: متضاد (الگوی r357-l68)
q87 = []
for idx, ((n, stem), k) in enumerate(zip(s9_items, K9)):
    others = [K9[j] for j in range(8) if j != idx][:3]
    q87.append(typed_q(87, n, stem, [k] + others, k, "write the antonym (≠)…"))
banks.append({"lesson": 87, "title": "تشریحی جامع — متضاد (ص۱۱۰)", "level": "تشریحی — تایپی", "count": 8, "questions": q87})

# بانک ۸۸ — سکشن ۱۰: وصلِ دوستونی (استخرِ ستونِ B در ساقه — الگوی r311)
POOL10_STR = " / ".join(COL10[l] for l in "abcdef")
q88 = []
for idx, ((n, stem), k) in enumerate(zip(s10_items, K10)):
    q_text = f"{stem} [bank: {POOL10_STR}]"
    others = [w for w in ["people", "customs", "values", "country", "chairs", "products"] if w != k]
    q88.append(typed_q(88, n, q_text, [k] + others, k, "write the matching word from column B…"))
banks.append({"lesson": 88, "title": "تشریحی جامع — وصل دوستونی (ص۱۱۰)", "level": "تشریحی — تایپی", "count": 6, "questions": q88})

# بانک ۸۹ — سکشن ۱۱: خط زیر گزینهٔ صحیح (الگوی r355-l53)
q89 = [typed_q(89, it["n"], it["stem"], it["cands"], k, "type the correct option in parentheses…", category="grammar")
       for it, k in zip(s11_items, K11)]
banks.append({"lesson": 89, "title": "تشریحی جامع — خط زیر گزینهٔ صحیح (ص۱۱۰)", "level": "تشریحی — تایپی", "count": 4, "questions": q89})

# بانک ۹۰ — سکشن ۱۲: فشار صوت (تک‌آیتمِ مستند — الگوی g10-l92)
q90 = [typed_q(90, 1, "If you don’t wash fruits before eating them, (--------) you will get sick. (--------)",
               ["rising / falling"], "rising / falling", "type the two intonation marks in order…", category="grammar")]
banks.append({"lesson": 90, "title": "تشریحی جامع — فشار صوت (ص۱۱۰)", "level": "تشریحی — تایپی", "count": 1, "questions": q90})

# بانک ۹۱ — سکشن ۱۳: کلوزِ فرهنگ (الگوی r355-l54)
q91 = []
for n in range(1, 7):
    q91.append({
        "id": f"g11-l91-{n}", "n": n, "category": "vocab",
        "question": s13_sents[n],
        "options": [cloze_opts[n][L] for L in "abcd"], "answer": A13[n - 1],
    })
banks.append({"lesson": 91, "title": "تشریحی جامع — کلوز فرهنگ (ص۱۱۰-۱۱۱)", "level": "تشریحی — چهارگزینه‌ای", "count": 6, "questions": q91})

# بانک ۹۲ — سکشن ۱۴: درک مطلبِ عکاسی (۴ درست/نادرست + ۲ تایپی — الگوی g10-l24)
q92 = []
for j, (it, ai) in enumerate(zip(s14_items[:4], TF_KEYS)):
    stem = re.sub(r"\s*\(True or False\)$", "", it[1])
    q92.append({"id": f"g11-l92-{it[0]}", "n": it[0], "category": "vocab", "question": stem, "options": ["True", "False"], "answer": ai})
q92.append(typed_q(92, 5, s14_items[4][1], [K14[4], K14[5]], K14[4], "answer according to the reading passage…"))
q92.append(typed_q(92, 6, s14_items[5][1], [K14[5], K14[4]], K14[5], "answer according to the reading passage…"))
banks.append({"lesson": 92, "title": "تشریحی جامع — درک مطلب عکاسی (ص۱۱۱)", "level": "تشریحی — درست/نادرست و تایپی", "count": 6, "questions": q92})

# ---------- رسید (source.g11l3jame) ----------
data["source"]["g11l3jame"] = {
    "extractedRound": "r359",
    "examPages": "109-111",
    "keyPages": "201-202",
    "sections": 14,
    "items": 65,
    "printQuirkCount": 11,
    "printQuirks": [
        "لوکاتورِ دوطرفهٔ خوداعلام: آزمونِ ص۱۰۹ «(پاسخنامه صفحه: ۲۰۱ تا ۲۰۲)» ⇠ کلیدِ ص۲۰۱ «(آزمون صفحه: ۱۰۹ تا ۱۱۱)»",
        "خانوادهٔ scrambleِ سربرگ‌ها: «امالبی» (املایی)، «جمالت» (جملات)، «بهی  ین» (بهترین)، «خایل» (خالی)، «سؤاالت» (سؤالات)، «می» (متن)",
        "کلیدِ چاپی سکشن۴ را «۵» برچسب زده (۵ دوبار، بدونِ ۴) — سکشن‌بندی با ترتیبِ محتوا تطبیق شد نه با شمارهٔ چاپیِ سربرگِ کلید",
        "سکشن۹ (متضاد): ترتیبِ چاپِ کلید به‌هم‌ریختهٔ لایهٔ RTL (1,3,5,7,2,4,6,8) — با شمارهٔ مدخل‌ها به ۱..۸ بازچینی شد؛ هر دو ستونِ آزمون و کلید همین scramble را دارند",
        "سکشن۱۲ (فشار صوت): کلیدِ چاپی تک‌آیتمی هر دو نشانهٔ آهنگ را درج می‌کند — «…eating them, → (rising)» و «…get sick. → (falling)» — ساقه با دو جای‌خالیِ پرانتزی در همان مواضع رندر شد؛ پاسخِ تایپی «rising / falling» به ترتیبِ چاپ",
        "ص۱۱۲ فقط جعبهٔ «Note:» است (پاسخِ آزاد) — آزمون در ص۱۱۱ تمام می‌شود؛ ضمیمه از ص۱۱۳",
        "کلیدهای حرفیِ سکشن۵/۱۰ با نگاشتِ مستقیمِ ستونِ چاپی واژه شدند: a=pack b=appreciate c=earn d=vast؛ a=people b=customs c=values d=country e=chairs f=products",
        "بانکِ واژهٔ سکشن۲: ۹واژه با اضافیِ «handicrafts» (هرگز در کلید نیامد)",
        "سکشن۱۰: چاپ پس از آیتم‌های ۳ و ۴ دوّنقطهٔ «:» را جا انداخته («local (---------)» بی‌colon در برابرِ «vast:») — استخراج با رجکسِ دوواقعی",
        "بلنک‌های dash (تکی یا شکستهٔ بین‌خطی) به عرضِ یکنواختِ ۳۱ تیره نرمال شدند (قراردادِ r311/r357)؛ ساقه‌های پرانتزِ نقطه‌چینِ سکشن۵/۱۰ verbatim نگه داشته شدند",
        "بدونِ ترجمهٔ چاپی (خانوادهٔ تشریحی)؛ متنِ کاملِ درک مطلب («Culture»، «Photography») در رسیدِ این بانک‌ها فقط به‌صورتِ جمله‌های حاویِ بلنک (کلوز) و سؤال‌ها استخراج شد",
    ],
}

# ---------- نوشتن (idempotent — چکِ زودهنگام بالا انجام شد) ----------
data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+65)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
print("spot: l84 answers", [q["answer"] for q in q84], "| l85", [q["answer"] for q in q85], "| l91", A13, "| l92 TF", TF_KEYS)
print("spot: l87 keys", [q["accepted"][0] for q in q87])
print("spot: l90", q90[0]["accepted"])
