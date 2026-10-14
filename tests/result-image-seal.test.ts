// ------------------------------------------------------------------
// راند ۱۹۷ — نشانِ خانواده روی گواهیِ بوم (drawFamilySeal).
//
// با ctx قلابیِ ثبت‌کننده، قراردادهای نقاشی مهر قفل می‌شوند:
//   ① دیسکِ بیرونی با برگِ ۶۰۰یِ خانواده + هالهٔ ظریفِ ۵۰۰ی —
//     هرگز زمردیِ تقریبی نمی‌گیرد (قراردادِ ring600 روی بوم)
//   ② حلقهٔ سفید درونی + ستارهٔ پنج‌پرِ سفید (سه کمان، یک مسیرِ ستاره)
//   ③ برچسبِ «گواهی رسمی» همیشه، «پایه» فقط وقتی برچسبِ پایه هست
//   ④ روبانِ دولب زیرِ دیسک (fillRect دوبار با ۶۰۰یِ خانواده)
// ------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import { drawFamilySeal } from "@/lib/result-image";
import { uiColors } from "@/lib/ui-colors";

function makeFakeCtx() {
  const calls: string[] = [];
  const fills: string[] = [];
  const strokes: string[] = [];
  const ctx: Record<string, unknown> = {};
  let lastFill = "";
  let lastStroke = "";
  Object.defineProperties(ctx, {
    fillStyle: {
      get: () => lastFill,
      set: (v: string) => {
        lastFill = v;
        fills.push(v);
      },
    },
    strokeStyle: {
      get: () => lastStroke,
      set: (v: string) => {
        lastStroke = v;
        strokes.push(v);
      },
    },
  });
  for (const m of [
    "beginPath",
    "closePath",
    "moveTo",
    "lineTo",
    "arc",
    "fill",
    "stroke",
    "save",
    "restore",
    "translate",
    "rotate",
    "fillRect",
    "fillText",
  ]) {
    ctx[m] = (...args: unknown[]) => {
      calls.push(`${m}(${args.map(String).join(",")})`);
    };
  }
  ctx.direction = "ltr";
  ctx.textAlign = "start";
  ctx.font = "";
  ctx.lineWidth = 0;
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls, fills, strokes, raw: ctx };
}

describe("drawFamilySeal — نشانِ خانوادهٔ گواهی روی بوم", () => {
  it("paints the family's own 500/600 leaves, never an emerald approximation", () => {
    const { ctx, fills, strokes } = makeFakeCtx();
    drawFamilySeal(ctx, {
      cx: 565,
      cy: 355,
      r: 44,
      c500: uiColors.orange[500],
      c600: uiColors.orange[600],
      family: "Vazirmatn",
    });
    // disc + two ribbons carry the 600 leaf
    expect(fills.filter((f) => f === uiColors.orange[600]).length).toBe(3);
    // rim halo is the 500 leaf
    expect(strokes).toContain(uiColors.orange[500]);
    // inner ring + star are pure white
    expect(strokes).toContain(uiColors.white);
    expect(fills).toContain(uiColors.white);
    // no emerald leaf sneaks in
    expect(fills).not.toContain(uiColors.emerald[600]);
    expect(strokes).not.toContain(uiColors.emerald[600]);
  });

  it("draws exactly three arcs (disc, rim, inner ring) and a closed ten-point star path", () => {
    const { ctx, calls } = makeFakeCtx();
    drawFamilySeal(ctx, {
      cx: 565,
      cy: 355,
      r: 44,
      c500: "#f97316",
      c600: "#ea580c",
      family: "Vazirmatn",
    });
    expect(calls.filter((c) => c.startsWith("arc(")).length).toBe(3);
    // star: 1 moveTo + 9 lineTo inside ONE path + closePath
    expect(calls.filter((c) => c.startsWith("moveTo(")).length).toBe(1);
    expect(calls.filter((c) => c.startsWith("lineTo(")).length).toBe(9);
    expect(calls.filter((c) => c === "closePath()").length).toBe(1);
  });

  it("labels «گواهی رسمی» always, and the grade label only when provided", () => {
    const withGrade = makeFakeCtx();
    drawFamilySeal(withGrade.ctx, {
      cx: 565,
      cy: 355,
      r: 44,
      c500: "#f97316",
      c600: "#ea580c",
      gradeLabel: "پایهٔ دهم",
      family: "Vazirmatn",
    });
    expect(withGrade.calls).toContain("fillText(گواهی رسمی,565,425)");
    expect(withGrade.calls).toContain("fillText(پایهٔ دهم,565,449)");
    // labels switch to centered RTL
    expect((withGrade.raw.textAlign as string)).toBe("center");
    expect((withGrade.raw.direction as string)).toBe("rtl");

    const withoutGrade = makeFakeCtx();
    drawFamilySeal(withoutGrade.ctx, {
      cx: 565,
      cy: 355,
      r: 44,
      c500: "#f97316",
      c600: "#ea580c",
      family: "Vazirmatn",
    });
    expect(withoutGrade.calls).toContain("fillText(گواهی رسمی,565,425)");
    expect(withoutGrade.calls.some((c) => c.startsWith("fillText(") && c.endsWith(",449)"))).toBe(false);
  });

  it("ribbons dip below the disc via two rotated fillRects", () => {
    const { ctx, calls } = makeFakeCtx();
    drawFamilySeal(ctx, {
      cx: 565,
      cy: 355,
      r: 44,
      c500: "#f97316",
      c600: "#ea580c",
      family: "Vazirmatn",
    });
    expect(calls.filter((c) => c.startsWith("fillRect(")).length).toBe(2);
    expect(calls.filter((c) => c.startsWith("rotate(")).length).toBe(2);
  });
});
