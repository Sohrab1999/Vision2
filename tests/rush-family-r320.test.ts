import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// r320 — ممیزیِ «دامِ basis-صفر» در خانوادهٔ برقآسا: آخرین خانوادهٔ پوششندادهٔ
//   r319 — rush-view:427 و spell-rush-view:484 فقط «موقعِ بازیِ واقعی» رندر
//   میشوند و با دو دورِ کاملِ ۶۰ثانیهای (۳۹۰px) زنده سنجیده شدند:
//
//   مرحله                    | عناصر | کاندیدا
//   -------------------------+--------+---------
//   home                      | ۱۰/۹   | ۰
//   quiz-setup (با زبانهها)   | ۱-۲    | ۰
//   spell-setup               | ۰-۱    | ۰
//   spell-PLAY-live (HUD)     | ۱-۲    | ۰
//   spell-DONE                | ۰-۱    | ۰
//   rush-PLAY-live (HUD)      | ۱      | ۰
//   rush-DONE                 | ۰      | ۰
//   home-بازگشت (حلقهٔ کامل)  | ۱۰/۹   | ۰
//
//   (بازهها = دو اجرا با تایمینگِ متفاوتِ رندر؛ هر دو سمتِ هر بازه پاک.)

const driver = readFileSync(join(process.cwd(), "scripts", "qa-r320-rush-audit.sh"), "utf8");
const spell = readFileSync(
  join(process.cwd(), "src", "components", "study", "duel", "spell-rush-view.tsx"),
  "utf8",
);
const rush = readFileSync(join(process.cwd(), "src", "components", "study", "duel", "rush-view.tsx"), "utf8");

describe("rush-family audit r320 — the basis-zero hunt reaches live play", () => {
  it("driver audits all 8 stages of a real double-round in one session", () => {
    const stages = [
      'audit "home"',
      'audit "quiz-setup',
      'audit "spell-setup"',
      'audit "spell-PLAY-live',
      'audit "spell-DONE',
      'audit "rush-PLAY-live',
      'audit "rush-DONE',
      'audit "home-بازگشت',
    ];
    for (const s of stages) expect(driver).toContain(s);
    // ناوبریِ واقعی: بنرِ خانه + زبانهٔ املا + دکمههایِ خودِ صفحهها — نه dispatch
    expect(driver).toContain(".rush-banner button");
    expect(driver).toContain("[role=tab]");
    expect(driver).toContain(".rush-start");
  });

  it("round-end detection is double-poll — a single false is a render-timing lie", () => {
    // درسِ اجرا: اولین پایشِ false میتواند لحظهٔ پیش از رندرِ HUD باشد
    // (پروبِ بدونِ sleep، HUDِ زنده را «تمامشده» خواند) — دو falseِ متوالی لازم است
    expect(driver).toContain("MISS=0");
    expect(driver).toContain("MISS=$((MISS+1)); [[ $MISS -ge 2 ]] && return 0");
    // نشانگرِ زندهبودن: .rush-score-live در هر دو HUD (rush و spell) مشترک است
    expect(rush).toContain("rush-score-live");
    expect(spell).toContain("rush-score-live");
  });

  it("spell and quiz done screens have different markers — the script knows both", () => {
    // عنوانِ تمامشدِ املا: «دیکتهٔ برق‌آسا تمام شد!» — نه «چالش تمام شد» (کوییز)
    expect(spell).toContain("دیکتهٔ برق‌آسا تمام شد!");
    expect(rush).toContain("چالش تمام شد!");
    // مسیرِ بازگشتِ املا: با onExit دکمهٔ «حالت چهارگزینه‌ای» جایگزینِ «بازگشت به خانه» است
    // (اجرایِ اول با دنبالکردنِ دکمهٔ کوییز، هر سه مرحلهٔ پساِملا را در جا لنگر انداخت)
    expect(spell).toContain("حالت چهارگزینه‌ای");
    expect(driver).toContain("حالت چهارگزینه‌ای");
    // دکمهٔ خانهٔ کوییز در مسیرِ درستِ حلقه بسته میشود
    expect(driver).toContain("بازگشت به خانه");
  });

  it("the spell-only path still keeps a home exit — no dead end when onExit is absent", () => {
    // شاخهٔ بی-onExit (استفادهٔ مستقل از SpellRushView) باید «بازگشت به خانه» داشته باشد
    expect(spell).toContain('setView({ type: "home" })');
    // و دکمهٔ «دیکتهٔ دوباره» دورِ تازه را از همان‌جا شروع میکند — ستآپ لازم ندارد
    expect(spell).toContain("دیکتهٔ دوباره");
  });
});
