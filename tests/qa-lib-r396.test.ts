import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// ------------------------------------------------------------------
// r396 — کتابخانهٔ مشترکِ QA (qa-lib.sh) — الگویِ دوقلو رویِ خودِ QA.
//
// سرشماریِ راند: ۱۰۹ اسکریپتِ qa-r*.sh — wait_home ×۱۸ / seed_guard ×۱۲ /
// to_dark ×۱۲ / ensure_alive ×۷ / ... — هشِ بایتی «فقط یک جفت» همسان
// میداد، اما بازبینیِ چشمی: تفاوتها نویزِ قالببندی است (فاصله/کامنت/
// شکستِ خط/«home-ready-after-») و بدنِ معنایی بایتبهبایت یکی است —
// درسِ r385 دو-نام، نسخهٔ bash: نویزِ قالبی خانواده را پنهان میکرد.
//
// تصمیمهایِ حکم:
//  ① مالک: scripts/qa-lib.sh با پیشوندِ qa_ (نیمفضایِ نام — تابعِ
//     کتابخانه ≠ گویشِ محلیِ اسکریپت).
//  ② انجمادِ تاریخی: ۱۰۹ اسکریپتِ qa-r341..r395 مهاجرت نمیشوند —
//     شاهدِ داوریِ خودشان‌اند؛ بازنویسی فقط هزینهٔ بازاجرا دارد.
//     مهاجرت پیشرو است: نخستین مصرفکننده qa-r396-playall-healthy.sh.
//  ③ گویشهایِ آزاد: سناریو/انکرها/NEEDLEها سمتِ میزبان؛ بذرِ شخصیت
//     (آرش-قهرمان) در همهٔ نسخهها یکی — پارامتریسازیاش REQUIRES-VERDICT.
//  ④ درسهایِ یکجاشده: SCENE-CLEAR و revive (r395) و استابِ صدا با
//     mode «ended» (r396 — پراکندنِ ended تا توالیِ playAll در هدلس
//     واقعاً پیش برود).
// ------------------------------------------------------------------

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const LIB = "scripts/qa-lib.sh";
const FIRST_CONSUMER = "scripts/qa-r396-playall-healthy.sh";
// r397 — دومین مصرفکننده (الگویِ پیشرو — هر راندِ نو source میکند)
const SECOND_CONSUMER = "scripts/qa-r397-image-toast.sh";
// r398 — سومین مصرفکننده
const THIRD_CONSUMER = "scripts/qa-r398-file-toast.sh";
// r399 — چهارمین مصرفکننده (شاهدِ بایتیِ BOM)
const FOURTH_CONSUMER = "scripts/qa-r399-bom-witness.sh";
// r400 — پنجمین مصرفکننده (شاهدِ زندهٔ دریلِ ضمیمه)
const FIFTH_CONSUMER = "scripts/qa-r400-appendix-drill.sh";

const SIXTH_CONSUMER = "scripts/qa-r401-drill-fa-replay.sh"; // r401 — معنی + مرور

const SEVENTH_CONSUMER = "scripts/qa-r402-drill-kbd.sh"; // r402 — کیبوردِ دریل

const EIGHTH_CONSUMER = "scripts/qa-r403-word-drill.sh"; // r403 — دریلِ خانوادهٔ واژه

const NINTH_CONSUMER = "scripts/qa-r404-abbrev-drill.sh"; // r404 — دریلِ نشانه‌های اختصاری

const TENTH_CONSUMER = "scripts/qa-r405-phoneme-drill.sh"; // r405 — دریلِ جدول تلفظ

const ELEVENTH_CONSUMER = "scripts/qa-r406-bg-example-drill.sh"; // r406 — دریلِ مثالهایِ درسنامه

const TWELFTH_CONSUMER = "scripts/qa-r407-lesson-vocab-drill.sh"; // r407 — دریلِ واژگانِ درس

const THIRTEENTH_CONSUMER = "scripts/qa-r408-dict-vocab-drill.sh"; // r408 — مقیاسِ دیکشنریِ بانکِ واژگان

const FOURTEENTH_CONSUMER = "scripts/qa-r409-drill-tts-kbd.sh"; // r409 — میانبرِ T و گاردِ حروفِ سراسری

const FIFTEENTH_CONSUMER = "scripts/qa-r410-listen-tts-kbd.sh"; // r410 — T در سطحهایِ شنیدار + رفعِ فلیپِ چیپ

const SIXTEENTH_CONSUMER = "scripts/qa-r411-flash-digit-tts.sh"; // r411 — گاردِ ارقامِ فلش‌کارت + T در تلفظ/واژهٔ روز

const SEVENTEENTH_CONSUMER = "scripts/qa-r412-drill-stats.sh"; // r412 — دریلها واردِ استور میشوند (ماندگاری + چپها)

const EIGHTEENTH_CONSUMER = "scripts/qa-r413-drill-mistakes.sh"; // r413 — بانکِ خطایِ ماندگارِ دریلها

const NINETEENTH_CONSUMER = "scripts/qa-r414-drill-srs.sh"; // r414 — SRSِ دریل (سررسید + حلقهٔ ok)

const TWENTIETH_CONSUMER = "scripts/qa-r415-drill-mistake-session.sh"; // r415 — تمرینِ سررسیدها (جلسهٔ فقطسررسید)

const TWENTYFIRST_CONSUMER = "scripts/qa-r416-drill-due-grace.sh"; // r416 — فاصلهگذاریِ پیشروندهٔ سررسید (دورهٔ نفس)

const TWENTYSECOND_CONSUMER = "scripts/qa-r417-drill-grace-chip.sh"; // r417 — چیپِ آسمانیِ دورهٔ نفس (شفافیتِ ریتم)

const TWENTYTHIRD_CONSUMER = "scripts/qa-r418-drill-calendar.sh"; // r418 — صادرِ تقویمِ مرور (CSV)

const TWENTYFOURTH_CONSUMER = "scripts/qa-r419-host-srs-chip.sh"; // r419 — چیپِ SRSِ میزبانها (ریتم، پیشِ ورود)

const TWENTYFIFTH_CONSUMER = "scripts/qa-r420-allbank-calendar.sh"; // r420 — تقویمِ همهٔ بانکها (اطلسِ برچسب)

const TWENTYSIXTH_CONSUMER = "scripts/qa-r421-week-agenda.sh"; // r421 — تقویمِ هفتهٔ پیشِ رو (برشِ ۷روزه)

const TWENTYSEVENTH_CONSUMER = "scripts/qa-r422-week-strip.sh"; // r422 — نوارِ هفتهٔ پیشِ رو در کارنامه (روایت در نما)

const TWENTYEIGHTH_CONSUMER = "scripts/qa-r423-week-card.sh"; // r423 — کارتِ تصویریِ تقویمِ هفته (نوارِ ساکن، پرترهٔ خودش)

const TWENTYNINTH_CONSUMER = "scripts/qa-r424-week-card-share.sh"; // r424 — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306؛ دو دروازهٔ یک ارزیابی)

const THIRTIETH_CONSUMER = "scripts/qa-r425-today-jump.sh"; // r425 — پرشِ خانهٔ امروزِ نوار + شاهدِ تاریکِ جفتِ دو دروازه

const THIRTYFIRST_CONSUMER = "scripts/qa-r426-seven-paths.sh"; // r426 — داوریِ زندهٔ هفت‌مسیرهٔ لنگرهایِ پرش

const THIRTYSECOND_CONSUMER = "scripts/qa-r427-word-row-anchor.sh"; // r427 — لنگرِ سطرِ واژه — پالسِ کارت در روشن و شب + پرشِ دوباره
const THIRTYTHIRD_CONSUMER = "scripts/qa-r428-family-row-dark.sh"; // r428 — لنگرِ سطریِ خانواده + شاهدِ تاریکِ هفت مقصد

const THIRTYFOURTH_CONSUMER = "scripts/qa-r429-dark-pulses.sh"; // r429 — سوءظنِ نظاممندِ شب — داوریِ تاریکِ سه پالسِ داورینشده + کارتِ واژه

const THIRTYFIFTH_CONSUMER = "scripts/qa-r430-dict-word-anchor.sh"; // r430 — لنگرِ واژهٔ دیکشنری — عدسی + پالس در روشن و شب + پرشِ دوباره

const THIRTSIXTH_CONSUMER = "scripts/qa-r431-ring-color.sh"; // r431 — رنگِ حلقهٔ خانواده — داوریِ ringSegِ هر شش پالس در روشن و شب + پالسِ مثالِ درسنامه

const THIRTYSEVENTH_CONSUMER = "scripts/qa-r432-bank-dues.sh"; // r432 — فهرستِ سررسیدهایِ امروز به تفکیک بانک — حکمِ معلقِ ناوبریِ چندبانکی بسته شد

const THIRTYEIGHTH_CONSUMER = "scripts/qa-r433-future-cell-labels.sh"; // r433 — برچسبِ بانک بر خانههایِ آیندهٔ نوار + شاهدِ دقیقِ کرنلِ شبِ سطرِ مثال

const THIRTYNINTH_CONSUMER = "scripts/qa-r434-after-week-names.sh"; // r434 — نامِ نزدیکترین در دنبالهٔ پس از هفته و نوارِ آرام
const FORTIETH_CONSUMER = "scripts/qa-r435-quiet-dark-witness.sh"; // r435 — شاهدِ تاریکِ نوارِ آرام + گویشِ نام در toastِ دانلودِ هفته
const FORTYFIRST_CONSUMER = "scripts/qa-r436-toast-dark-identity.sh"; // r436 — هویتِ شب و روزِ خودِ توست + ariaِ نامِ دکمهٔ دانلودِ هفته
const FORTYSECOND_CONSUMER = "scripts/qa-r437-host-chips-dark-witness.sh"; // r437 — شاهدِ تاریکِ چیپهایِ میزبانِ r419 + پایهٔ labِ همان داوری
const FORTYTHIRD_CONSUMER = "scripts/qa-r438-shared-chip-host-context.sh"; // r438 — شاهدِ در-بافتِ چیپهایِ مشترک در سه میزبانِ دیگر (vocab-tab/dictionary/booklet-grammar)
const FORTYFOURTH_CONSUMER = "scripts/qa-r439-mobile-host-context.sh"; // r439 — شاهدِ در-بافتِ موبایلِ چیپها در هر چهار میزبان + تکمیلِ نقشهٔ گپ
const FORTYFIFTH_CONSUMER = "scripts/qa-r440-mobile-intro.sh"; // r440 — شاهدِ موبایلِ خانوادهٔ معرفی — اولین داوریِ زیرِ ۱۲۸۰ + سریالِ نوِ رزگون
const FORTYSIXTH_CONSUMER = "scripts/qa-r441-mobile-result.sh"; // r441 — شاهدِ موبایلِ پردهٔ نتیجه — جلسهٔ واقعیِ کامل در ۳۹۰ + کشفِ توکنِ مشترکِ liها با خانوادهٔ چیپ
const FORTYSEVENTH_CONSUMER = "scripts/qa-r442-mobile-replay-result.sh"; // r442 — شاهدِ موبایلِ «نتیجهٔ مرور» (شاخهٔ isReplay) — مرورِ قطعیِ صددرصد از نقشهٔ آموختهشده + r412 زنده در استور
const FORTYEIGHTH_CONSUMER = "scripts/qa-r443-flashcards-passdone.sh"; // r443 — شاهدِ موبایلِ پردهٔ پایانِ فلش‌کارت‌ها — گاردِ «پاسِ مرورِ هوشمند تمام شد» + تحویلِ دستی + سریالهایِ همخانوادهٔ تحویلِ بنفش
const FORTYNINTH_CONSUMER = "scripts/qa-r444-empty-family.sh"; // r444 — شاهدِ موبایلِ خانوادهٔ تهیِ فلش‌کارت‌ها — دو حالتِ تهیِ لانچر + درِ دیکشنری + حکمِ دستنیافتنیِ گاردِ دفاعیِ موتور
const FIFTIETH_CONSUMER = "scripts/qa-r445-dictation-launcher.sh"; // r445 — شاهدِ موبایلِ لانچرِ دیکتهٔ ستاره‌ها — دو حالتِ لانچر + راندِ واقعیِ ۴واژه‌ای + پردهٔ پایان + سریالهایِ همخانوادهٔ r437/r438/r444
const FIFTYFIRST_CONSUMER = "scripts/qa-r446-review-launcher.sh"; // r446 — شاهدِ موبایلِ لانچرِ آزمونِ «واژههای من» (مرور نشان‌شده‌ها) — دو حالت + کلمپِ ۸→۴ + گروهِ طولِ جلسه + راندِ واقعیِ ۴سؤالی تا پردهٔ نتیجه
const FIFTYSECOND_CONSUMER = "scripts/qa-r447-review-eight-stars.sh"; // r447 — شاهدِ موبایلِ حالتِ ۸+ستارهٔ گروهِ طولِ جلسه — آنسویِ لبهٔ تزئینیِ ۴ستاره: چیپِ ۸ فعالِ فشرده با مکانیزمِ rgbaیِ کهرباییِ خودش + راندِ واقعیِ ۸سؤالی + نقطهٔ شیرینِ ۱۵ستاره
const FIFTYTHIRD_CONSUMER = "scripts/qa-r448-review-retry-contract.sh"; // r448 — شاهدِ موبایلِ قراردادِ «تلاش مجدد» — بازچرخشِ پردهٔ نتیجه به موتور بیِ شلیکِ دوبارهٔ my_words_review_start + attemptِ دومِ POSTشده + هویتِ سؤالِ اول (Q1-IDENTICAL)
const FIFTYFOURTH_CONSUMER = "scripts/qa-r449-exam-certificate-mobile.sh"; // r449 — شاهدِ موبایلِ کارتِ گواهیِ آزمونِ جامع — خانوادهٔ دیپلم در بندِ ۳۹۰px: کاغذِ تیرهشده در شب (globals.css) + مُهرِ چرخیده + ردیفِ شکست + fallbackِ امردیِ pink + قراردادِ exam_done
const FIFTYFIFTH_CONSUMER = "scripts/qa-r450-timed-cert-best.sh"; // r450 — شاهدِ موبایلِ گواهیِ تایمدار + بازخوانیِ رکورد — چیپِ شمارشِ معکوسِ «7:30» (چهرهٔ هشتم) با زندهبودنِ دترمینیستیک + سه راویِ هماهنگِ «بهترین نتیجه» + قفلِ میان-رسانهٔ DOM↔DB
const FIFTYSIXTH_CONSUMER = "scripts/qa-r451-exam-mistakes-mobile.sh"; // r451 — شاهدِ موبایلِ «مرور اشتباهات آزمون جامع» (نهمین چهرهٔ خانوادهٔ آزمون — kind=exam-mistakes) — بانکِ بذرِ پرسونا (x-5/x-23) + تغذیهٔ واقعی با راندِ exam + حلقهٔ آموزشیِ کامل: مرورِ کور → یادگیری از بازخورد → ۱۰۰٪ → بانکِ خالی → CTA غایب
const FIFTYSEVENTH_CONSUMER = "scripts/qa-r452-exam-dict-mobile.sh"; // r452 — شاهدِ موبایلِ «دیکتهٔ واژگان» (exam-dict-cta — دهمین چهرهٔ خانوادهٔ آزمون) — بانکِ RAWِ ۱۷۲ (نه ۱۴۹ِ کهنهٔ کامنت) + هفت واژهٔ راهنما + بازتایپِ Reactِ حرفبهحرف + رد کردنِ رز + پردهٔ doneِ ۴۴٪ + SRSِ ۸/۸ + گویشِ نیمامتیازِ DOM↔DB
const FIFTYEIGHTH_CONSUMER = "scripts/qa-r453-dict-scope-switch.sh"; // r453 — شاهدِ موبایلِ «سوییچِ دامنهٔ دیکته» — قراردادِ remountِ key={dictScope}: نیمدورِ بانکی رها میشود، count به ۱۰ ریست، چیپِ فعالِ صورتیِ پایهٔ هفتم، راندِ واقعیِ ۸واژه‌ای + attemptِ یکتای dict-g7 و هیچِ attemptِ سایه؛ + سگِ نگهبانِ سرور (مرگِ بیصدا ۵/۵)
const FIFTYNINTH_CONSUMER = "scripts/qa-r454-toast-root2.sh"; // r454 — شکارِ «ریشهٔ دومِ توستِ آلوده» — بایسِکتِ زندهٔ dispatch→render در دو بازو (آلوده/تازه) با fiber-probe (خواندنِ toasts از hooksِ Toaster) + MutationObserver (ثبتِ +LI/-LI) + ناحیهٔ announcer؛ اثباتِ قاتلِ ۳۷ms: توستِ «وعده برقرار شد» (r279) توستِ نتیجهٔ دیکته را با LIMIT=1 بیرون میپراند
const SIXTIETH_CONSUMER = "scripts/qa-r455-toast-stack-mobile.sh"; // r455 — شاهدِ موبایلِ پشتهٔ توستها — سه جریانِ راستینِ پشتهشده در ۳۹۰×۸۴۴ (Anki + پشتیبانِ پروفایل + راستکلیکِ رزومهٔ هدر) + سرریزِ زندهٔ چهارم (COUِ تزریقی → fileFailToast) + زوجِ رقابتیِ r454 در دو حالت؛ اثباتِ عیبِ gap=0 (توستهای چسبیده) و تعمیرِ gap-3

