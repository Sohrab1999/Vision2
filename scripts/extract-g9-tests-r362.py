#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r362 — استخراج دو خانوادهٔ تستِ گ۹ (لطفی بوکان) → public/jozve/tests-g9.json
  خانوادهٔ ۱: «تست گرامری» ص۲۸ — ۳ MCQ با کلیدِ ستارهٔ چاپی (there are* / there is* / there are not*)
              + ۴ آیتمِ تایپیِ is/are (کلیدِ ساختاری از دستورِ خود چاپ) + ۳ MCQِ بی‌کلیدِ چاپی
              → ساقه‌های یتیمِ مستند (قراردادِ r358: ساقه به بانک نمی‌رود، کلید ساخته نمی‌شود)
  خانوادهٔ ۲: «تست واژگان» ص۹۸-۱۰۱ — ۵۰ MCQ با کلیدِ «N-x» ص۱۰۱
              (سربرگِ کلید «هفتم تا نهم» است ولی فقط کلیدِ همین ۵۰تایی را دارد)
کشفِ مسیر: «Vocabulary Tests (Lesson 1-3)» یازدهم (پیشنهادِ r361) تکراری است — r308 آن را
استخراج کرده (بانک‌های l6-l23، رسیدِ comprehensive360). r362 به‌جایش گ۹ را به کارتِ تست‌ها می‌آورد.
idempotent: اجرای دوم NO-OP می‌دهد.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OCR = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8")
LINES = OCR.split("\n")
OUT = ROOT / "public/jozve/tests-g9.json"
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_slice(pnum: int) -> list[str]:
    start = next(i for i, l in enumerate(LINES) if f"<<<PAGE {pnum}>>>" in l)
    end = next(i for i in range(start + 1, len(LINES)) if "<<<PAGE" in LINES[i])
    return LINES[start:end]


# ————— خانوادهٔ ۱: تست گرامری ص۲۸ —————
G28 = [l.rstrip("\n") for l in page_slice(28)]
# لایه: سربرگِ بیضی «تست گرامری» در انتهای صفحه می‌آید (ترتیبِ لایه) — به عنوانِ لنگرِ پایان
assert any("تست گرامری" in l for l in G28), "grammar anchor missing"

BUL = re.compile(r"^o\s+(.*)$")           # بولتِ چاپیِ «o»
OPT = re.compile(r"(?:^|\s)([abcd])\)\s*", re.IGNORECASE)

blocks: list[list[str]] = []               # هر بلاک = بولت + ساقه + گزینه‌ها
cur: list[str] | None = None
for l in G28:
    s = l.strip()
    if not s or "تست گرامری" in s:
        continue
    if PERSIAN.search(s):
        # دستورِ تایپیِ فارسی یا سربرگِ صفحه — نویزِ بین‌بلاکی
        cur = None
        continue
    m = BUL.match(s)
    if m:
        cur = [m.group(1)]
        blocks.append(cur)
        continue
    if cur is not None:
        cur.append(s)
assert len(blocks) == 10, f"grammar blocks={len(blocks)} expected=10"

def split_opts(ls: list[str]) -> tuple[str, list[str] | None, list[int]]:
    """ساقه/گزینه‌ها + اندیسِ ستاره‌ها؛ None = گزینه ندارد (تایپی)"""
    stem_lines, opt_rows = [], []
    for l in ls:
        s = re.sub(r"\s+", " ", l).strip()
        if not s:
            continue
        if OPT.search(" " + s):
            opt_rows.append(s)
            continue
        stem_lines.append(s)
    stem = ""
    prev = ""
    for sl in stem_lines:
        # شکستِ کلمهٔ hyphen‌دار: «twenty-» + «nine.» بدونِ فاصله
        if prev.endswith("-"):
            stem = stem + sl
        else:
            stem = (stem + " " + sl).strip()
        prev = sl
    if not opt_rows:
        return stem, None, []
    row = re.sub(r"\s+", " ", " ".join(opt_rows)).strip()
    anchors = [(m.group(1).lower(), m.start(), m.end()) for m in OPT.finditer(" " + row)]
    letters = [a[0] for a in anchors]
    assert letters == ["a", "b", "c", "d"], f"letters={letters} stem={stem[:40]!r}"
    opts, stars = [], []
    for i, (letter, start, end_) in enumerate(anchors):
        seg_end = anchors[i + 1][1] if i + 1 < len(anchors) else len(" " + row)
        text = (" " + row)[start + (end_ - start):seg_end].strip()
        star = text.endswith("*")
        if star:
            stars.append(i)
            text = text[:-1].rstrip()
        opts.append(re.sub(r"\s+", " ", text))
    assert all(opts), f"empty option in {stem[:40]!r}"
    return stem, opts, stars

