#!/usr/bin/env python3
"""jozve-g11-konkur-r277.py — استخراج بانک‌های «کنکوری/دستگرمی» گرامر یازدهم
L1: ۲۰ تست ص۳۴-۳۵ (کلید ص۱۸۰) / L2: ۲۰ تست ص۶۹ (کلید ص۱۸۸) / L3: ۳۰ تست ص۱۰۳-۱۰۴ (کلید ص۱۹۸)

تفاوت با جمع‌بندی (r276): کلید این بانک‌ها شبکهٔ چاپی نیست — بلوک‌های توضیحِ
«N - گزینه (X) + قلق + ترجمه تست» است و «ترجمهٔ فارسی» هم دارد! (جمع‌بندی
بی‌ترجمه بود). پارس: ماشین حالت روی خطوطِ قطعه‌قطعه (عددِ تنها، «- گزینه (»،
حرفِ تنها، «)»، توضیح، «:ترجمه تست»، جداکنندهٔ خط‌تیره).
خروجی: public/jozve/grammar-g11-konkur.json (فایل جدید — مأموریت استخراج)
"""
import importlib.util
import json
import os
import re
import sys

ROOT = "/home/z/my-project"

_spec = importlib.util.spec_from_file_location("r276", f"{ROOT}/scripts/jozve-g11-grammar-r276.py")
r276 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(r276)
r274 = r276.r274

PDF = r276.PDF
OUT = f"{ROOT}/public/jozve/grammar-g11-konkur.json"

BANKS = [
    {
        "lesson": 1, "qpages": [33, 34], "keyPages": [179, 180, 181, 182], "expect": 20,
        "title": "۲۰ تست کنکوری گرامر و نگارش درس اول — پایه یازدهم",
        "sourcePages": "34-35", "keyPagesLabel": "180-182",
        "keyNote": "«پاسخنامه تست‌های دستگرمی گرامر — درس اول (سؤالات صفحه ۳۴ و ۳۵)» — بلوک توضیح + ترجمه",
    },
    {
        "lesson": 2, "qpages": [68], "keyPages": [187, 188, 189, 190], "expect": 20,
        "title": "۲۰ تست کنکوری گرامر و نگارش درس دوم — پایه یازدهم",
        "sourcePages": "69", "keyPagesLabel": "188-190",
        "keyNote": "«پاسخنامه تست‌های کنکوری گرامر — درس دوم (سؤالات صفحه ۶۹)» — بلوک توضیح + ترجمه",
    },
    {
        "lesson": 3, "qpages": [102, 103], "keyPages": [197, 198, 199, 200, 201, 202, 203], "expect": 30,
        "title": "۳۰ تست کنکوری گرامر و نگارش درس سوم — پایه یازدهم",
        "sourcePages": "103-104", "keyPagesLabel": "198-203",
        "keyNote": "«پاسخنامه تست‌های دستگرمی گرامر و نگارش — درس ۳ (سؤالات صفحه ۱۰۳ و ۱۰۴)» — بلوک توضیح + ترجمه",
    },
]

# ————— فیلتر خطوطِ صفحهٔ کلید (مستقل از فیلتر سؤال — ترجمه باید زنده بماند) —————
FIXED_HDR = re.compile(r"جزوه|جام ــع|زبان انگل|پایه یازدهم|Vision Two|تألی|احمـدی|همــــکاران")
PAGE_NUM = re.compile(r"^\d{3}$")
SEP = re.compile(r"^-{10,}$")
NUM_ALONE = re.compile(r"^(\d{1,2})$")
NUM_FUSED = re.compile(r"^(\d{1,2})\s*[-ـ]\s*گزینه")
LETTER_WIN = re.compile(r"گ\s*ز\s*ی\s*ن\s*ه\s*\(?\s*([a-dA-D])\s*\)?")  # «گزی نه(c)» شکسته و حرف بزرگ هم می‌گیرد
TR_MARK = re.compile(r"[:：]?\s*ترجمه\s*تست")
# قطعه‌های سرصفحهٔ پاسخنامهٔ بعدی که در بافر ترجمه بلعیده می‌شوند (بدون نقل‌قول‌اند)
QUOTED = re.compile(r'"([^"]+)"')
HDR_FRAG = re.compile(r"پاس[\sـ]*خنامه|پاسخنامه|خنامه|نامه\s*کل|Note|:\s*\(سوا|سواالت\s*صفحه")
PREAMBLE = re.compile(r"شیوه\s*کیل|عمومأ|میگر|میکنیم|حدس|بزنیم")

