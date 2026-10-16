#!/usr/bin/env python3
"""extract-g10-konkur-r279.py — بانک‌های کنکوری دهم با کلید گرید چاپی (r279)

ادامهٔ مأموریت «استخراج جزوه‌ها» — مسیرِ ثبت‌شدهٔ handoff r278 و معلق از r273:
  - «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ — پایه دهم» (PDF ص۱۷۲-۱۷۶)
  - «۳۶۰ تست واژگان درس ۱ تا ۴ — پایه دهم» (PDF ص۱۷۸-۱۹۴)
کلید: گرید چاپی «پاسخنامه تستهای گرامر درس یک تا چهار» + «پاسخنامه کلیدی ۳۶۰تست واژگان»
در g10.json → c20/sec54 (ترتیب ستونی/ردیفی هر دو با جفت‌یاب (عدد،حرف) خوانده می‌شود).

درس‌های پارسرِ راندهای قبل که اینجا اعمال شد:
  - r278: گرید ستونی («1 b 6 d…») با همان جفت‌یاب ردیفی خوانده می‌شود + خالی‌های
    چندتکه بعد از ادغام فاصلهٔ بعدشان ترمیم می‌شود («----to» چسبیده نمی‌ماند).
  - r277: ماشین حالتِ expect-stem → expect-options با پنجرهٔ ادامه‌دار.
  - r273: تطبیق شماره‌ای (نه ترتیبی) برای join؛ و گارد بازده.

خروجی:
  booklet-extract/g10-konkur-r279.json        (بانک + رسید کامل)
  booklet-extract/g10-konkur-r279.snippet.ts  (قطعهٔ TS برای ادغام دستی در exam-g10.ts)
"""
import json
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g10.txt"
G10 = f"{ROOT}/public/jozve/g10.json"
EXISTING = f"{ROOT}/booklet-extract/g10-bank-final-r273.json"
CURATED = f"{ROOT}/booklet-extract/mcq-r213-curated.json"
OUT_JSON = f"{ROOT}/booklet-extract/g10-konkur-r279.json"
OUT_TS = f"{ROOT}/booklet-extract/g10-konkur-r279.snippet.ts"

LETTER = {"a": 0, "b": 1, "c": 2, "d": 3}

PAIR = re.compile(r"(?<![\da-z])(\d{1,3})\s+([a-d])(?![a-z])")
STEM_RE = re.compile(r"^\s*(\d{1,3})\s*\.\s+(\S.*)$")
OPT_PAREN = re.compile(r"\b([a-d])[)(]\s*")  # «a(» هم دیده شده (چاپِ ص۱۷۶ Q93)
OPT_DOT = re.compile(r"\b([a-d])\.\s+")

# خطاهای چاپی خودِ جزوه که با وفاداری به چاپ می‌مانند (الگوی رسیدِ x-296/x-353 در r269):
# («vocab-360», 174): گزینهٔ چهارم در PDF به‌اشتباه «b) suitably» چاپ شده (حرفِ غلط + متنِ
# تکراریِ گزینهٔ اول). کلید گرید c=honestly معنایی و سالم است — گزینه‌ها عیناً چاپ می‌مانند.
ERRATA_DUP = {("vocab-360", 174)}

# بازچینیِ پاسخ برای خطاهای معناییِ خودِ گریدِ چاپی (الگوی دقیق r269 برای x-296/x-353):
# («vocab-360», 236): گرید «a» (rapidly) می‌گوید؛ ولی ساقه «The opposite of "quickly"» است —
# rapidly مترادف است نه متضاد؛ پاسخِ معناییِ ممکن «c» (slowly) است. اپ پاسخِ درست را نگه
# می‌دارد و خطای گریدِ خود جزوه در meta.answerRepairs ثبت می‌شود. (تأیید دوم: بانک r213)
ANSWER_OVERRIDES = {
    ("vocab-360", 236): {
        "from": 0,
        "to": 2,
        "reason": "گرید چاپی «a/rapidly» معنایی ناممکن دارد (متضادِ quickly نه مترادف)؛ c/slowly درست است — بانک r213 هم موافق.",
    },
}
# بازچینیِ تایپوگرافیِ کوتیشنِ خرابِ لایهٔ متن (فقط نویسه‌ها — صفر تغییر واژه):
QUOTE_REPAIRS = {
    ("grammar-100", 32): "A: “Are you going to play tennis next Friday?” B: “I can’t. I -------------------- my mother in hospital.”",
    ("vocab-360", 78): "A: “Can you finish painting all the rooms today?” B: “Sorry. -------------------- not.”",
}
BLANK_CLUSTER = re.compile(r"(?:-{2,}[ ]*){2,}")
DASH_RUN = re.compile(r"-{2,}")
FA = re.compile(r"[\u0600-\u06FF]")

