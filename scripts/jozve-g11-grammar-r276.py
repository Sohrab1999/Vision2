#!/usr/bin/env python3
"""jozve-g11-grammar-r276.py — استخراج بانک‌های «جمع‌بندی گرامر و نگارش» جزوهٔ یازدهم
(درس ۱: ۶۰ تست ص۳۶-۳۹ / درس ۲: ۷۰ تست ص۷۰-۷۳ / درس ۳: ۷۰ تست ص۱۰۵-۱۰۸)

ساختار (کشف r276):
  - هر درسِ یازدهم دو بانک گرامر دارد: یک بانک کوچکِ «کنکوری» (۲۰/۲۰/۳۰ تست،
    کلیدش در ص۱۸۸-۱۸۹ جزوه — برای راند بعد) و بانک اصلیِ «جمع‌بندی» که کلیدش
    شبکهٔ چاپی ۶/۷ ستونی در c12/sec12 و c13/sec14 و c14/sec29 است
    («(سواالت صفحه X تا Y) پاسخنامه کلیدی Nتست گرامر و نگارش درس Z»).
  - سؤال‌ها انگلیسی خالص MCQ؛ گزینه‌ها تک‌خطی چندگزینه‌ای (قطعه‌شکن r274).
  - ترجمهٔ فارسی برای تست‌های گرامر در جزوه نیست (شبکهٔ کلید فقط حرف دارد) —
    غیبتِ صادقانه؛ UI الگوی q.translation اختیاری را دارد.
خروجی: public/jozve/grammar-g11.json (فایل جدید — مأموریت «استخراج جزوه‌ها»)
"""
import importlib.util
import json
import os
import re
import sys

ROOT = "/home/z/my-project"

_spec = importlib.util.spec_from_file_location("r274", f"{ROOT}/scripts/jozve-g12-l2l3-mcq-r274.py")
r274 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(r274)

PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
OUT = f"{ROOT}/public/jozve/grammar-g11.json"

BANKS = [
    {
        "lesson": 1, "pages": [35, 36, 37, 38], "chapter": "c12", "sec": 12,
        "title": "۶۰ تست گرامر و نگارش درس اول — پایه یازدهم",
        "sourcePages": "36-39", "expect": 60,
        "keyNote": "c12/sec12 — شبکهٔ چاپی «پاسخنامه کلیدی ۶۰تست گرامر و نگارش درس اول»",
    },
    {
        "lesson": 2, "pages": [69, 70, 71, 72], "chapter": "c13", "sec": 14,
        "title": "۷۰ تست گرامر و نگارش درس دوم — پایه یازدهم",
        "sourcePages": "70-73", "expect": 70,
        "keyNote": "c13/sec14 — شبکهٔ چاپی «پاسخنامه کلیدی ۷۰تست گرامر و نگارش درس دوم»",
    },
    {
        "lesson": 3, "pages": [104, 105, 106, 107], "chapter": "c14", "sec": 29,
        "title": "۷۰ تست گرامر و نگارش درس سوم — پایه یازدهم",
        "sourcePages": "105-108", "expect": 70,
        "keyNote": "c14/sec29 — شبکهٔ چاپی «پاسخنامه کلیدی ۷۰تست گرامر و نگارش درس سوم»",
    },
]

# ————— سرصفحهٔ تکراری صفحات یازدهم — فقط خطوطِ فارسیِ سرصفحه —————
# ساقه‌ها انگلیسی‌اند؛ پس هر خط فارسیِ کوتاهِ غیرسؤالی فقط می‌تواند سرصفحه باشد،
# ولی محتاطانه همان سیاههٔ r275 + سرصفحهٔ مخصوص جمع‌بندی گرامر:
JUNK_SUB = list(r274.JUNK_SUB) + [
    r"Vision\s*Two", r"پایه\s*یازدهم", r"پایه\s*11", r"متوسط", r"^تست$",
    r"تست\s*های", r"گرامر و نگارش", r"^درس\s*[0-9۰-۹]*$", r"^درس$",
    r"^سطح", r"کنکوری", r"پاسخنامه\s*صفحه", r"جمع بندی", r"^یازدهم", r"^$/",
]
JUNK_RE = [re.compile(p) for p in JUNK_SUB]
# خط سرصفحهٔ «درس2 -» و «پایه11» با خط تیره می‌آیند
JUNK_EXACT = {"درس2 -", "- پایه11", '"', ")", "("}


