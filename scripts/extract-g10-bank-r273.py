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
#   - سؤال‌ها مستقیم از صفحات تست جزوه پارس می‌شوند (ساقه + ۴ گزینه)
#   - کلید از صفحات کلید: «N .گزینه (X) ترجمه تست: "..."» (واژگان) یا
#     «N - گزینه (X) :ترجمه "..."» (گرامر — توضیح فارسی)
#   - اتصال: بخش کلید صفحات سؤال را اعلام می‌کند («سؤاالت: صفحه52 و 53»)؛
#     تطبیق ترتیبی entry N ↔ سؤال N همان صفحات + حرف کلید = پاسخ مرجع
#   - بانک کیوریت‌شده = بازبینی دومِ پاسخ (ناهمخوان گزارش می‌شود)
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
    ("أ", "ا"), ("إ", "ا"),
    ("آنها", "آن‌ها"), ("انها", "آن‌ها"),
    ("انگلــییس", "انگلیسی"), ("انگلییس", "انگلیسی"),
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
        raw = pages[n]
        raw = latin_digits(raw)  # ساقه‌های با شمارهٔ فارسی «۱.» هم پارس شوند
        # حذف سربرگ تکراری
        raw = re.sub(r'جزوه جام ـع زبان انگلــییس پایه\s*\n?ده\s*\n?ـــ م', ' ', raw)
        raw = re.sub(r'"?Vision One"?', ' ', raw)
        raw = re.sub(r'تألیف و گردآوری[^"“]*', ' ', raw)
        raw = re.sub(r'"?تست\s*واژگان[^"“]*', ' ', raw)
        raw = re.sub(r'"?تست\s*های?\s*واژگان[^"“]*', ' ', raw)
        raw = re.sub(r'"?تست\s*گرامر[^"“]*', ' ', raw)
        raw = re.sub(r'"?سطح\s*ی?\s*آموزیس[^"“\)]*\)?', ' ', raw)
        raw = re.sub(r'\(?\s*پاسخنامه\s*صفحه\s*:\s*\d+\s*-\s*\d+\s*\)?', ' ', raw)
        lines = raw.split("\n")
        # شماره‌شروع ساقه‌ها: خطی که با N. شروع شود و بعدش انگلیسی/گیومه باشد
        starts = []
        for i, ln in enumerate(lines):
            m = re.match(r"^\s*(\d{1,3})\s*\.\s+(\S.*)$", ln)
            if m and not re.match(r"^\s*\d+\s*\.\s*[a-d]\b", ln):
                starts.append((i, int(m.group(1)), m.group(2)))
        for k, (i, num, first) in enumerate(starts):
            end = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
            chunk = ([first] + lines[i + 1:end])
            chunk_txt = "\n".join(chunk)
            # گزینه‌ها: ۴تایی در یک خط
            m4 = re.search(r"\ba[\.\)]\s*(.+?)\s{2,}b[\.\)]\s*(.+?)\s{2,}c[\.\)]\s*(.+?)\s{2,}d[\.\)]\s*(.+?)\s*(?:\n|$)", chunk_txt)
            opts = None
            if m4:
                opts = [m4.group(g).strip() for g in range(1, 5)]
            else:
                # بلوک تک‌خطی: a. … b. … c. … d. … (هر کدام ممکن است در خط خودش باشد)
                singles = re.findall(r"(?:^|\n|\s{3,})([a-d])[\.\)]\s*([^\n]+)", chunk_txt)
                seen = {}
                for letter, body in singles:
                    if letter not in seen:
                        seen[letter] = body.strip()
                if len(seen) == 4:
                    opts = [seen[c] for c in "abcd"]
            if opts is None:
                continue
            # ساقه = متن قبل از اولین گزینه
            opt_pos = None
            mopt = re.search(r"(?:^|\n|\s{3,})a[\.\)]", chunk_txt)
            if mopt:
                opt_pos = mopt.start()
            stem = chunk_txt[:opt_pos] if opt_pos is not None else chunk_txt
            stem = re.sub(r"\n\d{1,2}:\d{2}\b", " ", stem)  # مهر زمانی؟
            stem = re.sub(r"\s+", " ", stem).strip()
            # برش تداخل گزینه‌های نیمه — ساقه باید فارسی نداشته باشد
            if re.search(r"[\u0600-\u06FF]", stem):
                continue
            if not stem or len(opts) != 4 or any(not o for o in opts):
                continue
            qs.append({"page": n, "num": num, "stem": stem, "options": opts})
    # حذف تکرار (همان page+num)
    dedup, seen = [], set()
    for q in qs:
        k = (q["page"], q["num"])
        if k in seen:
            continue
        seen.add(k)
        dedup.append(q)
    dedup.sort(key=lambda q: (q["page"], q["num"]))
    return dedup