# ---------- ۱) متن صفحه‌بندی‌شده ----------
raw = open(TXT, encoding="utf-8").read()
pages: dict[int, str] = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

# ---------- ۲) گریدها از c20/sec54 ----------
g10 = json.load(open(G10))
sec = next(c for c in g10["chapters"] if c["id"] == "c20")["sections"][54]


def parse_grid(lines: list[str], lo: int, hi: int, label: str) -> dict[int, int]:
    uniq: dict[int, str] = {}
    for ln in lines:
        for n, l in PAIR.findall(ln):
            n = int(n)
            if n in uniq and uniq[n] != l:
                raise SystemExit(f"[{label}] conflicting grid pair {n}: {uniq[n]} vs {l}")
            uniq.setdefault(n, l)
    missing = [n for n in range(lo, hi + 1) if n not in uniq]
    if missing:
        raise SystemExit(f"[{label}] grid incomplete: missing {missing[:20]} (have {len(uniq)})")
    print(f"[grid:{label}] {len(uniq)} pairs, coverage {lo}..{hi} کامل ✓")
    return {n: LETTER[l] for n, l in uniq.items()}


# سطرهای گرید: بین لنگرها. گام: تقسیم سکشن با دو لنگر چاپی
lines = sec["lines"]
i_gram = next(i for i, l in enumerate(lines) if "پاسخنامه تستهای گرامر" in l)
# لنگر واژگان: «3۶0» با ارقام مخلوط ASCII/فارسی چاپ شده (ایراد OCR خودِ جزوه)
i_vocab = next(
    i
    for i, l in enumerate(lines)
    if "تست واژگان" in l and re.search(r"3[۶3]0|۳۶۰|360", l)
)
gram_grid = parse_grid(lines[i_gram + 1 : i_vocab], 1, 100, "grammar-100")
vocab_grid = parse_grid(lines[i_vocab + 1 :], 1, 360, "vocab-360")

# ---------- ۳) پارس سؤال‌ها ----------
def is_noise(line: str) -> bool:
    t = line.strip()
    if not t:
        return True
    if FA.search(t):
        return True
    if re.fullmatch(r"\d{1,4}", t):
        return True
    if "Vision One" in t or "Vision Two" in t or "Vision Three" in t:
        return True
    if DASH_RUN.fullmatch(t.replace(" ", "")):
        return True
    return False


def clean_text(s: str) -> str:
    s = s.replace("\u00ad", "")
    s = BLANK_CLUSTER.sub(" " + "-" * 20 + " ", s)
    s = DASH_RUN.sub("-" * 20, s)
    s = re.sub(r"[ \t]+", " ", s).strip()
    s = re.sub(r" ([,.;:!?])", r"\1", s)
    s = re.sub(r"\s+([)]|\])", r"\1", s)
    return s


