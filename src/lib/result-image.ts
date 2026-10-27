"use client";

// ------------------------------------------------------------------
// Result image — render a shareable result card on a <canvas> and
// download it as PNG. Persian text is drawn natively by the browser's
// canvas text renderer (bidi + shaping), fonts come from the page.
// ------------------------------------------------------------------

import { faNum } from "./study-theme";
import { weekGoalMeta, WEEK_GOAL_DAYS } from "./week-goal"; // Task 134/136 — قراردادِ حلقهٔ هدف (r457 بازسازی)
import { BADGES, DUEL_BADGE_IDS, type BadgeTier } from "./achievements";
import type { DuelLedgerStats } from "./duel-history";
import type { TeacherReview } from "./exam-teacher";
import type { WeekTeacherStats } from "./week-teacher";
import { storySegments, type StoryWord } from "./story-forge";
import { uiColors } from "./ui-colors";
import { toast } from "@/hooks/use-toast";

// r397 — the image-build failure pair gets ONE name. Since r342 the
// failure toast (title «خطا در ساخت تصویر» + description «لطفاً دوباره
// تلاش کن.» + 3000ms) was byte-identical across FIVE download gates
// (quiz-result / weekly-report / official-report / duel-setup /
// duel-done) and held equal only by source locks — the exact situation
// r394 cured for the TTS family (speakFailToast). Borrowing is a
// choice, not a side effect — documented no-verdicts (the r386 lesson):
//  · the two duel rush views keep their compact bare dialect
//    («دانلود تصویر ناموفق بود», no description — in-battle views);
//  · all seven success toasts stay per-context dialects (each gate
//    celebrates in its own words).
// Fires no analytics on the failure path (the r344 rule): the *_image
// events belong to the gates themselves, gated on the real build
// (ok / blob — the r287/288 contract; official's download gate healed
// in r397 from a pre-build fire to the gated form).
export function imageFailToast(): void {
  toast({
    title: "خطا در ساخت تصویر",
    description: "لطفاً دوباره تلاش کن.",
    duration: 3000,
  });
}

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

  // r387 — این قالبِ بوم، گویشِ مستندِ خودش است (r288: پارامترِ total برای
  // باندِ خانوادهٔ نبردی) و به badgeFractionFa وام نمیگیرد — حکمِ مالک در
  // achievements.ts: قالبهایِ دیگرِ «faNum(x) از faNum(y)» عمدی دامنهایاند.
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
  // r312 — فلشِ جهتیِ پیش از جمله: مثلثِ کوچک با مسیرِ دستیِ canvas — رو به
  // بالا = رشد (زمردیِ ۷۰۰، هم‌رنگِ جمله) / رو به پایین = افت (rose-۶۰۰) /
  // هم‌پا = بی‌فلش (جهتِ صفر نشان ندارد — صادقِ سهحالته). عمداً نویسهٔ
  // گلیفیِ فلش از فونت نمیآید: پوششِ گلیفِ فلشهایِ هندسی در فونتِ کارت رویِ
  // هر دستگاهی تضمین نیست و جایگزینیِ فونت، شکلِ فلش را خراب میکند؛ مسیرِ
  // دستیِ نقاطی رویِ هر رندرکنندهای عینِ همان مثلث است. هندسه: پهنای ۱۰،
  // بلندی ۹، مرکزِ عمودیِ cy = baseline+37 هم‌مرکزِ باندِ بصریِ متنِ ۱۳px
  // (کپهٔ ~۳۲.۵..۴۲)؛ جمله ۱۵px به راست میرود و لنگرِ «· این هفته» هم
  // هم‌فاصله دنبالش — در حالتِ بی‌فلش هندسه دقیقاً r311 میماند.
  const ARROW_W = 10;
  const ARROW_GAP = 5;
  const arrowShift = sums.delta === 0 ? 0 : ARROW_W + ARROW_GAP;
  if (sums.delta !== 0) {
    const cx = startX + ARROW_W / 2;
    const cy = baseline + 37;
    ctx.beginPath();
    if (sums.delta > 0) {
      ctx.moveTo(cx, cy - 5); // رأس در بالا — رشد
      ctx.lineTo(cx + 5, cy + 4);
      ctx.lineTo(cx - 5, cy + 4);
    } else {
      ctx.moveTo(cx, cy + 5); // رأس در پایین — افت
      ctx.lineTo(cx + 5, cy - 4);
      ctx.lineTo(cx - 5, cy - 4);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillText(dirTxt, startX + arrowShift, baseline + 42);
  const dirW = ctx.measureText(dirTxt).width;
  ctx.fillStyle = uiColors.emerald[700];
  ctx.font = `900 13px ${family}`;
  ctx.fillText(
    `· این هفته: ${faNum(sums.current)} فعالیت`,
    startX + arrowShift + dirW + 6,
    baseline + 42
  );
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
    // Task 134 — حلقه/درصد/برچسب/نشان از قراردادِ weekGoalMeta — ریاضیِ محلیِ clampنشده ممنوع
    const meta = weekGoalMeta(opts.goalDays);

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
    const pct = meta.pct / 100;
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
    // r388 — گویشِ بوم میماند (سابقهٔ r288): قدمِ نرخ→درصدِ اینجا زیرِ
    // پارامترهایِ خودِ تصویرِ اشتراکی است (pct از goalDays/7 بوم ساخته میشود)
    // و percentFromRate/percentFa قرض نمیگیرد — حکمِ سرشماریِ r388 در
    // domain/percent این استثنا را ثبت کرده تا گریپِ آینده حکم ببیند نه سهو.
    ctx.fillText(`${faNum(Math.round(pct * 100))}٪`, cx, cy - 10);
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 21px ${family}`;
    ctx.fillText(meta.label, cx, cy + 38);
    if (meta.badge) {
      ctx.fillStyle = "#059669"; // emerald-600 — همان توکنِ نشانِ UI
      ctx.font = `900 24px ${family}`;
      ctx.fillText(meta.badge, cx, cy + 70);
    }

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

// ---------------- کارتِ تقویمِ هفتهٔ پیشِ رو (r423 — عکسِ نوارِ r422) ----------------
// پیشنهادِ ①ِ r421/r422: روایتِ هفت خانهٔ پیشِ رو رویِ کاغذِ همرسانی —
// خانوادهٔ عکسِ r297 (پوستهٔ سبزِ studyShell) با زبانِ بصریِ نوارِ r422:
// امروزِ زمردی (دعوتِ کنش — r414)، آیندهٔ آسمانی (خبرِ برنامهای — r417)،
// روزهایِ بیبازگشتِ ساکتِ صادق (r236). خانهها از تکمنبعِ
// buildDrillWeekCalendarCells میآیند — بوم هیچ شمارشی ندارد؛ اینجا
// فقط رنگ میگیرد.

export interface WeekCalendarCell {
  label: string;
  count: number;
  family: "today" | "future";
}

export interface WeekCalendarImageOpts {
  /** هفت خانهٔ k=۰..۶ — خروجیِ buildDrillWeekCalendarCells در نما */
  cells: WeekCalendarCell[];
  itemCount: number;
  dayCount: number;
  afterCount: number;
  /** نزدیکترین بازگشتِ پسِ هفته («فردا» / «X روزِ دیگر») — گویشِ r417 */
  afterLabel?: string;
}

async function weekCalendarCanvas(opts: WeekCalendarImageOpts): Promise<HTMLCanvasElement | null> {
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    if (typeof document === "undefined") return null;
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    const W = 1080;
    const H = 520;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    studyShell(ctx, W, H, family, false);

    ctx.direction = "rtl";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";

    // ---------- title + subtitle ----------
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 34px ${family}`;
    ctx.fillText("تقویمِ هفتهٔ پیشِ رو", W - 90, 188);
    ctx.fillStyle = uiColors.emerald[700];
    ctx.font = `900 22px ${family}`;
    ctx.fillText(
      `${faNum(opts.itemCount)} موردِ بازگشت در ${faNum(opts.dayCount)} روز`,
      W - 90,
      228
    );

    // ---------- seven day cells — RTL: امروز راستترین (عینِ نوارِ نما) ----------
    const margin = 90;
    const gap = 12;
    const cellW = (W - margin * 2 - gap * 6) / 7;
    const cellH = 150;
    const y0 = 274;
    const cells = opts.cells.slice(0, 7);
    cells.forEach((c, i) => {
      const x = W - margin - cellW - i * (cellW + gap);
      const live = c.count > 0;
      const today = c.family === "today";
      // رنگ از خانوادهٔ نوار: زمردیِ r414 / آسمانیِ r417 / سکوتِ سنگیِ r236
      const bg = live ? (today ? uiColors.emerald[50] : uiColors.sky[50]) : null;
      const ink = live ? (today ? uiColors.emerald[700] : uiColors.sky[700]) : uiColors.stone[300];
      if (bg) {
        ctx.fillStyle = bg;
        roundRect(ctx, x, y0, cellW, cellH, 16);
        ctx.fill();
      }
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.font = `700 17px ${family}`;
      ctx.fillText(c.label, x + cellW / 2, y0 + 34);
      ctx.font = `900 44px ${family}`;
      ctx.fillText(live ? faNum(c.count) : "—", x + cellW / 2, y0 + 92);
      ctx.textAlign = "right";
    });

    // ---------- دنبالهٔ پس از هفته — همان گویشِ نوار + نزدیکترینِ r417 ----------
    const tailY = y0 + cellH + 44;
    ctx.fillStyle = uiColors.stone[500];
    ctx.font = `700 18px ${family}`;
    const tail = opts.afterCount > 0 ? `+${faNum(opts.afterCount)} پس از هفته` : "";
    const tailSuffix =
      opts.afterCount > 0 && opts.afterLabel ? ` — نزدیکترین بازگشت: ${opts.afterLabel}` : "";
    if (tail) ctx.fillText(tail + tailSuffix, W - 90, tailY);

    // ---------- امضایِ پایینِ کارت ----------
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 16px ${family}`;
    ctx.fillText("برنامهٔ مرورِ فاصلهدار — وب‌کتاب «ویژن ۲»", W - 90, H - 64);

    return ctx.canvas;
  } catch {
    return null;
  }
}

export async function downloadWeekCalendarImage(opts: WeekCalendarImageOpts): Promise<boolean> {
  const c = await weekCalendarCanvas(opts);
  if (!c) return false;
  return downloadCanvasBlob(c, "vision2-review-week.png");
}

/** r424 — همان کارت به‌صورت blob برایِ هم‌رسانیِ بومی — الگویِ buildWeeklyBlobِ
 * r306/buildOfficialBlobِ r307: دانلود و هم‌رسانی دو دروازهٔ یک ارزیابی‌اند؛
 * اینجا بدونِ دانلود — بومِ r423، صفر رنگِ تازه، صفر SRSِ تازه. */
export async function buildWeekCalendarBlob(opts: WeekCalendarImageOpts): Promise<Blob | null> {
  const c = await weekCalendarCanvas(opts);
  if (!c) return null;
  return canvasToBlob(c);
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

// ==================================================================
// Task 118/120 — خانوادهٔ «کارتِ داوری/داستان» + قراردادهایِ خالصِ
// شکستنِ سطر. دو تابعِ خالص (wrapCanvasLines / wrapStoryWords) با
// measureِ تزریقی deterministic‌اند (تست = طولِ رشته) و بومِ واقعی
// measureText را تزریق میکند. هیچ console/throw — ورودیِ خراب صادقانه
// تهی برمی‌گردد.
// ==================================================================

/**
 * Task 118 — شکستنِ حریصِ سطر برایِ متنِ فارسی/لاتینِ بوم:
 *  ① پرکردنِ حریص با measureِ تزریقی (فاصلهٔ پیوند = ۱ واحد)
 *  ② سقفِ maxLines؛ سطرِ آخرِ نگهشده در صورتِ افتِ واقعی با «…» بسته میشود
 *  ③ واژهٔ پهن‌تر از کلِ سطر حرفبهحرف بریده میشود
 *  ④ جایِ دقیق هیچ «…» قلابی نمی‌گیرد
 *  ⑤ ورودیِ تهی/بودجهٔ منفی → آرایهٔ تهیِ صادق
 */
export function wrapCanvasLines(
  text: string,
  maxW: number,
  measure: (s: string) => number,
  maxLines: number
): string[] {
  if (typeof text !== "string" || text.trim() === "" || !(maxW > 0) || !(maxLines > 0)) return [];
  const words = text.split(/\s+/).filter(Boolean);
  const atomic: string[] = [];
  for (const w of words) {
    if (measure(w) <= maxW) {
      atomic.push(w);
      continue;
    }
    for (let i = 0; i < w.length; i += maxW) atomic.push(w.slice(i, i + maxW));
  }
  const lines: string[][] = [];
  let cur: string[] = [];
  for (const w of atomic) {
    if (cur.length === 0) {
      cur = [w];
      continue;
    }
    // قراردادِ Task 118: measure همیشه «سطرِ کاندید» را میبیند — نه
    // حسابِ عرضیِ تفکیکی (تستِ تماسِ measure همین را قفل میکند)
    const cand = [...cur, w].join(" ");
    if (measure(cand) <= maxW) {
      cur.push(w);
    } else {
      lines.push(cur);
      cur = [w];
    }
  }
  if (cur.length > 0) lines.push(cur);
  if (lines.length <= maxLines) return lines.map((l) => l.join(" "));
  const kept = lines.slice(0, maxLines).map((l) => l.join(" "));
  kept[maxLines - 1] = kept[maxLines - 1] + "…";
  return kept;
}

/** توکنِ داستان — متن + پرچمِ برجسته (canvas twin of <mark>) */
export interface StoryCardWord {
  text: string;
  hit: boolean;
}

/**
 * Task 120 — واژه‌سازیِ داستان از قطعه‌هایِ segmenter: هر توکن پرچمِ
 * قطعهٔ خودش را به ارث میبرد (تطبیقِ بی‌حساسیتِ حروف، علائمِ سنجاقشده
 * همیشه ساده میمانند)؛ ورودیِ آشغال صادقانه تهی.
 */
export function storyCardWords(
  segments: { text?: unknown; hit?: unknown }[] | null | undefined
): StoryCardWord[] {
  if (!Array.isArray(segments)) return [];
  const out: StoryCardWord[] = [];
  for (const seg of segments) {
    if (!seg || typeof seg.text !== "string") continue;
    const raw = seg.text;
    if (raw.trim() === "") continue;
    const hitWord = typeof seg.hit === "string" ? seg.hit.toLowerCase() : null;
    for (const tok of raw.split(/\s+/).filter(Boolean)) {
      const clean = tok.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
      out.push({ text: tok, hit: hitWord != null && clean !== "" && clean === hitWord });
    }
  }
  return out;
}

/**
 * Task 120 — شکستنِ حریصِ توکن‌دارِ داستان (نسبت به wrapCanvasLines
 * تفاوتِ دوگانه دارد: سطرها آرایهٔ توکن میمانند تا هایلایتِ واژهای
 * ممکن شود و «…» ندارد — افتِ واقعی فقط با dropped صادق میگوید).
 */
export function wrapStoryWords(
  words: StoryCardWord[] | null | undefined,
  maxW: number,
  measure: (s: string) => number,
  maxLines: number
): { lines: StoryCardWord[][]; dropped: boolean } {
  if (!Array.isArray(words) || words.length === 0) return { lines: [], dropped: false };
  if (!(maxW > 0) || !(maxLines > 0)) return { lines: [], dropped: true };
  const atomic: StoryCardWord[] = [];
  for (const w of words) {
    if (!w || typeof w.text !== "string") continue;
    if (measure(w.text) <= maxW) {
      atomic.push({ text: w.text, hit: !!w.hit });
      continue;
    }
    for (let i = 0; i < w.text.length; i += maxW) {
      atomic.push({ text: w.text.slice(i, i + maxW), hit: !!w.hit });
    }
  }
  const lines: StoryCardWord[][] = [];
  let cur: StoryCardWord[] = [];
  for (const w of atomic) {
    if (cur.length === 0) {
      cur = [w];
      continue;
    }
    // همان قراردادِ measure-سطركاندیدِ Task 118 (خانوادهٔ واحد)
    const cand = [...cur, w].map((t) => t.text).join(" ");
    if (measure(cand) <= maxW) {
      cur.push(w);
    } else {
      lines.push(cur);
      cur = [w];
    }
  }
  if (cur.length > 0) lines.push(cur);
  const dropped = lines.length > maxLines;
  return { lines: lines.slice(0, maxLines), dropped };
}

// ------------------------------------------------------------------
// گزینه‌هایِ سه کارت — قراردادِ مصرف‌کننده‌ها (my-words-story /
// quiz-teacher / week-teacher) بایت‌بهبایت همان اشیاء را میفرستند.
// ------------------------------------------------------------------

export interface TeacherCardOpts {
  review: TeacherReview;
  correct: number;
  total: number;
  percent: number;
  userName?: string;
  source?: string;
}

export interface WeekCardOpts {
  review: TeacherReview;
  stats: WeekTeacherStats;
  userName?: string;
  source?: string;
}

export interface StoryCardOpts {
  story: string;
  summary: string;
  words: StoryWord[];
  userName?: string;
  source?: string;
}

/** برچسبِ صادقِ منبعِ داوری روی بوم — آینهٔ چیپِ DOM */
function sourceLabel(source?: string): string {
  return source === "ai" ? "داوریِ هوش مصنوعی" : "داوریِ قاعده‌محور";
}

/** سرلوحهٔ مشترک سه کارت — پوسته + عنوان + نام یادگیرنده (ایدئومِ weekly) */
async function reviewCardShell(
  title: string,
  userName: string | undefined,
  h: number
): Promise<{ ctx: CanvasRenderingContext2D; family: string; W: number } | null> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  if (typeof document === "undefined") return null;
  const family =
    typeof document !== "undefined"
      ? getComputedStyle(document.body).fontFamily || "sans-serif"
      : "sans-serif";
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const W = 1080;
  studyShell(ctx, W, h, family, false);
  ctx.direction = "rtl";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.stone[900];
  ctx.font = `800 34px ${family}`;
  ctx.fillText(title, W - 90, 192);
  if (userName) {
    ctx.fillStyle = uiColors.stone[900];
    ctx.font = `800 32px ${family}`;
    ctx.fillText(truncate(ctx, userName, 280), W - 90, 275);
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 18px ${family}`;
    ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 310);
  } else {
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 20px ${family}`;
    ctx.fillText("یادگیرندهٔ وب‌کتاب", W - 90, 275);
  }
  return { ctx, family, W };
}

/** پانویسِ مشترک — منبعِ داوری + تاریخِ فارسی + برند */
function reviewCardFooter(
  ctx: CanvasRenderingContext2D,
  family: string,
  W: number,
  H: number,
  source?: string
): void {
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.stone[400];
  ctx.font = `700 17px ${family}`;
  ctx.fillText(`${sourceLabel(source)} · ${faDate()}`, W - 90, H - 60);
  ctx.textAlign = "left";
  ctx.fillText("وب‌کتاب ویژن ۲", 90, H - 60);
}

/** سه بلوکِ داوری (مقدمه/نقطهٔ قوت/پندها) — هرکدام تا ۳ سطرِ صادق */
function drawReviewBlocks(
  ctx: CanvasRenderingContext2D,
  family: string,
  W: number,
  review: TeacherReview,
  top: number
): void {
  const blocks: { label: string; text: string; color: string }[] = [
    { label: "مقدمه", text: review.intro, color: uiColors.stone[800] },
    { label: "نقطهٔ قوت", text: review.strength, color: uiColors.emerald[700] },
    { label: "پندها", text: review.advice, color: uiColors.amber[700] },
  ];
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  let y = top;
  for (const b of blocks) {
    ctx.fillStyle = uiColors.stone[400];
    ctx.font = `700 19px ${family}`;
    ctx.fillText(b.label, W - 90, y);
    y += 40;
    ctx.fillStyle = b.color;
    ctx.font = `700 24px ${family}`;
    const lines = wrapCanvasLines(b.text, W - 200, (s) => ctx.measureText(s).width, 3);
    for (const line of lines) {
      ctx.fillText(line, W - 110, y);
      y += 38;
    }
    y += 26;
  }
}

/** بومِ کارتِ نظرِ معلم (یک جلسه) — Task 118 */
async function teacherCardCanvas(opts: TeacherCardOpts): Promise<HTMLCanvasElement | null> {
  const shell = await reviewCardShell("نظرِ معلم", opts.userName, 820);
  if (!shell) return null;
  const { ctx, family, W } = shell;
  // حلقهٔ درصد — ایدئومِ weekly (درصدِ همین جلسه)
  const cx = W - 90 - 105;
  const cy = 455;
  const r = 105;
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.strokeStyle = uiColors.stone[100];
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const pct = Math.max(0, Math.min(100, opts.percent)) / 100;
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, uiColors.emerald[500]);
  ring.addColorStop(1, uiColors.teal[600]);
  ctx.strokeStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = uiColors.stone[900];
  ctx.font = `900 52px ${family}`;
  ctx.fillText(`${faNum(Math.round(opts.percent))}٪`, cx, cy - 10);
  ctx.fillStyle = uiColors.stone[500];
  ctx.font = `700 21px ${family}`;
  ctx.fillText(`${faNum(opts.correct)} از ${faNum(opts.total)} درست`, cx, cy + 38);
  drawReviewBlocks(ctx, family, W, opts.review, 520);
  reviewCardFooter(ctx, family, W, 820, opts.source);
  return ctx.canvas;
}

export async function downloadTeacherCardImage(opts: TeacherCardOpts): Promise<boolean> {
  try {
    const c = await teacherCardCanvas(opts);
    if (!c) return false;
    return await downloadCanvasBlob(c, "vision2-teacher.png");
  } catch {
    return false;
  }
}

export async function buildTeacherCardBlob(opts: TeacherCardOpts): Promise<Blob | null> {
  try {
    const c = await teacherCardCanvas(opts);
    if (!c) return null;
    return await canvasToBlob(c);
  } catch {
    return null;
  }
}

/** بومِ کارتِ معلمِ هفته — داوریِ هفته + خطِ آمارِ صادق (Task 119) */
async function weekCardCanvas(opts: WeekCardOpts): Promise<HTMLCanvasElement | null> {
  const shell = await reviewCardShell("داوریِ معلمِ هفته", opts.userName, 840);
  if (!shell) return null;
  const { ctx, family, W } = shell;
  const s = opts.stats;
  // Task 136 — چهارمین لایهٔ مصرفیِ badgeِ ۱۳۲: درصد/برچسب از weekGoalMeta
  const meta = weekGoalMeta(opts.stats.goalDays);
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.stone[800];
  ctx.font = `800 26px ${family}`;
  const trend =
    s.activities >= s.prevActivities
      ? "رو به رشد"
      : "آرام‌تر از هفتهٔ پیش";
  const line = `${faNum(s.activities)} فعالیت این هفته · ${faNum(s.activeDays)} روز فعال · هدفِ ${faNum(WEEK_GOAL_DAYS - meta.remaining)} از ۷ روز · ${trend}`;
  const statLines = wrapCanvasLines(line, W - 200, (x) => ctx.measureText(x).width, 2);
  let y = 420;
  for (const l of statLines) {
    ctx.fillText(l, W - 110, y);
    y += 42;
  }
  if (meta.badge) {
    ctx.fillStyle = "#059669"; // emerald-600 — همان توکنِ نشانِ UI
    ctx.font = `900 24px ${family}`;
    const cx = W - 110;
    const cy = y + 4;
    ctx.fillText(meta.badge, cx, cy + 70);
  }
  drawReviewBlocks(ctx, family, W, opts.review, Math.max(y + 14, 520));
  reviewCardFooter(ctx, family, W, 840, opts.source);
  return ctx.canvas;
}

export async function downloadWeekCardImage(opts: WeekCardOpts): Promise<boolean> {
  try {
    const c = await weekCardCanvas(opts);
    if (!c) return false;
    return await downloadCanvasBlob(c, "vision2-week-teacher.png");
  } catch {
    return false;
  }
}

export async function buildWeekCardBlob(opts: WeekCardOpts): Promise<Blob | null> {
  try {
    const c = await weekCardCanvas(opts);
    if (!c) return null;
    return await canvasToBlob(c);
  } catch {
    return null;
  }
}

/** بومِ کارتِ داستان — متنِ انگلیسی با هایلایتِ کهرباییِ واژه‌هایِ نشان (Task 120) */
async function storyCardCanvas(opts: StoryCardOpts): Promise<HTMLCanvasElement | null> {
  const shell = await reviewCardShell("داستانِ واژه‌های من", opts.userName, 900);
  if (!shell) return null;
  const { ctx, family, W } = shell;
  const tokens = storyCardWords(
    storySegments(opts.story, Array.isArray(opts.words) ? opts.words : [])
  );
  const hitCount = tokens.filter((t) => t.hit).length;
  const measure = (s: string) => ctx.measureText(s).width;
  const bodyW = W - 180;
  const maxBody = Math.max(1, bodyW);
  const { lines } = wrapStoryWords(tokens, maxBody, measure, 12);
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `700 26px ${family}`;
  const spaceW = measure(" ");
  let y = 400;
  for (const line of lines) {
    let x = 90;
    for (const tok of line) {
      const tw = measure(tok.text);
      if (tok.hit) {
        ctx.fillStyle = uiColors.amber[100];
        roundRect(ctx, x - 4, y - 17, tw + 8, 34, 6);
        ctx.fill();
        ctx.fillStyle = uiColors.amber[800];
      } else {
        ctx.fillStyle = uiColors.stone[800];
      }
      ctx.fillText(tok.text, x, y);
      x += tw + spaceW;
    }
    y += 42;
  }
  // خلاصهٔ فارسیِ داستان — RTL
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = uiColors.stone[500];
  ctx.font = `700 22px ${family}`;
  let sy = y + 22;
  const sumLines = wrapCanvasLines(opts.summary, bodyW, measure, 3);
  for (const l of sumLines) {
    ctx.fillText(l, W - 90, sy);
    sy += 34;
  }
  if (hitCount > 0) {
    ctx.fillStyle = uiColors.amber[700];
    ctx.font = `900 22px ${family}`;
    ctx.fillText(`${faNum(hitCount)} واژهٔ برجستهٔ تو`, W - 90, sy + 22);
  }
  reviewCardFooter(ctx, family, W, 900, opts.source);
  return ctx.canvas;
}

export async function downloadStoryCardImage(opts: StoryCardOpts): Promise<boolean> {
  try {
    const c = await storyCardCanvas(opts);
    if (!c) return false;
    return await downloadCanvasBlob(c, "vision2-story.png");
  } catch {
    return false;
  }
}

export async function buildStoryCardBlob(opts: StoryCardOpts): Promise<Blob | null> {
  try {
    const c = await storyCardCanvas(opts);
    if (!c) return null;
    return await canvasToBlob(c);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Task 121 — کمک‌هایِ خالصِ کارتِ معلمِ هفته: حلقهٔ درصد و شعارِ پایانی.
// تکمالکِ ریاضی اینجا نیست — week-goal.ts (Task 128) همان را آینه میکند
// و قفلِ توافقِ شبکه‌ای دو工件 را نگه میدارد.
// ------------------------------------------------------------------

/** درصدِ صادقِ حلقهٔ هدف: clamp(0..7) → گرد → n/7؛ نامعتبر → ۰ */
export function weekCardPercent(goalDays: number): number {
  const d = Number.isFinite(goalDays) ? Math.max(0, Math.min(7, Math.round(goalDays))) : 0;
  return Math.round((d / 7) * 100);
}

/** شعارِ پایانیِ کارت — هیچ تحسینِ قلابی: هفتهٔ پر → فعال → ادامه بده */
export function weekCardMotto(goalDays: number, activeDays: number): string {
  if (weekCardPercent(goalDays) >= 71) return "FULL WEEK ★";
  if (Number.isFinite(activeDays) && activeDays >= 3) return "STRONG WEEK";
  return "KEEP GOING!";
}
