import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// r319 — ممیزیِ «دامِ basis-صفر» در کلِ app: دامِ سه راهاندازِ «واژههای من» (r318)
//   در هیچ سطحِ دیگری تکرار نشده — اثباتِ زنده با ۱۱ بازدیدِ سنجیدهشده در ۳۹۰px:
//
//   سطح              | عناصرِ min-w-0+flex-1 | ردیفی | کاندیدا
//   -----------------+-----------------------+--------+---------
//   home (روشن)      | ۱۱                    | ۹      | ۰
//   home (تاریک)     | ۱۰                    | ۸      | ۰
//   پالتِ فرمان      | ۴۷                    | ۴۵     | ۰
//   پروفایل          | ۱۱                    | ۹      | ۰
//   واژههای من (r318) | ۱۰                   | ۸      | ۰  ← ترمیمِ r318 زنده تأیید شد
//   آزمون جامع       | ۱                     | ۱      | ۰
//   گوشهٔ کنکور      | ۱                     | ۰      | ۰
//   کتابخانه         | ۱۱                    | ۹      | ۰
//   درسِ L1          | ۲                     | ۲      | ۰
//   جزوهٔ L10        | ۱                     | ۱      | ۰
//   نبرد (setup)     | ۱                     | ۱      | ۰
//
//   مرزِ پوششِ صادقانه (به‌روزِ r321): نماهایِ میانهٔ نبرد (rush/spell/done) و کارتِ نصبِ pwa
//   بهشرطِ رخدادِ مرورگر رندر میشوند؛ اولی زیرِ پوششِ طبقهبندِ عمومیِ r317/ممیزیِ زندهٔ r320 است،
//   دومی هندسیاً سالم است (تنها یک خواهرِ shrink-0 — فضایِ آزادِ منفی ناممکن).
//   r321: بازدیدِ دوازدهم اضافه شد — home با پیشرفت (پنلهایِ hasProgress با seedِ تازه
//   رندر نمیشوند؛ نمودارِ هفتگیِ همان پنل دامِ پیلِ روز را پنهان کرده بود).

const auditJs = readFileSync(join(process.cwd(), "scripts", "r319-basis-zero-audit.js"), "utf8");
const driverSh = readFileSync(join(process.cwd(), "scripts", "qa-r319-basis-zero.sh"), "utf8");
const recheckSh = readFileSync(join(process.cwd(), "scripts", "r319-recheck.sh"), "utf8");

describe("basis-zero audit r319 — the flex-basis-zero trap is contained app-wide", () => {
  it("classifier is honest: three legitimate classes, one real-suspect rule", () => {
    // مشروعِ اول: truncate — برشِ طراحی‌شدهٔ ellipsis (min-w-0 برایش «لازم» است نه دام)
    expect(auditJs).toContain('el.classList.contains("truncate")');
    // مشروعِ دوم: INPUT/TEXTAREA — اسکرولِ درونیِ خودِ فیلد
    expect(auditJs).toContain('r.tag !== "INPUT" && r.tag !== "TEXTAREA"');
    // مشروعِ سوم: والدِ column — flex-1 یعنی ارتفاع؛ min-w-0 برِ عرض بیربط
    expect(auditJs).toContain('r.dir === "row"');
    // کاندیدای واقعی: dir=row && over>1 && بی‌truncate
    expect(auditJs).toContain("r.over > 1");
    // درسِ سنجش: عنصرِ رندرنشده سنجیده نمیشود (display:none / visibility:hidden)
    expect(auditJs).toContain('cs.display === "none"');
    expect(auditJs).toContain('cs.visibility === "hidden"');
  });

  it("selector catches every class-order variant of the trap", () => {
    // [class*=] نه .class — «flex min-w-0 flex-1» و «min-w-0 flex-1» هر دو باید بیایند
    expect(auditJs).toContain('[class*="min-w-0"][class*="flex-1"]');
    expect(auditJs).not.toContain(".min-w-0.flex-1");
  });

  it("driver visits 12 measured surfaces with real navigation in one session", () => {
    // my-words برچسبِ بلند دارد — پیشوندی قفل میشود؛ بقیه exact
    const needles = [
      'audit "home"',
      'audit "home-progress"',
      'audit "duel"',
      'audit "palette"',
      'audit "profile"',
      'audit "my-words',
      'audit "exam"',
      'audit "konkur"',
      'audit "library"',
      'audit "booklet-L10"',
      'audit "lesson-L1"',
      'audit "home-dark"',
    ];
    for (const v of needles) expect(driverSh).toContain(v);
    // درسِ r321: نسخهٔ home با پیشرفت، دوباره یادگیرندهٔ ساده برمیگرداند
    expect(driverSh).toContain("known:{book:true}");
    expect(driverSh).toContain("delete s.state.known");
    // ناوبریِ واقعیِ همان ابزارهای r318 (کلیکِ کارت/قفسه) — نه dispatchِ خام
    expect(driverSh).toContain("click_tool");
    expect(driverSh).toContain("open_spine");
    // لکهٔ تاریک از next-themes (کلیدِ theme) — نه کلاسِ دستی
    expect(driverSh).toContain("localStorage.setItem('theme','dark')");
    // سشنِ تکفراخوانی: یک open آغازین و یک close پایان (الگویِ r308)
    expect(driverSh.match(/agent-browser close/g)?.length).toBe(1);
  });

  it("the duel and booklet blind spots of the first run were re-probed and closed", () => {
    // اجرایِ اول دو کورفت داشت: نبرد «total:1» (بدونِ dispatchِ دیدهشده) و
    // جزوهٔ L10 «total:0» (زبانهٔ جزوه کلیک نخورده بود) — بازبینیِ مستقل:
    expect(recheckSh).toContain("open-duel");
    expect(recheckSh).toContain("duelCard:!!d");
    // nav با includes('درس') پیدا میشود نه با نیمفاصلهٔ دستیِ در انتخابگر (درسِ ZWNJ)
    expect(recheckSh).toContain("(n.getAttribute('aria-label')||'').includes('درس')");
    // زبانهٔ درستِ جزوه: «گرامر» فهرستِ فصلهاست؛ جزوه زبانهٔ خودش را دارد
    expect(recheckSh).toContain('click_tab_safe "جزوه"');
  });

  it("pwa-layer keeps its protective min-w-0 — the one container proven safe by geometry, not skipped", () => {
    // کارتِ نصب: تنها یک خواهرِ ثابت (آیکنِ ۴۸px) در ردیفِ بی-wrap — فضایِ آزاد
    // همیشه مثبت است؛ min-w-0 اینجا الگویِ محافظِ کارتِ ثابت است نه دامِ لهشدگی.
    const pwa = readFileSync(
      join(process.cwd(), "src", "components", "study", "shell", "pwa-layer.tsx"),
      "utf8",
    );
    expect(pwa).toContain("min-w-0 flex-1");
    // خواهرِ ثابتِ یگانه: آیکنِ shrink-0 — اگر روزی دکمهٔ shrink-0ِ دوم در همان
    // ردیف نشست، دامِ r318 دوباره ممکن میشود؛ این قفل آن روز را هشدار میدهد.
    expect(pwa).toMatch(/h-12 w-12 shrink-0/);
  });
});