def clean_page_g11g(lines):
    out = []
    for ln in lines:
        s = ln.strip().strip('"')
        if not s or r274.BRACKET_ONLY.match(s):
            continue
        if s in JUNK_EXACT:
            continue
        if any(rx.search(s) for rx in JUNK_RE):
            continue
        out.append(s)
    return out


def parse_grammar_questions(pages, expect):
    import fitz
    doc = fitz.open(PDF)
    raw = []
    for p in pages:
        raw.extend(doc[p].get_text("text").splitlines())
    lines = clean_page_g11g(raw)

    qs, cur, expect_n = {}, None, 1
    for ln in lines:
        mq = re.match(r"^(\d{1,3})[\.\-]\s*(.*)$", ln)
        if mq and int(mq.group(1)) == expect_n:
            n = int(mq.group(1))
            if cur is not None and len(cur["opts"]) != 4:
                print(f"  warn: Q{cur['n']} incomplete ({len(cur['opts'])} opts) before Q{n}")
            cur = {"n": n, "stem": [mq.group(2)], "opts": []}
            qs[n] = cur
            expect_n = n + 1
            continue
        if cur is None:
            continue
        if len(cur["opts"]) < 4:
            # نرمال‌سازی «گزینهٔ بی‌نقطه» (Q67 درس ۲: «a  is broking  b. broke …»):
            # فقط وقتی هنوز هیچ گزینه‌ای جمع نشده و شواهدِ گزینه‌های نقطه‌دارِ بعدی
            # در همین خط هست — وگرنه خطرِ خوردنِ ساقهٔ ادامه‌دارِ «a lot of …»
            mnd = re.match(r"^([a-d])\s{1,4}(\S.*)$", ln)
            if mnd and len(cur["opts"]) == 0 and re.search(r"\s[b-d]\s*\.", ln):
                ln = f"{mnd.group(1)}. {mnd.group(2)}"
            segs = r274.split_option_line(ln, start=len(cur["opts"])) if re.match(r"^[a-d]\s*\.", ln) else None
            if segs:
                cur["opts"].extend(segs)
                continue
            mo = re.match(r"^([a-d])\s*\.\s*(.*)$", ln)
            if mo:
                cur["opts"].append(mo.group(2).strip())
                continue
            if not r274.FA_CHAR.search(ln):
                if cur["opts"]:
                    cur["opts"][-1] += " " + ln
                else:
                    cur["stem"].append(ln)
    return qs


# ————— شبکهٔ کلید چاپی: «1 a 11 a 21 c …» ۶/۷ ستونی —————
GRID_PAIR = re.compile(r"(?:^|\s)(\d{1,2})\s+([a-d])(?=\s|$)")
GRID_ANCHOR = re.compile(r"پاسخنامه\s*کلیدی\s*\d*\s*تست\s*گرامر")
GRID_STOP = re.compile(r"Note|آزمون|تشریح|امالا|املا")


def load_grid(secs, sec_idx, expect):
    """از سکشن کلید، شبکهٔ چاپی (n, letter) را می‌خواند؛ پوشش ۱..N اجباری."""
    sec = secs[sec_idx]
    started = False
    out = {}
    for ln in sec["lines"]:
        t = ln.strip()
        if not t:
            continue
        if not started:
            if GRID_ANCHOR.search(t):
                started = True
            continue
        if GRID_STOP.search(t):
            break
        for m in GRID_PAIR.finditer(t):
            n, let = int(m.group(1)), m.group(2)
            if 1 <= n <= expect and n not in out:
                out[n] = let
    return out


