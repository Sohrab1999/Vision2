"use client";

// ------------------------------------------------------------------
// Result image — render a shareable result card on a <canvas> and
// download it as PNG. Persian text is drawn natively by the browser's
// canvas text renderer (bidi + shaping), fonts come from the page.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { BADGES, DUEL_BADGE_IDS, type BadgeTier } from "./achievements";
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

/** آماده‌سازی فونت + کانواسِ ۱۰۸۰×H با پوستهٔ نبرد — null در محیطِ بی‌کانواس.
 * r287 — ارتفاعِ پارامتری شد: دفترچه ۶۴۰ می‌ماند، کارتِ نبردِ ۷۴۰ میخواهد
 * (ناحیهٔ نو برایِ باندِ نشانها — هم‌خانوادهٔ هفته‌نامه/رسمی). */
async function openBattleCard(family: string, h = 640): Promise<CanvasRenderingContext2D | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  battleShell(ctx, 1080, h, family);
  return ctx;
}

// ---------------- کارنامهٔ دفترچه (Task 101 — عکسِ قابلِ هم‌رسانی) ----------------

export interface DuelLedgerImageOpts {
  stats: DuelLedgerStats;
  userName?: string;
  /** r288 — باندِ «نشان‌های نبردی»: فقط خانوادهٔ نبرد (DUEL_BADGE_IDS) از
   * همان ارزیابیِ واحدِ رجیستری (duelFamilyBadges روی unlockedBadgeIds) —
   * شمارندهٔ خودسازگار «X از ۱۰»؛ دامِ r287 (شمارندهٔ جهانیِ «از ۵۳» کنار
   * آرایهٔ فیلترشده) اینجا به‌ساخت ناممکن است. سرشماریِ زمان-کامپایل مجریِ
   * تغذیه است (الگویِ الزامیِ r285/286/287). */
  badges: { title: string; tier: BadgeTier }[];
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
    const ctx = await openBattleCard(family, 760);
    if (!ctx) return null;
    const W = 1080;
    // r288 — 640→760: ناحیهٔ نو برایِ باندِ «نشان‌های نبردی» (همان الگویِ
    // r287 برای کارتِ نبرد) — چیپهایِ آمار تا 530 میمانند، باند 544..642،
    // خطِ پانویس 652 — هیچ همپوشانی.
    const H = 760;
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

    // ---------- r288: باندِ خانوادهٔ نبرد — «کدام نشانهای نبردی دارم؟» ----------
    // همان نقاشِ مشترکِ drawBadgeBand (هیچ کارتی باندِ خودش را نمیکشد) با
    // سرصفه/شمارندهٔ خانواده. drawBadgeBand با baselineِ alphabetic کالیبره
    // شده — کارتِ دفترچه middle دارد؛ همان سوییچِ موضعیِ r287 و بازگشتِ دقیق.
    ctx.textBaseline = "alphabetic";
    drawBadgeBand(ctx, {
      badges: opts.badges,
      family,
      x: 70,
      y: 544,
      w: W - 140,
      header: "نشان‌های نبردی",
      total: DUEL_BADGE_IDS.length,
      emptyLine: "هنوز نشانی نبردی باز نشده — نخستین پیروزی، نخستین نشان را میآورد.",
    });
    ctx.textBaseline = "middle";

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
  /** r287 — نوارِ «نشان‌های من»: همان ارزیابیِ واحدِ رجیستری از unlockedBadgesِ
   * همان رندر میآید — کارتِ نبرد هم از نقاشِ مشترکِ drawBadgeBand میخواند؛
   * هیچ کارتی باندِ خودش را نمیکشد (الگویِ الزامیِ r285/286 — سرشماریِ
   * زمان‌کامپایل مجریِ تغذیه است). */
  badges: { title: string; tier: BadgeTier }[];
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
    const ctx = await openBattleCard(family, 740);
    if (!ctx) return null;
    const W = 1080;
    // r287 — 640→740: ناحیهٔ نو برایِ باندِ نشانها (هم‌خانوادهٔ هفته‌نامه/رسمی)
    const H = 740;
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

