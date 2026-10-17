# r322 — اصلاحِ جراحیِ Q18ِ بانکِ «کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)» از grammar-g12-topic.json
# داوریِ سه‌رأیِ r269: رندرِ تازهٔ ۴۰۰۰dpi (/tmp/r322-q18-4000.png) + ساقهٔ انگلیسی
# ("...you will have to stand.") + لایهٔ OCR («مجبور خوایه بود») — هر سه «مجبور خواهی بود» را
# تأیید می‌کنند؛ خوانشِ r321 («مجبور نبود» + اراتومِ چاپیِ فرضی) رد می‌شود.
# چاپ عیناً: «صندلیهای زیادی وجود داشت بنابراین تو مجبور خواهی بود که بایستی.»
# اراتومِ چاپی وجود ندارد — چاپ با ساقهٔ انگلیسی هم‌رأی است.
# Idempotent: اجرای دوم NO-OP.
import hashlib
import json
import sys

PATH = "public/jozve/grammar-g12-topic.json"
Q18_OLD = "صندلیهای زیادی وجود داشت بنابراین تو مجبور نبود که بایستی."
Q18_NEW = "صندلیهای زیادی وجود داشت بنابراین تو مجبور خواهی بود که بایستی."
NOISE_OLD = "Q18 «مجبور خوایه بود» لایه → «مجبور نبود» چاپ؛ «بیاست» → «بایستی» (زوم ۱۶۰۰dpi خطِ کامل)"
NOISE_NEW = "Q18 «مجبور خوایه بود» لایه → «مجبور خواهی بود» چاپ؛ «بیاست» → «بایستی» (خوانشِ ۱۶۰۰dpiِ r321 اصلاح شد — زومِ ۴۰۰۰dpiِ r322)"
ERRATUM_OLD_PREFIX = "Q18 ترجمهٔ چاپ"

ARBITRATION = {
    "round": "r322",
    "issue": "خوانشِ Q18 در r321 («مجبور نبود» + اراتومِ چاپیِ فرضی) با رندرِ تازهٔ مستقل رد شد",
    "method": "three-vote r269: fresh 4000dpi render + English stem + OCR layer",
    "print": "تو مجبور خواهی بود که بایستی",
    "english": "There are no more chairs available, so you will have to stand.",
    "layer": "مجبور خوایه بود",
    "verdict": "no print erratum — print agrees with the English stem; translation corrected print-verbatim",
    "supersedes": "r321 printErrata[0]",
    "evidence": "/tmp/r322-q18-4000.png + /tmp/r321-i18-token.png + /tmp/r321-i18-khahi-L.png",
}


def md5(path: str) -> str:
    return hashlib.md5(open(path, "rb").read()).hexdigest()


def main() -> None:
    before = md5(PATH)
    with open(PATH, encoding="utf-8") as fh:
        doc = json.load(fh)

    les = next(
        l for l in doc["lessons"]
        if l.get("title", "").startswith("کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)")
    )
    w = les["source"]["translationsWashed"]

    if "q18Arbitration" in w:
        print("q18Arbitration present — NO-OP")
        return

    q18 = next(q for q in les["questions"] if q["n"] == 18)
    if q18.get("translation") == Q18_NEW:
        print("translation already corrected")
    else:
        assert q18.get("translation") == Q18_OLD, f"unexpected Q18 translation: {q18.get('translation')!r}"
        q18["translation"] = Q18_NEW
        print("Q18 translation fixed: نبود → خواهی بود")

    fixed_noise = 0
    for i, s in enumerate(w.get("layerNoiseFixes", [])):
        if s == NOISE_OLD:
            w["layerNoiseFixes"][i] = NOISE_NEW
            fixed_noise += 1
    print(f"layerNoiseFixes corrected: {fixed_noise}")

    errata = w.get("printErrata", [])
    kept = [s for s in errata if not s.startswith(ERRATUM_OLD_PREFIX)]
    removed = len(errata) - len(kept)
    w["printErrata"] = kept
    print(f"printErrata removed: {removed} (refuted)")

    w["q18Arbitration"] = ARBITRATION
    w["correctedRound"] = "r322"

    with open(PATH, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=1)
        fh.write("\n")

    after = md5(PATH)
    print("md5:", before, "->", after)
    print("changed: yes" if before != after else "changed: no")

    # سخت‌گیری: کلیدهای ۲۰گانه دست‌نخورده (صفر تغییر در options/answer)
    with open(PATH, encoding="utf-8") as fh:
        doc2 = json.load(fh)
    les2 = next(
        l for l in doc2["lessons"]
        if l.get("title", "").startswith("کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)")
    )
    keys = [q["options"][q["answer"]] for q in les2["questions"]]
    print("keys intact:", keys == ["but", "but", "for", "and", "nor", "nor", "or", "and", "and", "so",
                                   "nor", "or", "yet", "yet", "for", "for", "so", "so", "and", "but"])
    sys.exit(0 if keys else 1)


if __name__ == "__main__":
    main()