# ————— پالایش واژه‌به‌واژهٔ r277 (مکمل fix_fa — خانواده‌های OCR این بلوک‌ها) —————
EXTRA_FIX = {
    "خییل": "خیلی", "آالسکا": "آلاسکا", "زمیر": "زمین", "زیبابی": "زیبایی",
    "کشورهابی": "کشورهایی", "کارهابی": "کارهایی", "ایتالیابی": "ایتالیایی",
    "طوالب": "طولانی", "باالبی": "بالاترین", "بیر": "بین", "بهی": "بهتر",
    "نکت": "نکنی", "دکی": "دکتر", "تعطیالت": "تعطیلات", "االن": "الان",
    "سؤاالت": "سؤالات", "نهابی": "نهایی", "نهارت": "ناهارت", "معموأل": "معمولاً",
    "معموآل": "معمولاً", "خدماب": "خدمات", "چنیر": "چند", "عالقه": "علاقه",
    "دالر": "دلار", "انگلییس": "انگلیسی", "کیم": "کمی", "بدیه": "بدهی",
    "مطمیی": "مطمئن", "کاق": "کافی", "خطرنایک": "خطرناکی", "شخیص": "شخصیت",
    "اجتمایع": "اجتماعی", "احتماأل": "احتمالاً", "مخصوصأ": "مخصوصاً", "لطفأ": "لطفاً",
    "واقعأ": "واقعاً", "کامأل": "کاملاً", "بزب": "بزنی", "عیل": "علی",
}
EXTRA_PHRASES = [
    # بلند ← کوتاه (ترتیب مهم است)
    ("ه سختی تلاش کت", "سخت‌تر تلاش کنی"), ("بگیر می بن را", "بگیریم او را"),
    ("وری داشی", "داشتن"), ("رص هستند", "حیاتی هستند"),
    ("به شعت وش بن ؟ ند", "به سرعت بنوشند"),
    ("رفی به شنا", "رفتن به شنا"), ("قفل کت", "قفل کنی"),
    ("میی دم", "می‌بردم"), ("میی د", "می‌برد"),
    ("به آساب", "به آسانی"), ("اسی ب", "اسپرت"),
    ("تصمیم گیر ی", "تصمیم‌گیری"), ("نیر وی", "نیروی"),
    ("ش کار", "سر کار"), ("ش وقت", "سر وقت"),
    ("به شیر از", "به شیراز"), ("به آرایم", "به آرام"),
    ("همیر وقتها", "همین وقتها"), ("در مورد ش", "در موردش"),
    ("ش و نه", "صد و نه"), ("پیی ای", "پیتزای"),
    ("می لت", "منزل‌ات"), ("میتواب", "می‌توانی"), ("بیر ون", "بیرون"),
    ("ش وع", "شروع"), ("میر سه", "میرسد"), ("میر سید", "می‌رسید"),
    ("نمیر ش", "نمی‌رسی"), ("میر ود", "می‌رود"), ("میر و د", "می‌رود"),
    ("بین ون", "بیرون"), ("زماب", "زمان"), ("رصف", "صرف"),
    ("شغیل", "شغلی"), ("غذابی", "غذایی"), ("چیر ی", "چیزی"), ("چیر", "چیز"),
    ("ش کت", "شرکت"), ("مهماب", "مهمانی"), ("ماشیر", "ماشین"),
    ("آساب", "آسان"), ("شعت", "شهر"), ("جلوگیر ی", "جلوگیری"),
    ("انجام بدیه", "انجام بدهی"),
    ("رنگ آمیر ی", "رنگ‌آمیزی"), ("خوایه داد", "خواهد داد"),
    ("شد خواهد شد", "سرد خواهد شد"), ("ازم خواست", "از من خواست"),
    ("س ش وقت", "سر وقت"), ("می شود", "می‌شود"),
]

# ————— بازچینی‌های رسیددار (واژه‌چینیِ لایهٔ متنی به‌هم‌ریخته — از قطعات خود جزوه) —————
RESTORE = {
    (1, 18): "آیا بچه‌های کوچک اغلب باید در صبح‌ها، شیر خیلی زیادی را خیلی به سرعت بنوشند؟",
    (3, 20): "آیا انتظار داری در آن دوره قبول بشوی. اگه اینطور است، تو بهتره سخت‌تر تلاش کنی",
    (3, 26): "فقط تصور کن که در یک بیابان وسیع، تشنه باشی و هیچ آب نداشت؛ برای نجات زندگیت چکار می‌کنی؟",
    (3, 29): "مرد فکر کرد که واقعاً برای همهٔ هتل مهم است که بتوانند سالن انتظار را هرچه سریع‌تر ترک کنند",
}


