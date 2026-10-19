#!/usr/bin/env python3
# r397 — «همهٔ کتاب‌ها مثل جزوهٔ یازدهم، مرتب»
# بازسازی کامل کتابخانهٔ جزوه برای پایه‌های ۷/۸/۹ از کورپوسِ r265:
#   * پوشش کامل فصل‌ها (گ7: ۸ درس، گ8: ۷ درس + ۲ ضمیمهٔ آزمون، گ9: ۶ درس + تست واژگان + ضمائم)
#   * جدول‌های واژگان جفت‌شده و مرتب (word — meaning) به‌جای خط‌های درهمِ RTL
#   * پالایش فارسی (نقشهٔ لا↔ال) + حذف نام نویسنده طبق دستور دیرین کاربر
#   * جفت‌سازی مجدد جداول واژگانِ g10/g11/g12 درجا + پاک‌سازی نام‌های باقی‌مانده در عنوان‌ها
#   * بازسازی index.json + شمارنده‌های صداقت (هیچ خط محتوایی دور ریخته نمی‌شود)
import json
import os
import re

ROOT = "/home/z/my-project"
CORPUS = os.path.join(ROOT, "content-extracts")
OUT = os.path.join(ROOT, "public/jozve")

BOOKS = {
    "grade7": {
        "grade": 7,
        "source": "جزوه هفتم.pdf",
        "sha": "40a8e1b59168",
        "header": "جزوه کامل زبان انگلیسی پایه هفتم",
        "title": "جزوه کامل زبان انگلیسی پایه هفتم",
        "chapters": [
            ("intro", "معرفی و مقدمه", 2, 40, None),
            ("lesson", "درس اول", 41, 50, 1),
            ("lesson", "درس دوم", 51, 56, 2),
            ("lesson", "درس سوم", 57, 65, 3),
            ("lesson", "درس چهارم", 66, 75, 4),
            ("lesson", "درس پنجم", 76, 84, 5),
            ("lesson", "درس ششم", 85, 90, 6),
            ("lesson", "درس هفتم", 91, 97, 7),
            ("lesson", "درس هشتم", 98, 103, 8),
        ],
    },
    "grade8": {
        "grade": 8,
        "source": "جزوه هشتم.pdf",
        "sha": "541ec2f147a2",
        "header": "جزوه کامل زبان انگلیسی پایه هشتم",
        "title": "جزوه کامل زبان انگلیسی پایه هشتم",
        "chapters": [
            ("intro", "معرفی و مقدمه", 2, 8, None),
            ("lesson", "درس اول", 9, 18, 1),
            ("lesson", "درس دوم", 19, 27, 2),
            ("lesson", "درس سوم", 28, 35, 3),
            ("lesson", "درس چهارم", 36, 41, 4),
            ("lesson", "درس پنجم", 42, 50, 5),
            ("lesson", "درس ششم", 51, 60, 6),
            ("lesson", "درس هفتم", 61, 72, 7),
            ("appendix", "نمونه سؤالات امتحانی ترم اول و دوم", 73, 91, None),
            ("appendix", "ضمائم", 92, 100, None),
        ],
    },
    "grade9": {
        "grade": 9,
        "source": "جزوه زبان نهم حسن لطفی بوکان.pdf",
        "sha": "568a71d1df41",
        "header": "جزوه کامل زبان انگلیسی",
        "title": "جزوه کامل زبان انگلیسی پایه نهم",
        "chapters": [
            ("intro", "معرفی و مقدمه", 2, 10, None),
            ("lesson", "درس اول", 11, 34, 1),
            ("lesson", "درس دوم", 35, 50, 2),
            ("lesson", "درس سوم", 51, 64, 3),
            ("lesson", "درس چهارم", 65, 76, 4),
            ("lesson", "درس پنجم", 77, 88, 5),
            ("lesson", "درس ششم", 89, 97, 6),
            ("appendix", "تست واژگان", 98, 101, None),
            ("appendix", "ضمائم", 102, 117, None),
        ],
    },
}

