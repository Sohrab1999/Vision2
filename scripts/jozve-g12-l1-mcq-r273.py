#!/usr/bin/env python3
"""jozve-g12-l1-mcq-r273.py — استخراج ۱۰۰ تست واژگان درس ۱ جزوهٔ دوازدهم (درخواست صریح کاربر: «استخراج جزوه ها رو ادامه بده»)

قوانین پارسر (میراث r265-r268):
  - سؤال‌ها صفحه‌به‌صفحه از PDF (ص۲۱-۲۵)؛ سرصفحهٔ تکراری (عنوان/نویسنده/ناشر/Note) حذف
    — تنها استثنای مجازِ حذف طبق درخواست اولیه کاربر (هویت مؤلف).
  - شماره‌سؤال‌ها باید متوالی ۱..۱۰۰ باشند (گارد رانش پارسر).
  - کلید: شبکهٔ ص۱۸۱ در خود جزوه (فصل c13 سکشن ۱ در g12.json) — «شماره حرف» جفت‌ها.
  - ترجمهٔ سریع: سکشن ۰ فصل c13 («)X( -Nترجمه تست :...») — اولین occurrence برنده.
  - جای خالیِ شکستهٔ PDF («-- -------») به یک جای خالی استاندارد نرمال می‌شود؛ خط تیرهٔ
    درون‌واژه‌ای (anti-social) دست‌نخورده می‌ماند.
  - راستی‌آزمایی: شمارش، یکتایی گزینه‌ها، اعتبار حرف کلید، خلوص انگلیسی/فارسی،
    هم‌خوانی حرفِ ترجمهٔ سریع با شبکه، ۵ بازبینی معنایی نقطه‌ای.
خروجی: public/jozve/tests-g12.json
"""
import fitz, json, re, sys

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
G12 = f"{ROOT}/public/jozve/g12.json"
OUT = f"{ROOT}/public/jozve/tests-g12.json"

Q_PAGES = list(range(20, 25))  # 0-indexed → ص ۲۱..۲۵

# ————— سرصفحهٔ تکراری هر صفحه (عنوان/نویسنده — تنها حذف مجاز) —————
JUNK_SUB = [
    r"جزوه", r"جام", r"کمک\s*آموزش", r"زبان\s*انگل", r"پایه\s*دو\s*ازدهم",
    r"Vision\s*Three", r"تألیف", r"گردآوری", r"احمـ?دی", r"جمـ?ـ?ـ?ـ?ال",
    r"^:{1,2}$", r"^Note$", r"^-{8,}$", r"^\u201c?\d{1,3}\u201d?$",
    r"100تست", r"واژگ", r"درس\s*اول", r"پایه\s*دوازدهم", r"پاسخنامه\s*صفحه",
    r"^\s*تا\s*184\s*$", r"سطح\s*تستها", r"استاندارد", r"کنکوری", r"^\"$",
]
JUNK_RE = [re.compile(p) for p in JUNK_SUB]
BRACKET_ONLY = re.compile(r"^[\)\(\[\]\"\u201c\u201d\s:؛،]*$")
FA_CHAR = re.compile(r"[\u0600-\u06FF]")

BLANK_FIX = re.compile(r"-+(?:\s+-+)+")       # «-- -------» → یک جای خالی
BLANK_RUN = re.compile(r"-{2,}")               # «---------» → استاندارد
BLANK = "-" * 15

def clean_page(lines):
    out = []
    for ln in lines:
        s = ln.strip()
        if not s or BRACKET_ONLY.match(s):
            continue
        if any(rx.search(s) for rx in JUNK_RE):
            continue
        out.append(s)
    return out

def parse_questions():
    doc = fitz.open(PDF)
    raw = []
    for p in Q_PAGES:
        raw.extend(doc[p].get_text("text").splitlines())
    lines = clean_page(raw)

    qs, cur, expect = {}, None, 1
    for ln in lines:
        mq = re.match(r"^(\d{1,3})\.\s*(.*)$", ln)
        mo = re.match(r"^([a-d])\s*\.\s*(.*)$", ln)
        if mq and int(mq.group(1)) == expect:
            # گارد توالی: شمارهٔ انتظاری ⇒ سؤال جدید (حتی اگر قبلی ناقص — ثبت هشدار)
            n = int(mq.group(1))
            if cur is not None and len(cur["opts"]) != 4:
                print(f"  warn: Q{cur['n']} incomplete ({len(cur['opts'])} opts) before Q{n}")
            cur = {"n": n, "stem": [mq.group(2)], "opts": []}
            qs[n] = cur
            expect = n + 1
        elif mo and cur is not None and len(cur["opts"]) < 4:
            cur["opts"].append(mo.group(2).strip())
        elif cur is not None and len(cur["opts"]) < 4:
            if not FA_CHAR.search(ln):   # ادامهٔ ساقه فقط انگلیسی
                cur["stem"].append(ln)
        elif cur is not None and cur["opts"] and not FA_CHAR.search(ln):
            cur["opts"][-1] += " " + ln  # ادامهٔ گزینهٔ آخر (نادر)
    return qs

