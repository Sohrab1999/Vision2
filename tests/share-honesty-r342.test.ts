import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// ------------------------------------------------------------------
// r342 — «مسیرهایِ شکستِ صادقانه» — قفلهایِ راند.
//
// رکوردهایِ زنده (سه سشن، تک-فراخوانی):
//   ① qa-r342-failpath-cert.sh — نخستین زندهتولیدِ تاریخِ توستِ
//     «خطا در ساخت تصویر» (گواهیِ پایانترم): تزریقِ toBlob→null ⇒
//     found:true ×۲ در دو تم (روشن lab(100)/lab(2.75) · تاریک
//     lab(2.75)/lab(98.26))، رکوردگرِ لنگر: dl=0 (هیچ دانلودی)؛ negctlِ
//     بازگردانی ⇒ «🖼 تصویر نتیجه ذخیره شد» + dl=1 vision2-result-18.png.
//   ② qa-r342-duel-done.sh — ماتریسِ چهار-سرنوشتیِ درگاهِ اشتراکِ
//     نمایِ doneِ نبرد (نخستین داوریِ زنده): resolve ⇒ «📨 نبرد
//     همرسانی شد» با payloadِ واقعی (files=1 + ریبونِ صادق «این دور را
//     باختی ۳۹۶ به ۴۰۰»)؛ AbortError/NotAllowedError ⇒ سکوتِ مشروع
//     (found:false ×۲)؛ TypeError ⇒ «همرسانی ممکن نشد»؛ toBlob→null ⇒
//     «خطا در ساخت تصویر» در دو تم + negctl ⇒ «🖼 عکسِ این نبرد ذخیره
//     شد» + dl=1 vision2-duel-loss.png؛ حذفِ استاب ⇒ دکمه ناپدید
//     (دروازهٔ صادقِ r102 زنده). basis-zeroِ نمایِ واقعیِ done:
//     suspects=[] در دو تم؛ ۳۹۰: DOC-OVERFLOW=false.
//   ③ qa-r342-sync-attach.sh + qa-r342-sync-retry.sh — نخستین داوریِ
//     زندهٔ شاخهٔ attachِ همگامسازی: ساختِ کد ⇒ توست + «آخرین
//     همگامسازی»؛ قطع ⇒ توستِ صادقانه؛ ورود با کدِ غایب ⇒ «بازیابی
//     ناموفق | کدی با این مشخصات پیدا نشد.»؛ ورود با کدِ واقعی ⇒
//     «✓ پیشرفت ادغام شد» (mountثابتشده با استابِ تأخیرِ reload —
//     reloadDelays=1) ⇒ پس از reload کد برجاست؛ push ⇒ «✓ روی ابر
//     بهروز شد»؛ copyِ بیاجازه ⇒ «کپی نشد» با کدِ دستی.
// ------------------------------------------------------------------

const quizResultSrc = readFileSync(
  join(process.cwd(), "src/components/study/quiz/quiz-result.tsx"),
  "utf8",
);
const duelDoneSrc = readFileSync(
  join(process.cwd(), "src/components/study/duel/duel-done.tsx"),
  "utf8",
);
const resultImageSrc = readFileSync(
  join(process.cwd(), "src/lib/result-image.ts"),
  "utf8",
);
const profileSrc = readFileSync(
  join(process.cwd(), "src/components/study/profile/profile-popover.tsx"),
  "utf8",
);
const cleanupSrc = readFileSync(
  join(process.cwd(), "scripts/qa-db-cleanup-r101.cjs"),
  "utf8",
);
const duelScript = readFileSync(
  join(process.cwd(), "scripts/qa-r342-duel-done.sh"),
  "utf8",
);
const retryScript = readFileSync(
  join(process.cwd(), "scripts/qa-r342-sync-retry.sh"),
  "utf8",
);

describe("canvas failure path r342 — «خطا در ساخت تصویر» سرانجام زیده شد", () => {
  it("شش درگاهِ دانلود، شش توستِ صادقانه — هیچ درگاهی ساکت نمیماند", () => {
    // گواهیِ پایانترم + کارتِ نبرد + رسمی + هفتگی + دفترچه (خطا) + جریانهایِ دوگانهٔ هفتگی (ساختِ فایل)
    expect((quizResultSrc.match(/خطا در ساخت تصویر/g) || []).length).toBe(1);
    expect((duelDoneSrc.match(/خطا در ساخت تصویر/g) || []).length).toBe(1);
    for (const f of [
      "src/components/study/reports/official-report.tsx",
      "src/components/study/reports/weekly-report.tsx",
      "src/components/study/duel/duel-setup.tsx",
    ]) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      expect(src).toContain("خطا در ساخت تصویر");
    }
    // جریانهایِ برقآسا: عنوانِ خودشان را دارند — صادقانه به همان اندازه
    for (const f of [
      "src/components/study/duel/rush-view.tsx",
      "src/components/study/duel/spell-rush-view.tsx",
    ]) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      expect(src).toContain("دانلود تصویر ناموفق بود");
    }
  });

  it("blobِ null زودتر از هر لنگری برمیگردد — شکست ⇒ صفرِ دانلود (زنده: dl=0)", () => {
    const dl = resultImageSrc.indexOf("const blob = await new Promise<Blob | null>");
    const guard = resultImageSrc.indexOf("if (!blob) return false;", dl);
    const anchor = resultImageSrc.indexOf("URL.createObjectURL(blob)", dl);
    expect(guard).toBeGreaterThan(-1);
    expect(anchor).toBeGreaterThan(guard);
  });

  it("negctlِ بازگردانی — درمانِ سنجشی، نه تغییرِ رفتار: toBlobِ اصلی ذخیره و برگردانده میشود", () => {
    const cert = readFileSync(
      join(process.cwd(), "scripts/qa-r342-failpath-cert.sh"),
      "utf8",
    );
    expect(cert).toContain("__origToBlob=HTMLCanvasElement.prototype.toBlob");
    expect(cert).toContain("HTMLCanvasElement.prototype.toBlob=window.__origToBlob");
    expect(cert).toContain("success-toast-negctl-light");
  });
});

