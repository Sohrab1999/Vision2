#!/usr/bin/env python3
# Round 265 — Emit the TS Q() lines for the 32 recovered lesson-1 tests and
# splice them into src/data/lesson1.ts (after the last existing vocab/konkur
# entry), matching the file's existing formatting conventions.
import json
import re

SRC = "/home/z/my-project/content-extracts/l1-missing-tests.json"
TS = "/home/z/my-project/src/data/lesson1.ts"

# Hand-written Persian translations for the 12 konkur questions (the جزوه's
# konkur key block is letters-only; the 20 standard tests use the جزوه's own
# answer-key translations verbatim).
KONKUR_FA = {
    "l1-k11": "در جشن تولد مادرم، برای چهار نفر در رستوران مورد علاقهٔ او میز رزرو کردم.",
    "l1-k12": "جاده خیلی شلوغ بود و در ترافیک سنگین، وقتِ ارزشمندی را از دست دادیم.",
    "l1-k13": "رایانه‌ها به بانک‌ها قدرت انجام میلیون‌ها انتقال در روز را داده‌اند.",
    "l1-k14": "به دلیل پیشرفت‌ها در دنیا، الگوهای زندگی خانوادگی به‌تازگی تغییر کرده‌اند.",
    "l1-k15": "واضح است که روانی و ارتباط، هنگام صحبت‌کردن مهم‌تر از گرامر هستند.",
    "l1-k16": "نمی‌توانستم با او به انگلیسی ارتباط برقرار کنم؛ بنابراین مجبور شدم از زبان بدن استفاده کنم.",
    "l1-k17": "برای داشتن جامعه‌ای خوب، باید نیازهای اعضای جوان‌تر جمعیت را نیز در نظر بگیریم.",
    "l1-k18": "با تمرین منظم، نوازندگی پیانوی او به‌طور چشمگیری بهبود یافته است.",
    "l1-k19": "امروزه بیشتر تصادفات جاده‌ای به دلیل بی‌احتیاطی رانندگان رخ می‌دهند.",
    "l1-k20": "رضا از درآمدش راضی نیست، بنابراین به‌دنبال شغل جدیدی در شهری بزرگ‌تر است.",
    "l1-k21": "او برای جمع‌آوری پول برای خیریه به همهٔ قاره‌ها، از اروپا تا آسیا، سفر کرد.",
    "l1-k22": "او هیچ شکی دربارهٔ توانایی تیمش برای رسیدن به فینال جام جهانی نداشت.",
}

def ts_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'

data = json.load(open(SRC))

def qline(q: dict, fa_override: str | None) -> str:
    opts = ", ".join(ts_str(o) for o in q["options"])
    parts = [
        ts_str(q["id"]),
        ts_str(q["category"]),
        ts_str(q["question"]),
        f"[{opts}]",
        str(q["answer"]),
    ]
    fa = fa_override if fa_override is not None else q["translation"]
    if fa:
        parts.append(ts_str(fa))
    return "  Q(" + ", ".join(parts) + "),\n"

vocab_block = "".join(qline(q, None) for q in data["newVocab"])
konkur_block = "".join(qline(q, KONKUR_FA.get(q["id"])) for q in data["newKonkur"])

src = open(TS).read()

# splice vocab after the l1-v20 line
m = re.search(r'^\s*Q\("l1-v20".*$', src, re.M)
assert m, "l1-v20 anchor not found"
src = src[:m.end()] + "\n" + vocab_block.rstrip("\n") + src[m.end():]

# splice konkur after the l1-k10 line
m = re.search(r'^\s*Q\("l1-k10".*$', src, re.M)
assert m, "l1-k10 anchor not found"
src = src[:m.end()] + "\n" + konkur_block.rstrip("\n") + src[m.end():]

open(TS, "w").write(src)
print("spliced: 20 vocab + 12 konkur into", TS)