    // ---------- r287: نوارِ نشانها — «تا کجا رسیده‌ام؟» در لحظهٔ برد هم ----------
    // drawBadgeBand با baselineِ alphabetic کالیبره شده — کارتِ نبرد middle
    // دارد؛ سوییچِ موضعی و بازگشتِ دقیق (footer با middle طراحی شده).
    ctx.textBaseline = "alphabetic";
    drawBadgeBand(ctx, { badges: opts.badges, family, x: 70, y: 524, w: W - 140 });
    ctx.textBaseline = "middle";

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
  /** r298 — داستان‌های خوانده‌شدهٔ این هفته (شمارشِ storiesReadSince).
   * فقط وقتی کتاب‌خانه فعال است فرستاده می‌شود — بی‌کتاب‌خانه چیپِ صفرِ ساختگی نیست. */
  storiesWeek?: number;
  /** r303 — استریکِ کتابخوانی روی کارت (قراردادِ خالصِ library-streakِ r301).
   * فقط با سابقه فرستاده میشود (current>0 || longest>0 — سیاستِ بوم‌محورِ r302)؛
   * بی‌سابقه خطِ صفرِ ساختگی زیرِ حلقه نمی‌نشیند. */
  storiesStreak?: { current: number; longest: number };
  /** r305 — سطرِ ماه‌نامهٔ خواندن روی کارت (قراردادِ خالصِ library-monthِ r304).
   * فقط با سابقهٔ پنجره فرستاده میشود (empty=false — سیاستِ بوم‌محور)؛
   * بی‌سابقه خطِ «ماهِ گذشته» صفرِ ساختگی نیست. رنگِ سنگی — آینهٔ سطرِ
   * سربرگِ ماه‌نامه در DOM که خودش stone-500 است و کهربا فقط خانه‌ها را میسازد. */
  storiesMonth?: { total: number; activeDays: number; bestCount: number };
  /** r307 — ۳۰ شمارشِ روزانهٔ ماه‌نامه (کهنه→امروز) برایِ نوارِ ۳۰خانه‌ایِ روی کارت —
   * آینهٔ نوارِ DOMِ r304 با همان رنگ‌هایِ سطحی و جریانِ زمانِ RTL.
   * فقط همراهِ storiesMonth فرستاده میشود؛ بدونِ آن نوارِ صفرِ ساختگی نیست. */
  storiesMonthPerDay?: number[];
  /** r308 — نوارِ ۱۴روزهٔ هفته (خودِ perDayِ دایجست — جمعِ ۵ خانواده؛ داستان
   * جدا در چیپِ خودش): کهنه→امروز. inThisWeek مرزِ دو هفته را صریح میگوید —
   * هیچ حسابِ ایندیکسِ هفتگی روی کارت نیست. برخلافِ خانوادهٔ داستان همیشه
   * تغذیه میشود: فعالیتِ صفرِ صادق هم‌قراردادِ چیپهاست (سیاستِ بوم‌محورِ r302
   * مخصوصِ داستانهاست — بی‌کتاب‌خانه با بی‌فعالیت یکی نیست). گاردِ length===14:
   * یا نوارِ کامل یا هیچ (درسِ r307 — دادهٔ ناقص نوارِ نصفه‌نیمه نمیسازد). */
  weekPerDay?: { total: number; inThisWeek: boolean }[];
  /** r285 — نشانهای بازِ همان ارزیابیِ واحدِ هفتهنامه (title+tier) — الزامی:
   * کارتِ هم‌رسانی هم باید به «تا کجا رسیده‌ام؟» جواب بدهد؛ سرشماریِ
   * زمان-کامپایل مجریِ تغذیه است (الگویِ buildEvalInputِ r282). */
  badges: { title: string; tier: BadgeTier }[];
}

// r285 — tier chips of the badge band on the canvas cards (weekly + official).
// Same hexes as or-chip-bronze|silver|gold (globals.css) — the weekly-badge-image
// test locks the mirror so canvas and DOM can never drift apart.
export const WEEKLY_TIER_CHIP: Record<
  BadgeTier,
  { bg: string; ring: string; text: string }
> = {
  bronze: { bg: uiColors.orange[100], ring: uiColors.orange[300], text: uiColors.orange[800] },
  silver: { bg: uiColors.slate[100], ring: uiColors.slate[300], text: uiColors.slate[600] },
  gold: { bg: uiColors.yellow[100], ring: uiColors.yellow[300], text: uiColors.yellow[700] },
};

/** r286 — the badge band painter shared by EVERY canvas card (weekly + official):
 * veil + «نشان‌های من» header + counter pill + tier chips (RTL, +N cap) or the
 * honest zero line — drawn at (x, y) with width w and the family-fixed 98px
 * height. Single source: the DOM band copy and the tier colors are locked by
 * tests; no card may draw its own band. */