GRAMMAR: list[dict] = []
ORPHANS: list[dict] = []
for ls in blocks:
    stem, opts, stars = split_opts(ls)
    if opts is None:
        # آیتمِ تایپیِ is/are — کلیدِ ساختاری: توافقِ there is/are با مفرد/جمع
        assert "There" in stem, f"typed stem unexpected: {stem!r}"
        # بلنکِ چاپی = کادرِ خالی که در لایه نامرئی است — رانِ تیره جایگزین می‌شود
        assert re.search(r"^There\s+", stem), f"typed stem shape: {stem!r}"
        assert "---" not in stem and "…" not in stem, f"unexpected blank in typed stem: {stem!r}"
        stem = re.sub(r"^There\s+", "There ------- ", stem, count=1)
        token = re.match(r"^There -+ (\S+)", stem)
        assert token, f"typed token missing: {stem!r}"
        tok = token.group(1).lower().rstrip(".,")
        if tok in ("a", "an", "one"):
            ans = "is"
        elif re.fullmatch(r"\d+", tok) or tok in ("two", "eight", "three", "four", "five", "six", "seven", "nine", "ten"):
            ans = "are"
        else:
            raise AssertionError(f"typed key not forced (token={tok!r}): {stem!r}")
        GRAMMAR.append({"question": stem, "kind": "typed", "answer": ans})
    elif len(stars) == 1:
        GRAMMAR.append({"question": stem, "options": opts, "answer": stars[0]})
    elif len(stars) == 0:
        ORPHANS.append({"question": stem, "options": opts})
    else:
        raise AssertionError(f"multi-star: {stem[:50]!r}")

MCQ_G = [g for g in GRAMMAR if "options" in g]
TYPED_G = [g for g in GRAMMAR if g.get("kind") == "typed"]
assert len(MCQ_G) == 3 and len(TYPED_G) == 4 and len(ORPHANS) == 3, \
    f"mcq={len(MCQ_G)} typed={len(TYPED_G)} orphans={len(ORPHANS)}"
# ترتیب چاپ: ۳ MCQ ستاره‌دار نخست، سپس ۴ تایپی، سپس ۳ یتیم
kinds_seq = ["mcq"] * 3 + ["typed"] * 4
got_seq = ["mcq" if "options" in g else "typed" for g in GRAMMAR]
assert got_seq == kinds_seq, f"order broken: {got_seq}"
# کلیدهای ستاره‌ای verbatim
assert MCQ_G[0]["answer"] == 3 and MCQ_G[0]["options"][3] == "there are", MCQ_G[0]
assert MCQ_G[1]["answer"] == 3 and MCQ_G[1]["options"][3] == "there is", MCQ_G[1]
assert MCQ_G[2]["answer"] == 1 and MCQ_G[2]["options"][1] == "there are not", MCQ_G[2]
# کلیدهای تایپیِ ساختاری
assert [t["answer"] for t in TYPED_G] == ["is", "are", "is", "are"], [t["answer"] for t in TYPED_G]
assert all("-------" in t["question"] for t in TYPED_G), [t["question"] for t in TYPED_G]
# یتیم‌ها: ساقه‌های شناخته‌شده
assert "He is an" in ORPHANS[0]["question"], ORPHANS[0]["question"]
assert "are not in the classroom" in ORPHANS[1]["question"], ORPHANS[1]["question"]
assert "A picture in the classroom" in ORPHANS[2]["question"], ORPHANS[2]["question"]
print(f"grammar: mcq=3 typed=4 orphans=3 — star keys d/d/b, typed is/are/is/are")

# ————— خانوادهٔ ۲: تست واژگان ص۹۸-۱۰۱ —————
VSTEM = re.compile(r"^(\d{1,2})\.\s*(.+)$")   # «1. …» و «5.The…» (بدونِ فاصله)
seg: list[str] = []
for p in range(98, 102):
    seg.extend(page_slice(p))

vblocks: list[tuple[int, list[str]]] = []
cur = None
for l in seg:
    s = l.strip()
    if not s:
        continue
    m = VSTEM.match(s)
    if m:
        cur = (int(m.group(1)), [m.group(2)])
        vblocks.append(cur)
        continue
    if cur is None:
        continue
    if PERSIAN.search(s):
        cur = None
        continue
    cur[1].append(s)

