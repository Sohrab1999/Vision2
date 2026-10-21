"use client";

// ------------------------------------------------------------------
// Result image — render a shareable result card on a <canvas> and
// download it as PNG. Persian text is drawn natively by the browser's
// canvas text renderer (bidi + shaping), fonts come from the page.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { BADGES, type BadgeTier } from "./achievements";
import type { DuelLedgerStats } from "./duel-history";
import { uiColors } from "./ui-colors";

export interface ResultImageOpts {
  title: string;
  percent: number;
  correct: number;
  total: number;
  userName?: string;
  premium?: boolean; // certificate-style (final exam)
  /** راند ۱۹۷ — خانوادهٔ رنگیِ گواهی (emerald/orange/violet) — نشانِ خانواده روی بوم */
  accentFamily?: string;
  /** برچسبِ پایه («پایهٔ دهم») زیرِ مهرِ خانواده */
  gradeLabel?: string;
}

/**
 * راند ۱۹۷ — زوجِ ۵۰۰/۶۰۰یِ خانواده از ui-colors، با فرودِ زمردی برای
 * خانوادهٔ ناشناخته (هم‌قرارداد با ring600). بوم کلاسِ تیلویند ندارد؛
 * hexها تک‌منبعی از پالتِ مشترکِ پینترها می‌آیند.
 */
