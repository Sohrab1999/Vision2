#!/usr/bin/env python3
# =====================================================================
# r273 — «بانک کنکوری پایهٔ دهم» — استخراج کامل از جزوهٔ جامع دهم
#
# منابع:
#   1) content-extracts/grade10.json  — کورپوس صفحه‌به‌صفحهٔ محلی (r265، ۳۰۲ صفحه)
#   2) booklet-extract/mcq-r213-curated.json — بانک کیوریت‌شدهٔ دوران گم‌شده
#      (بازیابی‌شده از origin/main در همین راند) — منبع دومِ پاسخ
#
# روش (همان انضباط اثبات‌شدهٔ r265-r269):
#   - سؤال‌ها مستقیم از صفحات تست پارس می‌شوند (ساقه + ۴ گزینه)؛ ارقام فارسی→لاتین
#   - کلید از صفحات کلید: «N .گزینه (X) ترجمه تست: "..."» یا «N - گزینه (X) :ترجمه»
#     با تحمل tatweel («گزیــنه») و فاصلهٔ داخل کلمه («گ زی نه») و پرانتز ناقص
#   - اتصال سربرگ‌محور: هر مدخل کلید refِ نزدیک‌ترین سربرگ «سؤالات: صفحه X و Y»
#     قبل از خودش را می‌گیرد؛ بخش‌ها = ران‌های هم-ref؛ تطبیق ترتیبی entry↔سؤال
#   - پاسخ مرجع: حرف کلید جزوه؛ بانک کیوریت‌شده = بازبینی دوم (ناهمخوان گزارش)
# خروجی: booklet-extract/g10-bank-r273.json
# =====================================================================
import json
import re
from collections import defaultdict

CORPUS = "content-extracts/grade10.json"
CURATED = "booklet-extract/mcq-r213-curated.json"
OUT = "booklet-extract/g10-bank-r273.json"

TEST_LO, TEST_HI = 40, 240      # صفحات سؤال [inclusive, exclusive)
KEY_LO, KEY_HI = 240, 303       # صفحات کلید

FA_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

def latin_digits(s: str) -> str:
    return s.translate(FA_DIGITS)

# ---------- پالایش فارسی (جدول WORD_FIXES — الگوی r265-268) ----------
WORD_FIXES = [
    ("سؤاالت", "سؤالات"), ("االن", "الان"),
    ("استفاده یم کنند", "استفاده می‌کنند"), ("تز یم", "تیز نمی"),
    ("تلویزیوتز", "تلویزیون‌ها"),
    ("آنها", "آن‌ها"), ("انها", "آن‌ها"),
    ("انگلییس", "انگلیسی"),
    ("بیدار یم شود", "بیدار می‌شود"),
    ("ریط", "ربط"),
]

def fix_fa(s: str) -> str:
    s = s.replace("\u0640", "")  # tatweel
    s = s.replace("ي", "ی").replace("ك", "ک")
    for a, b in WORD_FIXES:
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([،؛؟!.])", r"\1", s)
    return s

def norm_en(s: str) -> str:
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"-{2,}", " ", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