assert len(vblocks) == 50, f"vocab blocks={len(vblocks)}"
assert [n for n, _ in vblocks] == list(range(1, 51)), "vocab numbering broken"

VOCA: list[dict] = []
for idx, (n, ls) in enumerate(vblocks, start=1):
    assert n == idx
    stem_lines, opt_rows = [], []
    mode = "stem"
    for l in ls:
        s = re.sub(r"\s+", " ", l).strip()
        if not s:
            continue
        if OPT.search(" " + s):
            mode = "opts"
            opt_rows.append(s)
            continue
        if mode == "stem":
            stem_lines.append(s)
        else:
            opt_rows[-1] += " " + s
    stem = " ".join(stem_lines).strip()
    row = re.sub(r"\s+", " ", " ".join(opt_rows)).strip()
    anchors = [(m.group(1).lower(), m.start(), m.end()) for m in OPT.finditer(" " + row)]
    letters = [a[0] for a in anchors]
    assert letters == ["a", "b", "c", "d"], f"V{n} letters={letters}"
    opts = []
    for i, (letter, start, end_) in enumerate(anchors):
        seg_end = anchors[i + 1][1] if i + 1 < len(anchors) else len(" " + row)
        text = (" " + row)[start + (end_ - start):seg_end].strip()
        assert not text.endswith("*"), f"V{n} unexpected star"
        opts.append(re.sub(r"\s+", " ", text))
    assert all(opts), f"V{n} empty option"
    VOCA.append({"n": n, "question": stem, "options": opts})
print(f"vocab: 50 MCQ parsed")

# کلیدِ ص۱۰۱
key_lines = [l.strip() for l in page_slice(101) if re.match(r"^\d{1,2}-[abcd]\s*$", l.strip())]
assert len(key_lines) == 50, f"key entries={len(key_lines)}"
KEY = {int(a): b for a, b in (re.match(r"^(\d{1,2})-([abcd])$", l).groups() for l in key_lines)}
assert sorted(KEY) == list(range(1, 51))

# قفل‌های معنایی (واژگان)
def vopt(n, i): return VOCA[n - 1]["options"][i]
assert KEY[1] == "a" and vopt(1, 0) == "began", (KEY[1], vopt(1, 0))
assert KEY[2] == "b" and vopt(2, 1) == "toll"
assert KEY[36] == "c" and vopt(36, 2) == "envelope / stamp"
assert KEY[44] == "d" and vopt(44, 3) == "generouse"
assert KEY[45] == "d" and vopt(45, 3) == "take / withdraw"
assert KEY[50] == "a" and vopt(50, 0) == "hands and knee"
print("semantic locks OK (V1=a/V2=b/V36=c/V44=d/V45=d/V50=a)")

# ————— ساخت فایل —————
def gitem(i: int, g: dict) -> dict:
    if g.get("kind") == "typed":
        return {
            "id": f"g9-l1-{i}", "n": i, "category": "grammar", "kind": "typed",
            "question": g["question"], "options": [g["answer"]], "answer": 0,
            "accepted": [g["answer"]], "placeholder": "is or are…",
        }
    return {
        "id": f"g9-l1-{i}", "n": i, "category": "grammar",
        "question": g["question"], "options": g["options"], "answer": g["answer"],
    }

q1 = [gitem(i, g) for i, g in enumerate(GRAMMAR, start=1)]
q2 = [{
    "id": f"g9-l2-{v['n']}", "n": v["n"], "category": "vocab",
    "question": v["question"], "options": v["options"], "answer": "abcd".index(KEY[v["n"]]),
} for v in VOCA]

bank1 = {
    "lesson": 1,
    "title": "تست گرامری (ص۲۸) — there is/are",
    "level": "چهارگزینه‌ای و تایپی",
    "count": len(q1),
    "questions": q1,
}
bank2 = {
    "lesson": 2,
    "title": "تست واژگان ۵۰تایی (ص۹۸-۱۰۱)",
    "level": "چهارگزینه‌ای",
    "count": len(q2),
    "questions": q2,
}

