# -*- coding: utf-8 -*-
# r349d — سنزِ تیره‌های جای‌خالیِ ساقه‌های «تست گرامر و نگارش درس چهارم» استاندارد (ص۱۶۷-۱۶۹)
import fitz, re

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")
txt = "".join(doc[pno].get_text("text") for pno in (166, 167, 168))

# هر ساقه با «N-» شروع می‌شود
runs = []
for m in re.finditer(r"(-{2,})", txt):
    runs.append(m.group(1))
print("total dash runs:", len(runs))
print("census:", [(len(r)) for r in runs])

# ساقه‌ها را هم ردیف کن: شماره‌ها 1-57
qs = re.split(r"\n(\d{1,2})\s*-", "\n" + txt)
print()
# برای Q2 خاص: «---------- ----» دو ران با فاصله
i2 = txt.find("2- A:")
print("Q2 raw:", repr(txt[i2:i2+180]))
i15 = txt.find("15- ")
print("Q15 raw:", repr(txt[i15:i15+200]))
i26 = txt.find("26- ")
print("Q26 raw:", repr(txt[i26:i26+180]))
i46 = txt.find("46- ")
print("Q46 raw:", repr(txt[i46:i46+140]))