const LIB_FUNCS = [
  "qa_shot()",
  "qa_rec()",
  "qa_count_reset()",
  "qa_wait_home()",
  "qa_seed_guard()",
  "qa_seed_guard_mobile()",
  "qa_ensure_alive()",
  "qa_to_dark()",
  "qa_to_light()",
  "qa_toast_identity()",
  "qa_click_toast_q()",
  "qa_wait_toasts_clear()",
  "qa_click_expect_no_toast()",
  "qa_tts_count_on()",
  "qa_tts_fail_on()",
  "qa_tts_restore()",
  "qa_audio_stub_on()",
  "qa_audio_stub_off()",
  "qa_stub_count()",
] as const;

describe("r396 — مالکِ کتابخانهٔ QA", () => {
  it("همهٔ ۱۹ تابعِ مالک در qa-lib.sh زندهاند", () => {
    const lib = p(LIB);
    for (const fn of LIB_FUNCS) expect(lib, fn).toContain(fn);
  });

  it("قراردادِ میزبان: QA_SEED_FILE اجباری است (:? syntax) — اسکریپتِ بیقرارداد زود بمیرد", () => {
    const lib = p(LIB);
    expect(lib).toContain('${QA_SEED_FILE:?');
  });

  it("درسهایِ یکجاشده در سرصفحهٔ مالک ثبتند — SCENE-CLEAR و revive و استابِ ended", () => {
    const lib = p(LIB);
    expect(lib).toContain("wait_toasts_clear"); // r395
    expect(lib).toContain("revive"); // r395
    expect(lib).toContain("dispatchEvent(new Event('ended'))"); // r396
    expect(lib).toContain("__endedCount");
  });

  it("حکمِ انجماد در سرصفحه ثبت است — مهاجرت فقط پیشرو", () => {
    const lib = p(LIB);
    expect(lib).toContain("qa-r341..r395");
    expect(lib).toContain("qa-r396-playall-healthy.sh");
  });

  it("bash -n بر کتابخانه میگذرد", () => {
    expect(() => execSync(`bash -n ${LIB}`)).not.toThrow();
  });
});

describe("r396 — نخستین مصرفکننده", () => {
  it("qa-r396 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIRST_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    // توابعِ مالک نباید در مصرفکننده بازتعریف شوند (دو-نامِ r385 ممنوع)
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_wait_toasts_clear\(\)/m);
    expect(s).not.toMatch(/^qa_audio_stub_on\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: استابِ ended → playAllِ سالم → کنترلِ مثبتِ r394 با reload", () => {
    const s = p(FIRST_CONSUMER);
    expect(s).toContain("qa_audio_stub_on ended");
    expect(s).toContain("playall-clicked");
    expect(s).toContain("location.reload"); // کشِ ماژول را پاک میکند (خطِ بیکش)
    expect(s).toContain("پخش صدا ممکن نشد");
  });
});

describe("r396 — انجمادِ تاریخی (نمونهبرداری)", () => {
  it("اسکریپتهایِ تاریخی دستنخوردهاند — هنوز helperهایِ خودشان را دارند", () => {
    // هیچکدام از راندهایِ نمونه (سه دهه) کتابخانه را source نمیکنند
    for (const f of [
      "scripts/qa-r345-audio-failpath.sh",
      "scripts/qa-r390-pair-speak-chips.sh",
      "scripts/qa-r395-negctl-audio.sh",
    ]) {
      expect(p(f), f).not.toContain("qa-lib.sh");
    }
    // و آنهایی که wait_home دارند، هنوز دستنویسِ خودشان است
    for (const f of [
      "scripts/qa-r345-audio-failpath.sh",
      "scripts/qa-r395-negctl-audio.sh",
    ]) {
      expect(p(f), f).toMatch(/^wait_home[ (]/m);
    }
  });

  it("هر اسکریپتِ نو به کتابخانه وابسته است — سرشماریِ مصرفکننده (r422: بیستوهفتمین مصرفکننده)", () => {
    const hits = execSync(`rg -l 'scripts/qa-lib.sh' scripts/ || true`)
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean)
      .sort();
    // سرشماری، تلهٔ ضدِ دستنویسی است: اسکریپتِ نو یا source میکند
    // (و باید همینجا به ثبت برسد) یا دستنویسِ helper میسازد (و همینجا خودش را میدهد).
    expect(hits).toEqual([FIRST_CONSUMER, SECOND_CONSUMER, THIRD_CONSUMER, FOURTH_CONSUMER, FIFTH_CONSUMER, SIXTH_CONSUMER, SEVENTH_CONSUMER, EIGHTH_CONSUMER, NINTH_CONSUMER, TENTH_CONSUMER, ELEVENTH_CONSUMER, TWELFTH_CONSUMER, THIRTEENTH_CONSUMER, FOURTEENTH_CONSUMER, FIFTEENTH_CONSUMER, SIXTEENTH_CONSUMER, SEVENTEENTH_CONSUMER, EIGHTEENTH_CONSUMER, NINETEENTH_CONSUMER, TWENTIETH_CONSUMER, TWENTYFIRST_CONSUMER, TWENTYSECOND_CONSUMER, TWENTYTHIRD_CONSUMER, TWENTYFOURTH_CONSUMER, TWENTYFIFTH_CONSUMER, TWENTYSIXTH_CONSUMER, TWENTYSEVENTH_CONSUMER, TWENTYEIGHTH_CONSUMER, TWENTYNINTH_CONSUMER, THIRTIETH_CONSUMER, THIRTYFIRST_CONSUMER, THIRTYSECOND_CONSUMER, THIRTYTHIRD_CONSUMER, THIRTYFOURTH_CONSUMER, THIRTYFIFTH_CONSUMER, THIRTSIXTH_CONSUMER, THIRTYSEVENTH_CONSUMER, THIRTYEIGHTH_CONSUMER, THIRTYNINTH_CONSUMER, FORTIETH_CONSUMER, FORTYFIRST_CONSUMER, FORTYSECOND_CONSUMER, FORTYTHIRD_CONSUMER, FORTYFOURTH_CONSUMER, FORTYFIFTH_CONSUMER, FORTYSIXTH_CONSUMER, FORTYSEVENTH_CONSUMER, FORTYEIGHTH_CONSUMER, FORTYNINTH_CONSUMER, FIFTIETH_CONSUMER, FIFTYFIRST_CONSUMER, FIFTYSECOND_CONSUMER, FIFTYTHIRD_CONSUMER, FIFTYFOURTH_CONSUMER, FIFTYFIFTH_CONSUMER, FIFTYSIXTH_CONSUMER, FIFTYSEVENTH_CONSUMER, FIFTYEIGHTH_CONSUMER, FIFTYNINTH_CONSUMER, SIXTIETH_CONSUMER].sort());
  });
});