def parse_bank(page_range: range, grid: dict[int, int], expected: int, label: str) -> list[dict]:
    # بافرِ خط‌های سالم به ترتیب صفحه — rstrip نمی‌کنیم تا فاصلهٔ انتهایی (سیگنالِ
    # شکست درون‌واژه‌ای) حفظ شود؛ is_noise خودش strip می‌کند
    stream: list[str] = []
    for p in page_range:
        for ln in pages.get(p, "").splitlines():
            if not is_noise(ln):
                stream.append(ln)

    questions: list[dict] = []
    pending_stem: tuple[int, str] | None = None  # (num, text)
    pending_opts: list[str] = []
    collecting_opts = False

    def flush(num: int, stem: str, opt_lines: list[str]):
        buf = " ".join(x.strip() for x in opt_lines if x.strip())
        style_paren = bool(OPT_PAREN.search(buf))
        style_dot = bool(OPT_DOT.search(buf))
        rx = OPT_PAREN if style_paren and (not style_dot or buf.find(")") < buf.find(".")) else OPT_DOT
        marks = list(rx.finditer(buf))
        if len(marks) < 4:
            raise SystemExit(f"[{label}] Q{num}: فقط {len(marks)} نشانگر گزینه در «{buf[:90]}»")
        opts = []
        for j, mstart in enumerate(marks[:4]):
            seg = buf[mstart.end() : marks[j + 1].start() if j + 1 < len(marks) else len(buf)]
            opts.append(clean_text(seg.strip(" ;,.")))
        if len(set(opts)) != 4 and (label, num) not in ERRATA_DUP:
            raise SystemExit(f"[{label}] Q{num}: گزینه‌های تکراری {opts}")
        if num not in grid:
            raise SystemExit(f"[{label}] Q{num}: در گرید نیست")
        ans = grid[num]
        ov = ANSWER_OVERRIDES.get((label, num))
        if ov:
            ans = ov["to"]
        stem_final = clean_text(stem)
        if '"' in stem_final and (label, num) not in QUOTE_REPAIRS:
            raise SystemExit(f"[{label}] Q{num}: کوتیشنِ ASCII در ساقه بدونِ بازچینیِ ثبت‌شده: {stem_final[:70]}")
        if (label, num) in QUOTE_REPAIRS:
            stem_final = QUOTE_REPAIRS[(label, num)]
        questions.append(
            {
                "num": num,
                "category": "grammar" if label.startswith("grammar") else "vocab",
                "stem": stem_final,
                "options": opts,
                "answerIdx": ans,
                "gridAnswer": grid[num],
                "page": sorted(page_range)[0] + (num - 1) // (100 if label.startswith("grammar") else 21),
                "bank": label,
            }
        )

    for ln in stream:
        ms = STEM_RE.match(ln)
        if ms:
            if pending_stem is not None:
                # ساقهٔ بدون گزینه؟ خطر — باید قبلاً flush شده باشد
                raise SystemExit(f"[{label}] ساقهٔ بی‌گزینه: Q{pending_stem[0]} «{pending_stem[1][:60]}»")
            pending_stem = (int(ms.group(1)), ms.group(2))
            pending_opts, collecting_opts = [], False
            continue
        if pending_stem is None:
            continue
        first = ln.strip()
        if not collecting_opts:
            # خط اولِ گزینه‌ها: الگوی «a)» یا «a.» — با تحملِ گلولهٔ پراگانهٔ چاپی قبل از نشانگر
            # (نمونهٔ واقعی ص۱۷۲: «a       a) on» — حرفِ تنها قبل از نشانگرِ واقعی)
            if re.match(r"^\s*[a-d]\s*a[).(]\s*", ln) or re.match(r"^a[).(]\s*", first):
                collecting_opts = True
                pending_opts.append(re.sub(r"^\s*[a-d]\s+(?=a[).(])", "", ln).strip())
                buf = " ".join(pending_opts)
                if sum(1 for _ in re.finditer(r"\b[a-d][).(]", buf)) >= 4:
                    flush(pending_stem[0], pending_stem[1], pending_opts)
                    pending_stem, pending_opts, collecting_opts = None, [], False
            else:
                # ادامهٔ ساقه (wrap) — قواعد قطعی:
                #   ۱) اگر قطعهٔ قبلی با فاصله تمام شده (سیگنالِ لایهٔ متن) → مرز واژه: با فاصله بچسبان
                #   ۲) اگر با حرف تمام شده و ادامه با حرف کوچک است → شکست درون‌واژه‌ای محتمل؛
                #      تکهٔ پایانیِ ≤۲ حرف = بریدگی PDF → بدون فاصله؛ در غیر این صورت با فاصله + رسید
                prev = pending_stem[1]
                if prev.endswith(" "):
                    pending_stem = (pending_stem[0], prev.rstrip() + " " + first)
                elif prev[-1:].isalpha() and first[:1].islower() and len(prev.split(" ")[-1]) <= 2:
                    pending_stem = (pending_stem[0], prev + first)
                else:
                    pending_stem = (pending_stem[0], prev.rstrip() + " " + first)
        else:
            pending_opts.append(first)
            buf = " ".join(pending_opts)
            if sum(1 for _ in re.finditer(r"\b[a-d][).(]", buf)) >= 4:
                flush(pending_stem[0], pending_stem[1], pending_opts)
                pending_stem, pending_opts, collecting_opts = None, [], False

    if pending_stem is not None:
        raise SystemExit(f"[{label}] ساقهٔ رهاشده در پایان: Q{pending_stem[0]}")

    nums = [q["num"] for q in questions]
    if nums != sorted(nums):
        raise SystemExit(f"[{label}] شماره‌ها نامرتب: {nums[:20]}")
    if nums != list(range(1, expected + 1)):
        missing = sorted(set(range(1, expected + 1)) - set(nums))
        dup = sorted({n for n in nums if nums.count(n) > 1})
        raise SystemExit(f"[{label}] پوشش ناقص: {len(nums)}/{expected} missing={missing[:12]} dup={dup[:8]}")
    print(f"[bank:{label}] {len(questions)}/{expected} سؤال با گزینه و کلید ✓")
    return questions


GRAM_PAGES = range(172, 177)  # 172..176
VOCAB_PAGES = range(178, 195)  # 178..194

gram = parse_bank(GRAM_PAGES, gram_grid, 100, "grammar-100")
vocab = parse_bank(VOCAB_PAGES, vocab_grid, 360, "vocab-360")
bank = gram + vocab

# ---------- ۴) حذف تکرار سراسریِ ساقه (گارد Jaccard-سبک lesson-meta) ----------
def norm_stem(s: str) -> str:
    return re.sub(r"\s+", " ", DASH_RUN.sub(" ", s)).strip().lower()


