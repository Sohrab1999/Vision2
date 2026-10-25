// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildAnkiTsv, downloadAnkiTsv } from "@/lib/anki-export";
import { exportProgress } from "@/lib/backup";

// ------------------------------------------------------------------
// r344 — نخستین داوریِ زندهٔ خانوادهٔ «خروجی Anki + پشتیبانِ JSON» — قفلهای راند.
//
// رکوردِ زنده (scripts/qa-r344-anki-backup.sh — کلیک+کاوشِ اتمیک + آپلودِ واقعی):
//   ① درمانِ راند — downloadAnkiTsv آخرین عضوِ بیسنگِ خانوادهٔ دانلود بود:
//     کلیک در شکست کاملاً ساکت (بی‌توست، بی‌رویداد). حالا null برمیگرداند
//     و درگاه، «خطا در ساخت فایل» (همزبانِ چهار CSV) میگوید — زنده:
//     COU→throw ⇒ TOAST-HIT + cou:1 + dl:0؛ تاریکِ درجا bg lab(2.75)/ink
//     lab(98.26)؛ negctl ⇒ توستِ موفقیت + لنگرِ واقعی vision2-anki.txt.
//   ② پایِ هرگزندیدهٔ خروجیِ پشتیبان: COU→throw ⇒ «خطا در پشتیبان‌گیری»
//     + dl:0؛ negctl ⇒ «✓ پشتیبان دانلود شد» + vision2-backup-20261023.json.
//   ③ پایِ هرگزندیدهٔ بازیابیِ خودکار: خرابِ اتمیکِ vision2-study-v1 ⇒
//     «بازیابی ناموفق» — بدونِ reload (applyBackup false ⇒ هیچ reloadی).
//   ④ ماتریسِ بازیابیِ فایل — سه پیامِ فارسیِ parseBackup زنده شد:
//     «فایل، JSON معتبری نیست.» · «این فایل پشتیبانِ وب‌کتاب ویژن ۲ نیست.»
//     · «نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود.» — همگی زیرِ عنوانِ
//     «فایل پشتیبان نامعتبر» با عبورِ err.message.
//   ⑤ پایِ سبزِ کاملِ E2E: پشتیبانِ معتبر ⇒ «✓ پشتیبان بازیابی شد» +
//     reloadِ واقعی (پرچمِ pre-reload حذف شد، نشانگرِ localStorage ماند).
//   ⑥ basis-zeroِ دوازدهمین نما: دیکشنری total:0 suspects=[] (با اثباتِ
//     mount: دکمهٔ Anki باز و قابل‌کلیک).
// ------------------------------------------------------------------