function drawBadgeBand(
  ctx: CanvasRenderingContext2D,
  o: {
    badges: { title: string; tier: BadgeTier }[];
    family: string;
    x: number;
    y: number;
    w: number;
    /** r288 — سرصفهٔ باند؛ پیشفرض «نشان‌های من» — باندِ خانوادهٔ دفترچه
     * «نشان‌های نبردی» میفرستد. هر سه فراخوانِ قدیمی بدونِ این پارامتر
     * عیناً رندرِ قبل را میگیرند (سازگاریِ با عقبِ نقاشِ واحد). */
    header?: string;
    /** r288 — شمارندهٔ «X از total»؛ پیشفرض BADGES.length (کلِ رجیستری).
     * باندِ خانواده DUEL_BADGE_IDS.length میفرستد — برچسب و چیپها هر دو
     * از یک لیست، دامِ گمراهیِ شمارندهٔ r287 به‌ساخت ناممکن. */
    total?: number;
    /** r288 — خطِ صادقِ بی‌نشان؛ پیشفرض همان خطِ همگانیِ ۲۸۵. */
    emptyLine?: string;
  }
): void {
  const { family, x, y, w } = o;
  const header = o.header ?? "نشان‌های من";
  const total = o.total ?? BADGES.length;
  const emptyLine = o.emptyLine ?? "هنوز نشانی باز نشده — با ادامهٔ تمرین روزانه نشان‌ها همین‌جا هم می‌آیند.";
  ctx.fillStyle = uiColors.stone[100];
  roundRect(ctx, x, y, w, 98, 16);
  ctx.fill();

  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.stone[900];
  ctx.font = `800 20px ${family}`;
  const hdrW = ctx.measureText(header).width;
  ctx.fillText(header, x + w - 30, y + 27);

  const countLabel = `${faNum(o.badges.length)} از ${faNum(total)}`;
  ctx.font = `700 15px ${family}`;
  const cw = ctx.measureText(countLabel).width;
  const pillR = x + w - 30 - hdrW - 14;
  ctx.fillStyle = uiColors.green[50];
  roundRect(ctx, pillR - cw - 24, y + 14, cw + 24, 26, 13);
  ctx.fill();
  ctx.fillStyle = uiColors.emerald[700];
  ctx.textAlign = "center";
  ctx.fillText(countLabel, pillR - cw / 2 - 12, y + 27);

  if (o.badges.length === 0) {
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 17px ${family}`;
    ctx.textAlign = "center";
    ctx.fillText(emptyLine, x + w / 2, y + 68);
    return;
  }
  ctx.font = `700 16px ${family}`;
  ctx.textAlign = "center";
  let cxr = x + w - 30;
  let drawn = 0;
  for (const b of o.badges) {
    const bw = ctx.measureText(b.title).width + 28;
    if (cxr - bw < x + 20) break;
    const st = WEEKLY_TIER_CHIP[b.tier];
    ctx.fillStyle = st.bg;
    roundRect(ctx, cxr - bw, y + 50, bw, 34, 17);
    ctx.fill();
    ctx.strokeStyle = st.ring;
    ctx.lineWidth = 1;
    roundRect(ctx, cxr - bw, y + 50, bw, 34, 17);
    ctx.stroke();
    ctx.fillStyle = st.text;
    ctx.fillText(b.title, cxr - bw / 2, y + 68);
    cxr -= bw + 10;
    drawn++;
  }
  const hidden = o.badges.length - drawn;
  if (hidden > 0) {
    const label = `+${faNum(hidden)}`;
    const bw = ctx.measureText(label).width + 28;
    if (cxr - bw >= x + 20) {
      ctx.fillStyle = uiColors.white;
      roundRect(ctx, cxr - bw, y + 50, bw, 34, 17);
      ctx.fill();
      ctx.strokeStyle = uiColors.stone[300];
      ctx.lineWidth = 1;
      roundRect(ctx, cxr - bw, y + 50, bw, 34, 17);
      ctx.stroke();
      ctx.fillStyle = uiColors.stone[500];
      ctx.fillText(label, cxr - bw / 2, y + 68);
    }
  }
}

/** r309 — نقاشِ مشترکِ نوارِ ۱۴روزهٔ فعالیت — هیچ کارتی نوارِ خودش را نمیکشد
 * (همان درسِ r286 که باندِ نشانها را یکدست کرد). هندسه از DOMِ هفته‌نامه
 * کپی شده (r308): گپِ ۳، بیشینهٔ ۴۴، فعال ≥۱۰، خالی ۳؛ رنگها: این‌هفته =
 * گرادیانِ teal-600→emerald-500→lime-400، هفتهٔ پیش = سنگِ ۳۰۰، خالی =
 * emerald-200/60 · c-track-60 با آلفا؛ امروز حلقهٔ زمردی. برچسبِ سطرِ زیر
 * (y=baseline+18) عینِ DOMِ r308: چپ پنجره، وسط مرزِ دو هفته، راست امروز.
 * هم‌قرارداد: weekPerDay همیشه ۱۴تایی تغذیه میشود (فعالیتِ صفرِ صادق). */
function drawWeekStrip14(
  ctx: CanvasRenderingContext2D,
  o: {
    weekPerDay: { total: number; inThisWeek: boolean }[];
    family: string;
    x: number;
    y: number; // baselineِ نوار — پایینِ خانهها
    bandW: number;
  }
): void {
  const { weekPerDay, family, x, y: baseline, bandW } = o;
  const gap = 3; // DOM: gap-[3px]
  const cellW = Math.floor((bandW - 13 * gap) / 14);
  const totalCellsW = 14 * cellW + 13 * gap;
  const startX = x + Math.floor((bandW - totalCellsW) / 2);
  const maxTotal = Math.max(1, ...weekPerDay.map((p) => p.total));
  const grad = ctx.createLinearGradient(0, baseline, 0, baseline - 44);
  grad.addColorStop(0, uiColors.teal[600]);
  grad.addColorStop(0.5, uiColors.emerald[500]);
  grad.addColorStop(1, uiColors.lime[400]);
  const prevDir = ctx.direction;
  for (let i = 0; i < 14; i++) {
    const p = weekPerDay[i] ?? { total: 0, inThisWeek: i >= 7 };
    const h = Math.max(p.total > 0 ? 10 : 3, (p.total / maxTotal) * 44);
    const cx2 = startX + i * (cellW + gap);
    ctx.globalAlpha = p.total > 0 || p.inThisWeek ? 1 : 0.6;
    ctx.fillStyle = p.inThisWeek
      ? p.total > 0
        ? grad
        : uiColors.emerald[200]
      : p.total > 0
        ? uiColors.stone[300]
        : uiColors.stone[200];
    roundRect(ctx, cx2, baseline - h, cellW, h, h >= 8 ? 3 : 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (i === 13) {
      // امروز — حلقهٔ زمردی (هم‌قراردادِ ring-emerald-500/60 در DOM)
      ctx.strokeStyle = uiColors.emerald[500];
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx2 - 0.75, baseline - h - 0.75, cellW + 1.5, h + 1.5, h >= 8 ? 3.5 : 2.5);
      ctx.stroke();
    }
  }
  // سطرِ برچسبِ DOM (۱۱px سنگِ ۵۰۰) — جهتِ صریحِ RTL تا ترتیبِ «هفتهٔ پیش |
  // این هفته» رویِ هر کارت، مستقل از حالتِ فراخوان، یکسان بماند.
  ctx.direction = "rtl";
  ctx.fillStyle = uiColors.stone[500];
  ctx.font = `700 11px ${family}`;
  ctx.textAlign = "left";
  ctx.fillText("۱۴ روز اخیر", startX, baseline + 18);
  ctx.textAlign = "center";
  ctx.fillText("هفتهٔ پیش | این هفته", startX + totalCellsW / 2, baseline + 18);
  ctx.textAlign = "right";
  ctx.fillText("امروز", x + bandW, baseline + 18);
  // r310/r311 — سطرِ مقایسهٔ دوهفته‌ای (baseline+42): r311 جملهٔ جهتیِ خواندنی
  // به‌جای دو عددِ خام — «۱۷ بیشتر از هفتهٔ پیش» (زمردیِ ۷۰۰) / «۴ کمتر از
  // هفتهٔ پیش» (rose-۶۰۰ — توجهِ ملایم) / «هم‌پایِ هفتهٔ پیش» (سنگِ ۵۰۰)،
  // از همان weekStripSums (delta = current − prev، قدرمطلق در جمله). ترتیبِ
  // بصری: «این هفته» (لنگرِ زمردی، هم‌وزنِ گرادیان/چیپها) در راست می‌ماند و
  // جملهٔ جهتی در چپ — خوانندهٔ فارسی (راست→چپ) اولِ این هفته را میخواند
  // بعد جهت را؛ پیوستگیِ با r310 (لنگر در راست) حفظ شد.
  const sums = weekStripSums(weekPerDay);
  ctx.textAlign = "left";
  const dAbs = Math.abs(sums.delta);
  const dirTxt =
    sums.delta > 0
      ? `${faNum(dAbs)} بیشتر از هفتهٔ پیش`
      : sums.delta < 0
        ? `${faNum(dAbs)} کمتر از هفتهٔ پیش`
        : "هم‌پایِ هفتهٔ پیش";
  ctx.fillStyle =
    sums.delta > 0 ? uiColors.emerald[700] : sums.delta < 0 ? uiColors.rose[600] : uiColors.stone[500];
  ctx.font = `700 13px ${family}`;
  ctx.fillText(dirTxt, startX, baseline + 42);
  const dirW = ctx.measureText(dirTxt).width;
  ctx.fillStyle = uiColors.emerald[700];
  ctx.font = `900 13px ${family}`;
  ctx.fillText(`· این هفته: ${faNum(sums.current)} فعالیت`, startX + dirW + 6, baseline + 42);
  ctx.direction = prevDir;
}

/** r310/r311 — جمعِ دو نیمهٔ نوارِ ۱۴روزه + جهت — مقایسهٔ دوهفته‌ای از یک
 * منبعِ یگانه: نقاشِ drawWeekStrip14 و آزمون‌ها هر دو همین را میخوانند —
 * هیچ جمعِ موازیای در هیچ کارتی حساب نمیشود. delta = current − prev:
 * مثبت = رشد، منفی = افت، صفر = هم‌پا. ورودی همان weekPerDay (۱۴تایی). */
export function weekStripSums(
  weekPerDay: { total: number }[]
): { prev: number; current: number; delta: number } {
  const prev = weekPerDay.slice(0, 7).reduce((s, p) => s + p.total, 0);
  const current = weekPerDay.slice(7).reduce((s, p) => s + p.total, 0);
  return { prev, current, delta: current - prev };
}

export async function downloadWeeklyImage(opts: WeeklyImageOpts): Promise<boolean> {
  const c = await weeklyCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, "vision2-weekly.png");
}

/** r306 — همان کارت به‌صورت blob برایِ هم‌رسانیِ بومیِ share-card — بدونِ دانلود.
 * الگویِ buildDuelDoneBlob: دانلود و هم‌رسانی دو دروازهٔ یک ارزیابی‌اند. */
export async function buildWeeklyBlob(opts: WeeklyImageOpts): Promise<Blob | null> {
  const c = await weeklyCanvas(opts);
  if (!c) return null;
  return canvasToBlob(c);
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
    canvas.height = 920; // r308 — +۱۲۴px: نوارِ ۱۴روزهٔ هفته زیرِ چیپها + برچسبِ «ماه‌نامهٔ خواندن» بالایِ نوارِ ۳۰خانه‌ای
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const W = 1080;
    const H = 920;
    studyShell(ctx, W, H, family, false);

    // ---------- title ----------
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    ctx.fillText("هفته‌نامهٔ پیشرفت", W - 90, 192);

    // ---------- goal ring (روزهای هدف از ۷) ----------
    // r308 — ترتیبِ رنگ: حلقه پیش از نام/زیرعنوان کشیده میشود — کمانِ سنگِ ۱۰۰
    // رویِ متنِ تیره نمی‌نشیند (نقصِ بصریِ پیشینیِ r285؛ صفرِ تغییرِ هندسه).
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

    // ---------- r303: استریکِ کتابخوانی — زیرِ حلقهٔ هدف، راست‌چینِ همان ستون
    // بی‌سابقه مخفی (سیاستِ r302)؛ رنگِ کهربایی هم‌خانوادهٔ چیپِ کارتِ خانه
    if (opts.storiesStreak && (opts.storiesStreak.current > 0 || opts.storiesStreak.longest > 0)) {
      const ss = opts.storiesStreak;
      const line =
        ss.current > 0
          ? `زنجیرهٔ خواندن — ${faNum(ss.current)} روز${ss.longest > ss.current ? ` · رکورد: ${faNum(ss.longest)} روز` : ""}`
          : ss.longest > 1
            ? `زنجیرهٔ خواندن قطع شده · رکورد: ${faNum(ss.longest)} روز`
            : "با یک داستان، زنجیرهٔ خواندن را بساز";
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.fillStyle = uiColors.amber[600];
      ctx.font = `900 21px ${family}`;
      ctx.fillText(truncate(ctx, line, 360), W - 90, 482);
    }

    // ---------- r308/r309/r310: نوارِ ۱۴روزهٔ هفته — زیرِ چیپها، آینهٔ نوارِ DOM ----------
    // جریانِ LTRِ خودِ DOM (کهنه در چپ، امروز در راست) — از DOM کپی شده نه از
    // سلیقه. r309 — کشیدنِ نوار به drawWeekStrip14 منتقل شد (نقاشِ مشترک با
    // کارتِ رسمی — هیچ کارتی نوارِ خودش را نمیکشد)؛ هندسه و رنگها دست‌نخورده.
    // r310 — سطرِ «هفتهٔ پیش/این هفته» هم داخلِ نقاشِ واحد رفت (هر دو کارت
    // یک سطر دارند — r309 فقط هفته‌نامه داشت)؛ فراخوانیِ اینجا دوسطر ندارد.
    if (opts.weekPerDay && opts.weekPerDay.length === 14) {
      drawWeekStrip14(ctx, { weekPerDay: opts.weekPerDay, family, x: 90, y: 572, bandW: 300 });
    }

    // ---------- r305/r308: برچسبِ «ماه‌نامهٔ خواندن» + سطرِ خلاصه + نوارِ ۳۰خانه‌ای ----------
    // فقط با سابقهٔ پنجره (storiesMonth فقط وقتی empty=false فرستاده میشود)؛
    // r308 — برچسبِ کوچکِ سربرگ (آینهٔ نامِ خانواده در aria و CSV) بالایِ سطرِ
    // خلاصه نشست و هر سه با هم به زیرِ نوارِ هفته رفتند — گروهِ ماه‌نامه حالا
    // یک بلوکِ کامل است: نام → عدد → خانهها.
    if (opts.storiesMonth && opts.storiesMonth.total > 0) {
      const sm = opts.storiesMonth;
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.fillStyle = uiColors.stone[600];
      ctx.font = `800 15px ${family}`;
      ctx.fillText("ماه‌نامهٔ خواندن", W - 90, 614);
      const line =
        `ماهِ گذشته: ${faNum(sm.total)} داستان در ${faNum(sm.activeDays)} روز` +
        (sm.bestCount > 1 ? ` · پرکارترین: ${faNum(sm.bestCount)} داستان` : "");
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.fillText(truncate(ctx, line, 560), W - 90, 638);
    }
    // ---------- r307: نوارِ ۳۰خانه‌ایِ ماه‌نامه — آینهٔ نوارِ DOMِ r304 ----------
    // جریانِ زمانِ RTL: کهنه‌ترین خانه در راست، امروز در چپ با حلقهٔ کهربایی؛
    // همان رنگ‌هایِ سطحیِ DOM (۳=کهربا۶۰۰، ۲=کهربا۴۰۰، ۱=کهربا۲۰۰، خالی=سنگ۲۰۰)
    if (opts.storiesMonth && opts.storiesMonthPerDay && opts.storiesMonthPerDay.length === 30) {
      const x0 = 70;
      const bandW = W - 140;
      const gap = 2;
      const cellH = 10;
      const cellW = Math.floor((bandW - 29 * gap) / 30); // ۲۹px — باقیمانده وسطِ نوار
      const totalCellsW = 30 * cellW + 29 * gap;
      const startX = x0 + Math.floor((bandW - totalCellsW) / 2);
      const yStrip = 654;
      for (let i = 0; i < 30; i++) {
        // RTL: کهنه در راست — خانهٔ iام (کهنه→امروز) از راستِ نوار می‌شماریم
        const cx2 = startX + totalCellsW - (i + 1) * cellW - i * gap;
        const count = opts.storiesMonthPerDay[i] ?? 0;
        ctx.fillStyle =
          count >= 3 ? uiColors.amber[600] : count === 2 ? uiColors.amber[400] : count === 1 ? uiColors.amber[200] : uiColors.stone[200];
        roundRect(ctx, cx2, yStrip, cellW, cellH, 2);
        ctx.fill();
        if (i === 29) {
          // امروز — حلقهٔ کهرباییِ تیره (هم‌قراردادِ ring-amber-700 در DOM)
          ctx.strokeStyle = uiColors.amber[700];
          ctx.lineWidth = 1.5;
          roundRect(ctx, cx2 - 0.75, yStrip - 0.75, cellW + 1.5, cellH + 1.5, 2.5);
          ctx.stroke();
        }
      }
    }

    // ---------- activity chips (خانواده‌های واقعیِ DayStat) ----------
    // r298 — چیپِ ششمِ «داستان» فقط با کتاب‌خانهٔ فعال می‌آید؛ با ۶ چیپ،
    // ستون از y=190 شروع میشود و r308 نوارِ ۱۴روزه (y=528..590) دقیقا
    // زیرِ پایانهٔ چیپها (~۵۰۶) می‌نشیند — ستونِ فعالیت یک‌پارچه ماند.
    const chips: { label: string; value: number }[] = [
      { label: "مرور", value: opts.reviews },
      { label: "آزمون", value: opts.quizzes },
      { label: "واژهٔ نو", value: opts.words },
      { label: "دیکته", value: opts.dictation },
      { label: "برق‌آسا", value: opts.rush },
      ...(typeof opts.storiesWeek === "number"
        ? [{ label: "داستان", value: opts.storiesWeek }]
        : []),
    ];
    let chy = chips.length > 5 ? 190 : 246;
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
    // r308 — مرکزِ کارت ۱۲۴px پایین رفت (۵۶۰→۶۸۴) با دو لایهٔ تازه: نوارِ
    // ۱۴روزه زیرِ چیپها و گروهِ برچسب+سطر+نوارِ ماه‌نامه
    if (opts.duelLine) {
      ctx.fillStyle = uiColors.fuchsia[700];
      ctx.fillText(truncate(ctx, opts.duelLine, 640), W / 2, 684);
    } else if (opts.bestDay && opts.bestDay.total > 0) {
      ctx.fillStyle = uiColors.stone[500];
      ctx.fillText(
        `پرجانب‌ترین روز: ${opts.bestDay.label} — ${faNum(opts.bestDay.total)} فعالیت`,
        W / 2,
        684
      );
    }

    // ---------- r285: نوارِ نشانها — «تا کجا رسیده‌ام؟» در کارتِ هم‌رسانی هم ----------
    // r286: کشیدنِ باند به drawBadgeBand منتقل شد — کارتِ رسمی هم از همان
    // نقاش میخواند؛ هیچ کارتی باندِ خودش را نمیکشد.
    drawBadgeBand(ctx, { badges: opts.badges, family, x: 70, y: 700, w: W - 140 });

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

// ---------------- کارتِ کارنامهٔ رسمی (r286 — عکسِ هم‌رسانیِ «کلِ مسیر») ----------------
// داستانِ کاغذ (چاپ/PDF) مالِ مودالِ رسمی است؛ این کارت همان داستان را سبک
// میبرد: KPIهایِ همان کارنامه + نوارِ نشانها (drawBadgeBandِ مشترک) —
// برایِ والس/تلگرام که عکس میفهمند نه PDF.

export interface OfficialImageOpts {
  userName?: string;
  /** واژگان آموخته‌شده — همان KPIِ کارنامه (knownCount) */
  knownCount: number;
  /** مخرجِ همان کسرِ DOM — از TOTAL_VOCABULARY */
  totalVocabulary: number;
  /** میانگین نمرات — ۰ وقتی نتیجهای نیست (صادق) */
  avgPercent: number;
  /** فعالیت ۳۰ روز اخیر */
  monthTotal: number;
  /** بهترین زنجیرهٔ فعالیت */
  bestStreak: number;
  /** زنجیرهٔ فعلی — فقط با عددِ مثبت نمایش میآید */
  streak: number;
  /** کدِ یادگیرنده — ۸ نویسهٔ اولِ userId مثلِ DOM */
  learnerCode?: string;
  /** r306 — سطرِ ماه‌نامهٔ خواندن روی کارتِ رسمی (همان قراردادِ weekly).
   * فقط با سابقهٔ پنجره فرستاده میشود (empty=false — سیاستِ بوم‌محور)؛
   * بینِ خطِ زنجیره (۳۵۶) و ردیفِ KPI (۴۲۰) می‌نشیند — بدونِ جابجاییِ هندسه. */
  storiesMonth?: { total: number; activeDays: number; bestCount: number };
  /** r309 — نوارِ ۱۴روزهٔ فعالیت زیرِ ردیفِ KPI (همان قراردادِ weekly —
   * نقاشِ مشترکِ drawWeekStrip14). از همان lastNDaysِ کارنامه تغذیه میشود
   * (reviews+quizzes = همان حسابِ KPIِ «فعالیت ۳۰ روز اخیر»)؛ همیشه ۱۴تایی
   * با فعالیتِ صفرِ صادق. ارتفاعِ کارت +۹۲px — گپِ زیرِ KPIها سنجیده شد. */
  weekPerDay?: { total: number; inThisWeek: boolean }[];
  /** r285/286 — نشانهای بازِ همان ارزیابیِ واحد (الزامی — الگویِ هفته‌نامه؛
   * سرشماریِ زمان-کامپایل مجریِ تغذیه است) */
  badges: { title: string; tier: BadgeTier }[];
}

export async function downloadOfficialImage(opts: OfficialImageOpts): Promise<boolean> {
  const c = await officialCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, "vision2-official.png");
}

/** r307 — همان کارت به‌صورت blob برایِ هم‌رسانیِ بومی — الگویِ buildWeeklyBlobِ r306:
 * دانلود و هم‌رسانی دو دروازهٔ یک ارزیابی‌اند؛ بدونِ دانلود. */
export async function buildOfficialBlob(opts: OfficialImageOpts): Promise<Blob | null> {
  const c = await officialCanvas(opts);
  if (!c) return null;
  return canvasToBlob(c);
}

async function officialCanvas(opts: OfficialImageOpts): Promise<HTMLCanvasElement | null> {
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
    canvas.height = 854; // r310 — +۲۲px دیگر: سطرِ مقایسهٔ دوهفته‌ایِ نقاشِ واحد
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const W = 1080;
    const H = 854;
    studyShell(ctx, W, H, family, false);

    // ---------- title + letterhead ----------
    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    ctx.fillText("گزارش پیشرفت درسی", W - 90, 192);
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 16px ${family}`;
    ctx.fillText(
      truncate(ctx, "وب‌کتاب آموزشی ویژن ۲ — زبان انگلیسی ۲ (پایهٔ یازدهم)", 640),
      W - 90,
      228
    );

    // ---------- learner ----------
    if (opts.userName) {
      ctx.fillStyle = uiColors.stone[900];
      ctx.font = `800 32px ${family}`;
      ctx.fillText(truncate(ctx, opts.userName, 280), W - 90, 285);
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 18px ${family}`;
      ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 318);
    } else {
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 20px ${family}`;
      ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 285);
    }
    if (opts.learnerCode) {
      // دو بخشیِ تمیز: برچسبِ RTL و کدِ LTR جدا کشیده میشوند — میکسِ bidi در
      // یک رشته، مرزِ جهت را با خطِ تیرهٔ مصنوعی نشان میداد (QAِ بصریِ r286).
      ctx.direction = "rtl";
      ctx.textAlign = "left";
      ctx.fillStyle = uiColors.stone[400];
      ctx.font = `700 16px ${family}`;
      ctx.fillText("کد یادگیرنده:", 90, 318);
      const lblW = ctx.measureText("کد یادگیرنده:").width;
      ctx.direction = "ltr";
      ctx.fillText(opts.learnerCode, 90 + lblW + 8, 318);
    }
    if (opts.streak > 0) {
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.fillStyle = uiColors.emerald[600];
      ctx.font = `900 22px ${family}`;
      ctx.fillText(`زنجیرهٔ فعلی ${faNum(opts.streak)} روزه`, W - 90, 356);
    }

    // ---------- r306: سطرِ ماه‌نامهٔ خواندن — بینِ زنجیره و ردیفِ KPI،
    // همان سبکِ کارتِ هفته‌نامه (سنگِ ۵۰۰ · وزنِ ۷۰۰) — هندسه دست‌نخورده
    if (opts.storiesMonth && opts.storiesMonth.total > 0) {
      const sm = opts.storiesMonth;
      const line =
        `ماهِ گذشته: ${faNum(sm.total)} داستان در ${faNum(sm.activeDays)} روز` +
        (sm.bestCount > 1 ? ` · پرکارترین: ${faNum(sm.bestCount)} داستان` : "");
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 17px ${family}`;
      ctx.fillText(truncate(ctx, line, 560), W - 90, 392);
    }

    // ---------- KPI row (همان ۴ KPIِ کارنامهٔ رسمی — همان برچسبها) ----------
    const kpis: { label: string; value: string }[] = [
      { label: "واژگان آموخته‌شده", value: `${faNum(opts.knownCount)} / ${faNum(opts.totalVocabulary)}` },
      { label: "میانگین نمرات", value: `${faNum(opts.avgPercent)}٪` },
      { label: "فعالیت ۳۰ روز اخیر", value: faNum(opts.monthTotal) },
      { label: "بهترین زنجیرهٔ فعالیت", value: `${faNum(opts.bestStreak)} روز` },
    ];
    let kx = W - 90 - 210; // RTL — نخستین KPI از راست
    for (const k of kpis) {
      ctx.fillStyle = uiColors.stone[100];
      roundRect(ctx, kx, 420, 210, 84, 14);
      ctx.fill();
      ctx.fillStyle = uiColors.stone[900];
      ctx.font = `900 24px ${family}`;
      ctx.textAlign = "center";
      ctx.fillText(k.value, kx + 105, 456);
      ctx.fillStyle = uiColors.stone[500];
      ctx.font = `700 14px ${family}`;
      ctx.fillText(k.label, kx + 105, 488);
      kx -= 230;
    }

    // ---------- r309/r310: نوارِ ۱۴روزهٔ فعالیت — زیرِ KPIها، هم‌قراردادِ هفته‌نامه ----------
    // گپِ زیرِ KPIها (پایانِ جعبهها ۵۰۴ تا باندِ نشانها ۵۲۴) فقط ۲۰px بود —
    // کارت +۹۲px بلند شد: نوار (baseline ۵۷۶، پهنایِ تمام-عرضِ ۹۴۰ مثلِ باند
    // نشانها) + برچسبها (۵۹۴)؛ باندِ نشانها ۵۲۴→۶۱۶ رفت (+۹۲ — همان
    // انضباطِ جابجاییِ r305: هندسهٔ ثابت ترجمه میشود، نه تاب برمی‌دارد).
    // r310 — سطرِ مقایسهٔ دوهفته‌ایِ نقاش (baseline+42=618) هم آمد — باندِ
    // نشانها یک ترجمهٔ دیگر برد: ۶۱۶→۶۳۸ (+۲۲) و کارت ۸۳۲→۸۵۴.
    if (opts.weekPerDay && opts.weekPerDay.length === 14) {
      drawWeekStrip14(ctx, { weekPerDay: opts.weekPerDay, family, x: 70, y: 576, bandW: W - 140 });
    }

    // ---------- badge band (نقاشِ مشترکِ خانواده — r286) ----------
    drawBadgeBand(ctx, { badges: opts.badges, family, x: 70, y: 638, w: W - 140 });

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
    ctx.fillText(`گزارش رسمی · ${faDate()}`, W - 90, H - 74);
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillStyle = uiColors.emerald[600];
    ctx.font = `900 20px ${family}`;
    const tag =
      opts.avgPercent >= 85 ? "EXCELLENT RECORD ★" : opts.avgPercent >= 70 ? "STRONG RECORD" : opts.avgPercent >= 50 ? "GOOD PROGRESS" : "KEEP GOING!";
    ctx.fillText(tag, 90, H - 74);

    return ctx.canvas;
  } catch {
    return null;
  }
}
