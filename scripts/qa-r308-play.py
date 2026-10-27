#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r308 — درایورِ QA مرورگر: بازیِ کاملِ بانک‌های «جامع ۳۶۰» با کلیدِ چاپی خود جزوه.
سلکتورِ رسمی: [data-quiz-option="index"] — حرف → ایندکس (a=0..d=3).
پس از هر کلیک: «سؤال بعدی» / «پایان و …» برای پیشروی. خروجی: نتیجهٔ هر بانک."""
import json
import subprocess
import sys
import time

LETTER_INDEX = {"a": 0, "b": 1, "c": 2, "d": 3}

def sh(cmd: list[str], timeout: int = 30) -> str:
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    out = (r.stdout or "").strip()
    line = out.splitlines()[-1] if out else ""
    return line.strip('"')

def ev(js: str, timeout: int = 25) -> str:
    return sh(["agent-browser", "eval", js], timeout=timeout)

def click_option(idx: int) -> str:
    return ev(f'''(() => {{
  const b = document.querySelector('[data-quiz-option="{idx}"]');
  if (!b) return 'MISS';
  b.click();
  return 'OK';
}})()''')

def advance() -> str:
    return ev('''(() => {
  const nb = Array.from(document.querySelectorAll('button')).find(b => {
    const t = b.textContent.trim();
    return (t === 'سؤال بعدی' || t.startsWith('پایان') || t.includes('دیدن نتیجه')) && !b.disabled;
  });
  if (!nb) return 'NO-NEXT';
  nb.click();
  return 'NEXT';
})()''')

def state() -> str:
    return ev('''(() => {
  const t = document.body.innerText;
  const prog = t.match(/\\d+ \\/ \\d+/)?.[0] || '?';
  return prog + '|' + (t.includes('پاسخ درست') ? 'C' : t.includes('پاسخ اشتباه') ? 'W' : '-');
})()''')

def play_bank(letters: list[str], label: str) -> bool:
    n = len(letters)
    print(f"== {label}: {n} questions ==", flush=True)
    ok = 0
    for i, want in enumerate(letters):
        idx = LETTER_INDEX[want]
        got = click_option(idx)
        if got != "OK":
            time.sleep(0.7)
            got = click_option(idx)
            if got != "OK":
                print(f"  Q{i+1}: option click failed ({got[:40]})")
                return False
        time.sleep(0.5)
        st = state()
        adv = advance()
        time.sleep(0.4)
        flag = st.split("|")[1] if "|" in st else "-"
        if flag == "C":
            ok += 1
        elif flag == "W":
            print(f"  Q{i+1}: WRONG (printed key {want})")
        elif i == 0:
            print(f"  note: no feedback flag at Q1 (adv={adv})")
    print(f"  correct: {ok}/{n}", flush=True)
    return ok == n

BANKS = [
    ("l6 بانک ۱ (Q1-20, دو-ردیفیِ Q6)", "aacbbdaadaacabbcabab"),
    ("l10 بانک ۵ (Q81-100, عمودیِ Q100)", "cdcbcbcabbbddbdbcdbd"),
    ("l17 بانک ۱۲ (Q221-240+228x, اسلشِ Q240)", "acdccbacbcdddaaaababc"),
    ("l23 بانک ۱۸ (Q341-360, odd-word)", "dbcdccddcddcbbadbabc"),
]

def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    results = {}
    for label, seq in BANKS:
        if only and only not in label:
            continue
        results[label] = play_bank(list(seq), label)
        time.sleep(1.0)
    print(json.dumps(results, ensure_ascii=False))
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())
