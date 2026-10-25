import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// ------------------------------------------------------------------
// r395 — سرشماریِ «کپی نشد/کپی شد» + قفلِ قراردادِ «کپیِ بیسکوت»
//
// سرشماریِ راند (الگویِ دوقلویِ r382..r394): navigator.clipboard.writeText
// دقیقاً در ۳ سایتِ src زندگی میکند — profile-popover (syncCode) /
// use-duel-socket (roomCode) / quiz-result (متنِ نتیجه). هیچ زیرگروهِ
// بایتهمسانی وجود ندارد:
//   · شکستِ profile: «کپی نشد» + خودِ کد در توصیه («کد را دستی یادداشت
//     کن: ${syncCode}») + ۴۰۰۰ms — کمربند و بند؛ پاپاور ممکن است بسته
//     شده باشد، کد باید همراهِ توست سفر کند.
//   · شکستِ duel: «کپی نشد» برهنه + ۲۵۰۰ms — کدِ اتاق هنوز رویِ صفحه
//     است؛ سیگنالِ خالی کافی است.
//   · شکستِ quiz: «خطا در کپی نتیجه» + راهِ جایگزین («دانلود تصویر
//     نتیجه») + ۳۰۰۰ms — تنها سایتی که گاردِ صریحِ دسترسپذیری دارد
//     (clipboard-unavailable)؛ دو سایتِ دیگر با catchِ ضمنی همان رفتار
//     را دارند (TypeError → catch).
//   · موفقیتِ هر سه: «✓ کد کپی شد» / «کد اتاق کپی شد 📋» / «✓ نتیجه
//     کپی شد» — هر توست نامِ آنچه کپی شد و «چه کنم» را میگوید.
//
// تصمیمهایِ حکم:
//  ① مالک «نخیر» — درسِ r386/r389/r394: تنها زیرگروهِ بایتهمسان
//     یکجا میشود؛ اینجا هیچ عضوِ بایتهمسانی نیست و مکانیزم، یکخطِ
//     پلتفرمی است (wrapper تنها یک خط را پس میزد — تشریفات).
//  ② ولی قراردادِ دامنهایِ «شکستِ کپی هرگز بیسکوت نیست» (r345-وار)
//     فقط با خودانضباط نگه داشته میشد — هیچ قفلی نداشت. این قفلها
//     آن قرارداد را میبندند: سرشماریِ ۳سایتی + حضورِ توستِ شکست در
//     هر سایت + گاردِ صریحِ quiz.
//  ③ گویشها آزادند (r386): مدت/متنِ توستها گویشِ بافتهند — این قفلها
//     فقط سرشماری و حضورِ مسیرِ شکست را میبندند، نه املاهایِ گویش را.
// ------------------------------------------------------------------

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const THREE_SITES = [
  "src/components/study/profile/profile-popover.tsx",
  "src/components/study/duel/use-duel-socket.ts",
  "src/components/study/quiz/quiz-result.tsx",
] as const;

describe("r395 — قراردادِ کپیِ بیسکوت", () => {
  it("سرشماری: writeText دقیقاً در ۳ سایت — سایتِ چهارمِ بیسکوت ناممکن", () => {
    const hits = execSync(
      `rg -l 'navigator\\.clipboard\\.writeText' src/ || true`
    )
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean)
      .sort();
    expect(hits).toEqual([...THREE_SITES].sort());
  });

  it.each(THREE_SITES)("هر سایت writeText را در try دارد و catchِ همان بلوک توستِ شکست میسوزاند: %s", (f) => {
    const src = p(f);
    const i = src.indexOf("await navigator.clipboard.writeText");
    expect(i, "writeText call present").toBeGreaterThan(-1);
    const tryIdx = src.lastIndexOf("try {", i);
    expect(tryIdx, "inside a try block").toBeGreaterThan(-1);
    const catchIdx = src.indexOf("} catch", i);
    expect(catchIdx, "the try has a catch after the call").toBeGreaterThan(i);
    const afterCatch = src.slice(catchIdx, catchIdx + 500);
    expect(afterCatch, "the catch path toasts (no silent copy)").toContain("toast(");
  });

  it("هر سه عنوانِ شکست در جای خودشان زندهاند — سه گویش، یک قرارداد", () => {
    expect(p(THREE_SITES[0])).toContain("کپی نشد");
    expect(p(THREE_SITES[1])).toContain("کپی نشد");
    expect(p(THREE_SITES[2])).toContain("خطا در کپی نتیجه");
  });

  it("هر سه عنوانِ موفقیت در جای خودشان زندهاند", () => {
    expect(p(THREE_SITES[0])).toContain("✓ کد کپی شد");
    expect(p(THREE_SITES[1])).toContain("کد اتاق کپی شد 📋");
    expect(p(THREE_SITES[2])).toContain("✓ نتیجه کپی شد");
  });

  it("گاردِ صریحِ دسترسپذیری quiz زنده است — سایتهایِ دیگر با catchِ ضمنی همان رفتار", () => {
    const q = p(THREE_SITES[2]);
    expect(q).toContain("throw new Error(\"clipboard-unavailable\")");
    expect(q).toContain("!navigator.clipboard");
  });

  it("شکستِ profile خودِ کد را حمل میکند — کمربند و بند (پاپاور ممکن است بسته شده باشد)", () => {
    const src = p(THREE_SITES[0]);
    expect(src).toContain("کد را دستی یادداشت کن: ${syncCode}");
    expect(src).toContain("duration: 4000");
  });

  it("سایتهایِ کپی مالکِ توستِ صدا را وام نمیگیرند — دامنهها جدایند", () => {
    for (const f of THREE_SITES) {
      expect(p(f), f).not.toContain("speakFailToast");
    }
  });
});