describe("duel-done share matrix r342 — چهار سرنوشت، هر چهار زنده", () => {
  it("سه توستِ صادقانهٔ نمایِ done در سورس قفلاند", () => {
    expect(duelDoneSrc).toContain("📨 نبرد هم‌رسانی شد");
    expect(duelDoneSrc).toContain("هم‌رسانی ممکن نشد");
    expect(duelDoneSrc).toContain("خطا در ساخت تصویر");
  });

  it("دروازهٔ صادقِ r102 — دکمهٔ هم‌رسانی فقط زیرِ canShareImageFiles رندر میشود (زنده: حذفِ استاب ⇒ ناپدیدِ دکمه)", () => {
    expect(duelDoneSrc).toContain("canShareImageFiles() && (");
    expect(duelDoneSrc).toContain("فقط وقتی مرورگر واقعاً فایل می‌پذیرد");
  });

  it("قضیهٔ mount — استابِ share باید پیش از mountِ done نصب شود (درسِ ساختاریِ راند)", () => {
    // اسکریپت: استاب قبل از جوینر (یعنی پیش از رسیدنِ done) نصب میشود
    const stubIdx = duelScript.indexOf("share-stub+dl-recorder installed");
    const joinerIdx = duelScript.indexOf("qa-duel-joiner-r287.mjs");
    expect(stubIdx).toBeGreaterThan(-1);
    expect(joinerIdx).toBeGreaterThan(stubIdx);
    // و سوئیچِ سرنوشت بعد از mount، بدونِ رندرِ دوبارهی دکمه کار میکند
    expect(duelScript).toContain("__r342mode");
  });

  it("پایلودِ اشتراکِ واقعی صادق است — ریبونِ نتیجه همان متنی که روی کارت کشیده میشود", () => {
    expect(duelDoneSrc).toContain("vision2-duel-${outcome}.png");
    expect(duelDoneSrc).toContain('"نبرد واژگان — وب‌کتاب ویژن ۲"');
  });
});

describe("sync attach r342 — شاخهٔ پیوست، ماتریسِ صادقانهٔ زنده", () => {
  it("شش توستِ شاخهٔ attach در سورس قفلاند", () => {
    expect(profileSrc).toContain("✓ کد یادگیرنده ساخته شد");
    expect(profileSrc).toContain("همگام‌سازی قطع شد");
    expect(profileSrc).toContain("بازیابی ناموفق");
    expect(profileSrc).toContain("✓ پیشرفت ادغام شد");
    expect(profileSrc).toContain("✓ روی ابر به‌روز شد");
    expect(profileSrc).toContain("کپی نشد");
  });

  it("شکستِ ادغام هم صادقانه است — نه سکوتِ مخروبه", () => {
    expect(profileSrc).toContain("ادغام ناموفق");
    expect(profileSrc).toContain("همگام‌سازی ناموفق");
  });

  it("نمایشِ r338 — «آخرین همگام‌سازی» زیرِ کدِ متصل رندر میشود (زنده: hasLastSync=true)", () => {
    expect(profileSrc).toContain("آخرین همگام‌سازی: {autoBackupAgeFa(lastSyncAt)}");
    expect(profileSrc).toContain("{lastSyncAt && (");
  });

  it("درگاهِ join از قالبِ کد میگذرد — maxLength و looksLikeCode (زنده: کدِ غایبِ معتبرقالب ⇒ «بازیابی ناموفق»)", () => {
    expect(profileSrc).toContain("maxLength={9}");
    expect(profileSrc).toContain("disabled={!looksLikeCode(codeInput) || syncing !== \"\"}");
  });

  it("ادغامِ موفق reload میکند — توست پیش از reload mount است (استابِ تأخیرِ سنجشی، نه تغییرِ رفتار)", () => {
    expect(profileSrc).toContain("setTimeout(() => window.location.reload(), 900)");
    // ابزارِ راند: setTimeout استاب میشود، کالبکِ reload +۸s میشود — لغو نمیشود
    expect(retryScript).toContain("String(fn).includes('reload')");
    expect(retryScript).toContain("reloadDelays");
  });

  it("پاکسازیِ راند — learnerSyncِ QA حذف میشود؛ allowlistِ r101 همگامسازی را میشناسد", () => {
    const syncCleanup = readFileSync(
      join(process.cwd(), "scripts/r342-sync-cleanup.cjs"),
      "utf8",
    );
    expect(syncCleanup).toContain("learnerSync.deleteMany");
    expect(cleanupSrc).toContain('"sync_link", "sync_restore"');
    // شکارِ r340: رانشِ کنکورِ آن راند konkur_start را آتش زده بود و allowlistِ پیشین نمیآنخت
    expect(cleanupSrc).toContain('"konkur_start"');
  });
});
