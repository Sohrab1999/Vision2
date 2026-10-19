#!/usr/bin/env python3
# r399 — پست‌پردازِ پالایشِ جداولِ واژگانِ g10-12 — پس از `pair-g10-12-vocab-r398.py --apply`.
# ترتیبِ پایپ‌لاین اجباری است: موتور r398 ردیف‌ها را از کورپوس بازسازی می‌کند (و زباله‌های
# سرصفحه/تبلیغ دوباره داخل معنی می‌نشینند)؛ این اسکریپت بعدش روی JSON اجرا می‌شود:
#   ۱) برشِ دنبالهٔ زبالهٔ سرصفحه («ده ـــ م" لغ ــــ ات کلی...»، «" Words "»، تبلیغِ تلگرام
#      و «تست واژگان متوسطه اول») در نخستین نشانه؛ ردیفِ بی‌معنی حذف می‌شود (فقط «Note»).
#   ۲) حذفِ کشیدهٔ درون‌واژه‌ای (تاریــخ→تاریخ، هویــج→هویج).
#   ۳) قواعدِ سیستماتیکِ همزهٔ خراب: پسوندِ «أ»→«ا» (عمدتأ→عمدتا) و «أل»→«لا» (اصأل→اصلا،
#      کامأل→کامل) — واژه‌هایِ مشروعِ همزه‌دار (تأکید، متأسفانه، مأمور) آسیب نمی‌بینند.
#   ۴) جداسازیِ ردیف‌هایِ قورت‌داده‌شده (کوریجِ برچسب‌دارِ محدود — فقط هفت قطعهٔ اثبات‌شده
#      از کورپوس؛ lion و a. m. و A. D. و Here you are. ردیفِ مستقلِ خودشان را ندارند).
#   ۵) اعمالِ دوبارهٔ نقشهٔ توکن (r398+r399) — ایدمپوتنت.
# اجرایِ دوبارهٔ مستقلِ این اسکریپت بی‌اثر است (گاردها وضعیتِ فعلی را می‌سنجند)؛ اما اجرای
# مجددِ موتورِ r398 پولیش را جارو می‌کند — همیشه موتور → پولیش.
import json
import os
import re
import sys
import importlib.util

ROOT = "/home/z/my-project"
JOZ = os.path.join(ROOT, "public/jozve")

spec = importlib.util.spec_from_file_location(
    "r398engine", os.path.join(ROOT, "scripts", "pair-g10-12-vocab-r398.py"))
eng = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eng)
FIXES = eng.load_fixes()

TABLE_KEYS = [
    (10, "لغات کلیدی پایه هفتم"), (10, "لغات کلیدی پایه هشتم"), (10, "لغات کلیدی پایه نهم"),
    (10, "لغات کلیدی و تکمییل درس یکم"), (10, "لغات کلیدی و تکمییل درس دوم"),
    (10, "لغات کلیدی و تکمییل درس سوم"), (10, "لغات کلیدی و تکمییل درس چهارم"),
    (11, "لغات کلیدی و تکمییل درس اول"), (11, "لغات کلیدی و تکمییل درس دوم"),
    (11, "لغات کلیدی و تکمییل درس سوم"),
    (12, "لغات کلیدی و تکمییل درس اول"), (12, "لغات کلیدی و تکمییل درس دوم"),
    (12, "لغات کلیدی و تکمییل درس سوم"),
]

RE_JUNK_SIG = re.compile(
    r'(ده ـ|"Words|Words "|“ Words|Words ”|ؤاالت|تست ـ|متوسطه اول|کلی ـ|لغ ـ|دی پای ـ|ه"مـ|ه"نه|جام ع|درس دوم-|درس ده|دی و تکم|ده "|پنجره درس)')
RE_TATWEEL = re.compile("\u0640")
RE_FA = re.compile(r"[\u0600-\u06FF]")
RE_HAMZA_FINAL = re.compile(r"([\u0600-\u06FF]+)\u0623")
RE_HAMZA_LAM = re.compile(r"\u0623\u0644")

