# -*- coding: utf-8 -*-
# r346 — جراحیِ مکانیکیِ گاردهای قبلی: ۸۰→۸۱ بانک، ۱۰۲۲→۱۰۶۲ آیتم، وکتورِ شکلِ r326/r338 +۴۰
import re
from pathlib import Path

TESTS = Path("tests")

changed = []
for f in sorted(TESTS.glob("jozve-tests-g10-*.ts")):
    txt = f.read_text(encoding="utf-8")
    orig = txt

    # ۱) شمارش بانک/آیتم
    txt = txt.replace("80 banks", "81 banks")
    txt = txt.replace("1022 items", "1062 items")
    txt = txt.replace(".toBe(1022)", ".toBe(1062)")
    txt = txt.replace("= 1022", "= 1062")

    # ۲) توصیفِ جراحیِ خانواده
    txt = txt.replace(
        "family 1062 items (4 tashrihi4 appended — r345 surgery)",
        "family 1062 items (4 tashrihi4 + 1 vocab40l4 appended — r345/r346 surgery)",
    )

    # ۳) وکتورِ شکلِ r326/r338: انتهای آرایه «, 16, 8, 8, 25])» → «, 16, 8, 8, 25, 40])»
    txt = txt.replace("16, 8, 8, 25]);", "16, 8, 8, 25, 40]);")

    if txt != orig:
        f.write_text(txt, encoding="utf-8")
        changed.append(f.name)

for c in changed:
    print("patched:", c)
print(f"total: {len(changed)} files")