def main():
    dry = "--dry" in sys.argv
    verbose = "--dump" in sys.argv
    lessons_out = []
    problems = []

    for spec in BANKS:
        print(f"== درس {spec['lesson']} (pages {spec['sourcePages']}, {spec['chapter']}/sec{spec['sec']}) ==")
        qs = parse_grammar_questions(spec["pages"], spec["expect"])
        print(f"  parsed questions: {len(qs)} (expect {spec['expect']})")
        g11 = json.load(open(f"{ROOT}/public/jozve/g11.json"))
        ch = next(c for c in g11["chapters"] if c["id"] == spec["chapter"])
        grid = load_grid(ch["sections"], spec["sec"], spec["expect"])
        print(f"  grid keys: {len(grid)} (expect {spec['expect']})")

        missing_q = [n for n in range(1, spec["expect"] + 1) if n not in qs]
        missing_k = [n for n in range(1, spec["expect"] + 1) if n not in grid]
        if missing_q:
            problems.append(f"L{spec['lesson']}: missing questions {missing_q}")
        if missing_k:
            problems.append(f"L{spec['lesson']}: missing grid keys {missing_k}")

        fa_pat = re.compile(r"[\u0600-\u06FF]")
        out, lp = [], []
        no_blank = []
        for n in range(1, spec["expect"] + 1):
            q = qs.get(n)
            if not q:
                continue
            stem = r274.norm_stem(" ".join(q["stem"]))
            opts = [re.sub(r"\s{2,}", " ", o).strip() for o in q["opts"]]
            if len(opts) != 4:
                lp.append(f"L{spec['lesson']} Q{n}: {len(opts)} options {opts}")
                continue
            if len(set(opts)) != 4:
                lp.append(f"L{spec['lesson']} Q{n}: duplicate options {opts}")
            if fa_pat.search(stem) or any(fa_pat.search(o) for o in opts):
                lp.append(f"L{spec['lesson']} Q{n}: Persian leaked into English")
            if len(stem) < 12:
                lp.append(f"L{spec['lesson']} Q{n}: suspiciously short stem: {stem[:60]}")
            if not re.search(r"-{3,}", stem):
                no_blank.append(n)
            let = grid.get(n)
            if let is None:
                lp.append(f"L{spec['lesson']} Q{n}: no grid key")
                continue
            ans = "abcd".index(let)
            out.append({
                "id": f"g11-gram-l{spec['lesson']}-{n}", "n": n, "category": "grammar",
                "question": stem, "options": opts, "answer": ans,
            })
            if verbose:
                print(f"    Q{n} [{let}] {stem[:85]}")
        if no_blank:
            print(f"  ساقه‌های بدون خطِ جاخالی (ثبتِ صادقانه — برای بازبینی): {no_blank}")
        # توزیع حروف کلید — همهٔ چهار حرف باید حضور داشته باشند
        dist = {}
        for q in out:
            dist["abcd"[q["answer"]]] = dist.get("abcd"[q["answer"]], 0) + 1
        print(f"  key distribution: {dict(sorted(dist.items()))}")
        if len(dist) < 4:
            problems.append(f"L{spec['lesson']}: degenerate key distribution {dist}")
        problems.extend(lp)
        lessons_out.append({"spec": spec, "out": out, "problems": lp,
                            "noBlank": no_blank})

    if problems:
        print("\nPROBLEMS:")
        for p in problems[:40]:
            print("  -", p)
        sys.exit(1)

    if dry:
        print("\n[dry] بدون نوشتن.")
        return

    doc_out = {
        "grade": 11,
        "source": {
            "file": "جزوه جامع یازدهم .pdf",
            "banks": [
                {
                    "lesson": s["spec"]["lesson"],
                    "questionPages": s["spec"]["sourcePages"],
                    "key": s["spec"]["keyNote"],
                    "translations": "غیبتِ صادقانه — کلید گرامر در جزوه فقط شبکهٔ حرف است؛ ترجمهٔ فارسی برای تست‌های گرامر چاپ نشده.",
                }
                for s in lessons_out
            ],
        },
        "lessons": [
            {
                "lesson": s["spec"]["lesson"],
                "title": s["spec"]["title"],
                "count": len(s["out"]),
                **({"stemsWithoutBlank": s["noBlank"]} if s["noBlank"] else {}),
                "questions": s["out"],
            }
            for s in lessons_out
        ],
    }
    with open(OUT, "w") as f:
        json.dump(doc_out, f, ensure_ascii=False)
    total = sum(l["count"] for l in doc_out["lessons"])
    print(f"\nOK → {OUT} ({os.path.getsize(OUT)//1024}KB, total={total}, "
          f"lessons={[(l['lesson'], l['count']) for l in doc_out['lessons']]})")


if __name__ == "__main__":
    main()