def polish_tr(t):
    t = re.sub(r"\s{2,}", " ", t)  # فاصلهٔ دوبلِ OCR قبل از جایگزینیِ عبارت‌ها
    for a, b in EXTRA_PHRASES:
        t = t.replace(a, b)
    out = []
    for w in t.split():
        out.append(EXTRA_FIX.get(w, w))
    return re.sub(r"\s{2,}", " ", " ".join(out)).strip()


def parse_key_pages(pages, expect, label):
    import fitz
    doc = fitz.open(PDF)
    raw = []
    for p in pages:
        raw.extend(doc[p].get_text("text").splitlines())

    # حذف سرصفحهٔ ثابت + شمارهٔ صفحهٔ ۳رقمی + جداکننده‌ها علامتِ پایان می‌مانند
    lines = []
    for ln in raw:
        s = ln.strip()
        if not s or PAGE_NUM.match(s) or FIXED_HDR.search(s):
            continue
        lines.append(s)

    keys, trans, expl, problems = {}, {}, {}, []
    i, expect_next = 0, 1
    n = None
    while i < len(lines):
        if expect_next > expect:  # تمام — اعدادِ بعدیِ اینجا مالِ شبکهٔ بانک بعدی‌اند
            break
        s = lines[i]
        m_alone = NUM_ALONE.match(s)
        m_fused = NUM_FUSED.match(s)
        if m_alone and int(m_alone.group(1)) == expect_next:
            n = int(s)
            i += 1
        elif m_fused and int(m_fused.group(1)) == expect_next:
            n = int(m_fused.group(1))
            i += 1  # حرف ممکن است در همین خط باشد — در پنجرهٔ زیر
        else:
            i += 1
            continue
        if n > expect:  # گاردِ شبح — شماره‌های شبکهٔ بانک بعدی
            break
        # پنجرهٔ حرف: تا ۵ خطِ بعدیِ غیر-عدد
        win = []
        j = i
        while j < len(lines) and len(win) < 5:
            t = lines[j]
            if NUM_ALONE.match(t) and int(t) == n + 1:
                break
            if SEP.match(t):
                break
            win.append(t)
            j += 1
            if LETTER_WIN.search(t):
                break
        joined = " ".join(win)
        ml = LETTER_WIN.search(joined)
        if not ml:
            problems.append(f"{label} Q{n}: no letter in window {win[:3]}")
            n = None
            continue
        keys[n] = ml.group(1).lower()
        # توضیح + ترجمه تا جداکننده یا عددِ بعدی
        buf_tr, in_tr = [], False
        k = j
        while k < len(lines):
            t = lines[k]
            if SEP.match(t):
                k += 1
                break
            if NUM_ALONE.match(t) and int(t) == n + 1:
                break
            if NUM_FUSED.match(t) and int(NUM_FUSED.match(t).group(1)) == n + 1:
                break
            if not in_tr and TR_MARK.search(t):
                in_tr = True
                t = TR_MARK.sub(" ", t)
                t = t.strip().strip(':：').strip()
            if in_tr:
                buf_tr.append(t)
            k += 1
        tr_raw = " ".join(buf_tr).strip()
        # ۱) برشِ سرصفحهٔ پاسخنامهٔ بعدی که بی‌نقل‌قول می‌آید
        tr_cut = HDR_FRAG.split(tr_raw)[0].strip()
        # ۲) ترجمه بین نخستین و آخرین نقل‌قول (نقل‌قولِ داخلیِ «رامان» حفظ می‌ماند)
        if '"' in tr_cut:
            a = tr_cut.index('"')
            b = tr_cut.rindex('"')
            tr_clean = (tr_cut[a + 1: b] if b > a else tr_cut[a + 1:]).strip()
        else:
            tr_clean = tr_cut
        trans[n] = tr_clean
        expect_next = n + 1
        n = None
        i = k
    return keys, trans, problems