AUTHOR_PATTERNS = [
    re.compile(r"\s*استاد\s+حسن\s+خاکپور"),
    re.compile(r"\s*استاد\s+عل\r?ریضا\s+گرداب"),
    re.compile(r"\s*استاد\s+عل\r?رضا\s+گرداب"),
    re.compile(r"\s*دکت ر"),  # «دکتر» با حروف شکسته (فقط شکل شکسته؛ «دکتر» سالم دست نمی‌خورد)
    re.compile(r"\s*دکتر\s+حسن\s+لطفی"),
    re.compile(r"\s*حسن\s+لطفی"),
    re.compile(r"\s*جمال\s+احمدی\s+و\s*همکاران"),
    re.compile(r"\s*جمال\s+احمدی"),
]

WORD_FIXES = {
    "سواالت": "سؤالات", "سواال": "سؤالا", "سواالی": "سؤالی",
    "کالس": "کلاس", "همکالسی": "همکلاسی", "کالسها": "کلاس‌ها",
    "باال": "بالا", "باالی": "بالای", "باالیی": "بالایی", "باالتر": "بالاتر",
    "سالم": "سلام", "سالمتی": "سلامتی",
    "الزم": "لازم", "اطالع": "اطلاع", "اطالعات": "اطلاعات", "اطالعی": "اطلاعی", "اطالعاتی": "اطلاعاتی",
    "فالنی": "فلانی", "فالن": "فلان", "قبال": "قبلا", "االن": "الان", "امال": "املا",
    "تالش": "تلاش", "خالصه": "خلاصه", "معموال": "معمولا", "مالقات": "ملاقات",
    "پالک": "پلاک", "عالقه": "علاقه", "ایاالت": "ایالات", "اصال": "اصلا",
    "عالمت": "علامت", "کامال": "کاملا", "میالدی": "میلادی", "مـیـالدی": "میـلادی",
    "طوالنی": "طولانی", "جمالت": "جملات", "جمالتی": "جمله‌ای",
    "حتماال": "حتما", "مثاال": "مثالا", "متواالی": "متوالی",
    "حاال": "حالا", "مقالاله": "مقاله", "االیه": "آیه",
    "دنباله": "دنباله", "سالمن": "سلام", "االجهزه": "الهزه",
}
_FA_WORD = re.compile(r"([\u0600-\u06FF]+)")
_FA_PREFIX = {"می", "نمی", "به", "در", "با", "و", "از", "برای", "که", "هم", "را"}


def fa_fix(text: str) -> tuple[str, int]:
    n = 0

    def rep(m):
        nonlocal n
        w = m.group(0)
        w2 = WORD_FIXES.get(w)
        if w2 and w2 != w:
            n += 1
            return w2
        if len(w) > 3:
            for fw, ft in WORD_FIXES.items():
                if len(fw) >= 3 and w.endswith(fw) and w != fw:
                    head = w[: -len(fw)]
                    if head and _FA_WORD.fullmatch(head):
                        n += 1
                        if head in _FA_PREFIX:
                            return head + " " + ft
                        return head + ft
        return w

    return _FA_WORD.sub(rep, text), n


_EN = re.compile(r"[A-Za-z'’\-]")
_FA = re.compile(r"[\u0600-\u06FF]")


def script_tokens(line: str) -> list[tuple[str, str]]:
    toks = []
    cur_kind, cur = None, ""
    for ch in line:
        if _EN.match(ch):
            k = "en"
        elif _FA.match(ch):
            k = "fa"
        else:
            k = cur_kind
        if k != cur_kind and cur_kind is not None and cur.strip():
            toks.append((cur_kind, cur.strip()))
            cur = ""
        cur_kind = k
        cur += ch
    if cur_kind is not None and cur.strip():
        toks.append((cur_kind, cur.strip()))
    return [(k, t) for k, t in toks if t.strip(" .،؛:()[]…*|/\\«»")]