# ---------- ۱) سؤال‌ها از صفحات تست ----------
def parse_questions(pages):
    """تک-پاس: ساقه = متن بین شماره‌ها؛ گزینه‌ها = اولین بلوک a-d در هر برش."""
    qs = []
    for n in range(TEST_LO, TEST_HI):
        if n not in pages:
            continue
        raw = latin_digits(pages[n])
        # حذف سربرگ تکراری صفحه‌ها
        raw = re.sub(r'جزوه جام[^"]*Vision One"?', ' ', raw, flags=re.S)
        raw = re.sub(r'"?Vision One"?', ' ', raw)
        raw = re.sub(r'تألیف و گردآوری[^"“\)]*', ' ', raw)
        for pat in (r'"?تست\s*واژگان[^"“\)]*', r'"?تست\s*های?\s*واژگان[^"“\)]*',
                    r'"?تست\s*گرامر[^"“\)]*', r'"?سطح\s*ی?\s*آموزیس[^"“\)]*\)?',
                    r'\(?\s*پاسخ\s*نام?ه?\s*صفحه\s*:\s*\d+\s*-\s*\d+\s*\)?',
                    r'\(?\s*پاسخنامه\s*صفحه\s*:\s*\d+\s*-\s*\d+\s*\)?'):
            raw = re.sub(pat, ' ', raw)
        lines = raw.split("\n")
        starts = []
        for i, ln in enumerate(lines):
            m = re.match(r"^\s*(\d{1,3})\s*\.\s+(\S.*)$", ln)
            if m and not re.match(r"^\s*\d{1,3}\s*\.\s*[a-d][\.\)]", ln):
                starts.append((i, int(m.group(1)), m.group(2)))
        for k, (i, num, first) in enumerate(starts):
            end = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
            chunk = "\n".join([first] + lines[i + 1:end])
            m4 = re.search(
                r"\ba[\.\)]\s*(.+?)\s{2,}b[\.\)]\s*(.+?)\s{2,}c[\.\)]\s*(.+?)\s{2,}d[\.\)]\s*(.+?)\s*(?:\n|$)",
                chunk)
            opts = None
            if m4:
                opts = [m4.group(g).strip() for g in range(1, 5)]
            else:
                singles = re.findall(r"(?:^|\n|\s{3,})([a-d])[\.\)]\s*([^\n]+)", chunk)
                seen = {}
                for letter, body in singles:
                    if letter not in seen:
                        seen[letter] = body.strip()
                if len(seen) == 4:
                    opts = [seen[c] for c in "abcd"]
            if opts is None:
                continue
            mopt = re.search(r"(?:^|\n|\s{3,})a[\.\)]", chunk)
            stem = chunk[:mopt.start()] if mopt else chunk
            stem = re.sub(r"\s+", " ", stem).strip()
            if re.search(r"[\u0600-\u06FF]", stem):
                continue
            if not stem or len(opts) != 4 or any(not o for o in opts):
                continue
            qs.append({"page": n, "num": num, "stem": stem, "options": opts})
    dedup, seen = [], set()
    for q in qs:
        k = (q["page"], q["num"])
        if k in seen:
            continue
        seen.add(k)
        dedup.append(q)
    dedup.sort(key=lambda q: (q["page"], q["num"]))
    return dedup

# ---------- ۲/۴) جریان کلید + اتصال سربرگ‌محور ----------
HEADER_REF = re.compile(
    r"صفحه\s*[:؟]?\s*(\d{1,3})\s*(?:و|تا|\-|–)\s*(\d{1,3})|صفحه\s*[:؟]?\s*(\d{1,3})")
ENT_POS = re.compile(r"(\d{1,3})\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه\s*[\(\{]?\s*([a-dA-D])")
ENT_BODY = re.compile(
    r"\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه\s*[\(\{]?\s*([a-dA-D])\s*[\)\(]?\s*"
    r"(ترجمه تست\s*:?|:\s*ترجمه)?\s*[:\"“]?\s*(.*?)"
    r"(?=§SEP§|\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه|§PAGE§|$)",
    re.S)

def build_stream(pages):
    stream, marks = "", []
    for n in range(KEY_LO, KEY_HI):
        if n not in pages:
            continue
        marks.append((len(stream), n))
        stream += latin_digits(pages[n].replace("\u0640", "")) + "\n§PAGE§\n"
    stream = re.sub(r"-{5,}", " §SEP§ ", stream)
    stream = re.sub(r"[ \t]+", " ", stream)
    return stream, marks