def main():
    dry = "--dry" in sys.argv
    verbose = "--dump" in sys.argv
    lessons_out, problems = [], []

    for spec in BANKS:
        les = spec["lesson"]
        print(f"== درس {les} (Q: ص{spec['sourcePages']}, key: ص{spec['keyPagesLabel']}) ==")
        qs = r276.parse_grammar_questions(spec["qpages"], spec["expect"])
        print(f"  parsed questions: {len(qs)} (expect {spec['expect']})")
        keys, trans, kp = parse_key_pages(spec["keyPages"], spec["expect"], f"L{les}")
        print(f"  key blocks: {len(keys)} | translations: {sum(1 for v in trans.values() if v)}")
        problems.extend(kp)

        missing_q = [n for n in range(1, spec["expect"] + 1) if n not in qs]
        missing_k = [n for n in range(1, spec["expect"] + 1) if n not in keys]
        if missing_q:
            problems.append(f"L{les}: missing questions {missing_q}")
        if missing_k:
            problems.append(f"L{les}: missing keys {missing_k}")

        fa_pat = re.compile(r"[\u0600-\u06FF]")
        latin_pat = re.compile(r"[A-Za-z]{3,}")
        out, lp = [], []
        for n in range(1, spec["expect"] + 1):
            q = qs.get(n)
            if not q or n not in keys:
                continue
            stem = r274.norm_stem(" ".join(q["stem"]))
            opts = [re.sub(r"\s{2,}", " ", o).strip() for o in q["opts"]]
            if len(opts) != 4:
                lp.append(f"L{les} Q{n}: {len(opts)} options")
                continue
            if len(set(opts)) != 4:
                lp.append(f"L{les} Q{n}: duplicate options")
            if fa_pat.search(stem) or any(fa_pat.search(o) for o in opts):
                lp.append(f"L{les} Q{n}: Persian leaked into English")
            let = keys[n]
            tr = RESTORE.get((les, n))
            if tr is None:
                tr = r274.fix_fa(trans.get(n, ""))
                tr = polish_tr(tr)
            tr = re.sub(r"\s{2,}", " ", tr).strip().strip('"').strip().replace('".', '.')
            if not tr:
                lp.append(f"L{les} Q{n}: empty translation")
            elif latin_pat.search(tr):
                lp.append(f"L{les} Q{n}: Latin in translation: {tr[:70]}")
            ans = "abcd".index(let)
            out.append({
                "id": f"g11-kgram-l{les}-{n}", "n": n, "category": "grammar",
                "question": stem, "options": opts, "answer": ans,
                "translation": tr,
            })
            if verbose:
                print(f"    Q{n} [{let}] {stem[:70]} | {tr[:55]}")
        missing_tr = [q["n"] for q in out if not q.get("translation")]
        if missing_tr:
            print(f"  ترجمهٔ غایب (صداقتِ رسید): {missing_tr}")
        rest_n = sorted(n for (l, n) in RESTORE if l == les)
        if rest_n:
            print(f"  restorations: {rest_n}")
        dist = {}
        for q in out:
            dist["abcd"[q["answer"]]] = dist.get("abcd"[q["answer"]], 0) + 1
        print(f"  key distribution: {dict(sorted(dist.items()))}")
        if len(dist) < 3:
            problems.append(f"L{les}: degenerate key distribution {dist}")
        problems.extend(lp)
        lessons_out.append({"spec": spec, "out": out})

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
                    "keyPages": s["spec"]["keyPagesLabel"],
                    "key": s["spec"]["keyNote"],
                }
                for s in lessons_out
            ],
        },
        "lessons": [
            {
                "lesson": s["spec"]["lesson"], "title": s["spec"]["title"],
                "count": len(s["out"]),
                **({
                    "translationRestorations": {
                        "count": len([1 for (l, _) in RESTORE if l == s["spec"]["lesson"]]),
                        "note": "لایهٔ متنی PDF واژه‌های ترجمه را به‌هم ریخته بود؛ از قطعاتِ خودِ جزوه بازچینی شد.",
                        "questions": sorted(n for (l, n) in RESTORE if l == s["spec"]["lesson"]),
                    }
                } if any(l == s["spec"]["lesson"] for (l, _) in RESTORE) else {}),
                "questions": s["out"],
            }
            for s in lessons_out
        ],
    }
    with open(OUT, "w") as f:
        json.dump(doc_out, f, ensure_ascii=False)
    total = sum(l["count"] for l in doc_out["lessons"])
    print(f"\nOK → {OUT} ({os.path.getsize(OUT)//1024}KB, total={total})")


if __name__ == "__main__":
    main()