# قطعه‌هایِ قورت‌داده‌شده: (قطعهٔ چسبیده به معنیِ میزبان، ردیفِ تازه)
SWALLOWED = [
    # قطعه‌ها در شکلِ پس از نقشهٔ توکن (پایپ‌لاین: موتورِ r398 با فیکس‌ها بازسازی می‌کند، بعد پولیش)
    ("fall = autumn فصل پاییز", "fall = autumn — فصل پاییز"),
    ("A. D. بعد از میلاد مسیح، میلادی", "A. D. — بعد از میلاد مسیح، میلادی"),
    ("lion (حیوان ) شیر", "lion — شیر (حیوان)"),
    ("a. m. قبل از ظهر", "a. m. — قبل از ظهر"),
    ("Here you are. بفرمایید", "Here you are. — بفرمایید"),
    ("well done! آفرین", "well done! — آفرین"),
    ("many ( زیاد قبل از اسم جمع قابل شمارش )", "many — زیاد (قبل از اسم جمع قابل شمارش)"),
    ("half ( نصف، نیم جمع آن:", "half — نصف، نیم (جمع آن: halves)"),
    ("( the ) Caspian Sea دریای خزر", "the Caspian Sea — دریای خزر"),
    ("( sit on ) lap ( روی دامن )کیس نشسی", "sit on lap — ( روی دامن کسی ) نشستن"),
]

# قطعه‌هایِ تکراری — ردیفِ مستقلِ خودشان را دارند؛ فقط از معنیِ میزبان حذف می‌شوند
REMOVED = ["lawyer"]

# ترمیمِ کلِ ردیف (کورپوسِ چهارخطیِ «knife چاقو ( / :جمع آن / knives / )» که موتور r398
# «چاقو (:جمع آن» + یتیمِ «knives — )» ساخت — اطلاعاتِ جمع در ردیفِ ترمیم‌شده زنده می‌ماند)
HOST_REPAIRS = {
    "knife — چاقو (:جمع آن": "knife — چاقو (جمع آن: knives)",
    # «اخلاق، اخلاقیات، اصول اخلاق» — ویرگولِ چاپ به سرِ معنی پریده بود
    "ethics — ،اخلاق اخلاقیات، اصول اخلاق": "ethics — اخلاق، اخلاقیات، اصول اخلاق",
    # «راهنما، دفترچه راهنما - راهنما کردن» — همان الگویِ ویرگولِ سرِ معنی
    "guide — ، راهنما دفترچه راهنما - راهنما کردن": "guide — راهنما، دفترچه راهنما - راهنما کردن",
}


def norm_frag(s):
    return re.sub(r"\s+", " ", s).strip()


def clean_hamza(text):
    out = []
    for tok in text.split(" "):
        t = RE_HAMZA_FINAL.sub(r"\1" + "\u0627", tok)   # پسوندِ أ → ا (عمدتأ→عمدتا)
        t = RE_HAMZA_LAM.sub("\u0644\u0627", t)          # أل → لا (اصأل→اصلا)
        out.append(t)
    return " ".join(out)


def is_vocab_table(sec, key):
    t = sec.get("title") or ""
    return "یادداشت" not in t and key in t


