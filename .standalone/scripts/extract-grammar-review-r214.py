#!/usr/bin/env python3
# r214 — extract the «مرور گرامرهای پایه هفتم تا نهم» درسنامه span of the
# grade-10 jame booklet (g10 PDF pages 22-36) into a cleaned review file.
# Structural cleaning only: page markers, watermark block (title / Vision /
# author / همکاران), Telegram, dash runs, lone digits; NO language repair
# here — the repair lands in the curation step after hand review.
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")
lines = (BASE / "g10.txt").read_text().split("\n")


def find_marker(n: int) -> int:
    want = f"<<<PAGE {n}>>>"
    for i, l in enumerate(lines):
        if l.strip() == want:
            return i
    raise SystemExit(f"marker {n} not found")


start = find_marker(22)
end = find_marker(37)  # exclusive: p37 is «تستهای گرامری متوسطه اول»

def de_tat(s: str) -> str:
    return s.replace("\u0640", "")

out = []
for i in range(start, end):
    raw = lines[i]
    t = raw.strip()
    if not t:
        out.append("")
        continue
    if t.startswith("<<<PAGE"):
        out.append(f"\n== {t} ==")
        continue
    d = de_tat(t)
    if re.fullmatch(r"\d+", d):
        continue  # page number echo
    if "Vision" in d:
        continue
    if "جزوه جام" in d:
        continue
    if "تألیف" in d or "همکاران" in d or "گردآوری" in d:
        continue
    if "Telegram" in d or "PracticalEnglish" in d:
        continue
    if re.fullmatch(r"[ـ\-=\s\"»«\(\)]+", d):
        continue  # dash/decoration runs
    if d in {"ده", "م\"", "\"م", "ـــ م\"", "م ـــ"}:
        continue  # title fragments the page-break scatters
    out.append(t)

text = "\n".join(out)
# squeeze 3+ blank lines
text = re.sub(r"\n{3,}", "\n\n", text)
dest = BASE / "grammar-review-g10-raw.txt"
dest.write_text(text)
print(f"lines={len(out)} chars={len(text)} -> {dest}")