function accentPair(family?: string): { c500: string; c600: string } {
  const fam = (uiColors as Record<string, Record<number, string | undefined> | undefined>)[family ?? ""];
  return {
    c500: fam?.[500] ?? uiColors.emerald[500],
    c600: fam?.[600] ?? uiColors.emerald[600],
  };
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
    const accent = accentPair(opts.accentFamily);

    // ---------- shell (Task 104: استخراجِ دست‌نخورده برای خانوادهٔ سبز) ----------
    studyShell(ctx, W, H, family, dark);

    // ---------- title ----------
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    const title = truncate(ctx, opts.title, W - 620);
    ctx.fillText(title, W - 90, 192);

    // ---------- progress ring (right side) ----------
    const cx = W - 90 - 105;
    const cy = 350;
    const r = 105;
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = uiColors.stone[100];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const pct = Math.max(0, Math.min(100, opts.percent)) / 100;
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (opts.accentFamily) {
      // راند ۱۹۷ — حلقهٔ گواهی با رنگِ خانوادهٔ پایه
      ring.addColorStop(0, accent.c500);
      ring.addColorStop(1, accent.c600);
    } else if (dark) {
      ring.addColorStop(0, uiColors.amber[500]);
      ring.addColorStop(1, uiColors.orange[600]);
    } else {
      ring.addColorStop(0, uiColors.emerald[500]);
      ring.addColorStop(1, uiColors.teal[600]);
    }
    ctx.strokeStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();

    // percent text inside ring
    ctx.textAlign = "center";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `900 52px ${family}`;
    ctx.fillText(`${faNum(opts.percent)}٪`, cx, cy - 10);
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 22px ${family}`;
    ctx.fillText(`${faNum(opts.correct)} از ${faNum(opts.total)}`, cx, cy + 38);

    // ---------- learner name ----------
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    if (opts.userName) {
      ctx.fillStyle = uiColors.stone[900];
      ctx.font = `800 32px ${family}`;
      ctx.fillText(opts.userName, W - 90, 275);
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 18px ${family}`;
      ctx.fillText("یادگیرنده", W - 90, 310);
    } else {
      ctx.fillStyle = uiColors.stone[400];
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
      ctx.fillStyle = dark ? uiColors.amber[50] : uiColors.green[50];
      roundRect(ctx, 90, chy, 300, 58, 14);
      ctx.fill();
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.textAlign = "right";
      ctx.fillText(c.label, 376, chy + 29);
      ctx.fillStyle = dark ? uiColors.amber[800] : uiColors.emerald[700];
      ctx.font = `900 22px ${family}`;
      ctx.textAlign = "left";
      ctx.fillText(c.value, 104, chy + 29);
      chy += 72;
    }

    // ---------- family seal (راند ۱۹۷ — نشانِ خانواده روی گواهی) ----------
    if (opts.accentFamily) {
      drawFamilySeal(ctx, {
        cx: 565,
        cy: 355,
        r: 44,
        c500: accent.c500,
        c600: accent.c600,
        gradeLabel: opts.gradeLabel,
        family,
      });
    }

    // ---------- footer ----------
    ctx.strokeStyle = uiColors.stone[200];
    ctx.beginPath();
    ctx.moveTo(90, H - 108);
    ctx.lineTo(W - 90, H - 108);
    ctx.stroke();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 19px ${family}`;
    ctx.fillText("وب‌کتاب تعاملی زبان انگلیسی دبیرستان · دهم + یازدهم + دوازدهم", W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = dark ? uiColors.amber[600] : uiColors.emerald[600];
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

// ------------------------------------------------------------------
// Task 104 — پوستهٔ خانوادهٔ سبز (استخراجِ دست‌نخورده از downloadResultImage
// تا کارتِ هفته‌نامه هم‌خانواده بماند و کارتِ نتیجه پیکسل‌به‌پیکسل ثابت بماند).
// ------------------------------------------------------------------
function studyShell(ctx: CanvasRenderingContext2D, W: number, H: number, family: string, dark: boolean): void {
  // ---------- background gradient ----------
  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (dark) {
    bg.addColorStop(0, uiColors.amber[900]);
    bg.addColorStop(0.55, uiColors.amber[700]);
    bg.addColorStop(1, uiColors.amber[800]);
  } else {
    bg.addColorStop(0, uiColors.emerald[900]);
    bg.addColorStop(0.55, uiColors.emerald[700]);
    bg.addColorStop(1, uiColors.teal[600]);
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // decorative circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = uiColors.white;
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
  ctx.fillStyle = uiColors.white;
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
  ctx.fillStyle = dark ? uiColors.amber[800] : uiColors.emerald[700];
  ctx.font = `900 26px ${family}`;
  ctx.fillText("وب‌کتاب تعاملی «ویژن ۲»", W - 90, 106);
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  ctx.fillStyle = uiColors.stone[400];
  ctx.font = `700 20px ${family}`;
  ctx.fillText("ENGLISH WEBBOOK · VISION TWO", 90, 106);

  // divider
  ctx.strokeStyle = uiColors.stone[200];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(90, 138);
  ctx.lineTo(W - 90, 138);
  ctx.stroke();
}

// ------------------------------------------------------------------
// راند ۱۹۷ — نشانِ خانواده روی گواهیِ بوم: روبانِ دولب + دیسکِ ۶۰۰یِ
// خانواده + حلقهٔ سفید + ستارهٔ پنج‌پر + رینگِ ظریفِ ۵۰۰ی + برچسبِ
// «گواهی رسمی» و پایه. خالص و صادرات‌شده تا با ctx قلابی تست شود.
// ------------------------------------------------------------------
export interface FamilySealOpts {
  cx: number;
  cy: number;
  r: number;
  c500: string;
  c600: string;
  gradeLabel?: string;
  family: string;
}

export function drawFamilySeal(ctx: CanvasRenderingContext2D, o: FamilySealOpts): void {
  // ribbon tails (dip under the disc)
  ctx.save();
  ctx.translate(o.cx, o.cy);
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.rotate((s * 20 * Math.PI) / 180);
    ctx.fillStyle = o.c600;
    ctx.fillRect(-9, o.r - 8, 18, 44);
    ctx.restore();
  }
  ctx.restore();

  // outer disc — family 600
  ctx.beginPath();
  ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
  ctx.fillStyle = o.c600;
  ctx.fill();

  // micro rim — family 500 halo
  ctx.beginPath();
  ctx.arc(o.cx, o.cy, o.r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = o.c500;
  ctx.lineWidth = 2;
  ctx.stroke();

  // inner white ring
  ctx.beginPath();
  ctx.arc(o.cx, o.cy, o.r - 7, 0, Math.PI * 2);
  ctx.strokeStyle = uiColors.white;
  ctx.lineWidth = 3;
  ctx.stroke();

  // five-point white star
  ctx.beginPath();
  const R = o.r - 16;
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : R * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = o.cx + rad * Math.cos(a);
    const y = o.cy + rad * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = uiColors.white;
  ctx.fill();

  // labels under the seal
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = uiColors.stone[900];
  ctx.font = `800 17px ${o.family}`;
  ctx.fillText("گواهی رسمی", o.cx, o.cy + o.r + 26);
  if (o.gradeLabel) {
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 15px ${o.family}`;
    ctx.fillText(o.gradeLabel, o.cx, o.cy + o.r + 50);
  }
}