def pair_vocab(tokens: list[tuple[str, str]]) -> tuple[list[str], list[str]]:
    """جفت‌سازی مجاورتی: هر «معنی» بلافاصله پیش از «واژه»اش استخراج می‌شود (الگوی M2 W2 M1 W1).
    اصلاح (M,M,W) برای معنی‌های دوخطی. خروجی: (سطرهای مرتب، خط‌های یتیم)."""
    toks = list(tokens)
    i = 0
    while i < len(toks) - 2:
        if toks[i][0] == "fa" and toks[i + 1][0] == "fa" and toks[i + 2][0] == "en":
            nxt_fa = i + 3 < len(toks) and toks[i + 3][0] == "fa"
            nxt_en = i + 4 < len(toks) and toks[i + 4][0] == "en"
            if not (nxt_fa and nxt_en):
                toks[i] = ("fa", toks[i][1] + " " + toks[i + 1][1])
                del toks[i + 1]
        i += 1
    rows, orphans = [], []
    i = 0
    while i < len(toks):
        k, t = toks[i]
        if i + 1 < len(toks):
            k2, t2 = toks[i + 1]
            if (k, k2) == ("fa", "en"):
                rows.append(f"{t2} — {t}")
                i += 2
                continue
            if (k, k2) == ("en", "fa"):
                rows.append(f"{t} — {t2}")
                i += 2
                continue
        orphans.append(t)
        i += 1
    return rows, orphans


HEADER_NOISE = re.compile(r"^\d{1,3}$")
_TABLE_HDR = re.compile(r"^[\(\)\d\s]*(?:کلمه|معنی)\s*\d?\s*[\)\s]*$")
_SENT_END = (".", "؟", "!", ":", "؟")
_DIALOGUE_EN = re.compile(r"^(Teacher|Class|Student|Kimia|Sara|Ali|A|B|Man|Woman|Waiter|Boy|Girl|Mother|Father|Son|Daughter|Receptionist|Coach)\s*[:.]")


def is_vocab_ish(ln: str) -> bool:
    """خطِ شبیه ردیف جدول واژگان: کوتاه، بی‌نقطهٔ پایان، حداکثر ۲ توکن، بدون پیام رسانی."""
    if len(ln) >= 70 or ln.endswith(_SENT_END):
        return False
    if _DIALOGUE_EN.match(ln):
        return False
    if ln[0] in ":.،؛" or ln.startswith("معلم") or ln.startswith("کالس :") or ln.startswith("کلاس :"):
        return False
    toks = script_tokens(ln)
    return 1 <= len(toks) <= 2


_TABLE_STRIPPED = re.compile(r"[\(\)\d\s]+")


def is_table_hdr_fragment(s: str) -> bool:
    """قطعهٔ سربرگِ جدولِ دوستونی: فقط پرانتز/رقم/فاصله + تکرار «کلمه/معنی»."""
    if len(s) > 44:
        return False
    return bool(re.fullmatch(r"(?:کلمه|معنی)+", _TABLE_STRIPPED.sub("", s)))


def classify_marker(ln: str) -> tuple[str, str] | None:
    core = ln.lstrip(":.،؛ ").strip()
    if not core:
        return None
    if re.match(r"^(نمونه\s*)?(سوا*لت|سؤالات|سوالات)\s*امتحانی", core):
        return ("tests", re.sub(r"\s+", " ", core)[:80])
    if re.match(r"^تمرین\s*[:\dن]", core) and len(core) < 70 and not core.endswith(_SENT_END):
        return ("tests", re.sub(r"\s+", " ", core)[:80])
    if re.match(r"^(تست\s*(گرامری|واژگان)?|آزمون)\s*$", core):
        return ("tests", core[:80])
    if re.match(r"^آزمون\s+\S+", core) and len(core) < 60:
        return ("tests", re.sub(r"\s+", " ", core)[:80])
    if re.match(r"^Lesson\s+(One|Two|Three|Four|Five|Six|Seven|Eight)", core):
        return ("intro", core)
    if re.match(r"^(واژگان|کلمات جدید|مرور واژگان|لغات)", core) and len(core) < 80:
        return ("vocab", re.sub(r"\s+", " ", core)[:80])
    if re.search(r"مرور\s*کامل\s*واژگان", core) and len(core) < 60:
        return ("vocab", re.sub(r"\s+", " ", core)[:60])
    if _TABLE_HDR.match(core) or is_table_hdr_fragment(core):
        return ("vocab", "واژگان")
    if re.search(r"(اشیاء کالس|اشیاء کلاس|رنگها|رنگ‌ها|اعداد|روزهای هفته|حیوانات|اعضای بدن|میوه|لباس)", core) and len(core) < 50:
        return ("vocab", re.sub(r"\s+", " ", core)[:60])
    if (
        re.match(r"^(گرامر|دستور زبان|ضمایر|زمان|صداها و حروف|حروف الفبا|نوشتن حرف|نگارش)", core)
        or (core.startswith("نکته") and len(core) < 80)
    ):
        return ("grammar", re.sub(r"\s+", " ", core)[:80])
    if re.search(r"(مکالمه|ترجمه|Conversation|Dialog)", core) and len(core) < 80:
        return ("translation", re.sub(r"\s+", " ", core)[:80])
    if re.match(r"^(پاسخنامه|پاسخ\s*:|پاسخ تشریحی|Answer)", core):
        return ("answer", re.sub(r"\s+", " ", core)[:80])
    if re.match(r"^ضمائم", core) and len(core) < 30:
        return ("appendix", core)
    return None


