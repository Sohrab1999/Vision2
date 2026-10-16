#!/usr/bin/env python3
"""jozve-g11-banks-r275.py — استخراج بانک‌های ۴۰تستی واژگان جزوهٔ یازدهم (درس ۱/۲/۳)

تفاوت‌های ساختاری با دوازدهم (میراث r273/r274):
  - هر درس ۴۰ تست است (ص۱۹-۲۰، ۵۷-۵۸، ۹۱-۹۲) — نه ۱۰۰.
  - شمارهٔ سؤال گاهی به متن چسبیده («40.The») — پارسر با فاصلهٔ اختیاری می‌گیرد.
  - کلید واژگان شبکهٔ جداگانه ندارد: حرفِ کلید داخل سرصفحهٔ ترجمه است
    («.Nگزینه ( )Xترجمه تست :...») — یعنی «کلید و ترجمه» جزوه یکی‌اند؛
    سرصفحه‌های گرامر با «-Nگزینه» می‌آیند و با نقطهٔ اجباری جدا می‌شوند.
  - گزینه‌ها تک‌خطی (همان قطعه‌شکن r274 با گارد حرفِ انتظاری).
  - لایهٔ متنی sec0 همان آشوبِ wrap است — ماشین r274 + بازچینی‌های رسیددار.
خروجی: public/jozve/tests-g11.json (فایل جدید؛ مأموریت «استخراج جزوه‌ها» — پایه یازدهم)
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
G11 = f"{ROOT}/public/jozve/g11.json"
OUT = f"{ROOT}/public/jozve/tests-g11.json"

LESSONS = [
    {
        "lesson": 1, "pages": [18, 19], "chapter": "c12",
        "title": "۴۰ تست واژگان درس اول — پایه یازدهم",
        "sourcePages": "19-20",
        "keyNote": "c12/sec0 — حرف کلید در سرصفحهٔ ترجمهٔ خود جزوه («گزینه (X)»)",
    },
    {
        "lesson": 2, "pages": [56, 57], "chapter": "c13",
        "title": "۴۰ تست واژگان درس دوم — پایه یازدهم",
        "sourcePages": "57-58",
        "keyNote": "c13/sec0 — حرف کلید در سرصفحهٔ ترجمهٔ خود جزوه («گزینه (X)»)",
    },
    {
        "lesson": 3, "pages": [90, 91], "chapter": "c14",
        "title": "۴۰ تست واژگان درس سوم — پایه یازدهم",
        "sourcePages": "91-92",
        "keyNote": "c14/sec0 — حرف کلید در سرصفحهٔ ترجمهٔ خود جزوه («گزینه (X)»)",
    },
]

# ————— سرصفحهٔ تکراری صفحات یازدهم (تنها حذف مجاز) —————
JUNK_SUB = list(r274.JUNK_SUB) + [
    r"Vision\s*Two", r"پایه\s*یازدهم", r"متوسط", r"^تست$", r"^های$", r"تست واژ",
    r"^گان", r"واژ گان", r"^بخش", r"^\s*و\s*$",
]
JUNK_RE = [re.compile(p) for p in JUNK_SUB]


def clean_page_g11(lines):
    out = []
    for ln in lines:
        s = ln.strip()
        if not s or r274.BRACKET_ONLY.match(s):
            continue
        if any(rx.search(s) for rx in JUNK_RE):
            continue
        out.append(s)
    return out


def parse_questions_g11(pages):
    import fitz
    doc = fitz.open(PDF)
    raw = []
    for p in pages:
        raw.extend(doc[p].get_text("text").splitlines())
    lines = clean_page_g11(raw)

    qs, cur, expect = {}, None, 1
    for ln in lines:
        mq = re.match(r"^(\d{1,3})\.\s*(.*)$", ln)
        if mq and int(mq.group(1)) == expect:
            n = int(mq.group(1))
            if cur is not None and len(cur["opts"]) != 4:
                print(f"  warn: Q{cur['n']} incomplete ({len(cur['opts'])} opts) before Q{n}")
            cur = {"n": n, "stem": [mq.group(2)], "opts": []}
            qs[n] = cur
            expect = n + 1
            continue
        if cur is None:
            continue
        if len(cur["opts"]) < 4:
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


# ————— کلید+ترجمه از sec0 فصل: «.Nگزینه ( )Xمتن» —————
# نقطهٔ اجباری پیش از شماره: توضیحاتِ گرامر با «-Nگزینه» شروع می‌شوند و نباید گرفته شوند.
TR_G11 = re.compile(
    r"^[\s\u0600-\u06FF(){}.'\"«»،؛:؟!0-9\u200c]*\.\s*(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?\s*(?:ترجمه\s*تست\s*[:：]?)?\s*(.*)$"
)
EMB_G11 = re.compile(r"\.\s*(\d{1,3})\s*گزینه\s*\(\s*\)?\s*([a-d])\s*\)?\s*(?:ترجمه\s*تست\s*[:：]?)?")
# پایانِ بخش ترجمه: شبکهٔ بانک بعدی / شروع خانوادهٔ گرامر
STOP_MARKERS = ("(آزمون", "پاسخنامه کلیدی", "پاسخنامه", "Note", "Grammar")
MAX_N = 40


def load_translations_g11(secs):
    """sec0 → {n: (letter, text)}؛ نقطه‌اجباری (جدایی از توضیحات گرامرِ «-Nگزینه»)،
    گارد بازهٔ ۱..۴۰، نشانگرهای توقف (شبکهٔ بانک بعدی)، شکاف‌کنِ سرصفحهٔ توکار و
    فیلتر قطعات یتیم — ماشین r274."""
    out = {}
    pending = None
    stopped = False
    for ln in secs[0]["lines"]:
        t = ln.strip()
        if not t or r274.ORPHAN.match(t):
            continue
        if any(mk in t for mk in STOP_MARKERS):
            # متن قبل از نشانگر ممکن است دمِ ترجمهٔ در-انتظار باشد
            pre = t
            for mk in STOP_MARKERS:
                pre = pre.split(mk)[0]
            pre = pre.strip()
            if pending is not None and pre and pending in out:
                out[pending] = (out[pending][0], out[pending][1] + " " + pre)
            stopped = True
            break
        m = TR_G11.match(t)
        if m:
            n = int(m.group(1))
            if 1 <= n <= MAX_N:
                pending = n
                if n not in out:  # اولین occurrence برنده
                    out[n] = (m.group(2), r274.strip_tr_marker(m.group(3)))
            continue
        if pending is None or pending not in out:
            continue
        m2 = EMB_G11.search(t)
        if m2:
            new_n = int(m2.group(1))
            if 1 <= new_n <= MAX_N and new_n != pending:
                head = t[: m2.start()].strip()
                if head:
                    out[pending] = (out[pending][0], out[pending][1] + " " + head)
                if new_n not in out:
                    out[new_n] = (m2.group(2), r274.strip_tr_marker(t[m2.end():]))
                pending = new_n if new_n in out else pending
            # شمارهٔ بیرون از بازه یا تکراری: به‌عنوان متنِ ادامه نادیده
        else:
            out[pending] = (out[pending][0], out[pending][1] + " " + t)
    del stopped
    return out


# ————— بازچینی‌های رسیددار (لایهٔ متنی sec0 یازدهم) —————
# c14 (درس ۳) پرآشوب‌ترین است: دم‌ها قبل از سرصفحه + سرصفحهٔ توکار + آلودگی همسایه.
RESTORE = {
    ("c12", 1): "او توانایی خوبی به عنوان اسکیت‌باز روی یخ دارد و هر ساله در رقابت‌ها جوایز زیادی می‌برد.",
    ("c14", 20): "در این نسخه‌های خیط قدیمی، در این موزه مشهور چند تا خطایط عال وجود دارد.",
    ("c14", 21): "او در حال حاضر یک گویندهٔ ورزیده است، اما در حرفهٔ سابقش به عنوان یک بازیگر ستاره بود.",
    ("c14", 22): "این کار، نوشتن مقاله‌ای درباره یکی از موضوعات مورد بحث در کلاس بود.",
    ("c14", 23): "عملکرد ضعیف او در مدرسه تا حد زیادی به دلیل طرز برخورد و نگرش اوست نه به خاطر توانایی‌هایش.",
    ("c14", 25): "زمین در منظومهٔ شمسی منحصر به فرد است و از زندگی گیاه و حیوان حمایت می‌کند.",
    ("c14", 26): "بسیار خوشحالم که فرصت ملاقات با شما را پیدا کرده‌ام.",
    ("c14", 27): "آن‌گاه که با مشکلات زیادی در زندگی برخورد کرده‌اید، مراقب علائم افسردگی باشید.",
    ("c14", 28): "امروز او شادمان و در وضعیت روحی خوبی از خودش است، اما این به دلیل اثر ملاقات شماست.",
    ("c14", 29): "همه تلاش‌هایی که دولت برای کنترل تورم انجام داد شکست خورده است و نرخ آن خیلی زیاد شده است.",
    ("c14", 30): "پلیس قاتل را مورد بازجویی قرار داد و از او اثر انگشت را روی اسلحه برای تشخیص جرم گرفت.",
    ("c14", 31): "کاملاً غیرمنطقی است اما او تا حد مرگ از موش‌ها می‌ترسد و وقتی آنها را می‌بیند خیلی نگران می‌شود.",
    ("c14", 33): "وقتی کسی پارچه‌ای، قالیچه‌ای، سبدی و غیره را با دست با عبور دادن نخ‌ها یا تکه‌های نازک زیر و روی همدیگر می‌سازد، در حقیقت او آن را می‌بافد.",
    ("c14", 34): "فروشگاه طیف جدیدی از مواد غذایی را برای بچه‌ها در محلهٔ ما معرفی کرده است.",
    ("c14", 36): "من معتقدم که دیدگاهم به‌طور گسترده‌ای میان اکثریت دانشجویان دانشگاه در جهان به اشتراک گذاشته می‌شود.",
    ("c14", 37): "کاشی، تکه‌ای مربع‌شکل صاف از گل پخته‌شده یا مواد دیگر است که برای پوشش دیوارها، کف‌ها و غیره استفاده می‌شود.",
    ("c14", 40): "چقدر آن آبشار عال‌معرکه بود. ما همه ازش لذت بردیم و بی‌صبرانه منتظریم آن را ببینیم.",
}


def main():
    dry = "--dry" in sys.argv
    verbose = "--dump" in sys.argv
    lessons_out = []
    problems = []

    for spec in LESSONS:
        print(f"== درس {spec['lesson']} (pages {spec['sourcePages']}, {spec['chapter']}) ==")
        qs = parse_questions_g11(spec["pages"])
        print(f"  parsed questions: {len(qs)} (expect 40)")
        g11 = json.load(open(G11))
        ch = next(c for c in g11["chapters"] if c["id"] == spec["chapter"])
        tr = load_translations_g11(ch["sections"])
        print(f"  header keys+translations: {len(tr)}")
        fa_pat = re.compile(r"[\u0600-\u06FF]")
        out, lp = [], []
        for n in range(1, 41):
            q = qs.get(n)
            if not q:
                lp.append(f"L{spec['lesson']} Q{n}: missing")
                continue
            stem = r274.norm_stem(" ".join(q["stem"]))
            opts = [re.sub(r"\s{2,}", " ", o).strip() for o in q["opts"]]
            if len(opts) != 4:
                lp.append(f"L{spec['lesson']} Q{n}: {len(opts)} options {opts}")
                continue
            if len(set(opts)) != 4:
                lp.append(f"L{spec['lesson']} Q{n}: duplicate options {opts}")
            hit = tr.get(n)
            if not hit:
                lp.append(f"L{spec['lesson']} Q{n}: no key/translation header")
                continue
            let, trtext = hit
            if fa_pat.search(stem) or any(fa_pat.search(o) for o in opts):
                lp.append(f"L{spec['lesson']} Q{n}: Persian leaked into English")
            if not re.search(r"-{5,}", stem):
                lp.append(f"L{spec['lesson']} Q{n}: no blank in stem: {stem[:60]}")
            key = (spec["chapter"], n)
            restored = key in RESTORE
            if restored:
                trtext = RESTORE[key]
            else:
                trtext = r274.fix_fa(trtext)
            if trtext:
                tr_clean = trtext
                for ok in r274.TR_LATIN_OK:
                    tr_clean = tr_clean.replace(ok, "")
                if re.search(r"[A-Za-z]{3,}", tr_clean):
                    lp.append(f"L{spec['lesson']} Q{n}: Latin in translation: {tr_clean[:60]}")
            ans = "abcd".index(let)
            out.append({
                "id": f"g11-l{spec['lesson']}-{n}", "n": n, "category": "vocab",
                "question": stem, "options": opts, "answer": ans,
                **({"translation": trtext} if trtext else {}),
            })
            if verbose:
                print(f"    Q{n} [{let}] {stem[:80]} | {trtext[:60]}")
        missing_tr = [q["n"] for q in out if not q.get("translation")]
        if missing_tr:
            print(f"  ترجمهٔ غایب (صداقتِ رسید): {missing_tr}")
        print(f"  restorations: {sorted(n for (c, n) in RESTORE if c == spec['chapter'])}")
        problems.extend(lp)
        lessons_out.append({"spec": spec, "out": out, "problems": lp})

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
            "lessons": [
                {
                    "lesson": s["spec"]["lesson"],
                    "questionPages": s["spec"]["sourcePages"],
                    "key": s["spec"]["keyNote"],
                }
                for s in lessons_out
            ],
        },
        "lessons": [
            {
                "lesson": s["spec"]["lesson"],
                "title": s["spec"]["title"],
                "count": len(s["out"]),
                **({
                    "translationRestorations": {
                        "count": len([1 for (c, _) in RESTORE if c == s["spec"]["chapter"]]),
                        "note": "لایهٔ متنی PDF سرصفحه‌های ترجمه را جابه‌جا برده بود؛ از قطعاتِ خودِ جزوه بازچینی شد.",
                        "questions": sorted(n for (c, n) in RESTORE if c == s["spec"]["chapter"]),
                    }
                } if any(c == s["spec"]["chapter"] for (c, _) in RESTORE) else {}),
                "questions": s["out"],
            }
            for s in lessons_out
        ],
    }
    with open(OUT, "w") as f:
        json.dump(doc_out, f, ensure_ascii=False)
    print(f"\nOK → {OUT} ({os.path.getsize(OUT)//1024}KB, lessons={[l['lesson'] for l in doc_out['lessons']]})")


if __name__ == "__main__":
    main()
