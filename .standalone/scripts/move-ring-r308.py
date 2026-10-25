#!/usr/bin/env python3
# r308 — جابجاییِ z-orderِ حلقهٔ هدف در weeklyCanvas: حلقه پیش از بلوکِ نام/زیرعنوان
# کشیده شود تا کمانِ سنگِ ۱۰۰ رویِ متنِ تیره ننشیند (صفرِ تغییرِ هندسه).
import re, sys

P = "/home/z/my-project/src/lib/result-image.ts"
src = open(P, encoding="utf-8").read()

start_marker = "    // ---------- goal ring (روزهای هدف از ۷) ----------"
end_marker = "    // ---------- activity chips (خانواده‌های واقعیِ DayStat) ----------"
si = src.find(start_marker)
ei = src.find(end_marker)
assert si != -1 and ei != -1 and si < ei, "markers not found"
ring_block = src[si:ei]
assert "goalDays" in ring_block and "createLinearGradient" in ring_block, "unexpected block"

# 1) برداشتنِ حلقه از جای کنونی
src2 = src[:si] + src[ei:]

# 2) درجِ حلقه پیش از بلوکِ نام/زیرعنوان + کامنتِ r308
learner_marker = "    // ---------- learner + streak ----------"
li = src2.find(learner_marker)
assert li != -1, "learner marker not found"
comment = (
    "    // ---------- goal ring (روزهای هدف از ۷) ----------\n"
    "    // r308 — ترتیبِ رنگ: حلقه پیش از نام/زیرعنوان کشیده میشود تا کمانِ\n"
    "    // سنگِ ۱۰۰ رویِ متنِ تیره ننشیند (نقصِ بصریِ پیشینی؛ صفرِ تغییرِ هندسه).\n"
)
src3 = src2[:li] + comment + ring_block + src2[li:]
open(P, "w", encoding="utf-8").write(src3)
print("moved: ring block now precedes learner block")