describe("r417 — بیستودومین مصرفکننده", () => {
  it("qa-r417 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYSECOND_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYSECOND_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → چیپِ آسمانیِ دورهٔ نفس → جلسهٔ سررسید → پیوستنِ go به نفس", () => {
    const s = p(TWENTYSECOND_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("دورهٔ نفس این تمرین"); // چیپِ آسمانیِ نو (r417)
    expect(s).toContain("__verbAns"); // پاسخِ درستِ بانکمحور — نقشهٔ appendix از bun
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r418 — بیستوسومین مصرفکننده", () => {
  it("qa-r418 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYTHIRD_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYTHIRD_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → دکمهٔ تقویمِ مرور → محتوایِ CSVِ زنده (BOM + ترتیبِ SRS) → ماندگاری", () => {
    const s = p(TWENTYTHIRD_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("تقویمِ مرور"); // دکمهٔ نوِ معرفی (r418)
    expect(s).toContain("__r418blobs"); // گرفتنِ blobِ واقعیِ دانلود — محتوایِ زنده
    expect(s).toContain("ignoreBOM"); // درسِ r401: blob.text() جوابِ BOM را میبلعد
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r419 — بیستوچهارمین مصرفکننده", () => {
  it("qa-r419 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYFOURTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYFOURTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → چیپهایِ میزبان پیشِ ورود → جلسهٔ سررسید → بازشماریِ میزبان پسِ خروج", () => {
    const s = p(TWENTYFOURTH_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده"); // میزبانِ افعال — چیپِ SRS پیشِ ورود
    expect(s).toContain("درنفس"); // چیپِ آسمانیِ فشردهٔ میزبان (r419)
    expect(s).toContain("__verbAns"); // پاسخِ درستِ بانکمحور — نقشهٔ appendix از bun
    expect(s).toContain("drillStats"); // بذرِ رکوردِ میزبان — چیپِ بنفشِ ماندگار
    expect(s).toContain("drillMistakes"); // بذرِ نردبان + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r420 — بیستوپنجمین مصرفکننده", () => {
  it("qa-r420 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYFIFTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYFIFTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ دوبانک → کارنامه → دکمهٔ همه-بانکی → محتوایِ CSV (بلوک + اطلس) → شاهدِ تاریکِ میزبان", () => {
    const s = p(TWENTYFIFTH_CONSUMER);
    expect(s).toContain("open-report"); // هفته‌نامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("تقویم مرور همهٔ تمرین‌ها"); // دکمهٔ نوِ نوارِ خروجیها (r420)
    expect(s).toContain("__r420blobs"); // گرفتنِ blobِ واقعیِ دانلود — محتوایِ زنده
    expect(s).toContain("ignoreBOM"); // درسِ r401: blob.text() جوابِ BOM را میبلعد
    expect(s).toContain("drillMistakes"); // بذرِ دوبانکِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // شاهدِ تاریکِ میزبان (پیشنهادِ ①ِ r419)
    expect(s).toContain("location.reload");
  });
});

describe("r421 — بیستوششمین مصرفکننده", () => {
  it("qa-r421 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYSIXTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYSIXTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان + دورترها → دکمهٔ هفته (شمارِ درونِ پنجره) → CSVِ روزبهروز با جمعِ روز → شاهدِ تاریکِ همه-بانکی", () => {
    const s = p(TWENTYSIXTH_CONSUMER);
    expect(s).toContain("open-report"); // هفته‌نامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("تقویم هفتهٔ پیشِ رو"); // دکمهٔ نوِ نوارِ خروجیها (r421)
    expect(s).toContain("__r421blobs"); // گرفتنِ blobِ واقعیِ دانلود — محتوایِ زنده
    expect(s).toContain("جمعِ روز"); // گویشِ روزبهروزِ سندِ هفته
    expect(s).toContain("پس از هفته"); // دنبالهٔ صادقِ دورترها
    expect(s).toContain("ignoreBOM"); // درسِ r401: blob.text() جوابِ BOM را میبلعد
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r422 — بیستوهفتمین مصرفکننده", () => {
  it("qa-r422 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYSEVENTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYSEVENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → نوارِ هفتخانهای (امروزِ زمردی + دورترهایِ آسمانی) → شاهدِ تاریک → ماندگاری", () => {
    const s = p(TWENTYSEVENTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("هفتهٔ پیشِ رو"); // نوارِ نوِ کارنامه (r422)
    expect(s).toContain("امروز"); // خانهٔ نخست — دعوتِ کنشِ زمردی
    expect(s).toContain("qa_to_dark"); // شاهدِ تاریکِ کرنلهایِ emerald/sky
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r423 — بیستوهشتمین مصرفکننده", () => {
  it("qa-r423 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYEIGHTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYEIGHTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → دکمهٔ درونِ نوار → تلهِ COU و PNGِ واقعی + توستِ گویشِ خود → شاهدِ تاریک → ماندگاری", () => {
    const s = p(TWENTYEIGHTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("ذخیرهٔ تصویرِ تقویمِ هفته"); // دکمهٔ درونِ نوار (r423)
    expect(s).toContain("عکسِ تقویمِ هفته ذخیره شد"); // توستِ گویشِ خودِ درگاه
    expect(s).toContain("createObjectURL"); // تلهِ COU — blobِ PNG واقعی
    expect(s).toContain("image/png"); // نوعِ blob — بومِ واقعی، نه تقلب
    expect(s).toContain("qa_to_dark"); // شاهدِ تاریکِ نوارِ دکمهدار
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r424 — بیستونهمین مصرفکننده", () => {
  it("qa-r424 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYNINTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYNINTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبان → دو دروازه در نوار → کلیکِ هم‌رسانی → توستِ صادقِ پشتیبانی‌نشدن + رویدادِ gated بر blob در دفتر", () => {
    const s = p(TWENTYNINTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("هم‌رسانی تصویرِ تقویمِ هفته"); // دکمهٔ هم‌رسانیِ درونِ نوار (r424)
    expect(s).toContain("ذخیرهٔ تصویرِ تقویمِ هفته"); // دروازهٔ خواهرِ r423 — دو دروازهٔ یک ارزیابی
    expect(s).toContain("هم‌رسانی ممکن نشد"); // پیامِ صادقانهٔ پشتیبانی‌نشدن — دسکتاپ بیِ navigator.share
    expect(s).toContain("week_calendar_share"); // رویدادِ gated بر blob در دفترِ DB
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("location.reload"); // شاهدِ ماندگاری از hydration
  });
});

describe("r425 — سیامین مصرفکننده", () => {
  it("qa-r425 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTIETH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTIETH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ تکبانک → خانهٔ امروزِ دکمه → پرش به میزبان + رویداد در دفتر → شاهدِ تاریکِ جفت → چندبانکیِ ساکتِ صادق → hydration", () => {
    const s = p(THIRTIETH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ"); // ariaِ خانهٔ امروزِ قابلِ پرش (r425)
    expect(s).toContain("شروع تمرین افعال بی‌قاعده"); // مقصدِ پرش — میزبانِ verbs با لنگرِ سطرِ go
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
    expect(s).toContain("qa_to_dark"); // شاهدِ تاریکِ جفتِ دو دروازه (پیشنهادِ ②ِ r424)
    expect(s).toContain("today-jump"); // کرنلِ دارکِ اسکوپشدهٔ خانهٔ امروز (globals r425)
    expect(s).toContain("shareHoverInkDark"); // جوهرِ hoverِ شبِ دروازه — از CSSِ خانواده (r425)، دستنویس نیست
    expect(s).toContain("در ۲ بانک"); // گویشِ امروزِ چندبانکیِ ساکتِ صادق
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("location.reload"); // شاهدِ ماندگاری از hydration
  });
});

describe("r426 — سیاویکمین مصرفکننده", () => {
  it("qa-r426 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYFIRST_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYFIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: پایههایِ واقعی از خودِ داده (bun) → هر هفت مسیرِ پرش → مقصدِ میزبانِ خودِ هر بانک + دفتر", () => {
    const s = p(THIRTYFIRST_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ"); // ariaِ خانهٔ امروزِ قابلِ پرش (r425)
    expect(s).toContain("شروع تمرین افعال بی‌قاعده"); // مسیرِ verbs (r234)
    expect(s).toContain("شروع تمرین جدول تلفظ"); // مسیرِ phonemes (r235)
    expect(s).toContain("شروع تمرین خانوادهٔ واژه‌ها"); // مسیرِ words (r224)
    expect(s).toContain("شروع تمرین نشانه‌های اختصاری"); // مسیرِ abbrev (r235)
    expect(s).toContain("شروع تمرین واژگان درس"); // مسیرِ lesson-vocab (r407)
    expect(s).toContain("شروع تمرین واژگان دیکشنری"); // مسیرِ dict-vocab (r408)
    expect(s).toContain("شروع تمرین مثال‌های درسنامه"); // مسیرِ bg-examples (r221/r406)
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
    expect(s).toContain(".week-strip"); // درسِ r425 — پروبِ دامنهدار
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
  });
});

describe("r427 — سیودومین مصرفکننده", () => {
  it("qa-r427 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYSECOND_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYSECOND_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ واژهٔ واقعی → پرشِ خانهٔ امروز → پالسِ کارتِ واژه در روشن و شب + پرشِ دوباره + دفتر", () => {
    const s = p(THIRTYSECOND_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ واژگان درس"); // ariaِ خانهٔ امروز برایِ بانکِ lesson-vocab
    expect(s).toContain("vocab-row-"); // لنگرِ واقعیِ کارتِ واژه (اسلاگِ r253)
    expect(s).toContain("shadow-emerald-300"); // هستهٔ زمردیِ پالس — روشن
    expect(s).toContain("0px 0px 0px 2px inset"); // هندسهٔ حلقهٔ درونی — داوریِ رنگفضا-بیطرف (درسِ oklabِ این راند)
    expect(s).toContain("emerald-900/30"); // گویشِ شبِ کارت — کرنلِ r234
    expect(s).toContain("__r427base"); // واژهٔ واقعی از خودِ داده (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // شاهدِ شبِ مقصدِ عمیق
    expect(s).toContain("location.reload"); // هر صحنه با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r428 — سیوسومین مصرفکننده", () => {
  it("qa-r428 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYTHIRD_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYTHIRD_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: پالسِ سطرِ خانواده در روشن و شب (رنگفضا-بیطرف) + شاهدِ تاریکِ هفت مقصد", () => {
    const s = p(THIRTYTHIRD_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ خانوادهٔ واژه‌ها"); // ariaِ خانهٔ امروز برایِ بانکِ words
    expect(s).toContain("wf-row-"); // شناسهٔ پایدارِ سطرِ خانواده (r428)
    expect(s).toContain("shadow-emerald-300"); // هستهٔ زمردیِ پالس — روشن
    expect(s).toContain("0px 0px 0px 2px inset"); // هندسهٔ حلقه — داوریِ رنگفضا-بیطرف (درسِ oklab)
    expect(s).toContain("wf-row-pulse"); // کرنلِ شبِ اسکوپشدهٔ سطر (درسِ ریمپِ سراسریِ همین راند)
    expect(s).toContain("__r428"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // شاهدِ تاریکِ هفت مقصد (بندِ ①)
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r429 — سیاوممصرفکننده", () => {
  it("qa-r429 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYFOURTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYFOURTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: داوریِ تاریکِ چهار پالسِ پرش (رنگفضا-بیطرف) + پایهٔ روشن + دفتر", () => {
    const s = p(THIRTYFOURTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ $title"); // ariaِ خانهٔ امروز — عنوانِ بانک پارامترِ داور است
    expect(s).toContain("افعال بی‌قاعده"); // بانکِ verbs (با ZWNJ)
    expect(s).toContain("جدول تلفظ"); // بانکِ phonemes
    expect(s).toContain("نشانه‌های اختصاری"); // بانکِ abbrev
    expect(s).toContain("واژگان درس"); // بانکِ lesson-vocab
    expect(s).toContain("iv-row-"); // سطرِ فعلِ r234
    expect(s).toContain("('ph-'+"); // کارتِ واکِ r235
    expect(s).toContain("('ab-'+"); // کارتِ نشانهٔ r235
    expect(s).toContain("vocab-row-"); // کارتِ واژهٔ r427 (اسلاگِ r253)
    expect(s).toContain("shadow-emerald-300"); // هستهٔ زمردیِ پالس
    expect(s).toContain("0px 0px 0px 2px"); // هندسهٔ حلقه — داوریِ رنگفضا-بیطرف (درسِ oklab)
    expect(s).toContain("0.3"); // الفایِ شبِ کرنلِ r234 — رنگفضا-بیطرف
    expect(s).toContain("__r429"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // فازِ شب — سه پالسِ داورینشده
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r430 — سیا و پنجمین مصرفکننده", () => {
  it("qa-r430 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYFIFTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYFIFTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: عدسی + پالسِ کارتِ واژهٔ دیکشنری در روشن و شب + پرشِ دوباره + شاهدِ زندهٔ پالسِ srs-panel", () => {
    const s = p(THIRTYFIFTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ واژگان دیکشنری"); // ariaِ خانهٔ امروز برایِ بانکِ dict-vocab
    expect(s).toContain("data-dict-word"); // شناسهٔ کارتِ واژهٔ دیکشنری (r430)
    expect(s).toContain("shadow-emerald-300"); // هستهٔ زمردیِ پالس
    expect(s).toContain("0px 0px 0px 2px"); // هندسهٔ حلقه — داوریِ رنگفضا-بیطرف (درسِ oklab)
    expect(s).toContain("0.3"); // الفایِ شبِ کرنلِ r234 — رنگفضا-بیطرف
    expect(s).toContain("__r430"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // فازِ شب — لنگرِ عمیق در تاریکی
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("srs-dashboard"); // شاهدِ زندهٔ پالسِ انتخابِ srs-panel (پیشنهادِ ②ِ r429 — عضوِ ششمِ سرشماری)
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r431 — سیاوششمین مصرفکننده", () => {
  it("qa-r431 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTSIXTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTSIXTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: داوریِ رنگِ حلقه (ringSeg) هر شش پالس در روشن و شب + پالسِ مثالِ درسنامه + ترمیمِ زبرا witnessed", () => {
    const s = p(THIRTSIXTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("پرش به تمرینِ"); // ariaِ خانهٔ امروز — قفل به قالب نه عنوانِ یکپارچه (درسِ r429)
    expect(s).toContain("bg-ex-"); // شناسهٔ پایدارِ سطرِ مثال (r431)
    expect(s).toContain("110, 231, 183"); // رنگِ حلقهٔ روشنِ emerald-300 — داوریِ «رنگ» نه فقط هندسه
    expect(s).toContain("4, 120, 87"); // رنگِ حلقهٔ شبِ emerald-700/کرنلِ wf-row
    expect(s).toContain("236, 253, 245"); // bgِ روشنِ زمردی — شاهدِ ترمیمِ زبرایِ سطرِ خانواده (کشفِ r431)
    expect(s).toContain("wf-row-pulse"); // سطرِ خانواده — قربانیِ پیشینِ دزدِ هم-خاصیتی
    expect(s).toContain("RE-PULSE"); // پرشِ دوبارهٔ مثال — مصرفِ لنگر زنده (ایدئومِ r427/r430)
    expect(s).toContain("__r431"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // فازِ شب — رنگِ حلقه در تاریکی
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r432 — سیاوهفتمین مصرفکننده", () => {
  it("qa-r432 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYSEVENTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYSEVENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: فهرستِ چندبانکی سطربهسطر + سطرِ بیوعدهٔ صادق + دو مقصدِ دوگانه + تکبانکِ بیافزونگی", () => {
    const s = p(THIRTYSEVENTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("سررسیدهایِ امروز به تفکیک بانک"); // ariaِ ظرفِ فهرست
    expect(s).toContain("today-bank-jump"); // کلاسِ سطرهایِ پرش (همخانوادهٔ دروازههایِ کاغذ)
    expect(s).toContain("میزبانِ پرش ندارد"); // سطرِ بیوعدهٔ صادق (r236)
    expect(s).toContain("today-bank-jump[aria-label^="); // کلیکِ سطرِ واک — گرهٔ بایتیِ واقعیِ گزیننده (\‌در فایل)
    expect(s).toContain("پرش به تمرینِ خانوادهٔ واژه"); // کلیکِ سطرِ دوم — مقصدِ دوم
    expect(s).toContain("shadow-emerald-300"); // پالسِ مقصد (هستهٔ r234)
    expect(s).toContain("wf-row-pulse"); // پالسِ سطرِ خانواده (r428)
    expect(s).toContain("__r432"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("zzz-unknown-base"); // بانکِ بیلنگر در بذر
    expect(s).toContain("qa_to_dark"); // فازِ شب — کرنلِ خانوادهٔ دروازهها
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r433 — سیاوهشتمین مصرفکننده", () => {
  it("qa-r433 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYEIGHTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYEIGHTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: برچسبِ بانک بر خانههایِ آینده (تکبانک/چندبانک/ناشناس/تهی) + امروزِ دستنخورده + کرنلِ دقیقِ شبِ سطرِ مثال", () => {
    const s = p(THIRTYEIGHTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("week-strip"); // نوارِ هفته — موضوعِ راند
    expect(s).toContain("تمرینِ خانوادهٔ واژه"); // خانهٔ تکبانکیِ آینده — نامِ رسمیِ بانک
    expect(s).toContain("در ۲ بانک"); // خانهٔ چندبانکی — گویشِ r425
    expect(s).toContain("ghost-bank"); // بانکِ ناشناس — زبانِ عمومیِ شمار (r236)
    expect(s).toContain("بیِ بازگشت"); // خانهٔ تهی — سکوتِ r422
    expect(s).toContain("پرش به تمرینِ"); // خانهٔ امروز — قفلِ r425 دستنخورده
    expect(s).toContain("__r433"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("bg-ex-"); // سطرِ مثال — شاهدِ کرنلِ شبِ دقیق (ادامهٔ r428)
    expect(s).toContain("6, 78, 59"); // emerald-900/30 — پسزمینهٔ شبِ دقیق، نه فقط «۰٫۳»
    expect(s).toContain("4, 120, 87"); // emerald-700 — حلقهٔ شبِ دقیق (درسِ oklab)
    expect(s).toContain("shadow-emerald-300"); // پالسِ مقصد (هستهٔ r234)
    expect(s).toContain("qa_to_dark"); // فازِ شب
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر مسیر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r434 — سیاونههمین مصرفکننده", () => {
  it("qa-r434 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(THIRTYNINTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${THIRTYNINTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: نامِ نزدیکترین در دنباله (تکبانک/چندبانک/ناشناس) + نوارِ آرام + پرشِ امروزِ دستنخورده", () => {
    const s = p(THIRTYNINTH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("week-strip"); // نوارِ هفته — صحنهٔ دنباله
    expect(s).toContain("پس از این هفته"); // titleِ دنباله — موضوعِ راند
    expect(s).toContain("نزدیکترین بازگشتِ"); // زبانِ «کِی» در دنباله
    expect(s).toContain("تمرینِ افعال بی‌قاعده"); // تکبانکِ شناخته — نامِ رسمی
    expect(s).toContain("در ۲ بانک"); // همروزیِ دوبانکی — گویشِ r425
    expect(s).toContain("ghost-bank"); // بانکِ ناشناس — شمارِ صادق (r236)
    expect(s).toContain("آرام است"); // نوارِ آرامِ هفتهٔ خالی
    expect(s).toContain("+۱ پس از هفته"); // متنِ دیدنی — صفر شلوغیِ نو
    expect(s).toContain("__r434"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("پرش به تمرینِ"); // خانهٔ امروز — قفلِ r425 زنده
    expect(s).toContain("qa_to_dark"); // فازِ شب — خانوادهٔ شاهدِ تاریک
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر بذر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // رویدادِ پرش در دفترِ DB
  });
});

describe("r435 — چهلمین مصرفکننده", () => {
  it("qa-r435 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTIETH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTIETH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: شاهدِ تاریکِ دنباله و نوارِ آرام (تکبانک/ناشناس) + کرنلِ شبِ c-veil + گویشِ نامِ toastِ دانلود", () => {
    const s = p(FORTIETH_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("week-strip"); // نوارِ هفته — صحنهٔ دنباله
    expect(s).toContain("week-strip-quiet"); // نوارِ آرام — موضوعِ راند
    expect(s).toContain("پس از این هفته"); // titleِ دنباله در شب
    expect(s).toContain("تمرینِ افعال بی‌قاعده"); // تکبانکِ شناخته — نامِ رسمی در شب
    expect(s).toContain("ghost-bank"); // بانکِ ناشناس — شمارِ صادق (r236)
    expect(s).toContain("آرام است"); // نوارِ آرامِ هفتهٔ خالی در شب
    expect(s).toContain("rgba(41, 37, 36, 0.6)"); // کرنلِ شبِ retargetِ r87 (report-digest) — دقیق، نه فقط «تاریکتر»
    expect(s).toContain("__r435"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // تمامِ صحنهها در شبِ واقعی
    expect(s).toContain("location.reload"); // هر بذر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB
  });
});

describe("r436 — چهلویکمین مصرفکننده", () => {
  it("qa-r436 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYFIRST_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYFIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: هویتِ کرنلِ خودِ توست (شب + روشن) با ایدئومِ qa_toast_identity + ariaِ نامِ دکمهٔ دانلود", () => {
    const s = p(FORTYFIRST_CONSUMER);
    expect(s).toContain("open-report"); // کارنامه از راهِ رویدادِ سراسری باز میشود
    expect(s).toContain("دانلود تقویم هفتهٔ پیشِ رو CSV"); // دکمهٔ هفته — ariaِ نامِ r436
    expect(s).toContain("نزدیکترین بازگشت پس از هفته"); // گویشِ خانواده در aria
    expect(s).toContain("ol li"); // یابندهٔ توست — ایدئومِ qa_toast_identity (بدونِ role در این Radix)
    expect(s).toContain("backgroundColor"); // هویتِ کرنلِ توست — دقیق، نه فقط «تاریکتر»
    expect(s).toContain("oklch"); // سریالِ همموتورِ توکنِ bg-background (درسِ r427/r433)
    expect(s).toContain("__r436"); // دادهٔ واقعی از خودِ بانکها (bun)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // فازِ شب
    expect(s).toContain("qa_to_light"); // فازِ روشن — شاهدِ پایه
    expect(s).toContain("location.reload"); // هر بذر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB
  });
});

describe("r437 — چهلودومین مصرفکننده", () => {
  it("qa-r437 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYSECOND_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYSECOND_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: شاهدِ تاریکِ سه چیپِ میزبان (گویشِ بیتْمَند + کرنلِ دقیقِ rgba) و پایهٔ labِ روشن", () => {
    const s = p(FORTYSECOND_CONSUMER);
    expect(s).toContain("پیشرفت این تمرین"); // چیپِ بنفشِ میزبان
    expect(s).toContain("سررسیدهای مرور این تمرین"); // چیپِ زمردیِ SRS
    expect(s).toContain("دورهٔ نفس این تمرین"); // چیپِ آسمانیِ درنفس
    expect(s).toContain("افعال بی‌قاعده"); // میزبانِ افعال — صحنهٔ راند
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // کرنلِ شبِ violet-50 — دقیق، نه فقط «تاریکتر»
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // کرنلِ شبِ emerald-50
    expect(s).toContain("rgba(8, 47, 60, 0.45)"); // کرنلِ شبِ sky-50
    expect(s).toContain("lab("); // سریالِ همموتورِ روز (درسِ r427/r433/r436)
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW
    expect(s).toContain("qa_to_dark"); // فازِ شب
    expect(s).toContain("qa_to_light"); // فازِ روشن — پایهٔ همان داوری
    expect(s).toContain("location.reload"); // هر بذر با بازگشتِ خانه میآید
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB
  });
});

describe("r438 — چهلوسومین مصرفکننده", () => {
  it("qa-r438 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYTHIRD_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYTHIRD_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: در-بافتِ سه میزبانِ دیگر — هر میزبان با نشانه و اعدادِ خود + فرضیهٔ سریالهایِ r437 + قراردادِ صفرِ در-بافت", () => {
    const s = p(FORTYTHIRD_CONSUMER);
    expect(s).toContain("ورود به درس"); // میزبانِ ۱ — vocab-tab
    expect(s).toContain("دیکشنری جستجو"); // میزبانِ ۲ — dictionary (کارتِ خانه)
    expect(s).toContain("درسنامهٔ جامع"); // میزبانِ ۳ — booklet-grammar (ضمیمه)
    expect(s).toContain("شروع تمرین واژگان درس"); // نشانهٔ میزبانِ ۱
    expect(s).toContain("شروع تمرین واژگان دیکشنری"); // نشانهٔ میزبانِ ۲
    expect(s).toContain("شروع تمرین مثال‌های درسنامه"); // نشانهٔ میزبانِ ۳
    expect(s).toContain("lesson-vocab"); // بانکِ میزبانِ ۱
    expect(s).toContain("dict-vocab"); // بانکِ میزبانِ ۲
    expect(s).toContain("bg-examples"); // بانکِ میزبانِ ۳
    expect(s).toContain("flattenBgExamples"); // پایهٔ واقعیِ بانکِ درسنامه از خودِ داده
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // فرضیهٔ در-بافت: عینِ سریالهایِ r437 — بنفشِ شب
    expect(s).toContain("rgba(8, 47, 60, 0.45)"); // آسمانیِ شب
    expect(s).toContain("lab(96.2416 2.28849 -5.51657)"); // بنفشِ روز — سریالِ همموتور
    expect(s).toContain("host_row_lock"); // قفلِ محیطِ میزبان — آموختهشده پیشِ چشم
    expect(s).toContain("ZERO-OK-NO-CHIPS"); // قراردادِ صفرِ r412 در-بافت — بیِ رکورد هیچ چیزی
    expect(s).toContain("qa_to_dark"); // فازِ شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشنِ همان داوری
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — این شاهد پرشی ندارد
  });
});

describe("r439 — چهلوچهارمین مصرفکننده", () => {
  it("qa-r439 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYFOURTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYFOURTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: موبایلِ ۳۹۰ — هر چهار میزبان با گپِ خود + سرریزِ صفر + گویش و کرنلِ مستقل از بند", () => {
    const s = p(FORTYFOURTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — نه دسکتاپِ r437/r438
    expect(s).toContain("mobile_layout_lock"); // قفلِ چیدمان — آموختهشده پیشِ چشم
    expect(s).toContain("MOBILE-OK"); // حکمِ سرریزِ صفر + گپ + wrap
    expect(s).toContain("qa_seed_guard_mobile"); // گاردِ موبایل — نام از RAW نه از متنِ پنهانشده
    expect(s).toContain("min-[420px]"); // سندِ درس: هدر نام را زیرِ ۴۲۰px پنهان میکند
    expect(s).toContain("ضمیمهٔ کتاب"); // درِ موبایلِ ضمیمه — کارتِ شبکه، نه ناوبریِ دسکتاپ
    expect(s).toContain("افعال بی‌قاعده"); // میزبانِ ۱ — verbs
    expect(s).toContain("ورود به درس"); // میزبانِ ۲ — vocab-tab
    expect(s).toContain("دیکشنری جستجو"); // میزبانِ ۳ — dictionary
    expect(s).toContain("درسنامهٔ جامع"); // میزبانِ ۴ — booklet-grammar
    expect(s).toContain("'verbs':L(m.verb)"); // بذرِ چهاربانکِ با پایههایِ واقعی
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // فرضیهٔ مستقل از بند: عینِ r437 — بنفشِ شب
    expect(s).toContain("lab(96.2416 2.28849 -5.51657)"); // بنفشِ روز
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند — حکمِ کاربرِ تلفن
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r440 — چهلوپنجمین مصرفکننده", () => {
  it("qa-r440 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYFIFTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ ارتقایافته به کتابخانه — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYFIFTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: معرفی در ۳۹۰ — چهار چیپ و سه دکمه با گویشِ بیتْمَند + سریالِ نوِ رزگون + سرریزِ صفر", () => {
    const s = p(FORTYFIFTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — معرفی هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("شروع جلسهٔ تمرین فعل"); // ariaِ واقعیِ دکمهٔ شروع — از خودِ spec (درسِ رانِ اول)
    expect(s).toContain("تمرینِ سررسیدها"); // دکمهٔ دومِ معرفی (r415) با شمارِ ۱
    expect(s).toContain("دانلود تقویم مرور این تمرین: ۱ سررسید و ۲ مورد در دورهٔ نفس"); // ariaِ r418
    expect(s).toContain("rgba(80, 18, 28, 0.35)"); // سریالِ نوِ رزگونِ شب — اولینبار در خانواده
    expect(s).toContain("rgb(253, 164, 175)"); // مرکبِ رزگونِ شب
    expect(s).toContain("lab(96.2369 4.94155 1.28011)"); // رزگونِ روز — همموتورِ lab
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // بنفش — عینِ میزبان (r437)
    expect(s).toContain("نزدیکترین بازگشت: فردا"); // گویشِ فاصلهٔ ۱ در متنِ دیدنی
    expect(s).toContain("VIOLET-COUNT"); // درسِ r419: میزبان هنگامِ معرفی unmount است — شمارِ ۱
    expect(s).toContain("CHIP-OVER"); // قفلِ سرریزِ صفرِ چیپ‌ها
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("intro_layout"); // قفلِ چیدمان — wrap در پیامِ OK
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r412 — هفدهمین مصرفکننده", () => {
  it("qa-r412 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(SEVENTEENTH_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${SEVENTEENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: جلسهٔ کامل → رکورد در معرفی + چیپِ میزبان → ماندگاری پسِ reload", () => {
    const s = p(SEVENTEENTH_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("پیشرفت این تمرین"); // معرفی + چیپِ میزبان
    expect(s).toContain("localStorage"); // شاهدِ ماندگاریِ رکورد
    expect(s).toContain("location.reload");
  });
});

describe("r413 — هجدهمین مصرفکننده", () => {
  it("qa-r413 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(EIGHTEENTH_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${EIGHTEENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: جلسهٔ کامل با خطا → چیپِ رزگونِ بانکِ خطا + RAWِ localStorage → ماندگاری پسِ reload", () => {
    const s = p(EIGHTEENTH_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("بانک خطاهای این تمرین"); // چیپِ صادقِ معرفی
    expect(s).toContain("drillMistakes"); // شاهدِ مستقیمِ رکورد در RAWِ SyncField
    expect(s).toContain("location.reload");
  });
});

describe("r414 — نوزدهمین مصرفکننده", () => {
  it("qa-r414 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(NINETEENTH_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${NINETEENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ بانکِ خطا → چیپِ سررسیدِ صادق → سهمیهٔ موتور → ماندگاری", () => {
    const s = p(NINETEENTH_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("سررسیدهای مرور این تمرین"); // چیپِ زمردیِ SRS
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r415 — بیستمین مصرفکننده", () => {
  it("qa-r415 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTIETH_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTIETH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ سررسیدها → دکمهٔ تمرینِ سررسیدها → جلسهٔ فقطسررسیدِ صادق → ماندگاری", () => {
    const s = p(TWENTIETH_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("تمرینِ سررسیدها"); // دکمهٔ دومِ معرفی (r415)
    expect(s).toContain("شروع جلسهٔ تمرین فقط از سررسیدها"); // ariaِ دکمه
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r416 — بیستویکمین مصرفکننده", () => {
  it("qa-r416 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(TWENTYFIRST_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${TWENTYFIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: بذرِ نردبانِ نفس → چیپِ تکسررسید → پاسخِ درستِ بانکمحور → غیبشدنِ صادقِ چیپ", () => {
    const s = p(TWENTYFIRST_CONSUMER);
    expect(s).toContain("شروع تمرین افعال بی‌قاعده");
    expect(s).toContain("تمرینِ سررسیدها"); // دکمهٔ دومِ معرفی (r415)
    expect(s).toContain("__verbAns"); // پاسخِ درستِ بانکمحور — نقشهٔ appendix از bun
    expect(s).toContain("drillMistakes"); // بذرِ مستقیمِ RAW + شاهدِ ماندگاری
    expect(s).toContain("location.reload");
  });
});

describe("r441 — چهلوششمین مصرفکننده", () => {
  it("qa-r441 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYSIXTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYSIXTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: پردهٔ نتیجه در ۳۹۰ — جلسهٔ واقعیِ کامل، خودسازگاریِ نمره/بازخوانی + توکنِ مشترکِ liها", () => {
    const s = p(FORTYSIXTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — پردهٔ نتیجه هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("شروع جلسهٔ تمرین فعل"); // ariaِ واقعیِ شروع — از خودِ spec
    expect(s).toContain("گزینه ۱:"); // مسیرِ پاسخ — بُر خوردِ تصادفی، حکمِ خودسازگار
    expect(s).toContain("دیدن نتیجهٔ تمرین"); // ariaِ دکمهٔ آخرِ اجرا
    expect(s).toContain("بازخوانی سؤال‌های تمرین"); // ariaِ یکتای ulِ نتیجه — یابنده
    expect(s).toContain("نتیجهٔ تمرین"); // سرصفحهٔ صادقِ r401 (isReplay=false)
    expect(s).toContain("26px"); // نمرهٔ ۲۶px — قفلِ اندازه
    expect(s).toContain("پاسخِ تو:"); // پژواکِ پاسخِ غلط — بهازای هر li رز
    expect(s).toContain("مرور اشتباههای تمرین"); // ariaِ دکمهٔ مرور — فقط با غلط (r401)
    expect(s).toContain("تمرین دوباره"); // ariaِ دکمهٔ دوباره
    expect(s).toContain("بازگشت به جدول افعال از نتیجه"); // ariaِ خروج — از خودِ spec
    // کشفِ راند: liهایِ نتیجه با توکنِ مشترکِ خانوادهٔ چیپ رنگ میخورند
    // (r114 «یک پایه بهازای هر خانواده») — شب از توکنِ بازنگاشتِ .dark، روز از oklch:
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // زمردیِ شب — عینِ چیپِ زمردی
    expect(s).toContain("rgba(80, 18, 28, 0.35)"); // رزگونِ شب — عینِ چیپِ رزگونِ r440
    expect(s).toContain("rgba(140, 40, 55, 0.5)"); // حاشیهٔ رزِ شب — توکنِ rose-200
    expect(s).toContain("lab(35.2783 67.9912 -88.793)"); // نمرهٔ روز — عینِ مرکبِ بنفشِ r438
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // زمردیِ روز — عینِ چیپ
    expect(s).toContain("lab(96.2369 4.94155 1.28011)"); // رزگونِ روز — عینِ r440
    expect(s).toContain("LI-OVER"); // قفلِ سرریزِ صفرِ liها
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    // درسهایِ ابزاریِ راند: کارتِ نصبِ PWA پرده را میپوشاند + صحنه پیشِ شات
    expect(s).toContain("بستن پیشنهاد نصب");
    expect(s).toContain("qa_wait_toasts_clear");
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r442 — چهلوهفتمین مصرفکننده", () => {
  it("qa-r442 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYSEVENTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYSEVENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: نتیجهٔ مرور در ۳۹۰ — نقشهٔ آموختهشده از آشکارسازیِ aria + مرورِ صددرصدِ قطعی + r412 زنده", () => {
    const s = p(FORTYSEVENTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — شاخهٔ isReplay هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("مرور اشتباههای تمرین"); // درِ زیرجلسهٔ r401 — دکمهٔ رزِ نتیجهٔ پدر
    expect(s).toContain("— پاسخ درست"); // آموختنِ اندیسِ درست از آشکارسازیِ ariaِ همان پرسش
    expect(s).toContain("نتیجهٔ مرور"); // سرصفحهٔ صادقِ r401 در شاخهٔ isReplay — قفلِ نو
    expect(s).toContain("PCT"); // مرورِ قطعیِ صددرصد — درصدِ ۱۰۰
    expect(s).toContain("REPLAY-BTN-PRESENT"); // قراردادِ جلسهٔ تهیِ r401: بیغلط = بیمرور
    expect(s).toContain("پاسخِ تو:"); // صفرِ پژواک در مرورِ صددرصد
    expect(s).toContain("R412"); // مرور هرگز دوبارهشماری نمیکند — sessions/best در استور واقعی
    expect(s).toContain("bestPercent"); // صددرصدِ مرور نباید bestِ پدر را بالا ببرد
    // سریالهایِ خانواده (آموختهٔ r441 — بدونِ یادگیریِ نو):
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // زمردیِ شب — عینِ چیپ
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // زمردیِ روز
    expect(s).toContain("lab(35.2783 67.9912 -88.793)"); // نمرهٔ روز — عینِ بنفشِ خانواده
    expect(s).toContain("LI-OVER"); // قفلِ سرریزِ صفرِ liها
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r446 — پنجاهویکمین مصرفکننده", () => {
  it("qa-r446 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYFIRST_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYFIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: لانچرِ «مرور نشان‌شده‌ها» در ۳۹۰ — دو حالت + کلمپ + گروهِ طولِ جلسه + راندِ واقعی تا نتیجه", () => {
    const s = p(FIFTYFIRST_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — لانچرِ آزمون هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("مرور نشان‌شده‌ها"); // عنوانِ h2 — قفلِ نو
    expect(s).toContain("برای شروع مرور حداقل ۴ واژه نشان کن"); // حالتِ تهی — همان آستانهٔ r444
    expect(s).toContain("آزمونی از همین لیست"); // حالتِ آماده — زیرعنوانِ دقیق
    expect(s).toContain("رفتن به دیکشنری"); // درِ کهرباییِ حالتِ تهی
    expect(s).toContain("مثلاً: language یا زبان..."); // قراردادِ درِ زنده
    expect(s).toContain("شروع مرور (۴ سؤال)"); // کلمپِ ۸→۴ در متنِ دکمه (clamped=min(8,4))
    expect(s).toContain("طول جلسهٔ مرور"); // گروهِ ariaِ چیپهایِ ۸/۱۵
    expect(s).toContain("CHIP15-ENABLED-AT-4"); // لبهٔ ۴ستاره: ۱۵ غیرفعال (n>stars.length)
    expect(s).toContain("CHIP8-ENABLED-AT-4"); // یافتهٔ داوران: در کفِ ۴ستاره حتی ۸ هم غیرفعال است (گروه تزئینی)
    expect(s).toContain("مرور واژه‌های نشان‌شده — نتیجهٔ نهایی"); // پردهٔ نتیجهٔ standardCard (بدونِ گواهی)
    expect(s).toContain("تلاش مجدد"); // دکمهٔ restartِ پردهٔ نتیجه
    expect(s).toContain("data-quiz-option"); // راندِ واقعیِ immediate با گزینههایِ موتور
    expect(s).toContain("data-quiz-next"); // پیشرانِ سؤالِ بعدی
    expect(s).toContain("results-resume-row"); // درِ ضمیمه در پردهٔ نتیجه (قراردادِ r250 — opt-in)
    expect(s).toContain("my_words_review_start"); // دفترِ صادقِ DB — دقیقاً +۱ در رانِ قفل
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
    // سریالهایِ آموختهشده (شب/روز — خانوادهٔ کهرباییِ نو):
    expect(s).toContain("rgb(156, 149, 140)"); // زیرعنوانِ شب — عینِ لانچرهایِ r444/r445
    expect(s).toContain("rgba(180, 130, 20, 0.55)"); // حاشیهٔ درِ کهرباییِ شب — مکانیزمِ rgbaیِ خودش (قرینهٔ بنفشِ r444)
    expect(s).toContain("rgb(251, 191, 36)"); // مرکِ درِ کهرباییِ شب (amber-400ِ بازنگاشته)
    expect(s).toContain("linear-gradient(to left, lab(47.2709 42.9082 69.2966) 0%, rgb(194, 65, 12) 100%)"); // گرادیانِ شروع در شب — stopِ اول بازنگاشت نمیشود، دوم میشود
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ «1 / 4» در شب — عینِ زمردیِ r437/r438 (سومین عضو)
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // چیپِ «1 / 4» در روز — عینِ زمردیِ روز
    expect(s).toContain("SEC-OVERX"); // قفلِ سرریزِ صفرِ سکشن
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r447 — پنجاهودومین مصرفکننده", () => {
  it("qa-r447 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYSECOND_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYSECOND_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: آنسویِ لبهٔ تزئینی — ۸ستاره + راندِ ۸سؤالی + نقطهٔ شیرینِ ۱۵ستاره", () => {
    const s = p(FIFTYSECOND_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — حالتِ فعالِ گروهِ طولِ جلسه هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("مرور نشان‌شده‌ها"); // عنوانِ h2 — همان لانچرِ r446
    expect(s).toContain("آزمونی از همین لیست"); // حالتِ آماده — زیرعنوانِ دقیق
    expect(s).toContain("شروع مرور (۸ سؤال)"); // clamped=min(8,8)=۸ و min(8,15)=۸ — هر دو صحنه
    expect(s).toContain("طول جلسهٔ مرور"); // گروهِ ariaِ چیپهایِ ۸/۱۵
    expect(s).toContain("CHIP8-NOT-PRESSED"); // قراردادِ فشردگیِ چیپِ ۸ (aria-pressed=true)
    expect(s).toContain("CHIP15-ENABLED-AT-8"); // صحنهٔ ۸ستاره: ۱۵ هنوز غیرفعال (n>stars.length)
    expect(s).toContain("CHIP15-DISABLED-AT-15"); // صحنهٔ ۱۵ستاره: ۱۵ فعال میشود — نقطهٔ شیرین
    expect(s).toContain("1 / 8"); // چیپِ موتورِ ۸سؤالی — ارقامِ لاتین، برادرِ «1 / 4»ِ r446
    expect(s).toContain("مرور واژه‌های نشان‌شده — نتیجهٔ نهایی"); // پردهٔ نتیجهٔ standardCard
    expect(s).toContain("data-quiz-option"); // راندِ واقعیِ immediate با گزینههایِ موتور
    expect(s).toContain("data-quiz-next"); // پیشرانِ سؤالِ بعدی — هشت بار
    expect(s).toContain("results-resume-row"); // درِ ضمیمه در پردهٔ نتیجه (قراردادِ r250)
    expect(s).toContain("my_words_review_start"); // دفترِ صادقِ DB — دقیقاً +۱ در رانِ قفل
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
    // سریالهایِ آموختهشده (شب/روز — مکانیزمِ rgbaیِ چیپِ فعالِ کهربایی — نو):
    expect(s).toContain("rgba(87, 62, 14, 0.5)"); // پسزمینهٔ چیپِ فعالِ ۸ در شب — قرینهٔ شفافِ کهربایی
    expect(s).toContain("rgb(251, 191, 36)"); // مرکِ چیپِ فعالِ ۸ در شب — همان amber-400ِ درِ r446
    expect(s).toContain("rgba(180, 130, 20, 0.6)"); // حاشیهٔ چیپِ فعالِ ۸ در شب — خویشاوندِ درِ rgba(180,130,20,0.55)
    expect(s).toContain("lab(95.916 -1.21653 23.111)"); // پسزمینهٔ چیپِ فعالِ ۸ در روز
    expect(s).toContain("lab(47.2709 42.9082 69.2966)"); // مرکِ چیپِ فعالِ ۸ در روز — همان amber-700ِ در/گرادیان
    expect(s).toContain("lab(80.1641 16.6016 99.2089)"); // حاشیهٔ چیپِ فعالِ ۸ در روز
    expect(s).toContain("0.35"); // opacityِ چیپِ غیرفعالِ ۱۵ — numericِ disabled:opacity-35
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ «1 / 8» در شب — عینِ زمردیِ r437/r438/r446
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // چیپِ «1 / 8» در روز — عینِ زمردیِ روز
    expect(s).toContain("SEC-OVERX"); // قفلِ سرریزِ صفرِ سکشن
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r445 — پنجاهمین مصرفکننده", () => {
  it("qa-r445 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTIETH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTIETH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: لانچرِ دیکتهٔ ستاره‌ها در ۳۹۰ — دو حالت + درِ زنده + راندِ واقعیِ ۴واژه‌ای + پردهٔ پایان", () => {
    const s = p(FIFTIETH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — لانچرِ دیکته هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("دیکتهٔ ستاره‌ها"); // عنوانِ h2 — قفلِ نو
    expect(s).toContain("برای شروع دیکته حداقل ۴ واژه نشان کن"); // حالتِ تهی — کفِ DICTATION_MIN_STARS=۴ (همان کفِ لانچرِ آزمون)
    expect(s).toContain("املای شنیداری از همین لیست"); // حالتِ آماده — زیرعنوانِ دقیق
    expect(s).toContain("رفتن به دیکشنری"); // درِ حالتِ تهی
    expect(s).toContain("مثلاً: language یا زبان..."); // قراردادِ درِ زنده — رسیدن به دیکشنریِ واقعی
    expect(s).toContain("آزمون دیکته — املای شنیداری"); // تنظیماتِ جلسه
    expect(s).toContain("اولویت با واژه‌های یادنگرفته و سررسید"); // هوشمندِ پیشفرضِ روشن
    expect(s).toContain("type the word..."); // ورودیِ اجرا
    expect(s).toContain("پخش دوبارهٔ کلمه"); // دکمهٔ صدای اجرا
    expect(s).toContain("دیکته تمام شد!"); // پردهٔ پایان
    expect(s).toContain("امتیاز ۴ از ۴"); // درصدِ ۱۰۰ — چهار پاسخِ درست از نقشهٔ fa→en
    expect(s).toContain("بازگشت به واژه‌های من"); // قراردادِ خروجِ exitLabel
    expect(s).toContain("1:ability"); // چهار ستارهٔ واقعیِ درسِ ۱ (رانِ learn²/³)
    expect(s).toContain("srs"); // دفترِ صادق — reviewWord روی کلیدهایِ ستاره نوشت
    expect(s).toContain("my_words_dictation_start"); // دفترِ صادقِ DB — دقیقاً +۱ (یک کلیکِ لانچر)
    expect(s).toContain("my-words-dictation"); // کشفِ نو: دیکته POST میزند (lesson=0) — برخلافِ فلشکارت
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
    // سریالهایِ آموختهشده (شب/روز):
    expect(s).toContain("rgb(156, 149, 140)"); // زیرعنوانِ شب — عینِ لانچرِ فلشکارتِ r444
    expect(s).toContain("rgba(130, 100, 190, 0.55)"); // حاشیهٔ درِ شب — عینِ r444
    expect(s).toContain("linear-gradient(to left in oklab, rgb(139, 92, 246) 0%, rgb(217, 70, 239) 100%)"); // گرادیانِ شروع — یکسان در هر دو حالت
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // چیپِ پیشرفتِ اجرا در شب — عینِ چیپِ بنفشِ r437/r438
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ کاملِ پایان در شب — عینِ چیپِ زمردیِ r437/r438
    expect(s).toContain("lab(35.2783 67.9912 -88.793)"); // مرکِ در/چیپِ روز — عینِ بنفشِ خانواده
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // چیپِ کاملِ روز — عینِ زمردیِ r437/r438
    expect(s).toContain("SEC-OVERX"); // قفلِ سرریزِ صفرِ سکشن
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r444 — چهلونهمین مصرفکننده", () => {
  it("qa-r444 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYNINTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYNINTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: خانوادهٔ تهی در ۳۹۰ — دو حالتِ تهیِ لانچر + درِ دیکشنری + مسیرِ واقعیِ بلدشدن", () => {
    const s = p(FORTYNINTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — خانوادهٔ تهی هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("برای فلش‌کارت حداقل یک واژه نشان کن"); // تهیِ ستارهای — قفلِ نو
    expect(s).toContain("همهٔ واژه‌های نشان‌شده را بلدی"); // دامنهٔ بلدم‌نشدهِ کامل — قفلِ نو
    expect(s).toContain("رفتن به دیکشنری"); // درِ هر دو حالتِ تهی
    expect(s).toContain("مثلاً: language یا زبان..."); // قراردادِ درِ زنده — رسیدن به دیکشنریِ واقعی
    expect(s).toContain("START-PRESENT"); // شروع فقط با دِکِ غیرتهی — درِ تهی نبودش را قفل میکند
    expect(s).toContain("SCOPE-PRESENT"); // گروهِ دامنه فقط با ستاره — قفلِ شرطِ ستارهدار
    expect(s).toContain("SCOPE-ROUNDTRIP"); // رفتوبرگشتِ دامنه — «همه» شروع را برمیگرداند
    expect(s).toContain("بلدم‌نشده"); // دامنهٔ کاملکنندهٔ مسیرِ «عجب!»
    expect(s).toContain("کارت ۱ از ۱"); // موتورِ تک‌کارتی — لبهٔ منحطِ مسیرِ واقعیِ بلدشدن
    expect(s).toContain("پاسِ مرورِ هوشمند تمام شد"); // پردهٔ پایانِ منحطِ ۱کارتی — عینِ قراردادِ r443
    expect(s).toContain("knownAbility"); // بلدشدن از مسیرِ UIِ واقعی — نه بذرِ مستقیم (درسِ رانِ اول)
    expect(s).toContain("flashcard_done"); // دفترِ صادق — دقیقاً +۱ از پاسِ تک‌کارتی (۲→۳ در یادگیری)
    // سریالهایِ آموختهشده (شب: سنگیِ بازنگاشته + rgbaیِ حاشیه؛ روز: labِ همموتور):
    expect(s).toContain("rgb(156, 149, 140)"); // زیرعنوانِ شب — سنگیِ بازنگاشته
    expect(s).toContain("rgb(196, 181, 253)"); // مرکِ درِ شب — عینِ تحویلِ r443 و نمرهٔ r441/r442
    expect(s).toContain("rgba(130, 100, 190, 0.55)"); // حاشیهٔ بنفشِ شب — مکانیزمِ rgbaیِ واقعی
    expect(s).toContain("lab(35.2783 67.9912 -88.793)"); // مرکِ درِ روز — عینِ بنفشِ r437/r438/r443
    expect(s).toContain("lab(93.0838 4.35197 -9.88284)"); // چیپِ فعال — در هر دو حالت یکسان (بازنگاشتِ شب نمیگیرد)
    expect(s).toContain("SEC-OVERX"); // قفلِ سرریزِ صفرِ سکشن
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r443 — چهلوهشتمین مصرفکننده", () => {
  it("qa-r443 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FORTYEIGHTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FORTYEIGHTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: پردهٔ پایانِ فلش‌کارت در ۳۹۰ — گاردِ پاسِ تمام + تحویلِ دستی + سریالهایِ همخانواده", () => {
    const s = p(FORTYEIGHTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — پردهٔ پایان هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("پاسِ مرورِ هوشمند تمام شد"); // عنوانِ دقیقِ گاردِ راندِ ۲۷۴ — قفلِ نو
    expect(s).toContain("ادامهٔ مرورِ دستی — همهٔ کارت‌ها"); // دکمهٔ تحویل به حالتِ دستی
    expect(s).toContain("RUN-SURFACE-HERE"); // پردهٔ اجرا واقعاً جایگزین شده (نه flip-card)
    expect(s).toContain("LAUNCHER-HERE"); // لانچر هم در حکمِ پایان غایب است
    expect(s).toContain("LIST-ORDER-OK"); // ترتیبِ دِک == لیستِ «واژه‌های من» (تازهترینِ پیشفرض)
    expect(s).toContain("[...ok].reverse()"); // منبعِ همان قرارداد — سطرِ sort=="new" در my-words
    expect(s).toContain("کارتِ باقی‌مانده"); // نوارِ صادقِ ۲۷۴ — ۳→۲→۱
    expect(s).toContain("۳ بلدم"); // اثرِ انباشته در ورِ دوم + پاسِ فوریِ سررسیدِ خالی
    expect(s).toContain("flashcard_done"); // دفترِ صادق — دقیقاً یکبار در پاسِ آخر
    // سریالهایِ آموختهشده (شب: سنگیِ بازنگاشته + oklabِ بنفش؛ روز: labِ همموتور):
    expect(s).toContain("rgb(28, 25, 23)"); // پنلِ شب — stone-800ِ بازنگاشته
    expect(s).toContain("oklab(0.605991 0.096526 -0.230582 / 0.1)"); // تحویلِ بنفشِ شب — مکانیزمِ oklab
    expect(s).toContain("rgb(196, 181, 253)"); // مرکِ تحویلِ شب — عینِ نمرهٔ r441/r442
    expect(s).toContain("lab(96.2416 2.28849 -5.51657)"); // تحویلِ روز — عینِ چیپِ بنفشِ r437/r438
    expect(s).toContain("lab(35.2783 67.9912 -88.793)"); // مرکِ تحویلِ روز — عینِ بنفشِ خانواده
    expect(s).toContain("PANEL-OVERX"); // قفلِ سرریزِ صفرِ پنل
    expect(s).toContain("DOC-OVERX"); // قفلِ سرریزِ صفرِ سند
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
  });
});

describe("r448 — پنجاهوسومین مصرفکننده", () => {
  it("qa-r448 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYTHIRD_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYTHIRD_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: قراردادِ «تلاش مجدد» — بازچرخشِ بیِ شلیکِ دوباره + attemptِ دوم + Q1-IDENTICAL", () => {
    const s = p(FIFTYTHIRD_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — دری که هرگز زیرِ ۱۲۸۰ رانده نشده بود
    expect(s).toContain("مرور نشان‌شده‌ها"); // لانچرِ r446/r447 — پیوستگیِ سریال
    expect(s).toContain("شروع مرور (۸ سؤال)"); // همان لانچرِ ۸ستاره
    expect(s).toContain('تلاش مجدد"'); // هستهٔ راند — کلیکِ برچسبِ دقیقِ onRestart
    expect(s).toContain("window.__r448Q1"); // بایگانیِ سؤالِ اولِ راندِ اول — قفلِ هویت
    expect(s).toContain("Q1-IDENTICAL"); // سؤالِ پس از بازچرخش = عینِ سؤالِ بایگانیشده
    expect(s).toContain("Q1-CHANGED"); // حکمِ خرابِ هویت — FAILشمار
    expect(s).toContain("1 / 8"); // چیپِ موتور پس از بازچرخش — ماشینِ حالتِ صفرشده
    expect(s).toContain("FINAL-TITLE-STILL-THERE"); // هیچ آرتیفکتِ نتیجه نمیماند
    expect(s).toContain("RETRY-BTN-STILL-THERE"); // دکمهٔ تلاش مجددِ قبلی میرود
    expect(s).toContain("RESUME-ROW-STILL-THERE"); // ردیفِ ضمیمهٔ پردهٔ قبلی میرود
    expect(s).toContain("PROGRESS-NOT-RESET"); // نوارِ پیشرفتِ صفرشده (restart)
    expect(s).toContain("مرور واژه‌های نشان‌شده — نتیجهٔ نهایی"); // پردهٔ نتیجهٔ هر دو راند
    expect(s).toContain("results-resume-row"); // درِ ضمیمه در هر دو پرده (قراردادِ r250)
    expect(s).toContain("my_words_review_start"); // قراردادِ منبع: دوباره شلیک «نمیشود» (میانپروازی=۱، نهایی=۱)
    expect(s).toContain("quiz_done"); // دو پایانِ راند = ۲
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
    // سریالهایِ قفلشدهٔ میراث (شب/روز):
    expect(s).toContain("rgb(236, 234, 230)"); // عنوانِ موتور در شب — عینِ r447
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ «1 / 8» در شب — عینِ زمردیِ r437/r438/r446/r447
    expect(s).toContain("rgb(110, 231, 183)"); // مرکِ زمردیِ شب
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // چیپِ زمردیِ روز
    expect(s).toContain("lab(44.4871 -41.0396 11.0361)"); // مرکِ زمردیِ روز
    expect(s).toContain("rgb(156, 149, 140)"); // زیرعنوانِ لانچرِ شب — پیوستگیِ r447
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("data-quiz-option"); // هر دو راندِ واقعیِ immediate
    expect(s).toContain("data-quiz-next"); // پیشرانِ هر دو راند
    expect(s).toContain("ATTEMPTS-NOW"); // دفترِ میانپروازی (۱) و نهایی (۲) — attemptِ دومِ POSTشده
    expect(s).toContain("MYWORDS-ATTEMPTS"); // هر دو attemptِ my-words با total=۸
  });
});

describe("r449 — پنجاهوچهارمین مصرفکننده", () => {
  it("qa-r449 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYFOURTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    // گاردِ موبایلِ کتابخانهای — رانِ موازیِ محلی ممنوع (ایدئومِ r381)
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYFOURTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: کارتِ گواهیِ پایانترم در ۳۹۰px — شبِ تیرهشده + fallbackِ امردی + exam_done", () => {
    const s = p(FIFTYFOURTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — خانوادهٔ دیپلم هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("آزمون جامع پایان ترم"); // ModeCardِ ورود به تنظیماتِ پایانترم
    expect(s).toContain("پایهٔ هفتم"); // کوتاهترین استخرِ واقعی — ۱۰ سؤال از درس ۱۰
    expect(s).toContain("بدون تایمر"); // خاموشیِ تایمر — برشِ زمانیِ QA
    expect(s).toContain("شروع آزمون پایان‌ترم"); // دکمهٔ شروعِ استخرِ واقعی
    expect(s).toContain("G11-DEFAULT"); // حکمِ پیشفرضِ یازدهم (aria-pressed) پیشِ گزینشِ هفتم
    expect(s).toContain("1 / 10"); // چیپِ موتورِ ۱۰سؤالی — ارقامِ لاتین، خانوادهٔ زمردی
    expect(s).toContain("پاسخ‌ها در پایان نمایش داده می‌شوند"); // امضای immediate=false در حالتِ آزمون
    expect(s).toContain("data-quiz-feedback"); // حکمِ «نه» — فیدبکِ لحظهای در حالتِ آزمون ممنوع
    expect(s).toContain("certificate-card"); // هستهٔ راند — کارتِ گواهی
    expect(s).toContain("cert-seal"); // مُهرِ چرخیدهٔ data-testid
    expect(s).toContain("SEAL-NOT-ROTATED"); // حکمِ چرخش (rotate: 6deg در تیلویند ۴)
    expect(s).toContain("WEBBOOK CERTIFICATE"); // سرلوحهٔ لاتینِ گواهی
    expect(s).toContain("گواهیِ عملکردِ آرش-قهرمان"); // نامِ شخصیِ شده از بذرِ persona
    expect(s).toContain("تاریخ اخذ:"); // پانویسِ تاریخ + gradeLabelِ «پایهٔ هفتم»
    expect(s).toContain("درس دهم"); // ردیفِ شکستِ بانک (l10 — تنها منبعِ پایهٔ هفتم)
    expect(s).toContain("border-stone-100"); // قفلِ ردیفِ دقیقِ شکست (نه پدرش)
    expect(s).toContain("اشتراک‌گذاری نتیجه"); // چهار دکمهٔ گواهی
    expect(s).toContain("تلاش مجدد"); // درِ r448 رویِ میزبانِ گواهی
    expect(s).toContain("RETRY-EXAM-DARK"); // بازگشتِ «تلاش مجدد» به موتورِ «1 / 10»
    expect(s).toContain("results-resume-row"); // درِ ضمیمه در گواهی (resumeDoor — r247)
    expect(s).toContain("REVIEW-QS"); // ده سؤالِ مرورِ زیرِ کارت (max-h-46vh)
    // سریالهایِ قفلشده (شبِ تیرهشده / روزِ کاغذسفید):
    expect(s).toContain("rgb(28, 25, 23)"); // پسزمینهٔ گواهی در شب — عینِ #1c1917 در globals.css
    expect(s).toContain("rgb(252, 211, 77)"); // مرکِ نام در شب — amber-300
    expect(s).toContain("lab(37.8822 37.1699 52.2718)"); // مرکِ نام در روز — amber-800
    expect(s).toContain("rgb(255, 255, 255)"); // کاغذِ روز
    expect(s).toContain("in oklab"); // درونیابیِ گرادیانِ مُهر/قرص در شب
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ «1 / 10» در شب — عینِ زمردیِ r437/…
    expect(s).toContain("exam_done"); // دفترِ صادقِ DB — هر پایان +۱ (بدونِ رویدادِ شروع)
    expect(s).toContain("final-7"); // attemptِ امضاشده با category=final-7
    expect(s).toContain("drill_due_jump"); // دفترِ صادقِ DB — پرشی ندارد
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441 — کارتِ نصب پرده را میپوشاند
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395 پیشِ شات
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r450 — پنجاهوپنجمین مصرفکننده", () => {
  it("qa-r450 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYFIFTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYFIFTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: گواهیِ تایمدار + بازخوانیِ رکورد — تیکِ دترمینیستیک + سه راوی + DOM↔DB", () => {
    const s = p(FIFTYFIFTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — گواهیِ تایمدار هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("پایهٔ هفتم"); // همان استخرِ ارزانِ r449 — تایمرِ پیشفرضِ روشن
    expect(s).toContain("با تایمر"); // دستنخوردنِ پیشفرضِ timed=true — امضای صحنهٔ A
    expect(s).toContain("freshNoBanner"); // حکمِ «هنوز رکوردی نیست» در بوتِ تازه
    expect(s).toContain("7:30"); // ۴۵۰s = ۱۰×۴۵ — شمارشِ آغازینِ چهرهٔ هشتم
    expect(s).toContain("TIMER-TICKING-OK"); // زندهبودنِ دترمینیستیک (Promiseِ درون-eval)
    expect(s).toContain("TIMER-FROZEN"); // FAILشمارِ شمارشِ یخزده
    expect(s).toContain("1600"); // پنجرهٔ تیک — درسِ مسابقهٔ دو-eval در رانِ learn
    expect(s).toContain("TMR-NOT-FRESH"); // قفلِ پنجرهٔ تازگی (۰ < tsec ≤ ۴۵۰)
    expect(s).toContain("پاسخ‌ها در پایان نمایش داده می‌شوند"); // immediate=false — حالتِ آزمون
    expect(s).toContain("1 / 10"); // چیپِ خانوادهٔ زمردی
    expect(s).toContain("certificate-card"); // گواهیِ تایمدار — سریالهایِ r449
    expect(s).toContain("TIMER-STILL-THERE"); // چیپِ تایمر در پردهٔ نتیجه باید برود
    expect(s).toContain("بهترین نتیجهٔ شما در آزمون پایان ترم"); // بنرِ بازخوانیِ رکورد
    expect(s).toContain("بهترین:"); // کارتِ پایهٔ هفتم — راویِ دوم
    expect(s).toContain("بهترین نتیجه:"); // ModeCard — راویِ سوم
    expect(s).toContain("RAVIES-DISAGREE"); // حکمِ ناهماهنگیِ سه راوی — FAILشمار
    expect(s).toContain("BANNER-BORDER-NOT-EMERALD-AT"); // حاشیهٔ همساز با درصد (≥۷۰ زمردی)
    expect(s).toContain("BANNER-BORDER-NOT-AMBER-AT"); // وگرنه کهربایی — خطِ 451
    expect(s).toContain("border-emerald-200"); // قفلِ متنِ خطِ حاشیه
    expect(s).toContain("toEn"); // تبدیلِ ارقامِ فارسیِ faNum برایِ مقایسهٔ عددی
    expect(s).toContain("DOM-PERCENT"); // قفلِ میان-رسانه: درصدِ DOM === درصدِ attemptِ DB
    expect(s).toContain("exam_done"); // دفترِ صادق — یک پایان
    expect(s).toContain("final-7"); // attemptِ امضاشده
    expect(s).toContain("drill_due_jump"); // پرشی ندارد
    // سریالهایِ قفلشده (چیپِ تایمر — چهرهٔ سنگیِ آرام):
    expect(s).toContain("rgb(40, 36, 31)"); // پسزمینهٔ چیپِ تایمر در شب
    expect(s).toContain("rgb(168, 162, 155)"); // مرکِ چیپِ تایمر در شب
    expect(s).toContain("lab(96.5286 -0.0991821 0.364268)"); // پسزمینهٔ روز
    expect(s).toContain("lab(35.5168 1.08604 4.07829)"); // مرکِ روز
    expect(s).toContain("rgb(255, 255, 255)"); // کاغذِ روزِ گواهی (میراثِ r449)
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395
    expect(s).toContain("qa_to_dark"); // شبِ واقعی
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r451 — پنجاهوششمین مصرفکننده", () => {
  it("qa-r451 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIFTYSIXTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_shot\(\)/m);
    expect(s).not.toMatch(/^qa_ensure_alive\(\)/m);
    expect(s).toContain("qa_seed_guard_mobile");
    expect(s).not.toMatch(/^qa_seed_guard_mobile\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYSIXTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: نهمین چهرهٔ آزمون — بانکِ بذر + حلقهٔ آموزشیِ کامل + قفلِ میان-رسانه", () => {
    const s = p(FIFTYSIXTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — مرورِ اشتباهات هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("mistakes-cta"); // CTAِ رزگون — کلیکِ مستقیم (درسِ learn3: «شروع مرور» SPAN است)
    expect(s).toContain("0:x-23','0:x-5"); // بانکِ بذرِ پرسونای r324 — عینِ حقیقت (هر دو کلید، بایت‌به‌بایت)
    expect(s).toContain("SEED-KEYS-EXACT"); // حکمِ برابریِ بایت‌به‌بایتِ بانکِ بذر
    expect(s).toContain("CTA-STILL-THERE"); // FAILشمارِ CTA در بستهشدنِ حلقه
    expect(s).toContain("BANK-NOT-EMPTY"); // FAILشمارِ بانک در بستهشدنِ حلقه
    expect(s).toContain("بدون تایمر"); // راندِ exam بی تایمر — گامِ صادقانه
    expect(s).toContain("پاسخ‌ها در پایان نمایش داده می‌شوند"); // immediate=false — امضایِ exam
    expect(s).toContain("NEXT-AT-IMMEDIATE-ENTRY"); // امضایِ نهمین چهره: بدونِ «بعدی» در ورودِ immediate
    expect(s).toContain("سؤال بعدی"); // برچسبِ بعدیِ immediate
    expect(s).toContain("دیدن نتیجه"); // برچسبِ پایانِ immediate
    expect(s).toContain("سؤال به بانک مرور اشتباهات اضافه شد"); // چیپِ تغذیهٔ بانک — خوانده، نه حدس
    expect(s).toContain("۰-۹\\d]"); // درسِ learn2: چیپِ عددِ خامِ لاتین رندر میکند ({wrongIds.length} بی faNum)
    expect(s).toContain("border-emerald-500"); // شاخصِ پاسخِ درست از ردیفِ سبزِ بازخورد
    expect(s).toContain("border-rose-400"); // ردیفِ انتخابِ غلط
    expect(s).toContain("window.__r451"); // بایگانیِ «یادگیری از بازخورد» — شاخصِ درست هر سؤال
    expect(s).toContain("NO-LEARNED"); // FAILشمارِ پاسخِ بیبایگان — حکمِ رانِ ۲
    expect(s).toContain("CTA-COUNT-MISMATCH"); // قفلِ خودسازگاریِ شمارشِ CTA با بانک
    expect(s).toContain("my_words_review_start"); // دفترِ صادق — خانوادهٔ آزمون آن را نمیزند
    expect(s).toContain("exam_done"); // فقط راندِ exam — مرور نمیزند
    expect(s).toContain("'exam','mistakes'"); // attemptهایِ امضاشده: بانک ۰ + mistakes
    expect(s).toContain("drill_due_jump"); // پرشی ندارد
    // سریالهایِ زمردیِ میراث (r437/…/r448) — چهرهٔ نهم همان خانواده:
    expect(s).toContain("rgb(236, 234, 230)"); // عنوانِ شب
    expect(s).toContain("rgba(6, 55, 40, 0.35)"); // چیپِ شب
    expect(s).toContain("rgb(110, 231, 183)"); // مرکِ چیپِ شب
    expect(s).toContain("lab(15.0353 1.96067 1.53427)"); // عنوانِ روز
    expect(s).toContain("lab(97.8462 -6.94966 1.85487)"); // چیپِ روز
    expect(s).toContain("lab(44.4871 -41.0396 11.0361)"); // مرکِ چیپِ روز
    // خانوادهٔ رزِ CTA (نو — learn/lock دوحالته):
    expect(s).toContain("lab(76.6339 38.3549 9.68835)"); // حاشیهٔ روز
    expect(s).toContain("lab(41.1651 71.6251 30.3087)"); // جعبهٔ آیکن (rose-700 به lab)
    expect(s).toContain("lab(49.1882 81.577 36.0311)"); // قرصِ «شروع مرور» (rose-600 به lab)
    expect(s).toContain("rgba(150, 50, 65, 0.55)"); // حاشیهٔ شب
    expect(s).toContain("rgba(88, 18, 30, 0.5)"); // گرادیانِ شب — عینِ globals.css
    expect(s).toContain("270deg"); // درسِ learn3: ابطالِ !important شب به درجه سریال میشود
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395
    expect(s).toContain("qa_to_dark"); // درسِ r448 — شبِ صریح پیشِ هر داوریِ شب
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
  });
});

describe("r452 — پنجاهوهفتمین مصرفکننده (شاهدِ موبایلِ «دیکتهٔ واژگان»)", () => {
  it("منبع مصرفکننده حاضر است و qa-lib را source میکند", () => {
    const s = p(FIFTYSEVENTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).toContain("qa_wait_home");
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYSEVENTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: دهمین چهرهٔ آزمون — بانکِ RAWِ ۱۷۲ + تایپِ React + حلقهٔ دیکته + گویشِ نیمامتیاز", () => {
    const s = p(FIFTYSEVENTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل — دیکتهٔ آزمون هرگز زیرِ ۱۲۸۰ دیده نشده بود
    expect(s).toContain("exam-dict-cta"); // CTAِ زمردی — دهمین چهرهٔ خانوادهٔ آزمون
    expect(s).toContain("دیکتهٔ واژگان — جامع و پایه‌محور"); // عنوانِ CTA
    expect(s).toContain("if(n!==172)"); // بانکِ RAW = ۱۷۲ (خودِ DOM معلّم شد — نه ۱۴۹ِ کهنهٔ کامنتِ منبع)
    expect(s).toContain("کتابِ هر ۶ پایه"); // زیرعنوانِ شش دِکِ پایه‌محور
    expect(s).toContain("دامنهٔ دیکته"); // گروهِ چیپهایِ دامنه (aria)
    expect(s).toContain("پایهٔ هفتم','۹۸۸"); // شمارشهایِ RAWِ دِکها (baked از bun — قفلِ عددی)
    expect(s).toContain("بانک آزمون"); // چیپِ بانک (aria-pressed=true)
    expect(s).toContain("آزمون دیکته — املای شنیداری"); // h3ِ کارتِ تنظیمات
    expect(s).toContain("اولویت با واژه‌های یادنگرفته و سررسید"); // سوییچِ ترتیبِ هوشمند
    expect(s).toContain("type the word..."); // inputِ dir=ltr — تایپِ واقعی در ۳۹۰
    expect(s).toContain("HTMLInputElement.prototype"); // native setter — مسیرِ onChangeِ React (تایپِ حرفبهحرف)
    expect(s).toContain("CHECK-NOT-DISABLED-AT-EMPTY"); // «بررسی» در ورودِ inputِ تهی معلول است
    expect(s).toContain("گوش کنید و املای کلمه را بنویسید"); // خطِ گوش
    expect(s).toContain("پخش دوبارهٔ کلمه"); // دکمهٔ بزرگِ TTS
    expect(s).toContain("روخوانی در دسترس نیست"); // ردیفِ کهرباییِ افتِ صادقِ r345 — قفلشده (AUDIO-ROW=1)
    expect(s).toContain("NO-AUDIO-ROW"); // در lock داوری میشود که ردیفِ افت حاضر بماند
    expect(s).toContain("آفرین! املا درست است"); // ردیفِ درست — نیم امتیازِ با راهنما
    expect(s).toContain("با راهنما — نیم امتیاز"); // قراردادِ نیمامتیاز
    expect(s).toContain("املای درست:"); // ردیفِ رزِ «رد کردن» + جعبههایِ حرف
    expect(s).toContain("border-rose-300"); // جعبههایِ رزِ خطخورده
    expect(s).toContain("واژهٔ بعدی"); // دکمهٔ گذر از ردیفِ رز
    expect(s).toContain("دیکته تمام شد!"); // پردهٔ done
    expect(s).toContain("امتیاز ۳.۵ از ۸"); // ۷×۰.۵ — قفلِ عددیِ faNumِ اعشار (نقطهٔ لاتین)
    expect(s).toContain("با راهنما: ۷"); // چیپِ نیمامتیازها
    expect(s).toContain("غلط: ۱"); // چیپِ ردشده
    expect(s).toContain("واژه‌های این دور"); // شبکهٔ مرورِ ۸تایی
    expect(s).toContain("بازگشت به آزمون جامع"); // exitLabelِ دیالوگِ آزمون
    expect(s).toContain("SRS-HIT"); // قفلِ میان-رسانهٔ DOM↔SRS — هشت کلیدِ store
    expect(s).toContain("MISTAKES-INTACT"); // دیکته هرگز mistakes را نمیزند (x-5/x-23 پابرجا)
    expect(s).toContain("HALF-CREDIT-DIALECT-OK"); // DOM=۴۴٪ (۳.۵/۸ خام) | DB=۵۰٪ (۴/۸ گردشده) — دو راویِ دو قرارداد
    expect(s).toContain("exam_dictation_start"); // رویدادِ شروع (یک کلیکِ CTA)
    expect(s).toContain("dictation_done"); // رویدادِ پایانِ دیکته (questِ روزانه)
    expect(s).toContain("exam-dictation"); // attemptِ امضاشده: lesson=0/total=8/correct=4/percent=50
    expect(s).toContain("my_words_review_start"); // دفترِ صادق — دیکتهٔ آزمون آن را نمیزند
    expect(s).toContain("drill_due_jump"); // پرشی ندارد — ۱۳۱ دستنخورده
    // سریالهایِ خانوادهٔ زمردیِ CTA (learn/lock دوحالته — نو):
    expect(s).toContain("lab(90.2247 -31.039 9.47084)"); // حاشیهٔ روز (emerald-200)
    expect(s).toContain("rgba(30, 110, 80, 0.5)"); // حاشیهٔ شب (.dark .border-emerald-200 — عینِ globals)
    expect(s).toContain("rgba(6, 55, 40, 0.5)"); // گرادیانِ شب — عینِ globalsِ خطِ ۴۹۲
    expect(s).toContain("270deg"); // درسِ r451: !importantِ شب به درجه سریال میشود
    expect(s).toContain("lab(66.9756 -58.27 19.5419)"); // جعبهٔ آیکن (emerald-500) — در هر دو حالت ثابت
    // خانوادهٔ بنفشِ دیالوگ + چیپهایِ play:
    expect(s).toContain("lab(41.088 68.9966 -91.995)"); // بنفش-۶۰۰ (چیپِ فعال + ٪ done)
    expect(s).toContain("linear-gradient(to left in oklab, rgb(124, 58, 237) 0%, rgb(192, 38, 211) 100%)"); // گرادیانِ آرکیدِ روز
    expect(s).toContain("linear-gradient(to left in oklab, rgb(91, 33, 182) 0%, rgb(134, 25, 143) 100%)"); // گرادیانِ آرکیدِ شب
    expect(s).toContain("rgba(59, 40, 92, 0.35)"); // چیپِ «۱ از ۸» شب
    expect(s).toContain("rgb(196, 181, 253)"); // مرکِ چیپِ شب (بنفش-۳۰۰)
    expect(s).toContain("lab(96.5286 -0.0991821 0.364268)"); // چیپِ «امتیاز: ۰» روز — عینِ میراثِ تایمچیپِ r450
    expect(s).toContain("rgb(40, 36, 31)"); // چیپِ امتیازِ شب — عینِ r450
    // مرورِ زندهٔ دوحالتهٔ راند (درسِ lock اول — شبِ صریح پیشِ واژههایِ ۱-۶):
    expect(s).toContain("DARK_FB_INK"); // زمردِ شبِ ردیفِ درست (rgb(110,231,183) — خانوادهٔ r437/…/r451)
    expect(s).toContain("LIGHT_FB_INK"); // زمردِ روزِ ردیفِ درست (lab(44.4871…) — عینِ قرصِ CTA)
    expect(s).toContain("ROSE_FB_INK"); // رزِ روزِ ردیفِ «املای درست» (lab(41.1651…) — عینِ خانوادهٔ r451)
    expect(s).toContain("qa_to_dark"); // درسِ r448 — ششمی: شبِ صریح پیشِ هر داوریِ شب
    expect(s).toContain("qa_to_light"); // پایهٔ روشن
    expect(s).toContain("بستن پیشنهاد نصب"); // درسِ r441
    expect(s).toContain("qa_wait_toasts_clear"); // درسِ r395
  });
});

describe("r453 — پنجاهوهشتمین مصرفکننده (شاهدِ موبایلِ «سوییچِ دامنهٔ دیکته»)", () => {
  it("منبع مصرفکننده حاضر است و qa-lib را source میکند", () => {
    const s = p(FIFTYEIGHTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).toContain("qa_wait_home");
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYEIGHTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: remountِ key={dictScope} + چیپهایِ دامنه + راندِ dict-g7 + هیچِ attemptِ سایه", () => {
    const s = p(FIFTYEIGHTH_CONSUMER);
    expect(s).toContain("390 844"); // بندِ موبایل
    expect(s).toContain("دامنهٔ دیکته"); // گروهِ aria چیپها
    expect(s).toContain("if(chips.length!==7)"); // ۷ چیپ: بانک + شش پایه
    expect(s).toContain("پایهٔ هفتم','۹۸۸"); // شمارشهایِ RAW دِکها (baked)
    expect(s).toContain("aria-pressed"); // قراردادِ pressed
    expect(s).toContain("click_scope_chip"); // کلیکِ چیپِ پایهٔ هفتم در میانهٔ راند
    expect(s).toContain("judge_remount"); // داورِ remount
    expect(s).toContain("INPUT-STILL-THERE"); // UIِ play باید غیب شود
    expect(s).toContain("PROG-STILL-THERE"); // چیپِ «۳ از ۸» غیب
    expect(s).toContain("COUNT-RESET-TO-10"); // تفنگِ دودِ remount: countِ ۸ انتخابی → پیشفرضِ ۱۰
    expect(s).toContain("key={dictScope}"); // قراردادِ remount در exam-view
    // سریالهایِ نوِ قفلشده از LEARN:
    expect(s).toContain("lab(87.4504 19.6 -6.46662)"); // چیپِ فعالِ صورتیِ روز (pink-200)
    expect(s).toContain("lab(96.4459 4.53997 -1.49434)"); // پسزمینهٔ صورتیِ روز (pink-50)
    expect(s).toContain("lab(42.1737 71.8009 7.42233)"); // مرکبِ صورتیِ روز (pink-700)
    expect(s).toContain("rgba(190, 45, 110, 0.5)"); // حاشیهٔ صورتیِ شب
    expect(s).toContain("rgba(88, 14, 44, 0.35)"); // پسزمینهٔ صورتیِ شب
    expect(s).toContain("lab(77.8308 38.525 -10.5394)"); // مرکبِ صورتیِ شب (pink-300)
    expect(s).toContain("lab(91.055 0.663072 0.865579)"); // چیپِ غیرفعالِ روز (c-card)
    expect(s).toContain("rgb(55, 49, 43)"); // حاشیهٔ غیرفعالِ شب (stone-800)
    expect(s).toContain("rgb(156, 149, 140)"); // مرکبِ غیرفعالِ شب — عینِ میراثِ r448
    // راندِ واقعیِ dict-g7 + میان-رسانه:
    expect(s).toContain("drive_word"); // راهنما + تایپِ React + بررسی
    expect(s).toContain("drive_skip"); // واژهٔ هشتم — مسیرِ دستیِ r452
    expect(s).toContain("border-rose-300"); // جعبههایِ رز
    expect(s).toContain("capture_toast"); // شکارِ توستِ برچسبِ دِک (تشخیصیِ غیرِگیت)
    expect(s).toContain("دیکتهٔ پایهٔ هفتم"); // راویِ برچسبِ دِک
    expect(s).toContain("SRS-HIT"); // ۱۰/۱۰ — ۲ رهاشده + ۸ کامل
    expect(s).toContain("SEEN-HIT"); // wordSeenِ ۱۰واژه
    expect(s).toContain("WORDMIS-HIT"); // wordMistakesِ ۱۰واژه (همه با راهنما/رد)
    expect(s).toContain("MISTAKES-INTACT"); // بانکِ ۰: پرسونا {x-23,x-5} پابرجا
    expect(s).toContain("dict-g7"); // attemptِ یکتای دِکِ پایهٔ هفتم
    expect(s).toContain("exam-dictation"); // و هیچِ attemptِ سایهٔ بانکی (SWITCH-CONTRACT)
    expect(s).toContain("SWITCH-CONTRACT-OK"); // حکمِ قراردادِ سوییچ
    expect(s).toContain("exam_dictation_start"); // یک کلیکِ CTA — سوییچ دوباره نمیزند
    expect(s).toContain("my_words_review_start"); // دفترِ صادق
    expect(s).toContain("drill_due_jump"); // ۱۳۱ دستنخورده
    expect(s).toContain("ALL-OK-TOKENS-PRESENT-OK"); // درسِ r452: حضورِ توکنها گریپ میشود
    // درسِ ابزاریِ مرگبارِ این راند — pkillِ امن + سگِ نگهبان (پروندهٔ خودش):
    expect(s).not.toContain('pkill -f "agent-browser/browsers"'); // الگویِ کشندهٔ سرور ممنوع — ۴ مرگِ پیاپیِ lock7-10
    expect(s).toContain("chrome.*--remote-debugging-port"); // pkillِ محدودِ امن — فقط chrome
    const wd = readFileSync("scripts/qa-r453-server-watchdog.sh", "utf8"); // سگِ نگهبانِ سرور — پاسخ به جمعکنندهٔ بیرونی (۵ مرگِ بیصدا)
    expect(wd).toContain("standalone/server.js"); // بوتِ دوفورکیِ r435 در حلقه
  });
});

describe("r454 — پنجاهونهمین مصرفکننده (شکارِ ریشهٔ دومِ توستِ آلوده)", () => {
  it("منبع مصرفکننده حاضر است و qa-lib را source میکند", () => {
    const s = p(FIFTYNINTH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).toContain("qa_wait_home");
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIFTYNINTH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی شکار: دو بازو (آلوده/تازه) + fiber-probe + MutationObserver + حکمِ قاتلِ ۳۷ms", () => {
    const s = p(FIFTYNINTH_CONSUMER);
    expect(s).toContain("390 844"); // موبایل
    expect(s).toContain("r454-toast-root2.txt"); // خروجیِ ران
    expect(s).toContain("__r454log"); // ثبتِ +LI/-LI با MutationObserver
    expect(s).toContain("__r454ann"); // ناحیهٔ زندهٔ polite (راویِ announcer)
    expect(s).toContain("__reactFiber$"); // پیمایشِ fiber — خواندنِ toasts از hooksِ Toaster
    expect(s).toContain("Toaster"); // هدفِ fiber-probe
    expect(s).toContain("ol.fixed"); // olِ viewport — کالبدشکافیِ DOM
    expect(s).toContain("fiber_probe"); // کاوشگرِ fiber
    expect(s).toContain("arm_observer"); // سلاحسازیِ ناظر
    expect(s).toContain("drive_word"); // ۷ واژهٔ تایپشده → تایمرِ پیشروی (بافتِ آلوده)
    expect(s).toContain("drive_skip"); // ردِ دستیِ ۸ (هر دو بازو)
    expect(s).toContain("بازوی P"); // بازوی آلوده
    expect(s).toContain("بازوی F"); // بازوی تازه — کنترل
    expect(s).toContain("capture_toast"); // نظرسنجیِ کلاسیک
    expect(s).toContain("ROOT2-VERDICT"); // حکمِ سهشاخهٔ جمعی
    expect(s).toContain("chrome.*--remote-debugging-port"); // pkillِ امن (درسِ r453)
    // قراردادِ رندِ اثباتیِ همین راند — قفلِ «قاتلِ ۳۷ms»:
    const log = readFileSync("/tmp/r454-toast-root2.txt", "utf8");
    expect(log).toContain("+LI@"); // توستها واقعاً mount شدند
    expect(log).toContain("وعده برقرار شد"); // قاتلِ متا در کالبدشکافی ثبت است
    expect(log).toContain("ARM-P-TOAST"); // داوریِ دو بازو
    // تعمیرِ محصولِ همین راند:
    const hook = readFileSync("src/hooks/use-toast.ts", "utf8");
    expect(hook).toContain("const TOAST_LIMIT = 3"); // قاتلِ ۳۷ms مرده است
  });
});

describe("r455 — شصتمین مصرفکننده (شاهدِ موبایلِ پشتهٔ توستها)", () => {
  it("منبع مصرفکننده حاضر است و qa-lib را source میکند", () => {
    const s = p(SIXTIETH_CONSUMER);
    expect(s).toContain("source /home/z/my-project/scripts/qa-lib.sh");
    expect(s).toContain("qa_wait_home");
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${SIXTIETH_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی پشته: سه جریانِ راستین + سرریزِ زنده + زوجِ رقابتی + درسِ Escape", () => {
    const s = p(SIXTIETH_CONSUMER);
    expect(s).toContain("390 844"); // موبایل
    expect(s).toContain("r455-toast-stack.txt"); // خروجیِ ران
    expect(s).toContain("ol.fixed"); // olِ viewport
    expect(s).toContain("rowGap"); // اندازهگیریِ فاصله — قلبِ شاهد
    expect(s).toContain("gaps"); // آرایهٔ فاصلههای مجاورتی
    expect(s).toContain("contextmenu"); // راستکلیکِ رزومهٔ هدر (جریانِ A)
    expect(s).toContain("دانلود پشتیبان"); // پشتیبانِ پروفایل (جریانِ B)
    expect(s).toContain("[aria-label^='صادرات']"); // Anki (جریانِ C)
    expect(s).toContain("fileFailToast".slice(0, 0) + "خطا در ساخت"); // توستِ چهارم (سرریز)
    expect(s).toContain("cou_fail_on"); // درسِ r344 — تزریقِ شکستِ ساخت
    expect(s).toContain("wait_pair"); // زوجِ رقابتیِ r454 (نتیجه + وعده)
    expect(s).toContain("qa_to_dark"); // شبِ صریح پیشِ هر داوریِ شب
    expect(s).toContain("Escape"); // سندِ درسِ مرگبارِ همین راند
    expect(s).toContain("TRIPLE-LIGHT-OK");
    expect(s).toContain("EVICT-OK");
    expect(s).toContain("PAIR-DARK-OK");
    // رانویسِ اثباتیِ همین راند — پیش و پسِ تعمیر:
    const log = readFileSync("/tmp/r455-toast-stack.txt", "utf8");
    expect(log).toContain("TRIPLE-LIGHT-OK"); // پشتهٔ سهتاییِ راستین زنده
    expect(log).toContain("EVICT-OK"); // سقفِ ۳ در DOM واقعی
    expect(log).toContain("PAIR-DARK-OK"); // زوجِ r454 در شب
    expect(log).toContain('"rowGap":"12px"'); // تعمیرِ gap-3 زنده
    const ui = readFileSync("src/components/ui/toast.tsx", "utf8");
    expect(ui).toContain("gap-3"); // تعمیرِ محصولِ همین راند
  });
});