# ---------- ۲) کلید از صفحات کلید ----------
def parse_key(pages):
    entries = []
    for n in range(KEY_LO, KEY_HI):
        if n not in pages:
            continue
        t = pages[n]
        t = t.replace("\u0640", "")  # tatweel — «گزیــنه» → «گزینه»
        t = re.sub(r"-{5,}", " §SEP§ ", t)
        t = re.sub(r"[ \t]+", " ", t)
        # واریانت‌ها: «N .گزینه (X) ترجمه تست : "..."» / «N - گزینه (X) :ترجمه "..."»
        # پرانتز ناقص OCR: «گزینه(c(» — فاصله داخل کلمه: «گ زی نه»
        pat = re.compile(
            r"(\d{1,3})\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه\s*[\(\{]?\s*([a-dA-D])\s*[\)\(]?\s*(ترجمه تست\s*:?|:\s*ترجمه)?\s*[:\"“]?\s*(.*?)"
            r"(?=§SEP§|\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه|$)",
            re.S,
        )
        for m in pat.finditer(t):
            num, letter, marker, body = int(m.group(1)), m.group(2).lower(), m.group(3) or "", m.group(4)
            body = body.replace("§SEP§", " ")
            body = re.sub(r"\s+", " ", body).strip().strip('"“”').strip()
            if len(body) > 600:   # سرریز نابهنجار
                body = body[:600]
            entries.append({"keyPage": n, "num": num, "letter": letter,
                            "hasTranslation": bool(marker.strip()), "fa": body})
    # تکرارها (یک مدخل که در صفحه بعد دوباره چاپ شده) — با کلید (keyPage, num) نگه‌دار
    dedup, seen = [], set()
    for e in entries:
        k = (e["keyPage"], e["num"], e["letter"])
        if k in seen:
            continue
        seen.add(k)
        dedup.append(e)
    return dedup

# ---------- ۳) بانک کیوریت‌شده ----------
def load_curated():
    d = json.load(open(CURATED))
    by_page = defaultdict(list)
    for x in d:
        if x.get("grade") == 10:
            by_page[x["page"]].append(x)
    return by_page

# ---------- ۴) اتصال — جریان سربرگ‌محور ----------
HEADER_REF = re.compile(
    r"صفحه\s*:؟?\s*(\d{1,3})\s*(?:و|تا|\-|–)\s*(\d{1,3})|صفحه\s*:؟?\s*(\d{1,3})",
)