// ------------------------------------------------------------------
// Task 101 — کارت‌های «نبرد» (کارنامهٔ دفترچه + نبردِ تکی) — همان شکلِ
// کارتِ نتیجه با پالتِ هیروِ دودل (violet-600 → fuchsia-600 → rose-500).
// هر دو روی یک پوستهٔ مشترک می‌نشینند؛ downloadResultImage دست‌نخورده
// می‌ماند (ظاهرِ پیکسل‌به‌پیکسلِ کارتِ سبز حفظ است).
// ------------------------------------------------------------------

/** پوستهٔ مشترک کارت نبرد: پس‌زمینه + دایره‌های تزئینی + کارت سفید + سربرگ + خط جداکننده */
function battleShell(ctx: CanvasRenderingContext2D, W: number, H: number, family: string): void {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, uiColors.violet[600]); // violet-600
  bg.addColorStop(0.55, uiColors.fuchsia[600]); // fuchsia-600
  bg.addColorStop(1, uiColors.rose[500]); // rose-500
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = uiColors.white;
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

  ctx.fillStyle = uiColors.white;
  roundRect(ctx, 36, 36, W - 72, H - 72, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(192, 38, 211, 0.3)";
  ctx.lineWidth = 2;
  roundRect(ctx, 48, 48, W - 96, H - 96, 20);
  ctx.stroke();

  ctx.direction = "rtl";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.fuchsia[700]; // fuchsia-700
  ctx.font = `900 26px ${family}`;
  ctx.fillText("وب‌کتاب تعاملی «ویژن ۲»", W - 90, 106);
  ctx.textAlign = "left";
  ctx.direction = "ltr";
  ctx.fillStyle = uiColors.stone[400];
  ctx.font = `700 20px ${family}`;
  ctx.fillText("ENGLISH WEBBOOK · VISION TWO", 90, 106);

  ctx.strokeStyle = uiColors.stone[200];
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(90, 138);
  ctx.lineTo(W - 90, 138);
  ctx.stroke();
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

async function downloadBlob(blob: Blob, name: string): Promise<boolean> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return true;
}

async function downloadCanvasBlob(canvas: HTMLCanvasElement, name: string): Promise<boolean> {
  const blob = await canvasToBlob(canvas);
  if (!blob) return false;
  return downloadBlob(blob, name);
}

/** آماده‌سازی فونت + کانواسِ ۱۰۸۰×۶۴۰ با پوستهٔ نبرد — null در محیطِ بی‌کانواس */
async function openBattleCard(family: string): Promise<CanvasRenderingContext2D | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  battleShell(ctx, 1080, 640, family);
  return ctx;
}

// ---------------- کارنامهٔ دفترچه (Task 101 — عکسِ قابلِ هم‌رسانی) ----------------

export interface DuelLedgerImageOpts {
  stats: DuelLedgerStats;
  userName?: string;
}