def is_dialogue_ln(ln: str) -> bool:
    if _DIALOGUE_EN.match(ln):
        return True
    # برچسب گفتار فارسی فقط با دونقطهٔ واقعی: «کیمیا :»، «معلم :»
    return bool(re.match(r"^[\u0600-\u06FF]{2,12}\s*:\s", ln) and len(ln) < 90)


def has_letters(ln: str) -> bool:
    return bool(re.search(r"[A-Za-z\u0600-\u06FF]", ln))


def split_scripts_title(t: str) -> str:
    """فاصلهٔ مرزی fa/en در عنوان‌ها: «ترجمهConversation» ← «ترجمه Conversation»."""
    t = re.sub(r"([\u0600-\u06FF])([A-Za-z])", r"\1 \2", t)
    t = re.sub(r"([A-Za-z])([\u0600-\u06FF])", r"\1 \2", t)
    return re.sub(r"\s+", " ", t).strip(" :؛,،-")


class Sectioner:
    """سکشن‌ساز خط‌به‌خط یک فصل. ناحیه‌های واژگانی فقط با نشانه باز می‌شوند و تا اولین
    خطِ غیرجدولی ادامه می‌یابند. هیچ خط محتوایی دور ریخته نمی‌شود."""

    def __init__(self, stats: dict, chapter_kind: str = "lesson", chapter_title: str = ""):
        self.stats = stats
        self.chapter_kind = chapter_kind
        self.chapter_title = chapter_title
        self.sections: list[dict] = []
        self._cur: dict | None = None
        self._vz: list[tuple[str, str]] = []
        self._vz_title = "واژگان"
        self._vz_open = False

    def _marker_allowed(self, t: str, title: str = "") -> bool:
        """در فصل‌های intro نشانگرهای تست/واژگانِ تبلیغی مجاز نیستند (جدول‌های واقعی با
        نشانگرِ موضوعیِ اشیاء/رنگ/اعداد باز می‌شوند)؛ در appendix پیش‌فرض tests است."""
        if self.chapter_kind == "intro" and t in ("tests", "vocab"):
            # جدول‌های موضوعی واقعیِ مقدمه (اشیاء کلاس/رنگ‌ها/اعداد/...) استثنا هستند
            if t == "vocab" and re.search(r"(اشیاء|رنگها|رنگ‌ها|اعداد|روزهای هفته|حیوانات|اعضای بدن|میوه|لباس)", title):
                return True
            return False
        return True

    def _flush_vocab(self):
        if not self._vz:
            self._vz_open = False
            return
        rows, orphans = pair_vocab(self._vz)
        self.stats["vocabRows"] += len(rows)
        lines = rows + orphans
        if lines:
            self._add("vocab", self._vz_title, lines)
        self._vz = []
        self._vz_open = False

    def _add(self, type_: str, title: str, lines: list[str]):
        if self.sections:
            prev = self.sections[-1]
            if prev["type"] == type_ and prev["title"] == title:
                prev["lines"].extend(lines)
                self._cur = prev
                return
        self._cur = {"type": type_, "title": title, "lines": list(lines)}
        self.sections.append(self._cur)

    def _append(self, ln: str, want: str | None = None, default_title: str = ""):
        if want and (self._cur is None or self._cur["type"] != want):
            self._add(want, default_title, [ln])
            return
        if self._cur is None:
            self._add("notes", "متن", [ln])
            return
        self._cur["lines"].append(ln)

    def feed(self, lines: list[str]):
        for ln in lines:
            if self._vz_open:
                if is_table_hdr_fragment(ln.strip(":.,،؛ ")):
                    self.stats["droppedJunkLines"] += 1
                    continue
                if is_vocab_ish(ln):
                    toks = script_tokens(ln)
                    if toks:
                        self._vz.extend(toks)
                    continue
                # ناحیه تمام شد
                self._flush_vocab()
            if not has_letters(ln):
                self.stats["droppedJunkLines"] += 1
                continue
            mk = classify_marker(ln)
            if mk and self._marker_allowed(mk[0], mk[1]):
                self._flush_vocab()
                if mk[0] == "vocab":
                    self._vz_title = mk[1]
                    self._vz_open = True
                    continue
                self._open(*mk)
                continue
            if self._vz_open:
                self._flush_vocab()
            if is_dialogue_ln(ln):
                self._append(ln, want="translation", default_title="مکالمه")
                continue
            if self.chapter_kind == "appendix":
                self._append(ln, want="tests", default_title=self.chapter_title)
                continue
            self._append(ln)

    def _open(self, type_: str, title: str):
        self._cur = {"type": type_, "title": title, "lines": []}
        self.sections.append(self._cur)

    def close(self) -> list[dict]:
        self._flush_vocab()
        cleaned = []
        for s in self.sections:
            s["lines"] = [l for l in s["lines"] if has_letters(l)]
            if not s["lines"]:
                continue
            s["title"] = split_scripts_title(s["title"]) or s["title"]
            # یکسان‌سازی قطعه‌های الفبانویسی در یک سکشن
            if s["type"] == "grammar" and re.match(r"^نوشتن حرف", s["title"]):
                s["title"] = "نوشتن حروف الفبا"
            if cleaned and s["type"] == cleaned[-1]["type"] and s["title"] == cleaned[-1]["title"]:
                cleaned[-1]["lines"].extend(s["lines"])
                continue
            if len(s["lines"]) <= 1 and cleaned and s["type"] == cleaned[-1]["type"]:
                cleaned[-1]["lines"].extend(s["lines"])
                continue
            cleaned.append(s)
        return cleaned


