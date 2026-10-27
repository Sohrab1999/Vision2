# -*- coding: utf-8 -*-
# r360-d — اعتبارسنجیِ کلیدها: تشریحیِ ص۱۹۸-۱۹۹ (۳۰ مدخل) + گریدِ مختصاتیِ ص۲۰۰ (۷۰ مدخل)
import fitz, re

lines = open('/home/z/my-project/booklet-extract/g11.txt', encoding='utf-8').read().split('\n')

def page_slice(p):
    start = next(i for i, l in enumerate(lines) if f'<<<PAGE {p}>>>' in l)
    end = next(i for i in range(start + 1, len(lines)) if '<<<PAGE' in lines[i])
    return lines[start:end]

# ---- بخش اول key (pp198-199) from text layer ----
key_flat = re.sub(r'\s+', ' ', '\n'.join(page_slice(198) + page_slice(199)))
entries = re.findall(r'(\d{1,2})\s*-\s*گزینه\s*\(\s*([abcd])\s*\)', key_flat)
nums = [int(n) for n, _ in entries]
letters = [l for _, l in entries]
print('explanatory key entries:', len(entries))
print('nums 1..30 complete:', nums == list(range(1, 31)), '| dup:', len(nums) != len(set(nums)))
print('letters:', ''.join(letters))
# semantic spot-checks
sem = {1: 'b', 2: 'b', 4: 'b', 24: 'd', 21: 'd', 30: None}
for n, expect in sem.items():
    if expect:
        got = letters[n - 1]
        print(f'  sem Q{n}: got={got} expect={expect} {"OK" if got == expect else "MISMATCH"}')

# ---- بخش دوم key (p200) from fitz dict ----
doc = fitz.open('/home/z/my-project/upload/جزوه جامع یازدهم .pdf')
d = doc[199].get_text('dict')
nums_sp, let_sp = [], []
for blk in d.get('blocks', []):
    if blk.get('type', 0) != 0:
        continue
    for ln in blk.get('lines', []):
        for sp in ln.get('spans', []):
            t = sp.get('text', '').strip()
            if not t:
                continue
            sz = sp.get('size', 0); col = sp.get('color', 0)
            x0, y0, x1, y1 = sp['bbox']
            if re.fullmatch(r'\d{1,2}', t) and col == 0x000000 and 13.0 <= sz <= 15.5 and y0 > 60:
                nums_sp.append((y0, x0, int(t)))
            elif re.fullmatch(r'[abcd]', t) and col == 0xC00000 and 14.0 <= sz <= 15.5:
                let_sp.append((y0, x0, t))
print(f'\ngrid spans: numbers={len(nums_sp)} letters={len(let_sp)}')
# row clustering
rows = {}
for y, x, t in nums_sp + let_sp:
    key = round(y / 5)  # rows ~22pt apart; tolerance ±5
    rows.setdefault(key, []).append((x, t))
grid = {}
for rk, items in sorted(rows.items()):
    items.sort()
    nums_r = sorted([(x, n) for x, n in items if isinstance(n, int)])
    lets_r = sorted([(x, l) for x, l in items if not isinstance(l, int)])
    if not nums_r:
        continue
    if len(nums_r) != len(lets_r):
        print(f'  ROW {rk}: count mismatch nums={len(nums_r)} lets={len(lets_r)}')
        continue
    for (xn, n), (xl, l) in zip(nums_r, lets_r):
        if xl < xn:
            print(f'  ROW {rk}: letter {l} left of number {n}')
        grid[n] = l
print('grid entries:', len(grid), '| complete 1..70:', sorted(grid) == list(range(1, 71)))
print('row1 (1,11,..61):', [grid.get(i) for i in range(1, 71, 10)])
# semantic spot-checks for بخش دوم
sem2 = {1: 'b', 2: 'c', 3: 'b', 4: 'b', 60: 'd', 68: 'd'}
for n, expect in sem2.items():
    got = grid.get(n)
    print(f'  sem2 Q{n}: got={got} expect={expect} {"OK" if got == expect else "MISMATCH"}')