receipt = {
    "extractedRound": "r362",
    "families": 2,
    "examPages": "گرامری 28؛ واژگان 98-101",
    "keyPages": "گرامری: ستارهٔ دنبالهٔ گزینه در خودِ ص۲۸؛ واژگان: 101 («N-x» تک‌ستونه)",
    "sections": 2,
    "items": len(q1) + len(q2),
    "orphanStems": 3,
    "printQuirkCount": 12,
    "printQuirks": [
        "لوکاتورِ ناهم‌خوان: سربرگِ کلیدِ ص۱۰۱ «پاسخنامه تست های واژگان هفتم تا نهم» است ولی فهرستِ زیرش دقیقاً ۵۰ مدخلِ همین آزمونِ نهم را می‌دهد (۱-a … ۵۰-a) — سربرگ، سریِ سه‌پایهٔ نویسنده را نام می‌برد نه محتوای صفحه",
        "سربرگِ بیضیِ زردِ «تست گرامری» در رندر بالای ص۲۸ است ولی لایهٔ متنی آن را در انتهای صفحه می‌دهد (ترتیبِ لایه)",
        "کلیدِ MCQهای «تست گرامری» ستارهٔ دنبالهٔ گزینه است («d) there are*») — فقط سه سؤالِ نخست ستاره دارند؛ سه MCQِ آخرِ ص۲۸ بی‌کلیدِ چاپی‌اند → ساقه‌های یتیمِ مستند در orphanStems (قراردادِ r358: ساقه وارد بانک نمی‌شود و کلید ساخته نمی‌شود)",
        "چهار آیتمِ تایپیِ is/are: کلید از خودِ دستورِ چاپی («درجاهای خالی فعل مناسب is یا are قرار دهید») و توافقِ there is/are با مفرد/جمع به‌طورِ ساختاری یکتاست (الگوی خوداعتبارسنجیِ r357) — is/are/is/are",
        "بلنکِ چاپیِ آیتم‌های تایپی کادرِ خالی (فرم) است؛ در ساقه با رانِ تیره بازنمایی شده",
        "شکستِ کلمهٔ hyphen‌دارِ چاپی در MCQ1 ص۲۸: «twenty-»/«nine.» — پیوسته و بدونِ فاصله بازسازی شد",
        "scrambleِ دستورِ تایپی در لایه: «.قرار دهید» با نقطهٔ سرگردان + شکستِ «is / are» بین دو خط",
        "تایپوهای چاپیِ verbatim در واژگان: ususlly (ق۹)، timetabels (ق۱۹)، hopping (ق۲۳)، pleseant و quit (ق۳۷)، voulantry (ق۳۹)، reveloution (ق۴۷)، generouse (ق۴۴)، scare (ق۳۱) + آپاستروف‌های جاافتاده (Arent ق۲۱، Minas ق۳۱، Alice s ق۳۹، The Smith ق۲۲)",
        "شماره‌گذاریِ بدونِ فاصله در واژگان: «5.The»، «15.Iran»، «16.Ted»، «17.Our»",
        "گزینه‌های چندجای‌خالیِ اسلش‌دار verbatim: ق۳۶/۴۳/۴۵/۴۹ («envelope / stamp»، «preparing / setting»، «take / withdraw»، «received /relevant») + «c)envelope» بدونِ فاصله (ق۳۶) و «both 1&2» (ق۲۹) در برابرِ «both1&2» (ق۴۴)",
        "MCQهای «تست گرامری» شمارهٔ چاپی ندارند (بولتِ o) — شماره‌گذاریِ ۱-۷ به ترتیبِ چاپ توسط برنامه؛ حرفِ گزینهٔ نخستِ MCQ1 بزرگِ چاپی است («A) There is»)",
        "سربرگِ هر صفحه: «دکت ر حسن لطفی» — تجزیهٔ «دکتر» با فاصله در لایه",
    ],
    "orphanStemList": [
        {"question": o["question"], "options": o["options"], "note": "بی‌کلیدِ چاپی — از بانک مستثنی"}
        for o in ORPHANS
    ],
}

data = {"grade": 9, "title": "جزوه دکتر حسن لطفی — پایه نهم", "lessons": [bank1, bank2], "source": {"g9tests": receipt}}

if OUT.exists():
    old = json.loads(OUT.read_text(encoding="utf-8"))
    same = json.dumps(old, ensure_ascii=False, sort_keys=True) == json.dumps(data, ensure_ascii=False, sort_keys=True)
    if same:
        print("translations changed: 0 — NO-OP")
        raise SystemExit(0)
    raise SystemExit("tests-g9.json exists but differs — manual arbitration needed")

OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote tests-g9.json: {len(q1)} + {len(q2)} = {len(q1)+len(q2)} items in 2 banks")
print("source.g9tests receipt written; orphan stems:", len(ORPHANS))