def scrub_author(text: str) -> tuple[str, int]:
    n = 0
    for pat in AUTHOR_PATTERNS:
        t2 = pat.sub("", text)
        if t2 != text:
            n += 1
            text = t2
    return text.strip(" :؛,،-–"), n


def load_pages(slug: str) -> dict[int, str]:
    blob = json.load(open(os.path.join(CORPUS, f"{slug}.json")))
    return {p["n"]: p["text"] for p in blob["pages"]}


def build_grade(slug: str, spec: dict) -> tuple[dict, dict]:
    pages = load_pages(slug)
    stats = {
        "blankSeparators": 0, "droppedJunkLines": 0, "faFixes": 0,
        "vocabRows": 0, "authorScrubbed": 0, "keptLines": 0,
    }
    chapters = []
    for ch in spec["chapters"]:
        kind, title, p1, p2, lesson_no = ch
        sec = Sectioner(stats, chapter_kind=kind, chapter_title=title)
        for n in range(p1, p2 + 1):
            text = pages.get(n, "")
            for raw in text.split("\n"):
                ln = raw.strip()
                if not ln:
                    stats["blankSeparators"] += 1
                    continue
                if ln == spec["header"] or ln.startswith(spec["header"]) or HEADER_NOISE.fullmatch(ln):
                    # سرصفحهٔ تکراری (+ احتمال چسبیدگی نام نویسنده به آن)
                    if re.search(r"[\u0600-\u06FF]{3}", ln[len(spec["header"]):] if ln.startswith(spec["header"]) else ""):
                        stats["authorScrubbed"] += 1
                    else:
                        stats["droppedJunkLines"] += 1
                    continue
                ln2, nfix = fa_fix(ln)
                stats["faFixes"] += nfix
                t2, na = scrub_author(ln2)
                if na:
                    stats["authorScrubbed"] += na
                if t2:
                    sec.feed([t2])
        sections = sec.close()
        chapters.append({
            "id": f"c{len(chapters) + 1}",
            "title": title,
            "kind": kind,
            "zone": "main",
            "zoneLabel": "",
            "lessonNo": lesson_no,
            "sections": sections,
        })
    stats["keptLines"] = sum(len(s["lines"]) for c in chapters for s in c["sections"])
    doc = {
        "grade": spec["grade"],
        "title": spec["title"],
        "source": spec["source"],
        "pages": max(pages),
        "sourceSha256": spec["sha"],
        "authorExcluded": True,
        "extraction": {
            "keptLines": stats["keptLines"],
            "droppedAuthorLines": stats["authorScrubbed"],
            "droppedJunkLines": stats["droppedJunkLines"],
            "blankSeparators": stats["blankSeparators"],
            "faFixes": stats["faFixes"],
            "vocabRows": stats["vocabRows"],
            "totalLines": stats["keptLines"] + stats["droppedJunkLines"] + stats["blankSeparators"] + stats["authorScrubbed"],
        },
        "chapters": chapters,
    }
    return doc, stats