def main():
    d = json.load(open(CORPUS))
    pages = {p["n"]: p["text"] for p in d["pages"]}
    qs = parse_questions(pages)
    curated = load_curated()
    stream, _ = build_stream(pages)

    # سربرگ‌های معتبر
    headers = []
    for m in HEADER_REF.finditer(stream):
        a, b = (int(m.group(1)), int(m.group(2))) if m.group(1) else (int(m.group(3)),) * 2
        if 40 <= a < TEST_HI and 40 <= b < TEST_HI and b >= a and (b - a) <= 8:
            headers.append((m.start(), (a, b)))

    # مدخل‌ها: موقعیت + حرف + بدنه (ترجمه/توضیح)
    bodies = [dict(pos=m.start(), letter=m.group(1).lower(),
                   hasTranslation=bool((m.group(2) or "").strip()), fa=m.group(3))
              for m in ENT_BODY.finditer(stream)]
    entries = []
    for m in ENT_POS.finditer(stream):
        pos, num, letter = m.start(), int(m.group(1)), m.group(2).lower()
        body = None
        for b in bodies:
            if abs(b["pos"] - pos) <= 80 and b["letter"] == letter:
                if body is None or abs(b["pos"] - pos) < abs(body["pos"] - pos):
                    body = b
        # ref: نزدیک‌ترین سربرگ قبل
        ref = None
        for hpos, rng in headers:
            if hpos < pos:
                ref = rng
            else:
                break
        entries.append({"pos": pos, "num": num, "letter": letter,
                        "hasTranslation": body["hasTranslation"] if body else False,
                        "fa": body["fa"] if body else "", "ref": ref})

    # بخش‌ها = ران‌های هم-ref
    sections = []
    for e in entries:
        if not sections or sections[-1]["ref"] != e["ref"]:
            sections.append({"ref": e["ref"], "entries": []})
        sections[-1]["entries"].append(e)
    print(f"questions parsed: {len(qs)} | key entries: {len(entries)} | sections: {len(sections)}")
    for i, s in enumerate(sections):
        print(f"  s{i}: ref={s['ref']} n={len(s['entries'])}")

    q_by_page = defaultdict(list)
    for q in qs:
        q_by_page[q["page"]].append(q)

    bank, used = [], set()
    stats = defaultdict(int)
    disagreements = []
    for si, sec in enumerate(sections):
        ref = sec["ref"]
        if ref is None:
            stats["section_no_ref"] += len(sec["entries"])
            print(f"  s{si}: no ref — {len(sec['entries'])} entries skipped")
            continue
        plo, phi = ref
        targets = []
        for pg in range(plo, phi + 1):
            targets.extend(q_by_page.get(pg, []))
        kp = min(e["pos"] for e in sec["entries"])
        kind = "grammar" if "گرامر" in stream[max(0, kp - 500):kp] else "vocab"
        if len(targets) != len(sec["entries"]):
            print(f"  s{si}: {kind} key={len(sec['entries'])} vs questions p{plo}-{phi}={len(targets)} (zip-min)")
        for e, q in zip(sec["entries"], targets):
            qid = f"g10-p{q['page']}-n{q['num']}"
            if qid in used:
                continue
            used.add(qid)
            li = "abcd".find(e["letter"])
            entry = {
                "id": qid, "page": q["page"], "num": q["num"], "category": kind,
                "stem": q["stem"], "options": q["options"],
                "answerIdx": li if 0 <= li <= 3 else None,
                "answerSource": "booklet-key" if 0 <= li <= 3 else None,
                "translation": fix_fa(e["fa"]) if (e["hasTranslation"] and e["fa"]) else None,
                "note": fix_fa(e["fa"]) if (not e["hasTranslation"] and e["fa"]) else None,
            }
            cands = curated.get(q["page"], [])
            if cands and q["num"] <= len(cands):
                c = cands[q["num"] - 1]
                if norm_en(c["question"])[:40] == norm_en(q["stem"])[:40]:
                    if c["answer"] == entry["answerIdx"]:
                        stats["agree"] += 1
                    else:
                        stats["disagree"] += 1
                        disagreements.append({"id": qid, "stem": q["stem"][:70],
                                              "key": e["letter"], "curated": "abcd"[c["answer"]]})
                else:
                    stats["curated_no_text_match"] += 1
            bank.append(entry)
            stats["with_key"] += 1

    keyed = {norm_en(b["stem"]) for b in bank}
    for pg in sorted(q_by_page):
        for q in q_by_page[pg]:
            if norm_en(q["stem"]) not in keyed:
                stats["questions_without_key"] += 1

    out = {"meta": {"grade": 10, "generator": "extract-g10-bank-r273.py",
                    "provenance": "page-parse of booklet tests + printed key letters + r213 curated cross-check",
                    "stats": dict(stats), "disagreements": disagreements[:60]},
           "bank": bank}
    json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
    print(json.dumps(dict(stats), ensure_ascii=False))
    print(f"bank: {len(bank)} → {OUT}")
    for x in disagreements[:12]:
        print("  !", x)

def load_curated():
    d = json.load(open(CURATED))
    by_page = defaultdict(list)
    for x in d:
        if x.get("grade") == 10:
            by_page[x["page"]].append(x)
    return by_page

if __name__ == "__main__":
    main()
