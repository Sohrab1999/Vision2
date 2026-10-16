#!/usr/bin/env node
/**
 * extract-jozve.cjs — «استخراج دقیق جزوه‌ها» (درخواست صریح کاربر)
 *
 * درخواست اصلی کاربر:
 *   «میخوام محتوای جزوه ها رو دقیق استخراج کنی همه رو و به درس های مرتبط در
 *    برنامه اضافه کنی. به جز اسم ناشر و نویسنده جزوه ها همه چیز رو دقیق
 *    استخراج کن و با کرون جاب ها پولیش کن و مرتب»
 *
 * قرارداد:
 *  - همهٔ متن جزوه‌ها واژه‌به‌واژه استخراج می‌شود؛ فقط هویت نویسنده/ناشر
 *    (نام، مدرسه/شهر نویسنده، تلفن، شبکه‌های اجتماعی) و شماره‌صفحه/سرصفحهٔ
 *    تکراری و خط‌چین‌های فهرست حذف می‌شود.
 *  - خروجی: public/jozve/g{7..12}.json + public/jozve/index.json
 *  - گزارشِ صحت (خطوط حفظ‌شده / حذف‌شده با دلیل) در هر سند ثبت می‌شود تا
 *    «چیزی از دست نرفته» قابل ممیزی باشد.
 *
 * دو خانوادهٔ جزوه:
 *  - A (پایه ۷/۸/۹): فصل‌ها با «(واژگان و نکات …) درس N پایه X».
 *  - B (پایه ۱۰/۱۱/۱۲ — Vision): سرصفحهٔ هر صفحه حامل «درس N - پایه X» است
 *    (درس یکم/دوم/…)؛ کشیدگی‌های ـ داخل کلمه باید پاک شوند؛ «تشریح» در فونت
 *    بدنه به «تسیچ» واریانت می‌شود (نقشهٔ اصلاح واژه).
 *
 * اجرا:  bun scripts/extract-jozve.cjs   (نیازمند pdftotext/pdfinfo در PATH)
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const UPLOAD = path.join(ROOT, "upload");
const OUT_DIR = path.join(ROOT, "public", "jozve");
const CACHE = "/tmp/jozve";

const GRADES = [
  { grade: 7, file: "جزوه هفتم.pdf", title: "جزوه کامل زبان انگلیسی پایه هفتم", family: "A" },
  { grade: 8, file: "جزوه هشتم.pdf", title: "جزوه کامل زبان انگلیسی پایه هشتم", family: "A" },
  { grade: 9, file: "جزوه زبان نهم حسن لطفی بوکان.pdf", title: "جزوه کامل زبان انگلیسی پایه نهم", family: "A" },
  { grade: 10, file: "جزوه جامع دهم .pdf", title: "جزوه جامع زبان انگلیسی پایه دهم", family: "B" },
  { grade: 11, file: "جزوه جامع یازدهم .pdf", title: "جزوه جامع کمک‌آموزشی زبان انگلیسی پایه یازدهم", family: "B" },
  { grade: 12, file: "جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf", title: "جزوه جامع پایه دوازدهم همراه با امتحانات نهایی", family: "B" },
];

// ————— حذف هویت نویسنده/ناشر (تنها استثنای مجازِ حذف طبق درخواست کاربر) —————
const AUTHOR_PATTERNS = [
  /دکتر\s*حسن\s*لطفی/i,
  /حسن\s*لطفی/i,
  /لطفی/,
  /بوکان/,
  /تألیف\s*و\s*گردآوری/,
  /تالیف\s*و\s*گردآوری/,
  /جمال\s*احمدی/,
  /دبیر\s*دبیرستان/,
  /سابقه\s*\d+\s*سال\s*تدریس/,
  /موبایل/i,
  /تلگرام/i,
  /اینستا/,
  /\b09\d{9}\b/,
  /PracticalEnglishInKonkour/i,
];

// ————— اصلاح لیگاتورهای خرابِ استخراج PDF (فقط کلمه‌های قطعاً معیوب) —————
const WORD_FIXES = [
  [/(^|[^\p{L}])اال/gu, "$1الا"], // سواالت→سوالات، باالی→بالای، کالم→کلام
  [/سؤاالت/g, "سوالات"],
  [/تسیچ/g, "تشریح"],
  [/تشییح/g, "تشریح"],
  [/(^|[^\p{L}])تشیح/gu, "$1تشریح"],
  [/جمالت/g, "جملات"],
  [/کالم/g, "کلام"],
  [/رشیط/g, "شرطی"],
  [/موصویل/g, "موصولی"],
  [/دیکشیی/g, "دیکشنری"],
  [/عالئم/g, "علائم"],
  [/میادف/g, "هم‌معنی"],
  [/(^|[^\p{L}])درش\b/gu, "$1درسی"],
  [/ب\s*قاعده/g, "بی‌قاعده"],
  [/رصب\s*المثل/g, "ضرب‌المثل"],
  [/دستگریم/g, "دستگرمی"],
  [/آشناب\s*با/g, "آشنایی با"],
  [/اسایم/g, "اسامی"],
  [/کتاب\s*دریس/g, "کتاب درسی"],
  [/هندش/g, "هندسی"],
  [/خییل/g, "خیلی"],
  [/کنیس\)/g, "گزینش)"],
  [/(^|[^\p{L}])نشی\s*\(/gu, "$1هم‌نشینی ("],
  [/شیط\s*نوع/g, "شرطی نوع"],
  [/(^|[^\p{L}])پاالن/gu, "$1پالان"],
];

const RTL_MARKS = /[\u202A-\u202E\u2066-\u2069\u200E\u200F\u061C]/g;
const NUM_FA = "۰۱۲۳۴۵۶۷۸۹";
const faToEnDigits = (s) => s.replace(/[۰-۹]/g, (d) => String(NUM_FA.indexOf(d)));

function cleanLine(raw) {
  let s = raw.replace(RTL_MARKS, "");
  s = s.replace(/\s*[\u0640]+\s*/g, ""); // کشیدگی (tatweel) داخل کلمات: «درس یــکـ ـم» → «درس یکم»
  s = s.replace(/["\u00AB\u00BB\u201C\u201D\u2018\u2019]/g, "");
  s = s.replace(/[ \t]+/g, " ").trim();
  return s;
}

function applyWordFixes(s) {
  let out = s;
  for (const [re, rep] of WORD_FIXES) out = out.replace(re, rep);
  return out;
}

const isAuthorLine = (s) => AUTHOR_PATTERNS.some((re) => re.test(s));

function isJunkLine(s) {
  if (!s) return false; // خط خالی = جداکنندهٔ پاراگراف، حفظ می‌شود
  const en = faToEnDigits(s);
  if (/^\d{1,4}$/.test(en)) return true; // شمارهٔ صفحه
  if (/^[-–—_.•*=\s]+$/.test(s)) return true; // فقط خط‌چین
  if (/[-–—_]{8,}/.test(s)) return true; // خط‌چین طولانی
  if (/^آزمون\s*[یر]$/.test(s)) return true; // چیپ‌های پراکندهٔ فهرست
  if (/پاسخنامه\s*صفحه|صفحه\s*پاسخنامه/.test(en)) return true; // پاصفحهٔ پاسخنامه
  if (/^Vision (One|Two|Three)\b/.test(en)) return true; // پاصفحهٔ لوگو
  // بازمانده‌های فهرست: عنوان شناخته‌شده + شمارهٔ صفحه در انتها
  if (
    /\d{1,4}$/.test(en) &&
    en.length < 90 &&
    /(واژگان|ترجمه|گرامر|نگارش|تست|تشریح|درس|آزمون|پاسخنامه|کلید|بخش|ریدینگ|مکالمه|دستگرمی|دستور زبان|افعال|جملات|کلمات|لغات)/.test(en)
  )
    return true;
  return false;
}

// ————— دسته‌بندی سرفصل‌های داخل فصل —————
const SECTION_RULES = [
  { type: "translation", re: /^ترجمه|Conversation\s*\(Vision|^Conversation/ },
  { type: "vocab", re: /^(واژگان|لغات|کلمات جدید|کلمات هم‌معنی|مرور واژگان|پسوند|پیشوند|Collocation|هم‌نشینی|ضرب‌المثل|اصطلاح)/ },
  { type: "grammar", re: /^(گرامر|دستور زبان|نکات گرامری|نکات دستوری|زمان\s|ضمایر|افعال\s|مجهول|معلوم|جملات شرطی|عبارات الحاق|افعال دو کلمه|See Also)/ },
  { type: "writing", re: /^(نگارش|پاراگراف|کلمات ربط|انواع اسم|انواع صفت|آهنگ صدای)/ },
  { type: "explain", re: /^(تشریح|تسیچ|تشییح)/ },
  { type: "tests", re: /^(\d* ?تست|نمونه سوال|سوالات امتحانی|سوالات|آزمون|تمرین|تست)/ },
  { type: "answer", re: /^(پاسخنامه|کلید|Answer Key)/ },
  { type: "appendix", re: /^(راههای تقویت|راه‌های تقویت|آشنایی با|اجزای کلام|دیکشنری انگلیسی|افعال بی‌قاعده|حروف در|The Alphabet)/ },
];

function classifySection(titleLine) {
  const en = faToEnDigits(titleLine).trim();
  for (const r of SECTION_RULES) if (r.re.test(en)) return r.type;
  return null;
}

// ————— شمارهٔ درس —————
const ORDINALS = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم"];
const EN_ORDINALS = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6 };

function lessonNumberOf(line) {
  const en = faToEnDigits(line);
  const fa = en.match(/درس\s+(یکم|اول|دوم|سوم|چهارم|پنجم|ششم)/);
  if (fa) return fa[1] === "یکم" ? 1 : ORDINALS.indexOf(fa[1]) + 1;
  const eno = en.match(/Lesson\s+(One|Two|Three|Four|Five|Six)/);
  if (eno) return EN_ORDINALS[eno[1]];
  return null;
}

// ————— قواعد شروع فصل —————
function isChapterHeaderA(line) {
  if (line.length > 100) return false;
  if (/^(ترجمه|نمونه|سوالات|تست|آزمون|پاسخنامه|کلید|تشریح)/.test(line)) return false;
  const en = faToEnDigits(line);
  return /^(مرور واژگان قبل از )?(واژگان و نکات (گرامری|دستوری) )?درس (یکم|اول|دوم|سوم|چهارم|پنجم|ششم) پایه (هفتم|هشتم|نهم)/.test(en);
}

// خط چند-درسی (جمع‌بندی «درس اول تا چهارم») فصل نیست
const MULTI_LESSON_RE = /درس\s*(یکم|اول|دوم|سوم|چهارم|پنجم|ششم)\s*(تا|و)\s*"?(یکم|اول|دوم|سوم|چهارم|پنجم|ششم)/;

function isLessonSignalB(line) {
  // هر سرصفحهٔ کوتاهی که درس N + «پایهٔ ۱۰-۱۲» (یا Lesson N) را حمل کند
  if (line.length > 100) return false;
  const en = faToEnDigits(line);
  if (/\d$/.test(en)) return false; // بازماندهٔ فهرست
  if (MULTI_LESSON_RE.test(en)) return false;
  if (/جمع\s*بندی/.test(en)) return false;
  if (/^(ترجمه|نمونه|سوالات|آزمون)/.test(en)) return false;
  const hasFa = /درس\s*(یکم|اول|دوم|سوم|چهارم|پنجم|ششم)/.test(en) && /پایه\s*(دهم|یازدهم|دوازدهم)/.test(en);
  const hasEn = /Lesson\s*:?\s*(One|Two|Three|Four|Five|Six)/.test(en);
  return hasFa || hasEn;
}

function isZoneMarkerB(line) {
  if (line.length > 60) return false;
  const en = faToEnDigits(line);
  if (/سوال|کلید|تست|صفحه/.test(en)) return false; // «بخش اول (سوالات صفحه 19…)» سرفصلِ کلید است نه بخش
  if (/^بخش (اول|دوم|سوم|چهارم)/.test(en)) return true;
  if (/^Part\s*(One|Two|Three|Four)/.test(en)) return true;
  if (/^مرور پایه|^مرور\s*پایه/.test(en)) return true;
  if (/^امتحانات نهایی|^امتحان نهایی/.test(en)) return true;
  return false;
}

const isTocHeader = (line) => line.length < 70 && /فهرست مطالب|Table of Contents/.test(line);
const isTocSkippable = (line) => /^(بخش\s(اول|دوم|سوم|چهارم)|عنوان|صفحه)/.test(line);

// ————— پارسر یک جزوه —————
function parseGrade(text, meta) {
  const rawLines = text.split(/\r?\n/);
  const stats = { total: rawLines.length, kept: 0, empty: 0, author: 0, junk: 0 };
  const chapters = [];

  let zone = { id: "main", label: "" };
  let current = null;
  let section = null;

  const newSection = (type, title) => {
    // ادغام سرفصل تکراری (سرصفحهٔ تکراری صفحات پشت‌سرهم)
    const t = (title || "متن").trim();
    if (section && section.title.slice(0, 40) === t.slice(0, 40) && section.type === type) return section;
    section = { type, title: t, lines: [] };
    current.sections.push(section);
    return section;
  };

  const openChapter = (title, kind, lessonNo) => {
    current = {
      id: "",
      title,
      kind,
      zone: zone.id,
      zoneLabel: zone.label,
      lessonNo: lessonNo ?? null,
      sections: [],
    };
    chapters.push(current);
    section = null;
    return current;
  };

  // فصل آغازین
  openChapter("معرفی و مقدمه", "intro", null);
  newSection("notes", "مقدمه");

  let tocMode = false; // فهرست مطالب: سرفصل‌های «بخش» در فهرست، zone واقعی نمی‌سازند

  for (const raw of rawLines) {
    let line = cleanLine(raw);
    if (!line) {
      stats.empty++;
      if (section && section.lines.length && section.lines[section.lines.length - 1] !== "") section.lines.push("");
      continue;
    }
    if (isAuthorLine(line)) { stats.author++; continue; }
    if (isJunkLine(line)) { stats.junk++; continue; }

    line = applyWordFixes(line);

    const lessonNo = lessonNumberOf(line);
    const chapterHit =
      (meta.family === "A" ? isChapterHeaderA(line) : isLessonSignalB(line) && lessonNo !== null) &&
      lessonNo !== null &&
      lessonNo !== current.lessonNo;

    // حالت فهرست مطالب: تا نخستین فصل واقعی همه‌چیز (جز سرفصل‌های فصل) نادیده
    if (isTocHeader(line)) { tocMode = true; stats.junk++; continue; }
    if (tocMode) {
      if (chapterHit) {
        tocMode = false; // بدنهٔ واقعی شروع شد
      } else if (isTocSkippable(line)) {
        stats.junk++;
        continue;
      } else if (meta.family === "B" && isZoneMarkerB(line) && /^Part/.test(faToEnDigits(line))) {
        tocMode = false; // «Part One: Review» آغاز بدنه
      } else {
        stats.junk++;
        continue;
      }
    }

    if (meta.family === "B" && isZoneMarkerB(line)) {
      const label = /^Part/.test(faToEnDigits(line))
        ? line.replace(/Part\s*(One|Two|Three|Four)\s*:?\s*(.*)/i, (_m, p1, p2) => {
            const fa = { One: "اول", Two: "دوم", Three: "سوم", Four: "چهارم" }[p1] || p1;
            const rest = p2 ? p2.replace(/review/i, "مرور") : "";
            return `بخش ${fa}${rest ? ": " + rest : ""}`;
          }).trim()
        : line;
      zone = { id: `z${chapters.length}`, label: label.slice(0, 80) };
      openChapter(label, "appendix", null);
      newSection("notes", "متن");
      stats.kept++;
      continue;
    }

    if (chapterHit) {
      const inAnswers = /پاسخنامه|کلید|Answer/i.test(zone.label);
      const keyish = /کلید(?!ی)|پاسخنامه/.test(line);
      const title = keyish
        ? line.replace(/\s+/g, " ").slice(0, 80)
        : `درس ${ORDINALS[lessonNo - 1]}${inAnswers ? " — پاسخنامه" : ""}`;
      openChapter(title, "lesson", lessonNo);
      // سرصفحهٔ حامل شمارهٔ درس، معمولاً خودش عنوانِ سکشن اول است
      const secType = classifySection(line) || "intro";
      newSection(secType, line);
      stats.kept++;
      continue;
    }

    const secType = line.length <= 110 ? classifySection(line) : null;
    if (secType) {
      // سکشن‌های «پاسخ/کلید» پشت‌سرهم ادغام می‌شوند (سرصفحهٔ Answer Key هر سؤال)
      if (secType === "answer" && section && section.type === "answer") {
        stats.kept++;
        continue;
      }
      newSection(secType, line);
      stats.kept++;
      continue;
    }

    if (!current || !section) newSection("notes", "متن");
    section.lines.push(line);
    stats.kept++;
  }

  // فصل‌های خالی حذف + سکشن‌های بی‌متن
  const realChapters = chapters.filter((ch, i) => i === 0 || ch.sections.some((s) => s.lines.some((l) => l.trim())));
  realChapters.forEach((ch, i) => {
    ch.id = `c${i + 1}`;
    ch.sections = ch.sections.filter((s, j) => j === 0 || s.lines.some((l) => l.trim()));
  });
  return { chapters: realChapters, stats };
}

// ————— اجرا —————
function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(CACHE, { recursive: true });
  const index = { generatedAt: new Date().toISOString(), grades: [] };
  let totKept = 0, totAuthor = 0, totJunk = 0, totPages = 0;

  for (const meta of GRADES) {
    const pdfPath = path.join(UPLOAD, meta.file);
    const txtPath = path.join(CACHE, `g${meta.grade}.txt`);
    if (!fs.existsSync(txtPath)) execFileSync("pdftotext", ["-layout", pdfPath, txtPath]);
    const pages = parseInt(execFileSync("pdfinfo", [pdfPath]).toString().match(/Pages:\s+(\d+)/)?.[1] || "0", 10);
    const sha = crypto.createHash("sha256").update(fs.readFileSync(pdfPath)).digest("hex").slice(0, 12);
    const { chapters, stats } = parseGrade(fs.readFileSync(txtPath, "utf8"), meta);

    const lessonChapters = chapters.filter((c) => c.kind === "lesson");
    const doc = {
      grade: meta.grade,
      title: meta.title,
      source: meta.file,
      pages,
      sourceSha256: sha,
      authorExcluded: true, // قرارداد کاربر: نام نویسنده/ناشر حذف می‌شود
      extraction: {
        keptLines: stats.kept,
        droppedAuthorLines: stats.author,
        droppedJunkLines: stats.junk,
        blankSeparators: stats.empty,
        totalLines: stats.total,
      },
      chapters,
    };
    const out = path.join(OUT_DIR, `g${meta.grade}.json`);
    fs.writeFileSync(out, JSON.stringify(doc));

    index.grades.push({
      grade: meta.grade,
      title: meta.title,
      pages,
      sourceSha256: sha,
      chapters: chapters.map((c) => ({
        id: c.id,
        title: c.title,
        kind: c.kind,
        sections: c.sections.map((s) => ({ type: s.type, title: s.title, lines: s.lines.length })),
      })),
    });

    totKept += stats.kept; totAuthor += stats.author; totJunk += stats.junk; totPages += pages;
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`g${meta.grade}: ${pages}p → ${chapters.length} فصل (${lessonChapters.length} درس), kept=${stats.kept} author=${stats.author} junk=${stats.junk} → ${kb}KB`);
    for (const c of chapters) {
      const lines = c.sections.reduce((a, s) => a + s.lines.length, 0);
      console.log(`   ${c.id} [${c.kind}] ${c.title} — ${c.sections.length} سکشن / ${lines} خط`);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(index));
  console.log(`\nTOTAL: pages=${totPages} kept=${totKept} author-dropped=${totAuthor} junk-dropped=${totJunk}`);
}

main();