def main():
    d = json.load(open(CORPUS))
    pages = {p["n"]: p["text"] for p in d["pages"]}
    qs = parse_questions(pages)
    keys = parse_key(pages)
    curated = load_curated()
    print(f"questions parsed: {len(qs)} | key entries: {len(keys)}")

    # جریان ناحیهٔ کلید: صفحه‌ها به‌ترتیب + موقعیت مطلق
    stream = ""
    page_marks = []  # (start_offset, page_no)
    for n in range(KEY_LO, KEY_HI):
        if n not in pages:
            continue
        page_marks.append((len(stream), n))
        stream += latin_digits(pages[n].replace("\u0640", "")) + "\n§PAGE§\n"
    stream = re.sub(r"-{5,}", " §SEP§ ", stream)
    stream = re.sub(r"[ \t]+", " ", stream)

    # سربرگ‌ها: همهٔ «صفحه X و Y» معتبر در جریان
    headers = []
    for m in HEADER_REF.finditer(stream):
        if m.group(1):
            a, b = int(m.group(1)), int(m.group(2))
        else:
            a = b = int(m.group(3))
        if 40 <= a < TEST_HI and 40 <= b < TEST_HI and b >= a and (b - a) <= 6:
            headers.append((m.start(), (a, b)))

    # مدخل‌ها در جریان: موقعیت هر «N .گزینه (X)»
    ent_pat = re.compile(r"(\d{1,3})\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه\s*[\(\{]?\s*([a-dA-D])")
    entry_pos = []
    for m in ent_pat.finditer(stream):
        entry_pos.append((m.start(), int(m.group(1)), m.group(2).lower()))

    # تخصیص ref: نزدیک‌ترین سربرگ قبل از مدخل
    def ref_at(pos):
        best = None
        for hpos, rng in headers:
            if hpos < pos and (best is None or hpos > best[0]):
                best = (hpos, rng)
        return best[1] if best else None

    # بازسازی متن بدنهٔ هر مدخل (برای ترجمه): از پترن کامل با بدنه
    body_pat = re.compile(
        r"\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه\s*[\(\{]?\s*([a-dA-D])\s*[\)\(]?\s*(ترجمه تست\s*:?|:\s*ترجمه)?\s*[:\"“]?\s*(.*?)"
        r"(?=§SEP§|\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه|§PAGE§|$)",
        re.S,
    )
    bodies = []
    for m in body_pat.finditer(stream):
        bodies.append({"pos": m.start(), "letter": m.group(1).lower(),
                       "hasTranslation": bool((m.group(2) or "").strip()), "fa": m.group(3)})

    # انطباق مدخل‌ها (ent_pat) با بدنه‌ها (body_pat) بر اساس نزدیک‌ترین pos
    entries2 = []
    for pos, num, letter in entry_pos:
        body = min(bodies, key=lambda b: abs(b["pos"] - pos)) if bodies else None
        if body is None or abs(body["pos"] - pos) > 80:
            fa, hasT = "", False
        else:
            fa, hasT = body["fa"], body["hasTranslation"]
        entries2.append({"pos": pos, "num": num, "letter": letter,
                         "hasTranslation": hasT, "fa": fa, "ref": ref_at(pos)})

    # بخش‌بندی: هر تغییر ref = بخش تازه
    sections2 = []
    for e in entries2:
        if not sections2 or sections2[-1]["ref"] != e["ref"]:
            sections2.append({"ref": e["ref"], "entries": []})
        sections2[-1]["entries"].append(e)
    print(f"sections: {len(sections2)} refs={[s['ref'] for s in sections2]} sizes={[len(s['entries']) for s in sections2]}")

    # بخش‌بندی کلید: هر جا num==1 آمد، بخش تازه (در همان صفحه یا بعدی)
    # + محاسبهٔ زودهنگام مرجع صفحات برای ادغام بخش‌های هم‌مقصد
    sections = []
    for e in keys:
        if e["num"] == 1 or not sections:
            sections.append({"entries": [], "ref": None})
        sec = sections[-1]
        sec["entries"].append(e)
        if sec["ref"] is None:
            t = pages.get(e["keyPage"], "").replace("\u0640", "")
            mfirst = re.search(r"\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه", t)
            window = t[max(0, (mfirst.start() if mfirst else 0) - 600):(mfirst.start() if mfirst else 0)]
            for a, b in re.findall(r"(\d{1,3})\s*(?:و|تا)\s*(\d{1,3})", window):
                a, b = int(a), int(b)
                if 40 <= a < TEST_HI and 40 <= b < TEST_HI and b >= a:
                    sec["ref"] = (a, b)
                    break
            if sec["ref"] is None:
                m1 = re.search(r"صفحه\s*:?\s*(\d{1,3})", window)
                if m1 and 40 <= int(m1.group(1)) < TEST_HI:
                    sec["ref"] = (int(m1.group(1)), int(m1.group(1)))
    print(f"key sections: {len(sections)} sizes={[len(s['entries']) for s in sections]} refs={[s['ref'] for s in sections]}")

    q_by_page = defaultdict(list)
    for q in qs:
        q_by_page[q["page"]].append(q)

    bank, used = [], set()
    stats = defaultdict(int)
    disagreements = []
    # ادغام بخش‌های هم‌مقصد: بخش‌های متوالی با همان بازهٔ صفحات = ادامهٔ هم
    merged = []
    for sec in sections:
        if merged and merged[-1]["ref"] == sec.get("ref"):
            merged[-1]["entries"].extend(sec["entries"])
        else:
            merged.append({"ref": sec.get("ref"), "entries": list(sec["entries"])})
    sections2 = merged
    print(f"after merge: {len(sections2)} sections sizes={[len(s['entries']) for s in sections2]}")

    for si, wrap in enumerate(sections2):
        sec = wrap["entries"]
        head = sec[0]
        # مرجع صفحات سؤال: پنجرهٔ ۶۰۰ نویسه قبل از اولین مدخل — «صفحه 52 و 53»
        t = pages.get(head["keyPage"], "").replace("\u0640", "")
        pos = re.search(r"\d{1,3}\s*[\.\-]\s*گ\s*ز\s*ی\s*ن\s*ه", t)
        window = t[max(0, (pos.start() if pos else 0) - 600):(pos.start() if pos else 600)]
        refs = re.findall(r"(\d{1,3})\s*(?:و|تا)\s*(\d{1,3})", window)
        plo = phi = None
        for a, b in refs:
            a, b = int(a), int(b)
            if 40 <= a < TEST_HI and 40 <= b < TEST_HI and b >= a:
                plo, phi = a, b
                break
        if plo is None:
            # تک‌صفحه‌ای: «صفحه 52»
            m1 = re.search(r"صفحه\s*:?\s*(\d{1,3})", t)
            if m1 and 40 <= int(m1.group(1)) < TEST_HI:
                plo = phi = int(m1.group(1))
        if plo is None:
            stats["section_no_ref"] += 1
            print(f"  section {si} (keyP{head['keyPage']}, n={len(sec)}): no page ref — skip")
            continue
        targets = []
        for pg in range(plo, phi + 1):
            targets.extend(q_by_page.get(pg, []))
        kind = "grammar" if any(re.search(r"گرامر", pages[head["keyPage"]][:400]) for _ in [0]) else "vocab"
        print(f"  section {si}: kind={kind} entries={len(sec)} questions p{plo}-{phi}={len(targets)}")
        for e, q in zip(sec, targets):
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
                "note": fix_fa(e["fa"]) if (not e["hasTranslation"] and e["fa"] and kind == "grammar") else None,
            }
            # منبع دوم: کیوریت‌شدهٔ همان صفحه (ترتیبی)
            cands = curated.get(q["page"], [])
            if cands:
                c = cands[min(q["num"] - 1, len(cands) - 1)] if q["num"] >= 1 else None
                if c and norm_en(c["question"])[:40] == norm_en(q["stem"])[:40]:
                    entry["curatedAgree"] = (c["answer"] == entry["answerIdx"])
                    if entry["curatedAgree"]:
                        stats["agree"] += 1
                    else:
                        stats["disagree"] += 1
                        disagreements.append({"id": qid, "stem": q["stem"][:70],
                                              "key": e["letter"], "curated": "abcd"[c["answer"]]})
                else:
                    stats["curated_no_text_match"] += 1
            bank.append(entry)
            stats["with_key"] += 1

    # سؤال‌های بدون کلید — فقط گزارش (پاسخ بدون کلید = بی‌پشتوانه)
    keyed_stems = {norm_en(b["stem"]) for b in bank}
    for pg in sorted(q_by_page):
        for q in q_by_page[pg]:
            if norm_en(q["stem"]) in keyed_stems:
                continue
            stats["questions_without_key"] += 1

    out = {"meta": {"grade": 10, "generator": "extract-g10-bank-r273.py",
                    "provenance": "page-parse of booklet tests + printed key letters + r213 curated cross-check",
                    "stats": dict(stats),
                    "disagreements": disagreements[:60]},
           "bank": bank}
    json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
    print(json.dumps(dict(stats), ensure_ascii=False))
    print(f"bank: {len(bank)} → {OUT}")
    for x in disagreements[:12]:
        print("  !", x)

if __name__ == "__main__":
    main()
