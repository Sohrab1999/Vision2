"use client";

// ------------------------------------------------------------------
// Result image — render a shareable result card on a <canvas> and
// download it as PNG. Persian text is drawn natively by the browser's
// canvas text renderer (bidi + shaping), fonts come from the page.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";

export interface ResultImageOpts {
  title: string;
  percent: number;
  correct: number;
  total: number;
  userName?: string;
  premium?: boolean; // certificate-style (final exam)
}

function faDate(): string {
  try {
    return new Date().toLocaleDateString("fa-IR");
  } catch {
    return faNum(new Date().toLocaleDateString("en-GB"));
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // manual fallback
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

export async function downloadResultImage(opts: ResultImageOpts): Promise<boolean> {
  try {
    // make sure webfonts are ready so canvas uses Vazirmatn
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const family =
      typeof document !== "undefined"
        ? getComputedStyle(document.body).fontFamily || "sans-serif"
        : "sans-serif";

    const W = 1080;
    const H = 640;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const dark = opts.premium ?? false;

    // ---------- background gradient ----------
    const bg = ctx.createLinearGradient(0, 0, W, H);
    if (dark) {
      bg.addColorStop(0, "#78350f");
      bg.addColorStop(0.55, "#b45309");
      bg.addColorStop(1, "#92400e");
    } else {
      bg.addColorStop(0, "#064e3b");
      bg.addColorStop(0.55, "#047857");
      bg.addColorStop(1, "#0d9488");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // decorative circles
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#ffffff";
    for (const [cx, cy, r] of [
      [W - 90, 80, 150],
      [90, H - 70, 120],
      [W / 2, H + 60, 200],
    ] as const) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---------- inner card ----------
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 36, 36, W - 72, H - 72, 28);
    ctx.fill();
    ctx.strokeStyle = dark ? "rgba(180, 83, 9, 0.35)" : "rgba(6, 95, 70, 0.25)";
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 48, W - 96, H - 96, 20);
    ctx.stroke();

    // ---------- header row ----------
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = dark ? "#92400e" : "#047857";
    ctx.font = `900 26px ${family}`;
    ctx.fillText("وب‌کتاب تعاملی «ویژن ۲»", W - 90, 106);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = "#a8a29e";
    ctx.font = `700 20px ${family}`;
    ctx.fillText("ENGLISH WEBBOOK · VISION TWO", 90, 106);

    // divider
    ctx.strokeStyle = "#e7e5e4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, 138);
    ctx.lineTo(W - 90, 138);
    ctx.stroke();

    // ---------- title ----------
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#1c1917";
    ctx.font = `800 34px ${family}`;
    const title = truncate(ctx, opts.title, W - 620);
    ctx.fillText(title, W - 90, 192);

    // ---------- progress ring (right side) ----------
    const cx = W - 90 - 105;
    const cy = 350;
    const r = 105;
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#f5f5f4";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const pct = Math.max(0, Math.min(100, opts.percent)) / 100;
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (dark) {
      ring.addColorStop(0, "#f59e0b");
      ring.addColorStop(1, "#ea580c");
    } else {
      ring.addColorStop(0, "#10b981");
      ring.addColorStop(1, "#0d9488");
    }
    ctx.strokeStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();

    // percent text inside ring
    ctx.textAlign = "center";
    ctx.fillStyle = "#1c1917";
    ctx.font = `900 52px ${family}`;
    ctx.fillText(`${faNum(opts.percent)}٪`, cx, cy - 10);
    ctx.fillStyle = "#78716c";
    ctx.font = `700 22px ${family}`;
    ctx.fillText(`${faNum(opts.correct)} از ${faNum(opts.total)}`, cx, cy + 38);

    // ---------- learner name ----------
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    if (opts.userName) {
      ctx.fillStyle = "#1c1917";
      ctx.font = `800 32px ${family}`;
      ctx.fillText(opts.userName, W - 90, 275);
      ctx.fillStyle = "#a8a29e";
      ctx.font = `700 18px ${family}`;
      ctx.fillText("یادگیرنده", W - 90, 310);
    } else {
      ctx.fillStyle = "#a8a29e";
      ctx.font = `700 20px ${family}`;
      ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 275);
    }

    // ---------- stat chips (left column) ----------
    const chips: { label: string; value: string }[] = [
      { label: "پاسخ درست", value: `${faNum(opts.correct)} سؤال` },
      { label: "تعداد سؤال", value: `${faNum(opts.total)} سؤال` },
      { label: "تاریخ اخذ", value: faDate() },
    ];
    let chy = 250;
    for (const c of chips) {
      ctx.fillStyle = dark ? "#fffbeb" : "#f0fdf4";
      roundRect(ctx, 90, chy, 300, 58, 14);
      ctx.fill();
      ctx.fillStyle = "#78716c";
      ctx.font = `700 17px ${family}`;
      ctx.textAlign = "right";
      ctx.fillText(c.label, 376, chy + 29);
      ctx.fillStyle = dark ? "#92400e" : "#047857";
      ctx.font = `900 22px ${family}`;
      ctx.textAlign = "left";
      ctx.fillText(c.value, 104, chy + 29);
      chy += 72;
    }

    // ---------- footer ----------
    ctx.strokeStyle = "#e7e5e4";
    ctx.beginPath();
    ctx.moveTo(90, H - 108);
    ctx.lineTo(W - 90, H - 108);
    ctx.stroke();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#a8a29e";
    ctx.font = `700 19px ${family}`;
    ctx.fillText("وب‌کتاب تعاملی زبان انگلیسی پایهٔ یازدهم · تبدیل‌شده از جزوهٔ کاغذی", W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = dark ? "#d97706" : "#059669";
    ctx.font = `900 20px ${family}`;
    ctx.fillText(opts.percent >= 90 ? "EXCELLENT ★" : opts.percent >= 70 ? "GREAT JOB" : "KEEP GOING!", 90, H - 74);

    // ---------- download ----------
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision2-result-${opts.percent}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return true;
  } catch {
    return false;
  }
}