/** رسمِ کارتِ کارنامه — Task 102: از دانلود جدا شد تا blob هم ساخته شود */
async function duelLedgerCanvas(opts: DuelLedgerImageOpts): Promise<HTMLCanvasElement | null> {
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const family =
      typeof document !== "undefined"
        ? getComputedStyle(document.body).fontFamily || "sans-serif"
        : "sans-serif";
    const ctx = await openBattleCard(family);
    if (!ctx) return null;
    const W = 1080;
    const H = 640;
    const s = opts.stats;

    // ---------- win-rate ring (right side) — اول کشیده می‌شود تا نام/رقیب روی آن بنشیند ----------
    const cx = W - 90 - 105;
    const cy = 350;
    const r = 105;
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = uiColors.stone[100];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const pct = Math.max(0, Math.min(100, s.winRate)) / 100;
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, uiColors.violet[500]); // violet-500
    ring.addColorStop(1, uiColors.fuchsia[500]); // fuchsia-500
    ctx.strokeStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `900 52px ${family}`;
    ctx.fillText(`${faNum(s.winRate)}٪`, cx, cy - 14);
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 21px ${family}`;
    ctx.fillText(`${faNum(s.win)} برد از ${faNum(s.total)} نبرد`, cx, cy + 34);

    // ---------- title (راست، بالای حلقه) ----------
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    ctx.fillText("کارنامهٔ نبردها", W - 90, 192);

    // ---------- learner column (چپ، بالای چیپ‌ها — هم‌لبه با ستونِ چیپ‌ها؛
    // هیچ تداخلی با حلقهٔ سمتِ راست: کارتِ اصلی نام را روی حلقه می‌کشد،
    // این‌جا ستونِ مستقل تمیزتر است) ----------
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 32px ${family}`;
    ctx.fillText(opts.userName ? truncate(ctx, opts.userName, 280) : "یادگیرندهٔ وب‌کتاب", 390, 200);
    ctx.font = `700 18px ${family}`;
    if (s.topRival) {
      // رقیبِ همیشگی — فقط وقتی هست (صداقت: دفترچهٔ بی‌برد، این خط را ندارد)
      ctx.fillStyle = uiColors.fuchsia[700];
      ctx.fillText(`رقیبِ همیشگی: ${truncate(ctx, s.topRival.opponent, 150)} (${faNum(s.topRival.wins)} برد)`, 390, 232);
    } else {
      ctx.fillStyle = uiColors.stone[400];
      ctx.fillText("یادگیرنده", 390, 232);
    }

    // ---------- stat chips (left column) ----------
    const chips: { label: string; value: string }[] = [
      { label: "برد", value: `${faNum(s.win)} نبرد` },
      { label: "باخت", value: `${faNum(s.loss)} نبرد` },
      { label: "مساوی", value: `${faNum(s.tie)} نبرد` },
      { label: "بهترین امتیاز", value: faNum(s.best) },
      { label: "بردِ متوالی", value: faNum(s.streak) },
    ];
    let chy = 250;
    for (const c of chips) {
      ctx.fillStyle = uiColors.fuchsia[50]; // fuchsia-50
      roundRect(ctx, 90, chy, 300, 48, 12);
      ctx.fill();
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.textAlign = "right";
      ctx.fillText(c.label, 376, chy + 24);
      ctx.fillStyle = uiColors.fuchsia[700];
      ctx.font = `900 21px ${family}`;
      ctx.textAlign = "left";
      ctx.fillText(c.value, 104, chy + 24);
      chy += 58;
    }

    // ---------- footer ----------
    ctx.strokeStyle = uiColors.stone[200];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, H - 108);
    ctx.lineTo(W - 90, H - 108);
    ctx.stroke();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 19px ${family}`;
    ctx.fillText(`دفترچهٔ نبردها · ${faDate()}`, W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = uiColors.fuchsia[600];
    ctx.font = `900 20px ${family}`;
    ctx.fillText(s.winRate >= 70 ? "BATTLE STATS ★" : "KEEP FIGHTING!", 90, H - 74);

    return ctx.canvas;
  } catch {
    return null;
  }
}

export async function downloadDuelLedgerImage(opts: DuelLedgerImageOpts): Promise<boolean> {
  const c = await duelLedgerCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, "vision2-duels.png");
}

/** Task 102 — همان کارت به‌صورت blob برای هم‌رسانیِ بومی — بدونِ دانلود */
export async function buildDuelLedgerBlob(opts: DuelLedgerImageOpts): Promise<Blob | null> {
  const c = await duelLedgerCanvas(opts);
  if (!c) return null;
  return canvasToBlob(c);
}

// ---------------- عکسِ نبردِ تکی (Task 101 — صفحهٔ پایان نبرد) ----------------

export interface DuelDoneImageOpts {
  outcome: "win" | "loss" | "tie";
  /** ضربهٔ فنی (حریف وسط راه قطع شد / خودی تمام نکرد) */
  forfeit: boolean;
  myName: string;
  oppName: string;
  myScore: number;
  oppScore: number;
  myCorrect: number;
  oppCorrect: number;
  total: number;
  /** ثانیه‌های من تا پایان — null یعنی ثبت نشد (فورفیت/تایم‌اوت) */
  durationSec: number | null;
  /** تفکیکِ امتیازِ من (قراردادِ داور — Task 99) */
  base: number;
  bonus: number;
  /** رسیدِ امضاشدهٔ داور (Task 94) */
  receipt: boolean;
}

/** رسمِ کارتِ نبردِ تکی — Task 102: از دانلود جدا شد تا blob هم ساخته شود */
async function duelDoneCanvas(opts: DuelDoneImageOpts): Promise<HTMLCanvasElement | null> {
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const family =
      typeof document !== "undefined"
        ? getComputedStyle(document.body).fontFamily || "sans-serif"
        : "sans-serif";
    const ctx = await openBattleCard(family);
    if (!ctx) return null;
    const W = 1080;
    const H = 640;
    const win = opts.outcome === "win";
    const tie = opts.outcome === "tie";
    const accent = win ? uiColors.emerald[600] : tie ? uiColors.amber[600] : uiColors.rose[600];

    // ---------- names over each score ----------
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 17px ${family}`;
    ctx.textAlign = "center";
    ctx.fillText(win ? "پیروزی" : tie ? "مساوی" : "شکست", W / 2, 190);

    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 30px ${family}`;
    ctx.fillText(truncate(ctx, opts.myName, 330), W - 130, 235);
    ctx.fillText(truncate(ctx, opts.oppName, 330), 130, 235);
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 16px ${family}`;
    ctx.fillText("تو", W - 130, 268);
    ctx.fillText("حریف", 130, 268);

    // ---------- big score row ----------
    ctx.font = `900 72px ${family}`;
    ctx.fillStyle = accent;
    ctx.fillText(faNum(opts.myScore), W - 130, 330);
    ctx.fillStyle = uiColors.stone[900];
    ctx.fillText(faNum(opts.oppScore), 130, 330);
    ctx.fillStyle = uiColors.stone[300];
    ctx.font = `900 40px ${family}`;
    ctx.fillText("–", W / 2, 330);

    // ---------- correct counts ----------
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 20px ${family}`;
    ctx.fillText(`${faNum(opts.myCorrect)} درست از ${faNum(opts.total)}`, W - 130, 380);
    ctx.fillText(`${faNum(opts.oppCorrect)} درست از ${faNum(opts.total)}`, 130, 380);

    // ---------- outcome ribbon ----------
    const ribbon = win ? (opts.forfeit ? "برد با ضربهٔ فنی!" : "پیروزی در نبرد!") : tie ? "مساوی — رقابت نزدیک" : opts.forfeit ? "حریف خارج شد" : "این دور را باختی";
    ctx.font = `900 26px ${family}`;
    const tw = ctx.measureText(ribbon).width;
    ctx.fillStyle = accent;
    roundRect(ctx, W / 2 - tw / 2 - 26, 420, tw + 52, 52, 26);
    ctx.fill();
    ctx.fillStyle = uiColors.white;
    ctx.fillText(ribbon, W / 2, 447);

    // ---------- detail line ----------
    const details: string[] = [`${faNum(opts.base)} پایه + ${faNum(opts.bonus)} سرعت`];
    if (opts.durationSec !== null && opts.durationSec > 0) details.push(`${faNum(opts.durationSec)} ثانیه`);
    if (opts.forfeit && opts.durationSec === null) details.push("ضربهٔ فنی");
    if (opts.receipt) details.push("رسیدِ امضاشدهٔ داور");
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 20px ${family}`;
    ctx.fillText(details.join(" · "), W / 2, 505);

    // ---------- footer ----------
    ctx.strokeStyle = uiColors.stone[200];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, H - 108);
    ctx.lineTo(W - 90, H - 108);
    ctx.stroke();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 19px ${family}`;
    ctx.fillText(`نبرد واژگان · ${faDate()}`, W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = uiColors.fuchsia[600];
    ctx.font = `900 20px ${family}`;
    ctx.fillText(win ? "VICTORY ★" : tie ? "GOOD DUEL" : "REMATCH?", 90, H - 74);

    return ctx.canvas;
  } catch {
    return null;
  }
}

export async function downloadDuelDoneImage(opts: DuelDoneImageOpts): Promise<boolean> {
  const c = await duelDoneCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, `vision2-duel-${opts.outcome}.png`);
}

/** Task 102 — همان کارت به‌صورت blob برای هم‌رسانیِ بومی — بدونِ دانلود */
export async function buildDuelDoneBlob(opts: DuelDoneImageOpts): Promise<Blob | null> {
  const c = await duelDoneCanvas(opts);
  if (!c) return null;
  return canvasToBlob(c);
}

// ---------------- کارتِ هفته‌نامهٔ پیشرفت (Task 104 — عکسِ هفته‌نامه) ----------------

export interface WeeklyImageOpts {
  userName?: string;
  /** جمعِ فعالیتِ هفته (همان thisWeek.activities دایجست) */
  activities: number;
  /** برشِ واقعیِ خانواده‌های فعالیتِ همین هفته — هیچ عددِ ساختگی */
  reviews: number;
  quizzes: number;
  words: number;
  dictation: number;
  rush: number;
  /** روزهای هدفِ کامل‌شدهٔ همین هفته (۰..۷) — حلقه بر همین درصد می‌نشیند */
  goalDays: number;
  /** زنجیرهٔ فعلی — فقط با عددِ مثبت نمایش می‌آید */
  streak: number;
  /** پرجانب‌ترین روزِ هفته — برچسبِ کوتاهِ فارسیِ آماده */
  bestDay?: { label: string; total: number } | null;
  /** خطِ نبردها — متنِ فارسیِ آماده از بلوکِ هفته‌نامه (ارقامِ فارسی) */
  duelLine?: string;
  /** r285 — نشانهای بازِ همان ارزیابیِ واحدِ هفتهنامه (title+tier) — الزامی:
   * کارتِ هم‌رسانی هم باید به «تا کجا رسیده‌ام؟» جواب بدهد؛ سرشماریِ
   * زمان-کامپایل مجریِ تغذیه است (الگویِ buildEvalInputِ r282). */
  badges: { title: string; tier: BadgeTier }[];
}

// r285 — tier chips of the badge band on the weekly canvas card. Same hexes as
// or-chip-bronze|silver|gold (globals.css) — the weekly-badge-image test locks
// the mirror so canvas and DOM can never drift apart.
export const WEEKLY_TIER_CHIP: Record<
  BadgeTier,
  { bg: string; ring: string; text: string }
> = {
  bronze: { bg: uiColors.orange[100], ring: uiColors.orange[300], text: uiColors.orange[800] },
  silver: { bg: uiColors.slate[100], ring: uiColors.slate[300], text: uiColors.slate[600] },
  gold: { bg: uiColors.yellow[100], ring: uiColors.yellow[300], text: uiColors.yellow[700] },
};

export async function downloadWeeklyImage(opts: WeeklyImageOpts): Promise<boolean> {
  const c = await weeklyCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, "vision2-weekly.png");
}

async function weeklyCanvas(opts: WeeklyImageOpts): Promise<HTMLCanvasElement | null> {
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const family =
      typeof document !== "undefined"
        ? getComputedStyle(document.body).fontFamily || "sans-serif"
        : "sans-serif";
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 740;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const W = 1080;
    const H = 740;
    studyShell(ctx, W, H, family, false);

    // ---------- title ----------
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    ctx.fillText("هفته‌نامهٔ پیشرفت", W - 90, 192);

    // ---------- learner + streak ----------
    if (opts.userName) {
      ctx.fillStyle = uiColors.stone[900];
      ctx.font = `800 32px ${family}`;
      ctx.fillText(truncate(ctx, opts.userName, 280), W - 90, 275);
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 18px ${family}`;
      ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 310);
    } else {
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 20px ${family}`;
      ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 275);
    }
    if (opts.streak > 0) {
      ctx.fillStyle = uiColors.emerald[600];
      ctx.font = `900 22px ${family}`;
      ctx.fillText(`زنجیرهٔ ${faNum(opts.streak)} روزه`, W - 90, 350);
    }

    // ---------- goal ring (روزهای هدف از ۷) ----------
    const cx = W - 90 - 105;
    const cy = 350;
    const r = 105;
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = uiColors.stone[100];
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const pct = Math.max(0, Math.min(7, opts.goalDays)) / 7;
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, uiColors.emerald[500]);
    ring.addColorStop(1, uiColors.teal[600]);
    ctx.strokeStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `900 52px ${family}`;
    ctx.fillText(`${faNum(Math.round(pct * 100))}٪`, cx, cy - 10);
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 21px ${family}`;
    ctx.fillText(`${faNum(opts.goalDays)} از ${faNum(7)} روزِ هدف`, cx, cy + 38);

    // ---------- activity chips (خانواده‌های واقعیِ DayStat) ----------
    const chips: { label: string; value: number }[] = [
      { label: "مرور", value: opts.reviews },
      { label: "آزمون", value: opts.quizzes },
      { label: "واژهٔ نو", value: opts.words },
      { label: "دیکته", value: opts.dictation },
      { label: "برق‌آسا", value: opts.rush },
    ];
    let chy = 246;
    for (const c of chips) {
      ctx.fillStyle = uiColors.green[50];
      roundRect(ctx, 90, chy, 300, 46, 12);
      ctx.fill();
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.textAlign = "right";
      ctx.fillText(c.label, 376, chy + 23);
      ctx.fillStyle = uiColors.emerald[700];
      ctx.font = `900 21px ${family}`;
      ctx.textAlign = "left";
      ctx.fillText(faNum(c.value), 104, chy + 23);
      chy += 54;
    }

    // ---------- center line: نبردها یا پرجانب‌ترین روز — فقط وقتی واقعی ----------
    ctx.textAlign = "center";
    ctx.direction = "rtl";
    ctx.font = `700 20px ${family}`;
    if (opts.duelLine) {
      ctx.fillStyle = uiColors.fuchsia[700];
      ctx.fillText(truncate(ctx, opts.duelLine, 640), W / 2, 508);
    } else if (opts.bestDay && opts.bestDay.total > 0) {
      ctx.fillStyle = uiColors.stone[500];
      ctx.fillText(
        `پرجانب‌ترین روز: ${opts.bestDay.label} — ${faNum(opts.bestDay.total)} فعالیت`,
        W / 2,
        508
      );
    }

    // ---------- r285: نوارِ نشانها — «تا کجا رسیده‌ام؟» در کارتِ هم‌رسانی هم ----------
    // نشانها با همان ارزیابیِ واحدِ هفتهنامه از call site میآیند؛ چیپها دقیقاً
    // رنگِ or-chip-*ِ DOM را میکشند (WEEKLY_TIER_CHIP — تستِ قفلِ تطبیق).
    ctx.fillStyle = uiColors.stone[100];
    roundRect(ctx, 70, 524, W - 140, 98, 16);
    ctx.fill();

    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 20px ${family}`;
    const hdrW = ctx.measureText("نشان‌های من").width;
    ctx.fillText("نشان‌های من", W - 100, 551);

    const countLabel = `${faNum(opts.badges.length)} از ${faNum(BADGES.length)}`;
    ctx.font = `700 15px ${family}`;
    const cw = ctx.measureText(countLabel).width;
    const pillR = W - 100 - hdrW - 14;
    ctx.fillStyle = uiColors.green[50];
    roundRect(ctx, pillR - cw - 24, 538, cw + 24, 26, 13);
    ctx.fill();
    ctx.fillStyle = uiColors.emerald[700];
    ctx.textAlign = "center";
    ctx.fillText(countLabel, pillR - cw / 2 - 12, 551);

    if (opts.badges.length === 0) {
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.textAlign = "center";
      ctx.fillText("هنوز نشانی باز نشده — با ادامهٔ تمرین روزانه نشان‌ها همین‌جا هم می‌آیند.", W / 2, 592);
    } else {
      ctx.font = `700 16px ${family}`;
      ctx.textAlign = "center";
      let cxr = W - 100;
      let drawn = 0;
      for (const b of opts.badges) {
        const w = ctx.measureText(b.title).width + 28;
        if (cxr - w < 90) break;
        const st = WEEKLY_TIER_CHIP[b.tier];
        ctx.fillStyle = st.bg;
        roundRect(ctx, cxr - w, 574, w, 34, 17);
        ctx.fill();
        ctx.strokeStyle = st.ring;
        ctx.lineWidth = 1;
        roundRect(ctx, cxr - w, 574, w, 34, 17);
        ctx.stroke();
        ctx.fillStyle = st.text;
        ctx.fillText(b.title, cxr - w / 2, 592);
        cxr -= w + 10;
        drawn++;
      }
      const hidden = opts.badges.length - drawn;
      if (hidden > 0) {
        const label = `+${faNum(hidden)}`;
        const w = ctx.measureText(label).width + 28;
        if (cxr - w >= 90) {
          ctx.fillStyle = uiColors.white;
          roundRect(ctx, cxr - w, 574, w, 34, 17);
          ctx.fill();
          ctx.strokeStyle = uiColors.stone[300];
          ctx.lineWidth = 1;
          roundRect(ctx, cxr - w, 574, w, 34, 17);
          ctx.stroke();
          ctx.fillStyle = uiColors.stone[500];
          ctx.fillText(label, cxr - w / 2, 592);
        }
      }
    }

    // ---------- footer ----------
    ctx.strokeStyle = uiColors.stone[200];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, H - 108);
    ctx.lineTo(W - 90, H - 108);
    ctx.stroke();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 19px ${family}`;
    ctx.fillText(`هفته‌نامهٔ پیشرفت · ${faDate()}`, W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = uiColors.emerald[600];
    ctx.font = `900 20px ${family}`;
    ctx.fillText(
      opts.activities >= 20 ? "STRONG WEEK ★" : opts.activities >= 8 ? "GOOD PACE" : "KEEP GOING!",
      90,
      H - 74
    );

    return ctx.canvas;
  } catch {
    return null;
  }
}