def norm_stem(s):
    s = BLANK_FIX.sub(f" {BLANK} ", s)
    s = BLANK_RUN.sub(BLANK, s)
    return re.sub(r"\s{2,}", " ", s).strip()

# ————— کلید و ترجمه از فصل c13 —————
def load_key_and_translations():
    g12 = json.load(open(G12))
    ch = next(c for c in g12["chapters"] if c["id"] == "c13")
    secs = ch["sections"]
    grid = {}
    for ln in secs[1]["lines"]:
        for num, let in re.findall(r"(\d{1,3})\s+([a-d])\b", ln):
            grid[int(num)] = let
    trans, tlet = {}, {}
    # پیش‌موندِ حرفِ اضافهٔ PDF (مثل «ی (b)-61…») هم پوشانده می‌شود
    pat = re.compile(r"^[\s\u0600-\u06FF(){}\[\]\"'«»]*([a-d])[\s()\[\]]*-\s*(\d{1,3})\s*ترجمه")
    for s in secs:
        pending = None
        for ln in s["lines"]:
            m = pat.match(ln.strip())
            if m:
                pending = int(m.group(2))
                if pending not in trans:  # اولین occurrence برنده
                    tlet[pending] = m.group(1)
                    tail = re.split(r"[:：]", ln, maxsplit=1)
                    trans[pending] = tail[1].strip() if len(tail) > 1 else ""
            elif pending is not None:
                nxt = re.match(r"^-{0,2}\s*\d{1,3}\s*(گزینه|ترجمه)", ln.strip())
                if ln.strip() and not nxt and pending in trans:
                    trans[pending] += " " + ln.strip()
                else:
                    pending = None
    return grid, trans, tlet

# ————— داوریِ واگراییِ کلید (پروتکل r269: معناشناسی بر شبکهٔ چاپی می‌چربد) —————
# هر واگراییِ حرفِ ترجمهٔ سریع با شبکه باید این‌جا با دلیل ثبت شود؛ وگرنه پارسر exit(1).
KEY_OVERRIDES = {
    74: ("b", "grid 'c' (cause) semantically impossible: 'airbag failed to cause his daughter'؛ "
                "ترجمهٔ خود جزوه: «کیسۀ هوا نتوانسته بود از دخترش محافظت کند» → protect = b"),
    79: ("a", "grid 'b' (protection) در ترجمهٔ خود جزوه نیست؛ ترجمه: «مسئولیت‌پذیری خوبی برای بهبود کیفیت زندگی کاری» → responsibility = a"),
}

# ————— پالایش واژگانی رندر RTL (میراث r265: WORD_FIXES هدفمند) —————
WORD_FIXES = {
    "تالش": "تلاش", "اخالقی": "اخلاقی", "احیام": "احترام", "قدرداب": "قدردان",
    "بر یم": "برمی", "ميشود": "می‌شود", "میشود": "می‌شود", "ميكنند": "می‌کنند",
    "میشوند": "می‌شوند", "ميدهد": "می‌دهد", "میدهد": "می‌دهد", "نميدانم": "نمی‌دانم",
    "نمیدانم": "نمی‌دانم", "باشد": "باشد", "مي": "می", "شاني": "شانی",
    "خصوصي": "خصوصی", "بانك": "بانک", "چقي": "چیزی", "اطالعات": "اطلاعات",
    "مطابق": "مطابق", "بقال": "بلا", "ساال": "ساله", "سالخوردگي": "سالخوردگی",
    "سالي": "سالی", "عاالقه": "علاقه", "عاالو": "علاوه", "دالل": "دلالت",
    "تحصيالت": "تحصیلات", "فعاالنت": "فعالان", "بالا": "بالا", "االنه": "اینکه",
    "ميآيد": "می‌آید", "ميآورد": "می‌آورد", "ترجمه تست": "ترجمه تست",
}

def fix_fa(t):
    t = t.replace("ي", "ی").replace("ك", "ک").replace("‌ ", "‌")
    for a, b in WORD_FIXES.items():
        t = re.sub(rf"(?<![آ-ی]){re.escape(a)}(?![آ-ی])", b, t)
    return re.sub(r"\s{2,}", " ", t).strip()