def fix_vocab_sections(doc: dict) -> int:
    fixed = 0
    for c in doc["chapters"]:
        for s in c["sections"]:
            if s["type"] != "vocab" or len(s["lines"]) < 4:
                continue
            toks = []
            for ln in s["lines"]:
                toks.extend(script_tokens(ln))
            rows, orphans = pair_vocab(toks)
            n_en = sum(1 for k, _ in toks if k == "en")
            if len(rows) >= 4 and len(rows) >= 0.5 * max(1, n_en):
                s["lines"] = rows + orphans
                fixed += 1
    return fixed


def scrub_doc(doc: dict) -> int:
    n = 0
    for c in doc["chapters"]:
        for s in c["sections"]:
            t2, k = scrub_author(s["title"])
            if k:
                n += k
                s["title"] = t2 or s["title"]
            lines = []
            for ln in s["lines"]:
                l2, k2 = scrub_author(ln)
                n += k2
                lines.append(l2)
            s["lines"] = lines
    return n


def main():
    report = {}
    for slug in ("grade7", "grade8", "grade9"):
        doc, stats = build_grade(slug, BOOKS[slug])
        json.dump(doc, open(os.path.join(OUT, f"g{doc['grade']}.json"), "w", encoding="utf-8"), ensure_ascii=False)
        nsec = sum(len(c["sections"]) for c in doc["chapters"])
        report[slug] = stats
        print(f"[{slug}] chapters={len(doc['chapters'])} sections={nsec} kept={stats['keptLines']} "
              f"vocabRows={stats['vocabRows']} junk={stats['droppedJunkLines']} "
              f"author={stats['authorScrubbed']} faFixes={stats['faFixes']}")
    for g in (10, 11, 12):
        path = os.path.join(OUT, f"g{g}.json")
        doc = json.load(open(path, encoding="utf-8"))
        # NOTE r397: جفت‌سازیِ درجایِ واژگانِ g10-g12 از خط‌های ازپیش‌ادغام‌شده به نتیجهٔ
        # دوجفت‌نادرست می‌رسد (الگوی W1 M1 W2 M2 با معنیِ شکسته) — پس فقط پاک‌سازی نام؛
        # جفت‌سازیِ کورپوس‌محور برای این سه پایه در راند بعد (با زون‌های صفحات خام).
        a = scrub_doc(doc)
        json.dump(doc, open(path, "w", encoding="utf-8"), ensure_ascii=False)
        report[f"g{g}"] = {"authorScrubbed": a}
        print(f"[g{g}] authorScrubbed={a}")
    grades = []
    for g in range(7, 13):
        doc = json.load(open(os.path.join(OUT, f"g{g}.json"), encoding="utf-8"))
        grades.append({
            "grade": g,
            "title": doc["title"],
            "pages": doc["pages"],
            "sourceSha256": doc["sourceSha256"],
            "chapters": [
                {
                    "id": c["id"],
                    "title": c["title"],
                    "kind": c["kind"],
                    "sections": [{"type": s["type"], "title": s["title"], "lines": len(s["lines"])} for s in c["sections"]],
                }
                for c in doc["chapters"]
            ],
        })
    idx = {"generatedAt": "2026-10-20T03:00:00.000Z", "grades": grades}
    json.dump(idx, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("index.json rebuilt:", len(grades), "grades")
    return report


if __name__ == "__main__":
    main()