existing = json.load(open(EXISTING))["bank"]
existing_stems = {norm_stem(q["stem"]) for q in existing}
kept, dropped = [], []
for q in bank:
    ns = norm_stem(q["stem"])
    if ns in existing_stems or ns in {norm_stem(k["stem"]) for k in kept}:
        dropped.append({"num": q["num"], "bank": q["bank"], "stem": q["stem"][:90]})
    else:
        kept.append(q)

# ---------- ۵) بازبینی دوم با بانک r213 (تفاهم‌سنجی) ----------
agree = disagree = 0
disagree_rows = []
try:
    curated = json.load(open(CURATED))
    citems = curated if isinstance(curated, list) else curated.get("questions", curated.get("bank", []))
    cmap = {}
    for c in citems:
        st = c.get("stem") or c.get("question") or c.get("q") or ""
        if st:
            cmap[norm_stem(st)] = c
    for q in kept:
        c = cmap.get(norm_stem(q["stem"]))
        if not c:
            continue
        ca = c.get("answerIdx", c.get("answer"))
        if isinstance(ca, int):
            if ca == q["answerIdx"]:
                agree += 1
            else:
                disagree += 1
                disagree_rows.append({"num": q["num"], "bank": q["bank"], "grid": q["answerIdx"], "curated": ca})
except FileNotFoundError:
    pass

# ---------- ۶) شماره‌گذاری پیوستهٔ جدید (g10-405..) ----------
for i, q in enumerate(kept):
    q["id"] = f"g10-{405 + i}"

meta = {
    "grade": 10,
    "generator": "extract-g10-konkur-r279.py",
    "provenance": "konkur sections of g10 jozve (PDF p172-176 grammar, p178-194 vocab) + printed grid keys at g10.json c20/sec54",
    "stats": {
        "grammar": len(gram),
        "vocab": len(vocab),
        "parsed": len(bank),
        "kept": len(kept),
        "dropped_dup_stems": len(dropped),
        "r213_agree": agree,
        "r213_disagree": disagree,
    },
    "dropped": dropped,
    "r213_disagreements": disagree_rows,
    "quoteRepairs": [
        {"ref": f"{b}/Q{n}", "note": "فقط تایپوگرافیِ کوتیشن — صفر تغییر واژه"} for (b, n) in QUOTE_REPAIRS
    ],
    "answerRepairs": [
        {"ref": f"{b}/Q{n}", **ov} for (b, n), ov in ANSWER_OVERRIDES.items()
    ],
    "grids": {
        "grammar": "c20/sec54 lines after «پاسخنامه تستهای گرامر درس یک تا چهار» (۱۰۰ جفت)",
        "vocab": "c20/sec54 lines after «پاسخنامه کلیدی 360تست واژگان درس 1 تا 4» (۳۶۰ جفت، ستونی/شکسته — با جفت‌یاب ردیفی خوانده شد)",
    },
    "translations": "printed grid has no translations — q.translation intentionally absent (honest omission, الگوی r276/r278)",
    "errata": [
        {
            "ref": "vocab-360/Q174",
            "note": "گزینهٔ چهارم در خودِ جزوه به‌اشتباه «b) suitably» چاپ شده (حرفِ غلط + متنِ تکراری گزینهٔ اول). وفادار به چاپ ماندیم؛ کلید گرید c=honestly معنایی و سالم است.",
        }
    ],
}
json.dump({"meta": meta, "bank": kept}, open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ---------- ۷) قطعهٔ TS ----------
ts_lines = [
    "",
    "  // ───── r279: بانک‌های کنکوری دهم با کلید گرید چاپی (۱۰۰ گرامر ص۱۷۲-۱۷۶ + ۳۶۰ واژگان ص۱۷۸-۱۹۴) ─────",
    "  // کلیدها: گرید چاپی «پاسخنامه تستهای گرامر درس یک تا چهار» و «پاسخنامه کلیدی 360تست واژگان»",
    "  // در c20/sec54 جزوهٔ دهم — پارسر: scripts/extract-g10-konkur-r279.py — رسید: booklet-extract/g10-konkur-r279.json",
    "  // ترجمه در گرید چاپی نیامده — بدون ترجمه (صادقانه، الگوی r276/r278).",
]
for q in kept:
    stem = q["stem"].replace("\\", "\\\\").replace('"', '\\"')
    opts = ", ".join('"' + o.replace("\\", "\\\\").replace('"', '\\"') + '"' for o in q["options"])
    ts_lines.append(f'  Q("{q["id"]}", "{q["category"]}", "{stem}", [{opts}], {q["answerIdx"]}),')

open(OUT_TS, "w", encoding="utf-8").write("\n".join(ts_lines) + "\n")

print(json.dumps(meta["stats"], ensure_ascii=False))
print(f"OUT: {OUT_JSON}")
print(f"OUT: {OUT_TS} ({len(kept)} Q-lines)")