# ————— داوریِ واگراییِ کلید (پروتکل r269: معناشناسی بر شبکهٔ چاپی می‌چربد) —————
KEY_OVERRIDES = {
    74: ("b", "grid 'c' (cause) semantically impossible: 'airbag failed to cause his daughter'؛ ترجمهٔ خود جزوه: «کیسۀ هوا نتوانسته بود از دخترش محافظت کند» → protect = b"),
    79: ("a", "grid 'b' (protection) در ترجمهٔ خود جزوه نیست؛ ترجمه: «مسئولیت‌پذیری خوبی برای بهبود کیفیت زندگی کاری» → responsibility = a"),
}

def main():
    qs = parse_questions()
    grid, trans, tlet = load_key_and_translations()
    print(f"parsed questions: {len(qs)} (expect 100)")
    print(f"grid keys: {len(grid)}, quick translations: {len(trans)}")
    problems, overrides_used = [], []
    out = []
    fa_pat = re.compile(r"[\u0600-\u06FF]")
    en_pat = re.compile(r"[A-Za-z]")
    for n in range(1, 101):
        q = qs.get(n)
        if not q:
            continue
        stem = norm_stem(" ".join(q["stem"]))
        opts = [re.sub(r"\s{2,}", " ", o).strip() for o in q["opts"]]
        if len(opts) != 4:
            problems.append(f"Q{n}: {len(opts)} options")
            continue
        if len(set(opts)) != 4:
            problems.append(f"Q{n}: duplicate options {opts}")
        let = grid.get(n)
        if let is None:
            problems.append(f"Q{n}: no key")
            continue
        if fa_pat.search(stem) or any(fa_pat.search(o) for o in opts):
            problems.append(f"Q{n}: Persian leaked into English")
        if not re.search(r"-{5,}", stem):
            problems.append(f"Q{n}: no blank in stem: {stem[:60]}")
        tr = fix_fa(trans.get(n, "")) if n in trans else ""
        if tr and tlet.get(n) != let:
            if n in KEY_OVERRIDES and KEY_OVERRIDES[n][0] == tlet.get(n):
                let = tlet.get(n)  # داوری معنایی: ترجمهٔ سریع برنده — با ثبت در رسید
                overrides_used.append({"q": n, "letter": let, "why": KEY_OVERRIDES[n][1]})
                print(f"  override Q{n}: key→{let} — {KEY_OVERRIDES[n][1][:70]}…")
            else:
                problems.append(f"Q{n}: translation letter {tlet.get(n)} != grid {let} and no override")
        ans = "abcd".index(let)
        if tr and en_pat.search(tr):
            tr_clean = re.sub(r"\b(Vision|Three)\b", "", tr)
            if re.search(r"[A-Za-z]{3,}", tr_clean):
                problems.append(f"Q{n}: Latin in translation: {tr_clean[:60]}")
        out.append({
            "id": f"g12-l1-{n}", "n": n, "category": "vocab",
            "question": stem, "options": opts, "answer": ans,
            **({"translation": tr} if tr else {}),
        })

    # ————— بازبینی معنایی نقطه‌ای (۵ نمونهٔ شناخته‌شده) —————
    def opt_of(n): return out[n-1]["options"][out[n-1]["answer"]]
    checks = [(1, "attempt"), (11, "donate"), (25, "spare"), (84, None), (100, "make")]
    for n, want in checks:
        if n <= len(out):
            got = opt_of(n)
            if want and want not in got.lower():
                problems.append(f"semantic Q{n}: expected '{want}' got '{got}'")
            else:
                print(f"  spot Q{n}: key={out[n-1]['options'][out[n-1]['answer']]!r} OK")

    if problems:
        print("\nPROBLEMS:")
        for p in problems[:30]:
            print("  -", p)
        sys.exit(1)

    doc = {
        "grade": 12,
        "source": {
            "file": "جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf",
            "questionPages": "21-25",
            "keyGrid": "c13/sec1 (p.181) — شبکهٔ ۱۰۰تایی چاپی",
            "translations": "c13/sec0 پاسخنامهٔ سریع (۹۹/۱۰۰ — ترجمهٔ Q75 در خود جزوه نیست)",
        },
        "answerArbitration": overrides_used,
        "lessons": [{
            "lesson": 1,
            "title": "۱۰۰ تست واژگان درس اول — پایه دوازدهم",
            "level": "استاندارد و کنکوری",
            "count": len(out),
            "questions": out,
        }],
    }
    with open(OUT, "w") as f:
        json.dump(doc, f, ensure_ascii=False)
    import os
    print(f"\nOK → {OUT} ({os.path.getsize(OUT)//1024}KB, {len(out)} questions)")
    no_tr = [q["n"] for q in out if not q.get("translation")]
    print(f"questions without translation: {no_tr}")

if __name__ == "__main__":
    main()