const portSrc = readFileSync(
  join(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"),
  "utf8",
);
const backupLibSrc = readFileSync(join(process.cwd(), "src/lib/backup.ts"), "utf8");
const popoverSrc = readFileSync(
  join(process.cwd(), "src/components/study/profile/profile-popover.tsx"),
  "utf8",
);
const driverSrc = readFileSync(
  join(process.cwd(), "scripts/qa-r344-anki-backup.sh"),
  "utf8",
);

const originalCOU = globalThis.URL.createObjectURL;
const originalRevoke = globalThis.URL.revokeObjectURL;

afterEach(() => {
  Object.defineProperty(globalThis.URL, "createObjectURL", {
    value: originalCOU,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis.URL, "revokeObjectURL", {
    value: originalRevoke,
    writable: true,
    configurable: true,
  });
});

describe("output honesty r344 — خانوادهٔ Anki و پشتیبان", () => {
  it("درمانِ راند: downloadAnkiTsv در شکستِ COU → null و بدونِ هیچ لنگری", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => {
        throw new TypeError("r344-test-cou");
      },
      writable: true,
      configurable: true,
    });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      expect(downloadAnkiTsv()).toBeNull();
      expect(appended).toHaveLength(0); // هیچ لنگرِ دانلودی در مسیرِ شکست
    } finally {
      document.body.appendChild = origAppend;
    }
  });

  it("پایِ سبز: downloadAnkiTsv با COUیِ استاب → شمارشِ کارت + لنگرِ vision2-anki.txt", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => "blob:r344-fake",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      value: () => {},
      writable: true,
      configurable: true,
    });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      const count = downloadAnkiTsv();
      const { count: built } = buildAnkiTsv();
      expect(count).toBe(built);
      expect(built).toBeGreaterThan(0);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === "vision2-anki.txt");
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = origAppend;
    }
  });

  it("پایِ سبزِ پشتیبان: exportProgress با COUیِ استاب → true و نامِ لنگرِ روز", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => "blob:r344-fake",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      value: () => {},
      writable: true,
      configurable: true,
    });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      expect(exportProgress()).toBe(true);
      const stamp = new Date();
      const day = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}`;
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === `vision2-backup-${day}.json`);
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = origAppend;
    }
  });

  it("قراردادِ درگاهِ Anki: گاردِ null پیشِ trackEvent و توستِ همزبانِ خانواده (r398: وامگیرِ مالک)", () => {
    // گاردِ دوپایه در درگاه — قبل از هر رویدادی
    expect(portSrc).toContain("count === null");
    // r398 — توستِ شکست از مالکِ نامدار (fileFailToast) میسوزد؛ جفتِ دستی منقرض
    expect(portSrc).toContain("fileFailToast()");
    expect(portSrc).not.toContain('title: "خطا در ساخت فایل"');
    // ترتیبِ درونِ onClick: گارد → توستِ خانواده → returnِ زودبرگشت → trackEvent
    const start = portSrc.indexOf("const count = downloadAnkiTsv();");
    const block = portSrc.slice(start, start + 900);
    const g = block.indexOf("count === null");
    const fam = block.indexOf("fileFailToast()");
    const ret = block.indexOf("return;");
    const trk = block.indexOf('trackEvent("anki_export")');
    expect(g).toBeGreaterThan(-1);
    expect(trk).toBeGreaterThan(g);
    expect(fam).toBeGreaterThan(g);
    expect(ret).toBeGreaterThan(fam);
    expect(ret).toBeLessThan(trk); // return؛ پیشِ trackEventِ دروغین
  });

  it("پایِ هرگزندیدهٔ خروجیِ پشتیبان: دوپایهٔ صادق در درگاهِ پروفایل", () => {
    expect(backupLibSrc).toMatch(/export function exportProgress[\s\S]*?catch[\s\S]*?return false/);
    expect(popoverSrc).toContain("خطا در پشتیبان‌گیری");
    expect(popoverSrc).toContain("✓ پشتیبان دانلود شد");
    // رویدادِ تحلیلی فقط در پایِ موفق — ok gate
    expect(popoverSrc).toMatch(/const ok = exportProgress\(\);\s*\n\s*if \(ok\) trackEvent\("backup_export"\);/);
  });

  it("سه پیامِ فارسیِ parseBackup + عبورِ err.message در درگاهِ import", () => {
    expect(backupLibSrc).toContain("فایل، JSON معتبری نیست.");
    expect(backupLibSrc).toContain("این فایل پشتیبانِ وب‌کتاب ویژن ۲ نیست.");
    expect(backupLibSrc).toContain("نسخهٔ فایل پشتیبان پشتیبانی نمی‌شود.");
    // درگاه: عنوانِ مشترک + پیامِ صادقانهٔ خطا
    expect(popoverSrc).toContain("فایل پشتیبان نامعتبر");
    expect(popoverSrc).toMatch(/err instanceof Error \? err\.message : /);
  });

  it("پایِ هرگزندیدهٔ بازیابیِ خودکار: «بازیابی ناموفق» بدونِ reload", () => {
    expect(popoverSrc).toContain("بازیابی ناموفق");
    // شاخهٔ موفق reload میکند؛ شاخهٔ شکست فقط توستِ صادقانه — بدونِ reload
    const arPos = popoverSrc.indexOf("const handleAutoRestore");
    const ar = popoverSrc.slice(arPos, arPos + 1400);
    const successBranch = ar.slice(0, ar.indexOf("} else {"));
    const failPos = ar.indexOf("بازیابی ناموفق");
    const elseBranch = ar.slice(failPos, failPos + 300);
    expect(successBranch).toContain("window.location.reload");
    expect(failPos).toBeGreaterThan(-1);
    expect(elseBranch).not.toContain("window.location.reload");
  });

  it("قفلهایِ ابزارِ راند: تزریقِ COU + آپلودِ چهار فایل + احیایِ پروفایل", () => {
    expect(driverSrc).toContain("cou_fail_on");
    expect(driverSrc).toContain("URL.createObjectURL=function(){");
    expect(driverSrc).toContain("ensure_profile");
    expect(driverSrc).toContain('upload \'input[type="file"]\' /tmp/r344-bad.json');
    expect(driverSrc).toContain("/tmp/r344-wrongapp.json");
    expect(driverSrc).toContain("/tmp/r344-badver.json");
    expect(driverSrc).toContain("/tmp/r344-valid.json");
    expect(driverSrc).toContain("GONE-RELOADED"); // اثباتِ reloadِ واقعیِ E2E
  });
});