def polish():
    stats = {"truncated": 0, "dropped": 0, "tatweel": 0, "hamza": 0, "splits": 0, "fixes": 0}
    docs = {g: json.load(open(os.path.join(JOZ, f"g{g}.json"), encoding="utf-8")) for g in (10, 11, 12)}
    for g, key in TABLE_KEYS:
        for ch in docs[g]["chapters"]:
            for sec in ch.get("sections", []):
                if not is_vocab_table(sec, key):
                    continue
                new_lines = []
                for line in sec.get("lines", []):
                    if " — " not in line:
                        new_lines.append(line)
                        continue
                    w, m = line.split(" — ", 1)
                    # ۰) ترمیمِ کلِ ردیف
                    whole = f"{w} — {m}"
                    if whole in HOST_REPAIRS:
                        new_lines.append(HOST_REPAIRS[whole])
                        stats["repairs"] = stats.get("repairs", 0) + 1
                        continue
                    # ۱) برشِ زباله
                    j = RE_JUNK_SIG.search(m)
                    if j:
                        m = m[:j.start()].rstrip(" -،؛:.«\"")
                        stats["truncated"] += 1
                    # ۲) کشیده
                    if RE_TATWEEL.search(m):
                        m = RE_TATWEEL.sub("", m)
                        stats["tatweel"] += 1
                    m = re.sub(r"\s+", " ", m).strip()
                    # ۳) جداسازی/حذفِ قطعه‌های قورت‌داده‌شده
                    split_newrow = None
                    for frag, newrow in SWALLOWED:
                        if norm_frag(frag) in m:
                            m = norm_frag(m.replace(norm_frag(frag), " "))
                            m = re.sub(r"\s+", " ", m).strip().rstrip(" -،؛")
                            split_newrow = newrow
                            stats["splits"] += 1
                            break
                    for frag in REMOVED:
                        if re.search(r"(^|[\s،؛(])" + re.escape(frag) + r"($|[\s،؛)])", m):
                            m = re.sub(r"(^|[\s،؛(])" + re.escape(frag) + r"($|[\s،؛)])", " ", m)
                            m = re.sub(r"\s+", " ", m).strip().rstrip(" -،؛")
                            stats["removed"] = stats.get("removed", 0) + 1
                    if not RE_FA.search(m):
                        if split_newrow is not None:
                            new_lines.append(split_newrow)
                        stats["dropped"] += 1
                        print(f"  [drop] {w} — {m[:60]!r} (پیش از برش: …{j.group() if j else ''}…)")
                        continue
                    # ۴) همزهٔ خراب
                    hm = clean_hamza(m)
                    if hm != m:
                        stats["hamza"] += 1
                        m = hm
                    # ۵) نقشهٔ توکن (ایدمپوتنت)
                    fm = eng.apply_fixes(m, FIXES)
                    if fm != m:
                        stats["fixes"] += 1
                        m = fm
                    new_lines.append(f"{w} — {m}")
                    if split_newrow is not None:
                        new_lines.append(split_newrow)
                sec["lines"] = new_lines
    for g in (10, 11, 12):
        json.dump(docs[g], open(os.path.join(JOZ, f"g{g}.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
    grades = []
    for gg in range(7, 13):
        doc = json.load(open(os.path.join(JOZ, f"g{gg}.json"), encoding="utf-8"))
        grades.append({
            "grade": gg, "title": doc["title"], "pages": doc["pages"],
            "sourceSha256": doc["sourceSha256"],
            "chapters": [
                {"id": c["id"], "title": c["title"], "kind": c["kind"],
                 "sections": [{"type": s["type"], "title": s["title"], "lines": len(s["lines"])}
                              for s in c["sections"]]}
                for c in doc["chapters"]
            ],
        })
    json.dump({"generatedAt": "2026-10-20T06:30:00.000Z", "grades": grades},
              open(os.path.join(JOZ, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
    return stats


def main():
    stats = polish()
    print("POLISHED:", stats)
    # گزارشِ رسید
    for g in (10, 11, 12):
        doc = json.load(open(os.path.join(JOZ, f"g{g}.json"), encoding="utf-8"))
        for ch in doc["chapters"]:
            for sec in ch.get("sections", []):
                t = sec.get("title") or ""
                if "یادداشت" in t or "لغات کلیدی" not in t:
                    continue
                for line in sec.get("lines", []):
                    if line.split(" — ")[0] in ("lion", "a. m.", "Here you are.", "well done!",
                                                "many", "fall = autumn", "A. D.", "access", "at last"):
                        print(f"  g{g}: {line[:86]}")
    if "--check" in sys.argv:
        leftovers = []
        for g in (10, 11, 12):
            doc = json.load(open(os.path.join(JOZ, f"g{g}.json"), encoding="utf-8"))
            blob = ""
            for ch in doc["chapters"]:
                for sec in ch.get("sections", []):
                    t = sec.get("title") or ""
                    if "یادداشت" in t or "لغات کلیدی" not in t:
                        continue
                    blob += "\n".join(sec.get("lines", []))
            for pat, label in ((RE_JUNK_SIG, "junk"), (RE_TATWEEL, "tatweel"),
                               (r'\u0623\u0644', "أل"), (r'[\u0600-\u06FF]+\u0623', "final-أ")):
                hits = re.findall(pat, blob)
                if hits:
                    leftovers.append((f"g{g}", label, len(hits)))
        print("LEFTOVERS:", leftovers or "none")


if __name__ == "__main__":
    main()
